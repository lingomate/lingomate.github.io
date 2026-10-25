# -*- coding: utf-8 -*-
# SPDX-License-Identifier: MIT
# SPDX-FileCopyrightText: 2026 xiegengcai <xiegengcai@foxmail.com>
"""把 data/<id>.json 的跟读句与 Whisper 字幕（media/<id>/subs/…）按文本对齐，
生成「句子 → 原始音频时间段」映射：media/<id>/cues/unit<N>.json。

课文跟读模式下，命中的句子直接播放教材原音对应片段（不再 TTS），
未命中的句子自动回退 TTS。

    python make_media_cues.py 1A            # 生成 1A 全部单元
    python make_media_cues.py 1A --detail   # 打印每句匹配情况

映射格式（与 unit.read 同长、同序）：
  [ null, {"k":"story","s":7.15,"e":13.15}, ... ]
  k = 音频板块键（manifest 的 audio/subs 键），s/e = 秒。
"""
import argparse
import difflib
import json
import os
import re
import sys
from urllib.parse import unquote

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))

# 与 app.js stToAudioKey 保持一致
def st_to_key(st):
    if not st:
        return None
    if st.startswith('歌曲') or st.startswith('课文'):
        return 'ready-go'
    if st.startswith('故事'):
        return 'story'
    if st.startswith('字母') or st.startswith('拼读'):
        return 'letters'
    if st.startswith('拓展'):
        return 'extend'
    return None


def norm(s):
    s = re.sub(r'^\s*[A-Za-z][A-Za-z .\'’-]{0,24}?\s*[:：]\s*', '', s)  # 去说话人前缀
    s = re.sub(r'[^a-z0-9 ]', ' ', s.lower())
    return re.sub(r'\s+', ' ', s).strip()


def split_clauses(text):
    """把一条字幕文本按句读切成小片段（近似：在 . ! ? 后且下一词大写处切）。"""
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    return [norm(p) for p in parts if norm(p)]


def parse_vtt(path):
    """返回片段级时间轴流：[(start, end, normed_clause), …]。"""
    stream = []
    text = open(path, encoding='utf-8').read().replace('\r', '')
    for block in re.split(r'\n{2,}', text):
        m = re.search(r'(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})', block)
        if not m:
            continue
        g = m.groups()
        start = int(g[0]) * 3600 + int(g[1]) * 60 + int(g[2]) + int(g[3]) / 1000
        end = int(g[4]) * 3600 + int(g[5]) * 60 + int(g[6]) + int(g[7]) / 1000
        lines = [l for l in block.split('\n') if l.strip() and '-->' not in l and not l.strip().isdigit()]
        raw = ' '.join(lines)
        t = norm(raw)
        if not t:
            continue
        clauses = split_clauses(raw)
        if not clauses:
            continue
        if len(clauses) == 1:
            stream.append((start, end, clauses[0]))
        else:
            # 多片段共享该 cue 时长：按字符数比例分配起止时间（近似）
            total_chars = sum(len(c) for c in clauses) or 1
            cur = start
            for ci, c in enumerate(clauses):
                span = (end - start) * len(c) / total_chars
                e = end if ci == len(clauses) - 1 else cur + span
                stream.append((cur, e, c))
                cur = e
    return stream


def align(sentences, stream, threshold=0.5, window=10, max_merge=3, detail=False):
    """单调指针 + 片段合并匹配：一句 JSON 可对应流中 1..max_merge 个连续片段。
    未命中不推进指针（允许后续句继续在同一区域找），命中则推进到命中末尾。"""
    out = []
    p = 0
    for sent in sentences:
        s = norm(sent)
        if not s or not stream:
            out.append(None)
            continue
        best = None  # (ratio, j, k)
        for j in range(p, min(p + window, len(stream))):
            acc = ''
            for k in range(j, min(j + max_merge, len(stream))):
                acc = (acc + ' ' + stream[k][2]).strip()
                r = difflib.SequenceMatcher(None, s, acc).ratio()
                if best is None or r > best[0]:
                    best = (r, j, k)
        if best and best[0] >= threshold:
            r, j, k = best
            out.append((stream[j][0], stream[k][1]))
            p = k + 1
            if detail:
                print(f'    ✓ {r:.2f} [{j}..{k}] {sent[:36]!r}')
        else:
            out.append(None)
            if detail:
                r = best[0] if best else 0.0
                print(f'    ✗ {r:.2f} 未匹配 {sent[:36]!r}（窗口 {p}..）')
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('book')
    ap.add_argument('--detail', action='store_true')
    ap.add_argument('--threshold', type=float, default=0.5)
    args = ap.parse_args()
    book = args.book

    data = json.load(open(os.path.join(ROOT, 'data', f'{book}.json'), encoding='utf-8'))
    manifest = json.load(open(os.path.join(ROOT, 'media', 'manifest.json'), encoding='utf-8'))
    bmedia = manifest.get(book)
    if not bmedia:
        print(f'manifest 中没有 {book} 的媒体')
        return 1

    total_ok = total = 0
    for ui, unit in enumerate(data['units'], 1):
        reads = unit.get('read', [])
        subs = (bmedia['units'].get(str(ui)) or {}).get('subs') or {}
        auds = (bmedia['units'].get(str(ui)) or {}).get('audio') or {}
        segs = [None] * len(reads)
        # 按板块分组（read 内 st 连续出现）
        groups = {}
        for i, r in enumerate(reads):
            k = st_to_key(r.get('st'))
            if k:
                groups.setdefault(k, []).append(i)
        # 板块键缺失时回退整单元音频（扁平布局只有 full）
        for k in list(groups):
            if k not in subs and 'full' in subs:
                groups.setdefault('full', []).extend(groups.pop(k))
        for k, idxs in groups.items():
            idxs = sorted(idxs)
            if k not in subs:
                continue
            vtt = os.path.join(ROOT, unquote(subs[k]))
            if not os.path.isfile(vtt):
                continue
            cues = parse_vtt(vtt)
            matched = align([reads[i]['en'] for i in idxs], cues, args.threshold, detail=args.detail)
            for i, m in zip(idxs, matched):
                if m:
                    # src 存原文：运行时严格比对，句子被改过则自动失效回退 TTS
                    segs[i] = {'k': k, 's': round(m[0], 2), 'e': round(m[1], 2),
                               'src': reads[i]['en']}
        ok = sum(1 for s in segs if s)
        total_ok += ok
        total += len(segs)
        cdir = os.path.join(ROOT, 'media', book, 'cues')
        os.makedirs(cdir, exist_ok=True)
        out = os.path.join(cdir, f'unit{ui}.json')
        json.dump(segs, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'  {book} U{ui}: {ok}/{len(segs)} 句命中原音 → media/{book}/cues/unit{ui}.json')
    print(f'✓ 共 {total_ok}/{total} 句可用教材原音（其余回退 TTS）')
    return 0


if __name__ == '__main__':
    sys.exit(main())

# -*- coding: utf-8 -*-
# SPDX-License-Identifier: MIT
# SPDX-FileCopyrightText: 2026 xiegengcai <xiegengcai@foxmail.com>
"""扫描 media/ 目录，生成前端用的 media/manifest.json。

素材文件名千奇百怪（空格、大小写、中文、拼写笔误），本脚本负责归一化：
  音频板块键：ready-go / story / letters / communicate / extend / words / full
  视频板块键：story / extend（从文件名里的 Story/Extend 识别）
新增或整理素材后重跑一次即可：

    python make_media_manifest.py

manifest 结构（路径相对站点根，已 URL 编码，可直接喂给 <audio>/<video>）：
  { "1A": { "units": { "1": { "audio": {"story": "media/1A/.../U1%20Story.MP3", ...},
                              "video": {"story": "...", ...} } } },
    "generated": "..." }
"""
import json
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from urllib.parse import quote

# Windows GBK 控制台打不出 ✓/中文等字符：统一切 UTF-8 输出
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(ROOT, 'media')

# 归一化后（小写、去空格/连字符）的识别规则；顺序即优先级
AUDIO_RULES = [
    ('ready-go',      lambda n: 'readygo' in n),
    ('communicate',   lambda n: 'ommunic' in n or 'ommumic' in n),   # 含 Commumicate 笔误
    ('letters',       lambda n: 'letter' in n),
    ('story',         lambda n: 'story' in n),
    ('extend',        lambda n: 'extend' in n),
    ('words',         lambda n: 'word' in n),
    ('full',          lambda n: '总' in n or 'full' in n or 'unit总' in n),
]
VIDEO_RULES = [
    ('story',  lambda n: 'story' in n),
    ('extend', lambda n: 'extend' in n),
]


def norm(name: str) -> str:
    """文件名主干 → 小写、去空格/连字符/下划线，便于模糊匹配。"""
    stem = os.path.splitext(os.path.basename(name))[0]
    return re.sub(r'[\s\-_]+', '', stem).lower()


def classify(name: str, rules):
    n = norm(name)
    for key, pred in rules:
        if pred(n):
            return key
    return None


def unit_num(dirname: str):
    m = re.search(r'(\d+)', dirname)
    return int(m.group(1)) if m else None


def url_of(abspath: str) -> str:
    rel = os.path.relpath(abspath, ROOT).replace(os.sep, '/')
    # 逐段编码（保留 /），中文与空格都能被 <audio src> 直接消费
    return '/'.join(quote(seg) for seg in rel.split('/'))


def scan_book(book_dir: str, book_id: str):
    units = {}
    # 扁平布局：课本根目录直接放整单元音频（如「Unit 1 What food do you like.mp3」）→ 记为该单元的 full
    for f in sorted(os.listdir(book_dir)):
        p = os.path.join(book_dir, f)
        if not os.path.isfile(p) or not f.lower().endswith(('.mp3', '.m4a', '.aac', '.wav')):
            continue
        m = re.search(r'unit\s*(\d+)', norm(f))
        if m:
            slot = units.setdefault(m.group(1), {'audio': {}, 'subs': {}, 'video': {}})
            slot['audio']['full'] = url_of(p)
            # 扁平音频的字幕：media/<id>/subs/<同名>.vtt（与根目录文件同名）
            vtt = os.path.join(book_dir, 'subs', os.path.splitext(f)[0] + '.vtt')
            if os.path.isfile(vtt):
                slot['subs']['full'] = url_of(vtt)
        else:
            print(f'  ! 课本根目录音频未识别（跳过）: {book_id}/{f}')
    adir = os.path.join(book_dir, 'audio')
    if os.path.isdir(adir):
        for d in sorted(os.listdir(adir)):
            p = os.path.join(adir, d)
            u = unit_num(d) if os.path.isdir(p) else None
            if u is None:
                continue
            slot = units.setdefault(str(u), {'audio': {}, 'subs': {}, 'video': {}})
            for f in sorted(os.listdir(p)):
                if not f.lower().endswith(('.mp3', '.m4a', '.aac', '.wav')):
                    continue
                key = classify(f, AUDIO_RULES)
                if key:
                    slot['audio'][key] = url_of(os.path.join(p, f))
                    # 字幕：media/<book>/subs/audio/<unit>/<name>.vtt（与音频相对路径同名）
                    rel_noext = os.path.splitext(os.path.relpath(os.path.join(p, f), book_dir))[0]
                    vtt = os.path.join(book_dir, 'subs', rel_noext + '.vtt')
                    if os.path.isfile(vtt):
                        slot['subs'][key] = url_of(vtt)
                else:
                    print(f'  ! 未识别音频（跳过）: {book_id}/{d}/{f}')
    vdir = os.path.join(book_dir, 'video')
    if os.path.isdir(vdir):
        for f in sorted(os.listdir(vdir)):
            if not f.lower().endswith(('.mp4', '.m4v', '.webm', '.mov')):
                continue
            m = re.search(r'[Uu]nit\s*(\d+)', f)
            key = classify(f, VIDEO_RULES)
            if not (m and key):
                print(f'  ! 未识别视频（跳过）: {book_id}/video/{f}')
                continue
            slot = units.setdefault(m.group(1), {'audio': {}, 'video': {}})
            slot['video'][key] = url_of(os.path.join(vdir, f))
    # 丢弃空单元
    units = {u: v for u, v in units.items() if v['audio'] or v['video']}
    # 句子→原音时间段映射（make_media_cues.py 生成）：media/<id>/cues/unitN.json
    cdir = os.path.join(book_dir, 'cues')
    cues = {}
    if os.path.isdir(cdir):
        for f in sorted(os.listdir(cdir)):
            m = re.fullmatch(r'unit(\d+)\.json', f)
            if m and m.group(1) in units:
                cues[m.group(1)] = url_of(os.path.join(cdir, f))
    return {'units': units, 'cues': cues} if units else None


def main():
    if not os.path.isdir(MEDIA):
        print('media/ 不存在，生成空 manifest')
        manifest = {}
    else:
        manifest = {}
        for d in sorted(os.listdir(MEDIA)):
            p = os.path.join(MEDIA, d)
            if not os.path.isdir(p) or re.match(r'^\.', d):
                continue
            book = scan_book(p, d)
            if book:
                manifest[d] = book
                na = sum(len(v['audio']) for v in book['units'].values())
                nv = sum(len(v['video']) for v in book['units'].values())
                print(f'  {d}: {len(book["units"])} 单元 · {na} 音频 · {nv} 视频')
    manifest['generated'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    out = os.path.join(MEDIA, 'manifest.json')
    os.makedirs(MEDIA, exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'✓ {os.path.relpath(out, ROOT)} 已生成')


if __name__ == '__main__':
    main()

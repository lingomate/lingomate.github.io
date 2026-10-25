# -*- coding: utf-8 -*-
# SPDX-License-Identifier: MIT
# SPDX-FileCopyrightText: 2026 xiegengcai <xiegengcai@foxmail.com>
"""用 faster-whisper 为 media/ 下的教材音频生成英文字幕（WebVTT）。

    python make_media_subtitles.py            # 全部课本
    python make_media_subtitles.py 1A         # 只处理某本
    python make_media_subtitles.py 1A --force # 覆盖已存在的 .vtt

模型默认 small（CPU int8，清晰教学音频效果不错）；--model base/tiny 更快。
输出：media/<id>/subs/<音频相对路径同名>.vtt，并重跑 manifest。
"""
import argparse
import os
import re
import subprocess
import sys

# Windows GBK 控制台打不出 ✓/中文等字符：统一切 UTF-8 输出
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# 国内网络：默认走 HF 镜像并禁用 Xet 协议（直连 huggingface.co 会超时）。
# 已有显式环境变量时不覆盖。
os.environ.setdefault('HF_ENDPOINT', 'https://hf-mirror.com')
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')

# ---- 兼容性垫片：av 19（Python 3.14 唯一可用 wheel）移除了 metadata_errors 参数，
# 而 faster-whisper 1.2.1 仍会传入。这里包一层 av.open，丢掉不支持的 kwarg。----
import av  # noqa: E402
_orig_av_open = av.open


def _compat_av_open(*args, **kwargs):
    kwargs.pop('metadata_errors', None)
    return _orig_av_open(*args, **kwargs)


av.open = _compat_av_open

ROOT = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(ROOT, 'media')


def fmt_ts(sec: float) -> str:
    ms = int(round(sec * 1000))
    h, rem = divmod(ms, 3600000)
    m, rem = divmod(rem, 60000)
    s, ms = divmod(rem, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def transcribe(model, wav_path, vtt_path, language='en'):
    segments, _info = model.transcribe(
        wav_path, language=language, beam_size=1, vad_filter=True,
        vad_parameters={'min_silence_duration_ms': 400})
    lines = ['WEBVTT', '']
    n = 0
    for seg in segments:
        text = seg.text.strip()
        if not text:
            continue
        n += 1
        lines.append(f'{n}')
        lines.append(f'{fmt_ts(seg.start)} --> {fmt_ts(seg.end)}')
        lines.append(text)
        lines.append('')
    if n == 0:
        return False
    with open(vtt_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('book', nargs='?', help='课本 id，如 1A；缺省处理全部')
    ap.add_argument('--model', default='small', help='whisper 模型（tiny/base/small/medium）')
    ap.add_argument('--force', action='store_true', help='覆盖已有 .vtt')
    args = ap.parse_args()

    from faster_whisper import WhisperModel  # 延迟导入，安装未完成时报错清晰
    print(f'加载模型 {args.model}（CPU int8）…')
    model = WhisperModel(args.model, device='cpu', compute_type='int8')

    jobs = []
    for book in sorted(os.listdir(MEDIA)):
        if args.book and book != args.book:
            continue
        book_dir = os.path.join(MEDIA, book)
        if not os.path.isdir(book_dir) or re.match(r'^\.', book):
            continue
        # 收集候选音频：板块布局 audio/unitN/*.mp3 + 扁平布局（课本根目录 *.mp3）
        candidates = []
        adir = os.path.join(book_dir, 'audio')
        if os.path.isdir(adir):
            for d in sorted(os.listdir(adir)):
                p = os.path.join(adir, d)
                if not os.path.isdir(p):
                    continue
                for f in sorted(os.listdir(p)):
                    if f.lower().endswith(('.mp3', '.m4a', '.aac', '.wav')):
                        candidates.append(os.path.join(p, f))
        for f in sorted(os.listdir(book_dir)):
            if f.lower().endswith(('.mp3', '.m4a', '.aac', '.wav')):
                candidates.append(os.path.join(book_dir, f))
        for src in candidates:
            rel = os.path.relpath(src, book_dir)  # audio/unit1/xxx.MP3 或 xxx.MP3
            vtt = os.path.join(book_dir, 'subs', os.path.splitext(rel)[0] + '.vtt')
            if os.path.exists(vtt) and not args.force:
                print(f'  跳过（已存在）: {book}/subs/{os.path.basename(vtt)}')
                continue
            jobs.append((book, src, vtt))

    if not jobs:
        print('没有需要转写的音频')
    for i, (book, src, vtt) in enumerate(jobs, 1):
        os.makedirs(os.path.dirname(vtt), exist_ok=True)
        print(f'[{i}/{len(jobs)}] {os.path.basename(src)} …', flush=True)
        ok = transcribe(model, src, vtt)
        print('   ->', os.path.relpath(vtt, ROOT) if ok else '（无有效语音，跳过）')

    print('重新生成 manifest …')
    subprocess.run([sys.executable, os.path.join(ROOT, 'make_media_manifest.py')], check=True)


if __name__ == '__main__':
    main()

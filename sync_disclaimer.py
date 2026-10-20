#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync_disclaimer.py — 免责声明单一来源同步脚本（仅 Python 标准库）

DISCLAIMER.md 是免责声明的唯一维护处。本脚本把它的内容同步到：
  1. app.js     → 内嵌弹窗 DISCLAIMER_HTML（页面内「📜 免责声明」入口）
  2. README.md  → 「## 免责声明」章节

用法：
    python sync_disclaimer.py          # 同步
    python sync_disclaimer.py --check  # 只校验是否一致（CI / 提交前自检），不一致时退出码 1

说明：
  * DISCLAIMER_VERSION 在 app.js 顶部人工维护：条款有实质改动时 +1。
  * README-en.md 的免责声明为人工翻译，不参与自动同步。
  * 两处目标都有明确的边界标记（BEGIN/END），只替换标记之间的内容，
    其余内容一律不动。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "DISCLAIMER.md"
APP = ROOT / "app.js"
README = ROOT / "README.md"

# ---- app.js 内嵌 HTML 的边界标记 ------------------------------------------------
JS_BEGIN = "/* === DISCLAIMER_HTML BEGIN（由 sync_disclaimer.py 从 DISCLAIMER.md 生成，勿手改） === */"
JS_END = "/* === DISCLAIMER_HTML END === */"
# ---- README 章节的边界标记 ------------------------------------------------------
MD_BEGIN = "<!-- DISCLAIMER-BEGIN（由 sync_disclaimer.py 从 DISCLAIMER.md 生成，勿手改） -->"
MD_END = "<!-- DISCLAIMER-END -->"


def load_source() -> str:
    """读取 DISCLAIMER.md，剥离文件开头连续的 HTML 注释块（SPDX 行 + 维护说明），返回正文。"""
    text = SRC.read_text(encoding="utf-8")
    # 循环剥离开头连续的 <!-- ... --> 注释块（DISCLAIMER.md 开头有 SPDX 短注释 + 维护说明长注释）
    while True:
        text2 = text.lstrip()
        if not text2.startswith("<!--"):
            break
        end = text2.find("-->")
        if end < 0:
            break  # 注释未闭合（异常文件），停止剥离避免吞掉正文
        text = text2[end + 3:]
    return text.strip()


def md_to_dialog_html(md: str) -> str:
    """把免责声明 Markdown 转成 app.js 弹窗用的精简 HTML。

    规则（与原手工维护版一致）：
      * ## 标题        → 忽略（弹窗有固定标题栏）
      * ### N. xxx     → <h4>N. xxx</h4>
      * - 列表项        → 同一段落内合并为 <ul>…</ul>；连续列表才会合并
      * > 引用行        → <div class="warn">…</div>
      * **粗体**       → <b>粗体</b>；`代码` → <code>代码</code>
      * [text](链接)   → 弹窗内链接不可点（内容可能被复制进说明页），降级为纯文本 text
    """
    out = []
    in_ul = False

    def close_ul():
        nonlocal in_ul
        if in_ul:
            out.append("</ul>")
            in_ul = False

    def inline(s: str) -> str:
        s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)      # [t](u) → t
        s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)        # **b** → <b>
        # `c` → <code>；尖括号转义，避免 <bookId> 之类被 innerHTML 当未知标签吞掉
        s = re.sub(r"`([^`]+)`",
                   lambda m: "<code>" + m.group(1).replace("<", "&lt;").replace(">", "&gt;") + "</code>",
                   s)
        return s

    for raw in md.splitlines():
        line = raw.rstrip()
        if not line.strip():
            close_ul()
            continue
        if line.startswith("### "):
            close_ul()
            out.append(f"<h4>{inline(line[4:].strip())}</h4>")
        elif line.startswith("## "):
            close_ul()  # 「## 免责声明」本身不要
        elif line.startswith(">"):
            close_ul()
            out.append(f'<div class="warn">{inline(line.lstrip("> ").strip())}</div>')
        elif line.startswith("- "):
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            item = line[2:].strip()
            # ⚠️ 开头的重点条目沿用原版 warn 高亮样式（与手工维护版一致）
            if item.startswith("⚠️"):
                out.append(f'<li class="warn" style="list-style:none;margin-left:-18px">{inline(item)}</li>')
            else:
                out.append(f"<li>{inline(item)}</li>")
        else:
            close_ul()
            out.append(f"<p>{inline(line.strip())}</p>")
    close_ul()
    return "\n".join(out)


def sync_app_js(js_html: str, check_only: bool) -> bool:
    src = APP.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(JS_BEGIN) + r".*?" + re.escape(JS_END), re.S)
    if not pattern.search(src):
        print(f"[ERROR] app.js 中找不到边界标记：\n  {JS_BEGIN}\n  ... \n  {JS_END}")
        return False

    # 生成新的 DISCLAIMER_HTML 常量（保持常量声明在标记之外，由边界标记包裹整个常量赋值）
    new_block = f"""{JS_BEGIN}
const DISCLAIMER_HTML = `
  {js_html.replace(chr(10), chr(10) + '  ')}
`;
{JS_END}"""
    if check_only:
        cur = pattern.search(src).group(0)
        ok = cur == new_block
        print(("OK  " if ok else "DIFF") + " app.js DISCLAIMER_HTML")
        return ok
    src = pattern.sub(lambda _: new_block, src, count=1)
    APP.write_text(src, encoding="utf-8")
    print("SYNC app.js DISCLAIMER_HTML")
    return True


def sync_readme(md: str, check_only: bool) -> bool:
    src = README.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(MD_BEGIN) + r".*?" + re.escape(MD_END), re.S)
    if not pattern.search(src):
        print(f"[ERROR] README.md 中找不到边界标记：\n  {MD_BEGIN}\n  ... \n  {MD_END}")
        return False
    new_block = f"{MD_BEGIN}\n{md}\n{MD_END}"
    if check_only:
        cur = pattern.search(src).group(0)
        # README 中的相对链接保持原样；DISCLAIMER.md 里的 [MIT 许可证](LICENSE) 在 README 上下文同样成立
        ok = cur == new_block
        print(("OK  " if ok else "DIFF") + " README.md 免责声明章节")
        return ok
    src = pattern.sub(lambda _: new_block, src, count=1)
    README.write_text(src, encoding="utf-8")
    print("SYNC README.md 免责声明章节")
    return True


def main() -> int:
    check_only = "--check" in sys.argv[1:]
    md = load_source()
    ok1 = sync_app_js(md_to_dialog_html(md), check_only)
    ok2 = sync_readme(md, check_only)
    if check_only:
        print("CHECK PASSED" if (ok1 and ok2) else "CHECK FAILED")
        return 0 if (ok1 and ok2) else 1
    if not (ok1 and ok2):
        return 1
    print("提示：条款有实质改动时，请把 app.js 顶部的 DISCLAIMER_VERSION 手动 +1。")
    return 0


if __name__ == "__main__":
    sys.exit(main())

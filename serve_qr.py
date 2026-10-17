# -*- coding: utf-8 -*-
# SPDX-License-Identifier: MIT
# SPDX-FileCopyrightText: 2026 xiegengcai <xiegengcai@foxmail.com>
# Note: MIT applies to this source file only. Question-bank content under data/ and textbook
# material under 英语/ are third-party copyrighted and are NOT licensed by this project.
"""一键启动：在本目录起网页服务，并弹出二维码供 iPhone 扫码打开。
双击 启动手机伴学.bat 即可；关闭命令行窗口即停止服务。
访问 http://IP:8000/ 即为英语伴学页面（根路径直接映射，避免中文文件名编码问题）。

------------------------------------------------------------------------------
法律提示 / Legal notice（全文见 README.md、README-en.md 的「免责声明」章节，
页面内亦可通过底部「📜 免责声明」入口查看）
  · 本项目仅供个人 / 家庭学习参考，按「现状」提供，不附带任何明示或默示担保。
  · 教材 PDF 及 data/*.json 中照抄教材的词表、课文句与释义，著作权归原出版社及
    相应权利人所有；本项目不授予任何使用许可，请勿分发、公开、售卖或改编发布。
  · 源代码采用 MIT 许可证授权（见仓库根目录 LICENSE）；该许可证明确不覆盖
    data/*.json 题库与 英语/ 教材内容——删除或替换数据后可自由复用本代码。

本脚本的两项已知副作用（请知情使用）：
  1) 外联：生成二维码时，本机局域网 IP 与访问地址会作为参数发送给第三方图片服务
     api.qrserver.com（见下方 qr 变量）。要零外联，可注释掉 webbrowser.open(qr)，
     或改用 `python -m http.server 8000` 并手动在手机输入网址。
  2) 局域网可读：服务监听 0.0.0.0 且为静态文件服务，同一局域网内其他设备可按路径
     下载本目录下任意文件（含英语/ 教材 PDF 与 data/*.json）。请勿在公共 / 不受信
     网络下运行；用完及时关闭窗口或运行 停止服务.bat。
------------------------------------------------------------------------------
"""
import os
import socket
import threading
import webbrowser
from functools import partial
from html import escape as html_escape
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import quote, unquote, urlsplit

PORT = 8000
DIR = os.path.dirname(os.path.abspath(__file__))
PAGE = 'index.html'  # 本目录中的伴学页面入口（薄壳，题库在 data/ 目录）


def get_lan_ip():
    """探测本机局域网 IP（无需真的连外网）"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('223.5.5.5', 80))  # 只用于确定出口网卡，不发数据
        return s.getsockname()[0]
    except Exception:
        return '127.0.0.1'
    finally:
        s.close()


class QuizHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):  # 不刷屏
        pass

    def translate_path(self, path):
        # 根路径 / 直接指向伴学页面，手机扫码地址无需含中文
        p = urlsplit(path).path
        if p in ('/', ''):
            return os.path.join(DIR, PAGE)
        return super().translate_path(path)

    def list_directory(self, path):
        """目录列表：只显示 .htm / .html 文件（和子目录），其余文件过滤掉"""
        try:
            names = sorted(os.listdir(path))
        except OSError:
            self.send_error(404, 'No permission to list directory')
            return None
        display = []
        for name in names:
            full = os.path.join(path, name)
            if os.path.isdir(full):
                display.append(name + '/')
            elif name.lower().endswith(('.htm', '.html')):
                display.append(name)
        title = html_escape(unquote(urlsplit(self.path).path))
        lines = [
            '<!DOCTYPE html>', '<html lang="zh"><head><meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
            f'<title>文件列表 {title}</title>',
            '<style>body{font-family:-apple-system,sans-serif;padding:20px;max-width:600px;margin:auto}'
            'li{margin:14px 0}a{font-size:18px}h1{font-size:20px}</style></head><body>',
            f'<h1>文件列表 {title}</h1><ul>',
        ]
        for d in display:
            lines.append(f'<li><a href="{quote(d)}">{html_escape(d)}</a></li>')
        if not display:
            lines.append('<li>（没有 html 文件）</li>')
        lines.append('</ul></body></html>')
        body = '\n'.join(lines).encode('utf-8', 'replace')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        return None


def main():
    ip = get_lan_ip()
    url = f'http://{ip}:{PORT}/'
    qr = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + url

    handler = partial(QuizHandler, directory=DIR)
    server = ThreadingHTTPServer(('0.0.0.0', PORT), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()

    print('=' * 52)
    print('  服务已启动！手机和电脑要连【同一个 WiFi】')
    print('-' * 52)
    print('  iPhone 用相机扫描下方二维码，或在 Safari 手动输入：')
    print()
    print('    ', url)
    print()
    print('  二维码已在浏览器中打开（显示二维码图片需要电脑能上网）')
    print('  用完后关闭本窗口即停止服务。')
    print('-' * 52)
    print('  ⚠ 法律提示：本项目仅供个人 / 家庭学习参考，按「现状」提供，')
    print('    不含任何担保；教材与题库内容的著作权归原出版社所有，请勿分发。')
    print('    详见 README.md 或页面底部「📜 免责声明」。')
    print('    浏览器打开二维码图片时，会向 api.qrserver.com 发送本机地址 '
          f'{ip}（不想外联请注释 webbrowser.open(qr)）。')
    print(f'    服务监听 0.0.0.0:{PORT}，同一局域网内其他设备可按路径读取本目录文件。')
    print('=' * 52)

    webbrowser.open(qr)
    try:
        while True:
            threading.Event().wait(3600)
    except KeyboardInterrupt:
        pass
    finally:
        server.shutdown()


if __name__ == '__main__':
    main()

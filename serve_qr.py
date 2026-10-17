# -*- coding: utf-8 -*-
"""一键启动：在本目录起网页服务，并弹出二维码供 iPhone 扫码打开。
双击 启动手机伴学.bat 即可；关闭命令行窗口即停止服务。
访问 http://IP:8000/ 即为英语伴学页面（根路径直接映射，避免中文文件名编码问题）。"""
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

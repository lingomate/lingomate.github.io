@echo off
chcp 65001 >nul
cd /d "%~dp0"
py serve_qr.py
pause

@echo off
rem SPDX-License-Identifier: MIT
rem SPDX-FileCopyrightText: 2026 xiegengcai <xiegengcai@foxmail.com>
rem MIT covers this script only. data/ banks and textbook PDFs stay third-party copyrighted.
chcp 65001 >nul
cd /d "%~dp0"
py serve_qr.py
pause

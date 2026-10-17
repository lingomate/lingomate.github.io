@echo off
rem SPDX-License-Identifier: MIT
rem SPDX-FileCopyrightText: 2026 xiegengcai <xiegengcai@foxmail.com>
chcp 65001 >nul
title 英语伴学 - 关停服务
echo 正在查找占用 8000 端口的伴学服务...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop_server.ps1"
echo.
echo 关闭本窗口即可。
pause


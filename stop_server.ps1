# SPDX-License-Identifier: MIT
# SPDX-FileCopyrightText: 2026 xiegengcai <xiegengcai@foxmail.com>
# MIT covers this script only; data/ banks and the textbook folder stay third-party copyrighted.
$ErrorActionPreference = 'SilentlyContinue'
$pids = Get-NetTCPConnection -LocalPort 8000 -State Listen |
    Select-Object -ExpandProperty OwningProcess -Unique
$killed = 0
foreach ($p in $pids) {
    $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$p").CommandLine
    if ($cmd -like '*serve_qr.py*') {
        Stop-Process -Id $p -Force
        Write-Host "  已停止服务进程 PID $p"
        $killed++
    }
}
if ($killed -eq 0) {
    Write-Host '  没有发现正在运行的伴学服务（可能已经是关闭状态）'
}

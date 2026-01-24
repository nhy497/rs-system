# 啟動測試伺服器

# PowerShell 腳本 - 用於啟動簡易 HTTP 伺服器測試系統

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  RS-System 測試伺服器啟動工具" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$port = 8080
$path = Get-Location

Write-Host "📁 當前目錄: $path" -ForegroundColor Green
Write-Host "🌐 伺服器端口: $port" -ForegroundColor Green
Write-Host ""

# 檢查 Python 是否安裝
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue

if ($pythonCmd) {
    Write-Host "✅ 已檢測到 Python" -ForegroundColor Green
    Write-Host "🚀 啟動 Python HTTP 伺服器..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📌 測試工具網址:" -ForegroundColor Cyan
    Write-Host "   系統驗證: http://localhost:$port/system-verification-test.html" -ForegroundColor White
    Write-Host "   會話診斷: http://localhost:$port/session-diagnostic.html" -ForegroundColor White
    Write-Host "   主應用:   http://localhost:$port/index.html" -ForegroundColor White
    Write-Host "   登入頁:   http://localhost:$port/login.html" -ForegroundColor White
    Write-Host ""
    Write-Host "按 Ctrl+C 停止伺服器" -ForegroundColor Yellow
    Write-Host ""
    
    # 啟動 Python 伺服器
    python -m http.server $port
} else {
    Write-Host "❌ 未檢測到 Python" -ForegroundColor Red
    Write-Host ""
    Write-Host "請安裝 Python 或使用其他方式啟動 HTTP 伺服器:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "方法 1: 安裝 Python" -ForegroundColor Cyan
    Write-Host "   https://www.python.org/downloads/" -ForegroundColor White
    Write-Host ""
    Write-Host "方法 2: 使用 VS Code Live Server 擴充功能" -ForegroundColor Cyan
    Write-Host "   1. 安裝 'Live Server' 擴充功能" -ForegroundColor White
    Write-Host "   2. 右鍵點擊 index.html" -ForegroundColor White
    Write-Host "   3. 選擇 'Open with Live Server'" -ForegroundColor White
    Write-Host ""
    Write-Host "方法 3: 使用 Node.js http-server" -ForegroundColor Cyan
    Write-Host "   npm install -g http-server" -ForegroundColor White
    Write-Host "   http-server -p $port" -ForegroundColor White
    Write-Host ""
    
    Read-Host "按 Enter 鍵退出"
}

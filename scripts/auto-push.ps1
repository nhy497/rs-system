# 自動推送到 GitHub 腳本
# 用於在完成測試設置後自動推送變更

param(
    [string]$Branch = "main",
    [string]$Message = "🧪 完成測試框架設置和 CI/CD 增強"
)

Write-Host "🚀 開始自動推送到 GitHub..." -ForegroundColor Green

# 檢查是否在 git 倉庫中
try {
    $gitStatus = git status --porcelain
    if (-not $gitStatus) {
        Write-Host "✅ 沒有需要提交的變更" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "❌ 錯誤：不在 git 倉庫中或 git 未安裝" -ForegroundColor Red
    exit 1
}

# 顯示變更狀態
Write-Host "📋 當前變更狀態：" -ForegroundColor Yellow
git status --short

# 添加所有變更
Write-Host "📦 添加所有變更..." -ForegroundColor Blue
git add .

# 提交變更
Write-Host "💾 提交變更..." -ForegroundColor Blue
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 提交失敗" -ForegroundColor Red
    exit 1
}

# 推送到遠程倉庫
Write-Host "📤 推送到遠程倉庫..." -ForegroundColor Blue
git push origin $Branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失敗" -ForegroundColor Red
    Write-Host "💡 提示：檢查網絡連接或權限設置" -ForegroundColor Yellow
    exit 1
}

Write-Host "✨ 成功推送到 GitHub！" -ForegroundColor Green
Write-Host "🌐 分支: $Branch" -ForegroundColor Cyan
Write-Host "📝 提交訊息: $Message" -ForegroundColor Cyan

# 顯示最新的提交
Write-Host "📊 最新提交信息：" -ForegroundColor Yellow
git log --oneline -1

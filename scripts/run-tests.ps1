# 測試執行腳本
# 運行所有測試並生成報告

param(
    [switch]$Unit,
    [switch]$E2E,
    [switch]$Coverage,
    [switch]$CI
)

# 如果沒有指定具體測試類型，默認運行所有測試
$runAll = -not ($Unit -or $E2E)

Write-Host "🧪 RS-System 測試執行器" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

$testResults = @{}
$success = $true

# 創建測試結果目錄
if (-not (Test-Path "test-results")) {
    New-Item -ItemType Directory -Path "test-results" | Out-Null
}

# 運行單元測試
if ($Unit -or $runAll) {
    Write-Host "🔬 運行單元測試..." -ForegroundColor Blue
    
    if ($Coverage -or $CI) {
        npm run test:ci
    } else {
        npm run test
    }
    
    if ($LASTEXITCODE -eq 0) {
        $testResults.Unit = "✅ 通過"
        Write-Host "✅ 單元測試通過" -ForegroundColor Green
    } else {
        $testResults.Unit = "❌ 失敗"
        $success = $false
        Write-Host "❌ 單元測試失敗" -ForegroundColor Red
    }
}

# 運行 E2E 測試
if ($E2E -or $runAll) {
    Write-Host "🎭 運行 E2E 測試..." -ForegroundColor Blue
    
    if ($CI) {
        npm run test:e2e:ci
    } else {
        npm run test:e2e
    }
    
    if ($LASTEXITCODE -eq 0) {
        $testResults.E2E = "✅ 通過"
        Write-Host "✅ E2E 測試通過" -ForegroundColor Green
    } else {
        $testResults.E2E = "❌ 失敗"
        $success = $false
        Write-Host "❌ E2E 測試失敗" -ForegroundColor Red
    }
}

# 運行代碼檢查
if ($CI) {
    Write-Host "🔍 運行代碼檢查..." -ForegroundColor Blue
    
    npm run lint
    
    if ($LASTEXITCODE -eq 0) {
        $testResults.Lint = "✅ 通過"
        Write-Host "✅ 代碼檢查通過" -ForegroundColor Green
    } else {
        $testResults.Lint = "❌ 失敗"
        Write-Host "⚠️ 代碼檢查失敗（不阻止部署）" -ForegroundColor Yellow
    }
}

# 顯示測試結果摘要
Write-Host "`n📊 測試結果摘要" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

foreach ($key in $testResults.Keys) {
    Write-Host "$key`: $($testResults[$key])"
}

if ($success) {
    Write-Host "`n🎉 所有測試通過！" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n💥 部分測試失敗" -ForegroundColor Red
    exit 1
}

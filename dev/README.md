# 🛠️ Development Tools

本目錄包含開發與除錯工具。

## 📂 文件說明

### console-enhancer.js
主控台輸出增強器，提供美化的 console 輸出功能。

**使用方法：**
```javascript
console.success('操作成功');
console.error_('發生錯誤');
console.info_('提示訊息');
console.warn_('警告訊息');
```

### diagnostic-script.js
快速診斷腳本，用於檢查系統狀態。

**使用方法：**
```javascript
// 在瀏覽器 console 中執行此腳本
// 將檢查函數、儲存狀態、DOM 元素、用戶狀態
```

### clear-cache.html
緩存清除工具頁面，用於解決緩存相關問題。

**使用場景：**
- 遇到 `currentUser has already been declared` 錯誤
- 需要完全重置 localStorage/sessionStorage
- 測試創作者帳戶登入

### test-save-refresh.html
儲存與刷新測試頁面，用於驗證數據流程。

**測試項目：**
- 系統登入狀態
- 建立測試記錄
- UI 更新驗證
- 數據持久化檢查

## 🚀 使用指南

### 本地開發
1. 在 index.html 中引入需要的工具
2. 使用開發伺服器測試
3. 查看 console 輸出

### 除錯流程
1. 先使用 diagnostic-script.js 檢查系統狀態
2. 如果有緩存問題，使用 clear-cache.html
3. 使用 test-save-refresh.html 測試數據流程
4. 檢查 console-enhancer 的輸出日誌

## ⚠️ 注意事項

- 這些工具僅用於開發環境
- 不要在生產環境中引入
- 測試完成後記得清理測試數據

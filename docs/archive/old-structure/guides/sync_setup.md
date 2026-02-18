# 跨裝置同步設置指南

## 問題說明
localStorage 只存在瀏覽器本地，每個裝置的數據完全隔離，無法跨裝置共享。

## 解決方案
啟用 PouchDB 雲端同步功能，將數據同步到雲端 CouchDB 數據庫。

---

## 快速設置（3 步驟）

### 1. 註冊免費 CouchDB 服務

**推薦選項 A：IBM Cloudant**（免費 1GB）
1. 訪問：https://www.ibm.com/cloud/cloudant
2. 註冊 IBM Cloud 帳號
3. 創建 Cloudant 實例
4. 創建數據庫名為 `rs-system-shared`
5. 生成 API 密鑰（Legacy credentials）

**推薦選項 B：Couchbase Capella**（免費試用）
1. 訪問：https://cloud.couchbase.com/
2. 註冊並創建免費實例
3. 記錄連接 URL 和憑證

---

### 2. 配置同步設置

編輯 `sync-config.js`：

```javascript
const SYNC_CONFIG = {
  // 啟用雲端同步
  ENABLE_SYNC: true,
  
  // 填入你的 CouchDB URL
  REMOTE_DB_URL: 'https://username:password@xxx.cloudantnosqldb.appdomain.cloud/rs-system-shared',
  
  OPTIONS: {
    live: true,
    retry: true,
    continuous: true
  }
};
```

**URL 格式說明**：
```
https://[用戶名]:[密碼]@[伺服器地址]/[數據庫名]
```

---

### 3. 重新整理所有裝置

1. 在每個裝置上重新整理頁面（Ctrl+Shift+R）
2. 登入帳號
3. Console 會顯示「🌐 雲端同步已啟用，所有裝置將共享數據」

---

## 測試同步

1. **裝置 A**：建立課堂記錄
2. **裝置 B**：重新整理頁面，應能看到裝置 A 的記錄
3. **裝置 B**：建立新記錄
4. **裝置 A**：重新整理，應能看到裝置 B 的記錄

---

## 本地測試方案

如果想在本機測試：

### Windows/Mac 安裝 CouchDB

**Windows**：
```powershell
# 使用 Chocolatey
choco install couchdb

# 或下載安裝包
# https://couchdb.apache.org/
```

**Mac**：
```bash
brew install couchdb
brew services start couchdb
```

### 配置本地連接

```javascript
const SYNC_CONFIG = {
  ENABLE_SYNC: true,
  REMOTE_DB_URL: 'http://admin:password@localhost:5984/rs-system-shared',
};
```

訪問 http://localhost:5984/_utils 管理數據庫。

---

## 疑難排解

### 同步失敗

**檢查項目**：
1. URL 格式正確（包含 `https://`）
2. 用戶名密碼正確
3. 數據庫已創建
4. 網路連接正常

**Console 查看**：
- ✅ `雲端同步已啟用` → 成功
- ❌ `同步錯誤: Unauthorized` → 憑證錯誤
- ❌ `同步錯誤: CORS` → 需在 CouchDB 設定 CORS

### CORS 設置

在 CouchDB 管理介面：
```
Configuration → CORS
Enable CORS: Yes
Origins: *
```

---

## 安全建議

1. **不要** 將 `sync-config.js` 提交到 GitHub（已加入 .gitignore）
2. 定期更換 API 密鑰
3. 使用環境變數存儲敏感資訊（進階）

---

## 技術說明

- **本地數據庫**：`rs-system-shared`（所有用戶共用）
- **同步方式**：雙向即時同步
- **斷線重連**：自動重試
- **衝突處理**：PouchDB 自動合併

---

## 需要協助？

查看 Console 輸出的錯誤訊息，或參考：
- PouchDB 文檔：https://pouchdb.com/guides/
- IBM Cloudant 文檔：https://cloud.ibm.com/docs/Cloudant

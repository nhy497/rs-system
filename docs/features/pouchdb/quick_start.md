# PouchDB 系統快速開始 · 30 秒上手

## 🎯 5 步啟動應用

### 步驟 1：開啟應用
```
使用瀏覽器打開 login.html
```

### 步驟 2：建立帳號或登入
```
帳號：任意用戶名
密碼：至少 4 個字符
```

### 步驟 3：系統自動初始化
```
PouchDB 會自動：
  ✓ 為該用戶建立獨立資料庫
  ✓ 載入班級預設
  ✓ 刷新 UI
  ✓ 啟動監聽機制
```

### 步驟 4：使用應用
```
• 新增課堂 → 填表 → 儲存
• 所有資料自動保存到 PouchDB
• 刷新頁面資料不會丟失
```

### 步驟 5：登出或切換用戶
```
點擊登出，重新登入另一個用戶帳號
• 自動切換到該用戶的資料庫
• 看到不同用戶的課堂記錄
```

---

## 🔑 核心概念

### 什麼是 PouchDB？
- ✅ 本地資料庫（在瀏覽器中運行）
- ✅ 永久儲存（資料不會遺失）
- ✅ 完全免費（無須伺服器）
- ✅ 離線可用（無須網際網路）

### 多用戶隔離
每個用戶登入後：
```
帳號 A → 資料庫 A （50 筆課堂）
帳號 B → 資料庫 B （30 筆課堂）
帳號 C → 資料庫 C （100 筆課堂）

用戶只能看到自己的資料
```

### 資料流向
```
使用者輸入表格
    ↓
按下 [儲存本堂記錄]
    ↓
pouchdb-app-compat.js 攔截
    ↓
轉遞到 StorageAdapter
    ↓
保存到 PouchDB
    ↓
自動刷新 UI
    ↓
完成！ ✓
```

---

## 📱 常用操作

### 新增課堂記錄
```
1. 選擇日期
2. 輸入班級名稱
3. 填寫其他資訊
4. 點擊 [儲存本堂記錄]
5. ✓ 資料自動保存
```

### 匯出資料
```
統計分析 → [匯出全部記錄（CSV）]
→ 自動下載 CSV 檔案
```

### 備份和恢復
```
開發者工具 (F12) → 主控台 (Console) 輸入：

備份：
  const backup = await storageAdapter.backup();
  console.log(backup);

恢復：
  const data = {...backup資料...};
  await storageAdapter.importData(data);
```

### 刪除所有記錄
```
統計分析 → [清除所有記錄]
⚠️ 此操作無法撤銷！
```

---

## 🛠️ 開發者操作

### 檢查應用狀態
打開瀏覽器開發者工具 (F12)，主控台 (Console) 輸入：

```javascript
// 檢查認證狀態
authManager.getCurrentUser()

// 檢查儲存適配層
storageAdapter.isReady()

// 檢查資料庫統計
await pouchDBManager.getStats()

// 列出所有課堂
await storageAdapter.getAllCheckpoints()

// 列出所有班級預設
await storageAdapter.getAllClassPresets()

// 查看所有用戶
authManager.getAllUsers()
```

### 手動操作資料

```javascript
// 新增課堂（手動）
await storageAdapter.addCheckpoint({
  date: '2025-01-21',
  className: 'P3A',
  classSize: 30,
  notes: '手動添加的課堂'
});

// 查詢課堂
const checkpoints = await storageAdapter.getAllCheckpoints();
console.table(checkpoints);

// 搜尋課堂
const results = await storageAdapter.searchCheckpoints('P3A');

// 刪除特定課堂
await storageAdapter.deleteCheckpoint(checkpointId);
```

### 轉換用戶（不登出）

```javascript
// 快速切換用戶資料庫
await switchUser('user_new_id');
```

---

## ⚙️ 系統設置

### 會話超時時間
編輯 `user-auth.js`：
```javascript
SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 改為需要的時間（毫秒）
```

### 密碼最小長度
編輯 `user-auth.js`：
```javascript
PASSWORD_MIN_LENGTH: 4 // 改為需要的長度
```

### 資料庫前綴名稱
編輯 `pouchdb-config.js`：
```javascript
DB_PREFIX: 'rs-system-' // 改為自訂前綴
```

---

## 🔍 除錯技巧

### 查看完整的資料庫內容
```javascript
const db = pouchDBManager.getCurrentDatabase();
const allDocs = await db.allDocs({ include_docs: true });
console.table(allDocs.rows.map(r => r.doc));
```

### 查看資料庫實時日誌
```javascript
const db = pouchDBManager.getCurrentDatabase();
db.changes({
  since: 'now',
  live: true,
  include_docs: true
}).on('change', change => {
  console.log('📝 資料變動:', change);
});
```

### 檢查瀏覽器儲存空間
```javascript
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate();
  console.log(`已用: ${estimate.usage} bytes`);
  console.log(`總量: ${estimate.quota} bytes`);
  console.log(`使用率: ${(estimate.usage / estimate.quota * 100).toFixed(2)}%`);
}
```

### 清除整個資料庫（危險操作）
```javascript
// ⚠️ 警告：此操作無法撤銷！
await pouchDBManager.deleteUserDatabase(pouchDBManager.currentUserId);
console.log('資料庫已刪除');
```

---

## 📊 檔案大小和性能

### 系統開銷
| 項目 | 大小 |
|------|------|
| PouchDB CDN | 100 KB |
| PouchDB Find | 50 KB |
| 系統模組 | 50 KB |
| **總計** | **~200 KB** |

### 資料儲存
| 項目 | 大小 |
|------|------|
| 1 筆課堂記錄 | ~1 KB |
| 100 筆記錄 | ~100 KB |
| 1000 筆記錄 | ~1 MB |

---

## 🆘 常見問題排除

### 問題：無法登入
```
解決方案：
1. 檢查使用者名稱和密碼
2. 清除瀏覽器快取：Ctrl+Shift+Delete
3. 在無痕模式下重試
4. 嘗試另一個瀏覽器
```

### 問題：資料沒有保存
```
解決方案：
1. 開啟開發者工具 (F12)
2. 檢查控制台是否有紅色錯誤
3. 查看 IndexedDB 是否已啟用
4. 檢查儲存空間是否已滿
```

### 問題：頁面白屏
```
解決方案：
1. 按 F12 打開開發者工具
2. 查看控制台錯誤訊息
3. 檢查網路請求（Network 分頁）
4. 查看 PouchDB CDN 是否載入成功
```

### 問題：無法刪除記錄
```
解決方案：
1. 確認您有登入
2. 確認記錄屬於當前用戶
3. 檢查瀏覽器主控台錯誤
4. 嘗試刷新頁面後再刪除
```

### 問題：匯出的 CSV 為空
```
解決方案：
1. 檢查是否有新增課堂記錄
2. 確認記錄確實已保存
3. 在主控台執行：
   const data = await storageAdapter.getAllCheckpoints();
   console.log(data.length);  // 應該 > 0
```

---

## 📖 進階資源

### 完整 API 文檔
查看 [POUCHDB_SYSTEM_GUIDE.md](POUCHDB_SYSTEM_GUIDE.md)

### PouchDB 官方文檔
https://pouchdb.com/api.html

### 系統架構圖
見 POUCHDB_SYSTEM_GUIDE.md 第一部分

---

## 💡 最佳實踐

### ✅ 建議做法
- 定期備份資料（每週一次）
- 在重大操作前備份
- 使用強密碼（避免簡單密碼）
- 多人共享設備時使用不同帳號
- 定期檢查儲存空間使用率

### ❌ 避免做法
- 在無痕模式下使用（會丟失資料）
- 使用 localStorage.clear() 清除瀏覽器資料
- 在公用電腦上保存密碼
- 不備份重要資料
- 依賴單個瀏覽器作為唯一資料來源

---

## 📞 技術支持聯繫

遇到問題？

1. 先查看此文檔和完整指南
2. 在瀏覽器主控台執行診斷命令
3. 檢查 GitHub Issues（如有）
4. 聯繫技術支持團隊

---

**快速開始版本：** v1.0  
**最後更新：** 2025-01-21  
**適用於：** RS 系統 v3.0 (PouchDB)

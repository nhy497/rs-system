# PouchDB 多用戶儲存系統 · 完整文檔

## 📋 系統概述

RS 系統已升級為 **PouchDB 本地儲存架構**，支援完整的多用戶隔離和資料持久化。

### ✨ 核心特性

| 功能 | 說明 |
|------|------|
| **多用戶隔離** | 每個用戶有獨立的 PouchDB 資料庫 (`rs-system-[userId]`) |
| **完全本地** | 所有資料儲存在瀏覽器 IndexedDB，無須雲端連接 |
| **永久儲存** | 資料持久化，關閉瀏覽器後仍保留 |
| **即時同步** | 變動自動刷新 UI，支援監聽機制 |
| **備份恢復** | 支援 JSON 格式匯出/匯入 |
| **免費方案** | 完全免費，無儲存限制（取決於瀏覽器） |

---

## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────┐
│                   用戶前端界面 (index.html)              │
│                   app.js (原有邏輯)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            PouchDB 相容層 (pouchdb-app-compat.js)        │
│  • 攔截 parseRecords/saveRecords 函數                   │
│  • 攔截班級預設操作                                     │
│  • 管理非同步存儲邏輯                                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          PouchDB 整合層 (pouchdb-integration.js)         │
│  • 儲存適配器 (StorageAdapter)                          │
│  • 用戶切換 (switchUser)                                │
│  • 應用初始化 (initializeApp)                           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│       PouchDB 儲存服務 (pouchdb-storage.js)             │
│  • StorageService - CRUD 操作                           │
│  • 查詢和篩選                                            │
│  • 批量操作                                              │
│  • 備份和恢復                                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│       PouchDB 管理器 (pouchdb-config.js)                │
│  • PouchDBManager - 資料庫管理                          │
│  • 用戶資料庫隔離                                        │
│  • 設計文件（索引）管理                                  │
│  • 匯出/匯入功能                                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│      用戶認證系統 (user-auth.js)                         │
│  • AuthenticationManager - 用戶管理                      │
│  • 登入/登出/註冊                                       │
│  • 會話管理                                              │
│  • 本地密碼驗證                                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         PouchDB 核心 (CDN 引入)                         │
│  • pouchdb@8.0.1 (IndexedDB 驅動)                       │
│  • pouchdb-find@8.0.1 (查詢能力)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 新增檔案說明

### 1. **pouchdb-config.js** - PouchDB 配置和初始化
負責 PouchDB 核心配置、資料庫管理、設計文件（索引）

**主要類別：**
- `PouchDBManager` - 全局資料庫管理器
  - `init()` - 初始化系統
  - `setCurrentUser(userId)` - 設置當前用戶並打開其資料庫
  - `getCurrentDatabase()` - 取得當前資料庫
  - `getStats()` - 取得儲存統計
  - `exportUserData()` / `importUserData()` - 資料匯出/匯入
  - `listAllDatabases()` - 列出所有用戶資料庫

**全局實例：**
```javascript
pouchDBManager  // PouchDBManager 實例
initializePouchDB()  // 初始化函數
```

### 2. **pouchdb-storage.js** - 儲存操作層
實現完整的 CRUD 和查詢功能

**主要類別：**
- `StorageService` - 數據存儲和查詢服務
  - **課堂記錄操作：**
    - `addCheckpoint(data)` - 新增課堂
    - `updateCheckpoint(id, updates)` - 更新課堂
    - `deleteCheckpoint(id)` - 刪除課堂
    - `getCheckpoint(id)` - 取得單筆課堂
    - `getAllCheckpoints()` - 取得全部課堂
    - `getCheckpointsByDateRange(start, end)` - 按日期範圍查詢
    - `getCheckpointsByClass(className)` - 按班級查詢
    - `getCheckpointsByStudent(studentId)` - 按學生查詢
    - `searchCheckpoints(keyword)` - 搜尋課堂
    - `filterCheckpoints(filters)` - 進階篩選
    - `duplicateCheckpoint(id, overrides)` - 複製課堂

  - **班級預設操作：**
    - `addClassPreset(data)` - 新增班級預設
    - `getAllClassPresets()` - 取得所有預設
    - `deleteClassPreset(id)` - 刪除預設

  - **統計操作：**
    - `updateAnalyticsSummary(data)` - 更新統計
    - `getAnalyticsSummary()` - 取得統計摘要

  - **批量和其他操作：**
    - `bulkInsert(docs)` - 批量插入
    - `bulkDelete(ids)` - 批量刪除
    - `backup()` - 建立備份
    - `restoreFromBackup(backup)` - 恢復備份
    - `clearAllData()` - 清除所有資料

**全局實例：**
```javascript
storageService  // StorageService 實例
initializeStorageService(db)  // 初始化函數
```

### 3. **user-auth.js** - 用戶認證系統
管理多用戶登入、註冊、會話

**主要類別：**
- `AuthenticationManager` - 用戶認證管理器
  - `register(username, password, email)` - 用戶註冊
  - `login(username, password)` - 用戶登入
  - `logout()` - 用戶登出
  - `getCurrentUser()` - 取得當前用戶
  - `isLoggedIn()` - 檢查登入狀態
  - `getCurrentUserId()` - 取得當前用戶 ID
  - `changePassword(oldPassword, newPassword)` - 變更密碼
  - `deleteAccount(password)` - 刪除帳號
  - `getAllUsers()` - 列出所有用戶（管理用）
  - `keepSessionAlive()` - 延長會話時間

**全局實例：**
```javascript
authManager  // AuthenticationManager 實例
requireAuth()  // 確保已登入（用於保護功能）
getCurrentUserId()  // 取得當前用戶 ID
```

**會話管理：**
- 會話保存在 `localStorage` 中的 `rs-system-session` key
- 預設會話超時時間：24 小時
- 可透過 `keepSessionAlive()` 延長會話

### 4. **pouchdb-integration.js** - PouchDB 整合層
將所有模組連接在一起

**主要類別：**
- `StorageAdapter` - 儲存適配層（核心中介層）
  - 統一的儲存介面
  - 快取管理
  - 變動監聽
  - 自動同步

**全局函數：**
```javascript
initializeApp()  // 初始化應用（在 DOMContentLoaded 時調用）
switchUser(userId)  // 切換用戶
storageAdapter  // StorageAdapter 實例
```

### 5. **pouchdb-app-compat.js** - App.js 相容層
攔截原有的 localStorage 操作，重新路由到 PouchDB

**覆蓋的全局函數：**
```javascript
parseRecords()  // 取得所有課堂記錄
saveRecords(arr)  // 保存課堂記錄
getClassPresets()  // 取得班級預設
saveClassPresets(arr)  // 保存班級預設
addClassPreset(className)  // 新增班級預設
removeClassPreset(className)  // 刪除班級預設
refreshAllViews()  // 刷新所有 UI 視圖
exportCheckpoints()  // 匯出課堂記錄為 CSV
deleteAllCheckpoints()  // 刪除所有記錄
logoutUser()  // 登出用戶
```

---

## 🚀 使用流程

### 用戶註冊和登入

**登入頁面 (login.html)：**
```javascript
// 註冊新用戶
const result = await authManager.register('username', 'password', 'email@example.com');
if (result.success) {
  console.log('✅ 用戶已註冊:', result.userId);
}

// 登入
const loginResult = await authManager.login('username', 'password');
if (loginResult.success) {
  window.location.href = 'index.html';
}

// 登出
authManager.logout();
window.location.href = 'login.html';
```

### 課堂記錄操作

**新增課堂：**
```javascript
const result = await storageAdapter.addCheckpoint({
  date: '2025-01-21',
  className: 'P3A',
  classSize: 30,
  atmosphere: '積極',
  skillLevel: '進階',
  studentRecords: [
    { studentId: '1', studentName: '李明', score: 4 }
  ],
  notes: '今天表現很好'
});
```

**查詢課堂：**
```javascript
// 取得所有課堂
const all = await storageAdapter.getAllCheckpoints();

// 按日期範圍查詢
const range = await storageAdapter.filterCheckpoints({
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
});

// 搜尋課堂
const results = await storageAdapter.searchCheckpoints('P3A');

// 按班級查詢
const classCheckpoints = await storageService.getCheckpointsByClass('P3A');
```

**更新課堂：**
```javascript
await storageAdapter.updateCheckpoint(checkpointId, {
  className: 'P3B',
  notes: '更新的備注'
});
```

**刪除課堂：**
```javascript
await storageAdapter.deleteCheckpoint(checkpointId);
```

### 班級預設操作

**新增班級預設：**
```javascript
await storageAdapter.addClassPreset('P3A');
```

**取得所有預設：**
```javascript
const presets = await storageAdapter.getAllClassPresets();
console.log(presets); // ['P3A', 'P3B', 'P4A', ...]
```

**刪除預設：**
```javascript
await storageAdapter.deleteClassPreset('P3A');
```

### 資料備份和恢復

**建立備份：**
```javascript
const backup = await storageAdapter.backup();
console.log(backup);
// {
//   timestamp: '2025-01-21T10:00:00Z',
//   version: 1,
//   checkpointCount: 50,
//   presetCount: 5,
//   data: { checkpoints: [...], classPresets: [...], summary: {...} }
// }

// 保存為 JSON 檔案
const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
// 觸發下載...
```

**匯入備份：**
```javascript
const backupData = JSON.parse(backupJsonString);
const result = await storageAdapter.importData(backupData);
console.log(result); // { success: true, imported: 50, results: [...] }
```

### 數據匯出

**匯出為 CSV：**
```javascript
await exportCheckpoints();
// 自動下載 CSV 檔案
```

---

## 🔐 認證流程

### 用戶會話管理

```
登入成功
  ↓
authManager 設置 currentUser
  ↓
會話保存到 localStorage (rs-system-session)
  ↓
初始化 PouchDB 資料庫 (rs-system-[userId])
  ↓
StorageAdapter 加載該用戶的資料
  ↓
應用可以存取該用戶的所有資料
  ↓
刷新頁面時
  ↓
自動恢復會話 (_restoreSession)
  ↓
自動連接用戶資料庫
```

### 密碼安全性注意

⚠️ **本系統使用簡單的本地密碼哈希。生產環境應該：**
1. 使用 bcrypt 等專業加密庫
2. 配合後端認證（如 Firebase Authentication）
3. 使用 HTTPS 傳輸密碼

當前實現適合：
- 局域網應用
- 演示和測試
- 無需高安全性的本地應用

---

## 💾 資料庫架構

### PouchDB 文件結構

**課堂記錄文件 (type: 'checkpoint')：**
```json
{
  "_id": "checkpoint_1234567890",
  "_rev": "1-abc123",
  "type": "checkpoint",
  "date": "2025-01-21",
  "className": "P3A",
  "classSize": 30,
  "atmosphere": "積極",
  "skillLevel": "進階",
  "studentRecords": [
    {
      "studentId": "s1",
      "studentName": "李明",
      "score": 4,
      "notes": "表現優秀"
    }
  ],
  "tricks": [
    { "name": "跳繩基本姿態", "level": "初級" }
  ],
  "notes": "今天表現很好",
  "createdAt": "2025-01-21T10:00:00Z",
  "updatedAt": "2025-01-21T10:30:00Z"
}
```

**班級預設文件 (type: 'classPreset')：**
```json
{
  "_id": "preset_1234567890",
  "_rev": "1-xyz789",
  "type": "classPreset",
  "className": "P3A",
  "color": "#FF6B6B",
  "notes": "小學三年級 A 班",
  "createdAt": "2025-01-20T08:00:00Z"
}
```

**統計摘要文件 (type: 'analyticsSummary')：**
```json
{
  "_id": "summary",
  "_rev": "1-def456",
  "type": "analyticsSummary",
  "totalCheckpoints": 150,
  "totalClasses": 5,
  "totalStudents": 200,
  "updatedAt": "2025-01-21T18:00:00Z"
}
```

### PouchDB 索引設計

系統自動建立以下設計文件和索引：

**checkpoints/_design/checkpoints：**
- `byDate` - 按 `[date, createdAt]` 查詢
- `byClass` - 按 `[className, date]` 查詢
- `byStudent` - 按 `[studentId, date]` 查詢

**classPresets/_design/classPresets：**
- `all` - 列出所有班級預設

---

## 📊 性能特性

### 快取機制
- `storageAdapter.cacheData` 快取所有資料
- 避免重複查詢 PouchDB
- 變動時自動刷新快取

### 批量操作
```javascript
// 批量插入 1000 筆記錄
const docs = generateDocs(1000);
await storageService.bulkInsert(docs);
```

### 資料庫壓縮
```javascript
// 清理已刪除文件占用的空間
await pouchDBManager.compact();
```

---

## 🛠️ 常見操作

### 取得儲存統計
```javascript
const stats = await pouchDBManager.getStats();
console.log(`總文件數: ${stats.docCount}`);
console.log(`儲存大小: ${stats.readableSize}`);
```

### 列出所有用戶資料庫
```javascript
const dbs = await pouchDBManager.listAllDatabases();
console.log(dbs); // ['rs-system-user_123', 'rs-system-user_456', ...]
```

### 完全刪除用戶資料
```javascript
// 警告：無法撤銷！
await pouchDBManager.deleteUserDatabase('user_123');
```

### 監聽資料變動
```javascript
const unsubscribe = storageService.onChange((change) => {
  console.log('資料已變動:', change.doc);
  // 刷新 UI...
});

// 停止監聽
unsubscribe();
```

---

## 🐛 除錯和診斷

### 檢查初始化狀態
```javascript
console.log('PouchDB 準備就緒:', pouchDBManager.initialized);
console.log('儲存適配層準備就緒:', storageAdapter.isReady());
console.log('已登入用戶:', authManager.getCurrentUser());
```

### 查看所有課堂記錄
```javascript
const all = await storageService.getAllCheckpoints();
console.table(all);
```

### 查看資料庫資訊
```javascript
const info = await pouchDBManager.getCurrentDatabase().info();
console.log(info);
// {
//   compact_running: false,
//   db_name: 'rs-system-user_123',
//   data_size: 102400,
//   doc_count: 50,
//   doc_del_count: 5,
//   ...
// }
```

---

## 📱 瀏覽器相容性

✅ **完全支援：**
- Chrome/Edge 24+
- Firefox 16+
- Safari 10+
- Opera 15+

⚠️ **限制：**
- IE 11 及以下不支援
- 隱私/無痕模式下 IndexedDB 可能受限

### 檢查 IndexedDB 支援
```javascript
const hasIndexedDB = !!window.indexedDB;
console.log('本瀏覽器支援 IndexedDB:', hasIndexedDB);
```

---

## 🎯 遷移指南（從 localStorage 升級）

如果您的系統之前使用 localStorage：

1. **舊資料自動遷移**：
   - app.js 的邏輯保持不變
   - PouchDB 自動接管所有儲存操作
   - 現有使用者無需做任何操作

2. **匯出舊資料**（推薦）：
   ```javascript
   // 在升級前，匯出 localStorage 的資料
   const old = localStorage.getItem('rope-skip-checkpoints');
   // 保存為檔案供備份
   ```

3. **新用戶直接使用 PouchDB**

4. **降級回 localStorage**（如需要）：
   - 匯出備份 JSON
   - 手動還原至 localStorage

---

## 📞 技術支持

### 常見問題

**Q: 多個瀏覽器分頁標籤間資料如何同步？**
A: PouchDB 透過 IndexedDB 儲存資料，每個分頁都讀取同一資料庫，系統提供變動監聽機制自動同步 UI。

**Q: 如果瀏覽器的 IndexedDB 資料被清除怎麼辦？**
A: 建議定期備份。可透過 `exportCheckpoints()` 或 API 備份資料到雲端。

**Q: 能否在不同電腦間同步資料？**
A: 是。可透過匯出 JSON 備份，然後在另一台電腦的瀏覽器中匯入。

**Q: 最多能儲存多少資料？**
A: 取決於瀏覽器，通常 50-100 MB。可透過 `getStats()` 檢查。

---

## 📄 檔案清單

系統包含以下新增檔案：

| 檔案 | 大小 | 用途 |
|------|------|------|
| `pouchdb-config.js` | ~8 KB | PouchDB 核心配置 |
| `pouchdb-storage.js` | ~14 KB | CRUD 和查詢操作 |
| `user-auth.js` | ~9 KB | 用戶認證系統 |
| `pouchdb-integration.js` | ~11 KB | 整合層和初始化 |
| `pouchdb-app-compat.js` | ~10 KB | App.js 相容層 |

**CDN 庫（自動載入）：**
- PouchDB: `https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js`
- PouchDB Find: `https://cdn.jsdelivr.net/npm/pouchdb-find@8.0.1/dist/pouchdb.find.min.js`

---

## ✅ 最後檢查清單

在生產環境部署前，請確保：

- [ ] 所有 JS 檔案已正確引入 HTML
- [ ] PouchDB CDN 可訪問
- [ ] 測試用戶登入/登出流程
- [ ] 測試課堂記錄新增/編輯/刪除
- [ ] 測試資料匯出
- [ ] 檢查瀏覽器控制台是否有錯誤
- [ ] 測試不同瀏覽器的相容性
- [ ] 建立定期備份計劃
- [ ] 文檔已更新（如有更改）

---

**系統版本：** v3.0 (PouchDB Only)  
**最後更新：** 2025-01-21  
**作者：** RS 系統架構設計小組

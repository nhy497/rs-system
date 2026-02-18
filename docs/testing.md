# 🧪 測試指南

## 測試框架

本專案使用 **Vitest** 作為測試框架，提供快速、現代化的測試體驗。

## 執行測試

### 自動化測試

#### 單元測試

```bash
# 執行所有測試
npm test

# 監聽模式（自動重新執行）
npm test -- --watch

# 測試覆蓋率報告
npm run test:coverage

# 測試 UI 界面
npm run test:ui
```

#### 查看測試結果

測試執行後會顯示：
- ✅ 通過的測試數量
- ❌ 失敗的測試數量
- ⏱️ 執行時間
- 📊 覆蓋率報告（如果使用 `--coverage`）

### 手動測試

#### 啟動測試環境

```bash
# 啟動開發伺服器
npm run dev
```

#### 測試頁面列表

開啟瀏覽器訪問以下測試頁面：

1. **模組測試**
   - URL: `http://localhost:5173/tests/manual/test-modules.html`
   - 測試內容: ES 模組載入、工具函數、常數定義

2. **保存與刷新測試**
   - URL: `http://localhost:5173/tests/manual/test-save-refresh.html`
   - 測試內容: localStorage 儲存、頁面刷新後資料保持

3. **系統功能測試**
   - URL: `http://localhost:5173/tests/manual/system-test.html`
   - 測試內容: 完整系統功能測試套件
   - 測試帳號: `creator` / `1234`

#### 手動測試步驟

##### 1. 登入測試

1. 訪問 `http://localhost:5173/login.html`
2. 輸入測試帳號：
   - 用戶名: `creator`
   - 密碼: `1234`
3. 點擊「登入」
4. 驗證：
   - ✅ 成功重定向到主頁
   - ✅ 側邊欄顯示用戶名「creator」
   - ✅ 顯示角色標籤「👑 Creator」

##### 2. 資料庫測試

1. 在系統測試頁面，導航到「🗄️ 用戶資料庫測試」標籤
2. 點擊「初始化用戶資料庫」
3. 點擊「檢查資料庫結構」
4. 點擊「驗證資料庫命名」
5. 驗證：
   - ✅ 顯示「資料庫初始化成功」
   - ✅ 顯示「資料庫命名正確」
   - ✅ 資料庫測試統計更新

##### 3. Creator 功能測試

1. 在系統測試頁面，導航到「👤 Creator 界面測試」標籤
2. 點擊「以 Creator 身份登入」
3. 點擊「驗證 Creator 角色」
4. 點擊「測試 Creator 權限」
5. 點擊「測試 Creator 功能」
6. 點擊「測試管理功能」
7. 驗證：
   - ✅ 所有測試通過
   - ✅ 統計顯示 5+ 個通過的測試

##### 4. 課堂記錄測試

1. 登入系統（使用 creator 帳號）
2. 點擊「新增記錄」
3. 填寫課堂資訊：
   - 日期: 選擇今天
   - 班級: 輸入「測試班級」
   - 學生人數: 輸入 10
   - 技能: 選擇幾個技能
   - 備註: 輸入測試備註
4. 點擊「保存」
5. 驗證：
   - ✅ 顯示成功提示
   - ✅ 記錄出現在列表中
   - ✅ 資料正確顯示

##### 5. 資料持久化測試

1. 新增一筆課堂記錄
2. 重新載入頁面（F5）
3. 驗證：
   - ✅ 記錄仍然存在
   - ✅ 資料完整無誤

##### 6. CSV 匯出測試

1. 建立幾筆測試記錄
2. 點擊「匯出」按鈕
3. 驗證：
   - ✅ CSV 檔案成功下載
   - ✅ 檔案包含所有記錄
   - ✅ 資料格式正確

## 測試覆蓋率

### 查看覆蓋率報告

```bash
npm run test:coverage
```

報告會顯示：
- **Statements**: 語句覆蓋率
- **Branches**: 分支覆蓋率
- **Functions**: 函數覆蓋率
- **Lines**: 行覆蓋率

### 覆蓋率目標

| 類型 | 目標 | 當前 |
|------|------|------|
| Statements | > 80% | - |
| Branches | > 75% | - |
| Functions | > 80% | - |
| Lines | > 80% | - |

## 調試技巧

### 瀏覽器開發者工具

按 `F12` 打開開發者工具：

1. **Console**: 查看錯誤訊息和日誌
2. **Application** → **Local Storage**: 查看 localStorage 資料
3. **Application** → **IndexedDB**: 查看 IndexedDB 資料庫
4. **Network**: 監控網路請求

### 清除測試資料

```javascript
// 在瀏覽器控制台執行

// 清除所有 localStorage
localStorage.clear()

// 清除特定鍵值
localStorage.removeItem('users')
localStorage.removeItem('current-user')

// 查看所有資料庫
indexedDB.databases().then(dbs => console.log(dbs))

// 刪除特定資料庫
indexedDB.deleteDatabase('rs-system-user123')
```

### 查看測試資料

```javascript
// 查看用戶列表
console.log(JSON.parse(localStorage.getItem('users')))

// 查看當前用戶
console.log(JSON.parse(localStorage.getItem('current-user')))

// 查看會話資料
console.log(JSON.parse(localStorage.getItem('rs-system-session')))
```

## 故障排除

### 測試無法執行

**症狀**: `npm test` 失敗

**解決方案**:
1. 確保已安裝依賴: `npm install`
2. 檢查 Node.js 版本: `node --version` (需要 >= 18.0.0)
3. 清除並重新安裝: `rm -rf node_modules && npm install`

### 測試覆蓋率無法生成

**症狀**: 執行 `npm run test:coverage` 沒有報告

**解決方案**:
1. 確保 vitest 已正確安裝
2. 檢查 `vite.config.js` 中的測試配置
3. 清除快取後重試

### 手動測試頁面無法載入

**症狀**: 測試頁面顯示 404

**解決方案**:
1. 確保開發伺服器正在運行: `npm run dev`
2. 檢查路徑是否正確
3. 確認測試檔案存在於 `tests/manual/` 目錄

### IndexedDB 測試失敗

**症狀**: 資料庫初始化失敗

**解決方案**:
1. 檢查瀏覽器是否支援 IndexedDB
2. 確認瀏覽器沒有禁用 IndexedDB
3. 清除現有資料庫後重試

## 測試最佳實踐

### 1. 保持測試獨立

每個測試應該獨立執行，不依賴其他測試的結果。

### 2. 使用描述性名稱

```javascript
// 好的測試名稱
test('should save record to localStorage', () => {})

// 不好的測試名稱
test('test1', () => {})
```

### 3. 測試邊界情況

不只測試正常情況，也要測試：
- 空值輸入
- 極大/極小值
- 錯誤輸入
- 邊界條件

### 4. 及時清理

測試後清理建立的資料，避免影響其他測試。

## 持續整合

### GitHub Actions

專案使用 GitHub Actions 自動執行測試：

- 每次 Push 到 `main` 分支時執行
- 每次建立 Pull Request 時執行
- 測試失敗時會阻止合併

查看測試狀態：https://github.com/nhy497/rs-system/actions

## 下一步

- 閱讀 [development.md](./development.md) 了解開發流程
- 閱讀 [architecture.md](./architecture.md) 了解系統架構
- 查看 [測試文件原始碼](../tests/) 了解測試實現

---

**提示**: 在提交程式碼前，請確保所有測試都通過。

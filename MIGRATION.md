# RS-System 遷移指南

從 `system.js` 遷移到模組化架構（Phase 1-4）

**版本**: 3.0.0  
**更新日期**: 2026-02-17

---

## 📖 目錄

- [概述](#概述)
- [遷移策略](#遷移策略)
- [Phase 4 遷移步驟](#phase-4-遷移步驟)
- [新舊 API 對照表](#新舊-api-對照表)
- [常見問題](#常見問題)
- [分階段遷移建議](#分階段遷移建議)
- [最佳實踐](#最佳實踐)
- [向後相容性](#向後相容性)

---

## 概述

### 為什麼要遷移？

舊版 `system.js` 存在以下問題：

❌ **單一檔案過大** - 3400+ 行代碼難以維護  
❌ **缺乏模組化** - 所有功能混在一起  
❌ **全域污染** - 大量全域變數  
❌ **難以測試** - 無法單獨測試各模組  
❌ **難以擴展** - 添加新功能影響整個系統

新版模組化架構的優勢：

✅ **清晰的模組邊界** - 每個模組職責單一  
✅ **按需載入** - 只載入需要的功能  
✅ **易於測試** - 可以單獨測試每個模組  
✅ **易於維護** - 代碼組織清晰  
✅ **向後相容** - 提供舊版 API 橋接

### 模組化架構

```
src/
├── init/                 # Phase 4 - 初始化層
│   ├── app-init.js      # 主應用初始化
│   ├── login-page-init.js # 登入頁面初始化
│   └── config.js        # 配置管理
├── compat/              # Phase 4 - 向後相容層
│   └── legacy-bridge.js # 舊版 API 橋接
├── main.js              # Phase 4 - 主入口點
└── index.js             # Phase 4 - 瀏覽器入口點
```

**注意**: Phase 1-3 的模組（constants, utils, core, services, ui）尚待實現。

---

## 遷移策略

### 策略 1: 漸進式遷移（推薦）

保留 `system.js`，逐步遷移功能到新模組。

**優點**:
- 低風險
- 可以逐步驗證
- 不影響現有功能

**步驟**:
1. 引入新模組，但保留 `system.js`
2. 逐步將功能遷移到新模組
3. 使用向後相容層確保舊代碼仍可運作
4. 完全遷移後移除 `system.js`

### 策略 2: 完全重寫

直接使用新模組，移除 `system.js`。

**優點**:
- 清爽的新架構
- 無歷史包袱

**缺點**:
- 風險較高
- 需要大量測試
- 可能影響現有功能

---

## Phase 4 遷移步驟

### 步驟 1: 理解新架構

閱讀以下文檔：
- `src/init/app-init.js` - 應用初始化
- `src/init/login-page-init.js` - 登入頁面初始化
- `src/init/config.js` - 配置管理
- `src/main.js` - API 入口
- `src/index.js` - 自動初始化

### 步驟 2: 更新 HTML 引入方式

#### 舊版 (system.js)

```html
<!-- 舊版：直接引入 system.js -->
<script src="system.js"></script>
```

#### 新版 (模組化)

**選項 A: 使用自動初始化（推薦）**

```html
<!-- 新版：使用 index.js 自動初始化 -->
<script type="module" src="./src/index.js"></script>
```

**選項 B: 手動初始化**

```html
<!-- 新版：手動初始化 -->
<script type="module">
  import { initApp } from './src/main.js';
  
  document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
  });
</script>
```

### 步驟 3: 遷移初始化代碼

#### 舊版初始化

```javascript
// 舊版：在 system.js 中
document.addEventListener('DOMContentLoaded', () => {
  STORAGE_MANAGER.init();
  LOGIN_MANAGER.init();
  UI_MANAGER.init();
  
  // ... 其他初始化代碼
});
```

#### 新版初始化

```javascript
// 新版：使用 AppInit
import { AppInit } from './src/init/app-init.js';

await AppInit.init({
  onProgress: (step, progress) => {
    console.log(`${step}: ${progress}%`);
  }
});
```

### 步驟 4: 遷移配置

#### 舊版配置

```javascript
// 舊版：硬編碼在 system.js 中
const STORAGE_KEY = 'rope-skip-checkpoints';
const CLASS_PRESETS_KEY = 'rope-skip-class-presets';
const DEBUG = false;
```

#### 新版配置

```javascript
// 新版：使用 config.js
import { APP_CONFIG, getConfig } from './src/init/config.js';

console.log(APP_CONFIG.STORAGE_KEYS.CHECKPOINTS);
console.log(APP_CONFIG.DEBUG);

// 獲取環境特定配置
const devConfig = getConfig('development');
```

### 步驟 5: 使用向後相容層（過渡期）

如果需要在過渡期保持舊代碼運作：

```javascript
// 設置向後相容全域物件
import { setupLegacyGlobals } from './src/compat/legacy-bridge.js';

setupLegacyGlobals();

// 現在可以使用舊版 API（會顯示棄用警告）
window.STORAGE_MANAGER.init();
window.LOGIN_MANAGER.login(username, password);
```

---

## 新舊 API 對照表

### 初始化 API

| 舊版 API | 新版 API | 說明 |
|---------|---------|------|
| `STORAGE_MANAGER.init()` | `AppInit.initStorage()` | 初始化儲存 |
| `LOGIN_MANAGER.init()` | `AppInit.initAuth()` | 初始化認證 |
| `UI_MANAGER.init()` | `AppInit.initUI()` | 初始化 UI |
| 手動依序呼叫 | `AppInit.init()` | 自動執行所有初始化 |

### 登入頁面 API

| 舊版 API | 新版 API | 說明 |
|---------|---------|------|
| `initLoginPage()` (全域) | `LoginPageInit.init()` | 初始化登入頁面 |
| `showError(msg)` (全域) | `LoginPageInit.showLoginError(msg)` | 顯示錯誤訊息 |
| `clearForm()` (全域) | `LoginPageInit.clearLoginForm()` | 清空表單 |

### 配置 API

| 舊版 API | 新版 API | 說明 |
|---------|---------|------|
| `STORAGE_KEY` (常數) | `APP_CONFIG.STORAGE_KEYS.CHECKPOINTS` | 儲存鍵值 |
| `DEBUG` (全域變數) | `APP_CONFIG.DEBUG` | Debug 模式 |
| 無 | `getConfig(env)` | 獲取環境配置 |

### 全域物件

| 舊版 API | 新版 API | 說明 |
|---------|---------|------|
| `window.STORAGE_MANAGER` | `import { STORAGE_MANAGER }` | ES 模組匯入 |
| `window.LOGIN_MANAGER` | `import { LOGIN_MANAGER }` | ES 模組匯入 |
| `window.UI_MANAGER` | `import { UI_MANAGER }` | ES 模組匯入 |
| `window.$` | `import { $ }` | DOM 工具 |

---

## 常見問題

### Q1: 遷移會影響現有功能嗎？

**A**: 不會。Phase 4 的模組是**新增**的，不會修改 `system.js`。您可以同時使用新舊 API。

### Q2: 必須一次性遷移所有代碼嗎？

**A**: 不需要。推薦使用**漸進式遷移**策略，逐步遷移功能。

### Q3: 舊版 API 還能用嗎？

**A**: 可以。`legacy-bridge.js` 提供向後相容支援，但會顯示棄用警告。

### Q4: 如何處理棄用警告？

**A**: 棄用警告提醒您遷移到新 API。您可以：
1. 立即遷移到新 API
2. 暫時忽略（功能仍可正常運作）
3. 使用 `clearDeprecationWarnings()` 清除警告記錄

### Q5: Phase 1-3 的模組在哪裡？

**A**: Phase 1-3 的模組尚未實現。目前 Phase 4 的模組已經準備好了相應的導入語句，待 Phase 1-3 完成後即可使用。

### Q6: 如何在 HTML 中使用新模組？

**A**: 使用 ES 模組語法：

```html
<script type="module" src="./src/index.js"></script>
```

或手動匯入：

```html
<script type="module">
  import { initApp } from './src/main.js';
  await initApp();
</script>
```

### Q7: 自動初始化如何工作？

**A**: `src/index.js` 會在 DOMContentLoaded 時自動偵測頁面類型並執行對應初始化。

### Q8: 可以自訂初始化流程嗎？

**A**: 可以。使用 `AppInit` 的各個方法自訂初始化順序和選項。

---

## 分階段遷移建議

### 第 1 階段：引入新模組（1-2 天）

**目標**: 讓新舊系統共存

1. 在 HTML 中引入 `src/index.js`
2. 保留 `system.js` 引入
3. 驗證兩個系統都能正常運作

```html
<!-- 同時引入新舊模組 -->
<script src="system.js"></script>
<script type="module" src="./src/index.js"></script>
```

### 第 2 階段：遷移配置（1 天）

**目標**: 使用新的配置管理

1. 將硬編碼配置遷移到 `APP_CONFIG`
2. 使用 `getConfig()` 獲取配置
3. 測試配置正確性

### 第 3 階段：遷移初始化（2-3 天）

**目標**: 使用新的初始化流程

1. 將初始化代碼遷移到 `AppInit`
2. 移除 `system.js` 中的初始化代碼
3. 測試初始化流程

### 第 4 階段：完全切換（1-2 天）

**目標**: 完全使用新模組

1. 移除 `system.js` 引入
2. 移除向後相容層
3. 全面測試
4. 上線部署

---

## 最佳實踐

### ✅ DO: 應該做的

1. **使用自動初始化**
   ```html
   <script type="module" src="./src/index.js"></script>
   ```

2. **按需匯入模組**
   ```javascript
   import { AppInit } from './src/init/app-init.js';
   import { APP_CONFIG } from './src/init/config.js';
   ```

3. **使用配置管理**
   ```javascript
   const config = getConfig('development');
   ```

4. **監聽初始化事件**
   ```javascript
   AppInit.onReady(() => {
     console.log('應用已就緒');
   });
   ```

5. **錯誤處理**
   ```javascript
   try {
     await AppInit.init();
   } catch (error) {
     console.error('初始化失敗:', error);
   }
   ```

### ❌ DON'T: 不應該做的

1. **不要混用新舊初始化**
   ```javascript
   // ❌ 不要這樣做
   STORAGE_MANAGER.init();  // 舊版
   await AppInit.init();     // 新版
   ```

2. **不要依賴全域變數**
   ```javascript
   // ❌ 不要這樣做
   window.STORAGE_MANAGER.init();
   
   // ✅ 應該這樣做
   import { STORAGE_MANAGER } from './src/core/storage-manager.js';
   STORAGE_MANAGER.init();
   ```

3. **不要在生產環境使用向後相容層**
   ```javascript
   // ❌ 僅用於過渡期
   setupLegacyGlobals();
   ```

4. **不要忽略錯誤**
   ```javascript
   // ❌ 不要這樣做
   AppInit.init(); // 沒有 await，沒有錯誤處理
   
   // ✅ 應該這樣做
   try {
     await AppInit.init();
   } catch (error) {
     handleError(error);
   }
   ```

---

## 向後相容性

### 相容性保證

Phase 4 提供以下向後相容保證：

✅ **零破壞性變更** - `system.js` 不會被修改  
✅ **全域物件橋接** - 舊版全域變數仍可使用  
✅ **函式轉接** - 舊版函式自動轉接到新版  
✅ **棄用警告** - 提醒遷移到新 API

### 使用向後相容層

```javascript
// 1. 引入向後相容層
import { setupLegacyGlobals, legacyAPI } from './src/compat/legacy-bridge.js';

// 2. 設置全域物件
setupLegacyGlobals();

// 3. 使用舊版 API（會顯示棄用警告）
window.STORAGE_MANAGER.init();
legacyAPI.saveRecords(records);

// 4. 檢查遷移狀態
import { getMigrationStatus } from './src/compat/legacy-bridge.js';
const status = getMigrationStatus();
console.log('遷移狀態:', status);
```

### 棄用時間表

| 版本 | 狀態 | 說明 |
|-----|------|------|
| v3.0.0 | ✅ 新增 | Phase 4 模組發布 |
| v3.1.0 | ⚠️ 棄用 | 舊版 API 標記為棄用 |
| v3.2.0 | ⚠️ 警告 | 加強棄用警告 |
| v4.0.0 | ❌ 移除 | 移除舊版 API 和向後相容層 |

---

## 需要幫助？

- 📖 查看範例：`src/examples/phase4-usage.js`
- 📝 查看文檔：`src/README.md`
- 🐛 回報問題：GitHub Issues
- 💬 討論：GitHub Discussions

---

**版本**: 3.0.0  
**最後更新**: 2026-02-17  
**維護者**: RS-System Team

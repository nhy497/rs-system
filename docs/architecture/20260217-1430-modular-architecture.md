# 模組化架構設計

## 設計目標

- 從 3,432 行單體檔案重構為 28 個 ES 模組
- 單一職責原則 (SRP) - 每個模組負責特定功能
- 可測試性、可維護性 - 模組化便於單元測試
- 向後兼容（保留 system.js）- 零風險遷移
- 支援三種使用模式 - 自動初始化、選擇性導入、完整導入

---

## 模組分層架構

```
┌─────────────────────────────────────────┐
│  Entry Points (main.js / index.js)      │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Phase 4: Initialization Layer          │
│  app-init, login-page-init, config,     │
│  legacy-bridge                           │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Phase 3: UI Management Layer           │
│  ui-manager, form-manager,              │
│  list-renderer, modal-manager, etc.     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Phase 2: Core Services Layer           │
│  storage-manager, login-manager,        │
│  RecordsService, ClassesService, etc.   │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Phase 1: Utilities Layer               │
│  dom-utils, helpers, formatters,        │
│  validators, app-constants              │
└─────────────────────────────────────────┘
```

---

## 28 模組清單

### Phase 1: 工具層 (5 模組)

| 模組名稱 | 路徑 | 行數 | 主要 API | 依賴 |
|---------|------|------|---------|------|
| dom-utils | src/utils/dom-utils.js | ~30 | $, $q, $qa | 無 |
| helpers | src/utils/helpers.js | ~120 | escapeHtml, toast, todayStr | dom-utils |
| formatters | src/utils/formatters.js | ~80 | formatFileSize, timeToMinutes, minutesToTime | 無 |
| validators | src/utils/validators.js | ~50 | isRequired, isValidDate, isValidTime | 無 |
| app-constants | src/constants/app-constants.js | ~25 | STORAGE_KEY, RANGE_IDS | 無 |

### Phase 2: 核心服務層 (8 模組)

| 模組名稱 | 路徑 | 行數 | 主要 API | 依賴 |
|---------|------|------|---------|------|
| storage-manager | src/core/storage-manager.js | ~400 | STORAGE_MANAGER (init, getCheckpoints, saveCheckpoints) | app-constants |
| login-manager | src/core/login-manager.js | ~300 | LOGIN_MANAGER (login, logout, isLoggedIn) | auth-config |
| auth-config | src/core/auth-config.js | ~150 | loadUsersFromStorage, hashPasswordCompat | 無 |
| records-service | src/services/records-service.js | ~350 | RecordsService (getAllRecords, createRecord) | formatters, app-constants |
| presets-service | src/services/presets-service.js | ~120 | PresetsService (getAllPresets, savePresets) | 無 |
| users-service | src/services/users-service.js | ~100 | UsersService (getAllUsers, createUser) | 無 |
| storage-service | src/services/storage-service.js | ~200 | StorageService (基礎儲存操作) | 無 |
| validation-service | src/services/validation-service.js | ~80 | ValidationService (驗證規則) | validators |

### Phase 3: UI 管理層 (7 模組)

| 模組名稱 | 路徑 | 行數 | 主要 API | 依賴 |
|---------|------|------|---------|------|
| ui-manager | src/ui/ui-manager.js | ~300 | UI_MANAGER (showView, hideView, init) | dom-utils |
| form-manager | src/ui/form-manager.js | ~550 | FormManager (getFormData, validateForm) | dom-utils, helpers |
| list-renderer | src/ui/list-renderer.js | ~200 | ListRenderer (renderList, updateList) | dom-utils, helpers |
| modal-manager | src/ui/modal-manager.js | ~180 | ModalManager (showModal, hideModal) | dom-utils |
| tricks-manager | src/ui/tricks-manager.js | ~250 | TricksManager (管理花式數據) | dom-utils |
| attachments-manager | src/ui/attachments-manager.js | ~200 | AttachmentsManager (附件管理) | formatters |
| event-handlers | src/ui/event-handlers.js | ~400 | EventHandlers (事件處理) | 所有 UI 模組 |

### Phase 4: 初始化層 (6 模組)

| 模組名稱 | 路徑 | 行數 | 主要 API | 依賴 |
|---------|------|------|---------|------|
| app-init | src/init/app-init.js | ~400 | AppInit (init, preInit) | 所有 Phase 1-3 模組 |
| login-page-init | src/init/login-page-init.js | ~150 | LoginPageInit (init) | login-manager |
| config | src/init/config.js | ~120 | APP_CONFIG, getConfig | 無 |
| legacy-bridge | src/compat/legacy-bridge.js | ~80 | 向後兼容層 | 所有模組 |
| main | src/main.js | ~150 | 統一導出所有模組 | 所有模組 |
| index | src/index.js | ~180 | 自動初始化入口 | app-init, login-page-init |

### Components (2 模組)

| 模組名稱 | 路徑 | 行數 | 主要 API | 依賴 |
|---------|------|------|---------|------|
| Modal | src/components/Modal.js | ~100 | Modal 組件類別 | 無 |
| Toast | src/components/Toast.js | ~80 | Toast 組件類別 | 無 |

---

## 三種使用模式

### 模式 1: 自動初始化 (推薦)

最簡單的使用方式，適合大多數情況：

```html
<!-- HTML 中引入 -->
<script type="module" src="./src/index.js"></script>
```

自動執行：
- 偵測頁面類型（登入頁 / 主應用）
- 執行對應的初始化流程
- 設置事件處理器
- 載入初始資料

### 模式 2: 選擇性導入

按需導入特定模組，適合進階使用：

```javascript
import { STORAGE_MANAGER, RecordsService, UI_MANAGER } from './src/main.js';

// 使用儲存管理器
STORAGE_MANAGER.setItem('key', 'value');

// 使用記錄服務
const records = await RecordsService.getAllRecords();

// 使用 UI 管理器
UI_MANAGER.toast('操作成功', 'success');
```

優點：
- 僅載入需要的模組
- 支援 Tree Shaking
- 自訂初始化順序
- 更細緻的控制

### 模式 3: 完整導入

導入所有模組，適合測試或腳本使用：

```javascript
import * as RS from './src/main.js';

// 初始化應用
await RS.AppInit.init();

// 顯示特定視圖
RS.UI_MANAGER.showView('dashboard');

// 取得記錄
const records = await RS.RecordsService.getAllRecords();
```

---

## 向後兼容策略

### legacy-bridge.js 機制

1. **自動偵測**: 檢測是否有舊版 `system.js` 使用
2. **全域掛載**: 將模組 API 自動掛載到 `window` 物件
3. **控制台警告**: 提示開發者遷移到新架構
4. **平滑遷移**: 舊代碼無需修改即可運行

```javascript
// legacy-bridge.js 範例
if (typeof window !== 'undefined') {
  // 掛載所有模組到 window
  window.STORAGE_MANAGER = STORAGE_MANAGER;
  window.LOGIN_MANAGER = LOGIN_MANAGER;
  window.RecordsService = RecordsService;
  // ... 其他模組
  
  // 顯示遷移提示
  console.warn('⚠️ 使用舊版全域 API，建議遷移到 ES 模組');
}
```

### 遷移步驟

1. **Phase 0**: 保持使用 `system.js`（當前）
2. **Phase 1**: 在新頁面使用 `index.js` 自動初始化
3. **Phase 2**: 逐步將舊頁面遷移到模組化
4. **Phase 3**: 完全移除 `system.js`（可選）

---

## 依賴關係圖

```
Phase 1 (工具層 - 無依賴)
  ├── dom-utils
  ├── helpers (依賴 dom-utils)
  ├── formatters
  ├── validators
  └── app-constants

Phase 2 (核心服務層)
  ├── storage-manager (依賴 app-constants)
  ├── login-manager (依賴 auth-config)
  ├── auth-config
  ├── records-service (依賴 formatters, app-constants)
  ├── presets-service
  ├── users-service
  ├── storage-service
  └── validation-service (依賴 validators)

Phase 3 (UI 管理層)
  ├── ui-manager (依賴 dom-utils)
  ├── form-manager (依賴 dom-utils, helpers)
  ├── list-renderer (依賴 dom-utils, helpers)
  ├── modal-manager (依賴 dom-utils)
  ├── tricks-manager (依賴 dom-utils)
  ├── attachments-manager (依賴 formatters)
  └── event-handlers (依賴所有 UI 模組)

Phase 4 (初始化層)
  ├── app-init (依賴所有 Phase 1-3)
  ├── login-page-init (依賴 login-manager)
  ├── config
  ├── legacy-bridge (依賴所有模組)
  ├── main (統一匯出)
  └── index (自動初始化入口)
```

---

## 模組化原則

### 1. 單一職責 (Single Responsibility)
- 每個模組只負責一項功能
- 易於理解和維護

### 2. 依賴注入 (Dependency Injection)
- 模組之間通過導入建立依賴
- 避免循環依賴

### 3. 介面優先 (Interface First)
- 清晰的 API 定義
- JSDoc 型別標註

### 4. 測試友好 (Testable)
- 模組可獨立測試
- 使用 Vitest 單元測試框架

### 5. 向後兼容 (Backward Compatible)
- 保留舊版 API
- 提供遷移路徑

---

## 效能優化

### 1. 按需載入
- ES 模組支援 Tree Shaking
- 未使用的模組不會被打包

### 2. 記憶體快取
- `STORAGE_MANAGER.setCache()` 減少 localStorage 讀取
- 5 分鐘快取有效期

### 3. 延遲初始化
- 模組僅在需要時載入
- `AppInit` 支援跳過特定初始化步驟

### 4. 跨標籤頁同步
- 使用 BroadcastChannel API
- 自動同步 localStorage 更新

---

## 開發體驗

### 1. 型別安全
- JSDoc 註解提供型別提示
- VSCode / WebStorm 自動完成

### 2. 除錯友好
- 獨立模組便於定位問題
- 清晰的錯誤訊息

### 3. 測試友好
- 40 個單元測試覆蓋核心模組
- 整合測試驗證初始化流程

### 4. 文檔完整
- 每個模組有 JSDoc 註解
- API 參考文檔（見 `docs/api/`）
- 架構設計文檔（本檔案）

---

## 風險與回退

### 風險評估

1. **模組載入順序** - 已透過分層架構和依賴注入解決
2. **循環依賴** - 已透過依賴圖檢查避免
3. **向後兼容** - 已透過 legacy-bridge 保證

### 回退策略

1. **立即回退**: 若新架構有問題，移除 `<script type="module">` 標籤即可
2. **並存運行**: 兩套系統可同時存在，零風險
3. **逐步測試**: 先在測試環境驗證，再部署生產

---

## 未來規劃

### 短期 (1-2 個月)
- [ ] 完善單元測試覆蓋率 (目標 >80%)
- [ ] 新增端對端測試
- [ ] 效能基準測試

### 中期 (3-6 個月)
- [ ] 移除 system.js（完全遷移）
- [ ] 實作更多 UI 組件
- [ ] 支援 PWA 功能

### 長期 (6-12 個月)
- [ ] 升級到 TypeScript
- [ ] 實作後端 API 整合
- [ ] 多語言支援

---

## 總結

本次模組化重構成功將 3,432 行單體檔案拆分為 28 個職責清晰的 ES 模組，達成以下目標：

✅ **可維護性**: 模組化架構易於理解和修改  
✅ **可測試性**: 40 個單元測試覆蓋核心功能  
✅ **向後兼容**: 零風險遷移，舊代碼無需修改  
✅ **效能優化**: 按需載入、記憶體快取、Tree Shaking  
✅ **開發體驗**: 型別提示、清晰錯誤、完整文檔

這為系統的長期發展奠定了堅實的基礎。

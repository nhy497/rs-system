# RS-System 源碼文檔

**版本**: 3.0.0  
**更新日期**: 2026-02-17

這是 RS-System 模組化架構的源碼目錄文檔。

---

## 📂 目錄結構

```
src/
├── init/                    # Phase 4 - 初始化層
│   ├── app-init.js         # 主應用初始化邏輯
│   ├── login-page-init.js  # 登入頁面初始化
│   └── config.js           # 應用程式配置管理
│
├── compat/                  # Phase 4 - 向後相容層
│   └── legacy-bridge.js    # 舊版 API 橋接與棄用警告
│
├── examples/                # 使用範例
│   └── phase4-usage.js     # Phase 4 完整使用範例
│
├── components/              # UI 組件（既有）
│   ├── Modal.js            # 模態框組件
│   └── Toast.js            # 提示訊息組件
│
├── main.js                  # Phase 4 - 主入口點（ES 模組匯出）
└── index.js                 # Phase 4 - 瀏覽器入口點（自動初始化）
```

### 待實現的模組（Phase 1-3）

以下模組尚待實現，但已在 Phase 4 模組中預留好導入語句：

```
src/
├── constants/               # Phase 1 - 待實現
│   └── app-constants.js    # 應用常數定義
│
├── utils/                   # Phase 1 - 待實現
│   ├── dom-utils.js        # DOM 操作工具
│   ├── helpers.js          # 輔助函式
│   ├── formatters.js       # 格式化工具
│   └── validators.js       # 驗證工具
│
├── core/                    # Phase 2 - 待實現
│   ├── storage-manager.js  # 儲存管理器
│   ├── login-manager.js    # 登入管理器
│   └── auth-config.js      # 認證配置
│
├── services/                # Phase 2 - 待實現
│   ├── storage-service.js  # PouchDB 儲存服務
│   ├── records-service.js  # 記錄管理服務
│   ├── presets-service.js  # 預設值服務
│   ├── users-service.js    # 用戶管理服務
│   └── validation-service.js # 驗證服務
│
└── ui/                      # Phase 3 - 待實現
    ├── ui-manager.js       # UI 管理器
    ├── form-manager.js     # 表單管理器
    ├── list-renderer.js    # 列表渲染器
    ├── modal-manager.js    # 模態框管理器
    ├── tricks-manager.js   # 動作管理器
    ├── attachments-manager.js # 附件管理器
    └── event-handlers.js   # 事件處理器
```

---

## 🎯 Phase 4: 初始化與入口點模組化

Phase 4 專注於應用程式的初始化流程和入口點整合。

### 核心功能

#### 1. **初始化層** (`src/init/`)

**app-init.js** - 主應用初始化
- 協調所有模組的初始化順序
- 提供初始化狀態管理
- 處理初始化錯誤
- 支援進度回調
- 提供生命週期鉤子

**login-page-init.js** - 登入頁面初始化
- 登入表單處理
- 註冊表單處理
- 自動登入檢查
- 表單驗證
- UI 狀態管理

**config.js** - 配置管理
- 集中管理所有配置
- 環境特定配置
- 功能開關
- 配置驗證
- Debug 資訊輸出

#### 2. **入口點** (`src/`)

**main.js** - 主入口點
- 統一匯出所有模組
- 提供便捷的 API 存取
- 版本資訊管理
- 快速啟動函式

**index.js** - 瀏覽器入口點
- 自動偵測頁面類型
- 自動執行初始化
- 全域物件掛載（向後相容）
- 錯誤處理與日誌

#### 3. **向後相容層** (`src/compat/`)

**legacy-bridge.js** - 舊版 API 橋接
- 全域變數橋接
- 函式轉接
- 棄用警告系統
- 資料遷移支援

---

## 📖 使用指南

### 快速開始

#### 方式 1: 自動初始化（推薦）

在 HTML 中引入 `index.js`，自動偵測頁面並初始化：

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <title>RS-System</title>
</head>
<body class="main-app">
  <div id="app-container">
    <!-- 應用內容 -->
  </div>
  
  <!-- 自動初始化 -->
  <script type="module" src="./src/index.js"></script>
</body>
</html>
```

#### 方式 2: 手動初始化

使用 `main.js` 手動控制初始化流程：

```html
<script type="module">
  import { initApp } from './src/main.js';
  
  document.addEventListener('DOMContentLoaded', async () => {
    const success = await initApp({
      env: 'production',
      onProgress: (step, progress) => {
        console.log(`${step}: ${progress}%`);
      }
    });
    
    if (success) {
      console.log('✅ 應用初始化完成');
    }
  });
</script>
```

### API 文檔

#### AppInit API

```javascript
import { AppInit } from './src/init/app-init.js';

// 主初始化方法
await AppInit.init(options);

// 分步初始化
await AppInit.preInit();
await AppInit.initStorage();
await AppInit.initAuth();
await AppInit.initUI();
await AppInit.initServices();
await AppInit.initEventHandlers();
await AppInit.loadInitialData();
await AppInit.postInit();

// 狀態管理
const state = AppInit.getAppState();
AppInit.setAppState({ key: 'value' });

// 生命週期鉤子
AppInit.onReady(() => {
  console.log('應用已就緒');
});

AppInit.onBeforeUnload(() => {
  console.log('保存資料...');
});
```

#### LoginPageInit API

```javascript
import { LoginPageInit } from './src/init/login-page-init.js';

// 初始化登入頁面
LoginPageInit.init();

// UI 控制
LoginPageInit.showLoginError('錯誤訊息');
LoginPageInit.showLoginSuccess('成功訊息');
LoginPageInit.clearLoginForm();

// 導航
LoginPageInit.redirectToApp();
LoginPageInit.redirectToLogin();

// 驗證
const isValid = LoginPageInit.validateLoginForm(username, password);
```

#### 配置 API

```javascript
import { APP_CONFIG, getConfig, printConfig } from './src/init/config.js';

// 使用預設配置
console.log(APP_CONFIG.APP_NAME);
console.log(APP_CONFIG.APP_VERSION);
console.log(APP_CONFIG.FEATURES);

// 獲取環境特定配置
const devConfig = getConfig('development');
const prodConfig = getConfig('production');

// 從 URL 參數讀取配置
// URL: ?env=development&debug=true
const config = getConfigFromEnv();

// 顯示配置（僅 Debug 模式）
printConfig();
```

#### 快速啟動 API

```javascript
import { initApp, initLoginPage } from './src/main.js';

// 初始化主應用
await initApp({
  env: 'production',
  onProgress: (step, progress) => {
    console.log(`${step}: ${progress}%`);
  }
});

// 初始化登入頁面
initLoginPage();
```

---

## 🔄 依賴關係圖

```
index.js (瀏覽器入口點)
  └─> main.js (主入口點)
        ├─> init/app-init.js
        │     ├─> init/config.js
        │     └─> (待實現) core/*, services/*, ui/*
        │
        ├─> init/login-page-init.js
        │     ├─> init/config.js (間接)
        │     └─> (待實現) core/login-manager.js
        │
        └─> init/config.js

compat/legacy-bridge.js (獨立模組)
  └─> (待實現) core/*, services/*, ui/*
```

### 循環依賴檢查

✅ **無循環依賴** - 所有模組都是單向依賴

---

## 🎨 設計原則

### 1. 單一職責原則

每個模組只負責一個特定功能：
- `app-init.js`: 應用初始化
- `login-page-init.js`: 登入頁面
- `config.js`: 配置管理

### 2. 依賴倒置原則

高層模組不依賴低層模組，都依賴抽象：
- 使用配置物件而非硬編碼
- 使用回調函式而非直接調用

### 3. 開閉原則

對擴展開放，對修改封閉：
- 透過配置擴展功能
- 透過選項自訂行為

### 4. 接口隔離原則

不強迫使用不需要的接口：
- 提供多種初始化方式
- 支援跳過特定初始化步驟

---

## 🧪 測試

### 單元測試

```javascript
import { describe, it, expect } from 'vitest';
import { APP_CONFIG, getConfig } from './init/config.js';

describe('Config', () => {
  it('should have valid app name', () => {
    expect(APP_CONFIG.APP_NAME).toBe('RS-System');
  });
  
  it('should return development config', () => {
    const config = getConfig('development');
    expect(config.DEBUG).toBe(true);
  });
});
```

### 整合測試

```javascript
import { AppInit } from './init/app-init.js';

describe('AppInit', () => {
  it('should initialize successfully', async () => {
    const success = await AppInit.init({ env: 'test' });
    expect(success).toBe(true);
  });
});
```

---

## 📝 遷移指南

從 `system.js` 遷移到模組化架構，請參閱：

- **完整遷移指南**: `/MIGRATION.md`
- **使用範例**: `src/examples/phase4-usage.js`
- **API 對照表**: 見 MIGRATION.md

### 遷移步驟摘要

1. **引入新模組**: 在 HTML 中引入 `src/index.js`
2. **保留舊代碼**: 暫時保留 `system.js`
3. **逐步遷移**: 逐個功能遷移到新 API
4. **測試驗證**: 確保功能正常
5. **移除舊代碼**: 完成遷移後移除 `system.js`

---

## 🚀 最佳實踐

### ✅ 推薦做法

1. **使用自動初始化**
   ```html
   <script type="module" src="./src/index.js"></script>
   ```

2. **按需匯入模組**
   ```javascript
   import { AppInit } from './src/init/app-init.js';
   ```

3. **使用配置管理**
   ```javascript
   const config = getConfig('development');
   ```

4. **監聽初始化事件**
   ```javascript
   AppInit.onReady(() => { /* ... */ });
   ```

5. **錯誤處理**
   ```javascript
   try {
     await AppInit.init();
   } catch (error) {
     handleError(error);
   }
   ```

### ❌ 避免做法

1. **不要混用新舊初始化**
2. **不要依賴全域變數**
3. **不要在生產環境使用向後相容層**
4. **不要忽略錯誤處理**

---

## 📚 相關資源

- **主文檔**: `/README.md`
- **遷移指南**: `/MIGRATION.md`
- **變更日誌**: `/docs/changelog/CHANGELOG.md`
- **開發指南**: `/docs/development/DEVELOPER_GUIDE.md`
- **使用範例**: `src/examples/phase4-usage.js`

---

## 🔮 未來計劃

### Phase 1: 工具與常數模組（待實現）

- [ ] `src/constants/app-constants.js`
- [ ] `src/utils/dom-utils.js`
- [ ] `src/utils/helpers.js`
- [ ] `src/utils/formatters.js`
- [ ] `src/utils/validators.js`

### Phase 2: 核心與服務模組（待實現）

- [ ] `src/core/storage-manager.js`
- [ ] `src/core/login-manager.js`
- [ ] `src/services/records-service.js`
- [ ] `src/services/storage-service.js`

### Phase 3: UI 模組（待實現）

- [ ] `src/ui/ui-manager.js`
- [ ] `src/ui/form-manager.js`
- [ ] `src/ui/event-handlers.js`

### Phase 5: 完整整合與測試（待進行）

- [ ] 整合所有模組
- [ ] 完整測試覆蓋
- [ ] 性能優化
- [ ] 文檔完善

---

## 🤝 貢獻

如果您想貢獻代碼或回報問題：

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

---

**版本**: 3.0.0  
**最後更新**: 2026-02-17  
**維護者**: RS-System Team

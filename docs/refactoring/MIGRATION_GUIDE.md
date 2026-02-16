# System.js 模組化遷移指南

## 📋 文檔概覽

本文檔提供將現有代碼從單體 `system.js` 遷移到模組化架構的詳細指導。

**文檔版本**: v1.0  
**創建日期**: 2026-02-16  
**目標讀者**: 開發人員

---

## 目錄

1. [遷移概述](#1-遷移概述)
2. [導入模組的方式](#2-導入模組的方式)
3. [替換全局變數](#3-替換全局變數)
4. [處理循環依賴](#4-處理循環依賴)
5. [兼容性注意事項](#5-兼容性注意事項)
6. [漸進式遷移策略](#6-漸進式遷移策略)
7. [測試策略](#7-測試策略)
8. [常見問題](#8-常見問題)

---

## 1. 遷移概述

### 1.1 遷移目標

從單體架構遷移到模組化架構，主要目標是：

1. **提高代碼可維護性**: 將大文件拆分為小模組
2. **增強可測試性**: 每個模組可獨立測試
3. **改善代碼組織**: 清晰的目錄結構和職責劃分
4. **保持向後兼容**: 確保現有功能不受影響

### 1.2 遷移原則

**核心原則**:
- ✅ **漸進式遷移**: 逐步替換，不是一次性重寫
- ✅ **向後兼容**: 保留舊接口，直到完全遷移完成
- ✅ **測試驅動**: 每個遷移步驟都有測試驗證
- ✅ **文檔同步**: 遷移過程中更新文檔

### 1.3 遷移時間線

| 階段 | 內容 | 時間 | 風險 |
|------|------|------|------|
| 階段 0 | 架構設計文檔 | 1-2 天 | ⚡ 無風險 |
| 階段 1 | 提取核心服務 | 3-5 天 | ⚡ 低風險 |
| 階段 2 | 提取工具函數 | 2-3 天 | ⚡ 低風險 |
| 階段 3 | 提取數據服務 | 4-6 天 | ⚠️ 中風險 |
| 階段 4 | 提取 UI 管理 | 5-8 天 | ⚠️⚠️ 中高風險 |
| 階段 5 | 重組初始化邏輯 | 6-10 天 | 🔥 高風險 |
| 階段 6 | 整合與測試 | 5-7 天 | 🎯 關鍵階段 |

---

## 2. 導入模組的方式

### 2.1 ES Module 導入

**基本語法**:

```javascript
// 導入整個模組
import { STORAGE_MANAGER } from './core/storage-manager.js';

// 導入多個導出
import { 
  LOGIN_MANAGER, 
  getCurrentUser, 
  isCreator 
} from './core/login-manager.js';

// 導入所有導出
import * as StorageModule from './core/storage-manager.js';

// 導入默認導出
import StorageService from './core/storage-service.js';

// 混合導入
import StorageService, { createStorageService } from './core/storage-service.js';
```

### 2.2 舊版全局變數 vs 新版導入

#### 舊版 (system.js):

```javascript
// 直接使用全局變數
const data = STORAGE_MANAGER.getItem('myKey');
const user = LOGIN_MANAGER.getCurrentUser();
const element = $('myButton');
```

#### 新版 (模組化):

```javascript
// 導入後使用
import { STORAGE_MANAGER } from '@/core/storage-manager.js';
import { LOGIN_MANAGER } from '@/core/login-manager.js';
import { $ } from '@/utils/dom-utils.js';

const data = STORAGE_MANAGER.getItem('myKey');
const user = LOGIN_MANAGER.getCurrentUser();
const element = $('myButton');
```

### 2.3 路徑別名配置

為了簡化導入路徑，配置 Vite 路徑別名：

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@services': path.resolve(__dirname, './src/services'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@init': path.resolve(__dirname, './src/init')
    }
  }
});
```

使用別名:

```javascript
// 使用別名
import { STORAGE_MANAGER } from '@core/storage-manager.js';
import { RecordsService } from '@services/records-service.js';
import { $ } from '@utils/dom-utils.js';

// 相對路徑（不推薦用於跨目錄導入）
import { STORAGE_MANAGER } from '../../core/storage-manager.js';
```

---

## 3. 替換全局變數為模組導出

### 3.1 DOM 選擇器

#### 舊版:

```javascript
// system.js 中定義
let $ = (id) => document.getElementById(id);
let $q = (sel) => document.querySelector(sel);
let $qa = (sel) => document.querySelectorAll(sel);

// 在任何地方直接使用
const btn = $('myButton');
const form = $q('.my-form');
```

#### 新版:

```javascript
// src/utils/dom-utils.js
export const $ = (id) => document.getElementById(id);
export const $q = (sel) => document.querySelector(sel);
export const $qa = (sel) => document.querySelectorAll(sel);

// 使用時導入
import { $, $q, $qa } from '@utils/dom-utils.js';

const btn = $('myButton');
const form = $q('.my-form');
```

### 3.2 工具函數

#### 舊版:

```javascript
// system.js 中定義
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toast(message, type = 'info') {
  // ...
}

// 直接使用
const safe = escapeHtml(userInput);
toast('保存成功', 'success');
```

#### 新版:

```javascript
// src/utils/helpers.js
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function toast(message, type = 'info') {
  // ...
}

// 使用時導入
import { escapeHtml, toast } from '@utils/helpers.js';

const safe = escapeHtml(userInput);
toast('保存成功', 'success');
```

### 3.3 常數定義

#### 舊版:

```javascript
// system.js 中定義
const STORAGE_KEY = 'rope-skip-checkpoints';
const CLASS_PRESETS_KEY = 'rope-skip-class-presets';
const RANGE_IDS = ['engagement', 'mastery', 'helpOthers', ...];

// 直接使用
localStorage.getItem(STORAGE_KEY);
```

#### 新版:

```javascript
// src/constants/app-constants.js
export const STORAGE_KEY = 'rope-skip-checkpoints';
export const CLASS_PRESETS_KEY = 'rope-skip-class-presets';
export const RANGE_IDS = ['engagement', 'mastery', 'helpOthers', ...];

// 使用時導入
import { STORAGE_KEY, RANGE_IDS } from '@constants/app-constants.js';

localStorage.getItem(STORAGE_KEY);
```

### 3.4 對象和管理器

#### 舊版:

```javascript
// system.js 中定義
const STORAGE_MANAGER = {
  init() { /* ... */ },
  getItem(key) { /* ... */ },
  setItem(key, value) { /* ... */ }
};

// 直接使用
STORAGE_MANAGER.init();
const data = STORAGE_MANAGER.getItem('myKey');
```

#### 新版:

```javascript
// src/core/storage-manager.js
export const STORAGE_MANAGER = {
  init() { /* ... */ },
  getItem(key) { /* ... */ },
  setItem(key, value) { /* ... */ }
};

// 使用時導入
import { STORAGE_MANAGER } from '@core/storage-manager.js';

STORAGE_MANAGER.init();
const data = STORAGE_MANAGER.getItem('myKey');
```

---

## 4. 處理循環依賴

### 4.1 識別循環依賴

**循環依賴示例**:

```
A.js imports B.js
B.js imports C.js
C.js imports A.js  ← 循環！
```

**如何發現**:
- 構建時出現警告
- 運行時出現 undefined 錯誤
- 使用工具檢測（如 madge）

```bash
npm install -g madge
madge --circular src/
```

### 4.2 解決循環依賴

#### 方法 1: 提取共享邏輯

```javascript
// 問題：A 和 B 互相依賴

// A.js
import { funcB } from './B.js';
export function funcA() {
  return funcB() + 1;
}

// B.js
import { funcA } from './A.js';
export function funcB() {
  return funcA() - 1;  // 循環！
}

// 解決：提取共享邏輯到新文件

// shared.js
export const sharedValue = 10;

// A.js
import { sharedValue } from './shared.js';
export function funcA() {
  return sharedValue + 1;
}

// B.js
import { sharedValue } from './shared.js';
export function funcB() {
  return sharedValue - 1;
}
```

#### 方法 2: 依賴注入

```javascript
// 問題：Storage 依賴 Logger，Logger 依賴 Storage

// storage.js (舊版)
import { logger } from './logger.js';

export const storage = {
  save(data) {
    logger.log('Saving...');  // 依賴 logger
    // ...
  }
};

// logger.js (舊版)
import { storage } from './storage.js';

export const logger = {
  log(message) {
    storage.save({ log: message });  // 依賴 storage - 循環！
  }
};

// 解決：使用依賴注入

// storage.js (新版)
export const storage = {
  logger: null,
  
  setLogger(loggerInstance) {
    this.logger = loggerInstance;
  },
  
  save(data) {
    if (this.logger) {
      this.logger.log('Saving...');
    }
    // ...
  }
};

// logger.js (新版)
export const logger = {
  storage: null,
  
  setStorage(storageInstance) {
    this.storage = storageInstance;
  },
  
  log(message) {
    if (this.storage) {
      this.storage.save({ log: message });
    }
  }
};

// init.js
import { storage } from './storage.js';
import { logger } from './logger.js';

storage.setLogger(logger);
logger.setStorage(storage);
```

#### 方法 3: 使用事件系統

```javascript
// 使用事件避免直接依賴

// event-bus.js
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();

// storage.js
import { eventBus } from './event-bus.js';

export const storage = {
  save(data) {
    eventBus.emit('storage:save', data);  // 發送事件而不是直接調用
    // ...
  }
};

// logger.js
import { eventBus } from './event-bus.js';

export const logger = {
  init() {
    eventBus.on('storage:save', (data) => {  // 監聽事件
      console.log('Storage saved:', data);
    });
  }
};
```

### 4.3 重構依賴關係

**最佳實踐**:

1. **分層架構**: 確保依賴只向下流動
   ```
   UI Layer → Services Layer → Core Layer → Utils
   ```

2. **接口隔離**: 使用小接口而不是大對象
   ```javascript
   // 不好：傳遞整個對象
   function processData(storageManager) {
     return storageManager.getItem('key');
   }
   
   // 好：只傳遞需要的函數
   function processData(getItemFn) {
     return getItemFn('key');
   }
   ```

3. **延遲加載**: 需要時才導入
   ```javascript
   // 不好：頂層導入可能導致循環
   import { heavyModule } from './heavy.js';
   
   // 好：函數內動態導入
   async function doSomething() {
     const { heavyModule } = await import('./heavy.js');
     return heavyModule.process();
   }
   ```

---

## 5. 兼容性注意事項

### 5.1 向後兼容層

在遷移期間，保留舊接口以確保向後兼容：

```javascript
// src/main.js - 入口文件

// 導入新模組
import { STORAGE_MANAGER } from '@core/storage-manager.js';
import { LOGIN_MANAGER } from '@core/login-manager.js';
import { $ } from '@utils/dom-utils.js';

// 綁定到 window 對象（向後兼容）
if (typeof window !== 'undefined') {
  window.STORAGE_MANAGER = STORAGE_MANAGER;
  window.LOGIN_MANAGER = LOGIN_MANAGER;
  window.$ = $;
  
  // 標記為遺留接口
  console.warn('⚠️ 使用全局 STORAGE_MANAGER 已過時，請改用模組導入');
}

// ES Module 導出（新方式）
export { STORAGE_MANAGER, LOGIN_MANAGER, $ };
```

### 5.2 漸進式替換策略

**步驟 1**: 同時支持新舊方式
```javascript
// 舊代碼仍然可用
const data = STORAGE_MANAGER.getItem('key');

// 新代碼使用導入
import { STORAGE_MANAGER } from '@core/storage-manager.js';
const data = STORAGE_MANAGER.getItem('key');
```

**步驟 2**: 添加棄用警告
```javascript
// src/main.js
if (typeof window !== 'undefined') {
  // 包裝舊接口，添加警告
  window.STORAGE_MANAGER = new Proxy(STORAGE_MANAGER, {
    get(target, prop) {
      console.warn(`⚠️ 使用全局 STORAGE_MANAGER.${prop} 已過時`);
      return target[prop];
    }
  });
}
```

**步驟 3**: 逐步移除舊接口
```javascript
// 等所有代碼都遷移後，移除 window 綁定
// 移除或註釋掉：
// window.STORAGE_MANAGER = STORAGE_MANAGER;
```

### 5.3 HTML 文件更新

#### 舊版 HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>HKJRA 教練記錄系統</title>
</head>
<body>
  <!-- 直接引入單體文件 -->
  <script src="system.js"></script>
  <script>
    // 直接使用全局變數
    STORAGE_MANAGER.init();
  </script>
</body>
</html>
```

#### 新版 HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>HKJRA 教練記錄系統</title>
</head>
<body>
  <!-- 使用 ES Module -->
  <script type="module">
    import { STORAGE_MANAGER } from './src/main.js';
    import { initializeApp } from './src/init/app-init.js';
    
    // 初始化應用
    initializeApp();
  </script>
</body>
</html>
```

### 5.4 Vite 構建配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/rs-system/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html'
      },
      output: {
        // 保持模組結構
        manualChunks: {
          'core': [
            'src/core/storage-manager.js',
            'src/core/login-manager.js'
          ],
          'services': [
            'src/services/records-service.js',
            'src/services/presets-service.js'
          ],
          'ui': [
            'src/ui/ui-manager.js',
            'src/ui/form-manager.js'
          ]
        }
      }
    }
  }
});
```

---

## 6. 漸進式遷移策略

### 6.1 階段 1: 提取核心服務

**目標**: 提取 STORAGE_MANAGER, LOGIN_MANAGER 等核心服務

**步驟**:

1. **創建模組文件**:
```bash
mkdir -p src/core
touch src/core/storage-manager.js
touch src/core/login-manager.js
touch src/core/auth-config.js
```

2. **從 system.js 複製代碼**:
```javascript
// src/core/storage-manager.js
export const STORAGE_MANAGER = {
  // 從 system.js L56-446 複製代碼
  KEYS: { /* ... */ },
  init() { /* ... */ },
  // ...
};
```

3. **在 system.js 中導入並重新導出**（過渡期）:
```javascript
// system.js
import { STORAGE_MANAGER } from './src/core/storage-manager.js';

// 綁定到 window（向後兼容）
window.STORAGE_MANAGER = STORAGE_MANAGER;

// 也可以導出
export { STORAGE_MANAGER };
```

4. **測試**:
```javascript
// 測試舊方式仍然有效
console.assert(window.STORAGE_MANAGER !== undefined);
console.assert(typeof window.STORAGE_MANAGER.init === 'function');

// 測試新方式
import { STORAGE_MANAGER } from './src/core/storage-manager.js';
console.assert(STORAGE_MANAGER !== undefined);
```

### 6.2 階段 2: 提取工具函數

**目標**: 提取 DOM 選擇器、格式化、驗證等工具函數

**步驟**:

1. **創建工具模組**:
```bash
mkdir -p src/utils
touch src/utils/dom-utils.js
touch src/utils/formatters.js
touch src/utils/validators.js
touch src/utils/helpers.js
```

2. **提取函數**:
```javascript
// src/utils/dom-utils.js
export const $ = (id) => document.getElementById(id);
export const $q = (sel) => document.querySelector(sel);
export const $qa = (sel) => document.querySelectorAll(sel);
```

3. **更新 system.js**:
```javascript
// system.js
import { $, $q, $qa } from './src/utils/dom-utils.js';

// 向後兼容
window.$ = $;
window.$q = $q;
window.$qa = $qa;

export { $, $q, $qa };
```

4. **逐步替換使用**:
```javascript
// 舊代碼（逐步替換）
const btn = $('myButton');

// 新代碼
import { $ } from '@utils/dom-utils.js';
const btn = $('myButton');
```

### 6.3 階段 3-6: 類似流程

對於後續階段，遵循相同的模式：
1. 創建新模組
2. 複製/移動代碼
3. 添加導出
4. 在 system.js 中重新導出（過渡期）
5. 更新引用
6. 測試
7. 移除舊代碼

---

## 7. 測試策略

### 7.1 測試金字塔

```
       /\
      /  \  E2E 測試（少量）
     /----\
    /      \ 集成測試（中量）
   /--------\
  /          \ 單元測試（大量）
 /____________\
```

### 7.2 單元測試

**目標**: 測試單個模組的功能

```javascript
// tests/core/storage-manager.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { STORAGE_MANAGER } from '@core/storage-manager.js';

describe('STORAGE_MANAGER', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  afterEach(() => {
    localStorage.clear();
  });
  
  it('should initialize successfully', async () => {
    const result = await STORAGE_MANAGER.init();
    expect(result).toBe(true);
  });
  
  it('should set and get items', () => {
    STORAGE_MANAGER.setItem('test', { value: 123 });
    const result = STORAGE_MANAGER.getItem('test');
    expect(result.value).toBe(123);
  });
  
  it('should handle cache with TTL', () => {
    STORAGE_MANAGER.setCache('key', 'value', 1000);
    const cached = STORAGE_MANAGER.getCache('key');
    expect(cached).toBe('value');
  });
  
  it('should return null for expired cache', async () => {
    STORAGE_MANAGER.setCache('key', 'value', 10); // 10ms TTL
    await new Promise(resolve => setTimeout(resolve, 20));
    const cached = STORAGE_MANAGER.getCache('key');
    expect(cached).toBeNull();
  });
});
```

### 7.3 集成測試

**目標**: 測試多個模組協同工作

```javascript
// tests/integration/records-flow.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_MANAGER } from '@core/storage-manager.js';
import { RecordsService } from '@services/records-service.js';

describe('Records Integration', () => {
  beforeEach(async () => {
    await STORAGE_MANAGER.init();
    localStorage.clear();
  });
  
  it('should create and retrieve records', async () => {
    // 創建記錄
    const record = await RecordsService.createRecord({
      date: '2026-02-16',
      class: '5A',
      teacher: 'John',
      scores: { engagement: 5 }
    });
    
    expect(record.id).toBeDefined();
    
    // 檢索記錄
    const retrieved = await RecordsService.getRecordById(record.id);
    expect(retrieved.class).toBe('5A');
    
    // 更新記錄
    const updated = await RecordsService.updateRecord(record.id, {
      teacher: 'Jane'
    });
    expect(updated.teacher).toBe('Jane');
    
    // 刪除記錄
    await RecordsService.deleteRecord(record.id);
    const deleted = await RecordsService.getRecordById(record.id);
    expect(deleted).toBeNull();
  });
});
```

### 7.4 E2E 測試

**目標**: 測試完整用戶流程

```javascript
// tests/e2e/login-and-create.spec.js
import { test, expect } from '@playwright/test';

test('user can login and create record', async ({ page }) => {
  // 導航到登入頁
  await page.goto('http://localhost:4173/rs-system/login.html');
  
  // 登入
  await page.fill('#loginUsername', 'creator');
  await page.fill('#loginPassword', '1234');
  await page.click('#btnLogin');
  
  // 等待導航到主頁
  await page.waitForURL('**/index.html');
  
  // 點擊創建按鈕
  await page.click('#btnNewRecord');
  
  // 填寫表單
  await page.fill('#recordDate', '2026-02-16');
  await page.fill('#recordClass', '5A');
  await page.fill('#recordTeacher', 'John');
  
  // 提交表單
  await page.click('#btnSave');
  
  // 驗證記錄已創建
  await expect(page.locator('.record-item')).toContainText('5A');
  await expect(page.locator('.record-item')).toContainText('John');
});
```

### 7.5 測試配置

**安裝測試依賴**:

```bash
npm install -D vitest @vitest/ui @playwright/test
```

**配置 vitest**:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js',
        '**/*.spec.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@services': path.resolve(__dirname, './src/services'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
});
```

**package.json 腳本**:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

### 7.6 測試檢查清單

每個模組遷移後需要通過的測試：

**單元測試**:
- [ ] 模組可以正確導入
- [ ] 所有公開函數有測試
- [ ] 邊界條件有測試
- [ ] 錯誤處理有測試
- [ ] 測試覆蓋率 > 80%

**集成測試**:
- [ ] 模組間交互正常
- [ ] 數據流正確
- [ ] 狀態管理正確

**E2E 測試**:
- [ ] 關鍵用戶流程可用
- [ ] UI 響應正常
- [ ] 無控制台錯誤

---

## 8. 常見問題

### 8.1 模組導入失敗

**問題**: `Uncaught SyntaxError: Cannot use import statement outside a module`

**解決**:
```html
<!-- 確保 script 標籤有 type="module" -->
<script type="module" src="./src/main.js"></script>
```

### 8.2 找不到模組

**問題**: `Failed to resolve module specifier "@core/storage-manager.js"`

**解決**:
1. 檢查 vite.config.js 中的別名配置
2. 確保路徑正確
3. 使用相對路徑或配置的別名

```javascript
// 使用別名（需配置）
import { STORAGE_MANAGER } from '@core/storage-manager.js';

// 或使用相對路徑
import { STORAGE_MANAGER } from './core/storage-manager.js';
```

### 8.3 循環依賴警告

**問題**: `Circular dependency detected`

**解決**: 參考 [4. 處理循環依賴](#4-處理循環依賴) 章節

### 8.4 全局變數未定義

**問題**: 遷移後 `window.STORAGE_MANAGER is undefined`

**解決**:
```javascript
// 在 main.js 中確保綁定到 window
import { STORAGE_MANAGER } from '@core/storage-manager.js';

if (typeof window !== 'undefined') {
  window.STORAGE_MANAGER = STORAGE_MANAGER;
}
```

### 8.5 事件處理器丟失

**問題**: 按鈕點擊不響應

**解決**:
1. 檢查事件綁定是否在 DOM 加載後執行
2. 確保事件處理器函數已正確導出

```javascript
// 不好：在模組頂層綁定（可能 DOM 未就緒）
import { $ } from '@utils/dom-utils.js';
$('myButton').addEventListener('click', handleClick);

// 好：在 DOMContentLoaded 後綁定
document.addEventListener('DOMContentLoaded', () => {
  import { $ } from '@utils/dom-utils.js';
  $('myButton').addEventListener('click', handleClick);
});
```

### 8.6 構建後文件過大

**問題**: 單個 bundle 文件過大

**解決**: 配置代碼分割

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/core')) {
            return 'core';
          }
          if (id.includes('src/services')) {
            return 'services';
          }
          if (id.includes('src/ui')) {
            return 'ui';
          }
        }
      }
    }
  }
});
```

### 8.7 TypeScript 類型檢查

**問題**: 希望在 JavaScript 項目中使用類型檢查

**解決**: 使用 JSDoc + TypeScript

```javascript
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} email
 */

/**
 * 獲取用戶
 * @param {string} id - 用戶 ID
 * @returns {Promise<User>} 用戶對象
 */
export async function getUser(id) {
  // ...
}
```

```json
// jsconfig.json
{
  "compilerOptions": {
    "checkJs": true,
    "module": "esnext",
    "moduleResolution": "node",
    "target": "es2020",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@services/*": ["src/services/*"],
      "@ui/*": ["src/ui/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## 9. 遷移檢查清單

### 總體檢查清單

- [ ] 所有模組已創建
- [ ] 所有導出已定義
- [ ] 所有導入已更新
- [ ] 測試全部通過
- [ ] 文檔已更新
- [ ] 向後兼容已驗證
- [ ] 性能無退化
- [ ] 構建成功
- [ ] 部署成功

### 每個模組檢查清單

- [ ] 模組文件已創建
- [ ] 代碼已從 system.js 遷移
- [ ] 導出接口已定義
- [ ] 依賴已正確導入
- [ ] 單元測試已添加
- [ ] 測試通過
- [ ] JSDoc 文檔完整
- [ ] 無循環依賴
- [ ] 代碼已 lint
- [ ] 向後兼容層已添加

---

## 10. 資源和參考

### 相關文檔

- [MODULARIZATION_ARCHITECTURE.md](./MODULARIZATION_ARCHITECTURE.md) - 架構設計
- [MODULE_API_DESIGN.md](./MODULE_API_DESIGN.md) - API 設計
- [REFACTORING_CHECKLIST.md](./REFACTORING_CHECKLIST.md) - 詳細檢查清單

### 外部資源

- [ES Modules MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Vite 配置](https://vitejs.dev/config/)
- [Vitest 測試](https://vitest.dev/)
- [Playwright E2E](https://playwright.dev/)

---

## 11. 版本歷史

| 版本 | 日期 | 變更說明 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-02-16 | 初始版本，完整遷移指南 | GitHub Copilot |

---

**文檔結束**

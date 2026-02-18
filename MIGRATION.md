# RS-System 遷移指南

從 `system.js` 遷移到模組化架構

---

## 📝 遷移步驟

| 項目 | 舊版 | 新版 |
|------|------|------|
| 引入方式 | `<script src="system.js">` | `<script type="module" src="./src/index.js">` |
| 全域變數 | `window.STORAGE_MANAGER` | `import { STORAGE_MANAGER } from './src/main.js'` |
| 初始化 | 自動執行 | 自動執行或手動 `initApp()` |

---

## 🚀 使用方式

### 方式 1：自動初始化（推薦）

```html
<!-- 在 index.html 中 -->
<script type="module" src="./src/index.js"></script>
```

### 方式 2：全部匯入

```javascript
import * as RS from './src/main.js';

await RS.initApp();
const data = RS.STORAGE_MANAGER.loadData();
```

### 方式 3：按需匯入

```javascript
import { STORAGE_MANAGER, RecordsService } from './src/main.js';

const records = await RecordsService.getAllRecords();
STORAGE_MANAGER.saveData(records);
```

---

## ❓ 疑難排解

**Q: 模組無法載入？**  
A: 確認 `<script type="module">` 且路徑正確

**Q: 舊版代碼報錯？**  
A: 使用 `./src/compat/legacy-bridge.js` 向後相容層

**Q: 如何檢查模組可用性？**  
A: 使用 `isModuleAvailable('core')` 檢查

---

## 📦 可用模組

- ✅ **Phase 1** - 工具與常數（5 個模組）
- ✅ **Phase 2** - 核心服務（8 個模組）
- ✅ **Phase 3** - UI 管理（7 個模組）
- ✅ **Phase 4** - 初始化（6 個模組）

**總計**: 26 個功能模組 + 2 個入口點

---

## 🔗 相關文檔

- 完整 API 文檔：`src/README.md`
- 測試檔案：`test-*.html`
- 範例代碼：`src/examples/`

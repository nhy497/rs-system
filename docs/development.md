# 🛠️ 開發指南

## 開發環境設定

### 先決條件

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- 現代瀏覽器（Chrome, Firefox, Edge）

### 安裝步驟

```bash
# Clone 專案
git clone https://github.com/nhy497/rs-system.git
cd rs-system

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

## 開發工作流程

### 1. 分支策略

```bash
# 建立功能分支
git checkout -b feature/your-feature-name

# 建立修復分支
git checkout -b fix/bug-description

# 建立文檔分支
git checkout -b docs/documentation-update
```

### 2. 開發流程

```bash
# 1. 更新到最新版本
git pull origin main

# 2. 建立新分支
git checkout -b feature/new-feature

# 3. 開發功能
npm run dev  # 啟動開發伺服器

# 4. 執行測試
npm test

# 5. 代碼檢查
npm run lint

# 6. 格式化代碼
npm run format

# 7. 提交變更
git add .
git commit -m "✨ Add: new feature description"

# 8. 推送到遠端
git push origin feature/new-feature

# 9. 建立 Pull Request
```

### 3. 提交訊息規範

使用語義化提交訊息：

```
✨ Add: 新增功能
🐛 Fix: 修復 Bug
📝 Docs: 文檔更新
🎨 Style: 代碼格式（不影響功能）
♻️ Refactor: 重構（不是新功能或 Bug 修復）
⚡ Perf: 效能優化
✅ Test: 測試相關
🔧 Chore: 建置流程或輔助工具變更
```

範例：
```bash
git commit -m "✨ Add: user profile page"
git commit -m "🐛 Fix: login session timeout issue"
git commit -m "📝 Docs: update API documentation"
```

## 編碼規範

### JavaScript 規範

#### 命名約定

```javascript
// 變量 - camelCase
const userName = 'John';
const recordList = [];

// 常量 - UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com';
const MAX_RECORDS = 1000;

// 函數 - camelCase
function saveRecord(record) {}
const formatDate = (date) => {};

// 類別 - PascalCase
class RecordManager {}
class DataService {}

// 私有變量 - _prefix
const _privateData = {};
```

#### 代碼風格

```javascript
// ✅ 好的做法
const userName = 'John';
let recordCount = 0;

// 使用 const/let，避免 var
const config = { theme: 'dark' };

// 使用箭頭函數
const formatDate = (date) => date.toISOString();

// 清晰的註釋
/**
 * 保存課程記錄
 * @param {Object} record - 課程記錄物件
 * @returns {boolean} 保存成功與否
 */
function saveRecord(record) {
  // 驗證資料
  if (!record.date) return false;
  
  // 儲存到 localStorage
  localStorage.setItem('record', JSON.stringify(record));
  return true;
}

// ❌ 不好的做法
var x = 'test';  // 避免使用 var
function a(b) { return b }  // 命名不清楚
```

#### 錯誤處理

```javascript
// ✅ 使用 try-catch
try {
  const data = JSON.parse(localStorage.getItem('users'));
  return data;
} catch (error) {
  console.error('Failed to parse users:', error);
  return [];
}

// ✅ 提供預設值
const users = JSON.parse(localStorage.getItem('users')) || [];

// ✅ 驗證輸入
function saveRecord(record) {
  if (!record || typeof record !== 'object') {
    throw new Error('Invalid record object');
  }
  // ...
}
```

### HTML 規範

```html
<!-- ✅ 使用語義化標籤 -->
<header>
  <nav aria-label="主導航">
    <ul>
      <li><a href="#home">首頁</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>文章標題</h1>
    <section>
      <h2>段落標題</h2>
      <p>內容...</p>
    </section>
  </article>
</main>

<footer>
  <p>&copy; 2026 RS-System</p>
</footer>

<!-- ✅ 添加 ARIA 標籤 -->
<button aria-label="關閉對話框" onclick="closeDialog()">
  <span aria-hidden="true">×</span>
</button>

<!-- ✅ ID 和 Class 使用 kebab-case -->
<div id="user-profile" class="profile-card">
  <!-- ... -->
</div>
```

### CSS 規範

```css
/* ✅ 使用 BEM 命名約定 */
.card {}
.card__header {}
.card__body {}
.card__footer {}
.card--highlighted {}

/* ✅ 使用 CSS 變量 */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-size-base: 16px;
}

.button {
  background-color: var(--primary-color);
  font-size: var(--font-size-base);
}

/* ✅ 移動優先 (Mobile-first) */
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}

@media (min-width: 1024px) {
  .container {
    width: 970px;
  }
}
```

## 工具使用

### ESLint（代碼檢查）

```bash
# 檢查所有檔案
npm run lint

# 自動修復
npm run lint:fix
```

### Prettier（代碼格式化）

```bash
# 格式化所有檔案
npm run format
```

### TypeScript（型別檢查）

```bash
# 執行型別檢查
npm run type-check
```

## 品質保證

### 測試策略

#### 1. 單元測試

測試獨立的函數和模組：

```javascript
import { describe, it, expect } from 'vitest';
import { formatDate } from '../src/utils/formatters.js';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-02-18');
    expect(formatDate(date)).toBe('2026-02-18');
  });
});
```

#### 2. 整合測試

測試多個模組的整合：

```javascript
describe('User Login Flow', () => {
  it('should login successfully with valid credentials', () => {
    // 測試登入流程
  });
});
```

#### 3. 手動測試

使用測試頁面進行功能驗證：
- `tests/manual/test-modules.html`
- `tests/manual/system-test.html`

### 代碼審查清單

提交 PR 前檢查：

- [ ] 代碼通過 ESLint 檢查
- [ ] 代碼已格式化（Prettier）
- [ ] 所有測試通過
- [ ] 添加必要的註釋
- [ ] 更新相關文檔
- [ ] 沒有 console.log（除非是日誌服務）
- [ ] 沒有註釋掉的代碼
- [ ] 變數命名清晰
- [ ] 函數職責單一
- [ ] 錯誤處理完整

## 調試技巧

### 瀏覽器開發者工具

```javascript
// 1. 使用 console.log
console.log('User:', user);

// 2. 使用 console.table（適合陣列/物件）
console.table(users);

// 3. 使用 console.group（組織日誌）
console.group('User Login');
console.log('Username:', username);
console.log('Role:', role);
console.groupEnd();

// 4. 使用 debugger
function saveRecord(record) {
  debugger;  // 瀏覽器會在此處暫停
  localStorage.setItem('record', JSON.stringify(record));
}
```

### Vite 開發工具

```javascript
// 查看模組熱更新
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('模組已更新');
  });
}
```

## 常見問題

### Q1: 如何添加新功能？

1. 在 `src/` 目錄建立新模組
2. 遵循 ES 模組規範
3. 添加單元測試
4. 更新文檔

### Q2: 如何處理相容性？

- 使用 `src/compat/legacy-bridge.js` 保持向後相容
- 不修改 `system.js`，只新增模組
- 使用漸進式增強

### Q3: 如何優化效能？

- 使用 localStorage 快取
- 實現防抖/節流
- 按需載入模組
- 最小化 DOM 操作

### Q4: 如何處理錯誤？

- 使用 try-catch 包裹可能失敗的操作
- 提供有意義的錯誤訊息
- 使用日誌服務記錄錯誤

## 專案結構

```
rs-system/
├── src/                    # 原始碼
│   ├── init/              # 初始化模組
│   ├── services/          # 服務層
│   ├── utils/             # 工具函數
│   ├── config/            # 配置
│   ├── constants/         # 常數
│   └── compat/            # 相容層
│
├── public/                # 靜態資源
├── tests/                 # 測試
├── docs/                  # 文檔
└── dev/                   # 開發工具
```

## 貢獻指南

### 如何貢獻

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 推送到分支
5. 建立 Pull Request

### Pull Request 檢查清單

- [ ] 分支名稱符合規範
- [ ] 提交訊息使用語義化格式
- [ ] 代碼通過所有檢查
- [ ] 添加/更新測試
- [ ] 更新相關文檔
- [ ] PR 描述清楚

## 相關文檔

- [🧪 測試指南](./testing.md)
- [🏛️ 架構說明](./architecture.md)
- [🎨 編碼規範](./archive/old-structure/development/CODING_STANDARDS.md)
- [🚀 部署指南](./deployment.md)

---

**提示**: 開發過程中如有疑問，請參考現有代碼或創建 Issue 討論。

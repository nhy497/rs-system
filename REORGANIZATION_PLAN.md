# RS-System 專案重組計劃

## 🎯 目標
整理混亂的專案結構，提升代碼可維護性和開發效率。

## 📋 重組清單

### 階段一：清理根目錄 (高優先級)

#### 需要移動的檔案：
- [ ] `firebase-config.js` → `src/config/firebase.js`
- [ ] `logger-service.js` → `src/services/logger.js`
- [ ] `sync-config.js` → `src/config/sync.js`
- [ ] `sync-utils.js` → `src/utils/sync.js`
- [ ] `sync-styles.css` → `src/styles/sync.css`
- [ ] `system.js` → `src/compat/system.js`

#### 需要移動的文檔：
- [ ] `Introduction-with problems.pdf` → `docs/assets/`
- [ ] `introduction-with-problem.pdf` → `docs/assets/`
- [ ] `LOGIN_SECURITY_AUDIT.md` → `docs/admin/`
- [ ] `MIGRATION.md` → `docs/changelog/`
- [ ] `PHASE3_COMPLETION_REPORT.md` → `docs/changelog/`
- [ ] `REFACTORING_PLAN.md` → `docs/development/`
- [ ] `TESTING_SETUP_COMPLETE.md` → `docs/development/`
- [ ] `security-analysis.html` → `docs/admin/`

#### 需要移動的工具：
- [ ] `smart_rename_docs.py` → `tools/rename-docs.py`
- [ ] `smart_rename_docs_v3_git.py` → `tools/rename-docs-v3.py`

#### 需要歸檔：
- [ ] `abc/` → `archive/abc/`
- [ ] `OLD_TESTS/` → `archive/OLD_TESTS/`

#### 需要移動的測試檔案：
- [ ] `test-integration.html` → `test/integration/`
- [ ] `test-modules.html` → `test/unit/`
- [ ] `test-phase2-modules.html` → `test/unit/phase2.html`
- [ ] `test-phase3-modules.html` → `test/unit/phase3.html`
- [ ] `test-phase4-modules.html` → `test/unit/phase4.html`
- [ ] `test-results.html` → `test/reports/`

### 階段二：簡化配置檔案

#### 覆蓋率配置拆分：
- [ ] `test/config/coverage-config.js` → 拆分為：
  - `test/config/coverage.js` (基本配置)
  - `test/config/quality-gates.js` (質量門檻)
  - `test/config/coverage-analyzer.js` (分析器)

#### 更新引用：
- [ ] 更新 `vitest.config.js` 中的引用
- [ ] 更新所有相關的 import 路徑

### 階段三：更新依賴路徑

#### 需要更新的檔案：
- [ ] `index.html` 中的 script 標籤
- [ ] 所有 JavaScript 檔案中的 import 路徑
- [ ] CSS 檔案中的 @import 路徑

### 階段四：清理和優化

#### 刪除冗餘：
- [ ] 刪除重複的 PDF 檔案
- [ ] 清理不必要的測試檔案
- [ ] 移除過時的配置檔案

#### 優化結構：
- [ ] 統一命名規範
- [ ] 添加 .gitignore 規則
- [ ] 更新 README.md

## 🔧 執行步驟

### 步驟 1：備份當前狀態
```bash
git add -A
git commit -m "feat: 保存重組前的狀態"
git tag reorganization-start
```

### 步驟 2：創建新目錄結構
```bash
mkdir -p src/config src/services src/utils src/styles src/compat
mkdir -p docs/admin docs/development docs/changelog docs/assets
mkdir -p tools archive
mkdir -p test/unit test/integration test/reports
```

### 步驟 3：移動檔案
按照上述清單逐一移動檔案。

### 步驟 4：更新引用
使用搜尋替換更新所有 import 路徑。

### 步驟 5：測試驗證
```bash
npm run test
npm run build
npm run dev
```

### 步驟 6：提交變更
```bash
git add -A
git commit -m "refactor: 重組專案結構，提升代碼組織性"
```

## ⚠️ 注意事項

1. **備份重要性**：重組前務必完整備份
2. **漸進式重組**：建議分階段進行，每階段後測試
3. **路徑更新**：移動檔案後必須更新所有引用
4. **測試驗證**：每個階段完成後都要運行測試
5. **文檔同步**：更新相關文檔和 README

## 📊 預期效果

重組完成後的改善：
- ✅ 根目錄清晰簡潔
- ✅ 檔案分類明確
- ✅ 依賴關係清晰
- ✅ 維護性提升
- ✅ 開發效率提高

## 🔄 回滾計劃

如需回滾：
```bash
git reset --hard reorganization-start
```

---

**執行時間預估**：2-3 小時
**風險等級**：中等（需要仔細處理路徑更新）
**建議執行時間**：開發時間，避免影響其他開發者

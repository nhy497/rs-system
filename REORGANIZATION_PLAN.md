# 📁 RS-System Repository 重組計劃

**創建日期**: 2026-02-12  
**狀態**: 🚧 計劃中  
**目標**: 將散亂的 60+ 個 Markdown 文檔重新組織成清晰的目錄結構

---

## 📊 現狀分析

### 問題
- ❗ **根目錄過於擁擠**: 73 個檔案，包含 60+ 個 Markdown
- ❗ **命名混亂**: 多個 SUMMARY, REPORT, GUIDE 檔案
- ❗ **缺乏分類**: 所有文檔平放在根目錄
- ❗ **難以維護**: 新用戶不知從何開始

### 統計
```
總檔案數: 73
Markdown 文檔: 60+
HTML 檔案: 4
JS 檔案: 6
CSS 檔案: 2
配置檔案: 3
```

---

## 🎯 目標架構

### 新結構
```
rs-system/
├── README.md                    # 主 README (簡潔版)
├── package.json
├── vite.config.js
├── .gitignore
│
├── .github/                     # GitHub 配置
│   └── workflows/
│       └── deploy.yml
│
├── src/                         # 原始碼
│   ├── components/              # UI 組件
│   │   ├── Toast.js
│   │   └── Modal.js
│   ├── services/                # 服務層
│   │   ├── logger-service.js
│   │   └── storage-service.js
│   ├── config/                  # 配置檔案
│   │   ├── firebase-config.js
│   │   └── sync-config.js
│   └── utils/                   # 工具函數
│       └── diagnostic-script.js
│
├── public/                      # 静態資源
│   ├── index.html
│   ├── login.html
│   ├── clear-cache.html
│   ├── styles.css
│   ├── styles-data-management.css
│   └── system.js
│
├── tests/                       # 測試檔案
│   ├── test-save-refresh.html
│   └── OLD_TESTS/               # 舊測試檔案
│
├── dev/                         # 開發工具
│   └── (現有 dev 目錄內容)
│
└── docs/                        # 文檔中心 ⭐
    ├── README.md                # 文檔中心首頁
    │
    ├── getting-started/         # 入門指南
    │   ├── QUICK_START.md
    │   ├── INSTALLATION.md
    │   └── TUTORIALS.md
    │
    ├── user-guide/              # 用戶手冊
    │   ├── USER_MANUAL.md
    │   ├── FEATURES.md
    │   └── FAQ.md
    │
    ├── development/             # 開發文檔
    │   ├── DEVELOPER_GUIDE.md
    │   ├── CODING_STANDARDS.md
    │   ├── TESTING_GUIDE.md
    │   └── CONTRIBUTION.md
    │
    ├── architecture/            # 架構文檔
    │   ├── SYSTEM_ARCHITECTURE.md
    │   ├── DATA_MODEL.md
    │   └── TECH_STACK.md
    │
    ├── api/                     # API 文檔
    │   ├── API_REFERENCE.md
    │   └── INTEGRATION_GUIDE.md
    │
    ├── deployment/              # 部署文檔
    │   ├── DEPLOYMENT_GUIDE.md
    │   ├── CI_CD_GUIDE.md
    │   └── ENVIRONMENT.md
    │
    ├── admin/                   # 管理文檔
    │   ├── CREATOR_GUIDE.md
    │   └── PERMISSION_GUIDE.md
    │
    ├── changelog/               # 變更記錄
    │   ├── CHANGELOG.md
    │   └── ROADMAP.md
    │
    └── archive/                 # 歷史文檔
        ├── bug-fixes/           # Bug 修復記錄
        ├── reports/             # QA/測試報告
        ├── implementations/     # 功能實現記錄
        └── legacy/              # 過時文檔
```

---

## 📝 文檔移動計劃

### 🎯 getting-started/ (入門指南)
```
START_HERE.md                    → docs/getting-started/QUICK_START.md
QUICK_REFERENCE.md               → docs/getting-started/QUICK_REFERENCE.md
```

### 📖 user-guide/ (用戶手冊)
```
v2.1_FEATURES.md                 → docs/user-guide/FEATURES.md
(新建) FAQ.md                   → docs/user-guide/FAQ.md
```

### 💻 development/ (開發文檔)
```
DEVELOPER_GUIDE.md               → docs/development/DEVELOPER_GUIDE.md
TESTING_GUIDE.md                 → docs/development/TESTING_GUIDE.md
QUICK_TEST_GUIDE.md              → docs/development/QUICK_TEST_GUIDE.md
SIGNUP_TESTING_GUIDE.md          → docs/development/SIGNUP_TESTING_GUIDE.md
(新建) CODING_STANDARDS.md     → docs/development/CODING_STANDARDS.md
(新建) CONTRIBUTION.md          → docs/development/CONTRIBUTION.md
```

### 🏗️ architecture/ (架構文檔)
```
CODE_CHANGES_DETAIL.md           → docs/architecture/SYSTEM_ARCHITECTURE.md
CHANGE_TEMPLATE.md               → docs/architecture/CHANGE_TEMPLATE.md
(新建) DATA_MODEL.md            → docs/architecture/DATA_MODEL.md
(新建) TECH_STACK.md            → docs/architecture/TECH_STACK.md
```

### 🔧 api/ (API 文檔)
```
INTEGRATION_GUIDE.md             → docs/api/INTEGRATION_GUIDE.md
INTEGRATION_QUICK_COMMANDS.md    → docs/api/INTEGRATION_QUICK_COMMANDS.md
QUICK_INTEGRATION_CHECKLIST.md   → docs/api/QUICK_INTEGRATION_CHECKLIST.md
POUCHDB_SYSTEM_GUIDE.md          → docs/api/POUCHDB_GUIDE.md
POUCHDB_QUICK_START.md           → docs/api/POUCHDB_QUICK_START.md
SYNC_SETUP_GUIDE.md              → docs/api/SYNC_SETUP_GUIDE.md
```

### ⚙️ deployment/ (部署文檔)
```
CI_CD_FIX.md                     → docs/deployment/CI_CD_GUIDE.md
FIXES_QUICK_START.md             → docs/deployment/DEPLOYMENT_GUIDE.md
(新建) ENVIRONMENT.md           → docs/deployment/ENVIRONMENT.md
```

### 🔐 admin/ (管理文檔)
```
CREATOR_GUIDE.md                 → docs/admin/CREATOR_GUIDE.md
(新建) PERMISSION_GUIDE.md      → docs/admin/PERMISSION_GUIDE.md
```

### 📝 changelog/ (變更記錄)
```
CHANGE_LOG.md                    → docs/changelog/CHANGELOG.md
ROADMAP.md                       → docs/changelog/ROADMAP.md
UPGRADE_GUIDE.md                 → docs/changelog/UPGRADE_GUIDE.md
UPGRADE_EXECUTION_COMPLETE.md    → docs/changelog/UPGRADE_HISTORY.md
```

### 📦 archive/bug-fixes/ (Bug 修復記錄)
```
AUTO_LOGOUT_FIX.md               → docs/archive/bug-fixes/AUTO_LOGOUT_FIX.md
BUG_FIX_REPORT_LOGIN_20250121.md → docs/archive/bug-fixes/LOGIN_FIX_20250121.md
BUG_TRACKING.md                  → docs/archive/bug-fixes/BUG_TRACKING.md
LOGIN_REDIRECT_FIX.md            → docs/archive/bug-fixes/LOGIN_REDIRECT_FIX.md
LOGIN_REDIRECT_FIX_REPORT_20260125.md → docs/archive/bug-fixes/LOGIN_REDIRECT_20260125.md
SESSION_BREAKAGE_ROOT_CAUSE_ANALYSIS.md → docs/archive/bug-fixes/SESSION_ANALYSIS.md
SIDEBAR_COLLAPSE_GITHUB_GUIDE.md → docs/archive/bug-fixes/SIDEBAR_FIX.md
```

### 📦 archive/reports/ (測試報告)
```
QA_REPORT.md                     → docs/archive/reports/QA_REPORT.md
QA_SUMMARY.md                    → docs/archive/reports/QA_SUMMARY.md
QA_VERIFICATION_COMPLETE.md      → docs/archive/reports/QA_VERIFICATION.md
QA_DOCUMENTATION_INDEX.md        → docs/archive/reports/QA_INDEX.md
VERIFICATION_REPORT.md           → docs/archive/reports/VERIFICATION_REPORT.md
VERIFICATION_REPORT_20250121.md  → docs/archive/reports/VERIFICATION_20250121.md
VERIFICATION_LOG_20250121.md     → docs/archive/reports/VERIFICATION_LOG_20250121.md
VERIFICATION_SUMMARY_TC.md       → docs/archive/reports/VERIFICATION_SUMMARY.md
TEST_PLAN.md                     → docs/archive/reports/TEST_PLAN.md
TEST_IMPROVEMENT_REPORT.md       → docs/archive/reports/TEST_IMPROVEMENT.md
TEST_FILES_ORGANIZATION_REPORT.md → docs/archive/reports/TEST_ORGANIZATION.md
PHASE3_TEST_EXECUTION.md         → docs/archive/reports/PHASE3_EXECUTION.md
```

### 📦 archive/implementations/ (實現記錄)
```
IMPLEMENTATION_SUMMARY.md        → docs/archive/implementations/IMPLEMENTATION_SUMMARY.md
IMPLEMENTATION_SUMMARY_v2.1.md   → docs/archive/implementations/IMPLEMENTATION_v2.1.md
IMPROVEMENTS_COMPLETED.md        → docs/archive/implementations/IMPROVEMENTS_COMPLETED.md
IMPROVEMENTS_READY.md            → docs/archive/implementations/IMPROVEMENTS_READY.md
IMPROVEMENTS_SUMMARY.md          → docs/archive/implementations/IMPROVEMENTS_SUMMARY.md
POUCHDB_COMPLETION_SUMMARY.md    → docs/archive/implementations/POUCHDB_COMPLETION.md
POUCHDB_IMPLEMENTATION_REPORT.md → docs/archive/implementations/POUCHDB_IMPLEMENTATION.md
POUCHDB_DOCUMENTATION_INDEX.md   → docs/archive/implementations/POUCHDB_INDEX.md
POUCHDB_README.md                → docs/archive/implementations/POUCHDB_README.md
FINAL_COMPLETION_SUMMARY.md      → docs/archive/implementations/FINAL_COMPLETION.md
FINAL_DELIVERY_REPORT.md         → docs/archive/implementations/FINAL_DELIVERY.md
FINAL_VERIFICATION_CHECKLIST.md  → docs/archive/implementations/FINAL_VERIFICATION.md
PROJECT_COMPLETION_REPORT.md     → docs/archive/implementations/PROJECT_COMPLETION.md
UPDATE_20250121_FEATURES_1-4_FIREBASE.md → docs/archive/implementations/UPDATE_20250121.md
v2.1_REPORT.md                   → docs/archive/implementations/v2.1_REPORT.md
```

### 📦 archive/legacy/ (過時文檔)
```
ACCEPTANCE_CHECKLIST.md          → docs/archive/legacy/ACCEPTANCE_CHECKLIST.md
LOGIN_QUICK_REFERENCE.md         → docs/archive/legacy/LOGIN_QUICK_REFERENCE.md
LOGIN_SYSTEM_VERIFICATION.md     → docs/archive/legacy/LOGIN_VERIFICATION.md
APP_JS_PATCH_SIDEBAR.txt         → docs/archive/legacy/APP_JS_PATCH_SIDEBAR.txt
```

### 🗑️ 刪除檔案 (重複/無用)
```
REORGANIZATION_PLAN.md           # 本檔案，執行完成後刪除
```

---

## 🛠️ 源碼移動計劃

### src/services/
```
logger-service.js                → src/services/logger-service.js
(未來新增) storage-service.js  → src/services/storage-service.js
```

### src/config/
```
firebase-config.js               → src/config/firebase-config.js
sync-config.js                   → src/config/sync-config.js
```

### src/utils/
```
diagnostic-script.js             → src/utils/diagnostic-script.js
```

### public/
```
index.html                       → public/index.html
login.html                       → public/login.html
clear-cache.html                 → public/clear-cache.html
system.js                        → public/system.js
styles.css                       → public/styles.css
styles-data-management.css       → public/styles-data-management.css
```

### tests/
```
test-save-refresh.html           → tests/test-save-refresh.html
OLD_TESTS/                       → tests/OLD_TESTS/
```

---

## ✅ 執行步驟

### Phase 1: 準備階段 (已完成)
- [x] 分析現有檔案結構
- [x] 設計新目錄架構
- [x] 創建 docs/README.md 文檔中心
- [x] 創建重組計劃文檔

### Phase 2: 文檔移動 (待執行)
- [ ] 創建 docs/ 子目錄
- [ ] 移動文檔到對應目錄
- [ ] 更新文檔內部連結
- [ ] 更新 README.md 連結

### Phase 3: 源碼移動 (待執行)
- [ ] 創建 src/ 子目錄
- [ ] 移動 JS/CSS 檔案
- [ ] 更新 HTML 引用路徑
- [ ] 更新 vite.config.js

### Phase 4: 測試驗證 (待執行)
- [ ] 本地測試構建
- [ ] 測試所有連結
- [ ] CI/CD 構建驗證
- [ ] GitHub Pages 部署測試

### Phase 5: 清理完成 (待執行)
- [ ] 刪除重複檔案
- [ ] 更新主 README.md
- [ ] 創建 MIGRATION_LOG.md
- [ ] 刪除 REORGANIZATION_PLAN.md

---

## 📌 注意事項

### 重要！
1. **備份**: 執行前先備份整個 repository
2. **測試**: 每個階段完成後都要測試
3. **連結**: 仔細更新所有內部連結
4. **CI/CD**: 確保構建流程不受影響

### 風險評估
- ✅ **低風險**: 文檔移動（不影響功能）
- ⚠️ **中風險**: 源碼移動（需更新引用）
- ❗ **高風險**: HTML 路徑更新（可能影響部署）

---

## 📈 預期效益

### 立即效益
- ✅ 根目錄檔案減少 80%
- ✅ 文檔分類清晰
- ✅ 新用戶容易上手

### 長期效益
- 📈 更好的可維護性
- 📈 更專業的形象
- 📈 更容易擴展

---

## 👥 貢獻者

**計劃者**: Perplexity AI + nhy497  
**執行日期**: 2026-02-12  
**預計完成**: 2026-02-12

---

**下一步**: 獲得用戶確認後開始 Phase 2 文檔移動 🚀

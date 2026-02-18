# 專案重組計劃

## 已完成

- [x] 刪除 `.empty_commit`
- [x] 移動工具腦本到 `tools/` 目錄
- [x] 從根目錄刪除 `reorganize_docs.py`

## 接下來需要執行的任務

### 1. 清理凗餘文件（從根目錄刪除或移動）

```bash
# 刪除或移動到 tools/
git rm smart_rename_docs.py
git rm smart_rename_docs_v3_git.py

# 移動開發/測試文件到 dev/
git mv console-enhancer.js dev/
git mv diagnostic-script.js dev/
git mv clear-cache.html dev/
git mv test-save-refresh.html dev/

# 移動歷史文檔到 docs/archive/
git mv REORGANIZATION_PLAN.md docs/archive/
git mv REORGANIZATION_TUTORIAL.md docs/archive/
```

### 2. 高優先級開發

#### 2.1 在 docs/merge-records/ 增加 README.md

內容應包含：
- 合併記錄索引（按日期倒序）
- 每個記錄的簡要說明
- 關聯 PR 編號

#### 2.2 更新主 README.md

確認檔案結構與實際一致：
- 更新檔案結構章節
- 說明 `tools/` 和 `dev/` 目錄
- 更新開發流程

### 3. 中優先級開發

#### 3.1 建立標準化目錄結構

目標結構：
```
/
├── public/          # 静態資源和 HTML 入口
│   ├── index.html
│   ├── login.html
│   └── assets/      # CSS, 圖片等
├── src/             # 原始碼
│   ├── services/    # 業務邏輯
│   ├── ui/          # UI 組件
│   └── utils/       # 工具函數
├── docs/            # 文檔
├── tools/           # 開發工具腦本
├── dev/             # 開發/除錯工具
└── tests/           # 測試檔案
    └── OLD_TESTS/   # 舊測試
```

#### 3.2 拆分 system.js

將 `system.js` (122KB) 拆分成模組：
- `src/services/storage.js` - STORAGE_MANAGER
- `src/services/login.js` - LOGIN_MANAGER  
- `src/services/sync.js` - SYNC_MANAGER
- `src/ui/manager.js` - UI_MANAGER
- `src/ui/record-form.js` - 記錄表單邏輯
- `src/ui/record-list.js` - 記錄列表邏輯

保留 `system.js` 作為入口點，引入所有模組並綁定到 window。

## 備註

所有改動都在 `refactor/cleanup-and-reorganize` 分支上進行，
完成後將透過 PR 合併到 main。

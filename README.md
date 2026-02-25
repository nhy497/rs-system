# 🎯 跳繩課堂 Checkpoint 記錄系統

輕量級課堂評估工具，專為繩跳教練設計：快速輸入、localStorage 儲存、CSV 匯出、按班別分組、備注、歷史重溫。

---

## 🚀 快速開始

### 🌐 線上使用
直接訪問：**https://nhy497.github.io/rs-system/**

### 💻 本地開發

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 構建生產版
npm run build

# 預覽構建結果
npm run preview

# 運行測試
npm test
```

---

## 📚 文檔導航

### 🎯 新用戶
- [🚀 快速開始](./docs/getting-started/QUICK_START.md) - 5分鐘上手
- [📌 快速參考](./docs/getting-started/QUICK_REFERENCE.md) - 常用功能
- [❓ 常見問題](./docs/user-guide/FAQ.md) - FAQ

### 💻 開發者
- [💻 開發指南](./docs/development/DEVELOPER_GUIDE.md) - 環境設置
- [🧪 測試指南](./docs/development/TESTING_GUIDE.md) - 測試流程
- [🎨 編碼規範](./docs/development/CODING_STANDARDS.md) - 代碼規範
- [🤝 貢獻指南](./docs/development/CONTRIBUTION.md) - 如何貢獻

### ⚙️ 管理員
- [⚙️ 部署指南](./docs/deployment/DEPLOYMENT_GUIDE.md) - 部署流程
- [🔄 CI/CD](./docs/deployment/CI_CD_GUIDE.md) - 自動化部署
- [🔐 權限管理](./docs/admin/PERMISSION_GUIDE.md) - 用戶權限

### 📊 架構與 API
- [🏗️ 系統架構](./docs/architecture/SYSTEM_ARCHITECTURE.md) - 架構設計
- [📊 數據模型](./docs/architecture/DATA_MODEL.md) - 數據結構
- [🔧 API 文檔](./docs/api/INTEGRATION_GUIDE.md) - 集成指南

### 📝 變更記錄
- [📝 CHANGELOG](./docs/changelog/CHANGELOG.md) - 變更日誌
- [📊 ROADMAP](./docs/changelog/ROADMAP.md) - 路線圖
- [🔄 升級指南](./docs/changelog/UPGRADE_GUIDE.md) - 版本升級

### 📚 完整文檔中心
👉 [文檔中心首頁](./docs/README.md) - 所有文檔的統一入口

---

## ✨ 主要功能

- ✅ **模組化架構** - 26個獨立模組，按需載入
- ✅ **快速輸入** - 直覺的表單設計
- ✅ **本地儲存** - 使用 localStorage + PouchDB 離線同步
- ✅ **CSV 匯出** - 一鍵匯出所有記錄
- ✅ **班別管理** - 按班別分組查看
- ✅ **歷史記錄** - 快速重溫歷史課程
- ✅ **響應式設計** - 支持電腦和移動裝置
- ✅ **離線使用** - 無需網路連線
- ✅ **向後相容** - 支援舊版 API
- ✅ **開發工具** - 完整的開發與測試環境

---

## 🛠️ 技術棧

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **模組系統**: ES6 Modules, Vite
- **存儲**: localStorage, PouchDB (離線同步)
- **構建工具**: Vite, Vitest
- **部署**: GitHub Pages + GitHub Actions
- **UI 組件**: 原生 Toast, Modal
- **開發工具**: ESLint, Prettier, TypeScript

詳細請參考：[🛠️ 技術棧文檔](./docs/architecture/TECH_STACK.md)

---

## 📂 檔案結構

```
rs-system/
├── README.md                    # 主 README
├── package.json                 # 項目配置
├── vite.config.js               # Vite 配置
│
├── .github/                     # GitHub 配置
│   └── workflows/
│       └── deploy.yml           # CI/CD 配置
│
├── src/                         # 🔥 模組化源碼
│   ├── index.js                 # 瀏覽器入口點
│   ├── main.js                  # 主 API 匯出
│   ├── init/                    # 初始化模組 (Phase 4)
│   │   ├── app-init.js
│   │   ├── login-page-init.js
│   │   └── config.js
│   ├── core/                    # 核心模組 (Phase 2)
│   │   ├── storage-manager.js
│   │   ├── login-manager.js
│   │   └── auth-config.js
│   ├── services/                # 服務層 (Phase 2)
│   │   ├── storage-service.js
│   │   ├── records-service.js
│   │   ├── presets-service.js
│   │   ├── users-service.js
│   │   └── validation-service.js
│   ├── ui/                      # UI 管理 (Phase 3)
│   │   ├── ui-manager.js
│   │   ├── form-manager.js
│   │   ├── tricks-manager.js
│   │   ├── attachments-manager.js
│   │   ├── list-renderer.js
│   │   ├── modal-manager.js
│   │   └── event-handlers.js
│   ├── utils/                   # 工具函數 (Phase 1)
│   │   ├── dom-utils.js
│   │   ├── helpers.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── constants/               # 常數定義 (Phase 1)
│   │   └── app-constants.js
│   ├── compat/                  # 向後相容
│   │   └── legacy-bridge.js
│   ├── components/              # UI 組件
│   │   ├── Toast.js
│   │   └── Modal.js
│   └── examples/                # 使用範例
│       └── phase3-usage.js
│
├── public/                      # 靜態資源
│   ├── index.html              # 🚀 使用模組化系統
│   ├── login.html
│   ├── system.js               # 向後相容層
│   └── styles.css
│
├── tests/                       # 測試檔案
│   ├── test-modules.html
│   ├── test-phase2-modules.html
│   ├── test-phase3-modules.html
│   └── test-phase4-modules.html
│
├── dev/                         # 開發工具
├── tools/                       # 工具腳本
│
└── docs/                        # 📚 文檔中心 ⭐
    ├── README.md                # 文檔首頁
    ├── getting-started/         # 入門指南
    ├── user-guide/              # 用戶手冊
    ├── development/             # 開發文檔
    ├── architecture/            # 架構文檔
    ├── api/                     # API 文檔
    ├── deployment/              # 部署文檔
    ├── admin/                   # 管理文檔
    ├── changelog/               # 變更記錄
    └── archive/                 # 歷史文檔
```

---

## 👥 貢獻

歡迎貢獻！請阅讀 [貢獻指南](./docs/development/CONTRIBUTION.md)。

### 如何貢獻
1. Fork 這個倉庫
2. 創建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的變更 (`git commit -m '✨ Add: some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

---

## 重要連結

- 線上系統：https://nhy497.github.io/rs-system/
- GitHub Repo：https://github.com/nhy497/rs-system
- CI/CD：https://github.com/nhy497/rs-system/actions
- Issues：https://github.com/nhy497/rs-system/issues
- Pull Requests：https://github.com/nhy497/rs-system/pulls

---

## 授權

MIT License - 詳見 [LICENSE](./LICENSE) 檔案

---

## 👏 致謝

感謝所有貢獻者和使用者的支持！

---

**版本**: v3.1.0  
**最後更新**: 2026-02-25  
**維護者**: Development Team  
**架構**: 模組化 ES6 + Vite

---

📚 **完整文檔**: 請查看 [文檔中心](./docs/README.md)

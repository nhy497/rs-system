# 🚀 部署指南

## 部署方式

### GitHub Pages 部署（推薦）

RS-System 使用 GitHub Pages 進行自動部署。

#### 前置需求
- GitHub 帳號
- Fork 或 Clone 專案
- 推送權限

#### 自動部署流程

1. **推送代碼到 main 分支**
```bash
git add .
git commit -m "Update feature"
git push origin main
```

2. **GitHub Actions 自動執行**
   - 安裝依賴
   - 執行測試
   - 建置專案
   - 部署到 gh-pages 分支

3. **訪問部署網站**
   - URL: `https://[username].github.io/rs-system/`
   - 範例: https://nhy497.github.io/rs-system/

#### 查看部署狀態

1. 訪問 GitHub Actions 頁面：
   - `https://github.com/[username]/rs-system/actions`

2. 查看最新的工作流程執行狀態：
   - ✅ 綠色勾號：部署成功
   - ❌ 紅色叉號：部署失敗
   - 🟡 黃色圓點：正在執行

3. 點擊工作流程查看詳細日誌

## CI/CD 配置

### GitHub Actions 工作流程

配置檔案：`.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 工作流程步驟

1. **Checkout**: 取得原始碼
2. **Setup Node.js**: 安裝 Node.js 18
3. **Install**: 安裝專案依賴
4. **Test**: 執行測試（可選）
5. **Build**: 建置生產版本
6. **Deploy**: 部署到 gh-pages 分支

## 本地建置

### 建置生產版本

```bash
# 安裝依賴
npm install

# 建置
npm run build
```

建置輸出位置：`dist/`

### 預覽建置結果

```bash
# 預覽建置結果
npm run preview
```

預覽地址：`http://localhost:4173/rs-system/`

### 建置配置

配置檔案：`vite.config.js`

```javascript
export default {
  base: '/rs-system/',  // GitHub Pages 路徑
  build: {
    outDir: 'dist',     // 輸出目錄
    assetsDir: 'assets' // 資源目錄
  }
}
```

## 環境配置

### 環境變量

當前版本使用 localStorage，不需要額外環境變量。

如果啟用 Firebase 同步功能，需要設定：

```bash
# .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Base Path 配置

根據部署環境調整 `vite.config.js` 中的 `base` 路徑：

```javascript
// GitHub Pages
base: '/rs-system/'

// 根路徑部署
base: '/'

// 自訂子路徑
base: '/custom-path/'
```

## 手動部署

### 部署到 GitHub Pages

```bash
# 1. 建置專案
npm run build

# 2. 進入建置目錄
cd dist

# 3. 初始化 git
git init
git add -A
git commit -m 'Deploy'

# 4. 推送到 gh-pages 分支
git push -f https://github.com/[username]/rs-system.git main:gh-pages

# 5. 返回專案根目錄
cd ..
```

### 部署到其他平台

#### Netlify

1. 連接 GitHub 倉庫
2. 設定建置命令：`npm run build`
3. 設定發布目錄：`dist`
4. 部署

#### Vercel

1. 匯入專案
2. 自動偵測設定
3. 部署

#### 傳統主機

1. 建置專案：`npm run build`
2. 上傳 `dist/` 目錄內容到伺服器
3. 設定 Web 伺服器（Nginx, Apache）

## 部署檢查清單

部署前檢查：

- [ ] 所有測試通過：`npm test`
- [ ] 代碼檢查通過：`npm run lint`
- [ ] 建置成功：`npm run build`
- [ ] 本地預覽正常：`npm run preview`
- [ ] 提交訊息清晰
- [ ] 更新 CHANGELOG（如有重大變更）

## 回滾部署

如果需要回滾到之前的版本：

### 方法 1：Git 回滾

```bash
# 1. 查看提交歷史
git log --oneline

# 2. 回滾到特定版本
git revert <commit-hash>

# 3. 推送變更
git push origin main
```

### 方法 2：GitHub Actions 重新執行

1. 訪問 Actions 頁面
2. 選擇之前成功的工作流程
3. 點擊「Re-run all jobs」

## 故障排除

### 部署失敗

**症狀**：GitHub Actions 顯示紅色 ❌

**解決方法**：
1. 查看 Actions 日誌
2. 檢查錯誤訊息
3. 修復問題後重新推送

### 頁面 404

**症狀**：訪問部署網站顯示 404

**解決方法**：
1. 確認 GitHub Pages 已啟用
2. 檢查 `base` 路徑配置
3. 確認 `gh-pages` 分支存在
4. 等待幾分鐘讓 GitHub Pages 更新

### 資源載入失敗

**症狀**：CSS/JS 載入失敗

**解決方法**：
1. 檢查 `vite.config.js` 的 `base` 設定
2. 確認路徑正確
3. 清除瀏覽器快取

### 建置錯誤

**症狀**：`npm run build` 失敗

**解決方法**：
1. 清除 `node_modules`：`rm -rf node_modules`
2. 重新安裝：`npm install`
3. 重新建置：`npm run build`

## 效能優化

### 建置優化

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',           // 壓縮 JS
    cssMinify: true,            // 壓縮 CSS
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['pouchdb']  // 分離第三方庫
        }
      }
    }
  }
}
```

### 快取策略

- 設定適當的快取標頭
- 使用檔案雜湊（Vite 自動）
- 分離不常變更的資源

## 監控與日誌

### GitHub Actions 日誌

在 Actions 頁面查看：
- 建置時間
- 測試結果
- 部署狀態
- 錯誤訊息

### 部署通知

設定 GitHub 通知接收部署狀態更新

## 相關文檔

- [⚙️ CI/CD 指南](./archive/old-structure/deployment/CI_CD_GUIDE.md)
- [🌍 環境變量](./archive/old-structure/deployment/ENVIRONMENT.md)
- [🛠️ 開發指南](./development.md)
- [🧪 測試指南](./testing.md)

---

**提示**：首次部署可能需要幾分鐘，請耐心等待。

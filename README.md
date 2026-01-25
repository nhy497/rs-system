# 跳繩課堂 Checkpoint 記錄系統

輕量級課堂評估工具，專為繩跳教練設計：快速輸入、localStorage 儲存、CSV 匯出、按班別分組、備注、歷史重溫。

---

## 一、本地測試網站

### 方法 A：直接開啟（最簡單）

1. 在檔案總管開啟資料夾：`c:\Users\Ng\Cursor(1)`
2. 雙擊 **`index.html`**，用瀏覽器開啟  
   - 或在 Cursor 中對 `index.html` 右鍵 → **Reveal in File Explorer** → 雙擊 `index.html`

> 注意：用 `file://` 開啟時，多數功能正常；若之後用 GitHub Pages 的 `https://` 網址，體驗相同且更穩定。

### 方法 B：用本機 HTTP 伺服器（可避免部分 `file://` 限制）

若已安裝 **Node.js**：

```powershell
cd "c:\Users\Ng\Cursor(1)"
npx --yes serve .
```

依終端機提示在瀏覽器開啟 `http://localhost:3000`（或類似網址）。

若已安裝 **Python 3**：

```powershell
cd "c:\Users\Ng\Cursor(1)"
python -m http.server 8080
```

瀏覽器開啟：**http://localhost:8080**

### 建議測試項目

| 項目 | 操作 |
|------|------|
| 基本資料 | 填日期、班級、人數、備注後儲存 |
| 投入度 | 調整開心指數滑桿、點選課堂氣氛 |
| 技能 | 新增教學花式、掌握比例、預算/實際時間、技巧等級 |
| 團隊／心理／教練 | 滑桿、快速按鈕、數字欄位 |
| 儲存 | 點「儲存本堂記錄」，看右側統計與最近 10 堂、按班別是否更新 |
| 歷史 | 點「按班別」→ 選班別 → 點某一堂 → 看詳情 →「載入到表單」 |
| 清空 | 「清空本堂輸入」是否還原預設 |
| 匯出 | 「匯出全部記錄（CSV）」是否下載含備注的 CSV |
| 清除 | 「清除所有記錄」後統計與列表是否清空 |

---

## 二、連接 GitHub 並可透過網址存取

### 1. 安裝 Git（若尚未安裝）

1. 下載 [Git for Windows](https://git-scm.com/download/win)
2. 安裝時勾選 **「Add Git to PATH」**
3. 安裝完成後重開 Cursor 或終端機

### 2. 在 GitHub 建立新倉庫

1. 登入 [github.com](https://github.com) → 右上 **+** → **New repository**
2. 倉庫名稱例如：`rope-skip-checkpoint`
3. 選 **Public**，**不要**勾選 "Add a README"
4. 按 **Create repository**

### 3. 在專案資料夾初始化 Git 並推到 GitHub

在 **PowerShell** 或 **Cursor 終端機**執行（請把 `YOUR_USERNAME` 和 `rope-skip-checkpoint` 換成你的 GitHub 帳號與倉庫名）：

```powershell
cd "c:\Users\Ng\Cursor(1)"

git init
git add .
git commit -m "Initial: 跳繩課堂 Checkpoint 記錄系統"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rope-skip-checkpoint.git
git push -u origin main
```

若 GitHub 要求登入，可选用：

- **HTTPS**：使用 [Personal Access Token](https://github.com/settings/tokens) 當密碼；或  
- **GitHub CLI**：`gh auth login` 後再用 `git push`。

### 4. 用 GitHub Pages 發佈，讓網站可透過網址存取

1. 在 GitHub 打開你的倉庫：`https://github.com/YOUR_USERNAME/rope-skip-checkpoint`
2. 上方 **Settings** → 左側 **Pages**
3. **Source** 選 **Deploy from a branch**
4. **Branch** 選 `main`，資料夾選 **/ (root)**，按 **Save**
5. 等 1–2 分鐘，頁面會顯示網址，例如：  
   **https://YOUR_USERNAME.github.io/rope-skip-checkpoint/**

之後每次改動後執行：

```powershell
git add .
git commit -m "說明這次的修改"
git push
```

GitHub 會自動重新部署，數分鐘內即可用同一網址存取最新版本。

---

## 三、檔案結構

```
rs-system/
├── index.html          # 主頁（載入 system.js + styles.css + logger-service.js）
├── system.js           # 整合版核心邏輯 (v3.x)
├── styles.css          # 樣式
├── logger-service.js   # 日誌與審計
├── dev/                # 開發/測試工具（system-test, integration-check, PHASE3_INIT_CHECK 等）
├── .gitignore
└── README.md
```

> 開發測試頁與診斷腳本已移到 `dev/`，避免污染正式 localStorage。若需使用，請以開發模式開啟並確認不在正式環境下執行。

資料儲存在瀏覽器 **localStorage**，未上傳到 GitHub；換裝置或清除瀏覽器資料會遺失，重要記錄請多用 **「匯出全部記錄（CSV）」** 備份。

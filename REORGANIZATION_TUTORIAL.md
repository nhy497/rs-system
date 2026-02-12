# 📖 文檔重組腳本 - 執行教學

> 這個教學會一步步教你如何運行腳本,即使你完全不懂編程也能完成!

---

## 🎯 目標
將根目錄的 58+ 個文檔自動移動到 `docs/` 子目錄,整理項目結構

---

## 📋 前置準備

### ✅ 你需要:
1. **已安裝 Python** (通常 Windows/Mac 都已預裝)
2. **已 clone 的 rs-system 倉庫**
3. **下載的腳本文件** (`reorganize_docs.py`)

---

## 🚀 執行步驟

### 步驟 1: 下載腳本

腳本已經在倉庫中,你可以:
1. 從 GitHub 下載整個倉庫(如果還沒有)
2. 或者只下載 `reorganize_docs.py` 文件

---

### 步驟 2: 打開終端/命令提示字元

#### 🪟 Windows 用戶:
1. 按 `Win + R` 鍵
2. 輸入 `cmd` 然後按 Enter
3. 黑色的命令提示字元視窗會打開

#### 🍎 Mac 用戶:
1. 按 `Cmd + 空格` 打開 Spotlight
2. 輸入 `terminal` 然後按 Enter
3. 終端視窗會打開

---

### 步驟 3: 進入 rs-system 目錄

在終端中輸入以下命令(根據你的實際路徑調整):

#### 🪟 Windows 範例:
```cmd
cd C:\Users\YourName\Documents\rs-system
```

#### 🍎 Mac 範例:
```bash
cd ~/Documents/rs-system
```

**如何找到你的路徑?**
- 打開檔案總管/Finder
- 找到 rs-system 資料夾
- 在地址欄複製完整路徑

---

### 步驟 4: 運行腳本

在終端中輸入:

```bash
python reorganize_docs.py
```

或者(如果上面的不行):

```bash
python3 reorganize_docs.py
```

**🎉 你會看到:**
```
🚀 RS-System 文檔重組工具
============================================================
✅ 檢測到 Git 倉庫

📋 準備移動 58 個文件...
✅ 移動: BUG_TRACKING.md -> docs/archive/bug-tracking/bug_tracking_history.md
✅ 移動: TESTING_GUIDE.md -> docs/testing/testing_guide.md
✅ 移動: QA_REPORT.md -> docs/quality-assurance/qa_report.md
...
============================================================
📊 重組完成摘要:
  ✅ 成功移動: 45 個文件
  ⏭️  跳過: 13 個文件
  ❌ 錯誤: 0 個文件
============================================================

🎉 文件重組完成!

📌 下一步:
1. 檢查文件是否正確移動
2. 提交更改到 Git:
   git add .
   git commit -m "📁 重組文檔結構"
   git push origin main

按 Enter 鍵退出...
```

---

### 步驟 5: 驗證結果

打開 `rs-system` 資料夾,你應該看到:

```
rs-system/
├── docs/
│   ├── archive/          ← 歷史文檔都在這裡
│   ├── guides/           ← 使用指南
│   ├── testing/          ← 測試文檔
│   ├── quality-assurance/ ← QA 文檔
│   └── ...
├── index.html            ← 主要程式碼文件還在根目錄
├── login.html
└── ...
```

---

### 步驟 6: 推送到 GitHub

在終端中依次執行:

```bash
# 1. 查看更改
git status

# 2. 添加所有更改
git add .

# 3. 提交更改
git commit -m "📁 重組文檔結構 - 將根目錄文檔移至 docs/ 子目錄"

# 4. 推送到 GitHub
git push origin main
```

---

## ❓ 常見問題

### Q1: 提示 "python 不是內部或外部命令"
**解決方案:**
- Windows: 安裝 Python from [python.org](https://www.python.org/downloads/)
- Mac: 嘗試使用 `python3` 代替 `python`

### Q2: 提示 "❌ 錯誤:請在 rs-system 根目錄執行此腳本!"
**解決方案:**
- 確保你在 rs-system 資料夾中執行
- 使用 `cd` 命令進入正確的目錄

### Q3: 文件移動後原文件還在?
**這是正常的!**
- `shutil.move()` 會自動刪除原文件
- 如果你看到原文件還在,可能是因為:
  - 腳本還沒執行完
  - 發生了錯誤(檢查終端輸出)

### Q4: 我不想用命令行,有更簡單的方法嗎?
**有!雙擊運行:**
1. 確保 `reorganize_docs.py` 在 rs-system 目錄
2. **雙擊** `reorganize_docs.py` 文件
3. (Windows 可能需要選擇"用 Python 打開")
4. 腳本會自動運行並顯示結果

---

## 🎨 替代方案:手動整理

如果你真的不想用腳本,也可以:
1. 在 `rs-system` 中創建 `docs/` 資料夾
2. 手動拖放文件到對應的子目錄
3. 參考腳本中的文件映射表

**但這會很慢** (需要手動移動 58 個文件!)

---

## 🆘 需要幫助?

如果遇到任何問題:
1. 截圖錯誤訊息
2. 告訴我你的操作系統 (Windows/Mac)
3. 我會幫你解決!

---

**祝你重組順利!** 🎉

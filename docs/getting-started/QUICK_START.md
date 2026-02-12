# 🚀 快速開始指南

> **歡迎使用 RS-System ！**  
> 這是一個輕量級的跳繩課堂記錄系統，專為教練設計。

---

## 🎯 5 分鐘快速上手

### 步驟 1: 訪問系統

**線上版本** (推薦):
```
https://nhy497.github.io/rs-system/
```

**本地版本**:
1. 克隆 repository
2. 雙擊 `index.html`

### 步驟 2: 登入系統

預設測試帳號：
```
教練帳號:
- 用戶名: coach1
- 密碼: coach123

創作者帳號:
- 用戶名: creator
- 密碼: creator123
```

### 步驟 3: 新增課程記錄

1. 選擇「課程概覽」頁面
2. 填寫基本資料：
   - 日期
   - 班級名稱
   - 學生人數
   - 備註
3. 評分各個項目
4. 點擊「保存本堂記錄」

### 步驟 4: 查看統計

1. 點擊「統計分析」頁面
2. 查看：
   - 最近 10 堂課程
   - 按班別統計
   - 課程詳情

### 步驟 5: 匯出數據

1. 點擊「匯出全部記錄 (CSV)」
2. 下載 CSV 檔案
3. 使用 Excel 或 Google Sheets 打開

---

## 💻 本地開發設置

### 方法 A: 直接開啟 (最簡單)

```bash
# 1. 克隆 repository
git clone https://github.com/nhy497/rs-system.git
cd rs-system

# 2. 雙擊 index.html
# 或使用 Live Server 擴充
```

### 方法 B: 使用 Vite 開發伺服器 (推薦)

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器
npm run dev

# 3. 打開瀏覽器
http://localhost:3000
```

### 方法 C: 使用 Python HTTP Server

```bash
# Python 3
python -m http.server 8080

# 然後訪問
http://localhost:8080
```

---

## 📝 常見任務

### 新增課程記錄
1. 登入系統
2. 選擇「課程概覽」
3. 填寫表單
4. 保存記錄

### 編輯與現記錄
1. 在「統計分析」找到記錄
2. 點擊「載入到表單」
3. 修改內容
4. 保存更新

### 匯出數據
1. 點擊「匯出 CSV」按鈕
2. 選擇儲存位置
3. 用 Excel 打開

### 清除資料
1. 點擊「清除所有記錄」
2. 確認刪除
3. 數據會從 localStorage 移除

---

## ❓ 常見問題

### Q: 數據儲存在哪裡？
A: 數據儲存在瀏覽器的 localStorage 中，不會上傳到伺服器。

### Q: 換電腦後數據會不見嗎？
A: 是的，因為 localStorage 是本地儲存。請定期匯出 CSV 備份。

### Q: 如何備份數據？
A: 使用「匯出 CSV」功能，定期下載備份檔案。

### Q: 可以多人同時使用嗎？
A: 目前為單機版本。多人使用需要 Firebase 或後端支持（在開發中）。

### Q: 支持哪些瀏覽器？
A: 
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+

---

## 👥 用戶角色

### 教練 (Coach)
- 可以新增、編輯自己的課程記錄
- 可以查看自己的統計數據
- 可以匯出自己的 CSV

### 創作者 (Creator)
- 可以查看所有教練的記錄
- 可以以測試模式新增記錄
- 可以管理系統設置

---

## 📊 系統功能

### 核心功能
- ✅ 課程記錄管理
- ✅ 學生資料管理
- ✅ 動作技能追蹤
- ✅ 統計分析報告
- ✅ CSV 匯出功能
- ✅ 班級預設管理

### 進階功能
- ✅ 跨標籤頁同步 (v3.1)
- ✅ 數據備份還原
- ✅ 自動保存
- ✅ 數據緩存

---

## 🔗 相關連結

- 🌐 [線上系統](https://nhy497.github.io/rs-system/)
- 🐙 [GitHub Repository](https://github.com/nhy497/rs-system)
- 📚 [完整文檔](../README.md)
- 🐛 [問題回報](https://github.com/nhy497/rs-system/issues)

---

## 🚀 下一步

現在你已經了解基本使用方法，接下來可以：

1. 📖 [閱讀用戶手冊](../user-guide/USER_MANUAL.md) - 完整功能說明
2. 💻 [查看開發指南](../development/DEVELOPER_GUIDE.md) - 如果想貢獻代碼
3. ❓ [常見問題 FAQ](../user-guide/FAQ.md) - 更多問題解答

---

**版本**: v3.1  
**最後更新**: 2026-02-12

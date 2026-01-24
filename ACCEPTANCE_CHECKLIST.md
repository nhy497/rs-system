# ✅ 系統驗收清單

**驗收日期**: 2026 年 1 月 24 日  
**系統版本**: v2.1.1  
**驗收人**: 用戶

---

## 📋 驗收步驟

### 第一步：驗證 Creator 賬戶自動創建

**操作**:
1. 清除瀏覽器 localStorage（F12 → Application → Clear site data）
2. 訪問 http://localhost:8000/login.html
3. 打開開發者工具，查看 Console

**預期結果**:
- [ ] Console 顯示「✅ 已自動創建默認 Creator 帳戶」
- [ ] Application → LocalStorage → users 鍵包含 creator 賬戶
- [ ] creator 賬戶有 role: "creator" 字段

**驗證方法**:
```javascript
// 在 Console 中執行
JSON.stringify(JSON.parse(localStorage.getItem('users')), null, 2)
// 應該看到包含 creator 的用戶列表
```

---

### 第二步：驗證 Creator 登入

**操作**:
1. 在登入頁輸入：
   - 用戶名: `creator`
   - 密碼: `1234`
2. 點擊「登入」按鈕
3. 等待頁面重定向

**預期結果**:
- [ ] 頁面重定向到 index.html
- [ ] 沒有被踢回 login.html
- [ ] 側邊欄左上角顯示「creator」

**檢查 Console**:
```
✅ 會話驗證成功！用戶 creator 已登入
✅ 側邊欄用戶名已更新: creator
✅ 側邊欄角色已更新: creator
✅ 數據管理菜單可見性: ✓ 顯示
```

---

### 第三步：驗證用戶身份識別修復

**操作**:
1. 登入後檢查側邊欄

**預期結果**:
- [ ] 用戶名欄顯示: `creator`
- [ ] 角色欄顯示: `👑 Creator`
- [ ] 不是「未登入」或「訪客」

**驗證代碼**:
```javascript
document.getElementById('sidebarUserName').textContent // 應該是 'creator'
document.getElementById('sidebarUserRole').textContent // 應該是 '👑 Creator'
```

---

### 第四步：驗證菜單可見性

**操作**:
1. 查看側邊欄左側菜單

**預期結果**:
- [ ] 「課堂概覽」、「學生管理」、「動作記錄」、「統計分析」都可見
- [ ] 「用戶管理」菜單項**可見**（因為是 Creator）
- [ ] 「導出數據」和「系統設置」可見

---

### 第五步：驗證動態統計儀表板

**操作**:
1. 查看側邊欄統計區
2. 創建一個課堂記錄：
   - 日期：今天
   - 班級：A班
   - 人數：10
3. 檢查統計是否更新

**預期結果**:
- [ ] 「今日課堂」顯示一個數字（今天的記錄數）
- [ ] 「學生總數」顯示一個數字（累計人數）
- [ ] 不是硬編碼的零值
- [ ] 創建新記錄後，統計自動更新

**驗證代碼**:
```javascript
// 檢查統計數據
document.getElementById('todayCount').textContent   // 應該 > 0
document.getElementById('totalStudents').textContent // 應該 > 0
```

---

### 第六步：驗證「用戶管理」頁面

**操作**:
1. 在側邊欄點擊「用戶管理」（工具區）
2. 或點擊主菜單中的「用戶管理」

**預期結果**:
- [ ] 頁面顯示「👥 系統用戶」卡片
- [ ] 頁面顯示「📊 系統統計」卡片
- [ ] 列出所有用戶（至少 creator）
- [ ] 統計顯示：
  - 總用戶數
  - Creator 數
  - 普通用戶數

---

### 第七步：驗證賬戶刪除功能

**操作**:
1. 創建一個普通用戶（用另一個瀏覽器或隱私模式）：
   - 用戶名: `testuser`
   - 密碼: `test123`
   - 郵箱: `test@example.com`
2. 回到 creator 登入的頁面
3. 刷新「用戶管理」頁面
4. 找到 `testuser` 用戶
5. 點擊「刪除」按鈕

**預期結果**:
- [ ] 出現確認對話框：「確定要刪除用戶「testuser」嗎？」
- [ ] 點擊「確定」
- [ ] 用戶被刪除
- [ ] 統計數據自動更新

**檢查 Console**:
```
✓ 已刪除用戶「testuser」
```

---

### 第八步：驗證當前用戶保護

**操作**:
1. 在「用戶管理」頁面查看 creator 用戶條目

**預期結果**:
- [ ] creator 用戶旁邊**沒有**「刪除」按鈕
- [ ] 顯示「⚠️ 無法刪除當前用戶」

---

### 第九步：驗證普通用戶權限

**操作**:
1. 登出（點擊側邊欄「登出」按鈕）
2. 用 `testuser` 登入（或創建新用戶）
3. 等待頁面加載

**預期結果**:
- [ ] 側邊欄顯示用戶名
- [ ] 側邊欄顯示「👤 用戶」角色
- [ ] 「用戶管理」菜單項**不可見**
- [ ] 「用戶管理」頁面不可訪問

**驗證代碼**:
```javascript
document.getElementById('navData').hidden // 應該是 true
```

---

### 第十步：驗證統計分析頁面

**操作**:
1. 作為普通用戶或 Creator，點擊「統計分析」
2. 創建幾條課堂記錄
3. 檢查統計數據

**預期結果**:
- [ ] 「統計分析」頁面加載成功
- [ ] 顯示「總記錄」、「本週」、「平均」等信息
- [ ] 數據基於實際記錄計算（非硬編碼零值）
- [ ] 班別統計正確更新

---

## 🔍 詳細檢查項

### localStorage 結構檢查

**執行以下代碼查看 localStorage**:
```javascript
// 查看 users 列表
console.table(JSON.parse(localStorage.getItem('users')));

// 查看當前用戶
console.log(JSON.parse(localStorage.getItem('current-user')));

// 查看會話
console.log(JSON.parse(localStorage.getItem('rs-system-session')));
```

**應該看到**:
- [ ] `users` 包含多個用戶，每個都有 `role` 字段
- [ ] `current-user` 包含 `role` 字段
- [ ] `rs-system-session` 包含 `role` 字段

### DOM 元素檢查

```javascript
// 檢查必要的 DOM 元素
document.getElementById('sidebarUserName')      // ✓ 存在
document.getElementById('sidebarUserRole')      // ✓ 存在
document.getElementById('navData')              // ✓ 存在
document.getElementById('page-data')            // ✓ 存在
document.getElementById('usersList')            // ✓ 存在
document.getElementById('statTotalUsers')       // ✓ 存在
document.getElementById('todayCount')           // ✓ 存在
document.getElementById('totalStudents')        // ✓ 存在
```

### 函數檢查

```javascript
// 檢查必要的函數是否存在
typeof isCreator            // 應該是 'function'
typeof getCurrentUser       // 應該是 'function'
typeof deleteUser          // 應該是 'function'
typeof updateSidebarStats  // 應該是 'function'
typeof refreshDataManagement // 應該是 'function'
```

---

## 🧪 測試場景總結

| # | 場景 | 預期結果 | 驗收 |
|----|------|---------|------|
| 1 | Creator 自動創建 | ✅ 創建成功 | [ ] |
| 2 | Creator 登入 | ✅ 登入成功 | [ ] |
| 3 | 用戶身份識別 | ✅ 顯示正確 | [ ] |
| 4 | 菜單可見性 | ✅ Creator 可見 | [ ] |
| 5 | 動態統計 | ✅ 實時更新 | [ ] |
| 6 | 用戶管理頁面 | ✅ 加載成功 | [ ] |
| 7 | 刪除用戶 | ✅ 刪除成功 | [ ] |
| 8 | 當前用戶保護 | ✅ 無法刪除 | [ ] |
| 9 | 普通用戶權限 | ✅ 受限訪問 | [ ] |
| 10 | 統計分析 | ✅ 數據正確 | [ ] |

---

## ⚠️ 常見問題

### Q: Creator 賬戶沒有被創建怎麼辦？

**A**: 
1. 清除所有 localStorage：`localStorage.clear()`
2. 重新載入頁面：`location.reload()`
3. 檢查 Console 是否有錯誤信息

### Q: 登入後「未登入」怎麼辦？

**A**:
1. 檢查 `current-user` 是否存在：`localStorage.getItem('current-user')`
2. 檢查 `sidebarUserName` 元素是否存在
3. 查看 Console 的第六步 UI 更新日誌

### Q: 「用戶管理」不顯示怎麼辦？

**A**:
1. 驗證當前用戶的 role：`JSON.parse(localStorage.getItem('current-user')).role`
2. 應該是 `'creator'`（注意大小寫）
3. 檢查 `navData` 元素的 `hidden` 屬性

### Q: 統計數據為零怎麼辦？

**A**:
1. 創建至少一個課堂記錄
2. 檢查記錄是否有 `classSize` 字段
3. 執行 `updateSidebarStats()` 強制刷新

---

## ✅ 最終驗收

**所有檢查項已完成**: [ ]

**簽署**:
- 驗收人: ________________
- 驗收日期: ________________
- 狀態: ✅ **通過** / ❌ **未通過**

**備註**:
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 📞 技術支持

如有任何問題，請查閱：
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速參考
2. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 測試指南  
3. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 實現詳情
4. [PROJECT_COMPLETION_REPORT.md](./PROJECT_COMPLETION_REPORT.md) - 完成報告

---

**驗收清單版本**: 1.0  
**最後更新**: 2026 年 1 月 24 日

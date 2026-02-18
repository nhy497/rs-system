# 快速參考指南 - 系統功能實現

## 🚀 快速開始

### 默認 Creator 賬戶
- **用戶名**: `creator`
- **密碼**: `1234`
- **角色**: Creator（管理員）
- **說明**: 系統首次訪問時自動創建

### 測試用戶流程
1. 用 creator/1234 登入 → 看到 👑 Creator 標籤
2. 創建普通用戶 (註冊) → 登入後看到 👤 用戶 標籤
3. 以 creator 身份登入 → 可見「用戶管理」菜單
4. 點擊「用戶管理」→ 可以刪除其他用戶

---

## 📁 修改文件快查

### index.html
**修改項**: 用戶身份識別修復  
**位置**: 第六步 UI 更新 (行 803-825)  
**內容**:
```javascript
// 顯示用戶名和角色
userNameEl.textContent = userData.username;
userRoleEl.textContent = role === 'creator' ? '👑 Creator' : '👤 用戶';

// 根據角色顯示/隱藏菜單
navData.hidden = userData.role !== 'creator';
```

### login.html
**修改項** (3 處):
1. **Creator 自動創建** (行 500-516)
   - 檢查 users 列表是否已有 creator
   - 如果不存在，自動創建並添加 role 字段

2. **登入時添加 role** (行 337-348)
   - 將 role 字段添加到 current-user 和 rs-system-session

3. **註冊時添加 role** (行 440-448)
   - 新用戶默認 role 為 'user'

### app.js
**修改項** (5 處):

1. **權限函數** (行 309-317)
```javascript
function isCreator() { return getCurrentUser()?.role === 'creator'; }
function getCurrentUser() { return JSON.parse(localStorage.getItem('current-user')); }
```

2. **用戶列表渲染** (行 328-367)
   - 顯示用戶列表和刪除按鈕
   - 當前用戶無刪除按鈕

3. **刪除用戶函數** (行 372-395)
   - 檢查權限、當前用戶、刪除確認
   - 刪除後自動刷新

4. **統計數據修復** (行 103-114)
   - 用 classSize 而非硬編碼的零值
   - 侧邊欄動態更新

5. **用戶信息更新** (行 116-138)
   - 修正 updateUserInfo 函數
   - 正確顯示角色和控制菜單可見性

---

## 🔑 關鍵變數和函數

### localStorage 結構
```javascript
// users - 用戶列表
[
  {
    id: "...",
    username: "creator",
    password: "1234",
    email: "creator@system.local",
    role: "creator",
    createdAt: "2026-01-24T..."
  }
]

// current-user - 當前登入用戶
{
  id: "...",
  username: "creator",
  email: "creator@system.local",
  role: "creator",
  loginTime: "2026-01-24T..."
}

// rs-system-session - 會話數據
{
  userId: "...",
  username: "creator",
  role: "creator",
  loginTime: "2026-01-24T...",
  lastActivity: "2026-01-24T..."
}
```

### 核心函數

#### `isCreator()`
```javascript
// 檢查當前用戶是否為 Creator
return localStorage.getItem('current-user')?.role === 'creator';
```

#### `getCurrentUser()`
```javascript
// 獲取當前登入用戶信息
return JSON.parse(localStorage.getItem('current-user'));
```

#### `deleteUser(userId, username)`
```javascript
// Creator 可用函數，刪除指定用戶
// - 驗證 Creator 身份
// - 防止刪除當前用戶
// - 需要確認對話框
```

#### `updateSidebarStats()`
```javascript
// 更新側邊欄統計
// 計算: 今日課堂數, 學生總數 (動態)
```

---

## 🔐 權限控制規則

| 功能 | Creator | 普通用戶 |
|------|---------|---------|
| 登入/登出 | ✅ | ✅ |
| 查看統計分析 | ✅ | ✅ |
| 訪問「用戶管理」 | ✅ | ❌ |
| 刪除用戶 | ✅ | ❌ |
| 查看用戶列表 | ✅ | ❌ |
| 查看系統統計 | ✅ | ❌ |

---

## 🧪 測試檢查清單

### 功能測試
- [ ] Creator 賬戶自動創建
- [ ] 能用 creator/1234 登入
- [ ] 側邊欄顯示正確用戶名和角色
- [ ] 側邊欄統計數據動態更新
- [ ] Creator 可見「用戶管理」菜單
- [ ] 普通用戶無「用戶管理」菜單
- [ ] 可以成功刪除用戶
- [ ] 無法刪除當前登入用戶

### 數據驗證
- [ ] localStorage 中 users 有 creator 賬戶
- [ ] current-user 包含 role 字段
- [ ] rs-system-session 包含 role 字段
- [ ] 統計數據基於實際記錄計算

---

## 🐛 常見問題排查

### Q: Creator 賬戶未創建
**A**: 清除 localStorage → 重新載入頁面
```javascript
localStorage.clear();
location.reload();
```

### Q: 「用戶管理」不顯示
**A**: 驗證 role 字段
```javascript
const user = JSON.parse(localStorage.getItem('current-user'));
console.log(user.role); // 應該是 'creator'
```

### Q: 統計數據為 0
**A**: 創建課堂記錄並檢查 classSize 字段
```javascript
const records = JSON.parse(localStorage.getItem('rope-skip-checkpoints') || '[]');
console.log(records); // 檢查是否有數據
```

### Q: 刪除按鈕不出現
**A**: 確保以 creator 身份登入
```javascript
const isCreator = JSON.parse(localStorage.getItem('current-user')).role === 'creator';
console.log(isCreator); // 應該是 true
```

---

## 📊 數據流圖

```
用戶登入
  ↓
驗證用戶名/密碼 (from localStorage.users)
  ↓
保存會話:
  - rs-system-session (userId, username, role, loginTime)
  - current-user (id, username, email, role, loginTime)
  ↓
index.html 初始化
  - 驗證會話
  - 更新 UI (用戶名, 角色)
  - 根據角色顯示/隱藏菜單
  ↓
應用運行
  - Creator 可訪問「用戶管理」
  - 普通用戶無法訪問
  - 所有用戶都能查看統計分析
  ↓
登出
  - 清除 rs-system-session
  - 清除 current-user
  - 保留 users 列表
  - 重定向到 login.html
```

---

## 💾 備份和恢復

### 導出所有用戶數據
```javascript
const users = JSON.parse(localStorage.getItem('users'));
console.log(JSON.stringify(users, null, 2));
// 複製輸出並保存到文件
```

### 手動恢復用戶數據
```javascript
const usersData = [ /* 粘貼之前的數據 */ ];
localStorage.setItem('users', JSON.stringify(usersData));
location.reload();
```

---

## 🔄 更新和維護

### 增加新的 Creator 用戶
```javascript
// 在瀏覽器控制台執行
const users = JSON.parse(localStorage.getItem('users') || '[]');
const newCreator = {
  id: Date.now().toString(),
  username: 'admin2',
  password: 'newpass',
  email: 'admin2@system.local',
  role: 'creator',
  createdAt: new Date().toISOString()
};
users.push(newCreator);
localStorage.setItem('users', JSON.stringify(users));
location.reload();
```

### 升級普通用戶為 Creator
```javascript
const users = JSON.parse(localStorage.getItem('users'));
const user = users.find(u => u.username === 'targetuser');
if (user) {
  user.role = 'creator';
  localStorage.setItem('users', JSON.stringify(users));
  location.reload();
}
```

---

## 📚 相關文檔

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 詳細實現報告
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 完整測試指南
- [SESSION_BREAKAGE_ROOT_CAUSE_ANALYSIS.md](./SESSION_BREAKAGE_ROOT_CAUSE_ANALYSIS.md) - 會話問題分析

---

**最後更新**: 2026 年 1 月 24 日  
**系統版本**: v2.1.1  
**文檔版本**: 1.0

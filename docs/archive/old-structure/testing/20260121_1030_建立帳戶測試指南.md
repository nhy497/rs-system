# 建立帳戶功能測試指南

## 📋 目錄
- [快速開始](#快速開始)
- [詳細步驟](#詳細步驟)
- [troubleshooting](#troubleshooting)
- [帳戶數據結構](#帳戶數據結構)
- [驗證檢查清單](#驗證檢查清單)

---

## 🚀 快速開始

### 方式1：使用測試工具（推薦）
1. 在瀏覽器中打開：`signup-test.html`
2. 左側填寫帳戶信息，點擊「✅ 建立帳戶」
3. 右側iframe會自動顯示建立帳戶界面
4. 在右側iframe中點擊「🔓 建立新帳戶」按鈕
5. 填寫表單並提交
6. 查看左側的日誌確認是否成功

### 方式2：直接測試（簡單方式）
1. 在瀏覽器中打開：`login.html`
2. 點擊「建立新帳戶」按鈕
3. 填寫表單：
   - 使用者名稱：任意（例如：john_doe）
   - 密碼：4個或以上字符（例如：pass123）
   - 電郵：可選
4. 點擊「建立帳戶」按鈕
5. 看到成功提示後，會自動回到登入界面
6. 用新建立的帳號測試登入

---

## 📝 詳細步驟

### 步驟1：開啟登入界面
```
打開 login.html
↓
看到登入表單（初始狀態）
```

**預期結果**：
- ✅ 看到「使用者名稱」和「密碼」輸入框
- ✅ 看到「建立新帳戶」超連結按鈕

---

### 步驟2：點擊「建立新帳戶」按鈕
```
界面上有這樣的按鈕：
┌─────────────────────────┐
│ 沒有帳戶?               │
│ [建立新帳戶] ← 點擊這個 │
└─────────────────────────┘
```

**預期結果**：
- ✅ 登入表單消失
- ✅ 出現新的註冊表單，包含：
  - 使用者名稱欄位
  - 密碼欄位
  - 電郵欄位（可選）
  - 「建立帳戶」按鈕
- ✅ 下方出現「已有帳戶?」和「返回登入」超連結

---

### 步驟3：填寫註冊表單
```
使用者名稱: john_doe
密碼:      pass123
電郵:      john@example.com (可留空)
```

**表單驗證規則**：
| 字段 | 必填 | 最少長度 | 備註 |
|------|------|--------|------|
| 使用者名稱 | ✅ | 1 | 必須唯一 |
| 密碼 | ✅ | 4 | 英文/數字/特殊字符皆可 |
| 電郵 | ❌ | N/A | 郵件格式需正確 |

---

### 步驟4：點擊「建立帳戶」按鈕

**預期流程**：
1. 按鈕變為灰色並顯示「建立中...」
2. 表單被臨時禁用
3. 進行以下驗證：
   - ✅ 檢查使用者名稱不為空
   - ✅ 檢查密碼不為空
   - ✅ 檢查密碼長度 ≥ 4
   - ✅ 檢查使用者名稱是否已存在
   - ✅ 檢查localStorage是否可用

4. 如果驗證通過：
   - 新用戶被保存到localStorage
   - 顯示成功訊息：「✅ 帳戶建立成功！請用新帳號登入」
   - 表單自動清除
   - 1.5秒後自動回到登入界面
   - 用戶名欄位預填新建立的用戶名
   - 密碼欄位獲得焦點（可直接輸入密碼）

5. 如果驗證失敗，會顯示相應的錯誤訊息

---

### 步驟5：驗證帳戶已建立
```
方式A：在瀏覽器開發者工具（F12）中執行：
console.log(JSON.parse(localStorage.getItem('users')))

結果應該顯示：
[
  {
    "id": "1705833000123",
    "username": "john_doe",
    "password": "pass123",
    "email": "john@example.com",
    "createdAt": "2026-01-21T10:30:00Z"
  }
]

方式B：使用測試工具
1. 打開 signup-test.html
2. 點擊「📊 查看所有用戶」按鈕
3. 底部日誌會顯示所有已註冊的用戶
```

---

### 步驟6：用新帳號測試登入
```
使用者名稱: john_doe
密碼:      pass123

點擊 [登入] 按鈕

預期結果：
✅ 顯示成功訊息
✅ 導向到主應用（index.html）
✅ localStorage保存會話信息
```

---

## 🔍 Troubleshooting

### 問題1：點擊「建立新帳戶」沒有反應
**可能原因**：
1. JavaScript未正確加載
2. 事件監聽器未正確綁定

**解決方案**：
```javascript
// 在瀏覽器開發者工具（F12）中執行以下命令：
// 檢查按鈕是否存在
console.log(document.getElementById('switchToSignup'))
// 應該輸出：<button type="button" class="btn-toggle" id="switchToSignup">...

// 檢查CSS類是否設置
console.log(document.getElementById('signupSection').classList)
// 檢查是否包含 'active' 類

// 手動測試表單切換
document.getElementById('signupSection').classList.add('active')
document.getElementById('loginSection').classList.remove('active')
// 註冊表單應該立即顯示
```

### 問題2：「建立帳戶」後沒有顯示成功訊息
**可能原因**：
1. localStorage被禁用
2. 瀏覽器隱私模式（localStorage有限）

**解決方案**：
```javascript
// 檢查localStorage是否可用
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('✅ localStorage 正常工作');
} catch(e) {
  console.log('❌ localStorage 不可用：', e.message);
}
```

### 問題3：無法登入新建立的帳號
**可能原因**：
1. 密碼輸入錯誤（注意大小寫）
2. 帳號未被正確保存

**解決方案**：
```javascript
// 查看已註冊的所有帳號和密碼
const users = JSON.parse(localStorage.getItem('users') || '[]');
users.forEach(user => {
  console.log(`用戶名: ${user.username}, 密碼: ${user.password}`);
});

// 嘗試手動登入
const username = 'john_doe';
const password = 'pass123';
const user = users.find(u => u.username === username && u.password === password);
console.log(user ? '✅ 帳號和密碼匹配' : '❌ 未找到匹配的帳號');
```

### 問題4：使用者名稱已存在錯誤
**可能原因**：
- 使用的用戶名已被其他帳號使用

**解決方案**：
```javascript
// 查看所有已用的用戶名
const users = JSON.parse(localStorage.getItem('users') || '[]');
const usernames = users.map(u => u.username);
console.log('已用的用戶名：', usernames);

// 如果要清除所有數據重新開始
localStorage.removeItem('users');
localStorage.setItem('users', JSON.stringify([]));
console.log('✅ 已清除所有用戶，可以重新建立');
```

### 問題5：表單提交後沒有反應
**可能原因**：
1. 密碼太短（少於4個字符）
2. 必填欄位未填寫
3. 瀏覽器console有JavaScript錯誤

**解決方案**：
```javascript
// 打開瀏覽器的開發者工具 (F12)
// 查看 Console 標籤頁，看是否有紅色錯誤訊息
// 檢查密碼長度
const password = 'abc';  // ❌ 太短
const password = 'abcd'; // ✅ 正確

// 檢查必填欄位
console.log('用戶名:', document.getElementById('signupUsername').value || '空');
console.log('密碼:', document.getElementById('signupPassword').value || '空');
```

---

## 💾 帳戶數據結構

### localStorage中的「users」鍵
```json
{
  "users": [
    {
      "id": "1705833000123",
      "username": "john_doe",
      "password": "pass123",
      "email": "john@example.com",
      "createdAt": "2026-01-21T10:30:00Z"
    },
    {
      "id": "1705833060456",
      "username": "jane_smith",
      "password": "jane1234",
      "email": null,
      "createdAt": "2026-01-21T10:31:00Z"
    }
  ]
}
```

### 帳戶對象的字段說明

| 字段 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | String | ✅ | 唯一識別符，使用時間戳生成 |
| `username` | String | ✅ | 登入用用戶名，必須唯一 |
| `password` | String | ✅ | 登入用密碼，明文存儲 |
| `email` | String\|null | ❌ | 用戶電郵，可為null |
| `createdAt` | String | ✅ | 帳號建立時間（ISO格式） |

### 會話信息 (current-user鍵)
```json
{
  "current-user": {
    "id": "1705833000123",
    "username": "john_doe",
    "email": "john@example.com",
    "loginTime": "2026-01-21T10:35:00Z"
  }
}
```

---

## ✅ 驗證檢查清單

使用此清單驗證建立帳戶功能是否完全正常：

### UI/UX 檢查
- [ ] 初始顯示登入表單（不是註冊表單）
- [ ] 「建立新帳戶」按鈕清晰可見
- [ ] 點擊後立即切換到註冊表單
- [ ] 註冊表單包含所有必需欄位
- [ ] 能夠切換回登入表單
- [ ] 表單清潔、無視覺錯誤

### 功能檢查
- [ ] 提交空表單顯示錯誤訊息
- [ ] 密碼少於4個字符顯示錯誤
- [ ] 重複用戶名顯示錯誤訊息
- [ ] 成功建立帳號顯示成功訊息
- [ ] 自動切換回登入表單
- [ ] 用戶名欄位自動預填

### 數據檢查
- [ ] 新帳號保存到localStorage
- [ ] 帳號信息完整（id、username、password等）
- [ ] 帳號可以用來登入
- [ ] 會話信息正確保存
- [ ] 登出後會話被清除

### 錯誤處理檢查
- [ ] 無效輸入顯示明確的錯誤訊息
- [ ] localStorage不可用時顯示友好提示
- [ ] 網路問題（如果適用）被適當處理
- [ ] 按鈕在操作期間被禁用以防止重複提交
- [ ] 錯誤訊息可以手動清除

### 兼容性檢查
- [ ] Chrome/Chromium正常工作
- [ ] Firefox正常工作
- [ ] Safari正常工作
- [ ] Edge正常工作
- [ ] 手機瀏覽器正常工作

---

## 🧪 快速測試命令

將以下命令複製到瀏覽器的開發者工具 (F12 → Console) 中執行：

### 1️⃣ 創建測試帳號
```javascript
(() => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const testUser = {
    id: Date.now().toString(),
    username: 'quicktest' + Math.random().toString(36).substring(7),
    password: 'test1234',
    email: 'test@example.com',
    createdAt: new Date().toISOString()
  };
  users.push(testUser);
  localStorage.setItem('users', JSON.stringify(users));
  console.log('✅ 測試帳號已建立:', testUser);
})();
```

### 2️⃣ 查看所有帳號
```javascript
const users = JSON.parse(localStorage.getItem('users') || '[]');
console.table(users.map(u => ({username: u.username, email: u.email, id: u.id.substring(0,8) + '...'})));
```

### 3️⃣ 測試登入
```javascript
(() => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.length === 0) {
    console.log('❌ 沒有帳號可用');
    return;
  }
  const user = users[0];
  localStorage.setItem('current-user', JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    loginTime: new Date().toISOString()
  }));
  console.log('✅ 測試登入成功:', user.username);
})();
```

### 4️⃣ 清除所有數據
```javascript
localStorage.removeItem('users');
localStorage.removeItem('current-user');
localStorage.removeItem('rs-system-session');
console.log('✅ 所有localStorage數據已清除');
```

---

## 📞 支持

如果遇到問題，請檢查：
1. 瀏覽器開發者工具 (F12) 的 Console 標籤是否有錯誤
2. 確保JavaScript已啟用
3. 確保localStorage已啟用
4. 嘗試清除瀏覽器快取
5. 在隱私模式下測試（確保localStorage是否被限制）

---

**版本**: v3.1  
**最後更新**: 2026年1月21日  
**狀態**: ✅ 已驗證完整功能

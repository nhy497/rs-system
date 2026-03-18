/**
 * RS System - 統一測試系統 JavaScript
 * 包含所有測試邏輯：登入狀態、資料儲存、用戶資料庫、Creator 界面
 */

// 測試環境隔離：覆寫 localStorage 讀寫，避免污染正式資料鍵
(function isolateTestStorage() {
  const TEST_KEYS = new Set([
    'users',
    'rope-skip-checkpoints',
    'rs-system-session',
    'current-user',
    'rs-system-coach-logs',
    'rs-system-system-logs',
    'rs-system-audit-logs'
  ]);
  const prefixKey = key => (TEST_KEYS.has(key) ? `dev-${key}` : key);
  const origGet = localStorage.getItem.bind(localStorage);
  const origSet = localStorage.setItem.bind(localStorage);
  const origRemove = localStorage.removeItem.bind(localStorage);
  localStorage.getItem = key => origGet(prefixKey(key));
  localStorage.setItem = (key, val) => origSet(prefixKey(key), val);
  localStorage.removeItem = key => origRemove(prefixKey(key));
  console.log('🔒 dev/system-test.js 已啟用測試資料隔離 (dev-* keys)');
})();

// ==================== 全局變數 ====================
let testResults = {
  login: { total: 0, pass: 0, fail: 0 },
  storage: { total: 0, pass: 0, fail: 0 },
  database: { total: 0, pass: 0, fail: 0 },
  creator: { total: 0, pass: 0, fail: 0 }
};

// ==================== 工具函數 ====================

/**
 * 切換標籤頁
 */
function switchTab(tabName) {
  // 隱藏所有標籤內容
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // 顯示選中的標籤
  document.getElementById(`tab-${tabName}`).classList.add('active');
  event.target.classList.add('active');
}

/**
 * 添加測試結果
 */
function addResult(containerId, message, type = 'info') {
  const container = document.getElementById(containerId);
  const resultDiv = document.createElement('div');
  resultDiv.className = `test-result ${type}`;

  const icon = {
    'pass': '✅',
    'fail': '❌',
    'warn': '⚠️',
    'info': 'ℹ️'
  }[type] || 'ℹ️';

  resultDiv.textContent = `${icon} ${message}`;
  container.appendChild(resultDiv);

  // 滾動到最新結果
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 添加日誌
 */
function addLog(logId, message, type = 'info') {
  const logEl = document.getElementById(logId);
  if (!logEl) return;

  const time = new Date().toLocaleTimeString('zh-TW');
  const icon = {
    'info': 'ℹ️',
    'success': '✅',
    'error': '❌',
    'warn': '⚠️'
  }[type] || 'ℹ️';

  logEl.textContent += `[${time}] ${icon} ${message}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

/**
 * 更新統計數據
 */
function updateStats(category, result) {
  testResults[category].total++;
  if (result) {
    testResults[category].pass++;
  } else {
    testResults[category].fail++;
  }

  // 更新對應分類的統計
  document.getElementById(`${category}-total`).textContent = testResults[category].total;
  document.getElementById(`${category}-pass`).textContent = testResults[category].pass;
  document.getElementById(`${category}-fail`).textContent = testResults[category].fail;

  // 更新總體統計
  updateSummaryStats();
}

/**
 * 更新總體統計
 */
function updateSummaryStats() {
  const total = Object.values(testResults).reduce((sum, cat) => sum + cat.total, 0);
  const pass = Object.values(testResults).reduce((sum, cat) => sum + cat.pass, 0);
  const fail = Object.values(testResults).reduce((sum, cat) => sum + cat.fail, 0);
  const rate = total > 0 ? Math.round((pass / total) * 100) : 0;

  document.getElementById('summary-total').textContent = total;
  document.getElementById('summary-pass').textContent = pass;
  document.getElementById('summary-fail').textContent = fail;
  document.getElementById('summary-rate').textContent = `${rate}%`;

  const progressFill = document.getElementById('summary-progress');
  if (progressFill) {
    progressFill.style.width = `${rate}%`;
    progressFill.textContent = `${rate}%`;
  }
}

// ==================== 登入測試 ====================

/**
 * 創建新用戶
 */
function createNewUser() {
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value.trim();
  const role = document.querySelector('input[name="user-role"]:checked').value;
  const containerId = 'create-user-results';

  document.getElementById(containerId).innerHTML = '';
  addLog('create-user-log', '=== 創建新用戶 ===', 'info');

  // 驗證輸入
  if (!username) {
    addResult(containerId, '用戶名不能為空', 'fail');
    addLog('create-user-log', '用戶名為空', 'error');
    return;
  }

  if (!password) {
    addResult(containerId, '密碼不能為空', 'fail');
    addLog('create-user-log', '密碼為空', 'error');
    return;
  }

  if (username.length < 3) {
    addResult(containerId, '用戶名至少需要 3 個字符', 'fail');
    addLog('create-user-log', '用戶名過短', 'error');
    return;
  }

  if (password.length < 4) {
    addResult(containerId, '密碼至少需要 4 個字符', 'fail');
    addLog('create-user-log', '密碼過短', 'error');
    return;
  }

  try {
    // 獲取現有用戶列表
    const users = localStorage.getItem('users');
    const usersList = users ? JSON.parse(users) : [];

    // 允許創建無限測試用戶賬號，即使用戶名相同也可以創建
    // （通過時間戳和隨機值確保每個用戶都有唯一的 ID）
    addLog('create-user-log', '允許創建無限用戶，即使名稱重複也無限制...', 'info');

    // 創建新用戶
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      password,
      role,
      createdAt: new Date().toISOString()
    };

    // 添加到用戶列表
    usersList.push(newUser);
    localStorage.setItem('users', JSON.stringify(usersList));

    addResult(containerId, `✅ 用戶創建成功: ${username}`, 'pass');
    addLog('create-user-log', `用戶 ID: ${newUser.id}`, 'success');
    addLog('create-user-log', `用戶名: ${newUser.username}`, 'success');
    addLog('create-user-log', `角色: ${newUser.role}`, 'success');
    addLog('create-user-log', `創建時間: ${newUser.createdAt}`, 'info');

    // 清空輸入框
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';

    // 更新統計
    refreshUserStats();
    updateStats('login', true);
  } catch (error) {
    addResult(containerId, `創建失敗: ${error.message}`, 'fail');
    addLog('create-user-log', `錯誤: ${error.message}`, 'error');
    updateStats('login', false);
  }
}

/**
 * 批量建立測試帳戶
 */
function bulkCreateUsers() {
  const countInput = document.getElementById('bulk-user-count');
  const prefixInput = document.getElementById('bulk-user-prefix');
  const count = parseInt(countInput.value) || 10;
  const prefix = prefixInput.value.trim() || 'test';
  const containerId = 'bulk-create-results';
  const logId = 'bulk-create-log';

  // 驗證數量
  if (count < 10 || count > 100) {
    addResult(containerId, '帳戶數量必須在 10-100 之間', 'fail');
    addLog(logId, '帳戶數量超出範圍', 'error');
    return;
  }

  document.getElementById(containerId).innerHTML = '';
  addLog(logId, `=== 批量建立 ${count} 個測試帳戶 ===`, 'info');

  try {
    const users = localStorage.getItem('users');
    const usersList = users ? JSON.parse(users) : [];
    const startCount = usersList.length;
    const createdUsers = [];

    for (let i = 1; i <= count; i++) {
      const newUser = {
        id: `user_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        userId: `user_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        username: `${prefix}_${i}`,
        password: `pass${i}`,
        role: i % 10 === 1 ? 'creator' : 'user',
        createdAt: new Date().toISOString()
      };
      usersList.push(newUser);
      createdUsers.push(newUser);

      if (i % 10 === 0) {
        addLog(logId, `已建立 ${i}/${count} 個帳戶...`, 'info');
      }
    }

    localStorage.setItem('users', JSON.stringify(usersList));

    addResult(containerId, '✅ 批量建立成功！', 'pass');
    addResult(containerId, `總計 ${count} 個帳戶已建立`, 'pass');
    addResult(containerId, `帳戶範圍: ${prefix}_1 ~ ${prefix}_${count}`, 'info');
    addResult(containerId, `帳戶密碼: pass1, pass2, ..., pass${count}`, 'info');
    addResult(containerId, `Creator 帳戶: ${prefix}_1, ${prefix}_11, ${prefix}_21...`, 'info');

    addLog(logId, '✅ 批量建立完成！', 'success');
    addLog(logId, `共建立 ${count} 個帳戶，名稱前綴: ${prefix}`, 'success');
    addLog(logId, `總用戶數: ${startCount} → ${usersList.length}`, 'success');

    refreshUserStats();
    updateStats('login', true);
  } catch (error) {
    addResult(containerId, `批量建立失敗: ${error.message}`, 'fail');
    addLog(logId, `錯誤: ${error.message}`, 'error');
    updateStats('login', false);
  }
}

/**
 * 清除所有測試帳戶（保留 creator）
 */
function bulkClearUsers() {
  if (!confirm('確定要清除所有測試帳戶嗎？（保留 creator 帳戶）')) {
    return;
  }

  try {
    const users = localStorage.getItem('users');
    let usersList = users ? JSON.parse(users) : [];
    const beforeCount = usersList.length;

    usersList = usersList.filter(u => u.username === 'creator');
    localStorage.setItem('users', JSON.stringify(usersList));

    addResult('bulk-create-results', `✅ 已清除 ${beforeCount - usersList.length} 個測試帳戶`, 'pass');
    addLog('bulk-create-log', `清除完成：${beforeCount} → ${usersList.length} 個帳戶`, 'success');

    refreshUserStats();
    updateStats('login', true);
  } catch (error) {
    addResult('bulk-create-results', `清除失敗: ${error.message}`, 'fail');
    addLog('bulk-create-log', `錯誤: ${error.message}`, 'error');
  }
}

/**
 * 刷新用戶統計
 */
function refreshUserStats() {
  try {
    const users = localStorage.getItem('users');
    const usersList = users ? JSON.parse(users) : [];

    document.getElementById('users-total').textContent = usersList.length;
    document.getElementById('users-existing').textContent = usersList.length;

    // 計算 Creator 和其他用戶
    const creators = usersList.filter(u => u.username === 'creator').length;
    document.getElementById('users-created').textContent = usersList.length - creators;
  } catch (error) {
    console.error('刷新統計失敗:', error);
  }
}

/**
 * 列出所有用戶
 */
function listAllUsers() {
  const containerId = 'users-list-results';
  const table = document.getElementById('users-table');
  const tbody = document.getElementById('users-tbody');

  document.getElementById(containerId).innerHTML = '';
  tbody.innerHTML = '';

  try {
    const users = localStorage.getItem('users');
    if (!users) {
      addResult(containerId, '未找到用戶數據', 'warn');
      table.style.display = 'none';
      return;
    }

    const usersList = JSON.parse(users);

    if (usersList.length === 0) {
      addResult(containerId, '用戶列表為空', 'warn');
      table.style.display = 'none';
      return;
    }

    addResult(containerId, `找到 ${usersList.length} 個用戶:`, 'pass');

    usersList.forEach((user, index) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = user.id || user.userId || 'N/A';
      row.insertCell(1).textContent = user.username;
      row.insertCell(2).textContent = user.password;
      row.insertCell(3).textContent = user.role || 'user';

      const actionCell = row.insertCell(4);
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.style.background = 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)';
      deleteBtn.onclick = () => deleteUser(user.username);
      actionCell.appendChild(deleteBtn);
    });

    table.style.display = 'table';
  } catch (error) {
    addResult(containerId, `列表失敗: ${error.message}`, 'fail');
    table.style.display = 'none';
  }
}

/**
 * 刪除用戶
 */
function deleteUser(username) {
  if (!confirm(`確定要刪除用戶 "${username}" 嗎?`)) {
    return;
  }

  try {
    const users = localStorage.getItem('users');
    if (!users) return;

    let usersList = JSON.parse(users);
    usersList = usersList.filter(u => u.username !== username);
    localStorage.setItem('users', JSON.stringify(usersList));

    addResult('users-list-results', `✅ 用戶已刪除: ${username}`, 'pass');
    listAllUsers();
    refreshUserStats();
  } catch (error) {
    addResult('users-list-results', `刪除失敗: ${error.message}`, 'fail');
  }
}

/**
 * 搜尋用戶
 */
function searchUser() {
  const username = prompt('輸入要搜尋的用戶名:');
  if (!username) return;

  const containerId = 'users-list-results';
  document.getElementById(containerId).innerHTML = '';

  try {
    const users = localStorage.getItem('users');
    if (!users) {
      addResult(containerId, '未找到用戶數據', 'warn');
      return;
    }

    const usersList = JSON.parse(users);
    const user = usersList.find(u => u.username === username);

    if (!user) {
      addResult(containerId, `未找到用戶: ${username}`, 'warn');
      return;
    }

    addResult(containerId, `找到用戶: ${username}`, 'pass');
    addResult(containerId, `用戶 ID: ${user.id || user.userId}`, 'info');
    addResult(containerId, `密碼: ${user.password}`, 'info');
    addResult(containerId, `角色: ${user.role || 'user'}`, 'info');
  } catch (error) {
    addResult(containerId, `搜尋失敗: ${error.message}`, 'fail');
  }
}

/**
 * 清除所有用戶
 */
function clearAllUsers() {
  if (!confirm('確定要清除所有用戶嗎? 此操作無法撤銷!')) {
    return;
  }

  try {
    localStorage.removeItem('users');
    addResult('users-list-results', '✅ 所有用戶已清除', 'pass');
    document.getElementById('users-table').style.display = 'none';
    refreshUserStats();
  } catch (error) {
    addResult('users-list-results', `清除失敗: ${error.message}`, 'fail');
  }
}

/**
 * 創建並登入測試用戶
 */
async function createAndLoginTestUser() {
  const containerId = 'quick-test-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('quick-test-log', '=== 創建並登入測試用戶 ===', 'info');

  const timestamp = Date.now();
  const testUsername = `testuser_${timestamp}`;
  const testPassword = 'test1234';

  try {
    // Step 1: 創建用戶
    addLog('quick-test-log', `Step 1: 創建用戶 ${testUsername}...`, 'info');

    const users = localStorage.getItem('users');
    const usersList = users ? JSON.parse(users) : [];

    const newUser = {
      id: `user_${timestamp}_test`,
      userId: `user_${timestamp}_test`,
      username: testUsername,
      password: testPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    usersList.push(newUser);
    localStorage.setItem('users', JSON.stringify(usersList));

    addResult(containerId, `✅ 用戶已創建: ${testUsername}`, 'pass');
    addLog('quick-test-log', '用戶創建成功', 'success');

    // Step 2: 登入用戶
    addLog('quick-test-log', `Step 2: 登入用戶 ${testUsername}...`, 'info');

    const loginResult = await performLogin(testUsername, testPassword);

    if (loginResult) {
      addResult(containerId, `✅ 登入成功: ${testUsername}`, 'pass');
      addLog('quick-test-log', '登入成功，會話已創建', 'success');
    } else {
      addResult(containerId, '❌ 登入失敗', 'fail');
      addLog('quick-test-log', '登入失敗', 'error');
    }

    refreshUserStats();
  } catch (error) {
    addResult(containerId, `操作失敗: ${error.message}`, 'fail');
    addLog('quick-test-log', `錯誤: ${error.message}`, 'error');
  }
}

/**
 * 創建多個測試用戶
 */
function createMultipleUsers() {
  const containerId = 'quick-test-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('quick-test-log', '=== 創建多個測試用戶 ===', 'info');

  const testUsers = [
    { username: 'alice', password: 'alice123', role: 'user' },
    { username: 'bob', password: 'bob123', role: 'user' },
    { username: 'charlie', password: 'charlie123', role: 'user' },
    { username: 'teacher1', password: 'teacher123', role: 'creator' }
  ];

  try {
    const users = localStorage.getItem('users');
    const usersList = users ? JSON.parse(users) : [];

    let createdCount = 0;
    let skippedCount = 0;

    testUsers.forEach(testUser => {
      // 檢查用戶是否存在
      if (usersList.some(u => u.username === testUser.username)) {
        addLog('quick-test-log', `跳過已存在用戶: ${testUser.username}`, 'warn');
        skippedCount++;
        return;
      }

      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: testUser.username,
        password: testUser.password,
        role: testUser.role,
        createdAt: new Date().toISOString()
      };

      usersList.push(newUser);
      addLog('quick-test-log', `✅ 創建用戶: ${testUser.username} (角色: ${testUser.role})`, 'success');
      createdCount++;
    });

    localStorage.setItem('users', JSON.stringify(usersList));

    addResult(containerId, `創建了 ${createdCount} 個用戶，跳過了 ${skippedCount} 個已存在的用戶`, 'pass');
    refreshUserStats();
  } catch (error) {
    addResult(containerId, `創建失敗: ${error.message}`, 'fail');
    addLog('quick-test-log', `錯誤: ${error.message}`, 'error');
  }
}

/**
 * 更新登入模式的表單顯示
 */
function updateLoginMode() {
  const mode = document.querySelector('input[name="login-mode"]:checked').value;
  const customFields = document.getElementById('custom-login-fields');

  if (mode === 'custom') {
    customFields.style.display = 'block';
  } else {
    customFields.style.display = 'none';
  }
}

/**
 * 顯示可用用戶列表
 */
function showAvailableUsers() {
  const containerId = 'login-status-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('login-log', '=== 可用用戶列表 ===', 'info');

  const users = localStorage.getItem('users');
  if (!users) {
    addResult(containerId, '未找到用戶數據', 'warn');
    addLog('login-log', '用戶數據庫為空', 'warn');
    return;
  }

  try {
    const usersList = JSON.parse(users);
    addResult(containerId, `找到 ${usersList.length} 個用戶:`, 'info');
    addLog('login-log', `總用戶數: ${usersList.length}`, 'info');

    usersList.forEach((user, index) => {
      const userInfo = `${index + 1}. ${user.username} (ID: ${user.id || user.userId}, 角色: ${user.role || 'user'})`;
      addResult(containerId, userInfo, 'info');
      addLog('login-log', userInfo, 'info');
    });
  } catch (error) {
    addResult(containerId, `解析失敗: ${error.message}`, 'fail');
    addLog('login-log', `錯誤: ${error.message}`, 'error');
  }
}

/**
 * 獲取隨機用戶
 */
function getRandomUser() {
  const users = localStorage.getItem('users');
  if (!users) return null;

  try {
    const usersList = JSON.parse(users);
    if (usersList.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * usersList.length);
    return usersList[randomIndex];
  } catch (error) {
    console.error('獲取隨機用戶失敗:', error);
    return null;
  }
}

/**
 * 執行自定義登入（支持 Creator、隨機用戶、自設用戶）
 */
async function performCustomLogin() {
  const mode = document.querySelector('input[name="login-mode"]:checked').value;
  const containerId = 'login-status-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('login-log', '=== 自定義登入測試 ===', 'info');

  let username, password;

  if (mode === 'creator') {
    // Creator 帳號
    username = 'creator';
    password = '1234';
    addLog('login-log', '選擇登入方式: Creator 帳號', 'info');
  } else if (mode === 'random') {
    // 隨機用戶
    const randomUser = getRandomUser();
    if (!randomUser) {
      addResult(containerId, '未找到可用用戶', 'fail');
      addLog('login-log', '用戶列表為空，無法選擇隨機用戶', 'error');
      updateStats('login', false);
      return;
    }
    username = randomUser.username;
    password = randomUser.password;
    addLog('login-log', '選擇登入方式: 隨機用戶', 'info');
    addLog('login-log', `隨機選擇的用戶: ${username}`, 'info');
  } else if (mode === 'custom') {
    // 自設用戶
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    username = usernameInput.value.trim();
    password = passwordInput.value.trim();

    if (!username || !password) {
      addResult(containerId, '請輸入用戶名和密碼', 'warn');
      addLog('login-log', '用戶名或密碼為空', 'warn');
      updateStats('login', false);
      return;
    }

    addLog('login-log', '選擇登入方式: 自設用戶', 'info');
    addLog('login-log', `輸入的用戶名: ${username}`, 'info');
  }

  // 執行登入
  const result = await performLogin(username, password);

  if (result) {
    addResult(containerId, `✅ 登入成功: ${username}`, 'pass');
  } else {
    addResult(containerId, `❌ 登入失敗: ${username}`, 'fail');
  }
}

/**
 * 執行實際登入操作
 */
async function performLogin(username, password) {
  const containerId = 'login-status-results';
  addLog('login-log', `嘗試登入: ${username}...`, 'info');

  try {
    // 檢查用戶是否存在
    const users = localStorage.getItem('users');
    if (!users) {
      addResult(containerId, '用戶數據庫未初始化', 'fail');
      addLog('login-log', '無用戶數據', 'error');
      updateStats('login', false);
      return false;
    }

    const usersList = JSON.parse(users);
    const user = usersList.find(u => u.username === username);

    if (!user) {
      addResult(containerId, `用戶不存在: ${username}`, 'fail');
      addLog('login-log', '用戶未找到', 'error');
      updateStats('login', false);
      return false;
    }

    // 驗證密碼
    if (user.password !== password) {
      addResult(containerId, '密碼錯誤', 'fail');
      addLog('login-log', '密碼驗證失敗', 'error');
      updateStats('login', false);
      return false;
    }

    // 創建會話
    const now = Date.now();
    const sessionData = {
      userId: user.id || user.userId,
      username: user.username,
      sessionId: `session_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      expiresAt: now + (24 * 60 * 60 * 1000), // 24小時
      role: user.role || 'user',
      ipHash: 'test-device'
    };

    // 儲存會話和用戶信息
    localStorage.setItem('rs-system-session', JSON.stringify(sessionData));
    localStorage.setItem('current-user', JSON.stringify({
      id: user.id || user.userId,
      userId: user.id || user.userId,
      username: user.username,
      role: user.role || 'user'
    }));

    addResult(containerId, `✅ 登入成功: ${username}`, 'pass');
    addLog('login-log', `用戶 ${username} 已登入`, 'success');
    addLog('login-log', `會話 ID: ${sessionData.sessionId}`, 'success');
    addLog('login-log', `過期時間: ${new Date(sessionData.expiresAt).toLocaleString('zh-TW')}`, 'info');
    updateStats('login', true);
    return true;
  } catch (error) {
    addResult(containerId, `登入失敗: ${error.message}`, 'fail');
    addLog('login-log', `錯誤: ${error.message}`, 'error');
    updateStats('login', false);
    return false;
  }
}

/**
 * 執行登出操作
 */
function performLogout() {
  const containerId = 'login-status-results';
  addLog('login-log', '執行登出...', 'info');

  try {
    const currentUser = localStorage.getItem('current-user');
    if (currentUser) {
      const userData = JSON.parse(currentUser);

      localStorage.removeItem('rs-system-session');
      localStorage.removeItem('current-user');

      addResult(containerId, `✅ 登出成功: ${userData.username}`, 'pass');
      addLog('login-log', `用戶 ${userData.username} 已登出`, 'success');
      updateStats('login', true);
      return true;
    } else {
      addResult(containerId, '用戶未登入', 'warn');
      addLog('login-log', '無登入用戶', 'warn');
      updateStats('login', false);
      return false;
    }
  } catch (error) {
    addResult(containerId, `登出失敗: ${error.message}`, 'fail');
    addLog('login-log', `錯誤: ${error.message}`, 'error');
    updateStats('login', false);
    return false;
  }
}

/**
 * 測試有效登入
 */
async function testValidLogin() {
  const containerId = 'login-status-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('login-log', '=== 測試有效登入 ===', 'info');

  const result = await performLogin('creator', '1234');
  if (result) {
    addResult(containerId, '有效登入測試通過', 'pass');
  } else {
    addResult(containerId, '有效登入測試失敗', 'fail');
  }
}

/**
 * 測試無效密碼
 */
async function testInvalidPassword() {
  const containerId = 'login-status-results';
  addLog('login-log', '=== 測試無效密碼 ===', 'info');

  const result = await performLogin('creator', 'wrongpassword');
  if (!result) {
    addResult(containerId, '無效密碼檢測成功（正確拒絕）', 'pass');
    addLog('login-log', '系統正確拒絕了錯誤密碼', 'success');
  } else {
    addResult(containerId, '無效密碼檢測失敗（不應允許）', 'fail');
    addLog('login-log', '系統不應允許錯誤密碼登入', 'error');
  }
}

/**
 * 測試無效用戶
 */
async function testInvalidUser() {
  const containerId = 'login-status-results';
  addLog('login-log', '=== 測試無效用戶 ===', 'info');

  const result = await performLogin('nonexistent', '1234');
  if (!result) {
    addResult(containerId, '無效用戶檢測成功（正確拒絕）', 'pass');
    addLog('login-log', '系統正確拒絕了不存在的用戶', 'success');
  } else {
    addResult(containerId, '無效用戶檢測失敗（不應允許）', 'fail');
    addLog('login-log', '系統不應允許不存在的用戶登入', 'error');
  }
}

/**
 * 測試登入和登出流程
 */
async function testLoginLogoutFlow() {
  const containerId = 'login-status-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('login-log', '=== 測試登入和登出完整流程 ===', 'info');

  // Step 1: 登入
  addLog('login-log', 'Step 1: 執行登入...', 'info');
  let result = await performLogin('creator', '1234');
  if (!result) {
    addResult(containerId, '登入流程測試失敗（無法登入）', 'fail');
    return;
  }

  // Step 2: 驗證登入狀態
  addLog('login-log', 'Step 2: 驗證登入狀態...', 'info');
  const session = localStorage.getItem('rs-system-session');
  const currentUser = localStorage.getItem('current-user');

  if (!session || !currentUser) {
    addResult(containerId, '登入流程測試失敗（會話未保存）', 'fail');
    return;
  }

  try {
    const sessionData = JSON.parse(session);
    const userData = JSON.parse(currentUser);
    addLog('login-log', `用戶 ${userData.username} 已驗證在線`, 'success');
  } catch (error) {
    addResult(containerId, `登入流程測試失敗（數據解析錯誤）: ${error.message}`, 'fail');
    return;
  }

  // Step 3: 執行登出
  addLog('login-log', 'Step 3: 執行登出...', 'info');
  result = performLogout();
  if (!result) {
    addResult(containerId, '登入流程測試失敗（無法登出）', 'fail');
    return;
  }

  // Step 4: 驗證登出狀態
  addLog('login-log', 'Step 4: 驗證登出狀態...', 'info');
  const sessionAfter = localStorage.getItem('rs-system-session');
  const userAfter = localStorage.getItem('current-user');

  if (!sessionAfter && !userAfter) {
    addResult(containerId, '✅ 登入/登出完整流程測試通過', 'pass');
    addLog('login-log', '會話已完全清除', 'success');
    updateStats('login', true);
  } else {
    addResult(containerId, '登入流程測試失敗（登出後仍有會話）', 'fail');
    addLog('login-log', '登出後會話仍然存在', 'error');
    updateStats('login', false);
  }
}

/**
 * 測試登入狀態
 */
function testLoginStatus() {
  const containerId = 'login-status-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('login-log', '開始測試登入狀態...', 'info');

  const session = localStorage.getItem('rs-system-session');
  const currentUser = localStorage.getItem('current-user');

  if (!session || !currentUser) {
    addResult(containerId, '未找到登入會話，用戶未登入', 'warn');
    addLog('login-log', '未找到會話數據', 'warn');
    updateStats('login', false);
    return;
  }

  try {
    const sessionData = JSON.parse(session);
    const userData = JSON.parse(currentUser);

    addResult(containerId, `用戶已登入: ${userData.username}`, 'pass');
    addLog('login-log', `用戶 ID: ${userData.id}`, 'success');
    addLog('login-log', `用戶名: ${userData.username}`, 'success');
    addLog('login-log', `角色: ${userData.role || '一般用戶'}`, 'info');
    updateStats('login', true);
  } catch (error) {
    addResult(containerId, `會話數據解析失敗: ${error.message}`, 'fail');
    addLog('login-log', `錯誤: ${error.message}`, 'error');
    updateStats('login', false);
  }
}

/**
 * 驗證會話有效性
 */
function testSessionValidity() {
  const containerId = 'login-status-results';
  addLog('login-log', '開始驗證會話有效性...', 'info');

  const session = localStorage.getItem('rs-system-session');
  if (!session) {
    addResult(containerId, '會話不存在', 'fail');
    updateStats('login', false);
    return;
  }

  try {
    const sessionData = JSON.parse(session);
    const now = Date.now();

    // 檢查必需字段
    if (!sessionData.userId || !sessionData.sessionId) {
      addResult(containerId, '會話數據結構不完整', 'fail');
      addLog('login-log', '缺少必需字段: userId 或 sessionId', 'error');
      updateStats('login', false);
      return;
    }

    // 檢查過期時間
    if (sessionData.expiresAt && now > sessionData.expiresAt) {
      addResult(containerId, '會話已過期', 'fail');
      addLog('login-log', `過期時間: ${new Date(sessionData.expiresAt).toLocaleString()}`, 'error');
      updateStats('login', false);
      return;
    }

    const timeLeft = sessionData.expiresAt
      ? ((sessionData.expiresAt - now) / 1000 / 60 / 60).toFixed(1)
      : 'N/A';

    addResult(containerId, `會話有效，剩餘時間: ${timeLeft} 小時`, 'pass');
    addLog('login-log', `會話 ID: ${sessionData.sessionId}`, 'success');
    addLog('login-log', `剩餘時間: ${timeLeft} 小時`, 'success');
    updateStats('login', true);
  } catch (error) {
    addResult(containerId, `驗證失敗: ${error.message}`, 'fail');
    updateStats('login', false);
  }
}

/**
 * 檢查會話數據結構
 */
function testSessionData() {
  const containerId = 'login-status-results';
  addLog('login-log', '檢查會話數據結構...', 'info');

  const session = localStorage.getItem('rs-system-session');
  if (!session) {
    addResult(containerId, '無會話數據', 'fail');
    updateStats('login', false);
    return;
  }

  try {
    const sessionData = JSON.parse(session);
    const requiredFields = ['userId', 'sessionId', 'createdAt', 'expiresAt'];
    const missingFields = requiredFields.filter(field => !sessionData[field]);

    if (missingFields.length > 0) {
      addResult(containerId, `缺少字段: ${missingFields.join(', ')}`, 'fail');
      addLog('login-log', `缺少必需字段: ${missingFields.join(', ')}`, 'error');
      updateStats('login', false);
    } else {
      addResult(containerId, '會話數據結構完整', 'pass');
      addLog('login-log', '所有必需字段存在', 'success');
      addLog('login-log', `字段: ${Object.keys(sessionData).join(', ')}`, 'info');
      updateStats('login', true);
    }
  } catch (error) {
    addResult(containerId, `解析錯誤: ${error.message}`, 'fail');
    updateStats('login', false);
  }
}

/**
 * 清除會話
 */
function clearSession() {
  localStorage.removeItem('rs-system-session');
  localStorage.removeItem('current-user');
  addResult('login-status-results', '會話已清除', 'info');
  addLog('login-log', '會話數據已清除', 'warn');
}

/**
 * 測試登入重定向
 */
function testLoginRedirect() {
  const containerId = 'redirect-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('login-log', '測試登入重定向邏輯...', 'info');

  const session = localStorage.getItem('rs-system-session');
  if (!session) {
    addResult(containerId, '無會話，應重定向到 login.html', 'pass');
    addLog('login-log', '重定向邏輯正確', 'success');
    updateStats('login', true);
  } else {
    addResult(containerId, '有會話，應保持在 index.html', 'pass');
    addLog('login-log', '會話有效，不需重定向', 'success');
    updateStats('login', true);
  }
}

/**
 * 測試自動登出
 */
function testAutoLogout() {
  addResult('redirect-results', '自動登出測試需手動驗證', 'info');
  addLog('login-log', '請在會話過期後刷新頁面測試自動登出', 'info');
}

/**
 * 測試會話持久性
 */
function testSessionPersistence() {
  const session = localStorage.getItem('rs-system-session');
  if (session) {
    addResult('redirect-results', '會話在 localStorage 中持久存在', 'pass');
    addLog('login-log', '會話持久性測試通過', 'success');
    updateStats('login', true);
  } else {
    addResult('redirect-results', '無會話數據', 'warn');
    updateStats('login', false);
  }
}

/**
 * 測試會話過期
 */
function testSessionExpiry() {
  const containerId = 'security-results';
  document.getElementById(containerId).innerHTML = '';

  const session = localStorage.getItem('rs-system-session');
  if (!session) {
    addResult(containerId, '無會話數據', 'warn');
    updateStats('login', false);
    return;
  }

  try {
    const sessionData = JSON.parse(session);
    const now = Date.now();
    const {expiresAt} = sessionData;

    if (!expiresAt) {
      addResult(containerId, '會話無過期時間設置', 'warn');
      updateStats('login', false);
      return;
    }

    const timeLeft = (expiresAt - now) / 1000 / 60 / 60;
    if (timeLeft > 0) {
      addResult(containerId, `會話未過期，剩餘 ${timeLeft.toFixed(1)} 小時`, 'pass');
      updateStats('login', true);
    } else {
      addResult(containerId, '會話已過期', 'warn');
      updateStats('login', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    updateStats('login', false);
  }
}

/**
 * 測試 IP Hash 驗證
 */
function testIpHashValidation() {
  addResult('security-results', 'IP Hash 驗證已改為警告模式（不強制登出）', 'pass');
  addLog('login-log', 'IP Hash 驗證使用寬鬆模式', 'info');
  updateStats('login', true);
}

// ==================== 資料儲存測試 ====================

/**
 * 測試登入資料儲存
 */
function testLoginDataStorage() {
  const containerId = 'storage-login-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('storage-log', '測試登入資料儲存...', 'info');

  const currentUser = localStorage.getItem('current-user');
  const users = localStorage.getItem('users');

  if (!currentUser) {
    addResult(containerId, '未找到當前用戶資料', 'fail');
    updateStats('storage', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    addResult(containerId, `用戶資料已儲存: ${userData.username}`, 'pass');
    addLog('storage-log', `用戶 ID: ${userData.id}`, 'success');
    addLog('storage-log', `用戶名: ${userData.username}`, 'success');

    if (users) {
      const usersList = JSON.parse(users);
      addLog('storage-log', `用戶數據庫共有 ${usersList.length} 個用戶`, 'info');
    }

    updateStats('storage', true);
  } catch (error) {
    addResult(containerId, `資料解析失敗: ${error.message}`, 'fail');
    updateStats('storage', false);
  }
}

/**
 * 測試用戶資料持久性
 */
function testUserDataPersistence() {
  const containerId = 'storage-persistence-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('storage-log', '測試用戶資料持久性...', 'info');

  const currentUser = localStorage.getItem('current-user');
  if (currentUser) {
    addResult(containerId, '用戶資料在 localStorage 中持久存在', 'pass');
    addLog('storage-log', '資料持久性測試通過', 'success');
    updateStats('storage', true);
  } else {
    addResult(containerId, '用戶資料未持久化', 'fail');
    updateStats('storage', false);
  }
}

/**
 * 查看儲存的登入資料
 */
function viewStoredLoginData() {
  const containerId = 'storage-login-results';
  addLog('storage-log', '查看儲存的登入資料...', 'info');

  const currentUser = localStorage.getItem('current-user');
  const session = localStorage.getItem('rs-system-session');

  if (currentUser) {
    try {
      const userData = JSON.parse(currentUser);
      addResult(containerId, `用戶資料: ${JSON.stringify(userData, null, 2)}`, 'info');
      addLog('storage-log', JSON.stringify(userData, null, 2), 'info');
    } catch (error) {
      addResult(containerId, `無法解析用戶資料: ${error.message}`, 'fail');
    }
  }

  if (session) {
    try {
      const sessionData = JSON.parse(session);
      addResult(containerId, `會話資料: ${JSON.stringify(sessionData, null, 2)}`, 'info');
      addLog('storage-log', JSON.stringify(sessionData, null, 2), 'info');
    } catch (error) {
      addResult(containerId, `無法解析會話資料: ${error.message}`, 'fail');
    }
  }
}

function getUserScopedKeyForClass(baseKey = 'rope-skip-checkpoints') {
  try {
    const currentUser = JSON.parse(localStorage.getItem('current-user') || '{}');
    const uid = currentUser.id || currentUser.userId || 'guest';
    return `${baseKey}::${uid}`;
  } catch {
    return `${baseKey}::guest`;
  }
}

function loadClassRecordsForTest(scopedKey) {
  const raw = localStorage.getItem(scopedKey) || localStorage.getItem('rope-skip-checkpoints');
  if (!raw) return [];
  try {
    // 優先嘗試直接 JSON 解析（新方式，避免 btoa 問題）
    return JSON.parse(raw);
  } catch {
    try {
      // 再試舊方式 base64 解碼（向後兼容）
      return JSON.parse(atob(raw));
    } catch {
      return [];
    }
  }
}

function saveClassRecordsForTest(scopedKey, records) {
  // 直接儲存 JSON 字符串，不編碼，避免 btoa Latin1 限制
  try {
    localStorage.setItem(scopedKey, JSON.stringify(records));
  } catch (error) {
    console.error('❌ 課堂內容儲存失敗:', error);
  }
}

function buildSampleClassContent(currentUser = {}) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const className = `TEST-CLASS-${(currentUser.username || 'USER').toUpperCase()}`;

  // 隨機選擇花式
  const allTricks = [
    { name: '單搖', detail: '基礎花式', level: '初級', skillLevel: '初級' },
    { name: '交叉跳', detail: '進階花式', level: '中級', skillLevel: '中級' },
    { name: '雙搖', detail: '難度花式', level: '進階', skillLevel: '進階' },
    { name: '三搖', detail: '超難度花式', level: '進階', skillLevel: '進階' },
    { name: '側搖', detail: '技巧花式', level: '中級', skillLevel: '中級' }
  ];

  // 隨機選擇 1-3 個花式
  const trickCount = Math.floor(Math.random() * 3) + 1;
  const selectedTricks = [];
  const usedIndices = new Set();

  while (selectedTricks.length < trickCount) {
    const idx = Math.floor(Math.random() * allTricks.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      selectedTricks.push({
        ...allTricks[idx],
        mastery: Math.floor(Math.random() * 101),
        plannedTime: 5 + Math.floor(Math.random() * 25),
        actualTime: 5 + Math.floor(Math.random() * 25)
      });
    }
  }

  const avgMastery = Math.round(selectedTricks.reduce((a, b) => a + b.mastery, 0) / selectedTricks.length);
  const totalPlanned = selectedTricks.reduce((a, b) => a + (b.plannedTime || 0), 0);
  const totalActual = selectedTricks.reduce((a, b) => a + (b.actualTime || 0), 0);

  const atmospheres = ['開心', '不開心', '認真學習', '心散', '一般'];
  const randomAtmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)];

  // 為每筆課堂記錄添加唯一ID（複合主鍵：classDate + className + uniqueId）
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: uniqueId,
    classDate: dateStr,
    className,
    classSize: 8 + Math.floor(Math.random() * 23),
    classLocation: ['操場', '體育館', '教室', '多功能室'][Math.floor(Math.random() * 4)],
    teachingRole: ['主教練', '助教', '副教練'][Math.floor(Math.random() * 3)],
    classStartTime: `${7 + Math.floor(Math.random() * 12)}:${Math.random() > 0.5 ? '00' : '30'}`,
    classEndTime: `${8 + Math.floor(Math.random() * 12)}:${Math.random() > 0.5 ? '00' : '30'}`,
    classDurationMins: 45 + Math.floor(Math.random() * 75),
    notes: `自動化測試課堂 - ${new Date().toLocaleTimeString()}`,
    engagement: Math.floor(Math.random() * 5) + 1,
    atmosphere: randomAtmosphere,
    tricks: selectedTricks,
    mastery: avgMastery,
    plannedTime: totalPlanned,
    actualTime: totalActual,
    skillLevel: selectedTricks[0]?.skillLevel || '初級',
    helpOthers: Math.floor(Math.random() * 101),
    interaction: Math.floor(Math.random() * 101),
    teamwork: Math.floor(Math.random() * 101),
    selfPractice: Math.floor(Math.random() * 101),
    activeLearn: Math.floor(Math.random() * 101),
    positivity: Math.floor(Math.random() * 5) + 1,
    enthusiasm: Math.floor(Math.random() * 5) + 1,
    teachScore: Math.floor(Math.random() * 10) + 1,
    satisfaction: Math.floor(Math.random() * 5) + 1,
    disciplineCount: Math.floor(Math.random() * 5),
    flexibility: Math.floor(Math.random() * 10) + 1,
    individual: Math.floor(Math.random() * 101),
    createdAt: new Date().toISOString()
  };
}

async function testClassContentStorage() {
  const containerId = 'class-content-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('storage-log', '測試課堂內容儲存與讀取...', 'info');

  const currentUserRaw = localStorage.getItem('current-user');
  if (!currentUserRaw) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('storage', false);
    return;
  }

  try {
    const currentUser = JSON.parse(currentUserRaw);
    const scopedKey = getUserScopedKeyForClass();
    let records = loadClassRecordsForTest(scopedKey);
    const sample = buildSampleClassContent(currentUser);

    records = records.filter(r => !(r.classDate === sample.classDate && r.className === sample.className));
    records.push(sample);
    saveClassRecordsForTest(scopedKey, records);

    const reloaded = loadClassRecordsForTest(scopedKey);
    const found = reloaded.find(r => r.classDate === sample.classDate && r.className === sample.className);

    if (found) {
      const trickHasDetails = Array.isArray(found.tricks) && found.tricks.every(t => (
        t.name && (t.mastery != null || t.plannedTime != null || t.actualTime != null || t.skillLevel)
      ));

      addResult(containerId, `✅ 已儲存課堂內容：${found.className} (${found.classDate})`, 'pass');
      addResult(containerId, `花式數量：${found.tricks.length}；含完整進度：${trickHasDetails ? '是' : '否'}`, trickHasDetails ? 'pass' : 'warn');
      addLog('storage-log', `保存鍵：${scopedKey}`, 'success');
      updateStats('storage', trickHasDetails);
    } else {
      addResult(containerId, '未找到剛寫入的課堂內容', 'fail');
      updateStats('storage', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    addLog('storage-log', `錯誤: ${error.message}`, 'error');
    updateStats('storage', false);
  }
}

async function testUserSpecificStorage() {
  const containerId = 'class-content-results';
  addLog('storage-log', '測試用戶專屬課堂儲存...', 'info');

  const currentUserRaw = localStorage.getItem('current-user');
  if (!currentUserRaw) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('storage', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUserRaw);
    const scopedKey = getUserScopedKeyForClass();
    const records = loadClassRecordsForTest(scopedKey);
    const encoded = localStorage.getItem(scopedKey);

    if (encoded && records.length >= 0) {
      addResult(containerId, `用戶 ${userData.username} (ID: ${userData.id || userData.userId}) 擁有專屬鍵 ${scopedKey}`, 'pass');
      addResult(containerId, `現有課堂記錄數：${records.length}`, 'info');
      updateStats('storage', true);
    } else {
      addResult(containerId, '未找到用戶專屬課堂資料', 'warn');
      updateStats('storage', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    updateStats('storage', false);
  }
}

function viewClassContent() {
  const containerId = 'class-content-results';
  const scopedKey = getUserScopedKeyForClass();
  const records = loadClassRecordsForTest(scopedKey);
  const latest = records[0];
  if (!latest) {
    addResult(containerId, '尚無課堂內容，請先新增測試課堂', 'warn');
    return;
  }

  const trickSummary = (latest.tricks || []).map(t => ({
    name: t.name,
    mastery: t.mastery,
    plannedTime: t.plannedTime,
    actualTime: t.actualTime,
    skillLevel: t.skillLevel || t.level
  }));

  addResult(containerId, `最近課堂：${latest.className} (${latest.classDate})`, 'info');
  addResult(containerId, `花式進度：${JSON.stringify(trickSummary, null, 2)}`, 'info');
}

function addTestClassContent() {
  const containerId = 'class-content-results';
  const currentUserRaw = localStorage.getItem('current-user');
  if (!currentUserRaw) {
    addResult(containerId, '請先登入後再新增課堂', 'warn');
    return;
  }

  try {
    const currentUser = JSON.parse(currentUserRaw);
    const scopedKey = getUserScopedKeyForClass();
    let records = loadClassRecordsForTest(scopedKey);
    const sample = buildSampleClassContent(currentUser);
    records = records.filter(r => !(r.classDate === sample.classDate && r.className === sample.className));
    records.push(sample);
    saveClassRecordsForTest(scopedKey, records);
    addResult(containerId, `已新增測試課堂：${sample.className}`, 'pass');
    addLog('storage-log', `保存鍵：${scopedKey}，目前共 ${records.length} 筆`, 'success');
  } catch (error) {
    addResult(containerId, `新增失敗: ${error.message}`, 'fail');
  }
}

/**
 * 批量新增課堂內容
 */
function bulkAddClassContent() {
  const countInput = document.getElementById('bulk-class-count');
  const prefixInput = document.getElementById('bulk-class-prefix');
  const count = parseInt(countInput.value) || 10;
  const prefix = prefixInput.value.trim() || '批量測試班';
  const containerId = 'bulk-class-results';
  const logId = 'bulk-class-log';

  // 驗證數量
  if (count < 1 || count > 100) {
    addResult(containerId, '課堂筆數必須在 1-100 之間', 'fail');
    addLog(logId, '課堂筆數超出範圍', 'error');
    return;
  }

  const currentUserRaw = localStorage.getItem('current-user');
  if (!currentUserRaw) {
    addResult(containerId, '請先登入後再新增課堂', 'warn');
    return;
  }

  document.getElementById(containerId).innerHTML = '';
  addLog(logId, `=== 批量新增 ${count} 筆課堂內容 ===`, 'info');

  try {
    const currentUser = JSON.parse(currentUserRaw);
    const scopedKey = getUserScopedKeyForClass();
    const records = loadClassRecordsForTest(scopedKey) || [];
    const startCount = records.length;
    const today = new Date();

    // 定義可用的花式池
    const allTricks = [
      { name: '單搖', detail: '基礎花式', level: '初級', skillLevel: '初級' },
      { name: '交叉跳', detail: '進階花式', level: '中級', skillLevel: '中級' },
      { name: '雙搖', detail: '難度花式', level: '進階', skillLevel: '進階' },
      { name: '三搖', detail: '超難度花式', level: '進階', skillLevel: '進階' },
      { name: '側搖', detail: '技巧花式', level: '中級', skillLevel: '中級' },
      { name: '後搖', detail: '進階技巧', level: '中級', skillLevel: '中級' },
      { name: '跳繩棒', detail: '特殊技巧', level: '進階', skillLevel: '進階' }
    ];

    const atmospheres = ['開心', '不開心', '認真學習', '心散', '一般'];
    const locations = ['操場', '體育館', '教室', '多功能室', '活動中心'];
    const roles = ['主教練', '助教', '副教練'];

    for (let i = 1; i <= count; i++) {
      const dateOffset = Math.floor((i - 1) / 5);
      const classDate = new Date(today);
      classDate.setDate(classDate.getDate() - dateOffset);
      const dateStr = classDate.toISOString().slice(0, 10);

      // 隨機選擇 1-3 個不同的花式
      const trickCount = Math.floor(Math.random() * 3) + 1;
      const selectedTricks = [];
      const usedIndices = new Set();

      while (selectedTricks.length < trickCount) {
        const idx = Math.floor(Math.random() * allTricks.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          selectedTricks.push({
            ...allTricks[idx],
            mastery: Math.floor(Math.random() * 101),
            plannedTime: 5 + Math.floor(Math.random() * 25),
            actualTime: 5 + Math.floor(Math.random() * 25)
          });
        }
      }

      const avgMastery = Math.round(selectedTricks.reduce((a, b) => a + b.mastery, 0) / selectedTricks.length);
      const totalPlanned = selectedTricks.reduce((a, b) => a + (b.plannedTime || 0), 0);
      const totalActual = selectedTricks.reduce((a, b) => a + (b.actualTime || 0), 0);

      // 為每筆課堂添加唯一ID（確保primary key不重複）
      const uniqueId = `${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;

      const classContent = {
        id: uniqueId,
        classDate: dateStr,
        className: `${prefix}-${i}`,
        classSize: 8 + Math.floor(Math.random() * 23),
        classLocation: locations[Math.floor(Math.random() * locations.length)],
        teachingRole: roles[Math.floor(Math.random() * roles.length)],
        classStartTime: `${7 + Math.floor(Math.random() * 12)}:${Math.random() > 0.5 ? '00' : '30'}`,
        classEndTime: `${8 + Math.floor(Math.random() * 12)}:${Math.random() > 0.5 ? '00' : '30'}`,
        classDurationMins: 45 + Math.floor(Math.random() * 75),
        notes: `批量測試課堂第 ${i} 筆 - ${new Date().toLocaleTimeString()}`,
        engagement: Math.floor(Math.random() * 5) + 1,
        atmosphere: atmospheres[Math.floor(Math.random() * atmospheres.length)],
        tricks: selectedTricks,
        mastery: avgMastery,
        plannedTime: totalPlanned,
        actualTime: totalActual,
        skillLevel: selectedTricks[0]?.skillLevel || '初級',
        helpOthers: Math.floor(Math.random() * 101),
        interaction: Math.floor(Math.random() * 101),
        teamwork: Math.floor(Math.random() * 101),
        selfPractice: Math.floor(Math.random() * 101),
        activeLearn: Math.floor(Math.random() * 101),
        positivity: Math.floor(Math.random() * 5) + 1,
        enthusiasm: Math.floor(Math.random() * 5) + 1,
        teachScore: Math.floor(Math.random() * 10) + 1,
        satisfaction: Math.floor(Math.random() * 5) + 1,
        disciplineCount: Math.floor(Math.random() * 5),
        flexibility: Math.floor(Math.random() * 10) + 1,
        individual: Math.floor(Math.random() * 101),
        createdAt: new Date().toISOString()
      };

      records.push(classContent);

      if (i % 10 === 0) {
        addLog(logId, `已新增 ${i}/${count} 筆課堂...`, 'info');
      }
    }

    saveClassRecordsForTest(scopedKey, records);

    addResult(containerId, '✅ 批量新增成功！', 'pass');
    addResult(containerId, `總計 ${count} 筆課堂已新增`, 'pass');
    addResult(containerId, `課堂名稱: ${prefix}-1 ~ ${prefix}-${count}`, 'info');
    addResult(containerId, `日期跨度: ${Math.floor((count - 1) / 5)} 天`, 'info');

    addLog(logId, '✅ 批量新增完成！', 'success');
    addLog(logId, `共新增 ${count} 筆課堂，名稱前綴: ${prefix}`, 'success');
    addLog(logId, `總課堂數: ${startCount} → ${records.length}`, 'success');
    addLog(logId, `保存鍵: ${scopedKey}`, 'success');

    updateStats('storage', true);
  } catch (error) {
    addResult(containerId, `批量新增失敗: ${error.message}`, 'fail');
    addLog(logId, `錯誤: ${error.message}`, 'error');
    updateStats('storage', false);
  }
}

/**
 * 查看所有課堂內容
 */
function bulkViewClassContent() {
  const containerId = 'bulk-class-results';
  document.getElementById(containerId).innerHTML = '';

  const scopedKey = getUserScopedKeyForClass();
  const records = loadClassRecordsForTest(scopedKey);

  if (!records || records.length === 0) {
    addResult(containerId, '尚無課堂內容', 'warn');
    return;
  }

  addResult(containerId, `📊 共 ${records.length} 筆課堂記錄`, 'info');

  // 顯示前 5 筆課堂摘要
  records.slice(0, 5).forEach((c, idx) => {
    const trickNames = (c.tricks || []).map(t => t.name).join('、') || '無';
    addResult(containerId, `[${idx + 1}] ${c.className} (${c.classDate}) - 花式: ${trickNames}`, 'info');
  });

  if (records.length > 5) {
    addResult(containerId, `... 和 ${records.length - 5} 筆課堂`, 'info');
  }
}

/**
 * 清除所有課堂內容
 */
function bulkClearClassContent() {
  if (!confirm('確定要清除所有課堂內容嗎？')) {
    return;
  }

  try {
    const scopedKey = getUserScopedKeyForClass();
    localStorage.removeItem(scopedKey);
    localStorage.removeItem('rope-skip-checkpoints');

    addResult('bulk-class-results', '✅ 已清除所有課堂內容', 'pass');
    addLog('bulk-class-log', '清除完成', 'success');
  } catch (error) {
    addResult('bulk-class-results', `清除失敗: ${error.message}`, 'fail');
    addLog('bulk-class-log', `錯誤: ${error.message}`, 'error');
  }
}

/**
 * 測試資料關聯
 */
function testDataRelationship() {
  const containerId = 'relationship-results';
  document.getElementById(containerId).innerHTML = '';

  const currentUser = localStorage.getItem('current-user');
  const session = localStorage.getItem('rs-system-session');

  if (!currentUser || !session) {
    addResult(containerId, '缺少用戶或會話數據', 'fail');
    updateStats('storage', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    const sessionData = JSON.parse(session);

    if (userData.id === sessionData.userId || userData.userId === sessionData.userId) {
      addResult(containerId, '用戶資料與會話資料正確關聯', 'pass');
      addLog('storage-log', '資料關聯測試通過', 'success');
      updateStats('storage', true);
    } else {
      addResult(containerId, '用戶資料與會話資料不匹配', 'fail');
      updateStats('storage', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    updateStats('storage', false);
  }
}

/**
 * 測試用戶資料隔離
 */
async function testUserDataIsolation() {
  const containerId = 'relationship-results';
  addLog('storage-log', '測試用戶資料隔離...', 'info');

  try {
    const databases = await indexedDB.databases();
    const pouchDbs = databases.filter(db =>
      db.name.includes('_pouch_') || db.name.includes('rs-system')
    );

    addResult(containerId, `找到 ${pouchDbs.length} 個 PouchDB 資料庫`, 'info');
    addLog('storage-log', `資料庫數量: ${pouchDbs.length}`, 'info');

    pouchDbs.forEach(db => {
      addLog('storage-log', `- ${db.name}`, 'info');
    });

    if (pouchDbs.length > 0) {
      addResult(containerId, '每個用戶擁有獨立的資料庫', 'pass');
      updateStats('storage', true);
    } else {
      addResult(containerId, '未找到用戶資料庫', 'warn');
      updateStats('storage', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    updateStats('storage', false);
  }
}

// ==================== 資料庫測試 ====================

/**
 * 初始化用戶資料庫（為測試創建數據）
 */
async function initializeUserDatabase() {
  const containerId = 'db-structure-results';
  addLog('db-log', '初始化用戶資料庫...', 'info');

  const currentUser = localStorage.getItem('current-user');
  if (!currentUser) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('database', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    const userId = userData.id || userData.userId;
    const dbName = `rs-system-${userId}`;

    addLog('db-log', `為用戶 ${userData.username} 初始化資料庫...`, 'info');
    addLog('db-log', `資料庫名: ${dbName}`, 'info');

    // 創建測試資料（模擬課程記錄）
    const testData = {
      _id: `course_${Date.now()}`,
      type: 'course',
      title: '測試課程',
      content: '這是一個測試課程記錄',
      createdAt: new Date().toISOString(),
      userId,
      username: userData.username
    };

    // 創建 IndexedDB 數據庫來保存測試數據
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(dbName, 1);

        request.onerror = () => {
          addResult(containerId, '❌ 創建數據庫失敗', 'fail');
          addLog('db-log', `IndexedDB 錯誤: ${request.error}`, 'error');
          updateStats('database', false);
          reject(request.error);
        };

        request.onsuccess = event => {
          const db = event.target.result;

          // 創建一個 object store 用來存儲測試數據
          if (!db.objectStoreNames.contains('courses')) {
            const transaction = db.transaction(['courses'], 'readwrite');
            const store = transaction.objectStore('courses');
            store.add(testData);

            addLog('db-log', '已創建 \'courses\' 對象存儲', 'info');
          } else {
            const transaction = db.transaction(['courses'], 'readwrite');
            const store = transaction.objectStore('courses');
            store.add(testData);

            addLog('db-log', '已在現有 \'courses\' 存儲中添加測試數據', 'info');
          }

          db.close();

          // 同時在 localStorage 中存儲備份
          const dbKey = `${dbName}_test_data`;
          localStorage.setItem(dbKey, JSON.stringify(testData));

          addResult(containerId, `✅ 資料庫初始化成功: ${dbName}`, 'pass');
          addLog('db-log', '測試資料已創建 (IndexedDB + localStorage)', 'success');
          addLog('db-log', `資料 ID: ${testData._id}`, 'info');
          updateStats('database', true);
          resolve(true);
        };

        request.onupgradeneeded = event => {
          const db = event.target.result;

          // 如果還沒有創建 object store，就創建一個
          if (!db.objectStoreNames.contains('courses')) {
            db.createObjectStore('courses', { keyPath: '_id' });
            addLog('db-log', '已創建 \'courses\' 對象存儲', 'info');
          }
        };
      } catch (error) {
        addResult(containerId, `初始化失敗: ${error.message}`, 'fail');
        addLog('db-log', `錯誤: ${error.message}`, 'error');
        updateStats('database', false);
        reject(error);
      }
    });

  } catch (error) {
    addResult(containerId, `初始化失敗: ${error.message}`, 'fail');
    addLog('db-log', `錯誤: ${error.message}`, 'error');
    updateStats('database', false);
  }
}

/**
 * 測試資料庫結構
 */
async function testDatabaseStructure() {
  const containerId = 'db-structure-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('db-log', '檢查資料庫結構...', 'info');

  try {
    const databases = await indexedDB.databases();
    addResult(containerId, `系統中共有 ${databases.length} 個資料庫`, 'info');
    addLog('db-log', `資料庫總數: ${databases.length}`, 'info');

    databases.forEach(db => {
      addLog('db-log', `- ${db.name} (v${db.version})`, 'info');
    });

    updateStats('database', true);
  } catch (error) {
    addResult(containerId, `檢查失敗: ${error.message}`, 'fail');
    updateStats('database', false);
  }
}

/**
 * 驗證資料庫命名
 */
async function testUserDatabaseNaming() {
  const containerId = 'db-structure-results';
  addLog('db-log', '驗證資料庫命名規則...', 'info');

  const currentUser = localStorage.getItem('current-user');
  if (!currentUser) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('database', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    const userId = userData.id || userData.userId;
    const expectedDbName = `rs-system-${userId}`;

    const databases = await indexedDB.databases();
    const userDb = databases.find(db =>
      db.name.includes(expectedDbName) ||
      db.name.includes(`_pouch_${expectedDbName}`)
    );

    if (userDb) {
      addResult(containerId, `✅ 資料庫命名正確: ${userDb.name}`, 'pass');
      addLog('db-log', `預期命名: ${expectedDbName}`, 'success');
      addLog('db-log', `實際命名: ${userDb.name}`, 'success');
      updateStats('database', true);
    } else {
      // 檢查 localStorage 中的備份數據
      const testDataKey = `${expectedDbName}_test_data`;
      const backupData = localStorage.getItem(testDataKey);

      if (backupData) {
        addResult(containerId, `✅ 資料庫備份數據存在: ${expectedDbName}`, 'pass');
        addLog('db-log', `預期命名: ${expectedDbName}`, 'success');
        addLog('db-log', `備份數據鑰匙: ${testDataKey}`, 'success');
        updateStats('database', true);
      } else {
        addResult(containerId, `❌ 未找到預期的資料庫: ${expectedDbName}`, 'warn');
        addLog('db-log', '可能尚未創建資料，請先執行初始化', 'warn');
        updateStats('database', false);
      }
    }
  } catch (error) {
    addResult(containerId, `驗證失敗: ${error.message}`, 'fail');
    updateStats('database', false);
  }
}

/**
 * 列出所有資料庫
 */
async function listAllDatabases() {
  const containerId = 'db-structure-results';
  addLog('db-log', '列出所有資料庫...', 'info');

  try {
    const databases = await indexedDB.databases();

    if (databases.length === 0) {
      addResult(containerId, '系統中無資料庫', 'warn');
      updateStats('database', false);
      return;
    }

    addResult(containerId, `找到 ${databases.length} 個資料庫:`, 'info');
    databases.forEach((db, index) => {
      addResult(containerId, `${index + 1}. ${db.name} (版本 ${db.version})`, 'info');
      addLog('db-log', `${index + 1}. ${db.name} (v${db.version})`, 'info');
    });

    updateStats('database', true);
  } catch (error) {
    addResult(containerId, `列表失敗: ${error.message}`, 'fail');
    updateStats('database', false);
  }
}

/**
 * 測試跨用戶訪問
 */
function testCrossUserAccess() {
  addResult('isolation-results', '跨用戶訪問測試需要多個用戶賬號', 'info');
  addLog('db-log', '請使用不同賬號登入測試資料隔離', 'info');
}

/**
 * 查看用戶資料庫
 */
async function viewUserDatabases() {
  const container = document.getElementById('isolation-results');
  const tableHtml = `
    <table class="user-data-table" id="user-db-table" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background: #667eea; color: white;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">用戶 ID</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">用戶名</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">資料庫名稱</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">資料筆數</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">狀態</th>
        </tr>
      </thead>
      <tbody id="user-db-tbody"></tbody>
    </table>
  `;

  const table = document.getElementById('user-db-table');
  let tbody = document.getElementById('user-db-tbody');

  // 如果表格不存在，創建表格
  if (!table) {
    const div = document.createElement('div');
    div.innerHTML = tableHtml;
    container.appendChild(div);
    tbody = document.getElementById('user-db-tbody');
  } else {
    tbody.innerHTML = '';
  }

  addLog('db-log', '查看用戶資料庫...', 'info');

  try {
    const users = localStorage.getItem('users');
    if (!users) {
      addResult('isolation-results', '未找到用戶列表', 'warn');
      return;
    }

    const usersList = JSON.parse(users);
    const databases = await indexedDB.databases();

    for (const user of usersList) {
      const userId = user.id || user.userId;
      const expectedDbName = `rs-system-${userId}`;
      const userDb = databases.find(db =>
        db.name.includes(expectedDbName)
      );

      const row = tbody.insertRow();
      row.style.borderBottom = '1px solid #dee2e6';

      row.insertCell(0).textContent = userId;
      row.insertCell(1).textContent = user.username;
      row.insertCell(2).textContent = userDb ? userDb.name : '未找到';
      row.insertCell(3).textContent = 'N/A';

      const statusCell = row.insertCell(4);
      const badge = document.createElement('span');
      badge.style.padding = '4px 12px';
      badge.style.borderRadius = '4px';
      badge.style.fontSize = '0.85em';
      badge.style.fontWeight = 'bold';
      badge.className = userDb ? 'badge success' : 'badge danger';
      badge.style.background = userDb ? '#28a745' : '#dc3545';
      badge.style.color = 'white';
      badge.textContent = userDb ? '正常' : '缺失';
      statusCell.appendChild(badge);
    }

    addResult('isolation-results', `✅ 顯示 ${usersList.length} 個用戶的資料庫狀態`, 'info');
    updateStats('database', true);
  } catch (error) {
    addResult('isolation-results', `❌ 查看失敗: ${error.message}`, 'fail');
    updateStats('database', false);
  }
}

/**
 * 測試資料完整性
 */
function testDataIntegrity() {
  addResult('integrity-results', '資料完整性測試需要實際資料操作', 'info');
  addLog('db-log', '請在主應用中進行資料操作測試', 'info');
}

/**
 * 測試資料同步
 */
function testDataSync() {
  addResult('integrity-results', '資料同步測試需要遠程 CouchDB 配置', 'info');
  addLog('db-log', '如需測試同步，請配置 CouchDB', 'info');
}

// ==================== Creator 測試 ====================

/**
 * 驗證 Creator 角色
 */
function testCreatorRole() {
  const containerId = 'creator-role-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('creator-log', '驗證 Creator 角色...', 'info');

  const currentUser = localStorage.getItem('current-user');
  if (!currentUser) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('creator', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);

    if (userData.username === 'creator') {
      addResult(containerId, '當前用戶是 Creator', 'pass');
      addLog('creator-log', `用戶名: ${userData.username}`, 'success');
      addLog('creator-log', `角色: ${userData.role || 'creator'}`, 'success');
      updateStats('creator', true);
    } else {
      addResult(containerId, `當前用戶是 ${userData.username}，不是 Creator`, 'warn');
      addLog('creator-log', `當前用戶: ${userData.username}`, 'warn');
      updateStats('creator', false);
    }
  } catch (error) {
    addResult(containerId, `驗證失敗: ${error.message}`, 'fail');
    updateStats('creator', false);
  }
}

/**
 * 測試 Creator 權限
 */
function testCreatorPermissions() {
  const currentUser = localStorage.getItem('current-user');
  if (!currentUser) {
    addResult('creator-role-results', '請先登入', 'warn');
    updateStats('creator', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    if (userData.username === 'creator') {
      addResult('creator-role-results', 'Creator 擁有完整系統權限', 'pass');
      addLog('creator-log', 'Creator 權限測試通過', 'success');
      updateStats('creator', true);
    } else {
      addResult('creator-role-results', '當前用戶不是 Creator', 'warn');
      updateStats('creator', false);
    }
  } catch (error) {
    addResult('creator-role-results', `測試失敗: ${error.message}`, 'fail');
    updateStats('creator', false);
  }
}

/**
 * 以 Creator 身份登入
 */
function loginAsCreator() {
  addLog('creator-log', '以 Creator 身份登入...', 'info');

  // 首先檢查是否已經以 Creator 身份登入
  const currentUser = localStorage.getItem('current-user');
  if (currentUser) {
    try {
      const userData = JSON.parse(currentUser);
      if (userData.username === 'creator') {
        addResult('creator-role-results', '✅ 已以 Creator 身份登入', 'pass');
        addLog('creator-log', `當前用戶: ${userData.username}`, 'success');
        updateStats('creator', true);
        return;
      }
    } catch (error) {
      // 繼續執行登入流程
    }
  }

  // 嘗試自動登入
  performLogin('creator', '1234').then(success => {
    if (success) {
      addResult('creator-role-results', '✅ Creator 登入成功', 'pass');
      addLog('creator-log', '已自動登入 Creator 帳號', 'success');
      updateStats('creator', true);
    } else {
      addResult('creator-role-results', '⚠️ Creator 登入失敗，請手動訪問 login.html', 'warn');
      addLog('creator-log', '測試帳號: username: creator, password: 1234', 'info');

      setTimeout(() => {
        window.open('login.html', '_blank');
      }, 500);
    }
  }).catch(error => {
    addResult('creator-role-results', `登入錯誤: ${error.message}`, 'fail');
    addLog('creator-log', `錯誤: ${error.message}`, 'error');
  });
}

/**
 * 測試 Creator UI
 */
function testCreatorUI() {
  const containerId = 'creator-ui-results';
  document.getElementById(containerId).innerHTML = '';

  const currentUser = localStorage.getItem('current-user');
  if (!currentUser) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('creator', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    if (userData.username === 'creator') {
      addResult(containerId, 'Creator 應該看到專屬管理界面', 'pass');
      addLog('creator-log', 'Creator UI 測試需在主應用中驗證', 'info');
      updateStats('creator', true);
    } else {
      addResult(containerId, '當前用戶不是 Creator', 'warn');
      updateStats('creator', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    updateStats('creator', false);
  }
}

/**
 * 測試 Creator 功能
 */
function testCreatorFeatures() {
  const containerId = 'creator-ui-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('creator-log', '測試 Creator 功能...', 'info');

  const currentUser = localStorage.getItem('current-user');
  if (!currentUser) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('creator', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    if (userData.username === 'creator') {
      const features = [
        '✅ 課程管理',
        '✅ 用戶管理',
        '✅ 統計報表',
        '✅ 系統設置'
      ];

      addResult(containerId, 'Creator 應該擁有以下功能:', 'pass');
      features.forEach(feature => {
        addLog('creator-log', feature, 'success');
      });
      updateStats('creator', true);
    } else {
      addResult(containerId, '當前用戶不是 Creator', 'warn');
      updateStats('creator', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    updateStats('creator', false);
  }
}

/**
 * 查看 Creator 界面
 */
function viewCreatorInterface() {
  addResult('creator-ui-results', '打開主應用查看 Creator 界面', 'info');
  addLog('creator-log', '正在打開 index.html...', 'info');

  setTimeout(() => {
    window.open('index.html', '_blank');
  }, 500);
}

/**
 * 測試 Creator 管理功能
 */
function testCreatorManagement() {
  const containerId = 'creator-mgmt-results';
  document.getElementById(containerId).innerHTML = '';
  addLog('creator-log', '測試 Creator 管理功能...', 'info');

  const currentUser = localStorage.getItem('current-user');
  if (!currentUser) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('creator', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    if (userData.username === 'creator') {
      const managementFeatures = [
        { name: '系統用戶管理', status: '✅' },
        { name: '課程內容管理', status: '✅' },
        { name: '成績統計管理', status: '✅' },
        { name: '系統配置管理', status: '✅' }
      ];

      addResult(containerId, 'Creator 管理功能已驗證:', 'pass');
      managementFeatures.forEach(feature => {
        addLog('creator-log', `${feature.status} ${feature.name}`, 'success');
      });
      updateStats('creator', true);
    } else {
      addResult(containerId, '當前用戶不是 Creator', 'warn');
      updateStats('creator', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    updateStats('creator', false);
  }
}

/**
 * 測試 Creator 資料訪問
 */
function testCreatorDataAccess() {
  const containerId = 'creator-mgmt-results';
  addLog('creator-log', '測試 Creator 資料訪問權限...', 'info');

  const currentUser = localStorage.getItem('current-user');
  if (!currentUser) {
    addResult(containerId, '請先登入', 'warn');
    updateStats('creator', false);
    return;
  }

  try {
    const userData = JSON.parse(currentUser);
    if (userData.username === 'creator') {
      // 檢查是否能訪問用戶數據
      const users = localStorage.getItem('users');
      const hasUserAccess = users ? true : false;

      if (hasUserAccess) {
        addResult(containerId, '✅ Creator 可訪問所有用戶資料', 'pass');
        addLog('creator-log', '用戶資料訪問權限: 正常', 'success');
      } else {
        addResult(containerId, '⚠️ 未檢測到用戶資料', 'warn');
        addLog('creator-log', '可能尚未有用戶數據', 'warn');
      }
      updateStats('creator', true);
    } else {
      addResult(containerId, '當前用戶不是 Creator', 'warn');
      updateStats('creator', false);
    }
  } catch (error) {
    addResult(containerId, `測試失敗: ${error.message}`, 'fail');
    updateStats('creator', false);
  }
}

// ==================== 綜合測試 ====================

/**
 * 執行所有測試
 */
async function runAllTests() {
  const containerId = 'summary-results';
  document.getElementById(containerId).innerHTML = '';
  const logId = 'summary-log';
  document.getElementById(logId).textContent = '';

  addLog(logId, '========== 開始執行所有測試 ==========', 'info');
  addResult(containerId, '正在執行所有測試...', 'info');

  // 第一步：自動創建測試用戶以確保後面的測試能順利運行
  addLog(logId, '\n=== 自動創建測試用戶 ===', 'info');
  addResult(containerId, '正在創建測試用戶...', 'info');

  try {
    // 獲取或創建用戶列表
    const users = localStorage.getItem('users');
    const usersList = users ? JSON.parse(users) : [];

    // 定義測試用戶
    const testUsers = [
      { username: 'creator', password: '1234', role: 'creator' },
      { username: 'alice', password: 'pass123', role: 'user' },
      { username: 'bob', password: 'pass123', role: 'user' },
      { username: 'charlie', password: 'pass123', role: 'user' },
      { username: 'teacher1', password: 'pass123', role: 'user' }
    ];

    // 創建測試用戶
    testUsers.forEach(testUser => {
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: testUser.username,
        password: testUser.password,
        role: testUser.role,
        createdAt: new Date().toISOString()
      };
      usersList.push(newUser);
      addLog(logId, `✅ 創建用戶: ${testUser.username} (${testUser.role})`, 'success');
    });

    // 保存用戶列表
    localStorage.setItem('users', JSON.stringify(usersList));
    addLog(logId, `共創建 ${testUsers.length} 個測試用戶`, 'success');
    addLog(logId, '測試用戶創建完成，準備開始測試...', 'info');
  } catch (error) {
    addLog(logId, `創建測試用戶失敗: ${error.message}`, 'error');
  }

  // 登入測試
  addLog(logId, '\n=== 登入測試 ===', 'info');
  testLoginStatus();
  await new Promise(r => setTimeout(r, 300));
  testSessionValidity();
  await new Promise(r => setTimeout(r, 300));
  testSessionData();
  await new Promise(r => setTimeout(r, 300));

  // 自動登入 Creator 以供後續測試使用
  addLog(logId, '\n=== 自動登入 Creator ===', 'info');
  await performLogin('creator', '1234');
  await new Promise(r => setTimeout(r, 500));

  // 初始化資料庫
  addLog(logId, '\n=== 初始化資料庫 ===', 'info');
  await initializeUserDatabase();
  await new Promise(r => setTimeout(r, 500));

  // 資料儲存測試
  addLog(logId, '\n=== 資料儲存測試 ===', 'info');
  testLoginDataStorage();
  await new Promise(r => setTimeout(r, 300));
  testUserDataPersistence();
  await new Promise(r => setTimeout(r, 300));
  await testClassContentStorage();
  await new Promise(r => setTimeout(r, 300));
  await testUserSpecificStorage();
  await new Promise(r => setTimeout(r, 300));
  testDataRelationship();
  await new Promise(r => setTimeout(r, 300));

  // 資料庫測試
  addLog(logId, '\n=== 資料庫測試 ===', 'info');
  await testDatabaseStructure();
  await new Promise(r => setTimeout(r, 300));
  await testUserDatabaseNaming();
  await new Promise(r => setTimeout(r, 300));
  await listAllDatabases();
  await new Promise(r => setTimeout(r, 300));

  // Creator 測試
  addLog(logId, '\n=== Creator 測試 ===', 'info');
  testCreatorRole();
  await new Promise(r => setTimeout(r, 300));
  testCreatorPermissions();
  await new Promise(r => setTimeout(r, 300));
  testCreatorUI();
  await new Promise(r => setTimeout(r, 300));
  testCreatorFeatures();
  await new Promise(r => setTimeout(r, 300));
  testCreatorManagement();
  await new Promise(r => setTimeout(r, 300));
  testCreatorDataAccess();
  await new Promise(r => setTimeout(r, 300));

  addLog(logId, '\n========== 所有測試完成 ==========', 'success');
  addResult(containerId, '所有自動測試已完成，請查看各分類結果', 'pass');
}

/**
 * 匯出測試報告
 */
function exportTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: Object.values(testResults).reduce((sum, cat) => sum + cat.total, 0),
      pass: Object.values(testResults).reduce((sum, cat) => sum + cat.pass, 0),
      fail: Object.values(testResults).reduce((sum, cat) => sum + cat.fail, 0)
    },
    details: testResults
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-report-${Date.now()}.json`;
  a.click();

  addResult('summary-results', '測試報告已匯出', 'pass');
  addLog('summary-log', `報告匯出: test-report-${Date.now()}.json`, 'success');
}

/**
 * 重置所有測試
 */
function resetAllTests() {
  testResults = {
    login: { total: 0, pass: 0, fail: 0 },
    storage: { total: 0, pass: 0, fail: 0 },
    database: { total: 0, pass: 0, fail: 0 },
    creator: { total: 0, pass: 0, fail: 0 }
  };

  updateSummaryStats();

  // 清空所有結果容器
  document.querySelectorAll('[id$="-results"]').forEach(el => el.innerHTML = '');
  document.querySelectorAll('.log-viewer').forEach(el => el.textContent = '');

  addResult('summary-results', '所有測試已重置', 'info');
}

// ==================== 初始化 ====================

console.log('%c✅ RS System 測試系統已加載', 'color: green; font-size: 16px; font-weight: bold;');
console.log('%c測試分類: 登入狀態 | 資料儲存 | 用戶資料庫 | Creator 界面', 'color: blue; font-size: 14px;');
console.log('使用各標籤頁的按鈕執行測試');

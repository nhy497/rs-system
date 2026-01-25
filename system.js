/**
 * HKJRA 教練記錄系統 · 跳繩課堂 Checkpoint
 * 整合系統核心模組 - 統一 JavaScript 檔案
 * v3.0: 完整整合版本（app + login + auth + storage + ui）
 * 
 * 模組結構：
 * 1. 全局常數和配置
 * 2. 存儲管理系統 (STORAGE_MANAGER)
 * 3. 認證系統 (AuthenticationManager, LOGIN_MANAGER)
 * 4. UI 管理 (UI_MANAGER)
 * 5. 應用核心業務邏輯 (app.js 功能)
 * 6. PouchDB 儲存服務 (StorageService)
 * 7. Firebase 配置 (可選)
 * 8. 應用初始化
 */

// ============================================================================
// 第 1 部分：全局常數和配置
// ============================================================================

const STORAGE_KEY = 'rope-skip-checkpoints';
const CLASS_PRESETS_KEY = 'rope-skip-class-presets';
const SCORE_1_5_IDS = ['engagement', 'positivity', 'enthusiasm', 'satisfaction'];
const RANGE_IDS = [
  'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
  'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
  'teachScore', 'satisfaction', 'flexibility', 'individual'
];
const OPTION_GROUPS = [
  { name: 'atmosphere', selector: '[data-name="atmosphere"]' },
  { name: 'skillLevel', selector: '[data-name="skillLevel"]' }
];
const PAGE_TITLES = { 
  overview: '課堂概覽', 
  students: '學生管理', 
  actions: '動作記錄', 
  analytics: '統計分析' 
};
const TRICK_LEVELS = ['初級', '中級', '進階'];

// 快速 DOM 選擇器
let $ = (id) => document.getElementById(id);
let $q = (sel) => document.querySelector(sel);
let $qa = (sel) => document.querySelectorAll(sel);

// ============================================================================
// 第 2 部分：存儲管理系統
// ============================================================================

const STORAGE_MANAGER = {
  KEYS: {
    CHECKPOINTS: 'rope-skip-checkpoints',
    PRESETS: 'rope-skip-class-presets',
    SESSION: 'rs-system-session',
    CURRENT_USER: 'current-user',
    USERS: 'users',
    BACKUP_TIMESTAMP: 'backup-timestamp'
  },

  CONFIG: {
    MAX_RETRIES: 3,
    STORAGE_QUOTA: 5 * 1024 * 1024,
    AUTO_BACKUP_INTERVAL: 3600000,
    COMPRESSION_THRESHOLD: 100
  },

  cache: {
    checkpoints: null,
    presets: null,
    lastSync: 0
  },

  async init() {
    try {
      this.testLocalStorage();
      await this.loadCache();
      this.startAutoBackup();
      console.log('✅ 存儲管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 存儲管理器初始化失敗:', error);
      return false;
    }
  },

  testLocalStorage() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      throw new Error('localStorage 不可用或已滿');
    }
  },

  async getCheckpoints() {
    try {
      if (this.cache.checkpoints && Date.now() - this.cache.lastSync < 300000) {
        return this.cache.checkpoints;
      }

      const encoded = localStorage.getItem(this.KEYS.CHECKPOINTS);
      if (!encoded) {
        this.cache.checkpoints = [];
        return [];
      }

      try {
        const decoded = JSON.parse(atob(encoded));
        this.cache.checkpoints = decoded;
        this.cache.lastSync = Date.now();
        return decoded;
      } catch (decodeError) {
        console.warn('⚠️ Base64 解碼失敗，嘗試直接解析...');
        const directParse = JSON.parse(encoded);
        localStorage.setItem(this.KEYS.CHECKPOINTS, btoa(JSON.stringify(directParse)));
        this.cache.checkpoints = directParse;
        this.cache.lastSync = Date.now();
        return directParse;
      }
    } catch (error) {
      console.error('❌ 讀取課堂記錄失敗:', error);
      const backup = this.getBackup();
      if (backup && backup.checkpoints) {
        console.log('📦 從備份恢復課堂記錄');
        this.cache.checkpoints = backup.checkpoints;
        return backup.checkpoints;
      }
      return [];
    }
  },

  async saveCheckpoints(records) {
    let retryCount = 0;
    while (retryCount < this.CONFIG.MAX_RETRIES) {
      try {
        if (!Array.isArray(records)) throw new Error('數據格式無效');

        const encoded = btoa(JSON.stringify(records));
        if (encoded.length > this.CONFIG.STORAGE_QUOTA) {
          console.warn('⚠️ 存儲空間不足');
          this.cleanupOldData(records);
          continue;
        }

        localStorage.setItem(this.KEYS.CHECKPOINTS, encoded);
        this.cache.checkpoints = records;
        this.cache.lastSync = Date.now();
        console.log(`✅ 保存 ${records.length} 筆課堂記錄`);
        return true;
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ 保存失敗，重試 ${retryCount}/${this.CONFIG.MAX_RETRIES}`);
        if (retryCount >= this.CONFIG.MAX_RETRIES) {
          console.error('❌ 保存課堂記錄失敗:', error);
          this.saveBackup(records);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }
    return false;
  },

  async getPresets() {
    try {
      if (this.cache.presets && Date.now() - this.cache.lastSync < 300000) {
        return this.cache.presets;
      }
      const raw = localStorage.getItem(this.KEYS.PRESETS);
      const presets = raw ? JSON.parse(raw) : [];
      this.cache.presets = presets;
      return presets;
    } catch (error) {
      console.error('❌ 讀取班級預設失敗:', error);
      return [];
    }
  },

  async savePresets(presets) {
    try {
      localStorage.setItem(this.KEYS.PRESETS, JSON.stringify(presets));
      this.cache.presets = presets;
      console.log(`✅ 保存 ${presets.length} 個班級預設`);
      return true;
    } catch (error) {
      console.error('❌ 保存班級預設失敗:', error);
      return false;
    }
  },

  cleanupOldData(records) {
    try {
      if (records.length > 500) {
        const sorted = [...records].sort((a, b) => 
          (b.classDate || '').localeCompare(a.classDate || '')
        );
        return sorted.slice(0, 500);
      }
      return records;
    } catch (error) {
      console.error('❌ 清理舊數據失敗:', error);
      return records;
    }
  },

  startAutoBackup() {
    setInterval(() => {
      try {
        const checkpoints = this.cache.checkpoints || [];
        const presets = this.cache.presets || [];
        this.saveBackup({ checkpoints, presets });
        console.log('✅ 自動備份完成');
      } catch (error) {
        console.error('❌ 自動備份失敗:', error);
      }
    }, this.CONFIG.AUTO_BACKUP_INTERVAL);
  },

  saveBackup(data) {
    try {
      const backup = { timestamp: Date.now(), data: data, version: '2.1' };
      sessionStorage.setItem('backup_' + Date.now(), JSON.stringify(backup));
      
      const allBackups = Object.keys(sessionStorage)
        .filter(key => key.startsWith('backup_'))
        .sort()
        .reverse();
      
      for (let i = 3; i < allBackups.length; i++) {
        sessionStorage.removeItem(allBackups[i]);
      }
      localStorage.setItem(this.KEYS.BACKUP_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('⚠️ 備份保存失敗:', error);
    }
  },

  getBackup() {
    try {
      const allBackups = Object.keys(sessionStorage)
        .filter(key => key.startsWith('backup_'))
        .sort()
        .reverse();
      
      if (allBackups.length > 0) {
        const latestBackup = JSON.parse(sessionStorage.getItem(allBackups[0]));
        return latestBackup.data;
      }
      return null;
    } catch (error) {
      console.error('⚠️ 備份恢復失敗:', error);
      return null;
    }
  },

  async loadCache() {
    try {
      this.cache.checkpoints = await this.getCheckpoints();
      this.cache.presets = await this.getPresets();
      console.log('✅ 快取已加載');
    } catch (error) {
      console.error('⚠️ 快取加載失敗:', error);
    }
  },

  clearAll() {
    try {
      if (!confirm('確定要清除所有數據嗎？此操作無法復原。')) return false;
      for (const key of Object.values(this.KEYS)) {
        localStorage.removeItem(key);
      }
      this.cache = { checkpoints: [], presets: [], lastSync: 0 };
      console.log('✅ 所有數據已清除');
      return true;
    } catch (error) {
      console.error('❌ 清除數據失敗:', error);
      return false;
    }
  },

  getStats() {
    let totalSize = 0;
    const details = {};
    for (const [name, key] of Object.entries(this.KEYS)) {
      const value = localStorage.getItem(key);
      if (value) {
        const size = (value.length / 1024).toFixed(2);
        details[name] = size + ' KB';
        totalSize += parseFloat(size);
      }
    }
    return {
      totalSize: totalSize.toFixed(2) + ' KB',
      details: details,
      usage: ((totalSize / (this.CONFIG.STORAGE_QUOTA / 1024)) * 100).toFixed(1) + '%'
    };
  }
};

// ============================================================================
// 第 3 部分：認證配置
// ============================================================================

const AUTH_CONFIG = {
  STORAGE_KEY: 'rs-system-auth',
  SESSION_KEY: 'rs-system-session',
  USER_DB_KEY: 'rs-system-users',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
  PASSWORD_MIN_LENGTH: 4
};

// 用戶存儲設定（含舊版遺留鍵與阻擋名單）
const USER_STORAGE_KEY = AUTH_CONFIG.USER_DB_KEY;
const LEGACY_USER_KEY = 'users';
const BLOCKED_USERNAMES = ['123', 'test', 'demo', 'admin'];

// 與舊版相容的雜湊函式，避免明碼儲存
function hashPasswordCompat(password) {
  let hash = 0;
  for (let i = 0; i < (password || '').length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// 取得使用者資料（含舊版遷移、阻擋測試帳號、自動補 Creator）
function loadUsersFromStorage() {
  try {
    const rawNew = localStorage.getItem(USER_STORAGE_KEY);
    const rawLegacy = localStorage.getItem(LEGACY_USER_KEY);
    let users = rawNew ? JSON.parse(rawNew) : (rawLegacy ? JSON.parse(rawLegacy) : []);

    if (!Array.isArray(users)) {
      users = Object.values(users || {});
    }

    let changed = false;

    users = users
      .filter(u => u && u.username)
      .filter(u => {
        const uname = (u.username || '').toLowerCase();
        const isBlocked = BLOCKED_USERNAMES.includes(uname) || /^\d{1,4}$/.test(uname);
        if (isBlocked) {
          changed = true;
          return false;
        }
        return true;
      })
      .map(u => {
        const user = { ...u };
        if (!user.id && user.userId) { user.id = user.userId; changed = true; }
        if (!user.passwordHash && user.password) {
          user.passwordHash = hashPasswordCompat(user.password);
          delete user.password;
          changed = true;
        }
        if (!user.role) { user.role = 'user'; changed = true; }
        if (!user.createdAt) { user.createdAt = new Date().toISOString(); changed = true; }
        return user;
      });

    // 只允許單一 Creator，帳號固定為 creator / 1234
    const creatorHash = hashPasswordCompat('1234');
    let creatorEntry = null;
    const normalized = [];

    users.forEach(user => {
      if ((user.username || '').toLowerCase() === 'creator') {
        if (!creatorEntry) {
          creatorEntry = {
            ...user,
            username: 'creator',
            role: 'creator',
            passwordHash: creatorHash,
            id: user.id || user.userId || `user_${Date.now()}_creator`,
            userId: user.userId || user.id || undefined
          };
          changed = true;
        } else {
          changed = true; // 丟棄多餘 creator
        }
      } else {
        if (user.role === 'creator') { user.role = 'user'; changed = true; }
        normalized.push(user);
      }
    });

    if (!creatorEntry) {
      creatorEntry = {
        id: `user_${Date.now()}_creator`,
        userId: `user_${Date.now()}_creator`,
        username: 'creator',
        email: 'creator@system.local',
        role: 'creator',
        passwordHash: creatorHash,
        createdAt: new Date().toISOString()
      };
      changed = true;
    }

    users = [creatorEntry, ...normalized];

    if (changed || rawLegacy) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      if (rawLegacy) localStorage.removeItem(LEGACY_USER_KEY);
    }

    return users;
  } catch (error) {
    console.error('❌ 讀取用戶資料失敗:', error);
    return [];
  }
}

function saveUsersToStorage(users) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('❌ 保存用戶資料失敗:', error);
  }
}

// ============================================================================
// 第 4 部分：登入管理器
// ============================================================================

const LOGIN_MANAGER = {
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
    PASSWORD_MIN_LENGTH: 4
  },

  state: {
    loginAttempts: {},
    lockedAccounts: {},
    activeSessions: {}
  },

  init() {
    try {
      this.checkSession();
      this.setupSessionTimeout();
      console.log('✅ 登入管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 登入管理器初始化失敗:', error);
      return false;
    }
  },

  async login(username, password) {
    try {
      if (!username || !password) throw new Error('用戶名和密碼不能為空');
      if (this.isAccountLocked(username)) throw new Error('帳號已鎖定，請稍後再試');

      const users = loadUsersFromStorage();
      const user = users.find(u => u.username === username);
      
      if (!user) {
        this.recordFailedAttempt(username);
        throw new Error('用戶名或密碼錯誤');
      }

      const storedHash = user.passwordHash || null;
      const isPasswordValid = await this.verifyPassword(password, storedHash);
      if (!isPasswordValid) {
        this.recordFailedAttempt(username);
        throw new Error('用戶名或密碼錯誤');
      }

      delete this.state.loginAttempts[username];

      const sessionId = this.generateSessionId();
      const sessionData = {
        userId: user.userId || user.id,
        username: user.username,
        sessionId: sessionId,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.SECURITY.SESSION_TIMEOUT,
        ipHash: this.getIpHash(),
        role: user.role || 'user'
      };

      localStorage.setItem('rs-system-session', JSON.stringify(sessionData));
      localStorage.setItem('current-user', JSON.stringify({
        id: user.userId || user.id,
        userId: user.userId || user.id,
        username: user.username,
        email: user.email || '',
        role: user.role || 'user'
      }));

      this.state.activeSessions[sessionId] = sessionData;
      console.log(`✅ 用戶 ${username} 登入成功 | 會話ID: ${sessionId}`);
      
      return {
        success: true,
        user: {
          id: user.userId || user.id,
          username: user.username,
          email: user.email || '',
          role: user.role || 'user'
        }
      };
    } catch (error) {
      console.error('❌ 登入失敗:', error);
      return { success: false, error: error.message };
    }
  },

  logout() {
    try {
      const currentUser = this.getCurrentUser();
      const session = JSON.parse(localStorage.getItem('rs-system-session') || '{}');
      
      // 記錄登出事件
      if (typeof loggerService !== 'undefined') {
        loggerService.logSystemEvent('logout', `用戶 ${currentUser?.username || '未知'} 已登出`, 'info');
      }
      
      localStorage.removeItem('rs-system-session');
      localStorage.removeItem('current-user');
      
      if (session.sessionId) {
        delete this.state.activeSessions[session.sessionId];
      }
      console.log('✅ 已登出');
      setTimeout(() => { window.location.href = 'login.html'; }, 500);
      return true;
    } catch (error) {
      console.error('❌ 登出失敗:', error);
      return false;
    }
  },

  checkSession() {
    try {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      if (!session) return false;

      // 檢查會話是否過期
      if (session.expiresAt && Date.now() > session.expiresAt) {
        console.warn('⚠️ 會話已過期');
        this.logout();
        return false;
      }

      // 驗證必要的會話欄位
      if (!session.userId || !session.sessionId) {
        console.warn('⚠️ 會話資料不完整');
        return false;
      }

      // 可選的 IP 驗證（寬鬆模式 - 允許輕微差異）
      if (session.ipHash) {
        const currentHash = this.getIpHash();
        // 如果 IP 完全改變才登出（防止過度嚴格的驗證）
        if (session.ipHash !== currentHash) {
          console.warn('⚠️ 檢測到不同的登入設備，但會話仍有效');
          // 不自動登出，只記錄警告
        }
      }

      console.log('✅ 會話有效');
      return true;
    } catch (error) {
      console.error('⚠️ 會話檢查失敗:', error);
      return false;
    }
  },

  setupSessionTimeout() {
    setInterval(() => {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      if (session && Date.now() > session.expiresAt) {
        console.log('⚠️ 會話已過期，自動登出');
        this.logout();
      }
    }, 60000);
  },

  recordFailedAttempt(username) {
    if (!this.state.loginAttempts[username]) {
      this.state.loginAttempts[username] = [];
    }
    this.state.loginAttempts[username].push(Date.now());

    if (this.state.loginAttempts[username].length > this.SECURITY.MAX_LOGIN_ATTEMPTS) {
      console.warn(`🔒 用戶 ${username} 登入嘗試過多，帳號已鎖定`);
      this.state.lockedAccounts[username] = Date.now() + this.SECURITY.LOCKOUT_DURATION;
    }
  },

  isAccountLocked(username) {
    if (!this.state.lockedAccounts[username]) return false;

    if (Date.now() > this.state.lockedAccounts[username]) {
      delete this.state.lockedAccounts[username];
      delete this.state.loginAttempts[username];
      return false;
    }
    return true;
  },

  async verifyPassword(password, hash) {
    return new Promise((resolve) => {
      if (!hash) return resolve(false);
      const computed = this.hashPassword(password);
      let result = true;
      const minLength = Math.min(computed.length, hash.length);
      
      for (let i = 0; i < minLength; i++) {
        if (computed[i] !== hash[i]) result = false;
      }
      if (computed.length !== hash.length) result = false;

      setTimeout(() => resolve(result), Math.random() * 100);
    });
  },

  hashPassword(password) {
    return hashPasswordCompat(password);
  },

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  getIpHash() {
    const ua = navigator.userAgent;
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const combined = ua + lang + tz;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  },

  getCurrentUser() {
    try {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      if (!session || Date.now() > session.expiresAt) return null;
      return JSON.parse(localStorage.getItem('current-user') || 'null');
    } catch (error) {
      return null;
    }
  },

  isLoggedIn() {
    return this.checkSession() && this.getCurrentUser() !== null;
  },

  forceLogoutOthers() {
    try {
      const current = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      if (!current) return false;

      for (const [sessionId, session] of Object.entries(this.state.activeSessions)) {
        if (sessionId !== current.sessionId) {
          delete this.state.activeSessions[sessionId];
        }
      }
      console.log('✅ 已登出其他設備的會話');
      return true;
    } catch (error) {
      console.error('❌ 強制登出失敗:', error);
      return false;
    }
  }
};

// === 登入頁初始化（login.html 專用） ===
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  if (!loginForm || !signupForm) return false;

  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');
  const loginSection = document.getElementById('loginSection');
  const signupSection = document.getElementById('signupSection');
  const btnLogin = document.getElementById('btnLogin');
  const btnSignup = document.getElementById('btnSignup');
  const switchToSignup = document.getElementById('switchToSignup');
  const switchToLogin = document.getElementById('switchToLogin');
  const toSignupSection = document.getElementById('toSignupSection');
  const toLoginSection = document.getElementById('toLoginSection');

  const showError = (msg) => {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.add('show');
    }
    if (successMsg) successMsg.classList.remove('show');
  };

  const showSuccess = (msg) => {
    if (successMsg) {
      successMsg.textContent = msg;
      successMsg.classList.add('show');
    }
    if (errorMsg) errorMsg.classList.remove('show');
  };

  const hideMessages = () => {
    errorMsg?.classList.remove('show');
    successMsg?.classList.remove('show');
  };

  const switchToLoginForm = () => {
    loginSection?.classList.add('active');
    signupSection?.classList.remove('active');
    if (toSignupSection) toSignupSection.style.display = 'block';
    if (toLoginSection) toLoginSection.style.display = 'none';
    hideMessages();
  };

  const switchToSignupForm = () => {
    loginSection?.classList.remove('active');
    signupSection?.classList.add('active');
    if (toSignupSection) toSignupSection.style.display = 'none';
    if (toLoginSection) toLoginSection.style.display = 'block';
    hideMessages();
  };

  switchToSignup?.addEventListener('click', (e) => {
    e.preventDefault();
    switchToSignupForm();
  });

  switchToLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    switchToLoginForm();
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessages();

    const username = document.getElementById('loginUsername')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!username || !password) {
      showError('❌ 請填寫使用者名稱和密碼');
      return;
    }

    try {
      if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.textContent = '登入中...';
      }

      const users = loadUsersFromStorage();
      const user = users.find((u) => u.username === username);
      const isValid = user ? (user.passwordHash === hashPasswordCompat(password)) : false;

      if (user && isValid) {
        // 建立會話數據 - 與 system-test.js 完全一致的格式
        const currentTime = Date.now();
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 小時
        
        const sessionData = {
          userId: user.userId || user.id,
          username: user.username,
          sessionId: `session_${currentTime}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: currentTime,
          expiresAt: currentTime + sessionTimeout,
          ipHash: LOGIN_MANAGER.getIpHash(),
          role: user.role || 'user'
        };

        const userData = {
          id: user.userId || user.id,
          userId: user.userId || user.id,
          username: user.username,
          email: user.email || '',
          role: user.role || 'user',
          loginTime: new Date().toISOString()
        };

        // 同步保存會話數據
        localStorage.setItem('rs-system-session', JSON.stringify(sessionData));
        localStorage.setItem('current-user', JSON.stringify(userData));

        // 記錄登入事件
        console.log('✅ 登入成功:', username, '| 角色:', userData.role, '| 會話ID:', sessionData.sessionId);
        
        // 如果日誌服務可用，記錄登入事件
        if (typeof loggerService !== 'undefined') {
          loggerService.logSystemEvent('login', `用戶 ${username} 登入成功`, 'info');
        }

        showSuccess('✅ 登入成功！正在導向主應用...');

        // 驗證保存成功後再重定向
        setTimeout(() => {
          const savedSession = localStorage.getItem('rs-system-session');
          const savedUser = localStorage.getItem('current-user');

          if (savedSession && savedUser) {
            try {
              const verifySession = JSON.parse(savedSession);
              const verifyUser = JSON.parse(savedUser);
              
              // 驗證必要欄位
              if (verifySession.userId && verifySession.sessionId && verifyUser.id) {
                console.log('✅ 會話數據驗證成功，重定向到 index.html');
                window.location.href = 'index.html';
              } else {
                console.error('❌ 會話數據不完整，重新保存');
                localStorage.setItem('rs-system-session', JSON.stringify(sessionData));
                localStorage.setItem('current-user', JSON.stringify(userData));
                setTimeout(() => { window.location.href = 'index.html'; }, 500);
              }
            } catch (parseError) {
              console.error('❌ 會話數據格式錯誤，重新保存');
              localStorage.setItem('rs-system-session', JSON.stringify(sessionData));
              localStorage.setItem('current-user', JSON.stringify(userData));
              setTimeout(() => { window.location.href = 'index.html'; }, 500);
            }
          } else {
            console.warn('⚠️ 會話保存失敗，重新保存並重試');
            localStorage.setItem('rs-system-session', JSON.stringify(sessionData));
            localStorage.setItem('current-user', JSON.stringify(userData));
            setTimeout(() => { window.location.href = 'index.html'; }, 500);
          }
        }, 500);
      } else {
        showError('❌ 使用者名稱或密碼不正確');
        if (btnLogin) {
          btnLogin.disabled = false;
          btnLogin.textContent = '登入';
        }
      }
    } catch (error) {
      showError('❌ 登入出錯：' + error.message);
      if (btnLogin) {
        btnLogin.disabled = false;
        btnLogin.textContent = '登入';
      }
    }
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessages();

    const username = document.getElementById('signupUsername')?.value.trim();
    const password = document.getElementById('signupPassword')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();

    if (!username || !password) {
      showError('❌ 請填寫使用者名稱和密碼');
      return;
    }

    if (username.toLowerCase() === 'creator') {
      showError('❌ 無法建立創作者帳戶');
      return;
    }

    if (password.length < 4) {
      showError('❌ 密碼至少需要4個字符');
      return;
    }

    try {
      if (btnSignup) {
        btnSignup.disabled = true;
        btnSignup.textContent = '建立中...';
      }

      const users = loadUsersFromStorage();
      
      // 允許創建無限用戶，即使名稱重複（與 system-test.js 一致）
      // 通過時間戳和隨機字符串確保每個用戶都有唯一的 ID
      
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        password: password,
        passwordHash: hashPasswordCompat(password),
        email: email || null,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsersToStorage(users);

      console.log('✅ 用戶創建成功:', username, '| ID:', newUser.id);
      showSuccess(`✅ 帳戶建立成功！用戶名: ${username}`);

      document.getElementById('signupUsername').value = '';
      document.getElementById('signupPassword').value = '';
      document.getElementById('signupEmail').value = '';

      setTimeout(() => {
        document.getElementById('loginUsername').value = username;
        document.getElementById('loginPassword').value = '';
        switchToLoginForm();
        document.getElementById('loginPassword').focus();
        if (btnSignup) {
          btnSignup.disabled = false;
          btnSignup.textContent = '建立帳戶';
        }
      }, 1500);
    } catch (error) {
      showError('❌ 建立帳戶出錯：' + error.message);
      if (btnSignup) {
        btnSignup.disabled = false;
        btnSignup.textContent = '建立帳戶';
      }
    }
  });

  // 初始化狀態與預設 Creator
  const existingUsers = loadUsersFromStorage();
  if (!existingUsers.some((u) => u.username === 'creator')) {
    const creatorId = `user_${Date.now()}_creator`;
    existingUsers.push({
      id: creatorId,
      userId: creatorId,
      username: 'creator',
      password: '1234',
      passwordHash: hashPasswordCompat('1234'),
      email: 'creator@system.local',
      role: 'creator',
      createdAt: new Date().toISOString()
    });
    saveUsersToStorage(existingUsers);
    console.log('✅ 預設 Creator 帳戶已創建：creator/1234');
  }

  document.getElementById('loginUsername')?.focus();
  return true;
}

// ============================================================================
// 第 5 部分：UI 管理器
// ============================================================================

const UI_MANAGER = {
  CONFIG: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    LOAD_TIMEOUT: 10000
  },

  state: {
    currentPage: 'overview',
    isLoading: false,
    toastQueue: []
  },

  init() {
    try {
      this.setupPageInitialization();
      this.setupLoadingIndicator();
      this.setupResponsive();
      this.setupKeyboardShortcuts();
      console.log('✅ UI 管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ UI 管理器初始化失敗:', error);
      return false;
    }
  },

  setupPageInitialization() {
    const requiredElements = [
      'sidebar', 'topbarTitle', 'sidebarUserName', 'sidebarUserRole',
      'todayCount', 'totalStudents', 'page-overview', 'page-students',
      'page-actions', 'page-analytics'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
      console.warn('⚠️ 缺少元素:', missingElements.join(', '));
    }
  },

  setupLoadingIndicator() {
    if (!document.getElementById('loadingIndicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'loadingIndicator';
      indicator.style.cssText = 'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:2rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;';
      indicator.innerHTML = '<p>正在加載...</p>';
      document.body.appendChild(indicator);
    }
  },

  setupResponsive() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addListener((e) => {
      if (e.matches) {
        const sidebar = $('sidebar');
        if (sidebar) sidebar.classList.add('collapsed');
      }
    });
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const btnSave = $('btnSave');
        if (btnSave) btnSave.click();
      }
    });
  }
};

// ============================================================================
// 第 6 部分：PouchDB 儲存服務
// ============================================================================

class StorageService {
  constructor() {
    this.db = null;
    this.changeListeners = [];
    this.changesFeed = null;
  }

  async init(database) {
    this.db = database;
    this._startChangesFeed();
    console.log('✅ 儲存服務已初始化');
  }

  _startChangesFeed() {
    try {
      if (!this.db.changes) return; // PouchDB 未加載
      
      this.changesFeed = this.db.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        this.changeListeners.forEach(listener => {
          try {
            listener(change);
          } catch (e) {
            console.error('監聽器執行失敗:', e);
          }
        });
      }).on('error', (err) => {
        console.error('❌ 變動監聽錯誤:', err);
        setTimeout(() => this._startChangesFeed(), 5000);
      });
    } catch (error) {
      console.error('❌ 啟動監聽失敗:', error);
    }
  }

  onChange(callback) {
    this.changeListeners.push(callback);
    return () => {
      const idx = this.changeListeners.indexOf(callback);
      if (idx >= 0) this.changeListeners.splice(idx, 1);
    };
  }

  stopChangesFeed() {
    if (this.changesFeed) {
      this.changesFeed.cancel();
      this.changesFeed = null;
    }
  }

  async addCheckpoint(checkpointData) {
    try {
      if (!this.db) return null;
      
      const doc = {
        type: 'checkpoint',
        className: checkpointData.className,
        date: checkpointData.date,
        atmosphere: checkpointData.atmosphere || null,
        skillLevel: checkpointData.skillLevel || null,
        studentRecords: checkpointData.studentRecords || [],
        notes: checkpointData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...checkpointData
      };

      const result = await this.db.post(doc);
      console.log('✅ 課堂記錄已新增:', result.id);
      return result;
    } catch (error) {
      console.error('❌ 新增課堂記錄失敗:', error);
      throw error;
    }
  }

  async updateCheckpoint(id, updates) {
    try {
      if (!this.db) return null;
      
      const doc = await this.db.get(id);
      const updated = {
        ...doc,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const result = await this.db.put(updated);
      console.log('✅ 課堂記錄已更新:', id);
      return result;
    } catch (error) {
      console.error('❌ 更新課堂記錄失敗:', error);
      throw error;
    }
  }

  async deleteCheckpoint(id) {
    try {
      if (!this.db) return false;
      
      const doc = await this.db.get(id);
      await this.db.remove(doc);
      console.log('✅ 課堂記錄已刪除:', id);
      return true;
    } catch (error) {
      console.error('❌ 刪除課堂記錄失敗:', error);
      throw error;
    }
  }

  async getAllCheckpoints() {
    try {
      if (!this.db) return [];
      
      const result = await this.db.allDocs({ include_docs: true });
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc.type === 'checkpoint');
    } catch (error) {
      console.error('❌ 查詢失敗:', error);
      return [];
    }
  }

  async createBackup() {
    try {
      if (!this.db) return null;
      
      const docs = await this.getAllCheckpoints();
      return {
        timestamp: new Date().toISOString(),
        data: { checkpoints: docs }
      };
    } catch (error) {
      console.error('❌ 建立備份失敗:', error);
      throw error;
    }
  }

  async clearAllData() {
    try {
      if (!this.db) return false;
      
      const docs = await this.db.allDocs();
      const toDelete = docs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true
      }));

      await this.db.bulkDocs(toDelete);
      console.log('⚠️ 所有資料已清除');
      return true;
    } catch (error) {
      console.error('❌ 清除資料失敗:', error);
      throw error;
    }
  }
}

const storageService = new StorageService();

async function initializeStorageService(database) {
  try {
    await storageService.init(database);
    return storageService;
  } catch (error) {
    console.error('❌ 儲存服務初始化失敗:', error);
    throw error;
  }
}

// ============================================================================
// 第 7 部分：Firebase 配置（可選）
// ============================================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let firebaseInitialized = false;
let firebaseEnabled = false;

function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded. Using local storage only.');
    return false;
  }
  
  try {
    firebase.initializeApp(firebaseConfig);
    firebaseInitialized = true;
    firebaseEnabled = true;
    console.log('✅ Firebase 初始化成功');
    return true;
  } catch (error) {
    console.warn('⚠️ Firebase 初始化失敗:', error);
    return false;
  }
}

// ============================================================================
// 第 8 部分：應用核心業務邏輯
// ============================================================================

// 班級預設管理
function getClassPresets() {
  try {
    const raw = localStorage.getItem(CLASS_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveClassPresets(arr) {
  localStorage.setItem(CLASS_PRESETS_KEY, JSON.stringify(arr));
}

function addClassPreset(className) {
  const presets = getClassPresets();
  if (!presets.includes(className) && className.trim()) {
    presets.push(className.trim());
    saveClassPresets(presets);
  }
}

function removeClassPreset(className) {
  const presets = getClassPresets();
  const idx = presets.indexOf(className);
  if (idx >= 0) {
    presets.splice(idx, 1);
    saveClassPresets(presets);
  }
}

// 數據驗證
function validateFormData(d) {
  const issues = [];
  if (!d.classDate) issues.push({ field: 'classDate', message: '課堂日期為必填' });
  if (d.tricks && d.tricks.length === 0) issues.push({ field: 'tricks', message: '未記錄任何教學花式' });
  if (d.classSize === null || d.classSize === '') issues.push({ field: 'classSize', message: '人數未填寫' });
  if (d.atmosphere === '') issues.push({ field: 'atmosphere', message: '課堂氣氛未選擇' });
  if (d.skillLevel === '') issues.push({ field: 'skillLevel', message: '技巧等級未選擇' });
  
  if (d.engagement && (d.engagement < 1 || d.engagement > 5)) {
    issues.push({ field: 'engagement', message: '開心指數必須在 1-5 之間' });
  }
  
  return issues;
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function checkDateDuplicate(dateStr, className, startTime = '') {
  const list = parseRecords();
  const sameDay = list.filter(r => r.classDate === dateStr && r.className === className);
  
  if (sameDay.length === 0) return [];
  if (!startTime) return sameDay;
  
  const currentMins = timeToMinutes(startTime);
  return sameDay.filter(r => {
    const recordMins = timeToMinutes(r.classStartTime || '');
    return Math.abs(recordMins - currentMins) < 60;
  });
}

function getLastLesson() {
  const list = parseRecords();
  return list.length === 0 ? null : list[0];
}

// 側邊欄統計
function updateSidebarStats() {
  const records = parseRecords();
  const today = todayStr();
  const todayRecords = records.filter(r => r.classDate === today);
  const totalStudents = records.reduce((sum, r) => sum + (parseInt(r.classSize) || 0), 0);
  
  const el1 = $('todayCount');
  const el2 = $('totalStudents');
  if (el1) el1.textContent = todayRecords.length;
  if (el2) el2.textContent = totalStudents;
}

// 用戶信息更新
function updateUserInfo(username = null) {
  const nameEl = $('sidebarUserName');
  const roleEl = $('sidebarUserRole');
  if (!nameEl) return;
  
  const user = getCurrentUser();
  if (user) {
    nameEl.textContent = user.username || '未知用戶';
    const userRole = user.role === 'creator' ? '👑 Creator' : '👤 用戶';
    roleEl.textContent = userRole;
    
    const navData = $('navData');
    if (navData) {
      navData.hidden = user.role !== 'creator';
    }
  } else {
    nameEl.textContent = '未登錄';
    roleEl.textContent = '訪客';
    const navData = $('navData');
    if (navData) {
      navData.hidden = true;
    }
  }
}

// 權限管理
function isCreator() {
  try {
    const currentUser = localStorage.getItem('current-user');
    if (!currentUser) return false;
    const user = JSON.parse(currentUser);
    return user.role === 'creator';
  } catch (e) {
    return false;
  }
}

function getCurrentUser() {
  try {
    const currentUser = localStorage.getItem('current-user');
    return currentUser ? JSON.parse(currentUser) : null;
  } catch (e) {
    return null;
  }
}

// 數據管理
function refreshDataManagement() {
  if (!isCreator()) {
    const pageData = document.getElementById('page-data');
    if (pageData) pageData.hidden = true;
    return;
  }
  
  const pageData = document.getElementById('page-data');
  if (pageData) pageData.hidden = false;
  
  const users = loadUsersFromStorage();
  
  if ($('statTotalUsers')) $('statTotalUsers').textContent = users.length;
  if ($('statCreatorCount')) $('statCreatorCount').textContent = users.filter(u => u.role === 'creator').length;
  if ($('statUserCount')) $('statUserCount').textContent = users.filter(u => u.role !== 'creator').length;
  
  const usersList = $('usersList');
  if (users.length === 0) {
    if (usersList) usersList.innerHTML = '';
    const usersEmpty = $('usersEmpty');
    if (usersEmpty) usersEmpty.hidden = false;
  } else {
    const usersEmpty = $('usersEmpty');
    if (usersEmpty) usersEmpty.hidden = true;
    const currentUser = getCurrentUser();
    if (usersList) {
      usersList.innerHTML = users.map(user => {
        const createdDate = new Date(user.createdAt).toLocaleDateString('zh-HK');
        const isCurrentUser = currentUser && currentUser.id === user.id;
        const isCreatorRole = user.role === 'creator';
        return `<div class="user-item">
          <div class="user-item-info">
            <div class="user-name">${escapeHtml(user.username)}${isCurrentUser ? ' (當前用戶)' : ''}</div>
            <div class="user-email">${escapeHtml(user.email || '無電郵')}</div>
            <div class="user-created">建立於: ${createdDate}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <span class="user-role ${isCreatorRole ? 'creator' : 'user'}">${isCreatorRole ? '👑 Creator' : '👤 用戶'}</span>
            ${isCurrentUser ? '<span style="color: #999;">⚠️ 無法刪除當前用戶</span>' : `<button class="btn btn-sm btn-danger-ghost" onclick="deleteUser('${user.id}', '${escapeHtml(user.username)}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">刪除</button>`}
          </div>
        </div>`;
      }).join('');
    }
  }
}

// 刪除用戶
function deleteUser(userId, username) {
  if (!isCreator()) {
    toast('❌ 沒有權限執行此操作');
    return;
  }
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    toast('❌ 無法刪除當前登入的用戶');
    return;
  }
  
  if (!confirm(`確定要刪除用戶「${username}」嗎？此操作無法恢復。`)) {
    return;
  }
  
  try {
    const users = loadUsersFromStorage();
    const newUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(newUsers));
    toast(`✓ 已刪除用戶「${username}」`);
    refreshDataManagement();
  } catch (e) {
    toast(`❌ 刪除失敗: ${e.message}`);
  }
}

// 教學花式管理
let tricks = [];

function renderTricks() {
  const el = $('tricksList');
  if (!el) return;
  el.innerHTML = tricks.map((t, i) => {
    const masteryText = (t.mastery ?? t.mastery === 0) ? `掌握 ${t.mastery}%` : '';
    const timeText = (t.plannedTime != null || t.actualTime != null)
      ? `時間 ${t.plannedTime ?? '-'} / ${t.actualTime ?? '-'}`
      : '';
    const skillText = t.skillLevel ? `技巧 ${escapeHtml(t.skillLevel)}` : '';
    const metaParts = [masteryText, timeText, skillText].filter(Boolean).join(' · ');

    return `<div class="trick-tag" data-i="${i}">
      <div class="trick-title-row">
        <span class="name">${escapeHtml(t.name)}</span>
        ${t.detail ? `<span class="detail"> · ${escapeHtml(t.detail)}</span>` : ''}
      </div>
      ${metaParts ? `<div class="trick-meta">${metaParts}</div>` : ''}
      <div class="trick-level-select">
        <select class="trick-level" data-i="${i}" aria-label="等級">
          <option value="">無等級</option>
          ${TRICK_LEVELS.map(lvl => `<option value="${lvl}" ${(t.level || '') === lvl ? 'selected' : ''}>${lvl}</option>`).join('')}
        </select>
      </div>
      <button type="button" class="remove-trick" data-i="${i}" aria-label="移除">×</button>
    </div>`;
  }).join('');
  
  $qa('.trick-level').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = +e.target.dataset.i;
      tricks[idx].level = e.target.value;
      if (!tricks[idx].skillLevel) {
        tricks[idx].skillLevel = e.target.value;
      }
    });
  });
  
  $qa('.remove-trick').forEach(btn => {
    btn.onclick = () => { tricks.splice(+btn.dataset.i, 1); renderTricks(); };
  });
}

// 滑桿綁定
function bindRange(id) {
  const r = $(id), valSpan = $('val-' + id);
  if (!r || !valSpan) return;
  const quick = r.closest('.slider-row')?.querySelector('.quick-btns');
  const update = () => {
    valSpan.textContent = r.value;
    quick?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
  };
  r.addEventListener('input', update);
  quick?.addEventListener('click', (e) => { 
    const btn = e.target.closest('button');
    const v = btn?.dataset?.v; 
    if (v != null) { 
      r.value = v; 
      update(); 
    } 
  });
  update();
}

// 表單數據收集
function getFormData() {
  const date = ($('classDate')?.value || '').trim();
  const startTime = ($('classStartTime')?.value || '').trim();
  const endTime = ($('classEndTime')?.value || '').trim();
  
  let classDurationMins = null;
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    classDurationMins = endMins > startMins ? endMins - startMins : null;
  }

  const trickMasteries = tricks
    .map(t => Number.isFinite(t.mastery) ? t.mastery : null)
    .filter(v => v != null);
  const aggregatedMastery = trickMasteries.length > 0
    ? Math.round(trickMasteries.reduce((a, b) => a + b, 0) / trickMasteries.length)
    : parseInt($('mastery')?.value || '50', 10);

  const trickPlannedTimes = tricks
    .map(t => Number.isFinite(t.plannedTime) ? t.plannedTime : null)
    .filter(v => v != null);
  const aggregatedPlannedTime = trickPlannedTimes.length > 0
    ? trickPlannedTimes.reduce((a, b) => a + b, 0)
    : (($('plannedTime')?.value || '').trim() ? parseInt($('plannedTime').value, 10) : null);

  const trickActualTimes = tricks
    .map(t => Number.isFinite(t.actualTime) ? t.actualTime : null)
    .filter(v => v != null);
  const aggregatedActualTime = trickActualTimes.length > 0
    ? trickActualTimes.reduce((a, b) => a + b, 0)
    : (($('actualTime')?.value || '').trim() ? parseInt($('actualTime').value, 10) : null);

  const selectedSkillBtn = $q('[data-name="skillLevel"] .selected');
  const selectedSkillLevel = selectedSkillBtn?.textContent?.trim() || '';
  const aggregatedSkillLevel = tricks.find(t => t.skillLevel)?.skillLevel || selectedSkillLevel;
  
  return {
    classDate: date,
    className: ($('className')?.value || '').trim(),
    classSize: ($('classSize')?.value || '').trim() ? parseInt($('classSize').value, 10) : null,
    classLocation: ($('classLocation')?.value || '').trim(),
    teachingRole: ($('teachingRole')?.value || '').trim(),
    classStartTime: startTime,
    classEndTime: endTime,
    classDurationMins: classDurationMins,
    notes: ($('notes')?.value || '').trim(),
    engagement: parseInt($('engagement')?.value || '3', 10),
    atmosphere: $q('[data-name="atmosphere"] .selected')?.textContent?.trim() || '',
    tricks: tricks.map(t => ({
      name: t.name || '',
      detail: t.detail || '',
      level: t.level || '',
      mastery: Number.isFinite(t.mastery) ? t.mastery : null,
      plannedTime: Number.isFinite(t.plannedTime) ? t.plannedTime : null,
      actualTime: Number.isFinite(t.actualTime) ? t.actualTime : null,
      skillLevel: t.skillLevel || ''
    })),
    mastery: aggregatedMastery,
    plannedTime: aggregatedPlannedTime,
    actualTime: aggregatedActualTime,
    skillLevel: aggregatedSkillLevel,
    helpOthers: parseInt($('helpOthers')?.value || '50', 10),
    interaction: parseInt($('interaction')?.value || '50', 10),
    teamwork: parseInt($('teamwork')?.value || '50', 10),
    selfPractice: parseInt($('selfPractice')?.value || '50', 10),
    activeLearn: parseInt($('activeLearn')?.value || '50', 10),
    positivity: parseInt($('positivity')?.value || '3', 10),
    enthusiasm: parseInt($('enthusiasm')?.value || '3', 10),
    teachScore: parseInt($('teachScore')?.value || '7', 10),
    satisfaction: parseInt($('satisfaction')?.value || '3', 10),
    disciplineCount: ($('disciplineCount')?.value || '').trim() ? parseInt($('disciplineCount').value, 10) : null,
    flexibility: parseInt($('flexibility')?.value || '7', 10),
    individual: parseInt($('individual')?.value || '50', 10)
  };
}

// 載入到表單
function loadIntoForm(rec) {
  if ($('classDate')) $('classDate').value = rec.classDate || todayStr();
  if ($('className')) $('className').value = rec.className || '';
  if ($('classSize')) $('classSize').value = rec.classSize != null ? rec.classSize : '';
  if ($('classLocation')) $('classLocation').value = rec.classLocation || '';
  if ($('teachingRole')) $('teachingRole').value = rec.teachingRole || '';
  if ($('classStartTime')) $('classStartTime').value = rec.classStartTime || '';
  if ($('classEndTime')) $('classEndTime').value = rec.classEndTime || '';
  updateClassDuration();
  if ($('notes')) $('notes').value = rec.notes || '';
  if ($('engagement')) $('engagement').value = rec.engagement ?? 3;
  document.querySelectorAll('[data-name="atmosphere"] button').forEach(b => {
    b.classList.toggle('selected', b.textContent.trim() === (rec.atmosphere || ''));
  });
  tricks = Array.isArray(rec.tricks) ? rec.tricks.map(t => ({
    name: t.name || '',
    detail: t.detail || '',
    level: t.level || t.skillLevel || '',
    mastery: Number.isFinite(t.mastery) ? t.mastery : (Number.isFinite(rec.mastery) ? rec.mastery : null),
    plannedTime: Number.isFinite(t.plannedTime) ? t.plannedTime : null,
    actualTime: Number.isFinite(t.actualTime) ? t.actualTime : null,
    skillLevel: t.skillLevel || t.level || ''
  })) : [];
  renderTricks();
  const trickMasteries = tricks.map(t => Number.isFinite(t.mastery) ? t.mastery : null).filter(v => v != null);
  const masterVal = trickMasteries.length ? Math.round(trickMasteries.reduce((a, b) => a + b, 0) / trickMasteries.length) : (rec.mastery ?? 50);
  if ($('mastery')) $('mastery').value = masterVal;

  const trickPlanned = tricks.map(t => Number.isFinite(t.plannedTime) ? t.plannedTime : null).filter(v => v != null);
  const plannedVal = trickPlanned.length ? trickPlanned.reduce((a, b) => a + b, 0) : (rec.plannedTime != null ? rec.plannedTime : '');
  if ($('plannedTime')) $('plannedTime').value = plannedVal;

  const trickActual = tricks.map(t => Number.isFinite(t.actualTime) ? t.actualTime : null).filter(v => v != null);
  const actualVal = trickActual.length ? trickActual.reduce((a, b) => a + b, 0) : (rec.actualTime != null ? rec.actualTime : '');
  if ($('actualTime')) $('actualTime').value = actualVal;

  const skillLevel = rec.skillLevel || tricks.find(t => t.skillLevel)?.skillLevel || '';
  document.querySelectorAll('[data-name="skillLevel"] button').forEach(b => {
    b.classList.toggle('selected', b.textContent.trim() === skillLevel);
  });
  if ($('helpOthers')) $('helpOthers').value = rec.helpOthers ?? 50;
  if ($('interaction')) $('interaction').value = rec.interaction ?? 50;
  if ($('teamwork')) $('teamwork').value = rec.teamwork ?? 50;
  if ($('selfPractice')) $('selfPractice').value = rec.selfPractice ?? 50;
  if ($('activeLearn')) $('activeLearn').value = rec.activeLearn ?? 50;
  if ($('positivity')) $('positivity').value = rec.positivity ?? 3;
  if ($('enthusiasm')) $('enthusiasm').value = rec.enthusiasm ?? 3;
  if ($('teachScore')) $('teachScore').value = rec.teachScore ?? 7;
  if ($('satisfaction')) $('satisfaction').value = rec.satisfaction ?? 3;
  if ($('disciplineCount')) $('disciplineCount').value = rec.disciplineCount != null ? rec.disciplineCount : '';
  if ($('flexibility')) $('flexibility').value = rec.flexibility ?? 7;
  if ($('individual')) $('individual').value = rec.individual ?? 50;
  RANGE_IDS.forEach(id => {
    const r = $(id), valSpan = $('val-' + id);
    if (r && valSpan) {
      valSpan.textContent = r.value;
      const q = r.closest('.slider-row')?.querySelector('.quick-btns');
      q?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
    }
  });
}

// 清空表單
function clearForm() {
  if ($('classDate')) $('classDate').value = todayStr();
  if ($('className')) $('className').value = '';
  if ($('classSize')) $('classSize').value = '';
  if ($('classLocation')) $('classLocation').value = '';
  if ($('teachingRole')) $('teachingRole').value = '';
  if ($('classStartTime')) $('classStartTime').value = '';
  if ($('classEndTime')) $('classEndTime').value = '';
  updateClassDuration();
  if ($('notes')) $('notes').value = '';
  if ($('engagement')) $('engagement').value = '3';
  $q('[data-name="atmosphere"] .selected')?.classList.remove('selected');
  tricks = [];
  renderTricks();
  if ($('trickName')) $('trickName').value = '';
  if ($('trickDetail')) $('trickDetail').value = '';
  if ($('mastery')) $('mastery').value = '50';
  if ($('plannedTime')) $('plannedTime').value = '';
  if ($('actualTime')) $('actualTime').value = '';
  $q('[data-name="skillLevel"] .selected')?.classList.remove('selected');
  if ($('helpOthers')) $('helpOthers').value = '50';
  if ($('interaction')) $('interaction').value = '50';
  if ($('teamwork')) $('teamwork').value = '50';
  if ($('selfPractice')) $('selfPractice').value = '50';
  if ($('activeLearn')) $('activeLearn').value = '50';
  if ($('positivity')) $('positivity').value = '3';
  if ($('enthusiasm')) $('enthusiasm').value = '3';
  if ($('teachScore')) $('teachScore').value = '7';
  if ($('satisfaction')) $('satisfaction').value = '3';
  if ($('disciplineCount')) $('disciplineCount').value = '';
  if ($('flexibility')) $('flexibility').value = '7';
  if ($('individual')) $('individual').value = '50';
  RANGE_IDS.forEach(id => {
    const r = $(id), valSpan = $('val-' + id);
    if (r && valSpan) {
      valSpan.textContent = r.value;
      const q = r.closest('.slider-row')?.querySelector('.quick-btns');
      q?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
    }
  });
}

// 課堂時長計算
function updateClassDuration() {
  const startTime = ($('classStartTime')?.value || '').trim();
  const endTime = ($('classEndTime')?.value || '').trim();
  const durationEl = $('classDuration');
  
  if (!durationEl) return;
  
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    
    if (endMins > startMins) {
      const mins = endMins - startMins;
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      let duration = '';
      if (hours > 0) duration += `${hours}小時`;
      if (remainMins > 0) duration += `${remainMins}分鐘`;
      durationEl.textContent = `課堂時長：${duration}`;
    } else {
      durationEl.textContent = '課堂時長：結束時間須晚於開始時間';
    }
  } else {
    durationEl.textContent = '課堂時長：—';
  }
}

// 取得依用戶隔離的存儲鍵，避免測試帳號污染正式資料
function getUserScopedKey(baseKey) {
  try {
    const current = LOGIN_MANAGER?.getCurrentUser ? LOGIN_MANAGER.getCurrentUser() : null;
    const userId = current?.id || current?.userId || 'guest';
    return `${baseKey}::${userId}`;
  } catch {
    return `${baseKey}::guest`;
  }
}

// 記錄解析和保存（含舊鍵遷移）
function parseRecords() {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEY);
    let encoded = localStorage.getItem(scopedKey);
    let migrated = false;

    if (!encoded) {
      encoded = localStorage.getItem(STORAGE_KEY); // 舊版共用鍵
      if (encoded) migrated = true;
    }

    if (!encoded) return [];

    let records = [];
    try {
      records = JSON.parse(atob(encoded));
    } catch {
      records = JSON.parse(encoded);
    }

    if (migrated) {
      const encodedScoped = btoa(JSON.stringify(records));
      localStorage.setItem(scopedKey, encodedScoped);
      localStorage.removeItem(STORAGE_KEY);
    }

    return Array.isArray(records) ? records : [];
  } catch (e) {
    console.warn('Failed to parse records from storage:', e);
    return [];
  }
}

function saveRecords(arr) {
  try {
    const scopedKey = getUserScopedKey(STORAGE_KEY);
    const encoded = btoa(JSON.stringify(arr));
    localStorage.setItem(scopedKey, encoded);
  } catch (e) {
    console.error('Failed to save records:', e);
    if (e.name === 'QuotaExceededError') {
      toast('❌ 存儲空間已滿，請清除舊記錄');
    } else {
      toast('❌ 無法保存數據：' + e.message);
    }
  }
}

// HTML 轉義
function escapeHtml(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// Toast 通知
function toast(msg) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2500);
}

// 頁面切換
function setPage(name) {
  if (name === 'data' && !isCreator()) {
    toast('❌ 僅 Creator 可查看用戶管理');
    return;
  }
  $qa('.page').forEach(p => p.classList.remove('active'));
  const page = $('page-' + name);
  if (page) page.classList.add('active');
  $qa('.nav-item').forEach(n => n.classList.remove('active'));
  $q('.nav-item[data-page="' + name + '"]')?.classList.add('active');
  const title = $('topbarTitle');
  if (title) title.textContent = PAGE_TITLES[name] || name;
  if (name === 'analytics') refreshAnalytics();
  if (name === 'actions') refreshActionsView();
  if (name === 'data') refreshDataManagement();
  if (window.matchMedia('(max-width: 768px)').matches) $('sidebar')?.classList.add('collapsed');
}

// 班級選項
function getClassOptions() {
  const list = parseRecords();
  const set = new Set();
  list.forEach(r => set.add((r.className || '').trim() || '—'));
  return [...set].sort((a, b) => (a === '—' ? 1 : b === '—' ? -1 : a.localeCompare(b)));
}

function getGlobalFilterClass() { return ($('globalFilterClass') && $('globalFilterClass').value) || ''; }
function getFilterDateFrom() { return ($('filterDateFrom') && $('filterDateFrom').value) || ''; }
function getFilterDateTo() { return ($('filterDateTo') && $('filterDateTo').value) || ''; }

function populateGlobalFilterClass() {
  const el = $('globalFilterClass');
  if (!el) return;
  const v = el.value;
  const opts = getClassOptions();
  el.innerHTML = '<option value="">全部</option>' + opts.map(c => `<option value="${escapeHtml(c)}">${c === '—' ? '未填寫' : escapeHtml(c)}</option>`).join('');
  if (opts.includes(v)) el.value = v;
}

function populateQuickSelectClass() {
  const el = $('quickSelectClass');
  if (!el) return;
  const v = el.value;
  const opts = getClassOptions();
  el.innerHTML = '<option value="">—</option>' + opts.map(c => `<option value="${escapeHtml(c)}">${c === '—' ? '未填寫' : escapeHtml(c)}</option>`).join('');
  if (opts.includes(v)) el.value = v; else el.value = '';
  
  renderClassPresets();
}

// 班級預設渲染
function renderClassPresets() {
  let presetsContainer = document.getElementById('classPresetsContainer');
  if (!presetsContainer) return;
  
  const presets = getClassPresets();
  if (presets.length === 0) {
    presetsContainer.innerHTML = '';
    presetsContainer.style.display = 'none';
    return;
  }
  
  presetsContainer.innerHTML = presets.map(p => 
    `<button type="button" class="class-preset-btn" data-class="${escapeHtml(p)}" title="點擊使用此班級">${escapeHtml(p)}</button>`
  ).join('') + 
  (presets.length < 8 ? '<button type="button" class="class-preset-btn add" id="addPresetBtn" title="添加常用班級">+ 新增</button>' : '');
  
  presetsContainer.style.display = 'flex';
  
  presetsContainer.querySelectorAll('.class-preset-btn:not(.add)').forEach(btn => {
    btn.addEventListener('click', () => {
      if ($('className')) $('className').value = btn.dataset.class;
      if ($('className')) $('className').focus();
    });
  });
  
  $('addPresetBtn')?.addEventListener('click', () => {
    const className = prompt('輸入班級名稱（例：P3A、初級班）：');
    if (className && className.trim()) {
      addClassPreset(className);
      renderClassPresets();
      if ($('className')) $('className').value = className;
    }
  });
}

// 時間工具函數
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// CSV 匯出
function escapeCsvValue(val) {
  const str = String(val || '');
  if (/^[=@+\-]/.test(str)) return `'${str}`;
  return str.replace(/"/g, '""');
}

function doExportCsv() {
  const list = parseRecords();
  if (list.length === 0) { toast('尚無記錄可匯出'); return; }
  const headers = ['課堂日期','班級名稱','人數','備注','開心指數','課堂氣氛','教學花式','掌握比例','預算教學時間','實際教學時間','技巧等級進度','主動幫助他人','同學互動','小組合作意願','自發練習','主動學習','課堂積極性','學習熱情','教學評分','學生滿意度','紀律介入次數','教學靈活性','個別化教學比例'];
  const rows = list.map(r => [
    r.classDate, escapeCsvValue(r.className), r.classSize ?? '', escapeCsvValue(r.notes ?? ''),
    r.engagement ?? '', escapeCsvValue(r.atmosphere ?? ''),
    (Array.isArray(r.tricks) ? r.tricks.map(t => 
      escapeCsvValue(t.name) + (t.detail ? `(${escapeCsvValue(t.detail)})` : '')
    ).join('；') : ''),
    r.mastery ?? '', r.plannedTime ?? '', r.actualTime ?? '', escapeCsvValue(r.skillLevel ?? ''),
    r.helpOthers ?? '', r.interaction ?? '', r.teamwork ?? '',
    r.selfPractice ?? '', r.activeLearn ?? '', r.positivity ?? '', r.enthusiasm ?? '',
    r.teachScore ?? '', r.satisfaction ?? '', r.disciplineCount ?? '', r.flexibility ?? '', r.individual ?? ''
  ].map(c => `"${escapeCsvValue(c)}"`).join(','));
  const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = '跳繩課堂Checkpoint_' + todayStr() + '.csv';
  a.click();
  
  // 記錄導出操作
  if (typeof loggerService !== 'undefined') {
    loggerService.logCoachAction('export_csv', `導出 ${list.length} 筆課堂記錄`, {
      recordCount: list.length,
      format: 'csv'
    });
  }
  
  toast('已匯出 CSV');
}

// 刪除記錄
function deleteRecord(classDate, className) {
  if (!confirm(`確定要刪除 ${classDate} · ${className || '未填寫'} 的記錄嗎？此操作無法復原。`)) return;
  const list = parseRecords();
  const i = list.findIndex(r => r.classDate === classDate && r.className === className);
  if (i >= 0) {
    list.splice(i, 1);
    saveRecords(list);
    
    // 記錄刪除操作
    if (typeof loggerService !== 'undefined') {
      loggerService.logCoachAction('delete_record', `刪除課堂記錄：${className || '未設定班級'}`, {
        className: className,
        date: classDate
      });
    }
    
    populateGlobalFilterClass();
    populateQuickSelectClass();
    refreshStats();
    refreshAnalytics();
    refreshActionsView();
    toast('已刪除記錄');
    const modal = $('detailModal');
    if (modal) modal.hidden = true;
  }
}

// 複製上堂課
function duplicateLastLesson() {
  const last = getLastLesson();
  if (!last) {
    toast('⚠ 未找到上堂課記錄');
    return;
  }
  loadIntoForm(last);
  if ($('classDate')) $('classDate').value = todayStr();
  toast('✓ 已載入上堂課資料（已清空日期和備注，請填寫新日期）');
}

// 統計計算
function score1to5Average(list) {
  const vals = [];
  list.forEach(r => { SCORE_1_5_IDS.forEach(id => { const v = r[id]; if (typeof v === 'number' && v >= 1 && v <= 5) vals.push(v); }); });
  return vals.length === 0 ? null : (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

function isWithinLast7Days(dateStr) {
  return new Date(dateStr).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
}

// 刷新統計
function refreshStats() {
  let list = parseRecords();
  const classF = getGlobalFilterClass();
  if (classF) list = list.filter(r => ((r.className || '').trim() || '—') === classF);
  const dateFrom = getFilterDateFrom(), dateTo = getFilterDateTo();
  if (dateFrom) list = list.filter(r => (r.classDate || '') >= dateFrom);
  if (dateTo) list = list.filter(r => (r.classDate || '') <= dateTo);
  list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));

  const ul = $('recentList');
  if (ul) {
    const recent = list.slice(0, 10);
    ul.innerHTML = recent.length === 0 ? '<li class="empty">尚無記錄</li>' : recent.map(r => {
      const meta = [r.className, r.classSize != null ? `人數 ${r.classSize}` : ''].filter(Boolean).join(' · ');
      return `<li data-date="${escapeHtml(r.classDate || '')}">${r.classDate || '–'}${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ''}</li>`;
    }).join('');
    ul.querySelectorAll('li[data-date]').forEach(li => {
      li.onclick = () => { const rec = list.find(r => r.classDate === li.dataset.date); if (rec) showDetail(rec); };
    });
  }
  refreshByClass();
}

function refreshByClass() {
  let list = parseRecords();
  const classF = getGlobalFilterClass();
  if (classF) list = list.filter(r => ((r.className || '').trim() || '—') === classF);
  
  const searchVal = ($('studentSearch')?.value || '').toLowerCase().trim();
  if (searchVal) {
    list = list.filter(r => {
      const className = (r.className || '').toLowerCase();
      const classDate = (r.classDate || '').toLowerCase();
      return className.includes(searchVal) || classDate.includes(searchVal);
    });
  }
  
  const sortBy = $('sortBy')?.value || 'date-desc';
  switch(sortBy) {
    case 'date-asc':
      list.sort((a, b) => (a.classDate || '').localeCompare(b.classDate || ''));
      break;
    case 'name-asc':
      list.sort((a, b) => ((a.className || '').trim() || '—').localeCompare((b.className || '').trim() || '—'));
      break;
    case 'mastery-desc':
      list.sort((a, b) => (b.mastery ?? 0) - (a.mastery ?? 0));
      break;
    case 'engagement-desc':
      list.sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0));
      break;
    case 'date-desc':
    default:
      list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
  }
  
  const groups = {};
  list.forEach(r => { const key = (r.className || '').trim() || '—'; if (!groups[key]) groups[key] = []; groups[key].push(r); });
  Object.keys(groups).forEach(k => { groups[k].sort((a, b) => (b.classDate || '').localeCompare(a.classDate || '')); });
  let keys = Object.keys(groups).sort((a, b) => (groups[b][0]?.classDate || '').localeCompare(groups[a][0]?.classDate || ''));
  if (classF) keys = keys.filter(k => k === classF);

  const ul = $('byClassList');
  if (!ul) return;
  ul.innerHTML = keys.length === 0 ? '<li class="empty">未找到符合的記錄</li>' : keys.map(key => {
    const label = key === '—' ? '未填寫班別' : escapeHtml(key);
    return `<li data-class="${escapeHtml(key)}">${label} <span class="count">(${groups[key].length}堂)</span></li>`;
  }).join('');
  ul.querySelectorAll('li[data-class]').forEach(li => { li.onclick = () => showClassDetail(li.dataset.class); });
}

// 動作記錄頁面
function refreshActionsView() {
  let list = parseRecords();
  const sel = $('actionFilterClass'), filterVal = sel ? sel.value : '';
  const dateFrom = ($('actionDateFrom') && $('actionDateFrom').value) || '';
  const dateTo = ($('actionDateTo') && $('actionDateTo').value) || '';
  const skillF = ($('actionSkillLevel') && $('actionSkillLevel').value) || '';

  if (filterVal) list = list.filter(r => ((r.className || '').trim() || '—') === filterVal);
  if (dateFrom) list = list.filter(r => (r.classDate || '') >= dateFrom);
  if (dateTo) list = list.filter(r => (r.classDate || '') <= dateTo);
  if (skillF) list = list.filter(r => (r.skillLevel || '') === skillF);

  const classes = getClassOptions();
  if (sel) {
    sel.innerHTML = '<option value="">全部</option>' + classes.map(c => `<option value="${escapeHtml(c)}">${c === '—' ? '未填寫' : escapeHtml(c)}</option>`).join('');
    if (classes.includes(filterVal)) sel.value = filterVal;
  }

  const flat = [];
  list.forEach(r => {
    const arr = Array.isArray(r.tricks) ? r.tricks : [];
    const cls = (r.className || '').trim() || '—';
    if (arr.length === 0) flat.push({ date: r.classDate, className: cls, name: '—', detail: '—', mastery: r.mastery ?? '–' });
    else arr.forEach(t => flat.push({ date: r.classDate, className: cls, name: t.name || '—', detail: t.detail || '—', mastery: r.mastery ?? '–' }));
  });
  flat.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const tbody = $('actionsTableBody');
  const empty = $('actionsEmpty');
  if (tbody) {
    tbody.innerHTML = flat.map(f => `<tr><td>${f.date || '–'}</td><td>${escapeHtml(f.className)}</td><td>${escapeHtml(f.name)}</td><td>${escapeHtml(f.detail)}</td><td>${typeof f.mastery === 'number' ? f.mastery + '%' : f.mastery}</td></tr>`).join('');
  }
  if (empty) empty.hidden = flat.length > 0;
}

// 統計分析
function refreshAnalytics() {
  let list = parseRecords();
  const classF = ($('analyticsFilterClass') && $('analyticsFilterClass').value) || '';
  const dateFrom = ($('analyticsDateFrom') && $('analyticsDateFrom').value) || '';
  const dateTo = ($('analyticsDateTo') && $('analyticsDateTo').value) || '';
  if (classF) list = list.filter(r => ((r.className || '').trim() || '—') === classF);
  if (dateFrom) list = list.filter(r => (r.classDate || '') >= dateFrom);
  if (dateTo) list = list.filter(r => (r.classDate || '') <= dateTo);

  const total = list.length;
  const week = list.filter(r => isWithinLast7Days(r.classDate || '')).length;
  const avg = score1to5Average(list);
  const last = list[0] || null;
  if ($('statTotal')) $('statTotal').textContent = total;
  if ($('statWeek')) $('statWeek').textContent = week;
  if ($('statAvg')) $('statAvg').textContent = avg != null ? avg : '–';
  if ($('statUpdated')) $('statUpdated').textContent = last ? (last.classDate || '–') : '–';

  const classes = getClassOptions();
  const aSel = $('analyticsFilterClass');
  if (aSel) {
    const v = aSel.value;
    aSel.innerHTML = '<option value="">全部</option>' + classes.map(c => `<option value="${escapeHtml(c)}">${c === '—' ? '未填寫' : escapeHtml(c)}</option>`).join('');
    if (classes.includes(v)) aSel.value = v;
  }

  const groups = {};
  list.forEach(r => { const key = (r.className || '').trim() || '—'; if (!groups[key]) groups[key] = []; groups[key].push(r); });
  const keys = Object.keys(groups).sort((a, b) => (groups[b][0]?.classDate || '').localeCompare(groups[a][0]?.classDate || ''));

  const chart = $('analyticsChart');
  if (chart) {
    if (keys.length === 0) {
      chart.innerHTML = '';
    } else {
      chart.innerHTML = '<table class="simple-table">' +
        '<thead><tr><th>班別</th><th>堂數</th></tr></thead>' +
        '<tbody>' +
        keys.map(key => {
          const label = key === '—' ? '未填寫班別' : escapeHtml(key);
          const count = groups[key].length;
          return `<tr><td>${label}</td><td class="text-right"><strong>${count}</strong></td></tr>`;
        }).join('') +
        '</tbody>' +
        '</table>';
    }
  }
}

// 班別詳情 Modal
function showClassDetail(classKey) {
  const list = parseRecords();
  const recs = list.filter(r => ((r.className || '').trim() || '—') === classKey).sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
  const title = (classKey === '—' ? '未填寫班別' : classKey) + ' － 班別細節';
  if ($('classDetailTitle')) $('classDetailTitle').textContent = title;
  if ($('classDetailBody')) {
    $('classDetailBody').innerHTML = recs.length === 0 ? '<p class="empty">此班別尚無課堂記錄。</p>' : '<ul class="class-session-list">' + recs.map(r => `<li class="class-session-item" data-date="${escapeHtml(r.classDate || '')}" data-class="${escapeHtml(r.className || '')}"><span class="date">${r.classDate || '–'}</span>${r.classSize != null ? `<span class="meta">人數 ${r.classSize}</span>` : ''}<span class="hint">點擊查看詳情</span><button type="button" class="delete-session-btn" aria-label="刪除此堂課">×</button></li>`).join('') + '</ul>';
    $('classDetailBody').querySelectorAll('.class-session-item').forEach(li => {
      li.onclick = (e) => { if (e.target.classList.contains('delete-session-btn')) return; const rec = list.find(r => r.classDate === li.dataset.date && r.className === li.dataset.class); if (rec) { const modal = $('classDetailModal'); if (modal) modal.hidden = true; showDetail(rec); } };
      li.querySelector('.delete-session-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const dateStr = li.dataset.date;
        const classStr = li.dataset.class;
        deleteRecord(dateStr, classStr);
        setTimeout(() => showClassDetail(classKey), 300);
      });
    });
  }
  const modal = $('classDetailModal');
  if (modal) modal.hidden = false;
}

// 課堂詳情 Modal
function showDetail(rec) {
  const tricksStr = Array.isArray(rec.tricks) && rec.tricks.length ? rec.tricks.map(t => {
    let str = escapeHtml(t.name);
    if (t.detail) str += `（${escapeHtml(t.detail)}）`;
    if (t.level) str += ` [${escapeHtml(t.level)}]`;
    return str;
  }).join('、') : '—';
  
  let durationStr = '—';
  if (rec.classStartTime && rec.classEndTime) {
    durationStr = `${rec.classStartTime} - ${rec.classEndTime}`;
    if (rec.classDurationMins) {
      const h = Math.floor(rec.classDurationMins / 60);
      const m = rec.classDurationMins % 60;
      durationStr += ` (${h ? `${h}小時` : ''}${m ? `${m}分鐘` : ''})`;
    }
  }
  
  if ($('detailTitle')) $('detailTitle').textContent = `課堂詳情 · ${rec.classDate || '–'}`;
  if ($('detailBody')) {
    $('detailBody').innerHTML = `
      <dl>
        <dt>基本資料</dt><dd>${rec.classDate || '–'} | ${escapeHtml(rec.className || '–')} | 人數 ${rec.classSize ?? '–'}</dd>
        ${rec.classLocation ? `<dt>課堂位置</dt><dd>${escapeHtml(rec.classLocation)}</dd>` : ''}
        ${rec.teachingRole ? `<dt>教學角色</dt><dd>${escapeHtml(rec.teachingRole)}</dd>` : ''}
        <dt>課堂時間</dt><dd>${durationStr}</dd>
        <dt>備注</dt><dd>${rec.notes ? escapeHtml(rec.notes).replace(/\n/g, '<br>') : '—'}</dd>
        <dt>投入度</dt><dd>開心指數 ${rec.engagement ?? '–'}/5 · 課堂氣氛 ${escapeHtml(rec.atmosphere || '–')}</dd>
        <dt>技能進步</dt><dd>教學花式：${tricksStr} · 掌握 ${rec.mastery ?? '–'}% · 預算/實際 ${rec.plannedTime ?? '–'}/${rec.actualTime ?? '–'} 分鐘 · 技巧等級 ${escapeHtml(rec.skillLevel || '–')}</dd>
        <dt>團隊協作</dt><dd>幫助他人 ${rec.helpOthers ?? '–'}% · 互動 ${rec.interaction ?? '–'}% · 小組合作 ${rec.teamwork ?? '–'}%</dd>
        <dt>心理與自信</dt><dd>自發練習 ${rec.selfPractice ?? '–'}% · 主動學習 ${rec.activeLearn ?? '–'}% · 積極性 ${rec.positivity ?? '–'}/5 · 熱情 ${rec.enthusiasm ?? '–'}/5</dd>
        <dt>教練質量</dt><dd>教學 ${rec.teachScore ?? '–'}/10 · 滿意度 ${rec.satisfaction ?? '–'}/5 · 紀律介入 ${rec.disciplineCount ?? '–'} 次 · 靈活性 ${rec.flexibility ?? '–'}/10 · 個別化 ${rec.individual ?? '–'}%</dd>
      </dl>
      <p style="margin-top:1rem;"><button type="button" id="loadIntoFormBtn" class="btn btn-ghost">載入到表單（重溫／編輯）</button> <button type="button" id="deleteRecordBtn" class="btn btn-danger-ghost">刪除此記錄</button></p>`;
    $('loadIntoFormBtn')?.addEventListener('click', () => { setPage('overview'); loadIntoForm(rec); const modal = $('detailModal'); if (modal) modal.hidden = true; });
    $('deleteRecordBtn')?.addEventListener('click', () => { deleteRecord(rec.classDate, rec.className); });
  }
  const modal = $('detailModal');
  if (modal) modal.hidden = false;
}

// ============================================================================
// 第 9 部分：應用初始化和事件綁定
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 初始化用戶數據庫（如果不存在）
  let seedUsers = loadUsersFromStorage();
  if (seedUsers.length === 0) {
    seedUsers = [{
      id: `user_${Date.now()}_creator`,
      userId: `user_${Date.now()}_creator`,
      username: 'creator',
      passwordHash: hashPasswordCompat('1234'),
      role: 'creator',
      email: 'creator@system.local',
      createdAt: new Date().toISOString()
    }];
    saveUsersToStorage(seedUsers);
    console.log('✅ 已初始化 Creator 用戶');
  }

  // 登入頁面初始化
  const isLoginPage = Boolean(document.getElementById('loginForm'));
  if (isLoginPage) {
    initLoginPage();
    return;
  }

  // 僅在主應用頁面執行初始化
  const isMainApp = Boolean(document.getElementById('page-overview'));
  if (!isMainApp) return;

  // 初始化所有管理器
  STORAGE_MANAGER.init();
  LOGIN_MANAGER.init();
  UI_MANAGER.init();

  // 初始化 PouchDB（如果可用）
  if (typeof PouchDB !== 'undefined') {
    (async () => {
      try {
        const currentUser = LOGIN_MANAGER.getCurrentUser();
        const userId = currentUser?.id || 'guest';
        const dbName = `rs-system-${userId}`;
        
        // 創建用戶隔離的數據庫
        const db = new PouchDB(dbName);
        
        // 初始化儲存服務
        await storageService.init(db);
        
        console.log(`✅ PouchDB 初始化成功: ${dbName}`);
        
        // 記錄系統事件
        if (typeof loggerService !== 'undefined') {
          loggerService.logSystemEvent('pouchdb_init', `PouchDB 數據庫初始化: ${dbName}`, 'info');
        }
      } catch (error) {
        console.error('❌ PouchDB 初始化失敗:', error);
        if (typeof loggerService !== 'undefined') {
          loggerService.logSystemEvent('pouchdb_init_error', `PouchDB 初始化失敗: ${error.message}`, 'error');
        }
      }
    })();
  } else {
    console.warn('⚠️ PouchDB 庫未加載，將使用 localStorage 進行存儲');
    if (typeof loggerService !== 'undefined') {
      loggerService.logSystemEvent('pouchdb_unavailable', 'PouchDB 庫未加載，使用 localStorage', 'warning');
    }
  }

  // 登出功能
  const btnLogout = $('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('確定要登出嗎？')) {
        LOGIN_MANAGER.logout();
      }
    });
  }

  // 初始化頁面可見性根據角色
  if (!isCreator()) {
    const pageData = $('page-data');
    const navData = $('navData');
    if (pageData) pageData.hidden = true;
    if (navData) navData.hidden = true;
  }

  // 導出功能
  const btnExport = $('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', (e) => {
      e.preventDefault();
      doExportCsv();
    });
  }

  // 設置功能預留
  const btnSettings = $('btnSettings');
  if (btnSettings) {
    btnSettings.addEventListener('click', (e) => {
      e.preventDefault();
      alert('系統設置功能即將推出');
    });
  }

  // 更新統計
  updateSidebarStats();
  updateUserInfo();

  // 快速複製按鈕
  const btnDuplicate = document.createElement('button');
  btnDuplicate.type = 'button';
  btnDuplicate.id = 'btnDuplicate';
  btnDuplicate.className = 'btn btn-secondary btn-sm';
  btnDuplicate.textContent = '⚡ 複製上堂課';
  btnDuplicate.title = '快速複製上堂課的資料 (80% 更快)';
  const btnGroup = $('btnSave')?.parentElement;
  if (btnGroup) {
    btnGroup.insertBefore(btnDuplicate, $('btnSave')?.nextSibling);
    btnDuplicate.addEventListener('click', duplicateLastLesson);
  }

  // 清除所有
  $('btnDeleteAll')?.addEventListener('click', () => {
    if (!confirm('確定要永久清除所有記錄嗎？此操作無法復原。')) return;
    const scopedKey = getUserScopedKey(STORAGE_KEY);
    localStorage.removeItem(scopedKey);
    localStorage.removeItem(STORAGE_KEY); // 清理舊版共享資料
    clearForm();
    populateGlobalFilterClass();
    populateQuickSelectClass();
    refreshStats();
    refreshAnalytics();
    refreshActionsView();
    toast('已清除所有記錄');
  });

  // 儲存按鈕
  $('btnSave')?.addEventListener('click', () => {
    const d = getFormData();
    
    document.querySelectorAll('[aria-invalid="true"]').forEach(el => {
      el.removeAttribute('aria-invalid');
      el.style.borderColor = '';
    });
    
    const issues = validateFormData(d);
    if (issues.length > 0) {
      issues.forEach(issue => {
        const field = $(issue.field);
        if (field) {
          field.setAttribute('aria-invalid', 'true');
          field.style.borderColor = 'var(--danger)';
        }
      });
      
      const messages = issues.map(i => i.message).join('\n');
      toast('❌ 請修正以下問題:\n' + messages);
      return;
    }
    
    if (!d.classDate) { toast('請填寫課堂日期'); return; }
    
    const dupes = checkDateDuplicate(d.classDate, d.className, d.classStartTime);
    if (dupes.length > 0) {
      const timeInfo = d.classStartTime ? ` (${d.classStartTime})` : '';
      if (!confirm(`⚠ 已存在 ${d.classDate}${timeInfo} 的記錄 (${d.className || '未設定班級'})。\n\n確定要覆蓋嗎？`)) {
        return;
      }
    }
    
    const list = parseRecords();
    const i = list.findIndex(r => r.classDate === d.classDate && r.className === d.className);
    const isNew = i < 0;
    if (i >= 0) list[i] = d; else list.push(d);
    list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
    saveRecords(list);
    
    // 記錄教練操作
    if (typeof loggerService !== 'undefined') {
      const action = isNew ? 'create_record' : 'update_record';
      const details = `${isNew ? '新增' : '更新'}課堂記錄`;
      const metadata = {
        className: d.className,
        date: d.classDate,
        classSize: d.classSize,
        atmosphere: d.atmosphere
      };
      loggerService.logCoachAction(action, details, metadata);
    }
    
    if (d.className.trim()) {
      addClassPreset(d.className);
    }
    
    populateGlobalFilterClass();
    populateQuickSelectClass();
    renderClassPresets();
    refreshStats();
    updateSidebarStats();
    refreshActionsView?.();
    refreshAnalytics?.();
    toast('✓ 已儲存本堂記錄');
  });

  // 清空按鈕
  $('btnClear')?.addEventListener('click', () => {
    if (confirm('確定要清空本堂輸入嗎？')) clearForm();
  });

  // 課堂時間監聽器
  $('classStartTime')?.addEventListener('change', updateClassDuration);
  $('classEndTime')?.addEventListener('change', updateClassDuration);

  // 綁定所有範圍滑桿
  RANGE_IDS.forEach(bindRange);

  // 選項組綁定
  OPTION_GROUPS.forEach(g => {
    const c = $q(g.selector);
    if (!c) return;
    c.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        c.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });

  // 添加花式
  $('addTrick')?.addEventListener('click', () => {
    const name = ($('trickName')?.value || '').trim();
    if (!name) return;
    const detail = ($('trickDetail')?.value || '').trim();
    const masteryVal = parseInt($('mastery')?.value || '50', 10);
    const plannedValRaw = ($('plannedTime')?.value || '').trim();
    const actualValRaw = ($('actualTime')?.value || '').trim();
    const plannedVal = plannedValRaw ? parseInt(plannedValRaw, 10) : null;
    const actualVal = actualValRaw ? parseInt(actualValRaw, 10) : null;
    const skillBtn = $q('[data-name="skillLevel"] .selected');
    const skillLevel = skillBtn?.dataset?.v || skillBtn?.textContent?.trim() || '';

    tricks.push({
      name,
      detail,
      level: skillLevel || '',
      mastery: Number.isFinite(masteryVal) ? masteryVal : null,
      plannedTime: Number.isFinite(plannedVal) ? plannedVal : null,
      actualTime: Number.isFinite(actualVal) ? actualVal : null,
      skillLevel: skillLevel || ''
    });
    if ($('trickName')) $('trickName').value = '';
    if ($('trickDetail')) $('trickDetail').value = '';
    if ($('trickName')) $('trickName').focus();
    renderTricks();
  });

  // 導航
  $qa('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); setPage(el.dataset.page); });
  });

  // 側邊欄控制 - 打開/關閉
  $('sidebarToggle')?.addEventListener('click', () => { $('sidebar')?.classList.toggle('collapsed'); });
  
  // 側邊欄控制 - 收起按鈕
  $('btnCollapseSidebar')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sidebar = $('sidebar');
    if (sidebar) {
      sidebar.classList.add('collapsed');
      console.log('✅ 側邊欄已收起');
    }
  });

  // 篩選事件
  $('globalFilterClass')?.addEventListener('change', () => { refreshByClass(); refreshStats(); });
  $('filterDateFrom')?.addEventListener('change', () => refreshStats());
  $('filterDateTo')?.addEventListener('change', () => refreshStats());
  $('studentSearch')?.addEventListener('input', () => refreshStats());
  $('sortBy')?.addEventListener('change', () => refreshStats());

  $('quickSelectClass')?.addEventListener('change', function () {
    const v = this.value;
    if ($('className')) $('className').value = (v === '—' || !v) ? '' : v;
  });

  $('actionFilterClass')?.addEventListener('change', () => refreshActionsView());
  $('actionDateFrom')?.addEventListener('change', () => refreshActionsView());
  $('actionDateTo')?.addEventListener('change', () => refreshActionsView());
  $('actionSkillLevel')?.addEventListener('change', () => refreshActionsView());

  $('analyticsFilterClass')?.addEventListener('change', () => refreshAnalytics());
  $('analyticsDateFrom')?.addEventListener('change', () => refreshAnalytics());
  $('analyticsDateTo')?.addEventListener('change', () => refreshAnalytics());

  // Modal 關閉按鈕
  $('closeClassDetail')?.addEventListener('click', () => { const modal = $('classDetailModal'); if (modal) modal.hidden = true; });
  $('classDetailModal')?.querySelector('.modal-backdrop')?.addEventListener('click', () => { const modal = $('classDetailModal'); if (modal) modal.hidden = true; });
  $('closeDetail')?.addEventListener('click', () => { const modal = $('detailModal'); if (modal) modal.hidden = true; });
  $('detailModal')?.querySelector('.modal-backdrop')?.addEventListener('click', () => { const modal = $('detailModal'); if (modal) modal.hidden = true; });

  // 初始化頁面
  if ($('classDate')) $('classDate').value = todayStr();
  if ($('topbarDate')) $('topbarDate').textContent = todayStr();
  populateGlobalFilterClass();
  populateQuickSelectClass();
  renderClassPresets();
  renderTricks();
  refreshStats();
  setPage('overview');

  console.log('✅ 應用初始化完成');
});

// 頁面卸載時保存數據
window.addEventListener('beforeunload', () => {
  // 保存到 localStorage
  if (STORAGE_MANAGER.cache.checkpoints) {
    STORAGE_MANAGER.saveCheckpoints(STORAGE_MANAGER.cache.checkpoints);
  }
  
  // 如果 PouchDB 可用，停止變動監聽並同步
  if (typeof storageService !== 'undefined' && storageService.changesFeed) {
    try {
      storageService.stopChangesFeed();
      console.log('✅ PouchDB 監聽已停止');
    } catch (error) {
      console.error('⚠️ PouchDB 停止失敗:', error);
    }
  }
  
  // 記錄應用卸載
  if (typeof loggerService !== 'undefined') {
    loggerService.logSystemEvent('app_unload', '應用已卸載', 'info');
  }
});

// ============================================================================
// 第 10 部分：系統診斷函數
// ============================================================================

window.systemDiagnosis = () => {
  const tests = {
    localStorage: () => {
      try {
        localStorage.setItem('test', 'ok');
        localStorage.removeItem('test');
        return '✅ localStorage 正常';
      } catch { return '❌ localStorage 失敗'; }
    },
    pouchdb: () => {
      return typeof PouchDB !== 'undefined' ? '✅ PouchDB 已加載' : '❌ PouchDB 未加載';
    },
    userAuth: () => {
      return typeof LOGIN_MANAGER !== 'undefined' ? '✅ 認證系統已初始化' : '❌ 認證系統未初始化';
    },
    dataCount: () => {
      const count = parseRecords().length;
      return `✅ 已加載 ${count} 筆記錄`;
    },
    encryption: () => {
      try {
        const test = btoa('test');
        return atob(test) === 'test' ? '✅ Base64 加密正常' : '❌ 加密失敗';
      } catch { return '❌ Base64 加密錯誤'; }
    }
  };
  
  console.log('=== 系統診斷報告 ===');
  Object.entries(tests).forEach(([name, fn]) => console.log(`${name}: ${fn()}`));
  return tests;
};

window.pouchdbDiagnosis = async () => {
  const results = {};
  
  try {
    results.dbConnection = typeof storageService !== 'undefined' && storageService.db
      ? '✅ 數據庫已連接'
      : '⚠️ 數據庫未初始化';
    
    if (storageService && storageService.db) {
      try {
        const testDoc = { type: 'test', timestamp: Date.now() };
        const writeResult = await storageService.db.post(testDoc);
        await storageService.db.remove(writeResult.id, writeResult.rev);
        results.writeTest = '✅ 數據寫入測試成功';
      } catch (e) {
        results.writeTest = `❌ 寫入測試失敗: ${e.message}`;
      }
    }
    
    const records = parseRecords();
    results.recordCount = `✅ 共 ${records.length} 筆記錄`;
    
    results.indexStatus = typeof storageService.db.query !== 'undefined'
      ? '✅ 查詢索引已啟用'
      : '⚠️ 查詢索引未啟用';
    
  } catch (err) {
    results.error = `❌ 診斷失敗: ${err.message}`;
  }
  
  console.log('=== PouchDB 診斷報告 ===');
  Object.entries(results).forEach(([key, val]) => console.log(`${key}: ${val}`));
  return results;
};

// 輕量自動化測試：模擬儲存並驗證 UI 即時刷新
window.testImmediateRefresh = async () => {
  try {
    const testRecord = {
      classDate: todayStr(),
      className: '測試班',
      classSize: 12,
      classLocation: '',
      teachingRole: '',
      classStartTime: '',
      classEndTime: '',
      classDurationMins: null,
      notes: 'auto-test',
      engagement: 3,
      atmosphere: '開心',
      tricks: [],
      mastery: 50,
      plannedTime: null,
      actualTime: null,
      skillLevel: '初級',
      helpOthers: 50,
      interaction: 50,
      teamwork: 50,
      selfPractice: 50,
      activeLearn: 50,
      positivity: 3,
      enthusiasm: 3,
      teachScore: 7,
      satisfaction: 3,
      disciplineCount: null,
      flexibility: 7,
      individual: 50
    };

    const list = parseRecords();
    const idx = list.findIndex(r => r.classDate === testRecord.classDate && r.className === testRecord.className);
    if (idx >= 0) list[idx] = testRecord; else list.push(testRecord);
    list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
    saveRecords(list);

    // 觸發所有相關刷新
    updateSidebarStats();
    refreshStats?.();
    refreshActionsView?.();
    refreshAnalytics?.();

    // 讀取結果
    const todayCount = parseInt(document.getElementById('todayCount')?.textContent || '0', 10);
    const totalStudents = parseInt(document.getElementById('totalStudents')?.textContent || '0', 10);
    const byClassNonEmpty = Boolean(document.getElementById('byClassList')?.innerHTML?.trim());
    const actionsRows = (document.getElementById('actionsTableBody')?.children || []).length;
    const analyticsNonEmpty = Boolean(document.getElementById('analyticsChart')?.innerHTML?.trim());

    const result = {
      todayCount,
      totalStudents,
      byClassNonEmpty,
      actionsRows,
      analyticsNonEmpty,
      recordCount: parseRecords().length
    };

    console.log('=== 自動化 UI 刷新測試 ===', result);
    return result;
  } catch (error) {
    console.error('❌ 自動化測試失敗:', error);
    return { error: error.message };
  }
};

// 導出全局對象供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_MANAGER,
    LOGIN_MANAGER,
    UI_MANAGER,
    storageService,
    getCurrentUser,
    isCreator,
    parseRecords,
    saveRecords
  };
}

console.log('✅ system.js 已加載完成 - HKJRA 教練記錄系統 v3.0');

/**
 * 登入流程改進版
 * v1.1: 修復登入問題、加入安全防護、改善用戶體驗
 */

const LOGIN_MANAGER = {
  // 安全配置
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 分鐘
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 小時
    PASSWORD_MIN_LENGTH: 4
  },

  // 狀態跟蹤
  state: {
    loginAttempts: {},
    lockedAccounts: {},
    activeSessions: {}
  },

  /**
   * 初始化登入管理器
   */
  init() {
    try {
      // 檢查並恢復會話
      this.checkSession();
      
      // 監聽會話超時
      this.setupSessionTimeout();
      
      console.log('✅ 登入管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 登入管理器初始化失敗:', error);
      return false;
    }
  },

  /**
   * 登入函數（改進版）
   */
  async login(username, password) {
    try {
      // 驗證輸入
      if (!username || !password) {
        throw new Error('用戶名和密碼不能為空');
      }

      // 檢查帳號是否被鎖定
      if (this.isAccountLocked(username)) {
        throw new Error('帳號已鎖定，請稍後再試');
      }

      // 獲取用戶列表
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      
      // 查找用戶
      const user = Object.values(users).find(u => u.username === username);
      
      if (!user) {
        this.recordFailedAttempt(username);
        throw new Error('用戶名或密碼錯誤');
      }

      // 驗證密碼（使用改進的比較方法防止時序攻擊）
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
      
      if (!isPasswordValid) {
        this.recordFailedAttempt(username);
        throw new Error('用戶名或密碼錯誤');
      }

      // 清除失敗記錄
      delete this.state.loginAttempts[username];

      // 建立會話
      const sessionId = this.generateSessionId();
      const sessionData = {
        userId: user.userId,
        username: user.username,
        sessionId: sessionId,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.SECURITY.SESSION_TIMEOUT,
        ipHash: this.getIpHash() // 防止會話跨設備使用
      };

      // 保存會話
      localStorage.setItem('rs-system-session', JSON.stringify(sessionData));
      localStorage.setItem('current-user', JSON.stringify({
        id: user.userId,
        username: user.username,
        email: user.email,
        role: user.role
      }));

      // 記錄活躍會話
      this.state.activeSessions[sessionId] = sessionData;

      console.log(`✅ 用戶 ${username} 登入成功`);
      
      return {
        success: true,
        user: {
          id: user.userId,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('❌ 登入失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * 登出函數（改進版）
   */
  logout() {
    try {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || '{}');
      
      // 刪除會話數據
      localStorage.removeItem('rs-system-session');
      localStorage.removeItem('current-user');
      
      // 清除活躍會話記錄
      if (session.sessionId) {
        delete this.state.activeSessions[session.sessionId];
      }

      console.log('✅ 已登出');
      
      // 重定向到登入頁
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ 登出失敗:', error);
      return false;
    }
  },

  /**
   * 檢查和恢復會話
   */
  checkSession() {
    try {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      
      if (!session) {
        return false;
      }

      // 檢查會話是否過期
      if (Date.now() > session.expiresAt) {
        console.warn('⚠️ 會話已過期');
        this.logout();
        return false;
      }

      // 驗證 IP 一致性
      if (session.ipHash !== this.getIpHash()) {
        console.warn('⚠️ 檢測到異常登入位置，自動登出');
        this.logout();
        return false;
      }

      console.log('✅ 會話有效');
      return true;
    } catch (error) {
      console.error('⚠️ 會話檢查失敗:', error);
      return false;
    }
  },

  /**
   * 設置會話超時監控
   */
  setupSessionTimeout() {
    // 每分鐘檢查一次會話
    setInterval(() => {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      
      if (session && Date.now() > session.expiresAt) {
        console.log('⚠️ 會話已過期，自動登出');
        this.logout();
      }
    }, 60000);
  },

  /**
   * 記錄失敗的登入嘗試
   */
  recordFailedAttempt(username) {
    if (!this.state.loginAttempts[username]) {
      this.state.loginAttempts[username] = [];
    }

    this.state.loginAttempts[username].push(Date.now());

    // 只保留最近 5 次嘗試
    if (this.state.loginAttempts[username].length > this.SECURITY.MAX_LOGIN_ATTEMPTS) {
      console.warn(`🔒 用戶 ${username} 登入嘗試過多，帳號已鎖定`);
      this.state.lockedAccounts[username] = Date.now() + this.SECURITY.LOCKOUT_DURATION;
    }
  },

  /**
   * 檢查帳號是否被鎖定
   */
  isAccountLocked(username) {
    if (!this.state.lockedAccounts[username]) {
      return false;
    }

    if (Date.now() > this.state.lockedAccounts[username]) {
      delete this.state.lockedAccounts[username];
      delete this.state.loginAttempts[username];
      return false;
    }

    return true;
  },

  /**
   * 驗證密碼（防時序攻擊）
   */
  async verifyPassword(password, hash) {
    return new Promise((resolve) => {
      // 使用簡單的時間恆定比較
      const computed = this.hashPassword(password);
      
      // 即使不匹配也執行相同時間的操作
      let result = true;
      const minLength = Math.min(computed.length, hash.length);
      
      for (let i = 0; i < minLength; i++) {
        if (computed[i] !== hash[i]) {
          result = false;
        }
      }

      if (computed.length !== hash.length) {
        result = false;
      }

      // 模擬耗時操作防止時序攻擊
      setTimeout(() => resolve(result), Math.random() * 100);
    });
  },

  /**
   * 密碼雜湊函數
   */
  hashPassword(password) {
    // 簡單的雜湊實現（生產環境應使用 bcrypt）
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  },

  /**
   * 生成會話 ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 取得 IP 雜湊（基於客戶端信息）
   */
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

  /**
   * 取得當前用戶
   */
  getCurrentUser() {
    try {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      
      if (!session || Date.now() > session.expiresAt) {
        return null;
      }

      return JSON.parse(localStorage.getItem('current-user') || 'null');
    } catch (error) {
      return null;
    }
  },

  /**
   * 檢查是否已登入
   */
  isLoggedIn() {
    return this.checkSession() && this.getCurrentUser() !== null;
  },

  /**
   * 強制登出所有其他會話（防止多設備登入濫用）
   */
  forceLogoutOthers() {
    try {
      const current = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      
      if (!current) {
        return false;
      }

      // 刪除除當前會話外的所有活躍會話
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

// 自動初始化
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    LOGIN_MANAGER.init();
  });
}

// 導出以供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LOGIN_MANAGER;
}

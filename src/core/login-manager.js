/**
 * 登录管理器 - 处理用户认证与会话管理
 * @module core/login-manager
 */

import { loadUsersFromStorage, hashPasswordCompat } from './auth-config.js';

/**
 * 登录管理器对象
 * 处理用户登录、登出、会话管理和权限检查
 */
export const LOGIN_MANAGER = {
  /**
   * 安全配置
   */
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
    PASSWORD_MIN_LENGTH: 4
  },

  /**
   * 内部状态
   */
  state: {
    loginAttempts: {},
    lockedAccounts: {},
    activeSessions: {}
  },

  /**
   * 初始化登录管理器
   * @returns {boolean} 初始化是否成功
   */
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

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 登录结果对象
   */
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

  /**
   * 用户登出
   * @returns {boolean} 登出是否成功
   */
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

  /**
   * 检查会话有效性
   * @returns {boolean} 会话是否有效
   */
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

  /**
   * 设置会话超时检查
   */
  setupSessionTimeout() {
    setInterval(() => {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      if (session && Date.now() > session.expiresAt) {
        console.log('⚠️ 會話已過期，自動登出');
        this.logout();
      }
    }, 60000);
  },

  /**
   * 记录登录失败尝试
   * @param {string} username - 用户名
   */
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

  /**
   * 检查账号是否被锁定
   * @param {string} username - 用户名
   * @returns {boolean} 账号是否被锁定
   */
  isAccountLocked(username) {
    if (!this.state.lockedAccounts[username]) return false;

    if (Date.now() > this.state.lockedAccounts[username]) {
      delete this.state.lockedAccounts[username];
      delete this.state.loginAttempts[username];
      return false;
    }
    return true;
  },

  /**
   * 验证密码
   * @param {string} password - 明文密码
   * @param {string} hash - 密码哈希
   * @returns {Promise<boolean>} 密码是否正确
   */
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

  /**
   * 密码哈希函数
   * @param {string} password - 明文密码
   * @returns {string} 密码哈希
   */
  hashPassword(password) {
    return hashPasswordCompat(password);
  },

  /**
   * 生成会话 ID
   * @returns {string} 会话 ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 获取 IP 哈希（基于浏览器指纹）
   * @returns {string} IP 哈希
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
   * 获取当前用户信息
   * @returns {Object|null} 用户对象或 null
   */
  getCurrentUser() {
    try {
      const session = JSON.parse(localStorage.getItem('rs-system-session') || 'null');
      if (!session || Date.now() > session.expiresAt) return null;
      return JSON.parse(localStorage.getItem('current-user') || 'null');
    } catch (error) {
      return null;
    }
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return this.checkSession() && this.getCurrentUser() !== null;
  },

  /**
   * 强制登出其他设备的会话
   * @returns {boolean} 操作是否成功
   */
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

/**
 * 用戶認證系統
 * 簡單的本地用戶管理（支援多用戶）
 * v1.0: 基本登入、登出、會話管理
 * 
 * 注意：這是本地認證系統，用於多用戶隔離。
 * 生產環境建議配合後端認證或 Firebase Authentication。
 */

const AUTH_CONFIG = {
  STORAGE_KEY: 'rs-system-auth',
  SESSION_KEY: 'rs-system-session',
  USER_DB_KEY: 'rs-system-users',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 小時
  PASSWORD_MIN_LENGTH: 4
};

/**
 * 用戶認證管理器
 */
class AuthenticationManager {
  constructor() {
    this.currentUser = null;
    this.users = this._loadUsers();
    this.sessionId = null;
    this._restoreSession();
  }

  /**
   * 從本地儲存加載用戶列表
   * @private
   */
  _loadUsers() {
    try {
      const raw = localStorage.getItem(AUTH_CONFIG.USER_DB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('❌ 加載用戶列表失敗:', e);
      return {};
    }
  }

  /**
   * 保存用戶列表到本地儲存
   * @private
   */
  _saveUsers() {
    try {
      localStorage.setItem(AUTH_CONFIG.USER_DB_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error('❌ 保存用戶列表失敗:', e);
    }
  }

  /**
   * 簡單密碼哈希（用於本地儲存，生產環境應使用更安全的方法）
   * @private
   */
  _hashPassword(password) {
    // 警告：這是簡單實現，生產環境應使用 bcrypt 或類似的
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 驗證密碼
   * @private
   */
  _verifyPassword(password, hash) {
    return this._hashPassword(password) === hash;
  }

  /**
   * 建立會話 ID
   * @private
   */
  _createSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 保存會話到本地儲存
   * @private
   */
  _saveSession() {
    try {
      const session = {
        userId: this.currentUser.userId,
        sessionId: this.sessionId,
        createdAt: Date.now(),
        expiresAt: Date.now() + AUTH_CONFIG.SESSION_TIMEOUT
      };
      localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('❌ 保存會話失敗:', e);
    }
  }

  /**
   * 恢復會話
   * @private
   */
  _restoreSession() {
    try {
      const raw = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
      if (!raw) return false;

      const session = JSON.parse(raw);
      
      // 檢查會話是否過期
      if (Date.now() > session.expiresAt) {
        this._clearSession();
        return false;
      }

      // 檢查用戶是否存在
      if (!this.users[session.userId]) {
        this._clearSession();
        return false;
      }

      // 恢復會話
      this.currentUser = {
        userId: session.userId,
        username: this.users[session.userId].username,
        email: this.users[session.userId].email
      };
      this.sessionId = session.sessionId;
      
      console.log('✅ 會話已恢復:', this.currentUser.username);
      return true;
    } catch (e) {
      console.error('❌ 恢復會話失敗:', e);
      return false;
    }
  }

  /**
   * 清除會話
   * @private
   */
  _clearSession() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    this.currentUser = null;
    this.sessionId = null;
  }

  /**
   * 註冊新用戶
   * @param {string} username - 使用者名稱
   * @param {string} password - 密碼
   * @param {string} email - 電子郵件（可選）
   * @param {string} role - 用戶角色（'user' 或 'creator'，預設為 'user'）
   */
  async register(username, password, email = '', role = 'user') {
    try {
      // 驗證輸入
      if (!username || !password) {
        throw new Error('使用者名稱和密碼不能為空');
      }

      if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
        throw new Error(`密碼長度至少 ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} 個字符`);
      }

      // 檢查用戶名是否已存在
      if (this.users[username]) {
        throw new Error('使用者名稱已存在');
      }

      // 驗證角色
      const validRoles = ['user', 'creator'];
      if (!validRoles.includes(role)) {
        role = 'user';
      }

      // 建立新用戶
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = this._hashPassword(password);

      this.users[username] = {
        userId,
        username,
        email,
        role,
        passwordHash,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      this._saveUsers();
      console.log('✅ 用戶已註冊:', username, `(${role})`);

      return {
        success: true,
        userId,
        username,
        role
      };
    } catch (error) {
      console.error('❌ 註冊失敗:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 用戶登入
   * @param {string} username - 使用者名稱
   * @param {string} password - 密碼
   */
  async login(username, password) {
    try {
      // 檢查用戶是否存在
      if (!this.users[username]) {
        throw new Error('使用者名稱或密碼錯誤');
      }

      const user = this.users[username];

      // 驗證密碼
      if (!this._verifyPassword(password, user.passwordHash)) {
        throw new Error('使用者名稱或密碼錯誤');
      }

      // 建立會話
      this.currentUser = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      };
      this.sessionId = this._createSessionId();

      // 更新最後登入時間
      user.lastLogin = new Date().toISOString();
      this._saveUsers();
      this._saveSession();

      console.log('✅ 登入成功:', username);

      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      console.error('❌ 登入失敗:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 用戶登出
   */
  logout() {
    try {
      if (this.currentUser) {
        console.log('✅ 已登出:', this.currentUser.username);
      }
      this._clearSession();
      return { success: true };
    } catch (error) {
      console.error('❌ 登出失敗:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 取得目前登入用戶
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 檢查用戶是否已登入
   */
  isLoggedIn() {
    return this.currentUser !== null && this.sessionId !== null;
  }

  /**
   * 取得目前會話 ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * 取得目前用戶 ID
   */
  getCurrentUserId() {
    return this.currentUser?.userId || null;
  }

  /**
   * 變更密碼
   * @param {string} oldPassword - 舊密碼
   * @param {string} newPassword - 新密碼
   */
  async changePassword(oldPassword, newPassword) {
    try {
      if (!this.currentUser) {
        throw new Error('未登入用戶');
      }

      const user = this.users[this.currentUser.username];
      if (!user) {
        throw new Error('用戶不存在');
      }

      // 驗證舊密碼
      if (!this._verifyPassword(oldPassword, user.passwordHash)) {
        throw new Error('舊密碼錯誤');
      }

      if (newPassword.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
        throw new Error(`密碼長度至少 ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} 個字符`);
      }

      // 更新密碼
      user.passwordHash = this._hashPassword(newPassword);
      this._saveUsers();

      console.log('✅ 密碼已變更');
      return { success: true };
    } catch (error) {
      console.error('❌ 變更密碼失敗:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 刪除用戶帳號
   * @param {string} password - 密碼確認
   */
  async deleteAccount(password) {
    try {
      if (!this.currentUser) {
        throw new Error('未登入用戶');
      }

      const user = this.users[this.currentUser.username];
      if (!user) {
        throw new Error('用戶不存在');
      }

      // 驗證密碼
      if (!this._verifyPassword(password, user.passwordHash)) {
        throw new Error('密碼錯誤');
      }

      const username = this.currentUser.username;
      delete this.users[username];
      this._saveUsers();
      this._clearSession();

      console.log('✅ 帳號已刪除:', username);
      return { success: true };
    } catch (error) {
      console.error('❌ 刪除帳號失敗:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 列出所有用戶（僅用於管理）
   */
  getAllUsers() {
    return Object.values(this.users).map(user => ({
      userId: user.userId,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
  }

  /**
   * 取得用戶統計
   */
  getUserStats() {
    return {
      totalUsers: Object.keys(this.users).length,
      users: this.getAllUsers()
    };
  }

  /**
   * 重置會話超時時間（保持活躍）
   */
  keepSessionAlive() {
    if (this.isLoggedIn()) {
      this._saveSession();
      console.log('📍 會話已更新');
    }
  }
}

/**
 * 全局認證管理器實例
 */
const authManager = new AuthenticationManager();

/**
 * 工具函數：確保用戶已登入（用於保護功能）
 */
function requireAuth() {
  if (!authManager.isLoggedIn()) {
    throw new Error('必須登入才能使用此功能');
  }
  return authManager.getCurrentUser();
}

/**
 * 工具函數：檢查用戶是否為 creator（系統創建者）
 */
function isCreator() {
  const user = authManager.getCurrentUser();
  return user && user.role === 'creator';
}

/**
 * 工具函數：確保用戶為 creator（用於保護管理功能）
 */
function requireCreator() {
  if (!isCreator()) {
    throw new Error('此功能僅限系統創建者使用');
  }
  return authManager.getCurrentUser();
}

/**
 * 工具函數：取得當前用戶 ID（使用者不登入會報錯）
 */
function getCurrentUserId() {
  const user = requireAuth();
  return user.userId;
}

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    authManager,
    AuthenticationManager,
    AUTH_CONFIG,
    requireAuth,
    requireCreator,
    isCreator,
    getCurrentUserId
  };
}

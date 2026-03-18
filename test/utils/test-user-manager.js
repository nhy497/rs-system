/**
 * 測試用戶管理工具
 * 提供測試用戶的創建、管理和認證功能
 */

import { testDatabase } from './test-database.js';

/**
 * 測試用戶管理器
 */
export class TestUserManager {
  constructor() {
    this.currentUser = null;
    this.sessionToken = null;
    this.testUsers = new Map();
    this.isTestMode = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true';
  }

  /**
   * 初始化測試用戶
   */
  async initialize() {
    if (!this.isTestMode) {
      console.warn('警告: 非測試環境下不建議使用測試用戶管理器');
      return;
    }

    try {
      // 初始化用戶數據庫
      await testDatabase.initDatabase('users');

      // 創建測試用戶
      const users = testDatabase.createTestUsers();
      await testDatabase.createTestData('users', users);

      // 將用戶存儲到內存中
      users.forEach(user => {
        this.testUsers.set(user.username, user);
      });

      console.log(`✅ 初始化 ${users.length} 個測試用戶`);
    } catch (error) {
      console.error('❌ 初始化測試用戶失敗:', error);
      throw error;
    }
  }

  /**
   * 創建測試用戶
   * @param {Object} userData - 用戶數據
   * @returns {Object} 創建的用戶
   */
  async createUser(userData) {
    const user = {
      id: userData.id || this.generateUserId(),
      username: userData.username,
      email: userData.email,
      password: userData.password || 'test-password',
      role: userData.role || 'user',
      displayName: userData.displayName || userData.username,
      isActive: userData.isActive !== false,
      permissions: userData.permissions || ['read'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    };

    try {
      await testDatabase.createTestData('users', [user]);
      this.testUsers.set(user.username, user);

      console.log(`✅ 創建測試用戶: ${user.username}`);
      return user;
    } catch (error) {
      console.error('❌ 創建測試用戶失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取測試用戶
   * @param {string} username - 用戶名
   * @returns {Object|null} 用戶數據
   */
  getUser(username) {
    return this.testUsers.get(username) || null;
  }

  /**
   * 獲取所有測試用戶
   * @returns {Array} 用戶列表
   */
  getAllUsers() {
    return Array.from(this.testUsers.values());
  }

  /**
   * 根據角色獲取用戶
   * @param {string} role - 用戶角色
   * @returns {Array} 用戶列表
   */
  getUsersByRole(role) {
    return this.getAllUsers().filter(user => user.role === role);
  }

  /**
   * 模擬用戶登入
   * @param {string} username - 用戶名
   * @param {string} password - 密碼
   * @returns {Object} 登入結果
   */
  async login(username, password) {
    const user = this.getUser(username);

    if (!user) {
      return {
        success: false,
        error: '用戶不存在',
        code: 'USER_NOT_FOUND'
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: '用戶已被禁用',
        code: 'USER_DISABLED'
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: '密碼錯誤',
        code: 'INVALID_PASSWORD'
      };
    }

    // 生成會話令牌
    this.sessionToken = this.generateToken();
    this.currentUser = { ...user };

    // 移除密碼字段
    delete this.currentUser.password;

    const loginResult = {
      success: true,
      user: this.currentUser,
      token: this.sessionToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1小時後過期
      permissions: user.permissions
    };

    console.log(`✅ 用戶 ${username} 登入成功`);
    return loginResult;
  }

  /**
   * 模擬用戶登出
   * @returns {Object} 登出結果
   */
  logout() {
    const username = this.currentUser?.username;

    this.currentUser = null;
    this.sessionToken = null;

    console.log(`✅ 用戶 ${username} 登出成功`);
    return {
      success: true,
      message: '登出成功'
    };
  }

  /**
   * 獲取當前用戶
   * @returns {Object|null} 當前用戶
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 檢查用戶是否已登入
   * @returns {boolean} 是否已登入
   */
  isLoggedIn() {
    return this.currentUser !== null && this.sessionToken !== null;
  }

  /**
   * 檢查用戶權限
   * @param {string} permission - 權限名稱
   * @returns {boolean} 是否有權限
   */
  hasPermission(permission) {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * 檢查用戶角色
   * @param {string} role - 角色名稱
   * @returns {boolean} 是否是該角色
   */
  hasRole(role) {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  /**
   * 更新用戶信息
   * @param {string} username - 用戶名
   * @param {Object} updates - 更新數據
   * @returns {Object} 更新結果
   */
  async updateUser(username, updates) {
    const user = this.getUser(username);

    if (!user) {
      return {
        success: false,
        error: '用戶不存在',
        code: 'USER_NOT_FOUND'
      };
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    try {
      // 更新數據庫
      const db = testDatabase.getDatabase('users');
      await db.put(updatedUser);

      // 更新內存
      this.testUsers.set(username, updatedUser);

      // 如果是當前用戶，也更新當前用戶信息
      if (this.currentUser && this.currentUser.username === username) {
        this.currentUser = { ...updatedUser };
        delete this.currentUser.password;
      }

      console.log(`✅ 更新用戶 ${username} 成功`);
      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      console.error('❌ 更新用戶失敗:', error);
      return {
        success: false,
        error: '更新失敗',
        code: 'UPDATE_FAILED'
      };
    }
  }

  /**
   * 刪除用戶
   * @param {string} username - 用戶名
   * @returns {Object} 刪除結果
   */
  async deleteUser(username) {
    const user = this.getUser(username);

    if (!user) {
      return {
        success: false,
        error: '用戶不存在',
        code: 'USER_NOT_FOUND'
      };
    }

    try {
      // 從數據庫刪除
      const db = testDatabase.getDatabase('users');
      await db.remove(user);

      // 從內存刪除
      this.testUsers.delete(username);

      // 如果是當前用戶，登出
      if (this.currentUser && this.currentUser.username === username) {
        this.logout();
      }

      console.log(`✅ 刪除用戶 ${username} 成功`);
      return {
        success: true,
        message: '用戶刪除成功'
      };
    } catch (error) {
      console.error('❌ 刪除用戶失敗:', error);
      return {
        success: false,
        error: '刪除失敗',
        code: 'DELETE_FAILED'
      };
    }
  }

  /**
   * 生成用戶 ID
   * @returns {string} 用戶 ID
   */
  generateUserId() {
    return `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成會話令牌
   * @returns {string} 會話令牌
   */
  generateToken() {
    return `test_token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * 驗證會話令牌
   * @param {string} token - 會話令牌
   * @returns {boolean} 是否有效
   */
  validateToken(token) {
    return this.sessionToken === token;
  }

  /**
   * 獲取用戶統計信息
   * @returns {Object} 統計信息
   */
  getStats() {
    const users = this.getAllUsers();
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      usersByRole: {},
      usersByPermission: {}
    };

    // 按角色統計
    users.forEach(user => {
      stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;

      user.permissions.forEach(permission => {
        stats.usersByPermission[permission] = (stats.usersByPermission[permission] || 0) + 1;
      });
    });

    return stats;
  }

  /**
   * 重置所有測試用戶
   */
  async reset() {
    try {
      await testDatabase.clearDatabase('users');
      this.testUsers.clear();
      this.currentUser = null;
      this.sessionToken = null;

      console.log('✅ 重置所有測試用戶完成');
    } catch (error) {
      console.error('❌ 重置測試用戶失敗:', error);
      throw error;
    }
  }

  /**
   * 清理測試環境
   */
  async cleanup() {
    await this.reset();
    await testDatabase.deleteDatabase('users');
    console.log('✅ 測試用戶管理器清理完成');
  }
}

// 導出單例實例
export const testUserManager = new TestUserManager();

// 導出測試用戶工廠
export const TestUserFactory = {
  /**
   * 創建管理員用戶
   * @param {Object} options - 選項
   * @returns {Object} 管理員用戶
   */
  createAdmin: (options = {}) => ({
    id: `test_admin_${Date.now()}`,
    username: options.username || 'test-admin',
    email: options.email || 'admin@test.com',
    password: options.password || 'test-password',
    role: 'admin',
    displayName: options.displayName || '測試管理員',
    permissions: ['read', 'write', 'delete', 'admin'],
    isActive: true,
    ...options
  }),

  /**
   * 創建教練用戶
   * @param {Object} options - 選項
   * @returns {Object} 教練用戶
   */
  createCoach: (options = {}) => ({
    id: `test_coach_${Date.now()}`,
    username: options.username || 'test-coach',
    email: options.email || 'coach@test.com',
    password: options.password || 'test-password',
    role: 'coach',
    displayName: options.displayName || '測試教練',
    permissions: ['read', 'write'],
    isActive: true,
    ...options
  }),

  /**
   * 創建普通用戶
   * @param {Object} options - 選項
   * @returns {Object} 普通用戶
   */
  createUser: (options = {}) => ({
    id: `test_user_${Date.now()}`,
    username: options.username || 'test-user',
    email: options.email || 'user@test.com',
    password: options.password || 'test-password',
    role: 'user',
    displayName: options.displayName || '測試用戶',
    permissions: ['read'],
    isActive: true,
    ...options
  }),

  /**
   * 創建訪客用戶
   * @param {Object} options - 選項
   * @returns {Object} 訪客用戶
   */
  createGuest: (options = {}) => ({
    id: `test_guest_${Date.now()}`,
    username: options.username || 'test-guest',
    email: options.email || 'guest@test.com',
    password: options.password || 'test-password',
    role: 'guest',
    displayName: options.displayName || '測試訪客',
    permissions: ['read'],
    isActive: true,
    ...options
  })
};

// 導出測試用戶工具函數
export const TestUserUtils = {
  /**
   * 快速登入指定角色用戶
   * @param {string} role - 用戶角色
   * @returns {Object} 登入結果
   */
  quickLogin: async (role = 'user') => {
    const credentials = testUserManager.getUsersByRole(role)[0];
    if (!credentials) {
      throw new Error(`找不到角色為 ${role} 的測試用戶`);
    }

    return await testUserManager.login(credentials.username, credentials.password);
  },

  /**
   * 創建多個測試用戶
   * @param {number} count - 用戶數量
   * @param {string} role - 用戶角色
   * @returns {Array} 創建的用戶列表
   */
  createMultipleUsers: async (count, role = 'user') => {
    const users = [];
    for (let i = 1; i <= count; i++) {
      const userData = TestUserFactory[`create${role.charAt(0).toUpperCase() + role.slice(1)}`]({
        username: `${role}-test-${i}`,
        email: `${role}-test-${i}@test.com`,
        displayName: `測試${role}${i}`
      });

      const user = await testUserManager.createUser(userData);
      users.push(user);
    }

    return users;
  },

  /**
   * 模擬會話過期
   */
  simulateSessionExpiry: () => {
    testUserManager.sessionToken = null;
    testUserManager.currentUser = null;
  },

  /**
   * 驗證用戶權限
   * @param {string} username - 用戶名
   * @param {string} permission - 權限
   * @returns {boolean} 是否有權限
   */
  checkPermission: (username, permission) => {
    const user = testUserManager.getUser(username);
    return user ? user.permissions.includes(permission) : false;
  }
};

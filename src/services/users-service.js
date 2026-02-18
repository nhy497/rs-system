/**
 * 用戶服務 - 用戶數據管理
 * @module services/users-service
 */

import { 
  loadUsersFromStorage, 
  saveUsersToStorage, 
  hashPasswordCompat 
} from '../core/auth-config.js';

/**
 * 用戶服務對象
 * 提供用戶 CRUD 操作和權限管理
 */
export const UsersService = {
  /**
   * 獲取所有用戶
   * @returns {Array} 用戶數組
   */
  getAllUsers() {
    return loadUsersFromStorage();
  },

  /**
   * 根據用戶名獲取用戶
   * @param {string} username - 用戶名
   * @returns {Object|null} 用戶對象或 null
   */
  getUser(username) {
    const users = loadUsersFromStorage();
    return users.find(u => u.username === username) || null;
  },

  /**
   * 創建新用戶
   * @param {Object} userData - 用戶數據
   * @param {string} userData.username - 用戶名
   * @param {string} userData.password - 密碼
   * @param {string} [userData.email] - 郵箱
   * @param {string} [userData.role='user'] - 角色
   * @returns {Object} 創建結果對象
   */
  createUser(userData) {
    try {
      if (!userData.username || !userData.password) {
        throw new Error('用戶名和密碼不能為空');
      }

      const users = loadUsersFromStorage();
      
      // 檢查用戶名是否已存在
      if (users.find(u => u.username === userData.username)) {
        throw new Error('用戶名已存在');
      }

      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: userData.username,
        email: userData.email || '',
        role: userData.role || 'user',
        passwordHash: hashPasswordCompat(userData.password),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsersToStorage(users);
      
      console.log(`✅ 用戶 ${userData.username} 創建成功`);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('❌ 創建用戶失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 更新用戶信息
   * @param {string} username - 用戶名
   * @param {Object} userData - 更新數據
   * @returns {Object} 更新結果對象
   */
  updateUser(username, userData) {
    try {
      const users = loadUsersFromStorage();
      const userIndex = users.findIndex(u => u.username === username);
      
      if (userIndex === -1) {
        throw new Error('用戶不存在');
      }

      const updatedUser = {
        ...users[userIndex],
        ...userData,
        username: users[userIndex].username, // 保持用戶名不變
        id: users[userIndex].id, // 保持 ID 不變
        updatedAt: new Date().toISOString()
      };

      // 如果更新了密碼，重新雜湊
      if (userData.password) {
        updatedUser.passwordHash = hashPasswordCompat(userData.password);
        delete updatedUser.password;
      }

      users[userIndex] = updatedUser;
      saveUsersToStorage(users);
      
      console.log(`✅ 用戶 ${username} 更新成功`);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('❌ 更新用戶失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 刪除用戶
   * @param {string} username - 用戶名
   * @returns {Object} 刪除結果對象
   */
  deleteUser(username) {
    try {
      // 不允許刪除 creator 帳號
      if (username.toLowerCase() === 'creator') {
        throw new Error('不能刪除 creator 帳號');
      }

      const users = loadUsersFromStorage();
      const userIndex = users.findIndex(u => u.username === username);
      
      if (userIndex === -1) {
        throw new Error('用戶不存在');
      }

      users.splice(userIndex, 1);
      saveUsersToStorage(users);
      
      console.log(`✅ 用戶 ${username} 刪除成功`);
      return { success: true };
    } catch (error) {
      console.error('❌ 刪除用戶失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 獲取用戶權限
   * @param {string} username - 用戶名
   * @returns {string|null} 用戶角色
   */
  getUserPermissions(username) {
    const user = this.getUser(username);
    return user ? user.role : null;
  },

  /**
   * 設置用戶權限
   * @param {string} username - 用戶名
   * @param {string} role - 角色
   * @returns {Object} 設置結果對象
   */
  setUserPermissions(username, role) {
    return this.updateUser(username, { role });
  }
};

/**
 * 用戶顯示管理器
 * 負責更新用戶界面上的用戶信息顯示
 * @module UserDisplayManager
 */

import { $ } from '../utils/dom-utils.js';
import { LOGIN_MANAGER } from '../core/login-manager.js';

/**
 * 用戶顯示管理器類
 */
class UserDisplayManager {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
  }

  /**
   * 初始化用戶顯示管理器
   */
  init() {
    if (this.isInitialized) return;

    // 監聽登入狀態變化
    this.setupLoginStateListener();
    
    // 初始更新顯示
    this.updateUserDisplay();
    
    this.isInitialized = true;
    console.log('✅ UserDisplayManager 初始化完成');
  }

  /**
   * 設置登入狀態監聽器
   */
  setupLoginStateListener() {
    // 監聽登入狀態變化事件
    document.addEventListener('userLoginStateChanged', (event) => {
      const { user, isLoggedIn } = event.detail;
      this.handleLoginStateChange(user, isLoggedIn);
    });

    // 監聽頁面可見性變化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateUserDisplay();
      }
    });

    // 監聽存儲變化
    window.addEventListener('storage', (event) => {
      if (event.key === 'rs_system_session') {
        this.updateUserDisplay();
      }
    });
  }

  /**
   * 處理登入狀態變化
   * @param {Object} user - 用戶對象
   * @param {boolean} isLoggedIn - 是否已登入
   */
  handleLoginStateChange(user, isLoggedIn) {
    this.currentUser = user;
    
    if (isLoggedIn && user) {
      this.updateSidebarUser(user);
      this.updateTopBarUser(user);
    } else {
      this.clearUserDisplay();
    }
  }

  /**
   * 更新用戶顯示
   */
  updateUserDisplay() {
    try {
      // 獲取當前登入用戶
      const currentUser = this.getCurrentUser();
      
      if (currentUser) {
        this.updateSidebarUser(currentUser);
        this.updateTopBarUser(currentUser);
      } else {
        this.clearUserDisplay();
      }
    } catch (error) {
      console.error('❌ 更新用戶顯示失敗:', error);
      this.clearUserDisplay();
    }
  }

  /**
   * 獲取當前用戶
   * @returns {Object|null} 當前用戶對象
   */
  getCurrentUser() {
    try {
      // 優先使用 LOGIN_MANAGER
      if (typeof LOGIN_MANAGER !== 'undefined' && LOGIN_MANAGER.getCurrentUser) {
        return LOGIN_MANAGER.getCurrentUser();
      }

      // 從 sessionStorage 獲取
      const sessionData = sessionStorage.getItem('rs_system_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.user && session.isLoggedIn) {
          return session.user;
        }
      }

      // 從 localStorage 獲取
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        return JSON.parse(userData);
      }

      return null;
    } catch (error) {
      console.error('❌ 獲取當前用戶失敗:', error);
      return null;
    }
  }

  /**
   * 更新側邊欄用戶信息
   * @param {Object} user - 用戶對象
   */
  updateSidebarUser(user) {
    const userNameEl = $('sidebarUserName');
    const userRoleEl = $('sidebarUserRole');
    
    if (userNameEl) {
      userNameEl.textContent = user.username || user.displayName || '未知用戶';
    }
    
    if (userRoleEl) {
      const role = user.role || 'user';
      const roleText = this.getRoleDisplayName(role);
      userRoleEl.textContent = roleText;
    }

    // 更新用戶頭像
    this.updateUserAvatar(user);
  }

  /**
   * 更新頂部欄用戶信息
   * @param {Object} user - 用戶對象
   */
  updateTopBarUser(user) {
    const topBarTitle = $('topbarTitle');
    
    if (topBarTitle) {
      const userName = user.username || user.displayName || '未知用戶';
      topBarTitle.textContent = `${userName} · 教練記錄系統`;
    }
  }

  /**
   * 更新用戶頭像
   * @param {Object} user - 用戶對象
   */
  updateUserAvatar(user) {
    const avatarEl = $('.user-avatar');
    
    if (avatarEl) {
      // 如果有用戶頭像 URL
      if (user.avatar) {
        avatarEl.innerHTML = `<img src="${user.avatar}" alt="用戶頭像" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      } else {
        // 使用預設頭像或用戶名首字母
        const firstLetter = (user.username || user.displayName || 'U').charAt(0).toUpperCase();
        avatarEl.textContent = firstLetter;
      }
    }
  }

  /**
   * 清除用戶顯示
   */
  clearUserDisplay() {
    const userNameEl = $('sidebarUserName');
    const userRoleEl = $('sidebarUserRole');
    const topBarTitle = $('topbarTitle');
    const avatarEl = $('.user-avatar');
    
    if (userNameEl) userNameEl.textContent = '未登錄';
    if (userRoleEl) userRoleEl.textContent = '訪客';
    if (topBarTitle) topBarTitle.textContent = '教練記錄系統';
    if (avatarEl) avatarEl.textContent = '👤';
    
    this.currentUser = null;
  }

  /**
   * 獲取角色顯示名稱
   * @param {string} role - 角色代碼
   * @returns {string} 角色顯示名稱
   */
  getRoleDisplayName(role) {
    const roleNames = {
      'admin': '管理員',
      'coach': '教練',
      'user': '用戶',
      'guest': '訪客'
    };
    
    return roleNames[role] || '用戶';
  }

  /**
   * 手動刷新用戶顯示
   */
  refresh() {
    this.updateUserDisplay();
  }

  /**
   * 檢查用戶顯狀態
   * @returns {Object} 用戶顯示狀態
   */
  getUserDisplayStatus() {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser,
      hasSidebarUser: !!$('sidebarUserName'),
      hasTopBarTitle: !!$('topbarTitle'),
      hasUserRole: !!$('sidebarUserRole')
    };
  }
}

// 創建單例實例
const userDisplayManager = new UserDisplayManager();

// 自動初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      userDisplayManager.init();
    });
  } else {
    userDisplayManager.init();
  }
}

// 導出實例
export default userDisplayManager;
export { UserDisplayManager };

/**
 * 用戶顯示管理器
 * @module UserDisplayManager
 */

import { $ } from '../utils/dom-utils.js';
import { LOGIN_MANAGER } from '../core/login-manager.js';

class UserDisplayManager {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
  }

  init() {
    if (this.isInitialized) return;
    this.setupLoginStateListener();
    this.updateUserDisplay();
    this.isInitialized = true;
  }

  setupLoginStateListener() {
    document.addEventListener('userLoginStateChanged', event => {
      const { user, isLoggedIn } = event.detail;
      this.handleLoginStateChange(user, isLoggedIn);
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.updateUserDisplay();
    });
    window.addEventListener('storage', event => {
      if (event.key === 'rs-system-session' || event.key === 'current-user') this.updateUserDisplay();
    });
  }

  handleLoginStateChange(user, isLoggedIn) {
    this.currentUser = user;
    if (isLoggedIn && user) {
      this.updateSidebarUser(user);
      this.updateTopBarUser(user);
    } else {
      this.clearUserDisplay();
    }
  }

  updateUserDisplay() {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.updateSidebarUser(currentUser);
        this.updateTopBarUser(currentUser);
      } else {
        this.clearUserDisplay();
      }
    } catch (error) {
      this.clearUserDisplay();
    }
  }

  getCurrentUser() {
    try {
      if (typeof LOGIN_MANAGER !== 'undefined' && LOGIN_MANAGER.getCurrentUser) {
        return LOGIN_MANAGER.getCurrentUser();
      }
      const sessionData = sessionStorage.getItem('rs_system_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.user && session.isLoggedIn) return session.user;
      }
      const userData = localStorage.getItem('currentUser');
      if (userData) return JSON.parse(userData);
      return null;
    } catch { return null; }
  }

  updateSidebarUser(user) {
    const userNameEl = $('sidebarUserName');
    const userRoleEl = $('sidebarUserRole');
    if (userNameEl) userNameEl.textContent = user.username || user.displayName || '未知用戶';
    if (userRoleEl) userRoleEl.textContent = this.getRoleDisplayName(user.role || 'user');
    this.updateUserAvatar(user);
  }

  updateTopBarUser(user) {
    // 保持頁面標題不變
  }

  updateUserAvatar(user) {
    const avatarEl = document.querySelector('.user-avatar');
    if (!avatarEl) return;
    if (user && user.avatar) {
      avatarEl.innerHTML = `<img src="${user.avatar}" alt="用戶頭像" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else if (user) {
      const firstLetter = (user.username || user.displayName || 'U').charAt(0).toUpperCase();
      avatarEl.innerHTML = '';
      avatarEl.textContent = firstLetter;
    } else {
      avatarEl.innerHTML = '';
      avatarEl.textContent = '👤';
    }
  }

  clearUserDisplay() {
    const userNameEl = $('sidebarUserName');
    const userRoleEl = $('sidebarUserRole');
    const topBarTitle = $('topbarTitle');
    const avatarEl = document.querySelector('.user-avatar');
    if (userNameEl) userNameEl.textContent = '未登錄';
    if (userRoleEl) userRoleEl.textContent = '訪客';
    if (topBarTitle) topBarTitle.textContent = '教練記錄系統';
    if (avatarEl) { avatarEl.innerHTML = ''; avatarEl.textContent = '👤'; }
    this.currentUser = null;
  }

  getRoleDisplayName(role) {
    const roleNames = { admin: '管理員', coach: '教練', user: '用戶', guest: '訪客' };
    return roleNames[role] || '用戶';
  }

  refresh() { this.updateUserDisplay(); }

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

const userDisplayManager = new UserDisplayManager();

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => userDisplayManager.init());
  } else {
    userDisplayManager.init();
  }
}

export default userDisplayManager;
export { UserDisplayManager };

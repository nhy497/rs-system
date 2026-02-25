import { describe, it, expect, beforeEach, vi } from 'vitest';
import userDisplayManager from '../../src/ui/user-display-manager.js';

describe('UserDisplayManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    
    // 設置測試 DOM 結構
    document.body.innerHTML = `
      <div id="sidebarUserName"></div>
      <div id="sidebarUserRole"></div>
      <div id="topbarTitle">課堂概覽</div>
      <div class="user-avatar"></div>
    `;
  });

  describe('用戶顯示功能', () => {
    it('應該正確顯示用戶名稱在側邊欄', () => {
      const testUser = {
        id: 'test-1',
        username: 'test-user',
        displayName: '測試用戶',
        role: 'coach'
      };

      userDisplayManager.updateSidebarUser(testUser);

      const userNameEl = document.getElementById('sidebarUserName');
      expect(userNameEl.textContent).toBe('test-user');
    });

    it('應該正確顯示用戶角色', () => {
      const testUser = {
        id: 'test-1',
        username: 'test-user',
        role: 'coach'
      };

      userDisplayManager.updateSidebarUser(testUser);

      const userRoleEl = document.getElementById('sidebarUserRole');
      expect(userRoleEl.textContent).toBe('教練');
    });

    it('應該使用 displayName 當 username 不存在時', () => {
      const testUser = {
        id: 'test-1',
        displayName: '測試用戶',
        role: 'user'
      };

      userDisplayManager.updateSidebarUser(testUser);

      const userNameEl = document.getElementById('sidebarUserName');
      expect(userNameEl.textContent).toBe('測試用戶');
    });

    it('應該顯示未知用戶當沒有用戶名稱時', () => {
      const testUser = {
        id: 'test-1',
        role: 'user'
      };

      userDisplayManager.updateSidebarUser(testUser);

      const userNameEl = document.getElementById('sidebarUserName');
      expect(userNameEl.textContent).toBe('未知用戶');
    });

    it('應該不修改頂部欄標題', () => {
      const testUser = {
        id: 'test-1',
        username: 'test-user',
        role: 'coach'
      };

      const topBarTitle = document.getElementById('topbarTitle');
      const originalTitle = topBarTitle.textContent;

      userDisplayManager.updateTopBarUser(testUser);

      // 頂部欄標題應該保持不變
      expect(topBarTitle.textContent).toBe(originalTitle);
    });

    it('應該正確更新用戶頭像', () => {
      const testUser = {
        id: 'test-1',
        username: 'test-user',
        avatar: 'https://example.com/avatar.jpg'
      };

      userDisplayManager.updateUserAvatar(testUser);

      const avatarEl = document.querySelector('.user-avatar');
      expect(avatarEl.innerHTML).toContain('img');
      expect(avatarEl.innerHTML).toContain('https://example.com/avatar.jpg');
    });

    it('應該使用用戶名首字母作為頭像', () => {
      const testUser = {
        id: 'test-1',
        username: 'test-user'
      };

      userDisplayManager.updateUserAvatar(testUser);

      const avatarEl = document.querySelector('.user-avatar');
      expect(avatarEl.textContent).toBe('T');
    });

    it('應該正確清除用戶顯示', () => {
      // 先設置用戶
      const testUser = {
        id: 'test-1',
        username: 'test-user',
        role: 'coach'
      };
      userDisplayManager.updateSidebarUser(testUser);

      // 清除用戶顯示
      userDisplayManager.clearUserDisplay();

      const userNameEl = document.getElementById('sidebarUserName');
      const userRoleEl = document.getElementById('sidebarUserRole');
      const topBarTitle = document.getElementById('topbarTitle');
      const avatarEl = document.querySelector('.user-avatar');

      expect(userNameEl.textContent).toBe('未登錄');
      expect(userRoleEl.textContent).toBe('訪客');
      expect(topBarTitle.textContent).toBe('教練記錄系統');
      expect(avatarEl.textContent).toBe('👤');
    });
  });

  describe('角色顯示名稱', () => {
    it('應該正確映射角色名稱', () => {
      expect(userDisplayManager.getRoleDisplayName('admin')).toBe('管理員');
      expect(userDisplayManager.getRoleDisplayName('coach')).toBe('教練');
      expect(userDisplayManager.getRoleDisplayName('user')).toBe('用戶');
      expect(userDisplayManager.getRoleDisplayName('guest')).toBe('訪客');
    });

    it('應該返回默認角色名稱', () => {
      expect(userDisplayManager.getRoleDisplayName('unknown')).toBe('用戶');
      expect(userDisplayManager.getRoleDisplayName('')).toBe('用戶');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理不存在的元素', () => {
      // 清除所有測試元素
      document.body.innerHTML = '';

      const testUser = {
        id: 'test-1',
        username: 'test-user',
        role: 'coach'
      };

      // 不應該拋出錯誤
      expect(() => {
        userDisplayManager.updateSidebarUser(testUser);
        userDisplayManager.updateTopBarUser(testUser);
        userDisplayManager.updateUserAvatar(testUser);
        userDisplayManager.clearUserDisplay();
      }).not.toThrow();
    });

    it('應該處理 null 用戶', () => {
      expect(() => {
        userDisplayManager.updateSidebarUser(null);
        userDisplayManager.updateTopBarUser(null);
        userDisplayManager.updateUserAvatar(null);
      }).not.toThrow();
    });

    it('應該處理 undefined 用戶', () => {
      expect(() => {
        userDisplayManager.updateSidebarUser(undefined);
        userDisplayManager.updateTopBarUser(undefined);
        userDisplayManager.updateUserAvatar(undefined);
      }).not.toThrow();
    });
  });
});

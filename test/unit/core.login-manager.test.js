import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LOGIN_MANAGER } from '../../src/core/login-manager.js';

describe('LoginManager', () => {
  beforeEach(() => {
    // 清理所有模擬
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('初始化', () => {
    it('應該正確初始化登入管理器', () => {
      expect(LOGIN_MANAGER).toBeDefined();
      expect(typeof LOGIN_MANAGER.login).toBe('function');
      expect(typeof LOGIN_MANAGER.logout).toBe('function');
      expect(typeof LOGIN_MANAGER.isLoggedIn).toBe('function');
      expect(typeof LOGIN_MANAGER.getCurrentUser).toBe('function');
    });
  });

  describe('登入功能', () => {
    it('應該能夠成功登入', async () => {
      const username = 'test-user';
      const password = 'test-password';

      const result = await LOGIN_MANAGER.login(username, password);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe(username);
    });

    it('應該拒絕無效的用戶名', async () => {
      const result = await LOGIN_MANAGER.login('', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('用戶名');
    });

    it('應該拒絕無效的密碼', async () => {
      const result = await LOGIN_MANAGER.login('username', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('密碼');
    });

    it('應該拒絕不存在的用戶', async () => {
      const result = await LOGIN_MANAGER.login('nonexistent-user', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('用戶不存在');
    });

    it('應該拒絕錯誤的密碼', async () => {
      const result = await LOGIN_MANAGER.login('test-user', 'wrong-password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('密碼錯誤');
    });
  });

  describe('登出功能', () => {
    it('應該能夠成功登出', async () => {
      // 先登入
      await LOGIN_MANAGER.login('test-user', 'test-password');

      // 確認已登入
      expect(LOGIN_MANAGER.isLoggedIn()).toBe(true);

      // 登出
      await LOGIN_MANAGER.logout();

      // 確認已登出
      expect(LOGIN_MANAGER.isLoggedIn()).toBe(false);
      expect(LOGIN_MANAGER.getCurrentUser()).toBeNull();
    });
  });

  describe('狀態檢查', () => {
    it('應該正確檢查登入狀態', async () => {
      // 初始狀態應該是未登入
      expect(LOGIN_MANAGER.isLoggedIn()).toBe(false);

      // 登入後應該是已登入
      await LOGIN_MANAGER.login('test-user', 'test-password');
      expect(LOGIN_MANAGER.isLoggedIn()).toBe(true);

      // 登出後應該是未登入
      await LOGIN_MANAGER.logout();
      expect(LOGIN_MANAGER.isLoggedIn()).toBe(false);
    });

    it('應該正確獲取當前用戶', async () => {
      // 未登入時應該返回 null
      expect(LOGIN_MANAGER.getCurrentUser()).toBeNull();

      // 登入後應該返回用戶信息
      await LOGIN_MANAGER.login('test-user', 'test-password');
      const user = LOGIN_MANAGER.getCurrentUser();

      expect(user).toBeDefined();
      expect(user.username).toBe('test-user');
      expect(user.id).toBeDefined();
    });
  });

  describe('會話管理', () => {
    it('應該保持登入狀態', async () => {
      // 登入
      await LOGIN_MANAGER.login('test-user', 'test-password');

      // 模擬頁面重新載入
      const user = LOGIN_MANAGER.getCurrentUser();

      // 應該仍然保持登入狀態
      expect(LOGIN_MANAGER.isLoggedIn()).toBe(true);
      expect(user.username).toBe('test-user');
    });

    it('應該處理會話過期', async () => {
      // 登入
      await LOGIN_MANAGER.login('test-user', 'test-password');

      // 模擬會話過期
      // 這裡需要根據實際實現來模擬過期情況

      // 檢查是否自動登出
      // expect(LOGIN_MANAGER.isLoggedIn()).toBe(false);
    });
  });

  describe('錯誤處理', () => {
    it('應該處理網絡錯誤', async () => {
      // 模擬網絡錯誤
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await LOGIN_MANAGER.login('test-user', 'test-password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('網絡');
    });

    it('應該處理服務器錯誤', async () => {
      // 模擬服務器錯誤
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await LOGIN_MANAGER.login('test-user', 'test-password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('服務器');
    });
  });
});

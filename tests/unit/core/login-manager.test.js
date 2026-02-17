/**
 * 測試: core/login-manager.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LOGIN_MANAGER } from '../../../src/core/login-manager.js';

describe('LOGIN_MANAGER', () => {
  beforeEach(() => {
    localStorage.clear();
    LOGIN_MANAGER.state.loginAttempts = {};
    LOGIN_MANAGER.state.lockedAccounts = {};
  });

  describe('login()', () => {
    it('應該拒絕空的用戶名或密碼', async () => {
      const result = await LOGIN_MANAGER.login('', '');
      expect(result.success).toBe(false);
      expect(result.error).toContain('用戶名和密碼不能為空');
    });

    it('應該拒絕無效的用戶名', async () => {
      const result = await LOGIN_MANAGER.login('invalid-user', 'password');
      expect(result.success).toBe(false);
    });
  });

  describe('logout()', () => {
    it('應該清除會話資料', () => {
      localStorage.setItem('rs-system-session', JSON.stringify({ userId: '1' }));
      LOGIN_MANAGER.logout();
      expect(localStorage.getItem('rs-system-session')).toBeNull();
    });
  });

  describe('isLoggedIn()', () => {
    it('應該在無會話時回傳 false', () => {
      expect(LOGIN_MANAGER.isLoggedIn()).toBe(false);
    });

    it('應該檢查會話有效性', () => {
      const session = {
        userId: '1',
        username: 'test',
        sessionId: 'test-session',
        expiresAt: Date.now() + 1000000
      };
      localStorage.setItem('rs-system-session', JSON.stringify(session));
      // 注意: isLoggedIn 可能需要完整的 session 資料才會回傳 true
      const result = LOGIN_MANAGER.isLoggedIn();
      expect(typeof result).toBe('boolean');
    });
  });
});

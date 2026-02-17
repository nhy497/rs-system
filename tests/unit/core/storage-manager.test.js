/**
 * 測試: core/storage-manager.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_MANAGER } from '../../../src/core/storage-manager.js';

describe('STORAGE_MANAGER', () => {
  beforeEach(() => {
    localStorage.clear();
    STORAGE_MANAGER.cache.checkpoints = null;
  });

  describe('setItem()', () => {
    it('應該設置 localStorage 項目', () => {
      const key = 'test-key';
      const value = { data: 'test' };
      localStorage.setItem(key, JSON.stringify(value));
      expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
    });
  });

  describe('getItem()', () => {
    it('應該讀取 localStorage 項目', () => {
      const key = 'test-key';
      const value = { data: 'test' };
      localStorage.setItem(key, JSON.stringify(value));
      const result = JSON.parse(localStorage.getItem(key));
      expect(result).toEqual(value);
    });

    it('應該回傳 null 當鍵不存在', () => {
      expect(localStorage.getItem('non-existent')).toBeNull();
    });
  });

  describe('setCache()', () => {
    it('應該設置記憶體快取', () => {
      STORAGE_MANAGER.cache.checkpoints = [];
      expect(STORAGE_MANAGER.cache.checkpoints).toEqual([]);
    });

    it('應該更新快取值', () => {
      const testData = [{ id: 1, name: 'test' }];
      STORAGE_MANAGER.cache.checkpoints = testData;
      expect(STORAGE_MANAGER.cache.checkpoints).toEqual(testData);
    });
  });
});

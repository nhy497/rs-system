import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { STORAGE_MANAGER } from '../../src/core/storage-manager.js';

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初始化', () => {
    it('應該正確初始化存儲管理器', () => {
      expect(STORAGE_MANAGER).toBeDefined();
      expect(typeof STORAGE_MANAGER.init).toBe('function');
      expect(typeof STORAGE_MANAGER.get).toBe('function');
      expect(typeof STORAGE_MANAGER.set).toBe('function');
      expect(typeof STORAGE_MANAGER.remove).toBe('function');
      expect(typeof STORAGE_MANAGER.clear).toBe('function');
    });
  });

  describe('數據存儲', () => {
    it('應該能夠存儲和檢索數據', async () => {
      const testData = { id: 1, name: '測試數據' };

      await STORAGE_MANAGER.set('test-key', testData);
      const result = await STORAGE_MANAGER.get('test-key');

      expect(result).toEqual(testData);
    });

    it('應該能夠處理不存在的鍵', async () => {
      const result = await STORAGE_MANAGER.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('應該能夠刪除數據', async () => {
      const testData = { id: 1, name: '測試數據' };

      await STORAGE_MANAGER.set('test-key', testData);
      await STORAGE_MANAGER.remove('test-key');
      const result = await STORAGE_MANAGER.get('test-key');

      expect(result).toBeNull();
    });

    it('應該能夠清空所有數據', async () => {
      const testData1 = { id: 1, name: '測試數據1' };
      const testData2 = { id: 2, name: '測試數據2' };

      await STORAGE_MANAGER.set('test-key1', testData1);
      await STORAGE_MANAGER.set('test-key2', testData2);
      await STORAGE_MANAGER.clear();

      const result1 = await STORAGE_MANAGER.get('test-key1');
      const result2 = await STORAGE_MANAGER.get('test-key2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('錯誤處理', () => {
    it('應該處理存儲錯誤', async () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(STORAGE_MANAGER.set('test-key', {})).rejects.toThrow('Storage error');
    });

    it('應該處理檢索錯誤', async () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Retrieval error');
      });

      await expect(STORAGE_MANAGER.get('test-key')).rejects.toThrow('Retrieval error');
    });
  });

  describe('數據序列化', () => {
    it('應該正確序列化複雜對象', async () => {
      const complexData = {
        id: 1,
        name: '測試',
        array: [1, 2, 3],
        nested: { prop: 'value' }
      };

      await STORAGE_MANAGER.set('complex-key', complexData);
      const result = await STORAGE_MANAGER.get('complex-key');

      expect(result).toEqual(complexData);
    });

    it('應該處理循環引用', async () => {
      const circularData = { id: 1 };
      circularData.self = circularData;

      await expect(STORAGE_MANAGER.set('circular-key', circularData)).rejects.toThrow();
    });
  });
});

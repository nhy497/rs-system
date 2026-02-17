/**
 * 測試: services/records-service.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RecordsService } from '../../../src/services/records-service.js';

describe('RecordsService', () => {
  beforeEach(() => {
    localStorage.clear();
    RecordsService._cache.records = null;
  });

  describe('getAllRecords()', () => {
    it('應該回傳空陣列當無資料', () => {
      const records = RecordsService.getAllRecords();
      expect(records).toEqual([]);
    });

    it('應該能儲存並讀取記錄', () => {
      const testData = [{ id: '1', classDate: '2026-02-17' }];
      RecordsService.saveRecords(testData);
      
      const records = RecordsService.getAllRecords();
      expect(records.length).toBe(1);
      expect(records[0].id).toBe('1');
    });
  });

  describe('createRecord()', () => {
    it('應該創建新記錄', () => {
      const newRecord = {
        id: Date.now().toString(),
        classDate: '2026-02-17',
        classId: 'C001'
      };
      
      const records = RecordsService.getAllRecords();
      records.push(newRecord);
      RecordsService.saveRecords(records);
      
      const saved = RecordsService.getAllRecords();
      expect(saved).toHaveLength(1);
      expect(saved[0].classId).toBe('C001');
    });
  });
});

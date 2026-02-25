import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  isRequired, 
  isValidDate, 
  isValidTime, 
  isInRange 
} from '../../src/utils/validators.js';

describe('Validators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isRequired', () => {
    it('應該驗證必需字段', () => {
      expect(isRequired('value')).toBe(true);
      expect(isRequired(0)).toBe(true);
      expect(isRequired(false)).toBe(true);
    });

    it('應該拒絕空值', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });

    it('應該拒絕只有空格的字符串', () => {
      expect(isRequired('   ')).toBe(false);
      expect(isRequired('\t\n')).toBe(false);
    });

    it('應該接受非空字符串', () => {
      expect(isRequired('test')).toBe(true);
      expect(isRequired('  test  ')).toBe(true);
    });
  });

  describe('isValidDate', () => {
    it('應該驗證有效的日期字符串', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('2020-02-29')).toBe(true); // 閏年
    });

    it('應該拒絕無效的日期字符串', () => {
      expect(isValidDate('2024-13-01')).toBe(false); // 無效月份
      expect(isValidDate('2024-01-32')).toBe(false); // 無效日期
      expect(isValidDate('2024-02-30')).toBe(false); // 無效日期
      expect(isValidDate('2024-00-01')).toBe(false); // 無效月份
    });

    it('應該拒絕非字符串輸入', () => {
      expect(isValidDate(123)).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate({})).toBe(false);
    });

    it('應該拒絕錯誤格式的日期', () => {
      expect(isValidDate('15-01-2024')).toBe(false);
      expect(isValidDate('2024/01/15')).toBe(false);
      expect(isValidDate('2024-1-15')).toBe(false);
      expect(isValidDate('invalid-date')).toBe(false);
    });

    it('應該驗證日期對象', () => {
      const validDate = new Date('2024-01-15');
      const invalidDate = new Date('invalid');
      
      expect(isValidDate(validDate)).toBe(true);
      expect(isValidDate(invalidDate)).toBe(false);
    });
  });

  describe('isValidTime', () => {
    it('應該驗證有效的時間字符串', () => {
      expect(isValidTime('09:00')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
      expect(isValidTime('00:00')).toBe(true);
      expect(isValidTime('12:30')).toBe(true);
    });

    it('應該拒絕無效的時間字符串', () => {
      expect(isValidTime('24:00')).toBe(false); // 無效小時
      expect(isValidTime('23:60')).toBe(false); // 無效分鐘
      expect(isValidTime('25:00')).toBe(false); // 無效小時
      expect(isValidTime('09:61')).toBe(false); // 無效分鐘
    });

    it('應該拒絕非字符串輸入', () => {
      expect(isValidTime(123)).toBe(false);
      expect(isValidTime(null)).toBe(false);
      expect(isValidTime(undefined)).toBe(false);
      expect(isValidTime({})).toBe(false);
    });

    it('應該拒絕錯誤格式的時間', () => {
      expect(isValidTime('9:00')).toBe(false); // 單位數小時
      expect(isValidTime('09:0')).toBe(false); // 單位數分鐘
      expect(isValidTime('09.00')).toBe(false); // 錯誤分隔符
      expect(isValidTime('09-00')).toBe(false); // 錯誤分隔符
      expect(isValidTime('invalid-time')).toBe(false);
    });

    it('應該驗證時間對象', () => {
      const validTime = new Date('2024-01-15T09:00:00');
      const invalidTime = new Date('invalid');
      
      expect(isValidTime(validTime)).toBe(true);
      expect(isValidTime(invalidTime)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('應該驗證數字範圍', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true); // 邊界值
      expect(isInRange(10, 1, 10)).toBe(true); // 邊界值
    });

    it('應該拒絕超出範圍的數字', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });

    it('應該驗證字符串長度範圍', () => {
      expect(isInRange('hello', 1, 10)).toBe(true);
      expect(isInRange('a', 1, 10)).toBe(true); // 邊界值
      expect(isInRange('1234567890', 1, 10)).toBe(true); // 邊界值
    });

    it('應該拒絕超出長度範圍的字符串', () => {
      expect(isInRange('', 1, 10)).toBe(false);
      expect(isInRange('12345678901', 1, 10)).toBe(false);
    });

    it('應該驗證數組長度範圍', () => {
      expect(isInRange([1, 2, 3], 1, 5)).toBe(true);
      expect(isInRange([1], 1, 5)).toBe(true); // 邊界值
      expect(isInRange([1, 2, 3, 4, 5], 1, 5)).toBe(true); // 邊界值
    });

    it('應該拒絕超出長度範圍的數組', () => {
      expect(isInRange([], 1, 5)).toBe(false);
      expect(isInRange([1, 2, 3, 4, 5, 6], 1, 5)).toBe(false);
    });

    it('應該處理無效輸入', () => {
      expect(isInRange(null, 1, 10)).toBe(false);
      expect(isInRange(undefined, 1, 10)).toBe(false);
      expect(isInRange({}, 1, 10)).toBe(false);
    });

    it('應該處理反轉範圍', () => {
      expect(isInRange(5, 10, 1)).toBe(true); // 應該自動處理反轉
      expect(isInRange(0, 10, 1)).toBe(false);
      expect(isInRange(11, 10, 1)).toBe(false);
    });

    it('應該處理相同邊界', () => {
      expect(isInRange(5, 5, 5)).toBe(true);
      expect(isInRange(4, 5, 5)).toBe(false);
      expect(isInRange(6, 5, 5)).toBe(false);
    });
  });
});

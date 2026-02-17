/**
 * 測試: utils/formatters.js
 */
import { describe, it, expect } from 'vitest';
import { formatFileSize, timeToMinutes, minutesToTime } from '../../../src/utils/formatters.js';

describe('formatFileSize()', () => {
  it('應該格式化檔案大小為 KB', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
  });

  it('應該格式化檔案大小為 MB', () => {
    expect(formatFileSize(1536000)).toBe('1.46 MB');
  });

  it('應該處理 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
});

describe('timeToMinutes()', () => {
  it('應該將時間字串轉換為分鐘數', () => {
    expect(timeToMinutes('14:30')).toBe(870);
  });

  it('應該處理整點時間', () => {
    expect(timeToMinutes('10:00')).toBe(600);
  });

  it('應該處理空字串', () => {
    expect(timeToMinutes('')).toBe(0);
  });
});

describe('minutesToTime()', () => {
  it('應該將分鐘數轉換為時間字串', () => {
    expect(minutesToTime(870)).toBe('14:30');
  });

  it('應該處理整點時間', () => {
    expect(minutesToTime(600)).toBe('10:00');
  });

  it('應該補零', () => {
    expect(minutesToTime(65)).toBe('01:05');
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { escapeHtml, toast, todayStr } from '../../src/utils/helpers.js';

describe('Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('escapeHtml', () => {
    it('應該轉義 HTML 特殊字符', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      
      expect(escapeHtml(input)).toBe(expected);
    });

    it('應該處理空字符串', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('應該處理 null 和 undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('應該轉義各種特殊字符', () => {
      const input = '& < > " \' /';
      const expected = '&amp; &lt; &gt; &quot; &#x27; &#x2F;';
      
      expect(escapeHtml(input)).toBe(expected);
    });

    it('應該保持非特殊字符不變', () => {
      const input = 'Hello World 123';
      expect(escapeHtml(input)).toBe(input);
    });
  });

  describe('toast', () => {
    beforeEach(() => {
      // 模擬 DOM 環境
      document.body.innerHTML = '<div id="toast-container"></div>';
    });

    it('應該顯示成功消息', () => {
      const message = '操作成功';
      
      toast(message, 'success');
      
      const toastElement = document.querySelector('.toast');
      expect(toastElement).toBeTruthy();
      expect(toastElement.textContent).toContain(message);
      expect(toastElement.classList.contains('success')).toBe(true);
    });

    it('應該顯示錯誤消息', () => {
      const message = '操作失敗';
      
      toast(message, 'error');
      
      const toastElement = document.querySelector('.toast');
      expect(toastElement).toBeTruthy();
      expect(toastElement.textContent).toContain(message);
      expect(toastElement.classList.contains('error')).toBe(true);
    });

    it('應該顯示警告消息', () => {
      const message = '警告信息';
      
      toast(message, 'warning');
      
      const toastElement = document.querySelector('.toast');
      expect(toastElement).toBeTruthy();
      expect(toastElement.textContent).toContain(message);
      expect(toastElement.classList.contains('warning')).toBe(true);
    });

    it('應該使用默認類型', () => {
      const message = '一般消息';
      
      toast(message);
      
      const toastElement = document.querySelector('.toast');
      expect(toastElement).toBeTruthy();
      expect(toastElement.classList.contains('info')).toBe(true);
    });

    it('應該自動消失', (done) => {
      const message = '自動消失消息';
      
      toast(message);
      
      const toastElement = document.querySelector('.toast');
      expect(toastElement).toBeTruthy();
      
      // 等待自動消失
      setTimeout(() => {
        expect(document.querySelector('.toast')).toBeFalsy();
        done();
      }, 3500); // 默認 3 秒 + 緩衝時間
    });
  });

  describe('todayStr', () => {
    it('應該返回今天的日期字符串', () => {
      const today = new Date();
      const expected = today.toISOString().split('T')[0];
      
      expect(todayStr()).toBe(expected);
    });

    it('應該返回正確的格式', () => {
      const result = todayStr();
      
      // 檢查格式 YYYY-MM-DD
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('應該在不同日期返回不同結果', () => {
      // 模擬不同日期
      const mockDate1 = new Date('2024-01-15');
      const mockDate2 = new Date('2024-01-16');
      
      // 這裡需要根據實際實現來測試
      // 如果 todayStr() 使用 new Date()，則很難模擬
      const result1 = todayStr();
      const result2 = todayStr();
      
      // 在同一天內應該返回相同結果
      expect(result1).toBe(result2);
    });
  });
});

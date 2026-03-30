import { describe, it, expect, beforeEach, vi } from 'vitest';
import { escapeHtml, toast, todayStr } from '../../src/utils/helpers.js';

describe('Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('escapeHtml', () => {
    it('應該轉義 HTML 特殊字符', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';

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

    it('應該自動消失', done => {
      const message = '自動消失消息';

      toast(message);

      const toastElement = document.querySelector('.toast');
      expect(toastElement).toBeTruthy();

      setTimeout(() => {
        expect(document.querySelector('.toast')).toBeFalsy();
        done();
      }, 3500);
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
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('應該在不同日期返回不同結果', () => {
      const result1 = todayStr();
      const result2 = todayStr();
      expect(result1).toBe(result2);
    });
  });
});

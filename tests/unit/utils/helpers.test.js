/**
 * 測試: utils/helpers.js
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { escapeHtml, toast, todayStr } from '../../../src/utils/helpers.js';

describe('escapeHtml()', () => {
  it('應該跳脫 HTML 特殊字元', () => {
    const input = '<script>alert("xss")</script>';
    const output = escapeHtml(input);
    expect(output).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  it('應該跳脫單引號和雙引號', () => {
    expect(escapeHtml('"test"')).toContain('"');
    expect(escapeHtml("'test'")).toContain("'");
  });

  it('應該處理空字串', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('toast()', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('應該顯示 info 類型提示', () => {
    toast('測試訊息', 'info');
    const toastEl = document.querySelector('.toast-info');
    expect(toastEl).toBeTruthy();
    expect(toastEl.textContent).toBe('測試訊息');
  });

  it('應該顯示 success 類型提示', () => {
    toast('成功', 'success');
    expect(document.querySelector('.toast-success')).toBeTruthy();
  });

  it('應該顯示 error 類型提示', () => {
    toast('錯誤', 'error');
    expect(document.querySelector('.toast-error')).toBeTruthy();
  });
});

describe('todayStr()', () => {
  it('應該回傳今日日期字串 (YYYY-MM-DD)', () => {
    const result = todayStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

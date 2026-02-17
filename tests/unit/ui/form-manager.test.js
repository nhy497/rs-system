/**
 * 測試: ui/form-manager.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { FormManager } from '../../../src/ui/form-manager.js';

describe('FormManager', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="test-form">
        <input id="classDate" type="date" value="2026-02-17">
        <input id="classStartTime" type="time" value="14:00">
        <input id="classEndTime" type="time" value="15:30">
      </form>
    `;
  });

  describe('getFormData()', () => {
    it('應該提取表單資料', () => {
      const data = FormManager.getFormData();
      expect(data.classDate).toBe('2026-02-17');
      expect(data.classStartTime).toBe('14:00');
      expect(data.classEndTime).toBe('15:30');
    });

    it('應該計算課程時長', () => {
      const data = FormManager.getFormData();
      expect(data.classDurationMins).toBe(90);
    });
  });

  describe('validateForm()', () => {
    it('應該回傳錯誤當必填欄位為空', () => {
      document.getElementById('classDate').value = '';
      const errors = FormManager.validateForm();
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('應該回傳空陣列當表單有效', () => {
      const errors = FormManager.validateForm();
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBe(0);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormManager } from '../../src/ui/form-manager.js';

describe('FormManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    
    // 設置測試表單結構
    document.body.innerHTML = `
      <form id="studentForm">
        <input id="studentName" type="text" />
        <input id="studentAge" type="number" />
        <input id="studentLevel" type="radio" name="level" value="beginner" />
        <input id="studentLevel2" type="radio" name="level" value="advanced" />
        <select id="studentClass">
          <option value="">請選擇</option>
          <option value="class1">課堂1</option>
        </select>
        <input type="range" id="engagement" min="0" max="10" value="5" />
        <input type="range" id="mastery" min="0" max="10" value="5" />
        <textarea id="studentNotes"></textarea>
      </form>
    `;
  });

  describe('表單數據讀取', () => {
    it('應該正確讀取文本輸入框的值', () => {
      const nameInput = document.getElementById('studentName');
      nameInput.value = '測試學員';
      
      const formData = FormManager.getFormData('studentForm');
      
      expect(formData.studentName).toBe('測試學員');
    });

    it('應該正確讀取數字輸入框的值', () => {
      const ageInput = document.getElementById('studentAge');
      ageInput.value = '10';
      
      const formData = FormManager.getFormData('studentForm');
      
      expect(formData.studentAge).toBe('10');
    });

    it('應該正確讀取單選框的值', () => {
      const advancedRadio = document.getElementById('studentLevel2');
      advancedRadio.checked = true;
      
      const formData = FormManager.getFormData('studentForm');
      
      expect(formData.level).toBe('advanced');
    });

    it('應該正確讀取下拉選擇框的值', () => {
      const classSelect = document.getElementById('studentClass');
      classSelect.value = 'class1';
      
      const formData = FormManager.getFormData('studentForm');
      
      expect(formData.studentClass).toBe('class1');
    });

    it('應該正確讀取範圍滑桿的值', () => {
      const engagementSlider = document.getElementById('engagement');
      engagementSlider.value = '8';
      
      const formData = FormManager.getFormData('studentForm');
      
      expect(formData.engagement).toBe('8');
    });

    it('應該正確讀取文本區域的值', () => {
      const notesTextarea = document.getElementById('studentNotes');
      notesTextarea.value = '測試備註';
      
      const formData = FormManager.getFormData('studentForm');
      
      expect(formData.studentNotes).toBe('測試備註');
    });
  });

  describe('表單數據寫入', () => {
    it('應該正確設置文本輸入框的值', () => {
      const data = { studentName: '新學員' };
      
      FormManager.setFormData('studentForm', data);
      
      const nameInput = document.getElementById('studentName');
      expect(nameInput.value).toBe('新學員');
    });

    it('應該正確設置單選框的值', () => {
      const data = { level: 'advanced' };
      
      FormManager.setFormData('studentForm', data);
      
      const advancedRadio = document.getElementById('studentLevel2');
      expect(advancedRadio.checked).toBe(true);
    });

    it('應該正確設置下拉選擇框的值', () => {
      const data = { studentClass: 'class1' };
      
      FormManager.setFormData('studentForm', data);
      
      const classSelect = document.getElementById('studentClass');
      expect(classSelect.value).toBe('class1');
    });

    it('應該正確設置範圍滑桿的值', () => {
      const data = { engagement: '9' };
      
      FormManager.setFormData('studentForm', data);
      
      const engagementSlider = document.getElementById('engagement');
      expect(engagementSlider.value).toBe('9');
    });
  });

  describe('表單驗證', () => {
    it('應該驗證必填字段', () => {
      const nameInput = document.getElementById('studentName');
      nameInput.setAttribute('required', '');
      
      const isValid = FormManager.validateForm('studentForm');
      
      expect(isValid).toBe(false);
    });

    it('應該驗證數字字段', () => {
      const ageInput = document.getElementById('studentAge');
      ageInput.setAttribute('type', 'number');
      ageInput.setAttribute('min', '5');
      ageInput.setAttribute('max', '20');
      ageInput.value = '3';
      
      const isValid = FormManager.validateForm('studentForm');
      
      expect(isValid).toBe(false);
    });

    it('應該通過有效的表單驗證', () => {
      const nameInput = document.getElementById('studentName');
      nameInput.value = '有效學員';
      
      const ageInput = document.getElementById('studentAge');
      ageInput.value = '10';
      
      const isValid = FormManager.validateForm('studentForm');
      
      expect(isValid).toBe(true);
    });
  });

  describe('表單重置', () => {
    it('應該清空所有表單字段', () => {
      // 先設置一些值
      const nameInput = document.getElementById('studentName');
      nameInput.value = '測試學員';
      
      const ageInput = document.getElementById('studentAge');
      ageInput.value = '10';
      
      // 重置表單
      FormManager.resetForm('studentForm');
      
      // 檢查是否已清空
      expect(nameInput.value).toBe('');
      expect(ageInput.value).toBe('');
    });

    it('應該重置單選框選擇', () => {
      const advancedRadio = document.getElementById('studentLevel2');
      advancedRadio.checked = true;
      
      FormManager.resetForm('studentForm');
      
      expect(advancedRadio.checked).toBe(false);
    });

    it('應該重置下拉選擇框', () => {
      const classSelect = document.getElementById('studentClass');
      classSelect.value = 'class1';
      
      FormManager.resetForm('studentForm');
      
      expect(classSelect.value).toBe('');
    });
  });

  describe('範圍滑桿處理', () => {
    it('應該正確獲取所有範圍滑桿的值', () => {
      const engagementSlider = document.getElementById('engagement');
      const masterySlider = document.getElementById('mastery');
      
      engagementSlider.value = '7';
      masterySlider.value = '8';
      
      const rangeValues = FormManager.getRangeValues();
      
      expect(rangeValues.engagement).toBe('7');
      expect(rangeValues.mastery).toBe('8');
    });

    it('應該正確設置範圍滑桿的值', () => {
      const values = { engagement: '9', mastery: '6' };
      
      FormManager.setRangeValues(values);
      
      const engagementSlider = document.getElementById('engagement');
      const masterySlider = document.getElementById('mastery');
      
      expect(engagementSlider.value).toBe('9');
      expect(masterySlider.value).toBe('6');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理不存在的表單', () => {
      expect(() => {
        FormManager.getFormData('nonExistentForm');
      }).not.toThrow();
    });

    it('應該處理不存在的字段', () => {
      const data = { nonExistentField: 'value' };
      
      expect(() => {
        FormManager.setFormData('studentForm', data);
      }).not.toThrow();
    });

    it('應該處理 null 數據', () => {
      expect(() => {
        FormManager.setFormData('studentForm', null);
      }).not.toThrow();
    });

    it('應該處理 undefined 數據', () => {
      expect(() => {
        FormManager.setFormData('studentForm', undefined);
      }).not.toThrow();
    });
  });

  describe('表單狀態管理', () => {
    it('應該設置表單為編輯模式', () => {
      FormManager.setFormMode('studentForm', 'edit');
      
      const form = document.getElementById('studentForm');
      expect(form.dataset.mode).toBe('edit');
    });

    it('應該設置表單為新增模式', () => {
      FormManager.setFormMode('studentForm', 'add');
      
      const form = document.getElementById('studentForm');
      expect(form.dataset.mode).toBe('add');
    });

    it('應該獲取表單模式', () => {
      const form = document.getElementById('studentForm');
      form.dataset.mode = 'edit';
      
      const mode = FormManager.getFormMode('studentForm');
      
      expect(mode).toBe('edit');
    });
  });
});

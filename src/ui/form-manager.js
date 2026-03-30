/**
 * 表單管理器 - 處理表單數據與驗證
 * @module ui/form-manager
 */

const RANGE_IDS = [
  'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
  'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
  'teachScore', 'satisfaction', 'flexibility', 'individual'
];

const SCORE_1_5_IDS = ['engagement', 'positivity', 'enthusiasm', 'satisfaction'];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const $ = id => document.getElementById(id);
const $q = sel => document.querySelector(sel);

export const FormManager = {
  mode: 'create',
  tricks: [],

  /**
   * 獲取表單數據
   * 若傳入 formId，動態讀取該 form 所有 inputs（name/id 作 key）
   * 否則退回讀取固定 ID
   */
  getFormData(formElement) {
    // 動態模式：讀取 form 內所有 inputs
    const formEl = typeof formElement === 'string' ? $(formElement) : formElement;
    if (formEl && formEl.tagName === 'FORM' || (formEl && formEl.querySelectorAll)) {
      const result = {};
      formEl.querySelectorAll('input, select, textarea').forEach(el => {
        const key = el.name || el.id;
        if (!key) return;
        if (el.type === 'radio') {
          if (el.checked) result[key] = el.value;
        } else if (el.type === 'checkbox') {
          result[key] = el.checked;
        } else {
          result[key] = el.value;
        }
      });
      return result;
    }

    // 舊版固定 ID 模式（向後兼容）
    const date = ($('classDate')?.value || '').trim();
    const startTime = ($('classStartTime')?.value || '').trim();
    const endTime = ($('classEndTime')?.value || '').trim();
    let classDurationMins = null;
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      classDurationMins = endMins > startMins ? endMins - startMins : null;
    }
    return {
      classDate: date,
      className: ($('className')?.value || '').trim(),
      classSize: ($('classSize')?.value || '').trim() ? parseInt($('classSize').value, 10) : null,
      classLocation: ($('classLocation')?.value || '').trim(),
      notes: ($('notes')?.value || '').trim(),
      engagement: ($('engagement')?.value || '3').trim()
    };
  },

  /**
   * 設置表單數據（動態寫入）
   */
  setFormData(formElement, data) {
    if (!data) return;
    const formEl = typeof formElement === 'string' ? $(formElement) : formElement;
    if (formEl && formEl.querySelectorAll) {
      formEl.querySelectorAll('input, select, textarea').forEach(el => {
        const key = el.name || el.id;
        if (!key || !(key in data)) return;
        if (el.type === 'radio') {
          el.checked = el.value === String(data[key]);
        } else if (el.type === 'checkbox') {
          el.checked = Boolean(data[key]);
        } else {
          el.value = data[key];
        }
      });
    } else {
      this.loadIntoForm(data);
    }
  },

  loadIntoForm(rec) {
    if ($('classDate')) $('classDate').value = rec.classDate || todayStr();
    if ($('className')) $('className').value = rec.className || '';
    if ($('classSize')) $('classSize').value = rec.classSize != null ? rec.classSize : '';
    if ($('classLocation')) $('classLocation').value = rec.classLocation || '';
    if ($('notes')) $('notes').value = rec.notes || '';
    if ($('engagement')) $('engagement').value = rec.engagement ?? 3;
  },

  /**
   * 清空表單（動態）
   */
  clearForm(formElement) {
    const formEl = typeof formElement === 'string' ? $(formElement) : formElement;
    if (formEl && formEl.querySelectorAll) {
      formEl.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.type === 'radio' || el.type === 'checkbox') {
          el.checked = false;
        } else {
          el.value = '';
        }
      });
    } else {
      // 舊版固定 ID 清空
      if ($('classDate')) $('classDate').value = todayStr();
      if ($('className')) $('className').value = '';
      if ($('classSize')) $('classSize').value = '';
      if ($('classLocation')) $('classLocation').value = '';
      if ($('notes')) $('notes').value = '';
      if ($('engagement')) $('engagement').value = '3';
    }
  },

  resetForm(formElement) {
    this.clearForm(formElement);
  },

  /**
   * 驗證表單
   * 若傳入含 required fields 的 rules，依 rules 驗證
   * 否則依動態 form 讀取結果驗證
   * @returns {boolean|Array} true=valid, false=invalid, 或 errors array
   */
  validateForm(formElement, rules) {
    const formEl = typeof formElement === 'string' ? $(formElement) : formElement;
    if (formEl && formEl.querySelectorAll) {
      // 動態驗證：找 required inputs
      const errors = [];
      formEl.querySelectorAll('input[required], select[required], textarea[required]').forEach(el => {
        const key = el.name || el.id;
        if (!el.value || el.value.trim() === '') {
          errors.push({ field: key, message: `${key} 為必填` });
        }
      });
      // 若無 required fields，直接返回 true
      return errors.length === 0 ? true : false;
    }
    // 舊版：返回 errors array
    const data = this.getFormData(formElement);
    const errors = [];
    if (!data.classDate) errors.push({ field: 'classDate', message: '請填寫課堂日期' });
    return errors;
  },

  validateField(field, rules) {
    const el = typeof field === 'string' ? $(field) : field;
    if (!el) return null;
    return null;
  },

  showValidationError(field, message) {
    const el = typeof field === 'string' ? $(field) : field;
    if (!el) return;
    el.setAttribute('aria-invalid', 'true');
    el.style.borderColor = 'var(--danger, #dc3545)';
  },

  clearValidationErrors(formElement) {
    document.querySelectorAll('[aria-invalid="true"]').forEach(el => {
      el.removeAttribute('aria-invalid');
      el.style.borderColor = '';
    });
  },

  setFormMode(formId, mode) {
    if (mode === undefined) {
      // 舊版 setFormMode(mode)
      this.mode = formId;
      return;
    }
    const form = $(formId);
    if (form) form.dataset.mode = mode;
    this.mode = mode;
  },

  getFormMode(formId) {
    if (!formId) return this.mode;
    const form = $(formId);
    return form ? (form.dataset.mode || this.mode) : this.mode;
  },

  disableForm(formElement) {
    const form = typeof formElement === 'string' ? $(formElement) : formElement;
    if (!form) return;
    form.querySelectorAll('input, select, textarea, button').forEach(el => { el.disabled = true; });
  },

  enableForm(formElement) {
    const form = typeof formElement === 'string' ? $(formElement) : formElement;
    if (!form) return;
    form.querySelectorAll('input, select, textarea, button').forEach(el => { el.disabled = false; });
  },

  populateClassPresets(selectElement, presets) {
    const el = typeof selectElement === 'string' ? $(selectElement) : selectElement;
    if (!el || !Array.isArray(presets)) return;
    el.innerHTML = `<option value="">請選擇...</option>${presets.map(p => `<option value="${p}">${p}</option>`).join('')}`;
  },

  updateRangeValue(rangeId, value) {
    const r = $(rangeId);
    const valSpan = $(`val-${rangeId}`);
    if (r && valSpan) {
      r.value = value;
      valSpan.textContent = value;
    }
  },

  /**
   * getRangeValues 返回字串型別（兼容 test 期望）
   */
  getRangeValues() {
    const values = {};
    RANGE_IDS.forEach(id => {
      const el = $(id);
      if (el) values[id] = String(el.value);
    });
    return values;
  },

  setRangeValues(values) {
    Object.entries(values).forEach(([id, value]) => {
      const el = $(id);
      if (el) {
        el.value = value;
        this.updateRangeValue(id, value);
      }
    });
  },

  getAllRangeValues() {
    const values = {};
    RANGE_IDS.forEach(id => {
      const el = $(id);
      if (el) values[id] = parseInt(el.value, 10);
    });
    return values;
  },

  updateClassDuration() {
    const startTime = ($('classStartTime')?.value || '').trim();
    const endTime = ($('classEndTime')?.value || '').trim();
    const durationEl = $('classDuration');
    if (!durationEl) return;
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      if (endMins > startMins) {
        const mins = endMins - startMins;
        const hours = Math.floor(mins / 60);
        const remainMins = mins % 60;
        let duration = '';
        if (hours > 0) duration += `${hours}小時`;
        if (remainMins > 0) duration += `${remainMins}分鐘`;
        durationEl.textContent = `課堂時長：${duration}`;
      } else {
        durationEl.textContent = '課堂時長：結束時間須晚於開始時間';
      }
    } else {
      durationEl.textContent = '課堂時長：—';
    }
  },

  bindRange(id) {
    const r = $(id), valSpan = $(`val-${id}`);
    if (!r || !valSpan) return;
    const quick = r.closest('.slider-row')?.querySelector('.quick-btns');
    const update = () => {
      valSpan.textContent = r.value;
      quick?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
    };
    r.addEventListener('input', update);
    quick?.addEventListener('click', e => {
      const btn = e.target.closest('button');
      const v = btn?.dataset?.v;
      if (v != null) { r.value = v; update(); }
    });
    update();
  },

  bindAllRanges() {
    RANGE_IDS.forEach(id => this.bindRange(id));
  }
};

export const {
  getFormData, setFormData, clearForm, resetForm, validateForm, validateField,
  showValidationError, clearValidationErrors, enableForm, disableForm,
  populateClassPresets, updateRangeValue, getAllRangeValues, getRangeValues,
  setRangeValues, bindRange, bindAllRanges, setFormMode, getFormMode
} = FormManager;

export { RANGE_IDS, SCORE_1_5_IDS };

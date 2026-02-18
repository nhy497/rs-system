/**
 * 表單管理器 - 處理表單數據與驗證
 * @module ui/form-manager
 * 
 * 源代碼位置: system.js L1909-2100 (主要數據收集與載入邏輯)
 * 
 * 主要功能:
 * - 表單數據讀取與寫入
 * - 表單驗證
 * - 表單重置與清空
 * - 表單狀態管理（編輯/新增模式）
 * - 範圍滑桿處理
 */

/**
 * 範圍滑桿 ID 列表
 */
const RANGE_IDS = [
  'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
  'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
  'teachScore', 'satisfaction', 'flexibility', 'individual'
];

/**
 * 1-5 分評分項目 ID
 */
const SCORE_1_5_IDS = ['engagement', 'positivity', 'enthusiasm', 'satisfaction'];

/**
 * 獲取今天日期字符串
 * @returns {string} YYYY-MM-DD 格式的日期
 */
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * DOM 選擇器快捷函數
 */
const $ = (id) => document.getElementById(id);
const $q = (sel) => document.querySelector(sel);

/**
 * 表單管理器
 */
export const FormManager = {
  /**
   * 表單模式
   */
  mode: 'create', // 'create' | 'edit'

  /**
   * 花式數據引用 (從 TricksManager 傳入)
   */
  tricks: [],

  /**
   * 獲取表單數據
   * @param {HTMLFormElement|string} formElement - 表單元素或 ID (可選，用於特定表單)
   * @returns {Object} 表單數據對象
   */
  getFormData(formElement) {
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

    const trickMasteries = this.tricks
      .map(t => Number.isFinite(t.mastery) ? t.mastery : null)
      .filter(v => v != null);
    const aggregatedMastery = trickMasteries.length > 0
      ? Math.round(trickMasteries.reduce((a, b) => a + b, 0) / trickMasteries.length)
      : parseInt($('mastery')?.value || '50', 10);

    const trickPlannedTimes = this.tricks
      .map(t => Number.isFinite(t.plannedTime) ? t.plannedTime : null)
      .filter(v => v != null);
    const aggregatedPlannedTime = trickPlannedTimes.length > 0
      ? trickPlannedTimes.reduce((a, b) => a + b, 0)
      : (($('plannedTime')?.value || '').trim() ? parseInt($('plannedTime').value, 10) : null);

    const trickActualTimes = this.tricks
      .map(t => Number.isFinite(t.actualTime) ? t.actualTime : null)
      .filter(v => v != null);
    const aggregatedActualTime = trickActualTimes.length > 0
      ? trickActualTimes.reduce((a, b) => a + b, 0)
      : (($('actualTime')?.value || '').trim() ? parseInt($('actualTime').value, 10) : null);

    const selectedSkillBtn = $q('[data-name="skillLevel"] .selected');
    const selectedSkillLevel = selectedSkillBtn?.textContent?.trim() || '';
    const aggregatedSkillLevel = this.tricks.find(t => t.skillLevel)?.skillLevel || selectedSkillLevel;
    
    return {
      classDate: date,
      className: ($('className')?.value || '').trim(),
      classSize: ($('classSize')?.value || '').trim() ? parseInt($('classSize').value, 10) : null,
      classLocation: ($('classLocation')?.value || '').trim(),
      teachingRole: ($('teachingRole')?.value || '').trim(),
      classStartTime: startTime,
      classEndTime: endTime,
      classDurationMins: classDurationMins,
      notes: ($('notes')?.value || '').trim(),
      attachments: window._currentAttachments || [],
      engagement: parseInt($('engagement')?.value || '3', 10),
      atmosphere: $q('[data-name="atmosphere"] .selected')?.textContent?.trim() || '',
      tricks: this.tricks.map(t => ({
        name: t.name || '',
        detail: t.detail || '',
        level: t.level || '',
        mastery: Number.isFinite(t.mastery) ? t.mastery : null,
        plannedTime: Number.isFinite(t.plannedTime) ? t.plannedTime : null,
        actualTime: Number.isFinite(t.actualTime) ? t.actualTime : null,
        skillLevel: t.skillLevel || ''
      })),
      mastery: aggregatedMastery,
      plannedTime: aggregatedPlannedTime,
      actualTime: aggregatedActualTime,
      skillLevel: aggregatedSkillLevel,
      helpOthers: parseInt($('helpOthers')?.value || '50', 10),
      interaction: parseInt($('interaction')?.value || '50', 10),
      teamwork: parseInt($('teamwork')?.value || '50', 10),
      selfPractice: parseInt($('selfPractice')?.value || '50', 10),
      activeLearn: parseInt($('activeLearn')?.value || '50', 10),
      positivity: parseInt($('positivity')?.value || '3', 10),
      enthusiasm: parseInt($('enthusiasm')?.value || '3', 10),
      teachScore: parseInt($('teachScore')?.value || '7', 10),
      satisfaction: parseInt($('satisfaction')?.value || '3', 10),
      disciplineCount: ($('disciplineCount')?.value || '').trim() ? parseInt($('disciplineCount').value, 10) : null,
      flexibility: parseInt($('flexibility')?.value || '7', 10),
      individual: parseInt($('individual')?.value || '50', 10)
    };
  },

  /**
   * 設置表單數據
   * @param {HTMLFormElement|string} formElement - 表單元素或 ID (可選)
   * @param {Object} data - 數據對象
   */
  setFormData(formElement, data) {
    if (!data) return;
    this.loadIntoForm(data);
  },

  /**
   * 載入數據到表單
   * @param {Object} rec - 記錄對象
   */
  loadIntoForm(rec) {
    if ($('classDate')) $('classDate').value = rec.classDate || todayStr();
    if ($('className')) $('className').value = rec.className || '';
    if ($('classSize')) $('classSize').value = rec.classSize != null ? rec.classSize : '';
    if ($('classLocation')) $('classLocation').value = rec.classLocation || '';
    if ($('teachingRole')) $('teachingRole').value = rec.teachingRole || '';
    if ($('classStartTime')) $('classStartTime').value = rec.classStartTime || '';
    if ($('classEndTime')) $('classEndTime').value = rec.classEndTime || '';
    this.updateClassDuration();
    if ($('notes')) $('notes').value = rec.notes || '';
    
    // 載入附件
    window._currentAttachments = rec.attachments || [];
    if (typeof window.displayAttachments === 'function') {
      window.displayAttachments();
    }
    
    if ($('engagement')) $('engagement').value = rec.engagement ?? 3;
    document.querySelectorAll('[data-name="atmosphere"] button').forEach(b => {
      b.classList.toggle('selected', b.textContent.trim() === (rec.atmosphere || ''));
    });
    
    this.tricks = Array.isArray(rec.tricks) ? rec.tricks.map(t => ({
      name: t.name || '',
      detail: t.detail || '',
      level: t.level || t.skillLevel || '',
      mastery: Number.isFinite(t.mastery) ? t.mastery : (Number.isFinite(rec.mastery) ? rec.mastery : null),
      plannedTime: Number.isFinite(t.plannedTime) ? t.plannedTime : null,
      actualTime: Number.isFinite(t.actualTime) ? t.actualTime : null,
      skillLevel: t.skillLevel || t.level || ''
    })) : [];
    
    if (typeof window.renderTricks === 'function') {
      window.renderTricks();
    }
    
    const trickMasteries = this.tricks.map(t => Number.isFinite(t.mastery) ? t.mastery : null).filter(v => v != null);
    const masterVal = trickMasteries.length ? Math.round(trickMasteries.reduce((a, b) => a + b, 0) / trickMasteries.length) : (rec.mastery ?? 50);
    if ($('mastery')) $('mastery').value = masterVal;

    const trickPlanned = this.tricks.map(t => Number.isFinite(t.plannedTime) ? t.plannedTime : null).filter(v => v != null);
    const plannedVal = trickPlanned.length ? trickPlanned.reduce((a, b) => a + b, 0) : (rec.plannedTime != null ? rec.plannedTime : '');
    if ($('plannedTime')) $('plannedTime').value = plannedVal;

    const trickActual = this.tricks.map(t => Number.isFinite(t.actualTime) ? t.actualTime : null).filter(v => v != null);
    const actualVal = trickActual.length ? trickActual.reduce((a, b) => a + b, 0) : (rec.actualTime != null ? rec.actualTime : '');
    if ($('actualTime')) $('actualTime').value = actualVal;

    const skillLevel = rec.skillLevel || this.tricks.find(t => t.skillLevel)?.skillLevel || '';
    document.querySelectorAll('[data-name="skillLevel"] button').forEach(b => {
      b.classList.toggle('selected', b.textContent.trim() === skillLevel);
    });
    
    if ($('helpOthers')) $('helpOthers').value = rec.helpOthers ?? 50;
    if ($('interaction')) $('interaction').value = rec.interaction ?? 50;
    if ($('teamwork')) $('teamwork').value = rec.teamwork ?? 50;
    if ($('selfPractice')) $('selfPractice').value = rec.selfPractice ?? 50;
    if ($('activeLearn')) $('activeLearn').value = rec.activeLearn ?? 50;
    if ($('positivity')) $('positivity').value = rec.positivity ?? 3;
    if ($('enthusiasm')) $('enthusiasm').value = rec.enthusiasm ?? 3;
    if ($('teachScore')) $('teachScore').value = rec.teachScore ?? 7;
    if ($('satisfaction')) $('satisfaction').value = rec.satisfaction ?? 3;
    if ($('disciplineCount')) $('disciplineCount').value = rec.disciplineCount != null ? rec.disciplineCount : '';
    if ($('flexibility')) $('flexibility').value = rec.flexibility ?? 7;
    if ($('individual')) $('individual').value = rec.individual ?? 50;
    
    RANGE_IDS.forEach(id => {
      const r = $(id), valSpan = $('val-' + id);
      if (r && valSpan) {
        valSpan.textContent = r.value;
        const q = r.closest('.slider-row')?.querySelector('.quick-btns');
        q?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
      }
    });
  },

  /**
   * 清空表單
   * @param {HTMLFormElement|string} formElement - 表單元素或 ID (可選)
   */
  clearForm(formElement) {
    if ($('classDate')) $('classDate').value = todayStr();
    if ($('className')) $('className').value = '';
    if ($('classSize')) $('classSize').value = '';
    if ($('classLocation')) $('classLocation').value = '';
    if ($('teachingRole')) $('teachingRole').value = '';
    if ($('classStartTime')) $('classStartTime').value = '';
    if ($('classEndTime')) $('classEndTime').value = '';
    this.updateClassDuration();
    if ($('notes')) $('notes').value = '';
    if ($('fileAttachment')) $('fileAttachment').value = '';
    window._currentAttachments = [];
    if (typeof window.displayAttachments === 'function') {
      window.displayAttachments();
    }
    if ($('engagement')) $('engagement').value = '3';
    $q('[data-name="atmosphere"] .selected')?.classList.remove('selected');
    this.tricks = [];
    if (typeof window.renderTricks === 'function') {
      window.renderTricks();
    }
    if ($('trickName')) $('trickName').value = '';
    if ($('trickDetail')) $('trickDetail').value = '';
    if ($('mastery')) $('mastery').value = '50';
    if ($('plannedTime')) $('plannedTime').value = '';
    if ($('actualTime')) $('actualTime').value = '';
    $q('[data-name="skillLevel"] .selected')?.classList.remove('selected');
    if ($('helpOthers')) $('helpOthers').value = '50';
    if ($('interaction')) $('interaction').value = '50';
    if ($('teamwork')) $('teamwork').value = '50';
    if ($('selfPractice')) $('selfPractice').value = '50';
    if ($('activeLearn')) $('activeLearn').value = '50';
    if ($('positivity')) $('positivity').value = '3';
    if ($('enthusiasm')) $('enthusiasm').value = '3';
    if ($('teachScore')) $('teachScore').value = '7';
    if ($('satisfaction')) $('satisfaction').value = '3';
    if ($('disciplineCount')) $('disciplineCount').value = '';
    if ($('flexibility')) $('flexibility').value = '7';
    if ($('individual')) $('individual').value = '50';
    RANGE_IDS.forEach(id => {
      const r = $(id), valSpan = $('val-' + id);
      if (r && valSpan) {
        valSpan.textContent = r.value;
        const q = r.closest('.slider-row')?.querySelector('.quick-btns');
        q?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
      }
    });
  },

  /**
   * 重置表單（同 clearForm）
   * @param {HTMLFormElement|string} formElement - 表單元素或 ID (可選)
   */
  resetForm(formElement) {
    this.clearForm(formElement);
  },

  /**
   * 驗證表單
   * @param {HTMLFormElement|string} formElement - 表單元素或 ID
   * @param {Object} rules - 驗證規則 (可選)
   * @returns {Array<Object>} 驗證錯誤列表
   */
  validateForm(formElement, rules) {
    const data = this.getFormData(formElement);
    const errors = [];

    if (!data.classDate) {
      errors.push({
        field: 'classDate',
        message: '請填寫課堂日期'
      });
    }

    // 可以添加更多驗證規則
    return errors;
  },

  /**
   * 驗證單個欄位
   * @param {HTMLElement|string} field - 欄位元素或 ID
   * @param {Object} rules - 驗證規則
   * @returns {Object|null} 驗證錯誤或 null
   */
  validateField(field, rules) {
    const el = typeof field === 'string' ? $(field) : field;
    if (!el) return null;

    // 實現具體的欄位驗證邏輯
    return null;
  },

  /**
   * 顯示驗證錯誤
   * @param {HTMLElement|string} field - 欄位元素或 ID
   * @param {string} message - 錯誤訊息
   */
  showValidationError(field, message) {
    const el = typeof field === 'string' ? $(field) : field;
    if (!el) return;

    el.setAttribute('aria-invalid', 'true');
    el.style.borderColor = 'var(--danger, #dc3545)';
    
    // 可以添加錯誤訊息顯示
  },

  /**
   * 清除驗證錯誤
   * @param {HTMLFormElement|string} formElement - 表單元素或 ID
   */
  clearValidationErrors(formElement) {
    document.querySelectorAll('[aria-invalid="true"]').forEach(el => {
      el.removeAttribute('aria-invalid');
      el.style.borderColor = '';
    });
  },

  /**
   * 設置表單模式
   * @param {string} mode - 模式 ('create' | 'edit')
   */
  setFormMode(mode) {
    this.mode = mode;
  },

  /**
   * 獲取表單模式
   * @returns {string} 模式
   */
  getFormMode() {
    return this.mode;
  },

  /**
   * 禁用表單
   * @param {HTMLFormElement|string} formElement - 表單元素或 ID
   */
  disableForm(formElement) {
    const form = typeof formElement === 'string' ? $(formElement) : formElement;
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
      input.disabled = true;
    });
  },

  /**
   * 啟用表單
   * @param {HTMLFormElement|string} formElement - 表單元素或 ID
   */
  enableForm(formElement) {
    const form = typeof formElement === 'string' ? $(formElement) : formElement;
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
      input.disabled = false;
    });
  },

  /**
   * 填充班級預設選項
   * @param {HTMLSelectElement|string} selectElement - 選擇元素或 ID
   * @param {Array<string>} presets - 預設班級列表
   */
  populateClassPresets(selectElement, presets) {
    const el = typeof selectElement === 'string' ? $(selectElement) : selectElement;
    if (!el || !Array.isArray(presets)) return;

    el.innerHTML = '<option value="">請選擇...</option>' +
      presets.map(preset => `<option value="${preset}">${preset}</option>`).join('');
  },

  /**
   * 更新範圍值顯示
   * @param {string} rangeId - 範圍滑桿 ID
   * @param {number} value - 值
   */
  updateRangeValue(rangeId, value) {
    const r = $(rangeId);
    const valSpan = $('val-' + rangeId);
    if (r && valSpan) {
      r.value = value;
      valSpan.textContent = value;
      const q = r.closest('.slider-row')?.querySelector('.quick-btns');
      q?.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', String(b.dataset.v) === String(value));
      });
    }
  },

  /**
   * 獲取所有範圍值
   * @returns {Object} 範圍值對象
   */
  getAllRangeValues() {
    const values = {};
    RANGE_IDS.forEach(id => {
      const el = $(id);
      if (el) {
        values[id] = parseInt(el.value, 10);
      }
    });
    return values;
  },

  /**
   * 更新課堂時長
   */
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

  /**
   * 綁定範圍滑桿
   * @param {string} id - 滑桿 ID
   */
  bindRange(id) {
    const r = $(id), valSpan = $('val-' + id);
    if (!r || !valSpan) return;
    const quick = r.closest('.slider-row')?.querySelector('.quick-btns');
    const update = () => {
      valSpan.textContent = r.value;
      quick?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
    };
    r.addEventListener('input', update);
    quick?.addEventListener('click', (e) => { 
      const btn = e.target.closest('button');
      const v = btn?.dataset?.v; 
      if (v != null) { 
        r.value = v; 
        update(); 
      } 
    });
    update();
  },

  /**
   * 綁定所有範圍滑桿
   */
  bindAllRanges() {
    RANGE_IDS.forEach(id => this.bindRange(id));
  }
};

// 導出便利函數
export const {
  getFormData,
  setFormData,
  clearForm,
  resetForm,
  validateForm,
  validateField,
  showValidationError,
  clearValidationErrors,
  setFormMode,
  getFormMode,
  disableForm,
  enableForm,
  populateClassPresets,
  updateRangeValue,
  getAllRangeValues,
  bindRange,
  bindAllRanges
} = FormManager;

// 導出常量
export { RANGE_IDS, SCORE_1_5_IDS };

/**
 * 事件處理器 - 統一管理 DOM 事件綁定
 * @module ui/event-handlers
 * 
 * 源代碼位置: system.js L2837-3230
 * 
 * 主要功能:
 * - DOM 事件綁定
 * - 按鈕點擊處理
 * - 表單提交處理
 * - 鍵盤事件處理
 * - 自訂事件系統
 * 
 * 注意: 此模組提供事件綁定架構，實際的業務邏輯需要從外部注入
 */

/**
 * DOM 選擇器
 */
const $ = (id) => document.getElementById(id);
const $q = (sel) => document.querySelector(sel);
const $qa = (sel) => document.querySelectorAll(sel);

/**
 * 選項組配置
 */
const OPTION_GROUPS = [
  { name: 'atmosphere', selector: '[data-name="atmosphere"]' },
  { name: 'skillLevel', selector: '[data-name="skillLevel"]' }
];

/**
 * 事件處理器管理器
 */
export const EventHandlers = {
  /**
   * 已綁定的事件監聽器
   */
  boundEvents: [],

  /**
   * 自訂事件監聽器
   */
  customListeners: {},

  /**
   * 外部處理函數引用
   * 這些函數需要從外部注入
   */
  handlers: {
    onSave: null,
    onClear: null,
    onDeleteAll: null,
    onExport: null,
    onLogout: null,
    onDuplicate: null,
    onAddTrick: null,
    onFileUpload: null,
    onSetPage: null,
    onRefreshStats: null,
    onRefreshByClass: null,
    onRefreshActionsView: null,
    onRefreshAnalytics: null,
    onUpdateClassDuration: null,
    onBindRange: null,
    onPopulateGlobalFilterClass: null,
    onPopulateQuickSelectClass: null,
    onRenderClassPresets: null,
    onRenderTricks: null,
    onRefreshAllViews: null
  },

  /**
   * 初始化事件處理器
   * @param {Object} handlers - 外部處理函數映射
   */
  init(handlers = {}) {
    Object.assign(this.handlers, handlers);
    this.bindAllEvents();
    console.log('✅ 事件處理器初始化完成');
  },

  /**
   * 綁定所有事件
   */
  bindAllEvents() {
    this.bindSaveButton();
    this.bindClearButton();
    this.bindDeleteAllButton();
    this.bindExportButton();
    this.bindLogoutButton();
    this.bindDuplicateButton();
    this.bindClassTimeInputs();
    this.bindRangeSliders();
    this.bindOptionGroups();
    this.bindTrickInput();
    this.bindFileUpload();
    this.bindNavigation();
    this.bindSidebarControls();
    this.bindFilters();
    this.bindModalControls();
  },

  /**
   * 解除所有事件綁定
   */
  unbindAllEvents() {
    this.boundEvents.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.boundEvents = [];
  },

  /**
   * 添加事件監聽器並記錄
   * @private
   * @param {HTMLElement} element - 元素
   * @param {string} event - 事件名稱
   * @param {Function} handler - 處理函數
   */
  _addEventListener(element, event, handler) {
    if (!element) return;
    element.addEventListener(event, handler);
    this.boundEvents.push({ element, event, handler });
  },

  /**
   * 綁定儲存按鈕
   */
  bindSaveButton() {
    const btn = $('btnSave');
    if (btn && this.handlers.onSave) {
      this._addEventListener(btn, 'click', this.handlers.onSave);
    }
  },

  /**
   * 綁定清空按鈕
   */
  bindClearButton() {
    const btn = $('btnClear');
    if (btn && this.handlers.onClear) {
      this._addEventListener(btn, 'click', () => {
        if (confirm('確定要清空本堂輸入嗎？')) {
          this.handlers.onClear();
        }
      });
    }
  },

  /**
   * 綁定刪除全部按鈕
   */
  bindDeleteAllButton() {
    const btn = $('btnDeleteAll');
    if (btn && this.handlers.onDeleteAll) {
      this._addEventListener(btn, 'click', () => {
        if (confirm('確定要永久清除所有記錄嗎？此操作無法復原。')) {
          this.handlers.onDeleteAll();
        }
      });
    }
  },

  /**
   * 綁定導出按鈕
   */
  bindExportButton() {
    const btn = $('btnExport');
    if (btn && this.handlers.onExport) {
      this._addEventListener(btn, 'click', (e) => {
        e.preventDefault();
        this.handlers.onExport();
      });
    }
  },

  /**
   * 綁定登出按鈕
   */
  bindLogoutButton() {
    const btn = $('btnLogout');
    if (btn && this.handlers.onLogout) {
      this._addEventListener(btn, 'click', () => {
        if (confirm('確定要登出嗎？')) {
          this.handlers.onLogout();
        }
      });
    }
  },

  /**
   * 綁定複製按鈕
   */
  bindDuplicateButton() {
    const btn = $('btnDuplicate');
    if (btn && this.handlers.onDuplicate) {
      this._addEventListener(btn, 'click', this.handlers.onDuplicate);
    }
  },

  /**
   * 綁定課堂時間輸入
   */
  bindClassTimeInputs() {
    const startTime = $('classStartTime');
    const endTime = $('classEndTime');
    
    if (startTime && this.handlers.onUpdateClassDuration) {
      this._addEventListener(startTime, 'change', this.handlers.onUpdateClassDuration);
    }
    
    if (endTime && this.handlers.onUpdateClassDuration) {
      this._addEventListener(endTime, 'change', this.handlers.onUpdateClassDuration);
    }
  },

  /**
   * 綁定範圍滑桿
   */
  bindRangeSliders() {
    if (this.handlers.onBindRange && this.handlers.rangeIds) {
      this.handlers.rangeIds.forEach(id => {
        this.handlers.onBindRange(id);
      });
    }
  },

  /**
   * 綁定選項組
   */
  bindOptionGroups() {
    OPTION_GROUPS.forEach(g => {
      const container = $q(g.selector);
      if (!container) return;
      
      container.querySelectorAll('button').forEach(btn => {
        this._addEventListener(btn, 'click', () => {
          container.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    });
  },

  /**
   * 綁定花式添加按鈕
   */
  bindTrickInput() {
    const btn = $('addTrick');
    if (btn && this.handlers.onAddTrick) {
      this._addEventListener(btn, 'click', this.handlers.onAddTrick);
    }
  },

  /**
   * 綁定文件上傳
   */
  bindFileUpload() {
    const input = $('fileAttachment');
    if (input && this.handlers.onFileUpload) {
      this._addEventListener(input, 'change', this.handlers.onFileUpload);
    }
  },

  /**
   * 綁定導航
   */
  bindNavigation() {
    const navItems = $qa('.nav-item[data-page]');
    navItems.forEach(el => {
      this._addEventListener(el, 'click', (e) => {
        e.preventDefault();
        if (this.handlers.onSetPage) {
          this.handlers.onSetPage(el.dataset.page);
        }
      });
    });
  },

  /**
   * 綁定側邊欄控制
   */
  bindSidebarControls() {
    const toggle = $('sidebarToggle');
    if (toggle) {
      this._addEventListener(toggle, 'click', () => {
        const sidebar = $('sidebar');
        if (sidebar) sidebar.classList.toggle('collapsed');
      });
    }
    
    const collapse = $('btnCollapseSidebar');
    if (collapse) {
      this._addEventListener(collapse, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sidebar = $('sidebar');
        if (sidebar) {
          sidebar.classList.add('collapsed');
          console.log('✅ 側邊欄已收起');
        }
      });
    }
  },

  /**
   * 綁定篩選器
   */
  bindFilters() {
    // 全域篩選
    const globalFilter = $('globalFilterClass');
    if (globalFilter && this.handlers.onRefreshByClass && this.handlers.onRefreshStats) {
      this._addEventListener(globalFilter, 'change', () => {
        this.handlers.onRefreshByClass();
        this.handlers.onRefreshStats();
      });
    }
    
    const dateFrom = $('filterDateFrom');
    if (dateFrom && this.handlers.onRefreshStats) {
      this._addEventListener(dateFrom, 'change', this.handlers.onRefreshStats);
    }
    
    const dateTo = $('filterDateTo');
    if (dateTo && this.handlers.onRefreshStats) {
      this._addEventListener(dateTo, 'change', this.handlers.onRefreshStats);
    }
    
    const search = $('studentSearch');
    if (search && this.handlers.onRefreshStats) {
      this._addEventListener(search, 'input', this.handlers.onRefreshStats);
    }
    
    const sortBy = $('sortBy');
    if (sortBy && this.handlers.onRefreshStats) {
      this._addEventListener(sortBy, 'change', this.handlers.onRefreshStats);
    }
    
    // 快速選擇班級
    const quickSelect = $('quickSelectClass');
    if (quickSelect) {
      this._addEventListener(quickSelect, 'change', function() {
        const v = this.value;
        const className = $('className');
        if (className) {
          className.value = (v === '—' || !v) ? '' : v;
        }
      });
    }
    
    // 動作記錄篩選
    const actionFilterClass = $('actionFilterClass');
    if (actionFilterClass && this.handlers.onRefreshActionsView) {
      this._addEventListener(actionFilterClass, 'change', this.handlers.onRefreshActionsView);
    }
    
    const actionDateFrom = $('actionDateFrom');
    if (actionDateFrom && this.handlers.onRefreshActionsView) {
      this._addEventListener(actionDateFrom, 'change', this.handlers.onRefreshActionsView);
    }
    
    const actionDateTo = $('actionDateTo');
    if (actionDateTo && this.handlers.onRefreshActionsView) {
      this._addEventListener(actionDateTo, 'change', this.handlers.onRefreshActionsView);
    }
    
    const actionSkillLevel = $('actionSkillLevel');
    if (actionSkillLevel && this.handlers.onRefreshActionsView) {
      this._addEventListener(actionSkillLevel, 'change', this.handlers.onRefreshActionsView);
    }
    
    // 統計分析篩選
    const analyticsFilterClass = $('analyticsFilterClass');
    if (analyticsFilterClass && this.handlers.onRefreshAnalytics) {
      this._addEventListener(analyticsFilterClass, 'change', this.handlers.onRefreshAnalytics);
    }
    
    const analyticsDateFrom = $('analyticsDateFrom');
    if (analyticsDateFrom && this.handlers.onRefreshAnalytics) {
      this._addEventListener(analyticsDateFrom, 'change', this.handlers.onRefreshAnalytics);
    }
    
    const analyticsDateTo = $('analyticsDateTo');
    if (analyticsDateTo && this.handlers.onRefreshAnalytics) {
      this._addEventListener(analyticsDateTo, 'change', this.handlers.onRefreshAnalytics);
    }
  },

  /**
   * 綁定模態窗口控制
   */
  bindModalControls() {
    // 班級詳情模態
    const closeClassDetail = $('closeClassDetail');
    if (closeClassDetail) {
      this._addEventListener(closeClassDetail, 'click', () => {
        const modal = $('classDetailModal');
        if (modal) modal.hidden = true;
      });
    }
    
    const classDetailModal = $('classDetailModal');
    if (classDetailModal) {
      const backdrop = classDetailModal.querySelector('.modal-backdrop');
      if (backdrop) {
        this._addEventListener(backdrop, 'click', () => {
          classDetailModal.hidden = true;
        });
      }
    }
    
    // 記錄詳情模態
    const closeDetail = $('closeDetail');
    if (closeDetail) {
      this._addEventListener(closeDetail, 'click', () => {
        const modal = $('detailModal');
        if (modal) modal.hidden = true;
      });
    }
    
    const detailModal = $('detailModal');
    if (detailModal) {
      const backdrop = detailModal.querySelector('.modal-backdrop');
      if (backdrop) {
        this._addEventListener(backdrop, 'click', () => {
          detailModal.hidden = true;
        });
      }
    }
  },

  /**
   * 綁定表單提交事件
   * @param {string} formId - 表單 ID
   * @param {Function} handler - 處理函數
   */
  onFormSubmit(formId, handler) {
    const form = $(formId);
    if (form) {
      this._addEventListener(form, 'submit', (e) => {
        e.preventDefault();
        handler(e);
      });
    }
  },

  /**
   * 綁定欄位變更事件
   * @param {string} fieldId - 欄位 ID
   * @param {Function} handler - 處理函數
   */
  onFieldChange(fieldId, handler) {
    const field = $(fieldId);
    if (field) {
      this._addEventListener(field, 'change', handler);
    }
  },

  /**
   * 綁定按鈕點擊事件
   * @param {string} buttonId - 按鈕 ID
   * @param {Function} handler - 處理函數
   */
  onButtonClick(buttonId, handler) {
    const button = $(buttonId);
    if (button) {
      this._addEventListener(button, 'click', handler);
    }
  },

  /**
   * 綁定記錄編輯事件
   * @param {string} recordId - 記錄 ID
   * @param {Function} handler - 處理函數
   */
  onRecordEdit(recordId, handler) {
    // 實現依賴於具體的 UI 結構
    console.log('Bind record edit:', recordId);
  },

  /**
   * 綁定記錄刪除事件
   * @param {string} recordId - 記錄 ID
   * @param {Function} handler - 處理函數
   */
  onRecordDelete(recordId, handler) {
    // 實現依賴於具體的 UI 結構
    console.log('Bind record delete:', recordId);
  },

  /**
   * 綁定鍵盤按鍵事件
   * @param {string} key - 按鍵名稱
   * @param {Function} handler - 處理函數
   */
  onKeyPress(key, handler) {
    this._addEventListener(document, 'keydown', (e) => {
      if (e.key === key) {
        handler(e);
      }
    });
  },

  /**
   * 綁定 ESC 鍵事件
   * @param {Function} handler - 處理函數
   */
  onEscapeKey(handler) {
    this.onKeyPress('Escape', handler);
  },

  /**
   * 發射自訂事件
   * @param {string} eventName - 事件名稱
   * @param {*} data - 事件數據
   */
  emit(eventName, data) {
    const listeners = this.customListeners[eventName] || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  },

  /**
   * 監聽自訂事件
   * @param {string} eventName - 事件名稱
   * @param {Function} handler - 處理函數
   */
  on(eventName, handler) {
    if (!this.customListeners[eventName]) {
      this.customListeners[eventName] = [];
    }
    this.customListeners[eventName].push(handler);
  },

  /**
   * 移除事件監聽器
   * @param {string} eventName - 事件名稱
   * @param {Function} handler - 處理函數
   */
  off(eventName, handler) {
    if (!this.customListeners[eventName]) return;
    
    const index = this.customListeners[eventName].indexOf(handler);
    if (index > -1) {
      this.customListeners[eventName].splice(index, 1);
    }
  }
};

// 導出便利函數
export const {
  init,
  bindAllEvents,
  unbindAllEvents,
  onFormSubmit,
  onFieldChange,
  onButtonClick,
  onRecordEdit,
  onRecordDelete,
  onKeyPress,
  onEscapeKey,
  emit,
  on,
  off
} = EventHandlers;

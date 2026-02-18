/**
 * HKJRA 教練記錄系統 · 跳繩課堂 Checkpoint
 * system.js · legacy compatibility layer
 *
 * 目的：
 * - 保留既有 HTML / 舊版腳本對全域變數的依賴
 * - 實際邏輯全部改用模組化入口 src/main.js
 *
 * 新開發請改用 ES modules：
 *   import { initApp, STORAGE_MANAGER } from './src/main.js';
 */

import {
  // 初始化與設定
  initApp,
  initLoginPage,
  APP_CONFIG,
  getConfig,
  getAppInfo,
  isModuleAvailable,

  // 工具
  $, $q, $qa,
  escapeHtml,
  toast,
  todayStr,
  timeToMinutes,
  formatFileSize,

  // 常數
  STORAGE_KEY,
  RANGE_IDS,

  // Core / Auth
  STORAGE_MANAGER,
  LOGIN_MANAGER,
  AUTH_CONFIG,

  // Services
  storageService,
  StorageService,
  RecordsService,
  PresetsService,
  UsersService,
  ValidationService,

  // UI
  UI_MANAGER,
  FormManager,
  ListRenderer,
  ModalManager,
  TricksManager,
  AttachmentsManager,
  EventHandlers,
} from './src/main.js';

// ---------------------------------------------------------------------------
// 舊版全域 API 相容層
// ---------------------------------------------------------------------------

// 初始化相關
window.initApp        = initApp;
window.initLoginPage  = initLoginPage;
window.APP_CONFIG     = APP_CONFIG;
window.getConfig      = getConfig;
window.getAppInfo     = getAppInfo;
window.isModuleAvailable = isModuleAvailable;

// 工具與共用函式
window.$              = $;
window.$q             = $q;
window.$qa            = $qa;
window.escapeHtml     = escapeHtml;
window.toast          = toast;
window.todayStr       = todayStr;
window.timeToMinutes  = timeToMinutes;
window.formatFileSize = formatFileSize;

// 常數
window.STORAGE_KEY = STORAGE_KEY;
window.RANGE_IDS    = RANGE_IDS;

// Core / Auth
window.STORAGE_MANAGER = STORAGE_MANAGER;
window.LOGIN_MANAGER   = LOGIN_MANAGER;
window.AUTH_CONFIG     = AUTH_CONFIG;

// Services
window.storageService   = storageService;
window.StorageService   = StorageService;
window.RecordsService   = RecordsService;
window.PresetsService   = PresetsService;
window.UsersService     = UsersService;
window.ValidationService = ValidationService;

// UI 管理
window.UI_MANAGER        = UI_MANAGER;
window.FormManager       = FormManager;
window.ListRenderer      = ListRenderer;
window.ModalManager      = ModalManager;
window.TricksManager     = TricksManager;
window.AttachmentsManager = AttachmentsManager;
window.EventHandlers     = EventHandlers;

// ---------------------------------------------------------------------------
// Legacy API wrappers (temporary - to be migrated)
// ---------------------------------------------------------------------------

// TODO: legacy wrapper，後續應遷移到 RecordsService / 新 API
window.parseRecords = function legacyParseRecords() {
  try {
    // 若新架構提供 RecordsService.getAll() 之類的 API，可以直接呼叫
    if (typeof RecordsService !== 'undefined' && RecordsService.getAll) {
      return RecordsService.getAll();
    }
    // 否則 fallback 到 STORAGE_MANAGER.getCheckpoints()
    if (STORAGE_MANAGER && typeof STORAGE_MANAGER.getCheckpoints === 'function') {
      return STORAGE_MANAGER.getCheckpoints();
    }
    return [];
  } catch (e) {
    console.error('legacy parseRecords() failed:', e);
    return [];
  }
};

window.saveRecords = function legacySaveRecords(records) {
  try {
    if (typeof RecordsService !== 'undefined' && RecordsService.saveAll) {
      return RecordsService.saveAll(records);
    }
    if (STORAGE_MANAGER && typeof STORAGE_MANAGER.saveCheckpoints === 'function') {
      return STORAGE_MANAGER.saveCheckpoints(records);
    }
  } catch (e) {
    console.error('legacy saveRecords() failed:', e);
    throw e;
  }
};

// ---------------------------------------------------------------------------
// 模組匯出（給非瀏覽器環境 / 測試使用）
// ---------------------------------------------------------------------------

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initApp,
    initLoginPage,
    APP_CONFIG,
    getConfig,
    getAppInfo,
    isModuleAvailable,

    $,
    $q,
    $qa,
    escapeHtml,
    toast,
    todayStr,
    timeToMinutes,
    formatFileSize,

    STORAGE_KEY,
    RANGE_IDS,

    STORAGE_MANAGER,
    LOGIN_MANAGER,
    AUTH_CONFIG,

    storageService,
    StorageService,
    RecordsService,
    PresetsService,
    UsersService,
    ValidationService,

    UI_MANAGER,
    FormManager,
    ListRenderer,
    ModalManager,
    TricksManager,
    AttachmentsManager,
    EventHandlers,

    // Legacy wrappers
    parseRecords: window.parseRecords,
    saveRecords: window.saveRecords,
  };
}

console.log('✅ system.js loaded as compatibility layer over src/main.js');

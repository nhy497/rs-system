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

(async function initSystemCompat() {
  try {
    // 動態載入模組化系統
    const {
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
    } = await import('./src/main.js');

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

    console.log('✅ system.js loaded as compatibility layer over src/main.js');

    // 觸發 DOMContentLoaded 後的初始化（如果需要）
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('📦 system.js ready after DOMContentLoaded');
      });
    } else {
      console.log('📦 system.js ready (DOM already loaded)');
    }

  } catch (error) {
    console.error('❌ Failed to load modular system:', error);
    // 提供基本錯誤訊息給使用者
    if (typeof document !== 'undefined') {
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#fee;color:#c00;padding:1rem 2rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:99999;font-family:sans-serif;';
      errDiv.innerHTML = '<strong>⚠️ 系統載入失敗</strong><br>請檢查瀏覽器控制台以獲取詳細資訊';
      document.body?.appendChild(errDiv);
    }
  }
})();

/**
 * 應用程式初始化 - 主應用啟動邏輯
 * @module init/app-init
 *
 * 此模組負責協調整個應用程式的初始化流程，包括：
 * - 核心服務初始化
 * - UI 組件初始化
 * - 資料載入
 * - 事件處理器設置
 * - 錯誤處理
 *
 * 依賴於 Phase 1-3 的模組（待實現時取消註解）
 */

import { APP_CONFIG, getConfig } from './config.js';

// ============ Phase 1-3 依賴（待模組創建後啟用） ============
// import { STORAGE_MANAGER } from '../core/storage-manager.js';
// import { LOGIN_MANAGER } from '../core/login-manager.js';
// import { RecordsService } from '../services/records-service.js';
// import { UI_MANAGER } from '../ui/ui-manager.js';
// import { EventHandlers } from '../ui/event-handlers.js';
// import { $, $q, $qa } from '../utils/dom-utils.js';
// import { toast } from '../utils/helpers.js';

/**
 * 應用程式狀態
 * @private
 */
const AppState = {
  initialized: false,
  initStartTime: 0,
  initEndTime: 0,
  modules: {
    storage: false,
    auth: false,
    ui: false,
    services: false,
    eventHandlers: false
  },
  errors: [],
  config: null
};

/**
 * 應用程式初始化管理器
 * @namespace AppInit
 */
export const AppInit = {
  /**
   * 主初始化函式 - 協調所有初始化步驟
   * @param {Object} [options={}] - 初始化選項
   * @param {string} [options.env] - 環境名稱
   * @param {boolean} [options.skipAuth] - 是否跳過認證檢查
   * @param {boolean} [options.skipUI] - 是否跳過 UI 初始化
   * @param {Function} [options.onProgress] - 進度回調函式
   * @returns {Promise<boolean>} 初始化是否成功
   *
   * @example
   * // 基本初始化
   * await AppInit.init();
   *
   * @example
   * // 開發環境初始化
   * await AppInit.init({ env: 'development' });
   *
   * @example
   * // 帶進度回調的初始化
   * await AppInit.init({
   *   onProgress: (step, progress) => console.log(`${step}: ${progress}%`)
   * });
   */
  async init(options = {}) {
    if (AppState.initialized) {
      console.warn('⚠️ 應用程式已經初始化，跳過重複初始化');
      return true;
    }

    AppState.initStartTime = Date.now();
    console.log('🚀 開始應用程式初始化...');

    try {
      // 階段 1: 預初始化
      await this.preInit(options);
      this._reportProgress(options.onProgress, '預初始化', 10);

      // 階段 2: 載入配置
      this._loadConfig(options.env);
      this._reportProgress(options.onProgress, '載入配置', 20);

      // 階段 3: 初始化儲存
      if (!options.skipStorage) {
        await this.initStorage();
        this._reportProgress(options.onProgress, '初始化儲存', 40);
      }

      // 階段 4: 初始化認證
      if (!options.skipAuth) {
        await this.initAuth();
        this._reportProgress(options.onProgress, '初始化認證', 55);
      }

      // 階段 5: 初始化 UI
      if (!options.skipUI) {
        await this.initUI();
        this._reportProgress(options.onProgress, '初始化 UI', 70);
      }

      // 階段 6: 初始化服務
      await this.initServices();
      this._reportProgress(options.onProgress, '初始化服務', 80);

      // 階段 7: 設置事件處理器
      await this.initEventHandlers();
      this._reportProgress(options.onProgress, '設置事件處理器', 90);

      // 階段 8: 載入初始資料
      await this.loadInitialData();
      this._reportProgress(options.onProgress, '載入資料', 95);

      // 階段 9: 後初始化
      await this.postInit();
      this._reportProgress(options.onProgress, '完成初始化', 100);

      AppState.initialized = true;
      AppState.initEndTime = Date.now();

      const duration = AppState.initEndTime - AppState.initStartTime;
      console.log(`✅ 應用程式初始化完成 (耗時: ${duration}ms)`);

      return true;
    } catch (error) {
      this.handleInitError(error);
      return false;
    }
  },

  /**
   * 預初始化 - 在主初始化之前執行
   * @param {Object} [options={}] - 選項
   * @returns {Promise<void>}
   */
  async preInit(options = {}) {
    console.log('📋 執行預初始化...');

    // 檢查必要的全域物件
    if (typeof window === 'undefined') {
      throw new Error('此應用程式僅能在瀏覽器環境中運行');
    }

    // 檢查 localStorage 可用性
    try {
      const testKey = '__rs_system_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      throw new Error('localStorage 不可用，請檢查瀏覽器設定');
    }

    // 設置全域錯誤處理器
    this.setupGlobalErrorHandler();

    console.log('✅ 預初始化完成');
  },

  /**
   * 後初始化 - 在主初始化之後執行
   * @returns {Promise<void>}
   */
  async postInit() {
    console.log('🔧 執行後初始化...');

    // 觸發初始化完成事件
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('rs-system:initialized', {
        detail: {
          duration: AppState.initEndTime - AppState.initStartTime,
          modules: AppState.modules
        }
      }));
    }

    // 執行已註冊的回調
    this._executeReadyCallbacks();

    console.log('✅ 後初始化完成');
  },

  /**
   * 初始化儲存系統
   * @returns {Promise<void>}
   */
  async initStorage() {
    console.log('💾 初始化儲存系統...');

    try {
      // TODO: 待 Phase 2 完成後啟用
      // await STORAGE_MANAGER.init();

      // 臨時實現：使用全域物件（如果存在）
      if (typeof window !== 'undefined' && window.STORAGE_MANAGER) {
        await window.STORAGE_MANAGER.init();
      }

      AppState.modules.storage = true;
      console.log('✅ 儲存系統初始化完成');
    } catch (error) {
      AppState.errors.push({ module: 'storage', error });
      throw new Error(`儲存系統初始化失敗: ${error.message}`);
    }
  },

  /**
   * 初始化認證系統
   * @returns {Promise<void>}
   */
  async initAuth() {
    console.log('🔐 初始化認證系統...');

    try {
      // TODO: 待 Phase 2 完成後啟用
      // await LOGIN_MANAGER.init();

      // 臨時實現：使用全域物件（如果存在）
      if (typeof window !== 'undefined' && window.LOGIN_MANAGER) {
        window.LOGIN_MANAGER.init();
      }

      AppState.modules.auth = true;
      console.log('✅ 認證系統初始化完成');
    } catch (error) {
      AppState.errors.push({ module: 'auth', error });
      throw new Error(`認證系統初始化失敗: ${error.message}`);
    }
  },

  /**
   * 初始化 UI 系統
   * @returns {Promise<void>}
   */
  async initUI() {
    console.log('🎨 初始化 UI 系統...');

    try {
      // TODO: 待 Phase 3 完成後啟用
      // await UI_MANAGER.init();

      // 臨時實現：使用全域物件（如果存在）
      if (typeof window !== 'undefined' && window.UI_MANAGER) {
        window.UI_MANAGER.init();
      }

      AppState.modules.ui = true;
      console.log('✅ UI 系統初始化完成');
    } catch (error) {
      AppState.errors.push({ module: 'ui', error });
      throw new Error(`UI 系統初始化失敗: ${error.message}`);
    }
  },

  /**
   * 初始化服務層
   * @returns {Promise<void>}
   */
  async initServices() {
    console.log('⚙️ 初始化服務層...');

    try {
      // 初始化 PouchDB（如果可用）
      if (typeof PouchDB !== 'undefined' && typeof window !== 'undefined' && window.storageService) {
        const currentUser = window.LOGIN_MANAGER?.getCurrentUser?.();
        const dbName = AppState.config?.DB_NAME || 'rs-system-shared';
        const remoteURL = AppState.config?.REMOTE_DB_URL || null;

        const db = new PouchDB(dbName);
        await window.storageService.init(db, remoteURL);

        console.log(`✅ PouchDB 初始化成功: ${dbName}`);
      }

      AppState.modules.services = true;
      console.log('✅ 服務層初始化完成');
    } catch (error) {
      // PouchDB 失敗不應阻止應用程式啟動
      console.warn('⚠️ 服務層初始化部分失敗:', error);
      AppState.modules.services = true;
    }
  },

  /**
   * 初始化事件處理器
   * @returns {Promise<void>}
   */
  async initEventHandlers() {
    console.log('📡 初始化事件處理器...');

    try {
      // TODO: 待 Phase 3 完成後啟用
      // EventHandlers.init();

      // 設置基本事件處理器
      this._setupBasicEventHandlers();

      AppState.modules.eventHandlers = true;
      console.log('✅ 事件處理器初始化完成');
    } catch (error) {
      AppState.errors.push({ module: 'eventHandlers', error });
      throw new Error(`事件處理器初始化失敗: ${error.message}`);
    }
  },

  /**
   * 載入初始資料
   * @returns {Promise<void>}
   */
  async loadInitialData() {
    console.log('📦 載入初始資料...');

    try {
      // 載入用戶偏好設定
      await this.loadUserPreferences();

      // TODO: 載入其他初始資料

      console.log('✅ 初始資料載入完成');
    } catch (error) {
      // 資料載入失敗不應阻止應用程式啟動
      console.warn('⚠️ 初始資料載入部分失敗:', error);
    }
  },

  /**
   * 載入用戶偏好設定
   * @returns {Promise<void>}
   */
  async loadUserPreferences() {
    try {
      const prefs = localStorage.getItem('rs-system-preferences');
      if (prefs) {
        const preferences = JSON.parse(prefs);
        AppState.preferences = preferences;
        console.log('✅ 用戶偏好設定已載入');
      }
    } catch (error) {
      console.warn('⚠️ 載入用戶偏好設定失敗:', error);
    }
  },

  /**
   * 設置應用程式狀態
   * @param {Object} state - 狀態物件
   */
  setAppState(state) {
    Object.assign(AppState, state);
  },

  /**
   * 獲取應用程式狀態
   * @returns {Object} 當前狀態
   */
  getAppState() {
    return { ...AppState };
  },

  /**
   * 處理初始化錯誤
   * @param {Error} error - 錯誤物件
   */
  handleInitError(error) {
    console.error('❌ 應用程式初始化失敗:', error);
    AppState.errors.push({ module: 'init', error });

    // 顯示錯誤訊息給用戶
    if (typeof window !== 'undefined') {
      const errorMsg = `應用程式初始化失敗：${error.message}\n\n請重新載入頁面或聯繫管理員。`;

      // 嘗試使用 toast 顯示
      if (window.toast) {
        window.toast(errorMsg, 'error');
      } else {
        alert(errorMsg);
      }
    }

    // 記錄到日誌服務（如果可用）
    if (typeof window !== 'undefined' && window.loggerService) {
      window.loggerService.logSystemEvent('app_init_error', error.message, 'error');
    }
  },

  /**
   * 設置全域錯誤處理器
   */
  setupGlobalErrorHandler() {
    if (typeof window === 'undefined') return;

    // 捕獲未處理的錯誤
    window.addEventListener('error', event => {
      console.error('❌ 全域錯誤:', event.error);
      AppState.errors.push({ type: 'global', error: event.error });

      if (window.loggerService) {
        window.loggerService.logSystemEvent('global_error', event.error?.message || 'Unknown error', 'error');
      }
    });

    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', event => {
      console.error('❌ 未處理的 Promise 拒絕:', event.reason);
      AppState.errors.push({ type: 'promise', error: event.reason });

      if (window.loggerService) {
        window.loggerService.logSystemEvent('unhandled_rejection', event.reason?.message || 'Unknown rejection', 'error');
      }
    });

    console.log('✅ 全域錯誤處理器已設置');
  },

  /**
   * 註冊就緒回調
   * @param {Function} callback - 回調函式
   */
  onReady(callback) {
    if (typeof callback !== 'function') {
      console.warn('⚠️ onReady: 回調必須是函式');
      return;
    }

    if (!this._readyCallbacks) {
      this._readyCallbacks = [];
    }

    if (AppState.initialized) {
      // 已經初始化，立即執行
      callback();
    } else {
      // 尚未初始化，加入待執行列表
      this._readyCallbacks.push(callback);
    }
  },

  /**
   * 註冊卸載前回調
   * @param {Function} callback - 回調函式
   */
  onBeforeUnload(callback) {
    if (typeof window === 'undefined') return;
    if (typeof callback !== 'function') {
      console.warn('⚠️ onBeforeUnload: 回調必須是函式');
      return;
    }

    window.addEventListener('beforeunload', callback);
  },

  // ============ 私有方法 ============

  /**
   * 載入配置
   * @private
   */
  _loadConfig(env) {
    AppState.config = getConfig(env);

    if (AppState.config.DEBUG) {
      console.log('📋 應用程式配置:', AppState.config);
    }
  },

  /**
   * 報告進度
   * @private
   */
  _reportProgress(callback, step, progress) {
    if (typeof callback === 'function') {
      callback(step, progress);
    }
  },

  /**
   * 執行就緒回調
   * @private
   */
  _executeReadyCallbacks() {
    if (!this._readyCallbacks || this._readyCallbacks.length === 0) {
      return;
    }

    console.log(`🔔 執行 ${this._readyCallbacks.length} 個就緒回調...`);

    this._readyCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ 就緒回調執行失敗:', error);
      }
    });

    // 清空回調列表
    this._readyCallbacks = [];
  },

  /**
   * 設置基本事件處理器
   * @private
   */
  _setupBasicEventHandlers() {
    if (typeof window === 'undefined') return;

    // 登出按鈕
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm('確定要登出嗎？')) {
          window.LOGIN_MANAGER?.logout();
        }
      });
    }

    // 匯出按鈕
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
      btnExport.addEventListener('click', e => {
        e.preventDefault();
        if (typeof window.doExportCsv === 'function') {
          window.doExportCsv();
        }
      });
    }

    // 設定按鈕
    const btnSettings = document.getElementById('btnSettings');
    if (btnSettings) {
      btnSettings.addEventListener('click', e => {
        e.preventDefault();
        alert('系統設置功能即將推出');
      });
    }

    // beforeunload 保存資料
    window.addEventListener('beforeunload', () => {
      if (window.STORAGE_MANAGER?.cache?.checkpoints) {
        window.STORAGE_MANAGER.saveCheckpoints(window.STORAGE_MANAGER.cache.checkpoints);
      }
    });
  }
};

// 預設匯出
export default AppInit;

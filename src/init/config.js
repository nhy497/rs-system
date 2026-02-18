/**
 * 應用程式配置 - 全域設定與環境變數
 * @module init/config
 * 
 * 此模組集中管理所有應用程式配置，包括：
 * - 應用基本資訊
 * - 環境設定
 * - 功能開關
 * - 儲存配置
 * - UI 設定
 */

/**
 * 應用程式主要配置
 * @constant {Object} APP_CONFIG
 */
export const APP_CONFIG = {
  // ============ 應用資訊 ============
  APP_NAME: 'RS-System',
  APP_VERSION: '3.0.0',
  APP_TITLE: 'HKJRA 教練記錄系統 · 跳繩課堂 Checkpoint',
  
  // ============ 環境設定 ============
  ENV: 'production',  // 'development' | 'production' | 'test'
  DEBUG: false,
  
  // ============ 儲存設定 ============
  STORAGE_PREFIX: 'rope-skip-',
  STORAGE_KEYS: {
    CHECKPOINTS: 'rope-skip-checkpoints',
    PRESETS: 'rope-skip-class-presets',
    SESSION: 'rs-system-session',
    CURRENT_USER: 'current-user',
    USERS: 'users',
    BACKUP_TIMESTAMP: 'backup-timestamp'
  },
  
  // 快取設定
  CACHE_TTL: 3600000,  // 1 小時 (毫秒)
  CACHE_ENABLED: true,
  
  // 儲存配額
  STORAGE_QUOTA: 5 * 1024 * 1024,  // 5MB
  MAX_RETRIES: 3,
  
  // 自動備份
  AUTO_BACKUP_ENABLED: true,
  AUTO_BACKUP_INTERVAL: 3600000,  // 1 小時
  
  // ============ PouchDB 設定 ============
  DB_NAME: 'rs-system-shared',
  REMOTE_DB_URL: null,
  SYNC_ENABLED: false,
  SYNC_OPTIONS: {
    live: true,
    retry: true,
    continuous: true
  },
  
  // ============ UI 設定 ============
  DEFAULT_THEME: 'light',
  TOAST_DURATION: 3000,  // 3 秒
  MODAL_ANIMATION: true,
  MODAL_BACKDROP: true,
  
  // 分頁設定
  RECORDS_PER_PAGE: 20,
  MAX_ITEMS_PER_PAGE: 100,
  
  // ============ 檔案上傳 ============
  MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ],
  COMPRESSION_THRESHOLD: 100,  // 超過 100 個記錄時壓縮
  
  // ============ 認證設定 ============
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,  // 24 小時
  PASSWORD_MIN_LENGTH: 4,
  REMEMBER_ME_DAYS: 30,
  
  // ============ 角色與權限 ============
  ROLES: {
    CREATOR: 'creator',
    COACH: 'coach',
    VIEWER: 'viewer',
    ADMIN: 'admin'
  },
  
  // ============ 課程設定 ============
  SCORE_1_5_IDS: ['engagement', 'positivity', 'enthusiasm', 'satisfaction'],
  RANGE_IDS: [
    'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
    'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
    'teachScore', 'satisfaction', 'flexibility', 'individual'
  ],
  
  // 動作難度等級
  TRICK_LEVELS: ['初級', '中級', '進階'],
  
  // 頁面標題
  PAGE_TITLES: {
    overview: '課堂概覽',
    students: '學生管理',
    actions: '動作記錄',
    analytics: '統計分析',
    data: '數據管理'
  },
  
  // ============ 功能開關 ============
  FEATURES: {
    CLOUD_SYNC: false,           // 雲端同步
    EXPORT_PDF: true,            // PDF 匯出
    EXPORT_CSV: true,            // CSV 匯出
    ATTACHMENTS: true,           // 檔案附件
    ADVANCED_SEARCH: false,      // 進階搜尋
    MULTI_USER: true,            // 多用戶支援
    AUTO_SAVE: true,             // 自動儲存
    OFFLINE_MODE: true,          // 離線模式
    CROSS_TAB_SYNC: true,        // 跨標籤頁同步
    LOGGER: true,                // 日誌記錄
    TEST_MODE: true              // 測試模式
  },
  
  // ============ 開發設定 ============
  DEV: {
    SHOW_CONSOLE_LOGS: true,
    SHOW_PERFORMANCE_METRICS: false,
    MOCK_DATA_ENABLED: false,
    DISABLE_ANALYTICS: true
  }
};

/**
 * 環境特定配置
 * @private
 */
const ENV_CONFIGS = {
  development: {
    DEBUG: true,
    SYNC_ENABLED: false,
    DEV: {
      SHOW_CONSOLE_LOGS: true,
      SHOW_PERFORMANCE_METRICS: true,
      MOCK_DATA_ENABLED: true,
      DISABLE_ANALYTICS: true
    }
  },
  
  production: {
    DEBUG: false,
    SYNC_ENABLED: false,
    DEV: {
      SHOW_CONSOLE_LOGS: false,
      SHOW_PERFORMANCE_METRICS: false,
      MOCK_DATA_ENABLED: false,
      DISABLE_ANALYTICS: true
    }
  },
  
  test: {
    DEBUG: true,
    SYNC_ENABLED: false,
    STORAGE_PREFIX: 'test-rope-skip-',
    DB_NAME: 'test-rs-system-shared',
    DEV: {
      SHOW_CONSOLE_LOGS: true,
      SHOW_PERFORMANCE_METRICS: false,
      MOCK_DATA_ENABLED: true,
      DISABLE_ANALYTICS: true
    }
  }
};

/**
 * 獲取環境特定配置
 * @param {string} [env] - 環境名稱 ('development' | 'production' | 'test')
 * @returns {Object} 合併後的配置物件
 * 
 * @example
 * // 獲取開發環境配置
 * const config = getConfig('development');
 * 
 * @example
 * // 獲取當前環境配置
 * const config = getConfig();
 */
export const getConfig = (env = APP_CONFIG.ENV) => {
  const envConfig = ENV_CONFIGS[env] || ENV_CONFIGS.production;
  
  return {
    ...APP_CONFIG,
    ...envConfig,
    // 深度合併 DEV 配置
    DEV: {
      ...APP_CONFIG.DEV,
      ...(envConfig.DEV || {})
    },
    // 深度合併 FEATURES 配置
    FEATURES: {
      ...APP_CONFIG.FEATURES,
      ...(envConfig.FEATURES || {})
    }
  };
};

/**
 * 從環境變數或 URL 參數設置配置
 * @returns {Object} 更新後的配置
 * 
 * @example
 * // URL: ?env=development&debug=true
 * const config = getConfigFromEnv();
 * // config.ENV === 'development'
 * // config.DEBUG === true
 */
export const getConfigFromEnv = () => {
  const config = { ...APP_CONFIG };
  
  // 從 URL 參數讀取
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    
    // 環境設定
    if (params.has('env')) {
      config.ENV = params.get('env');
    }
    
    // Debug 模式
    if (params.has('debug')) {
      config.DEBUG = params.get('debug') === 'true';
    }
    
    // 功能開關
    if (params.has('sync')) {
      config.SYNC_ENABLED = params.get('sync') === 'true';
    }
  }
  
  return getConfig(config.ENV);
};

/**
 * 驗證配置的有效性
 * @param {Object} config - 要驗證的配置物件
 * @returns {boolean} 配置是否有效
 * 
 * @example
 * const isValid = validateConfig(APP_CONFIG);
 */
export const validateConfig = (config) => {
  const required = [
    'APP_NAME',
    'APP_VERSION',
    'STORAGE_KEYS',
    'FEATURES'
  ];
  
  for (const key of required) {
    if (!(key in config)) {
      console.error(`❌ 配置驗證失敗: 缺少必要欄位 "${key}"`);
      return false;
    }
  }
  
  // 驗證儲存鍵值
  if (!config.STORAGE_KEYS.CHECKPOINTS || !config.STORAGE_KEYS.SESSION) {
    console.error('❌ 配置驗證失敗: STORAGE_KEYS 不完整');
    return false;
  }
  
  return true;
};

/**
 * 顯示配置資訊（僅開發模式）
 * @param {Object} [config] - 要顯示的配置，預設為 APP_CONFIG
 */
export const printConfig = (config = APP_CONFIG) => {
  if (!config.DEBUG) return;
  
  console.group('📋 應用程式配置');
  console.log('環境:', config.ENV);
  console.log('版本:', config.APP_VERSION);
  console.log('Debug 模式:', config.DEBUG);
  console.log('功能開關:', config.FEATURES);
  console.groupEnd();
};

// 預設匯出
export default APP_CONFIG;

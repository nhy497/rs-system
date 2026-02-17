/**
 * RS-System 主入口點
 * @module main
 * 
 * 此模組提供統一的 API 存取點，匯出所有核心功能模組。
 * 適用於：
 * - ES 模組環境
 * - 需要按需導入特定功能
 * - 自訂初始化流程
 * 
 * @example
 * // 導入特定模組
 * import { AppInit, APP_CONFIG } from './src/main.js';
 * 
 * @example
 * // 導入所有模組
 * import * as RSSystem from './src/main.js';
 */

// ============================================================================
// 核心初始化模組（Phase 4）
// ============================================================================

export { AppInit } from './init/app-init.js';
export { LoginPageInit } from './init/login-page-init.js';
export { APP_CONFIG, getConfig, getConfigFromEnv, validateConfig, printConfig } from './init/config.js';

// ============================================================================
// Phase 1-3 模組（待創建後啟用）
// ============================================================================

// ============ 核心服務（Phase 2） ============
// export { STORAGE_MANAGER } from './core/storage-manager.js';
// export { LOGIN_MANAGER } from './core/login-manager.js';
// export { AUTH_CONFIG } from './core/auth-config.js';

// ============ 數據服務（Phase 2） ============
// export { storageService, StorageService } from './services/storage-service.js';
// export { RecordsService } from './services/records-service.js';
// export { PresetsService } from './services/presets-service.js';
// export { UsersService } from './services/users-service.js';
// export { ValidationService } from './services/validation-service.js';

// ============ UI 管理（Phase 3） ============
// export { UI_MANAGER } from './ui/ui-manager.js';
// export { FormManager } from './ui/form-manager.js';
// export { ListRenderer } from './ui/list-renderer.js';
// export { ModalManager } from './ui/modal-manager.js';
// export { TricksManager } from './ui/tricks-manager.js';
// export { AttachmentsManager } from './ui/attachments-manager.js';
// export { EventHandlers } from './ui/event-handlers.js';

// ============ 工具函式（Phase 1） ============
// export { $, $q, $qa } from './utils/dom-utils.js';
// export { escapeHtml, toast, todayStr } from './utils/helpers.js';
// export { formatFileSize, timeToMinutes, minutesToTime } from './utils/formatters.js';
// export { isRequired, isValidDate, isValidTime, isInRange } from './utils/validators.js';

// ============ 常數（Phase 1） ============
// export { STORAGE_KEY, RANGE_IDS } from './constants/app-constants.js';

// ============================================================================
// 版本資訊
// ============================================================================

/**
 * RS-System 版本號
 * @constant {string}
 */
export const VERSION = '3.0.0';

/**
 * 建置日期
 * @constant {string}
 */
export const BUILD_DATE = new Date().toISOString();

/**
 * 版本資訊物件
 * @constant {Object}
 */
export const VERSION_INFO = {
  version: VERSION,
  buildDate: BUILD_DATE,
  name: 'RS-System',
  fullName: 'HKJRA 教練記錄系統 · 跳繩課堂 Checkpoint'
};

// ============================================================================
// 快速啟動 API
// ============================================================================

/**
 * 快速初始化應用程式
 * 
 * 這是最簡單的初始化方式，自動執行所有初始化步驟。
 * 
 * @param {Object} [options={}] - 初始化選項
 * @param {string} [options.env] - 環境名稱 ('development' | 'production' | 'test')
 * @param {boolean} [options.skipAuth] - 是否跳過認證檢查
 * @param {boolean} [options.skipUI] - 是否跳過 UI 初始化
 * @param {Function} [options.onProgress] - 進度回調函式
 * @returns {Promise<boolean>} 初始化是否成功
 * 
 * @example
 * // 基本使用
 * await initApp();
 * 
 * @example
 * // 開發環境初始化
 * await initApp({ env: 'development' });
 * 
 * @example
 * // 帶進度回調
 * await initApp({
 *   onProgress: (step, progress) => {
 *     console.log(`${step}: ${progress}%`);
 *   }
 * });
 */
export async function initApp(options = {}) {
  const { AppInit } = await import('./init/app-init.js');
  return AppInit.init(options);
}

/**
 * 初始化登入頁面
 * 
 * 在登入頁面自動設置登入/註冊表單處理邏輯。
 * 
 * @returns {Promise<boolean>} 初始化是否成功
 * 
 * @example
 * // 在 login.html 中使用
 * await initLoginPage();
 */
export async function initLoginPage() {
  const { LoginPageInit } = await import('./init/login-page-init.js');
  return LoginPageInit.init();
}

/**
 * 獲取應用程式資訊
 * @returns {Object} 應用程式資訊
 * 
 * @example
 * const info = getAppInfo();
 * console.log(info.version); // "3.0.0"
 */
export function getAppInfo() {
  return {
    ...VERSION_INFO,
    modules: {
      init: true,
      // TODO: 待其他 Phase 完成後更新
      core: false,
      services: false,
      ui: false,
      utils: false,
      constants: false
    }
  };
}

/**
 * 檢查模組是否可用
 * @param {string} moduleName - 模組名稱
 * @returns {boolean} 模組是否可用
 * 
 * @example
 * if (isModuleAvailable('core')) {
 *   // 使用核心模組
 * }
 */
export function isModuleAvailable(moduleName) {
  const availableModules = ['init'];
  // TODO: 待其他 Phase 完成後添加: 'core', 'services', 'ui', 'utils', 'constants'
  
  return availableModules.includes(moduleName);
}

// ============================================================================
// 預設匯出
// ============================================================================

// Note: 預設匯出已移除，請使用具名匯入
// import { initApp, APP_CONFIG } from './src/main.js';


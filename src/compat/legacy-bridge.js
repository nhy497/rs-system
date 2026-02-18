/**
 * 向後相容橋接層
 * 提供舊版本 API 支援，並顯示棄用警告
 * @module compat/legacy-bridge
 * @deprecated 此模組僅用於過渡期，未來版本將移除
 * 
 * 此模組提供：
 * - 全域變數橋接（window.STORAGE_MANAGER 等）
 * - 舊版函式轉接
 * - 棄用警告系統
 * - 平滑遷移路徑
 * 
 * 使用方式：
 * 在需要向後相容的頁面中引入此模組
 * 
 * @example
 * import { setupLegacyGlobals } from './src/compat/legacy-bridge.js';
 * setupLegacyGlobals();
 */

// ============================================================================
// Phase 1-3 模組引用（待創建後啟用）
// ============================================================================

// import { STORAGE_MANAGER } from '../core/storage-manager.js';
// import { LOGIN_MANAGER } from '../core/login-manager.js';
// import { RecordsService } from '../services/records-service.js';
// import { UI_MANAGER } from '../ui/ui-manager.js';
// import { $, $q, $qa } from '../utils/dom-utils.js';

/**
 * 棄用警告計數器（避免重複警告）
 * @private
 */
const deprecationWarnings = new Map();

/**
 * 顯示棄用警告
 * @param {string} oldAPI - 舊 API 名稱
 * @param {string} newAPI - 新 API 名稱
 * @param {boolean} [once=true] - 是否只顯示一次
 * 
 * @example
 * deprecationWarning('window.STORAGE_MANAGER', 'import { STORAGE_MANAGER }');
 */
function deprecationWarning(oldAPI, newAPI, once = true) {
  // 檢查是否已經顯示過
  if (once && deprecationWarnings.has(oldAPI)) {
    return;
  }
  
  console.warn(
    `%c[DEPRECATED] ${oldAPI}`,
    'color: #FF9800; font-weight: bold',
    `\n已棄用，請使用: ${newAPI}`,
    `\n此 API 將在下一個主版本中移除。`,
    `\n詳見遷移指南: MIGRATION.md`
  );
  
  // 標記為已警告
  if (once) {
    deprecationWarnings.set(oldAPI, true);
  }
}

/**
 * 建立向後相容的全域物件
 * 將模組化的服務掛載到 window 物件，並提供棄用警告
 * 
 * @example
 * // 在應用初始化時呼叫
 * setupLegacyGlobals();
 * 
 * // 然後可以使用舊版 API
 * window.STORAGE_MANAGER.init();  // 會顯示棄用警告
 */
export function setupLegacyGlobals() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ 非瀏覽器環境，無法設置全域物件');
    return;
  }
  
  console.log('🔄 設置向後相容全域物件...');
  
  // ============ STORAGE_MANAGER ============
  if (!window.STORAGE_MANAGER) {
    Object.defineProperty(window, 'STORAGE_MANAGER', {
      get() {
        deprecationWarning(
          'window.STORAGE_MANAGER',
          'import { STORAGE_MANAGER } from "./src/core/storage-manager.js"'
        );
        
        // TODO: 待 Phase 2 完成後返回實際模組
        // return STORAGE_MANAGER;
        
        // 臨時：返回現有的全域物件（如果存在）
        return this._STORAGE_MANAGER || null;
      },
      set(value) {
        this._STORAGE_MANAGER = value;
      },
      configurable: true
    });
  }
  
  // ============ LOGIN_MANAGER ============
  if (!window.LOGIN_MANAGER) {
    Object.defineProperty(window, 'LOGIN_MANAGER', {
      get() {
        deprecationWarning(
          'window.LOGIN_MANAGER',
          'import { LOGIN_MANAGER } from "./src/core/login-manager.js"'
        );
        
        // TODO: 待 Phase 2 完成後返回實際模組
        // return LOGIN_MANAGER;
        
        // 臨時：返回現有的全域物件（如果存在）
        return this._LOGIN_MANAGER || null;
      },
      set(value) {
        this._LOGIN_MANAGER = value;
      },
      configurable: true
    });
  }
  
  // ============ UI_MANAGER ============
  if (!window.UI_MANAGER) {
    Object.defineProperty(window, 'UI_MANAGER', {
      get() {
        deprecationWarning(
          'window.UI_MANAGER',
          'import { UI_MANAGER } from "./src/ui/ui-manager.js"'
        );
        
        // TODO: 待 Phase 3 完成後返回實際模組
        // return UI_MANAGER;
        
        // 臨時：返回現有的全域物件（如果存在）
        return this._UI_MANAGER || null;
      },
      set(value) {
        this._UI_MANAGER = value;
      },
      configurable: true
    });
  }
  
  // ============ DOM 工具函式 ============
  if (!window.$) {
    Object.defineProperty(window, '$', {
      get() {
        deprecationWarning(
          'window.$',
          'import { $ } from "./src/utils/dom-utils.js"'
        );
        
        // TODO: 待 Phase 1 完成後返回實際模組
        // return $;
        
        // 臨時：返回基本實現
        return (id) => document.getElementById(id);
      },
      configurable: true
    });
  }
  
  if (!window.$q) {
    Object.defineProperty(window, '$q', {
      get() {
        deprecationWarning(
          'window.$q',
          'import { $q } from "./src/utils/dom-utils.js"'
        );
        
        // TODO: 待 Phase 1 完成後返回實際模組
        // return $q;
        
        // 臨時：返回基本實現
        return (sel) => document.querySelector(sel);
      },
      configurable: true
    });
  }
  
  if (!window.$qa) {
    Object.defineProperty(window, '$qa', {
      get() {
        deprecationWarning(
          'window.$qa',
          'import { $qa } from "./src/utils/dom-utils.js"'
        );
        
        // TODO: 待 Phase 1 完成後返回實際模組
        // return $qa;
        
        // 臨時：返回基本實現
        return (sel) => document.querySelectorAll(sel);
      },
      configurable: true
    });
  }
  
  console.log('✅ 向後相容全域物件已設置');
}

/**
 * 舊版函式轉接 API
 * 提供舊版函式的轉接，並顯示棄用警告
 * 
 * @namespace legacyAPI
 */
export const legacyAPI = {
  /**
   * 舊版：parseRecords()
   * @deprecated 請使用 RecordsService.parseRecords()
   */
  parseRecords(data) {
    deprecationWarning(
      'parseRecords()',
      'import { RecordsService } from "./src/services/records-service.js"; RecordsService.parseRecords()'
    );
    
    // TODO: 待 Phase 2 完成後轉接
    // return RecordsService.parseRecords(data);
    
    // 臨時：返回原始資料
    console.warn('⚠️ parseRecords: Phase 2 模組尚未實現，返回原始資料');
    return data;
  },
  
  /**
   * 舊版：saveRecords()
   * @deprecated 請使用 RecordsService.saveRecords()
   */
  saveRecords(records) {
    deprecationWarning(
      'saveRecords()',
      'import { RecordsService } from "./src/services/records-service.js"; RecordsService.saveRecords()'
    );
    
    // TODO: 待 Phase 2 完成後轉接
    // return RecordsService.saveRecords(records);
    
    // 臨時：使用 localStorage
    console.warn('⚠️ saveRecords: Phase 2 模組尚未實現，使用臨時實現');
    try {
      localStorage.setItem('rope-skip-checkpoints', JSON.stringify(records));
      return true;
    } catch (error) {
      console.error('❌ saveRecords 失敗:', error);
      return false;
    }
  },
  
  /**
   * 舊版：loadRecords()
   * @deprecated 請使用 RecordsService.loadRecords()
   */
  loadRecords() {
    deprecationWarning(
      'loadRecords()',
      'import { RecordsService } from "./src/services/records-service.js"; RecordsService.loadRecords()'
    );
    
    // TODO: 待 Phase 2 完成後轉接
    // return RecordsService.loadRecords();
    
    // 臨時：從 localStorage 讀取
    console.warn('⚠️ loadRecords: Phase 2 模組尚未實現，使用臨時實現');
    try {
      const data = localStorage.getItem('rope-skip-checkpoints');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ loadRecords 失敗:', error);
      return [];
    }
  },
  
  /**
   * 舊版：toast()
   * @deprecated 請使用 import { toast } from "./src/utils/helpers.js"
   */
  toast(message, type = 'info') {
    deprecationWarning(
      'toast()',
      'import { toast } from "./src/utils/helpers.js"'
    );
    
    // TODO: 待 Phase 1 完成後轉接
    // return toast(message, type);
    
    // 臨時：使用 alert
    console.warn('⚠️ toast: Phase 1 模組尚未實現，使用 alert');
    alert(`[${type.toUpperCase()}] ${message}`);
  },
  
  /**
   * 舊版：escapeHtml()
   * @deprecated 請使用 import { escapeHtml } from "./src/utils/helpers.js"
   */
  escapeHtml(str) {
    deprecationWarning(
      'escapeHtml()',
      'import { escapeHtml } from "./src/utils/helpers.js"'
    );
    
    // TODO: 待 Phase 1 完成後轉接
    // return escapeHtml(str);
    
    // 臨時：基本實現
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

/**
 * 檢查並遷移舊版儲存資料
 * 將舊版格式的資料遷移到新版格式
 * 
 * @returns {boolean} 是否需要遷移
 */
export function migrateStorageData() {
  console.log('🔍 檢查是否需要遷移儲存資料...');
  
  try {
    // 檢查舊版資料
    const oldCheckpoints = localStorage.getItem('rope-skip-checkpoints');
    const oldPresets = localStorage.getItem('rope-skip-class-presets');
    
    if (!oldCheckpoints && !oldPresets) {
      console.log('✅ 無需遷移');
      return false;
    }
    
    console.log('📦 發現舊版資料，準備遷移...');
    
    // TODO: 實現資料遷移邏輯
    // 1. 解析舊版資料
    // 2. 轉換為新版格式
    // 3. 保存到新版儲存
    // 4. 備份舊版資料
    // 5. 清除舊版資料（可選）
    
    console.log('⚠️ 資料遷移功能尚未實現');
    return false;
    
  } catch (error) {
    console.error('❌ 遷移檢查失敗:', error);
    return false;
  }
}

/**
 * 獲取遷移狀態
 * @returns {Object} 遷移狀態資訊
 */
export function getMigrationStatus() {
  return {
    hasLegacyData: Boolean(
      localStorage.getItem('rope-skip-checkpoints') ||
      localStorage.getItem('rope-skip-class-presets')
    ),
    warningsCount: deprecationWarnings.size,
    warnings: Array.from(deprecationWarnings.keys())
  };
}

/**
 * 清除棄用警告記錄
 * 主要用於測試
 */
export function clearDeprecationWarnings() {
  deprecationWarnings.clear();
  console.log('✅ 棄用警告記錄已清除');
}

// ============================================================================
// 預設匯出
// ============================================================================

export default {
  setupLegacyGlobals,
  legacyAPI,
  migrateStorageData,
  getMigrationStatus,
  clearDeprecationWarnings,
  deprecationWarning
};

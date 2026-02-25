/**
 * 錯誤處理服務
 * 提供統一的錯誤處理和日誌記錄機制
 * @module ErrorHandlingService
 */

/**
 * 錯誤類型枚舉
 */
export const ErrorType = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  STORAGE: 'storage',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  RUNTIME: 'runtime',
  SYSTEM: 'system'
};

/**
 * 錯誤嚴重級別枚舉
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * 自定義錯誤類
 */
export class RSSystemError extends Error {
  constructor(message, type = ErrorType.RUNTIME, severity = ErrorSeverity.MEDIUM, context = {}) {
    super(message);
    this.name = 'RSSystemError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.stack = (new Error()).stack;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * 錯誤處理服務類
 */
class ErrorHandlingService {
  constructor() {
    this.errorHandlers = new Map();
    this.errorLog = [];
    this.maxLogSize = 1000;
    this.isInitialized = false;
  }

  /**
   * 初始化錯誤處理服務
   */
  init() {
    if (this.isInitialized) return;

    // 設置全局錯誤處理器
    this.setupGlobalErrorHandlers();
    
    // 註冊默認錯誤處理器
    this.registerDefaultHandlers();
    
    this.isInitialized = true;
    console.log('✅ ErrorHandlingService 初始化完成');
  }

  /**
   * 設置全局錯誤處理器
   */
  setupGlobalErrorHandlers() {
    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new RSSystemError(
          event.reason?.message || '未處理的 Promise 拒絕',
          ErrorType.RUNTIME,
          ErrorSeverity.HIGH,
          { reason: event.reason }
        )
      );
    });

    // 捕獲未處理的錯誤
    window.addEventListener('error', (event) => {
      this.handleError(
        new RSSystemError(
          event.message || '未處理的錯誤',
          ErrorType.RUNTIME,
          ErrorSeverity.HIGH,
          { 
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
          }
        )
      );
    });
  }

  /**
   * 註冊默認錯誤處理器
   */
  registerDefaultHandlers() {
    // 驗證錯誤處理器
    this.registerHandler(ErrorType.VALIDATION, (error) => {
      console.warn('⚠️ 驗證錯誤:', error.message);
      this.showUserNotification(error.message, 'warning');
    });

    // 網絡錯誤處理器
    this.registerHandler(ErrorType.NETWORK, (error) => {
      console.error('🌐 網絡錯誤:', error.message);
      this.showUserNotification('網絡連接失敗，請檢查網絡設置', 'error');
    });

    // 存儲錯誤處理器
    this.registerHandler(ErrorType.STORAGE, (error) => {
      console.error('💾 存儲錯誤:', error.message);
      this.showUserNotification('數據保存失敗，請重試', 'error');
    });

    // 認證錯誤處理器
    this.registerHandler(ErrorType.AUTHENTICATION, (error) => {
      console.error('🔐 認證錯誤:', error.message);
      this.showUserNotification('登入失敗，請檢查用戶名和密碼', 'error');
    });

    // 運行時錯誤處理器
    this.registerHandler(ErrorType.RUNTIME, (error) => {
      console.error('🚨 運行時錯誤:', error.message);
      if (error.severity === ErrorSeverity.CRITICAL) {
        this.showUserNotification('系統發生嚴重錯誤，請重新載入頁面', 'error');
      } else {
        this.showUserNotification('操作失敗，請重試', 'warning');
      }
    });
  }

  /**
   * 註冊錯誤處理器
   * @param {string} errorType - 錯誤類型
   * @param {Function} handler - 處理函數
   */
  registerHandler(errorType, handler) {
    this.errorHandlers.set(errorType, handler);
  }

  /**
   * 處理錯誤
   * @param {Error|RSSystemError} error - 錯誤對象
   * @param {Object} options - 處理選項
   */
  handleError(error, options = {}) {
    try {
      // 標準化錯誤對象
      const standardError = this.standardizeError(error);
      
      // 記錄錯誤
      this.logError(standardError);
      
      // 獲取錯誤處理器
      const handler = this.errorHandlers.get(standardError.type);
      if (handler) {
        handler(standardError, options);
      } else {
        // 默認處理器
        this.defaultErrorHandler(standardError, options);
      }
      
      // 如果是嚴重錯誤，觸發錯誤事件
      if (standardError.severity === ErrorSeverity.CRITICAL) {
        this.dispatchErrorEvent(standardError);
      }
      
    } catch (handlingError) {
      console.error('❌ 錯誤處理器本身發生錯誤:', handlingError);
    }
  }

  /**
   * 標準化錯誤對象
   * @param {Error|RSSystemError} error - 原始錯誤
   * @returns {RSSystemError} 標準化錯誤
   */
  standardizeError(error) {
    if (error instanceof RSSystemError) {
      return error;
    }

    // 根據錯誤消息推斷錯誤類型
    let type = ErrorType.RUNTIME;
    let severity = ErrorSeverity.MEDIUM;

    if (error.message.includes('network') || error.message.includes('fetch')) {
      type = ErrorType.NETWORK;
    } else if (error.message.includes('storage') || error.message.includes('localStorage')) {
      type = ErrorType.STORAGE;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      type = ErrorType.VALIDATION;
    } else if (error.message.includes('auth') || error.message.includes('login')) {
      type = ErrorType.AUTHENTICATION;
    }

    return new RSSystemError(
      error.message || '未知錯誤',
      type,
      severity,
      { originalError: error }
    );
  }

  /**
   * 默認錯誤處理器
   * @param {RSSystemError} error - 錯誤對象
   * @param {Object} options - 處理選項
   */
  defaultErrorHandler(error, options) {
    console.error(`🚨 [${error.type.toUpperCase()}] ${error.message}`, error.context);
    
    if (!options.silent) {
      this.showUserNotification('發生錯誤，請重試', 'error');
    }
  }

  /**
   * 記錄錯誤
   * @param {RSSystemError} error - 錯誤對象
   */
  logError(error) {
    this.errorLog.push(error);
    
    // 限制日誌大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
    
    // 持久化重要錯誤
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      this.persistError(error);
    }
  }

  /**
   * 持久化錯誤
   * @param {RSSystemError} error - 錯誤對象
   */
  persistError(error) {
    try {
      const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errorLogs.push(error.toJSON());
      
      // 只保留最近100個錯誤
      if (errorLogs.length > 100) {
        errorLogs.splice(0, errorLogs.length - 100);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(errorLogs));
    } catch (persistError) {
      console.error('❌ 無法持久化錯誤日誌:', persistError);
    }
  }

  /**
   * 顯示用戶通知
   * @param {string} message - 通知消息
   * @param {string} type - 通知類型
   */
  showUserNotification(message, type = 'info') {
    try {
      // 嘗試使用 toast 函數
      if (typeof window !== 'undefined' && window.toast) {
        window.toast(message, type);
      } else {
        // 後備方案：使用 alert
        console.log(`[${type.toUpperCase()}] ${message}`);
      }
    } catch (notificationError) {
      console.error('❌ 無法顯示用戶通知:', notificationError);
    }
  }

  /**
   * 觸發錯誤事件
   * @param {RSSystemError} error - 錯誤對象
   */
  dispatchErrorEvent(error) {
    try {
      const event = new CustomEvent('rsSystemError', {
        detail: error.toJSON()
      });
      document.dispatchEvent(event);
    } catch (eventError) {
      console.error('❌ 無法觸發錯誤事件:', eventError);
    }
  }

  /**
   * 安全執行函數
   * @param {Function} fn - 要執行的函數
   * @param {Object} options - 選項
   * @returns {any} 函數執行結果
   */
  safeExecute(fn, options = {}) {
    try {
      const result = fn();
      
      // 如果返回 Promise，處理異步錯誤
      if (result && typeof result.catch === 'function') {
        return result.catch(error => {
          this.handleError(error, options);
          return null;
        });
      }
      
      return result;
    } catch (error) {
      this.handleError(error, options);
      return null;
    }
  }

  /**
   * 異步安全執行
   * @param {Function} fn - 異步函數
   * @param {Object} options - 選項
   * @returns {Promise} 執行結果
   */
  async safeExecuteAsync(fn, options = {}) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      this.handleError(error, options);
      return null;
    }
  }

  /**
   * 獲取錯誤統計
   * @returns {Object} 錯誤統計信息
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {},
      recent: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * 清除錯誤日誌
   */
  clearErrorLog() {
    this.errorLog = [];
    try {
      localStorage.removeItem('errorLogs');
    } catch (error) {
      console.error('❌ 無法清除持久化錯誤日誌:', error);
    }
  }

  /**
   * 獲取錯誤日誌
   * @param {Object} filters - 過濾條件
   * @returns {Array} 過濾後的錯誤日誌
   */
  getErrorLogs(filters = {}) {
    let logs = [...this.errorLog];

    if (filters.type) {
      logs = logs.filter(error => error.type === filters.type);
    }

    if (filters.severity) {
      logs = logs.filter(error => error.severity === filters.severity);
    }

    if (filters.since) {
      const since = new Date(filters.since);
      logs = logs.filter(error => new Date(error.timestamp) >= since);
    }

    return logs;
  }
}

// 創建單例實例
const errorHandlingService = new ErrorHandlingService();

// 自動初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      errorHandlingService.init();
    });
  } else {
    errorHandlingService.init();
  }
}

export default errorHandlingService;
export { ErrorHandlingService };

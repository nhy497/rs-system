/**
 * 內存管理服務
 * 提供內存洩漏檢測和預防機制
 * @module MemoryManagementService
 */

/**
 * 內存管理服務類
 */
class MemoryManagementService {
  constructor() {
    this.eventListeners = new Map();
    this.timers = new Set();
    this.observers = new Set();
    this.isInitialized = false;
    this.memoryStats = {
      totalListeners: 0,
      totalTimers: 0,
      totalObservers: 0,
      cleanedListeners: 0,
      cleanedTimers: 0,
      cleanedObservers: 0
    };
  }

  /**
   * 初始化內存管理服務
   */
  init() {
    if (this.isInitialized) return;

    // 設置定期清理
    this.setupPeriodicCleanup();
    
    // 監聽頁面卸載事件
    this.setupPageUnloadHandlers();
    
    this.isInitialized = true;
    console.log('✅ MemoryManagementService 初始化完成');
  }

  /**
   * 註冊事件監聽器
   * @param {Element|Window|Document} target - 目標元素
   * @param {string} event - 事件類型
   * @param {Function} handler - 處理函數
   * @param {Object} options - 選項
   * @returns {Function} 清理函數
   */
  registerEventListener(target, event, handler, options = {}) {
    if (!target || !event || !handler) {
      console.warn('⚠️ 註冊事件監聽器參數不完整');
      return () => {};
    }

    // 包裝處理函數以便追蹤
    const wrappedHandler = (...args) => {
      try {
        return handler(...args);
      } catch (error) {
        console.error('❌ 事件處理器執行錯誤:', error);
      }
    };

    // 添加監聽器
    target.addEventListener(event, wrappedHandler, options);

    // 記錄監聽器信息
    const listenerId = this.generateListenerId();
    this.eventListeners.set(listenerId, {
      target,
      event,
      handler: wrappedHandler,
      originalHandler: handler,
      options
    });

    this.memoryStats.totalListeners++;

    // 返回清理函數
    return () => {
      this.removeEventListener(listenerId);
    };
  }

  /**
   * 移除事件監聽器
   * @param {string} listenerId - 監聽器ID
   */
  removeEventListener(listenerId) {
    const listenerInfo = this.eventListeners.get(listenerId);
    if (listenerInfo) {
      const { target, event, handler } = listenerInfo;
      target.removeEventListener(event, handler);
      this.eventListeners.delete(listenerId);
      this.memoryStats.cleanedListeners++;
    }
  }

  /**
   * 註冊定時器
   * @param {Function} callback - 回調函數
   * @param {number} delay - 延遲時間
   * @param {Object} options - 選項
   * @returns {Object} 定時器對象
   */
  registerTimer(callback, delay, options = {}) {
    if (typeof callback !== 'function') {
      console.warn('⚠️ 定時器回調必須是函數');
      return null;
    }

    // 包裝回調函數
    const wrappedCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error('❌ 定時器回調執行錯誤:', error);
      }
    };

    let timerId;
    if (options.interval) {
      timerId = setInterval(wrappedCallback, delay);
    } else {
      timerId = setTimeout(wrappedCallback, delay);
    }

    // 記錄定時器信息
    const timerInfo = {
      id: timerId,
      callback: wrappedCallback,
      originalCallback: callback,
      delay,
      isInterval: options.interval || false,
      createdAt: Date.now()
    };

    this.timers.add(timerInfo);
    this.memoryStats.totalTimers++;

    return {
      id: timerId,
      clear: () => this.clearTimer(timerInfo)
    };
  }

  /**
   * 清除定時器
   * @param {Object} timerInfo - 定時器信息
   */
  clearTimer(timerInfo) {
    if (timerInfo) {
      if (timerInfo.isInterval) {
        clearInterval(timerInfo.id);
      } else {
        clearTimeout(timerInfo.id);
      }
      this.timers.delete(timerInfo);
      this.memoryStats.cleanedTimers++;
    }
  }

  /**
   * 註冊觀察器
   * @param {Object} observer - 觀察器對象
   * @param {string} type - 觀察器類型
   * @returns {Function} 清理函數
   */
  registerObserver(observer, type) {
    if (!observer) {
      console.warn('⚠️ 觀察器對象不能為空');
      return () => {};
    }

    const observerInfo = {
      observer,
      type,
      createdAt: Date.now()
    };

    this.observers.add(observerInfo);
    this.memoryStats.totalObservers++;

    return () => {
      this.removeObserver(observerInfo);
    };
  }

  /**
   * 移除觀察器
   * @param {Object} observerInfo - 觀察器信息
   */
  removeObserver(observerInfo) {
    if (observerInfo && observerInfo.observer) {
      if (typeof observerInfo.observer.disconnect === 'function') {
        observerInfo.observer.disconnect();
      } else if (typeof observerInfo.observer.unobserve === 'function') {
        observerInfo.observer.unobserve();
      }
      this.observers.delete(observerInfo);
      this.memoryStats.cleanedObservers++;
    }
  }

  /**
   * 設置定期清理
   */
  setupPeriodicCleanup() {
    // 每分鐘檢查一次
    this.registerTimer(() => {
      this.performCleanup();
    }, 60000, { interval: true });
  }

  /**
   * 設置頁面卸載處理器
   */
  setupPageUnloadHandlers() {
    // 頁面卸載時清理所有資源
    this.registerEventListener(window, 'beforeunload', () => {
      this.cleanupAll();
    });

    // 頁面隱藏時清理部分資源
    this.registerEventListener(document, 'visibilitychange', () => {
      if (document.hidden) {
        this.performLightCleanup();
      }
    });
  }

  /**
   * 執行清理
   */
  performCleanup() {
    const startTime = performance.now();
    
    // 清理過期的定時器
    this.cleanupExpiredTimers();
    
    // 清理無效的監聽器
    this.cleanupInvalidListeners();
    
    // 清理無效的觀察器
    this.cleanupInvalidObservers();
    
    const endTime = performance.now();
    console.log(`🧹 內存清理完成，耗時: ${(endTime - startTime).toFixed(2)}ms`);
  }

  /**
   * 輕量清理
   */
  performLightCleanup() {
    // 只清理定時器，保留監聽器和觀察器
    this.cleanupExpiredTimers();
  }

  /**
   * 清理過期的定時器
   */
  cleanupExpiredTimers() {
    const now = Date.now();
    const expiredTimers = [];

    this.timers.forEach(timerInfo => {
      // 清理超過5分鐘的一次性定時器
      if (!timerInfo.isInterval && (now - timerInfo.createdAt) > 300000) {
        expiredTimers.push(timerInfo);
      }
    });

    expiredTimers.forEach(timer => this.clearTimer(timer));
  }

  /**
   * 清理無效的監聽器
   */
  cleanupInvalidListeners() {
    const invalidListeners = [];

    this.eventListeners.forEach((listenerInfo, id) => {
      const { target } = listenerInfo;
      
      // 檢查目標是否仍然有效
      if (target === window || target === document) {
        return; // 全局對象始終有效
      }

      // 檢查 DOM 元素是否仍在文檔中
      if (target && typeof target.nodeType === 'number') {
        if (!document.contains(target)) {
          invalidListeners.push(id);
        }
      }
    });

    invalidListeners.forEach(id => this.removeEventListener(id));
  }

  /**
   * 清理無效的觀察器
   */
  cleanupInvalidObservers() {
    const invalidObservers = [];

    this.observers.forEach(observerInfo => {
      // 檢查觀察器是否仍然有效
      if (!observerInfo.observer || typeof observerInfo.observer.disconnect !== 'function') {
        invalidObservers.push(observerInfo);
      }
    });

    invalidObservers.forEach(observer => this.removeObserver(observer));
  }

  /**
   * 清理所有資源
   */
  cleanupAll() {
    console.log('🧹 開始清理所有內存資源...');
    
    // 清理所有監聽器
    this.eventListeners.forEach((_, id) => {
      this.removeEventListener(id);
    });

    // 清理所有定時器
    this.timers.forEach(timer => {
      this.clearTimer(timer);
    });

    // 清理所有觀察器
    this.observers.forEach(observer => {
      this.removeObserver(observer);
    });

    console.log('✅ 所有內存資源清理完成');
  }

  /**
   * 獲取內存統計信息
   * @returns {Object} 內存統計
   */
  getMemoryStats() {
    return {
      ...this.memoryStats,
      activeListeners: this.eventListeners.size,
      activeTimers: this.timers.size,
      activeObservers: this.observers.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 檢測內存洩漏
   * @returns {Object} 檢測結果
   */
  detectMemoryLeaks() {
    const stats = this.getMemoryStats();
    const leaks = {
      hasLeaks: false,
      issues: [],
      recommendations: []
    };

    // 檢查監聽器數量異常
    if (stats.activeListeners > 100) {
      leaks.hasLeaks = true;
      leaks.issues.push('事件監聽器數量過多');
      leaks.recommendations.push('檢查是否正確移除不需要的事件監聽器');
    }

    // 檢查定時器數量異常
    if (stats.activeTimers > 50) {
      leaks.hasLeaks = true;
      leaks.issues.push('定時器數量過多');
      leaks.recommendations.push('檢查是否正確清除不需要的定時器');
    }

    // 檢查觀察器數量異常
    if (stats.activeObservers > 20) {
      leaks.hasLeaks = true;
      leaks.issues.push('觀察器數量過多');
      leaks.recommendations.push('檢查是否正確斷開不需要的觀察器');
    }

    return leaks;
  }

  /**
   * 生成監聽器ID
   * @returns {string} 唯一ID
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 創建安全的事件處理器
   * @param {Function} handler - 原始處理器
   * @param {Object} options - 選項
   * @returns {Function} 安全的處理器
   */
  createSafeEventHandler(handler, options = {}) {
    let cleanup = null;

    const safeHandler = (...args) => {
      try {
        return handler(...args);
      } catch (error) {
        console.error('❌ 安全事件處理器執行錯誤:', error);
        if (options.onError) {
          options.onError(error);
        }
      }
    };

    // 如果指定了目標和事件，自動註冊
    if (options.target && options.event) {
      cleanup = this.registerEventListener(options.target, options.event, safeHandler, options.listenerOptions);
    }

    return safeHandler;
  }

  /**
   * 創建安全的定時器
   * @param {Function} callback - 回調函數
   * @param {number} delay - 延遲時間
   * @param {Object} options - 選項
   * @returns {Object} 安全的定時器
   */
  createSafeTimer(callback, delay, options = {}) {
    return this.registerTimer(callback, delay, options);
  }
}

// 創建單例實例
const memoryManagementService = new MemoryManagementService();

// 自動初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      memoryManagementService.init();
    });
  } else {
    memoryManagementService.init();
  }
}

export default memoryManagementService;
export { MemoryManagementService };

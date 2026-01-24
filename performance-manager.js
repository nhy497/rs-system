/**
 * 性能優化管理器
 * v1.1: 加速系統、優化記憶體使用、改進加載速度
 */

const PERFORMANCE_MANAGER = {
  // 配置
  CONFIG: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 500,
    BATCH_SIZE: 50, // 批量操作的大小
    CACHE_TTL: 300000 // 5 分鐘
  },

  // 內部狀態
  cache: new Map(),
  timers: new Map(),
  throttleState: new Map(),

  /**
   * 初始化性能管理器
   */
  init() {
    try {
      // 延遲加載非關鍵資源
      this.setupLazyLoading();
      
      // 設置效能監控
      this.setupPerformanceMonitoring();
      
      // 預加載常用資源
      this.preloadResources();
      
      console.log('✅ 性能管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 性能管理器初始化失敗:', error);
      return false;
    }
  },

  /**
   * 防抖函數（用於搜索、輸入等高頻事件）
   */
  debounce(func, delay = this.CONFIG.DEBOUNCE_DELAY) {
    return function(...args) {
      const key = func.name || Math.random();
      
      clearTimeout(this.timers.get(key));
      
      const timer = setTimeout(() => {
        func.apply(this, args);
        this.timers.delete(key);
      }, delay);
      
      this.timers.set(key, timer);
    };
  },

  /**
   * 節流函數（用於滾動、窗口大小改變等事件）
   */
  throttle(func, delay = this.CONFIG.THROTTLE_DELAY) {
    const key = func.name || Math.random();
    
    return (...args) => {
      const state = this.throttleState.get(key);
      
      if (!state || Date.now() >= state.nextRun) {
        func.apply(this, args);
        this.throttleState.set(key, {
          nextRun: Date.now() + delay
        });
      }
    };
  },

  /**
   * 快取系統（帶 TTL）
   */
  setCache(key, value, ttl = this.CONFIG.CACHE_TTL) {
    this.cache.set(key, {
      value: value,
      expiresAt: Date.now() + ttl
    });
  },

  getCache(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  },

  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  },

  /**
   * 延遲加載（Lazy Loading）
   */
  setupLazyLoading() {
    try {
      // 觀察圖片和重型元素
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const el = entry.target;
              
              // 加載圖片
              if (el.tagName === 'IMG' && el.dataset.src) {
                el.src = el.dataset.src;
                el.removeAttribute('data-src');
              }
              
              // 加載 iframe
              if (el.tagName === 'IFRAME' && el.dataset.src) {
                el.src = el.dataset.src;
                el.removeAttribute('data-src');
              }
              
              obs.unobserve(el);
            }
          });
        });

        document.querySelectorAll('[data-src]').forEach(el => {
          observer.observe(el);
        });
      }
    } catch (error) {
      console.error('⚠️ 延遲加載設置失敗:', error);
    }
  },

  /**
   * 預加載常用資源
   */
  preloadResources() {
    try {
      // 預加載字體
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&display=swap';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      // 預連接到 CDN
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = 'https://cdn.jsdelivr.net';
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);

      console.log('✅ 資源預加載完成');
    } catch (error) {
      console.error('⚠️ 預加載失敗:', error);
    }
  },

  /**
   * 效能監控
   */
  setupPerformanceMonitoring() {
    try {
      // 使用 Performance Observer 監控長任務
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              console.warn(`⚠️ 長任務檢測: ${entry.duration.toFixed(2)}ms`);
            }
          });

          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          // PerformanceObserver 不支援 longtask
        }
      }

      // 頁面卸載時輸出效能數據
      window.addEventListener('unload', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          const metrics = {
            'DNS 查詢': perfData.domainLookupEnd - perfData.domainLookupStart,
            '建立連接': perfData.connectEnd - perfData.connectStart,
            '請求時間': perfData.responseStart - perfData.requestStart,
            '回應時間': perfData.responseEnd - perfData.responseStart,
            'DOM 解析': perfData.domInteractive - perfData.domLoading,
            '資源加載': perfData.loadEventEnd - perfData.domContentLoadedEventEnd,
            '總耗時': perfData.loadEventEnd - perfData.fetchStart
          };

          console.log('📊 效能統計:', metrics);
        }
      });
    } catch (error) {
      console.error('⚠️ 效能監控設置失敗:', error);
    }
  },

  /**
   * 批量操作（減少重排和重繪）
   */
  batchOperation(operations, callback) {
    try {
      const chunks = [];
      for (let i = 0; i < operations.length; i += this.CONFIG.BATCH_SIZE) {
        chunks.push(operations.slice(i, i + this.CONFIG.BATCH_SIZE));
      }

      let currentChunk = 0;

      const processChunk = () => {
        if (currentChunk >= chunks.length) {
          callback && callback();
          return;
        }

        const chunk = chunks[currentChunk];
        
        // 使用 requestAnimationFrame 優化重排
        requestAnimationFrame(() => {
          chunk.forEach(op => op());
          currentChunk++;
          
          // 延遲處理下一批，讓主線程有休息時間
          setTimeout(processChunk, 0);
        });
      };

      processChunk();
    } catch (error) {
      console.error('❌ 批量操作失敗:', error);
    }
  },

  /**
   * 虛擬滾動（處理大列表）
   */
  setupVirtualScrolling(container, items, itemHeight, renderItem) {
    try {
      const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
      let scrollTop = 0;

      const updateScroll = this.throttle(() => {
        scrollTop = container.scrollTop;
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleCount, items.length);

        // 動態渲染可見項
        this.batchOperation(
          items.slice(startIndex, endIndex).map((item, i) => 
            () => renderItem(item, startIndex + i)
          ),
          () => {
            console.log(`✅ 虛擬滾動更新: ${startIndex}-${endIndex}`);
          }
        );
      }, this.CONFIG.THROTTLE_DELAY);

      container.addEventListener('scroll', updateScroll);

      // 初始渲染
      updateScroll();
    } catch (error) {
      console.error('⚠️ 虛擬滾動設置失敗:', error);
    }
  },

  /**
   * Web Worker 支援（後台計算）
   */
  async offloadToWorker(code, data) {
    try {
      const blob = new Blob([`
        self.onmessage = function(event) {
          const result = (${code})(event.data);
          self.postMessage(result);
        }
      `], { type: 'application/javascript' });

      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      return new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
          resolve(event.data);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
        };

        worker.onerror = (error) => {
          reject(error);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
        };

        worker.postMessage(data);
      });
    } catch (error) {
      console.error('⚠️ Worker 方法失敗:', error);
      return null;
    }
  },

  /**
   * 獲取性能報告
   */
  getPerformanceReport() {
    try {
      const paint = performance.getEntriesByType('paint');
      const navigation = performance.getEntriesByType('navigation')[0];

      return {
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime.toFixed(2) + 'ms',
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime.toFixed(2) + 'ms',
        domContentLoaded: (navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2) + 'ms',
        pageLoadTime: (navigation.loadEventEnd - navigation.fetchStart).toFixed(2) + 'ms',
        memoryUsage: performance.memory ? {
          usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
          totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + 'MB'
        } : 'N/A'
      };
    } catch (error) {
      console.error('⚠️ 取得性能報告失敗:', error);
      return null;
    }
  }
};

// 自動初始化
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    PERFORMANCE_MANAGER.init();
  });
}

// 導出以供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PERFORMANCE_MANAGER;
}

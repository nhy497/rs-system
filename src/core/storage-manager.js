/**
 * 儲存管理器 - 統一管理 LocalStorage 操作
 * @module core/storage-manager
 */

import { STORAGE_KEY } from '../constants/app-constants.js';

/**
 * 儲存管理器對象
 * 提供基礎儲存操作、緩存管理、備份恢復和跨標籤頁同步功能
 */
export const STORAGE_MANAGER = {
  /**
   * 儲存鍵名常量
   */
  KEYS: {
    CHECKPOINTS: 'rope-skip-checkpoints',
    PRESETS: 'rope-skip-class-presets',
    SESSION: 'rs-system-session',
    CURRENT_USER: 'current-user',
    USERS: 'users',
    BACKUP_TIMESTAMP: 'backup-timestamp'
  },

  /**
   * 配置選項
   */
  CONFIG: {
    MAX_RETRIES: 3,
    STORAGE_QUOTA: 5 * 1024 * 1024,
    AUTO_BACKUP_INTERVAL: 3600000,
    COMPRESSION_THRESHOLD: 100
  },

  /**
   * 內部緩存
   */
  cache: {
    checkpoints: null,
    presets: null,
    lastSync: 0
  },

  /**
   * 跨標籤頁同步通道
   */
  channel: null,
  _syncTimeout: null,

  /**
   * 初始化儲存管理器
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async init() {
    try {
      this.testLocalStorage();
      await this.loadCache();
      this.startAutoBackup();
      this.setupSync();
      if (typeof createSyncIndicator === 'function') {
        createSyncIndicator();
      }
      console.log('✅ 存儲管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 存儲管理器初始化失敗:', error);
      return false;
    }
  },

  /**
   * 設置跨標籤頁同步
   */
  setupSync() {
    if (!('BroadcastChannel' in window)) {
      console.warn('⚠️ 瀏覽器不支援 BroadcastChannel，跨標籤頁同步已禁用');
      return;
    }

    try {
      this.channel = new BroadcastChannel('rs-system-sync');

      this.channel.onmessage = event => {
        const { type } = event.data || {};
        if (type !== 'storage-updated') return;

        clearTimeout(this._syncTimeout);
        this._syncTimeout = setTimeout(async () => {
          try {
            if (typeof SYNC_PERFORMANCE_MONITOR !== 'undefined') {
              SYNC_PERFORMANCE_MONITOR.start();
            }

            this.cache.checkpoints = null;
            this.cache.lastSync = 0;
            await this.loadCache();

            if (typeof refreshAllViews === 'function') {
              refreshAllViews();
            }

            if (typeof showSyncNotification === 'function') {
              showSyncNotification('info', '📡 數據已同步');
            }

            if (typeof SYNC_PERFORMANCE_MONITOR !== 'undefined') {
              SYNC_PERFORMANCE_MONITOR.end();
            }

            console.log('✅ 已同步更新數據');
          } catch (error) {
            console.error('❌ 同步處理失敗:', error);
          }
        }, 300);
      };

      this.channel.onerror = error => {
        console.error('❌ BroadcastChannel 錯誤:', error);
      };

      console.log('✅ 跨標籤頁同步已啟用');
    } catch (error) {
      console.error('❌ 設置跨標籤頁同步失敗:', error);
    }
  },

  /**
   * 測試 localStorage 可用性
   * @returns {boolean} 是否可用
   * @throws {Error} 如果 localStorage 不可用
   */
  testLocalStorage() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      throw new Error('localStorage 不可用或已滿');
    }
  },

  /**
   * 獲取課堂記錄
   * @param {string|null} userId - 用戶 ID（可選）
   * @returns {Promise<Array>} 課堂記錄數組
   */
  async getCheckpoints(userId = null) {
    try {
      // 優先使用緩存
      if (this.cache.checkpoints && Date.now() - this.cache.lastSync < 300000) {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role === 'creator') {
          return userId ? this.cache.checkpoints.filter(cp => cp.userId === userId) : this.cache.checkpoints;
        }
        return this.cache.checkpoints;
      }

      // 從 localStorage 讀取（使用統一編碼）
      const encoded = localStorage.getItem(this.KEYS.CHECKPOINTS);
      if (!encoded) {
        this.cache.checkpoints = [];
        this.cache.lastSync = Date.now();
        console.log('📦 getCheckpoints() 讀取筆數: 0 (無數據)');
        return [];
      }

      let decoded = [];
      try {
        // 統一使用 encodeURIComponent + btoa 編碼方式
        decoded = JSON.parse(decodeURIComponent(atob(encoded)));
      } catch (e1) {
        try {
          // 兼容舊的 btoa 方式
          decoded = JSON.parse(atob(encoded));
        } catch (e2) {
          // 最後嘗試直接解析
          try {
            decoded = JSON.parse(encoded);
          } catch (e3) {
            console.warn('⚠️ 解析課堂記錄失敗:', e3);
            decoded = [];
          }
        }
      }

      const safe = Array.isArray(decoded) ? decoded : [];
      this.cache.checkpoints = safe;
      this.cache.lastSync = Date.now();
      console.log(`📦 getCheckpoints() 讀取筆數: ${safe.length}`);

      // 創作者可以查看所有記錄，普通用戶只能查看自己的
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.role === 'creator') {
        return userId ? safe.filter(cp => cp.userId === userId) : safe;
      }
      return safe;
    } catch (error) {
      console.error('❌ getCheckpoints() 讀取失敗:', error);
      const backup = this.getBackup();
      if (backup && backup.checkpoints) {
        console.log('📦 從備份恢復課堂記錄');
        this.cache.checkpoints = backup.checkpoints;
        return backup.checkpoints;
      }
      return [];
    }
  },

  /**
   * 保存課堂記錄
   * @param {Array} records - 記錄數組
   * @returns {Promise<boolean>} 保存是否成功
   */
  async saveCheckpoints(records) {
    // 統一存儲方法，與 saveRecords() 使用相同編碼
    let retryCount = 0;
    while (retryCount < this.CONFIG.MAX_RETRIES) {
      try {
        if (!Array.isArray(records)) throw new Error('數據格式無效');

        // 為每筆記錄添加用戶ID（如果尚未添加）
        const currentUser = getCurrentUser();
        const recordsWithUserId = records.map(record => {
          if (!record.userId && currentUser) {
            return { ...record, userId: currentUser.userId || currentUser.id };
          }
          return record;
        });

        // 統一使用 encodeURIComponent + btoa 編碼方式
        const jsonStr = JSON.stringify(recordsWithUserId);
        const encoded = btoa(encodeURIComponent(jsonStr));

        if (encoded.length > this.CONFIG.STORAGE_QUOTA) {
          console.warn('⚠️ 存儲空間不足');
          this.cleanupOldData(recordsWithUserId);
          continue;
        }

        localStorage.setItem(this.KEYS.CHECKPOINTS, encoded);
        this.cache.checkpoints = recordsWithUserId;
        this.cache.lastSync = Date.now();
        console.log(`✅ STORAGE_MANAGER.saveCheckpoints() 保存 ${recordsWithUserId.length} 筆課堂記錄`);
        if (recordsWithUserId.length > 0) {
          console.log('📊 範例記錄:', recordsWithUserId[0]);
        }

        // ⭐ [PLAN-A1] 通知其他標籤頁數據已更新
        if (this.channel) {
          try {
            this.channel.postMessage({
              type: 'storage-updated',
              timestamp: Date.now(),
              recordCount: recordsWithUserId.length
            });
            console.log('📡 已通知其他標籤頁');
          } catch (error) {
            console.warn('⚠️ 通知其他標籤頁失敗:', error);
          }
        }
        return true;
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ 保存失敗，重試 ${retryCount}/${this.CONFIG.MAX_RETRIES}`);
        if (retryCount >= this.CONFIG.MAX_RETRIES) {
          console.error('❌ 保存課堂記錄失敗:', error);
          this.saveBackup(records);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }
    return false;
  },

  /**
   * 獲取班級預設
   * @returns {Promise<Array>} 預設數組
   */
  async getPresets() {
    try {
      if (this.cache.presets && Date.now() - this.cache.lastSync < 300000) {
        return this.cache.presets;
      }
      const raw = localStorage.getItem(this.KEYS.PRESETS);
      const presets = raw ? JSON.parse(raw) : [];
      this.cache.presets = presets;
      return presets;
    } catch (error) {
      console.error('❌ 讀取班級預設失敗:', error);
      return [];
    }
  },

  /**
   * 保存班級預設
   * @param {Array} presets - 預設數組
   * @returns {Promise<boolean>} 保存是否成功
   */
  async savePresets(presets) {
    try {
      localStorage.setItem(this.KEYS.PRESETS, JSON.stringify(presets));
      this.cache.presets = presets;
      console.log(`✅ 保存 ${presets.length} 個班級預設`);
      return true;
    } catch (error) {
      console.error('❌ 保存班級預設失敗:', error);
      return false;
    }
  },

  /**
   * 清理舊數據
   * @param {Array} records - 記錄數組
   * @returns {Array} 清理後的記錄數組
   */
  cleanupOldData(records) {
    try {
      if (records.length > 500) {
        const sorted = [...records].sort((a, b) =>
          (b.classDate || '').localeCompare(a.classDate || '')
        );
        return sorted.slice(0, 500);
      }
      return records;
    } catch (error) {
      console.error('❌ 清理舊數據失敗:', error);
      return records;
    }
  },

  /**
   * 啟動自動備份
   */
  startAutoBackup() {
    setInterval(() => {
      try {
        const checkpoints = this.cache.checkpoints || [];
        const presets = this.cache.presets || [];
        this.saveBackup({ checkpoints, presets });
        console.log('✅ 自動備份完成');
      } catch (error) {
        console.error('❌ 自動備份失敗:', error);
      }
    }, this.CONFIG.AUTO_BACKUP_INTERVAL);
  },

  /**
   * 保存備份
   * @param {*} data - 要備份的數據
   */
  saveBackup(data) {
    try {
      const backup = { timestamp: Date.now(), data, version: '2.1' };
      sessionStorage.setItem(`backup_${Date.now()}`, JSON.stringify(backup));

      const allBackups = Object.keys(sessionStorage)
        .filter(key => key.startsWith('backup_'))
        .sort()
        .reverse();

      for (let i = 3; i < allBackups.length; i++) {
        sessionStorage.removeItem(allBackups[i]);
      }
      localStorage.setItem(this.KEYS.BACKUP_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('⚠️ 備份保存失敗:', error);
    }
  },

  /**
   * 獲取最新備份
   * @returns {*|null} 備份數據或 null
   */
  getBackup() {
    try {
      const allBackups = Object.keys(sessionStorage)
        .filter(key => key.startsWith('backup_'))
        .sort()
        .reverse();

      if (allBackups.length > 0) {
        const latestBackup = JSON.parse(sessionStorage.getItem(allBackups[0]));
        return latestBackup.data;
      }
      return null;
    } catch (error) {
      console.error('⚠️ 備份恢復失敗:', error);
      return null;
    }
  },

  /**
   * 加載緩存
   * @returns {Promise<void>}
   */
  async loadCache() {
    try {
      // 直接從 localStorage 讀取，避免循環調用
      const encoded = localStorage.getItem(this.KEYS.CHECKPOINTS);
      if (encoded) {
        try {
          this.cache.checkpoints = JSON.parse(decodeURIComponent(atob(encoded)));
        } catch (e1) {
          try {
            this.cache.checkpoints = JSON.parse(atob(encoded));
          } catch (e2) {
            try {
              this.cache.checkpoints = JSON.parse(encoded);
            } catch (e3) {
              this.cache.checkpoints = [];
            }
          }
        }
      } else {
        this.cache.checkpoints = [];
      }

      const presetsRaw = localStorage.getItem(this.KEYS.PRESETS);
      this.cache.presets = presetsRaw ? JSON.parse(presetsRaw) : [];
      this.cache.lastSync = Date.now();
      console.log('✅ 快取已加載');
    } catch (error) {
      console.error('⚠️ 快取加載失敗:', error);
      this.cache.checkpoints = [];
      this.cache.presets = [];
    }
  },

  /**
   * 清除所有數據
   * @returns {boolean} 清除是否成功
   */
  clearAll() {
    try {
      if (!confirm('確定要清除所有數據嗎？此操作無法復原。')) return false;
      for (const key of Object.values(this.KEYS)) {
        localStorage.removeItem(key);
      }
      this.cache = { checkpoints: [], presets: [], lastSync: 0 };
      console.log('✅ 所有數據已清除');
      return true;
    } catch (error) {
      console.error('❌ 清除數據失敗:', error);
      return false;
    }
  },

  /**
   * 獲取儲存統計信息
   * @returns {Object} 統計信息對象
   */
  getStats() {
    let totalSize = 0;
    const details = {};
    for (const [name, key] of Object.entries(this.KEYS)) {
      const value = localStorage.getItem(key);
      if (value) {
        const size = (value.length / 1024).toFixed(2);
        details[name] = `${size} KB`;
        totalSize += parseFloat(size);
      }
    }
    return {
      totalSize: `${totalSize.toFixed(2)} KB`,
      details,
      usage: `${((totalSize / (this.CONFIG.STORAGE_QUOTA / 1024)) * 100).toFixed(1)}%`
    };
  }
};

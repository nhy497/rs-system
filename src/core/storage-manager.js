/**
 * 儲存管理器 - 統一管理 LocalStorage 操作
 * @module core/storage-manager
 */

import { encodeData, decodeData } from '../utils/encoding-utils.js';

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
    lastSync: 0,
    cacheDuration: 300000
  },

  _isCacheValid() {
    return this.cache.checkpoints &&
           Date.now() - this.cache.lastSync < this.cache.cacheDuration;
  },

  _clearInvalidCache() {
    if (!this._isCacheValid()) {
      this.cache.checkpoints = null;
      this.cache.lastSync = 0;
    }
  },

  channel: null,
  _syncTimeout: null,

  /**
   * 初始化儲存管理器
   * @returns {Promise<boolean>}
   */
  async init() {
    try {
      this.testLocalStorage();
      await this.loadCache();
      this.startAutoBackup();
      this.setupSync();
      console.log('✅ 存儲管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 存儲管理器初始化失敗:', error);
      return false;
    }
  },

  // ===== 通用 get/set/remove/clear API (供 test 使用) =====

  /**
   * 通用獲取值
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(`Retrieval error: ${error.message}`);
    }
  },

  /**
   * 通用設置值
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(`Storage error: ${error.message}`);
    }
  },

  /**
   * 通用刪除值
   * @param {string} key
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Remove error: ${error.message}`);
    }
  },

  /**
   * 清空所有通用儲存
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      localStorage.clear();
    } catch (error) {
      throw new Error(`Clear error: ${error.message}`);
    }
  },

  // ===== 以下為原有業務邏輯 =====

  setupSync() {
    if (!('BroadcastChannel' in window)) return;
    try {
      this.channel = new BroadcastChannel('rs-system-sync');
      this.channel.onmessage = event => {
        const { type } = event.data || {};
        if (type !== 'storage-updated') return;
        clearTimeout(this._syncTimeout);
        this._syncTimeout = setTimeout(async () => {
          try {
            this.cache.checkpoints = null;
            this.cache.lastSync = 0;
            await this.loadCache();
            if (typeof refreshAllViews === 'function') refreshAllViews();
            console.log('✅ 已同步更新數據');
          } catch (error) {
            console.error('❌ 同步處理失敗:', error);
          }
        }, 300);
      };
    } catch (error) {
      console.error('❌ 設置跨標籤頁同步失敗:', error);
    }
  },

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

  async getCheckpoints(userId = null) {
    try {
      if (this._isCacheValid()) {
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (currentUser && currentUser.role === 'creator') {
          return userId ? this.cache.checkpoints.filter(cp => cp.userId === userId) : this.cache.checkpoints;
        }
        return this.cache.checkpoints;
      }
      const encoded = localStorage.getItem(this.KEYS.CHECKPOINTS);
      if (!encoded) {
        this.cache.checkpoints = [];
        this.cache.lastSync = Date.now();
        return [];
      }
      const decoded = decodeData(encoded);
      this.cache.checkpoints = decoded;
      this.cache.lastSync = Date.now();
      const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      if (currentUser && currentUser.role === 'creator') {
        return userId ? decoded.filter(cp => cp.userId === userId) : decoded;
      }
      return decoded;
    } catch (error) {
      console.error('❌ getCheckpoints() 讀取失敗:', error);
      return [];
    }
  },

  async saveCheckpoints(records) {
    let retryCount = 0;
    while (retryCount < this.CONFIG.MAX_RETRIES) {
      try {
        if (!Array.isArray(records)) throw new Error('數據格式無效');
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        const recordsWithUserId = records.map(record => {
          if (!record.userId && currentUser) {
            return { ...record, userId: currentUser.userId || currentUser.id };
          }
          return record;
        });
        const jsonStr = JSON.stringify(recordsWithUserId);
        const encoded = encodeData(jsonStr);
        if (encoded.length > this.CONFIG.STORAGE_QUOTA) {
          console.warn('⚠️ 存儲空間不足');
          this.cleanupOldData(recordsWithUserId);
          continue;
        }
        localStorage.setItem(this.KEYS.CHECKPOINTS, encoded);
        this.cache.checkpoints = recordsWithUserId;
        this.cache.lastSync = Date.now();
        if (this.channel) {
          try {
            this.channel.postMessage({ type: 'storage-updated', timestamp: Date.now(), recordCount: recordsWithUserId.length });
          } catch (e) {}
        }
        return true;
      } catch (error) {
        retryCount++;
        if (retryCount >= this.CONFIG.MAX_RETRIES) {
          console.error('❌ 保存課堂記錄失敗:', error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }
    return false;
  },

  async getPresets() {
    try {
      if (this.cache.presets && Date.now() - this.cache.lastSync < 300000) return this.cache.presets;
      const raw = localStorage.getItem(this.KEYS.PRESETS);
      const presets = raw ? JSON.parse(raw) : [];
      this.cache.presets = presets;
      return presets;
    } catch (error) {
      console.error('❌ 讀取班級預設失敗:', error);
      return [];
    }
  },

  async savePresets(presets) {
    try {
      localStorage.setItem(this.KEYS.PRESETS, JSON.stringify(presets));
      this.cache.presets = presets;
      return true;
    } catch (error) {
      console.error('❌ 保存班級預設失敗:', error);
      return false;
    }
  },

  cleanupOldData(records) {
    try {
      if (records.length > 500) {
        const sorted = [...records].sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
        return sorted.slice(0, 500);
      }
      return records;
    } catch (error) {
      return records;
    }
  },

  startAutoBackup() {
    setInterval(() => {
      try {
        const checkpoints = this.cache.checkpoints || [];
        const presets = this.cache.presets || [];
        this.saveBackup({ checkpoints, presets });
      } catch (error) {
        console.error('❌ 自動備份失敗:', error);
      }
    }, this.CONFIG.AUTO_BACKUP_INTERVAL);
  },

  saveBackup(data) {
    try {
      const backup = { timestamp: Date.now(), data, version: '2.1' };
      sessionStorage.setItem(`backup_${Date.now()}`, JSON.stringify(backup));
      const allBackups = Object.keys(sessionStorage).filter(key => key.startsWith('backup_')).sort().reverse();
      for (let i = 3; i < allBackups.length; i++) sessionStorage.removeItem(allBackups[i]);
      localStorage.setItem(this.KEYS.BACKUP_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('⚠️ 備份保存失敗:', error);
    }
  },

  getBackup() {
    try {
      const allBackups = Object.keys(sessionStorage).filter(key => key.startsWith('backup_')).sort().reverse();
      if (allBackups.length > 0) {
        const latestBackup = JSON.parse(sessionStorage.getItem(allBackups[0]));
        return latestBackup.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async loadCache() {
    try {
      this._clearInvalidCache();
      const encoded = localStorage.getItem(this.KEYS.CHECKPOINTS);
      if (encoded) {
        this.cache.checkpoints = decodeData(encoded);
      } else {
        this.cache.checkpoints = [];
      }
      const presetsRaw = localStorage.getItem(this.KEYS.PRESETS);
      this.cache.presets = presetsRaw ? JSON.parse(presetsRaw) : [];
      this.cache.lastSync = Date.now();
    } catch (error) {
      this.cache.checkpoints = [];
      this.cache.presets = [];
    }
  },

  clearAll() {
    try {
      for (const key of Object.values(this.KEYS)) localStorage.removeItem(key);
      this.cache = { checkpoints: [], presets: [], lastSync: 0 };
      return true;
    } catch (error) {
      return false;
    }
  },

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

/**
 * 儲存管理器 - 統一管理 LocalStorage 操作
 * @module core/storage-manager
 */

import { encodeData, decodeData } from '../utils/encoding-utils.js';

export const STORAGE_MANAGER = {
  KEYS: {
    CHECKPOINTS: 'rope-skip-checkpoints',
    PRESETS: 'rope-skip-class-presets',
    SESSION: 'rs-system-session',
    CURRENT_USER: 'current-user',
    USERS: 'users',
    BACKUP_TIMESTAMP: 'backup-timestamp'
  },

  CONFIG: {
    MAX_RETRIES: 3,
    STORAGE_QUOTA: 5 * 1024 * 1024,
    AUTO_BACKUP_INTERVAL: 3600000,
    COMPRESSION_THRESHOLD: 100
  },

  cache: {
    checkpoints: null,
    presets: null,
    lastSync: 0,
    cacheDuration: 300000
  },

  _isCacheValid() {
    return this.cache.checkpoints && Date.now() - this.cache.lastSync < this.cache.cacheDuration;
  },

  _clearInvalidCache() {
    if (!this._isCacheValid()) { this.cache.checkpoints = null; this.cache.lastSync = 0; }
  },

  channel: null,
  _syncTimeout: null,

  async init() {
    try {
      this.testLocalStorage();
      await this.loadCache();
      this.startAutoBackup();
      this.setupSync();
      return true;
    } catch (error) {
      console.error('❌ 存儲管理器初始化失敗:', error);
      return false;
    }
  },

  // ===== 通用 get/set/remove/clear API =====

  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      // getItem 返回 null 代表不存在
      if (raw === null || raw === undefined) return null;
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(`Retrieval error: ${error.message}`);
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // 直接拋出原始錯誤，唔 wrap
      throw error;
    }
  },

  async remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Remove error: ${error.message}`);
    }
  },

  async clear() {
    try {
      localStorage.clear();
    } catch (error) {
      throw new Error(`Clear error: ${error.message}`);
    }
  },

  // ===== 原有業務邏輯 =====

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
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  },

  async getCheckpoints(userId = null) {
    try {
      if (this._isCacheValid()) {
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (currentUser?.role === 'creator') return userId ? this.cache.checkpoints.filter(cp => cp.userId === userId) : this.cache.checkpoints;
        return this.cache.checkpoints;
      }
      const encoded = localStorage.getItem(this.KEYS.CHECKPOINTS);
      if (!encoded) { this.cache.checkpoints = []; this.cache.lastSync = Date.now(); return []; }
      const decoded = decodeData(encoded);
      this.cache.checkpoints = decoded;
      this.cache.lastSync = Date.now();
      const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      if (currentUser?.role === 'creator') return userId ? decoded.filter(cp => cp.userId === userId) : decoded;
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
          if (!record.userId && currentUser) return { ...record, userId: currentUser.userId || currentUser.id };
          return record;
        });
        const jsonStr = JSON.stringify(recordsWithUserId);
        const encoded = encodeData(jsonStr);
        if (encoded.length > this.CONFIG.STORAGE_QUOTA) {
          this.cleanupOldData(recordsWithUserId);
          continue;
        }
        localStorage.setItem(this.KEYS.CHECKPOINTS, encoded);
        this.cache.checkpoints = recordsWithUserId;
        this.cache.lastSync = Date.now();
        if (this.channel) { try { this.channel.postMessage({ type: 'storage-updated', timestamp: Date.now(), recordCount: recordsWithUserId.length }); } catch (e) {} }
        return true;
      } catch (error) {
        retryCount++;
        if (retryCount >= this.CONFIG.MAX_RETRIES) { throw error; }
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
      return [];
    }
  },

  async savePresets(presets) {
    try {
      localStorage.setItem(this.KEYS.PRESETS, JSON.stringify(presets));
      this.cache.presets = presets;
      return true;
    } catch (error) {
      return false;
    }
  },

  cleanupOldData(records) {
    if (records.length > 500) return [...records].sort((a, b) => (b.classDate || '').localeCompare(a.classDate || '')).slice(0, 500);
    return records;
  },

  startAutoBackup() {
    setInterval(() => {
      try { this.saveBackup({ checkpoints: this.cache.checkpoints || [], presets: this.cache.presets || [] }); } catch (e) {}
    }, this.CONFIG.AUTO_BACKUP_INTERVAL);
  },

  saveBackup(data) {
    try {
      sessionStorage.setItem(`backup_${Date.now()}`, JSON.stringify({ timestamp: Date.now(), data, version: '2.1' }));
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith('backup_')).sort().reverse();
      for (let i = 3; i < keys.length; i++) sessionStorage.removeItem(keys[i]);
      localStorage.setItem(this.KEYS.BACKUP_TIMESTAMP, Date.now().toString());
    } catch (e) {}
  },

  getBackup() {
    try {
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith('backup_')).sort().reverse();
      return keys.length ? JSON.parse(sessionStorage.getItem(keys[0])).data : null;
    } catch { return null; }
  },

  async loadCache() {
    try {
      this._clearInvalidCache();
      const encoded = localStorage.getItem(this.KEYS.CHECKPOINTS);
      this.cache.checkpoints = encoded ? decodeData(encoded) : [];
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
    } catch { return false; }
  },

  getStats() {
    let totalSize = 0;
    const details = {};
    for (const [name, key] of Object.entries(this.KEYS)) {
      const value = localStorage.getItem(key);
      if (value) { const size = (value.length / 1024).toFixed(2); details[name] = `${size} KB`; totalSize += parseFloat(size); }
    }
    return { totalSize: `${totalSize.toFixed(2)} KB`, details, usage: `${((totalSize / (this.CONFIG.STORAGE_QUOTA / 1024)) * 100).toFixed(1)}%` };
  }
};

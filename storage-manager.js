/**
 * 儲存管理器改進版
 * v1.1: 修復 localStorage 問題、加入備份機制、錯誤恢復
 */

const STORAGE_MANAGER = {
  // 存儲鍵定義（集中管理）
  KEYS: {
    CHECKPOINTS: 'rope-skip-checkpoints',
    PRESETS: 'rope-skip-class-presets',
    SESSION: 'rs-system-session',
    CURRENT_USER: 'current-user',
    USERS: 'users',
    BACKUP_TIMESTAMP: 'backup-timestamp'
  },

  // 配置
  CONFIG: {
    MAX_RETRIES: 3,
    STORAGE_QUOTA: 5 * 1024 * 1024, // 5 MB
    AUTO_BACKUP_INTERVAL: 3600000, // 1 小時
    COMPRESSION_THRESHOLD: 100 // 超過 100 筆記錄啟用分頁
  },

  // 內部快取
  cache: {
    checkpoints: null,
    presets: null,
    lastSync: 0
  },

  /**
   * 初始化存儲管理器
   */
  async init() {
    try {
      // 檢查 localStorage 可用性
      this.testLocalStorage();
      
      // 加載快取
      await this.loadCache();
      
      // 啟動自動備份
      this.startAutoBackup();
      
      console.log('✅ 存儲管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 存儲管理器初始化失敗:', error);
      return false;
    }
  },

  /**
   * 測試 localStorage 可用性
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
   * 獲取課堂記錄（含錯誤恢復）
   */
  async getCheckpoints() {
    try {
      // 優先使用快取（5 分鐘內）
      if (this.cache.checkpoints && Date.now() - this.cache.lastSync < 300000) {
        return this.cache.checkpoints;
      }

      const encoded = localStorage.getItem(this.KEYS.CHECKPOINTS);
      if (!encoded) {
        this.cache.checkpoints = [];
        return [];
      }

      // 嘗試解碼
      try {
        const decoded = JSON.parse(atob(encoded));
        this.cache.checkpoints = decoded;
        this.cache.lastSync = Date.now();
        return decoded;
      } catch (decodeError) {
        // 解碼失敗，嘗試直接 JSON 解析（向後相容）
        console.warn('⚠️ Base64 解碼失敗，嘗試直接解析...');
        const directParse = JSON.parse(encoded);
        
        // 重新編碼並保存
        localStorage.setItem(this.KEYS.CHECKPOINTS, btoa(JSON.stringify(directParse)));
        
        this.cache.checkpoints = directParse;
        this.cache.lastSync = Date.now();
        return directParse;
      }
    } catch (error) {
      console.error('❌ 讀取課堂記錄失敗:', error);
      
      // 嘗試從備份恢復
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
   * 保存課堂記錄（含重試機制）
   */
  async saveCheckpoints(records) {
    let retryCount = 0;

    while (retryCount < this.CONFIG.MAX_RETRIES) {
      try {
        // 驗證數據
        if (!Array.isArray(records)) {
          throw new Error('數據格式無效');
        }

        // 檢查存儲空間
        const encoded = btoa(JSON.stringify(records));
        if (encoded.length > this.CONFIG.STORAGE_QUOTA) {
          console.warn('⚠️ 存儲空間不足');
          // 觸發清理機制
          this.cleanupOldData(records);
          continue;
        }

        // 保存到 localStorage
        localStorage.setItem(this.KEYS.CHECKPOINTS, encoded);

        // 更新快取
        this.cache.checkpoints = records;
        this.cache.lastSync = Date.now();

        console.log(`✅ 保存 ${records.length} 筆課堂記錄`);
        return true;
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ 保存失敗，重試 ${retryCount}/${this.CONFIG.MAX_RETRIES}`);
        
        if (retryCount >= this.CONFIG.MAX_RETRIES) {
          console.error('❌ 保存課堂記錄失敗:', error);
          
          // 最後嘗試保存到備份
          this.saveBackup(records);
          throw error;
        }

        // 延遲後重試
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }

    return false;
  },

  /**
   * 獲取班級預設
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
   * 清理舊數據（當存儲接近滿時）
   */
  cleanupOldData(records) {
    try {
      // 只保留最近 500 筆記錄
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
   * 自動備份機制
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
   */
  saveBackup(data) {
    try {
      const backup = {
        timestamp: Date.now(),
        data: data,
        version: '2.1'
      };
      
      // 使用 sessionStorage 備份（不受 localStorage 滿的影響）
      sessionStorage.setItem('backup_' + Date.now(), JSON.stringify(backup));
      
      // 保留最近 3 個備份
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
   * 取得最新備份
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
   * 加載快取
   */
  async loadCache() {
    try {
      this.cache.checkpoints = await this.getCheckpoints();
      this.cache.presets = await this.getPresets();
      console.log('✅ 快取已加載');
    } catch (error) {
      console.error('⚠️ 快取加載失敗:', error);
    }
  },

  /**
   * 清除所有數據（謹慎使用）
   */
  clearAll() {
    try {
      if (!confirm('確定要清除所有數據嗎？此操作無法復原。')) {
        return false;
      }

      for (const key of Object.values(this.KEYS)) {
        localStorage.removeItem(key);
      }

      // 清除快取
      this.cache = {
        checkpoints: [],
        presets: [],
        lastSync: 0
      };

      console.log('✅ 所有數據已清除');
      return true;
    } catch (error) {
      console.error('❌ 清除數據失敗:', error);
      return false;
    }
  },

  /**
   * 取得存儲統計信息
   */
  getStats() {
    let totalSize = 0;
    const details = {};

    for (const [name, key] of Object.entries(this.KEYS)) {
      const value = localStorage.getItem(key);
      if (value) {
        const size = (value.length / 1024).toFixed(2);
        details[name] = size + ' KB';
        totalSize += parseFloat(size);
      }
    }

    return {
      totalSize: totalSize.toFixed(2) + ' KB',
      details: details,
      usage: ((totalSize / (this.CONFIG.STORAGE_QUOTA / 1024)) * 100).toFixed(1) + '%'
    };
  }
};

// 應用啟動時初始化
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    STORAGE_MANAGER.init().catch(err => {
      console.error('❌ 存儲管理器初始化失敗:', err);
      alert('⚠️ 系統儲存功能異常，部分功能可能不可用。');
    });
  });
}

// 頁面卸載時保存未同步的數據
window.addEventListener('beforeunload', () => {
  if (STORAGE_MANAGER.cache.checkpoints) {
    STORAGE_MANAGER.saveCheckpoints(STORAGE_MANAGER.cache.checkpoints);
  }
});

// 導出以供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = STORAGE_MANAGER;
}

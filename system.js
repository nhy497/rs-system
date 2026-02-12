/**
 * HKJRA 教練記錄系統 · 跳繩課堂 Checkpoint
 * 整合系統核心模組 - 統一 JavaScript 檔案
 * v3.1: 完整整合版本（新增跨標籤頁同步 + Creator權限優化）
 * 
 * 更新日誌 v3.1:
 * - ✨ [PLAN-A1] 新增 BroadcastChannel 跨標籤頁即時數據同步
 * - 🔧 [PLAN-A2] 修復 Creator 無法新增課程記錄的限制（改為測試模式）
 * 
 * 重要維護提示（避免分叉）：
 * - 認證/會話：LOGIN_MANAGER 相關邏輯為單一真實來源，勿在其他檔案重建會話物件。
 * - 存儲：所有課堂紀錄統一經 STORAGE_MANAGER + parseRecords/saveRecords；禁止直接寫入 localStorage 原始 key。
 * - 重複/編輯：課堂表單的重複檢查、編輯模式提示需保持一致；新增變更請透過現有函式擴充，避免平行實作。
 * - 開發測試：dev/* 已改為 dev-* key 隔離，若新增測試檔亦請採用隔離或只讀模式。
 *
 * 模組結構：
 * 1. 全局常數和配置
 * 2. 存儲管理系統 (STORAGE_MANAGER) ⭐ 新增跨標籤頁同步
 * 3. 認證系統 (AuthenticationManager, LOGIN_MANAGER)
 * 4. UI 管理 (UI_MANAGER)
 * 5. 應用核心業務邏輯 (app.js 功能)
 * 6. PouchDB 儲存服務 (StorageService)
 * 7. Firebase 配置 (可選)
 * 8. 應用初始化
 */

// ============================================================================
// 第 1 部分：全局常數和配置
// ============================================================================

const STORAGE_KEY = 'rope-skip-checkpoints';
const CLASS_PRESETS_KEY = 'rope-skip-class-presets';
const SCORE_1_5_IDS = ['engagement', 'positivity', 'enthusiasm', 'satisfaction'];
const RANGE_IDS = [
  'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
  'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
  'teachScore', 'satisfaction', 'flexibility', 'individual'
];
const OPTION_GROUPS = [
  { name: 'atmosphere', selector: '[data-name="atmosphere"]' },
  { name: 'skillLevel', selector: '[data-name="skillLevel"]' }
];
const PAGE_TITLES = { 
  overview: '課堂概覽', 
  students: '學生管理', 
  actions: '動作記錄', 
  analytics: '統計分析' 
};
const TRICK_LEVELS = ['初級', '中級', '進階'];

// 快速 DOM 選擇器
let $ = (id) => document.getElementById(id);
let $q = (sel) => document.querySelector(sel);
let $qa = (sel) => document.querySelectorAll(sel);

// ============================================================================
// 第 2 部分：存儲管理系統（含跨標籤頁同步）
// ============================================================================

const STORAGE_MANAGER = {
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
    lastSync: 0
  },

  // ⭐ [PLAN-A1] BroadcastChannel 用於跨標籤頁通訊
  channel: null,

  async init() {
    try {
      this.testLocalStorage();
      await this.loadCache();
      this.startAutoBackup();
      this.setupSync(); // ⭐ [PLAN-A1] 初始化跨標籤頁同步
      console.log('✅ 存儲管理器初始化成功（已啟用跨標籤頁同步）');
      return true;
    } catch (error) {
      console.error('❌ 存儲管理器初始化失敗:', error);
      return false;
    }
  },

  // ⭐ [PLAN-A1] 設置跨標籤頁同步
  setupSync() {
    // 檢查瀏覽器是否支援 BroadcastChannel
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('⚠️ 瀏覽器不支援 BroadcastChannel，跨標籤頁同步已禁用');
      return;
    }

    try {
      this.channel = new BroadcastChannel('rs-system-sync');
      
      // 監聽其他標籤頁的更新
      this.channel.onmessage = (event) => {
        if (event.data.type === 'storage-updated') {
          console.log('📡 收到其他標籤頁的數據更新通知');
          
          // 清除緩存，強制重新讀取
          this.cache.checkpoints = null;
          this.cache.lastSync = 0;
          
          // 重新載入緩存
          this.loadCache();
          
          // 刷新所有視圖
          if (typeof refreshAllViews === 'function') {
            refreshAllViews();
          }
          
          console.log('✅ 已同步更新數據');
        }
      };

      this.channel.onerror = (error) => {
        console.error('❌ BroadcastChannel 錯誤:', error);
      };

      console.log('✅ 跨標籤頁同步已啟用');
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
          console.log(`📊 範例記錄:`, recordsWithUserId[0]);
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

  saveBackup(data) {
    try {
      const backup = { timestamp: Date.now(), data: data, version: '3.1' };
      sessionStorage.setItem('backup_' + Date.now(), JSON.stringify(backup));
      
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

// [繼續第3-10部分代碼，保持原樣...]

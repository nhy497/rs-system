/**
 * PouchDB 整合層
 * 將 PouchDB 儲存連接到現有的 app.js 邏輯
 * v1.0: 自動同步、事件監聽、相容原有函數
 */

/**
 * 儲存適配層 - 提供與原有 localStorage 相同的介面
 */
class StorageAdapter {
  constructor() {
    this.ready = false;
    this.storage = null;
    this.db = null;
    this.cacheData = {}; // 本地快取，加快讀取
    this.syncInProgress = false;
  }

  /**
   * 初始化儲存適配層
   */
  async init() {
    try {
      // 1. 初始化 PouchDB 系統
      await initializePouchDB();

      // 2. 設置用戶（如果已登入）
      const userId = authManager.getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ 未檢測到登入用戶，將使用臨時存儲');
        // 使用臨時用戶 ID
        const tempUserId = 'temp_' + Math.random().toString(36).substr(2, 9);
        await pouchDBManager.setCurrentUser(tempUserId);
      } else {
        await pouchDBManager.setCurrentUser(userId);
      }

      // 3. 取得資料庫實例
      this.db = pouchDBManager.getCurrentDatabase();

      // 4. 初始化儲存服務
      await initializeStorageService(this.db);
      this.storage = storageService;

      // 5. 載入初始資料到快取
      await this._loadCacheFromDB();

      // 6. 監聽資料變動
      this._setupChangeListeners();

      this.ready = true;
      console.log('✅ 儲存適配層已初始化');
      return true;
    } catch (error) {
      console.error('❌ 初始化儲存適配層失敗:', error);
      return false;
    }
  }

  /**
   * 從資料庫載入資料到快取
   * @private
   */
  async _loadCacheFromDB() {
    try {
      const checkpoints = await this.storage.getAllCheckpoints();
      const presets = await this.storage.getAllClassPresets();

      // 快取課堂記錄
      this.cacheData['checkpoints'] = checkpoints;

      // 快取班級預設（轉換為陣列格式）
      const presetNames = presets.map(p => p.className);
      this.cacheData['presets'] = presetNames;

      console.log(`✅ 已載入 ${checkpoints.length} 筆課堂記錄和 ${presetNames.length} 個班級預設`);
    } catch (error) {
      console.error('❌ 載入快取失敗:', error);
    }
  }

  /**
   * 監聽資料變動
   * @private
   */
  _setupChangeListeners() {
    this.storage.onChange(async (change) => {
      try {
        // 只刷新相關的快取
        if (change.doc.type === 'checkpoint') {
          await this._loadCacheFromDB();
          // 觸發 UI 更新
          if (window.refreshAllViews) {
            window.refreshAllViews();
          }
        } else if (change.doc.type === 'classPreset') {
          const presets = await this.storage.getAllClassPresets();
          this.cacheData['presets'] = presets.map(p => p.className);
          // 更新預設 UI
          if (window.populateQuickSelectClass) {
            window.populateQuickSelectClass();
          }
        }
      } catch (error) {
        console.error('❌ 處理變動失敗:', error);
      }
    });
  }

  /**
   * 新增課堂記錄
   */
  async addCheckpoint(data) {
    try {
      const result = await this.storage.addCheckpoint(data);
      return result;
    } catch (error) {
      console.error('❌ 新增課堂記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 取得所有課堂記錄（相容原有 parseRecords）
   */
  async getAllCheckpoints() {
    try {
      if (this.cacheData['checkpoints']) {
        return this.cacheData['checkpoints'];
      }
      const checkpoints = await this.storage.getAllCheckpoints();
      this.cacheData['checkpoints'] = checkpoints;
      return checkpoints;
    } catch (error) {
      console.error('❌ 取得課堂記錄失敗:', error);
      return [];
    }
  }

  /**
   * 更新課堂記錄
   */
  async updateCheckpoint(id, updates) {
    try {
      const result = await this.storage.updateCheckpoint(id, updates);
      // 刷新快取
      await this._loadCacheFromDB();
      return result;
    } catch (error) {
      console.error('❌ 更新課堂記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除課堂記錄
   */
  async deleteCheckpoint(id) {
    try {
      await this.storage.deleteCheckpoint(id);
      // 刷新快取
      await this._loadCacheFromDB();
      return true;
    } catch (error) {
      console.error('❌ 刪除課堂記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 新增班級預設
   */
  async addClassPreset(className) {
    try {
      const result = await this.storage.addClassPreset({ className });
      // 刷新快取
      const presets = await this.storage.getAllClassPresets();
      this.cacheData['presets'] = presets.map(p => p.className);
      return result;
    } catch (error) {
      console.error('❌ 新增班級預設失敗:', error);
      throw error;
    }
  }

  /**
   * 取得所有班級預設
   */
  async getAllClassPresets() {
    try {
      if (this.cacheData['presets']) {
        return this.cacheData['presets'];
      }
      const presets = await this.storage.getAllClassPresets();
      const names = presets.map(p => p.className);
      this.cacheData['presets'] = names;
      return names;
    } catch (error) {
      console.error('❌ 取得班級預設失敗:', error);
      return [];
    }
  }

  /**
   * 刪除班級預設
   */
  async deleteClassPreset(className) {
    try {
      const presets = await this.storage.getAllClassPresets();
      const preset = presets.find(p => p.className === className);
      if (preset) {
        await this.storage.deleteClassPreset(preset._id);
        // 刷新快取
        const updated = await this.storage.getAllClassPresets();
        this.cacheData['presets'] = updated.map(p => p.className);
      }
      return true;
    } catch (error) {
      console.error('❌ 刪除班級預設失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋課堂記錄
   */
  async searchCheckpoints(keyword) {
    try {
      return await this.storage.searchCheckpoints(keyword);
    } catch (error) {
      console.error('❌ 搜尋失敗:', error);
      return [];
    }
  }

  /**
   * 篩選課堂記錄
   */
  async filterCheckpoints(filters) {
    try {
      return await this.storage.filterCheckpoints(filters);
    } catch (error) {
      console.error('❌ 篩選失敗:', error);
      return [];
    }
  }

  /**
   * 複製課堂記錄
   */
  async duplicateCheckpoint(id, overrides) {
    try {
      const result = await this.storage.duplicateCheckpoint(id, overrides);
      // 刷新快取
      await this._loadCacheFromDB();
      return result;
    } catch (error) {
      console.error('❌ 複製課堂記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 匯出所有資料
   */
  async exportData() {
    try {
      return await this.storage.exportUserData();
    } catch (error) {
      console.error('❌ 匯出失敗:', error);
      throw error;
    }
  }

  /**
   * 匯入資料
   */
  async importData(importData) {
    try {
      const result = await this.storage.importUserData(importData);
      // 刷新快取
      await this._loadCacheFromDB();
      return result;
    } catch (error) {
      console.error('❌ 匯入失敗:', error);
      throw error;
    }
  }

  /**
   * 取得統計資訊
   */
  async getStats() {
    try {
      return await pouchDBManager.getStats();
    } catch (error) {
      console.error('❌ 取得統計失敗:', error);
      return null;
    }
  }

  /**
   * 備份資料
   */
  async backup() {
    try {
      return await this.storage.createBackup();
    } catch (error) {
      console.error('❌ 備份失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查是否準備就緒
   */
  isReady() {
    return this.ready;
  }
}

/**
 * 全局儲存適配層實例
 */
const storageAdapter = new StorageAdapter();

/**
 * 應用初始化函數
 */
async function initializeApp() {
  try {
    // 初始化儲存層
    const success = await storageAdapter.init();
    if (!success) {
      console.error('❌ 應用初始化失敗');
      return false;
    }

    // 刷新 UI
    if (window.onAppReady) {
      window.onAppReady();
    }

    return true;
  } catch (error) {
    console.error('❌ 應用初始化錯誤:', error);
    return false;
  }
}

/**
 * 切換用戶函數
 */
async function switchUser(userId) {
  try {
    // 關閉舊資料庫
    const oldUserId = pouchDBManager.currentUserId;
    if (oldUserId) {
      await pouchDBManager.closeUserDatabase(oldUserId);
    }

    // 切換到新用戶
    await pouchDBManager.setCurrentUser(userId);
    storageAdapter.db = pouchDBManager.getCurrentDatabase();
    await initializeStorageService(storageAdapter.db);
    storageAdapter.storage = storageService;

    // 重新載入資料
    await storageAdapter._loadCacheFromDB();
    storageAdapter._setupChangeListeners();

    // 刷新 UI
    if (window.refreshAllViews) {
      window.refreshAllViews();
    }

    console.log('✅ 已切換用戶');
    return true;
  } catch (error) {
    console.error('❌ 切換用戶失敗:', error);
    return false;
  }
}

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    storageAdapter,
    StorageAdapter,
    initializeApp,
    switchUser
  };
}

/**
 * 儲存服務 - PouchDB 數據庫操作
 * @module services/storage-service
 */

/**
 * PouchDB 儲存服務類
 * 提供數據庫初始化、CRUD 操作和雲端同步功能
 */
export class StorageService {
  constructor() {
    this.db = null;
    this.remoteDB = null;
    this.syncHandler = null;
    this.changeListeners = [];
    this.changesFeed = null;
  }

  /**
   * 初始化儲存服務
   * @param {Object} database - PouchDB 數據庫實例
   * @param {string|null} remoteURL - 遠程數據庫 URL（可選）
   * @returns {Promise<void>}
   */
  async init(database, remoteURL = null) {
    this.db = database;
    
    // 如果提供遠程 URL，啟用雲端同步
    if (remoteURL) {
      await this._setupSync(remoteURL);
    }
    
    this._startChangesFeed();
    console.log('✅ 儲存服務已初始化' + (remoteURL ? '（已啟用雲端同步）' : '（本地模式）'));
  }

  /**
   * 設置雲端同步
   * @private
   * @param {string} remoteURL - 遠程數據庫 URL
   * @returns {Promise<void>}
   */
  async _setupSync(remoteURL) {
    try {
      this.remoteDB = new PouchDB(remoteURL);
      
      // 雙向同步
      this.syncHandler = this.db.sync(this.remoteDB, {
        live: true,
        retry: true
      }).on('change', (info) => {
        console.log('�� 數據同步中:', info.direction);
      }).on('paused', () => {
        console.log('⏸️ 同步已暫停（等待變更）');
      }).on('active', () => {
        console.log('▶️ 同步重新啟動');
      }).on('denied', (err) => {
        console.error('❌ 同步被拒絕:', err);
      }).on('error', (err) => {
        console.error('❌ 同步錯誤:', err);
      });
      
      console.log('✅ 雲端同步已啟用:', remoteURL);
    } catch (error) {
      console.error('❌ 設置雲端同步失敗:', error);
      console.warn('⚠️ 將繼續使用本地模式');
    }
  }

  /**
   * 啟動變更監聽
   * @private
   */
  _startChangesFeed() {
    try {
      if (!this.db.changes) return; // PouchDB 未加載
      
      this.changesFeed = this.db.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        this.changeListeners.forEach(listener => {
          try {
            listener(change);
          } catch (e) {
            console.error('監聽器執行失敗:', e);
          }
        });
      }).on('error', (err) => {
        console.error('❌ 變動監聽錯誤:', err);
        setTimeout(() => this._startChangesFeed(), 5000);
      });
    } catch (error) {
      console.error('❌ 啟動監聽失敗:', error);
    }
  }

  /**
   * 註冊變更監聽器
   * @param {Function} callback - 回調函數
   * @returns {Function} 取消監聽的函數
   */
  onChange(callback) {
    this.changeListeners.push(callback);
    return () => {
      const idx = this.changeListeners.indexOf(callback);
      if (idx >= 0) this.changeListeners.splice(idx, 1);
    };
  }

  /**
   * 停止變更監聽
   */
  stopChangesFeed() {
    if (this.changesFeed) {
      this.changesFeed.cancel();
      this.changesFeed = null;
    }
  }

  /**
   * 添加課堂記錄
   * @param {Object} checkpointData - 課堂記錄數據
   * @returns {Promise<Object|null>} 添加結果
   */
  async addCheckpoint(checkpointData) {
    try {
      if (!this.db) return null;
      
      const doc = {
        type: 'checkpoint',
        className: checkpointData.className,
        date: checkpointData.date,
        atmosphere: checkpointData.atmosphere || null,
        skillLevel: checkpointData.skillLevel || null,
        studentRecords: checkpointData.studentRecords || [],
        notes: checkpointData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...checkpointData
      };

      const result = await this.db.post(doc);
      console.log('✅ 課堂記錄已新增:', result.id);
      return result;
    } catch (error) {
      console.error('❌ 新增課堂記錄失敗:', error);
      throw error;
    }
  },

  /**
   * 更新課堂記錄
   * @param {string} id - 記錄 ID
   * @param {Object} updates - 更新數據
   * @returns {Promise<Object|null>} 更新結果
   */
  async updateCheckpoint(id, updates) {
    try {
      if (!this.db) return null;
      
      const doc = await this.db.get(id);
      const updated = {
        ...doc,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const result = await this.db.put(updated);
      console.log('✅ 課堂記錄已更新:', id);
      return result;
    } catch (error) {
      console.error('❌ 更新課堂記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除課堂記錄
   * @param {string} id - 記錄 ID
   * @returns {Promise<boolean>} 刪除是否成功
   */
  async deleteCheckpoint(id) {
    try {
      if (!this.db) return false;
      
      const doc = await this.db.get(id);
      await this.db.remove(doc);
      console.log('✅ 課堂記錄已刪除:', id);
      return true;
    } catch (error) {
      console.error('❌ 刪除課堂記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取所有課堂記錄
   * @returns {Promise<Array>} 記錄數組
   */
  async getAllCheckpoints() {
    try {
      if (!this.db) return [];
      
      const result = await this.db.allDocs({ include_docs: true });
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc.type === 'checkpoint');
    } catch (error) {
      console.error('❌ 查詢失敗:', error);
      return [];
    }
  }

  /**
   * 創建備份
   * @returns {Promise<Object|null>} 備份數據
   */
  async createBackup() {
    try {
      if (!this.db) return null;
      
      const docs = await this.getAllCheckpoints();
      return {
        timestamp: new Date().toISOString(),
        data: { checkpoints: docs }
      };
    } catch (error) {
      console.error('❌ 建立備份失敗:', error);
      throw error;
    }
  }

  /**
   * 清除所有數據
   * @returns {Promise<boolean>} 清除是否成功
   */
  async clearAllData() {
    try {
      if (!this.db) return false;
      
      const docs = await this.db.allDocs();
      const toDelete = docs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true
      }));

      await this.db.bulkDocs(toDelete);
      console.log('⚠️ 所有資料已清除');
      return true;
    } catch (error) {
      console.error('❌ 清除資料失敗:', error);
      throw error;
    }
  }
}

/**
 * 默認儲存服務實例
 */
export const storageService = new StorageService();

/**
 * 初始化儲存服務
 * @param {Object} database - PouchDB 數據庫實例
 * @returns {Promise<StorageService>} 儲存服務實例
 */
export async function initializeStorageService(database) {
  try {
    await storageService.init(database);
    return storageService;
  } catch (error) {
    console.error('❌ 儲存服務初始化失敗:', error);
    throw error;
  }
}

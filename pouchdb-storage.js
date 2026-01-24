/**
 * PouchDB 儲存操作層
 * 實現 CRUD、查詢、同步等核心功能
 * v1.0: 課堂記錄、班級預設、統計資料的完整操作
 */

/**
 * 儲存服務 - 統一資料訪問層
 */
class StorageService {
  constructor() {
    this.db = null;
    this.changeListeners = []; // 變動監聽器
    this.changesFeed = null; // 即時監聽物件
  }

  /**
   * 初始化儲存服務
   * @param {PouchDB.Database} database - PouchDB 資料庫實例
   */
  async init(database) {
    this.db = database;
    
    // 啟動即時監聽
    this._startChangesFeed();
    console.log('✅ 儲存服務已初始化');
  }

  /**
   * 啟動變動監聽（即時同步）
   * @private
   */
  _startChangesFeed() {
    try {
      this.changesFeed = this.db.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        // 通知所有監聽器
        this.changeListeners.forEach(listener => {
          try {
            listener(change);
          } catch (e) {
            console.error('監聽器執行失敗:', e);
          }
        });
      }).on('error', (err) => {
        console.error('❌ 變動監聽錯誤:', err);
        // 5 秒後重新連接
        setTimeout(() => this._startChangesFeed(), 5000);
      });
    } catch (error) {
      console.error('❌ 啟動監聽失敗:', error);
    }
  }

  /**
   * 監聽資料變動
   * @param {Function} callback - 回調函數 (change) => {}
   */
  onChange(callback) {
    this.changeListeners.push(callback);
    return () => {
      const idx = this.changeListeners.indexOf(callback);
      if (idx >= 0) this.changeListeners.splice(idx, 1);
    };
  }

  /**
   * 停止監聽
   */
  stopChangesFeed() {
    if (this.changesFeed) {
      this.changesFeed.cancel();
      this.changesFeed = null;
    }
  }

  // ============ 課堂記錄相關操作 ============

  /**
   * 新增課堂記錄
   * @param {Object} checkpointData - 課堂資料
   * @returns {Promise<{id, rev}>}
   */
  async addCheckpoint(checkpointData) {
    try {
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
  }

  /**
   * 更新課堂記錄
   * @param {string} id - 記錄 ID
   * @param {Object} updates - 更新的欄位
   * @returns {Promise<{id, rev}>}
   */
  async updateCheckpoint(id, updates) {
    try {
      // 先取得現有記錄
      const doc = await this.db.get(id);
      
      // 合併更新
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
   */
  async deleteCheckpoint(id) {
    try {
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
   * 取得單筆課堂記錄
   * @param {string} id - 記錄 ID
   */
  async getCheckpoint(id) {
    try {
      return await this.db.get(id);
    } catch (error) {
      if (error.status === 404) {
        console.warn('⚠️ 課堂記錄不存在:', id);
        return null;
      }
      throw error;
    }
  }

  /**
   * 按日期範圍查詢課堂記錄
   * @param {string} startDate - 開始日期 (YYYY-MM-DD)
   * @param {string} endDate - 結束日期 (YYYY-MM-DD)
   */
  async getCheckpointsByDateRange(startDate, endDate) {
    try {
      const result = await this.db.query('checkpoints/byDate', {
        startkey: [startDate],
        endkey: [endDate, {}],
        include_docs: true
      });
      
      return result.rows.map(row => row.doc);
    } catch (error) {
      console.error('❌ 查詢失敗:', error);
      throw error;
    }
  }

  /**
   * 按班級查詢課堂記錄
   * @param {string} className - 班級名稱
   */
  async getCheckpointsByClass(className) {
    try {
      const result = await this.db.query('checkpoints/byClass', {
        startkey: [className],
        endkey: [className, {}],
        include_docs: true
      });
      
      return result.rows.map(row => row.doc);
    } catch (error) {
      console.error('❌ 查詢失敗:', error);
      throw error;
    }
  }

  /**
   * 按學生 ID 查詢課堂記錄
   * @param {string} studentId - 學生 ID
   */
  async getCheckpointsByStudent(studentId) {
    try {
      const result = await this.db.query('checkpoints/byStudent', {
        startkey: [studentId],
        endkey: [studentId, {}],
        include_docs: true
      });
      
      return result.rows.map(row => row.doc);
    } catch (error) {
      console.error('❌ 查詢失敗:', error);
      throw error;
    }
  }

  /**
   * 取得所有課堂記錄
   */
  async getAllCheckpoints() {
    try {
      const result = await this.db.allDocs({
        include_docs: true,
        startkey: 'checkpoint_',
        endkey: 'checkpoint_\uffff'
      });
      
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc.type === 'checkpoint');
    } catch (error) {
      console.error('❌ 查詢失敗:', error);
      throw error;
    }
  }

  /**
   * 複製課堂記錄（從現有記錄創建新記錄）
   * @param {string} sourceId - 來源記錄 ID
   * @param {Object} overrides - 覆蓋的欄位
   */
  async duplicateCheckpoint(sourceId, overrides = {}) {
    try {
      const source = await this.db.get(sourceId);
      
      // 移除 ID 和修訂，建立新記錄
      const newDoc = {
        ...source,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides
      };
      
      delete newDoc._id;
      delete newDoc._rev;

      const result = await this.db.post(newDoc);
      console.log('✅ 課堂記錄已複製:', result.id);
      return result;
    } catch (error) {
      console.error('❌ 複製課堂記錄失敗:', error);
      throw error;
    }
  }

  // ============ 班級預設相關操作 ============

  /**
   * 新增班級預設
   * @param {Object} presetData - 預設資料
   */
  async addClassPreset(presetData) {
    try {
      const doc = {
        type: 'classPreset',
        className: presetData.className,
        color: presetData.color || '#45B7D1',
        notes: presetData.notes || '',
        createdAt: new Date().toISOString(),
        ...presetData
      };

      const result = await this.db.post(doc);
      console.log('✅ 班級預設已新增:', result.id);
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
      const result = await this.db.allDocs({
        include_docs: true
      });

      return result.rows
        .map(row => row.doc)
        .filter(doc => doc.type === 'classPreset')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } catch (error) {
      console.error('❌ 取得班級預設失敗:', error);
      return [];
    }
  }

  /**
   * 刪除班級預設
   * @param {string} id - 預設 ID
   */
  async deleteClassPreset(id) {
    try {
      const doc = await this.db.get(id);
      await this.db.remove(doc);
      console.log('✅ 班級預設已刪除:', id);
      return true;
    } catch (error) {
      console.error('❌ 刪除班級預設失敗:', error);
      throw error;
    }
  }

  // ============ 統計資料相關操作 ============

  /**
   * 更新或建立統計摘要
   */
  async updateAnalyticsSummary(summaryData) {
    try {
      let doc;
      
      // 嘗試取得現有摘要
      try {
        doc = await this.db.get('summary');
      } catch (e) {
        if (e.status === 404) {
          doc = { _id: 'summary', type: 'analyticsSummary' };
        } else {
          throw e;
        }
      }

      // 合併資料
      const updated = {
        ...doc,
        ...summaryData,
        type: 'analyticsSummary',
        updatedAt: new Date().toISOString()
      };

      const result = await this.db.put(updated);
      console.log('✅ 統計摘要已更新');
      return result;
    } catch (error) {
      console.error('❌ 更新統計摘要失敗:', error);
      throw error;
    }
  }

  /**
   * 取得統計摘要
   */
  async getAnalyticsSummary() {
    try {
      return await this.db.get('summary');
    } catch (error) {
      if (error.status === 404) {
        return {
          type: 'analyticsSummary',
          totalCheckpoints: 0,
          totalClasses: 0,
          totalStudents: 0
        };
      }
      throw error;
    }
  }

  // ============ 批量操作 ============

  /**
   * 批量插入文件
   * @param {Array} docs - 文件陣列
   */
  async bulkInsert(docs) {
    try {
      const results = await this.db.bulkDocs(docs);
      const successful = results.filter(r => r.ok).length;
      console.log(`✅ 批量插入完成: ${successful}/${docs.length}`);
      return results;
    } catch (error) {
      console.error('❌ 批量插入失敗:', error);
      throw error;
    }
  }

  /**
   * 批量刪除文件
   * @param {Array} ids - 要刪除的文件 ID 陣列
   */
  async bulkDelete(ids) {
    try {
      // 先取得所有要刪除的文件
      const docs = await Promise.all(
        ids.map(id => this.db.get(id).catch(() => null))
      );

      // 標記為刪除
      const toDelete = docs
        .filter(doc => doc !== null)
        .map(doc => ({ ...doc, _deleted: true }));

      const results = await this.db.bulkDocs(toDelete);
      const successful = results.filter(r => r.ok).length;
      console.log(`✅ 批量刪除完成: ${successful} 筆記錄`);
      return results;
    } catch (error) {
      console.error('❌ 批量刪除失敗:', error);
      throw error;
    }
  }

  // ============ 搜尋和篩選 ============

  /**
   * 搜尋課堂（按班級名稱、日期、備注）
   * @param {string} keyword - 搜尋關鍵字
   */
  async searchCheckpoints(keyword) {
    try {
      const allDocs = await this.getAllCheckpoints();
      const lowerKeyword = keyword.toLowerCase();

      return allDocs.filter(doc => {
        return (
          doc.className?.toLowerCase().includes(lowerKeyword) ||
          doc.date?.toLowerCase().includes(lowerKeyword) ||
          doc.notes?.toLowerCase().includes(lowerKeyword) ||
          doc.studentRecords?.some(r => 
            r.studentName?.toLowerCase().includes(lowerKeyword)
          )
        );
      });
    } catch (error) {
      console.error('❌ 搜尋失敗:', error);
      return [];
    }
  }

  /**
   * 進階過濾
   * @param {Object} filters - 過濾條件 {className, dateFrom, dateTo, atmosphere, skillLevel}
   */
  async filterCheckpoints(filters) {
    try {
      let results = await this.getAllCheckpoints();

      if (filters.className) {
        results = results.filter(doc => doc.className === filters.className);
      }

      if (filters.dateFrom) {
        results = results.filter(doc => doc.date >= filters.dateFrom);
      }

      if (filters.dateTo) {
        results = results.filter(doc => doc.date <= filters.dateTo);
      }

      if (filters.atmosphere) {
        results = results.filter(doc => doc.atmosphere === filters.atmosphere);
      }

      if (filters.skillLevel) {
        results = results.filter(doc => doc.skillLevel === filters.skillLevel);
      }

      return results;
    } catch (error) {
      console.error('❌ 篩選失敗:', error);
      throw error;
    }
  }

  // ============ 備份和恢復 ============

  /**
   * 建立備份快照
   */
  async createBackup() {
    try {
      const docs = await this.getAllCheckpoints();
      const presets = await this.getAllClassPresets();
      const summary = await this.getAnalyticsSummary();

      const backup = {
        timestamp: new Date().toISOString(),
        version: POUCHDB_CONFIG.SCHEMA_VERSION,
        checkpointCount: docs.length,
        presetCount: presets.length,
        data: {
          checkpoints: docs,
          classPresets: presets,
          summary: summary
        }
      };

      console.log('✅ 備份已建立');
      return backup;
    } catch (error) {
      console.error('❌ 建立備份失敗:', error);
      throw error;
    }
  }

  /**
   * 從備份恢復
   * @param {Object} backup - 備份物件
   */
  async restoreFromBackup(backup) {
    try {
      if (!backup.data) {
        throw new Error('備份格式無效');
      }

      const allDocs = [
        ...(backup.data.checkpoints || []),
        ...(backup.data.classPresets || []),
        ...(backup.data.summary ? [backup.data.summary] : [])
      ];

      await this.bulkInsert(allDocs);
      console.log('✅ 備份已恢復');
      return true;
    } catch (error) {
      console.error('❌ 恢復備份失敗:', error);
      throw error;
    }
  }

  /**
   * 清除所有資料
   * 警告：此操作無法撤銷！
   */
  async clearAllData() {
    try {
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
 * 全局儲存服務實例
 */
const storageService = new StorageService();

/**
 * 初始化函數
 */
async function initializeStorageService(database) {
  try {
    await storageService.init(database);
    return storageService;
  } catch (error) {
    console.error('❌ 儲存服務初始化失敗:', error);
    throw error;
  }
}

// Function to set up PouchDB storage backend
function setupPouchDB() {
    var db = new PouchDB('shared_storage');
    // Ensure all systems use the same PouchDB backend
    return db;
}

// Function to handle CRUD operations
function saveData(data) {
    var db = setupPouchDB();
    db.put(data).then(function (response) {
        console.log('Data saved successfully:', response);
    }).catch(function (err) {
        console.error('Error saving data:', err);
    });
}

// Function to ensure operability between storage and compatibility layers
function ensureCompatibility() {
    // Logic to ensure compatibility between storage and operational layers
}

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storageService, StorageService, initializeStorageService };
}

/**
 * PouchDB 配置和初始化
 * 多用戶本地儲存系統 - 每個用戶獨立資料庫
 * v1.0: 支援 PouchDB 雲端同步準備（可選）
 * 
 * 主要功能：
 * - 用戶隔離（每用戶一個資料庫）
 * - 自動備份和恢復
 * - 索引優化查詢
 * - 版本管理
 */

/**
 * 全局 PouchDB 設定
 */
const POUCHDB_CONFIG = {
  // 資料庫前綴名稱
  DB_PREFIX: 'rs-system-',
  
  // 版本號（用於遷移）
  SCHEMA_VERSION: 1,
  
  // 預設設定
  DEFAULT_CONFIG: {
    // 啟用自動壓縮（刪除舊修訂）
    auto_compaction: true,
    // 最大重試次數
    ajax: { timeout: 10000 }
  },
  
  // 設計文件（索引）
  DESIGN_DOCS: {
    checkpoints: {
      _id: '_design/checkpoints',
      version: 1,
      views: {
        // 按日期查詢課堂記錄
        byDate: {
          map: `function(doc) {
            if (doc.type === 'checkpoint') {
              emit([doc.date, doc.createdAt], {
                _id: doc._id,
                className: doc.className,
                date: doc.date
              });
            }
          }`
        },
        // 按班級查詢
        byClass: {
          map: `function(doc) {
            if (doc.type === 'checkpoint') {
              emit([doc.className, doc.date], {
                _id: doc._id,
                date: doc.date
              });
            }
          }`
        },
        // 按學生 ID 查詢（用於學生分析）
        byStudent: {
          map: `function(doc) {
            if (doc.type === 'checkpoint' && doc.studentRecords) {
              doc.studentRecords.forEach(function(record) {
                emit([record.studentId, doc.date], {
                  _id: doc._id,
                  className: doc.className,
                  studentName: record.studentName
                });
              });
            }
          }`
        }
      }
    },
    
    classPresets: {
      _id: '_design/classPresets',
      version: 1,
      views: {
        // 列出所有班級預設
        all: {
          map: `function(doc) {
            if (doc.type === 'classPreset') {
              emit(doc.createdAt, {
                _id: doc._id,
                name: doc.className,
                color: doc.color
              });
            }
          }`
        }
      }
    },
    
    analytics: {
      _id: '_design/analytics',
      version: 1,
      views: {
        // 統計總結（每用戶一份）
        summary: {
          map: `function(doc) {
            if (doc.type === 'analyticsSummary') {
              emit(doc.updatedAt, {
                _id: doc._id,
                totalCheckpoints: doc.totalCheckpoints,
                totalClasses: doc.totalClasses
              });
            }
          }`
        }
      }
    }
  },

  // 預定義設定（用於新用戶）
  PRESETS: {
    defaultClasses: ['A班', 'B班', 'C班'],
    classColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  }
};

/**
 * PouchDB 管理器 - 核心模組
 */
class PouchDBManager {
  constructor() {
    this.databases = {}; // 快取打開的資料庫
    this.currentUserId = null;
    this.initialized = false;
  }

  /**
   * 初始化 PouchDB 系統
   * 檢查瀏覽器相容性和儲存空間
   */
  async init() {
    try {
      // 檢查 PouchDB 是否加載
      if (typeof PouchDB === 'undefined') {
        throw new Error('PouchDB 庫未加載。請在 HTML 中引入 pouchdb.js');
      }

      // 檢查儲存空間
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const percentUsed = (estimate.usage / estimate.quota) * 100;
        console.log(`儲存空間使用率: ${percentUsed.toFixed(2)}%`);
        
        if (percentUsed > 90) {
          console.warn('⚠️ 儲存空間即將滿滿，請備份重要資料');
        }
      }

      this.initialized = true;
      console.log('✅ PouchDB 系統已初始化');
      return true;
    } catch (error) {
      console.error('❌ PouchDB 初始化失敗:', error);
      return false;
    }
  }

  /**
   * 設置當前用戶並打開其資料庫
   * @param {string} userId - 用戶 ID（使用 localStorage 中的用戶識別碼）
   * @returns {Promise<PouchDB.Database>} 用戶資料庫
   */
  async setCurrentUser(userId) {
    if (!this.initialized) {
      throw new Error('PouchDB 系統尚未初始化');
    }

    try {
      this.currentUserId = userId;
      const dbName = `${POUCHDB_CONFIG.DB_PREFIX}${userId}`;
      
      // 檢查資料庫是否已打開
      if (!this.databases[userId]) {
        const db = new PouchDB(dbName, POUCHDB_CONFIG.DEFAULT_CONFIG);
        this.databases[userId] = db;
        
        // 初始化設計文件（索引）
        await this._initializeDesignDocs(db);
        
        console.log(`✅ 已連接用戶資料庫: ${dbName}`);
      }

      return this.databases[userId];
    } catch (error) {
      console.error('❌ 設置用戶資料庫失敗:', error);
      throw error;
    }
  }

  /**
   * 取得當前用戶的資料庫
   */
  getCurrentDatabase() {
    if (!this.currentUserId) {
      throw new Error('未設置當前用戶');
    }
    return this.databases[this.currentUserId];
  }

  /**
   * 初始化設計文件（索引）
   * @private
   */
  async _initializeDesignDocs(db) {
    try {
      for (const [name, designDoc] of Object.entries(POUCHDB_CONFIG.DESIGN_DOCS)) {
        try {
          // 嘗試取得現有的設計文件
          const existing = await db.get(designDoc._id);
          
          // 檢查版本是否需要更新
          if (!existing.version || existing.version < designDoc.version) {
            designDoc._rev = existing._rev;
            await db.put(designDoc);
            console.log(`📑 設計文件已更新: ${designDoc._id}`);
          }
        } catch (e) {
          if (e.status === 404) {
            // 設計文件不存在，新增
            await db.put(designDoc);
            console.log(`📑 設計文件已新增: ${designDoc._id}`);
          } else {
            throw e;
          }
        }
      }
    } catch (error) {
      console.error('❌ 初始化設計文件失敗:', error);
      throw error;
    }
  }

  /**
   * 取得用戶資料庫統計信息
   */
  async getStats() {
    try {
      const db = this.getCurrentDatabase();
      const info = await db.info();
      return {
        docCount: info.doc_count,
        deletedCount: info.doc_del_count,
        dataSize: info.data_size,
        readableSize: this._formatBytes(info.data_size)
      };
    } catch (error) {
      console.error('❌ 取得統計信息失敗:', error);
      return null;
    }
  }

  /**
   * 壓縮資料庫（清理已刪除文件的空間）
   */
  async compact() {
    try {
      const db = this.getCurrentDatabase();
      await db.compact();
      console.log('✅ 資料庫已壓縮');
      return true;
    } catch (error) {
      console.error('❌ 資料庫壓縮失敗:', error);
      return false;
    }
  }

  /**
   * 卸載用戶資料庫（關閉連接）
   */
  async closeUserDatabase(userId) {
    try {
      if (this.databases[userId]) {
        await this.databases[userId].close();
        delete this.databases[userId];
        console.log(`✅ 已關閉用戶資料庫: ${userId}`);
      }
    } catch (error) {
      console.error('❌ 關閉資料庫失敗:', error);
    }
  }

  /**
   * 完全刪除用戶資料庫
   */
  async deleteUserDatabase(userId) {
    try {
      const dbName = `${POUCHDB_CONFIG.DB_PREFIX}${userId}`;
      const db = new PouchDB(dbName);
      await db.destroy();
      delete this.databases[userId];
      console.log(`✅ 已刪除用戶資料庫: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ 刪除資料庫失敗:', error);
      return false;
    }
  }

  /**
   * 列出所有本地資料庫
   */
  async listAllDatabases() {
    try {
      const dbs = await PouchDB.allDbs();
      return dbs.filter(name => name.startsWith(POUCHDB_CONFIG.DB_PREFIX));
    } catch (error) {
      console.error('❌ 列出資料庫失敗:', error);
      return [];
    }
  }

  /**
   * 匯出用戶資料（JSON 格式）
   */
  async exportUserData() {
    try {
      const db = this.getCurrentDatabase();
      const result = await db.allDocs({ include_docs: true });
      
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: this.currentUserId,
        version: POUCHDB_CONFIG.SCHEMA_VERSION,
        totalDocs: result.total_rows,
        docs: result.rows.map(row => row.doc)
      };

      return exportData;
    } catch (error) {
      console.error('❌ 匯出資料失敗:', error);
      return null;
    }
  }

  /**
   * 匯入用戶資料（JSON 格式）
   */
  async importUserData(importData) {
    try {
      const db = this.getCurrentDatabase();
      
      // 驗證匯入資料格式
      if (!importData.docs || !Array.isArray(importData.docs)) {
        throw new Error('匯入資料格式無效');
      }

      // 逐個新增文件
      const results = await db.bulkDocs(importData.docs, { new_edits: false });
      
      console.log(`✅ 已匯入 ${results.length} 筆記錄`);
      return {
        success: true,
        imported: results.length,
        results: results
      };
    } catch (error) {
      console.error('❌ 匯入資料失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 工具函數：格式化位元組大小
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * 全局 PouchDB 管理器實例
 */
const pouchDBManager = new PouchDBManager();

/**
 * 初始化函數（在應用啟動時調用）
 */
async function initializePouchDB() {
  try {
    await pouchDBManager.init();
    return true;
  } catch (error) {
    console.error('❌ PouchDB 初始化失敗:', error);
    return false;
  }
}

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { pouchDBManager, POUCHDB_CONFIG, initializePouchDB };
}

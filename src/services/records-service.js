/**
 * 記錄服務 - 課堂記錄的 CRUD 操作
 * @module services/records-service
 */

import { STORAGE_MANAGER } from '../core/storage-manager.js';
import { formatFileSize } from '../utils/formatters.js';

/**
 * 記錄服務對象
 * 提供課堂記錄的完整 CRUD 操作和數據處理
 */
export const RecordsService = {
  /**
   * 解析課堂記錄
   * @returns {Array} 記錄數組
   */
  parseRecords() {
    try {
      // 直接使用 storage-manager 的統一 cache 系統
      return STORAGE_MANAGER.getCheckpoints();
    } catch (e) {
      console.error('❌ parseRecords() 讀取失敗:', e);
      return [];
    }
  },

  /**
   * 保存記錄
   * @param {Array} records - 記錄數組
   * @throws {Error} 保存失敗時拋出錯誤
   */
  saveRecords(records) {
    try {
      if (!Array.isArray(records)) throw new Error('資料格式無效：必須是陣列');

      // 為每筆記錄添加用戶ID（如果需要）
      const recordsWithUserId = records.map(record => {
        // 如果全域有 getCurrentUser 函數，使用它
        if (typeof getCurrentUser === 'function' && !record.userId) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            return { ...record, userId: currentUser.userId || currentUser.id };
          }
        }
        return record;
      });

      // 使用 storage-manager 的統一保存方法
      STORAGE_MANAGER.saveCheckpoints(recordsWithUserId);

      // 生產環境移除 console.log
      // console.log(`✅ saveRecords() 已儲存 ${recordsWithUserId.length} 筆課堂記錄`);
      if (recordsWithUserId.length > 0) {
        // 生產環境移除 console.log
      // console.log('📊 範例記錄:', recordsWithUserId[0]);
      }
    } catch (e) {
      console.error('❌ saveRecords() 保存失敗:', e);
      if (e.name === 'QuotaExceededError') {
        const message = '❌ 儲存空間已滿，請清除舊記錄';
        console.error(message);
        if (typeof toast === 'function') toast(message);
      } else {
        const message = `❌ 無法保存數據：${e.message}`;
        console.error(message);
        if (typeof toast === 'function') toast(message);
      }
      throw e; // 向上拋出錯誤以便調試
    }
  },

  /**
   * 獲取所有記錄
   * @returns {Array} 記錄數組
   */
  getAllRecords() {
    return this.parseRecords();
  },

  /**
   * 根據 ID 獲取記錄
   * @param {string} id - 記錄 ID
   * @returns {Object|null} 記錄對象或 null
   */
  getRecordById(id) {
    const records = this.getAllRecords();
    return records.find(r => r.id === id) || null;
  },

  /**
   * 創建新記錄
   * @param {Object} data - 記錄數據
   * @returns {Object} 創建結果對象
   */
  createRecord(data) {
    try {
      const records = this.getAllRecords();
      const newRecord = {
        id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...data
      };

      records.push(newRecord);
      this.saveRecords(records);

      // 生產環境移除 console.log
      // console.log(`✅ 記錄創建成功: ${newRecord.id}`);
      return { success: true, record: newRecord };
    } catch (error) {
      console.error('❌ 創建記錄失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 更新記錄
   * @param {string} id - 記錄 ID
   * @param {Object} data - 更新數據
   * @returns {Object} 更新結果對象
   */
  updateRecord(id, data) {
    try {
      const records = this.getAllRecords();
      const index = records.findIndex(r => r.id === id);

      if (index === -1) {
        throw new Error('記錄不存在');
      }

      records[index] = {
        ...records[index],
        ...data,
        id: records[index].id, // 保持 ID 不變
        updatedAt: new Date().toISOString()
      };

      this.saveRecords(records);

      // 生產環境移除 console.log
      // console.log(`✅ 記錄更新成功: ${id}`);
      return { success: true, record: records[index] };
    } catch (error) {
      console.error('❌ 更新記錄失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 刪除記錄
   * @param {string} id - 記錄 ID
   * @returns {Object} 刪除結果對象
   */
  deleteRecord(id) {
    try {
      const records = this.getAllRecords();
      const index = records.findIndex(r => r.id === id);

      if (index === -1) {
        throw new Error('記錄不存在');
      }

      records.splice(index, 1);
      this.saveRecords(records);

      // 生產環境移除 console.log
      // console.log(`✅ 記錄刪除成功: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('❌ 刪除記錄失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 清除緩存
   */
  clearCache() {
    // 委託給 storage-manager 的統一 cache 管理
    STORAGE_MANAGER.cache.checkpoints = null;
    STORAGE_MANAGER.cache.lastSync = 0;
    // 生產環境移除 console.log
    // console.log('✅ 記錄服務緩存已清除');
  }
};

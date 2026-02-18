/**
 * 預設服務 - 班級預設管理
 * @module services/presets-service
 */

import { CLASS_PRESETS_KEY } from '../constants/app-constants.js';

/**
 * 預設服務對象
 * 提供班級預設的 CRUD 操作
 */
export const PresetsService = {
  /**
   * 獲取所有班級預設
   * @returns {Array<string>} 預設班級名稱數組
   */
  getAllPresets() {
    try {
      const raw = localStorage.getItem(CLASS_PRESETS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('❌ 獲取班級預設失敗:', error);
      return [];
    }
  },

  /**
   * 獲取單個預設（檢查是否存在）
   * @param {string} className - 班級名稱
   * @returns {string|null} 預設名稱或 null
   */
  getPreset(className) {
    const presets = this.getAllPresets();
    return presets.includes(className) ? className : null;
  },

  /**
   * 創建/添加班級預設
   * @param {string} className - 班級名稱
   * @returns {Object} 創建結果對象
   */
  createPreset(className) {
    try {
      const presets = this.getAllPresets();
      const trimmedName = className.trim();
      
      if (!trimmedName) {
        throw new Error('班級名稱不能為空');
      }
      
      if (presets.includes(trimmedName)) {
        throw new Error('班級預設已存在');
      }
      
      presets.push(trimmedName);
      this.savePresets(presets);
      
      console.log(`✅ 班級預設 ${trimmedName} 創建成功`);
      return { success: true, preset: trimmedName };
    } catch (error) {
      console.error('❌ 創建班級預設失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 更新班級預設（重命名）
   * @param {string} oldName - 舊班級名稱
   * @param {string} newName - 新班級名稱
   * @returns {Object} 更新結果對象
   */
  updatePreset(oldName, newName) {
    try {
      const presets = this.getAllPresets();
      const index = presets.indexOf(oldName);
      
      if (index === -1) {
        throw new Error('班級預設不存在');
      }
      
      const trimmedNewName = newName.trim();
      if (!trimmedNewName) {
        throw new Error('新班級名稱不能為空');
      }
      
      if (presets.includes(trimmedNewName) && trimmedNewName !== oldName) {
        throw new Error('新班級名稱已存在');
      }
      
      presets[index] = trimmedNewName;
      this.savePresets(presets);
      
      console.log(`✅ 班級預設 ${oldName} 更新為 ${trimmedNewName}`);
      return { success: true, preset: trimmedNewName };
    } catch (error) {
      console.error('❌ 更新班級預設失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 刪除班級預設
   * @param {string} className - 班級名稱
   * @returns {Object} 刪除結果對象
   */
  deletePreset(className) {
    try {
      const presets = this.getAllPresets();
      const index = presets.indexOf(className);
      
      if (index === -1) {
        throw new Error('班級預設不存在');
      }
      
      presets.splice(index, 1);
      this.savePresets(presets);
      
      console.log(`✅ 班級預設 ${className} 刪除成功`);
      return { success: true };
    } catch (error) {
      console.error('❌ 刪除班級預設失敗:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 保存預設數組到儲存
   * @private
   * @param {Array<string>} presets - 預設數組
   */
  savePresets(presets) {
    localStorage.setItem(CLASS_PRESETS_KEY, JSON.stringify(presets));
  },

  /**
   * 應用預設（返回預設名稱用於填充表單）
   * @param {string} className - 班級名稱
   * @returns {string|null} 預設名稱或 null
   */
  applyPreset(className) {
    const preset = this.getPreset(className);
    if (preset) {
      console.log(`✅ 應用班級預設: ${preset}`);
      return preset;
    }
    console.warn(`⚠️ 班級預設 ${className} 不存在`);
    return null;
  }
};

/**
 * 儲存資料編碼工具
 * 提供統一的編碼/解碼與 fallback 邏輯
 * @module utils/storage-codec
 */

export const StorageCodec = {
  /**
   * 編碼資料供儲存使用
   * @param {any} data - 要編碼的資料
   * @returns {string|null} 編碼後的字串，失敗時返回 null
   */
  encode(data) {
    try {
      const jsonStr = JSON.stringify(data);
      return btoa(encodeURIComponent(jsonStr));
    } catch (error) {
      console.error('[StorageCodec] 編碼失敗:', error);
      return null;
    }
  },

  /**
   * 解碼已儲存的資料（支援多版本 fallback）
   * @param {string} encodedData - 編碼後的字串
   * @returns {any} 解碼後的資料，失敗時返回 null
   */
  decode(encodedData) {
    if (!encodedData) return null;

    // 方法 1: 新版 (btoa + encodeURIComponent)
    try {
      return JSON.parse(decodeURIComponent(atob(encodedData)));
    } catch (e1) {
      // 方法 2: 舊版 (僅 btoa)
      try {
        return JSON.parse(atob(encodedData));
      } catch (e2) {
        // 方法 3: 純 JSON
        try {
          return JSON.parse(encodedData);
        } catch (e3) {
          console.error('[StorageCodec] 所有解碼方式均失敗');
          return null;
        }
      }
    }
  },

  /**
   * 安全地從 localStorage 載入資料
   * @param {string} key - localStorage key
   * @param {any} defaultValue - 預設值
   * @returns {any} 解碼後的資料或預設值
   */
  loadFromStorage(key, defaultValue = null) {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return defaultValue;
      return this.decode(encoded) || defaultValue;
    } catch (error) {
      console.error(`[StorageCodec] 從 ${key} 載入失敗:`, error);
      return defaultValue;
    }
  },

  /**
   * 安全地儲存資料到 localStorage
   * @param {string} key - localStorage key
   * @param {any} data - 要儲存的資料
   * @returns {boolean} 是否成功
   */
  saveToStorage(key, data) {
    try {
      const encoded = this.encode(data);
      if (!encoded) return false;
      localStorage.setItem(key, encoded);
      return true;
    } catch (error) {
      console.error(`[StorageCodec] 儲存到 ${key} 失敗:`, error);
      return false;
    }
  }
};

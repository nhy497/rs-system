/**
 * 編碼工具函數 - 統一數據編碼解碼邏輯
 * @module utils/encoding-utils
 */

/**
 * 統一編碼方式：encodeURIComponent + btoa（支援中文）
 * @param {string} data - 要編碼的數據
 * @returns {string} 編碼後的字符串
 */
export function encodeData(data) {
  return btoa(encodeURIComponent(data));
}

/**
 * 統一解碼方式：支援多種編碼格式的兼容解碼
 * @param {string} encoded - 編碼的字符串
 * @returns {Array} 解碼後的數據數組
 */
export function decodeData(encoded) {
  if (!encoded) return [];
  
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
        console.warn('⚠️ 解析數據失敗:', e3);
        decoded = [];
      }
    }
  }
  
  return Array.isArray(decoded) ? decoded : [];
}

/**
 * 安全的數據編碼（包含錯誤處理）
 * @param {Array} data - 要編碼的數組數據
 * @returns {string|null} 編碼後的字符串，失敗時返回 null
 */
export function safeEncodeData(data) {
  try {
    if (!Array.isArray(data)) throw new Error('數據必須是陣列');
    const jsonStr = JSON.stringify(data);
    return encodeData(jsonStr);
  } catch (error) {
    console.error('❌ 數據編碼失敗:', error);
    return null;
  }
}

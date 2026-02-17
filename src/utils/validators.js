/**
 * 數據驗證工具函數
 * @module utils/validators
 */

/**
 * 檢查是否為必填項
 * @param {*} value - 要檢查的值
 * @returns {boolean} 是否為有效值
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * 驗證日期格式
 * @param {string} dateStr - 日期字符串
 * @returns {boolean} 是否為有效日期
 */
export function isValidDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * 驗證時間格式 (HH:mm)
 * @param {string} timeStr - 時間字符串
 * @returns {boolean} 是否為有效時間
 */
export function isValidTime(timeStr) {
  if (!timeStr) return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
}

/**
 * 驗證電子郵件格式
 * @param {string} email - 電子郵件地址
 * @returns {boolean} 是否為有效郵箱
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 驗證手機號碼格式（支持大陸和香港）
 * @param {string} phone - 手機號碼
 * @returns {boolean} 是否為有效手機號
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  // 支持中國大陸 (11位) 和香港 (8位) 手機號
  const phoneRegex = /^(\d{11}|\d{8})$/;
  return phoneRegex.test(phone.replace(/[^\d]/g, ''));
}

/**
 * 驗證 URL 格式
 * @param {string} url - URL 地址
 * @returns {boolean} 是否為有效 URL
 */
export function isValidUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

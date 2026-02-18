/**
 * 數據驗證工具
 * @module utils/validators
 */

/**
 * 驗證必填字段
 * @param {any} value - 需要驗證的值
 * @returns {boolean}
 */
export function isRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value != null;
}

/**
 * 驗證日期格式 (YYYY-MM-DD)
 * @param {string} dateStr - 日期字串
 * @returns {boolean}
 */
export function isValidDate(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

/**
 * 驗證時間格式 (HH:MM)
 * @param {string} timeStr - 時間字串
 * @returns {boolean}
 */
export function isValidTime(timeStr) {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeStr);
}

/**
 * 驗證數字範圍
 * @param {number} value - 需要驗證的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean}
 */
export function isInRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * 驗證電子郵件
 * @param {string} email - 電子郵件地址
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 驗證 URL
 * @param {string} url - URL 字串
 * @returns {boolean}
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 驗證手機號碼（台灣格式）
 * @param {string} phone - 手機號碼
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const regex = /^09\d{8}$/;
  return regex.test(phone.replace(/[\s-]/g, ''));
}

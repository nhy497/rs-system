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

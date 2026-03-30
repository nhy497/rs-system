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
 * 驗證日期格式 (YYYY-MM-DD) 或 Date 物件
 * @param {string|Date} dateStr - 日期字串或 Date 物件
 * @returns {boolean}
 */
export function isValidDate(dateStr) {
  if (dateStr instanceof Date) {
    return !isNaN(dateStr.getTime());
  }
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-(\d{2})-(\d{2})$/;
  const match = dateStr.match(regex);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  // 嚴格驗證：用 Date 物件確認日期是否真實存在
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  // 確保月份與日期無溢位（如 2024-02-30）
  if (date.getMonth() + 1 !== month || date.getDate() !== day) return false;
  return true;
}

/**
 * 驗證時間格式 (HH:MM) 或 Date 物件
 * @param {string|Date} timeStr - 時間字串或 Date 物件
 * @returns {boolean}
 */
export function isValidTime(timeStr) {
  if (timeStr instanceof Date) {
    return !isNaN(timeStr.getTime());
  }
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeStr);
}

/**
 * 驗證數字範圍；亦支援字串長度及陣列長度
 * @param {number|string|Array} value - 需要驗證的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean}
 */
export function isInRange(value, min, max) {
  // 自動處理反轉範圍
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  if (typeof value === 'string') {
    const len = value.length;
    return len >= lo && len <= hi;
  }
  if (Array.isArray(value)) {
    const len = value.length;
    return len >= lo && len <= hi;
  }
  const num = Number(value);
  return !isNaN(num) && num >= lo && num <= hi;
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

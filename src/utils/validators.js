/**
 * 数据验证工具函数
 * @module utils/validators
 */

/**
 * 检查是否为必填项
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为有效值
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * 验证日期格式
 * @param {string} dateStr - 日期字符串
 * @returns {boolean} 是否为有效日期
 */
export function isValidDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * 验证时间格式 (HH:mm)
 * @param {string} timeStr - 时间字符串
 * @returns {boolean} 是否为有效时间
 */
export function isValidTime(timeStr) {
  if (!timeStr) return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
}

/**
 * 验证电子邮件格式
 * @param {string} email - 电子邮件地址
 * @returns {boolean} 是否为有效邮箱
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号码格式（支持大陆和香港）
 * @param {string} phone - 手机号码
 * @returns {boolean} 是否为有效手机号
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  // 支持中国大陆 (11位) 和香港 (8位) 手机号
  const phoneRegex = /^(\d{11}|\d{8})$/;
  return phoneRegex.test(phone.replace(/[^\d]/g, ''));
}

/**
 * 验证 URL 格式
 * @param {string} url - URL 地址
 * @returns {boolean} 是否为有效 URL
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

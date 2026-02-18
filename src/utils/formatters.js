/**
 * 數據格式化工具
 * @module utils/formatters
 */

/**
 * 格式化文件大小
 * @param {number} bytes - 字節數
 * @returns {string} 格式化後的大小字串
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * 將時間字串轉換為分鐘數
 * @param {string} timeStr - 時間字串 (HH:MM 格式)
 * @returns {number} 分鐘數
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 將分鐘數轉換為時間字串
 * @param {number} minutes - 分鐘數
 * @returns {string} 時間字串 (HH:MM 格式)
 */
export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期對象或 ISO 字串
 * @param {string} [format='YYYY-MM-DD'] - 格式化模式
 * @returns {string} 格式化後的日期字串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  if (format === 'YYYY/MM/DD') return `${year}/${month}/${day}`;
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  return `${year}-${month}-${day}`;
}

/**
 * 格式化數字
 * @param {number} num - 數字
 * @param {number} [decimals=2] - 小數位數
 * @returns {string} 格式化後的數字字串
 */
export function formatNumber(num, decimals = 2) {
  return Number(num).toFixed(decimals);
}

/**
 * 格式化百分比
 * @param {number} value - 數值 (0-1 或 0-100)
 * @param {boolean} [isDecimal=true] - 是否為小數格式 (0-1)
 * @returns {string} 格式化後的百分比字串
 */
export function formatPercentage(value, isDecimal = true) {
  const percent = isDecimal ? value * 100 : value;
  return `${percent.toFixed(1)}%`;
}

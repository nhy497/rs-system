/**
<<<<<<< HEAD
 * 數據格式化工具
=======
 * 數據格式化工具函數
>>>>>>> origin/copilot/modularize-core-data-services
 * @module utils/formatters
 */

/**
<<<<<<< HEAD
 * 格式化文件大小
 * @param {number} bytes - 字節數
 * @returns {string} 格式化後的大小字串
=======
 * 格式化日期
 * @param {Date|string|number} date - 日期對象、字符串或時間戳
 * @param {string} [format='YYYY-MM-DD'] - 格式模板
 * @returns {string} 格式化後的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字節數
 * @returns {string} 格式化後的文件大小
>>>>>>> origin/copilot/modularize-core-data-services
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
<<<<<<< HEAD
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
=======
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化數字（添加千分位分隔符）
 * @param {number} num - 數字
 * @returns {string} 格式化後的數字字符串
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化時間（相對時間）
 * @param {Date|string|number} date - 日期對象、字符串或時間戳
 * @returns {string} 相對時間描述
 */
export function formatRelativeTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小時前`;
  if (minutes > 0) return `${minutes} 分鐘前`;
  return '剛剛';
>>>>>>> origin/copilot/modularize-core-data-services
}

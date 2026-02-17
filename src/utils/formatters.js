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

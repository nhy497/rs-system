/**
 * 通用輔助函數
 * @module utils/helpers
 */

/**
 * HTML 轉義防止 XSS 攻擊
 * @param {string} text - 需要轉義的文本
 * @returns {string} 轉義後的文本
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 顯示提示訊息
 * @param {string} message - 訊息內容
 * @param {('info'|'success'|'error')} [type='info'] - 訊息類型
 */
export function toast(message, type = 'info') {
  // 實現簡單的 toast 提示
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
    color: white;
    border-radius: 4px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/**
 * 獲取今天日期字串 (YYYY-MM-DD)
 * @returns {string}
 */
export function todayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 通用輔助函數
 * @module utils/helpers
 */

/**
 * HTML 轉義防止 XSS 攻擊（符合 OWASP 標準，包含轉義 /）
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 顯示提示訊息
 * @param {string} message
 * @param {('info'|'success'|'error'|'warning')} [type='info']
 */
export function toast(message, type = 'info') {
  document.querySelectorAll('.toast').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  el.style.cssText = [
    'position:fixed',
    'top:20px',
    'right:20px',
    'padding:12px 24px',
    type === 'error' ? 'background:#f44336' :
    type === 'success' ? 'background:#4caf50' :
    type === 'warning' ? 'background:#ff9800' : 'background:#2196f3',
    'color:white',
    'border-radius:4px',
    'z-index:10000',
    'box-shadow:0 2px 8px rgba(0,0,0,0.2)'
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
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

export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

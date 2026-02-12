/**
 * Toast 通知組件
 * 用於顯示短暂提示訊息
 */

export class Toast {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 3000,
      position: options.position || 'top-right',
      className: options.className || ''
    };
    
    this.container = null;
    this.queue = [];
    this.isShowing = false;
    
    this.init();
  }

  init() {
    // 創建 Toast 容器
    this.container = document.createElement('div');
    this.container.className = `toast-container toast-${this.options.position}`;
    this.container.style.cssText = `
      position: fixed;
      z-index: 10000;
      pointer-events: none;
    `;
    
    // 設置位置
    const positions = {
      'top-right': 'top: 1rem; right: 1rem;',
      'top-left': 'top: 1rem; left: 1rem;',
      'top-center': 'top: 1rem; left: 50%; transform: translateX(-50%);',
      'bottom-right': 'bottom: 1rem; right: 1rem;',
      'bottom-left': 'bottom: 1rem; left: 1rem;',
      'bottom-center': 'bottom: 1rem; left: 50%; transform: translateX(-50%);'
    };
    
    this.container.style.cssText += positions[this.options.position] || positions['top-right'];
    document.body.appendChild(this.container);
  }

  /**
   * 顯示 Toast 訊息
   * @param {string} message - 訊息文字
   * @param {string} type - 類型: success, error, warning, info
   * @param {number} duration - 持續時間（毫秒）
   */
  show(message, type = 'info', duration = null) {
    const toast = {
      message,
      type,
      duration: duration || this.options.duration,
      id: Date.now() + Math.random()
    };
    
    this.queue.push(toast);
    
    if (!this.isShowing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }
    
    this.isShowing = true;
    const toast = this.queue.shift();
    
    await this.displayToast(toast);
    
    // 處理下一個
    this.processQueue();
  }

  displayToast(toast) {
    return new Promise((resolve) => {
      // 創建 Toast 元素
      const element = document.createElement('div');
      element.className = `toast toast-${toast.type} ${this.options.className}`;
      element.style.cssText = `
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 300px;
        max-width: 500px;
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid;
      `;
      
      // 設置類型樣式
      const typeStyles = {
        success: 'border-color: #10b981; color: #065f46;',
        error: 'border-color: #ef4444; color: #991b1b;',
        warning: 'border-color: #f59e0b; color: #92400e;',
        info: 'border-color: #3b82f6; color: #1e40af;'
      };
      
      element.style.cssText += typeStyles[toast.type] || typeStyles.info;
      
      // 設置圖示
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };
      
      element.innerHTML = `
        <span style="font-size: 1.25rem;">${icons[toast.type] || icons.info}</span>
        <span style="flex: 1;">${this.escapeHtml(toast.message)}</span>
        <button type="button" class="toast-close" style="
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          opacity: 0.6;
        ">&times;</button>
      `;
      
      // 關閉按鈕
      const closeBtn = element.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
        this.hideToast(element, resolve);
      });
      
      // 顯示 Toast
      this.container.appendChild(element);
      
      // 自動關閉
      setTimeout(() => {
        this.hideToast(element, resolve);
      }, toast.duration);
    });
  }

  hideToast(element, callback) {
    element.style.animation = 'slideOut 0.3s ease-in';
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      callback();
    }, 300);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 快速方法
  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }

  // 清除所有 Toast
  clear() {
    this.queue = [];
    this.isShowing = false;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  // 銷毀
  destroy() {
    this.clear();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// CSS 動畫
 const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);

// 全局實例
export const toast = new Toast();

// 兼容舊版 API
if (typeof window !== 'undefined') {
  window.toast = (message, type = 'info') => {
    toast.show(message, type);
  };
}

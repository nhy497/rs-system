/**
 * Modal 彈窗組件
 * 用於顯示對話框、詳細資訊等
 */

export class Modal {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      content: options.content || '',
      showClose: options.showClose !== false,
      showFooter: options.showFooter !== false,
      confirmText: options.confirmText || '確認',
      cancelText: options.cancelText || '取消',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      closeOnBackdrop: options.closeOnBackdrop !== false,
      className: options.className || ''
    };
    
    this.element = null;
    this.isOpen = false;
  }

  /**
   * 打開 Modal
   * @param {Object} options - 配置選項（可覆蓋初始配置）
   */
  open(options = {}) {
    if (this.isOpen) {
      console.warn('Modal 已經打開');
      return;
    }
    
    // 合併配置
    this.options = { ...this.options, ...options };
    
    // 創建 Modal 元素
    this.render();
    
    // 綁定事件
    this.bindEvents();
    
    // 顯示
    document.body.appendChild(this.element);
    this.isOpen = true;
    
    // 動畫效果
    requestAnimationFrame(() => {
      this.element.classList.add('show');
      document.body.style.overflow = 'hidden'; // 禁止背景滞動
    });
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = `modal ${this.options.className}`;
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    this.element.innerHTML = `
      <div class="modal-backdrop" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
      "></div>
      
      <div class="modal-dialog" style="
        position: relative;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      ">
        ${this.renderHeader()}
        ${this.renderBody()}
        ${this.renderFooter()}
      </div>
    `;
  }

  renderHeader() {
    if (!this.options.title && !this.options.showClose) return '';
    
    return `
      <div class="modal-header" style="
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">
          ${this.escapeHtml(this.options.title)}
        </h3>
        ${this.options.showClose ? `
          <button type="button" class="modal-close" style="
            background: none;
            border: none;
            font-size: 1.75rem;
            line-height: 1;
            cursor: pointer;
            padding: 0;
            opacity: 0.6;
            transition: opacity 0.2s;
          " aria-label="關閉">&times;</button>
        ` : ''}
      </div>
    `;
  }

  renderBody() {
    return `
      <div class="modal-body" style="
        padding: 1.5rem;
        flex: 1;
        overflow-y: auto;
      ">
        ${this.options.content}
      </div>
    `;
  }

  renderFooter() {
    if (!this.options.showFooter) return '';
    
    return `
      <div class="modal-footer" style="
        padding: 1.5rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      ">
        <button type="button" class="modal-cancel btn btn-ghost" style="
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: white;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
        ">
          ${this.escapeHtml(this.options.cancelText)}
        </button>
        <button type="button" class="modal-confirm btn btn-primary" style="
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          border: none;
          background: #3b82f6;
          color: white;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
        ">
          ${this.escapeHtml(this.options.confirmText)}
        </button>
      </div>
    `;
  }

  bindEvents() {
    // 背景關閉
    if (this.options.closeOnBackdrop) {
      const backdrop = this.element.querySelector('.modal-backdrop');
      backdrop.addEventListener('click', () => this.close());
    }
    
    // 關閉按鈕
    const closeBtn = this.element.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // 取消按鈕
    const cancelBtn = this.element.querySelector('.modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (this.options.onCancel) {
          this.options.onCancel();
        }
        this.close();
      });
    }
    
    // 確認按鈕
    const confirmBtn = this.element.querySelector('.modal-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (this.options.onConfirm) {
          const result = this.options.onConfirm();
          // 如果返回 false，不關閉 Modal
          if (result !== false) {
            this.close();
          }
        } else {
          this.close();
        }
      });
    }
    
    // ESC 鍵關閉
    this.handleEsc = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEsc);
  }

  /**
   * 關閉 Modal
   */
  close() {
    if (!this.isOpen) return;
    
    // 動畫效果
    this.element.classList.remove('show');
    this.element.style.opacity = '0';
    
    const dialog = this.element.querySelector('.modal-dialog');
    if (dialog) {
      dialog.style.transform = 'scale(0.9)';
    }
    
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.isOpen = false;
      document.body.style.overflow = ''; // 恢復滞動
      
      // 移除事件監聽
      document.removeEventListener('keydown', this.handleEsc);
    }, 300);
  }

  /**
   * 更新內容
   * @param {string} content - 新內容
   */
  updateContent(content) {
    if (!this.isOpen) return;
    
    const body = this.element.querySelector('.modal-body');
    if (body) {
      body.innerHTML = content;
    }
  }

  /**
   * 更新標題
   * @param {string} title - 新標題
   */
  updateTitle(title) {
    if (!this.isOpen) return;
    
    const header = this.element.querySelector('.modal-header h3');
    if (header) {
      header.textContent = title;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 銷毀 Modal
   */
  destroy() {
    this.close();
  }
}

// CSS 動畫
const style = document.createElement('style');
style.textContent = `
  .modal.show {
    opacity: 1 !important;
  }
  
  .modal.show .modal-dialog {
    transform: scale(1) !important;
  }
  
  .modal-close:hover {
    opacity: 1 !important;
  }
  
  .modal-cancel:hover {
    background: #f3f4f6 !important;
  }
  
  .modal-confirm:hover {
    background: #2563eb !important;
  }
`;
document.head.appendChild(style);

// 快速方法
export const modal = {
  /**
   * 顯示確認對話框
   */
  confirm(message, title = '確認', onConfirm) {
    const m = new Modal({
      title,
      content: `<p style="margin: 0;">${message}</p>`,
      onConfirm
    });
    m.open();
    return m;
  },
  
  /**
   * 顯示警告對話框
   */
  alert(message, title = '提示') {
    const m = new Modal({
      title,
      content: `<p style="margin: 0;">${message}</p>`,
      showFooter: false
    });
    m.open();
    return m;
  },
  
  /**
   * 顯示自定義內容
   */
  show(options) {
    const m = new Modal(options);
    m.open();
    return m;
  }
};

// 全局實例
if (typeof window !== 'undefined') {
  window.modal = modal;
}

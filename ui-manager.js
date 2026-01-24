/**
 * UI 改進和頁面顯示修復
 * v1.1: 修復頁面顯示問題、加入加載狀態、改善響應式設計
 */

const UI_MANAGER = {
  // UI 配置
  CONFIG: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    LOAD_TIMEOUT: 10000
  },

  // 狀態
  state: {
    currentPage: 'overview',
    isLoading: false,
    toastQueue: []
  },

  /**
   * 初始化 UI 管理器
   */
  init() {
    try {
      // 修復頁面初始化
      this.setupPageInitialization();
      
      // 設置加載指示器
      this.setupLoadingIndicator();
      
      // 設置響應式設計
      this.setupResponsive();
      
      // 設置快捷鍵
      this.setupKeyboardShortcuts();
      
      console.log('✅ UI 管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ UI 管理器初始化失敗:', error);
      return false;
    }
  },

  /**
   * 修復頁面初始化（防止 undefined 元素錯誤）
   */
  setupPageInitialization() {
    // 確保所有必要的 DOM 元素存在
    const requiredElements = [
      'sidebar', 'topbarTitle', 'sidebarUserName', 'sidebarUserRole',
      'todayCount', 'totalStudents', 'page-overview', 'page-students',
      'page-actions', 'page-analytics'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));

    if (missingElements.length > 0) {
      console.warn('⚠️ 缺少元素:', missingElements.join(', '));
      // 不拋出錯誤，允許部分功能降級
    }

    // 使用安全選擇器函數
    window.$ = (id) => {
      const el = document.getElementById(id);
      if (!el) {
        console.warn(`⚠️ 未找到元素: #${id}`);
      }
      return el;
    };

    window.$q = (sel) => {
      try {
        return document.querySelector(sel);
      } catch (error) {
        console.error(`⚠️ 選擇器錯誤: ${sel}`, error);
        return null;
      }
    };

    window.$qa = (sel) => {
      try {
        return document.querySelectorAll(sel);
      } catch (error) {
        console.error(`⚠️ 選擇器錯誤: ${sel}`, error);
        return [];
      }
    };
  },

  /**
   * 設置加載指示器
   */
  setupLoadingIndicator() {
    // 如果沒有加載指示器，動態創建
    if (!document.getElementById('loadingIndicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'loadingIndicator';
      indicator.innerHTML = `
        <div class="loading-overlay">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>加載中...</p>
          </div>
        </div>
      `;
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        z-index: 9999;
        align-items: center;
        justify-content: center;
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        .loading-spinner {
          text-align: center;
          color: white;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(indicator);
    }
  },

  /**
   * 顯示加載指示器
   */
  showLoading(message = '加載中...') {
    try {
      const indicator = document.getElementById('loadingIndicator');
      if (indicator) {
        indicator.style.display = 'flex';
        const msgEl = indicator.querySelector('p');
        if (msgEl) {
          msgEl.textContent = message;
        }
      }

      this.state.isLoading = true;

      // 自動隱藏，防止卡住
      setTimeout(() => {
        this.hideLoading();
      }, this.CONFIG.LOAD_TIMEOUT);
    } catch (error) {
      console.error('❌ 顯示加載指示器失敗:', error);
    }
  },

  /**
   * 隱藏加載指示器
   */
  hideLoading() {
    try {
      const indicator = document.getElementById('loadingIndicator');
      if (indicator) {
        indicator.style.display = 'none';
      }
      this.state.isLoading = false;
    } catch (error) {
      console.error('❌ 隱藏加載指示器失敗:', error);
    }
  },

  /**
   * 改進的 Toast 通知系統
   */
  toast(message, type = 'info', duration = this.CONFIG.TOAST_DURATION) {
    try {
      // 如果沒有 toast 容器，動態創建
      let toastContainer = document.getElementById('toastContainer');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          gap: 10px;
        `;
        document.body.appendChild(toastContainer);
      }

      // 創建 toast 元素
      const toast = document.createElement('div');
      const colors = {
        success: { bg: '#d1fae5', border: '#10b981', icon: '✅' },
        error: { bg: '#fee2e2', border: '#ef4444', icon: '❌' },
        warning: { bg: '#fef3c7', border: '#f59e0b', icon: '⚠️' },
        info: { bg: '#dbeafe', border: '#3b82f6', icon: 'ℹ️' }
      };

      const color = colors[type] || colors.info;

      toast.innerHTML = `
        <div style="
          background: ${color.bg};
          border-left: 4px solid ${color.border};
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          min-width: 250px;
          animation: slideIn 0.3s ease-out;
        ">
          <span style="margin-right: 8px;">${color.icon}</span>
          ${message}
        </div>
      `;

      toastContainer.appendChild(toast);

      // 自動移除
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    } catch (error) {
      console.error('❌ Toast 通知失敗:', error);
      // 降級到 alert
      alert(message);
    }
  },

  /**
   * 設置響應式設計
   */
  setupResponsive() {
    try {
      // 監聽視窗大小變化
      window.addEventListener('resize', () => {
        this.adjustLayout();
      });

      // 初始調整
      this.adjustLayout();

      // 監聽深色模式偏好設置
      if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
          if (e.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.setAttribute('data-theme', 'light');
          }
        });
      }
    } catch (error) {
      console.error('❌ 響應式設計設置失敗:', error);
    }
  },

  /**
   * 調整佈局
   */
  adjustLayout() {
    try {
      const sidebar = document.getElementById('sidebar');
      const isSmallScreen = window.innerWidth < 768;

      if (isSmallScreen && sidebar && !sidebar.classList.contains('collapsed')) {
        // 在小屏幕上自動收起側邊欄
        sidebar.classList.add('collapsed');
      } else if (!isSmallScreen && sidebar && sidebar.classList.contains('collapsed')) {
        // 在大屏幕上顯示側邊欄
        sidebar.classList.remove('collapsed');
      }
    } catch (error) {
      console.error('⚠️ 調整佈局失敗:', error);
    }
  },

  /**
   * 設置快捷鍵
   */
  setupKeyboardShortcuts() {
    try {
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S: 保存
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          const btnSave = document.getElementById('btnSave');
          if (btnSave) {
            btnSave.click();
            this.toast('已保存', 'success');
          }
        }

        // Ctrl/Cmd + N: 新增
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
          e.preventDefault();
          const btnClear = document.getElementById('btnClear');
          if (btnClear) {
            btnClear.click();
            this.toast('已清空表單', 'info');
          }
        }

        // Escape: 關閉彈窗
        if (e.key === 'Escape') {
          const modals = document.querySelectorAll('[role="dialog"]');
          modals.forEach(modal => {
            if (!modal.hidden) {
              modal.hidden = true;
            }
          });
        }
      });
    } catch (error) {
      console.error('⚠️ 快捷鍵設置失敗:', error);
    }
  },

  /**
   * 設置頁面過渡動畫
   */
  setupPageTransition(fromPage, toPage) {
    try {
      const fromEl = document.getElementById(`page-${fromPage}`);
      const toEl = document.getElementById(`page-${toPage}`);

      if (!toEl) {
        console.warn(`⚠️ 頁面 page-${toPage} 不存在`);
        return;
      }

      // 淡出
      if (fromEl) {
        fromEl.style.animation = `fadeOut ${this.CONFIG.ANIMATION_DURATION}ms ease-out`;
        fromEl.style.opacity = '0';
      }

      // 淡入
      setTimeout(() => {
        toEl.style.animation = `fadeIn ${this.CONFIG.ANIMATION_DURATION}ms ease-in`;
        toEl.style.opacity = '1';
      }, this.CONFIG.ANIMATION_DURATION / 2);
    } catch (error) {
      console.error('⚠️ 頁面過渡失敗:', error);
    }
  },

  /**
   * 驗證表單（防呆檢查）
   */
  validateForm(formData) {
    const errors = [];

    // 檢查必填欄位
    const requiredFields = ['classDate', 'className', 'classSize'];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        errors.push(`${field} 為必填項`);
      }
    });

    // 檢查日期格式
    if (formData.classDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.classDate)) {
      errors.push('日期格式錯誤 (應為 YYYY-MM-DD)');
    }

    // 檢查人數範圍
    if (formData.classSize) {
      const size = parseInt(formData.classSize);
      if (isNaN(size) || size < 1 || size > 999) {
        errors.push('人數應在 1-999 之間');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * 顯示表單錯誤
   */
  showFormErrors(errors) {
    try {
      if (errors.length === 0) return;

      let errorHtml = '<div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-bottom: 1rem;">';
      errorHtml += '<div style="color: #dc2626; font-weight: 500; margin-bottom: 8px;">❌ 有以下錯誤需要修正:</div>';
      errorHtml += '<ul style="margin: 0; padding-left: 20px;">';
      
      errors.forEach(error => {
        errorHtml += `<li style="color: #991b1b; font-size: 0.85rem;">${error}</li>`;
      });
      
      errorHtml += '</ul></div>';

      const formContainer = document.querySelector('.form-wrap') || document.querySelector('.page-section');
      if (formContainer) {
        const errorDiv = formContainer.querySelector('[role="alert"]') || document.createElement('div');
        errorDiv.setAttribute('role', 'alert');
        errorDiv.innerHTML = errorHtml;
        
        if (!formContainer.querySelector('[role="alert"]')) {
          formContainer.insertBefore(errorDiv, formContainer.firstChild);
        }
      }

      this.toast('請修正表單錯誤', 'error');
    } catch (error) {
      console.error('⚠️ 顯示錯誤失敗:', error);
    }
  },

  /**
   * 清除表單錯誤顯示
   */
  clearFormErrors() {
    try {
      document.querySelectorAll('[role="alert"]').forEach(el => el.remove());
    } catch (error) {
      console.error('⚠️ 清除錯誤失敗:', error);
    }
  }
};

// 自動初始化
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    UI_MANAGER.init();
  });
}

// 導出以供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI_MANAGER;
}

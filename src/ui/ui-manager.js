/**
 * UI 管理器 - 統一管理介面顯示與狀態
 * @module ui/ui-manager
 * 
 * 源代碼位置: system.js L1135-1204
 * 
 * 主要功能:
 * - UI 顯示/隱藏控制
 * - 載入狀態管理
 * - 通知訊息顯示
 * - 主題切換
 * - 響應式 UI 調整
 * - 鍵盤快捷鍵
 */

/**
 * UI 管理器配置與核心功能
 */
export const UI_MANAGER = {
  /**
   * UI 管理器配置
   */
  CONFIG: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    LOAD_TIMEOUT: 10000
  },

  /**
   * UI 狀態
   */
  state: {
    currentPage: 'overview',
    isLoading: false,
    toastQueue: []
  },

  /**
   * 初始化 UI 管理器
   * @returns {boolean} 初始化是否成功
   */
  init() {
    try {
      this.setupPageInitialization();
      this.setupLoadingIndicator();
      this.setupResponsive();
      this.setupKeyboardShortcuts();
      console.log('✅ UI 管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ UI 管理器初始化失敗:', error);
      return false;
    }
  },

  /**
   * 設置頁面初始化
   * 檢查必要的 DOM 元素是否存在
   */
  setupPageInitialization() {
    const requiredElements = [
      'sidebar', 'topbarTitle', 'sidebarUserName', 'sidebarUserRole',
      'todayCount', 'totalStudents', 'page-overview', 'page-students',
      'page-actions', 'page-analytics'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
      console.warn('⚠️ 缺少元素:', missingElements.join(', '));
    }
  },

  /**
   * 設置載入指示器
   * 如果不存在則創建一個
   */
  setupLoadingIndicator() {
    if (!document.getElementById('loadingIndicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'loadingIndicator';
      indicator.style.cssText = 'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:2rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;';
      indicator.innerHTML = '<p>正在加載...</p>';
      document.body.appendChild(indicator);
    }
  },

  /**
   * 設置響應式佈局
   * 監聽螢幕尺寸變化
   */
  setupResponsive() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addListener((e) => {
      if (e.matches) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('collapsed');
      }
    });
  },

  /**
   * 設置鍵盤快捷鍵
   * Ctrl+S / Cmd+S: 儲存
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const btnSave = document.getElementById('btnSave');
        if (btnSave) btnSave.click();
      }
    });
  },

  /**
   * 顯示視圖
   * @param {string} viewId - 視圖元素 ID
   */
  showView(viewId) {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = '';
      view.classList.remove('hidden');
    }
  },

  /**
   * 隱藏視圖
   * @param {string} viewId - 視圖元素 ID
   */
  hideView(viewId) {
    const view = document.getElementById(viewId);
    if (view) {
      view.style.display = 'none';
      view.classList.add('hidden');
    }
  },

  /**
   * 切換視圖顯示/隱藏
   * @param {string} viewId - 視圖元素 ID
   */
  toggleView(viewId) {
    const view = document.getElementById(viewId);
    if (view) {
      const isHidden = view.style.display === 'none' || view.classList.contains('hidden');
      if (isHidden) {
        this.showView(viewId);
      } else {
        this.hideView(viewId);
      }
    }
  },

  /**
   * 顯示載入狀態
   * @param {string} message - 載入訊息
   */
  showLoading(message = '載入中...') {
    this.state.isLoading = true;
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
      indicator.querySelector('p').textContent = message;
      indicator.style.display = 'block';
    }
  },

  /**
   * 隱藏載入狀態
   */
  hideLoading() {
    this.state.isLoading = false;
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  },

  /**
   * 顯示通知訊息
   * @param {string} message - 訊息內容
   * @param {string} type - 訊息類型 ('info' | 'success' | 'warning' | 'error')
   */
  showNotification(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.className = `toast toast-${type}`;
      toast.hidden = false;
      
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.hidden = true;
      }, this.CONFIG.TOAST_DURATION);
    } else {
      // 如果沒有 toast 元素，使用 console 輸出
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  },

  /**
   * 顯示錯誤訊息
   * @param {string} message - 錯誤訊息
   */
  showError(message) {
    this.showNotification(message, 'error');
  },

  /**
   * 顯示成功訊息
   * @param {string} message - 成功訊息
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  },

  /**
   * 設置主題
   * @param {string} theme - 主題名稱 ('light' | 'dark')
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ui-theme', theme);
  },

  /**
   * 獲取當前主題
   * @returns {string} 主題名稱
   */
  getTheme() {
    return localStorage.getItem('ui-theme') || 'light';
  },

  /**
   * 檢查視圖是否可見
   * @param {string} viewId - 視圖元素 ID
   * @returns {boolean} 是否可見
   */
  isViewVisible(viewId) {
    const view = document.getElementById(viewId);
    if (!view) return false;
    return view.style.display !== 'none' && !view.classList.contains('hidden');
  },

  /**
   * 獲取當前視圖
   * @returns {string} 當前視圖名稱
   */
  getCurrentView() {
    return this.state.currentPage;
  },

  /**
   * 設置當前視圖
   * @param {string} pageName - 頁面名稱
   */
  setCurrentView(pageName) {
    this.state.currentPage = pageName;
  }
};

// 導出便利函數
export const {
  showView,
  hideView,
  toggleView,
  showLoading,
  hideLoading,
  showNotification,
  showError,
  showSuccess,
  setTheme,
  getTheme,
  isViewVisible,
  getCurrentView
} = UI_MANAGER;

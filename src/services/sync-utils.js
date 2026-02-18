/**
 * ⭐ [PLAN-A1] 跨標籤頁同步工具函數
 * 補充 system.js 中 BroadcastChannel 所需的視圖刷新和通知功能
 * v3.1.1 - 2026-02-12
 */

// ============================================================================
// 視圖刷新系統
// ============================================================================

/**
 * 刷新所有視圖 - 用於跨標籤頁同步後更新 UI
 * ⭐ [PLAN-A1] 跨標籤頁同步核心函數
 */
function refreshAllViews() {
  try {
    console.log('🔄 開始刷新所有視圖...');
    
    // 1. 刷新側邊欄統計數據
    refreshSidebarStats();

    // 2. 刷新當前頁面的數據顯示
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      const pageId = activePage.id;
      
      switch(pageId) {
        case 'page-overview':
          console.log('  ↳ 頁面: 課堂概覽 (無需刷新)');
          break;
          
        case 'page-students':
          console.log('  ↳ 刷新學生管理列表');
          refreshStudentsPage();
          break;
          
        case 'page-actions':
          console.log('  ↳ 刷新動作記錄');
          refreshActionsPage();
          break;
          
        case 'page-analytics':
          console.log('  ↳ 刷新統計分析');
          refreshAnalyticsPage();
          break;
          
        case 'page-data':
          console.log('  ↳ 刷新用戶管理');
          refreshDataPage();
          break;
      }
    }

    // 3. 更新全局篩選器
    refreshGlobalFilters();

    console.log('✅ 視圖刷新完成');
    return true;
  } catch (error) {
    console.error('❌ 視圖刷新失敗:', error);
    return false;
  }
}

/**
 * 刷新側邊欄統計數據
 */
function refreshSidebarStats() {
  try {
    const checkpoints = STORAGE_MANAGER.cache.checkpoints || [];
    const today = new Date().toISOString().split('T')[0];
    
    // 更新今日課堂數
    const todayCount = checkpoints.filter(cp => cp.classDate === today).length;
    const todayEl = document.getElementById('todayCount');
    if (todayEl) todayEl.textContent = todayCount;
    
    // 更新學生總數（以班級名稱計算）
    const uniqueClasses = new Set();
    checkpoints.forEach(cp => {
      if (cp.className) uniqueClasses.add(cp.className);
    });
    const totalStudentsEl = document.getElementById('totalStudents');
    if (totalStudentsEl) totalStudentsEl.textContent = uniqueClasses.size;
    
    console.log(`  ↳ 側邊欄統計: 今日 ${todayCount} 堂，共 ${uniqueClasses.size} 班級`);
  } catch (error) {
    console.error('⚠️ 刷新側邊欄統計失敗:', error);
  }
}

/**
 * 刷新學生管理頁面
 */
function refreshStudentsPage() {
  try {
    // 嘗試調用現有函數
    if (typeof displayCheckpoints === 'function') {
      displayCheckpoints();
    } else if (typeof loadStudentsPage === 'function') {
      loadStudentsPage();
    } else {
      console.warn('⚠️ 未找到學生頁面刷新函數');
    }
  } catch (error) {
    console.error('⚠️ 刷新學生頁面失敗:', error);
  }
}

/**
 * 刷新動作記錄頁面
 */
function refreshActionsPage() {
  try {
    if (typeof loadActionsPage === 'function') {
      loadActionsPage();
    } else {
      console.warn('⚠️ 未找到動作記錄刷新函數');
    }
  } catch (error) {
    console.error('⚠️ 刷新動作記錄頁面失敗:', error);
  }
}

/**
 * 刷新統計分析頁面
 */
function refreshAnalyticsPage() {
  try {
    if (typeof loadAnalyticsPage === 'function') {
      loadAnalyticsPage();
    } else {
      console.warn('⚠️ 未找到統計分析刷新函數');
    }
  } catch (error) {
    console.error('⚠️ 刷新統計分析頁面失敗:', error);
  }
}

/**
 * 刷新用戶管理頁面（Creator only）
 */
function refreshDataPage() {
  try {
    if (typeof loadDataPage === 'function') {
      loadDataPage();
    } else {
      console.warn('⚠️ 未找到用戶管理刷新函數');
    }
  } catch (error) {
    console.error('⚠️ 刷新用戶管理頁面失敗:', error);
  }
}

/**
 * 刷新全局篩選器
 */
function refreshGlobalFilters() {
  try {
    const globalFilterClass = document.getElementById('globalFilterClass');
    if (globalFilterClass && typeof populateClassFilter === 'function') {
      populateClassFilter();
    }
  } catch (error) {
    console.error('⚠️ 刷新全局篩選器失敗:', error);
  }
}

// ============================================================================
// 通知系統
// ============================================================================

/**
 * 顯示同步通知
 * @param {string} type - 'success' | 'info' | 'error'
 * @param {string} message - 通知消息
 */
function showSyncNotification(type, message) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) {
    console.warn('⚠️ Toast 元素不存在,使用控制台顯示:', message);
    return;
  }
  
  // 設置消息和樣式
  toastEl.textContent = message;
  toastEl.className = `toast toast-${type}`;
  toastEl.hidden = false;
  
  // 3秒後自動隱藏
  setTimeout(() => {
    toastEl.hidden = true;
  }, 3000);
}

/**
 * 創建同步狀態指示器
 */
function createSyncIndicator() {
  // 檢查是否已存在
  if (document.getElementById('syncIndicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'syncIndicator';
  indicator.className = 'sync-indicator';
  indicator.innerHTML = `
    <span class="sync-icon">📡</span>
    <span class="sync-text">跨標籤頁同步已啟用</span>
  `;
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #10b981;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    z-index: 9999;
    display: none;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(indicator);
  
  // 啟動時顯示2秒
  setTimeout(() => {
    indicator.style.display = 'flex';
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 2000);
  }, 500);
}

// ============================================================================
// 性能監控
// ============================================================================

/**
 * 監控同步性能
 */
const SYNC_PERFORMANCE_MONITOR = {
  startTime: null,
  
  start() {
    this.startTime = performance.now();
  },
  
  end() {
    if (this.startTime) {
      const duration = performance.now() - this.startTime;
      console.log(`⏱️ 同步完成，耗時: ${duration.toFixed(2)}ms`);
      this.startTime = null;
      
      // 如果同步時間過長,顯示警告
      if (duration > 1000) {
        console.warn('⚠️ 同步耗時較長,可能影響用戶體驗');
      }
      
      return duration;
    }
    return 0;
  }
};

// ============================================================================
// 導出到全局作用域
// ============================================================================

window.refreshAllViews = refreshAllViews;
window.showSyncNotification = showSyncNotification;
window.createSyncIndicator = createSyncIndicator;
window.SYNC_PERFORMANCE_MONITOR = SYNC_PERFORMANCE_MONITOR;

console.log('✅ sync-utils.js 已加載');

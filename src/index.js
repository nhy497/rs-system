/**
 * RS-System 瀏覽器入口點
 * 自動偵測頁面並初始化對應功能
 * @module index
 * 
 * 此模組是瀏覽器環境的主要入口點，提供：
 * - 自動偵測頁面類型（登入頁 / 主應用）
 * - 自動初始化對應功能
 * - 全域物件掛載（向後相容）
 * - 錯誤處理與日誌記錄
 * 
 * 使用方式：
 * 1. 在 HTML 中引入：<script type="module" src="./src/index.js"></script>
 * 2. 頁面載入時自動執行初始化
 * 3. 無需手動呼叫任何函式
 * 
 * @example
 * <!-- 在 index.html 中 -->
 * <script type="module" src="./src/index.js"></script>
 * 
 * @example
 * <!-- 在 login.html 中 -->
 * <script type="module" src="./src/index.js"></script>
 */

import { AppInit } from './init/app-init.js';
import { LoginPageInit } from './init/login-page-init.js';
import { APP_CONFIG, printConfig } from './init/config.js';
import * as RSSystem from './main.js';

// ============================================================================
// 全域物件掛載（向後相容）
// ============================================================================

if (typeof window !== 'undefined') {
  /**
   * 將 RS-System API 掛載到全域物件
   * 這允許在非模組環境中使用：window.RSSystem
   */
  window.RSSystem = RSSystem;
  
  // 便捷存取
  window.AppInit = AppInit;
  window.LoginPageInit = LoginPageInit;
  window.APP_CONFIG = APP_CONFIG;
  
  console.log('✅ RS-System 已掛載到全域物件 window.RSSystem');
}

// ============================================================================
// 頁面類型偵測
// ============================================================================

/**
 * 偵測當前頁面類型
 * @returns {string} 頁面類型：'login' | 'main' | 'unknown'
 */
function detectPageType() {
  // 檢查是否為登入頁面
  const isLoginPage = Boolean(
    document.body.classList.contains('login-page') ||
    document.getElementById('loginForm') ||
    document.getElementById('login-form')
  );
  
  if (isLoginPage) {
    return 'login';
  }
  
  // 檢查是否為主應用頁面
  const isMainApp = Boolean(
    document.body.classList.contains('main-app') ||
    document.getElementById('app-container') ||
    document.getElementById('page-overview')
  );
  
  if (isMainApp) {
    return 'main';
  }
  
  return 'unknown';
}

// ============================================================================
// 自動初始化
// ============================================================================

/**
 * 主初始化函式
 * 根據頁面類型自動執行對應的初始化邏輯
 */
async function autoInit() {
  try {
    const pageType = detectPageType();
    
    console.log(`%c🚀 RS-System v${RSSystem.VERSION}`, 'color: #4CAF50; font-weight: bold; font-size: 14px');
    console.log(`%c📄 頁面類型: ${pageType}`, 'color: #2196F3; font-weight: bold');
    
    // 顯示配置資訊（僅在 Debug 模式）
    if (APP_CONFIG.DEBUG) {
      printConfig();
    }
    
    // 根據頁面類型初始化
    switch (pageType) {
      case 'login':
        console.log('%c🔐 初始化登入頁面...', 'color: #FF9800; font-weight: bold');
        const loginSuccess = LoginPageInit.init();
        
        if (loginSuccess) {
          console.log('%c✅ 登入頁面初始化完成', 'color: #4CAF50; font-weight: bold');
        } else {
          console.warn('%c⚠️ 登入頁面初始化失敗', 'color: #FF5722; font-weight: bold');
        }
        break;
      
      case 'main':
        console.log('%c🏠 初始化主應用...', 'color: #FF9800; font-weight: bold');
        
        const appSuccess = await AppInit.init({
          onProgress: (step, progress) => {
            if (APP_CONFIG.DEBUG) {
              console.log(`  ⏳ ${step} (${progress}%)`);
            }
          }
        });
        
        if (appSuccess) {
          console.log('%c✅ 主應用初始化完成', 'color: #4CAF50; font-weight: bold');
          
          // 觸發自訂事件
          window.dispatchEvent(new CustomEvent('rs-system:ready', {
            detail: {
              version: RSSystem.VERSION,
              config: APP_CONFIG
            }
          }));
        } else {
          console.error('%c❌ 主應用初始化失敗', 'color: #F44336; font-weight: bold');
          throw new Error('主應用初始化失敗');
        }
        break;
      
      case 'unknown':
        console.warn('%c⚠️ 未偵測到有效頁面類型', 'color: #FF5722; font-weight: bold');
        console.log('  提示：請確保頁面包含正確的標識元素：');
        console.log('    - 登入頁面：#loginForm 或 .login-page');
        console.log('    - 主應用：#page-overview 或 .main-app 或 #app-container');
        break;
      
      default:
        console.warn(`⚠️ 未知頁面類型: ${pageType}`);
    }
    
  } catch (error) {
    console.error('%c❌ 初始化失敗', 'color: #F44336; font-weight: bold', error);
    
    // 記錄錯誤到日誌服務
    if (typeof window !== 'undefined' && window.loggerService) {
      window.loggerService.logSystemEvent('init_error', error.message, 'error');
    }
    
    // 顯示錯誤訊息
    if (typeof window !== 'undefined') {
      const errorMsg = `應用程式初始化失敗：\n${error.message}\n\n請重新載入頁面或聯繫管理員。`;
      
      // 嘗試使用 Toast 顯示
      if (window.toast) {
        window.toast(errorMsg, 'error');
      } else {
        // 降級到 alert
        alert(errorMsg);
      }
    }
  }
}

// ============================================================================
// DOMContentLoaded 事件監聽
// ============================================================================

if (typeof document !== 'undefined') {
  /**
   * 等待 DOM 載入完成後執行初始化
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    // DOM 已經載入完成，立即執行
    autoInit();
  }
} else {
  console.warn('⚠️ 非瀏覽器環境，跳過自動初始化');
}

// ============================================================================
// 匯出所有模組（供其他模組使用）
// ============================================================================

export * from './main.js';
export { autoInit, detectPageType };

// ============================================================================
// 預設匯出
// ============================================================================

export default {
  ...RSSystem,
  autoInit,
  detectPageType
};

/**
 * RS-System Phase 4 使用範例
 * 
 * 此檔案展示如何使用 Phase 4 的初始化模組與入口點。
 * 包含以下範例：
 * - 應用程式初始化
 * - 登入頁面初始化
 * - 配置管理
 * - 模組化匯入
 * - 新舊 API 對比
 * - 最佳實踐
 */

// ============================================================================
// 範例 1: 基本應用初始化
// ============================================================================

/**
 * 最簡單的初始化方式 - 使用 index.js 自動初始化
 * 
 * 在 HTML 中引入：
 * <script type="module" src="./src/index.js"></script>
 * 
 * 頁面載入時會自動：
 * 1. 偵測頁面類型（登入頁 / 主應用）
 * 2. 執行對應的初始化邏輯
 * 3. 掛載全域物件（向後相容）
 */

// ============================================================================
// 範例 2: 手動初始化主應用
// ============================================================================

/**
 * 適用於需要自訂初始化流程的情況
 */
import { initApp } from './src/main.js';

async function manualInitExample() {
  // 基本初始化
  const success = await initApp();
  
  if (success) {
    console.log('✅ 應用程式初始化成功');
  } else {
    console.error('❌ 應用程式初始化失敗');
  }
}

// ============================================================================
// 範例 3: 開發環境初始化（帶進度回調）
// ============================================================================

async function developmentInitExample() {
  const success = await initApp({
    env: 'development',
    onProgress: (step, progress) => {
      console.log(`[${progress}%] ${step}`);
    }
  });
  
  console.log('初始化結果:', success);
}

// ============================================================================
// 範例 4: 自訂初始化選項
// ============================================================================

async function customInitExample() {
  const success = await initApp({
    env: 'production',
    skipAuth: false,        // 不跳過認證檢查
    skipUI: false,          // 不跳過 UI 初始化
    skipStorage: false,     // 不跳過儲存初始化
    onProgress: (step, progress) => {
      // 自訂進度顯示
      const progressBar = document.getElementById('init-progress');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = step;
      }
    }
  });
  
  if (!success) {
    alert('初始化失敗，請重新載入頁面');
  }
}

// ============================================================================
// 範例 5: 登入頁面初始化
// ============================================================================

import { initLoginPage } from './src/main.js';

function loginPageExample() {
  // 手動初始化登入頁面
  const success = initLoginPage();
  
  if (success) {
    console.log('✅ 登入頁面已準備就緒');
  }
}

// ============================================================================
// 範例 6: 使用 AppInit 進行細粒度控制
// ============================================================================

import { AppInit } from './src/main.js';

async function granularControlExample() {
  // 監聽初始化完成事件
  AppInit.onReady(() => {
    console.log('✅ 應用程式已就緒');
    // 執行需要在初始化後進行的操作
  });
  
  // 監聽卸載前事件
  AppInit.onBeforeUnload(() => {
    console.log('💾 保存資料...');
    // 執行清理或保存操作
  });
  
  // 執行初始化
  await AppInit.init({
    onProgress: (step, progress) => {
      console.log(`[${step}] ${progress}%`);
    }
  });
  
  // 獲取應用狀態
  const state = AppInit.getAppState();
  console.log('應用狀態:', state);
}

// ============================================================================
// 範例 7: 配置管理
// ============================================================================

import { APP_CONFIG, getConfig, printConfig } from './src/main.js';

function configExample() {
  // 使用預設配置
  console.log('應用名稱:', APP_CONFIG.APP_NAME);
  console.log('版本:', APP_CONFIG.APP_VERSION);
  console.log('功能開關:', APP_CONFIG.FEATURES);
  
  // 獲取特定環境配置
  const devConfig = getConfig('development');
  console.log('開發配置:', devConfig);
  
  const prodConfig = getConfig('production');
  console.log('生產配置:', prodConfig);
  
  // 顯示配置（僅 Debug 模式）
  printConfig();
}

// ============================================================================
// 範例 8: 分步初始化
// ============================================================================

async function stepByStepInitExample() {
  // 預初始化
  await AppInit.preInit();
  console.log('✅ 預初始化完成');
  
  // 初始化儲存
  await AppInit.initStorage();
  console.log('✅ 儲存初始化完成');
  
  // 初始化認證
  await AppInit.initAuth();
  console.log('✅ 認證初始化完成');
  
  // 初始化 UI
  await AppInit.initUI();
  console.log('✅ UI 初始化完成');
  
  // 初始化服務
  await AppInit.initServices();
  console.log('✅ 服務初始化完成');
  
  // 初始化事件處理器
  await AppInit.initEventHandlers();
  console.log('✅ 事件處理器初始化完成');
  
  // 載入資料
  await AppInit.loadInitialData();
  console.log('✅ 資料載入完成');
  
  // 後初始化
  await AppInit.postInit();
  console.log('✅ 後初始化完成');
}

// ============================================================================
// 範例 9: 監聽初始化事件
// ============================================================================

function eventListenerExample() {
  // 監聽初始化完成事件
  window.addEventListener('rs-system:initialized', (event) => {
    console.log('✅ RS-System 初始化完成');
    console.log('耗時:', event.detail.duration, 'ms');
    console.log('模組狀態:', event.detail.modules);
  });
  
  // 監聽就緒事件
  window.addEventListener('rs-system:ready', (event) => {
    console.log('✅ RS-System 已就緒');
    console.log('版本:', event.detail.version);
    console.log('配置:', event.detail.config);
  });
}

// ============================================================================
// 範例 10: 向後相容 API 使用
// ============================================================================

import { setupLegacyGlobals, legacyAPI } from './src/compat/legacy-bridge.js';

function legacyCompatExample() {
  // 設置全域物件（向後相容）
  setupLegacyGlobals();
  
  // 現在可以使用舊版 API（會顯示棄用警告）
  // window.STORAGE_MANAGER.init();
  // window.LOGIN_MANAGER.login('user', 'pass');
  
  // 使用舊版函式轉接
  const records = legacyAPI.loadRecords();
  console.log('載入記錄:', records);
  
  legacyAPI.saveRecords([
    { id: 1, name: 'Record 1' },
    { id: 2, name: 'Record 2' }
  ]);
  
  legacyAPI.toast('這是一個訊息', 'info');
}

// ============================================================================
// 範例 11: 新舊 API 對比
// ============================================================================

/**
 * 舊版 API (Phase 0 - system.js)
 */
function oldAPIExample() {
  // ❌ 舊版：直接使用全域變數
  // window.STORAGE_MANAGER.init();
  // window.LOGIN_MANAGER.login(username, password);
  // window.UI_MANAGER.init();
  
  // ❌ 舊版：直接在 HTML 中引入 system.js
  // <script src="system.js"></script>
  
  // ❌ 舊版：在 DOMContentLoaded 中手動初始化
  // document.addEventListener('DOMContentLoaded', () => {
  //   STORAGE_MANAGER.init();
  //   LOGIN_MANAGER.init();
  //   UI_MANAGER.init();
  // });
}

/**
 * 新版 API (Phase 4 - 模組化)
 */
async function newAPIExample() {
  // ✅ 新版：ES 模組匯入
  import { AppInit, LoginPageInit } from './src/main.js';
  
  // ✅ 新版：使用 index.js 自動初始化
  // <script type="module" src="./src/index.js"></script>
  
  // ✅ 新版：或手動初始化
  await AppInit.init();
  
  // ✅ 新版：按需匯入特定模組
  import { APP_CONFIG } from './src/init/config.js';
  import { STORAGE_MANAGER } from './src/core/storage-manager.js';
  
  // ✅ 新版：使用配置管理
  const config = getConfig('development');
}

// ============================================================================
// 範例 12: 最佳實踐
// ============================================================================

/**
 * ✅ 推薦做法 1: 使用自動初始化
 */
function bestPractice1() {
  // 在 HTML 中引入 index.js，無需手動初始化
  // <script type="module" src="./src/index.js"></script>
}

/**
 * ✅ 推薦做法 2: 按需匯入
 */
async function bestPractice2() {
  // 只匯入需要的模組
  import { APP_CONFIG } from './src/init/config.js';
  import { AppInit } from './src/init/app-init.js';
  
  // 使用匯入的模組
  console.log('版本:', APP_CONFIG.APP_VERSION);
  await AppInit.init();
}

/**
 * ✅ 推薦做法 3: 使用配置管理
 */
function bestPractice3() {
  // 使用環境特定配置
  const config = getConfig(process.env.NODE_ENV);
  
  // 或從 URL 參數讀取
  // ?env=development&debug=true
  const urlConfig = getConfigFromEnv();
}

/**
 * ✅ 推薦做法 4: 錯誤處理
 */
async function bestPractice4() {
  try {
    const success = await initApp({
      onProgress: (step, progress) => {
        console.log(`[${progress}%] ${step}`);
      }
    });
    
    if (!success) {
      throw new Error('初始化失敗');
    }
    
    console.log('✅ 初始化成功');
  } catch (error) {
    console.error('❌ 初始化錯誤:', error);
    alert('應用程式啟動失敗，請重新載入頁面');
  }
}

/**
 * ✅ 推薦做法 5: 監聽事件
 */
function bestPractice5() {
  // 在應用就緒後執行操作
  AppInit.onReady(() => {
    console.log('✅ 應用已就緒，可以開始操作');
    // 初始化其他功能
  });
  
  // 在卸載前保存資料
  AppInit.onBeforeUnload(() => {
    console.log('💾 保存資料...');
    // 執行清理
  });
}

// ============================================================================
// 範例 13: 整合範例 - 完整應用初始化
// ============================================================================

async function completeExample() {
  console.log('🚀 開始應用初始化...');
  
  // 1. 設置事件監聽
  window.addEventListener('rs-system:ready', (event) => {
    console.log('✅ 應用已就緒');
    console.log('版本:', event.detail.version);
  });
  
  // 2. 設置就緒回調
  AppInit.onReady(() => {
    console.log('🎉 應用初始化完成，開始載入資料');
    // 載入用戶資料、課程記錄等
  });
  
  // 3. 執行初始化
  const success = await initApp({
    env: 'production',
    onProgress: (step, progress) => {
      // 更新進度條
      console.log(`[${progress}%] ${step}`);
    }
  });
  
  // 4. 檢查結果
  if (success) {
    console.log('✅ 應用程式已啟動');
    
    // 獲取應用狀態
    const state = AppInit.getAppState();
    console.log('應用狀態:', state);
  } else {
    console.error('❌ 應用程式啟動失敗');
    alert('啟動失敗，請重新載入頁面');
  }
}

// ============================================================================
// 範例 14: 測試環境初始化
// ============================================================================

async function testEnvironmentExample() {
  // 使用測試配置
  const testConfig = getConfig('test');
  
  // 初始化測試環境
  await initApp({
    env: 'test',
    skipAuth: true,  // 測試時跳過認證
    onProgress: (step, progress) => {
      console.log(`[TEST] ${step} - ${progress}%`);
    }
  });
  
  // 執行測試
  console.log('🧪 開始執行測試...');
}

// ============================================================================
// 匯出所有範例
// ============================================================================

export {
  manualInitExample,
  developmentInitExample,
  customInitExample,
  loginPageExample,
  granularControlExample,
  configExample,
  stepByStepInitExample,
  eventListenerExample,
  legacyCompatExample,
  oldAPIExample,
  newAPIExample,
  bestPractice1,
  bestPractice2,
  bestPractice3,
  bestPractice4,
  bestPractice5,
  completeExample,
  testEnvironmentExample
};

// ============================================================================
// 預設匯出
// ============================================================================

export default {
  manualInit: manualInitExample,
  developmentInit: developmentInitExample,
  customInit: customInitExample,
  loginPage: loginPageExample,
  granularControl: granularControlExample,
  config: configExample,
  stepByStep: stepByStepInitExample,
  eventListener: eventListenerExample,
  legacyCompat: legacyCompatExample,
  complete: completeExample,
  test: testEnvironmentExample
};

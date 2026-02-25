import { chromium } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config) {
  console.log('🚀 開始 E2E 測試全局設置...');
  
  try {
    // 設置測試環境變量
    process.env.NODE_ENV = 'test';
    process.env.TEST_MODE = 'true';
    
    // 清理之前的測試數據
    console.log('🧹 清理測試環境...');
    await cleanupTestData();
    
    // 設置測試數據庫
    console.log('📊 設置測試數據庫...');
    await setupTestDatabase();
    
    // 設置測試用戶
    console.log('👤 設置測試用戶...');
    await setupTestUsers();
    
    // 啟動開發服務器（如果尚未運行）
    console.log('🔧 檢查開發服務器狀態...');
    await checkDevServer();
    
    // 設置測試數據
    console.log('📋 設置測試數據...');
    await setupTestData();
    
    console.log('✅ E2E 測試全局設置完成');
    
  } catch (error) {
    console.error('❌ E2E 測試設置失敗:', error);
    throw error;
  }
}

async function cleanupTestData() {
  try {
    // 清理瀏覽器存儲
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.clearCookies();
    await context.clearPermissions();
    await browser.close();
    
    // 清理測試結果目錄
    try {
      execSync('rm -rf test-results/playwright-*', { stdio: 'inherit' });
    } catch (e) {
      // 忽略清理錯誤
    }
    
  } catch (error) {
    console.warn('⚠️ 清理測試數據時出現警告:', error.message);
  }
}

async function setupTestDatabase() {
  try {
    // 這裡可以設置測試專用的 IndexedDB 或 PouchDB
    console.log('📚 初始化測試數據庫...');
    
    // 可以在這裡添加數據庫初始化邏輯
    // 例如：創建測試用的數據庫文件、設置索引等
    
  } catch (error) {
    console.warn('⚠️ 設置測試數據庫時出現警告:', error.message);
  }
}

async function setupTestUsers() {
  try {
    // 創建測試用戶數據
    const testUsers = [
      {
        id: 'test-coach-1',
        username: 'test-coach',
        password: 'test-password',
        displayName: '測試教練',
        role: 'coach',
        email: 'coach@test.com'
      },
      {
        id: 'test-user-1',
        username: 'test-user',
        password: 'test-password',
        displayName: '測試用戶',
        role: 'user',
        email: 'user@test.com'
      },
      {
        id: 'test-admin-1',
        username: 'test-admin',
        password: 'test-password',
        displayName: '測試管理員',
        role: 'admin',
        email: 'admin@test.com'
      }
    ];
    
    // 將測試用戶信息存儲到環境變量或文件中
    process.env.TEST_USERS = JSON.stringify(testUsers);
    
    console.log(`✅ 已設置 ${testUsers.length} 個測試用戶`);
    
  } catch (error) {
    console.warn('⚠️ 設置測試用戶時出現警告:', error.message);
  }
}

async function checkDevServer() {
  try {
    // 檢查開發服務器是否正在運行
    const response = await fetch('http://localhost:3000').catch(() => null);
    
    if (!response || !response.ok) {
      console.log('🚀 啟動開發服務器...');
      // 在 CI 環境中，Playwright 會自動啟動服務器
      // 這裡只是記錄狀態
    } else {
      console.log('✅ 開發服務器已在運行');
    }
    
  } catch (error) {
    console.warn('⚠️ 檢查開發服務器時出現警告:', error.message);
  }
}

async function setupTestData() {
  try {
    // 設置測試用的課堂數據、學員數據等
    const testData = {
      classes: [
        {
          id: 'test-class-1',
          name: '測試課堂',
          date: new Date().toISOString(),
          coachId: 'test-coach-1'
        }
      ],
      students: [
        {
          id: 'test-student-1',
          name: '測試學員',
          age: 10,
          level: 'beginner'
        }
      ]
    };
    
    // 將測試數據存儲到環境變量
    process.env.TEST_DATA = JSON.stringify(testData);
    
    console.log('✅ 測試數據設置完成');
    
  } catch (error) {
    console.warn('⚠️ 設置測試數據時出現警告:', error.message);
  }
}

export default globalSetup;

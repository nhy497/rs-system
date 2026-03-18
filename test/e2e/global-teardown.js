import { chromium } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config) {
  console.log('🧹 開始 E2E 測試全局清理...');

  try {
    // 清理測試數據
    console.log('� 清理測試數據...');
    await cleanupTestData();

    // 清理測試用戶
    console.log('👤 清理測試用戶...');
    await cleanupTestUsers();

    // 清理測試數據庫
    console.log('� 清理測試數據庫...');
    await cleanupTestDatabase();

    // 生成測試報告摘要
    console.log('📊 生成測試報告摘要...');
    await generateTestSummary();

    // 清理臨時文件
    console.log('🗂️ 清理臨時文件...');
    await cleanupTempFiles();

    console.log('✅ E2E 測試全局清理完成');

  } catch (error) {
    console.error('❌ E2E 測試清理失敗:', error);
    // 不拋出錯誤，避免影響測試結果
  }
}

async function cleanupTestData() {
  try {
    // 清理瀏覽器存儲和會話
    const browser = await chromium.launch();
    const context = await browser.newContext();

    // 清理所有 cookies 和存儲
    await context.clearCookies();
    await context.clearPermissions();

    // 清理 IndexedDB
    await context.evaluate(() => {
      if (window.indexedDB) {
        const databases = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
        return databases.then(dbList => Promise.all(dbList.map(db => new Promise(resolve => {
          const deleteReq = indexedDB.deleteDatabase(db.name);
          deleteReq.onsuccess = resolve;
          deleteReq.onerror = resolve;
        }))));
      }
    });

    await browser.close();

    // 清理測試結果中的敏感數據
    try {
      execSync('find test-results -name "*.json" -exec sed -i "s/password/*****/g" {} \\;', { stdio: 'inherit' });
    } catch (e) {
      // 忽略清理錯誤
    }

  } catch (error) {
    console.warn('⚠️ 清理測試數據時出現警告:', error.message);
  }
}

async function cleanupTestUsers() {
  try {
    // 清理環境變量中的測試用戶信息
    delete process.env.TEST_USERS;

    // 如果有測試用戶數據庫，在這裡清理
    console.log('✅ 測試用戶清理完成');

  } catch (error) {
    console.warn('⚠️ 清理測試用戶時出現警告:', error.message);
  }
}

async function cleanupTestDatabase() {
  try {
    // 清理測試數據庫
    console.log('📚 清理測試數據庫...');

    // 清理環境變量中的測試數據
    delete process.env.TEST_DATA;

    // 如果有持久化的測試數據庫文件，在這裡清理
    try {
      execSync('rm -f test-db.* test-*.db', { stdio: 'inherit' });
    } catch (e) {
      // 忽略文件不存在的錯誤
    }

    console.log('✅ 測試數據庫清理完成');

  } catch (error) {
    console.warn('⚠️ 清理測試數據庫時出現警告:', error.message);
  }
}

async function generateTestSummary() {
  try {
    // 檢查測試結果文件是否存在
    const fs = await import('fs/promises');

    try {
      const testResults = await fs.readFile('./test-results/playwright-results.json', 'utf8');
      const results = JSON.parse(testResults);

      console.log('📊 測試結果摘要:');
      console.log(`- 總測試數: ${results.suites?.reduce((acc, suite) => acc + suite.specs?.length || 0, 0) || 0}`);
      console.log(`- 通過: ${results.suites?.reduce((acc, suite) =>
        acc + suite.specs?.filter(spec => spec.ok).length || 0, 0) || 0}`);
      console.log(`- 失敗: ${results.suites?.reduce((acc, suite) =>
        acc + suite.specs?.filter(spec => !spec.ok).length || 0, 0) || 0}`);

    } catch (e) {
      console.log('📊 無法讀取測試結果文件');
    }

  } catch (error) {
    console.warn('⚠️ 生成測試摘要時出現警告:', error.message);
  }
}

async function cleanupTempFiles() {
  try {
    // 清理臨時文件和目錄
    const tempPatterns = [
      'test-results/playwright-report',
      'test-results/playwright-artifacts',
      'test-results/playwright-*',
      '.playwright',
      'playwright-report'
    ];

    for (const pattern of tempPatterns) {
      try {
        execSync(`rm -rf ${pattern}`, { stdio: 'inherit' });
      } catch (e) {
        // 忽略清理錯誤
      }
    }

    console.log('✅ 臨時文件清理完成');

  } catch (error) {
    console.warn('⚠️ 清理臨時文件時出現警告:', error.message);
  }
}

export default globalTeardown;

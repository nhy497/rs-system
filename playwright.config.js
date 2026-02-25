import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 測試目錄
  testDir: './test/e2e',
  
  // 全域設定檔
  globalSetup: './test/e2e/global-setup.js',
  globalTeardown: './test/e2e/global-teardown.js',
  
  // 執行配置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 報告配置
  reporter: [
    ['html', { outputFolder: './test-results/playwright-report' }],
    ['json', { outputFile: './test-results/playwright-results.json' }],
    ['junit', { outputFile: './test-results/playwright-junit.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  // 全域設定
  use: {
    // 基礎 URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // 瀏覽器配置
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 超時設定
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // 忽略 HTTPS 錯誤
    ignoreHTTPSErrors: true,
  },
  
  // 專案配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // 本地開發伺服器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // 輸出目錄
  outputDir: './test-results/playwright-artifacts',
  
  // 測試匹配模式
  testMatch: '**/*.spec.{js,ts}',
  
  // 忽略模式
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
  ],
});

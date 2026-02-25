import { test, expect } from '@playwright/test';

test.describe('登入功能測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
  });

  test('應該顯示登入表單', async ({ page }) => {
    // 檢查頁面標題
    await expect(page).toHaveTitle(/登入/);
    
    // 檢查表單元素
    await expect(page.locator('form#loginForm')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('應該顯示驗證錯誤訊息', async ({ page }) => {
    // 提交空表單
    await page.click('button[type="submit"]');
    
    // 檢查錯誤訊息
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('請輸入用戶名');
  });

  test('應該處理無效的登入憑證', async ({ page }) => {
    // 輸入無效憑證
    await page.fill('input[name="username"]', 'invalid-user');
    await page.fill('input[name="password"]', 'invalid-password');
    await page.click('button[type="submit"]');
    
    // 檢查錯誤訊息
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('用戶名或密碼錯誤');
  });

  test('應該成功登入並重定向', async ({ page }) => {
    // 輸入有效憑證
    await page.fill('input[name="username"]', 'test-user');
    await page.fill('input[name="password"]', 'test-password');
    await page.click('button[type="submit"]');
    
    // 檢查是否重定向到主頁
    await expect(page).toHaveURL(/index\.html/);
    
    // 檢查用戶名稱顯示
    await expect(page.locator('.user-display')).toBeVisible();
    await expect(page.locator('.user-display')).toContainText('test-user');
  });

  test('應該記住登入狀態', async ({ page, context }) => {
    // 登入
    await page.fill('input[name="username"]', 'test-user');
    await page.fill('input[name="password"]', 'test-password');
    await page.click('button[type="submit"]');
    
    // 等待登入成功
    await expect(page).toHaveURL(/index\.html/);
    
    // 重新載入頁面
    await page.reload();
    
    // 檢查是否保持登入狀態
    await expect(page.locator('.user-display')).toBeVisible();
    await expect(page.locator('.user-display')).toContainText('test-user');
  });

  test('應該能夠登出', async ({ page }) => {
    // 先登入
    await page.fill('input[name="username"]', 'test-user');
    await page.fill('input[name="password"]', 'test-password');
    await page.click('button[type="submit"]');
    
    // 等待登入成功
    await expect(page).toHaveURL(/index\.html/);
    
    // 點擊登出按鈕
    await page.click('.logout-btn');
    
    // 檢查是否重定向到登入頁面
    await expect(page).toHaveURL(/login\.html/);
    
    // 檢查用戶顯示是否消失
    await expect(page.locator('.user-display')).not.toBeVisible();
  });
});

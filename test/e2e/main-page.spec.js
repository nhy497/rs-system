import { test, expect } from '@playwright/test';

test.describe('主頁面功能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 登入後訪問主頁
    await page.goto('/login.html');
    await page.fill('input[name="username"]', 'test-user');
    await page.fill('input[name="password"]', 'test-password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/index\.html/);
  });

  test('應該顯示主頁面標題', async ({ page }) => {
    await expect(page).toHaveTitle(/RS-System|跳繩課堂/);
  });

  test('應該顯示用戶信息', async ({ page }) => {
    await expect(page.locator('.user-display')).toBeVisible();
    await expect(page.locator('.user-display')).toContainText('test-user');
  });

  test('應該顯示導航菜單', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href*="records"]')).toBeVisible();
    await expect(page.locator('nav a[href*="presets"]')).toBeVisible();
    await expect(page.locator('nav a[href*="users"]')).toBeVisible();
  });

  test('應該能夠訪問記錄頁面', async ({ page }) => {
    await page.click('nav a[href*="records"]');
    
    // 檢查是否導航到記錄頁面
    await expect(page.locator('h1, h2')).toContainText(/記錄|Records/);
  });

  test('應該能夠訪問預設頁面', async ({ page }) => {
    await page.click('nav a[href*="presets"]');
    
    // 檢查是否導航到預設頁面
    await expect(page.locator('h1, h2')).toContainText(/預設|Presets/);
  });

  test('應該能夠訪問用戶管理頁面', async ({ page }) => {
    await page.click('nav a[href*="users"]');
    
    // 檢查是否導航到用戶管理頁面
    await expect(page.locator('h1, h2')).toContainText(/用戶|Users/);
  });

  test('應該能夠登出', async ({ page }) => {
    await page.click('.logout-btn');
    
    // 檢查是否重定向到登入頁面
    await expect(page).toHaveURL(/login\.html/);
  });

  test('應該響應式設計', async ({ page }) => {
    // 測試桌面尺寸
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('nav')).toBeVisible();
    
    // 測試平板尺寸
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('nav')).toBeVisible();
    
    // 測試手機尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 檢查是否有漢堡菜單或其他響應式元素
    const mobileMenu = page.locator('.mobile-menu, .hamburger, .menu-toggle');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('.nav-menu, .mobile-nav')).toBeVisible();
    }
  });

  test('應該處理表單提交', async ({ page }) => {
    // 尋找表單元素
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      // 填寫表單
      const inputs = form.locator('input:not([type="submit"]):not([type="button"])');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputType = await input.getAttribute('type');
        const inputName = await input.getAttribute('name') || '';
        
        if (inputType === 'text') {
          await input.fill(`測試數據 ${i}`);
        } else if (inputType === 'number') {
          await input.fill('123');
        } else if (inputType === 'date') {
          await input.fill('2024-01-15');
        } else if (inputType === 'time') {
          await input.fill('09:00');
        }
      }
      
      // 提交表單
      await form.locator('button[type="submit"], input[type="submit"]').click();
      
      // 檢查是否有成功消息或錯誤消息
      const message = page.locator('.success-message, .error-message, .toast');
      if (await message.isVisible()) {
        expect(await message.textContent()).toBeTruthy();
      }
    }
  });

  test('應該處理數據表格', async ({ page }) => {
    // 尋找表格
    const table = page.locator('table').first();
    if (await table.isVisible()) {
      // 檢查表格結構
      await expect(table.locator('thead')).toBeVisible();
      await expect(table.locator('tbody')).toBeVisible();
      
      // 檢查表格行
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        // 檢查第一行的內容
        const firstRow = rows.first();
        await expect(firstRow.locator('td')).toHaveCount.greaterThan(0);
      }
      
      // 檢查分頁控件（如果存在）
      const pagination = page.locator('.pagination, .pager');
      if (await pagination.isVisible()) {
        await expect(pagination.locator('a, button')).toHaveCount.greaterThan(0);
      }
    }
  });

  test('應該處理模態框', async ({ page }) => {
    // 尋找觸發模態框的按鈕
    const modalTrigger = page.locator('[data-toggle="modal"], .modal-trigger, .open-modal').first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      
      // 檢查模態框是否顯示
      const modal = page.locator('.modal, .dialog').first();
      await expect(modal).toBeVisible();
      
      // 檢查關閉按鈕
      const closeButton = modal.locator('.close, .modal-close, [data-dismiss="modal"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('應該處理搜索功能', async ({ page }) => {
    // 尋找搜索框
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"], .search-input').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('測試搜索');
      
      // 等待搜索結果
      await page.waitForTimeout(1000);
      
      // 檢查是否有搜索結果
      const searchResults = page.locator('.search-results, .results');
      if (await searchResults.isVisible()) {
        expect(await searchResults.textContent()).toBeTruthy();
      }
    }
  });
});

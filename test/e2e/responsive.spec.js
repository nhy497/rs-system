import { test, expect } from '@playwright/test';

const devices = [
  { name: 'Desktop', width: 1200, height: 800 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Mobile Small', width: 320, height: 568 }
];

test.describe('響應式設計測試', () => {
  devices.forEach(device => {
    test.describe(`${device.name} (${device.width}x${device.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
      });

      test('登入頁面響應式測試', async ({ page }) => {
        await page.goto('/login.html');

        // 檢查頁面標題
        await expect(page.locator('h1, h2')).toBeVisible();

        // 檢查登入表單
        await expect(page.locator('form')).toBeVisible();
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // 檢查表單佈局
        const form = page.locator('form');
        const formBox = await form.boundingBox();
        expect(formBox).toBeTruthy();

        // 在小屏幕上檢查表單是否適合屏幕
        if (device.width <= 414) {
          expect(formBox.width).toBeLessThanOrEqual(device.width - 40); // 留邊距
        }
      });

      test('主頁面響應式測試', async ({ page }) => {
        // 先登入
        await page.goto('/login.html');
        await page.fill('input[name="username"]', 'test-user');
        await page.fill('input[name="password"]', 'test-password');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/index\.html/);

        // 檢查導航欄
        const nav = page.locator('nav, .navbar, .navigation');
        if (await nav.isVisible()) {
          const navBox = await nav.boundingBox();
          expect(navBox).toBeTruthy();

          // 在小屏幕上導航欄應該適合屏幕
          if (device.width <= 414) {
            expect(navBox.width).toBeLessThanOrEqual(device.width);
          }
        }

        // 檢查主要內容區域
        const main = page.locator('main, .main-content, .content');
        if (await main.isVisible()) {
          const mainBox = await main.boundingBox();
          expect(mainBox).toBeTruthy();

          // 內容區域應該有合理的寬度
          expect(mainBox.width).toBeGreaterThan(0);
          expect(mainBox.width).toBeLessThanOrEqual(device.width);
        }

        // 檢查移動端菜單
        if (device.width <= 768) {
          const mobileMenu = page.locator('.mobile-menu, .hamburger, .menu-toggle, .nav-toggle');
          if (await mobileMenu.isVisible()) {
            await mobileMenu.click();

            // 檢查移動端導航是否展開
            const mobileNav = page.locator('.mobile-nav, .nav-menu, .sidebar');
            await expect(mobileNav).toBeVisible();
          }
        }
      });

      test('表格響應式測試', async ({ page }) => {
        // 登入並導航到有表格的頁面
        await page.goto('/login.html');
        await page.fill('input[name="username"]', 'test-user');
        await page.fill('input[name="password"]', 'test-password');
        await page.click('button[type="submit"]');

        // 尋找表格
        const table = page.locator('table').first();
        if (await table.isVisible()) {
          const tableBox = await table.boundingBox();
          expect(tableBox).toBeTruthy();

          // 在小屏幕上表格可能需要水平滾動
          if (device.width <= 414) {
            // 檢查表格容器是否有滾動
            const tableContainer = table.locator('.., .table-container, .table-responsive');
            if (await tableContainer.isVisible()) {
              const containerStyle = await tableContainer.evaluate(el => window.getComputedStyle(el));

              // 檢查是否有 overflow-x: auto 或 scroll
              expect(['auto', 'scroll']).toContain(containerStyle.overflowX);
            }
          }
        }
      });

      test('表單響應式測試', async ({ page }) => {
        // 登入
        await page.goto('/login.html');
        await page.fill('input[name="username"]', 'test-user');
        await page.fill('input[name="password"]', 'test-password');
        await page.click('button[type="submit"]');

        // 尋找表單
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const formBox = await form.boundingBox();
          expect(formBox).toBeTruthy();

          // 檢查表單元素佈局
          const inputs = form.locator('input, select, textarea');
          const inputCount = await inputs.count();

          for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            if (await input.isVisible()) {
              const inputBox = await input.boundingBox();
              expect(inputBox).toBeTruthy();

              // 輸入框應該適合屏幕寬度
              if (device.width <= 414) {
                expect(inputBox.width).toBeLessThanOrEqual(device.width - 40);
              }
            }
          }
        }
      });

      test('按鈕響應式測試', async ({ page }) => {
        await page.goto('/login.html');

        // 檢查登入按鈕
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible();

        const buttonBox = await submitButton.boundingBox();
        expect(buttonBox).toBeTruthy();

        // 按鈕應該有足夠的點擊區域
        expect(buttonBox.height).toBeGreaterThanOrEqual(44); // 最小觸摸目標
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);

        // 在小屏幕上按鈕可能需要全寬
        if (device.width <= 414) {
          const buttonStyle = await submitButton.evaluate(el => window.getComputedStyle(el));

          // 檢查是否為塊級元素或有適當的寬度
          expect(['block', 'flex', 'grid']).toContain(buttonStyle.display);
        }
      });

      test('文字可讀性測試', async ({ page }) => {
        await page.goto('/login.html');

        // 檢查主要文字元素
        const textElements = page.locator('h1, h2, h3, p, label, span');
        const elementCount = await textElements.count();

        for (let i = 0; i < Math.min(elementCount, 10); i++) { // 檢查前10個元素
          const element = textElements.nth(i);
          if (await element.isVisible()) {
            const elementStyle = await element.evaluate(el => window.getComputedStyle(el));

            // 檢查字體大小
            const fontSize = parseFloat(elementStyle.fontSize);
            expect(fontSize).toBeGreaterThan(12); // 最小字體大小

            // 檢查顏色對比度（簡單檢查）
            const {color} = elementStyle;
            expect(color).not.toBe('rgb(128, 128, 128)'); // 避免灰色文字
          }
        }
      });

      test('觸摸目標測試', async ({ page }) => {
        await page.goto('/login.html');

        // 檢查可點擊元素
        const clickableElements = page.locator('button, a, input[type="submit"], input[type="button"], [role="button"]');
        const elementCount = await clickableElements.count();

        for (let i = 0; i < Math.min(elementCount, 5); i++) { // 檢查前5個元素
          const element = clickableElements.nth(i);
          if (await element.isVisible()) {
            const elementBox = await element.boundingBox();
            expect(elementBox).toBeTruthy();

            // 觸摸目標應該至少 44x44px
            expect(elementBox.height).toBeGreaterThanOrEqual(44);
            expect(elementBox.width).toBeGreaterThanOrEqual(44);
          }
        }
      });
    });
  });
});

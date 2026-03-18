import { test, expect } from '@playwright/test';

test.describe('視覺回歸測試', () => {
  test.beforeEach(async ({ page }) => {
    // 設置視覺測試選項
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 禁用動畫以確保一致的截圖
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test('主頁視覺回歸測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    // 等待頁面完全加載
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 截取整個頁面
    await expect(page).toHaveScreenshot('main-page-full.png', {
      fullPage: true,
      animations: 'disabled'
    });

    // 截取主要區域
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header.png');

    const main = page.locator('main');
    await expect(main).toHaveScreenshot('main-content.png');

    const footer = page.locator('footer');
    await expect(footer).toHaveScreenshot('footer.png');
  });

  test('登入頁面視覺回歸測試', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 截取登入表單
    const loginForm = page.locator('#loginForm');
    await expect(loginForm).toHaveScreenshot('login-form.png');

    // 測試表單驗證狀態
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    await expect(loginForm).toHaveScreenshot('login-form-validation.png');
  });

  test('響應式設計視覺測試', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/index.html', { waitUntil: 'networkidle' });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // 截取響應式佈局
      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('交互狀態視覺測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 測試按鈕狀態
    const buttons = page.locator('button, .btn');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);

      // 正常狀態
      await expect(button).toHaveScreenshot(`button-${i}-normal.png`);

      // 懸停狀態
      await button.hover();
      await expect(button).toHaveScreenshot(`button-${i}-hover.png`);

      // 焦點狀態
      await button.focus();
      await expect(button).toHaveScreenshot(`button-${i}-focus.png`);

      // 重置狀態
      await page.mouse.move(0, 0);
    }
  });

  test('表單元素視覺測試', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 測試輸入框狀態
    const usernameInput = page.locator('input[name="username"]');

    // 正常狀態
    await expect(usernameInput).toHaveScreenshot('input-normal.png');

    // 焦點狀態
    await usernameInput.focus();
    await expect(usernameInput).toHaveScreenshot('input-focus.png');

    // 填寫狀態
    await usernameInput.fill('test-user');
    await expect(usernameInput).toHaveScreenshot('input-filled.png');

    // 錯誤狀態
    await usernameInput.fill('');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    await expect(usernameInput).toHaveScreenshot('input-error.png');
  });

  test('模態窗口視覺測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 嘗試打開模態窗口
    const modalTrigger = page.locator('[data-toggle="modal"], .modal-trigger');
    const triggerCount = await modalTrigger.count();

    if (triggerCount > 0) {
      await modalTrigger.first().click();
      await page.waitForTimeout(500);

      const modal = page.locator('.modal');
      await expect(modal).toHaveScreenshot('modal-open.png');

      // 關閉模態窗口
      const closeButton = page.locator('.modal-close, .close');
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(500);
        await expect(modal).toHaveScreenshot('modal-closed.png');
      }
    }
  });

  test('列表和表格視覺測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 查找列表或表格
    const lists = page.locator('ul, ol, .list, table');
    const listCount = await lists.count();

    if (listCount > 0) {
      for (let i = 0; i < Math.min(listCount, 3); i++) {
        const list = lists.nth(i);

        // 正常狀態
        await expect(list).toHaveScreenshot(`list-${i}-normal.png`);

        // 如果是表格，測試排序狀態
        if (await list.evaluate(el => el.tagName === 'TABLE')) {
          const headers = list.locator('th');
          const headerCount = await headers.count();

          if (headerCount > 0) {
            await headers.first().click();
            await page.waitForTimeout(500);
            await expect(list).toHaveScreenshot(`table-${i}-sorted.png`);
          }
        }
      }
    }
  });

  test('導航菜單視覺測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const nav = page.locator('nav, .navigation');
    const navExists = await nav.count() > 0;

    if (navExists) {
      // 正常狀態
      await expect(nav).toHaveScreenshot('nav-normal.png');

      // 測試導航項目懸停
      const navItems = nav.locator('a, .nav-item');
      const itemCount = await navItems.count();

      for (let i = 0; i < Math.min(itemCount, 3); i++) {
        const item = navItems.nth(i);
        await item.hover();
        await expect(nav).toHaveScreenshot(`nav-item-${i}-hover.png`);
        await page.mouse.move(0, 0);
      }

      // 測試活動狀態
      const activeItem = nav.locator('.active, [aria-current="page"]');
      if (await activeItem.count() > 0) {
        await expect(nav).toHaveScreenshot('nav-active.png');
      }
    }
  });

  test('錯誤頁面視覺測試', async ({ page }) => {
    // 測試 404 頁面
    await page.goto('/non-existent-page.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('404-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('主題切換視覺測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 測試深色主題（如果支持）
    const themeToggle = page.locator('[data-theme-toggle], .theme-toggle');
    const themeToggleExists = await themeToggle.count() > 0;

    if (themeToggleExists) {
      // 淺色主題
      await expect(page).toHaveScreenshot('theme-light.png', {
        fullPage: true,
        animations: 'disabled'
      });

      // 切換到深色主題
      await themeToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('theme-dark.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('內容加載狀態視覺測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');

    // 模擬加載狀態
    await page.addStyleTag({
      content: `
        .loading::before {
          content: "載入中...";
          display: block;
          text-align: center;
          padding: 20px;
        }
      `
    });

    // 添加加載狀態到內容區域
    await page.evaluate(() => {
      const mainContent = document.querySelector('main, .main-content');
      if (mainContent) {
        mainContent.classList.add('loading');
      }
    });

    await expect(page.locator('main, .main-content')).toHaveScreenshot('loading-state.png');

    // 移除加載狀態
    await page.evaluate(() => {
      const mainContent = document.querySelector('main, .main-content');
      if (mainContent) {
        mainContent.classList.remove('loading');
      }
    });

    await page.waitForTimeout(500);
    await expect(page.locator('main, .main-content')).toHaveScreenshot('loaded-state.png');
  });

  test('字體和排版視覺測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 測試不同字體大小
    const fontSizes = ['14px', '16px', '18px', '20px'];

    for (const fontSize of fontSizes) {
      await page.addStyleTag({
        content: `
          body {
            font-size: ${fontSize} !important;
          }
        `
      });

      await page.waitForTimeout(500);
      await expect(page.locator('body')).toHaveScreenshot(`font-size-${fontSize.replace('.', '-')}.png`);
    }
  });

  test('高對比度模式視覺測試', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 模擬高對比度模式
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

    await page.addStyleTag({
      content: `
        * {
          background-color: Window !important;
          color: WindowText !important;
          border-color: WindowText !important;
        }
        
        a, a:visited {
          color: LinkText !important;
        }
        
        button, input, select, textarea {
          background-color: Window !important;
          color: WindowText !important;
          border: 2px solid WindowText !important;
        }
        
        button:hover, input:hover, select:hover, textarea:hover {
          background-color: Highlight !important;
          color: HighlightText !important;
        }
      `
    });

    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('high-contrast.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('不同語言視覺測試', async ({ page }) => {
    // 測試中文內容
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 設置為中文
    await page.addStyleTag({
      content: `
        html {
          lang: 'zh-TW';
        }
        
        body {
          font-family: 'Microsoft YaHei', 'SimHei', sans-serif !important;
        }
      `
    });

    // 添加中文測試內容
    await page.evaluate(() => {
      const testContent = document.createElement('div');
      testContent.innerHTML = `
        <h1>中文測試標題</h1>
        <p>這是一段中文測試內容，用來驗證中文字體的顯示效果。</p>
        <ul>
          <li>中文列表項目一</li>
          <li>中文列表項目二</li>
          <li>中文列表項目三</li>
        </ul>
      `;
      testContent.style.cssText = 'padding: 20px; margin: 20px; border: 1px solid #ccc;';
      document.body.appendChild(testContent);
    });

    await page.waitForTimeout(500);
    await expect(page.locator('body > div:last-child')).toHaveScreenshot('chinese-content.png');
  });
});

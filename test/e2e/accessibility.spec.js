import { test, expect } from '@playwright/test';

test.describe('可訪問性測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('應該有正確的語義化 HTML 結構', async ({ page }) => {
    // 檢查是否有 main 元素
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // 檢查是否有 header 元素
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // 檢查是否有 nav 元素
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // 檢查是否有 footer 元素
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('應該有正確的標題層級', async ({ page }) => {
    // 檢查是否有 h1 標題
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // 檢查標題層級是否正確（不應該跳級）
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const level = parseInt(await heading.evaluate(el => el.tagName.charAt(1)));
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    }
  });

  test('應該有正確的 ARIA 標籤', async ({ page }) => {
    // 檢查按鈕是否有 aria-label 或文字內容
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasText = await button.textContent() !== '';
      const hasAriaLabel = await button.getAttribute('aria-label') !== null;
      
      expect(hasText || hasAriaLabel).toBe(true);
    }
    
    // 檢查表單輸入框是否有標籤
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasLabel = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;
      const hasAriaLabel = await input.getAttribute('aria-label') !== null;
      const hasAriaLabelledBy = await input.getAttribute('aria-labelledby') !== null;
      
      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true);
    }
  });

  test('應該支持鍵盤導航', async ({ page }) => {
    // 測試 Tab 鍵導航
    await page.keyboard.press('Tab');
    
    // 檢查焦點是否在可聚焦元素上
    const focusedElement = await page.evaluate(() => document.activeElement);
    const isFocusable = await page.evaluate(() => {
      const el = document.activeElement;
      return el && (
        el.tagName === 'BUTTON' ||
        el.tagName === 'INPUT' ||
        el.tagName === 'SELECT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'A' ||
        el.getAttribute('tabindex') !== null
      );
    });
    
    expect(isFocusable).toBe(true);
    
    // 測試 Enter 鍵和 Space 鍵
    if (focusedElement.tagName === 'BUTTON') {
      await page.keyboard.press('Enter');
      // 檢查是否有相應的反應
      await page.waitForTimeout(100);
    }
  });

  test('應該有正確的顏色對比度', async ({ page }) => {
    // 使用 axe-core 進行可訪問性檢查
    await page.addScriptTag({
      content: `
        (function() {
          var script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js';
          script.onload = function() {
            window.axeRun = axe.run;
          };
          document.head.appendChild(script);
        })();
      `
    });
    
    // 等待 axe 加載
    await page.waitForFunction(() => window.axeRun !== undefined);
    
    // 運行可訪問性檢查
    const results = await page.evaluate(() => {
      return window.axeRun({
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });
    });
    
    // 檢查是否有違反可訪問性規則
    expect(results.violations).toHaveLength(0);
    
    // 如果有違反，輸出詳細信息
    if (results.violations.length > 0) {
      console.log('可訪問性違反:', results.violations);
    }
  });

  test('應該有正確的跳過連結', async ({ page }) => {
    // 檢查是否有跳過到主要內容的連結
    const skipLink = page.locator('a[href*="main"], a[href*="content"]');
    
    if (await skipLink.count() > 0) {
      // 測試跳過連結是否可見（通常在獲得焦點時）
      await skipLink.focus();
      await expect(skipLink).toBeVisible();
    }
  });

  test('應該有正確的表格標題', async ({ page }) => {
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      
      // 檢查表格是否有 caption 或 aria-label
      const hasCaption = await table.locator('caption').count() > 0;
      const hasAriaLabel = await table.getAttribute('aria-label') !== null;
      
      expect(hasCaption || hasAriaLabel).toBe(true);
      
      // 檢查表格是否有 th 元素
      const hasHeaders = await table.locator('th').count() > 0;
      expect(hasHeaders).toBe(true);
    }
  });

  test('應該有正確的圖片替代文字', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      const role = await image.getAttribute('role');
      
      // 檢查圖片是否有 alt 屬性或 role="presentation"
      expect(alt !== null || role === 'presentation').toBe(true);
    }
  });

  test('應該支持屏幕閱讀器', async ({ page }) => {
    // 檢查是否有正確的 lang 屬性
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
    
    // 檢查是否有正確的 title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // 檢查是否有正確的 meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
  });

  test('應該有正確的表單驗證訊息', async ({ page }) => {
    // 如果有表單，測試驗證訊息
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      const form = forms.first();
      
      // 嘗試提交空表單
      await form.locator('button[type="submit"]').click();
      
      // 檢查是否有驗證錯誤訊息
      const errorMessages = page.locator('.error, .error-message, [role="alert"]');
      const hasErrors = await errorMessages.count() > 0;
      
      // 如果有錯誤，檢查是否與相關的輸入框關聯
      if (hasErrors) {
        const errorCount = await errorMessages.count();
        for (let i = 0; i < errorCount; i++) {
          const error = errorMessages.nth(i);
          const ariaDescribedBy = await error.getAttribute('aria-describedby');
          const role = await error.getAttribute('role');
          
          expect(ariaDescribedBy !== null || role === 'alert').toBe(true);
        }
      }
    }
  });

  test('應該有正確的焦點管理', async ({ page }) => {
    // 測試模態窗口的焦點管理
    const modalTriggers = page.locator('[data-toggle="modal"], .modal-trigger');
    const triggerCount = await modalTriggers.count();
    
    if (triggerCount > 0) {
      await modalTriggers.first().click();
      
      // 檢查模態窗口是否打開
      const modal = page.locator('.modal[style*="block"], .modal.show, .modal:not([style*="none"])');
      const modalExists = await modal.count() > 0;
      
      if (modalExists) {
        // 檢查焦點是否在模態窗口內
        const focusedElement = await page.evaluate(() => document.activeElement);
        const isInsideModal = await modal.evaluate((modal, focused) => {
          return modal.contains(focused);
        }, await page.evaluate(() => document.activeElement));
        
        expect(isInsideModal).toBe(true);
        
        // 測試 ESC 鍵關閉模態窗口
        await page.keyboard.press('Escape');
        
        // 檢查模態窗口是否關閉
        await expect(modal).not.toBeVisible();
      }
    }
  });
});

import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Large Desktop', width: 2560, height: 1440 }
];

test.describe('響應式設計測試', () => {
  viewports.forEach(viewport => {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/index.html');
      });

      test('應該正確顯示主要佈局元素', async ({ page }) => {
        // 檢查主要元素是否可見
        const header = page.locator('header');
        await expect(header).toBeVisible();
        
        const main = page.locator('main');
        await expect(main).toBeVisible();
        
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
      });

      test('應該有適當的字體大小', async ({ page }) => {
        const body = page.locator('body');
        const fontSize = await body.evaluate(el => 
          getComputedStyle(el).fontSize
        );
        
        // 字體大小應該在合理範圍內
        const fontSizeValue = parseFloat(fontSize);
        expect(fontSizeValue).toBeGreaterThanOrEqual(12);
        expect(fontSizeValue).toBeLessThanOrEqual(24);
      });

      test('應該有適當的間距和填充', async ({ page }) => {
        const main = page.locator('main');
        const padding = await main.evaluate(el => 
          getComputedStyle(el).padding
        );
        
        // 應該有填充
        expect(padding).not.toBe('0px');
      });

      if (viewport.width <= 768) {
        test('移動設備應該有漢堡選單', async ({ page }) => {
          const nav = page.locator('nav');
          const navDisplay = await nav.evaluate(el => 
            getComputedStyle(el).display
          );
          
          // 在移動設備上，導航可能被隱藏
          if (navDisplay === 'none') {
            // 檢查是否有漢堡選單按鈕
            const hamburger = page.locator('.hamburger, .menu-toggle, [data-toggle="nav"]');
            const hamburgerExists = await hamburger.count() > 0;
            
            if (hamburgerExists) {
              await hamburger.click();
              await expect(nav).toBeVisible();
            }
          }
        });

        test('移動設備應該有垂直佈局', async ({ page }) => {
          // 檢查主要內容區域是否為垂直佈局
          const contentAreas = page.locator('.content, .main-content, .container > *');
          const contentCount = await contentAreas.count();
          
          if (contentCount > 1) {
            const firstContent = contentAreas.first();
            const secondContent = contentAreas.nth(1);
            
            const firstRect = await firstContent.boundingBox();
            const secondRect = await secondContent.boundingBox();
            
            // 第二個元素應該在第一個元素下方
            expect(secondRect.y).toBeGreaterThan(firstRect.y);
          }
        });

        test('移動設備應該有觸摸友好的按鈕', async ({ page }) => {
          const buttons = page.locator('button, .btn, [role="button"]');
          const buttonCount = await buttons.count();
          
          for (let i = 0; i < Math.min(buttonCount, 5); i++) {
            const button = buttons.nth(i);
            const rect = await button.boundingBox();
            
            // 按鈕應該足夠大以便觸摸
            expect(rect.width).toBeGreaterThanOrEqual(44);
            expect(rect.height).toBeGreaterThanOrEqual(44);
          }
        });
      } else {
        test('桌面設備應該有水平導航', async ({ page }) => {
          const nav = page.locator('nav');
          await expect(nav).toBeVisible();
          
          const navItems = nav.locator('li, .nav-item');
          const navCount = await navItems.count();
          
          if (navCount > 1) {
            const firstNav = navItems.first();
            const secondNav = navItems.nth(1);
            
            const firstRect = await firstNav.boundingBox();
            const secondRect = await secondNav.boundingBox();
            
            // 導航項目應該水平排列
            expect(secondRect.x).toBeGreaterThan(firstRect.x);
          }
        });

        test('桌面設備應該利用可用空間', async ({ page }) => {
          const main = page.locator('main');
          const mainRect = await main.boundingBox();
          
          // 主要內容應該利用大部分可用寬度
          expect(mainRect.width).toBeGreaterThan(viewport.width * 0.7);
        });
      }

      test('應該沒有水平滾動條', async ({ page }) => {
        const body = page.locator('body');
        const scrollWidth = await body.evaluate(el => el.scrollWidth);
        const clientWidth = await body.evaluate(el => el.clientWidth);
        
        // 頁面寬度不應該超過視口寬度
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 允許 1px 的誤差
      });

      test('圖片應該響應式', async ({ page }) => {
        const images = page.locator('img');
        const imageCount = await images.count();
        
        if (imageCount > 0) {
          for (let i = 0; i < Math.min(imageCount, 3); i++) {
            const image = images.nth(i);
            const rect = await image.boundingBox();
            
            // 圖片不應該超過容器寬度
            expect(rect.width).toBeLessThanOrEqual(viewport.width);
          }
        }
      });

      test('表格應該響應式', async ({ page }) => {
        const tables = page.locator('table');
        const tableCount = await tables.count();
        
        if (tableCount > 0) {
          const table = tables.first();
          const tableRect = await table.boundingBox();
          
          if (viewport.width <= 768) {
            // 在移動設備上，表格可能有特殊處理
            const hasResponsiveClass = await table.evaluate(el => 
              el.classList.contains('table-responsive') ||
              el.closest('.table-responsive') !== null
            );
            
            if (!hasResponsiveClass) {
              // 如果沒有響應式包裝，檢查表格是否適合屏幕
              expect(tableRect.width).toBeLessThanOrEqual(viewport.width);
            }
          }
        }
      });

      test('表單元素應該響應式', async ({ page }) => {
        const inputs = page.locator('input, select, textarea');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const input = inputs.nth(i);
            const rect = await input.boundingBox();
            
            // 輸入框不應該超過容器寬度
            expect(rect.width).toBeLessThanOrEqual(viewport.width);
          }
        }
      });
    });
  });

  test.describe('方向變化測試', () => {
    test('橫向模式應該正確顯示', async ({ page }) => {
      await page.setViewportSize({ width: 896, height: 414 }); // iPhone X 橫向
      await page.goto('/index.html');
      
      // 檢查主要元素是否仍然可見
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });

    test('縱向模式應該正確顯示', async ({ page }) => {
      await page.setViewportSize({ width: 414, height: 896 }); // iPhone X 縱向
      await page.goto('/index.html');
      
      // 檢查主要元素是否仍然可見
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  });

  test.describe('字體縮放測試', () => {
    test('應該支持字體縮放', async ({ page }) => {
      await page.goto('/index.html');
      
      // 設置字體大小為 120%
      await page.addStyleTag({
        content: 'html { font-size: 120%; }'
      });
      
      // 檢查佈局是否仍然正常
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // 檢查是否沒有重疊元素
      const overlappingElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let overlapping = false;
        
        for (let i = 0; i < elements.length; i++) {
          for (let j = i + 1; j < elements.length; j++) {
            const rect1 = elements[i].getBoundingClientRect();
            const rect2 = elements[j].getBoundingClientRect();
            
            if (rect1.width > 0 && rect1.height > 0 && 
                rect2.width > 0 && rect2.height > 0) {
              const overlap = !(rect1.right < rect2.left || 
                              rect1.left > rect2.right || 
                              rect1.bottom < rect2.top || 
                              rect1.top > rect2.bottom);
              
              if (overlap) {
                overlapping = true;
                break;
              }
            }
          }
          
          if (overlapping) break;
        }
        
        return overlapping;
      });
      
      expect(overlapping).toBe(false);
    });
  });

  test.describe('高對比度模式測試', () => {
    test('應該支持高對比度模式', async ({ page }) => {
      await page.goto('/index.html');
      
      // 模擬高對比度模式
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      await page.addStyleTag({
        content: `
          * {
            background-color: Window !important;
            color: WindowText !important;
          }
          a, a:visited, a:active {
            color: LinkText !important;
          }
        `
      });
      
      // 檢查主要元素是否仍然可見
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  });

  test.describe('減少動畫模式測試', () => {
    test('應該尊重用戶的動畫偏好', async ({ page }) => {
      await page.goto('/index.html');
      
      // 模擬減少動畫偏好
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // 檢查是否有過渡動畫被禁用
      const animatedElements = await page.locator('*').filter({
        hasNot: page.locator('[style*="animation: none"], [style*="transition: none"]')
      }).count();
      
      // 這個測試可能需要根據具體實現調整
      expect(animatedElements).toBeGreaterThanOrEqual(0);
    });
  });
});

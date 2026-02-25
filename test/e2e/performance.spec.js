import { test, expect } from '@playwright/test';

test.describe('性能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 啟用性能監控
    await page.addInitScript(() => {
      // 收集性能指標
      window.performanceMetrics = {
        navigationStart: 0,
        loadEventEnd: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
      };

      // 監控 LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // 監控 CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        window.performanceMetrics.cumulativeLayoutShift = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });

      // 監控 FID
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      }).observe({ entryTypes: ['first-input'] });

      // 監控 FCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          window.performanceMetrics.firstContentfulPaint = fcpEntry.startTime;
        }
      }).observe({ entryTypes: ['paint'] });
    });
  });

  test('頁面加載性能應該符合標準', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    
    // 等待頁面完全加載
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // 等待額外渲染

    // 獲取性能指標
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstContentfulPaint: window.performanceMetrics.firstContentfulPaint,
        largestContentfulPaint: window.performanceMetrics.largestContentfulPaint,
        cumulativeLayoutShift: window.performanceMetrics.cumulativeLayoutShift,
        firstInputDelay: window.performanceMetrics.firstInputDelay,
        totalResources: performance.getEntriesByType('resource').length
      };
    });

    console.log('性能指標:', metrics);

    // 驗證性能指標
    expect(metrics.pageLoadTime).toBeLessThan(3000); // 頁面加載時間 < 3秒
    expect(metrics.domContentLoaded).toBeLessThan(1500); // DOM 加載時間 < 1.5秒
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // FCP < 1.5秒
    expect(metrics.largestContentfulPaint).toBeLessThan(2500); // LCP < 2.5秒
    expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1); // CLS < 0.1
    expect(metrics.firstInputDelay).toBeLessThan(100); // FID < 100ms
  });

  test('資源加載應該高效', async ({ page }) => {
    const responsePromises = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responsePromises.push(response);
      }
    });

    await page.goto('/index.html', { waitUntil: 'networkidle' });

    // 等待所有資源加載完成
    await Promise.all(responsePromises);

    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      const imageResources = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/));

      return {
        totalResources: resources.length,
        jsResources: jsResources.length,
        cssResources: cssResources.length,
        imageResources: imageResources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        jsSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        cssSize: cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        imageSize: imageResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        slowResources: resources.filter(r => r.duration > 1000).length
      };
    });

    console.log('資源指標:', resourceMetrics);

    // 驗證資源指標
    expect(resourceMetrics.totalSize).toBeLessThan(1024 * 1024); // 總大小 < 1MB
    expect(resourceMetrics.jsSize).toBeLessThan(500 * 1024); // JS < 500KB
    expect(resourceMetrics.cssSize).toBeLessThan(100 * 1024); // CSS < 100KB
    expect(resourceMetrics.slowResources).toBeLessThan(2); // 慢資源 < 2個
  });

  test('JavaScript 執行性能應該良好', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    // 測試 JavaScript 執行時間
    const jsPerformance = await page.evaluate(() => {
      const startTime = performance.now();
      
      // 模擬一些 JavaScript 操作
      const testArray = Array.from({ length: 10000 }, (_, i) => i);
      const filtered = testArray.filter(x => x % 2 === 0);
      const mapped = filtered.map(x => x * 2);
      const reduced = mapped.reduce((sum, x) => sum + x, 0);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 測試 DOM 操作性能
      const domStartTime = performance.now();
      const testElements = [];
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.textContent = `Test ${i}`;
        document.body.appendChild(div);
        testElements.push(div);
      }
      
      // 清理
      testElements.forEach(el => el.remove());
      
      const domEndTime = performance.now();
      const domExecutionTime = domEndTime - domStartTime;

      return {
        computationTime: executionTime,
        domManipulationTime: domExecutionTime,
        memoryUsage: performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null
      };
    });

    console.log('JavaScript 性能:', jsPerformance);

    // 驗證 JavaScript 性能
    expect(jsPerformance.computationTime).toBeLessThan(50); // 計算時間 < 50ms
    expect(jsPerformance.domManipulationTime).toBeLessThan(100); // DOM 操作 < 100ms

    if (jsPerformance.memoryUsage) {
      expect(jsPerformance.memoryUsage.used).toBeLessThan(50 * 1024 * 1024); // 內存使用 < 50MB
    }
  });

  test('滾動性能應該流暢', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    // 創建足夠的內容以支持滾動
    await page.evaluate(() => {
      const container = document.querySelector('main') || document.body;
      for (let i = 0; i < 50; i++) {
        const div = document.createElement('div');
        div.style.height = '100px';
        div.textContent = `測試內容 ${i}`;
        container.appendChild(div);
      }
    });

    // 測試滾動性能
    const scrollPerformance = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        let lastTimestamp = performance.now();
        let droppedFrames = 0;
        
        const scrollContainer = document.querySelector('main') || document.documentElement;
        
        function scrollStep() {
          const startTime = performance.now();
          
          scrollContainer.scrollBy(0, 50);
          
          const endTime = performance.now();
          const frameTime = endTime - lastTimestamp;
          
          if (frameTime > 16.67) { // 60fps = 16.67ms per frame
            droppedFrames++;
          }
          
          frameCount++;
          lastTimestamp = endTime;
          
          if (frameCount < 60) { // 測試 60 幀
            requestAnimationFrame(scrollStep);
          } else {
            resolve({
              totalFrames: frameCount,
              droppedFrames: droppedFrames,
              frameDropRate: (droppedFrames / frameCount) * 100,
              averageFrameTime: (endTime - startTime) / frameCount
            });
          }
        }
        
        requestAnimationFrame(scrollStep);
      });
    });

    console.log('滾動性能:', scrollPerformance);

    // 驗證滾動性能
    expect(scrollPerformance.frameDropRate).toBeLessThan(10); // 掉幀率 < 10%
    expect(scrollPerformance.averageFrameTime).toBeLessThan(20); // 平均幀時間 < 20ms
  });

  test('表單交互性能應該良好', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    // 創建測試表單
    await page.evaluate(() => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input type="text" id="testInput" placeholder="測試輸入">
        <select id="testSelect">
          <option value="">選擇選項</option>
          <option value="1">選項1</option>
          <option value="2">選項2</option>
        </select>
        <textarea id="testTextarea" placeholder="測試文本區域"></textarea>
        <button type="button" id="testButton">測試按鈕</button>
      `;
      document.body.appendChild(form);
    });

    // 測試表單交互性能
    const formPerformance = await page.evaluate(() => {
      const input = document.getElementById('testInput');
      const select = document.getElementById('testSelect');
      const textarea = document.getElementById('testTextarea');
      const button = document.getElementById('testButton');

      const results = {};

      // 測試輸入性能
      const inputStartTime = performance.now();
      for (let i = 0; i < 100; i++) {
        input.value = `test ${i}`;
        input.dispatchEvent(new Event('input'));
      }
      results.inputTime = performance.now() - inputStartTime;

      // 測試選擇性能
      const selectStartTime = performance.now();
      for (let i = 0; i < 50; i++) {
        select.selectedIndex = i % 3;
        select.dispatchEvent(new Event('change'));
      }
      results.selectTime = performance.now() - selectStartTime;

      // 測試文本區域性能
      const textareaStartTime = performance.now();
      for (let i = 0; i < 50; i++) {
        textarea.value = `test text ${i}\n`.repeat(10);
        textarea.dispatchEvent(new Event('input'));
      }
      results.textareaTime = performance.now() - textareaStartTime;

      // 測試按鈕點擊性能
      const buttonStartTime = performance.now();
      for (let i = 0; i < 100; i++) {
        button.click();
      }
      results.buttonTime = performance.now() - buttonStartTime;

      return results;
    });

    console.log('表單交互性能:', formPerformance);

    // 驗證表單交互性能
    expect(formPerformance.inputTime).toBeLessThan(100); // 輸入時間 < 100ms
    expect(formPerformance.selectTime).toBeLessThan(50); // 選擇時間 < 50ms
    expect(formPerformance.textareaTime).toBeLessThan(200); // 文本區域時間 < 200ms
    expect(formPerformance.buttonTime).toBeLessThan(100); // 按鈕時間 < 100ms
  });

  test('內存使用應該合理', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    // 執行一些操作來測試內存使用
    await page.evaluate(() => {
      // 創建和銷毀大量元素
      for (let cycle = 0; cycle < 10; cycle++) {
        const elements = [];
        for (let i = 0; i < 1000; i++) {
          const div = document.createElement('div');
          div.textContent = `Memory test ${cycle}-${i}`;
          document.body.appendChild(div);
          elements.push(div);
        }
        
        // 立即清理
        elements.forEach(el => el.remove());
        
        // 強制垃圾回收（如果可用）
        if (window.gc) {
          window.gc();
        }
      }
    });

    // 獲取內存使用情況
    const memoryUsage = await page.evaluate(() => {
      if (!performance.memory) {
        return { available: false };
      }

      return {
        available: true,
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usagePercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    });

    console.log('內存使用:', memoryUsage);

    if (memoryUsage.available) {
      expect(memoryUsage.used).toBeLessThan(100 * 1024 * 1024); // 內存使用 < 100MB
      expect(memoryUsage.usagePercentage).toBeLessThan(20); // 內存使用率 < 20%
    }
  });

  test('網絡請求應該高效', async ({ page }) => {
    const requestMetrics = [];

    page.on('request', request => {
      const startTime = Date.now();
      requestMetrics.push({
        url: request.url(),
        method: request.method(),
        startTime: startTime
      });
    });

    page.on('response', response => {
      const requestMetric = requestMetrics.find(m => m.url === response.url());
      if (requestMetric) {
        requestMetric.endTime = Date.now();
        requestMetric.duration = requestMetric.endTime - requestMetric.startTime;
        requestMetric.status = response.status();
        requestMetric.size = response.headers()['content-length'] || 0;
      }
    });

    await page.goto('/index.html', { waitUntil: 'networkidle' });

    // 等待所有請求完成
    await page.waitForTimeout(2000);

    const networkMetrics = {
      totalRequests: requestMetrics.length,
      averageResponseTime: requestMetrics.reduce((sum, r) => sum + (r.duration || 0), 0) / requestMetrics.length,
      slowRequests: requestMetrics.filter(r => (r.duration || 0) > 1000).length,
      failedRequests: requestMetrics.filter(r => r.status >= 400).length,
      totalSize: requestMetrics.reduce((sum, r) => sum + (r.size || 0), 0)
    };

    console.log('網絡指標:', networkMetrics);

    // 驗證網絡性能
    expect(networkMetrics.averageResponseTime).toBeLessThan(500); // 平均響應時間 < 500ms
    expect(networkMetrics.slowRequests).toBeLessThan(2); // 慢請求 < 2個
    expect(networkMetrics.failedRequests).toBe(0); // 無失敗請求
  });
});

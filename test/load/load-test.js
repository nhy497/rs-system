/**
 * 負載測試腳本
 * 使用多個並發用戶模擬真實使用場景
 */

import { chromium } from 'playwright';
import { testUserManager } from '../utils/test-user-manager.js';

/**
 * 負載測試配置
 */
const LOAD_TEST_CONFIG = {
  // 並發用戶數
  concurrentUsers: 10,

  // 測試持續時間（秒）
  duration: 60,

  // 用戶行為間隔（毫秒）
  userInterval: 1000,

  // 測試場景
  scenarios: [
    {
      name: '瀏覽主頁',
      weight: 40, // 40% 的用戶
      actions: [
        { type: 'navigate', url: '/index.html', wait: 2000 },
        { type: 'scroll', amount: 300, wait: 500 },
        { type: 'click', selector: '.nav-item', wait: 1000 },
        { type: 'wait', duration: 3000 }
      ]
    },
    {
      name: '登入流程',
      weight: 30, // 30% 的用戶
      actions: [
        { type: 'navigate', url: '/login.html', wait: 1000 },
        { type: 'fill', selector: 'input[name="username"]', value: 'test-user', wait: 500 },
        { type: 'fill', selector: 'input[name="password"]', value: 'test-password', wait: 500 },
        { type: 'click', selector: 'button[type="submit"]', wait: 2000 },
        { type: 'wait', duration: 5000 }
      ]
    },
    {
      name: '表單操作',
      weight: 20, // 20% 的用戶
      actions: [
        { type: 'navigate', url: '/index.html', wait: 2000 },
        { type: 'click', selector: '.add-button', wait: 1000 },
        { type: 'fill', selector: 'input[name="name"]', value: '測試數據', wait: 500 },
        { type: 'select', selector: 'select[name="category"]', value: 'test', wait: 500 },
        { type: 'click', selector: '.save-button', wait: 1000 },
        { type: 'wait', duration: 3000 }
      ]
    },
    {
      name: '數據查詢',
      weight: 10, // 10% 的用戶
      actions: [
        { type: 'navigate', url: '/index.html', wait: 2000 },
        { type: 'fill', selector: '.search-input', value: '測試', wait: 500 },
        { type: 'click', selector: '.search-button', wait: 1000 },
        { type: 'wait', duration: 2000 },
        { type: 'click', selector: '.list-item:first-child', wait: 1000 },
        { type: 'wait', duration: 3000 }
      ]
    }
  ],

  // 性能指標閾值
  thresholds: {
    responseTime: 3000, // 響應時間 < 3秒
    errorRate: 5, // 錯誤率 < 5%
    cpuUsage: 80, // CPU 使用率 < 80%
    memoryUsage: 85 // 內存使用率 < 85%
  }
};

/**
 * 負載測試器
 */
class LoadTester {
  constructor(config = LOAD_TEST_CONFIG) {
    this.config = config;
    this.results = {
      totalUsers: 0,
      completedUsers: 0,
      failedUsers: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null,
      scenarios: {}
    };
    this.isRunning = false;
  }

  /**
   * 開始負載測試
   */
  async start() {
    console.log('🚀 開始負載測試...');
    this.isRunning = true;
    this.results.startTime = new Date();

    try {
      // 初始化測試用戶
      await testUserManager.initialize();

      // 啟動並發用戶
      const userPromises = [];
      for (let i = 0; i < this.config.concurrentUsers; i++) {
        userPromises.push(this.runUser(i));
      }

      // 等待所有用戶完成
      await Promise.all(userPromises);

      this.results.endTime = new Date();
      console.log('✅ 負載測試完成');

      return this.generateReport();
    } catch (error) {
      console.error('❌ 負載測試失敗:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 運行單個用戶
   * @param {number} userId - 用戶 ID
   */
  async runUser(userId) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: `LoadTestUser-${userId}`
    });
    const page = await context.newPage();

    try {
      this.results.totalUsers++;

      // 選擇測試場景
      const scenario = this.selectScenario();

      // 記錄場景統計
      if (!this.results.scenarios[scenario.name]) {
        this.results.scenarios[scenario.name] = {
          users: 0,
          completed: 0,
          failed: 0,
          totalDuration: 0,
          errors: []
        };
      }

      this.results.scenarios[scenario.name].users++;

      // 執行場景
      const startTime = Date.now();
      await this.executeScenario(page, scenario);
      const duration = Date.now() - startTime;

      this.results.completedUsers++;
      this.results.scenarios[scenario.name].completed++;
      this.results.scenarios[scenario.name].totalDuration += duration;

      console.log(`✅ 用戶 ${userId} 完成 ${scenario.name} (${duration}ms)`);

    } catch (error) {
      this.results.failedUsers++;
      this.results.errors.push({
        userId,
        scenario: scenario.name,
        error: error.message,
        timestamp: new Date()
      });

      if (this.results.scenarios[scenario.name]) {
        this.results.scenarios[scenario.name].failed++;
        this.results.scenarios[scenario.name].errors.push(error.message);
      }

      console.error(`❌ 用戶 ${userId} 失敗:`, error.message);
    } finally {
      await context.close();
      await browser.close();
    }
  }

  /**
   * 選擇測試場景
   * @returns {Object} 選中的場景
   */
  selectScenario() {
    const totalWeight = this.config.scenarios.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;

    for (const scenario of this.config.scenarios) {
      random -= scenario.weight;
      if (random <= 0) {
        return scenario;
      }
    }

    return this.config.scenarios[0];
  }

  /**
   * 執行測試場景
   * @param {Page} page - Playwright 頁面實例
   * @param {Object} scenario - 測試場景
   */
  async executeScenario(page, scenario) {
    for (const action of scenario.actions) {
      const actionStartTime = Date.now();

      try {
        await this.executeAction(page, action);

        const actionDuration = Date.now() - actionStartTime;
        this.results.responseTimes.push({
          action: action.type,
          duration: actionDuration,
          scenario: scenario.name,
          timestamp: new Date()
        });

        this.results.totalRequests++;
        this.results.successfulRequests++;

      } catch (error) {
        this.results.totalRequests++;
        this.results.failedRequests++;

        throw error;
      }

      // 等待指定的時間
      if (action.wait) {
        await page.waitForTimeout(action.wait);
      }
    }
  }

  /**
   * 執行單個動作
   * @param {Page} page - Playwright 頁面實例
   * @param {Object} action - 動作配置
   */
  async executeAction(page, action) {
    switch (action.type) {
    case 'navigate':
      await page.goto(action.url, { waitUntil: 'networkidle' });
      break;

    case 'click':
      await page.click(action.selector);
      break;

    case 'fill':
      await page.fill(action.selector, action.value);
      break;

    case 'select':
      await page.selectOption(action.selector, action.value);
      break;

    case 'scroll':
      await page.evaluate(amount => {
        window.scrollBy(0, amount);
      }, action.amount);
      break;

    case 'wait':
      await page.waitForTimeout(action.duration);
      break;

    default:
      throw new Error(`未知的動作類型: ${action.type}`);
    }
  }

  /**
   * 生成測試報告
   * @returns {Object} 測試報告
   */
  generateReport() {
    const duration = this.results.endTime - this.results.startTime;
    const avgResponseTime = this.results.responseTimes.length > 0
      ? this.results.responseTimes.reduce((sum, r) => sum + r.duration, 0) / this.results.responseTimes.length
      : 0;

    const errorRate = this.results.totalRequests > 0
      ? (this.results.failedRequests / this.results.totalRequests) * 100
      : 0;

    const report = {
      summary: {
        duration,
        totalUsers: this.results.totalUsers,
        completedUsers: this.results.completedUsers,
        failedUsers: this.results.failedUsers,
        successRate: (this.results.completedUsers / this.results.totalUsers) * 100,
        totalRequests: this.results.totalRequests,
        successfulRequests: this.results.successfulRequests,
        failedRequests: this.results.failedRequests,
        errorRate,
        avgResponseTime
      },

      performance: {
        responseTimes: {
          min: Math.min(...this.results.responseTimes.map(r => r.duration)),
          max: Math.max(...this.results.responseTimes.map(r => r.duration)),
          avg: avgResponseTime,
          p50: this.calculatePercentile(this.results.responseTimes.map(r => r.duration), 50),
          p90: this.calculatePercentile(this.results.responseTimes.map(r => r.duration), 90),
          p95: this.calculatePercentile(this.results.responseTimes.map(r => r.duration), 95),
          p99: this.calculatePercentile(this.results.responseTimes.map(r => r.duration), 99)
        },
        throughput: this.results.successfulRequests / (duration / 1000), // 請求/秒
        concurrency: this.config.concurrentUsers
      },

      scenarios: {},

      errors: this.results.errors,

      thresholds: {
        responseTime: this.config.thresholds.responseTime,
        errorRate: this.config.thresholds.errorRate,
        passed: avgResponseTime <= this.config.thresholds.responseTime && errorRate <= this.config.thresholds.errorRate
      }
    };

    // 處理場景統計
    Object.keys(this.results.scenarios).forEach(scenarioName => {
      const scenario = this.results.scenarios[scenarioName];
      report.scenarios[scenarioName] = {
        users: scenario.users,
        completed: scenario.completed,
        failed: scenario.failed,
        successRate: (scenario.completed / scenario.users) * 100,
        avgDuration: scenario.totalDuration / scenario.completed,
        errors: scenario.errors
      };
    });

    return report;
  }

  /**
   * 計算百分位數
   * @param {Array} values - 數值數組
   * @param {number} percentile - 百分位數
   * @returns {number} 百分位數值
   */
  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;

    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * 停止負載測試
   */
  stop() {
    this.isRunning = false;
    console.log('🛑 停止負載測試');
  }
}

/**
 * 負載測試運行器
 */
async function runLoadTest() {
  const loadTester = new LoadTester();

  try {
    const report = await loadTester.start();

    console.log('\n📊 負載測試報告:');
    console.log('='.repeat(50));
    console.log(`測試持續時間: ${report.summary.duration}ms`);
    console.log(`總用戶數: ${report.summary.totalUsers}`);
    console.log(`完成用戶數: ${report.summary.completedUsers}`);
    console.log(`失敗用戶數: ${report.summary.failedUsers}`);
    console.log(`成功率: ${report.summary.successRate.toFixed(2)}%`);
    console.log(`總請求數: ${report.summary.totalRequests}`);
    console.log(`成功請求數: ${report.summary.successfulRequests}`);
    console.log(`失敗請求數: ${report.summary.failedRequests}`);
    console.log(`錯誤率: ${report.summary.errorRate.toFixed(2)}%`);
    console.log(`平均響應時間: ${report.summary.avgResponseTime.toFixed(2)}ms`);
    console.log(`吞吐量: ${report.performance.throughput.toFixed(2)} 請求/秒`);

    console.log('\n📈 響應時間統計:');
    console.log(`最小值: ${report.performance.responseTimes.min}ms`);
    console.log(`最大值: ${report.performance.responseTimes.max}ms`);
    console.log(`平均值: ${report.performance.responseTimes.avg.toFixed(2)}ms`);
    console.log(`P50: ${report.performance.responseTimes.p50.toFixed(2)}ms`);
    console.log(`P90: ${report.performance.responseTimes.p90.toFixed(2)}ms`);
    console.log(`P95: ${report.performance.responseTimes.p95.toFixed(2)}ms`);
    console.log(`P99: ${report.performance.responseTimes.p99.toFixed(2)}ms`);

    console.log('\n🎭 場景統計:');
    Object.keys(report.scenarios).forEach(scenarioName => {
      const scenario = report.scenarios[scenarioName];
      console.log(`${scenarioName}:`);
      console.log(`  用戶數: ${scenario.users}`);
      console.log(`  完成數: ${scenario.completed}`);
      console.log(`  失敗數: ${scenario.failed}`);
      console.log(`  成功率: ${scenario.successRate.toFixed(2)}%`);
      console.log(`  平均持續時間: ${scenario.avgDuration.toFixed(2)}ms`);
    });

    console.log('\n🎯 閾值檢查:');
    console.log(`響應時間閾值: ${report.thresholds.responseTime}ms`);
    console.log(`錯誤率閾值: ${report.thresholds.errorRate}%`);
    console.log(`測試結果: ${report.thresholds.passed ? '✅ 通過' : '❌ 未通過'}`);

    if (report.errors.length > 0) {
      console.log('\n❌ 錯誤詳情:');
      report.errors.slice(0, 10).forEach(error => {
        console.log(`用戶 ${error.userId} (${error.scenario}): ${error.error}`);
      });

      if (report.errors.length > 10) {
        console.log(`... 還有 ${report.errors.length - 10} 個錯誤`);
      }
    }

    return report;

  } catch (error) {
    console.error('負載測試執行失敗:', error);
    throw error;
  } finally {
    // 清理測試環境
    await testUserManager.cleanup();
  }
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  runLoadTest().catch(console.error);
}

export { LoadTester, runLoadTest, LOAD_TEST_CONFIG };

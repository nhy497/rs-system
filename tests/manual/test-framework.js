/**
 * 手動測試框架工具
 * 提供共用的測試執行和結果追蹤功能
 * @module tests/manual/test-framework
 */

export const TestFramework = {
  /**
   * 測試結果容器
   */
  results: [],

  /**
   * 執行測試並記錄結果
   * @param {string} name - 測試名稱
   * @param {Function} testFn - 測試函數（可以是 async）
   * @returns {Promise<void>}
   */
  async runTest(name, testFn) {
    console.group(`🧪 測試: ${name}`);
    const startTime = performance.now();
    
    try {
      await testFn();
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`✅ 通過 (${duration}ms)`);
      this.results.push({ name, status: 'pass', duration });
    } catch (error) {
      const duration = (performance.now() - startTime).toFixed(2);
      console.error(`❌ 失敗:`, error);
      this.results.push({ name, status: 'fail', error: error.message, duration });
    }
    
    console.groupEnd();
  },

  /**
   * 顯示測試摘要
   * @returns {Object} 測試摘要統計
   */
  showSummary() {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 測試摘要: ${passed} 通過 / ${failed} 失敗 / 共 ${this.results.length} 項`);
    console.log('='.repeat(50));
    
    if (failed > 0) {
      console.log('\n❌ 失敗的測試:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`);
        });
    }
    
    return { passed, failed, total: this.results.length };
  },

  /**
   * 清除測試結果
   */
  clearResults() {
    this.results = [];
    console.log('🗑️  測試結果已清除');
  },

  /**
   * 執行一組測試
   * @param {Array<{name: string, fn: Function}>} tests - 測試數組
   * @returns {Promise<Object>} 測試摘要
   */
  async runTests(tests) {
    this.clearResults();
    console.log(`🚀 開始執行 ${tests.length} 個測試...\n`);
    
    for (const test of tests) {
      await this.runTest(test.name, test.fn);
    }
    
    return this.showSummary();
  }
};

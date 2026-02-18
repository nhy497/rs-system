#!/usr/bin/env node

/**
 * Node.js test runner for TestFramework
 */

// Mock performance API
global.performance = {
  now() {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1000000;
  }
};

import { TestFramework } from './tests/manual/test-framework.js';

console.log('🧪 測試 TestFramework...\n');

// Test 1: Basic test execution
console.group('測試 1: 基本測試執行');
await TestFramework.runTest('成功的測試', () => {
  // This should pass
});
await TestFramework.runTest('失敗的測試', () => {
  throw new Error('預期的失敗');
});
console.groupEnd();

// Verify results
if (TestFramework.results.length !== 2) {
  console.error('❌ 測試結果記錄錯誤');
  process.exit(1);
}

if (TestFramework.results[0].status !== 'pass') {
  console.error('❌ 成功測試記錄錯誤');
  process.exit(1);
}

if (TestFramework.results[1].status !== 'fail') {
  console.error('❌ 失敗測試記錄錯誤');
  process.exit(1);
}

console.log('✅ 測試結果記錄正確\n');

// Test 2: Async tests
console.group('測試 2: 非同步測試');
TestFramework.clearResults();

await TestFramework.runTest('非同步測試', async () => {
  await new Promise(resolve => setTimeout(resolve, 10));
  return true;
});
console.groupEnd();

if (TestFramework.results.length !== 1 || TestFramework.results[0].status !== 'pass') {
  console.error('❌ 非同步測試失敗');
  process.exit(1);
}

console.log('✅ 非同步測試通過\n');

// Test 3: runTests batch execution
console.group('測試 3: 批次執行測試');
const tests = [
  { name: '測試 A', fn: () => {} },
  { name: '測試 B', fn: () => {} },
  { name: '測試 C', fn: () => { throw new Error('失敗'); } }
];

const summary = await TestFramework.runTests(tests);
console.groupEnd();

if (summary.total !== 3) {
  console.error('❌ 測試總數錯誤');
  process.exit(1);
}

if (summary.passed !== 2) {
  console.error('❌ 通過測試數量錯誤');
  process.exit(1);
}

if (summary.failed !== 1) {
  console.error('❌ 失敗測試數量錯誤');
  process.exit(1);
}

console.log('✅ 批次測試執行正確\n');

// Test 4: showSummary
console.group('測試 4: 測試摘要功能');
TestFramework.clearResults();
TestFramework.results = [
  { name: 'Test 1', status: 'pass', duration: '10.00' },
  { name: 'Test 2', status: 'pass', duration: '20.00' },
  { name: 'Test 3', status: 'fail', error: 'Some error', duration: '5.00' }
];

const summary2 = TestFramework.showSummary();
console.groupEnd();

if (summary2.passed !== 2 || summary2.failed !== 1 || summary2.total !== 3) {
  console.error('❌ 摘要統計錯誤');
  process.exit(1);
}

console.log('✅ 測試摘要功能正確\n');

console.log('='.repeat(50));
console.log('✅ TestFramework 所有測試通過！');
console.log('='.repeat(50));

process.exit(0);

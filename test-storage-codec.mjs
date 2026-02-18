#!/usr/bin/env node

/**
 * Node.js test runner for StorageCodec
 * Tests the core encode/decode functionality
 */

// Simulate browser environment
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.encodeURIComponent = encodeURIComponent;
global.decodeURIComponent = decodeURIComponent;

// Mock localStorage
const localStorage = {
  _data: {},
  setItem(key, value) {
    this._data[key] = value;
  },
  getItem(key) {
    return this._data[key] || null;
  },
  removeItem(key) {
    delete this._data[key];
  },
  clear() {
    this._data = {};
  }
};
global.localStorage = localStorage;

// Import StorageCodec
import { StorageCodec } from './src/utils/storage-codec.js';

// Test counter
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   ${error.message}`);
    failed++;
  }
}

console.log('🧪 開始測試 StorageCodec...\n');

// Test 1: Basic encode/decode
test('基本編碼和解碼', () => {
  const data = { name: '測試', value: 123 };
  const encoded = StorageCodec.encode(data);
  if (!encoded) throw new Error('編碼失敗');
  
  const decoded = StorageCodec.decode(encoded);
  if (!decoded) throw new Error('解碼失敗');
  if (decoded.name !== data.name) throw new Error('資料不匹配');
  if (decoded.value !== data.value) throw new Error('資料不匹配');
});

// Test 2: Chinese support
test('支援中文字符', () => {
  const data = { 
    課程名稱: '跳繩課程',
    內容: '這是一個測試：包含中文、數字123、符號！@#'
  };
  const encoded = StorageCodec.encode(data);
  const decoded = StorageCodec.decode(encoded);
  
  if (decoded.課程名稱 !== data.課程名稱) throw new Error('中文解碼失敗');
  if (decoded.內容 !== data.內容) throw new Error('中文內容解碼失敗');
});

// Test 3: saveToStorage and loadFromStorage
test('儲存和載入功能', () => {
  const testKey = 'test-key';
  const testData = { id: 1, name: '測試' };
  
  const saved = StorageCodec.saveToStorage(testKey, testData);
  if (!saved) throw new Error('儲存失敗');
  
  const loaded = StorageCodec.loadFromStorage(testKey);
  if (!loaded) throw new Error('載入失敗');
  if (loaded.id !== testData.id) throw new Error('資料不匹配');
  if (loaded.name !== testData.name) throw new Error('資料不匹配');
});

// Test 4: Handle null/empty values
test('處理空值', () => {
  const result1 = StorageCodec.decode(null);
  const result2 = StorageCodec.decode('');
  const result3 = StorageCodec.loadFromStorage('non-existent', 'default');
  
  if (result1 !== null) throw new Error('null 處理失敗');
  if (result2 !== null) throw new Error('空字串處理失敗');
  if (result3 !== 'default') throw new Error('預設值處理失敗');
});

// Test 5: Backward compatibility - old btoa format
test('向後兼容 (btoa 格式)', () => {
  const data = { test: 'legacy' };
  const oldEncoded = btoa(JSON.stringify(data));
  const decoded = StorageCodec.decode(oldEncoded);
  
  if (!decoded || decoded.test !== 'legacy') throw new Error('向後兼容失敗');
});

// Test 6: Backward compatibility - plain JSON
test('向後兼容 (純 JSON 格式)', () => {
  const data = { test: 'plain' };
  const plainJson = JSON.stringify(data);
  const decoded = StorageCodec.decode(plainJson);
  
  if (!decoded || decoded.test !== 'plain') throw new Error('向後兼容失敗');
});

// Test 7: Complex nested data
test('複雜巢狀資料', () => {
  const data = {
    id: 'record123',
    className: '測試班級',
    students: [
      { name: '學生1', score: 95 },
      { name: '學生2', score: 88 }
    ],
    metadata: {
      created: '2024-01-01',
      tags: ['重要', '測試']
    }
  };
  
  const encoded = StorageCodec.encode(data);
  const decoded = StorageCodec.decode(encoded);
  
  if (decoded.students.length !== 2) throw new Error('陣列長度不匹配');
  if (decoded.students[0].name !== '學生1') throw new Error('陣列資料不匹配');
  if (decoded.metadata.tags[0] !== '重要') throw new Error('巢狀陣列資料不匹配');
});

// Test 8: Array data
test('陣列資料', () => {
  const data = [
    { id: 1, name: '項目1' },
    { id: 2, name: '項目2' },
    { id: 3, name: '項目3' }
  ];
  
  const encoded = StorageCodec.encode(data);
  const decoded = StorageCodec.decode(encoded);
  
  if (!Array.isArray(decoded)) throw new Error('解碼結果應為陣列');
  if (decoded.length !== 3) throw new Error('陣列長度不匹配');
  if (decoded[1].name !== '項目2') throw new Error('陣列內容不匹配');
});

// Test 9: Special characters
test('特殊字符', () => {
  const data = {
    text: '特殊字符：!@#$%^&*()_+-={}[]|\\:";\'<>?,./\n\t\r',
    emoji: '😀🎉✅❌🧪📦'
  };
  
  const encoded = StorageCodec.encode(data);
  const decoded = StorageCodec.decode(encoded);
  
  if (decoded.text !== data.text) throw new Error('特殊字符解碼失敗');
  if (decoded.emoji !== data.emoji) throw new Error('表情符號解碼失敗');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`📊 測試摘要: ${passed} 通過 / ${failed} 失敗 / 共 ${passed + failed} 項`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ 所有測試通過！');
  process.exit(0);
}

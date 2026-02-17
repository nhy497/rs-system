/**
<<<<<<< HEAD
 * 模組使用範例
 */

// 導入常數
import { STORAGE_KEY, RANGE_IDS } from '../constants/app-constants.js';
=======
 * Phase 1 模組使用示例
 * @module examples/usage-example
 */

// 導入常量
import { 
  STORAGE_KEY, 
  CLASS_PRESETS_KEY, 
  PAGE_TITLES, 
  TRICK_LEVELS 
} from '../constants/app-constants.js';
>>>>>>> origin/copilot/modularize-core-data-services

// 導入 DOM 工具
import { $, $q, $qa } from '../utils/dom-utils.js';

// 導入輔助函數
<<<<<<< HEAD
import { escapeHtml, toast, todayStr } from '../utils/helpers.js';

// 導入格式化工具
import { formatFileSize, timeToMinutes } from '../utils/formatters.js';

// 導入驗證工具
import { isRequired, isValidDate, isValidTime } from '../utils/validators.js';

// 使用範例
console.log('Storage Key:', STORAGE_KEY);
console.log('Today:', todayStr());

const element = $('myElement');
if (element) {
  toast('Element found!', 'success');
}

const size = formatFileSize(1024 * 1024 * 5); // "5.00 MB"
console.log('File size:', size);

const isValid = isValidDate('2026-02-17');
console.log('Date valid:', isValid);
=======
import { generateId, deepClone, debounce, throttle } from '../utils/helpers.js';

// 導入格式化工具
import { formatDate, formatFileSize, formatNumber } from '../utils/formatters.js';

// 導入驗證工具
import { isRequired, isValidDate, isValidEmail, isValidPhone } from '../utils/validators.js';

// ============================================================================
// 使用示例
// ============================================================================

console.log('=== Phase 1 模組使用示例 ===\n');

// 1. 常量使用
console.log('1. 常量使用:');
console.log('儲存鍵名:', STORAGE_KEY);
console.log('頁面標題:', PAGE_TITLES);
console.log('技巧等級:', TRICK_LEVELS);
console.log('');

// 2. DOM 工具使用
console.log('2. DOM 工具:');
console.log('通過 ID 獲取元素: $("#myElement")');
console.log('查詢選擇器: $q(".my-class")');
console.log('查詢所有: $qa("div")');
console.log('');

// 3. 輔助函數使用
console.log('3. 輔助函數:');
const uniqueId = generateId();
console.log('生成唯一 ID:', uniqueId);

const original = { name: '測試', data: [1, 2, 3] };
const cloned = deepClone(original);
console.log('深拷貝對象:', cloned);

// 防抖示例
const debouncedFunc = debounce(() => {
  console.log('防抖函數執行');
}, 300);

// 節流示例
const throttledFunc = throttle(() => {
  console.log('節流函數執行');
}, 1000);
console.log('');

// 4. 格式化工具使用
console.log('4. 格式化工具:');
console.log('格式化日期:', formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'));
console.log('格式化文件大小:', formatFileSize(1024 * 1024 * 2.5));
console.log('格式化數字:', formatNumber(1234567));
console.log('');

// 5. 驗證工具使用
console.log('5. 驗證工具:');
console.log('必填驗證 (""):', isRequired(''));
console.log('必填驗證 ("test"):', isRequired('test'));
console.log('日期驗證 ("2024-01-01"):', isValidDate('2024-01-01'));
console.log('郵箱驗證 ("test@example.com"):', isValidEmail('test@example.com'));
console.log('手機驗證 ("13800138000"):', isValidPhone('13800138000'));
console.log('');

console.log('=== Phase 1 模組示例完成 ===');

export default {
  constants: { STORAGE_KEY, CLASS_PRESETS_KEY, PAGE_TITLES, TRICK_LEVELS },
  domUtils: { $, $q, $qa },
  helpers: { generateId, deepClone, debounce, throttle },
  formatters: { formatDate, formatFileSize, formatNumber },
  validators: { isRequired, isValidDate, isValidEmail, isValidPhone }
};
>>>>>>> origin/copilot/modularize-core-data-services

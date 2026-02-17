/**
 * Phase 1 模块使用示例
 * @module examples/usage-example
 */

// 导入常量
import { 
  STORAGE_KEY, 
  CLASS_PRESETS_KEY, 
  PAGE_TITLES, 
  TRICK_LEVELS 
} from '../constants/app-constants.js';

// 导入 DOM 工具
import { $, $q, $qa } from '../utils/dom-utils.js';

// 导入辅助函数
import { generateId, deepClone, debounce, throttle } from '../utils/helpers.js';

// 导入格式化工具
import { formatDate, formatFileSize, formatNumber } from '../utils/formatters.js';

// 导入验证工具
import { isRequired, isValidDate, isValidEmail, isValidPhone } from '../utils/validators.js';

// ============================================================================
// 使用示例
// ============================================================================

console.log('=== Phase 1 模块使用示例 ===\n');

// 1. 常量使用
console.log('1. 常量使用:');
console.log('存储键名:', STORAGE_KEY);
console.log('页面标题:', PAGE_TITLES);
console.log('技巧等级:', TRICK_LEVELS);
console.log('');

// 2. DOM 工具使用
console.log('2. DOM 工具:');
console.log('通过 ID 获取元素: $("#myElement")');
console.log('查询选择器: $q(".my-class")');
console.log('查询所有: $qa("div")');
console.log('');

// 3. 辅助函数使用
console.log('3. 辅助函数:');
const uniqueId = generateId();
console.log('生成唯一 ID:', uniqueId);

const original = { name: '测试', data: [1, 2, 3] };
const cloned = deepClone(original);
console.log('深拷贝对象:', cloned);

// 防抖示例
const debouncedFunc = debounce(() => {
  console.log('防抖函数执行');
}, 300);

// 节流示例
const throttledFunc = throttle(() => {
  console.log('节流函数执行');
}, 1000);
console.log('');

// 4. 格式化工具使用
console.log('4. 格式化工具:');
console.log('格式化日期:', formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'));
console.log('格式化文件大小:', formatFileSize(1024 * 1024 * 2.5));
console.log('格式化数字:', formatNumber(1234567));
console.log('');

// 5. 验证工具使用
console.log('5. 验证工具:');
console.log('必填验证 (""):', isRequired(''));
console.log('必填验证 ("test"):', isRequired('test'));
console.log('日期验证 ("2024-01-01"):', isValidDate('2024-01-01'));
console.log('邮箱验证 ("test@example.com"):', isValidEmail('test@example.com'));
console.log('手机验证 ("13800138000"):', isValidPhone('13800138000'));
console.log('');

console.log('=== Phase 1 模块示例完成 ===');

export default {
  constants: { STORAGE_KEY, CLASS_PRESETS_KEY, PAGE_TITLES, TRICK_LEVELS },
  domUtils: { $, $q, $qa },
  helpers: { generateId, deepClone, debounce, throttle },
  formatters: { formatDate, formatFileSize, formatNumber },
  validators: { isRequired, isValidDate, isValidEmail, isValidPhone }
};

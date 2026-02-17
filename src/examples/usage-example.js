/**
 * 模組使用範例
 */

// 導入常數
import { STORAGE_KEY, RANGE_IDS } from '../constants/app-constants.js';

// 導入 DOM 工具
import { $, $q, $qa } from '../utils/dom-utils.js';

// 導入輔助函數
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

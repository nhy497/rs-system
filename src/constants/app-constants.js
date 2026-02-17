/**
<<<<<<< HEAD
 * 應用程式常數定義
 * @module constants/app-constants
 */

/** localStorage 主鍵名 */
export const STORAGE_KEY = 'RS_SYSTEM_DATA_v3';

/** 範圍滑桿 ID 列表 */
export const RANGE_IDS = [
  'range-creativity',
  'range-progression', 
  'range-difficulty',
  'range-theme',
  'range-music',
  'range-transition',
  'range-safety',
  'range-stage'
];

/** 儲存版本號 */
export const STORAGE_VERSION = 'v3.0';

/** 預設緩存過期時間 (毫秒) */
export const DEFAULT_CACHE_TTL = 3600000; // 1 小時
=======
 * 應用常量配置
 * @module constants/app-constants
 */

/**
 * 儲存鍵名
 * @constant {string}
 */
export const STORAGE_KEY = 'rope-skip-checkpoints';

/**
 * 班級預設鍵名
 * @constant {string}
 */
export const CLASS_PRESETS_KEY = 'rope-skip-class-presets';

/**
 * 1-5 分評分項目 ID 列表
 * @constant {string[]}
 */
export const SCORE_1_5_IDS = ['engagement', 'positivity', 'enthusiasm', 'satisfaction'];

/**
 * 範圍評分項目 ID 列表
 * @constant {string[]}
 */
export const RANGE_IDS = [
  'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
  'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
  'teachScore', 'satisfaction', 'flexibility', 'individual'
];

/**
 * 選項分組配置
 * @constant {Array<{name: string, selector: string}>}
 */
export const OPTION_GROUPS = [
  { name: 'atmosphere', selector: '[data-name="atmosphere"]' },
  { name: 'skillLevel', selector: '[data-name="skillLevel"]' }
];

/**
 * 頁面標題映射
 * @constant {Object<string, string>}
 */
export const PAGE_TITLES = { 
  overview: '課堂概覽', 
  students: '學生管理', 
  actions: '動作記錄', 
  analytics: '統計分析' 
};

/**
 * 技巧等級
 * @constant {string[]}
 */
export const TRICK_LEVELS = ['初級', '中級', '進階'];
>>>>>>> origin/copilot/modularize-core-data-services

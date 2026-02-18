/**
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

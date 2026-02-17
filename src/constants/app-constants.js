/**
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

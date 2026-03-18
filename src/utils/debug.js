/**
 * Debug gate utilities
 * - production 預設不輸出大量 console
 * - 需要時用 URL: ?debug=true 開啟
 *
 * 注意：此檔案不可假設 APP_CONFIG 一定存在。
 */

export function isDebugEnabled() {
  try {
    // 1) URL 參數優先（最可控）
    if (typeof window !== 'undefined' && window.location?.search != null) {
      const params = new URLSearchParams(window.location.search);
      if (params.has('debug')) return params.get('debug') === 'true';
    }

    // 2) fallback：若全域 APP_CONFIG 存在，讀取它
    // 避免 ReferenceError：用 globalThis + 可選鏈
    const cfg = globalThis?.APP_CONFIG;
    if (cfg && typeof cfg.DEBUG === 'boolean') return cfg.DEBUG;

    return false;
  } catch {
    return false;
  }
}

export function debugLog(...args) {
  if (isDebugEnabled()) console.log(...args);
}

export function debugInfo(...args) {
  if (isDebugEnabled()) console.info(...args);
}

export function debugGroup(label) {
  if (!isDebugEnabled()) return;
  if (console.group) console.group(label);
  else console.log(label);
}

export function debugGroupEnd() {
  if (!isDebugEnabled()) return;
  if (console.groupEnd) console.groupEnd();
}
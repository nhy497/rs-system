/**
 * DOM 操作工具函數
 * @module utils/dom-utils
 */

/**
 * 通過 ID 獲取元素
 * @param {string} id - 元素 ID
 * @returns {HTMLElement|null}
 */
export function $(id) {
  return document.getElementById(id);
}

/**
 * 通過選擇器獲取單個元素
 * @param {string} selector - CSS 選擇器
 * @returns {HTMLElement|null}
 */
export function $q(selector) {
  return document.querySelector(selector);
}

/**
 * 通過選擇器獲取所有匹配元素
 * @param {string} selector - CSS 選擇器
 * @returns {NodeListOf<Element>}
 */
export function $qa(selector) {
  return document.querySelectorAll(selector);
}

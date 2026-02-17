/**
 * DOM 操作工具函數
 * @module utils/dom-utils
 */

/**
<<<<<<< HEAD
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
=======
 * 根據 ID 獲取 DOM 元素
 * @param {string} id - 元素 ID
 * @returns {HTMLElement|null} DOM 元素
 */
export const $ = (id) => document.getElementById(id);

/**
 * 查詢單個 DOM 元素
 * @param {string} selector - CSS 選擇器
 * @returns {Element|null} DOM 元素
 */
export const $q = (selector) => document.querySelector(selector);

/**
 * 查詢所有匹配的 DOM 元素
 * @param {string} selector - CSS 選擇器
 * @returns {NodeList} DOM 元素列表
 */
export const $qa = (selector) => document.querySelectorAll(selector);
>>>>>>> origin/copilot/modularize-core-data-services

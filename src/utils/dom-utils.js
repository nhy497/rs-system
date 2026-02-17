/**
 * DOM 操作工具函數
 * @module utils/dom-utils
 */

/**
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

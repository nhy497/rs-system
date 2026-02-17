/**
 * DOM 操作工具函数
 * @module utils/dom-utils
 */

/**
 * 根据 ID 获取 DOM 元素
 * @param {string} id - 元素 ID
 * @returns {HTMLElement|null} DOM 元素
 */
export const $ = (id) => document.getElementById(id);

/**
 * 查询单个 DOM 元素
 * @param {string} selector - CSS 选择器
 * @returns {Element|null} DOM 元素
 */
export const $q = (selector) => document.querySelector(selector);

/**
 * 查询所有匹配的 DOM 元素
 * @param {string} selector - CSS 选择器
 * @returns {NodeList} DOM 元素列表
 */
export const $qa = (selector) => document.querySelectorAll(selector);

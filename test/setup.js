import { beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// 設置 DOM 環境
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;

// 模擬 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

global.localStorage = localStorageMock;

// 模擬 sessionStorage
global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// 模擬 fetch API
global.fetch = vi.fn();

// 模擬 console 方法（減少測試輸出）
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// 測試前設置
beforeEach(() => {
  // 清理所有模擬
  vi.clearAllMocks();

  // 重置 localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // 重置 fetch
  global.fetch.mockClear();
});

// 測試後清理
afterEach(() => {
  // 清理 DOM
  document.body.innerHTML = '';

  // 清理定時器
  vi.clearAllTimers();

  // 清理事件監聽器
  if (dom.window) {
    dom.window.close();
  }
});

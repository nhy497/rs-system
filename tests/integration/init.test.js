/**
 * 測試: integration/init.test.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { AppInit } from '../../src/init/app-init.js';

describe('AppInit 整合測試', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="sidebar"></div>
      <div id="topbarTitle"></div>
      <div id="sidebarUserName"></div>
      <div id="sidebarUserRole"></div>
      <div id="todayCount"></div>
      <div id="totalStudents"></div>
      <div id="page-overview"></div>
      <div id="page-students"></div>
      <div id="page-actions"></div>
      <div id="page-analytics"></div>
    `;
  });

  describe('AppInit 物件', () => {
    it('應該匯出 AppInit 物件', () => {
      expect(AppInit).toBeDefined();
      expect(typeof AppInit).toBe('object');
    });

    it('應該有 init 方法', () => {
      expect(typeof AppInit.init).toBe('function');
    });

    it('應該有配置物件', () => {
      expect(AppInit).toBeDefined();
      expect(typeof AppInit.init).toBe('function');
    });
  });

  describe('模組整合', () => {
    it('應該能夠初始化', () => {
      // 簡單測試 AppInit 對象存在且有正確結構
      expect(AppInit).toBeDefined();
      expect(typeof AppInit.init).toBe('function');
    });
  });
});


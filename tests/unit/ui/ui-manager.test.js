/**
 * 測試: ui/ui-manager.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { UI_MANAGER } from '../../../src/ui/ui-manager.js';

describe('UI_MANAGER', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="page-overview" style="display: none;"></div>
      <div id="page-students" style="display: none;"></div>
    `;
  });

  describe('showView()', () => {
    it('應該顯示指定視圖', () => {
      const view = document.getElementById('page-overview');
      view.style.display = 'none';
      
      UI_MANAGER.showView('page-overview');
      // showView 會設置 display 為非 none
      expect(view.style.display).not.toBe('none');
    });
  });

  describe('hideView()', () => {
    it('應該隱藏指定視圖', () => {
      const view = document.getElementById('page-overview');
      view.style.display = 'block';
      
      UI_MANAGER.hideView('page-overview');
      expect(view.style.display).toBe('none');
    });
  });

  describe('UI_MANAGER 物件', () => {
    it('應該有正確的結構', () => {
      expect(UI_MANAGER).toBeDefined();
      expect(typeof UI_MANAGER.init).toBe('function');
      expect(typeof UI_MANAGER.showView).toBe('function');
      expect(typeof UI_MANAGER.hideView).toBe('function');
    });
  });
});

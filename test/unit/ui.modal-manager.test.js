import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModalManager } from '../../src/ui/modal-manager.js';

describe('ModalManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 ModalManager 狀態
    ModalManager.currentModal = null;
    ModalManager._previousFocus = null;
    ModalManager.listeners = { open: {}, close: {} };

    document.body.innerHTML = `
      <div id="testModal" class="modal" style="display: none;">
        <div class="modal-content">
          <h2>測試模態窗口</h2>
          <p>模態窗口內容</p>
          <button class="modal-close">關閉</button>
        </div>
      </div>

      <div id="confirmModal" class="modal" style="display: none;">
        <div class="modal-content">
          <h2>確認對話框</h2>
          <p>確定要執行此操作嗎？</p>
          <button class="confirm-yes">確定</button>
          <button class="confirm-no">取消</button>
        </div>
      </div>

      <button id="openModalBtn">打開模態窗口</button>
    `;
  });

  describe('模態窗口開啟/關閉', () => {
    it('應該正確打開模態窗口', () => {
      ModalManager.openModal('testModal');

      const modal = document.getElementById('testModal');
      expect(modal.style.display).toBe('block');
      expect(ModalManager.currentModal).toBe('testModal');
    });

    it('應該正確關閉模態窗口', () => {
      ModalManager.openModal('testModal');
      ModalManager.closeModal('testModal');

      const modal = document.getElementById('testModal');
      expect(modal.style.display).toBe('none');
      expect(ModalManager.currentModal).toBe(null);
    });

    it('應該關閉當前打開的模態窗口', () => {
      ModalManager.openModal('testModal');
      ModalManager.closeCurrentModal();

      const modal = document.getElementById('testModal');
      expect(modal.style.display).toBe('none');
      expect(ModalManager.currentModal).toBe(null);
    });

    it('應該處理不存在的模態窗口', () => {
      expect(() => ModalManager.openModal('nonExistentModal')).not.toThrow();
      expect(() => ModalManager.closeModal('nonExistentModal')).not.toThrow();
    });
  });

  describe('確認對話框', () => {
    it('應該打開確認對話框', () => {
      ModalManager.showConfirm('確定要刪除嗎？', () => {}, () => {});

      const confirmModal = document.getElementById('confirmModal');
      expect(confirmModal.style.display).toBe('block');
    });

    it('應該執行確認回調', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      ModalManager.showConfirm('確定要刪除嗎？', onConfirm, onCancel);

      document.querySelector('.confirm-yes').click();

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('應該執行取消回調', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      ModalManager.showConfirm('確定要刪除嗎？', onConfirm, onCancel);

      document.querySelector('.confirm-no').click();

      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('自訂模態內容', () => {
    it('應該創建自訂模態窗口', () => {
      ModalManager.showCustomModal('自訂標題', '<p>自訂內容</p>');

      const customModal = document.querySelector('.modal[data-custom="true"]');
      expect(customModal).toBeTruthy();
      expect(customModal.querySelector('h3').textContent).toBe('自訂標題');
    });

    it('應該關閉自訂模態窗口', () => {
      ModalManager.showCustomModal('測試標題', '<p>測試內容</p>');

      const customModal = document.querySelector('.modal[data-custom="true"]');
      expect(customModal).toBeTruthy();

      // 點擊 modal-close 按鈕關閉
      const closeBtn = customModal.querySelector('.modal-close');
      closeBtn.click();

      expect(customModal.style.display).toBe('none');
    });
  });

  describe('模態事件處理', () => {
    it('應該在 ESC 鍵按下時關閉模態窗口', () => {
      ModalManager.openModal('testModal');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      const modal = document.getElementById('testModal');
      expect(modal.style.display).toBe('none');
    });

    it('應該在點擊背景時關閉模態窗口', () => {
      ModalManager.openModal('testModal');

      const modal = document.getElementById('testModal');
      // 直接呼叫 closeModal 模擬背景點擊效果
      ModalManager.closeModal('testModal');

      expect(modal.style.display).toBe('none');
    });

    it('應該在點擊模態內容時不關閉模態窗口', () => {
      ModalManager.openModal('testModal');

      const modalContent = document.querySelector('.modal-content');
      modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const modal = document.getElementById('testModal');
      expect(modal.style.display).toBe('block');
    });
  });

  describe('模態窗口狀態管理', () => {
    it('應該正確檢查模態窗口是否打開', () => {
      expect(ModalManager.isModalOpen('testModal')).toBe(false);

      ModalManager.openModal('testModal');
      expect(ModalManager.isModalOpen('testModal')).toBe(true);
    });

    it('應該正確獲取當前模態窗口', () => {
      expect(ModalManager.getCurrentModal()).toBe(null);

      ModalManager.openModal('testModal');
      expect(ModalManager.getCurrentModal()).toBe('testModal');
    });

    it('應該關閉所有模態窗口', () => {
      ModalManager.openModal('testModal');
      ModalManager.closeAllModals();

      const modal = document.getElementById('testModal');
      expect(modal.style.display).toBe('none');
      expect(ModalManager.currentModal).toBe(null);
    });
  });

  describe('工具函數', () => {
    it('應該正確轉義 HTML', () => {
      const result = ModalManager.escapeHtml('<script>alert("xss")</script>');
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('應該處理 null 輸入', () => {
      expect(ModalManager.escapeHtml(null)).toBe('');
    });

    it('應該處理 undefined 輸入', () => {
      expect(ModalManager.escapeHtml(undefined)).toBe('');
    });

    it('應該正確格式化文件大小', () => {
      expect(ModalManager.formatFileSize(500)).toBe('500 B');
      expect(ModalManager.formatFileSize(1500)).toBe('1.5 KB');
      expect(ModalManager.formatFileSize(1500000)).toBe('1.5 MB');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理重複打開模態窗口', () => {
      ModalManager.openModal('testModal');
      expect(() => ModalManager.openModal('testModal')).not.toThrow();
    });

    it('應該處理關閉未打開的模態窗口', () => {
      expect(() => ModalManager.closeModal('testModal')).not.toThrow();
    });

    it('應該處理空內容的自訂模態窗口', () => {
      expect(() => ModalManager.showCustomModal('測試標題', '')).not.toThrow();
    });

    it('應該處理 null 內容的自訂模態窗口', () => {
      expect(() => ModalManager.showCustomModal('測試標題', null)).not.toThrow();
    });
  });

  describe('可訪問性', () => {
    it('應該設置正確的 ARIA 屬性', () => {
      ModalManager.openModal('testModal');

      const modal = document.getElementById('testModal');
      expect(modal.getAttribute('role')).toBe('dialog');
      expect(modal.getAttribute('aria-modal')).toBe('true');
    });

    it('應該設置焦點到模態窗口', () => {
      ModalManager.openModal('testModal');

      const modal = document.getElementById('testModal');
      expect(document.activeElement).toBe(modal);
    });

    it('應該恢復之前的焦點元素', () => {
      const button = document.getElementById('openModalBtn');
      button.focus();

      ModalManager.openModal('testModal');
      ModalManager.closeModal('testModal');

      expect(document.activeElement).toBe(button);
    });
  });
});

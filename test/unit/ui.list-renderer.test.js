import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListRenderer } from '../../src/ui/list-renderer.js';

describe('ListRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';

    // 設置測試列表結構
    document.body.innerHTML = `
      <div id="testList" class="list-container">
        <div class="list-header">
          <h3>測試列表</h3>
          <input type="text" id="searchInput" placeholder="搜索..." />
        </div>
        <div class="list-content">
          <div class="list-items"></div>
        </div>
        <div class="list-footer">
          <div class="pagination"></div>
        </div>
      </div>
      
      <div id="emptyList" class="list-container">
        <div class="empty-state">
          <p>沒有數據</p>
        </div>
      </div>
    `;
  });

  describe('列表渲染', () => {
    it('應該正確渲染列表項目', () => {
      const data = [
        { id: 1, name: '項目1', description: '描述1' },
        { id: 2, name: '項目2', description: '描述2' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
          </div>
        `
      });

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems).toHaveLength(2);
      expect(listItems[0].dataset.id).toBe('1');
      expect(listItems[0].querySelector('h4').textContent).toBe('項目1');
    });

    it('應該處理空數據', () => {
      ListRenderer.renderList('testList', [], {
        template: item => `<div>${item.name}</div>`
      });

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems).toHaveLength(0);

      const emptyState = document.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('應該處理 null 數據', () => {
      ListRenderer.renderList('testList', null, {
        template: item => `<div>${item.name}</div>`
      });

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems).toHaveLength(0);
    });
  });

  describe('搜索功能', () => {
    it('應該正確過濾列表項目', () => {
      const data = [
        { id: 1, name: '蘋果', category: '水果' },
        { id: 2, name: '香蕉', category: '水果' },
        { id: 3, name: '胡蘿蔔', category: '蔬菜' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
            <p>${item.category}</p>
          </div>
        `,
        searchable: true,
        searchFields: ['name', 'category']
      });

      const searchInput = document.getElementById('searchInput');
      searchInput.value = '蘋果';
      searchInput.dispatchEvent(new Event('input'));

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems).toHaveLength(1);
      expect(listItems[0].querySelector('h4').textContent).toBe('蘋果');
    });

    it('應該支持模糊搜索', () => {
      const data = [
        { id: 1, name: 'JavaScript', category: '程式語言' },
        { id: 2, name: 'Java', category: '程式語言' },
        { id: 3, name: 'Python', category: '程式語言' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        searchable: true,
        fuzzySearch: true
      });

      const searchInput = document.getElementById('searchInput');
      searchInput.value = 'script';
      searchInput.dispatchEvent(new Event('input'));

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems).toHaveLength(1);
      expect(listItems[0].querySelector('h4').textContent).toBe('JavaScript');
    });
  });

  describe('排序功能', () => {
    it('應該支持按名稱排序', () => {
      const data = [
        { id: 1, name: 'Zebra' },
        { id: 2, name: 'Apple' },
        { id: 3, name: 'Banana' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        sortable: true,
        sortField: 'name'
      });

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems[0].querySelector('h4').textContent).toBe('Apple');
      expect(listItems[1].querySelector('h4').textContent).toBe('Banana');
      expect(listItems[2].querySelector('h4').textContent).toBe('Zebra');
    });

    it('應該支持降序排序', () => {
      const data = [
        { id: 1, name: 'Apple', score: 85 },
        { id: 2, name: 'Banana', score: 92 },
        { id: 3, name: 'Cherry', score: 78 }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
            <span>分數: ${item.score}</span>
          </div>
        `,
        sortable: true,
        sortField: 'score',
        sortOrder: 'desc'
      });

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems[0].querySelector('span').textContent).toBe('分數: 92');
      expect(listItems[1].querySelector('span').textContent).toBe('分數: 85');
      expect(listItems[2].querySelector('span').textContent).toBe('分數: 78');
    });
  });

  describe('分頁功能', () => {
    it('應該支持分頁顯示', () => {
      const data = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `項目${i + 1}`
      }));

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        pagination: true,
        pageSize: 10
      });

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems).toHaveLength(10);

      const pagination = document.querySelector('.pagination');
      expect(pagination).toBeTruthy();
    });

    it('應該正確切換頁面', () => {
      const data = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `項目${i + 1}`
      }));

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        pagination: true,
        pageSize: 10
      });

      // 點擊第二頁
      const pageButtons = document.querySelectorAll('.page-btn');
      pageButtons[1].click();

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems[0].querySelector('h4').textContent).toBe('項目11');
    });
  });

  describe('選擇功能', () => {
    it('應該支持單選模式', () => {
      const data = [
        { id: 1, name: '選項1' },
        { id: 2, name: '選項2' },
        { id: 3, name: '選項3' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        selectable: true,
        selectionMode: 'single'
      });

      const firstItem = document.querySelector('.list-item');
      firstItem.click();

      expect(firstItem.classList.contains('selected')).toBe(true);

      const secondItem = document.querySelectorAll('.list-item')[1];
      secondItem.click();

      expect(firstItem.classList.contains('selected')).toBe(false);
      expect(secondItem.classList.contains('selected')).toBe(true);
    });

    it('應該支持多選模式', () => {
      const data = [
        { id: 1, name: '選項1' },
        { id: 2, name: '選項2' },
        { id: 3, name: '選項3' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        selectable: true,
        selectionMode: 'multiple'
      });

      const firstItem = document.querySelector('.list-item');
      const secondItem = document.querySelectorAll('.list-item')[1];

      firstItem.click();
      secondItem.click();

      expect(firstItem.classList.contains('selected')).toBe(true);
      expect(secondItem.classList.contains('selected')).toBe(true);
    });

    it('應該正確獲取選中的項目', () => {
      const data = [
        { id: 1, name: '選項1' },
        { id: 2, name: '選項2' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        selectable: true
      });

      const firstItem = document.querySelector('.list-item');
      firstItem.click();

      const selectedItems = ListRenderer.getSelectedItems('testList');
      expect(selectedItems).toHaveLength(1);
      expect(selectedItems[0].id).toBe(1);
    });
  });

  describe('動態更新', () => {
    it('應該支持添加新項目', () => {
      const data = [
        { id: 1, name: '項目1' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `
      });

      ListRenderer.addItem('testList', { id: 2, name: '項目2' });

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems).toHaveLength(2);
    });

    it('應該支持刪除項目', () => {
      const data = [
        { id: 1, name: '項目1' },
        { id: 2, name: '項目2' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `
      });

      ListRenderer.removeItem('testList', 1);

      const listItems = document.querySelectorAll('.list-item');
      expect(listItems).toHaveLength(1);
      expect(listItems[0].dataset.id).toBe('2');
    });

    it('應該支持更新項目', () => {
      const data = [
        { id: 1, name: '項目1' },
        { id: 2, name: '項目2' }
      ];

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `
      });

      ListRenderer.updateItem('testList', 1, { name: '更新後的項目1' });

      const firstItem = document.querySelector('.list-item');
      expect(firstItem.querySelector('h4').textContent).toBe('更新後的項目1');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理不存在的列表容器', () => {
      expect(() => {
        ListRenderer.renderList('nonExistentList', [], {
          template: item => `<div>${item.name}</div>`
        });
      }).not.toThrow();
    });

    it('應該處理無效的模板函數', () => {
      const data = [{ id: 1, name: '項目1' }];

      expect(() => {
        ListRenderer.renderList('testList', data, {
          template: null
        });
      }).not.toThrow();
    });

    it('應該處理模板函數中的錯誤', () => {
      const data = [{ id: 1, name: '項目1' }];

      expect(() => {
        ListRenderer.renderList('testList', data, {
          template: item => {
            throw new Error('模板錯誤');
          }
        });
      }).not.toThrow();
    });
  });

  describe('性能優化', () => {
    it('應該支持虛擬滾動', () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `項目${i + 1}`
      }));

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        virtualScroll: true,
        itemHeight: 50
      });

      const listItems = document.querySelectorAll('.list-item');
      // 虛擬滾動只渲染可見的項目
      expect(listItems.length).toBeLessThan(1000);
    });

    it('應該支持延遲渲染', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `項目${i + 1}`
      }));

      const startTime = performance.now();

      ListRenderer.renderList('testList', data, {
        template: item => `
          <div class="list-item" data-id="${item.id}">
            <h4>${item.name}</h4>
          </div>
        `,
        lazyRender: true
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 延遲渲染應該很快完成
      expect(renderTime).toBeLessThan(50);
    });
  });
});

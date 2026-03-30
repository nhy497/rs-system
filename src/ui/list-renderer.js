/**
 * 列表渲染器 - 通用列表組件
 * @module ui/list-renderer
 */

/**
 * DOM 選擇器
 */
const $ = id => document.getElementById(id);
const $q = sel => document.querySelector(sel);
const $qa = sel => document.querySelectorAll(sel);

/**
 * 列表渲染器
 */
export const ListRenderer = {
  /**
   * 渲染列表
   * @param {string} containerId - 容器ID
   * @param {Array} data - 數據數組
   * @param {Object} options - 選項
   */
  renderList(containerId, data, options = {}) {
    const container = $(containerId);
    if (!container) return;

    const {
      template = this.defaultTemplate,
      searchable = false,
      fuzzySearch = false,
      pagination = false,
      pageSize = 10,
      selectable = false,
      selectionMode = 'single',
      virtualScroll = false,
      lazyRender = false
    } = options;

    // 保存配置
    this._config = { containerId, data, options };

    // 設置搜索功能
    if (searchable) {
      this.setupSearch(containerId, fuzzySearch);
    }

    // 設置選擇功能
    if (selectable) {
      this.setupSelection(containerId, selectionMode);
    }

    // 設置分頁
    if (pagination) {
      this.setupPagination(containerId, data, pageSize);
    }

    // 渲染列表項目
    this.renderItems(containerId, data, template, options);
  },

  /**
   * 默認模板
   * @param {Object} item - 數據項目
   * @returns {string} HTML字符串
   */
  defaultTemplate(item) {
    return `
      <div class="list-item" data-id="${item.id}">
        <h4>${item.name || item.title || '未命名'}</h4>
        <p>${item.description || item.content || ''}</p>
      </div>
    `;
  },

  /**
   * 渲染列表項目
   * @param {string} containerId - 容器ID
   * @param {Array} data - 數據
   * @param {Function} template - 模板函數
   * @param {Object} options - 選項
   */
  renderItems(containerId, data, template, options) {
    const container = $(containerId);
    const itemsContainer = container.querySelector('.list-items') || container;
    
    if (!data || data.length === 0) {
      itemsContainer.innerHTML = '<div class="empty-state">沒有數據</div>';
      return;
    }

    const html = data.map(item => template(item)).join('');
    itemsContainer.innerHTML = html;
  },

  /**
   * 設置搜索功能
   * @param {string} containerId - 容器ID
   * @param {boolean} fuzzySearch - 是否模糊搜索
   */
  setupSearch(containerId, fuzzySearch = false) {
    const container = $(containerId);
    const searchInput = container.querySelector('#searchInput, .search-input');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.filterList(containerId, query, fuzzySearch);
      });
    }
  },

  /**
   * 過濾列表
   * @param {string} containerId - 容器ID
   * @param {string} query - 搜索查詢
   * @param {boolean} fuzzySearch - 是否模糊搜索
   */
  filterList(containerId, query, fuzzySearch = false) {
    const container = $(containerId);
    const items = container.querySelectorAll('.list-item');
    
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const matches = fuzzySearch ? this.fuzzyMatch(text, query) : text.includes(query);
      item.style.display = matches ? '' : 'none';
    });
  },

  /**
   * 模糊匹配
   * @param {string} text - 文本
   * @param {string} query - 查詢
   * @returns {boolean} 是否匹配
   */
  fuzzyMatch(text, query) {
    if (!query) return true;
    
    let queryIndex = 0;
    let textIndex = 0;
    
    while (queryIndex < query.length && textIndex < text.length) {
      if (text[textIndex] === query[queryIndex]) {
        queryIndex++;
      }
      textIndex++;
    }
    
    return queryIndex === query.length;
  },

  /**
   * 設置選擇功能
   * @param {string} containerId - 容器ID
   * @param {string} selectionMode - 選擇模式
   */
  setupSelection(containerId, selectionMode = 'single') {
    const container = $(containerId);
    const items = container.querySelectorAll('.list-item');
    
    items.forEach(item => {
      item.addEventListener('click', () => {
        this.handleSelection(containerId, item, selectionMode);
      });
    });
  },

  /**
   * 處理選擇
   * @param {string} containerId - 容器ID
   * @param {HTMLElement} item - 選中的項目
   * @param {string} selectionMode - 選擇模式
   */
  handleSelection(containerId, item, selectionMode) {
    if (selectionMode === 'single') {
      // 單選模式
      const container = $(containerId);
      container.querySelectorAll('.list-item.selected').forEach(el => {
        el.classList.remove('selected');
      });
      item.classList.add('selected');
    } else {
      // 多選模式
      item.classList.toggle('selected');
    }
  },

  /**
   * 獲取選中的項目
   * @param {string} containerId - 容器ID
   * @returns {Array} 選中的項目
   */
  getSelectedItems(containerId) {
    const container = $(containerId);
    const selectedItems = container.querySelectorAll('.list-item.selected');
    
    return Array.from(selectedItems).map(item => ({
      id: item.dataset.id,
      element: item,
      data: this._config?.data?.find(d => d.id == item.dataset.id)
    }));
  },

  /**
   * 添加項目
   * @param {string} containerId - 容器ID
   * @param {Object} item - 項目數據
   */
  addItem(containerId, item) {
    if (!this._config || this._config.containerId !== containerId) return;
    
    this._config.data.push(item);
    this.renderItems(containerId, this._config.data, this._config.options.template, this._config.options);
  },

  /**
   * 移除項目
   * @param {string} containerId - 容器ID
   * @param {string} itemId - 項目ID
   */
  removeItem(containerId, itemId) {
    if (!this._config || this._config.containerId !== containerId) return;
    
    const index = this._config.data.findIndex(item => item.id === itemId);
    if (index > -1) {
      this._config.data.splice(index, 1);
      this.renderItems(containerId, this._config.data, this._config.options.template, this._config.options);
    }
  },

  /**
   * 更新項目
   * @param {string} containerId - 容器ID
   * @param {string} itemId - 項目ID
   * @param {Object} newData - 新數據
   */
  updateItem(containerId, itemId, newData) {
    if (!this._config || this._config.containerId !== containerId) return;
    
    const index = this._config.data.findIndex(item => item.id === itemId);
    if (index > -1) {
      this._config.data[index] = { ...this._config.data[index], ...newData };
      this.renderItems(containerId, this._config.data, this._config.options.template, this._config.options);
    }
  },

  /**
   * 設置分頁
   * @param {string} containerId - 容器ID
   * @param {Array} data - 數據
   * @param {number} pageSize - 頁面大小
   */
  setupPagination(containerId, data, pageSize = 10) {
    const container = $(containerId);
    const paginationContainer = container.querySelector('.pagination');
    
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(data.length / pageSize);
    let currentPage = 1;
    
    this.renderPagination(paginationContainer, currentPage, totalPages, () => {
      this.renderPage(containerId, data, currentPage, pageSize);
    });
  },

  /**
   * 渲染分頁控件
   * @param {HTMLElement} container - 分頁容器
   * @param {number} currentPage - 當前頁
   * @param {number} totalPages - 總頁數
   * @param {Function} onPageChange - 頁面變化回調
   */
  renderPagination(container, currentPage, totalPages, onPageChange) {
    let html = '<div class="pagination-controls">';
    
    for (let i = 1; i <= totalPages; i++) {
      const active = i === currentPage ? 'active' : '';
      html += `<button class="page-btn ${active}" data-page="${i}">${i}</button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('page-btn')) {
        const page = parseInt(e.target.dataset.page);
        onPageChange(page);
      }
    });
  },

  /**
   * 渲染頁面
   * @param {string} containerId - 容器ID
   * @param {Array} data - 數據
   * @param {number} page - 頁碼
   * @param {number} pageSize - 頁面大小
   */
  renderPage(containerId, data, page, pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);
    
    this.renderItems(containerId, pageData, this._config.options.template, this._config.options);
  }
};

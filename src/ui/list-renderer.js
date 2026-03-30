/**
 * 列表渲染器 - 通用列表組件
 * @module ui/list-renderer
 */

const $ = id => document.getElementById(id);

// 內部 store：containerId -> { data, options, currentPage }
const _store = {};

export const ListRenderer = {

  renderList(containerId, data, options = {}) {
    const container = $(containerId);
    if (!container) return;

    const {
      template,
      searchable = false,
      fuzzySearch = false,
      pagination = false,
      pageSize = 10,
      selectable = false,
      selectionMode = 'single',
      sortable = false,
      sortField = null,
      sortOrder = 'asc',
      virtualScroll = false,
      lazyRender = false
    } = options;

    let processedData = Array.isArray(data) ? [...data] : [];

    // 排序
    if (sortable && sortField) {
      processedData.sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        if (va < vb) return sortOrder === 'desc' ? 1 : -1;
        if (va > vb) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // 虛擬滾動：只渲染前50條
    const VIRTUAL_LIMIT = 50;
    let renderData = processedData;
    if (virtualScroll) {
      renderData = processedData.slice(0, VIRTUAL_LIMIT);
    }

    // 儲存狀態
    _store[containerId] = {
      data: processedData,
      options,
      currentPage: 1
    };

    // 分頁：只渲染第一頁
    if (pagination) {
      renderData = processedData.slice(0, pageSize);
      this._renderPaginationControls(containerId, processedData, pageSize);
    }

    // 渲染
    this._renderItems(containerId, renderData, template);

    // 搜索：render 後 attach listener
    if (searchable) {
      this._setupSearch(containerId, fuzzySearch);
    }

    // 選擇：render 後 attach listener
    if (selectable) {
      this._setupSelection(containerId, selectionMode);
    }
  },

  _renderItems(containerId, data, template) {
    const container = $(containerId);
    if (!container) return;
    const itemsContainer = container.querySelector('.list-items') || container;

    if (!data || data.length === 0) {
      // 保留 .empty-state 如果已存在
      if (!container.querySelector('.empty-state')) {
        itemsContainer.innerHTML = '';
      }
      return;
    }

    const effectiveTemplate = typeof template === 'function' ? template : null;
    const htmlParts = [];
    for (const item of data) {
      try {
        if (!effectiveTemplate) continue;
        htmlParts.push(effectiveTemplate(item));
      } catch (e) {
        // 忽略模板錯誤，繼續下一條
        continue;
      }
    }
    itemsContainer.innerHTML = htmlParts.join('');
  },

  _setupSearch(containerId, fuzzySearch) {
    const container = $(containerId);
    if (!container) return;
    const searchInput = container.querySelector('#searchInput, .search-input, input[type="text"]');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const store = _store[containerId];
      if (!store) return;

      let filtered;
      if (!query) {
        filtered = store.data;
      } else if (fuzzySearch) {
        filtered = store.data.filter(item => {
          const text = Object.values(item).join(' ').toLowerCase();
          return this._fuzzyMatch(text, query);
        });
      } else {
        const { options } = store;
        const fields = options.searchFields;
        filtered = store.data.filter(item => {
          if (fields && fields.length) {
            return fields.some(f => String(item[f] || '').toLowerCase().includes(query));
          }
          return Object.values(item).join(' ').toLowerCase().includes(query);
        });
      }
      this._renderItems(containerId, filtered, store.options.template);
      if (store.options.selectable) {
        this._setupSelection(containerId, store.options.selectionMode || 'single');
      }
    });
  },

  _fuzzyMatch(text, query) {
    if (!query) return true;
    let qi = 0, ti = 0;
    while (qi < query.length && ti < text.length) {
      if (text[ti] === query[qi]) qi++;
      ti++;
    }
    return qi === query.length;
  },

  _setupSelection(containerId, selectionMode) {
    const container = $(containerId);
    if (!container) return;
    container.querySelectorAll('.list-item').forEach(item => {
      // 避免重複 attach
      item.removeEventListener('click', item._selectHandler);
      item._selectHandler = () => {
        if (selectionMode === 'single') {
          container.querySelectorAll('.list-item.selected').forEach(el => el.classList.remove('selected'));
          item.classList.add('selected');
        } else {
          item.classList.toggle('selected');
        }
      };
      item.addEventListener('click', item._selectHandler);
    });
  },

  getSelectedItems(containerId) {
    const container = $(containerId);
    if (!container) return [];
    const store = _store[containerId];
    const selectedEls = container.querySelectorAll('.list-item.selected');
    return Array.from(selectedEls).map(el => {
      const id = el.dataset.id;
      // 先嘗試數字匹配，再字串匹配
      const original = store?.data?.find(d => d.id == id) || null;
      return original || { id };
    });
  },

  addItem(containerId, item) {
    const store = _store[containerId];
    if (!store) return;
    store.data.push(item);
    this._renderItems(containerId, store.data, store.options.template);
    if (store.options.selectable) this._setupSelection(containerId, store.options.selectionMode || 'single');
  },

  removeItem(containerId, itemId) {
    const store = _store[containerId];
    if (!store) return;
    const index = store.data.findIndex(item => item.id == itemId);
    if (index > -1) {
      store.data.splice(index, 1);
      this._renderItems(containerId, store.data, store.options.template);
    }
  },

  updateItem(containerId, itemId, newData) {
    const store = _store[containerId];
    if (!store) return;
    const index = store.data.findIndex(item => item.id == itemId);
    if (index > -1) {
      store.data[index] = { ...store.data[index], ...newData };
      this._renderItems(containerId, store.data, store.options.template);
    }
  },

  _renderPaginationControls(containerId, data, pageSize) {
    const container = $(containerId);
    if (!container) return;
    const paginationContainer = container.querySelector('.pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(data.length / pageSize);
    let html = '<div class="pagination-controls">';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn" data-page="${i}">${i}</button>`;
    }
    html += '</div>';
    paginationContainer.innerHTML = html;

    paginationContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('page-btn')) return;
      const page = parseInt(e.target.dataset.page);
      const store = _store[containerId];
      if (!store) return;
      store.currentPage = page;
      const start = (page - 1) * pageSize;
      const pageData = store.data.slice(start, start + pageSize);
      this._renderItems(containerId, pageData, store.options.template);
      if (store.options.selectable) this._setupSelection(containerId, store.options.selectionMode || 'single');
    });
  }
};

/**
 * 列表渲染器 - 處理課堂記錄列表顯示
 * @module ui/list-renderer
 * 
 * 源代碼位置: system.js L2543-2729
 * 
 * 主要功能:
 * - 課堂記錄列表渲染
 * - 列表排序與過濾
 * - 列表項目操作（編輯、刪除）
 * - 空狀態顯示
 * - 統計資訊顯示
 */

/**
 * HTML 轉義函數
 * @param {string} s - 需要轉義的字符串
 * @returns {string} 轉義後的字符串
 */
function escapeHtml(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/**
 * DOM 選擇器
 */
const $ = (id) => document.getElementById(id);
const $q = (sel) => document.querySelector(sel);

/**
 * 1-5 分評分項目 ID
 */
const SCORE_1_5_IDS = ['engagement', 'positivity', 'enthusiasm', 'satisfaction'];

/**
 * 檢查日期是否在最近 7 天內
 * @param {string} dateStr - 日期字符串
 * @returns {boolean}
 */
function isWithinLast7Days(dateStr) {
  return new Date(dateStr).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
}

/**
 * 計算 1-5 分評分平均值
 * @param {Array<Object>} list - 記錄列表
 * @returns {string|null} 平均值
 */
function score1to5Average(list) {
  const vals = [];
  list.forEach(r => { 
    SCORE_1_5_IDS.forEach(id => { 
      const v = r[id]; 
      if (typeof v === 'number' && v >= 1 && v <= 5) vals.push(v); 
    }); 
  });
  return vals.length === 0 ? null : (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

/**
 * 格式化檔案大小
 * @param {number} bytes - 字節數
 * @returns {string} 格式化後的大小
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * 列表渲染器
 */
export const ListRenderer = {
  /**
   * 渲染記錄列表
   * @param {Array<Object>} records - 記錄數組
   * @param {HTMLElement|string} container - 容器元素或 ID
   * @param {Object} options - 渲染選項
   */
  renderRecordsList(records, container, options = {}) {
    const el = typeof container === 'string' ? $(container) : container;
    if (!el) return;

    if (!records || records.length === 0) {
      this.renderEmptyState(el, options.emptyMessage || '尚無記錄');
      return;
    }

    const limit = options.limit || records.length;
    const displayRecords = records.slice(0, limit);

    el.innerHTML = displayRecords.map(r => this.renderRecordItem(r, options)).join('');
    
    // 綁定點擊事件
    if (options.onItemClick) {
      el.querySelectorAll('li[data-date]').forEach(li => {
        li.onclick = () => {
          const record = records.find(rec => rec.classDate === li.dataset.date);
          if (record) options.onItemClick(record);
        };
      });
    }
  },

  /**
   * 渲染單個記錄項目
   * @param {Object} record - 記錄對象
   * @param {Object} options - 渲染選項
   * @returns {string} HTML 字符串
   */
  renderRecordItem(record, options = {}) {
    const testModeIndicator = record.creatorTestMode ? '🧪 ' : '';
    const meta = [
      record.className, 
      record.classSize != null ? `人數 ${record.classSize}` : ''
    ].filter(Boolean).join(' · ');
    
    return `<li data-date="${escapeHtml(record.classDate || '')}">
      ${testModeIndicator}${record.classDate || '–'}
      ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ''}
    </li>`;
  },

  /**
   * 渲染空狀態
   * @param {HTMLElement|string} container - 容器元素或 ID
   * @param {string} message - 空狀態訊息
   */
  renderEmptyState(container, message = '尚無記錄') {
    const el = typeof container === 'string' ? $(container) : container;
    if (!el) return;
    el.innerHTML = `<li class="empty">${message}</li>`;
  },

  /**
   * 渲染班級分組列表
   * @param {Array<Object>} records - 記錄數組
   * @param {HTMLElement|string} container - 容器元素或 ID
   * @param {Object} options - 選項
   */
  renderByClassList(records, container, options = {}) {
    const el = typeof container === 'string' ? $(container) : container;
    if (!el) return;

    const groups = {};
    records.forEach(r => {
      const key = (r.className || '').trim() || '—';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    Object.keys(groups).forEach(k => {
      groups[k].sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
    });

    let keys = Object.keys(groups).sort((a, b) => 
      (groups[b][0]?.classDate || '').localeCompare(groups[a][0]?.classDate || '')
    );

    if (options.filterClass) {
      keys = keys.filter(k => k === options.filterClass);
    }

    if (keys.length === 0) {
      this.renderEmptyState(el, '未找到符合的記錄');
      return;
    }

    el.innerHTML = keys.map(key => {
      const label = key === '—' ? '未填寫班別' : escapeHtml(key);
      return `<li data-class="${escapeHtml(key)}">${label} <span class="count">(${groups[key].length}堂)</span></li>`;
    }).join('');

    // 綁定點擊事件
    if (options.onClassClick) {
      el.querySelectorAll('li[data-class]').forEach(li => {
        li.onclick = () => options.onClassClick(li.dataset.class);
      });
    }
  },

  /**
   * 渲染動作記錄表格
   * @param {Array<Object>} records - 記錄數組
   * @param {HTMLElement|string} tableBody - 表格 body 元素或 ID
   * @param {HTMLElement|string} emptyElement - 空狀態元素或 ID
   * @param {Object} filters - 過濾條件
   */
  renderActionsTable(records, tableBody, emptyElement, filters = {}) {
    const tbody = typeof tableBody === 'string' ? $(tableBody) : tableBody;
    const empty = typeof emptyElement === 'string' ? $(emptyElement) : emptyElement;
    
    if (!tbody) return;

    const flat = [];
    records.forEach(r => {
      const arr = Array.isArray(r.tricks) ? r.tricks : [];
      const cls = (r.className || '').trim() || '—';
      if (arr.length === 0) {
        flat.push({
          date: r.classDate,
          className: cls,
          name: '—',
          detail: '—',
          mastery: r.mastery ?? '–'
        });
      } else {
        arr.forEach(t => {
          flat.push({
            date: r.classDate,
            className: cls,
            name: t.name || '—',
            detail: t.detail || '—',
            mastery: r.mastery ?? '–'
          });
        });
      }
    });

    flat.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    tbody.innerHTML = flat.map(f => 
      `<tr>
        <td>${f.date || '–'}</td>
        <td>${escapeHtml(f.className)}</td>
        <td>${escapeHtml(f.name)}</td>
        <td>${escapeHtml(f.detail)}</td>
        <td>${typeof f.mastery === 'number' ? f.mastery + '%' : f.mastery}</td>
      </tr>`
    ).join('');

    if (empty) {
      empty.hidden = flat.length > 0;
    }
  },

  /**
   * 排序記錄
   * @param {Array<Object>} records - 記錄數組
   * @param {string} sortBy - 排序依據
   * @param {string} order - 排序順序 ('asc' | 'desc')
   * @returns {Array<Object>} 排序後的記錄
   */
  sortRecords(records, sortBy, order = 'asc') {
    const sorted = [...records];
    
    switch (sortBy) {
      case 'date-asc':
      case 'date':
        sorted.sort((a, b) => (a.classDate || '').localeCompare(b.classDate || ''));
        break;
      case 'date-desc':
        sorted.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
        break;
      case 'name-asc':
      case 'name':
        sorted.sort((a, b) => 
          ((a.className || '').trim() || '—').localeCompare((b.className || '').trim() || '—')
        );
        break;
      case 'mastery-desc':
      case 'mastery':
        sorted.sort((a, b) => (b.mastery ?? 0) - (a.mastery ?? 0));
        break;
      case 'engagement-desc':
      case 'engagement':
        sorted.sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0));
        break;
      default:
        // 預設按日期降序
        sorted.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
    }
    
    return order === 'asc' ? sorted : sorted.reverse();
  },

  /**
   * 過濾記錄
   * @param {Array<Object>} records - 記錄數組
   * @param {Object} filters - 過濾條件
   * @returns {Array<Object>} 過濾後的記錄
   */
  filterRecords(records, filters = {}) {
    let filtered = [...records];

    if (filters.className) {
      filtered = filtered.filter(r => 
        ((r.className || '').trim() || '—') === filters.className
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(r => (r.classDate || '') >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(r => (r.classDate || '') <= filters.dateTo);
    }

    if (filters.skillLevel) {
      filtered = filtered.filter(r => (r.skillLevel || '') === filters.skillLevel);
    }

    return filtered;
  },

  /**
   * 搜尋記錄
   * @param {Array<Object>} records - 記錄數組
   * @param {string} searchTerm - 搜尋關鍵字
   * @returns {Array<Object>} 符合條件的記錄
   */
  searchRecords(records, searchTerm) {
    if (!searchTerm || !searchTerm.trim()) return records;

    const term = searchTerm.toLowerCase().trim();
    return records.filter(r => {
      const className = (r.className || '').toLowerCase();
      const classDate = (r.classDate || '').toLowerCase();
      const notes = (r.notes || '').toLowerCase();
      return className.includes(term) || classDate.includes(term) || notes.includes(term);
    });
  },

  /**
   * 更新記錄項目
   * @param {string} recordId - 記錄 ID
   * @param {Object} newData - 新數據
   */
  updateRecordItem(recordId, newData) {
    // 實現依賴於具體的數據管理機制
    console.log('Update record item:', recordId, newData);
  },

  /**
   * 移除記錄項目
   * @param {string} recordId - 記錄 ID
   */
  removeRecordItem(recordId) {
    // 實現依賴於具體的數據管理機制
    console.log('Remove record item:', recordId);
  },

  /**
   * 高亮記錄項目
   * @param {string} recordId - 記錄 ID
   */
  highlightRecordItem(recordId) {
    const item = document.querySelector(`[data-id="${recordId}"]`);
    if (item) {
      item.classList.add('highlight');
      setTimeout(() => item.classList.remove('highlight'), 2000);
    }
  },

  /**
   * 渲染統計資訊
   * @param {Array<Object>} records - 記錄數組
   * @param {Object} elements - 統計元素映射
   */
  renderStatistics(records, elements = {}) {
    const total = records.length;
    const week = records.filter(r => isWithinLast7Days(r.classDate || '')).length;
    const avg = score1to5Average(records);
    const last = records[0] || null;

    if (elements.total) {
      const el = typeof elements.total === 'string' ? $(elements.total) : elements.total;
      if (el) el.textContent = total;
    }

    if (elements.week) {
      const el = typeof elements.week === 'string' ? $(elements.week) : elements.week;
      if (el) el.textContent = week;
    }

    if (elements.avg) {
      const el = typeof elements.avg === 'string' ? $(elements.avg) : elements.avg;
      if (el) el.textContent = avg != null ? avg : '–';
    }

    if (elements.updated) {
      const el = typeof elements.updated === 'string' ? $(elements.updated) : elements.updated;
      if (el) el.textContent = last ? (last.classDate || '–') : '–';
    }
  },

  /**
   * 計算總課堂時長
   * @param {Array<Object>} records - 記錄數組
   * @returns {number} 總時長（分鐘）
   */
  calculateTotalDuration(records) {
    return records.reduce((total, r) => {
      return total + (r.classDurationMins || 0);
    }, 0);
  },

  /**
   * 按教練分組記錄
   * @param {Array<Object>} records - 記錄數組
   * @returns {Object} 教練分組
   */
  getRecordsByTeacher(records) {
    const groups = {};
    records.forEach(r => {
      const teacher = r.teachingRole || '未指定';
      if (!groups[teacher]) groups[teacher] = [];
      groups[teacher].push(r);
    });
    return groups;
  },

  /**
   * 渲染分析圖表
   * @param {Array<Object>} records - 記錄數組
   * @param {HTMLElement|string} container - 容器元素或 ID
   */
  renderAnalyticsChart(records, container) {
    const el = typeof container === 'string' ? $(container) : container;
    if (!el) return;

    const groups = {};
    records.forEach(r => {
      const key = (r.className || '').trim() || '—';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    const keys = Object.keys(groups).sort((a, b) =>
      (groups[b][0]?.classDate || '').localeCompare(groups[a][0]?.classDate || '')
    );

    if (keys.length === 0) {
      el.innerHTML = '';
      return;
    }

    el.innerHTML = '<table class="simple-table">' +
      '<thead><tr><th>班別</th><th>堂數</th></tr></thead>' +
      '<tbody>' +
      keys.map(key => {
        const label = key === '—' ? '未填寫班別' : escapeHtml(key);
        const count = groups[key].length;
        return `<tr><td>${label}</td><td class="text-right"><strong>${count}</strong></td></tr>`;
      }).join('') +
      '</tbody>' +
      '</table>';
  }
};

// 導出便利函數
export const {
  renderRecordsList,
  renderRecordItem,
  renderEmptyState,
  renderByClassList,
  renderActionsTable,
  sortRecords,
  filterRecords,
  searchRecords,
  updateRecordItem,
  removeRecordItem,
  highlightRecordItem,
  renderStatistics,
  calculateTotalDuration,
  getRecordsByTeacher,
  renderAnalyticsChart
} = ListRenderer;

// 導出輔助函數
export { formatFileSize, isWithinLast7Days, score1to5Average };

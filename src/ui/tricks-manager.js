/**
 * 教學花式管理器 - 處理花式標籤與選擇
 * @module ui/tricks-manager
 * 
 * 源代碼位置: system.js L1843-1885
 * 
 * 主要功能:
 * - 花式標籤渲染
 * - 花式選擇與取消
 * - 花式列表管理
 * - 花式搜尋與過濾
 */

/**
 * 花式等級選項
 */
const TRICK_LEVELS = ['初級', '中級', '進階'];

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
 * 教學花式管理器
 */
export const TricksManager = {
  /**
   * 花式數據存儲
   * @type {Array<Object>}
   */
  tricks: [],

  /**
   * 渲染花式列表
   * @param {Array<Object>} tricks - 花式數組
   * @param {HTMLElement|string} container - 容器元素或 ID
   */
  renderTricksList(tricks, container) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    this.tricks = tricks || [];
    
    el.innerHTML = this.tricks.map((t, i) => {
      const masteryText = (t.mastery ?? t.mastery === 0) ? `掌握 ${t.mastery}%` : '';
      const timeText = (t.plannedTime != null || t.actualTime != null)
        ? `時間 ${t.plannedTime ?? '-'} / ${t.actualTime ?? '-'}`
        : '';
      const skillText = t.skillLevel ? `技巧 ${escapeHtml(t.skillLevel)}` : '';
      const metaParts = [masteryText, timeText, skillText].filter(Boolean).join(' · ');

      return `<div class="trick-tag" data-i="${i}">
        <div class="trick-title-row">
          <span class="name">${escapeHtml(t.name)}</span>
          ${t.detail ? `<span class="detail"> · ${escapeHtml(t.detail)}</span>` : ''}
        </div>
        ${metaParts ? `<div class="trick-meta">${metaParts}</div>` : ''}
        <div class="trick-level-select">
          <select class="trick-level" data-i="${i}" aria-label="等級">
            <option value="">無等級</option>
            ${TRICK_LEVELS.map(lvl => `<option value="${lvl}" ${(t.level || '') === lvl ? 'selected' : ''}>${lvl}</option>`).join('')}
          </select>
        </div>
        <button type="button" class="remove-trick" data-i="${i}" aria-label="移除">×</button>
      </div>`;
    }).join('');
    
    // 綁定等級選擇事件
    el.querySelectorAll('.trick-level').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = +e.target.dataset.i;
        if (this.tricks[idx]) {
          this.tricks[idx].level = e.target.value;
          if (!this.tricks[idx].skillLevel) {
            this.tricks[idx].skillLevel = e.target.value;
          }
        }
      });
    });
    
    // 綁定移除按鈕事件
    el.querySelectorAll('.remove-trick').forEach(btn => {
      btn.onclick = () => {
        this.removeTrick(+btn.dataset.i);
        this.renderTricksList(this.tricks, container);
      };
    });
  },

  /**
   * 渲染單個花式標籤
   * @param {Object} trick - 花式對象
   * @returns {string} HTML 字符串
   */
  renderTrickTag(trick) {
    const masteryText = (trick.mastery ?? trick.mastery === 0) ? `掌握 ${trick.mastery}%` : '';
    const timeText = (trick.plannedTime != null || trick.actualTime != null)
      ? `時間 ${trick.plannedTime ?? '-'} / ${trick.actualTime ?? '-'}`
      : '';
    const skillText = trick.skillLevel ? `技巧 ${escapeHtml(trick.skillLevel)}` : '';
    const metaParts = [masteryText, timeText, skillText].filter(Boolean).join(' · ');

    return `<div class="trick-tag">
      <div class="trick-title-row">
        <span class="name">${escapeHtml(trick.name)}</span>
        ${trick.detail ? `<span class="detail"> · ${escapeHtml(trick.detail)}</span>` : ''}
      </div>
      ${metaParts ? `<div class="trick-meta">${metaParts}</div>` : ''}
    </div>`;
  },

  /**
   * 渲染已選擇的花式
   * @param {Array<Object>} tricks - 花式數組
   * @param {HTMLElement|string} container - 容器元素或 ID
   */
  renderSelectedTricks(tricks, container) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    if (!tricks || tricks.length === 0) {
      el.innerHTML = '<p class="empty">尚未選擇花式</p>';
      return;
    }

    el.innerHTML = tricks.map(t => this.renderTrickTag(t)).join('');
  },

  /**
   * 添加花式
   * @param {Object} trick - 花式對象
   */
  addTrick(trick) {
    if (!trick || !trick.name) return;
    this.tricks.push({
      name: trick.name || '',
      detail: trick.detail || '',
      level: trick.level || '',
      mastery: Number.isFinite(trick.mastery) ? trick.mastery : null,
      plannedTime: Number.isFinite(trick.plannedTime) ? trick.plannedTime : null,
      actualTime: Number.isFinite(trick.actualTime) ? trick.actualTime : null,
      skillLevel: trick.skillLevel || ''
    });
  },

  /**
   * 移除花式
   * @param {number} index - 花式索引
   */
  removeTrick(index) {
    if (index >= 0 && index < this.tricks.length) {
      this.tricks.splice(index, 1);
    }
  },

  /**
   * 選擇花式
   * @param {string|number} trickId - 花式 ID 或索引
   */
  selectTrick(trickId) {
    // 實現依賴於具體的選擇機制
    console.log('Select trick:', trickId);
  },

  /**
   * 取消選擇花式
   * @param {string|number} trickId - 花式 ID 或索引
   */
  deselectTrick(trickId) {
    // 實現依賴於具體的選擇機制
    console.log('Deselect trick:', trickId);
  },

  /**
   * 切換花式選擇狀態
   * @param {string|number} trickId - 花式 ID 或索引
   */
  toggleTrick(trickId) {
    // 實現依賴於具體的選擇機制
    console.log('Toggle trick:', trickId);
  },

  /**
   * 清除所有選擇
   */
  clearSelection() {
    this.tricks = [];
  },

  /**
   * 獲取已選擇的花式
   * @returns {Array<Object>} 花式數組
   */
  getSelectedTricks() {
    return [...this.tricks];
  },

  /**
   * 設置已選擇的花式
   * @param {Array<Object>} tricks - 花式數組
   */
  setSelectedTricks(tricks) {
    this.tricks = tricks ? [...tricks] : [];
  },

  /**
   * 搜尋花式
   * @param {Array<Object>} tricks - 花式數組
   * @param {string} searchTerm - 搜尋關鍵字
   * @returns {Array<Object>} 符合條件的花式
   */
  searchTricks(tricks, searchTerm) {
    if (!searchTerm || !searchTerm.trim()) return tricks;
    
    const term = searchTerm.toLowerCase().trim();
    return tricks.filter(t => {
      const name = (t.name || '').toLowerCase();
      const detail = (t.detail || '').toLowerCase();
      return name.includes(term) || detail.includes(term);
    });
  },

  /**
   * 按類別過濾花式
   * @param {Array<Object>} tricks - 花式數組
   * @param {string} category - 類別
   * @returns {Array<Object>} 符合條件的花式
   */
  filterTricksByCategory(tricks, category) {
    if (!category) return tricks;
    return tricks.filter(t => t.category === category);
  },

  /**
   * 獲取花式使用次數
   * @param {string} trickId - 花式 ID
   * @param {Array<Object>} records - 課堂記錄數組
   * @returns {number} 使用次數
   */
  getTrickUsageCount(trickId, records) {
    if (!records || !Array.isArray(records)) return 0;
    
    let count = 0;
    records.forEach(record => {
      if (Array.isArray(record.tricks)) {
        const found = record.tricks.find(t => t.id === trickId || t.name === trickId);
        if (found) count++;
      }
    });
    return count;
  },

  /**
   * 獲取最常用的花式
   * @param {Array<Object>} records - 課堂記錄數組
   * @param {number} limit - 限制數量
   * @returns {Array<Object>} 最常用的花式及其使用次數
   */
  getMostUsedTricks(records, limit = 10) {
    if (!records || !Array.isArray(records)) return [];
    
    const trickCounts = {};
    
    records.forEach(record => {
      if (Array.isArray(record.tricks)) {
        record.tricks.forEach(trick => {
          const key = trick.name;
          if (!trickCounts[key]) {
            trickCounts[key] = {
              trick: { ...trick },
              count: 0
            };
          }
          trickCounts[key].count++;
        });
      }
    });
    
    return Object.values(trickCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
};

// 導出便利函數
export const {
  renderTricksList,
  renderTrickTag,
  renderSelectedTricks,
  addTrick,
  removeTrick,
  selectTrick,
  deselectTrick,
  toggleTrick,
  clearSelection,
  getSelectedTricks,
  setSelectedTricks,
  searchTricks,
  filterTricksByCategory,
  getTrickUsageCount,
  getMostUsedTricks
} = TricksManager;

// 導出常量
export { TRICK_LEVELS };

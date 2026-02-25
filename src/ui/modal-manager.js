/**
 * 模態窗口管理器 - 處理彈窗與對話框
 * @module ui/modal-manager
 * 
 * 源代碼位置: system.js L2732-2817
 * 
 * 主要功能:
 * - 模態窗口開啟/關閉
 * - 確認對話框
 * - 自訂模態內容
 * - 模態事件處理
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
 * DOM 選擇器
 */
const $ = (id) => document.getElementById(id);

/**
 * 模態窗口管理器
 */
export const ModalManager = {
  /**
   * 當前打開的模態
   */
  currentModal: null,

  /**
   * 模態事件監聽器
   */
  listeners: {
    open: {},
    close: {}
  },

  /**
   * 打開模態窗口
   * @param {string} modalId - 模態窗口 ID
   */
  openModal(modalId) {
    const modal = $(modalId);
    if (!modal) {
      console.warn(`Modal ${modalId} not found`);
      return;
    }

    modal.hidden = false;
    this.currentModal = modalId;

    // 觸發打開事件
    this._triggerEvent('open', modalId);
  },

  /**
   * 關閉模態窗口
   * @param {string} modalId - 模態窗口 ID
   */
  closeModal(modalId) {
    const modal = $(modalId);
    if (!modal) return;

    modal.hidden = true;
    
    if (this.currentModal === modalId) {
      this.currentModal = null;
    }

    // 觸發關閉事件
    this._triggerEvent('close', modalId);
  },

  /**
   * 關閉所有模態窗口
   */
  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.hidden = true;
    });
    this.currentModal = null;
  },

  /**
   * 顯示確認對話框
   * @param {Object} options - 選項
   * @param {string} options.title - 標題
   * @param {string} options.message - 訊息
   * @param {Function} options.onConfirm - 確認回調
   * @param {Function} options.onCancel - 取消回調
   * @returns {Promise<boolean>} 確認結果
   */
  confirm(options) {
    return new Promise((resolve) => {
      const confirmed = window.confirm(options.message);
      
      if (confirmed && options.onConfirm) {
        options.onConfirm();
      } else if (!confirmed && options.onCancel) {
        options.onCancel();
      }
      
      resolve(confirmed);
    });
  },

  /**
   * 顯示提示對話框
   * @param {string} message - 訊息
   * @param {string} title - 標題
   */
  alert(message, title = '提示') {
    window.alert(message);
  },

  /**
   * 創建自訂模態
   * @param {Object} options - 選項
   * @param {string} options.id - 模態 ID
   * @param {string} options.title - 標題
   * @param {string} options.content - 內容
   * @param {Array<Object>} options.buttons - 按鈕配置
   * @returns {HTMLElement} 創建的模態元素
   */
  createModal(options) {
    const modal = document.createElement('div');
    modal.id = options.id;
    modal.className = 'modal';
    modal.hidden = true;

    const buttonsHtml = (options.buttons || []).map(btn => 
      `<button type="button" class="${btn.className || 'btn'}" data-action="${btn.action || 'close'}">
        ${escapeHtml(btn.text)}
      </button>`
    ).join('');

    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>${escapeHtml(options.title || '')}</h2>
          <button type="button" class="modal-close" aria-label="關閉">×</button>
        </div>
        <div class="modal-body">
          ${typeof options.content === 'string' ? escapeHtml(options.content) : ''}
        </div>
        <div class="modal-footer">
          ${buttonsHtml}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 綁定關閉事件
    modal.querySelector('.modal-close')?.addEventListener('click', () => {
      this.closeModal(options.id);
    });

    modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      this.closeModal(options.id);
    });

    // 綁定按鈕事件
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'close') {
          this.closeModal(options.id);
        } else if (options.onAction) {
          options.onAction(action);
        }
      });
    });

    return modal;
  },

  /**
   * 銷毀模態
   * @param {string} modalId - 模態 ID
   */
  destroyModal(modalId) {
    const modal = $(modalId);
    if (modal) {
      modal.remove();
    }
  },

  /**
   * 檢查模態是否打開
   * @param {string} modalId - 模態 ID
   * @returns {boolean} 是否打開
   */
  isModalOpen(modalId) {
    const modal = $(modalId);
    return modal ? !modal.hidden : false;
  },

  /**
   * 獲取當前模態
   * @returns {string|null} 當前模態 ID
   */
  getCurrentModal() {
    return this.currentModal;
  },

  /**
   * 監聽模態打開事件
   * @param {string} modalId - 模態 ID
   * @param {Function} callback - 回調函數
   */
  onModalOpen(modalId, callback) {
    if (!this.listeners.open[modalId]) {
      this.listeners.open[modalId] = [];
    }
    this.listeners.open[modalId].push(callback);
  },

  /**
   * 監聽模態關閉事件
   * @param {string} modalId - 模態 ID
   * @param {Function} callback - 回調函數
   */
  onModalClose(modalId, callback) {
    if (!this.listeners.close[modalId]) {
      this.listeners.close[modalId] = [];
    }
    this.listeners.close[modalId].push(callback);
  },

  /**
   * 觸發事件
   * @private
   * @param {string} eventType - 事件類型 ('open' | 'close')
   * @param {string} modalId - 模態 ID
   */
  _triggerEvent(eventType, modalId) {
    const callbacks = this.listeners[eventType][modalId] || [];
    callbacks.forEach(callback => {
      try {
        callback(modalId);
      } catch (error) {
        console.error(`Error in modal ${eventType} callback:`, error);
      }
    });
  },

  /**
   * 顯示班級詳情模態
   * @param {string} classKey - 班級名稱
   * @param {Array<Object>} records - 課堂記錄
   * @param {Function} onShowDetail - 顯示詳情回調
   * @param {Function} onDelete - 刪除回調
   */
  showClassDetail(classKey, records, onShowDetail, onDelete) {
    const recs = records
      .filter(r => ((r.className || '').trim() || '—') === classKey)
      .sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
    
    const title = (classKey === '—' ? '未填寫班別' : classKey) + ' － 班別細節';
    
    const titleEl = $('classDetailTitle');
    if (titleEl) titleEl.textContent = title;
    
    const bodyEl = $('classDetailBody');
    if (bodyEl) {
      if (recs.length === 0) {
        bodyEl.innerHTML = '<p class="empty">此班別尚無課堂記錄。</p>';
      } else {
        bodyEl.innerHTML = '<ul class="class-session-list">' + 
          recs.map(r => `
            <li class="class-session-item" data-date="${escapeHtml(r.classDate || '')}" data-class="${escapeHtml(r.className || '')}">
              <span class="date">${r.classDate || '–'}</span>
              ${r.classSize != null ? `<span class="meta">人數 ${r.classSize}</span>` : ''}
              <span class="hint">點擊查看詳情</span>
              <button type="button" class="delete-session-btn" aria-label="刪除此堂課">×</button>
            </li>
          `).join('') + 
          '</ul>';
        
        // 綁定點擊事件
        bodyEl.querySelectorAll('.class-session-item').forEach(li => {
          li.onclick = (e) => {
            if (e.target.classList.contains('delete-session-btn')) return;
            const rec = records.find(r => 
              r.classDate === li.dataset.date && r.className === li.dataset.class
            );
            if (rec) {
              this.closeModal('classDetailModal');
              if (onShowDetail) onShowDetail(rec);
            }
          };
          
          li.querySelector('.delete-session-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dateStr = li.dataset.date;
            const classStr = li.dataset.class;
            if (onDelete) {
              onDelete(dateStr, classStr);
              setTimeout(() => this.showClassDetail(classKey, records, onShowDetail, onDelete), 300);
            }
          });
        });
      }
    }
    
    this.openModal('classDetailModal');
  },

  /**
   * 顯示課堂詳情模態
   * @param {Object} record - 課堂記錄
   * @param {Function} onLoadIntoForm - 載入到表單回調
   * @param {Function} onDelete - 刪除回調
   */
  showRecordDetail(record, onLoadIntoForm, onDelete) {
    const tricksStr = Array.isArray(record.tricks) && record.tricks.length 
      ? record.tricks.map(t => {
          let str = escapeHtml(t.name);
          if (t.detail) str += `（${escapeHtml(t.detail)}）`;
          if (t.level) str += ` [${escapeHtml(t.level)}]`;
          return str;
        }).join('、')
      : '—';
    
    let durationStr = '—';
    if (record.classStartTime && record.classEndTime) {
      durationStr = `${record.classStartTime} - ${record.classEndTime}`;
      if (record.classDurationMins) {
        const h = Math.floor(record.classDurationMins / 60);
        const m = record.classDurationMins % 60;
        durationStr += ` (${h ? `${h}小時` : ''}${m ? `${m}分鐘` : ''})`;
      }
    }
    
    const titleEl = $('detailTitle');
    if (titleEl) titleEl.textContent = `課堂詳情 · ${record.classDate || '–'}`;
    
    const bodyEl = $('detailBody');
    if (bodyEl) {
      // Creator 測試模式橫幅
      let testModeBanner = '';
      if (record.creatorTestMode) {
        testModeBanner = '<div style="background: #3498db; color: white; padding: 12px; margin-bottom: 16px; border-radius: 6px; text-align: center; font-weight: 600;">🧪 Creator 測試模式記錄</div>';
      }
      
      // 附件區域
      let attachmentsHtml = '';
      if (record.attachments && record.attachments.length > 0) {
        attachmentsHtml = `
          <dt>附件</dt>
          <dd>
            ${record.attachments.map((file, index) => `
              <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f1f5f9; border-radius: 4px; margin-top: 0.25rem;">
                <span style="flex: 1;">📎 ${escapeHtml(file.name)} (${formatFileSize(file.size)})</span>
                <button type="button" onclick="window._downloadAttachmentFromDetail(${index}, ${JSON.stringify(file).replace(/"/g, '&quot;')})" class="btn btn-sm btn-primary-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">下載</button>
              </div>
            `).join('')}
          </dd>`;
      }
      
      bodyEl.innerHTML = `
        ${testModeBanner}
        <dl>
          <dt>基本資料</dt><dd>${record.classDate || '–'} | ${escapeHtml(record.className || '–')} | 人數 ${record.classSize ?? '–'}</dd>
          ${record.classLocation ? `<dt>課堂位置</dt><dd>${escapeHtml(record.classLocation)}</dd>` : ''}
          ${record.teachingRole ? `<dt>教學角色</dt><dd>${escapeHtml(record.teachingRole)}</dd>` : ''}
          <dt>課堂時間</dt><dd>${durationStr}</dd>
          <dt>備注</dt><dd>${record.notes ? escapeHtml(record.notes).replace(/\n/g, '<br>') : '—'}</dd>
          ${attachmentsHtml}
          <dt>投入度</dt><dd>開心指數 ${record.engagement ?? '–'}/5 · 課堂氣氛 ${escapeHtml(record.atmosphere || '–')}</dd>
          <dt>技能進步</dt><dd>教學花式：${tricksStr} · 掌握 ${record.mastery ?? '–'}% · 預算/實際 ${record.plannedTime ?? '–'}/${record.actualTime ?? '–'} 分鐘 · 技巧等級 ${escapeHtml(record.skillLevel || '–')}</dd>
          <dt>團隊協作</dt><dd>幫助他人 ${record.helpOthers ?? '–'}% · 互動 ${record.interaction ?? '–'}% · 小組合作 ${record.teamwork ?? '–'}%</dd>
          <dt>心理與自信</dt><dd>自發練習 ${record.selfPractice ?? '–'}% · 主動學習 ${record.activeLearn ?? '–'}% · 積極性 ${record.positivity ?? '–'}/5 · 熱情 ${record.enthusiasm ?? '–'}/5</dd>
          <dt>教練質量</dt><dd>教學 ${record.teachScore ?? '–'}/10 · 滿意度 ${record.satisfaction ?? '–'}/5 · 紀律介入 ${record.disciplineCount ?? '–'} 次 · 靈活性 ${record.flexibility ?? '–'}/10 · 個別化 ${record.individual ?? '–'}%</dd>
        </dl>
        <p style="margin-top:1rem;">
          <button type="button" id="loadIntoFormBtn" class="btn btn-ghost">載入到表單（重溫／編輯）</button> 
          <button type="button" id="deleteRecordBtn" class="btn btn-danger-ghost">刪除此記錄</button>
        </p>`;
      
      // 綁定按鈕事件
      $('loadIntoFormBtn')?.addEventListener('click', () => {
        if (onLoadIntoForm) onLoadIntoForm(record);
        this.closeModal('detailModal');
      });
      
      $('deleteRecordBtn')?.addEventListener('click', () => {
        if (onDelete) onDelete(record.classDate, record.className);
      });
    }
    
    this.openModal('detailModal');
  }
};

// 導出便利函數
export const {
  openModal,
  closeModal,
  closeAllModals,
  confirm,
  alert,
  createModal,
  destroyModal,
  isModalOpen,
  getCurrentModal,
  onModalOpen,
  onModalClose,
  showClassDetail,
  showRecordDetail
} = ModalManager;

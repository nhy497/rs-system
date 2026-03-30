/**
 * 模態窗口管理器 - 處理彈窗與對話框
 * @module ui/modal-manager
 */

import { escapeHtml as _escapeHtml } from '../utils/helpers.js';

/**
 * 格式化檔案大小
 */
function _formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * HTML 轉義（Modal 內部用，不轉義 / 以保持 HTML 結構正確）
 */
function _escapeHtmlSafe(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const $ = id => document.getElementById(id);

export const ModalManager = {
  currentModal: null,
  listeners: { open: {}, close: {} },
  _previousFocus: null,
  _globalListenersAttached: false,

  _attachGlobalListeners() {
    if (this._globalListenersAttached) return;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.closeModal(this.currentModal);
      }
    });
    document.addEventListener('click', (e) => {
      if (!this.currentModal) return;
      const modal = $(this.currentModal);
      if (!modal) return;
      // 點擊 modal 本身（背景）才關閉，點擊 modal-content 不關閉
      if (e.target === modal) {
        this.closeModal(this.currentModal);
      }
    });
    this._globalListenersAttached = true;
  },

  openModal(modalId) {
    this._attachGlobalListeners();
    const modal = $(modalId);
    if (!modal) { console.warn(`Modal ${modalId} not found`); return; }
    this._previousFocus = document.activeElement;
    modal.hidden = false;
    modal.style.display = 'block';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    modal.focus();
    this.currentModal = modalId;
    this._triggerEvent('open', modalId);
  },

  closeModal(modalId) {
    const modal = $(modalId);
    if (!modal) return;
    modal.hidden = true;
    modal.style.display = 'none';
    if (this.currentModal === modalId) {
      this.currentModal = null;
      if (this._previousFocus && typeof this._previousFocus.focus === 'function') {
        this._previousFocus.focus();
        this._previousFocus = null;
      }
    }
    this._triggerEvent('close', modalId);
  },

  closeCurrentModal() {
    if (this.currentModal) this.closeModal(this.currentModal);
  },

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.hidden = true;
      modal.style.display = 'none';
    });
    this.currentModal = null;
  },

  confirm(options) {
    return new Promise(resolve => {
      const confirmed = window.confirm(options.message);
      if (confirmed && options.onConfirm) options.onConfirm();
      else if (!confirmed && options.onCancel) options.onCancel();
      resolve(confirmed);
    });
  },

  showConfirm(message, onConfirm, onCancel) {
    const confirmModal = $('confirmModal');
    if (confirmModal) {
      const messageEl = confirmModal.querySelector('p');
      if (messageEl) messageEl.textContent = message;
      const yesBtn = confirmModal.querySelector('.confirm-yes');
      const noBtn = confirmModal.querySelector('.confirm-no');
      if (yesBtn) yesBtn.onclick = () => { if (onConfirm) onConfirm(); this.closeModal('confirmModal'); };
      if (noBtn) noBtn.onclick = () => { if (onCancel) onCancel(); this.closeModal('confirmModal'); };
      this.openModal('confirmModal');
    } else {
      const confirmed = window.confirm(message);
      if (confirmed && onConfirm) onConfirm();
      else if (!confirmed && onCancel) onCancel();
    }
  },

  alert(message, title = '提示') {
    window.alert(message);
  },

  createModal(options) {
    const modal = document.createElement('div');
    modal.id = options.id;
    modal.className = 'modal';
    modal.hidden = true;
    if (options.custom) modal.setAttribute('data-custom', 'true');
    const buttonsHtml = (options.buttons || []).map(btn =>
      `<button type="button" class="${btn.className || 'btn'}" data-action="${btn.action || 'close'}">${_escapeHtmlSafe(btn.text)}</button>`
    ).join('');
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${_escapeHtmlSafe(options.title || '')}</h3>
          <button type="button" class="modal-close" aria-label="關閉">×</button>
        </div>
        <div class="modal-body">${typeof options.content === 'string' ? options.content : ''}</div>
        <div class="modal-footer">${buttonsHtml}</div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close')?.addEventListener('click', () => this.closeModal(options.id));
    modal.querySelector('.modal-backdrop')?.addEventListener('click', () => this.closeModal(options.id));
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const { action } = btn.dataset;
        if (action === 'close') this.closeModal(options.id);
        else if (options.onAction) options.onAction(action);
      });
    });
    return modal;
  },

  destroyModal(modalId) {
    const modal = $(modalId);
    if (modal) modal.remove();
  },

  isModalOpen(modalId) {
    const modal = $(modalId);
    if (!modal) return false;
    return modal.style.display === 'block' && !modal.hidden;
  },

  getCurrentModal() { return this.currentModal; },

  onModalOpen(modalId, callback) {
    if (!this.listeners.open[modalId]) this.listeners.open[modalId] = [];
    this.listeners.open[modalId].push(callback);
  },

  onModalClose(modalId, callback) {
    if (!this.listeners.close[modalId]) this.listeners.close[modalId] = [];
    this.listeners.close[modalId].push(callback);
  },

  _triggerEvent(eventType, modalId) {
    const callbacks = this.listeners[eventType][modalId] || [];
    callbacks.forEach(cb => { try { cb(modalId); } catch (e) { console.error(e); } });
  },

  showClassDetail(classKey, records, onShowDetail, onDelete) {
    const recs = records
      .filter(r => ((r.className || '').trim() || '—') === classKey)
      .sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
    const titleEl = $('classDetailTitle');
    if (titleEl) titleEl.textContent = `${classKey === '—' ? '未填寫班別' : classKey} － 班別細節`;
    const bodyEl = $('classDetailBody');
    if (bodyEl) {
      if (recs.length === 0) {
        bodyEl.innerHTML = '<p class="empty">此班別尚無課堂記錄。</p>';
      } else {
        bodyEl.innerHTML = `<ul class="class-session-list">${recs.map(r => `
          <li class="class-session-item" data-date="${_escapeHtmlSafe(r.classDate || '')}" data-class="${_escapeHtmlSafe(r.className || '')}">
            <span class="date">${r.classDate || '–'}</span>
            ${r.classSize != null ? `<span class="meta">人數 ${r.classSize}</span>` : ''}
            <span class="hint">點擊查看詳情</span>
            <button type="button" class="delete-session-btn" aria-label="刪除此堂課">×</button>
          </li>`).join('')}</ul>`;
        bodyEl.querySelectorAll('.class-session-item').forEach(li => {
          li.onclick = e => {
            if (e.target.classList.contains('delete-session-btn')) return;
            const rec = records.find(r => r.classDate === li.dataset.date && r.className === li.dataset.class);
            if (rec) { this.closeModal('classDetailModal'); if (onShowDetail) onShowDetail(rec); }
          };
          li.querySelector('.delete-session-btn')?.addEventListener('click', e => {
            e.stopPropagation();
            if (onDelete) { onDelete(li.dataset.date, li.dataset.class); setTimeout(() => this.showClassDetail(classKey, records, onShowDetail, onDelete), 300); }
          });
        });
      }
    }
    this.openModal('classDetailModal');
  },

  showRecordDetail(record, onLoadIntoForm, onDelete) {
    const tricksStr = Array.isArray(record.tricks) && record.tricks.length
      ? record.tricks.map(t => { let s = _escapeHtmlSafe(t.name); if (t.detail) s += `（${_escapeHtmlSafe(t.detail)}）`; if (t.level) s += ` [${_escapeHtmlSafe(t.level)}]`; return s; }).join('、')
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
      const testModeBanner = record.creatorTestMode ? '<div style="background:#3498db;color:white;padding:12px;margin-bottom:16px;border-radius:6px;text-align:center;font-weight:600;">🧪 Creator 測試模式記錄</div>' : '';
      let attachmentsHtml = '';
      if (record.attachments?.length) {
        attachmentsHtml = `<dt>附件</dt><dd>${record.attachments.map((file, i) => `<div style="display:flex;align-items:center;gap:.5rem;padding:.5rem;background:#f1f5f9;border-radius:4px;margin-top:.25rem;"><span style="flex:1">📎 ${_escapeHtmlSafe(file.name)} (${_formatFileSize(file.size)})</span><button type="button" onclick="window._downloadAttachmentFromDetail(${i},${JSON.stringify(file).replace(/"/g,'&quot;')})" class="btn btn-sm btn-primary-ghost" style="padding:.25rem .5rem;font-size:.8rem;">下載</button></div>`).join('')}</dd>`;
      }
      bodyEl.innerHTML = `${testModeBanner}<dl>
        <dt>基本資料</dt><dd>${record.classDate || '–'} | ${_escapeHtmlSafe(record.className || '–')} | 人數 ${record.classSize ?? '–'}</dd>
        ${record.classLocation ? `<dt>課堂位置</dt><dd>${_escapeHtmlSafe(record.classLocation)}</dd>` : ''}
        ${record.teachingRole ? `<dt>教學角色</dt><dd>${_escapeHtmlSafe(record.teachingRole)}</dd>` : ''}
        <dt>課堂時間</dt><dd>${durationStr}</dd>
        <dt>備注</dt><dd>${record.notes ? _escapeHtmlSafe(record.notes).replace(/\n/g, '<br>') : '—'}</dd>
        ${attachmentsHtml}
        <dt>投入度</dt><dd>開心指數 ${record.engagement ?? '–'}/5 · 課堂氣氛 ${_escapeHtmlSafe(record.atmosphere || '–')}</dd>
        <dt>技能進步</dt><dd>教學花式：${tricksStr} · 掌握 ${record.mastery ?? '–'}% · 預算/實際 ${record.plannedTime ?? '–'}/${record.actualTime ?? '–'} 分鐘 · 技巧等級 ${_escapeHtmlSafe(record.skillLevel || '–')}</dd>
        <dt>團隊協作</dt><dd>幫助他人 ${record.helpOthers ?? '–'}% · 互動 ${record.interaction ?? '–'}% · 小組合作 ${record.teamwork ?? '–'}%</dd>
        <dt>心理與自信</dt><dd>自發練習 ${record.selfPractice ?? '–'}% · 主動學習 ${record.activeLearn ?? '–'}% · 積極性 ${record.positivity ?? '–'}/5 · 熱情 ${record.enthusiasm ?? '–'}/5</dd>
        <dt>教練質量</dt><dd>教學 ${record.teachScore ?? '–'}/10 · 滿意度 ${record.satisfaction ?? '–'}/5 · 紀律介入 ${record.disciplineCount ?? '–'} 次 · 靈活性 ${record.flexibility ?? '–'}/10 · 個別化 ${record.individual ?? '–'}%</dd>
      </dl>
      <p style="margin-top:1rem;">
        <button type="button" id="loadIntoFormBtn" class="btn btn-ghost">載入到表單（重溫／編輯）</button>
        <button type="button" id="deleteRecordBtn" class="btn btn-danger-ghost">刪除此記錄</button>
      </p>`;
      $('loadIntoFormBtn')?.addEventListener('click', () => { if (onLoadIntoForm) onLoadIntoForm(record); this.closeModal('detailModal'); });
      $('deleteRecordBtn')?.addEventListener('click', () => { if (onDelete) onDelete(record.classDate, record.className); });
    }
    this.openModal('detailModal');
  },

  showCustomModal(title, content, options = {}) {
    const modalEl = this.createModal({
      id: options.id || `custom_${Date.now()}`,
      title,
      content: content || '',
      custom: true,
      buttons: [{ text: '關閉', className: 'btn btn-primary', action: 'close' }]
    });
    const modalId = modalEl.id;
    this.openModal(modalId);
    return modalId;
  },

  // ModalManager.escapeHtml 唔轉義 / (向後兼容)
  escapeHtml(text) { return _escapeHtmlSafe(text); },
  formatFileSize(bytes) { return _formatFileSize(bytes); }
};

export function escapeHtml(text) { return _escapeHtmlSafe(text); }
export function formatFileSize(bytes) { return _formatFileSize(bytes); }

/**
 * 附件管理器 - 處理檔案上傳與附件顯示
 * @module ui/attachments-manager
 * 
 * 源代碼位置: system.js L2103-2240
 * 
 * 主要功能:
 * - 檔案上傳處理
 * - 附件列表顯示
 * - 檔案預覽
 * - 附件刪除
 * - 檔案大小格式化
 * - 檔案類型驗證
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
 * Toast 通知函數
 * @param {string} msg - 訊息內容
 */
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) {
    console.log(msg);
    return;
  }
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2500);
}

/**
 * DOM 選擇器
 */
const $ = (id) => document.getElementById(id);

/**
 * 附件管理器
 */
export const AttachmentsManager = {
  /**
   * 當前附件列表
   */
  currentAttachments: [],

  /**
   * 初始化附件管理器
   */
  init() {
    window._currentAttachments = [];
    this.currentAttachments = window._currentAttachments;
  },

  /**
   * 處理檔案上傳
   * @param {Event|File} fileInputOrEvent - 檔案輸入事件或檔案對象
   * @param {Object} options - 上傳選項
   * @param {number} options.maxSize - 最大檔案大小（字節）
   * @param {Array<string>} options.allowedTypes - 允許的檔案類型
   * @returns {Promise<void>}
   */
  async handleFileUpload(fileInputOrEvent, options = {}) {
    const event = fileInputOrEvent.target ? fileInputOrEvent : null;
    const file = event ? event.target.files?.[0] : fileInputOrEvent;
    
    if (!file) return;
    
    // 檢查文件類型
    const allowedTypes = options.allowedTypes || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast('❌ 只支援 PDF 或 Word 文檔');
      if (event) event.target.value = '';
      return;
    }
    
    // 檢查文件大小（限制 5MB）
    const maxSize = options.maxSize || 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast(`❌ 文件大小不能超過 ${this.formatFileSize(maxSize)}`);
      if (event) event.target.value = '';
      return;
    }
    
    try {
      // 讀取文件為 Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        window._currentAttachments = window._currentAttachments || [];
        window._currentAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target.result,
          uploadedAt: new Date().toISOString()
        });
        
        this.currentAttachments = window._currentAttachments;
        this.displayAttachments();
        toast(`✓ 已添加附件: ${file.name}`);
        if (event) event.target.value = ''; // 清空 input 以便再次上傳
      };
      
      reader.onerror = () => {
        toast('❌ 文件讀取失敗');
        if (event) event.target.value = '';
      };
      
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('文件上傳失敗:', e);
      toast('❌ 文件上傳失敗');
      if (event) event.target.value = '';
    }
  },

  /**
   * 驗證檔案
   * @param {File} file - 檔案對象
   * @param {Object} options - 驗證選項
   * @returns {Object} 驗證結果 { valid: boolean, error: string }
   */
  validateFile(file, options = {}) {
    const allowedTypes = options.allowedTypes || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const maxSize = options.maxSize || 5 * 1024 * 1024;
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '只支援 PDF 或 Word 文檔'
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `文件大小不能超過 ${this.formatFileSize(maxSize)}`
      };
    }
    
    return { valid: true, error: null };
  },

  /**
   * 上傳檔案（預留接口）
   * @param {File} file - 檔案對象
   * @param {Function} onProgress - 進度回調
   * @returns {Promise<Object>} 上傳結果
   */
  async uploadFile(file, onProgress) {
    // 預留給未來的伺服器上傳功能
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          url: 'local'
        });
      }, 100);
    });
  },

  /**
   * 顯示附件列表
   * @param {Array<Object>} attachments - 附件數組（可選）
   * @param {HTMLElement|string} container - 容器元素或 ID（可選）
   */
  displayAttachments(attachments, container) {
    const preview = container 
      ? (typeof container === 'string' ? $(container) : container)
      : $('filePreview');
    
    if (!preview) return;
    
    const files = attachments || window._currentAttachments || [];
    this.currentAttachments = files;
    
    if (files.length === 0) {
      preview.innerHTML = '';
      return;
    }
    
    preview.innerHTML = this.renderAttachmentsList(files);
  },

  /**
   * 渲染附件列表 HTML
   * @param {Array<Object>} attachments - 附件數組
   * @returns {string} HTML 字符串
   */
  renderAttachmentsList(attachments) {
    if (!attachments || attachments.length === 0) {
      return '';
    }
    
    return attachments.map((file, index) => this.renderAttachmentItem(file, index)).join('');
  },

  /**
   * 渲染單個附件項目
   * @param {Object} attachment - 附件對象
   * @param {number} index - 索引
   * @returns {string} HTML 字符串
   */
  renderAttachmentItem(attachment, index) {
    return `
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f1f5f9; border-radius: 4px; margin-top: 0.25rem;">
        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          📎 ${escapeHtml(attachment.name)} (${this.formatFileSize(attachment.size)})
        </span>
        <button type="button" onclick="window._downloadAttachment(${index})" class="btn btn-sm btn-primary-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">下載</button>
        <button type="button" onclick="window._removeAttachment(${index})" class="btn btn-sm btn-danger-ghost" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">刪除</button>
      </div>
    `;
  },

  /**
   * 移除附件
   * @param {number} index - 附件索引
   */
  removeAttachment(index) {
    window._currentAttachments.splice(index, 1);
    this.currentAttachments = window._currentAttachments;
    this.displayAttachments();
    toast('已移除附件');
  },

  /**
   * 下載附件
   * @param {number} index - 附件索引
   */
  downloadAttachment(index) {
    const file = window._currentAttachments[index];
    if (!file) return;
    
    try {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      link.click();
      toast('開始下載附件');
    } catch (e) {
      console.error('下載失敗:', e);
      toast('❌ 下載失敗');
    }
  },

  /**
   * 從詳情頁面下載附件
   * @param {number} index - 附件索引
   * @param {Object} file - 檔案對象
   */
  downloadAttachmentFromDetail(index, file) {
    if (!file) return;
    
    try {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      link.click();
      toast('開始下載附件');
    } catch (e) {
      console.error('下載失敗:', e);
      toast('❌ 下載失敗');
    }
  },

  /**
   * 預覽附件
   * @param {number|Object} attachmentIdOrObj - 附件 ID 或對象
   */
  previewAttachment(attachmentIdOrObj) {
    const attachment = typeof attachmentIdOrObj === 'object' 
      ? attachmentIdOrObj 
      : window._currentAttachments[attachmentIdOrObj];
    
    if (!attachment) return;
    
    // 對於 PDF 可以在新視窗開啟
    if (attachment.type === 'application/pdf') {
      window.open(attachment.data, '_blank');
    } else {
      toast('此檔案類型不支援預覽，請下載後查看');
    }
  },

  /**
   * 獲取附件
   * @param {string} recordId - 記錄 ID（預留）
   * @returns {Array<Object>} 附件數組
   */
  getAttachments(recordId) {
    return window._currentAttachments || [];
  },

  /**
   * 添加附件
   * @param {string} recordId - 記錄 ID（預留）
   * @param {File} file - 檔案對象
   * @returns {Promise<void>}
   */
  async addAttachment(recordId, file) {
    return this.handleFileUpload(file);
  },

  /**
   * 轉換檔案為 Base64
   * @param {File} file - 檔案對象
   * @returns {Promise<string>} Base64 字符串
   */
  convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  /**
   * 獲取檔案副檔名
   * @param {string} filename - 檔案名稱
   * @returns {string} 副檔名
   */
  getFileExtension(filename) {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  },

  /**
   * 獲取檔案圖標
   * @param {string} filename - 檔案名稱
   * @returns {string} 圖標表情符號
   */
  getFileIcon(filename) {
    const ext = this.getFileExtension(filename);
    const icons = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📽️',
      'pptx': '📽️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'zip': '🗜️',
      'rar': '🗜️'
    };
    return icons[ext] || '📎';
  },

  /**
   * 格式化檔案大小
   * @param {number} bytes - 字節數
   * @returns {string} 格式化後的大小
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  /**
   * 檢查檔案大小
   * @param {File} file - 檔案對象
   * @param {number} maxSize - 最大大小（字節）
   * @returns {boolean} 是否通過檢查
   */
  checkFileSize(file, maxSize = 5 * 1024 * 1024) {
    return file.size <= maxSize;
  },

  /**
   * 檢查檔案類型
   * @param {File} file - 檔案對象
   * @param {Array<string>} allowedTypes - 允許的類型列表
   * @returns {boolean} 是否通過檢查
   */
  checkFileType(file, allowedTypes = []) {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.includes(file.type);
  }
};

// 設置全局函數供 onclick 使用
if (typeof window !== 'undefined') {
  window._removeAttachment = (index) => AttachmentsManager.removeAttachment(index);
  window._downloadAttachment = (index) => AttachmentsManager.downloadAttachment(index);
  window._downloadAttachmentFromDetail = (index, file) => AttachmentsManager.downloadAttachmentFromDetail(index, file);
}

// 導出便利函數
export const {
  handleFileUpload,
  validateFile,
  uploadFile,
  renderAttachmentsList,
  renderAttachmentItem,
  removeAttachment,
  downloadAttachment,
  previewAttachment,
  getAttachments,
  addAttachment,
  convertToBase64,
  getFileExtension,
  getFileIcon,
  formatFileSize,
  checkFileSize,
  checkFileType,
  displayAttachments
} = AttachmentsManager;

/**
 * Phase 3 使用範例 - UI 管理層與事件處理
 * @module examples/phase3-usage
 *
 * 此檔案展示如何使用 Phase 3 提取的 UI 管理模組
 */

// ============================================================================
// 匯入 UI 管理模組
// ============================================================================

import { UI_MANAGER } from '../ui/ui-manager.js';
import { FormManager } from '../ui/form-manager.js';
import { TricksManager } from '../ui/tricks-manager.js';
import { AttachmentsManager } from '../ui/attachments-manager.js';
import { ListRenderer } from '../ui/list-renderer.js';
import { ModalManager } from '../ui/modal-manager.js';
import { EventHandlers } from '../ui/event-handlers.js';

// ============================================================================
// 範例 1: UI 管理器使用
// ============================================================================

function example1_UIManager() {
  console.log('=== 範例 1: UI 管理器 ===');

  // 初始化 UI 管理器
  UI_MANAGER.init();

  // 顯示/隱藏視圖
  UI_MANAGER.showView('page-overview');
  UI_MANAGER.hideView('page-students');

  // 顯示載入狀態
  UI_MANAGER.showLoading('正在加載課堂記錄...');
  setTimeout(() => {
    UI_MANAGER.hideLoading();
  }, 2000);

  // 顯示通知
  UI_MANAGER.showSuccess('課堂記錄已保存');
  UI_MANAGER.showError('保存失敗，請重試');
  UI_MANAGER.showNotification('這是一條訊息', 'info');

  // 主題管理
  UI_MANAGER.setTheme('dark');
  const currentTheme = UI_MANAGER.getTheme();
  console.log('當前主題:', currentTheme);

  // 檢查視圖狀態
  const isVisible = UI_MANAGER.isViewVisible('page-overview');
  console.log('概覽頁面是否可見:', isVisible);
}

// ============================================================================
// 範例 2: 表單管理器使用
// ============================================================================

function example2_FormManager() {
  console.log('=== 範例 2: 表單管理器 ===');

  // 獲取表單數據
  const formData = FormManager.getFormData();
  console.log('表單數據:', formData);

  // 載入數據到表單
  const sampleRecord = {
    classDate: '2024-01-15',
    className: '小學三年級A班',
    classSize: 25,
    classLocation: '學校體育館',
    teachingRole: '主教練',
    classStartTime: '14:00',
    classEndTime: '15:30',
    notes: '今天學生表現很好',
    engagement: 4,
    atmosphere: '活潑',
    mastery: 75,
    tricks: [
      {
        name: '單腳跳',
        detail: '左右腳輪流',
        level: '初級',
        mastery: 70
      }
    ]
  };

  FormManager.loadIntoForm(sampleRecord);

  // 清空表單
  FormManager.clearForm();

  // 驗證表單
  const errors = FormManager.validateForm();
  if (errors.length > 0) {
    console.log('驗證錯誤:', errors);
  }

  // 設置表單模式
  FormManager.setFormMode('edit');
  console.log('表單模式:', FormManager.getFormMode());

  // 綁定範圍滑桿
  FormManager.bindAllRanges();
}

// ============================================================================
// 範例 3: 花式管理器使用
// ============================================================================

function example3_TricksManager() {
  console.log('=== 範例 3: 花式管理器 ===');

  // 添加花式
  TricksManager.addTrick({
    name: '雙腳跳',
    detail: '基礎跳法',
    level: '初級',
    mastery: 80,
    plannedTime: 10,
    actualTime: 12
  });

  TricksManager.addTrick({
    name: '交叉跳',
    detail: '手臂交叉',
    level: '中級',
    mastery: 60,
    plannedTime: 15,
    actualTime: 18
  });

  // 渲染花式列表
  TricksManager.renderTricksList(TricksManager.tricks, 'tricksList');

  // 獲取已選擇的花式
  const selectedTricks = TricksManager.getSelectedTricks();
  console.log('已選擇的花式:', selectedTricks);

  // 搜尋花式
  const searchResults = TricksManager.searchTricks(selectedTricks, '跳');
  console.log('搜尋結果:', searchResults);

  // 清除選擇
  TricksManager.clearSelection();
}

// ============================================================================
// 範例 4: 附件管理器使用
// ============================================================================

function example4_AttachmentsManager() {
  console.log('=== 範例 4: 附件管理器 ===');

  // 初始化附件管理器
  AttachmentsManager.init();

  // 模擬文件上傳（實際使用時會是真實的 File 對象）
  const mockFile = new File(['test content'], 'lesson-plan.pdf', {
    type: 'application/pdf'
  });

  // 驗證文件
  const validation = AttachmentsManager.validateFile(mockFile);
  console.log('文件驗證結果:', validation);

  // 格式化文件大小
  const size = AttachmentsManager.formatFileSize(1024 * 1024); // 1MB
  console.log('文件大小:', size);

  // 獲取文件圖標
  const icon = AttachmentsManager.getFileIcon('document.pdf');
  console.log('文件圖標:', icon);

  // 顯示附件列表
  AttachmentsManager.displayAttachments([], 'filePreview');
}

// ============================================================================
// 範例 5: 列表渲染器使用
// ============================================================================

function example5_ListRenderer() {
  console.log('=== 範例 5: 列表渲染器 ===');

  // 模擬課堂記錄數據
  const records = [
    {
      classDate: '2024-01-15',
      className: '小學三年級A班',
      classSize: 25,
      mastery: 75,
      engagement: 4
    },
    {
      classDate: '2024-01-14',
      className: '小學四年級B班',
      classSize: 30,
      mastery: 80,
      engagement: 5
    },
    {
      classDate: '2024-01-13',
      className: '小學三年級A班',
      classSize: 25,
      mastery: 70,
      engagement: 3
    }
  ];

  // 渲染記錄列表
  ListRenderer.renderRecordsList(records, 'recentList', {
    limit: 10,
    onItemClick: record => {
      console.log('點擊記錄:', record);
    }
  });

  // 排序記錄
  const sortedRecords = ListRenderer.sortRecords(records, 'date-desc');
  console.log('排序後的記錄:', sortedRecords);

  // 過濾記錄
  const filteredRecords = ListRenderer.filterRecords(records, {
    className: '小學三年級A班',
    dateFrom: '2024-01-10',
    dateTo: '2024-01-20'
  });
  console.log('過濾後的記錄:', filteredRecords);

  // 搜尋記錄
  const searchResults = ListRenderer.searchRecords(records, '三年級');
  console.log('搜尋結果:', searchResults);

  // 渲染統計資訊
  ListRenderer.renderStatistics(records, {
    total: 'statTotal',
    week: 'statWeek',
    avg: 'statAvg',
    updated: 'statUpdated'
  });

  // 計算總課堂時長
  const totalDuration = ListRenderer.calculateTotalDuration(records);
  console.log('總課堂時長:', totalDuration, '分鐘');
}

// ============================================================================
// 範例 6: 模態管理器使用
// ============================================================================

function example6_ModalManager() {
  console.log('=== 範例 6: 模態管理器 ===');

  // 打開/關閉模態
  ModalManager.openModal('detailModal');
  setTimeout(() => {
    ModalManager.closeModal('detailModal');
  }, 2000);

  // 確認對話框
  ModalManager.confirm({
    title: '刪除確認',
    message: '確定要刪除此記錄嗎？',
    onConfirm: () => {
      console.log('用戶確認刪除');
    },
    onCancel: () => {
      console.log('用戶取消刪除');
    }
  });

  // 提示對話框
  ModalManager.alert('操作成功', '提示');

  // 創建自訂模態
  const customModal = ModalManager.createModal({
    id: 'customModal',
    title: '自訂模態',
    content: '<p>這是自訂模態內容</p>',
    buttons: [
      { text: '確定', action: 'confirm', className: 'btn btn-primary' },
      { text: '取消', action: 'close', className: 'btn btn-secondary' }
    ],
    onAction: action => {
      console.log('按鈕動作:', action);
    }
  });

  // 監聽模態事件
  ModalManager.onModalOpen('detailModal', modalId => {
    console.log('模態已打開:', modalId);
  });

  ModalManager.onModalClose('detailModal', modalId => {
    console.log('模態已關閉:', modalId);
  });

  // 檢查模態狀態
  const isOpen = ModalManager.isModalOpen('detailModal');
  console.log('模態是否打開:', isOpen);
}

// ============================================================================
// 範例 7: 事件處理器使用
// ============================================================================

function example7_EventHandlers() {
  console.log('=== 範例 7: 事件處理器 ===');

  // 初始化事件處理器
  EventHandlers.init({
    onSave: () => {
      console.log('儲存按鈕被點擊');
      const formData = FormManager.getFormData();
      console.log('準備保存:', formData);
    },
    onClear: () => {
      console.log('清空表單');
      FormManager.clearForm();
    },
    onExport: () => {
      console.log('導出數據');
    },
    onAddTrick: () => {
      console.log('添加花式');
      // 從表單獲取花式數據並添加
      TricksManager.addTrick({
        name: document.getElementById('trickName')?.value,
        detail: document.getElementById('trickDetail')?.value
      });
    },
    rangeIds: ['engagement', 'mastery', 'helpOthers'],
    onBindRange: id => {
      FormManager.bindRange(id);
    }
  });

  // 綁定自訂表單提交
  EventHandlers.onFormSubmit('classForm', e => {
    console.log('表單提交:', e);
  });

  // 綁定欄位變更
  EventHandlers.onFieldChange('className', e => {
    console.log('班級名稱變更:', e.target.value);
  });

  // 綁定按鈕點擊
  EventHandlers.onButtonClick('customBtn', () => {
    console.log('自訂按鈕被點擊');
  });

  // 綁定 ESC 鍵
  EventHandlers.onEscapeKey(() => {
    console.log('ESC 鍵被按下');
    ModalManager.closeAllModals();
  });

  // 自訂事件
  EventHandlers.on('recordSaved', data => {
    console.log('記錄已保存事件:', data);
    UI_MANAGER.showSuccess('記錄已保存');
  });

  // 觸發自訂事件
  EventHandlers.emit('recordSaved', { id: '123', date: '2024-01-15' });
}

// ============================================================================
// 範例 8: 完整工作流程
// ============================================================================

function example8_CompleteWorkflow() {
  console.log('=== 範例 8: 完整工作流程 ===');

  // 1. 初始化所有管理器
  UI_MANAGER.init();
  AttachmentsManager.init();

  // 2. 設置事件處理
  EventHandlers.init({
    onSave: handleSave,
    onClear: () => FormManager.clearForm(),
    onAddTrick: handleAddTrick,
    onFileUpload: e => AttachmentsManager.handleFileUpload(e),
    rangeIds: ['engagement', 'mastery'],
    onBindRange: id => FormManager.bindRange(id)
  });

  // 3. 載入初始數據
  const initialData = {
    classDate: '2024-01-15',
    className: '示範班級',
    classSize: 20
  };
  FormManager.loadIntoForm(initialData);

  // 4. 添加花式
  TricksManager.addTrick({
    name: '基礎跳',
    level: '初級',
    mastery: 75
  });
  TricksManager.renderTricksList(TricksManager.tricks, 'tricksList');

  // 5. 渲染記錄列表
  const mockRecords = [initialData];
  ListRenderer.renderRecordsList(mockRecords, 'recentList', {
    onItemClick: record => {
      ModalManager.showRecordDetail(
        record,
        rec => FormManager.loadIntoForm(rec),
        (date, className) => console.log('刪除:', date, className)
      );
    }
  });

  // 處理保存
  function handleSave() {
    UI_MANAGER.showLoading('正在保存...');

    const formData = FormManager.getFormData();
    formData.tricks = TricksManager.getSelectedTricks();
    formData.attachments = AttachmentsManager.getAttachments();

    // 驗證
    const errors = FormManager.validateForm();
    if (errors.length > 0) {
      UI_MANAGER.hideLoading();
      UI_MANAGER.showError('請修正表單錯誤');
      return;
    }

    // 模擬保存
    setTimeout(() => {
      UI_MANAGER.hideLoading();
      UI_MANAGER.showSuccess('保存成功');
      EventHandlers.emit('recordSaved', formData);
    }, 1000);
  }

  // 處理添加花式
  function handleAddTrick() {
    const name = document.getElementById('trickName')?.value;
    if (!name) {
      UI_MANAGER.showError('請輸入花式名稱');
      return;
    }

    TricksManager.addTrick({
      name,
      detail: document.getElementById('trickDetail')?.value,
      mastery: parseInt(document.getElementById('mastery')?.value || '50')
    });

    TricksManager.renderTricksList(TricksManager.tricks, 'tricksList');
    UI_MANAGER.showSuccess('花式已添加');
  }
}

// ============================================================================
// 執行所有範例（僅在開發模式）
// ============================================================================

export function runAllExamples() {
  console.log('\n🎯 開始執行 Phase 3 使用範例...\n');

  try {
    example1_UIManager();
    example2_FormManager();
    example3_TricksManager();
    example4_AttachmentsManager();
    example5_ListRenderer();
    example6_ModalManager();
    example7_EventHandlers();
    example8_CompleteWorkflow();

    console.log('\n✅ 所有範例執行完成！\n');
  } catch (error) {
    console.error('\n❌ 範例執行錯誤:', error, '\n');
  }
}

// 如果直接執行此檔案（開發模式）
if (typeof window !== 'undefined' && window.location.search.includes('run-examples')) {
  runAllExamples();
}

// 導出範例函數供外部調用
export {
  example1_UIManager,
  example2_FormManager,
  example3_TricksManager,
  example4_AttachmentsManager,
  example5_ListRenderer,
  example6_ModalManager,
  example7_EventHandlers,
  example8_CompleteWorkflow
};

# RS System - 模組化架構文檔

## 📚 概述

本專案正在進行模組化重構，將原本的單體 JavaScript 檔案 (`system.js`) 拆分為多個獨立的 ES 模組，以提高代碼的可維護性、可測試性和可重用性。

## 🏗️ 模組化進度

### ✅ Phase 3: UI 管理層與事件處理（已完成）

Phase 3 專注於提取 UI 管理和事件處理相關的功能模組。

#### 創建的模組

```
src/ui/
├── ui-manager.js           # UI 管理器 - 介面顯示與狀態管理
├── form-manager.js         # 表單管理器 - 數據收集與驗證
├── tricks-manager.js       # 花式管理器 - 教學花式處理
├── attachments-manager.js  # 附件管理器 - 檔案上傳與顯示
├── list-renderer.js        # 列表渲染器 - 記錄列表顯示
├── modal-manager.js        # 模態管理器 - 彈窗與對話框
└── event-handlers.js       # 事件處理器 - 事件綁定與管理
```

---

## 📦 模組說明

### UI 管理層

#### 1. UI Manager (`src/ui/ui-manager.js`)

**源代碼位置**: `system.js` L1135-1204

**主要功能**:
- ✅ UI 顯示/隱藏控制
- ✅ 載入狀態管理
- ✅ 通知訊息顯示
- ✅ 主題切換
- ✅ 響應式 UI 調整
- ✅ 鍵盤快捷鍵

**使用範例**:
```javascript
import { UI_MANAGER } from './ui/ui-manager.js';

// 初始化
UI_MANAGER.init();

// 顯示載入狀態
UI_MANAGER.showLoading('正在加載...');

// 顯示通知
UI_MANAGER.showSuccess('操作成功');
UI_MANAGER.showError('操作失敗');

// 主題管理
UI_MANAGER.setTheme('dark');
```

**API 文檔**:
- `init()` - 初始化 UI 管理器
- `showView(viewId)` - 顯示視圖
- `hideView(viewId)` - 隱藏視圖
- `toggleView(viewId)` - 切換視圖顯示狀態
- `showLoading(message)` - 顯示載入指示器
- `hideLoading()` - 隱藏載入指示器
- `showNotification(message, type)` - 顯示通知
- `showSuccess(message)` - 顯示成功訊息
- `showError(message)` - 顯示錯誤訊息
- `setTheme(theme)` - 設置主題
- `getTheme()` - 獲取當前主題

---

#### 2. Form Manager (`src/ui/form-manager.js`)

**源代碼位置**: `system.js` L1909-2100

**主要功能**:
- ✅ 表單數據讀取與寫入
- ✅ 表單驗證
- ✅ 表單重置與清空
- ✅ 表單狀態管理
- ✅ 範圍滑桿處理

**使用範例**:
```javascript
import { FormManager } from './ui/form-manager.js';

// 獲取表單數據
const formData = FormManager.getFormData();

// 載入數據到表單
FormManager.loadIntoForm(recordData);

// 清空表單
FormManager.clearForm();

// 驗證表單
const errors = FormManager.validateForm();

// 綁定範圍滑桿
FormManager.bindAllRanges();
```

**API 文檔**:
- `getFormData(formElement)` - 獲取表單數據
- `setFormData(formElement, data)` - 設置表單數據
- `loadIntoForm(record)` - 載入記錄到表單
- `clearForm(formElement)` - 清空表單
- `resetForm(formElement)` - 重置表單
- `validateForm(formElement, rules)` - 驗證表單
- `validateField(field, rules)` - 驗證單個欄位
- `showValidationError(field, message)` - 顯示驗證錯誤
- `clearValidationErrors(formElement)` - 清除驗證錯誤
- `setFormMode(mode)` - 設置表單模式
- `getFormMode()` - 獲取表單模式
- `bindRange(id)` - 綁定範圍滑桿
- `bindAllRanges()` - 綁定所有範圍滑桿

---

#### 3. Tricks Manager (`src/ui/tricks-manager.js`)

**源代碼位置**: `system.js` L1843-1885

**主要功能**:
- ✅ 花式標籤渲染
- ✅ 花式選擇與取消
- ✅ 花式列表管理
- ✅ 花式搜尋與過濾

**使用範例**:
```javascript
import { TricksManager } from './ui/tricks-manager.js';

// 添加花式
TricksManager.addTrick({
  name: '單腳跳',
  detail: '左右腳輪流',
  level: '初級',
  mastery: 75
});

// 渲染花式列表
TricksManager.renderTricksList(tricks, 'tricksList');

// 獲取已選擇的花式
const selected = TricksManager.getSelectedTricks();

// 搜尋花式
const results = TricksManager.searchTricks(tricks, '跳');
```

**API 文檔**:
- `renderTricksList(tricks, container)` - 渲染花式列表
- `renderTrickTag(trick)` - 渲染單個花式標籤
- `renderSelectedTricks(tricks, container)` - 渲染已選擇的花式
- `addTrick(trick)` - 添加花式
- `removeTrick(index)` - 移除花式
- `getSelectedTricks()` - 獲取已選擇的花式
- `setSelectedTricks(tricks)` - 設置已選擇的花式
- `searchTricks(tricks, searchTerm)` - 搜尋花式
- `filterTricksByCategory(tricks, category)` - 按類別過濾
- `getTrickUsageCount(trickId, records)` - 獲取使用次數
- `getMostUsedTricks(records, limit)` - 獲取最常用的花式

---

#### 4. Attachments Manager (`src/ui/attachments-manager.js`)

**源代碼位置**: `system.js` L2103-2240

**主要功能**:
- ✅ 檔案上傳處理
- ✅ 附件列表顯示
- ✅ 檔案預覽
- ✅ 附件刪除
- ✅ 檔案大小格式化

**使用範例**:
```javascript
import { AttachmentsManager } from './ui/attachments-manager.js';

// 初始化
AttachmentsManager.init();

// 處理檔案上傳
AttachmentsManager.handleFileUpload(fileEvent, {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['application/pdf', 'application/msword']
});

// 顯示附件列表
AttachmentsManager.displayAttachments(attachments, 'filePreview');

// 格式化檔案大小
const size = AttachmentsManager.formatFileSize(1024000);
```

**API 文檔**:
- `init()` - 初始化附件管理器
- `handleFileUpload(fileInputOrEvent, options)` - 處理檔案上傳
- `validateFile(file, options)` - 驗證檔案
- `renderAttachmentsList(attachments)` - 渲染附件列表
- `removeAttachment(index)` - 移除附件
- `downloadAttachment(index)` - 下載附件
- `previewAttachment(attachmentIdOrObj)` - 預覽附件
- `formatFileSize(bytes)` - 格式化檔案大小
- `getFileExtension(filename)` - 獲取副檔名
- `getFileIcon(filename)` - 獲取檔案圖標
- `checkFileSize(file, maxSize)` - 檢查檔案大小
- `checkFileType(file, allowedTypes)` - 檢查檔案類型

---

#### 5. List Renderer (`src/ui/list-renderer.js`)

**源代碼位置**: `system.js` L2543-2729

**主要功能**:
- ✅ 課堂記錄列表渲染
- ✅ 列表排序與過濾
- ✅ 列表項目操作
- ✅ 空狀態顯示
- ✅ 統計資訊渲染

**使用範例**:
```javascript
import { ListRenderer } from './ui/list-renderer.js';

// 渲染記錄列表
ListRenderer.renderRecordsList(records, 'recentList', {
  limit: 10,
  onItemClick: (record) => console.log(record)
});

// 排序記錄
const sorted = ListRenderer.sortRecords(records, 'date-desc');

// 過濾記錄
const filtered = ListRenderer.filterRecords(records, {
  className: '三年級A班',
  dateFrom: '2024-01-01'
});

// 搜尋記錄
const results = ListRenderer.searchRecords(records, '關鍵字');

// 渲染統計
ListRenderer.renderStatistics(records, {
  total: 'statTotal',
  week: 'statWeek'
});
```

**API 文檔**:
- `renderRecordsList(records, container, options)` - 渲染記錄列表
- `renderRecordItem(record, options)` - 渲染單個記錄項目
- `renderEmptyState(container, message)` - 渲染空狀態
- `renderByClassList(records, container, options)` - 渲染班級分組列表
- `renderActionsTable(records, tableBody, emptyElement, filters)` - 渲染動作記錄表格
- `sortRecords(records, sortBy, order)` - 排序記錄
- `filterRecords(records, filters)` - 過濾記錄
- `searchRecords(records, searchTerm)` - 搜尋記錄
- `renderStatistics(records, elements)` - 渲染統計資訊
- `calculateTotalDuration(records)` - 計算總時長
- `getRecordsByTeacher(records)` - 按教練分組

---

#### 6. Modal Manager (`src/ui/modal-manager.js`)

**源代碼位置**: `system.js` L2732-2817

**主要功能**:
- ✅ 模態窗口開啟/關閉
- ✅ 確認對話框
- ✅ 自訂模態內容
- ✅ 模態事件處理

**使用範例**:
```javascript
import { ModalManager } from './ui/modal-manager.js';

// 打開/關閉模態
ModalManager.openModal('detailModal');
ModalManager.closeModal('detailModal');

// 確認對話框
ModalManager.confirm({
  title: '刪除確認',
  message: '確定要刪除嗎？',
  onConfirm: () => console.log('已確認'),
  onCancel: () => console.log('已取消')
});

// 創建自訂模態
ModalManager.createModal({
  id: 'customModal',
  title: '標題',
  content: '<p>內容</p>',
  buttons: [
    { text: '確定', action: 'confirm' }
  ]
});

// 監聽模態事件
ModalManager.onModalOpen('detailModal', (id) => {
  console.log('模態已打開:', id);
});
```

**API 文檔**:
- `openModal(modalId)` - 打開模態窗口
- `closeModal(modalId)` - 關閉模態窗口
- `closeAllModals()` - 關閉所有模態窗口
- `confirm(options)` - 顯示確認對話框
- `alert(message, title)` - 顯示提示對話框
- `createModal(options)` - 創建自訂模態
- `destroyModal(modalId)` - 銷毀模態
- `isModalOpen(modalId)` - 檢查模態是否打開
- `getCurrentModal()` - 獲取當前模態
- `onModalOpen(modalId, callback)` - 監聽模態打開事件
- `onModalClose(modalId, callback)` - 監聽模態關閉事件
- `showClassDetail(classKey, records, onShowDetail, onDelete)` - 顯示班級詳情
- `showRecordDetail(record, onLoadIntoForm, onDelete)` - 顯示課堂詳情

---

#### 7. Event Handlers (`src/ui/event-handlers.js`)

**源代碼位置**: `system.js` L2837-3230

**主要功能**:
- ✅ DOM 事件綁定
- ✅ 按鈕點擊處理
- ✅ 表單提交處理
- ✅ 鍵盤事件處理
- ✅ 自訂事件系統

**使用範例**:
```javascript
import { EventHandlers } from './ui/event-handlers.js';

// 初始化事件處理器
EventHandlers.init({
  onSave: () => console.log('儲存'),
  onClear: () => console.log('清空'),
  onExport: () => console.log('導出'),
  rangeIds: ['engagement', 'mastery'],
  onBindRange: (id) => FormManager.bindRange(id)
});

// 綁定自訂事件
EventHandlers.onFormSubmit('myForm', (e) => {
  console.log('表單提交');
});

EventHandlers.onButtonClick('myButton', () => {
  console.log('按鈕點擊');
});

EventHandlers.onEscapeKey(() => {
  console.log('ESC 鍵按下');
});

// 自訂事件系統
EventHandlers.on('recordSaved', (data) => {
  console.log('記錄已保存:', data);
});

EventHandlers.emit('recordSaved', { id: '123' });
```

**API 文檔**:
- `init(handlers)` - 初始化事件處理器
- `bindAllEvents()` - 綁定所有事件
- `unbindAllEvents()` - 解除所有事件綁定
- `onFormSubmit(formId, handler)` - 綁定表單提交事件
- `onFieldChange(fieldId, handler)` - 綁定欄位變更事件
- `onButtonClick(buttonId, handler)` - 綁定按鈕點擊事件
- `onKeyPress(key, handler)` - 綁定鍵盤按鍵事件
- `onEscapeKey(handler)` - 綁定 ESC 鍵事件
- `emit(eventName, data)` - 發射自訂事件
- `on(eventName, handler)` - 監聽自訂事件
- `off(eventName, handler)` - 移除事件監聽器

---

## 🎯 使用指南

### 基本使用流程

1. **導入所需模組**
```javascript
import { UI_MANAGER } from './ui/ui-manager.js';
import { FormManager } from './ui/form-manager.js';
import { EventHandlers } from './ui/event-handlers.js';
```

2. **初始化管理器**
```javascript
UI_MANAGER.init();
AttachmentsManager.init();
EventHandlers.init({
  // 注入處理函數
});
```

3. **使用功能**
```javascript
// 顯示載入狀態
UI_MANAGER.showLoading('處理中...');

// 獲取表單數據
const data = FormManager.getFormData();

// 渲染列表
ListRenderer.renderRecordsList(records, 'listContainer');
```

### 完整範例

請查看 `src/examples/phase3-usage.js` 獲取完整的使用範例。

---

## 🔧 技術要求

- ✅ **ES6 模組語法**: 所有模組使用 `export` 和 `import`
- ✅ **完整 JSDoc 註解**: 每個函式都有詳細文件
- ✅ **零破壞性變更**: `system.js` 保持不變
- ✅ **獨立可測試**: 每個模組可以單獨導入和測試
- ✅ **清晰依賴關係**: 避免循環依賴

---

## 📂 專案結構

```
src/
├── ui/                         # UI 管理層（Phase 3）
│   ├── ui-manager.js           ✅ UI 管理器
│   ├── form-manager.js         ✅ 表單管理器
│   ├── tricks-manager.js       ✅ 花式管理器
│   ├── attachments-manager.js  ✅ 附件管理器
│   ├── list-renderer.js        ✅ 列表渲染器
│   ├── modal-manager.js        ✅ 模態管理器
│   └── event-handlers.js       ✅ 事件處理器
├── examples/                   # 使用範例
│   └── phase3-usage.js         ✅ Phase 3 使用範例
└── README.md                   ✅ 本文檔
```

---

## 🚀 未來計劃

- [ ] Phase 1: 工具函數與常量提取
- [ ] Phase 2: 核心業務邏輯與服務層
- [ ] Phase 4: 測試覆蓋
- [ ] Phase 5: 性能優化
- [ ] Phase 6: TypeScript 遷移

---

## 📝 注意事項

1. **依賴關係**
   - UI 模組之間保持低耦合
   - 使用事件系統解耦複雜依賴
   - 避免循環依賴

2. **DOM 操作**
   - 所有 DOM 操作檢查元素是否存在
   - 處理 null/undefined 情況
   - 確保瀏覽器相容性

3. **事件處理**
   - 使用事件委託模式
   - 提供事件解綁功能
   - 避免記憶體洩漏

4. **錯誤處理**
   - 所有公開 API 都有錯誤處理
   - 使用 try-catch 保護關鍵代碼
   - 記錄錯誤到 console

---

## 🤝 貢獻指南

1. 遵循現有的代碼風格
2. 添加完整的 JSDoc 註解
3. 確保向後兼容性
4. 添加使用範例
5. 更新文檔

---

## 📄 授權

本專案的授權資訊請參考根目錄的 LICENSE 檔案。

---

## 📞 聯絡方式

如有問題或建議，請通過 GitHub Issues 聯絡我們。

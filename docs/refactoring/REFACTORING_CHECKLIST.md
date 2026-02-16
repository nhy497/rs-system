# System.js 模組化重構 - 檢查清單

## 📋 文檔概覽

本文檔提供每個重構階段的詳細檢查清單，確保每個步驟都按計劃完成並經過驗證。

**文檔版本**: v1.0  
**創建日期**: 2026-02-16  
**使用說明**: 在完成每個項目後，將 `- [ ]` 改為 `- [x]`

---

## 目錄

1. [階段 0: 架構設計文檔](#階段-0-架構設計文檔)
2. [階段 1: 提取核心服務](#階段-1-提取核心服務)
3. [階段 2: 提取工具函數](#階段-2-提取工具函數)
4. [階段 3: 提取數據服務](#階段-3-提取數據服務)
5. [階段 4: 提取 UI 管理](#階段-4-提取-ui-管理)
6. [階段 5: 重組初始化邏輯](#階段-5-重組初始化邏輯)
7. [階段 6: 整合與測試](#階段-6-整合與測試)

---

## 階段 0: 架構設計文檔

**目標**: 創建完整的架構設計和遷移文檔  
**時間**: 1-2 天  
**風險**: ⚡ 無風險

### 0.1 文檔創建

- [x] 創建 `docs/refactoring/` 目錄
- [x] 創建 `MODULARIZATION_ARCHITECTURE.md`
  - [x] 概述章節（當前問題、目標、原則）
  - [x] 目標目錄結構
  - [x] 模組依賴關係圖（Mermaid）
  - [x] 分階段實施計劃（6 個階段）
  - [x] 風險管理與回滾策略
  - [x] 成功指標
- [x] 創建 `MODULE_API_DESIGN.md`
  - [x] 核心服務 API
  - [x] 數據服務 API
  - [x] UI 管理 API
  - [x] 工具函數 API
  - [x] 常數定義
  - [x] 初始化 API
- [x] 創建 `MIGRATION_GUIDE.md`
  - [x] 遷移概述
  - [x] 導入模組的方式
  - [x] 替換全局變數
  - [x] 處理循環依賴
  - [x] 兼容性注意事項
  - [x] 測試策略
- [x] 創建 `REFACTORING_CHECKLIST.md`
  - [x] 所有階段的檢查清單

### 0.2 文檔審查

- [ ] 技術審查完成
- [ ] 團隊成員已閱讀並理解
- [ ] 獲得項目批准

### 0.3 準備工作

- [ ] 設置 Git 分支策略
- [ ] 準備開發環境
- [ ] 安裝必要的工具和依賴

---

## 階段 1: 提取核心服務

**目標**: 提取無 UI 依賴的核心服務模組  
**時間**: 3-5 天  
**風險**: ⚡ 低風險

### 1.1 環境設置

- [ ] 創建 `src/core/` 目錄
- [ ] 配置 ESLint 規則
- [ ] 配置 Vite 路徑別名
- [ ] 設置測試框架（Vitest）

### 1.2 storage-manager.js

- [ ] 創建 `src/core/storage-manager.js`
- [ ] 從 system.js 提取代碼 (L56-446)
- [ ] 添加 ES Module 導出
  - [ ] `export const STORAGE_MANAGER`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] `init()` 測試
  - [ ] `setItem()` / `getItem()` 測試
  - [ ] `setCache()` / `getCache()` 測試
  - [ ] `exportBackup()` / `importBackup()` 測試
  - [ ] 緩存過期測試
  - [ ] 跨標籤頁同步測試
- [ ] 測試覆蓋率 > 80%
- [ ] 代碼通過 linting
- [ ] 在 system.js 中導入並重新導出（向後兼容）
- [ ] 驗證現有功能未受影響

### 1.3 auth-config.js

- [ ] 創建 `src/core/auth-config.js`
- [ ] 從 system.js 提取代碼 (L448-574)
- [ ] 添加 ES Module 導出
  - [ ] `export const AUTH_CONFIG`
  - [ ] `export const USER_STORAGE_KEY`
  - [ ] `export const LEGACY_USER_KEY`
  - [ ] `export const BLOCKED_USERNAMES`
  - [ ] `export function hashPasswordCompat`
  - [ ] `export function loadUsersFromStorage`
  - [ ] `export function saveUsersToStorage`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] `hashPasswordCompat()` 測試
  - [ ] `loadUsersFromStorage()` 測試
  - [ ] `saveUsersToStorage()` 測試
  - [ ] 用戶遷移邏輯測試
  - [ ] Creator 帳號自動創建測試
- [ ] 測試覆蓋率 > 80%
- [ ] 代碼通過 linting
- [ ] 在 system.js 中導入並重新導出
- [ ] 驗證現有功能未受影響

### 1.4 login-manager.js

- [ ] 創建 `src/core/login-manager.js`
- [ ] 從 system.js 提取代碼 (L579-828)
- [ ] 添加 ES Module 導出
  - [ ] `export const LOGIN_MANAGER`
- [ ] 更新依賴
  - [ ] 導入 `auth-config.js`
  - [ ] 導入 `storage-manager.js`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] `login()` 測試（成功/失敗）
  - [ ] `logout()` 測試
  - [ ] `checkSession()` 測試
  - [ ] `getCurrentUser()` 測試
  - [ ] 權限檢查測試
  - [ ] 帳號鎖定測試
  - [ ] 會話超時測試
- [ ] 測試覆蓋率 > 80%
- [ ] 代碼通過 linting
- [ ] 在 system.js 中導入並重新導出
- [ ] 驗證現有功能未受影響

### 1.5 storage-service.js

- [ ] 創建 `src/core/storage-service.js`
- [ ] 從 system.js 提取代碼 (L1206-1418)
- [ ] 添加 ES Module 導出
  - [ ] `export class StorageService`
  - [ ] `export async function createStorageService`
- [ ] 更新依賴
  - [ ] 導入 PouchDB（如果需要）
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] `init()` 測試
  - [ ] `addCheckpoint()` 測試
  - [ ] `getAllCheckpoints()` 測試
  - [ ] `updateCheckpoint()` 測試
  - [ ] `deleteCheckpoint()` 測試
  - [ ] `onChange()` 監聽器測試
  - [ ] 雲端同步測試（如果適用）
- [ ] 測試覆蓋率 > 80%
- [ ] 代碼通過 linting
- [ ] 在 system.js 中導入並重新導出
- [ ] 驗證現有功能未受影響

### 1.6 集成測試

- [ ] 核心服務間協作測試
- [ ] 登入流程集成測試
- [ ] 存儲和認證集成測試

### 1.7 文檔更新

- [ ] 更新 README.md（如需要）
- [ ] 更新 API 文檔
- [ ] 添加使用示例

### 1.8 階段驗收

- [ ] 所有核心服務模組已創建
- [ ] 所有模組可獨立導入
- [ ] 現有功能測試通過
- [ ] 單元測試覆蓋率 > 80%
- [ ] 代碼已通過 linting
- [ ] 無引入新的全局變數
- [ ] 代碼審查完成
- [ ] 分支合併到主線

---

## 階段 2: 提取工具函數

**目標**: 提取純工具函數和常數定義  
**時間**: 2-3 天  
**風險**: ⚡ 低風險

### 2.1 環境設置

- [ ] 創建 `src/utils/` 目錄
- [ ] 創建 `src/constants/` 目錄

### 2.2 dom-utils.js

- [ ] 創建 `src/utils/dom-utils.js`
- [ ] 從 system.js 提取 DOM 選擇器 (L48-50)
- [ ] 添加 ES Module 導出
  - [ ] `export const $`
  - [ ] `export const $q`
  - [ ] `export const $qa`
- [ ] 添加額外的 DOM 工具函數
  - [ ] `createElement()`
  - [ ] `addClass()`
  - [ ] `removeClass()`
  - [ ] `toggleClass()`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] `$()` 測試
  - [ ] `$q()` 測試
  - [ ] `$qa()` 測試
  - [ ] 其他工具函數測試
- [ ] 測試覆蓋率 > 90%
- [ ] 代碼通過 linting

### 2.3 formatters.js

- [ ] 創建 `src/utils/formatters.js`
- [ ] 從 system.js 提取格式化函數
- [ ] 添加 ES Module 導出
  - [ ] `export function formatDate`
  - [ ] `export function formatFileSize`
  - [ ] `export function formatNumber`
  - [ ] `export function formatTime`
  - [ ] `export function todayStr`
  - [ ] `export function relativeTime`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] 日期格式化測試
  - [ ] 文件大小格式化測試
  - [ ] 數字格式化測試
  - [ ] 邊界條件測試
- [ ] 測試覆蓋率 > 90%
- [ ] 代碼通過 linting

### 2.4 validators.js

- [ ] 創建 `src/utils/validators.js`
- [ ] 從 system.js 提取驗證函數
- [ ] 添加 ES Module 導出
  - [ ] `export function isValidEmail`
  - [ ] `export function isValidUsername`
  - [ ] `export function validatePasswordStrength`
  - [ ] `export function isValidDate`
  - [ ] `export function isInRange`
  - [ ] `export function isRequired`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] 電子郵件驗證測試
  - [ ] 用戶名驗證測試
  - [ ] 密碼強度測試
  - [ ] 各種邊界條件測試
- [ ] 測試覆蓋率 > 90%
- [ ] 代碼通過 linting

### 2.5 helpers.js

- [ ] 創建 `src/utils/helpers.js`
- [ ] 從 system.js 提取輔助函數 (L2346-2361)
- [ ] 添加 ES Module 導出
  - [ ] `export function escapeHtml`
  - [ ] `export function toast`
  - [ ] `export function deepClone`
  - [ ] `export function debounce`
  - [ ] `export function throttle`
  - [ ] `export function generateId`
  - [ ] `export function delay`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] HTML 轉義測試
  - [ ] Toast 通知測試
  - [ ] 深拷貝測試
  - [ ] 防抖/節流測試
- [ ] 測試覆蓋率 > 90%
- [ ] 代碼通過 linting

### 2.6 app-constants.js

- [ ] 創建 `src/constants/app-constants.js`
- [ ] 從 system.js 提取常數定義 (L24-51)
- [ ] 添加 ES Module 導出
  - [ ] `export const STORAGE_KEY`
  - [ ] `export const CLASS_PRESETS_KEY`
  - [ ] `export const SCORE_1_5_IDS`
  - [ ] `export const RANGE_IDS`
  - [ ] `export const OPTION_GROUPS`
  - [ ] `export const PAGE_TITLES`
  - [ ] `export const TRICK_LEVELS`
- [ ] 添加 JSDoc 註釋
- [ ] 驗證常數值正確
- [ ] 代碼通過 linting

### 2.7 更新引用

- [ ] 在 system.js 中更新所有工具函數引用
  - [ ] 導入工具模組
  - [ ] 重新導出到 window（向後兼容）
- [ ] 更新核心服務模組中的引用
  - [ ] storage-manager.js
  - [ ] login-manager.js
  - [ ] auth-config.js
- [ ] 測試所有更新的引用

### 2.8 集成測試

- [ ] 工具函數在其他模組中使用正常
- [ ] 常數在所有模組中可訪問

### 2.9 文檔更新

- [ ] 更新 API 文檔
- [ ] 添加使用示例
- [ ] 更新遷移指南

### 2.10 階段驗收

- [ ] 所有工具函數已提取
- [ ] 所有常數已提取
- [ ] 全局 $, $q, $qa 已替換為導入（在新代碼中）
- [ ] 所有引用已更新
- [ ] 測試通過
- [ ] JSDoc 文檔完整
- [ ] 代碼已通過 linting
- [ ] 代碼審查完成
- [ ] 分支合併到主線

---

## 階段 3: 提取數據服務

**目標**: 提取業務邏輯層服務  
**時間**: 4-6 天  
**風險**: ⚠️ 中風險

### 3.1 環境設置

- [ ] 創建 `src/services/` 目錄

### 3.2 records-service.js

- [ ] 創建 `src/services/records-service.js`
- [ ] 從 system.js 提取記錄服務代碼 (L2243-2343)
- [ ] 添加 ES Module 導出
  - [ ] `export const RecordsService`
- [ ] 實現完整 API
  - [ ] CRUD 操作
  - [ ] 批次操作
  - [ ] 查詢與過濾
  - [ ] 數據解析與保存
  - [ ] 統計功能
- [ ] 更新依賴
  - [ ] 導入 `storage-manager.js`
  - [ ] 導入 `storage-service.js`
  - [ ] 導入相關工具函數
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] `getAllRecords()` 測試
  - [ ] `getRecordById()` 測試
  - [ ] `createRecord()` 測試
  - [ ] `updateRecord()` 測試
  - [ ] `deleteRecord()` 測試
  - [ ] 批次操作測試
  - [ ] 查詢過濾測試
  - [ ] 解析保存測試
- [ ] 測試覆蓋率 > 85%
- [ ] 代碼通過 linting

### 3.3 presets-service.js

- [ ] 創建 `src/services/presets-service.js`
- [ ] 從 system.js 提取預設服務代碼 (L1459-1468)
- [ ] 添加 ES Module 導出
  - [ ] `export const PresetsService`
- [ ] 實現完整 API
  - [ ] CRUD 操作
  - [ ] 應用預設到表單
- [ ] 更新依賴
  - [ ] 導入 `storage-manager.js`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] 預設 CRUD 測試
  - [ ] 應用預設測試
- [ ] 測試覆蓋率 > 85%
- [ ] 代碼通過 linting

### 3.4 users-service.js

- [ ] 創建 `src/services/users-service.js`
- [ ] 從 system.js 提取用戶服務代碼 (L477-573)
- [ ] 添加 ES Module 導出
  - [ ] `export const UsersService`
- [ ] 實現完整 API
  - [ ] CRUD 操作
  - [ ] 用戶查詢
  - [ ] 憑證驗證
- [ ] 更新依賴
  - [ ] 導入 `auth-config.js`
  - [ ] 導入 `storage-manager.js`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] 用戶 CRUD 測試
  - [ ] 查詢測試
  - [ ] 憑證驗證測試
- [ ] 測試覆蓋率 > 85%
- [ ] 代碼通過 linting

### 3.5 validation-service.js

- [ ] 創建 `src/services/validation-service.js`
- [ ] 從 system.js 提取驗證服務代碼 (L1488-1501)
- [ ] 添加 ES Module 導出
  - [ ] `export const ValidationService`
- [ ] 實現完整 API
  - [ ] 表單驗證
  - [ ] 數據驗證
  - [ ] 錯誤顯示
- [ ] 更新依賴
  - [ ] 導入 `validators.js`
- [ ] 添加 JSDoc 註釋
- [ ] 編寫單元測試
  - [ ] 表單驗證測試
  - [ ] 記錄驗證測試
  - [ ] 用戶驗證測試
  - [ ] 錯誤顯示測試
- [ ] 測試覆蓋率 > 85%
- [ ] 代碼通過 linting

### 3.6 更新引用

- [ ] 在 system.js 中導入並重新導出服務
- [ ] 更新 UI 模組中的服務引用（如已存在）
- [ ] 測試所有更新的引用

### 3.7 集成測試

- [ ] 服務間協作測試
- [ ] 記錄完整流程測試（創建、讀取、更新、刪除）
- [ ] 數據一致性測試
- [ ] 錯誤處理測試

### 3.8 文檔更新

- [ ] 更新 API 文檔
- [ ] 添加服務使用示例
- [ ] 更新遷移指南

### 3.9 階段驗收

- [ ] 所有服務模組已創建
- [ ] API 接口已定義並實現
- [ ] 數據流正確
- [ ] 集成測試通過
- [ ] 無功能回歸
- [ ] 測試覆蓋率 > 85%
- [ ] 代碼已通過 linting
- [ ] 代碼審查完成
- [ ] 分支合併到主線

---

## 階段 4: 提取 UI 管理

**目標**: 提取 UI 層模組  
**時間**: 5-8 天  
**風險**: ⚠️⚠️ 中高風險

### 4.1 環境設置

- [ ] 創建 `src/ui/` 目錄

### 4.2 ui-manager.js

- [ ] 創建 `src/ui/ui-manager.js`
- [ ] 從 system.js 提取 UI 管理器代碼 (L1135-1204)
- [ ] 添加 ES Module 導出
  - [ ] `export const UI_MANAGER`
- [ ] 實現完整 API
  - [ ] 頁面導航
  - [ ] 載入指示器
  - [ ] Toast 通知
  - [ ] 響應式處理
  - [ ] 鍵盤快捷鍵
- [ ] 更新依賴
  - [ ] 導入 DOM 工具
  - [ ] 導入常數
- [ ] 添加 JSDoc 註釋
- [ ] 編寫測試
  - [ ] 頁面切換測試
  - [ ] 載入指示器測試
  - [ ] Toast 測試
- [ ] 代碼通過 linting

### 4.3 form-manager.js

- [ ] 創建 `src/ui/form-manager.js`
- [ ] 從 system.js 提取表單管理代碼 (L1909-2100)
- [ ] 添加 ES Module 導出
  - [ ] `export const FormManager`
- [ ] 實現完整 API
  - [ ] 表單數據操作
  - [ ] 表單驗證
  - [ ] 表單狀態管理
  - [ ] 編輯模式處理
- [ ] 更新依賴
  - [ ] 導入 DOM 工具
  - [ ] 導入驗證服務
- [ ] 添加 JSDoc 註釋
- [ ] 編寫測試
  - [ ] 表單數據讀取測試
  - [ ] 表單數據寫入測試
  - [ ] 表單驗證測試
  - [ ] 表單狀態測試
- [ ] 代碼通過 linting

### 4.4 list-renderer.js

- [ ] 創建 `src/ui/list-renderer.js`
- [ ] 從 system.js 提取列表渲染代碼 (L2543-2729)
- [ ] 添加 ES Module 導出
  - [ ] `export const ListRenderer`
- [ ] 實現完整 API
  - [ ] 列表渲染
  - [ ] 排序與過濾
  - [ ] 分頁處理
  - [ ] 搜索功能
- [ ] 更新依賴
  - [ ] 導入 DOM 工具
  - [ ] 導入格式化工具
  - [ ] 導入記錄服務
- [ ] 添加 JSDoc 註釋
- [ ] 編寫測試
  - [ ] 列表渲染測試
  - [ ] 排序測試
  - [ ] 過濾測試
  - [ ] 搜索測試
- [ ] 代碼通過 linting

### 4.5 modal-manager.js

- [ ] 創建 `src/ui/modal-manager.js`
- [ ] 從 system.js 提取模態窗口代碼 (L2732-2817)
- [ ] 添加 ES Module 導出
  - [ ] `export const ModalManager`
- [ ] 實現完整 API
  - [ ] 模態顯示/隱藏
  - [ ] 確認對話框
  - [ ] 警告對話框
  - [ ] 提示對話框
- [ ] 更新依賴
  - [ ] 導入 DOM 工具
- [ ] 添加 JSDoc 註釋
- [ ] 編寫測試
  - [ ] 模態顯示測試
  - [ ] 對話框測試
- [ ] 代碼通過 linting

### 4.6 tricks-manager.js

- [ ] 創建 `src/ui/tricks-manager.js`
- [ ] 從 system.js 提取花式管理代碼 (L1843-1885)
- [ ] 添加 ES Module 導出
  - [ ] `export const TricksManager`
- [ ] 實現完整 API
  - [ ] 花式添加/移除
  - [ ] 花式列表管理
  - [ ] 難度設置
- [ ] 更新依賴
  - [ ] 導入 DOM 工具
  - [ ] 導入常數
- [ ] 添加 JSDoc 註釋
- [ ] 編寫測試
  - [ ] 花式 CRUD 測試
  - [ ] 渲染測試
- [ ] 代碼通過 linting

### 4.7 attachments-manager.js

- [ ] 創建 `src/ui/attachments-manager.js`
- [ ] 從 system.js 提取附件管理代碼 (L2103-2240)
- [ ] 添加 ES Module 導出
  - [ ] `export const AttachmentsManager`
- [ ] 實現完整 API
  - [ ] 文件上傳
  - [ ] 文件預覽
  - [ ] 文件刪除
  - [ ] 文件驗證
- [ ] 更新依賴
  - [ ] 導入 DOM 工具
  - [ ] 導入格式化工具
  - [ ] 導入驗證工具
- [ ] 添加 JSDoc 註釋
- [ ] 編寫測試
  - [ ] 文件上傳測試
  - [ ] 文件驗證測試
  - [ ] 文件預覽測試
- [ ] 代碼通過 linting

### 4.8 更新引用

- [ ] 在 system.js 中導入並重新導出 UI 模組
- [ ] 更新事件處理器中的 UI 引用
- [ ] 測試所有更新的引用

### 4.9 集成測試

- [ ] UI 模組間協作測試
- [ ] 完整用戶流程測試
- [ ] 事件處理測試
- [ ] 響應式測試

### 4.10 手動測試

- [ ] 頁面導航功能
- [ ] 表單填寫和提交
- [ ] 列表顯示和操作
- [ ] 模態窗口功能
- [ ] 花式管理功能
- [ ] 附件上傳功能
- [ ] 所有按鈕和鏈接
- [ ] 錯誤處理和提示

### 4.11 文檔更新

- [ ] 更新 API 文檔
- [ ] 添加 UI 使用示例
- [ ] 更新遷移指南

### 4.12 階段驗收

- [ ] 所有 UI 模組已創建
- [ ] 事件綁定正確
- [ ] UI 響應正常
- [ ] 手動測試通過
- [ ] 無 UI 回歸
- [ ] 代碼已通過 linting
- [ ] 代碼審查完成
- [ ] 分支合併到主線

---

## 階段 5: 重組初始化邏輯

**目標**: 提取和重組應用初始化邏輯  
**時間**: 6-10 天  
**風險**: 🔥 高風險

### 5.1 環境設置

- [ ] 創建 `src/init/` 目錄

### 5.2 app-init.js

- [ ] 創建 `src/init/app-init.js`
- [ ] 從 system.js 提取主應用初始化代碼
- [ ] 添加 ES Module 導出
  - [ ] `export async function initializeApp`
  - [ ] `export async function initializeServices`
  - [ ] `export async function initializeUI`
  - [ ] `export function checkSession`
- [ ] 實現初始化流程
  - [ ] 服務初始化順序
  - [ ] UI 初始化
  - [ ] 會話檢查
  - [ ] 錯誤處理
- [ ] 更新依賴
  - [ ] 導入所有核心服務
  - [ ] 導入 UI 管理器
- [ ] 添加 JSDoc 註釋
- [ ] 編寫測試
  - [ ] 初始化流程測試
  - [ ] 錯誤處理測試
- [ ] 代碼通過 linting

### 5.3 login-page-init.js

- [ ] 創建 `src/init/login-page-init.js`
- [ ] 從 system.js 提取登入頁初始化代碼
- [ ] 添加 ES Module 導出
  - [ ] `export function initLoginPage`
  - [ ] `export function setupLoginForm`
  - [ ] `export function setupSignupForm`
  - [ ] `export function ensureDefaultUser`
- [ ] 實現初始化流程
  - [ ] 登入表單設置
  - [ ] 註冊表單設置
  - [ ] 預設用戶創建
- [ ] 更新依賴
  - [ ] 導入登入管理器
  - [ ] 導入用戶服務
- [ ] 添加 JSDoc 註釋
- [ ] 編寫測試
  - [ ] 登入頁初始化測試
  - [ ] 表單設置測試
- [ ] 代碼通過 linting

### 5.4 event-bindings.js

- [ ] 創建 `src/init/event-bindings.js`
- [ ] 從 system.js 拆分事件綁定代碼 (L2837-3230)
- [ ] 按功能組織事件綁定
  - [ ] 表單事件
  - [ ] 按鈕事件
  - [ ] 導航事件
  - [ ] 搜索事件
  - [ ] 其他 UI 事件
- [ ] 添加 ES Module 導出
  - [ ] `export function bindAllEvents`
  - [ ] `export function bindFormEvents`
  - [ ] `export function bindButtonEvents`
  - [ ] `export function bindNavigationEvents`
  - [ ] `export function bindSearchEvents`
- [ ] 更新依賴
  - [ ] 導入所有 UI 管理器
  - [ ] 導入服務
- [ ] 添加 JSDoc 註釋
- [ ] 測試所有事件綁定
- [ ] 代碼通過 linting

### 5.5 main.js

- [ ] 創建 `src/main.js`（入口文件）
- [ ] 從所有模組導入
  - [ ] 核心服務
  - [ ] 數據服務
  - [ ] UI 管理
  - [ ] 工具函數
  - [ ] 常數
  - [ ] 初始化函數
- [ ] 重新導出所有公開 API
- [ ] 綁定到 window 對象（向後兼容）
- [ ] 添加版本信息
- [ ] 添加初始化日志
- [ ] 代碼通過 linting

### 5.6 更新 HTML 文件

#### index.html
- [ ] 更新 script 引用
- [ ] 改為使用 `type="module"`
- [ ] 導入 `main.js` 和初始化函數
- [ ] 測試頁面加載

#### login.html
- [ ] 更新 script 引用
- [ ] 改為使用 `type="module"`
- [ ] 導入登入頁初始化
- [ ] 測試登入流程

### 5.7 system.js 處理

選項 A: 保留作為遺留兼容層
- [ ] 清理 system.js，只保留導入和重新導出
- [ ] 添加棄用警告
- [ ] 文檔說明遺留狀態

選項 B: 完全移除
- [ ] 確認所有引用已更新
- [ ] 刪除 system.js
- [ ] 更新構建配置

### 5.8 集成測試

- [ ] 應用啟動流程測試
- [ ] 登入流程完整測試
- [ ] 所有頁面導航測試
- [ ] 所有事件處理器測試
- [ ] 錯誤處理測試

### 5.9 手動測試

- [ ] 應用啟動正常
- [ ] 登入功能正常
- [ ] 所有頁面可訪問
- [ ] 所有功能可用
- [ ] 錯誤提示正常
- [ ] 性能無明顯下降

### 5.10 文檔更新

- [ ] 更新入口點文檔
- [ ] 更新初始化流程文檔
- [ ] 更新遷移指南

### 5.11 階段驗收

- [ ] 初始化模組已創建
- [ ] 事件綁定已拆分
- [ ] main.js 正確組裝所有模組
- [ ] 應用啟動正常
- [ ] 所有功能可用
- [ ] 完整的 E2E 測試通過
- [ ] 代碼已通過 linting
- [ ] 代碼審查完成
- [ ] 分支合併到主線

---

## 階段 6: 整合與測試

**目標**: 完成整合，全面測試，優化性能  
**時間**: 5-7 天  
**風險**: 🎯 關鍵階段

### 6.1 代碼清理

- [ ] 移除或重構 system.js（根據階段 5 決定）
- [ ] 移除未使用的代碼
- [ ] 移除未使用的註釋
- [ ] 統一代碼風格
- [ ] 運行 linter 並修復所有問題

### 6.2 依賴優化

- [ ] 檢查並移除未使用的依賴
- [ ] 更新過時的依賴
- [ ] 優化導入路徑
- [ ] 檢查循環依賴

### 6.3 構建配置

#### Vite 配置
- [ ] 配置代碼分割
- [ ] 配置資源優化
- [ ] 配置壓縮
- [ ] 配置 source map
- [ ] 測試構建輸出

#### HTML 更新
- [ ] 確認所有 HTML 引用正確
- [ ] 更新 script 標籤
- [ ] 測試生產構建

### 6.4 測試套件完善

#### 單元測試
- [ ] 確保所有模組有測試
- [ ] 測試覆蓋率 > 85%
- [ ] 所有測試通過
- [ ] 修復失敗的測試

#### 集成測試
- [ ] 添加缺失的集成測試
- [ ] 測試關鍵業務流程
- [ ] 所有集成測試通過

#### E2E 測試
- [ ] 添加 E2E 測試套件
- [ ] 測試主要用戶流程
  - [ ] 登入/登出
  - [ ] 創建記錄
  - [ ] 編輯記錄
  - [ ] 刪除記錄
  - [ ] 搜索和過濾
  - [ ] 附件上傳
- [ ] 所有 E2E 測試通過

### 6.5 性能測試

- [ ] 測量首次加載時間
- [ ] 測量操作響應時間
- [ ] 測量內存使用
- [ ] 與舊版本對比
- [ ] 識別性能瓶頸
- [ ] 實施性能優化
  - [ ] 懶加載
  - [ ] 代碼分割
  - [ ] 資源壓縮
  - [ ] 緩存策略

### 6.6 兼容性測試

- [ ] 測試向後兼容
- [ ] 測試不同瀏覽器
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] 測試不同設備
  - [ ] 桌面
  - [ ] 平板
  - [ ] 手機

### 6.7 安全審查

- [ ] 代碼安全掃描
- [ ] 依賴安全檢查
- [ ] XSS 防護驗證
- [ ] CSRF 防護驗證
- [ ] 敏感數據處理檢查

### 6.8 文檔完善

- [ ] 更新 README.md
- [ ] 更新 API 文檔
- [ ] 更新架構圖
- [ ] 添加遷移完成說明
- [ ] 添加升級指南
- [ ] 記錄已知問題

### 6.9 部署準備

- [ ] 創建部署腳本
- [ ] 準備回滾策略
- [ ] 準備監控方案
- [ ] 通知相關人員

### 6.10 生產環境驗證

- [ ] 在測試環境部署
- [ ] 完整功能測試
- [ ] 性能測試
- [ ] 收集反饋
- [ ] 修復發現的問題
- [ ] 在生產環境部署
- [ ] 監控運行狀態
- [ ] 準備快速響應問題

### 6.11 階段驗收

- [ ] system.js 已重構或移除
- [ ] 所有 HTML 引用已更新
- [ ] Vite 構建成功
- [ ] 測試覆蓋率 > 85%
- [ ] 所有測試通過（單元、集成、E2E）
- [ ] 性能測試通過（無退化）
- [ ] 兼容性測試通過
- [ ] 安全審查通過
- [ ] 文檔已更新
- [ ] 生產環境驗證通過
- [ ] 代碼審查完成
- [ ] 分支合併到主線
- [ ] 發布新版本

---

## 總體驗收標準

### 代碼質量

- [ ] 平均模組大小 < 500 行
- [ ] 代碼重複率 < 5%
- [ ] 測試覆蓋率 > 85%
- [ ] Linting 通過率 100%
- [ ] 複雜度評分 < C
- [ ] 無循環依賴
- [ ] 無未使用的代碼

### 功能完整性

- [ ] 所有現有功能正常工作
- [ ] 無功能回歸
- [ ] 向後兼容（如需要）
- [ ] 錯誤處理完善
- [ ] 用戶體驗無下降

### 性能指標

- [ ] 首次加載時間無增加
- [ ] 內存使用無明顯增加
- [ ] 操作響應時間無退化
- [ ] 構建時間合理

### 開發體驗

- [ ] 新功能開發更容易
- [ ] Bug 修復更快速
- [ ] 代碼審查更高效
- [ ] 新開發者上手更容易

### 文檔完整性

- [ ] 架構文檔完整
- [ ] API 文檔完整
- [ ] 遷移指南完整
- [ ] 使用示例充足
- [ ] 已知問題已記錄

### 部署就緒

- [ ] 構建流程正常
- [ ] 部署腳本就緒
- [ ] 監控方案就緒
- [ ] 回滾策略就緒
- [ ] 團隊培訓完成

---

## 持續改進

### 定期審查（每月）

- [ ] 審查模組邊界是否合理
- [ ] 審查測試覆蓋率
- [ ] 審查性能指標
- [ ] 收集開發者反饋
- [ ] 識別優化機會

### 技術債務管理

- [ ] 記錄已知技術債務
- [ ] 優先級排序
- [ ] 制定償還計劃
- [ ] 定期償還

### 最佳實踐採納

- [ ] 關注新的最佳實踐
- [ ] 評估適用性
- [ ] 實施改進
- [ ] 更新文檔

---

## 版本歷史

| 版本 | 日期 | 變更說明 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-02-16 | 初始版本，完整檢查清單 | GitHub Copilot |

---

**文檔結束**

---

## 使用說明

1. **如何使用此檢查清單**:
   - 在開始每個階段前，複習該階段的所有項目
   - 完成每個項目後，將 `- [ ]` 改為 `- [x]`
   - 定期審查進度，確保按計劃進行

2. **當遇到問題時**:
   - 參考 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) 尋找解決方案
   - 參考 [MODULE_API_DESIGN.md](./MODULE_API_DESIGN.md) 確認 API 設計
   - 參考 [MODULARIZATION_ARCHITECTURE.md](./MODULARIZATION_ARCHITECTURE.md) 理解整體架構

3. **代碼審查**:
   - 每個階段完成後進行代碼審查
   - 重點關注模組邊界、依賴關係和測試覆蓋

4. **測試策略**:
   - 每個模組遷移後立即測試
   - 階段結束時進行完整集成測試
   - 最終階段進行全面的 E2E 測試

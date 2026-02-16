# System.js 模組 API 設計文檔

## 📋 文檔概覽

本文檔詳細定義每個計劃模組的公開 API，包括函數簽名、參數類型、返回值和使用示例。

**文檔版本**: v1.0  
**創建日期**: 2026-02-16  
**依賴**: 參考 MODULARIZATION_ARCHITECTURE.md

---

## 目錄

1. [核心服務 API](#1-核心服務-api)
2. [數據服務 API](#2-數據服務-api)
3. [UI 管理 API](#3-ui-管理-api)
4. [工具函數 API](#4-工具函數-api)
5. [常數定義](#5-常數定義)
6. [初始化 API](#6-初始化-api)

---

## 1. 核心服務 API

### 1.1 storage-manager.js

**路徑**: `src/core/storage-manager.js`  
**職責**: 管理本地存儲、緩存、備份和跨標籤頁同步

#### 導出接口

```javascript
export const STORAGE_MANAGER = {
  // ===== 配置 =====
  KEYS: {
    CHECKPOINTS: string,
    PRESETS: string,
    SESSION: string,
    CURRENT_USER: string,
    USERS: string,
    BACKUP_TIMESTAMP: string
  },
  
  CONFIG: {
    MAX_RETRIES: number,
    STORAGE_QUOTA: number,
    AUTO_BACKUP_INTERVAL: number,
    COMPRESSION_THRESHOLD: number
  },
  
  // ===== 初始化 =====
  /**
   * 初始化存儲管理器
   * @returns {Promise<boolean>} 初始化是否成功
   */
  init(): Promise<boolean>,
  
  // ===== 基礎存儲操作 =====
  /**
   * 測試 localStorage 是否可用
   * @throws {Error} 如果存儲不可用
   */
  testLocalStorage(): void,
  
  /**
   * 設置存儲項
   * @param {string} key - 存儲鍵
   * @param {any} value - 要存儲的值（會自動 JSON.stringify）
   * @param {Object} options - 可選配置
   * @param {number} options.ttl - 過期時間（毫秒）
   * @returns {boolean} 是否成功
   */
  setItem(key: string, value: any, options?: { ttl?: number }): boolean,
  
  /**
   * 獲取存儲項
   * @param {string} key - 存儲鍵
   * @param {any} defaultValue - 默認值
   * @returns {any} 存儲的值或默認值
   */
  getItem(key: string, defaultValue?: any): any,
  
  /**
   * 移除存儲項
   * @param {string} key - 存儲鍵
   * @returns {boolean} 是否成功
   */
  removeItem(key: string): boolean,
  
  /**
   * 清除所有數據（需用戶確認）
   * @returns {boolean} 是否成功
   */
  clearAll(): boolean,
  
  // ===== 緩存管理 =====
  /**
   * 設置緩存
   * @param {string} key - 緩存鍵
   * @param {any} data - 緩存數據
   * @param {number} ttl - 過期時間（毫秒）
   */
  setCache(key: string, data: any, ttl?: number): void,
  
  /**
   * 獲取緩存
   * @param {string} key - 緩存鍵
   * @returns {any|null} 緩存數據或 null（如果過期）
   */
  getCache(key: string): any | null,
  
  /**
   * 清除過期緩存
   */
  clearExpiredCache(): void,
  
  /**
   * 加載快取到內存
   * @returns {Promise<void>}
   */
  loadCache(): Promise<void>,
  
  // ===== 備份與還原 =====
  /**
   * 導出備份
   * @returns {Blob} 包含所有數據的 JSON Blob
   */
  exportBackup(): Blob,
  
  /**
   * 導入備份
   * @param {File} file - 備份文件
   * @returns {Promise<void>}
   * @throws {Error} 如果文件無效
   */
  importBackup(file: File): Promise<void>,
  
  /**
   * 啟動自動備份
   */
  startAutoBackup(): void,
  
  /**
   * 停止自動備份
   */
  stopAutoBackup(): void,
  
  // ===== 跨標籤頁同步 =====
  /**
   * 設置跨標籤頁同步
   */
  setupSync(): void,
  
  /**
   * 廣播變更到其他標籤頁
   * @param {string} key - 變更的鍵
   */
  broadcastChange(key: string): void,
  
  /**
   * 監聽存儲變更
   * @param {Function} callback - 回調函數
   * @returns {Function} 取消監聽的函數
   */
  onStorageChange(callback: (event: StorageEvent) => void): () => void,
  
  // ===== 統計信息 =====
  /**
   * 獲取存儲統計
   * @returns {Object} 統計信息
   */
  getStats(): {
    totalSize: string,
    details: Record<string, string>,
    usage: string
  }
};
```

#### 使用示例

```javascript
import { STORAGE_MANAGER } from '@/core/storage-manager.js';

// 初始化
await STORAGE_MANAGER.init();

// 基礎操作
STORAGE_MANAGER.setItem('myKey', { data: 'value' });
const data = STORAGE_MANAGER.getItem('myKey');
STORAGE_MANAGER.removeItem('myKey');

// 緩存操作
STORAGE_MANAGER.setCache('userList', users, 60000); // 1 分鐘 TTL
const cachedUsers = STORAGE_MANAGER.getCache('userList');

// 備份
const backup = STORAGE_MANAGER.exportBackup();
await STORAGE_MANAGER.importBackup(file);

// 監聽變更
const unsubscribe = STORAGE_MANAGER.onStorageChange((event) => {
  console.log('Storage changed:', event.key);
});
```

---

### 1.2 login-manager.js

**路徑**: `src/core/login-manager.js`  
**職責**: 處理用戶認證、會話管理和權限控制

#### 導出接口

```javascript
export const LOGIN_MANAGER = {
  // ===== 安全配置 =====
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: number,
    LOCKOUT_DURATION: number,
    SESSION_TIMEOUT: number,
    PASSWORD_MIN_LENGTH: number
  },
  
  // ===== 初始化 =====
  /**
   * 初始化登入管理器
   * @returns {boolean} 初始化是否成功
   */
  init(): boolean,
  
  // ===== 認證操作 =====
  /**
   * 用戶登入
   * @param {string} username - 用戶名
   * @param {string} password - 密碼
   * @returns {Promise<User>} 用戶對象
   * @throws {Error} 如果認證失敗
   */
  login(username: string, password: string): Promise<User>,
  
  /**
   * 用戶登出
   */
  logout(): void,
  
  /**
   * 檢查是否已登入
   * @returns {boolean} 是否已登入
   */
  isLoggedIn(): boolean,
  
  /**
   * 檢查會話有效性
   * @returns {boolean} 會話是否有效
   */
  checkSession(): boolean,
  
  // ===== 用戶會話 =====
  /**
   * 獲取當前用戶
   * @returns {User|null} 當前用戶或 null
   */
  getCurrentUser(): User | null,
  
  /**
   * 設置當前用戶
   * @param {User} user - 用戶對象
   */
  setCurrentUser(user: User): void,
  
  /**
   * 更新會話過期時間
   */
  refreshSession(): void,
  
  /**
   * 設置會話超時處理
   */
  setupSessionTimeout(): void,
  
  // ===== 權限檢查 =====
  /**
   * 檢查用戶是否有指定權限
   * @param {string} permission - 權限名稱
   * @returns {boolean} 是否有權限
   */
  hasPermission(permission: string): boolean,
  
  /**
   * 檢查用戶是否為管理員
   * @returns {boolean} 是否為管理員
   */
  isAdmin(): boolean,
  
  /**
   * 檢查用戶是否為創建者
   * @returns {boolean} 是否為創建者
   */
  isCreator(): boolean,
  
  /**
   * 要求管理員權限（否則拋出異常）
   * @throws {Error} 如果不是管理員
   */
  requireAdmin(): void,
  
  // ===== 安全機制 =====
  /**
   * 檢查帳號是否被鎖定
   * @param {string} username - 用戶名
   * @returns {boolean} 是否被鎖定
   */
  isAccountLocked(username: string): boolean,
  
  /**
   * 記錄登入失敗
   * @param {string} username - 用戶名
   */
  recordFailedAttempt(username: string): void,
  
  /**
   * 清除登入嘗試記錄
   * @param {string} username - 用戶名
   */
  clearLoginAttempts(username: string): void
};

/**
 * 用戶類型定義
 * @typedef {Object} User
 * @property {string} id - 用戶 ID
 * @property {string} username - 用戶名
 * @property {string} email - 電子郵件
 * @property {string} role - 角色 (creator|admin|user)
 * @property {string} passwordHash - 密碼雜湊
 * @property {string} createdAt - 創建時間
 */
```

#### 使用示例

```javascript
import { LOGIN_MANAGER } from '@/core/login-manager.js';

// 初始化
LOGIN_MANAGER.init();

// 登入
try {
  const user = await LOGIN_MANAGER.login('username', 'password');
  console.log('登入成功:', user);
} catch (error) {
  console.error('登入失敗:', error.message);
}

// 檢查權限
if (LOGIN_MANAGER.isLoggedIn()) {
  const user = LOGIN_MANAGER.getCurrentUser();
  if (LOGIN_MANAGER.isCreator()) {
    // 執行創建者特權操作
  }
}

// 登出
LOGIN_MANAGER.logout();
```

---

### 1.3 auth-config.js

**路徑**: `src/core/auth-config.js`  
**職責**: 認證配置、密碼處理和用戶數據管理

#### 導出接口

```javascript
/**
 * 認證配置常數
 */
export const AUTH_CONFIG = {
  STORAGE_KEY: string,
  SESSION_KEY: string,
  USER_DB_KEY: string,
  SESSION_TIMEOUT: number,
  PASSWORD_MIN_LENGTH: number
};

/**
 * 用戶存儲鍵
 */
export const USER_STORAGE_KEY: string;

/**
 * 舊版用戶鍵（用於遷移）
 */
export const LEGACY_USER_KEY: string;

/**
 * 被阻擋的用戶名列表
 */
export const BLOCKED_USERNAMES: string[];

/**
 * 密碼雜湊函數（與舊版兼容）
 * @param {string} password - 明文密碼
 * @returns {string} 雜湊值
 */
export function hashPasswordCompat(password: string): string;

/**
 * 從存儲加載用戶（含自動遷移）
 * @returns {User[]} 用戶列表
 */
export function loadUsersFromStorage(): User[];

/**
 * 保存用戶到存儲
 * @param {User[]} users - 用戶列表
 */
export function saveUsersToStorage(users: User[]): void;

/**
 * 驗證用戶名是否合法
 * @param {string} username - 用戶名
 * @returns {boolean} 是否合法
 */
export function validateUsername(username: string): boolean;

/**
 * 驗證密碼強度
 * @param {string} password - 密碼
 * @returns {Object} 驗證結果
 */
export function validatePassword(password: string): {
  valid: boolean,
  message?: string
};
```

#### 使用示例

```javascript
import { 
  AUTH_CONFIG, 
  hashPasswordCompat, 
  loadUsersFromStorage,
  saveUsersToStorage 
} from '@/core/auth-config.js';

// 加載用戶
const users = loadUsersFromStorage();

// 創建新用戶
const newUser = {
  id: `user_${Date.now()}`,
  username: 'newuser',
  passwordHash: hashPasswordCompat('password123'),
  email: 'user@example.com',
  role: 'user',
  createdAt: new Date().toISOString()
};

users.push(newUser);
saveUsersToStorage(users);
```

---

### 1.4 storage-service.js

**路徑**: `src/core/storage-service.js`  
**職責**: PouchDB 封裝，提供雲端同步能力

#### 導出接口

```javascript
/**
 * PouchDB 儲存服務類
 */
export class StorageService {
  /**
   * 構造函數
   */
  constructor();
  
  /**
   * 初始化儲存服務
   * @param {PouchDB} database - PouchDB 實例
   * @param {string} remoteURL - 遠程數據庫 URL（可選）
   * @returns {Promise<void>}
   */
  async init(database: PouchDB, remoteURL?: string): Promise<void>;
  
  /**
   * 添加 checkpoint
   * @param {Object} checkpointData - Checkpoint 數據
   * @returns {Promise<Object>} 創建的 checkpoint
   */
  async addCheckpoint(checkpointData: Object): Promise<Object>;
  
  /**
   * 獲取所有 checkpoints
   * @returns {Promise<Object[]>} Checkpoint 列表
   */
  async getAllCheckpoints(): Promise<Object[]>;
  
  /**
   * 獲取單個 checkpoint
   * @param {string} id - Checkpoint ID
   * @returns {Promise<Object|null>} Checkpoint 或 null
   */
  async getCheckpoint(id: string): Promise<Object | null>;
  
  /**
   * 更新 checkpoint
   * @param {string} id - Checkpoint ID
   * @param {Object} updates - 更新數據
   * @returns {Promise<Object>} 更新後的 checkpoint
   */
  async updateCheckpoint(id: string, updates: Object): Promise<Object>;
  
  /**
   * 刪除 checkpoint
   * @param {string} id - Checkpoint ID
   * @returns {Promise<void>}
   */
  async deleteCheckpoint(id: string): Promise<void>;
  
  /**
   * 監聽數據變更
   * @param {Function} callback - 回調函數
   * @returns {Function} 取消監聽的函數
   */
  onChange(callback: (change: Object) => void): () => void;
  
  /**
   * 停止變更監聽
   */
  stopChangesFeed(): void;
  
  /**
   * 關閉數據庫連接
   * @returns {Promise<void>}
   */
  async close(): Promise<void>;
}

/**
 * 創建並初始化 StorageService 實例
 * @param {string} dbName - 數據庫名稱
 * @param {string} remoteURL - 遠程 URL（可選）
 * @returns {Promise<StorageService>}
 */
export async function createStorageService(
  dbName: string, 
  remoteURL?: string
): Promise<StorageService>;
```

#### 使用示例

```javascript
import { StorageService } from '@/core/storage-service.js';
import PouchDB from 'pouchdb';

// 創建實例
const db = new PouchDB('checkpoints');
const storage = new StorageService();
await storage.init(db, 'https://example.com/db');

// 添加記錄
const checkpoint = await storage.addCheckpoint({
  date: '2026-02-16',
  class: '5A',
  teacher: 'John'
});

// 獲取所有記錄
const all = await storage.getAllCheckpoints();

// 監聽變更
const unsubscribe = storage.onChange((change) => {
  console.log('Data changed:', change);
});

// 清理
await storage.close();
```

---

## 2. 數據服務 API

### 2.1 records-service.js

**路徑**: `src/services/records-service.js`  
**職責**: 課堂記錄的 CRUD 操作和查詢

#### 導出接口

```javascript
/**
 * 課堂記錄服務
 */
export const RecordsService = {
  // ===== CRUD 操作 =====
  /**
   * 獲取所有記錄
   * @returns {Promise<Record[]>} 記錄列表
   */
  getAllRecords(): Promise<Record[]>,
  
  /**
   * 根據 ID 獲取記錄
   * @param {string} id - 記錄 ID
   * @returns {Promise<Record|null>} 記錄或 null
   */
  getRecordById(id: string): Promise<Record | null>,
  
  /**
   * 創建新記錄
   * @param {RecordData} data - 記錄數據
   * @returns {Promise<Record>} 創建的記錄
   */
  createRecord(data: RecordData): Promise<Record>,
  
  /**
   * 更新記錄
   * @param {string} id - 記錄 ID
   * @param {Partial<RecordData>} data - 更新數據
   * @returns {Promise<Record>} 更新後的記錄
   */
  updateRecord(id: string, data: Partial<RecordData>): Promise<Record>,
  
  /**
   * 刪除記錄
   * @param {string} id - 記錄 ID
   * @returns {Promise<void>}
   */
  deleteRecord(id: string): Promise<void>,
  
  // ===== 批次操作 =====
  /**
   * 批次創建記錄
   * @param {RecordData[]} records - 記錄數據數組
   * @returns {Promise<Record[]>} 創建的記錄列表
   */
  bulkCreate(records: RecordData[]): Promise<Record[]>,
  
  /**
   * 批次刪除記錄
   * @param {string[]} ids - 記錄 ID 數組
   * @returns {Promise<void>}
   */
  bulkDelete(ids: string[]): Promise<void>,
  
  // ===== 查詢與過濾 =====
  /**
   * 根據班級過濾
   * @param {string} className - 班級名稱
   * @returns {Promise<Record[]>} 過濾後的記錄
   */
  filterByClass(className: string): Promise<Record[]>,
  
  /**
   * 根據日期範圍過濾
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Record[]>} 過濾後的記錄
   */
  filterByDate(startDate: Date, endDate: Date): Promise<Record[]>,
  
  /**
   * 根據教師過濾
   * @param {string} teacherId - 教師 ID
   * @returns {Promise<Record[]>} 過濾後的記錄
   */
  filterByTeacher(teacherId: string): Promise<Record[]>,
  
  /**
   * 搜索記錄
   * @param {string} query - 搜索關鍵字
   * @returns {Promise<Record[]>} 搜索結果
   */
  search(query: string): Promise<Record[]>,
  
  // ===== 數據解析與保存 =====
  /**
   * 解析存儲中的記錄
   * @returns {Record[]} 解析後的記錄數組
   */
  parseRecords(): Record[],
  
  /**
   * 保存記錄到存儲
   * @param {Record[]} records - 記錄數組
   * @returns {boolean} 是否成功
   */
  saveRecords(records: Record[]): boolean,
  
  // ===== 統計 =====
  /**
   * 獲取記錄統計
   * @returns {Object} 統計信息
   */
  getStats(): {
    total: number,
    byClass: Record<string, number>,
    byTeacher: Record<string, number>,
    byDate: Record<string, number>
  }
};

/**
 * 記錄類型定義
 * @typedef {Object} Record
 * @property {string} id - 記錄 ID
 * @property {string} date - 日期
 * @property {string} class - 班級
 * @property {string} teacher - 教師
 * @property {Object} scores - 評分
 * @property {string[]} tricks - 花式列表
 * @property {Object[]} attachments - 附件
 * @property {string} createdAt - 創建時間
 * @property {string} updatedAt - 更新時間
 */

/**
 * 記錄數據類型（用於創建/更新）
 * @typedef {Object} RecordData
 * @property {string} date - 日期
 * @property {string} class - 班級
 * @property {string} teacher - 教師
 * @property {Object} scores - 評分
 * @property {string[]} tricks - 花式列表
 * @property {Object[]} attachments - 附件
 */
```

#### 使用示例

```javascript
import { RecordsService } from '@/services/records-service.js';

// 獲取所有記錄
const records = await RecordsService.getAllRecords();

// 創建新記錄
const newRecord = await RecordsService.createRecord({
  date: '2026-02-16',
  class: '5A',
  teacher: 'John',
  scores: { engagement: 4, mastery: 5 },
  tricks: ['單腳跳', '交叉跳'],
  attachments: []
});

// 更新記錄
await RecordsService.updateRecord(newRecord.id, {
  scores: { engagement: 5, mastery: 5 }
});

// 查詢
const classRecords = await RecordsService.filterByClass('5A');
const searchResults = await RecordsService.search('跳繩');

// 統計
const stats = RecordsService.getStats();
console.log(`總記錄數: ${stats.total}`);
```

---

### 2.2 presets-service.js

**路徑**: `src/services/presets-service.js`  
**職責**: 班級預設模板管理

#### 導出接口

```javascript
/**
 * 預設服務
 */
export const PresetsService = {
  /**
   * 獲取所有預設
   * @returns {Preset[]} 預設列表
   */
  getAllPresets(): Preset[],
  
  /**
   * 根據 ID 獲取預設
   * @param {string} id - 預設 ID
   * @returns {Preset|null} 預設或 null
   */
  getPresetById(id: string): Preset | null,
  
  /**
   * 根據班級名稱獲取預設
   * @param {string} className - 班級名稱
   * @returns {Preset|null} 預設或 null
   */
  getPresetByClass(className: string): Preset | null,
  
  /**
   * 創建預設
   * @param {PresetData} data - 預設數據
   * @returns {Preset} 創建的預設
   */
  createPreset(data: PresetData): Preset,
  
  /**
   * 更新預設
   * @param {string} id - 預設 ID
   * @param {Partial<PresetData>} data - 更新數據
   * @returns {Preset} 更新後的預設
   */
  updatePreset(id: string, data: Partial<PresetData>): Preset,
  
  /**
   * 刪除預設
   * @param {string} id - 預設 ID
   * @returns {boolean} 是否成功
   */
  deletePreset(id: string): boolean,
  
  /**
   * 應用預設到表單
   * @param {string} presetId - 預設 ID
   * @param {HTMLFormElement} formElement - 表單元素
   */
  applyPresetToForm(presetId: string, formElement: HTMLFormElement): void
};

/**
 * 預設類型定義
 * @typedef {Object} Preset
 * @property {string} id - 預設 ID
 * @property {string} className - 班級名稱
 * @property {Object} defaultScores - 默認評分
 * @property {string[]} defaultTricks - 默認花式
 * @property {string} createdAt - 創建時間
 */
```

---

### 2.3 users-service.js

**路徑**: `src/services/users-service.js`  
**職責**: 用戶數據管理

#### 導出接口

```javascript
/**
 * 用戶服務
 */
export const UsersService = {
  /**
   * 獲取所有用戶
   * @returns {User[]} 用戶列表
   */
  getAllUsers(): User[],
  
  /**
   * 根據 ID 獲取用戶
   * @param {string} id - 用戶 ID
   * @returns {User|null} 用戶或 null
   */
  getUserById(id: string): User | null,
  
  /**
   * 根據用戶名獲取用戶
   * @param {string} username - 用戶名
   * @returns {User|null} 用戶或 null
   */
  getUserByUsername(username: string): User | null,
  
  /**
   * 創建用戶
   * @param {UserData} data - 用戶數據
   * @returns {User} 創建的用戶
   */
  createUser(data: UserData): User,
  
  /**
   * 更新用戶
   * @param {string} id - 用戶 ID
   * @param {Partial<UserData>} data - 更新數據
   * @returns {User} 更新後的用戶
   */
  updateUser(id: string, data: Partial<UserData>): User,
  
  /**
   * 刪除用戶
   * @param {string} id - 用戶 ID
   * @returns {boolean} 是否成功
   */
  deleteUser(id: string): boolean,
  
  /**
   * 驗證用戶憑證
   * @param {string} username - 用戶名
   * @param {string} password - 密碼
   * @returns {User|null} 用戶或 null
   */
  validateCredentials(username: string, password: string): User | null
};
```

---

### 2.4 validation-service.js

**路徑**: `src/services/validation-service.js`  
**職責**: 表單和數據驗證

#### 導出接口

```javascript
/**
 * 驗證服務
 */
export const ValidationService = {
  /**
   * 驗證表單
   * @param {HTMLFormElement} formElement - 表單元素
   * @returns {ValidationResult} 驗證結果
   */
  validateForm(formElement: HTMLFormElement): ValidationResult,
  
  /**
   * 驗證記錄數據
   * @param {RecordData} data - 記錄數據
   * @returns {ValidationResult} 驗證結果
   */
  validateRecord(data: RecordData): ValidationResult,
  
  /**
   * 驗證用戶數據
   * @param {UserData} data - 用戶數據
   * @returns {ValidationResult} 驗證結果
   */
  validateUser(data: UserData): ValidationResult,
  
  /**
   * 顯示驗證錯誤
   * @param {ValidationError[]} errors - 錯誤列表
   */
  showValidationErrors(errors: ValidationError[]): void,
  
  /**
   * 清除驗證錯誤顯示
   */
  clearValidationErrors(): void
};

/**
 * 驗證結果類型
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - 是否有效
 * @property {ValidationError[]} errors - 錯誤列表
 */

/**
 * 驗證錯誤類型
 * @typedef {Object} ValidationError
 * @property {string} field - 字段名
 * @property {string} message - 錯誤消息
 */
```

---

## 3. UI 管理 API

### 3.1 ui-manager.js

**路徑**: `src/ui/ui-manager.js`  
**職責**: UI 狀態管理、頁面導航、載入指示器

#### 導出接口

```javascript
/**
 * UI 管理器
 */
export const UI_MANAGER = {
  CONFIG: {
    ANIMATION_DURATION: number,
    TOAST_DURATION: number,
    LOAD_TIMEOUT: number
  },
  
  /**
   * 初始化 UI 管理器
   * @returns {boolean} 是否成功
   */
  init(): boolean,
  
  // ===== 頁面導航 =====
  /**
   * 切換頁面
   * @param {string} pageName - 頁面名稱
   */
  showPage(pageName: string): void,
  
  /**
   * 獲取當前頁面
   * @returns {string} 當前頁面名稱
   */
  getCurrentPage(): string,
  
  // ===== 載入指示器 =====
  /**
   * 顯示載入指示器
   * @param {string} message - 載入消息
   */
  showLoading(message?: string): void,
  
  /**
   * 隱藏載入指示器
   */
  hideLoading(): void,
  
  // ===== Toast 通知 =====
  /**
   * 顯示 Toast 通知
   * @param {string} message - 消息內容
   * @param {string} type - 類型 (info|success|error|warning)
   */
  showToast(message: string, type?: string): void,
  
  // ===== 響應式處理 =====
  /**
   * 設置響應式處理
   */
  setupResponsive(): void,
  
  // ===== 鍵盤快捷鍵 =====
  /**
   * 設置鍵盤快捷鍵
   */
  setupKeyboardShortcuts(): void
};
```

---

### 3.2 form-manager.js

**路徑**: `src/ui/form-manager.js`  
**職責**: 表單數據操作和驗證

#### 導出接口

```javascript
/**
 * 表單管理器
 */
export const FormManager = {
  /**
   * 從表單獲取數據
   * @param {HTMLFormElement} formElement - 表單元素
   * @returns {RecordData} 表單數據
   */
  getFormData(formElement: HTMLFormElement): RecordData,
  
  /**
   * 加載數據到表單
   * @param {Record} data - 數據對象
   * @param {HTMLFormElement} formElement - 表單元素
   */
  loadIntoForm(data: Record, formElement: HTMLFormElement): void,
  
  /**
   * 清空表單
   * @param {HTMLFormElement} formElement - 表單元素
   */
  clearForm(formElement: HTMLFormElement): void,
  
  /**
   * 驗證表單
   * @param {HTMLFormElement} formElement - 表單元素
   * @returns {ValidationResult} 驗證結果
   */
  validateForm(formElement: HTMLFormElement): ValidationResult,
  
  /**
   * 設置表單模式
   * @param {'create'|'edit'} mode - 表單模式
   */
  setFormMode(mode: 'create' | 'edit'): void,
  
  /**
   * 禁用表單
   */
  disableForm(): void,
  
  /**
   * 啟用表單
   */
  enableForm(): void,
  
  /**
   * 檢查表單是否有未保存的更改
   * @returns {boolean} 是否有更改
   */
  hasUnsavedChanges(): boolean
};
```

---

### 3.3 list-renderer.js

**路徑**: `src/ui/list-renderer.js`  
**職責**: 記錄列表渲染和交互

#### 導出接口

```javascript
/**
 * 列表渲染器
 */
export const ListRenderer = {
  /**
   * 渲染記錄列表
   * @param {Record[]} records - 記錄數組
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 渲染選項
   */
  renderList(
    records: Record[], 
    container: HTMLElement, 
    options?: RenderOptions
  ): void,
  
  /**
   * 渲染單個記錄項
   * @param {Record} record - 記錄對象
   * @returns {HTMLElement} 渲染的元素
   */
  renderItem(record: Record): HTMLElement,
  
  /**
   * 排序列表
   * @param {string} field - 排序字段
   * @param {'asc'|'desc'} order - 排序順序
   */
  sortList(field: string, order: 'asc' | 'desc'): void,
  
  /**
   * 過濾列表
   * @param {Function} filterFn - 過濾函數
   */
  filterList(filterFn: (record: Record) => boolean): void,
  
  /**
   * 搜索列表
   * @param {string} query - 搜索關鍵字
   */
  searchList(query: string): void,
  
  /**
   * 設置分頁
   * @param {number} page - 頁碼
   * @param {number} perPage - 每頁數量
   */
  setPagination(page: number, perPage: number): void,
  
  /**
   * 刷新列表
   */
  refreshList(): void
};

/**
 * 渲染選項
 * @typedef {Object} RenderOptions
 * @property {boolean} showActions - 是否顯示操作按鈕
 * @property {boolean} showCheckboxes - 是否顯示複選框
 * @property {Function} onItemClick - 項目點擊回調
 * @property {Function} onItemEdit - 編輯回調
 * @property {Function} onItemDelete - 刪除回調
 */
```

---

### 3.4 modal-manager.js

**路徑**: `src/ui/modal-manager.js`  
**職責**: 模態窗口管理

#### 導出接口

```javascript
/**
 * 模態窗口管理器
 */
export const ModalManager = {
  /**
   * 顯示模態窗口
   * @param {string} modalId - 模態窗口 ID
   */
  show(modalId: string): void,
  
  /**
   * 隱藏模態窗口
   * @param {string} modalId - 模態窗口 ID
   */
  hide(modalId: string): void,
  
  /**
   * 確認對話框
   * @param {string} message - 確認消息
   * @returns {Promise<boolean>} 用戶選擇
   */
  confirm(message: string): Promise<boolean>,
  
  /**
   * 警告對話框
   * @param {string} message - 警告消息
   * @returns {Promise<void>}
   */
  alert(message: string): Promise<void>,
  
  /**
   * 提示對話框
   * @param {string} message - 提示消息
   * @param {string} defaultValue - 默認值
   * @returns {Promise<string|null>} 用戶輸入或 null
   */
  prompt(message: string, defaultValue?: string): Promise<string | null>,
  
  /**
   * 創建自定義模態窗口
   * @param {Object} config - 配置對象
   * @returns {HTMLElement} 模態窗口元素
   */
  createModal(config: ModalConfig): HTMLElement
};

/**
 * 模態配置
 * @typedef {Object} ModalConfig
 * @property {string} title - 標題
 * @property {string} content - 內容
 * @property {Array} buttons - 按鈕配置
 * @property {boolean} closeOnOverlay - 點擊遮罩是否關閉
 */
```

---

### 3.5 tricks-manager.js

**路徑**: `src/ui/tricks-manager.js`  
**職責**: 教學花式管理

#### 導出接口

```javascript
/**
 * 花式管理器
 */
export const TricksManager = {
  /**
   * 初始化花式管理器
   * @param {HTMLElement} container - 容器元素
   */
  init(container: HTMLElement): void,
  
  /**
   * 添加花式
   * @param {string} trick - 花式名稱
   * @param {string} level - 難度等級
   */
  addTrick(trick: string, level: string): void,
  
  /**
   * 移除花式
   * @param {string} trick - 花式名稱
   */
  removeTrick(trick: string): void,
  
  /**
   * 獲取所有花式
   * @returns {Array<{name: string, level: string}>} 花式列表
   */
  getTricks(): Array<{ name: string; level: string }>,
  
  /**
   * 設置花式列表
   * @param {Array} tricks - 花式列表
   */
  setTricks(tricks: Array<{ name: string; level: string }>): void,
  
  /**
   * 渲染花式列表
   */
  render(): void
};
```

---

### 3.6 attachments-manager.js

**路徑**: `src/ui/attachments-manager.js`  
**職責**: 文件附件管理

#### 導出接口

```javascript
/**
 * 附件管理器
 */
export const AttachmentsManager = {
  /**
   * 初始化附件管理器
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 配置選項
   */
  init(container: HTMLElement, options?: AttachmentOptions): void,
  
  /**
   * 添加文件
   * @param {File} file - 文件對象
   * @returns {Promise<Attachment>} 附件對象
   */
  async addFile(file: File): Promise<Attachment>,
  
  /**
   * 移除附件
   * @param {string} attachmentId - 附件 ID
   */
  removeAttachment(attachmentId: string): void,
  
  /**
   * 獲取所有附件
   * @returns {Attachment[]} 附件列表
   */
  getAttachments(): Attachment[],
  
  /**
   * 預覽附件
   * @param {string} attachmentId - 附件 ID
   */
  previewAttachment(attachmentId: string): void,
  
  /**
   * 驗證文件
   * @param {File} file - 文件對象
   * @returns {ValidationResult} 驗證結果
   */
  validateFile(file: File): ValidationResult,
  
  /**
   * 渲染附件列表
   */
  render(): void
};

/**
 * 附件選項
 * @typedef {Object} AttachmentOptions
 * @property {number} maxSize - 最大文件大小（字節）
 * @property {string[]} acceptTypes - 接受的文件類型
 * @property {number} maxFiles - 最大文件數
 */

/**
 * 附件類型
 * @typedef {Object} Attachment
 * @property {string} id - 附件 ID
 * @property {string} name - 文件名
 * @property {number} size - 文件大小
 * @property {string} type - 文件類型
 * @property {string} data - Base64 數據
 */
```

---

## 4. 工具函數 API

### 4.1 dom-utils.js

**路徑**: `src/utils/dom-utils.js`  
**職責**: DOM 選擇器和操作

#### 導出接口

```javascript
/**
 * 根據 ID 獲取元素
 * @param {string} id - 元素 ID
 * @returns {HTMLElement|null} 元素或 null
 */
export const $ = (id: string): HTMLElement | null;

/**
 * 查詢單個元素
 * @param {string} selector - CSS 選擇器
 * @param {HTMLElement} parent - 父元素（可選）
 * @returns {HTMLElement|null} 元素或 null
 */
export const $q = (
  selector: string, 
  parent?: HTMLElement
): HTMLElement | null;

/**
 * 查詢所有匹配元素
 * @param {string} selector - CSS 選擇器
 * @param {HTMLElement} parent - 父元素（可選）
 * @returns {NodeListOf<HTMLElement>} 元素列表
 */
export const $qa = (
  selector: string, 
  parent?: HTMLElement
): NodeListOf<HTMLElement>;

/**
 * 創建元素
 * @param {string} tag - 標籤名
 * @param {Object} attrs - 屬性對象
 * @param {string|HTMLElement} content - 內容
 * @returns {HTMLElement} 創建的元素
 */
export function createElement(
  tag: string, 
  attrs?: Record<string, string>, 
  content?: string | HTMLElement
): HTMLElement;

/**
 * 添加類名
 * @param {HTMLElement} element - 元素
 * @param {...string} classes - 類名
 */
export function addClass(element: HTMLElement, ...classes: string[]): void;

/**
 * 移除類名
 * @param {HTMLElement} element - 元素
 * @param {...string} classes - 類名
 */
export function removeClass(element: HTMLElement, ...classes: string[]): void;

/**
 * 切換類名
 * @param {HTMLElement} element - 元素
 * @param {string} className - 類名
 */
export function toggleClass(element: HTMLElement, className: string): void;
```

#### 使用示例

```javascript
import { $, $q, $qa, createElement } from '@/utils/dom-utils.js';

// 選擇元素
const btn = $('myButton');
const form = $q('form.my-form');
const inputs = $qa('input[type="text"]');

// 創建元素
const div = createElement('div', { class: 'container' }, 'Hello');
```

---

### 4.2 formatters.js

**路徑**: `src/utils/formatters.js`  
**職責**: 數據格式化

#### 導出接口

```javascript
/**
 * 格式化日期
 * @param {Date|string} date - 日期對象或字符串
 * @param {string} format - 格式字符串
 * @returns {string} 格式化後的日期
 */
export function formatDate(date: Date | string, format?: string): string;

/**
 * 格式化文件大小
 * @param {number} bytes - 字節數
 * @returns {string} 格式化後的大小（如 "1.5 MB"）
 */
export function formatFileSize(bytes: number): string;

/**
 * 格式化數字
 * @param {number} num - 數字
 * @param {number} decimals - 小數位數
 * @returns {string} 格式化後的數字
 */
export function formatNumber(num: number, decimals?: number): string;

/**
 * 格式化時間
 * @param {Date|string} time - 時間
 * @returns {string} 格式化後的時間（HH:mm:ss）
 */
export function formatTime(time: Date | string): string;

/**
 * 獲取今天日期字符串
 * @returns {string} YYYY-MM-DD 格式
 */
export function todayStr(): string;

/**
 * 相對時間格式化
 * @param {Date|string} date - 日期
 * @returns {string} 相對時間（如 "3 天前"）
 */
export function relativeTime(date: Date | string): string;
```

#### 使用示例

```javascript
import { formatDate, formatFileSize, todayStr } from '@/utils/formatters.js';

const today = todayStr(); // "2026-02-16"
const dateStr = formatDate(new Date(), 'YYYY/MM/DD'); // "2026/02/16"
const size = formatFileSize(1048576); // "1.00 MB"
```

---

### 4.3 validators.js

**路徑**: `src/utils/validators.js`  
**職責**: 數據驗證函數

#### 導出接口

```javascript
/**
 * 驗證電子郵件
 * @param {string} email - 電子郵件地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email: string): boolean;

/**
 * 驗證用戶名
 * @param {string} username - 用戶名
 * @returns {boolean} 是否有效
 */
export function isValidUsername(username: string): boolean;

/**
 * 驗證密碼強度
 * @param {string} password - 密碼
 * @returns {Object} 驗證結果
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
};

/**
 * 驗證日期格式
 * @param {string} dateStr - 日期字符串
 * @param {string} format - 期望格式
 * @returns {boolean} 是否有效
 */
export function isValidDate(dateStr: string, format?: string): boolean;

/**
 * 驗證數字範圍
 * @param {number} num - 數字
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean} 是否在範圍內
 */
export function isInRange(num: number, min: number, max: number): boolean;

/**
 * 驗證必填字段
 * @param {any} value - 值
 * @returns {boolean} 是否有值
 */
export function isRequired(value: any): boolean;
```

---

### 4.4 helpers.js

**路徑**: `src/utils/helpers.js`  
**職責**: 其他輔助函數

#### 導出接口

```javascript
/**
 * HTML 轉義
 * @param {string} text - 文本
 * @returns {string} 轉義後的文本
 */
export function escapeHtml(text: string): string;

/**
 * 顯示 Toast 通知
 * @param {string} message - 消息
 * @param {string} type - 類型 (info|success|error|warning)
 */
export function toast(message: string, type?: 'info' | 'success' | 'error' | 'warning'): void;

/**
 * 深拷貝對象
 * @param {any} obj - 對象
 * @returns {any} 拷貝的對象
 */
export function deepClone(obj: any): any;

/**
 * 防抖函數
 * @param {Function} fn - 要防抖的函數
 * @param {number} delay - 延遲時間（毫秒）
 * @returns {Function} 防抖後的函數
 */
export function debounce(fn: Function, delay: number): Function;

/**
 * 節流函數
 * @param {Function} fn - 要節流的函數
 * @param {number} interval - 間隔時間（毫秒）
 * @returns {Function} 節流後的函數
 */
export function throttle(fn: Function, interval: number): Function;

/**
 * 生成唯一 ID
 * @param {string} prefix - 前綴
 * @returns {string} 唯一 ID
 */
export function generateId(prefix?: string): string;

/**
 * 延遲執行
 * @param {number} ms - 延遲時間（毫秒）
 * @returns {Promise<void>}
 */
export function delay(ms: number): Promise<void>;
```

---

## 5. 常數定義

### 5.1 app-constants.js

**路徑**: `src/constants/app-constants.js`  
**職責**: 應用級常數定義

#### 導出接口

```javascript
/**
 * 存儲鍵
 */
export const STORAGE_KEY: string = 'rope-skip-checkpoints';
export const CLASS_PRESETS_KEY: string = 'rope-skip-class-presets';

/**
 * 評分範圍 IDs
 */
export const SCORE_1_5_IDS: string[] = [
  'engagement', 'positivity', 'enthusiasm', 'satisfaction'
];

export const RANGE_IDS: string[] = [
  'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
  'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
  'teachScore', 'satisfaction', 'flexibility', 'individual'
];

/**
 * 選項組
 */
export const OPTION_GROUPS: Array<{
  name: string;
  selector: string;
}> = [
  { name: 'atmosphere', selector: '[data-name="atmosphere"]' },
  { name: 'skillLevel', selector: '[data-name="skillLevel"]' }
];

/**
 * 頁面標題
 */
export const PAGE_TITLES: Record<string, string> = {
  overview: '課堂概覽',
  students: '學生管理',
  actions: '動作記錄',
  analytics: '統計分析'
};

/**
 * 花式難度等級
 */
export const TRICK_LEVELS: string[] = ['初級', '中級', '進階'];
```

---

## 6. 初始化 API

### 6.1 app-init.js

**路徑**: `src/init/app-init.js`  
**職責**: 主應用初始化

#### 導出接口

```javascript
/**
 * 初始化應用
 * @returns {Promise<boolean>} 初始化是否成功
 */
export async function initializeApp(): Promise<boolean>;

/**
 * 初始化服務
 * @returns {Promise<boolean>} 初始化是否成功
 */
export async function initializeServices(): Promise<boolean>;

/**
 * 初始化 UI
 * @returns {Promise<boolean>} 初始化是否成功
 */
export async function initializeUI(): Promise<boolean>;

/**
 * 檢查會話
 * @returns {boolean} 會話是否有效
 */
export function checkSession(): boolean;
```

---

### 6.2 login-page-init.js

**路徑**: `src/init/login-page-init.js`  
**職責**: 登入頁初始化

#### 導出接口

```javascript
/**
 * 初始化登入頁面
 * @returns {boolean} 初始化是否成功
 */
export function initLoginPage(): boolean;

/**
 * 設置登入表單
 */
export function setupLoginForm(): void;

/**
 * 設置註冊表單
 */
export function setupSignupForm(): void;

/**
 * 確保預設用戶存在
 */
export function ensureDefaultUser(): void;
```

---

### 6.3 event-bindings.js

**路徑**: `src/init/event-bindings.js`  
**職責**: 事件綁定

#### 導出接口

```javascript
/**
 * 綁定所有事件
 */
export function bindAllEvents(): void;

/**
 * 綁定表單事件
 */
export function bindFormEvents(): void;

/**
 * 綁定按鈕事件
 */
export function bindButtonEvents(): void;

/**
 * 綁定導航事件
 */
export function bindNavigationEvents(): void;

/**
 * 綁定搜索事件
 */
export function bindSearchEvents(): void;
```

---

## 7. 入口文件 API

### 7.1 main.js

**路徑**: `src/main.js`  
**職責**: 應用入口點

#### 導出接口

```javascript
/**
 * 從所有模組導入並綁定到 window 對象
 */

// 核心服務
export { STORAGE_MANAGER } from './core/storage-manager.js';
export { LOGIN_MANAGER } from './core/login-manager.js';
export { AUTH_CONFIG } from './core/auth-config.js';
export { StorageService } from './core/storage-service.js';

// 數據服務
export { RecordsService } from './services/records-service.js';
export { PresetsService } from './services/presets-service.js';
export { UsersService } from './services/users-service.js';
export { ValidationService } from './services/validation-service.js';

// UI 管理
export { UI_MANAGER } from './ui/ui-manager.js';
export { FormManager } from './ui/form-manager.js';
export { ListRenderer } from './ui/list-renderer.js';
export { ModalManager } from './ui/modal-manager.js';

// 工具函數
export { $, $q, $qa } from './utils/dom-utils.js';
export { formatDate, formatFileSize } from './utils/formatters.js';
export { escapeHtml, toast } from './utils/helpers.js';

// 初始化
export { initializeApp } from './init/app-init.js';
export { initLoginPage } from './init/login-page-init.js';
```

---

## 8. 類型定義總結

### 共用類型

```typescript
// 用戶類型
interface User {
  id: string;
  username: string;
  email: string;
  role: 'creator' | 'admin' | 'user';
  passwordHash: string;
  createdAt: string;
}

// 記錄類型
interface Record {
  id: string;
  date: string;
  class: string;
  teacher: string;
  scores: Record<string, number>;
  tricks: Array<{ name: string; level: string }>;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// 附件類型
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // Base64
}

// 驗證結果
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}
```

---

## 9. 版本歷史

| 版本 | 日期 | 變更說明 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-02-16 | 初始版本，完整 API 設計 | GitHub Copilot |

---

**文檔結束**

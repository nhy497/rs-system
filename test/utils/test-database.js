/**
 * 測試數據庫管理工具
 * 提供測試用的數據庫初始化、清理和數據管理功能
 */

import PouchDB from 'pouchdb';

/**
 * 測試數據庫配置
 */
const TEST_DB_CONFIG = {
  prefix: 'test_',
  suffix: '_db',
  cleanup: true
};

/**
 * 測試數據庫管理器
 */
export class TestDatabase {
  constructor() {
    this.databases = new Map();
    this.isTestMode = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true';
  }

  /**
   * 初始化測試數據庫
   * @param {string} name - 數據庫名稱
   * @param {Object} options - 數據庫選項
   * @returns {PouchDB} 數據庫實例
   */
  async initDatabase(name, options = {}) {
    if (!this.isTestMode) {
      console.warn('警告: 非測試環境下不建議使用測試數據庫');
    }

    const dbName = this.getTestDbName(name);
    const db = new PouchDB(dbName, {
      adapter: 'memory',
      ...options
    });

    this.databases.set(name, db);
    
    console.log(`✅ 初始化測試數據庫: ${dbName}`);
    return db;
  }

  /**
   * 獲取測試數據庫名稱
   * @param {string} name - 原始數據庫名稱
   * @returns {string} 測試數據庫名稱
   */
  getTestDbName(name) {
    return `${TEST_DB_CONFIG.prefix}${name}${TEST_DB_CONFIG.suffix}`;
  }

  /**
   * 獲取數據庫實例
   * @param {string} name - 數據庫名稱
   * @returns {PouchDB|null} 數據庫實例
   */
  getDatabase(name) {
    return this.databases.get(name) || null;
  }

  /**
   * 創建測試數據
   * @param {string} dbName - 數據庫名稱
   * @param {Array} data - 測試數據
   */
  async createTestData(dbName, data) {
    const db = this.getDatabase(dbName);
    if (!db) {
      throw new Error(`數據庫 ${dbName} 不存在`);
    }

    try {
      const docs = data.map(item => ({
        ...item,
        _id: item.id || this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const result = await db.bulkDocs(docs);
      console.log(`✅ 創建 ${result.length} 條測試數據到 ${dbName}`);
      return result;
    } catch (error) {
      console.error(`❌ 創建測試數據失敗:`, error);
      throw error;
    }
  }

  /**
   * 清理數據庫
   * @param {string} name - 數據庫名稱
   */
  async clearDatabase(name) {
    const db = this.getDatabase(name);
    if (!db) return;

    try {
      const docs = await db.allDocs();
      const deleteDocs = docs.rows.map(row => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true
      }));

      await db.bulkDocs(deleteDocs);
      console.log(`✅ 清理數據庫: ${name}`);
    } catch (error) {
      console.error(`❌ 清理數據庫失敗:`, error);
    }
  }

  /**
   * 刪除數據庫
   * @param {string} name - 數據庫名稱
   */
  async deleteDatabase(name) {
    const db = this.getDatabase(name);
    if (!db) return;

    try {
      await db.destroy();
      this.databases.delete(name);
      console.log(`✅ 刪除數據庫: ${name}`);
    } catch (error) {
      console.error(`❌ 刪除數據庫失敗:`, error);
    }
  }

  /**
   * 清理所有測試數據庫
   */
  async cleanupAll() {
    const promises = Array.from(this.databases.keys()).map(name => 
      this.deleteDatabase(name)
    );
    
    await Promise.all(promises);
    console.log('✅ 清理所有測試數據庫完成');
  }

  /**
   * 生成唯一 ID
   * @returns {string} 唯一 ID
   */
  generateId() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 創建測試用戶數據
   * @returns {Array} 測試用戶數據
   */
  createTestUsers() {
    return [
      {
        id: 'test_admin_1',
        username: 'test-admin',
        email: 'admin@test.com',
        password: 'test-password',
        role: 'admin',
        displayName: '測試管理員',
        isActive: true,
        permissions: ['read', 'write', 'delete', 'admin']
      },
      {
        id: 'test_coach_1',
        username: 'test-coach',
        email: 'coach@test.com',
        password: 'test-password',
        role: 'coach',
        displayName: '測試教練',
        isActive: true,
        permissions: ['read', 'write']
      },
      {
        id: 'test_user_1',
        username: 'test-user',
        email: 'user@test.com',
        password: 'test-password',
        role: 'user',
        displayName: '測試用戶',
        isActive: true,
        permissions: ['read']
      },
      {
        id: 'test_guest_1',
        username: 'test-guest',
        email: 'guest@test.com',
        password: 'test-password',
        role: 'guest',
        displayName: '測試訪客',
        isActive: true,
        permissions: ['read']
      }
    ];
  }

  /**
   * 創建測試課堂數據
   * @returns {Array} 測試課堂數據
   */
  createTestClasses() {
    return [
      {
        id: 'test_class_1',
        name: '測試課堂 - 初級班',
        description: '這是一個測試用的初級班課堂',
        coachId: 'test_coach_1',
        date: new Date().toISOString(),
        duration: 60,
        maxStudents: 20,
        currentStudents: 15,
        status: 'active',
        location: '測試場地A'
      },
      {
        id: 'test_class_2',
        name: '測試課堂 - 進階班',
        description: '這是一個測試用的進階班課堂',
        coachId: 'test_coach_1',
        date: new Date(Date.now() + 86400000).toISOString(), // 明天
        duration: 90,
        maxStudents: 15,
        currentStudents: 10,
        status: 'scheduled',
        location: '測試場地B'
      }
    ];
  }

  /**
   * 創建測試學員數據
   * @returns {Array} 測試學員數據
   */
  createTestStudents() {
    return [
      {
        id: 'test_student_1',
        name: '測試學員1',
        age: 8,
        gender: 'male',
        level: 'beginner',
        parentId: 'test_parent_1',
        emergencyContact: '測試家長',
        phone: '1234567890',
        notes: '測試備註',
        isActive: true
      },
      {
        id: 'test_student_2',
        name: '測試學員2',
        age: 10,
        gender: 'female',
        level: 'intermediate',
        parentId: 'test_parent_2',
        emergencyContact: '測試家長2',
        phone: '0987654321',
        notes: '另一個測試備註',
        isActive: true
      }
    ];
  }

  /**
   * 初始化所有測試數據
   */
  async initializeAllTestData() {
    try {
      // 初始化用戶數據庫
      const userDb = await this.initDatabase('users');
      await this.createTestData('users', this.createTestUsers());

      // 初始化課堂數據庫
      const classDb = await this.initDatabase('classes');
      await this.createTestData('classes', this.createTestClasses());

      // 初始化學員數據庫
      const studentDb = await this.initDatabase('students');
      await this.createTestData('students', this.createTestStudents());

      console.log('✅ 所有測試數據初始化完成');
    } catch (error) {
      console.error('❌ 初始化測試數據失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取測試用戶憑證
   * @param {string} role - 用戶角色
   * @returns {Object} 用戶憑證
   */
  getTestCredentials(role = 'user') {
    const users = this.createTestUsers();
    const user = users.find(u => u.role === role);
    
    if (!user) {
      throw new Error(`找不到角色為 ${role} 的測試用戶`);
    }

    return {
      username: user.username,
      password: user.password,
      userId: user.id,
      role: user.role
    };
  }

  /**
   * 模擬用戶登入
   * @param {string} role - 用戶角色
   * @returns {Object} 登入結果
   */
  async simulateLogin(role) {
    const credentials = this.getTestCredentials(role);
    
    // 模擬登入邏輯
    const loginResult = {
      success: true,
      user: {
        id: credentials.userId,
        username: credentials.username,
        role: credentials.role
      },
      token: `test_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1小時後過期
    };

    console.log(`✅ 模擬用戶 ${credentials.username} 登入成功`);
    return loginResult;
  }
}

// 導出單例實例
export const testDatabase = new TestDatabase();

// 導出測試數據工廠函數
export const TestDataFactory = {
  users: () => testDatabase.createTestUsers(),
  classes: () => testDatabase.createTestClasses(),
  students: () => testDatabase.createTestStudents(),
  
  // 創建自定義測試數據
  custom: (type, count = 1) => {
    const data = [];
    for (let i = 1; i <= count; i++) {
      data.push({
        id: `test_${type}_${i}`,
        name: `測試${type}${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return data;
  }
};

// 導出測試數據庫工具函數
export const TestUtils = {
  /**
   * 等待數據庫操作完成
   * @param {number} timeout - 超時時間（毫秒）
   */
  waitForDb: (timeout = 5000) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  },

  /**
   * 驗證數據庫狀態
   * @param {PouchDB} db - 數據庫實例
   */
  validateDatabase: async (db) => {
    try {
      const info = await db.info();
      return info.doc_count >= 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * 清理測試環境
   */
  cleanup: async () => {
    await testDatabase.cleanupAll();
    
    // 清理 localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    
    // 清理 sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }
};

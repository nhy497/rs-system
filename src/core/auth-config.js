/**
 * 認證配置 - 密碼加密與認證設置
 * @module core/auth-config
 */

/**
 * 認證配置對象
 */
export const AUTH_CONFIG = {
  STORAGE_KEY: 'rs-system-auth',
  SESSION_KEY: 'rs-system-session',
  USER_DB_KEY: 'rs-system-users',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
  PASSWORD_MIN_LENGTH: 4
};

/**
 * 用戶儲存鍵名
 */
export const USER_STORAGE_KEY = AUTH_CONFIG.USER_DB_KEY;

/**
 * 舊版用戶儲存鍵名（用於數據遷移）
 */
export const LEGACY_USER_KEY = 'users';

/**
 * 被阻止的用戶名列表
 */
export const BLOCKED_USERNAMES = ['test', 'demo', 'admin'];

/**
 * 測試用戶列表（僅在測試環境中使用）
 */
export const TEST_USERS = [
  { username: 'test-user', password: 'test-password', role: 'user' },
  { username: 'test-user2', password: 'test-password2', role: 'user' }
];

/**
 * 與舊版兼容的密碼雜湊函數
 * @param {string} password - 明文密碼
 * @returns {string} 雜湊後的密碼
 */
export function hashPasswordCompat(password) {
  let hash = 0;
  for (let i = 0; i < (password || '').length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * 從儲存中加載用戶數據
 * 包含舊版遷移、阻止測試帳號、自動添加 Creator 帳號
 * @returns {Array} 用戶數組
 */
export function loadUsersFromStorage() {
  try {
    const rawNew = localStorage.getItem(USER_STORAGE_KEY);
    const rawLegacy = localStorage.getItem(LEGACY_USER_KEY);
    let users = rawNew ? JSON.parse(rawNew) : (rawLegacy ? JSON.parse(rawLegacy) : []);

    if (!Array.isArray(users)) {
      users = Object.values(users || {});
    }

    let changed = false;

    // 在測試環境中添加測試用戶
    if (typeof global !== 'undefined' && global.process && global.process.env.NODE_ENV === 'test') {
      const testUserHash = hashPasswordCompat('test-password');
      const testUser2Hash = hashPasswordCompat('test-password2');
      
      const testUsers = [
        {
          id: 'test-user-1',
          username: 'test-user',
          passwordHash: testUserHash,
          role: 'user',
          createdAt: new Date().toISOString()
        },
        {
          id: 'test-user-2', 
          username: 'test-user2',
          passwordHash: testUser2Hash,
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ];
      
      testUsers.forEach(testUser => {
        if (!users.find(u => u.username === testUser.username)) {
          users.push(testUser);
          changed = true;
        }
      });
    }

    users = users
      .filter(u => u && u.username)
      .filter(u => {
        const uname = (u.username || '').toLowerCase();
        // 只阻擋特定保留名稱，允許數字用戶名
        const isBlocked = BLOCKED_USERNAMES.includes(uname);
        if (isBlocked) {
          changed = true;
          return false;
        }
        return true;
      })
      .map(u => {
        const user = { ...u };
        if (!user.id && user.userId) { user.id = user.userId; changed = true; }
        if (!user.passwordHash && user.password) {
          user.passwordHash = hashPasswordCompat(user.password);
          delete user.password;
          changed = true;
        }
        if (!user.role) { user.role = 'user'; changed = true; }
        if (!user.createdAt) { user.createdAt = new Date().toISOString(); changed = true; }
        return user;
      });

    // 只允許單一 Creator，帳號固定為 creator / 1234
    const creatorHash = hashPasswordCompat('1234');
    let creatorEntry = null;
    const normalized = [];

    users.forEach(user => {
      if ((user.username || '').toLowerCase() === 'creator') {
        if (!creatorEntry) {
          creatorEntry = {
            ...user,
            username: 'creator',
            role: 'creator',
            passwordHash: creatorHash,
            id: user.id || user.userId || `user_${Date.now()}_creator`,
            userId: user.userId || user.id || undefined
          };
          changed = true;
        } else {
          changed = true; // 丟棄多餘 creator
        }
      } else {
        if (user.role === 'creator') { user.role = 'user'; changed = true; }
        normalized.push(user);
      }
    });

    if (!creatorEntry) {
      creatorEntry = {
        id: `user_${Date.now()}_creator`,
        userId: `user_${Date.now()}_creator`,
        username: 'creator',
        email: 'creator@system.local',
        role: 'creator',
        passwordHash: creatorHash,
        createdAt: new Date().toISOString()
      };
      changed = true;
    }

    users = [creatorEntry, ...normalized];

    if (changed || rawLegacy) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      if (rawLegacy) localStorage.removeItem(LEGACY_USER_KEY);
    }

    return users;
  } catch (error) {
    console.error('❌ 讀取用戶資料失敗:', error);
    return [];
  }
}

/**
 * 保存用戶數據到儲存
 * @param {Array} users - 用戶數組
 */
export function saveUsersToStorage(users) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('❌ 保存用戶資料失敗:', error);
  }
}

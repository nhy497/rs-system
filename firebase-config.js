/**
 * Firebase 配置和初始化
 * 支援多用戶認證和實時數據同步
 * v3.0: 多用戶系統準備中
 */

// Firebase 配置（請根據 Firebase 項目更新）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 初始化標誌
let firebaseInitialized = false;
let firebaseEnabled = false;

/**
 * 初始化 Firebase
 * 需要在 HTML 中引入 Firebase SDK 後調用
 */
function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded. Using local storage only.');
    return false;
  }
  
  try {
    firebase.initializeApp(firebaseConfig);
    firebaseInitialized = true;
    firebaseEnabled = true;
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    return false;
  }
}

/**
 * 用戶認證相關
 */
const Auth = {
  /**
   * 使用電郵和密碼登入
   */
  signUp: async (email, password, displayName) => {
    if (!firebaseEnabled) throw new Error('Firebase not enabled');
    try {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await user.updateProfile({ displayName });
      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 登入
   */
  signIn: async (email, password) => {
    if (!firebaseEnabled) throw new Error('Firebase not enabled');
    try {
      const { user } = await firebase.auth().signInWithEmailAndPassword(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 登出
   */
  signOut: async () => {
    if (!firebaseEnabled) throw new Error('Firebase not enabled');
    try {
      await firebase.auth().signOut();
    } catch (error) {
      throw error;
    }
  },

  /**
   * 監聽認證狀態變化
   */
  onAuthStateChanged: (callback) => {
    if (!firebaseEnabled) {
      callback(null);
      return;
    }
    firebase.auth().onAuthStateChanged(callback);
  },

  /**
   * 取得當前用戶
   */
  getCurrentUser: () => {
    if (!firebaseEnabled) return null;
    return firebase.auth().currentUser;
  }
};

/**
 * 數據庫相關 - 實時同步
 */
const Database = {
  /**
   * 保存課堂記錄到 Firebase
   */
  saveRecord: async (record) => {
    if (!firebaseEnabled) {
      // 降級到本地儲存
      const list = parseRecords();
      const idx = list.findIndex(r => r.classDate === record.classDate && r.className === record.className);
      if (idx >= 0) list[idx] = record;
      else list.unshift(record);
      list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
      saveRecords(list);
      return record;
    }

    try {
      const user = firebase.auth().currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const db = firebase.database();
      const recordId = `${record.classDate}_${record.className}`;
      const path = `users/${user.uid}/records/${recordId}`;
      
      await db.ref(path).set({
        ...record,
        userId: user.uid,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      return record;
    } catch (error) {
      console.error('Database.saveRecord failed:', error);
      throw error;
    }
  },

  /**
   * 從 Firebase 獲取用戶的所有記錄
   */
  getRecords: async () => {
    if (!firebaseEnabled) {
      // 降級到本地儲存
      return parseRecords();
    }

    try {
      const user = firebase.auth().currentUser;
      if (!user) return [];
      
      const db = firebase.database();
      const snapshot = await db.ref(`users/${user.uid}/records`).once('value');
      const data = snapshot.val();
      
      if (!data) return [];
      
      return Object.values(data).sort((a, b) => 
        (b.classDate || '').localeCompare(a.classDate || '')
      );
    } catch (error) {
      console.error('Database.getRecords failed:', error);
      return parseRecords(); // 降級
    }
  },

  /**
   * 刪除記錄
   */
  deleteRecord: async (classDate, className) => {
    if (!firebaseEnabled) {
      const list = parseRecords();
      const idx = list.findIndex(r => r.classDate === classDate && r.className === className);
      if (idx >= 0) {
        list.splice(idx, 1);
        saveRecords(list);
      }
      return;
    }

    try {
      const user = firebase.auth().currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const db = firebase.database();
      const recordId = `${classDate}_${className}`;
      const path = `users/${user.uid}/records/${recordId}`;
      
      await db.ref(path).remove();
    } catch (error) {
      console.error('Database.deleteRecord failed:', error);
      throw error;
    }
  },

  /**
   * 訂閱用戶記錄的實時更新
   */
  subscribeToRecords: (callback) => {
    if (!firebaseEnabled) {
      // 定期輪詢本地儲存
      setInterval(() => {
        callback(parseRecords());
      }, 5000);
      return () => {}; // 無法退訂
    }

    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        callback([]);
        return () => {};
      }
      
      const db = firebase.database();
      const ref = db.ref(`users/${user.uid}/records`);
      
      ref.on('value', (snapshot) => {
        const data = snapshot.val();
        const records = data ? Object.values(data).sort((a, b) => 
          (b.classDate || '').localeCompare(a.classDate || '')
        ) : [];
        callback(records);
      });
      
      return () => ref.off(); // 返回取消訂閱函數
    } catch (error) {
      console.error('Database.subscribeToRecords failed:', error);
      callback(parseRecords());
      return () => {};
    }
  }
};

/**
 * 管理員功能 - 查看平臺數據
 */
const AdminPanel = {
  /**
   * 取得所有用戶的課堂記錄（管理員專用）
   */
  getAllRecords: async () => {
    if (!firebaseEnabled) {
      console.warn('Admin features require Firebase');
      return [];
    }

    try {
      const user = firebase.auth().currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // 檢查用戶是否為管理員（自行實現管理員標誌）
      const isAdmin = await AdminPanel.checkAdminAccess(user.uid);
      if (!isAdmin) throw new Error('Unauthorized: Admin access required');
      
      const db = firebase.database();
      const snapshot = await db.ref('users').once('value');
      const data = snapshot.val();
      
      const allRecords = [];
      for (const userId in data) {
        const records = data[userId].records || {};
        for (const recordId in records) {
          allRecords.push({
            ...records[recordId],
            recordId,
            userId
          });
        }
      }
      
      return allRecords.sort((a, b) => 
        (b.classDate || '').localeCompare(a.classDate || '')
      );
    } catch (error) {
      console.error('AdminPanel.getAllRecords failed:', error);
      throw error;
    }
  },

  /**
   * 檢查管理員訪問權限
   */
  checkAdminAccess: async (userId) => {
    if (!firebaseEnabled) return false;

    try {
      const db = firebase.database();
      const snapshot = await db.ref(`admins/${userId}`).once('value');
      return snapshot.exists();
    } catch (error) {
      console.error('AdminPanel.checkAdminAccess failed:', error);
      return false;
    }
  },

  /**
   * 取得平臺統計數據
   */
  getPlatformStats: async () => {
    if (!firebaseEnabled) {
      console.warn('Admin features require Firebase');
      return {};
    }

    try {
      const records = await AdminPanel.getAllRecords();
      
      const stats = {
        totalRecords: records.length,
        totalUsers: new Set(records.map(r => r.userId)).size,
        totalClasses: new Set(records.map(r => r.classDate)).size,
        averageEngagement: records.length > 0 
          ? (records.reduce((sum, r) => sum + (r.engagement || 0), 0) / records.length).toFixed(1)
          : 0,
        averageMastery: records.length > 0
          ? (records.reduce((sum, r) => sum + (r.mastery || 0), 0) / records.length).toFixed(1)
          : 0,
        classesByUser: {},
        recordsByMonth: {}
      };
      
      // 統計每個用戶的課堂數
      records.forEach(r => {
        if (!stats.classesByUser[r.userId]) stats.classesByUser[r.userId] = 0;
        stats.classesByUser[r.userId]++;
        
        // 統計每月記錄
        const month = (r.classDate || '').substring(0, 7);
        if (!stats.recordsByMonth[month]) stats.recordsByMonth[month] = 0;
        stats.recordsByMonth[month]++;
      });
      
      return stats;
    } catch (error) {
      console.error('AdminPanel.getPlatformStats failed:', error);
      throw error;
    }
  }
};

// 暴露全局函數
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;
window.Auth = Auth;
window.Database = Database;
window.AdminPanel = AdminPanel;

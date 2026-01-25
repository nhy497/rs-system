/**
 * Phase 3 系統初始化檢查
 * 在瀏覽器控制台執行此命令以驗證所有模塊已正確加載
 */

console.log('========================================');
console.log('Phase 3: 系統初始化檢查');
console.log('========================================\n');

// 檢查 1: 核心全局對象
console.log('【檢查 1】核心全局對象:');
const checks = {
  'LOGIN_MANAGER': typeof LOGIN_MANAGER !== 'undefined',
  'STORAGE_MANAGER': typeof STORAGE_MANAGER !== 'undefined',
  'UI_MANAGER': typeof UI_MANAGER !== 'undefined',
  'loggerService': typeof loggerService !== 'undefined',
  'PouchDB': typeof PouchDB !== 'undefined',
  'storageService': typeof storageService !== 'undefined'
};

Object.entries(checks).forEach(([name, available]) => {
  console.log(`  ${available ? '✅' : '❌'} ${name}: ${available ? '已加載' : '缺失'}`);
});

// 檢查 2: 登入狀態
console.log('\n【檢查 2】登入狀態:');
const currentUser = LOGIN_MANAGER?.getCurrentUser();
const isLoggedIn = LOGIN_MANAGER?.isLoggedIn();
console.log(`  用戶: ${currentUser ? currentUser.username : '未登入'}`);
console.log(`  角色: ${currentUser ? currentUser.role : 'N/A'}`);
console.log(`  已登入: ${isLoggedIn ? '✅ 是' : '❌ 否'}`);

// 檢查 3: localStorage 數據
console.log('\n【檢查 3】localStorage 數據:');
const recordsRaw = localStorage.getItem('rope-skip-checkpoints');
const usersRaw = localStorage.getItem('users');
const sessionRaw = localStorage.getItem('rs-system-session');
console.log(`  課堂記錄: ${recordsRaw ? '✅ 存在' : '❌ 缺失'}`);
console.log(`  用戶列表: ${usersRaw ? '✅ 存在' : '❌ 缺失'}`);
console.log(`  會話信息: ${sessionRaw ? '✅ 存在' : '❌ 缺失'}`);

// 檢查 4: 日誌系統
console.log('\n【檢查 4】日誌系統:');
if (typeof loggerService !== 'undefined') {
  const stats = loggerService.getStats();
  console.log(`  教練日誌: ${stats.coachLogsCount} 條`);
  console.log(`  系統事件: ${stats.systemLogsCount} 條`);
  console.log(`  審計日誌: ${stats.auditLogsCount} 條`);
} else {
  console.log(`  ❌ 日誌系統未加載`);
}

// 檢查 5: PouchDB
console.log('\n【檢查 5】PouchDB:');
if (typeof PouchDB !== 'undefined') {
  console.log(`  ✅ PouchDB 庫已加載`);
  if (typeof storageService !== 'undefined') {
    console.log(`  ✅ StorageService 已初始化`);
  }
} else {
  console.log(`  ⚠️ PouchDB 庫未加載 (將使用 localStorage)`);
}

// 檢查 6: 表單元素
console.log('\n【檢查 6】關鍵表單元素:');
const formElements = [
  'classDate', 'className', 'classSize', 
  'classStartTime', 'classEndTime', 'classDuration',
  'classLocation', 'teachingRole',
  'engagement', 'atmosphere', 'skillLevel',
  'btnSave', 'btnClear', 'btnLogout'
];

let missingElements = [];
formElements.forEach(id => {
  const el = document.getElementById(id);
  if (!el) missingElements.push(id);
});

if (missingElements.length === 0) {
  console.log(`  ✅ 所有必需元素存在`);
} else {
  console.log(`  ❌ 缺失元素: ${missingElements.join(', ')}`);
}

console.log('\n========================================');
console.log('檢查完成！');
console.log('========================================\n');

// 輔助函數：快速測試
console.log('【可用測試命令】:');
console.log('  • testLogin(username, password) - 測試登入');
console.log('  • testSaveRecord() - 測試保存課堂記錄');
console.log('  • testLoggerService() - 測試日誌系統');
console.log('  • testLogout() - 測試登出');

// 定義測試函數
window.testLogin = async function(username = 'creator', password = '1234') {
  console.log(`\n【測試登入】用戶: ${username}`);
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log(`❌ 用戶不存在`);
      return;
    }
    const result = await LOGIN_MANAGER.login(username, password);
    console.log(result.success ? `✅ 登入成功` : `❌ 登入失敗: ${result.error}`);
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
};

window.testSaveRecord = function() {
  console.log('\n【測試保存記錄】');
  try {
    const testRecord = {
      classDate: new Date().toISOString().split('T')[0],
      className: '測試班級',
      classSize: 25,
      atmosphere: '活躍',
      skillLevel: '進階',
      engagement: 4,
      tricks: [{ name: '跳繩基礎', detail: '單人', level: '初級' }],
      mastery: 80,
      notes: 'Phase 3 測試記錄'
    };
    
    const records = JSON.parse(atob(localStorage.getItem('rope-skip-checkpoints') || btoa(JSON.stringify([]))));
    records.push(testRecord);
    localStorage.setItem('rope-skip-checkpoints', btoa(JSON.stringify(records)));
    
    console.log(`✅ 記錄已保存`);
    console.log(`  日期: ${testRecord.classDate}`);
    console.log(`  班級: ${testRecord.className}`);
    console.log(`  總記錄數: ${records.length}`);
  } catch (error) {
    console.error('❌ 保存失敗:', error.message);
  }
};

window.testLoggerService = function() {
  console.log('\n【測試日誌系統】');
  try {
    if (typeof loggerService === 'undefined') {
      console.log('❌ 日誌系統未加載');
      return;
    }
    
    // 記錄測試事件
    loggerService.logCoachAction('test_action', '這是一條測試日誌', { test: true });
    loggerService.logSystemEvent('test_event', '系統測試事件', 'info');
    
    // 查詢日誌
    const logs = loggerService.getCoachLogs();
    const events = loggerService.getSystemLogs();
    
    console.log(`✅ 日誌系統正常`);
    console.log(`  教練日誌: ${logs.length} 條`);
    console.log(`  系統事件: ${events.length} 條`);
  } catch (error) {
    console.error('❌ 日誌測試失敗:', error.message);
  }
};

window.testLogout = function() {
  console.log('\n【測試登出】');
  if (confirm('確定要測試登出嗎? (將重定向到登入頁)')) {
    LOGIN_MANAGER.logout();
  }
};

console.log('\n輸入 testLogin() 開始測試...\n');

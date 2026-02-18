/**
 * Phase 2 模块使用示例 - 核心服务和数据服务
 * @module examples/phase2-usage
 */

// ============================================================================
// 核心服务导入
// ============================================================================
import { STORAGE_MANAGER } from '../core/storage-manager.js';
import { AUTH_CONFIG, hashPasswordCompat, loadUsersFromStorage } from '../core/auth-config.js';
import { LOGIN_MANAGER } from '../core/login-manager.js';

// ============================================================================
// 数据服务导入
// ============================================================================
import { StorageService, storageService } from '../services/storage-service.js';
import { RecordsService } from '../services/records-service.js';
import { PresetsService } from '../services/presets-service.js';
import { UsersService } from '../services/users-service.js';
import { ValidationService } from '../services/validation-service.js';

console.log('=== Phase 2 模块使用示例 ===\n');

// ============================================================================
// 1. 核心服务层示例
// ============================================================================

console.log('【1. 核心服务层】\n');

// 1.1 存储管理器
console.log('1.1 存储管理器 (STORAGE_MANAGER):');
console.log('- 初始化:', 'STORAGE_MANAGER.init()');
console.log('- 存储键名:', STORAGE_MANAGER.KEYS);
console.log('- 配置选项:', STORAGE_MANAGER.CONFIG);
console.log('- 获取统计:', 'STORAGE_MANAGER.getStats()');
console.log('');

// 1.2 认证配置
console.log('1.2 认证配置 (AUTH_CONFIG):');
console.log('- 会话超时:', AUTH_CONFIG.SESSION_TIMEOUT, 'ms');
console.log('- 密码最小长度:', AUTH_CONFIG.PASSWORD_MIN_LENGTH);
console.log('- 密码哈希示例:', hashPasswordCompat('test123'));
console.log('- 加载用户:', 'loadUsersFromStorage()');
console.log('');

// 1.3 登录管理器
console.log('1.3 登录管理器 (LOGIN_MANAGER):');
console.log('- 安全配置:', LOGIN_MANAGER.SECURITY);
console.log('- 登录:', 'await LOGIN_MANAGER.login(username, password)');
console.log('- 登出:', 'LOGIN_MANAGER.logout()');
console.log('- 检查会话:', 'LOGIN_MANAGER.checkSession()');
console.log('- 获取当前用户:', 'LOGIN_MANAGER.getCurrentUser()');
console.log('- 是否已登录:', 'LOGIN_MANAGER.isLoggedIn()');
console.log('');

// ============================================================================
// 2. 数据服务层示例
// ============================================================================

console.log('【2. 数据服务层】\n');

// 2.1 存储服务（PouchDB）
console.log('2.1 存储服务 (StorageService):');
console.log('- 初始化:', 'await storageService.init(database, remoteURL)');
console.log('- 添加记录:', 'await storageService.addCheckpoint(data)');
console.log('- 更新记录:', 'await storageService.updateCheckpoint(id, updates)');
console.log('- 删除记录:', 'await storageService.deleteCheckpoint(id)');
console.log('- 获取所有记录:', 'await storageService.getAllCheckpoints()');
console.log('- 创建备份:', 'await storageService.createBackup()');
console.log('');

// 2.2 记录服务
console.log('2.2 记录服务 (RecordsService):');
console.log('- 解析记录:', RecordsService.parseRecords());
console.log('- 保存记录:', 'RecordsService.saveRecords(records)');
console.log('- 获取所有记录:', 'RecordsService.getAllRecords()');
console.log('- 根据ID获取:', 'RecordsService.getRecordById(id)');
console.log('- 创建记录:', 'RecordsService.createRecord(data)');
console.log('- 更新记录:', 'RecordsService.updateRecord(id, data)');
console.log('- 删除记录:', 'RecordsService.deleteRecord(id)');
console.log('');

// 2.3 预设服务
console.log('2.3 预设服务 (PresetsService):');
console.log('- 获取所有预设:', PresetsService.getAllPresets());
console.log('- 创建预设:', 'PresetsService.createPreset(className)');
console.log('- 更新预设:', 'PresetsService.updatePreset(oldName, newName)');
console.log('- 删除预设:', 'PresetsService.deletePreset(className)');
console.log('- 应用预设:', 'PresetsService.applyPreset(className)');
console.log('');

// 2.4 用户服务
console.log('2.4 用户服务 (UsersService):');
console.log('- 获取所有用户:', 'UsersService.getAllUsers()');
console.log('- 获取用户:', 'UsersService.getUser(username)');
console.log('- 创建用户:', 'UsersService.createUser(userData)');
console.log('- 更新用户:', 'UsersService.updateUser(username, userData)');
console.log('- 删除用户:', 'UsersService.deleteUser(username)');
console.log('- 获取权限:', 'UsersService.getUserPermissions(username)');
console.log('- 设置权限:', 'UsersService.setUserPermissions(username, role)');
console.log('');

// 2.5 验证服务
console.log('2.5 验证服务 (ValidationService):');
console.log('- 验证规则:', Object.keys(ValidationService.rules));
console.log('- 验证表单:', 'ValidationService.validateForm(formData, rules)');
console.log('- 验证字段:', 'ValidationService.validateField(value, rule)');
console.log('- 验证课堂记录:', 'ValidationService.validateFormData(data)');
console.log('- 检查重复:', 'ValidationService.checkDateDuplicate(date, className, time, records)');
console.log('');

// ============================================================================
// 3. 完整工作流示例
// ============================================================================

console.log('【3. 完整工作流示例】\n');

// 3.1 用户认证流程
console.log('3.1 用户认证流程:');
console.log(`
// 步骤 1: 初始化登录管理器
await LOGIN_MANAGER.init();

// 步骤 2: 用户登录
const loginResult = await LOGIN_MANAGER.login('username', 'password');
if (loginResult.success) {
  console.log('登录成功:', loginResult.user);
}

// 步骤 3: 检查登录状态
if (LOGIN_MANAGER.isLoggedIn()) {
  const currentUser = LOGIN_MANAGER.getCurrentUser();
  console.log('当前用户:', currentUser);
}

// 步骤 4: 登出
LOGIN_MANAGER.logout();
`);

// 3.2 课堂记录管理流程
console.log('3.2 课堂记录管理流程:');
console.log(`
// 步骤 1: 创建课堂记录
const newRecord = {
  className: '跳绳初级班',
  classDate: '2024-01-15',
  classStartTime: '14:00',
  classSize: 20,
  atmosphere: '活跃',
  skillLevel: '初级',
  tricks: ['单摇', '双摇'],
  engagement: 4
};

// 步骤 2: 验证数据
const issues = ValidationService.validateFormData(newRecord);
if (issues.length > 0) {
  console.error('验证失败:', issues);
} else {
  // 步骤 3: 保存记录
  const result = RecordsService.createRecord(newRecord);
  if (result.success) {
    console.log('记录创建成功:', result.record);
  }
}

// 步骤 4: 获取所有记录
const allRecords = RecordsService.getAllRecords();
console.log('所有记录数量:', allRecords.length);

// 步骤 5: 更新记录
const updateResult = RecordsService.updateRecord(recordId, {
  classSize: 22,
  notes: '今天表现很好'
});
`);

// 3.3 班级预设管理流程
console.log('3.3 班级预设管理流程:');
console.log(`
// 步骤 1: 创建班级预设
PresetsService.createPreset('跳绳高级班');

// 步骤 2: 获取所有预设
const presets = PresetsService.getAllPresets();
console.log('班级预设:', presets);

// 步骤 3: 应用预设到表单
const presetName = PresetsService.applyPreset('跳绳高级班');
if (presetName) {
  // 填充表单
  document.getElementById('className').value = presetName;
}
`);

// 3.4 存储管理流程
console.log('3.4 存储管理流程:');
console.log(`
// 步骤 1: 初始化存储管理器
await STORAGE_MANAGER.init();

// 步骤 2: 获取存储统计
const stats = STORAGE_MANAGER.getStats();
console.log('存储使用情况:', stats);

// 步骤 3: 获取课堂记录
const checkpoints = await STORAGE_MANAGER.getCheckpoints();

// 步骤 4: 保存课堂记录
await STORAGE_MANAGER.saveCheckpoints(updatedRecords);

// 步骤 5: 导出备份
const backup = STORAGE_MANAGER.exportBackup();
console.log('备份数据:', backup);
`);

console.log('');
console.log('=== Phase 2 模块示例完成 ===');

// ============================================================================
// 导出所有服务用于外部使用
// ============================================================================

export default {
  // 核心服务
  core: {
    STORAGE_MANAGER,
    AUTH_CONFIG,
    LOGIN_MANAGER
  },
  // 数据服务
  services: {
    StorageService,
    storageService,
    RecordsService,
    PresetsService,
    UsersService,
    ValidationService
  },
  // 工具函数
  utils: {
    hashPasswordCompat,
    loadUsersFromStorage
  }
};

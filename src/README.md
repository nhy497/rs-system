<<<<<<< HEAD
# RS-System 模組化架構

## 目錄結構

```
src/
├── constants/          # 常數定義
│   └── app-constants.js
├── utils/              # 工具函數
│   ├── dom-utils.js    # DOM 操作
│   ├── helpers.js      # 通用輔助
│   ├── formatters.js   # 格式化工具
│   └── validators.js   # 驗證工具
└── examples/           # 使用範例
    └── usage-example.js
```

## 使用方式

### ES Module 導入

```javascript
import { STORAGE_KEY } from './constants/app-constants.js';
import { $, $q } from './utils/dom-utils.js';
import { toast } from './utils/helpers.js';
```

### 瀏覽器使用

```html
<script type="module">
  import { toast } from './src/utils/helpers.js';
  toast('Hello!', 'success');
</script>
```

## 下一步

- 階段 2: 提取核心服務 (STORAGE_MANAGER, LOGIN_MANAGER)
- 階段 3: 提取數據服務層
- 階段 4: 提取 UI 管理層
=======
# RS-System 模块化架构文档

本文档描述了 RS-System（跳绳课堂管理系统）的模块化架构，包括 Phase 1 和 Phase 2 的模块提取。

## 📁 目录结构

```
src/
├── constants/          # 应用常量
│   └── app-constants.js
├── utils/              # 工具函数
│   ├── dom-utils.js
│   ├── helpers.js
│   ├── formatters.js
│   └── validators.js
├── core/               # 核心服务层
│   ├── storage-manager.js
│   ├── auth-config.js
│   └── login-manager.js
├── services/           # 数据服务层
│   ├── storage-service.js
│   ├── records-service.js
│   ├── presets-service.js
│   ├── users-service.js
│   └── validation-service.js
└── examples/           # 使用示例
    ├── usage-example.js
    └── phase2-usage.js
```

---

## 📦 Phase 1 模块（基础层）

### 1.1 常量模块 (`constants/app-constants.js`)

**功能**: 定义应用级别的常量配置

**导出内容**:
- `STORAGE_KEY`: 主存储键名
- `CLASS_PRESETS_KEY`: 班级预设键名
- `SCORE_1_5_IDS`: 1-5 分评分项目列表
- `RANGE_IDS`: 范围评分项目列表
- `OPTION_GROUPS`: 选项分组配置
- `PAGE_TITLES`: 页面标题映射
- `TRICK_LEVELS`: 技巧等级列表

**使用示例**:
```javascript
import { STORAGE_KEY, PAGE_TITLES } from './constants/app-constants.js';
console.log(STORAGE_KEY); // 'rope-skip-checkpoints'
```

---

### 1.2 DOM 工具 (`utils/dom-utils.js`)

**功能**: 提供便捷的 DOM 操作函数

**导出函数**:
- `$(id)`: 根据 ID 获取元素
- `$q(selector)`: 查询单个元素
- `$qa(selector)`: 查询所有匹配元素

**使用示例**:
```javascript
import { $, $q, $qa } from './utils/dom-utils.js';
const el = $('myElement');
const buttons = $qa('button');
```

---

### 1.3 辅助函数 (`utils/helpers.js`)

**功能**: 提供通用辅助函数

**导出函数**:
- `generateId()`: 生成唯一 ID
- `deepClone(obj)`: 深拷贝对象
- `debounce(func, wait)`: 防抖函数
- `throttle(func, limit)`: 节流函数

**使用示例**:
```javascript
import { generateId, deepClone, debounce } from './utils/helpers.js';
const id = generateId();
const copy = deepClone(originalObject);
const debouncedFn = debounce(() => console.log('执行'), 300);
```

---

### 1.4 格式化工具 (`utils/formatters.js`)

**功能**: 数据格式化工具函数

**导出函数**:
- `formatDate(date, format)`: 格式化日期
- `formatFileSize(bytes)`: 格式化文件大小
- `formatNumber(num)`: 格式化数字（千分位）
- `formatRelativeTime(date)`: 格式化相对时间

**使用示例**:
```javascript
import { formatDate, formatFileSize } from './utils/formatters.js';
formatDate(new Date(), 'YYYY-MM-DD'); // '2024-01-15'
formatFileSize(1024 * 1024); // '1 MB'
```

---

### 1.5 验证工具 (`utils/validators.js`)

**功能**: 数据验证工具函数

**导出函数**:
- `isRequired(value)`: 必填验证
- `isValidDate(dateStr)`: 日期格式验证
- `isValidTime(timeStr)`: 时间格式验证
- `isValidEmail(email)`: 邮箱验证
- `isValidPhone(phone)`: 手机号验证
- `isValidUrl(url)`: URL 验证

**使用示例**:
```javascript
import { isRequired, isValidEmail } from './utils/validators.js';
isRequired(''); // false
isValidEmail('test@example.com'); // true
```

---

## 🔧 Phase 2 模块（核心服务层）

### 2.1 存储管理器 (`core/storage-manager.js`)

**源代码位置**: `system.js` L56-446

**功能**: 统一管理 LocalStorage 操作，包括缓存、备份和跨标签页同步

**主要方法**:
- `init()`: 初始化存储管理器
- `getCheckpoints(userId)`: 获取课堂记录
- `saveCheckpoints(records)`: 保存课堂记录
- `getPresets()`: 获取班级预设
- `savePresets(presets)`: 保存班级预设
- `loadCache()`: 加载缓存
- `clearAll()`: 清除所有数据
- `getStats()`: 获取存储统计
- `setupSync()`: 设置跨标签页同步

**使用示例**:
```javascript
import { STORAGE_MANAGER } from './core/storage-manager.js';

await STORAGE_MANAGER.init();
const records = await STORAGE_MANAGER.getCheckpoints();
await STORAGE_MANAGER.saveCheckpoints(updatedRecords);
const stats = STORAGE_MANAGER.getStats();
```

---

### 2.2 认证配置 (`core/auth-config.js`)

**源代码位置**: `system.js` L448-574

**功能**: 密码加密、用户数据加载和认证配置

**导出内容**:
- `AUTH_CONFIG`: 认证配置对象
- `hashPasswordCompat(password)`: 密码哈希函数
- `loadUsersFromStorage()`: 加载用户数据
- `saveUsersToStorage(users)`: 保存用户数据

**使用示例**:
```javascript
import { AUTH_CONFIG, hashPasswordCompat, loadUsersFromStorage } from './core/auth-config.js';

console.log(AUTH_CONFIG.SESSION_TIMEOUT); // 86400000
const hash = hashPasswordCompat('mypassword');
const users = loadUsersFromStorage();
```

---

### 2.3 登录管理器 (`core/login-manager.js`)

**源代码位置**: `system.js` L579-828

**功能**: 处理用户认证、会话管理和权限检查

**主要方法**:
- `init()`: 初始化登录管理器
- `login(username, password)`: 用户登录
- `logout()`: 用户登出
- `checkSession()`: 检查会话有效性
- `getCurrentUser()`: 获取当前用户
- `isLoggedIn()`: 检查是否已登录
- `verifyPassword(password, hash)`: 验证密码

**使用示例**:
```javascript
import { LOGIN_MANAGER } from './core/login-manager.js';

await LOGIN_MANAGER.init();
const result = await LOGIN_MANAGER.login('username', 'password');
if (result.success) {
  console.log('登录成功', result.user);
}
const user = LOGIN_MANAGER.getCurrentUser();
LOGIN_MANAGER.logout();
```

---

## 🗄️ Phase 2 模块（数据服务层）

### 2.4 存储服务 (`services/storage-service.js`)

**源代码位置**: `system.js` L1206-1418

**功能**: PouchDB 数据库操作和云端同步

**主要方法**:
- `init(database, remoteURL)`: 初始化服务
- `addCheckpoint(data)`: 添加课堂记录
- `updateCheckpoint(id, updates)`: 更新记录
- `deleteCheckpoint(id)`: 删除记录
- `getAllCheckpoints()`: 获取所有记录
- `createBackup()`: 创建备份
- `onChange(callback)`: 注册变更监听

**使用示例**:
```javascript
import { storageService } from './services/storage-service.js';

await storageService.init(db);
const result = await storageService.addCheckpoint(checkpointData);
const all = await storageService.getAllCheckpoints();
```

---

### 2.5 记录服务 (`services/records-service.js`)

**源代码位置**: `system.js` L2243-2343

**功能**: 课堂记录的完整 CRUD 操作

**主要方法**:
- `parseRecords()`: 解析课堂记录
- `saveRecords(records)`: 保存记录
- `getAllRecords()`: 获取所有记录
- `getRecordById(id)`: 根据 ID 获取
- `createRecord(data)`: 创建新记录
- `updateRecord(id, data)`: 更新记录
- `deleteRecord(id)`: 删除记录

**使用示例**:
```javascript
import { RecordsService } from './services/records-service.js';

const records = RecordsService.getAllRecords();
const result = RecordsService.createRecord({
  className: '跳绳初级班',
  classDate: '2024-01-15'
});
RecordsService.updateRecord(recordId, { classSize: 22 });
```

---

### 2.6 预设服务 (`services/presets-service.js`)

**源代码位置**: `system.js` L1459-1486

**功能**: 班级预设管理

**主要方法**:
- `getAllPresets()`: 获取所有预设
- `getPreset(className)`: 获取单个预设
- `createPreset(className)`: 创建预设
- `updatePreset(oldName, newName)`: 更新预设
- `deletePreset(className)`: 删除预设
- `applyPreset(className)`: 应用预设

**使用示例**:
```javascript
import { PresetsService } from './services/presets-service.js';

PresetsService.createPreset('跳绳高级班');
const presets = PresetsService.getAllPresets();
PresetsService.applyPreset('跳绳高级班');
```

---

### 2.7 用户服务 (`services/users-service.js`)

**源代码位置**: 基于 `auth-config.js` 的用户管理函数

**功能**: 用户 CRUD 操作和权限管理

**主要方法**:
- `getAllUsers()`: 获取所有用户
- `getUser(username)`: 获取用户
- `createUser(userData)`: 创建用户
- `updateUser(username, userData)`: 更新用户
- `deleteUser(username)`: 删除用户
- `getUserPermissions(username)`: 获取权限
- `setUserPermissions(username, role)`: 设置权限

**使用示例**:
```javascript
import { UsersService } from './services/users-service.js';

const users = UsersService.getAllUsers();
const result = UsersService.createUser({
  username: 'newuser',
  password: 'password123',
  email: 'user@example.com'
});
UsersService.setUserPermissions('newuser', 'admin');
```

---

### 2.8 验证服务 (`services/validation-service.js`)

**源代码位置**: `system.js` L1488-1520

**功能**: 表单数据验证

**主要方法**:
- `validateForm(formData, rules)`: 验证表单
- `validateField(value, rule)`: 验证单个字段
- `validateFormData(data)`: 验证课堂记录数据
- `checkDateDuplicate(date, className, time, records)`: 检查日期重复
- `getErrorMessage(ruleType, fieldName)`: 获取错误消息

**使用示例**:
```javascript
import { ValidationService } from './services/validation-service.js';

const issues = ValidationService.validateFormData({
  classDate: '2024-01-15',
  className: '跳绳初级班'
});
if (issues.length > 0) {
  console.error('验证失败:', issues);
}
```

---

## 🔗 模块依赖关系

```
依赖层次（从底层到顶层）:

1. 基础层（无依赖）
   - constants/app-constants.js
   - utils/dom-utils.js
   - utils/helpers.js
   - utils/formatters.js
   - utils/validators.js

2. 核心服务层
   - core/auth-config.js (依赖: 无)
   - core/storage-manager.js (依赖: app-constants)
   - core/login-manager.js (依赖: auth-config)

3. 数据服务层
   - services/storage-service.js (依赖: 无，可独立使用)
   - services/presets-service.js (依赖: app-constants)
   - services/users-service.js (依赖: auth-config)
   - services/validation-service.js (依赖: validators)
   - services/records-service.js (依赖: app-constants, formatters)
```

---

## 📝 使用指南

### 在 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>RS-System</title>
</head>
<body>
  <script type="module">
    import { STORAGE_MANAGER } from './src/core/storage-manager.js';
    import { RecordsService } from './src/services/records-service.js';
    
    // 初始化
    await STORAGE_MANAGER.init();
    
    // 使用服务
    const records = RecordsService.getAllRecords();
    console.log('记录数量:', records.length);
  </script>
</body>
</html>
```

### 在 Node.js 中使用

```javascript
// 注意: 某些模块依赖浏览器 API（如 localStorage），需要模拟环境
import { formatDate, formatFileSize } from './src/utils/formatters.js';
import { isValidEmail, isRequired } from './src/utils/validators.js';

console.log(formatDate(new Date(), 'YYYY-MM-DD'));
console.log(isValidEmail('test@example.com'));
```

---

## ✅ 验收标准

- [x] 所有 13 个模块文件已创建
- [x] 每个模块都有完整的 JSDoc 注释
- [x] 所有依赖关系正确导入
- [x] 无循环依赖问题
- [x] 使用示例文件完整
- [x] 文档详细说明 API 和用法
- [x] `system.js` 未被修改（零破坏性变更）

---

## 🚀 后续计划

1. 添加单元测试
2. 添加 TypeScript 类型定义
3. 创建自动化构建流程
4. 完善错误处理机制
5. 添加更多使用示例

---

## 📖 参考资料

- [ES6 模块文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [JSDoc 注释规范](https://jsdoc.app/)
- [localStorage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)
- [PouchDB 文档](https://pouchdb.com/guides/)
>>>>>>> origin/copilot/modularize-core-data-services

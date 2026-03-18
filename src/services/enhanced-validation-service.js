/**
 * 增強數據驗證服務
 * 提供全面的客戶端和服務器端數據驗證
 * @module EnhancedValidationService
 */

import { escapeHtml } from '../utils/helpers.js';

/**
 * 驗證規則配置
 */
const VALIDATION_RULES = {
  // 用戶名驗證
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
    message: '用戶名必須為3-20個字符，只能包含字母、數字、下劃線和中文字符'
  },

  // 密碼驗證
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: '密碼必須至少8個字符，包含大小寫字母和數字'
  },

  // 郵箱驗證
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '請輸入有效的郵箱地址'
  },

  // 班級名稱驗證
  className: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[\s\S]{1,50}$/,
    sanitize: true,
    message: '班級名稱不能為空且不超過50個字符'
  },

  // 課堂日期驗證
  classDate: {
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: '請輸入有效的日期格式 (YYYY-MM-DD)'
  },

  // 人數驗證
  classSize: {
    required: false,
    min: 1,
    max: 100,
    type: 'number',
    message: '人數必須為1-100之間的數字'
  },

  // 備註驗證
  notes: {
    required: false,
    maxLength: 1000,
    sanitize: true,
    message: '備註不能超過1000個字符'
  }
};

/**
 * 增強驗證服務類
 */
class EnhancedValidationService {
  constructor() {
    this.rules = { ...VALIDATION_RULES };
    this.customValidators = new Map();
  }

  /**
   * 驗證單個字段
   * @param {string} fieldName - 字段名稱
   * @param {any} value - 字段值
   * @param {Object} options - 驗證選項
   * @returns {Object} 驗證結果
   */
  validateField(fieldName, value, options = {}) {
    const rule = this.rules[fieldName];
    if (!rule) {
      return { valid: true, message: '' };
    }

    const result = {
      valid: true,
      message: '',
      sanitizedValue: value
    };

    try {
      // 必填檢查
      if (rule.required && (value === undefined || value === null || value === '')) {
        result.valid = false;
        result.message = `${fieldName} 為必填項`;
        return result;
      }

      // 如果不是必填且為空，跳過其他驗證
      if (!rule.required && (value === undefined || value === null || value === '')) {
        return result;
      }

      // 類型檢查
      if (rule.type && typeof value !== rule.type) {
        result.valid = false;
        result.message = rule.message || `${fieldName} 類型錯誤`;
        return result;
      }

      // 長度檢查
      if (rule.minLength && value.length < rule.minLength) {
        result.valid = false;
        result.message = rule.message || `${fieldName} 長度不能少於 ${rule.minLength}`;
        return result;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        result.valid = false;
        result.message = rule.message || `${fieldName} 長度不能超過 ${rule.maxLength}`;
        return result;
      }

      // 數值範圍檢查
      if (rule.min !== undefined && value < rule.min) {
        result.valid = false;
        result.message = rule.message || `${fieldName} 不能小於 ${rule.min}`;
        return result;
      }

      if (rule.max !== undefined && value > rule.max) {
        result.valid = false;
        result.message = rule.message || `${fieldName} 不能大於 ${rule.max}`;
        return result;
      }

      // 正則表達式檢查
      if (rule.pattern && !rule.pattern.test(value)) {
        result.valid = false;
        result.message = rule.message || `${fieldName} 格式不正確`;
        return result;
      }

      // 數據清理
      if (rule.sanitize && typeof value === 'string') {
        result.sanitizedValue = this.sanitizeInput(value);
      }

      // 自定義驗證器
      if (this.customValidators.has(fieldName)) {
        const customValidator = this.customValidators.get(fieldName);
        const customResult = customValidator(value, options);
        if (!customResult.valid) {
          result.valid = false;
          result.message = customResult.message;
          return result;
        }
      }

    } catch (error) {
      console.error(`❌ 驗證字段 ${fieldName} 時發生錯誤:`, error);
      result.valid = false;
      result.message = '驗證過程中發生錯誤';
    }

    return result;
  }

  /**
   * 驗證對象數據
   * @param {Object} data - 要驗證的數據對象
   * @param {Object} schema - 驗證模式
   * @returns {Object} 驗證結果
   */
  validateObject(data, schema = null) {
    const errors = {};
    const sanitizedData = {};
    let isValid = true;

    const fieldsToValidate = schema || Object.keys(this.rules);

    for (const fieldName of fieldsToValidate) {
      const fieldValue = data[fieldName];
      const result = this.validateField(fieldName, fieldValue);

      if (!result.valid) {
        errors[fieldName] = result.message;
        isValid = false;
      }

      sanitizedData[fieldName] = result.sanitizedValue;
    }

    return {
      valid: isValid,
      errors,
      sanitizedData,
      originalData: data
    };
  }

  /**
   * 清理輸入數據
   * @param {string} input - 原始輸入
   * @returns {string} 清理後的輸入
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .trim()
      .replace(/\s+/g, ' ') // 合併多個空格
      .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
      .replace(/[<>]/g, ''); // 移除潛在的HTML標籤字符
  }

  /**
   * 添加自定義驗證器
   * @param {string} fieldName - 字段名稱
   * @param {Function} validator - 驗證函數
   */
  addCustomValidator(fieldName, validator) {
    this.customValidators.set(fieldName, validator);
  }

  /**
   * 移除自定義驗證器
   * @param {string} fieldName - 字段名稱
   */
  removeCustomValidator(fieldName) {
    this.customValidators.delete(fieldName);
  }

  /**
   * 驗證課堂記錄
   * @param {Object} record - 課堂記錄
   * @returns {Object} 驗證結果
   */
  validateClassRecord(record) {
    const schema = ['className', 'classDate', 'classSize', 'notes'];
    const result = this.validateObject(record, schema);

    // 額外的業務邏輯驗證
    if (result.valid) {
      // 檢查日期是否為未來日期
      const classDate = new Date(record.classDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (classDate > today) {
        result.valid = false;
        result.errors.classDate = '課堂日期不能是未來日期';
      }

      // 檢查花式數據
      if (record.tricks && Array.isArray(record.tricks)) {
        for (let i = 0; i < record.tricks.length; i++) {
          const trick = record.tricks[i];
          if (!trick.name || trick.name.trim() === '') {
            result.valid = false;
            result.errors[`tricks.${i}.name`] = '花式名稱不能為空';
          }
        }
      }
    }

    return result;
  }

  /**
   * 驗證用戶註冊數據
   * @param {Object} userData - 用戶數據
   * @returns {Object} 驗證結果
   */
  validateUserRegistration(userData) {
    const schema = ['username', 'password', 'email'];
    const result = this.validateObject(userData, schema);

    // 檢查用戶名是否包含敏感詞
    const sensitiveWords = ['admin', 'root', 'system', 'creator'];
    if (result.valid && userData.username) {
      const username = userData.username.toLowerCase();
      if (sensitiveWords.some(word => username.includes(word))) {
        result.valid = false;
        result.errors.username = '用戶名不能包含敏感詞';
      }
    }

    return result;
  }

  /**
   * 生成驗證錯誤摘要
   * @param {Object} errors - 錯誤對象
   * @returns {string} 錯誤摘要
   */
  generateErrorSummary(errors) {
    const errorMessages = Object.values(errors);
    if (errorMessages.length === 0) {
      return '';
    }

    return `發現 ${errorMessages.length} 個錯誤：\n${errorMessages.map((msg, index) => `${index + 1}. ${msg}`).join('\n')}`;
  }
}

// 創建單例實例
const enhancedValidationService = new EnhancedValidationService();

// 添加一些常用的自定義驗證器
enhancedValidationService.addCustomValidator('confirmPassword', (value, options) => {
  if (options.password && value !== options.password) {
    return { valid: false, message: '確認密碼不匹配' };
  }
  return { valid: true };
});

export default enhancedValidationService;
export { EnhancedValidationService, VALIDATION_RULES };

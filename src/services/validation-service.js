/**
 * 驗證服務 - 表單數據驗證
 * @module services/validation-service
 */

import { isRequired, isValidDate, isValidTime } from '../utils/validators.js';

/**
 * 驗證服務對象
 * 提供表單驗證規則和驗證邏輯
 */
export const ValidationService = {
  /**
   * 驗證規則
   */
  rules: {
    required: (value) => isRequired(value),
    date: (value) => isValidDate(value),
    time: (value) => isValidTime(value),
    range: (value, min, max) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    minLength: (value, length) => {
      return value && value.length >= length;
    },
    maxLength: (value, length) => {
      return value && value.length <= length;
    }
  },

  /**
   * 驗證表單數據
   * @param {Object} formData - 表單數據
   * @param {Object} rules - 驗證規則對象
   * @returns {Array} 驗證問題數組
   */
  validateForm(formData, rules) {
    const issues = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = formData[field];
      const result = this.validateField(value, rule);
      
      if (!result.valid) {
        issues.push({
          field: field,
          message: result.message || this.getErrorMessage(rule.type, field)
        });
      }
    }
    
    return issues;
  },

  /**
   * 驗證單個字段
   * @param {*} value - 字段值
   * @param {Object|Function} rule - 驗證規則
   * @returns {Object} 驗證結果對象
   */
  validateField(value, rule) {
    if (typeof rule === 'function') {
      const valid = rule(value);
      return { valid, message: valid ? null : '驗證失敗' };
    }
    
    if (typeof rule === 'object') {
      const { type, params, message } = rule;
      const validator = this.rules[type];
      
      if (!validator) {
        return { valid: true };
      }
      
      const valid = params ? validator(value, ...params) : validator(value);
      return { valid, message: message || null };
    }
    
    return { valid: true };
  },

  /**
   * 驗證課堂記錄表單數據
   * @param {Object} data - 表單數據
   * @returns {Array} 驗證問題數組
   */
  validateFormData(data) {
    const issues = [];
    
    if (!data.classDate) {
      issues.push({ field: 'classDate', message: '課堂日期為必填' });
    }
    
    if (data.tricks && data.tricks.length === 0) {
      issues.push({ field: 'tricks', message: '未記錄任何教學花式' });
    }
    
    if (data.classSize === null || data.classSize === '') {
      issues.push({ field: 'classSize', message: '人數未填寫' });
    }
    
    if (data.atmosphere === '') {
      issues.push({ field: 'atmosphere', message: '課堂氣氛未選擇' });
    }
    
    if (data.skillLevel === '') {
      issues.push({ field: 'skillLevel', message: '技巧等級未選擇' });
    }
    
    if (data.engagement && (data.engagement < 1 || data.engagement > 5)) {
      issues.push({ field: 'engagement', message: '開心指數必須在 1-5 之間' });
    }
    
    return issues;
  },

  /**
   * 獲取錯誤消息
   * @param {string} ruleType - 規則類型
   * @param {string} fieldName - 字段名稱
   * @returns {string} 錯誤消息
   */
  getErrorMessage(ruleType, fieldName) {
    const messages = {
      required: `${fieldName} 為必填項`,
      date: `${fieldName} 日期格式無效`,
      time: `${fieldName} 時間格式無效`,
      range: `${fieldName} 超出有效範圍`,
      minLength: `${fieldName} 長度不足`,
      maxLength: `${fieldName} 長度過長`
    };
    
    return messages[ruleType] || `${fieldName} 驗證失敗`;
  },

  /**
   * 將時間字符串轉換為分鐘數
   * @param {string} timeStr - 時間字符串（HH:mm）
   * @returns {number} 分鐘數
   */
  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  },

  /**
   * 檢查日期重複
   * @param {string} dateStr - 日期字符串
   * @param {string} className - 班級名稱
   * @param {string} startTime - 開始時間
   * @param {Array} records - 記錄數組
   * @returns {Array} 重複的記錄數組
   */
  checkDateDuplicate(dateStr, className, startTime = '', records = []) {
    const sameDay = records.filter(r => 
      r.classDate === dateStr && r.className === className
    );
    
    if (sameDay.length === 0) return [];
    if (!startTime) return sameDay;
    
    const currentMins = this.timeToMinutes(startTime);
    return sameDay.filter(r => {
      const recordMins = this.timeToMinutes(r.classStartTime || '');
      return Math.abs(recordMins - currentMins) < 60;
    });
  }
};

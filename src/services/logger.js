/**
 * 日誌記錄系統
 * v1.0: 教練操作日誌、系統事件日誌、管理員審計日誌
 * 支持本地查看和CSV導出
 */

const LOGGER_CONFIG = {
  STORAGE_KEYS: {
    COACH_LOGS: 'rs-system-coach-logs',
    SYSTEM_LOGS: 'rs-system-system-logs',
    AUDIT_LOGS: 'rs-system-audit-logs'
  },
  MAX_LOGS_PER_CATEGORY: 1000,
  LOG_RETENTION_DAYS: 90
};

/**
 * 日誌服務 - 統一日誌管理
 */
class LoggerService {
  constructor() {
    this.coachLogs = [];
    this.systemLogs = [];
    this.auditLogs = [];
    this._loadLogs();
  }

  /**
   * 從本地儲存加載所有日誌
   * @private
   */
  _loadLogs() {
    try {
      const coach = localStorage.getItem(LOGGER_CONFIG.STORAGE_KEYS.COACH_LOGS);
      const system = localStorage.getItem(LOGGER_CONFIG.STORAGE_KEYS.SYSTEM_LOGS);
      const audit = localStorage.getItem(LOGGER_CONFIG.STORAGE_KEYS.AUDIT_LOGS);

      this.coachLogs = coach ? JSON.parse(decodeURIComponent(atob(coach))) : [];
      this.systemLogs = system ? JSON.parse(decodeURIComponent(atob(system))) : [];
      this.auditLogs = audit ? JSON.parse(decodeURIComponent(atob(audit))) : [];

      console.log('✅ 日誌已加載');
    } catch (error) {
      console.error('❌ 加載日誌失敗:', error);
      this.coachLogs = [];
      this.systemLogs = [];
      this.auditLogs = [];
    }
  }

  /**
   * 保存日誌到本地儲存
   * @private
   */
  _saveLogs() {
    try {
      localStorage.setItem(
        LOGGER_CONFIG.STORAGE_KEYS.COACH_LOGS,
        btoa(encodeURIComponent(JSON.stringify(this.coachLogs)))
      );
      localStorage.setItem(
        LOGGER_CONFIG.STORAGE_KEYS.SYSTEM_LOGS,
        btoa(encodeURIComponent(JSON.stringify(this.systemLogs)))
      );
      localStorage.setItem(
        LOGGER_CONFIG.STORAGE_KEYS.AUDIT_LOGS,
        btoa(encodeURIComponent(JSON.stringify(this.auditLogs)))
      );
    } catch (error) {
      console.error('❌ 保存日誌失敗:', error);
    }
  }

  /**
   * 清理過期日誌
   * @private
   */
  _cleanupLogs() {
    const cutoffTime = Date.now() - (LOGGER_CONFIG.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    this.coachLogs = this.coachLogs.filter(log => new Date(log.timestamp).getTime() > cutoffTime);
    this.systemLogs = this.systemLogs.filter(log => new Date(log.timestamp).getTime() > cutoffTime);
    this.auditLogs = this.auditLogs.filter(log => new Date(log.timestamp).getTime() > cutoffTime);

    // 限制日誌數量
    this.coachLogs = this.coachLogs.slice(-LOGGER_CONFIG.MAX_LOGS_PER_CATEGORY);
    this.systemLogs = this.systemLogs.slice(-LOGGER_CONFIG.MAX_LOGS_PER_CATEGORY);
    this.auditLogs = this.auditLogs.slice(-LOGGER_CONFIG.MAX_LOGS_PER_CATEGORY);
  }

  /**
   * 記錄教練操作
   * @param {string} action - 操作類型（save, delete, export, load等）
   * @param {string} details - 詳細信息
   * @param {object} metadata - 元數據（班級、日期等）
   */
  logCoachAction(action, details, metadata = {}) {
    try {
      const currentUser = this._getCurrentUser();
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId: currentUser?.id || 'unknown',
        username: currentUser?.username || '未知用戶',
        action,
        details,
        metadata,
        ipHash: this._getIpHash()
      };

      this.coachLogs.push(logEntry);
      this._cleanupLogs();
      this._saveLogs();

      console.log(`✅ [教練日誌] ${action}: ${details}`);
      return logEntry;
    } catch (error) {
      console.error('❌ 教練日誌記錄失敗:', error);
    }
  }

  /**
   * 記錄系統事件
   * @param {string} eventType - 事件類型（login, logout, error, init等）
   * @param {string} description - 事件描述
   * @param {string} severity - 嚴重級別（info, warning, error, critical）
   */
  logSystemEvent(eventType, description, severity = 'info') {
    try {
      const currentUser = this._getCurrentUser();
      const logEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        description,
        severity,
        userId: currentUser?.id || 'system',
        username: currentUser?.username || '系統',
        ipHash: this._getIpHash(),
        userAgent: navigator.userAgent.substring(0, 100)
      };

      this.systemLogs.push(logEntry);
      this._cleanupLogs();
      this._saveLogs();

      const icon = { info: 'ℹ️', warning: '⚠️', error: '❌', critical: '🚨' }[severity] || 'ℹ️';
      console.log(`${icon} [系統事件] ${eventType}: ${description}`);
      return logEntry;
    } catch (error) {
      console.error('❌ 系統事件記錄失敗:', error);
    }
  }

  /**
   * 記錄管理員審計日誌
   * @param {string} action - 操作類型（user_delete, user_create, data_export, data_clear等）
   * @param {object} target - 操作對象
   * @param {string} reason - 操作原因
   * @param {boolean} success - 是否成功
   */
  logAuditAction(action, target, reason = '', success = true) {
    try {
      const currentUser = this._getCurrentUser();

      // 僅管理員可記錄審計日誌
      if (currentUser?.role !== 'creator') {
        console.warn('⚠️ 非管理員無法記錄審計日誌');
        return null;
      }

      const auditEntry = {
        timestamp: new Date().toISOString(),
        adminId: currentUser.id,
        adminUsername: currentUser.username,
        action,
        target,
        reason,
        success,
        ipHash: this._getIpHash(),
        changesSummary: this._generateChangeSummary(action, target)
      };

      this.auditLogs.push(auditEntry);
      this._cleanupLogs();
      this._saveLogs();

      const status = success ? '✅' : '❌';
      console.log(`${status} [審計] ${action}: ${JSON.stringify(target).substring(0, 50)}`);
      return auditEntry;
    } catch (error) {
      console.error('❌ 審計日誌記錄失敗:', error);
    }
  }

  /**
   * 生成變更摘要
   * @private
   */
  _generateChangeSummary(action, target) {
    const summary = {};
    switch (action) {
    case 'user_delete':
      summary.deletedUser = target.username;
      summary.deletedAt = new Date().toISOString();
      break;
    case 'user_create':
      summary.newUser = target.username;
      summary.role = target.role;
      break;
    case 'data_export':
      summary.recordCount = target.count || 0;
      summary.format = target.format || 'csv';
      break;
    case 'data_clear':
      summary.clearedCount = target.count || 0;
      break;
    default:
      summary.action = action;
      summary.target = target;
    }
    return summary;
  }

  /**
   * 獲取教練日誌
   * @param {object} filters - 篩選條件
   * @returns {array}
   */
  getCoachLogs(filters = {}) {
    let logs = [...this.coachLogs];

    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }
    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 獲取系統事件日誌
   * @param {object} filters - 篩選條件
   * @returns {array}
   */
  getSystemLogs(filters = {}) {
    let logs = [...this.systemLogs];

    if (filters.severity) {
      logs = logs.filter(log => log.severity === filters.severity);
    }
    if (filters.eventType) {
      logs = logs.filter(log => log.eventType === filters.eventType);
    }
    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 獲取審計日誌（僅管理員可訪問）
   * @param {object} filters - 篩選條件
   * @returns {array}
   */
  getAuditLogs(filters = {}) {
    const currentUser = this._getCurrentUser();
    if (currentUser?.role !== 'creator') {
      console.warn('⚠️ 非管理員無法訪問審計日誌');
      return [];
    }

    let logs = [...this.auditLogs];

    if (filters.adminId) {
      logs = logs.filter(log => log.adminId === filters.adminId);
    }
    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }
    if (filters.success !== undefined) {
      logs = logs.filter(log => log.success === filters.success);
    }
    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 導出日誌為 CSV
   * @param {string} logType - 日誌類型（coach, system, audit）
   * @returns {string}
   */
  exportLogsAsCSV(logType = 'coach') {
    let logs = [];
    let headers = [];

    switch (logType) {
    case 'coach':
      logs = this.coachLogs;
      headers = ['時間戳', '用戶ID', '用戶名', '操作類型', '詳細信息', '班級', '日期', 'IP雜湊'];
      break;
    case 'system':
      logs = this.systemLogs;
      headers = ['時間戳', '事件類型', '描述', '嚴重級別', '用戶名', 'IP雜湊'];
      break;
    case 'audit':
      const currentUser = this._getCurrentUser();
      if (currentUser?.role !== 'creator') {
        throw new Error('非管理員無法導出審計日誌');
      }
      logs = this.auditLogs;
      headers = ['時間戳', '管理員名', '操作類型', '操作對象', '操作原因', '成功', '變更摘要'];
      break;
    default:
      throw new Error('未知的日誌類型');
    }

    const rows = logs.map(log => {
      switch (logType) {
      case 'coach':
        return [
          log.timestamp,
          log.userId,
          log.username,
          log.action,
          log.details,
          log.metadata?.className || '',
          log.metadata?.date || '',
          log.ipHash
        ];
      case 'system':
        return [
          log.timestamp,
          log.eventType,
          log.description,
          log.severity,
          log.username,
          log.ipHash
        ];
      case 'audit':
        return [
          log.timestamp,
          log.adminUsername,
          log.action,
          JSON.stringify(log.target),
          log.reason,
          log.success ? '是' : '否',
          JSON.stringify(log.changesSummary)
        ];
      }
    });

    const csv = [headers].concat(rows).map(row =>
      row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return `\uFEFF${csv}`; // UTF-8 BOM
  }

  /**
   * 清理指定類型的日誌
   * @param {string} logType - 日誌類型
   * @param {object} filters - 篩選條件
   */
  clearLogs(logType = 'coach', filters = {}) {
    const currentUser = this._getCurrentUser();
    if (currentUser?.role !== 'creator') {
      console.warn('⚠️ 非管理員無法清理日誌');
      return false;
    }

    let count = 0;

    switch (logType) {
    case 'coach':
      count = this.coachLogs.length;
      this.coachLogs = [];
      break;
    case 'system':
      count = this.systemLogs.length;
      this.systemLogs = [];
      break;
    case 'audit':
      count = this.auditLogs.length;
      this.auditLogs = [];
      break;
    default:
      return false;
    }

    this._saveLogs();
    this.logAuditAction('logs_cleared', { logType, count }, '日誌清理');
    console.log(`✅ 已清理 ${count} 條${logType}日誌`);
    return true;
  }

  /**
   * 獲取統計信息
   * @returns {object}
   */
  getStats() {
    return {
      coachLogsCount: this.coachLogs.length,
      systemLogsCount: this.systemLogs.length,
      auditLogsCount: this.auditLogs.length,
      oldestCoachLog: this.coachLogs[0]?.timestamp || null,
      newestCoachLog: this.coachLogs[this.coachLogs.length - 1]?.timestamp || null,
      systemErrorCount: this.systemLogs.filter(log => log.severity === 'error' || log.severity === 'critical').length
    };
  }

  /**
   * 獲取當前用戶信息
   * @private
   */
  _getCurrentUser() {
    try {
      const userStr = localStorage.getItem('current-user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * 獲取IP雜湊（用於跟蹤）
   * @private
   */
  _getIpHash() {
    const ua = navigator.userAgent;
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const combined = ua + lang + tz;
    let hash = 0;

    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

// 全局實例
const loggerService = new LoggerService();

/**
 * 便捷函數
 */
window.logAction = (action, details, metadata) => loggerService.logCoachAction(action, details, metadata);
window.logEvent = (eventType, description, severity) => loggerService.logSystemEvent(eventType, description, severity);
window.logAudit = (action, target, reason, success) => loggerService.logAuditAction(action, target, reason, success);

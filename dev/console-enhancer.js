/**
 * 📝 主控台輸出增強器
 * 提供人性化的主控台訊息，方便開發和除錯
 * 
 * 使用方法：
 * console.success('操作成功');
 * console.error_('發生錯誤');
 * console.info_('提示訊息');
 * console.warn_('警告訊息');
 */

(function() {
  'use strict';

  // 色彩定義
  const COLORS = {
    SUCCESS: '#10b981',    // 綠色
    ERROR: '#ef4444',      // 紅色
    WARNING: '#f59e0b',    // 橘色
    INFO: '#3b82f6',       // 藍色
    DEBUG: '#8b5cf6',      // 紫色
    SYSTEM: '#667eea',     // 藍紫色
    DATA: '#06b6d4',       // 青色
    MUTED: '#64748b'       // 灰色
  };

  // Emoji 定義
  const EMOJI = {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️ ',
    INFO: 'ℹ️ ',
    DEBUG: '🐛',
    LOADING: '⌛',
    ROCKET: '🚀',
    PACKAGE: '📦',
    CHART: '📊',
    USER: '👤',
    LOCK: '🔒',
    KEY: '🔑',
    MAIL: '📧',
    BELL: '🔔',
    SYNC: '🔄',
    BROADCAST: '📡',
    SAVE: '💾',
    TRASH: '🗑️ ',
    SEARCH: '🔍',
    CHECK: '✔️ ',
    CROSS: '❌',
    ARROW: '➡️ ',
    SPARKLES: '✨',
    FIRE: '🔥',
    STAR: '⭐',
    GEAR: '⚙️ ',
    PLUG: '🔌',
    POWER: '⚡'
  };

  // 格式化樣式
  const styles = {
    header: (color) => `color: ${color}; font-size: 16px; font-weight: bold;`,
    subheader: (color) => `color: ${color}; font-size: 14px; font-weight: bold;`,
    normal: (color) => `color: ${color}; font-size: 12px;`,
    bold: (color) => `color: ${color}; font-size: 12px; font-weight: bold;`,
    muted: `color: ${COLORS.MUTED}; font-size: 11px;`,
    separator: `color: ${COLORS.MUTED};`
  };

  // 分隔線
  const separator = '━'.repeat(60);
  const thinSeparator = '─'.repeat(60);

  // 擴充 console 對象
  console.success = function(message, ...args) {
    console.log(
      `%c${EMOJI.SUCCESS} ${message}`,
      styles.normal(COLORS.SUCCESS),
      ...args
    );
  };

  console.error_ = function(message, ...args) {
    console.log(
      `%c${EMOJI.ERROR} ${message}`,
      styles.normal(COLORS.ERROR),
      ...args
    );
  };

  console.warn_ = function(message, ...args) {
    console.log(
      `%c${EMOJI.WARNING} ${message}`,
      styles.normal(COLORS.WARNING),
      ...args
    );
  };

  console.info_ = function(message, ...args) {
    console.log(
      `%c${EMOJI.INFO} ${message}`,
      styles.normal(COLORS.INFO),
      ...args
    );
  };

  console.debug_ = function(message, ...args) {
    console.log(
      `%c${EMOJI.DEBUG} ${message}`,
      styles.normal(COLORS.DEBUG),
      ...args
    );
  };

  // 系統事件
  console.system = function(message, ...args) {
    console.log(
      `%c${EMOJI.GEAR} ${message}`,
      styles.bold(COLORS.SYSTEM),
      ...args
    );
  };

  // 數據操作
  console.data = function(message, data) {
    console.log(
      `%c${EMOJI.PACKAGE} ${message}`,
      styles.normal(COLORS.DATA)
    );
    if (data) {
      console.table(data);
    }
  };

  // 使用者操作
  console.user = function(message, ...args) {
    console.log(
      `%c${EMOJI.USER} ${message}`,
      styles.normal(COLORS.INFO),
      ...args
    );
  };

  // 認證相關
  console.auth = function(message, ...args) {
    console.log(
      `%c${EMOJI.KEY} ${message}`,
      styles.normal(COLORS.INFO),
      ...args
    );
  };

  // 同步事件
  console.sync = function(message, ...args) {
    console.log(
      `%c${EMOJI.BROADCAST} ${message}`,
      styles.normal(COLORS.SYSTEM),
      ...args
    );
  };

  // 保存操作
  console.save = function(message, count) {
    console.log(
      `%c${EMOJI.SAVE} ${message}${count ? ` (${count} 筆)` : ''}`,
      styles.normal(COLORS.SUCCESS)
    );
  };

  // 載入操作
  console.load = function(message, count) {
    console.log(
      `%c${EMOJI.PACKAGE} ${message}${count !== undefined ? ` (${count} 筆)` : ''}`,
      styles.normal(COLORS.DATA)
    );
  };

  // 標題
  console.header = function(title) {
    console.log(`%c${separator}`, styles.separator);
    console.log(`%c${EMOJI.ROCKET} ${title}`, styles.header(COLORS.SYSTEM));
    console.log(`%c${separator}`, styles.separator);
  };

  // 子標題
  console.subheader = function(title) {
    console.log(`%c${EMOJI.ARROW} ${title}`, styles.subheader(COLORS.INFO));
    console.log(`%c${thinSeparator}`, styles.separator);
  };

  // 分隔線
  console.separator = function() {
    console.log(`%c${thinSeparator}`, styles.separator);
  };

  // 狀態追蹤
  const statusTracker = {
    logs: [],
    maxLogs: 50,

    add(type, message, details) {
      const entry = {
        timestamp: new Date().toLocaleTimeString('zh-TW', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3
        }),
        type,
        message,
        details
      };

      this.logs.unshift(entry);
      if (this.logs.length > this.maxLogs) {
        this.logs.pop();
      }
    },

    show(filterType = null) {
      console.header('系統事件記錄');
      
      const filtered = filterType 
        ? this.logs.filter(log => log.type === filterType)
        : this.logs;

      if (filtered.length === 0) {
        console.info_('無記錄');
        return;
      }

      console.table(filtered.map(log => ({
        '時間': log.timestamp,
        '類型': log.type,
        '訊息': log.message
      })));

      console.log(`%c總計: ${filtered.length} 筆記錄`, styles.muted);
    },

    clear() {
      this.logs = [];
      console.success('事件記錄已清除');
    },

    export() {
      const data = JSON.stringify(this.logs, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.success('事件記錄已匯出');
    }
  };

  // 追蹤所有事件
  const originalConsoleLog = console.log;
  const trackableTypes = ['success', 'error_', 'warn_', 'info_', 'system', 'save', 'load', 'sync'];
  
  trackableTypes.forEach(type => {
    const originalMethod = console[type];
    console[type] = function(...args) {
      const message = args[0] ? args[0].toString().replace(/%c/g, '') : '';
      statusTracker.add(type, message, args.slice(1));
      return originalMethod.apply(console, args);
    };
  });

  // 全域暴露
  window.statusTracker = statusTracker;
  window.EMOJI = EMOJI;
  window.COLORS = COLORS;

  // 幫助訊息
  console.showHelp = function() {
    console.header('主控台增強功能');
    
    const methods = [
      { name: 'console.success(msg)', desc: '成功訊息 (綠色)' },
      { name: 'console.error_(msg)', desc: '錯誤訊息 (紅色)' },
      { name: 'console.warn_(msg)', desc: '警告訊息 (橘色)' },
      { name: 'console.info_(msg)', desc: '提示訊息 (藍色)' },
      { name: 'console.system(msg)', desc: '系統事件' },
      { name: 'console.data(msg, data)', desc: '數據顯示 (含表格)' },
      { name: 'console.user(msg)', desc: '使用者操作' },
      { name: 'console.auth(msg)', desc: '認證事件' },
      { name: 'console.sync(msg)', desc: '同步事件' },
      { name: 'console.save(msg, count)', desc: '保存操作' },
      { name: 'console.load(msg, count)', desc: '載入操作' },
      { name: 'console.header(title)', desc: '大標題' },
      { name: 'console.subheader(title)', desc: '子標題' },
      { name: 'console.separator()', desc: '分隔線' },
      { name: 'statusTracker.show()', desc: '顯示所有事件' },
      { name: 'statusTracker.clear()', desc: '清除事件記錄' },
      { name: 'statusTracker.export()', desc: '匯出事件記錄' }
    ];

    console.table(methods);
    console.log(`%c提示: 使用 statusTracker.show() 查看所有系統事件`, styles.muted);
  };

  // 初始化訊息
  console.header('🚀 教練記錄系統 v3.1');
  console.system('主控台增強器已啟用');
  console.info_('輸入 console.showHelp() 查看可用命令');
  console.separator();

})();

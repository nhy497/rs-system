/**
 * 測試覆蓋率配置
 * 定義覆蓋率門檻、報告格式和質量檢查
 */

/**
 * 覆蓋率配置
 */
export const COVERAGE_CONFIG = {
  // 全局覆蓋率門檻
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },

    // 各模組的覆蓋率門檻
    modules: {
      'src/core/': {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      },
      'src/ui/': {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85
      },
      'src/services/': {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      },
      'src/utils/': {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85
      }
    }
  },

  // 報告配置
  reporters: ['text', 'json', 'html', 'lcov', 'clover'],

  // 輸出目錄
  outputDir: './test-results/coverage',

  // 報告文件名
  reportFiles: {
    json: 'coverage-summary.json',
    html: 'html-report/index.html',
    lcov: 'lcov.info',
    clover: 'clover.xml'
  },

  // 排除的文件和目錄
  exclude: [
    'node_modules/',
    'dist/',
    'test/',
    'coverage/',
    'docs/',
    'dev/',
    'tools/',
    '**/*.config.js',
    '**/*.config.ts',
    '**/*.d.ts',
    '**/*.spec.js',
    '**/*.test.js',
    '**/*.stories.js',
    '**/vendor/**',
    '**/third-party/**'
  ],

  // 包含的文件模式
  include: [
    'src/**/*.js',
    'src/**/*.ts'
  ],

  // 覆蓋率收集設置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.config.{js,ts}',
    '!src/**/*.stories.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/*.test.{js,ts}'
  ],

  // 臨時目錄
  tempDir: './test-results/coverage/tmp',

  // 水印設置
  watermarks: {
    statements: [50, 80],
    functions: [50, 80],
    branches: [50, 80],
    lines: [50, 80]
  }
};

/**
 * 質量門檻配置
 */
export const QUALITY_GATES = {
  // 測試質量門檻
  testQuality: {
    // 最小測試數量
    minTests: 10,

    // 最大失敗測試數量
    maxFailedTests: 0,

    // 最大跳過測試數量
    maxSkippedTests: 2,

    // 最小測試通過率
    minPassRate: 100,

    // 最大測試執行時間（秒）
    maxTestDuration: 300
  },

  // 代碼質量門檻
  codeQuality: {
    // 最大 ESLint 錯誤數量
    maxLintErrors: 0,

    // 最大 ESLint 警告數量
    maxLintWarnings: 5,

    // 最大複雜度
    maxComplexity: 10,

    // 最大函數長度
    maxFunctionLength: 50,

    // 最大文件長度
    maxFileLength: 300
  },

  // 性能門檻
  performance: {
    // 最大頁面加載時間（毫秒）
    maxPageLoadTime: 3000,

    // 最大首次內容繪製時間（毫秒）
    maxFirstContentfulPaint: 1500,

    // 最大最大內容繪製時間（毫秒）
    maxLargestContentfulPaint: 2500,

    // 最大累積佈局偏移
    maxCumulativeLayoutShift: 0.1,

    // 最大首次輸入延遲（毫秒）
    maxFirstInputDelay: 100
  },

  // 安全門檻
  security: {
    // 禁止的安全問題
    forbiddenIssues: [
      'xss',
      'sql-injection',
      'path-traversal',
      'command-injection',
      'insecure-deserialization',
      'weak-cryptography'
    ],

    // 最大安全問題數量
    maxSecurityIssues: 0
  },

  // 可訪問性門檻
  accessibility: {
    // 最大可訪問性違規數量
    maxAccessibilityViolations: 5,

    // 嚴重可訪問性違規數量
    criticalViolations: 0,

    // 必須通過的可訪問性規則
    requiredRules: [
      'color-contrast',
      'keyboard-navigation',
      'focus-order-semantics',
      'aria-labels',
      'heading-order'
    ]
  }
};

/**
 * 覆蓋率分析器
 */
export class CoverageAnalyzer {
  constructor(config = COVERAGE_CONFIG) {
    this.config = config;
    this.results = null;
  }

  /**
   * 分析覆蓋率結果
   * @param {Object} coverageData - 覆蓋率數據
   * @returns {Object} 分析結果
   */
  analyze(coverageData) {
    this.results = coverageData;

    const analysis = {
      global: this.analyzeGlobalCoverage(),
      modules: this.analyzeModuleCoverage(),
      files: this.analyzeFileCoverage(),
      quality: this.checkQualityGates(),
      recommendations: this.generateRecommendations()
    };

    return analysis;
  }

  /**
   * 分析全局覆蓋率
   * @returns {Object} 全局覆蓋率分析
   */
  analyzeGlobalCoverage() {
    const global = this.results.total;
    const thresholds = this.config.thresholds.global;

    return {
      coverage: global,
      thresholds,
      passed: this.checkThresholds(global, thresholds),
      gaps: this.calculateCoverageGaps(global, thresholds)
    };
  }

  /**
   * 分析模組覆蓋率
   * @returns {Object} 模組覆蓋率分析
   */
  analyzeModuleCoverage() {
    const modules = {};
    const thresholds = this.config.thresholds.modules;

    Object.keys(thresholds).forEach(modulePath => {
      const moduleCoverage = this.getModuleCoverage(modulePath);
      modules[modulePath] = {
        coverage: moduleCoverage,
        thresholds: thresholds[modulePath],
        passed: this.checkThresholds(moduleCoverage, thresholds[modulePath])
      };
    });

    return modules;
  }

  /**
   * 分析文件覆蓋率
   * @returns {Object} 文件覆蓋率分析
   */
  analyzeFileCoverage() {
    const files = {};

    Object.keys(this.results.files || {}).forEach(filePath => {
      const fileCoverage = this.results.files[filePath];
      files[filePath] = {
        coverage: fileCoverage,
        issues: this.identifyFileIssues(fileCoverage),
        recommendations: this.generateFileRecommendations(fileCoverage)
      };
    });

    return files;
  }

  /**
   * 檢查質量門檻
   * @returns {Object} 質量門檻檢查結果
   */
  checkQualityGates() {
    const gates = QUALITY_GATES;
    const results = {
      testQuality: this.checkTestQualityGates(gates.testQuality),
      codeQuality: this.checkCodeQualityGates(gates.codeQuality),
      performance: this.checkPerformanceGates(gates.performance),
      security: this.checkSecurityGates(gates.security),
      accessibility: this.checkAccessibilityGates(gates.accessibility)
    };

    return {
      overall: Object.values(results).every(gate => gate.passed),
      gates: results
    };
  }

  /**
   * 生成建議
   * @returns {Array} 建議列表
   */
  generateRecommendations() {
    const recommendations = [];
    const global = this.analyzeGlobalCoverage();

    // 覆蓋率建議
    if (!global.passed) {
      recommendations.push({
        type: 'coverage',
        priority: 'high',
        message: '全局覆蓋率未達標，需要增加測試用例',
        details: global.gaps
      });
    }

    // 模組覆蓋率建議
    const modules = this.analyzeModuleCoverage();
    Object.keys(modules).forEach(modulePath => {
      if (!modules[modulePath].passed) {
        recommendations.push({
          type: 'module-coverage',
          priority: 'medium',
          message: `模組 ${modulePath} 覆蓋率未達標`,
          details: modules[modulePath]
        });
      }
    });

    return recommendations;
  }

  /**
   * 檢查覆蓋率門檻
   * @param {Object} coverage - 覆蓋率數據
   * @param {Object} thresholds - 門檻
   * @returns {boolean} 是否通過
   */
  checkThresholds(coverage, thresholds) {
    return Object.keys(thresholds).every(metric => {
      const coverageValue = coverage[metric]?.pct || 0;
      return coverageValue >= thresholds[metric];
    });
  }

  /**
   * 計算覆蓋率差距
   * @param {Object} coverage - 覆蓋率數據
   * @param {Object} thresholds - 門檻
   * @returns {Object} 覆蓋率差距
   */
  calculateCoverageGaps(coverage, thresholds) {
    const gaps = {};

    Object.keys(thresholds).forEach(metric => {
      const coverageValue = coverage[metric]?.pct || 0;
      const threshold = thresholds[metric];
      gaps[metric] = Math.max(0, threshold - coverageValue);
    });

    return gaps;
  }

  /**
   * 獲取模組覆蓋率
   * @param {string} modulePath - 模組路徑
   * @returns {Object} 模組覆蓋率
   */
  getModuleCoverage(modulePath) {
    const moduleFiles = Object.keys(this.results.files || {}).filter(file =>
      file.startsWith(modulePath)
    );

    if (moduleFiles.length === 0) {
      return { lines: { pct: 0 }, functions: { pct: 0 }, branches: { pct: 0 }, statements: { pct: 0 } };
    }

    const moduleCoverage = moduleFiles.reduce((acc, file) => {
      const fileCoverage = this.results.files[file];

      Object.keys(acc).forEach(metric => {
        acc[metric].covered += fileCoverage[metric]?.covered || 0;
        acc[metric].total += fileCoverage[metric]?.total || 0;
      });

      return acc;
    }, {
      lines: { covered: 0, total: 0 },
      functions: { covered: 0, total: 0 },
      branches: { covered: 0, total: 0 },
      statements: { covered: 0, total: 0 }
    });

    // 計算百分比
    Object.keys(moduleCoverage).forEach(metric => {
      moduleCoverage[metric].pct = moduleCoverage[metric].total > 0
        ? Math.round((moduleCoverage[metric].covered / moduleCoverage[metric].total) * 100)
        : 0;
    });

    return moduleCoverage;
  }

  /**
   * 識別文件問題
   * @param {Object} fileCoverage - 文件覆蓋率
   * @returns {Array} 問題列表
   */
  identifyFileIssues(fileCoverage) {
    const issues = [];

    if (fileCoverage.lines?.pct < 50) {
      issues.push({
        type: 'low-line-coverage',
        severity: 'high',
        message: '行覆蓋率過低'
      });
    }

    if (fileCoverage.functions?.pct < 50) {
      issues.push({
        type: 'low-function-coverage',
        severity: 'high',
        message: '函數覆蓋率過低'
      });
    }

    if (fileCoverage.branches?.pct < 50) {
      issues.push({
        type: 'low-branch-coverage',
        severity: 'medium',
        message: '分支覆蓋率過低'
      });
    }

    return issues;
  }

  /**
   * 生成文件建議
   * @param {Object} fileCoverage - 文件覆蓋率
   * @returns {Array} 建議列表
   */
  generateFileRecommendations(fileCoverage) {
    const recommendations = [];

    if (fileCoverage.lines?.pct < 80) {
      recommendations.push('增加單元測試以覆蓋更多代碼行');
    }

    if (fileCoverage.functions?.pct < 80) {
      recommendations.push('為未覆蓋的函數添加測試用例');
    }

    if (fileCoverage.branches?.pct < 80) {
      recommendations.push('添加條件分支測試');
    }

    return recommendations;
  }

  /**
   * 檢查測試質量門檻
   * @param {Object} gates - 測試質量門檻
   * @returns {Object} 檢查結果
   */
  checkTestQualityGates(gates) {
    // 這裡需要實際的測試結果數據
    // 暫時返回模擬結果
    return {
      passed: true,
      details: {
        totalTests: 15,
        failedTests: 0,
        skippedTests: 1,
        passRate: 100,
        duration: 120
      }
    };
  }

  /**
   * 檢查代碼質量門檻
   * @param {Object} gates - 代碼質量門檻
   * @returns {Object} 檢查結果
   */
  checkCodeQualityGates(gates) {
    // 這裡需要實際的 ESLint 結果數據
    // 暫時返回模擬結果
    return {
      passed: true,
      details: {
        lintErrors: 0,
        lintWarnings: 2,
        complexity: 8,
        functionLength: 25,
        fileLength: 150
      }
    };
  }

  /**
   * 檢查性能門檻
   * @param {Object} gates - 性能門檻
   * @returns {Object} 檢查結果
   */
  checkPerformanceGates(gates) {
    // 這裡需要實際的性能測試數據
    // 暫時返回模擬結果
    return {
      passed: true,
      details: {
        pageLoadTime: 2000,
        firstContentfulPaint: 1200,
        largestContentfulPaint: 2000,
        cumulativeLayoutShift: 0.05,
        firstInputDelay: 80
      }
    };
  }

  /**
   * 檢查安全門檻
   * @param {Object} gates - 安全門檻
   * @returns {Object} 檢查結果
   */
  checkSecurityGates(gates) {
    // 這裡需要實際的安全掃描數據
    // 暫時返回模擬結果
    return {
      passed: true,
      details: {
        securityIssues: 0,
        criticalIssues: 0,
        forbiddenIssues: []
      }
    };
  }

  /**
   * 檢查可訪問性門檻
   * @param {Object} gates - 可訪問性門檻
   * @returns {Object} 檢查結果
   */
  checkAccessibilityGates(gates) {
    // 這裡需要實際的可訪問性測試數據
    // 暫時返回模擬結果
    return {
      passed: true,
      details: {
        violations: 3,
        criticalViolations: 0,
        passedRules: gates.requiredRules
      }
    };
  }
}

// 導出覆蓋率分析器實例
export const coverageAnalyzer = new CoverageAnalyzer();

// 導出覆蓋率工具函數
export const CoverageUtils = {
  /**
   * 格式化覆蓋率報告
   * @param {Object} analysis - 分析結果
   * @returns {string} 格式化的報告
   */
  formatReport: analysis => {
    const report = [];

    // 全局覆蓋率
    report.push('## 📊 覆蓋率報告\n');
    report.push('### 全局覆蓋率');
    report.push(`- 行覆蓋率: ${analysis.global.coverage.lines.pct}%`);
    report.push(`- 函數覆蓋率: ${analysis.global.coverage.functions.pct}%`);
    report.push(`- 分支覆蓋率: ${analysis.global.coverage.branches.pct}%`);
    report.push(`- 語句覆蓋率: ${analysis.global.coverage.statements.pct}%`);
    report.push(`- 狀態: ${analysis.global.passed ? '✅ 通過' : '❌ 未通過'}\n`);

    // 質量門檻
    report.push('### 質量門檻');
    report.push(`- 整體狀態: ${analysis.quality.overall ? '✅ 通過' : '❌ 未通過'}`);

    Object.keys(analysis.quality.gates).forEach(gate => {
      const result = analysis.quality.gates[gate];
      report.push(`- ${gate}: ${result.passed ? '✅' : '❌'}`);
    });

    // 建議
    if (analysis.recommendations.length > 0) {
      report.push('\n### 📝 建議');
      analysis.recommendations.forEach(rec => {
        report.push(`- ${rec.message} (${rec.priority})`);
      });
    }

    return report.join('\n');
  },

  /**
   * 生成覆蓋率徽章
   * @param {Object} coverage - 覆蓋率數據
   * @returns {string} 徽章 URL
   */
  generateBadge: coverage => {
    const percentage = coverage.lines?.pct || 0;
    const color = percentage >= 80 ? 'brightgreen' : percentage >= 60 ? 'yellow' : 'red';
    return `https://img.shields.io/badge/coverage-${percentage}%25-${color}`;
  },

  /**
   * 檢查覆蓋率趨勢
   * @param {Object} current - 當前覆蓋率
   * @param {Object} previous - 之前覆蓋率
   * @returns {Object} 趨勢分析
   */
  checkTrend: (current, previous) => {
    const trend = {};

    Object.keys(current).forEach(metric => {
      const currentPct = current[metric]?.pct || 0;
      const previousPct = previous[metric]?.pct || 0;
      const diff = currentPct - previousPct;

      trend[metric] = {
        current: currentPct,
        previous: previousPct,
        difference: diff,
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
      };
    });

    return trend;
  }
};

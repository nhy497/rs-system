import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { COVERAGE_CONFIG } from './test/config/coverage-config.js';

export default defineConfig({
  test: {
    // 測試環境配置
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    
    // 測試文件匹配模式
    include: [
      'test/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'test/integration',
      'test/e2e',
    ],
    
    // 覆蓋率配置
    coverage: {
      provider: 'v8',
      reporter: COVERAGE_CONFIG.reporters,
      outputDir: COVERAGE_CONFIG.outputDir,
      exclude: COVERAGE_CONFIG.exclude,
      include: COVERAGE_CONFIG.include,
      collectCoverage: COVERAGE_CONFIG.collectCoverage,
      collectCoverageFrom: COVERAGE_CONFIG.collectCoverageFrom,
      thresholds: COVERAGE_CONFIG.thresholds.global,
      watermarks: COVERAGE_CONFIG.watermarks,
      
      // 覆蓋率報告文件
      reporterOptions: {
        html: {
          subdir: 'html-report'
        },
        lcov: {
          file: COVERAGE_CONFIG.reportFiles.lcov
        },
        clover: {
          file: COVERAGE_CONFIG.reportFiles.clover
        }
      }
    },
    
    // 報告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/vitest-results.json',
      html: './test-results/vitest-report.html',
    },
    
    // 全局配置
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 監視模式配置
    watch: {
      include: ['src/**', 'test/**'],
      exclude: ['node_modules', 'dist'],
    },
    
    // 並行配置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // 測試順序
    sequence: {
      shuffle: false,
      concurrent: true
    },
    
    // 失敗時的行為
    bail: process.env.CI ? 1 : 0,
    
    // 重試配置
    retry: process.env.CI ? 2 : 0,
    
    // 環境變量
    env: {
      NODE_ENV: 'test',
      TEST_MODE: 'true'
    }
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
      '@config': resolve(__dirname, './test/config'),
      '@utils': resolve(__dirname, './test/utils')
    },
  },
  
  // 服務器配置
  server: {
    port: 3000,
  },
  
  // 定義全局變量
  define: {
    __TEST__: JSON.stringify(true),
    __COVERAGE__: JSON.stringify(process.env.NODE_ENV === 'test')
  }
});

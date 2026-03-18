import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * 簡化的 Vitest 配置檔案
 * 移除過度複雜的外部依賴，提供清晰的基本配置
 */
export default defineConfig({
  test: {
    // 測試環境配置
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],

    // 測試文件匹配模式
    include: [
      'test/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules',
      'dist',
      'test/integration',
      'test/e2e'
    ],

    // 簡化的覆蓋率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      outputDir: './test-results/coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        'coverage/',
        'docs/',
        'dev/',
        'tools/',
        '**/*.config.js',
        '**/*.d.ts'
      ],
      include: [
        'src/**/*.{js,ts}'
      ],
      collectCoverage: true,
      collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/**/*.d.ts',
        '!src/**/*.config.{js,ts}',
        '!src/**/*.spec.{js,ts}',
        '!src/**/*.test.{js,ts}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    // 報告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/vitest-results.json',
      html: './test-results/vitest-report.html'
    },

    // 全局配置
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,

    // 監視模式配置
    watch: {
      include: ['src/**', 'test/**'],
      exclude: ['node_modules', 'dist']
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
    }
  },

  // 服務器配置
  server: {
    port: 3000
  },

  // 定義全局變量
  define: {
    __TEST__: JSON.stringify(true),
    __COVERAGE__: JSON.stringify(process.env.NODE_ENV === 'test')
  }
});

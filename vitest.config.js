import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

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
    ],
    
    // 覆蓋率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.config.js',
        '**/*.d.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
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
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
    },
  },
  
  // 服務器配置
  server: {
    port: 3000,
  },
});

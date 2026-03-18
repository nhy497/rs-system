import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import playwright from 'eslint-plugin-playwright';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Vitest 全局變量
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',

        // Playwright 全局變量
        page: 'readonly',
        context: 'readonly',
        browser: 'readonly',
        browserName: 'readonly',
        deviceName: 'readonly',

        // 瀏覽器環境
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',

        // 自定義全局變量
        PouchDB: 'readonly',
        CONFIG: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      playwright
    },
    rules: {
      // JavaScript 規則
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'arrow-spacing': 'error',
      'comma-dangle': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'indent': ['error', 2],
      'max-len': ['warn', { code: 120 }],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',

      // ES6+ 規則
      'prefer-template': 'warn',
      'template-curly-spacing': 'error',
      'object-shorthand': 'warn',
      'prefer-destructuring': 'warn',

      // 函數規則
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'as-needed'],

      // 錯誤處理
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // 代碼複雜度
      'complexity': ['warn', 10],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],

      // TypeScript 規則
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn'
    }
  },
  {
    // 測試文件規則
    files: ['**/*.test.js', '**/*.spec.js', '**/test/**/*.js'],
    rules: {
      'no-console': 'off',
      'max-len': 'off',
      'complexity': 'off'
    }
  },
  {
    // 配置文件規則
    files: ['*.config.js', 'vite.config.js', 'vitest.config.js'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    // 腳本文件規則
    files: ['scripts/**/*.js', 'scripts/**/*.ps1'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    // Playwright 測試規則
    files: ['**/*.e2e.js', '**/*.e2e.spec.js', '**/test/e2e/**/*.js'],
    plugins: {
      playwright
    },
    rules: {
      // 暫時禁用有問題的 Playwright 規則
      // 'playwright/valid-expect': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-conditional-in-test': 'warn',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/prefer-to-have-count': 'warn'
    }
  },
  {
    // 忽略模式
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'test-results/**',
      '*.min.js',
      'vendor/**',
      'public/**'
    ]
  }
];

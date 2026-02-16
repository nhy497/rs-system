import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES 模組中的 __dirname 替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // GitHub Pages 基礎路徑
  base: '/rs-system/',
  
  // 根目錄為專案根目錄
  root: './',
  
  // 多頁應用配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // 多頁入口
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html')
        // 開發工具不包含在構建中，已移至 dev/ 目錄
        // - clear-cache.html -> dev/clear-cache.html
        // - test-save-refresh.html -> dev/test-save-refresh.html
      },
      output: {
        // 手動分割 chunks
        manualChunks(id) {
          // 第三方庫
          if (id.includes('node_modules')) {
            if (id.includes('pouchdb')) {
              return 'vendor-pouchdb';
            }
            return 'vendor';
          }
        },
        
        // 文件命名策略
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    
    // 清理輸出目錄
    emptyOutDir: true,
    
    // chunk 大小警告門檻（KB）
    chunkSizeWarningLimit: 600,
    
    // 生成 sourcemap（生產環境建議關閉）
    sourcemap: process.env.NODE_ENV !== 'production',
    
    // 壓縮
    minify: 'esbuild',
    
    // 目標瀏覽器
    target: 'es2020'
  },
  
  // 開發伺服器配置
  server: {
    port: 3000,
    open: '/index.html',
    
    // CORS
    cors: true,
    
    // 熱更新
    hmr: {
      overlay: true
    }
  },
  
  // 預覽伺服器
  preview: {
    port: 4173,
    open: true
  },
  
  // 優化配置
  optimizeDeps: {
    include: [],
    exclude: [] // 排除不需要預打包的模組
  },
  
  // CSS 配置
  css: {
    devSourcemap: true
  },
  
  // 解析配置
  resolve: {
    alias: {
      // 可以在這裡添加路徑別名
      // '@': resolve(__dirname, 'src')
    }
  }
});

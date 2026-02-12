import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // GitHub Pages 基礎路徑
  base: '/rs-system/',
  
  // 構建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // 代碼分割優化
    rollupOptions: {
      output: {
        // 手動分割 chunks
        manualChunks: {
          // 第三方庫
          'vendor-pouchdb': ['pouchdb', 'pouchdb-find'],
          
          // 核心模組（未來模組化後使用）
          // 'storage': ['./src/modules/storage/index.js'],
          // 'auth': ['./src/modules/auth/index.js'],
          // 'ui': ['./src/modules/ui/index.js']
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
    open: true,
    
    // 代理配置（如果需要）
    proxy: {
      // '/api': {
      //   target: 'http://localhost:5984',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    },
    
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
  
  // 插件
  plugins: [
    // 構建分析工具（只在 analyze 模式啟用）
    process.env.ANALYZE && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ].filter(Boolean),
  
  // 優化配置
  optimizeDeps: {
    include: ['pouchdb', 'pouchdb-find']
  },
  
  // CSS 配置
  css: {
    devSourcemap: true
  },
  
  // 實驗性功能
  experimental: {
    // 渲染優化
    renderBuiltUrl(filename) {
      return '/' + filename;
    }
  }
});

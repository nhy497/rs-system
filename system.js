/**
 * RS-System 系統入口點重定向
 * 
 * 此文件僅用於向後相容，實際功能已遷移至模組化系統
 * 新的入口點：./src/index.js
 * 
 * @deprecated 請使用 ./src/index.js
 */

console.log('🔄 system.js 重定向至新的模組化系統...');

// 重定向到新的模組化系統
import('./src/index.js').then(module => {
  console.log('✅ 模組化系統載入完成');
}).catch(error => {
  console.error('❌ 模組化系統載入失敗:', error);
  
  // 顯示錯誤訊息給用戶
  if (typeof document !== 'undefined') {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #fee;
      color: #c00;
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 99999;
      font-family: sans-serif;
      max-width: 80%;
    `;
    errorDiv.innerHTML = `
      <strong>⚠️ 系統載入失敗</strong><br>
      請檢查瀏覽器控制台以獲取詳細資訊<br>
      <small>如果問題持續存在，請嘗試強制刷新頁面 (Ctrl+Shift+R)</small>
    `;
    document.body?.appendChild(errorDiv);
  }
});

// 導出空物件以避免錯誤
export {};

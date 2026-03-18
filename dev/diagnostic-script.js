// 快速診斷腳本 - 複製此代碼到 browser console 執行
// 用於快速檢查儲存和刷新流程

console.log('%c=== 教練記錄系統診斷 ===', 'font-size:16px;font-weight:bold;color:#667eea');

// 1. 檢查基本函數是否存在
console.log('\n%c1️⃣  函數存在性檢查', 'font-size:14px;font-weight:bold');
const functions = [
  'parseRecords',
  'saveRecords',
  'updateSidebarStats',
  'refreshStats',
  'refreshActionsView',
  'refreshAnalytics',
  'refreshAllViews',
  'todayStr',
  'getCurrentUser'
];

functions.forEach(fn => {
  const exists = typeof window[fn] === 'function';
  console.log(`  ${exists ? '✅' : '❌'} ${fn}()`);
});

// 2. 檢查儲存狀態
console.log('\n%c2️⃣  儲存狀態檢查', 'font-size:14px;font-weight:bold');
const records = window.parseRecords?.() || [];
console.log(`  📊 總記錄數：${records.length}`);
const today = window.todayStr?.();
console.log(`  📅 今日日期：${today}`);
const todayRecords = records.filter(r => r.classDate === today);
console.log(`  🎯 今日記錄：${todayRecords.length}`);
if (records.length > 0) {
  console.log(`  ℹ️  最新記錄：${records[0]?.classDate} - ${records[0]?.className}`);
}

// 3. 檢查 DOM 元素
console.log('\n%c3️⃣  DOM 元素狀態', 'font-size:14px;font-weight:bold');
const elementChecks = {
  'todayCount': '今日課堂數',
  'totalStudents': '學生總數',
  'recentList': '最近課程列表',
  'byClassList': '班別統計',
  'actionsTableBody': '動作記錄表格',
  'analyticsChart': '統計分析圖表'
};

Object.entries(elementChecks).forEach(([id, label]) => {
  const el = document.getElementById(id);
  if (el) {
    const hasContent = el.textContent?.trim().length > 0;
    const childCount = el.children?.length || 0;
    console.log(`  ✅ #${id} (${label})`);
    console.log(`     - 內容：${hasContent ? '有' : '無'}`);
    console.log(`     - 子項：${childCount}`);
  } else {
    console.log(`  ❌ #${id} (${label}) - 元素不存在`);
  }
});

// 4. 檢查用戶狀態
console.log('\n%c4️⃣  用戶狀態', 'font-size:14px;font-weight:bold');
const user = window.getCurrentUser?.();
if (user) {
  console.log(`  ✅ 已登入：${user.username}`);
  console.log(`     - 角色：${user.role}`);
} else {
  console.log('  ⚠️  未登入');
}

// 5. 建議操作
console.log('\n%c5️⃣  建議操作', 'font-size:14px;font-weight:bold');
console.log('  • 測試儲存和刷新：window.testImmediateRefresh()');
console.log('  • 強制刷新所有視圖：window.refreshAllViews()');
console.log('  • 手動更新側邊欄：window.updateSidebarStats()');
console.log('  • 詳細儲存診斷：window.debugSaveFlow()');

console.log('\n%c診斷完成 ✅', 'font-size:12px;color:#059669');

/**
 * PouchDB 與 app.js 相容層
 * 攔截並重新路由所有存儲操作到 PouchDB
 * 在 pouchdb-integration.js 後、app.js 前加載
 */

/**
 * 全局事件監聽器 - 用於刷新 UI
 */
window.onAppReady = async function() {
  console.log('🎨 應用 UI 準備完成，初始化數據...');
  
  try {
    // 刷新所有視圖
    if (window.refreshAllViews) {
      window.refreshAllViews();
    }
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
  }
};

/**
 * 刷新所有視圖
 */
window.refreshAllViews = async function() {
  try {
    // 加載課堂記錄
    const checkpoints = await storageAdapter.getAllCheckpoints();
    
    // 重新排序（最新優先）
    checkpoints.sort((a, b) => {
      const dateA = a.date || a.classDate || '';
      const dateB = b.date || b.classDate || '';
      return dateB.localeCompare(dateA);
    });
    
    // 刷新統計視圖
    if (window.refreshOverview) {
      window.refreshOverview(checkpoints);
    }
    
    // 刷新分析視圖
    if (window.refreshAnalytics) {
      window.refreshAnalytics();
    }
    
    // 更新班級下拉選單
    if (window.populateGlobalFilterClass) {
      window.populateGlobalFilterClass();
    }
    
    if (window.populateQuickSelectClass) {
      window.populateQuickSelectClass();
    }
  } catch (error) {
    console.error('❌ 刷新視圖失敗:', error);
  }
};

/**
 * 攔截 parseRecords 函數 - 使用 PouchDB
 */
const originalParseRecords = window.parseRecords;
window.parseRecords = async function() {
  try {
    if (!storageAdapter.isReady()) {
      console.warn('⚠️ 儲存適配層尚未準備，使用本地快取');
      return storageAdapter.cacheData['checkpoints'] || [];
    }
    
    const checkpoints = await storageAdapter.getAllCheckpoints();
    
    // 轉換為 app.js 期望的格式
    return checkpoints.map(doc => ({
      id: doc._id,
      classDate: doc.date || doc.classDate,
      className: doc.className,
      classSize: doc.classSize,
      atmosphere: doc.atmosphere,
      skillLevel: doc.skillLevel,
      studentRecords: doc.studentRecords || [],
      notes: doc.notes,
      tricks: doc.tricks || [],
      engagement: doc.engagement,
      classStartTime: doc.classStartTime,
      classEndTime: doc.classEndTime,
      ...doc // 保留所有其他欄位
    }));
  } catch (error) {
    console.error('❌ 解析記錄失敗:', error);
    return [];
  }
};

/**
 * 攔截 saveRecords 函數 - 使用 PouchDB
 */
window.saveRecords = async function(arr) {
  try {
    if (!storageAdapter.isReady()) {
      console.error('❌ 儲存適配層尚未準備');
      throw new Error('儲存系統未準備就緒');
    }

    for (const record of arr) {
      // 準備要保存的資料
      const checkpointData = {
        date: record.classDate || record.date,
        className: record.className,
        classSize: record.classSize,
        atmosphere: record.atmosphere,
        skillLevel: record.skillLevel,
        studentRecords: record.studentRecords || [],
        notes: record.notes || '',
        tricks: record.tricks || [],
        engagement: record.engagement,
        classStartTime: record.classStartTime,
        classEndTime: record.classEndTime,
        ...record
      };

      // 如果有 ID，表示是更新
      if (record.id) {
        await storageAdapter.updateCheckpoint(record.id, checkpointData);
      } else {
        // 新增記錄
        const result = await storageAdapter.addCheckpoint(checkpointData);
        record.id = result.id; // 保存返回的 ID
      }
    }

    console.log('✅ 記錄已保存到 PouchDB');
  } catch (error) {
    console.error('❌ 保存記錄失敗:', error);
    throw error;
  }
};

/**
 * 攔截 getClassPresets 函數
 */
window.getClassPresets = async function() {
  try {
    if (!storageAdapter.isReady()) {
      return storageAdapter.cacheData['presets'] || [];
    }
    
    return await storageAdapter.getAllClassPresets();
  } catch (error) {
    console.error('❌ 取得班級預設失敗:', error);
    return [];
  }
};

/**
 * 攔截 saveClassPresets 函數
 */
window.saveClassPresets = async function(arr) {
  try {
    if (!storageAdapter.isReady()) {
      console.error('❌ 儲存適配層尚未準備');
      return;
    }

    // 獲取現有預設
    const existing = await storageAdapter.getAllClassPresets();
    const existingNames = new Set(existing.map(p => p.className));

    // 刪除不在陣列中的預設
    for (const preset of existing) {
      if (!arr.includes(preset.className)) {
        await storageAdapter.deleteClassPreset(preset.className);
      }
    }

    // 新增陣列中不存在的預設
    for (const className of arr) {
      if (!existingNames.has(className)) {
        await storageAdapter.addClassPreset(className);
      }
    }

    console.log('✅ 班級預設已保存');
  } catch (error) {
    console.error('❌ 保存班級預設失敗:', error);
  }
};

/**
 * 攔截 addClassPreset 函數
 */
window.addClassPreset = async function(className) {
  try {
    if (!storageAdapter.isReady()) {
      console.error('❌ 儲存適配層尚未準備');
      return;
    }

    const presets = await storageAdapter.getAllClassPresets();
    if (!presets.includes(className) && className.trim()) {
      await storageAdapter.addClassPreset(className.trim());
      console.log('✅ 班級預設已新增:', className);
    }
  } catch (error) {
    console.error('❌ 新增班級預設失敗:', error);
  }
};

/**
 * 攔截 removeClassPreset 函數
 */
window.removeClassPreset = async function(className) {
  try {
    if (!storageAdapter.isReady()) {
      console.error('❌ 儲存適配層尚未準備');
      return;
    }

    await storageAdapter.deleteClassPreset(className);
    console.log('✅ 班級預設已刪除:', className);
  } catch (error) {
    console.error('❌ 刪除班級預設失敗:', error);
  }
};

/**
 * 修補 app.js 的自動儲存行為
 * 攔截 btnSave 點擊事件
 */
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(async function() {
    const btnSave = document.getElementById('btnSave');
    
    if (btnSave) {
      // 保存原有的事件監聽器
      const originalClickHandler = btnSave.onclick;
      
      // 包裝成非同步版本
      btnSave.addEventListener('click', async function(e) {
        // 如果儲存適配層未準備，禁用保存
        if (!storageAdapter.isReady()) {
          alert('⚠️ 儲存系統正在初始化，請稍候...');
          return;
        }
      });
    }
  }, 500);
});

/**
 * 導出和匯入數據功能
 */
window.exportCheckpoints = async function() {
  try {
    const backup = await storageAdapter.backup();
    
    // 轉換為 CSV 格式（與原有相容）
    const checkpoints = backup.data.checkpoints;
    
    if (checkpoints.length === 0) {
      alert('⚠️ 無記錄可匯出');
      return;
    }

    // 構建 CSV 內容
    const headers = ['課堂日期', '班級名稱', '人數', '課堂氣氛', '技巧等級', '開始時間', '結束時間', '備注'];
    const rows = checkpoints.map(r => [
      r.date || r.classDate || '',
      r.className || '',
      r.classSize || '',
      r.atmosphere || '',
      r.skillLevel || '',
      r.classStartTime || '',
      r.classEndTime || '',
      r.notes || ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
    });

    // 觸發下載
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `checkpoint-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ 已匯出記錄');
  } catch (error) {
    console.error('❌ 匯出失敗:', error);
    alert('❌ 匯出失敗：' + error.message);
  }
};

/**
 * 刪除所有記錄
 */
window.deleteAllCheckpoints = async function() {
  try {
    if (!confirm('⚠️ 此操作無法撤銷。確定要刪除所有記錄嗎？')) {
      return false;
    }

    if (!confirm('再次確認：刪除所有課堂記錄？')) {
      return false;
    }

    await storageService.clearAllData();
    await storageAdapter._loadCacheFromDB();
    await window.refreshAllViews();

    alert('✅ 所有記錄已刪除');
    return true;
  } catch (error) {
    console.error('❌ 刪除失敗:', error);
    alert('❌ 刪除失敗：' + error.message);
    return false;
  }
};

/**
 * 用戶登出函數
 */
window.logoutUser = async function() {
  try {
    // 關閉資料庫連接
    const userId = pouchDBManager.currentUserId;
    if (userId) {
      await pouchDBManager.closeUserDatabase(userId);
    }

    // 登出認證
    authManager.logout();

    // 重定向到登入頁
    window.location.href = 'login.html';
  } catch (error) {
    console.error('❌ 登出失敗:', error);
    alert('❌ 登出失敗，請重新整理頁面');
  }
};

console.log('✅ PouchDB app.js 相容層已加載');

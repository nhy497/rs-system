/**
 * PouchDB 與 app.js 相容層
 * 攔截 app.js 的 localStorage 存取，改為走 PouchDB。
 * 需在 app.js 之後載入，才能覆蓋同名函式。
 */

// 保存原有實作，必要時回退
const legacyFns = {
  parseRecords: window.parseRecords,
  saveRecords: window.saveRecords,
  getClassPresets: window.getClassPresets,
  saveClassPresets: window.saveClassPresets,
  addClassPreset: window.addClassPreset,
  removeClassPreset: window.removeClassPreset
};

// 將 PouchDB 文件轉為 app.js 期望的形狀
function normalizeCheckpoint(doc) {
  if (!doc) return null;
  const classDate = doc.date || doc.classDate || '';
  return {
    id: doc.id || doc._id,
    _id: doc._id,
    _rev: doc._rev,
    classDate,
    date: classDate,
    className: doc.className || '',
    classSize: doc.classSize ?? null,
    atmosphere: doc.atmosphere ?? '',
    skillLevel: doc.skillLevel ?? '',
    studentRecords: Array.isArray(doc.studentRecords) ? doc.studentRecords : [],
    notes: doc.notes || '',
    tricks: Array.isArray(doc.tricks) ? doc.tricks : [],
    engagement: doc.engagement,
    classStartTime: doc.classStartTime || '',
    classEndTime: doc.classEndTime || '',
    classDurationMins: doc.classDurationMins ?? null,
    ...doc
  };
}

function getCachedCheckpoints() {
  if (!storageAdapter || !storageAdapter.cacheData['checkpoints']) return null;
  return storageAdapter.cacheData['checkpoints'].map(normalizeCheckpoint).filter(Boolean);
}

function overrideStorageLayer() {
  // 解析課堂記錄（同步）
  window.parseRecords = function() {
    const cached = getCachedCheckpoints();
    if (cached) return cached;
    return legacyFns.parseRecords ? legacyFns.parseRecords() : [];
  };

  // 儲存課堂記錄（若 PouchDB 就緒則寫入，否則回退）
  window.saveRecords = async function(arr) {
    if (!storageAdapter || !storageAdapter.isReady()) {
      return legacyFns.saveRecords ? legacyFns.saveRecords(arr) : undefined;
    }

    for (const record of arr) {
      const payload = {
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
        classDurationMins: record.classDurationMins,
        ...record
      };

      const docId = record.id || record._id;
      if (docId) {
        await storageAdapter.updateCheckpoint(docId, payload);
      } else {
        const result = await storageAdapter.addCheckpoint(payload);
        record.id = result.id;
      }
    }

    await storageAdapter._loadCacheFromDB();
    if (window.refreshAllViews) {
      await window.refreshAllViews();
    }
    return true;
  };

  // 取得班級預設（同步，使用快取）
  window.getClassPresets = function() {
    if (storageAdapter?.isReady() && Array.isArray(storageAdapter.cacheData['presets'])) {
      return [...storageAdapter.cacheData['presets']];
    }
    return legacyFns.getClassPresets ? legacyFns.getClassPresets() : [];
  };

  // 保存班級預設（非 async，避免破壞現有調用）
  window.saveClassPresets = function(arr) {
    if (!storageAdapter || !storageAdapter.isReady()) {
      return legacyFns.saveClassPresets ? legacyFns.saveClassPresets(arr) : undefined;
    }

    const cleaned = Array.from(new Set((arr || []).map(c => (c || '').trim()).filter(Boolean)));
    storageAdapter.getAllClassPresets()
      .then(existing => {
        const existingSet = new Set(existing);
        const ops = [];

        existing.forEach(name => {
          if (!cleaned.includes(name)) {
            ops.push(storageAdapter.deleteClassPreset(name));
          }
        });

        cleaned.forEach(name => {
          if (!existingSet.has(name)) {
            ops.push(storageAdapter.addClassPreset(name));
          }
        });

        return Promise.all(ops);
      })
      .then(() => storageAdapter._loadCacheFromDB())
      .then(() => {
        window.populateQuickSelectClass?.();
        window.renderClassPresets?.();
      })
      .catch(err => console.error('❌ 保存班級預設失敗:', err));
  };

  // 新增班級預設（同步接口，內部異步執行）
  window.addClassPreset = function(className) {
    const name = (className || '').trim();
    if (!name) return;

    if (!storageAdapter || !storageAdapter.isReady()) {
      legacyFns.addClassPreset?.(name);
      return;
    }

    storageAdapter.getAllClassPresets()
      .then(existing => {
        if (existing.includes(name)) return null;
        return storageAdapter.addClassPreset(name);
      })
      .then(() => storageAdapter._loadCacheFromDB())
      .then(() => {
        window.populateQuickSelectClass?.();
        window.renderClassPresets?.();
      })
      .catch(err => console.error('❌ 新增班級預設失敗:', err));
  };

  // 刪除班級預設
  window.removeClassPreset = function(className) {
    const name = (className || '').trim();
    if (!name) return;

    if (!storageAdapter || !storageAdapter.isReady()) {
      legacyFns.removeClassPreset?.(name);
      return;
    }

    storageAdapter.deleteClassPreset(name)
      .then(() => storageAdapter._loadCacheFromDB())
      .then(() => {
        window.populateQuickSelectClass?.();
        window.renderClassPresets?.();
      })
      .catch(err => console.error('❌ 刪除班級預設失敗:', err));
  };
}

overrideStorageLayer();

// 刷新所有視圖，使用最新的 PouchDB 快取
window.refreshAllViews = async function() {
  try {
    const maybeList = window.parseRecords();
    const checkpoints = maybeList instanceof Promise ? await maybeList : maybeList;

    const sorted = [...checkpoints].sort((a, b) => {
      const dateA = a.date || a.classDate || '';
      const dateB = b.date || b.classDate || '';
      return dateB.localeCompare(dateA);
    });

    if (window.refreshOverview) {
      window.refreshOverview(sorted);
    }

    if (window.refreshAnalytics) {
      window.refreshAnalytics();
    }

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

// 啟動 PouchDB 並同步快取
async function bootstrapPouchCompat() {
  try {
    const ok = await initializeApp();
    if (!ok) {
      console.warn('⚠️ PouchDB 初始化失敗，回退至 legacy localStorage');
      return;
    }

    await storageAdapter._loadCacheFromDB();
    if (window.refreshAllViews) {
      await window.refreshAllViews();
    }
  } catch (error) {
    console.error('❌ PouchDB 相容層啟動失敗:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 保持與原本行為一致，僅在 DOM 就緒後啟動
  bootstrapPouchCompat();

  // 為舊的 btnSave 行為添加保護
  setTimeout(() => {
    const btnSave = document.getElementById('btnSave');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        if (!storageAdapter || !storageAdapter.isReady()) {
          alert('⚠️ 儲存系統正在初始化，請稍候...');
        }
      });
    }
  }, 500);
});

// 保留給其他模組的 onAppReady 勾點
window.onAppReady = window.onAppReady || function() {};

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

# 高優先級功能實現指南

## 📌 快速開始：下一個要實現的 3 個功能

---

## 1️⃣ 編輯記錄功能（最高優先）

### 問題
用戶修改舊記錄後保存，會產生重複記錄而不是覆蓋原記錄。

### 解決方案
添加「編輯模式」狀態機制。

### 代碼實現

**Step 1: 在 app.js 頂部添加全局變量**
```javascript
// 編輯模式追蹤
let currentEditMode = null; // { classDate: '2025-01-15', className: 'P3A' }
```

**Step 2: 修改 loadIntoForm() 函數**
```javascript
function loadIntoForm(rec, isEditMode = true) {
  // 原有代碼...
  $('classDate').value = rec.classDate || todayStr();
  $('className').value = rec.className || '';
  // ... 其他欄位 ...
  
  // 新增：設置編輯模式
  if (isEditMode) {
    currentEditMode = { 
      classDate: rec.classDate, 
      className: rec.className 
    };
    updateEditModeIndicator();
  }
}

// 新增函數：顯示編輯模式提示
function updateEditModeIndicator() {
  if (!currentEditMode) {
    $('editIndicator').hidden = true;
    return;
  }
  const indicator = $('editIndicator');
  if (indicator) {
    indicator.hidden = false;
    indicator.textContent = `✎ 編輯模式：${currentEditMode.classDate} · ${currentEditMode.className || '未填寫'}`;
  }
}
```

**Step 3: 修改 btnSave 邏輯**
```javascript
$('btnSave')?.addEventListener('click', () => {
  const d = getFormData();
  if (!d.classDate) { toast('請填寫課堂日期'); return; }
  const list = parseRecords();
  
  if (currentEditMode) {
    // 編輯模式：覆蓋原記錄
    const i = list.findIndex(r => 
      r.classDate === currentEditMode.classDate && 
      r.className === currentEditMode.className
    );
    if (i >= 0) {
      list[i] = d;
      toast('已更新記錄');
    } else {
      toast('原記錄已被刪除');
      list.push(d);
    }
    currentEditMode = null;
  } else {
    // 新建模式：新增記錄
    const i = list.findIndex(r => r.classDate === d.classDate && r.className === d.className);
    if (i >= 0) {
      list[i] = d;
      toast('此日期班級已有記錄，已更新');
    } else {
      list.push(d);
      toast('已儲存本堂記錄');
    }
  }
  
  list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
  saveRecords(list);
  populateGlobalFilterClass();
  populateQuickSelectClass();
  refreshStats();
  updateEditModeIndicator();
});
```

**Step 4: 修改 clearForm() 函數**
```javascript
function clearForm() {
  $('classDate').value = todayStr();
  $('className').value = '';
  // ... 其他欄位重置 ...
  
  // 清除編輯模式
  currentEditMode = null;
  updateEditModeIndicator();
}
```

**Step 5: 修改 showDetail() 函數**
```javascript
// 在 「載入到表單」 按鈕點擊時傳入 isEditMode
$('loadIntoFormBtn')?.addEventListener('click', () => { 
  setPage('overview'); 
  loadIntoForm(rec, true);  // 第二個參數表示編輯模式
  $('detailModal').hidden = true; 
});
```

**Step 6: 在 HTML 中添加編輯模式指示器**
```html
<!-- 在表單頂部（classDate 欄位上方）添加 -->
<div id="editIndicator" class="edit-mode-indicator" hidden>
  ✎ 編輯模式：2025-01-15 · P3A
</div>

<!-- 添加 CSS 樣式 -->
<style>
.edit-mode-indicator {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 14px;
  color: #1565c0;
}
</style>
```

**Step 7: 修改清空按鈕邏輯**
```javascript
$('btnClear')?.addEventListener('click', () => {
  if (confirm('確定要清空本堂輸入嗎？')) {
    clearForm();
    if (currentEditMode) {
      toast('已退出編輯模式');
    }
  }
});
```

---

## 2️⃣ 日期重複檢查警告

### 問題
用戶無法即時知道是否已輸入該日期的該班級，容易造成誤操作。

### 解決方案
在班級名稱欄位下方即時顯示重複檢查結果。

### 代碼實現

**Step 1: 添加檢查函數**
```javascript
function checkDuplicateRecord(date, className) {
  const list = parseRecords();
  const exists = list.find(r => 
    r.classDate === date && r.className === className
  );
  return exists;
}
```

**Step 2: 為表單欄位添加事件監聽**
```javascript
function bindDuplicateCheck() {
  const dateInput = $('classDate');
  const classInput = $('className');
  const indicator = $('duplicateIndicator');
  
  const check = () => {
    const date = dateInput?.value;
    const className = classInput?.value || '';
    
    if (!date || !className) {
      if (indicator) indicator.hidden = true;
      return;
    }
    
    const exists = checkDuplicateRecord(date, className);
    if (indicator) {
      if (exists) {
        indicator.hidden = false;
        indicator.className = 'duplicate-warning';
        indicator.innerHTML = `⚠️ 此日期已有 <strong>${className}</strong> 的記錄。可選：<br>
          • 點「載入到表單」編輯現有記錄<br>
          • 繼續新增記錄（覆蓋原記錄）`;
      } else {
        if (!currentEditMode) {
          indicator.hidden = false;
          indicator.className = 'duplicate-ok';
          indicator.innerHTML = `✓ 可以新增此記錄`;
        } else {
          indicator.hidden = true;
        }
      }
    }
  };
  
  dateInput?.addEventListener('change', check);
  classInput?.addEventListener('input', check);
}

// 初始化時調用
bindDuplicateCheck();
```

**Step 3: 在 HTML 中添加指示器**
```html
<div class="field">
  <label for="className">班級名稱</label>
  <div class="quick-class-wrap">
    <input type="text" id="className" placeholder="例：P3A / 初級班">
    <label for="quickSelectClass">快速選擇</label>
    <select id="quickSelectClass">
      <option value="">—</option>
    </select>
  </div>
  <!-- 新增：重複檢查指示器 -->
  <div id="duplicateIndicator" class="duplicate-indicator" hidden></div>
</div>
```

**Step 4: 添加 CSS 樣式**
```css
.duplicate-indicator {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
}

.duplicate-indicator.duplicate-warning {
  background: #fff3e0;
  border: 1px solid #ffb74d;
  color: #e65100;
}

.duplicate-indicator.duplicate-ok {
  background: #e8f5e9;
  border: 1px solid #81c784;
  color: #2e7d32;
}
```

**Step 5: 在保存時再次確認**
```javascript
// 在 btnSave 的檢查邏輯中添加
$('btnSave')?.addEventListener('click', () => {
  const d = getFormData();
  if (!d.classDate) { toast('請填寫課堂日期'); return; }
  
  const list = parseRecords();
  const exists = list.find(r => 
    r.classDate === d.classDate && r.className === d.className
  );
  
  // 如果是新建模式且記錄已存在，提示用戶
  if (exists && !currentEditMode) {
    const choice = confirm(
      `此日期已有 ${d.className || '未填寫'} 的記錄。\n\n` +
      `選擇「確定」以覆蓋原記錄\n` +
      `選擇「取消」以返回檢查`
    );
    if (!choice) return;
  }
  
  // 後續保存邏輯...
});
```

---

## 3️⃣ 班級名稱預設與快速複製

### 問題
同一教練連續上課（如連續 3 天 P3A 班），每次都要重新輸入班級名稱。

### 解決方案
(1) 記住上一堂課的班級，初始化時預填  
(2) 添加「複製上堂課」按鈕

### 代碼實現

**Step 1: 添加記住上次班級的函數**
```javascript
function getLastClassInfo() {
  const list = parseRecords();
  if (list.length === 0) return null;
  
  const lastRec = list[0]; // 按日期降序排列
  return {
    className: lastRec.className || '',
    classSize: lastRec.classSize || null
  };
}

// 初始化時預填
function initFormWithLastClass() {
  const last = getLastClassInfo();
  if (last && last.className) {
    $('className').value = last.className;
    // 可選：顯示提示
    toast(`上一堂課：${last.className}（人數 ${last.classSize || '–'}）`);
  }
}

// 在初始化時調用
initFormWithLastClass();
```

**Step 2: 添加複製上堂課函數**
```javascript
function duplicateLastLesson() {
  const list = parseRecords();
  if (list.length === 0) {
    toast('尚無上堂課記錄');
    return;
  }
  
  const last = list[0];
  // 複製所有資料，但清空日期和備注
  const copy = { ...last };
  copy.classDate = todayStr(); // 改為今天
  copy.notes = ''; // 清空備注
  
  // 加載到表單
  loadIntoForm(copy, false); // false = 新建模式，非編輯模式
  setPage('overview');
  toast(`已複製上堂課（${last.classDate} · ${last.className}）的記錄。請檢查並修改。`);
}
```

**Step 3: 在 HTML 中添加按鈕**
```html
<!-- 在 「清空本堂輸入」 按鈕旁邊添加 -->
<div class="card card-actions">
  <div class="card-body flex-row gap-m">
    <button type="button" id="btnSave" class="btn btn-primary">儲存本堂記錄</button>
    <button type="button" id="btnDuplicate" class="btn btn-ghost">複製上堂課</button>
    <button type="button" id="btnClear" class="btn btn-ghost">清空本堂輸入</button>
  </div>
</div>
```

**Step 4: 綁定複製按鈕**
```javascript
$('btnDuplicate')?.addEventListener('click', () => {
  duplicateLastLesson();
});
```

---

## 🚀 優先級實現順序

1. **編輯記錄功能** (完成 → 解決最大痛點)
2. **日期重複檢查** (完成 → 防止誤操作)
3. **班級預設 + 複製** (完成 → 提升效率)

預計總工時：**4-5 小時**

---

## ✅ 測試檢查清單

完成後，請測試以下場景：

- [ ] 新建一筆記錄
- [ ] 修改該記錄（進入編輯模式，更新數據，保存）
- [ ] 嘗試新增同日期同班級的記錄（應顯示重複警告）
- [ ] 複製上堂課記錄
- [ ] 清空表單時清除編輯模式標記
- [ ] 刪除編輯中的記錄（應退出編輯模式）
- [ ] 在班級列表中選擇班級後，表單應預填班級名稱

---

**祝實現順利！如有任何問題，參考 OPTIMIZATION_REVIEW.md 獲取詳細背景。**

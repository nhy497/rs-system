# 🐛 Bug Tracking & Issue List

**System**: HKJRA 教練記錄系統  
**Version**: v2.1  
**Report Date**: 2025-01-21  

---

## Priority Matrix

```
            Impact
         Low    High
    ┌─────────────────┐
  H │  20    │ 1,2,3 │
    │        │       │
E   │ 11,12  │ 4,5   │
f   │        │       │
f   ├─────────────────┤
o   │ 14,15  │ 6,7   │
r   │        │       │
t L │        │       │
    └─────────────────┘
```

---

## 🔴 Critical Bugs (P0)

### BUG #1: Missing `classDuration` Element
- **Status**: 🔴 OPEN
- **Severity**: Critical
- **Component**: HTML / app.js
- **Description**: 
  The `updateClassDuration()` function attempts to update element with ID `classDuration`, but this element doesn't exist in the HTML.
  
- **Steps to Reproduce**:
  1. Open the app
  2. Enter `classStartTime` and `classEndTime`
  3. Expected: Duration should display below the time fields
  4. Actual: Silent failure, no duration shown
  
- **Current Code** (app.js:149-175):
  ```javascript
  function updateClassDuration() {
    const startTime = ($('classStartTime')?.value || '').trim();
    const endTime = ($('classEndTime')?.value || '').trim();
    const durationEl = $('classDuration');  // ← Returns null
    
    if (!durationEl) return;  // ← Exit without error
    // ... rest of code never executes
  }
  ```

- **Fix Required**:
  ```html
  <!-- Add to index.html after classEndTime input -->
  <div id="classDuration" class="time-duration-display" style="
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #e0f2fe;
    border-radius: 6px;
    color: #0284c7;
    font-weight: 500;
    font-size: 0.9rem;">
    課堂時長：—
  </div>
  ```

- **Tests**:
  - [ ] Duration displays correctly for valid time range
  - [ ] Error message shows when endTime < startTime
  - [ ] Display updates on time field change

---

### BUG #2: Missing Time Input Fields
- **Status**: 🔴 OPEN
- **Severity**: Critical
- **Component**: HTML / app.js
- **Description**:
  Code references `classStartTime` and `classEndTime` inputs, but these fields are not defined in the HTML.

- **Affected Functions**:
  - `updateClassDuration()` (app.js:149)
  - `getFormData()` (app.js:296-305)
  - `loadIntoForm()` (app.js:401)

- **Current Code** (app.js:301-305):
  ```javascript
  const startTime = ($('classStartTime')?.value || '').trim();  // undefined
  const endTime = ($('classEndTime')?.value || '').trim();      // undefined
  ```

- **Fix Required**:
  ```html
  <!-- Add to index.html in basic-info card -->
  <div class="field-row">
    <div class="field">
      <label for="classStartTime">開始時間</label>
      <input type="time" id="classStartTime">
    </div>
    <div class="field">
      <label for="classEndTime">結束時間</label>
      <input type="time" id="classEndTime">
    </div>
  </div>
  <!-- Then add duration display after these -->
  ```

- **Tests**:
  - [ ] Both time inputs accept valid time values
  - [ ] Duration calculation is triggered on change
  - [ ] Data persists in localStorage

---

### BUG #3: Firebase Configuration Not Set
- **Status**: 🔴 OPEN
- **Severity**: Critical
- **Component**: firebase-config.js
- **Description**:
  All Firebase configuration values are placeholder strings (`YOUR_*`), making Firebase completely non-functional.

- **Current Code** (firebase-config.js:7-15):
  ```javascript
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",  // ← Placeholder
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  ```

- **Actual Behavior**:
  - `initializeFirebase()` silently fails
  - System falls back to localStorage only
  - Multi-user features don't work

- **Fix Required**:
  ```javascript
  // Option A: Use real Firebase config from project
  const firebaseConfig = {
    apiKey: "AIzaSyD...actual_key...",
    authDomain: "real-project.firebaseapp.com",
    // ... other real values
  };
  
  // Option B: Disable Firebase if not configured
  let firebaseEnabled = false;  // Set to false explicitly
  ```

- **Tests**:
  - [ ] Verify Firebase SDK loads without errors
  - [ ] Confirm fallback to localStorage works
  - [ ] Test multi-user sync if Firebase enabled

---

### BUG #4: Missing Location & Teaching Role Fields
- **Status**: 🔴 OPEN
- **Severity**: Critical
- **Component**: HTML / app.js
- **Description**:
  Code reads `classLocation` and `teachingRole` values but HTML inputs don't exist.

- **Current Code** (app.js:313-314):
  ```javascript
  classLocation: ($('classLocation')?.value || '').trim(),
  teachingRole: ($('teachingRole')?.value || '').trim(),
  ```

- **Fix Required**:
  ```html
  <!-- Add to basic-info card in index.html -->
  <div class="field-row">
    <div class="field">
      <label for="classLocation">課堂位置</label>
      <input type="text" id="classLocation" placeholder="例：操場、體育館">
    </div>
    <div class="field">
      <label for="teachingRole">教學角色</label>
      <input type="text" id="teachingRole" placeholder="例：主教練、助教">
    </div>
  </div>
  ```

- **Tests**:
  - [ ] Location and role persist in saved records
  - [ ] Display in detail modal

---

### BUG #5: Date Duplicate Check Lacks Precision
- **Status**: 🔴 OPEN
- **Severity**: Critical  
- **Component**: app.js (checkDateDuplicate)
- **Description**:
  The duplicate check only compares date and class name, causing false positives when a class has multiple sessions on the same day.

- **Current Code** (app.js:105-108):
  ```javascript
  function checkDateDuplicate(dateStr, className) {
    const list = parseRecords();
    return list.filter(r => r.classDate === dateStr && r.className === className);
  }
  ```

- **Example Scenario**:
  - Class P3A on 2025-01-20 at 10:00 AM (saved)
  - Trying to save Class P3A on 2025-01-20 at 14:00 (same day, different time)
  - Result: ❌ Shows duplicate warning (incorrect)

- **Root Cause**:
  No time component in comparison; only checks date + class name.

- **Fix Required**:
  ```javascript
  function checkDateDuplicate(dateStr, className, startTime = '') {
    const list = parseRecords();
    return list.filter(r => 
      r.classDate === dateStr && 
      r.className === className &&
      // Only mark as duplicate if within same 1-hour window
      Math.abs(timeToMinutes(r.classStartTime) - timeToMinutes(startTime)) < 60
    );
  }
  
  function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
  ```

- **Alternative**: Use UUID for unique record IDs instead of date+name

- **Tests**:
  - [ ] Save multiple sessions for same class on same day
  - [ ] Verify no false duplicate warnings
  - [ ] Existing data migration strategy

---

## 🟠 Major Issues (P1)

### BUG #6: XSS Risk in Data Display
- **Status**: 🟠 OPEN
- **Severity**: High
- **Component**: app.js, showDetail()
- **Description**:
  While most output uses `escapeHtml()`, some paths may allow unescaped content if validation is bypassed.

- **Problematic Code** (app.js:844-847):
  ```javascript
  if ($('detailBody')) {
    $('detailBody').innerHTML = `
      <dt>基本資料</dt><dd>${rec.classDate || '–'} | ${escapeHtml(rec.className || '–')}</dd>
      ...
    `; // ← Mixing safe escapeHtml() with potentially unsafe values
  }
  ```

- **Attack Vector**:
  If `rec.classDate` is compromised (via corrupted localStorage), could inject script tags.

- **Fix Required**:
  Use `textContent` instead of `innerHTML` where possible:
  ```javascript
  // Instead of:
  $('detailBody').innerHTML = `<dd>${rec.classDate}</dd>`;
  
  // Use:
  const dd = document.createElement('dd');
  dd.textContent = rec.classDate;
  $('detailBody').appendChild(dd);
  ```

- **Tests**:
  - [ ] Attempt injection via localStorage manipulation
  - [ ] Verify script tags are escaped properly
  - [ ] Security audit of all user input paths

---

### BUG #7: localStorage Plaintext Sensitive Data
- **Status**: 🟠 OPEN
- **Severity**: High
- **Component**: app.js
- **Description**:
  Sensitive course records (student evaluations, scores) stored in plaintext localStorage.

- **Current Code** (app.js:190-192):
  ```javascript
  function saveRecords(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    // No encryption, any script can read this
  }
  ```

- **Risk**: 
  - Malicious browser extensions can access data
  - Vulnerable to XSS attacks
  - Local machine compromise exposes all records

- **Fix Options**:

  **Option A** (Simple, low security):
  ```javascript
  function saveRecords(arr) {
    const encoded = btoa(JSON.stringify(arr));  // Base64
    localStorage.setItem(STORAGE_KEY, encoded);
  }
  
  function parseRecords() {
    try {
      const encoded = localStorage.getItem(STORAGE_KEY);
      return encoded ? JSON.parse(atob(encoded)) : [];
    } catch { return []; }
  }
  ```

  **Option B** (Strong, recommended):
  ```javascript
  // Use TweetNaCl.js or similar
  import { secretbox, random, utils } from 'tweetnacl';
  
  function saveRecords(arr) {
    const key = getOrCreateEncryptionKey();
    const plaintext = utils.decodeUTF8(JSON.stringify(arr));
    const nonce = random(secretbox.nonceLength);
    const box = secretbox(plaintext, nonce, key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      nonce: utils.encodeBase64(nonce),
      box: utils.encodeBase64(box)
    }));
  }
  ```

  **Option C** (Recommended for sensitive data):
  Migrate to server-side storage with proper authentication.

- **Tests**:
  - [ ] Verify localStorage is encrypted
  - [ ] Confirm decryption works after reload
  - [ ] Test with corrupted data handling

---

### BUG #8: Incomplete Form Validation
- **Status**: 🟠 OPEN
- **Severity**: High
- **Component**: app.js, validateFormData()
- **Description**:
  Validation is too lenient and error feedback is poor.

- **Problems**:
  1. Only shows first error in toast
  2. No visual indication of invalid fields
  3. No real-time validation feedback
  4. Slider values not validated for range

- **Current Code** (app.js:79-86):
  ```javascript
  function validateFormData(d) {
    const issues = [];
    if (!d.classDate) issues.push('⚠ 課堂日期為必填');
    if (d.tricks && d.tricks.length === 0) issues.push('⚠ 未記錄任何教學花式');
    // ...
    return issues;
  }
  
  // Usage (app.js:631-633):
  const issues = validateFormData(d);
  if (issues.length > 0) {
    toast('⚠ ' + issues[0]);  // ← Only shows FIRST error!
    return;
  }
  ```

- **Fix Required**:
  ```javascript
  function validateFormData(d) {
    const issues = [];
    if (!d.classDate) {
      issues.push({ field: 'classDate', message: '課堂日期為必填' });
    }
    if (d.tricks && d.tricks.length === 0) {
      issues.push({ field: 'tricks', message: '未記錄任何教學花式' });
    }
    // ... other validations
    return issues;
  }
  
  // Show all errors and highlight fields
  const issues = validateFormData(d);
  if (issues.length > 0) {
    // Highlight invalid fields
    issues.forEach(issue => {
      const field = $(issue.field);
      if (field) {
        field.style.borderColor = 'red';
        field.setAttribute('aria-invalid', 'true');
      }
    });
    
    // Show all errors
    const messages = issues.map(i => i.message).join('\n');
    toast(messages);
    return;
  }
  ```

- **Tests**:
  - [ ] Missing date shows error
  - [ ] Missing tricks shows error
  - [ ] Both errors display together
  - [ ] Invalid fields highlighted

---

### BUG #9: No Error Recovery for localStorage
- **Status**: 🟠 OPEN
- **Severity**: Medium-High
- **Component**: app.js
- **Description**:
  In private browsing or when localStorage is disabled, the app silently fails to save data.

- **Current Code** (app.js:185-189):
  ```javascript
  function parseRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }  // ← Silent failure
  }
  ```

- **Actual Behavior**:
  - User fills form
  - Clicks Save
  - Toast shows "✓ 已儲存"
  - Page reload → data gone
  - No error message

- **Fix Required**:
  ```javascript
  function isStorageAvailable() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  
  // On init
  if (!isStorageAvailable()) {
    showAlert('warning', '本瀏覽器不支援本地存儲。資料可能無法保存。', true);
    // Disable persistent features
  }
  
  // In saveRecords
  function saveRecords(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        toast('❌ 存儲空間已滿，請清除舊記錄');
      } else {
        toast('❌ 無法保存數據');
      }
    }
  }
  ```

- **Tests**:
  - [ ] Private browsing mode detection
  - [ ] Storage quota exceeded handling
  - [ ] User warning when storage unavailable

---

### BUG #10: CSV Formula Injection
- **Status**: 🟠 OPEN
- **Severity**: Medium
- **Component**: app.js, doExportCsv()
- **Description**:
  If trick names contain formula prefixes (`=`, `@`, `+`, `-`), Excel will interpret them as formulas.

- **Current Code** (app.js:697-701):
  ```javascript
  rows = list.map(r => [
    // ...
    (Array.isArray(r.tricks) ? r.tricks.map(t => 
      t.name + (t.detail ? `(${t.detail})` : '')  // ← No escaping!
    ).join('；') : ''),
    // ...
  ].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  ```

- **Example Attack**:
  Trick name: `=1+1`
  CSV output: `"=1+1"`
  Excel result: Displays `2` (formula executed)

- **Fix Required**:
  ```javascript
  function escapeCsvValue(val) {
    const str = String(val);
    // Prefix formula characters with single quote
    if (/^[=@+\-]/.test(str)) {
      return `'${str}`;
    }
    // Escape quotes
    return str.replace(/"/g, '""');
  }
  
  // In doExportCsv:
  rows = list.map(r => [
    r.classDate,
    r.className,
    // ...
    (Array.isArray(r.tricks) ? r.tricks.map(t => 
      escapeCsvValue(t.name) + (t.detail ? `(${escapeCsvValue(t.detail)})` : '')
    ).join('；') : ''),
    // ...
  ].map(c => `"${escapeCsvValue(c)}"`).join(','));
  ```

- **Tests**:
  - [ ] Export trick with `=` prefix
  - [ ] Verify Excel doesn't execute as formula
  - [ ] Test with various dangerous characters

---

## 🟡 Minor Issues (P2)

### BUG #11: Missing HTML Elements for val-* Spans
- **Status**: 🟡 OPEN
- **Severity**: Low
- **Component**: HTML / app.js
- **Description**:
  Some sliders reference `val-fieldId` spans that don't exist in HTML, breaking range value display updates.

- **Affected Sliders**:
  - `val-engagement`
  - `val-mastery`
  - `val-positivity`
  - `val-enthusiasm`
  - etc.

- **Current Pattern** (HTML):
  ```html
  <label>開心指數 <span class="range-val" id="val-engagement">3</span>/5</label>
  ```

- **Problem**: Not all slider value spans exist in HTML, but `bindRange()` expects them.

- **Fix**: Ensure every input[type="range"] has matching `val-fieldId` span or create them dynamically.

---

### BUG #12: Time Input Not Supported in Firefox
- **Status**: 🟡 OPEN
- **Severity**: Low
- **Component**: HTML / styles.css
- **Description**:
  HTML5 `type="time"` input shows as text input in Firefox without polyfill.

- **Current HTML**:
  ```html
  <input type="time" id="classStartTime">
  ```

- **Firefox Behavior**: Shows as text input "HH:MM" format

- **Safari**: Similar behavior on older versions

- **Fix Options**:

  **Option A** (Simple, document limitation):
  Add note: "Please use HH:MM format (24-hour)"

  **Option B** (Add Flatpickr polyfill):
  ```html
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  <input type="time" id="classStartTime" data-enableTime="true" data-noCalendar="true">
  ```

  **Option C** (Progressive enhancement):
  ```javascript
  // Detect time input support
  function supportsTimeInput() {
    const input = document.createElement('input');
    input.type = 'time';
    return input.type === 'time';
  }
  ```

- **Tests**:
  - [ ] Firefox time input functionality
  - [ ] Safari time input functionality
  - [ ] Format validation

---

### BUG #13: Mobile Button Sizes Too Small
- **Status**: 🟡 OPEN
- **Severity**: Low-Medium
- **Component**: styles.css
- **Description**:
  Touch targets smaller than iOS recommended minimum of 44x44px.

- **Current Code** (styles.css):
  ```css
  .topbar-menu {
    padding: 0.4rem;  /* ≈ 16px, actual button ≈ 24x24px */
    border-radius: var(--radius-sm);
  }
  ```

- **Affected Elements**:
  - `.topbar-menu` (hamburger) 
  - `.modal-close`
  - Some `.quick-btns`

- **Fix Required**:
  ```css
  .topbar-menu {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
  }
  
  @media (max-width: 480px) {
    .quick-btns button {
      min-width: 44px;
      min-height: 44px;
    }
  }
  ```

- **Tests**:
  - [ ] Test on actual mobile device (iOS/Android)
  - [ ] Verify touch targets >= 44px
  - [ ] Confirm no accidental touches

---

### BUG #14: Inconsistent Trick Level UI
- **Status**: 🟡 OPEN
- **Severity**: Low
- **Component**: app.js, styles.css
- **Description**:
  Trick level select dropdown embedded in tag looks different from other option buttons.

- **Current Code** (app.js:438-447):
  ```html
  <div class="trick-tag">
    <!-- ... -->
    <div class="trick-level-select">
      <select class="trick-level" data-i="0">
        <option value="">無等級</option>
        <option value="初級">初級</option>
        <!-- ... -->
      </select>
    </div>
    <!-- ... -->
  </div>
  ```

- **Issue**: Select looks cramped, style inconsistent with `.option-btns`

- **Fix**: Either:
  1. Replace select with button group (`.option-btns`)
  2. Or improve `.trick-level-select` styling

---

### BUG #15: No Loading Indicator for Data Operations
- **Status**: 🟡 OPEN
- **Severity**: Low
- **Component**: app.js
- **Description**:
  Large data operations (CSV export, large record set filtering) have no loading feedback.

- **Current Code**:
  ```javascript
  $('btnExport')?.addEventListener('click', doExportCsv);  // Instant, no feedback
  ```

- **User Experience**: Button click with no response on slow devices = user clicks multiple times

- **Fix**:
  ```javascript
  function doExportCsvWithProgress() {
    const btn = $('btnExport');
    btn.disabled = true;
    btn.textContent = '生成中...';
    
    // Defer to allow UI update
    setTimeout(() => {
      try {
        doExportCsv();
      } finally {
        btn.disabled = false;
        btn.textContent = '匯出全部記錄（CSV）';
      }
    }, 0);
  }
  ```

- **Tests**:
  - [ ] Export with 1000+ records
  - [ ] Verify button disabled state
  - [ ] Confirm completion feedback

---

## 🟢 Enhancement Requests (Not Bugs)

### ENH #1: Dark Mode Support
- Low priority but requested for evening use
- Would require CSS variables expansion

### ENH #2: Undo/Redo Functionality  
- User feedback: "wish I could undo delete"
- Would require transaction history

### ENH #3: Data Export Formats
- CSV works, but users want Excel (.xlsx), PDF, JSON

### ENH #4: Internationalization (i18n)
- Currently Chinese-only
- Could support English, Cantonese, etc.

### ENH #5: Search/Filter by Multiple Criteria
- Currently filters work separately
- Users want: "Find P3A class on Mondays with engagement < 3"

---

## 📊 Bug Statistics

| Severity | Count | % |
|----------|-------|-----|
| 🔴 Critical | 5 | 33% |
| 🟠 Major | 5 | 33% |
| 🟡 Minor | 5 | 33% |
| **Total** | **15** | **100%** |

---

## 🔄 Resolution Progress

| ID | Status | Assignee | Due Date |
|----|--------|----------|----------|
| #1 | OPEN | - | 2025-01-28 |
| #2 | OPEN | - | 2025-01-28 |
| #3 | OPEN | - | 2025-01-28 |
| #4 | OPEN | - | 2025-01-28 |
| #5 | OPEN | - | 2025-01-28 |
| #6-10 | OPEN | - | 2025-02-04 |
| #11-15 | OPEN | - | 2025-02-11 |

---

## 📝 Notes

- All critical bugs must be fixed before v2.1 production release
- Major bugs strongly recommended before release
- Minor bugs can be deferred to v2.2
- Enhancement requests are roadmap items for future versions

---

**Report Generated**: 2025-01-21  
**Next Review**: After critical bugs resolved

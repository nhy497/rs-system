# 🧪 QA Test Plan & Test Cases

**System**: HKJRA 教練記錄系統 · 跳繩課堂 Checkpoint  
**Version**: v2.1  
**Test Date**: 2025-01-21  

---

## 📋 Test Scope

### In Scope ✅
- Core functionality (form submission, data persistence)
- Data validation and error handling
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness
- Accessibility (WCAG 2.1 AA)
- Security (XSS, localStorage, CSV injection)

### Out of Scope ❌
- Firebase backend (not configured)
- Multi-user scenarios (requires Firebase)
- Performance load testing (< 1000 records)
- Server-side security

---

## 🎯 Test Categories

### 1. Functional Testing

#### TC-001: Basic Form Input and Submission
- **Objective**: Verify form accepts valid data and saves correctly
- **Preconditions**: App loaded, localStorage enabled
- **Test Steps**:
  1. Navigate to "課堂概覽" page
  2. Fill all required fields:
     - 課堂日期: 2025-01-20
     - 班級名稱: P3A
     - 人數: 20
     - 教學花式: 添加 "逐步跳繩"
  3. Click "儲存本堂記錄"
  4. Reload page
  5. Navigate to "學生管理"

- **Expected Result**:
  - Toast shows "✓ 已儲存本堂記錄"
  - Data appears in "最近 10 堂課" list
  - Date and class name visible after reload
  - P3A appears in "按班別" section

- **Pass Criteria**: ✅ All steps completed successfully
- **Status**: ⏳ Ready to test

---

#### TC-002: Validation - Missing Required Fields
- **Objective**: Verify form rejects incomplete submissions
- **Test Steps**:
  1. Click "儲存本堂記錄" without filling anything
  2. Observe error feedback

- **Expected Result**:
  - Toast message shows first validation error
  - Form is not submitted

- **Current Status**: ⚠️ PARTIAL (only first error shown)
- **Pass Criteria**: ✅ At least one error message shown

---

#### TC-003: Teaching Trick Addition
- **Objective**: Verify trick management works correctly
- **Test Steps**:
  1. In "技能進步" card, enter:
     - 花式名稱: 正向迴旋
     - 教學細節: 轉肩跳
  2. Click "+ 新增"
  3. Select skill level "初級"
  4. Repeat for 3 total tricks
  5. Save record
  6. Reload page

- **Expected Result**:
  - Tricks display as tags with level indicators
  - Tricks persist after reload
  - Remove button (×) deletes trick correctly
  - Tricks appear in "動作記錄" table

- **Pass Criteria**: ✅ All tricks saved and displayable

---

#### TC-004: Data Import - Duplicate Date Check
- **Objective**: Verify duplicate detection for same day, same class
- **Preconditions**: Record for P3A on 2025-01-20 already exists
- **Test Steps**:
  1. Create new record with:
     - 課堂日期: 2025-01-20
     - 班級名稱: P3A
     - 人數: 20
  2. Click "儲存本堂記錄"

- **Expected Result**:
  - Confirmation dialog appears
  - Shows existing record details
  - Offers option to overwrite or cancel

- **Current Status**: 🔴 BROKEN (date precision issue - see BUG #5)
- **Fix Required Before**: Deployment

---

#### TC-005: Range Slider Interaction
- **Objective**: Verify slider controls update values correctly
- **Test Steps**:
  1. Locate "投入度" card
  2. Slide "開心指數" to value 5
  3. Click quick button "2"
  4. Observe value span

- **Expected Result**:
  - Slider moves smoothly
  - Value span updates to "2"
  - Quick button highlights in blue
  - Similar behavior for all range sliders

- **Pass Criteria**: ✅ All sliders functional

---

#### TC-006: Search and Sort
- **Objective**: Verify student management search and sort
- **Preconditions**: At least 5 records with different dates and classes
- **Test Steps**:
  1. Navigate to "學生管理"
  2. Enter "P3A" in search box
  3. Verify results filter
  4. Change "排序方式" to "日期 (舊→新)"
  5. Verify order reverses
  6. Change to "掌握度 (高→低)"
  7. Verify sorted by mastery percentage

- **Expected Result**:
  - Search filters results in real-time
  - Sort options change list order
  - "按班別" section updates dynamically

- **Pass Criteria**: ✅ Search and sort working

---

#### TC-007: CSV Export
- **Objective**: Verify CSV export produces valid file
- **Preconditions**: At least 2 records with tricks
- **Test Steps**:
  1. Navigate to "統計分析"
  2. Click "匯出全部記錄（CSV）"
  3. Download file
  4. Open in Excel/Google Sheets

- **Expected Result**:
  - File downloads with name: `跳繩課堂Checkpoint_2025-01-21.csv`
  - All columns display correctly
  - Chinese characters readable
  - No formula injection warnings

- **Pass Criteria**: ✅ Valid CSV opens in spreadsheet

---

### 2. Data Persistence Testing

#### TC-008: localStorage Persistence
- **Objective**: Verify data survives page reload
- **Test Steps**:
  1. Fill form completely
  2. Click save
  3. Press F5 (refresh)
  4. Check if data still present

- **Expected Result**:
  - Form data remains in "最近 10 堂課"
  - Counts update in statistics
  - No data loss

- **Pass Criteria**: ✅ Data persists across reload

---

#### TC-009: localStorage Error Recovery
- **Objective**: Verify graceful degradation when localStorage unavailable
- **Test Steps**:
  1. Open browser dev tools
  2. Clear all site data
  3. Reload page
  4. Try to save a record

- **Expected Result**:
  - App detects storage unavailable
  - Shows warning message
  - User can still view/edit but can't persist
  - No crashes or errors in console

- **Pass Criteria**: ✅ Graceful error handling
- **Status**: ⚠️ NEEDS IMPLEMENTATION (BUG #9)

---

### 3. Cross-Browser Testing

#### TC-010: Chrome (Latest)
- **Platform**: Windows 10 / macOS
- **Test Cases**: TC-001 to TC-009
- **Expected**: ✅ All pass

---

#### TC-011: Firefox (Latest)
- **Platform**: Windows 10 / macOS
- **Test Cases**: TC-001 to TC-009
- **Known Issues**:
  - Time input shows as text box
  - Range slider thumb style slightly different

- **Expected**: ⚠️ Mostly pass, time input workaround needed

---

#### TC-012: Safari (macOS/iOS)
- **Platform**: macOS 12+ / iOS 14+
- **Test Cases**: TC-001 to TC-009
- **Known Issues**:
  - Time input shows as text box
  - Mobile layout squeeze on sidebar

- **Expected**: ⚠️ Mostly pass

---

#### TC-013: Edge (Latest)
- **Platform**: Windows 10/11
- **Test Cases**: TC-001 to TC-009
- **Expected**: ✅ All pass (Chromium-based)

---

### 4. Mobile/Responsive Testing

#### TC-014: Mobile Layout (320px width)
- **Device**: iPhone SE (375px) or simulator
- **Test Steps**:
  1. Open app in mobile browser
  2. Verify sidebar collapses
  3. Try filling form
  4. Test all buttons reach >= 44x44px
  5. Scroll through all sections

- **Expected Result**:
  - Sidebar hidden by default (hamburger menu)
  - Form fields stack vertically
  - All touch targets adequate size
  - No horizontal scroll

- **Pass Criteria**: ✅ Mobile fully functional
- **Status**: ⚠️ Button sizes need fix (BUG #13)

---

#### TC-015: Tablet Layout (768px width)
- **Device**: iPad or 768px viewport
- **Test Steps**:
  1. Verify 2-column grid layout
  2. Test landscape orientation
  3. Check all cards visible

- **Expected Result**:
  - Two-column layout displays properly
  - Sidebar visible (not collapsed)
  - Forms easy to use

- **Pass Criteria**: ✅ Tablet layout correct

---

### 5. Security Testing

#### TC-016: XSS Prevention - Script Injection
- **Objective**: Verify input sanitization prevents script execution
- **Test Steps**:
  1. Open browser console
  2. Set localStorage with malicious data:
     ```javascript
     localStorage.setItem('rope-skip-checkpoints', 
       JSON.stringify([{classDate: "2025-01-20", className: "<img src=x onerror='alert(1)'>", tricks: []}]));
     ```
  3. Reload page
  4. Navigate to "學生管理"
  5. Observe detail modal with the compromised record

- **Expected Result**:
  - No alert pops up
  - Dangerous code rendered as text
  - Can see literal HTML in display

- **Pass Criteria**: ✅ No script execution
- **Status**: ⚠️ Partially verified (needs audit)

---

#### TC-017: CSV Formula Injection
- **Objective**: Verify formula characters are escaped in CSV
- **Test Steps**:
  1. Create record with trick name: `=1+1`
  2. Export to CSV
  3. Open in Excel
  4. Check trick cell formula bar

- **Expected Result**:
  - Cell displays `=1+1` as text, not evaluated
  - Formula bar shows escaped value (`'=1+1`)
  - No calculation performed

- **Pass Criteria**: ✅ Formula not executed
- **Status**: ❌ FAILED (BUG #10)

---

#### TC-018: CSRF Protection
- **Objective**: Verify no CSRF vulnerabilities with localStorage
- **Test Steps**:
  - As client-side only app, CSRF not applicable
  - Verify same-origin policy prevents external interference

- **Expected Result**: ✅ Safe (localStorage per-origin)

---

### 6. Accessibility Testing

#### TC-019: Keyboard Navigation
- **Objective**: Verify app fully usable via keyboard
- **Test Steps**:
  1. Use Tab to navigate all form fields
  2. Use Shift+Tab to go backward
  3. Use Enter to submit form
  4. Use arrow keys on sliders
  5. Test modal close with Escape key

- **Expected Result**:
  - All interactive elements reachable
  - Focus visible (outline/highlight)
  - Sliders respond to arrow keys
  - Escape closes modals

- **Pass Criteria**: ✅ Full keyboard access
- **Status**: ⚠️ Partial (modals may lack Escape handler)

---

#### TC-020: Screen Reader (NVDA/JAWS)
- **Objective**: Verify ARIA labels and semantic HTML
- **Test Steps**:
  1. Enable screen reader
  2. Navigate to form fields
  3. Listen for labels and hints
  4. Open detail modal

- **Expected Result**:
  - Screen reader announces form labels
  - Button purposes clear
  - Modal purpose announced
  - No "unlabeled" field warnings

- **Pass Criteria**: ✅ Screen reader friendly
- **Status**: ⚠️ Partial (needs audit)

---

### 7. Performance Testing

#### TC-021: Large Dataset Performance
- **Objective**: Test performance with 1000+ records
- **Test Steps**:
  1. Inject 1000 dummy records into localStorage
  2. Navigate to "統計分析"
  3. Measure time to render
  4. Try filtering

- **Expected Result**:
  - Initial render < 2s
  - Filter response < 1s
  - No browser freeze

- **Current Status**: 🔴 LIKELY FAIL (no optimization)
- **Note**: BUG #7 mentions performance issue

---

#### TC-022: DOM Operations Speed
- **Objective**: Verify DOM updates don't cause jank
- **Test Steps**:
  1. Open browser DevTools > Performance
  2. Record while saving a record
  3. Check FPS and frame times

- **Expected Result**:
  - FPS stays > 30
  - No frames > 16ms (for 60fps)
  - Smooth animations

- **Current Status**: ⚠️ Need baseline measurement

---

## 🗂️ Test Data Sets

### Sample Record for Testing
```javascript
{
  classDate: "2025-01-20",
  className: "P3A",
  classSize: 20,
  classLocation: "操場",
  teachingRole: "主教練",
  classStartTime: "10:00",
  classEndTime: "11:30",
  classDurationMins: 90,
  notes: "天氣晴朗，學生投入度高",
  engagement: 5,
  atmosphere: "開心",
  tricks: [
    { name: "正向迴旋", detail: "轉肩跳", level: "初級" },
    { name: "逐步跳繩", detail: "基本功", level: "初級" }
  ],
  mastery: 75,
  plannedTime: 60,
  actualTime: 90,
  skillLevel: "初級",
  helpOthers: 80,
  interaction: 70,
  teamwork: 85,
  selfPractice: 60,
  activeLearn: 75,
  positivity: 4,
  enthusiasm: 5,
  teachScore: 8,
  satisfaction: 4,
  disciplineCount: 1,
  flexibility: 8,
  individual: 70
}
```

### Test Class Names
- P3A, P3B, P4A (Primary)
- 初級班, 中級班, 進階班 (Level-based)
- 星期一班, 星期三班 (Day-based)
- 成人班 (Special)

### Test Dates Range
- Past 30 days (for filtering)
- Last 7 days (for "This week" calculation)
- Exact duplicates (for duplicate detection)

---

## ✅ Test Execution Checklist

### Before Testing
- [ ] Clear browser cache and localStorage
- [ ] Disable extensions
- [ ] Close other tabs
- [ ] Set network speed to normal
- [ ] Prepare test data

### During Testing
- [ ] Capture screenshots of issues
- [ ] Record console errors
- [ ] Note timing for performance tests
- [ ] Test on actual devices (not just emulators)

### After Testing
- [ ] Compile test results
- [ ] Assign bug IDs
- [ ] Prioritize failures
- [ ] Create regression test list

---

## 📊 Test Results Summary Template

| Test Case | Result | Notes | Blocker |
|-----------|--------|-------|---------|
| TC-001 | ⏳ | Awaiting test | - |
| TC-002 | ⏳ | Awaiting test | - |
| TC-003 | ⏳ | Awaiting test | - |
| ... | ... | ... | ... |

**Total Cases**: 22  
**Passed**: 0  
**Failed**: 0  
**Blockers**: 0  

---

## 🎯 Pass/Fail Criteria

### Critical (Must Pass)
- All TC-001 to TC-004 (core functionality)
- TC-016 (XSS prevention)
- TC-017 (CSV safety) - currently fails
- TC-019 (keyboard access)

### Important (Should Pass)
- TC-005 to TC-007 (features)
- TC-008 (persistence)
- TC-010 to TC-013 (browser compatibility)
- TC-014 (mobile layout)

### Nice to Have
- TC-021 to TC-022 (performance optimization)
- TC-020 (screen reader)

---

## 🐛 Known Issues in Test Plan

1. **BUG #1** affects TC-001 (missing time inputs)
2. **BUG #5** affects TC-004 (duplicate detection broken)
3. **BUG #10** affects TC-017 (CSV injection fails)
4. **BUG #13** affects TC-014 (mobile buttons too small)
5. **BUG #9** affects TC-009 (error recovery missing)

**Recommendation**: Fix critical bugs before running test suite.

---

## 📅 Test Schedule

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | 1 day | Functional testing (TC-001-007) |
| Phase 2 | 1 day | Data & persistence (TC-008-009) |
| Phase 3 | 1 day | Browser compatibility (TC-010-013) |
| Phase 4 | 1 day | Mobile & accessibility (TC-014-020) |
| Phase 5 | 0.5 day | Performance (TC-021-022) |
| Total | 4.5 days | - |

---

## 👥 Test Roles

- **QA Lead**: Overall test coordination
- **Functional Tester**: Run TC-001 to TC-009
- **Browser Tester**: Run TC-010 to TC-013 across platforms
- **Mobile Tester**: Run TC-014 to TC-015 on devices
- **Security Tester**: Run TC-016 to TC-018

---

## 📝 Issue Reporting Template

```
**Test Case**: TC-XXX
**Title**: [Brief description]
**Severity**: 🔴 Critical / 🟠 Major / 🟡 Minor
**Environment**: Chrome 120 / Windows 10
**Preconditions**: [What was set up before]

**Steps to Reproduce**:
1. ...
2. ...

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshot**: [Attach]
**Console Error**: [Paste if applicable]

**Related Bugs**: #X, #Y
```

---

**Test Plan Version**: 1.0  
**Last Updated**: 2025-01-21  
**Next Review**: After critical bugs fixed

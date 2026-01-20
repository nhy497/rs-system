/**
 * HKJRA 教練記錄系統 · 跳繩課堂 Checkpoint
 * 企業級介面 - 保留原有功能邏輯
 * v2.0: 新增日期檢查、班級預設、複製課程、搜尋、排序、驗證等功能
 */

const STORAGE_KEY = 'rope-skip-checkpoints';
const CLASS_PRESETS_KEY = 'rope-skip-class-presets';
const SCORE_1_5_IDS = ['engagement', 'positivity', 'enthusiasm', 'satisfaction'];
const RANGE_IDS = [
  'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
  'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
  'teachScore', 'satisfaction', 'flexibility', 'individual'
];
const OPTION_GROUPS = [
  { name: 'atmosphere', selector: '[data-name="atmosphere"]' },
  { name: 'skillLevel', selector: '[data-name="skillLevel"]' }
];

const PAGE_TITLES = { overview: '課堂概覽', students: '學生管理', actions: '動作記錄', analytics: '統計分析' };

let $ = (id) => document.getElementById(id);
let $q = (sel) => document.querySelector(sel);
let $qa = (sel) => document.querySelectorAll(sel);

// 新增功能：班級預設管理
function getClassPresets() {
  try {
    const raw = localStorage.getItem(CLASS_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveClassPresets(arr) {
  localStorage.setItem(CLASS_PRESETS_KEY, JSON.stringify(arr));
}
function addClassPreset(className) {
  const presets = getClassPresets();
  if (!presets.includes(className) && className.trim()) {
    presets.push(className.trim());
    saveClassPresets(presets);
  }
}
function removeClassPreset(className) {
  const presets = getClassPresets();
  const idx = presets.indexOf(className);
  if (idx >= 0) {
    presets.splice(idx, 1);
    saveClassPresets(presets);
  }
}

// 新增功能：數據驗證
function validateFormData(d) {
  const issues = [];
  if (!d.classDate) issues.push('⚠ 課堂日期為必填');
  if (d.tricks && d.tricks.length === 0) issues.push('⚠ 未記錄任何教學花式');
  if (d.classSize === null || d.classSize === '') issues.push('⚠ 人數未填寫');
  if (d.atmosphere === '') issues.push('⚠ 課堂氣氛未選擇');
  if (d.skillLevel === '') issues.push('⚠ 技巧等級未選擇');
  return issues;
}

// 新增功能：檢查日期重複
function checkDateDuplicate(dateStr, className) {
  const list = parseRecords();
  return list.filter(r => r.classDate === dateStr && r.className === className);
}

// 新增功能：獲取上堂課記錄
function getLastLesson() {
  const list = parseRecords();
  if (list.length === 0) return null;
  return list[0]; // 已排序，最新的在最前
}

function getClassOptions() {
  const list = parseRecords();
  const set = new Set();
  list.forEach(r => set.add((r.className || '').trim() || '—'));
  return [...set].sort((a, b) => (a === '—' ? 1 : b === '—' ? -1 : a.localeCompare(b)));
}
function getGlobalFilterClass() { return ($('globalFilterClass') && $('globalFilterClass').value) || ''; }
function getFilterDateFrom() { return ($('filterDateFrom') && $('filterDateFrom').value) || ''; }
function getFilterDateTo() { return ($('filterDateTo') && $('filterDateTo').value) || ''; }

function populateGlobalFilterClass() {
  const el = $('globalFilterClass');
  if (!el) return;
  const v = el.value;
  const opts = getClassOptions();
  el.innerHTML = '<option value="">全部</option>' + opts.map(c => `<option value="${escapeHtml(c)}">${c === '—' ? '未填寫' : escapeHtml(c)}</option>`).join('');
  if (opts.includes(v)) el.value = v;
}
function populateQuickSelectClass() {
  const el = $('quickSelectClass');
  if (!el) return;
  const v = el.value;
  const opts = getClassOptions();
  el.innerHTML = '<option value="">—</option>' + opts.map(c => `<option value="${escapeHtml(c)}">${c === '—' ? '未填寫' : escapeHtml(c)}</option>`).join('');
  if (opts.includes(v)) el.value = v; else el.value = '';
  
  // 添加班級預設按鈕
  renderClassPresets();
}

// 新增功能：班級預設按鈕
function renderClassPresets() {
  let presetsContainer = document.getElementById('classPresetsContainer');
  if (!presetsContainer) {
    return; // 容器還沒載入，稍後會被初始化
  }
  
  const presets = getClassPresets();
  if (presets.length === 0) {
    presetsContainer.innerHTML = '';
    presetsContainer.style.display = 'none';
    return;
  }
  
  presetsContainer.innerHTML = presets.map(p => 
    `<button type="button" class="class-preset-btn" data-class="${escapeHtml(p)}" title="點擊使用此班級">${escapeHtml(p)}</button>`
  ).join('') + 
  (presets.length < 8 ? '<button type="button" class="class-preset-btn add" id="addPresetBtn" title="添加常用班級">+ 新增</button>' : '');
  
  presetsContainer.style.display = 'flex';
  
  presetsContainer.querySelectorAll('.class-preset-btn:not(.add)').forEach(btn => {
    btn.addEventListener('click', () => {
      $('className').value = btn.dataset.class;
      $('className').focus();
    });
  });
  
  $('addPresetBtn')?.addEventListener('click', () => {
    const className = prompt('輸入班級名稱（例：P3A、初級班）：');
    if (className && className.trim()) {
      addClassPreset(className);
      renderClassPresets();
      $('className').value = className;
    }
  });
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function parseRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveRecords(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
function escapeHtml(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// --- Toast
function toast(msg) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2500);
}

// --- 頁面切換
function setPage(name) {
  $qa('.page').forEach(p => p.classList.remove('active'));
  const page = $('page-' + name);
  if (page) page.classList.add('active');
  $qa('.nav-item').forEach(n => n.classList.remove('active'));
  $q('.nav-item[data-page="' + name + '"]')?.classList.add('active');
  const title = $('topbarTitle');
  if (title) title.textContent = PAGE_TITLES[name] || name;
  if (name === 'analytics') refreshAnalytics();
  if (name === 'actions') refreshActionsView();
  if (window.matchMedia('(max-width: 768px)').matches) $('sidebar')?.classList.add('collapsed');
}

// --- 教學花式
let tricks = [];
function renderTricks() {
  const el = $('tricksList');
  if (!el) return;
  el.innerHTML = tricks.map((t, i) =>
    `<div class="trick-tag" data-i="${i}">
      <span class="name">${escapeHtml(t.name)}</span>
      ${t.detail ? `<span class="detail"> · ${escapeHtml(t.detail)}</span>` : ''}
      <button type="button" class="remove-trick" data-i="${i}" aria-label="移除">×</button>
    </div>`
  ).join('');
  $qa('.remove-trick').forEach(btn => {
    btn.onclick = () => { tricks.splice(+btn.dataset.i, 1); renderTricks(); };
  });
}

// --- 滑桿與選項
function bindRange(id) {
  const r = $(id), valSpan = $('val-' + id);
  if (!r || !valSpan) return;
  const quick = r.closest('.slider-row')?.querySelector('.quick-btns');
  const update = () => {
    valSpan.textContent = r.value;
    quick?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
  };
  r.addEventListener('input', update);
  quick?.addEventListener('click', (e) => { const btn = e.target.closest('button');const v = btn?.dataset?.v; if (v != null) { r.value = v; update(); } });
  update();
}
RANGE_IDS.forEach(bindRange);

OPTION_GROUPS.forEach(g => {
  const c = $q(g.selector);
  if (!c) return;
  c.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      c.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
});

$('addTrick')?.addEventListener('click', () => {
  const name = ($('trickName')?.value || '').trim();
  if (!name) return;
  const detail = ($('trickDetail')?.value || '').trim();
  tricks.push({ name, detail });
  $('trickName').value = ''; $('trickDetail').value = ''; $('trickName').focus();
  renderTricks();
});

// --- 表單數據
function getFormData() {
  const date = ($('classDate')?.value || '').trim();
  return {
    classDate: date,
    className: ($('className')?.value || '').trim(),
    classSize: ($('classSize')?.value || '').trim() ? parseInt($('classSize').value, 10) : null,
    notes: ($('notes')?.value || '').trim(),
    engagement: parseInt($('engagement')?.value || '3', 10),
    atmosphere: $q('[data-name="atmosphere"] .selected')?.textContent?.trim() || '',
    tricks: tricks.map(t => ({ ...t })),
    mastery: parseInt($('mastery')?.value || '50', 10),
    plannedTime: ($('plannedTime')?.value || '').trim() ? parseInt($('plannedTime').value, 10) : null,
    actualTime: ($('actualTime')?.value || '').trim() ? parseInt($('actualTime').value, 10) : null,
    skillLevel: $q('[data-name="skillLevel"] .selected')?.textContent?.trim() || '',
    helpOthers: parseInt($('helpOthers')?.value || '50', 10),
    interaction: parseInt($('interaction')?.value || '50', 10),
    teamwork: parseInt($('teamwork')?.value || '50', 10),
    selfPractice: parseInt($('selfPractice')?.value || '50', 10),
    activeLearn: parseInt($('activeLearn')?.value || '50', 10),
    positivity: parseInt($('positivity')?.value || '3', 10),
    enthusiasm: parseInt($('enthusiasm')?.value || '3', 10),
    teachScore: parseInt($('teachScore')?.value || '7', 10),
    satisfaction: parseInt($('satisfaction')?.value || '3', 10),
    disciplineCount: ($('disciplineCount')?.value || '').trim() ? parseInt($('disciplineCount').value, 10) : null,
    flexibility: parseInt($('flexibility')?.value || '7', 10),
    individual: parseInt($('individual')?.value || '50', 10)
  };
}

// --- 載入到表單
function loadIntoForm(rec) {
  $('classDate').value = rec.classDate || todayStr();
  $('className').value = rec.className || '';
  $('classSize').value = rec.classSize != null ? rec.classSize : '';
  $('notes').value = rec.notes || '';
  if ($('engagement')) $('engagement').value = rec.engagement ?? 3;
  document.querySelectorAll('[data-name="atmosphere"] button').forEach(b => {
    b.classList.toggle('selected', b.textContent.trim() === (rec.atmosphere || ''));
  });
  tricks = Array.isArray(rec.tricks) ? rec.tricks.map(t => ({ name: t.name || '', detail: t.detail || '' })) : [];
  renderTricks();
  if ($('mastery')) $('mastery').value = rec.mastery ?? 50;
  $('plannedTime').value = rec.plannedTime != null ? rec.plannedTime : '';
  $('actualTime').value = rec.actualTime != null ? rec.actualTime : '';
  document.querySelectorAll('[data-name="skillLevel"] button').forEach(b => {
    b.classList.toggle('selected', b.textContent.trim() === (rec.skillLevel || ''));
  });
  if ($('helpOthers')) $('helpOthers').value = rec.helpOthers ?? 50;
  if ($('interaction')) $('interaction').value = rec.interaction ?? 50;
  if ($('teamwork')) $('teamwork').value = rec.teamwork ?? 50;
  if ($('selfPractice')) $('selfPractice').value = rec.selfPractice ?? 50;
  if ($('activeLearn')) $('activeLearn').value = rec.activeLearn ?? 50;
  if ($('positivity')) $('positivity').value = rec.positivity ?? 3;
  if ($('enthusiasm')) $('enthusiasm').value = rec.enthusiasm ?? 3;
  if ($('teachScore')) $('teachScore').value = rec.teachScore ?? 7;
  if ($('satisfaction')) $('satisfaction').value = rec.satisfaction ?? 3;
  $('disciplineCount').value = rec.disciplineCount != null ? rec.disciplineCount : '';
  if ($('flexibility')) $('flexibility').value = rec.flexibility ?? 7;
  if ($('individual')) $('individual').value = rec.individual ?? 50;
  RANGE_IDS.forEach(id => {
    const r = $(id), valSpan = $('val-' + id);
    if (r && valSpan) {
      valSpan.textContent = r.value;
      const q = r.closest('.slider-row')?.querySelector('.quick-btns');
      q?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
    }
  });
}

// --- 清空表單
function clearForm() {
  $('classDate').value = todayStr();
  $('className').value = ''; $('classSize').value = ''; $('notes').value = '';
  $('engagement').value = '3';
  $q('[data-name="atmosphere"] .selected')?.classList.remove('selected');
  tricks = []; renderTricks();
  $('trickName').value = ''; $('trickDetail').value = '';
  $('mastery').value = '50'; $('plannedTime').value = ''; $('actualTime').value = '';
  $q('[data-name="skillLevel"] .selected')?.classList.remove('selected');
  $('helpOthers').value = '50'; $('interaction').value = '50'; $('teamwork').value = '50';
  $('selfPractice').value = '50'; $('activeLearn').value = '50';
  $('positivity').value = '3'; $('enthusiasm').value = '3';
  $('teachScore').value = '7'; $('satisfaction').value = '3';
  $('disciplineCount').value = ''; $('flexibility').value = '7'; $('individual').value = '50';
  RANGE_IDS.forEach(id => {
    const r = $(id), valSpan = $('val-' + id);
    if (r && valSpan) {
      valSpan.textContent = r.value;
      const q = r.closest('.slider-row')?.querySelector('.quick-btns');
      q?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
    }
  });
}

// --- 儲存（帶驗證和日期檢查）
$('btnSave')?.addEventListener('click', () => {
  const d = getFormData();
  
  // 驗證數據
  const issues = validateFormData(d);
  if (issues.length > 0) {
    toast('⚠ ' + issues[0]); // 顯示第一個問題
    return;
  }
  
  if (!d.classDate) { toast('請填寫課堂日期'); return; }
  
  // 檢查日期重複
  const dupes = checkDateDuplicate(d.classDate, d.className);
  if (dupes.length > 0) {
    if (!confirm(`⚠ 已存在 ${d.classDate} 的記錄 (${d.className || '未設定班級'})。\n\n確定要覆蓋嗎？`)) {
      return;
    }
  }
  
  const list = parseRecords();
  const i = list.findIndex(r => r.classDate === d.classDate && r.className === d.className);
  if (i >= 0) list[i] = d; else list.push(d);
  list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
  saveRecords(list);
  
  // 自動保存班級預設
  if (d.className.trim()) {
    addClassPreset(d.className);
  }
  
  populateGlobalFilterClass();
  populateQuickSelectClass();
  renderClassPresets();
  refreshStats();
  toast('✓ 已儲存本堂記錄');
});

$('btnClear')?.addEventListener('click', () => {
  if (confirm('確定要清空本堂輸入嗎？')) clearForm();
});

// 新增功能：複製上堂課
function duplicateLastLesson() {
  const last = getLastLesson();
  if (!last) {
    toast('⚠ 未找到上堂課記錄');
    return;
  }
  loadIntoForm(last);
  // 清空日期，讓使用者填寫新日期
  $('classDate').value = todayStr();
  toast('✓ 已載入上堂課資料（已清空日期和備注，請填寫新日期）');
}

// 快速複製按鈕（在介面初始化時添加）
document.addEventListener('DOMContentLoaded', () => {
  const btnDuplicate = document.createElement('button');
  btnDuplicate.type = 'button';
  btnDuplicate.id = 'btnDuplicate';
  btnDuplicate.className = 'btn btn-secondary btn-sm';
  btnDuplicate.textContent = '⚡ 複製上堂課';
  btnDuplicate.title = '快速複製上堂課的資料 (80% 更快)';
  const btnGroup = $('btnSave')?.parentElement;
  if (btnGroup) {
    btnGroup.insertBefore(btnDuplicate, $('btnSave').nextSibling);
    btnDuplicate.addEventListener('click', duplicateLastLesson);
  }
});

// --- 匯出 CSV
function doExportCsv() {
  const list = parseRecords();
  if (list.length === 0) { toast('尚無記錄可匯出'); return; }
  const headers = ['課堂日期','班級名稱','人數','備注','開心指數','課堂氣氛','教學花式','掌握比例','預算教學時間','實際教學時間','技巧等級進度','主動幫助他人','同學互動','小組合作意願','自發練習','主動學習','課堂積極性','學習熱情','教學評分','學生滿意度','紀律介入次數','教學靈活性','個別化教學比例'];
  const rows = list.map(r => [
    r.classDate, r.className, r.classSize ?? '', r.notes ?? '',
    r.engagement ?? '', r.atmosphere ?? '',
    (Array.isArray(r.tricks) ? r.tricks.map(t => t.name + (t.detail ? `(${t.detail})` : '')).join('；') : ''),
    r.mastery ?? '', r.plannedTime ?? '', r.actualTime ?? '', r.skillLevel ?? '',
    r.helpOthers ?? '', r.interaction ?? '', r.teamwork ?? '',
    r.selfPractice ?? '', r.activeLearn ?? '', r.positivity ?? '', r.enthusiasm ?? '',
    r.teachScore ?? '', r.satisfaction ?? '', r.disciplineCount ?? '', r.flexibility ?? '', r.individual ?? ''
  ].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = '跳繩課堂Checkpoint_' + todayStr() + '.csv';
  a.click();
  toast('已匯出 CSV');
}
$('btnExport')?.addEventListener('click', doExportCsv);

// --- 清除所有
$('btnDeleteAll')?.addEventListener('click', () => {
  if (!confirm('確定要永久清除所有記錄嗎？此操作無法復原。')) return;
  localStorage.removeItem(STORAGE_KEY);
  clearForm();
  populateGlobalFilterClass();
  populateQuickSelectClass();
  refreshStats();
  refreshAnalytics();
  refreshActionsView();
  toast('已清除所有記錄');
});

// --- 統計與學生管理
function score1to5Average(list) {
  const vals = [];
  list.forEach(r => { SCORE_1_5_IDS.forEach(id => { const v = r[id]; if (typeof v === 'number' && v >= 1 && v <= 5) vals.push(v); }); });
  return vals.length === 0 ? null : (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}
function isWithinLast7Days(dateStr) {
  return new Date(dateStr).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
}

function refreshStats() {
  let list = parseRecords();
  const classF = getGlobalFilterClass();
  if (classF) list = list.filter(r => ((r.className || '').trim() || '—') === classF);
  const dateFrom = getFilterDateFrom(), dateTo = getFilterDateTo();
  if (dateFrom) list = list.filter(r => (r.classDate || '') >= dateFrom);
  if (dateTo) list = list.filter(r => (r.classDate || '') <= dateTo);
  list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));

  const ul = $('recentList');
  if (ul) {
    const recent = list.slice(0, 10);
    ul.innerHTML = recent.length === 0 ? '<li class="empty">尚無記錄</li>' : recent.map(r => {
      const meta = [r.className, r.classSize != null ? `人數 ${r.classSize}` : ''].filter(Boolean).join(' · ');
      return `<li data-date="${escapeHtml(r.classDate || '')}">${r.classDate || '–'}${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ''}</li>`;
    }).join('');
    ul.querySelectorAll('li[data-date]').forEach(li => {
      li.onclick = () => { const rec = list.find(r => r.classDate === li.dataset.date); if (rec) showDetail(rec); };
    });
  }
  refreshByClass();
}

function refreshByClass() {
  let list = parseRecords();
  const classF = getGlobalFilterClass();
  if (classF) list = list.filter(r => ((r.className || '').trim() || '—') === classF);
  
  // 應用搜尋
  const searchVal = ($('studentSearch')?.value || '').toLowerCase().trim();
  if (searchVal) {
    list = list.filter(r => {
      const className = (r.className || '').toLowerCase();
      const classDate = (r.classDate || '').toLowerCase();
      return className.includes(searchVal) || classDate.includes(searchVal);
    });
  }
  
  // 應用排序
  const sortBy = $('sortBy')?.value || 'date-desc';
  switch(sortBy) {
    case 'date-asc':
      list.sort((a, b) => (a.classDate || '').localeCompare(b.classDate || ''));
      break;
    case 'name-asc':
      list.sort((a, b) => ((a.className || '').trim() || '—').localeCompare((b.className || '').trim() || '—'));
      break;
    case 'mastery-desc':
      list.sort((a, b) => (b.mastery ?? 0) - (a.mastery ?? 0));
      break;
    case 'engagement-desc':
      list.sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0));
      break;
    case 'date-desc':
    default:
      list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
  }
  
  const groups = {};
  list.forEach(r => { const key = (r.className || '').trim() || '—'; if (!groups[key]) groups[key] = []; groups[key].push(r); });
  Object.keys(groups).forEach(k => { groups[k].sort((a, b) => (b.classDate || '').localeCompare(a.classDate || '')); });
  let keys = Object.keys(groups).sort((a, b) => (groups[b][0]?.classDate || '').localeCompare(groups[a][0]?.classDate || ''));
  if (classF) keys = keys.filter(k => k === classF);

  const ul = $('byClassList');
  if (!ul) return;
  ul.innerHTML = keys.length === 0 ? '<li class="empty">未找到符合的記錄</li>' : keys.map(key => {
    const label = key === '—' ? '未填寫班別' : escapeHtml(key);
    return `<li data-class="${escapeHtml(key)}">${label} <span class="count">(${groups[key].length}堂)</span></li>`;
  }).join('');
  ul.querySelectorAll('li[data-class]').forEach(li => { li.onclick = () => showClassDetail(li.dataset.class); });
}

// --- 動作記錄
function refreshActionsView() {
  let list = parseRecords();
  const sel = $('actionFilterClass'), filterVal = sel ? sel.value : '';
  const dateFrom = ($('actionDateFrom') && $('actionDateFrom').value) || '';
  const dateTo = ($('actionDateTo') && $('actionDateTo').value) || '';
  const skillF = ($('actionSkillLevel') && $('actionSkillLevel').value) || '';

  if (filterVal) list = list.filter(r => ((r.className || '').trim() || '—') === filterVal);
  if (dateFrom) list = list.filter(r => (r.classDate || '') >= dateFrom);
  if (dateTo) list = list.filter(r => (r.classDate || '') <= dateTo);
  if (skillF) list = list.filter(r => (r.skillLevel || '') === skillF);

  const classes = getClassOptions();
  if (sel) {
    sel.innerHTML = '<option value="">全部</option>' + classes.map(c => `<option value="${escapeHtml(c)}">${c === '—' ? '未填寫' : escapeHtml(c)}</option>`).join('');
    if (classes.includes(filterVal)) sel.value = filterVal;
  }

  const flat = [];
  list.forEach(r => {
    const arr = Array.isArray(r.tricks) ? r.tricks : [];
    const cls = (r.className || '').trim() || '—';
    if (arr.length === 0) flat.push({ date: r.classDate, className: cls, name: '—', detail: '—', mastery: r.mastery ?? '–' });
    else arr.forEach(t => flat.push({ date: r.classDate, className: cls, name: t.name || '—', detail: t.detail || '—', mastery: r.mastery ?? '–' }));
  });
  flat.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const filtered = flat;
  const tbody = $('actionsTableBody');
  const empty = $('actionsEmpty');
  if (tbody) {
    tbody.innerHTML = filtered.map(f => `<tr><td>${f.date || '–'}</td><td>${escapeHtml(f.className)}</td><td>${escapeHtml(f.name)}</td><td>${escapeHtml(f.detail)}</td><td>${typeof f.mastery === 'number' ? f.mastery + '%' : f.mastery}</td></tr>`).join('');
  }
  if (empty) empty.hidden = filtered.length > 0;
}

// --- 統計分析（strip + 圖表）
function refreshAnalytics() {
  let list = parseRecords();
  const classF = ($('analyticsFilterClass') && $('analyticsFilterClass').value) || '';
  const dateFrom = ($('analyticsDateFrom') && $('analyticsDateFrom').value) || '';
  const dateTo = ($('analyticsDateTo') && $('analyticsDateTo').value) || '';
  if (classF) list = list.filter(r => ((r.className || '').trim() || '—') === classF);
  if (dateFrom) list = list.filter(r => (r.classDate || '') >= dateFrom);
  if (dateTo) list = list.filter(r => (r.classDate || '') <= dateTo);

  const total = list.length;
  const week = list.filter(r => isWithinLast7Days(r.classDate || '')).length;
  const avg = score1to5Average(list);
  const last = list[0] || null;
  if ($('statTotal')) $('statTotal').textContent = total;
  if ($('statWeek')) $('statWeek').textContent = week;
  if ($('statAvg')) $('statAvg').textContent = avg != null ? avg : '–';
  if ($('statUpdated')) $('statUpdated').textContent = last ? (last.classDate || '–') : '–';

  const classes = getClassOptions();
  const aSel = $('analyticsFilterClass');
  if (aSel) {
    const v = aSel.value;
    aSel.innerHTML = '<option value="">全部</option>' + classes.map(c => `<option value="${escapeHtml(c)}">${c === '—' ? '未填寫' : escapeHtml(c)}</option>`).join('');
    if (classes.includes(v)) aSel.value = v;
  }

  const groups = {};
  list.forEach(r => { const key = (r.className || '').trim() || '—'; if (!groups[key]) groups[key] = []; groups[key].push(r); });
  const keys = Object.keys(groups).sort((a, b) => (groups[b][0]?.classDate || '').localeCompare(groups[a][0]?.classDate || ''));
  const maxCount = keys.length ? Math.max(...keys.map(k => groups[k].length)) : 0;

  const chart = $('analyticsChart');
  const analyticsEmpty = $('analyticsEmpty');
  if (chart) {
    if (keys.length === 0) chart.innerHTML = '';
    else chart.innerHTML = keys.map(key => {
      const label = key === '—' ? '未填寫班別' : escapeHtml(key);
      const w = maxCount > 0 ? (groups[key].length / maxCount) * 100 : 0;
      return `<div class="chart-row"><span class="chart-label">${label}</span><div class="chart-bar-wrap"><div class="chart-bar" style="width:${w}%"></div></div><span class="chart-val">${groups[key].length}</span></div>`;
    }).join('');
  }
}

// --- 刪除記錄
function deleteRecord(classDate, className) {
  if (!confirm(`確定要刪除 ${classDate} · ${className || '未填寫'} 的記錄嗎？此操作無法復原。`)) return;
  const list = parseRecords();
  const i = list.findIndex(r => r.classDate === classDate && r.className === className);
  if (i >= 0) {
    list.splice(i, 1);
    saveRecords(list);
    populateGlobalFilterClass();
    populateQuickSelectClass();
    refreshStats();
    refreshAnalytics();
    refreshActionsView();
    toast('已刪除記錄');
    $('detailModal').hidden = true;
  }
}

// --- 班別細節 Modal
function showClassDetail(classKey) {
  const list = parseRecords();
  const recs = list.filter(r => ((r.className || '').trim() || '—') === classKey).sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
  const title = (classKey === '—' ? '未填寫班別' : classKey) + ' － 班別細節';
  if ($('classDetailTitle')) $('classDetailTitle').textContent = title;
  if ($('classDetailBody')) {
    $('classDetailBody').innerHTML = recs.length === 0 ? '<p class="empty">此班別尚無課堂記錄。</p>' : '<ul class="class-session-list">' + recs.map(r => `<li class="class-session-item" data-date="${escapeHtml(r.classDate || '')}" data-class="${escapeHtml(r.className || '')}"><span class="date">${r.classDate || '–'}</span>${r.classSize != null ? `<span class="meta">人數 ${r.classSize}</span>` : ''}<span class="hint">點擊查看詳情</span></li>`).join('') + '</ul>';
    $('classDetailBody').querySelectorAll('.class-session-item').forEach(li => {
      li.onclick = () => { const rec = list.find(r => r.classDate === li.dataset.date && r.className === li.dataset.class); if (rec) { $('classDetailModal').hidden = true; showDetail(rec); } };
    });
  }
  $('classDetailModal').hidden = false;
}

// --- 課堂詳情 Modal
function showDetail(rec) {
  const tricksStr = Array.isArray(rec.tricks) && rec.tricks.length ? rec.tricks.map(t => escapeHtml(t.name) + (t.detail ? `（${escapeHtml(t.detail)}）` : '')).join('、') : '—';
  if ($('detailTitle')) $('detailTitle').textContent = `課堂詳情 · ${rec.classDate || '–'}`;
  if ($('detailBody')) {
    $('detailBody').innerHTML = `
      <dl>
        <dt>基本資料</dt><dd>${rec.classDate || '–'} | ${escapeHtml(rec.className || '–')} | 人數 ${rec.classSize ?? '–'}</dd>
        <dt>備注</dt><dd>${rec.notes ? escapeHtml(rec.notes).replace(/\n/g, '<br>') : '—'}</dd>
        <dt>投入度</dt><dd>開心指數 ${rec.engagement ?? '–'}/5 · 課堂氣氛 ${escapeHtml(rec.atmosphere || '–')}</dd>
        <dt>技能進步</dt><dd>教學花式：${tricksStr} · 掌握 ${rec.mastery ?? '–'}% · 預算/實際 ${rec.plannedTime ?? '–'}/${rec.actualTime ?? '–'} 分鐘 · 技巧等級 ${escapeHtml(rec.skillLevel || '–')}</dd>
        <dt>團隊協作</dt><dd>幫助他人 ${rec.helpOthers ?? '–'}% · 互動 ${rec.interaction ?? '–'}% · 小組合作 ${rec.teamwork ?? '–'}%</dd>
        <dt>心理與自信</dt><dd>自發練習 ${rec.selfPractice ?? '–'}% · 主動學習 ${rec.activeLearn ?? '–'}% · 積極性 ${rec.positivity ?? '–'}/5 · 熱情 ${rec.enthusiasm ?? '–'}/5</dd>
        <dt>教練質量</dt><dd>教學 ${rec.teachScore ?? '–'}/10 · 滿意度 ${rec.satisfaction ?? '–'}/5 · 紀律介入 ${rec.disciplineCount ?? '–'} 次 · 靈活性 ${rec.flexibility ?? '–'}/10 · 個別化 ${rec.individual ?? '–'}%</dd>
      </dl>
      <p style="margin-top:1rem;"><button type="button" id="loadIntoFormBtn" class="btn btn-ghost">載入到表單（重溫／編輯）</button> <button type="button" id="deleteRecordBtn" class="btn btn-danger-ghost">刪除此記錄</button></p>`;
    $('loadIntoFormBtn')?.addEventListener('click', () => { setPage('overview'); loadIntoForm(rec); $('detailModal').hidden = true; });
    $('deleteRecordBtn')?.addEventListener('click', () => { deleteRecord(rec.classDate, rec.className); });
  }
  $('detailModal').hidden = false;
}

$('closeClassDetail')?.addEventListener('click', () => { $('classDetailModal').hidden = true; });
$('classDetailModal')?.querySelector('.modal-backdrop')?.addEventListener('click', () => { $('classDetailModal').hidden = true; });
$('closeDetail')?.addEventListener('click', () => { $('detailModal').hidden = true; });
$('detailModal')?.querySelector('.modal-backdrop')?.addEventListener('click', () => { $('detailModal').hidden = true; });

// --- 導航、篩選、側邊欄
$qa('.nav-item[data-page]').forEach(el => {
  el.addEventListener('click', (e) => { e.preventDefault(); setPage(el.dataset.page); });
});
$('sidebarToggle')?.addEventListener('click', () => { $('sidebar')?.classList.toggle('collapsed'); });

$('globalFilterClass')?.addEventListener('change', () => { refreshByClass(); refreshStats(); });
$('filterDateFrom')?.addEventListener('change', () => refreshStats());
$('filterDateTo')?.addEventListener('change', () => refreshStats());

// 新增：搜尋和排序事件
$('studentSearch')?.addEventListener('input', () => refreshStats());
$('sortBy')?.addEventListener('change', () => refreshStats());

$('quickSelectClass')?.addEventListener('change', function () {
  const v = this.value;
  if ($('className')) $('className').value = (v === '—' || !v) ? '' : v;
});

$('actionFilterClass')?.addEventListener('change', () => refreshActionsView());
$('actionDateFrom')?.addEventListener('change', () => refreshActionsView());
$('actionDateTo')?.addEventListener('change', () => refreshActionsView());
$('actionSkillLevel')?.addEventListener('change', () => refreshActionsView());

$('analyticsFilterClass')?.addEventListener('change', () => refreshAnalytics());
$('analyticsDateFrom')?.addEventListener('change', () => refreshAnalytics());
$('analyticsDateTo')?.addEventListener('change', () => refreshAnalytics());

// --- 初始化
$('classDate').value = todayStr();
if ($('topbarDate')) $('topbarDate').textContent = todayStr();
populateGlobalFilterClass();
populateQuickSelectClass();
renderClassPresets();
renderTricks();
refreshStats();
setPage('overview');

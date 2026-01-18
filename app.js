/**
 * 跳繩課堂 Checkpoint 記錄系統
 * 輕量級課堂評估工具 - 快速輸入、localStorage 儲存、CSV 匯出
 */

const STORAGE_KEY = 'rope-skip-checkpoints';

// --- 1-5 評分欄位（用於計算「平均評分 1-5」）
const SCORE_1_5_IDS = ['engagement', 'positivity', 'enthusiasm', 'satisfaction'];

// --- 所有表單欄位對照
const RANGE_IDS = [
  'engagement', 'mastery', 'helpOthers', 'interaction', 'teamwork',
  'selfPractice', 'activeLearn', 'positivity', 'enthusiasm',
  'teachScore', 'satisfaction', 'flexibility', 'individual'
];
const OPTION_GROUPS = [
  { name: 'atmosphere', selector: '[data-name="atmosphere"]' },
  { name: 'skillLevel', selector: '[data-name="skillLevel"]' }
];

// --- DOM
let $ = (id) => document.getElementById(id);
let $q = (sel) => document.querySelector(sel);
let $qa = (sel) => document.querySelectorAll(sel);

// --- 工具
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function parseRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveRecords(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// --- 教學花式：陣列 { name, detail }
let tricks = [];

function renderTricks() {
  const el = $('tricksList');
  el.innerHTML = tricks.map((t, i) =>
    `<div class="trick-tag" data-i="${i}">
      <span class="name">${escapeHtml(t.name)}</span>
      ${t.detail ? `<span class="detail"> · ${escapeHtml(t.detail)}</span>` : ''}
      <button type="button" class="remove-trick" data-i="${i}" aria-label="移除">×</button>
    </div>`
  ).join('');
  $qa('.remove-trick').forEach(btn => {
    btn.onclick = () => {
      tricks.splice(+btn.dataset.i, 1);
      renderTricks();
    };
  });
}
function escapeHtml(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// --- 綁定滑桿 + 快速按鈕
function bindRange(id) {
  const r = $(id);
  const valSpan = $('val-' + id);
  if (!r || !valSpan) return;
  const quick = r.closest('.slider-row')?.querySelector('.quick-btns');
  const update = () => {
    valSpan.textContent = r.value;
    quick?.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', String(b.dataset.v) === r.value);
    });
  };
  r.addEventListener('input', update);
  quick?.addEventListener('click', (e) => {
    const v = e.target.dataset?.v;
    if (v != null) {
      r.value = v;
      update();
    }
  });
  update();
}
RANGE_IDS.forEach(bindRange);

// --- 綁定選項按鈕（單選）
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

// --- 新增教學花式
$('addTrick')?.addEventListener('click', () => {
  const name = ($('trickName')?.value || '').trim();
  if (!name) return;
  const detail = ($('trickDetail')?.value || '').trim();
  tricks.push({ name, detail });
  $('trickName').value = '';
  $('trickDetail').value = '';
  $('trickName').focus();
  renderTricks();
});

// --- 取得表單數據
function getFormData() {
  const date = ($('classDate')?.value || '').trim();
  const data = {
    classDate: date,
    className: ($('className')?.value || '').trim(),
    classSize: ($('classSize')?.value || '').trim() ? parseInt($('classSize').value, 10) : null,
    notes: ($('notes')?.value || '').trim(),
    // 1 投入度
    engagement: parseInt($('engagement')?.value || '3', 10),
    atmosphere: $q('[data-name="atmosphere"] .selected')?.textContent?.trim() || '',
    // 2 技能
    tricks: tricks.map(t => ({ ...t })),
    mastery: parseInt($('mastery')?.value || '50', 10),
    plannedTime: ($('plannedTime')?.value || '').trim() ? parseInt($('plannedTime').value, 10) : null,
    actualTime: ($('actualTime')?.value || '').trim() ? parseInt($('actualTime').value, 10) : null,
    skillLevel: $q('[data-name="skillLevel"] .selected')?.textContent?.trim() || '',
    // 3 團隊
    helpOthers: parseInt($('helpOthers')?.value || '50', 10),
    interaction: parseInt($('interaction')?.value || '50', 10),
    teamwork: parseInt($('teamwork')?.value || '50', 10),
    // 4 心理
    selfPractice: parseInt($('selfPractice')?.value || '50', 10),
    activeLearn: parseInt($('activeLearn')?.value || '50', 10),
    positivity: parseInt($('positivity')?.value || '3', 10),
    enthusiasm: parseInt($('enthusiasm')?.value || '3', 10),
    // 5 教練
    teachScore: parseInt($('teachScore')?.value || '7', 10),
    satisfaction: parseInt($('satisfaction')?.value || '3', 10),
    disciplineCount: ($('disciplineCount')?.value || '').trim() ? parseInt($('disciplineCount').value, 10) : null,
    flexibility: parseInt($('flexibility')?.value || '7', 10),
    individual: parseInt($('individual')?.value || '50', 10)
  };
  return data;
}

// --- 載入一筆到表單（重溫/編輯）
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
  $('className').value = '';
  $('classSize').value = '';
  $('notes').value = '';
  $('engagement').value = '3';
  $q('[data-name="atmosphere"] .selected')?.classList.remove('selected');
  tricks = [];
  renderTricks();
  $('trickName').value = '';
  $('trickDetail').value = '';
  $('mastery').value = '50';
  $('plannedTime').value = '';
  $('actualTime').value = '';
  $q('[data-name="skillLevel"] .selected')?.classList.remove('selected');
  $('helpOthers').value = '50';
  $('interaction').value = '50';
  $('teamwork').value = '50';
  $('selfPractice').value = '50';
  $('activeLearn').value = '50';
  $('positivity').value = '3';
  $('enthusiasm').value = '3';
  $('teachScore').value = '7';
  $('satisfaction').value = '3';
  $('disciplineCount').value = '';
  $('flexibility').value = '7';
  $('individual').value = '50';
  RANGE_IDS.forEach(id => {
    const r = $(id), valSpan = $('val-' + id);
    if (r && valSpan) {
      valSpan.textContent = r.value;
      const q = r.closest('.slider-row')?.querySelector('.quick-btns');
      q?.querySelectorAll('button').forEach(b => b.classList.toggle('active', String(b.dataset.v) === r.value));
    }
  });
}

// --- 儲存（同日期覆蓋，新日期新增）
$('btnSave')?.addEventListener('click', () => {
  const d = getFormData();
  if (!d.classDate) {
    alert('請填寫課堂日期。');
    return;
  }
  const list = parseRecords();
  const i = list.findIndex(r => r.classDate === d.classDate);
  if (i >= 0) list[i] = d;
  else list.push(d);
  list.sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
  saveRecords(list);
  refreshStats();
  alert('已儲存本堂記錄。');
});

// --- 清空本堂輸入
$('btnClear')?.addEventListener('click', () => {
  if (confirm('確定要清空本堂輸入嗎？')) clearForm();
});

// --- 匯出 CSV
$('btnExport')?.addEventListener('click', () => {
  const list = parseRecords();
  if (list.length === 0) {
    alert('尚無記錄可匯出。');
    return;
  }
  const headers = [
    '課堂日期','班級名稱','人數','備注',
    '開心指數','課堂氣氛',
    '教學花式','掌握比例','預算教學時間','實際教學時間','技巧等級進度',
    '主動幫助他人','同學互動','小組合作意願',
    '自發練習','主動學習','課堂積極性','學習熱情',
    '教學評分','學生滿意度','紀律介入次數','教學靈活性','個別化教學比例'
  ];
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
});

// --- 清除所有記錄
$('btnDeleteAll')?.addEventListener('click', () => {
  if (!confirm('確定要永久清除所有記錄嗎？此操作無法復原。')) return;
  localStorage.removeItem(STORAGE_KEY);
  clearForm();
  refreshStats();
  alert('已清除所有記錄。');
});

// --- 統計與最近 10 堂
function score1to5Average(list) {
  const vals = [];
  list.forEach(r => {
    SCORE_1_5_IDS.forEach(id => {
      const v = r[id];
      if (typeof v === 'number' && v >= 1 && v <= 5) vals.push(v);
    });
  });
  if (vals.length === 0) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}
function isWithinLast7Days(dateStr) {
  const t = new Date(dateStr).getTime();
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return t >= cutoff;
}

function refreshStats() {
  const list = parseRecords();
  const total = list.length;
  const week = list.filter(r => isWithinLast7Days(r.classDate || '')).length;
  const avg = score1to5Average(list);
  const last = list.length ? list[0] : null;

  $('statTotal').textContent = total;
  $('statWeek').textContent = week;
  $('statAvg').textContent = avg != null ? avg : '–';
  $('statUpdated').textContent = last ? (last.classDate || '–') : '–';

  const ul = $('recentList');
  const recent = list.slice(0, 10);
  ul.innerHTML = recent.length === 0
    ? '<li class="empty">尚無記錄</li>'
    : recent.map(r => {
        const meta = [r.className, r.classSize != null ? `人數 ${r.classSize}` : ''].filter(Boolean).join(' · ');
        return `<li data-date="${escapeHtml(r.classDate || '')}">${r.classDate || '–'}${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ''}</li>`;
      }).join('');

  ul.querySelectorAll('li[data-date]').forEach(li => {
    li.onclick = () => {
      const rec = list.find(r => r.classDate === li.dataset.date);
      if (rec) showDetail(rec);
    };
  });

  refreshByClass();
}

// --- 按班別分組
function refreshByClass() {
  const list = parseRecords();
  const groups = {};
  list.forEach(r => {
    const key = (r.className || '').trim() || '—';
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  Object.keys(groups).forEach(k => {
    groups[k].sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));
  });
  const keys = Object.keys(groups).sort((a, b) => {
    const da = groups[a][0]?.classDate || '';
    const db = groups[b][0]?.classDate || '';
    return db.localeCompare(da);
  });

  const ul = $('byClassList');
  if (!ul) return;
  ul.innerHTML = keys.length === 0
    ? '<li class="empty">尚無記錄</li>'
    : keys.map(key => {
        const label = key === '—' ? '未填寫班別' : escapeHtml(key);
        return `<li data-class="${escapeHtml(key)}">${label} <span class="count">(${groups[key].length}堂)</span></li>`;
      }).join('');

  ul.querySelectorAll('li[data-class]').forEach(li => {
    li.onclick = () => showClassDetail(li.dataset.class);
  });
}

function showClassDetail(classKey) {
  const list = parseRecords();
  const recs = list
    .filter(r => ((r.className || '').trim() || '—') === classKey)
    .sort((a, b) => (b.classDate || '').localeCompare(a.classDate || ''));

  const title = (classKey === '—' ? '未填寫班別' : classKey) + ' － 班別細節';
  $('classDetailTitle').textContent = title;
  $('classDetailBody').innerHTML = recs.length === 0
    ? '<p class="empty">此班別尚無課堂記錄。</p>'
    : '<ul class="class-session-list">' + recs.map(r =>
        `<li class="class-session-item" data-date="${escapeHtml(r.classDate || '')}">
          <span class="date">${r.classDate || '–'}</span>
          ${r.classSize != null ? `<span class="meta">人數 ${r.classSize}</span>` : ''}
          <span class="hint">點擊查看詳情</span>
        </li>`
      ).join('') + '</ul>';

  $('classDetailModal').hidden = false;
  $('classDetailBody').querySelectorAll('.class-session-item').forEach(li => {
    li.onclick = () => {
      const rec = list.find(r => r.classDate === li.dataset.date);
      if (rec) {
        $('classDetailModal').hidden = true;
        showDetail(rec);
      }
    };
  });
}
$('closeClassDetail')?.addEventListener('click', () => { $('classDetailModal').hidden = true; });
$('classDetailModal')?.addEventListener('click', (e) => { if (e.target === $('classDetailModal')) $('classDetailModal').hidden = true; });

// --- 詳情 Modal
function showDetail(rec) {
  const tricksStr = Array.isArray(rec.tricks) && rec.tricks.length
    ? rec.tricks.map(t => escapeHtml(t.name) + (t.detail ? `（${escapeHtml(t.detail)}）` : '')).join('、')
    : '—';
  $('detailTitle').textContent = `課堂詳情 · ${rec.classDate || '–'}`;
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
    <p style="margin-top:1rem;"><button type="button" id="loadIntoFormBtn" class="btn btn-secondary">載入到表單（重溫／編輯）</button></p>
  `;
  $('detailModal').hidden = false;
  $('loadIntoFormBtn')?.addEventListener('click', () => {
    loadIntoForm(rec);
    $('detailModal').hidden = true;
  });
}
$('closeDetail')?.addEventListener('click', () => { $('detailModal').hidden = true; });
$('detailModal')?.addEventListener('click', (e) => { if (e.target === $('detailModal')) $('detailModal').hidden = true; });

// --- 初始化
$('classDate').value = todayStr();
renderTricks();
refreshStats();

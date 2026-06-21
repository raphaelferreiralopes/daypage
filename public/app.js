'use strict';

const dayList = document.getElementById('dayList');
const editor = document.getElementById('editor');
const editorBackdrop = document.getElementById('editorBackdrop');
const entryDate = document.getElementById('entryDate');
const statusEl = document.getElementById('status');
const readonlyNote = document.getElementById('readonlyNote');
const todayBtn = document.getElementById('todayBtn');
const habitList = document.getElementById('habitList');
const addHabitBtn = document.getElementById('addHabitBtn');
const summaryInput = document.getElementById('summaryInput');
// time tracker
const timeTotal = document.getElementById('timeTotal');
const timerProject = document.getElementById('timerProject');
const newProjectBtn = document.getElementById('newProjectBtn');
const timerToggle = document.getElementById('timerToggle');
const timerElapsed = document.getElementById('timerElapsed');
const logTimeBtn = document.getElementById('logTimeBtn');
const timeEntries = document.getElementById('timeEntries');
const addHabitBtn2 = document.getElementById('addHabitBtn2');
const journalView = document.getElementById('journalView');
const habitsView = document.getElementById('habitsView');
const journalControls = document.getElementById('journalControls');
const overview = document.getElementById('overview');
const navTabs = document.querySelectorAll('.nav-tab');
// habit detail
const habitNav = document.getElementById('habitNav');
const habitsTitle = document.getElementById('habitsTitle');
const overviewEl = document.getElementById('overview');
const habitDetail = document.getElementById('habitDetail');
const habitNotes = document.getElementById('habitNotes');
const addHabitBtn2El = document.getElementById('addHabitBtn2');
// time overview
const timeView = document.getElementById('timeView');
const timeTitle = document.getElementById('timeTitle');
const timeGrand = document.getElementById('timeGrand');
const projectOverview = document.getElementById('projectOverview');
const addProjectBtn = document.getElementById('addProjectBtn');
const projectNav = document.getElementById('projectNav');
const projectDetail = document.getElementById('projectDetail');
const projectNotes = document.getElementById('projectNotes');
const dayCycle = document.getElementById('dayCycle');
// week section (inside journalView)
const weekSection = document.getElementById('weekSection');
const weekEditorBackdrop = document.getElementById('weekEditorBackdrop');
const weekEditor = document.getElementById('weekEditor');
const weekReadonlyNote = document.getElementById('weekReadonlyNote');
const habitsSection = document.getElementById('habits');
const timeTrackerSection = document.getElementById('timeTracker');
const editorWrap = document.getElementById('editorWrap');
const whatHappenedSection = document.getElementById('whatHappened');
// cycles
const cyclesView = document.getElementById('cyclesView');
const cycleControls = document.getElementById('cycleControls');
const cycleList = document.getElementById('cycleList');
const addCycleBtn = document.getElementById('addCycleBtn');
const cycleName = document.getElementById('cycleName');
const cycleBadge = document.getElementById('cycleBadge');
const cycleLength = document.getElementById('cycleLength');
const cycleStatus = document.getElementById('cycleStatus');
const cycleMeta = document.getElementById('cycleMeta');
const cycleEditor = document.getElementById('cycleEditor');
const cycleReadonlyNote = document.getElementById('cycleReadonlyNote');
const okrList = document.getElementById('okrList');
const addOkrBtn = document.getElementById('addOkrBtn');
const cycleProgress = document.getElementById('cycleProgress');
const goalList = document.getElementById('goalList');
const addGoalBtn = document.getElementById('addGoalBtn');
const goalProgressList = document.getElementById('goalProgressList');
const cycleTabs = document.querySelectorAll('.cycle-tab');
const cyclePages = {
  rules: document.getElementById('cyclePageRules'),
  okrs: document.getElementById('cyclePageOkrs'),
  progress: document.getElementById('cyclePageProgress'),
};

// modal
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalFields = document.getElementById('modalFields');
const modalError = document.getElementById('modalError');
const modalSubmit = document.getElementById('modalSubmit');
const modalCancel = document.getElementById('modalCancel');

let current = null; // currently open date
let saveTimer = null;
let editable = false; // is the current day editable?
let view = 'journal';
let openHabitId = null; // selected habit on the Habits tab (null = overview)
let habitNotesTimer = null;
let openProjectId = null; // selected project on the Time tab (null = overview)
let projectNotesTimer = null;
let projects = []; // cached project list
let runningTimer = null; // {projectId, projectName, startedAt, elapsed} or null
let timerBaseTotal = 0; // today's logged seconds (excludes the running timer)
let tickInterval = null;
let currentMode = 'day'; // 'day' | 'week'
let currentWeek = null; // currently open week's Monday date string
let weekEditable = false;
let weekSaveTimer = null;
let currentCycle = null; // currently open cycle id
let cycleEditable = false;
let cycleSaveTimer = null;
let cyclePage = 'rules'; // active sub-page within a cycle

function fmtDate(date) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function mondayOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function addClientDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fmtWeekShort(start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const mo = { month: 'short', day: 'numeric' };
  if (s.getMonth() === e.getMonth()) return `${s.toLocaleDateString(undefined, mo)} – ${e.getDate()}`;
  return `${s.toLocaleDateString(undefined, mo)} – ${e.toLocaleDateString(undefined, mo)}`;
}

// How long a cycle runs, in weeks (inclusive of both start and end days).
function cycleWeeks(start, end) {
  if (!start || !end) return '';
  const days = Math.round((new Date(end + 'T00:00:00') - new Date(start + 'T00:00:00')) / 86400000) + 1;
  const weeks = days / 7;
  const w = Number.isInteger(weeks) ? String(weeks) : weeks.toFixed(1);
  return `${w} week${weeks === 1 ? '' : 's'}`;
}

// Day list as a collapsible Year → Months → Days tree.
let dayTree = null;
const expandedNodes = new Set();
let treeInited = false;

async function loadDays() {
  const [days, weekNotes] = await Promise.all([
    fetch('/api/entries').then((r) => r.json()),
    fetch('/api/week-notes').then((r) => r.ok ? r.json() : []),
  ]);
  const weekNotesMap = new Map(weekNotes.map((w) => [w.weekStart, w]));
  const today = todayISO();
  const cws = mondayOf(today);

  // group days by their week
  const weekMap = new Map();
  for (const d of days) {
    const ws = mondayOf(d.date);
    if (!weekMap.has(ws)) {
      const wn = weekNotesMap.get(ws) || {};
      weekMap.set(ws, { weekStart: ws, weekEnd: addClientDays(ws, 6), isCurrent: ws === cws, hasWeekNote: wn.hasNote || false, days: [] });
    }
    weekMap.get(ws).days.push(d);
  }
  // always include current week
  if (!weekMap.has(cws)) {
    weekMap.set(cws, { weekStart: cws, weekEnd: addClientDays(cws, 6), isCurrent: true, hasWeekNote: false, days: [] });
  }
  // always include today in its week
  const todayWeek = weekMap.get(cws);
  if (!todayWeek.days.some((d) => d.date === today)) {
    todayWeek.days.push({ date: today, isToday: true, hasEntry: false });
  }

  // build dayTree: year → month (of Monday) → [weekObj]
  dayTree = {};
  for (const week of weekMap.values()) {
    const [wy, wm] = week.weekStart.split('-');
    (dayTree[wy] ||= {})[wm] ||= [];
    dayTree[wy][wm].push(week);
  }
  // sort weeks + days descending
  for (const y of Object.keys(dayTree)) {
    for (const m of Object.keys(dayTree[y])) {
      dayTree[y][m].sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1));
      for (const w of dayTree[y][m]) {
        w.days.sort((a, b) => (a.date < b.date ? 1 : -1));
      }
    }
  }

  if (!treeInited) {
    const [wy, wm] = cws.split('-');
    expandedNodes.add('y' + wy);
    expandedNodes.add('m' + wy + wm);
    expandedNodes.add('w' + cws);
    treeInited = true;
  }
  renderDayTree();
}

function toggleNode(key) {
  if (expandedNodes.has(key)) expandedNodes.delete(key);
  else expandedNodes.add(key);
  renderDayTree();
}

function renderDayTree() {
  if (!dayTree) return;
  dayList.innerHTML = '';
  for (const y of Object.keys(dayTree).sort().reverse()) {
    const yKey = 'y' + y;
    const yOpen = expandedNodes.has(yKey);
    const yLi = document.createElement('li');
    yLi.className = 'tree-year';
    yLi.innerHTML = `<span class="caret">${yOpen ? '▾' : '▸'}</span><span>${y}</span>`;
    yLi.onclick = () => toggleNode(yKey);
    dayList.appendChild(yLi);
    if (!yOpen) continue;

    for (const m of Object.keys(dayTree[y]).sort().reverse()) {
      const mKey = 'm' + y + m;
      const mOpen = expandedNodes.has(mKey);
      const monthName = new Date(+y, +m - 1, 1).toLocaleString(undefined, { month: 'long' });
      const mLi = document.createElement('li');
      mLi.className = 'tree-month';
      mLi.innerHTML = `<span class="caret">${mOpen ? '▾' : '▸'}</span><span>${monthName}</span>`;
      mLi.onclick = () => toggleNode(mKey);
      dayList.appendChild(mLi);
      if (!mOpen) continue;

      for (const week of dayTree[y][m]) {
        const wKey = 'w' + week.weekStart;
        const wOpen = expandedNodes.has(wKey);
        const wLi = document.createElement('li');
        wLi.className = 'tree-week';
        if (week.isCurrent) wLi.classList.add('today');
        if (week.weekStart === currentWeek && currentMode === 'week') wLi.classList.add('active');
        const range = fmtWeekShort(week.weekStart, week.weekEnd);
        wLi.innerHTML =
          `<span class="caret">${wOpen ? '▾' : '▸'}</span>` +
          `<span class="dot">${week.hasWeekNote ? '●' : '○'}</span>` +
          `<span>${range}${week.isCurrent ? ' · Now' : ''}</span>`;
        wLi.querySelector('.caret').onclick = (e) => { e.stopPropagation(); toggleNode(wKey); };
        wLi.onclick = (ev) => { if (!ev.target.classList.contains('caret')) openWeek(week.weekStart); };
        dayList.appendChild(wLi);
        if (!wOpen) continue;

        for (const d of week.days) {
          const dd = new Date(d.date + 'T00:00:00');
          const li = document.createElement('li');
          li.className = 'tree-day';
          li.dataset.date = d.date;
          if (d.isToday) li.classList.add('today');
          if (d.date === current && currentMode === 'day') li.classList.add('active');
          const label = `${dd.getDate()} ${dd.toLocaleDateString(undefined, { weekday: 'short' })}${d.isToday ? ' · Today' : ''}`;
          li.innerHTML = `<span class="dot">${d.hasEntry ? '●' : '○'}</span><span>${label}</span>`;
          li.onclick = () => openDay(d.date);
          dayList.appendChild(li);
        }
      }
    }
  }
}

// Make sure a date's year/month/week are expanded so the open day is visible.
function ensureDayVisible(date) {
  if (!dayTree) return;
  const ws = mondayOf(date);
  const [wy, wm] = ws.split('-');
  expandedNodes.add('y' + wy);
  expandedNodes.add('m' + wy + wm);
  expandedNodes.add('w' + ws);
  renderDayTree();
}

async function openDay(date) {
  const entry = await fetch(`/api/entry/${date}`).then((r) => r.json());
  current = date;
  currentMode = 'day';
  editable = entry.editable;
  // switch to day mode
  habitsSection.hidden = false;
  timeTrackerSection.hidden = false;
  editorWrap.hidden = false;
  whatHappenedSection.hidden = false;
  weekSection.hidden = true;
  entryDate.textContent = `Notes-${date}`;
  entryDate.title = fmtDate(date);
  editor.value = entry.content;
  editor.disabled = !entry.editable;
  readonlyNote.hidden = entry.editable;
  statusEl.textContent = entry.editable ? '' : 'Read-only';
  if (entry.cycle) {
    dayCycle.hidden = false;
    dayCycle.textContent = '🔄 ' + entry.cycle.name;
    dayCycle.title = 'Open this cycle';
    dayCycle.onclick = () => switchView('cycles').then(() => openCycle(entry.cycle.id));
  } else {
    dayCycle.hidden = true;
  }
  renderHabits(entry.habits, entry.habitValues);
  renderTime(entry);
  summaryInput.value = entry.summary || '';
  summaryInput.disabled = !entry.editable;
  renderEditorBackdrop();
  autoGrowEditor();
  ensureDayVisible(date);
  if (entry.editable) editor.focus();
}

// Grow the notes box to fit its content so the whole page scrolls, not the box.
function autoGrowEditor() {
  editor.style.height = 'auto';
  editor.style.height = editor.scrollHeight + 'px';
}

// Render the daily notes onto the backdrop layer, styling checkbox lines so
// checked items show in accent colour with a strike-through.
// Inline Markdown: **bold**. Keeps the ** markers (dimmed) so character widths
// stay aligned with the textarea underneath.
function inlineMd(escaped) {
  return escaped.replace(/\*\*(.+?)\*\*/g, '<span class="md-mark">**</span><strong>$1</strong><span class="md-mark">**</span>');
}

function highlightNotes(text) {
  return text
    .split('\n')
    .map((line) => {
      const m = line.match(/^(\s*)- \[( |x|X)\] (.*)$/);
      if (!m) return inlineMd(esc(line));
      const checked = m[2].toLowerCase() === 'x';
      const box = `- [${checked ? 'x' : ' '}]`;
      return `${esc(m[1])}<span class="cbk${checked ? ' on' : ''}">${esc(box)}</span> <span class="cbtxt${checked ? ' done' : ''}">${inlineMd(esc(m[3]))}</span>`;
    })
    .join('\n');
}
function renderEditorBackdrop() {
  editorBackdrop.innerHTML = highlightNotes(editor.value);
}
editor.addEventListener('input', renderEditorBackdrop);

function renderWeekBackdrop() {
  weekEditorBackdrop.innerHTML = highlightNotes(weekEditor.value);
}
function autoGrowWeekEditor() {
  weekEditor.style.height = 'auto';
  weekEditor.style.height = weekEditor.scrollHeight + 'px';
}
weekEditor.addEventListener('input', renderWeekBackdrop);
weekEditor.addEventListener('input', autoGrowWeekEditor);

// --- time tracking ----------------------------------------------------------
function fmtDur(s) {
  s = Math.round(s);
  if (s <= 0) return '0m';
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
function fmtClock(s) {
  s = Math.floor(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

// Projects you can track against (archived ones are hidden from the timer/log).
function trackableProjects() {
  return projects.filter((p) => (p.status || 'active') !== 'archive');
}

async function loadProjects() {
  projects = await fetch('/api/projects').then((r) => r.json());
  const keep = timerProject.value;
  const selectable = trackableProjects();
  timerProject.innerHTML = selectable.length
    ? selectable.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')
    : '<option value="" disabled selected>No active projects</option>';
  if (keep) timerProject.value = keep;
}

function renderTime(entry) {
  timerBaseTotal = entry.time.total;
  // controls only on today's (editable) page
  const showControls = entry.editable;
  document.getElementById('timerRow').style.display = showControls ? 'flex' : 'none';

  timeEntries.innerHTML = '';
  for (const e of entry.time.entries.slice().reverse()) {
    const row = document.createElement('div');
    row.className = 'time-entry';
    row.innerHTML =
      `<span class="tproj">${esc(e.projectName)}${e.note ? ` · <span class="tnote">${esc(e.note)}</span>` : ''}</span>` +
      `<span class="tdur">${fmtDur(e.seconds)}</span>`;
    if (entry.editable) {
      const del = document.createElement('button');
      del.className = 'tdel';
      del.textContent = '✕';
      del.title = 'Delete entry';
      del.onclick = () => deleteTimeEntry(entry.date, e.id);
      row.appendChild(del);
    }
    timeEntries.appendChild(row);
  }
  updateTimeTotal();
  applyTimerUI();
}

function updateTimeTotal() {
  const live = runningTimer && current === todayISO() ? elapsedNow() : 0;
  const total = timerBaseTotal + live;
  timeTotal.textContent = total > 0 ? fmtDur(total) + ' today' : 'Nothing tracked yet';
}

function elapsedNow() {
  if (!runningTimer) return 0;
  return Math.max(0, (Date.now() - runningTimer.startedAt) / 1000);
}

// Reflect the running-timer state in the button + live counter.
function applyTimerUI() {
  const onToday = current === todayISO();
  if (runningTimer && onToday) {
    timerToggle.textContent = '■ Stop';
    timerToggle.classList.add('running');
    timerElapsed.hidden = false;
    timerProject.value = runningTimer.projectId;
    timerProject.disabled = true;
    startTick();
  } else {
    timerToggle.textContent = '▶ Start';
    timerToggle.classList.remove('running');
    timerElapsed.hidden = true;
    timerProject.disabled = false;
    stopTick();
  }
}

function startTick() {
  if (tickInterval) return;
  const tick = () => {
    timerElapsed.textContent = fmtClock(elapsedNow());
    updateTimeTotal();
  };
  tick();
  tickInterval = setInterval(tick, 1000);
}
function stopTick() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

async function refreshTimer() {
  runningTimer = await fetch('/api/timer').then((r) => r.json());
  if (view === 'journal') applyTimerUI();
}

async function toggleTimer() {
  if (runningTimer) {
    await fetch('/api/timer/stop', { method: 'POST' });
    await refreshTimer();
    if (current) openDay(current); // refresh entries + total
  } else {
    const projectId = timerProject.value;
    if (!projectId) return alert('Create a project first to track time against it.');
    const res = await fetch('/api/timer/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    if (res.ok) await refreshTimer();
    else alert((await res.json()).error || 'Could not start timer');
  }
}

async function newProject() {
  const v = await openModal({
    title: 'New project',
    submitLabel: 'Create',
    fields: [{ key: 'name', label: 'Project name', placeholder: 'e.g. Scolaria', required: true }],
  });
  if (!v) return;
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: v.name.trim() }),
  });
  const created = await res.json();
  if (res.ok) {
    await loadProjects();
    timerProject.value = created.id;
  } else alert(created.error || 'Could not create project');
}

async function logTime() {
  if (!trackableProjects().length) return alert('Create an active project first.');
  const v = await openModal({
    title: 'Log time',
    submitLabel: 'Add',
    fields: [
      { key: 'projectId', label: 'Project', type: 'select', options: trackableProjects().map((p) => ({ value: p.id, label: p.name })) },
      { key: 'hours', label: 'Hours', inputMode: 'numeric', placeholder: '0', value: '0' },
      { key: 'minutes', label: 'Minutes', inputMode: 'numeric', placeholder: '30', value: '0' },
    ],
  });
  if (!v) return;
  const seconds = (Number(v.hours) || 0) * 3600 + (Number(v.minutes) || 0) * 60;
  if (seconds <= 0) return alert('Enter a duration greater than zero.');
  const res = await fetch(`/api/time/${current}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: v.projectId, seconds }),
  });
  if (res.ok) openDay(current);
  else alert((await res.json()).error || 'Could not log time');
}

async function deleteTimeEntry(date, id) {
  const res = await fetch(`/api/time/${date}/${id}`, { method: 'DELETE' });
  if (res.ok) openDay(date);
}

// --- Time tab: sidebar list + per-project description page ------------------
async function loadTimeTab() {
  await loadProjects(); // refreshes the cached `projects` list + timer dropdown
  if (openProjectId && projects.some((p) => p.id === openProjectId)) showProjectDetail(openProjectId);
  else showProjectsOverview();
}

// Sidebar shows all projects in overview mode, or a back link when one is open.
function renderProjectNav() {
  projectNav.innerHTML = '';
  const ov = document.createElement('li');
  ov.className = 'nav-overview' + (openProjectId ? '' : ' active');
  ov.textContent = '📊 Overview';
  ov.onclick = showProjectsOverview;
  projectNav.appendChild(ov);

  for (const p of projects) {
    const li = document.createElement('li');
    li.dataset.id = p.id;
    if (p.id === openProjectId) li.classList.add('active');
    li.innerHTML = `<span>${esc(p.name)}</span>`;
    li.onclick = () => showProjectDetail(p.id);
    projectNav.appendChild(li);
  }
}

function showProjectsOverview() {
  openProjectId = null;
  timeTitle.textContent = 'Time';
  addProjectBtn.hidden = false;
  timeGrand.hidden = false;
  projectOverview.hidden = false;
  projectDetail.hidden = true;
  renderProjectNav();
  loadTimeOverview();
}

async function showProjectDetail(id) {
  openProjectId = id;
  const project = projects.find((p) => p.id === id);
  if (!project) return showProjectsOverview();
  timeTitle.textContent = project.name;
  addProjectBtn.hidden = true;
  timeGrand.hidden = true;
  projectOverview.hidden = true;
  projectDetail.hidden = false;
  renderProjectNav();
  const notes = await fetch(`/api/projects/${id}/notes`).then((r) => r.json());
  projectNotes.value = notes.content || '';
  refreshRich(projectNotes);
  projectNotes.focus();
}

function scheduleProjectNotesSave() {
  clearTimeout(projectNotesTimer);
  projectNotesTimer = setTimeout(saveProjectNotes, 600);
}
async function saveProjectNotes() {
  if (!openProjectId) return;
  await fetch(`/api/projects/${openProjectId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: projectNotes.value }),
  });
}
projectNotes.addEventListener('input', scheduleProjectNotesSave);
projectNotes.addEventListener('blur', () => { clearTimeout(projectNotesTimer); saveProjectNotes(); });

// --- time overview (Time tab) ----------------------------------------------
const STATUS_LABELS = { active: 'Active', onhold: 'On hold', archive: 'Archived' };
const STATUS_ORDER = ['active', 'onhold', 'archive'];

async function loadTimeOverview() {
  const data = await fetch('/api/time-overview').then((r) => r.json());
  timeGrand.textContent = data.grandTotal ? fmtDur(data.grandTotal) + ' total' : '';
  projectOverview.innerHTML = '';
  if (!data.projects.length) {
    projectOverview.innerHTML = '<div class="habits-empty">No projects yet. Create one to start tracking time.</div>';
    return;
  }
  const max = Math.max(...data.projects.map((p) => p.total), 1);
  for (const status of STATUS_ORDER) {
    const inGroup = data.projects.filter((p) => (p.status || 'active') === status);
    if (!inGroup.length) continue;

    const header = document.createElement('div');
    header.className = 'tp-group';
    header.textContent = `${STATUS_LABELS[status]} · ${inGroup.length}`;
    projectOverview.appendChild(header);

    for (const p of inGroup) {
      projectOverview.appendChild(projectCard(p, max, data.currentCycle));
    }
  }
}

function projectCard(p, max, currentCycle) {
  const card = document.createElement('div');
  card.className = 'tp-card' + (p.status === 'archive' ? ' archived' : '');

  const top = document.createElement('div');
  top.className = 'tp-top';
  const name = document.createElement('input');
  name.className = 'tp-name';
  name.value = p.name;
  name.onchange = () => renameProject(p.id, name.value);
  top.appendChild(name);
  top.insertAdjacentHTML('beforeend', `<span class="tp-total">${fmtDur(p.total)}</span>`);

  // status selector
  const sel = document.createElement('select');
  sel.className = 'tp-status';
  for (const s of STATUS_ORDER) {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = STATUS_LABELS[s];
    if ((p.status || 'active') === s) o.selected = true;
    sel.appendChild(o);
  }
  sel.onchange = () => setProjectStatus(p.id, sel.value);
  top.appendChild(sel);

  const del = document.createElement('button');
  del.className = 'tp-del';
  del.textContent = '🗑';
  del.title = 'Delete project';
  del.onclick = () => removeProject(p.id, p.name);
  top.appendChild(del);
  card.appendChild(top);

  const pct = Math.round((p.total / max) * 100);
  card.insertAdjacentHTML('beforeend', `<div class="bar"><span style="width:${pct}%"></span></div>`);

  const cycleStat = currentCycle ? `<span><b>${fmtDur(p.cycle)}</b> in ${esc(currentCycle.name)}</span>` : '';
  card.insertAdjacentHTML(
    'beforeend',
    `<div class="tp-stats">
      <span><b>${fmtDur(p.today)}</b> today</span>
      <span><b>${fmtDur(p.last7)}</b> last 7 days</span>
      ${cycleStat}
    </div>`
  );
  return card;
}

async function setProjectStatus(id, status) {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (res.ok) {
    await loadProjects(); // archived projects drop out of the timer dropdown
    renderProjectNav();
    loadTimeOverview();
  }
}

async function renameProject(id, name) {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (res.ok) {
    await loadProjects();
    renderProjectNav();
    loadTimeOverview();
  }
}

async function removeProject(id, name) {
  if (!confirm(`Delete project "${name}"? Its logged time will no longer be attributed to it.`)) return;
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  if (res.ok) {
    if (openProjectId === id) openProjectId = null;
    await loadProjects();
    renderProjectNav();
    loadTimeOverview();
  }
}

// --- habits -----------------------------------------------------------------
function renderHabits(habits, values) {
  habitList.innerHTML = '';
  addHabitBtn.hidden = !editable; // only manage habits from today's page
  if (!habits.length) {
    habitList.innerHTML = '<div class="habits-empty">No habits yet. Add one to start tracking.</div>';
    return;
  }
  // checkboxes first, value habits last
  const ordered = habits.slice().sort((a, b) => (a.type === 'check' ? 0 : 1) - (b.type === 'check' ? 0 : 1));
  for (const h of ordered) {
    const row = document.createElement('div');
    row.className = 'habit-row';
    const val = values[h.id];

    // control (checkbox or value box) on the LEFT
    const control = document.createElement('div');
    control.className = 'control control-' + h.type;
    if (h.type === 'check') {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = Boolean(val);
      cb.disabled = !editable;
      cb.onchange = () => saveHabit(h.id, cb.checked);
      control.appendChild(cb);
    } else {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.inputMode = 'decimal';
      inp.value = val == null ? '' : val;
      inp.placeholder = '—';
      inp.disabled = !editable;
      inp.onchange = () => saveHabit(h.id, inp.value);
      control.appendChild(inp);
      if (h.unit) control.insertAdjacentHTML('beforeend', `<span class="unit">${esc(h.unit)}</span>`);
    }
    row.appendChild(control);

    // habit name on the RIGHT
    row.insertAdjacentHTML('beforeend', `<span class="name">${esc(h.name)}${okrTag(h)}</span>`);

    if (editable) {
      const del = document.createElement('button');
      del.className = 'del';
      del.textContent = '✕';
      del.title = 'Delete habit';
      del.onclick = () => deleteHabit(h.id, h.name);
      row.appendChild(del);
    }
    habitList.appendChild(row);
  }
}

async function saveHabit(habitId, value) {
  statusEl.textContent = 'Saving…';
  const res = await fetch(`/api/habit/${current}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habitId, value }),
  });
  statusEl.textContent = res.ok ? 'Saved ✓' : '⚠ Could not save habit';
}

async function addHabit() {
  const v = await openModal({
    title: 'New habit',
    submitLabel: 'Add habit',
    fields: [
      { key: 'name', label: 'Name', placeholder: 'e.g. Morning Routine or Kcal', required: true },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: [
          { value: 'check', label: 'Checkbox — done / not done' },
          { value: 'value', label: 'Value — a number each day' },
        ],
      },
      { key: 'unit', label: 'Unit (optional)', placeholder: 'e.g. kcal, km, h', showIf: (x) => x.type === 'value' },
    ],
  });
  if (!v) return;
  const res = await fetch('/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: v.name.trim(), type: v.type, unit: v.unit }),
  });
  if (res.ok) refresh();
  else statusEl.textContent = '⚠ Could not add habit';
}

async function deleteHabit(id, name) {
  if (!confirm(`Delete habit "${name}"? Past values stay on disk but won't be shown.`)) return;
  const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
  if (res.ok) {
    if (openHabitId === id) openHabitId = null; // fall back to overview
    refresh();
  }
}

// re-render whichever view is currently active
function refresh() {
  if (view === 'habits') loadHabitsTab();
  else openDay(current);
}

function okrTag(h) {
  return h.okr ? ` <span class="okr-tag" title="${esc(h.okr.cycleName || '')}">🎯 ${esc(h.okr.title)}</span>` : '';
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Reusable form dialog. Resolves to a {key: value} object, or null if cancelled.
// fields: [{ key, label, type, options?, value?, placeholder?, inputMode?, required?, showIf? }]
function openModal({ title, fields, submitLabel = 'Save' }) {
  return new Promise((resolve) => {
    modalTitle.textContent = title;
    modalSubmit.textContent = submitLabel;
    modalError.textContent = '';
    modalFields.innerHTML = '';
    const inputs = {};

    for (const f of fields) {
      const wrap = document.createElement('label');
      wrap.className = 'modal-field';
      wrap.dataset.key = f.key;
      wrap.insertAdjacentHTML('beforeend', `<span>${esc(f.label)}</span>`);

      let input;
      if (f.type === 'select') {
        input = document.createElement('select');
        for (const opt of f.options) {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          input.appendChild(o);
        }
      } else {
        input = document.createElement('input');
        input.type = f.type || 'text';
        if (f.placeholder) input.placeholder = f.placeholder;
        if (f.inputMode) input.inputMode = f.inputMode;
      }
      if (f.value != null) input.value = f.value;
      input.addEventListener('input', updateConditional);
      input.addEventListener('change', updateConditional);
      wrap.appendChild(input);
      modalFields.appendChild(wrap);
      inputs[f.key] = input;
    }

    const values = () => Object.fromEntries(Object.keys(inputs).map((k) => [k, inputs[k].value]));
    const visible = (f) => !f.showIf || f.showIf(values());

    function updateConditional() {
      for (const f of fields) {
        if (f.showIf) modalFields.querySelector(`[data-key="${f.key}"]`).hidden = !f.showIf(values());
      }
    }
    updateConditional();

    function close(result) {
      modalOverlay.hidden = true;
      document.removeEventListener('keydown', onKey);
      resolve(result);
    }
    function submit() {
      for (const f of fields) {
        if (f.required && visible(f) && !String(inputs[f.key].value).trim()) {
          modalError.textContent = `${f.label} is required.`;
          inputs[f.key].focus();
          return;
        }
      }
      close(values());
    }
    function onKey(e) {
      if (e.key === 'Escape') close(null);
      else if (e.key === 'Enter' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        submit();
      }
    }

    modalSubmit.onclick = submit;
    modalCancel.onclick = () => close(null);
    modalOverlay.onclick = (e) => { if (e.target === modalOverlay) close(null); };
    document.addEventListener('keydown', onKey);

    modalOverlay.hidden = false;
    const first = modalFields.querySelector('input, select');
    if (first) first.focus();
  });
}

function scheduleSave() {
  statusEl.textContent = 'Editing…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 600);
}

async function save() {
  if (!current) return;
  try {
    const res = await fetch(`/api/entry/${current}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editor.value }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
    statusEl.textContent = 'Saved ✓';
    // refresh dots without disrupting the editor
    loadDays();
  } catch (e) {
    statusEl.textContent = '⚠ ' + e.message;
  }
}

// --- weekly notes -----------------------------------------------------------
async function openWeek(ws) {
  const note = await fetch(`/api/week-note/${ws}`).then((r) => r.json());
  currentWeek = note.weekStart;
  currentMode = 'week';
  weekEditable = note.editable;
  // switch to week mode
  habitsSection.hidden = true;
  timeTrackerSection.hidden = true;
  editorWrap.hidden = true;
  whatHappenedSection.hidden = true;
  readonlyNote.hidden = true;
  weekSection.hidden = false;
  dayCycle.hidden = true;
  entryDate.textContent = fmtWeekShort(note.weekStart, note.weekEnd);
  entryDate.title = '';
  statusEl.textContent = note.editable ? '' : 'Read-only';
  weekEditor.value = note.content;
  weekEditor.disabled = !note.editable;
  weekReadonlyNote.hidden = note.editable;
  renderWeekBackdrop();
  autoGrowWeekEditor();
  ensureWeekVisible(note.weekStart);
  if (note.editable) weekEditor.focus();
}

function ensureWeekVisible(ws) {
  if (!dayTree) return;
  const [wy, wm] = ws.split('-');
  expandedNodes.add('y' + wy);
  expandedNodes.add('m' + wy + wm);
  renderDayTree();
}

function scheduleWeekSave() {
  statusEl.textContent = 'Editing…';
  clearTimeout(weekSaveTimer);
  weekSaveTimer = setTimeout(flushWeekSave, 600);
}

async function flushWeekSave() {
  if (!currentWeek || !weekEditable) return;
  const res = await fetch(`/api/week-note/${currentWeek}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: weekEditor.value }),
  });
  if (res.ok) {
    statusEl.textContent = 'Saved ✓';
    loadDays(); // refresh dots
  } else {
    statusEl.textContent = '⚠ Could not save';
  }
}

weekEditor.addEventListener('input', scheduleWeekSave);
weekEditor.addEventListener('blur', () => { clearTimeout(weekSaveTimer); flushWeekSave(); });

// --- view switching ---------------------------------------------------------
async function switchView(next) {
  view = next;
  journalView.hidden = next !== 'journal';
  habitsView.hidden = next !== 'habits';
  cyclesView.hidden = next !== 'cycles';
  timeView.hidden = next !== 'time';
  // sidebar contents per view
  journalControls.hidden = next !== 'journal';
  dayList.hidden = next !== 'journal';
  cycleControls.hidden = next !== 'cycles';
  cycleList.hidden = next !== 'cycles';
  habitNav.hidden = next !== 'habits';
  projectNav.hidden = next !== 'time';
  navTabs.forEach((t) => t.classList.toggle('active', t.dataset.view === next));
  if (next === 'habits') await loadHabitsTab();
  if (next === 'cycles') await loadCycles();
  if (next === 'time') await loadTimeTab();
}
navTabs.forEach((t) => (t.onclick = () => switchView(t.dataset.view)));

// --- cycles -----------------------------------------------------------------
async function loadCycles(selectId) {
  const cycles = await fetch('/api/cycles').then((r) => r.json());
  cycleList.innerHTML = '';
  if (!cycles.length) {
    cycleList.innerHTML = '<li style="cursor:default;color:var(--muted)">No cycles yet. Click “+ New cycle”.</li>';
    cycleName.textContent = '—';
    cycleBadge.textContent = '';
    cycleStatus.textContent = '';
    cycleMeta.innerHTML = '';
    cycleEditor.value = '';
    refreshRich(cycleEditor);
    cycleEditor.disabled = true;
    return;
  }
  for (const c of cycles) {
    const li = document.createElement('li');
    li.dataset.id = c.id;
    if (c.isCurrent) li.classList.add('current');
    const mini = c.overallProgress != null
      ? `<span class="range">${c.overallProgress}% of goals</span><div class="mini-bar"><span style="width:${c.overallProgress}%"></span></div>`
      : `<span class="range">${c.start} → ${c.end}</span>`;
    li.innerHTML = `<span>${esc(c.name)}${c.isCurrent ? ' · now' : ''}</span>${mini}`;
    li.onclick = () => openCycle(c.id);
    cycleList.appendChild(li);
  }
  // pick which cycle to open: requested, else current, else first
  const target = selectId || currentCycle || (cycles.find((c) => c.isCurrent) || cycles[0]).id;
  openCycle(target);
}

async function openCycle(id) {
  const c = await fetch(`/api/cycle/${id}`).then((r) => r.json());
  if (c.error) return;
  currentCycle = id;
  cycleEditable = c.editable;
  cycleName.textContent = c.name;
  cycleBadge.textContent = c.isCurrent ? 'Current' : c.ended ? 'Ended' : 'Upcoming';
  cycleBadge.className = c.isCurrent ? 'current' : '';
  cycleLength.textContent = cycleWeeks(c.start, c.end);
  cycleStatus.textContent = c.editable ? '' : 'Read-only';
  cycleEditor.value = c.notes;
  refreshRich(cycleEditor);
  cycleEditor.disabled = !c.editable;
  cycleReadonlyNote.hidden = c.editable;
  renderCycleMeta(c);
  renderProgress(c);
  renderProgressList(c);
  renderGoals(c);
  renderOkrs(c);
  switchCyclePage(cyclePage);
  [...cycleList.children].forEach((li) => li.classList.toggle('active', li.dataset.id === id));
}

// switch between Rules / OKR & Goals / Progress within a cycle
function switchCyclePage(page) {
  cyclePage = page;
  for (const key of Object.keys(cyclePages)) cyclePages[key].hidden = key !== page;
  cycleTabs.forEach((t) => t.classList.toggle('active', t.dataset.page === page));
  if (page === 'rules' && cycleEditable) cycleEditor.focus();
}
cycleTabs.forEach((t) => (t.onclick = () => switchCyclePage(t.dataset.page)));

// read-only progress bars on the Progress page
function renderProgressList(c) {
  goalProgressList.innerHTML = '';
  if (!c.goals.length) {
    goalProgressList.innerHTML = '<div class="pp-empty">No goals yet — add some on the “OKR &amp; Goals” page.</div>';
    return;
  }
  for (const g of c.goals) {
    const unit = g.unit ? ' ' + esc(g.unit) : '';
    const item = document.createElement('div');
    item.className = 'pp-item';
    item.innerHTML =
      `<div class="pp-top"><span class="pp-name">${esc(g.label || g.habitName)}</span>` +
      `<span><span class="pp-count">${g.current}${unit} / ${g.target}${unit}</span><span class="pp-pct">${g.pct}%</span></span></div>` +
      `<div class="bar big${g.pct >= 100 ? ' done' : ''}"><span style="width:${g.pct}%"></span></div>`;
    goalProgressList.appendChild(item);
  }
}

// --- goals & progress -------------------------------------------------------
function renderProgress(c) {
  if (c.overallProgress == null) {
    cycleProgress.innerHTML = '';
    return;
  }
  cycleProgress.innerHTML =
    `<div class="cycle-progress-label"><span>Cycle progress</span><span>${c.overallProgress}%</span></div>` +
    `<div class="bar big${c.overallProgress >= 100 ? ' done' : ''}"><span style="width:${c.overallProgress}%"></span></div>`;
}

function renderGoals(c) {
  addGoalBtn.hidden = !c.editable;
  goalList.innerHTML = '';
  if (!c.goals.length) {
    goalList.innerHTML = '<div class="okr-habits"><span class="none">No goals yet. Add one like “Workout → 25”.</span></div>';
    return;
  }
  for (const g of c.goals) {
    const item = document.createElement('div');
    item.className = 'goal-item';

    const top = document.createElement('div');
    top.className = 'goal-top';
    top.insertAdjacentHTML('beforeend', `<span class="goal-name">${esc(g.label || g.habitName)}</span>`);
    top.insertAdjacentHTML('beforeend', `<span class="goal-count">${g.current} / </span>`);

    const targetInp = document.createElement('input');
    targetInp.className = 'goal-edit-target';
    targetInp.type = 'text';
    targetInp.inputMode = 'decimal';
    targetInp.value = g.target;
    targetInp.disabled = !c.editable;
    targetInp.title = 'Target';
    targetInp.onchange = () => editGoal(g.id, { target: targetInp.value }, c.id);
    top.appendChild(targetInp);

    if (c.editable) {
      const del = document.createElement('button');
      del.className = 'goal-del';
      del.textContent = '🗑';
      del.title = 'Delete goal';
      del.onclick = () => deleteGoal_(g.id, g.label || g.habitName, c.id);
      top.appendChild(del);
    }
    item.appendChild(top);
    item.insertAdjacentHTML(
      'beforeend',
      `<div class="bar${g.pct >= 100 ? ' done' : ''}"><span style="width:${g.pct}%"></span></div>`
    );
    goalList.appendChild(item);
  }
}

async function addGoal() {
  if (!currentCycle) return;
  const habits = await fetch('/api/habits').then((r) => r.json());
  if (!habits.length) return alert('Create a habit first, then set a goal for it.');
  const v = await openModal({
    title: 'New goal',
    submitLabel: 'Add goal',
    fields: [
      {
        key: 'habitId',
        label: 'Habit',
        type: 'select',
        options: habits.map((h) => ({ value: h.id, label: h.name + (h.type === 'value' ? ` (${h.unit || 'value'})` : '') })),
      },
      { key: 'target', label: 'Target', inputMode: 'decimal', placeholder: 'e.g. 25', required: true },
    ],
  });
  if (!v) return;
  if (!(Number(v.target) > 0)) return alert('Target must be a positive number.');
  const habit = habits.find((h) => h.id === v.habitId);
  const res = await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cycleId: currentCycle, habitId: v.habitId, target: v.target, label: habit ? habit.name : '' }),
  });
  if (res.ok) loadCycles(currentCycle);
  else alert((await res.json()).error || 'Could not add goal');
}

async function editGoal(id, patch, cycleId) {
  const res = await fetch(`/api/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (res.ok) loadCycles(cycleId);
}

async function deleteGoal_(id, name, cycleId) {
  if (!confirm(`Delete goal "${name}"?`)) return;
  const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
  if (res.ok) loadCycles(cycleId);
}

// --- OKRs (on the cycle page) ----------------------------------------------
function renderOkrs(c) {
  addOkrBtn.hidden = !c.editable;
  okrList.innerHTML = '';
  if (!c.okrs.length) {
    okrList.innerHTML = '<div class="okr-habits"><span class="none">No OKRs yet for this cycle.</span></div>';
    return;
  }
  for (const o of c.okrs) {
    const item = document.createElement('div');
    item.className = 'okr-item';

    const row = document.createElement('div');
    row.className = 'okr-row';
    const title = document.createElement('input');
    title.className = 'okr-title';
    title.value = o.title;
    title.disabled = !c.editable;
    title.onchange = () => editOkr(o.id, { title: title.value }, c.id);
    row.appendChild(title);
    if (c.editable) {
      const del = document.createElement('button');
      del.className = 'okr-del';
      del.textContent = '🗑';
      del.title = 'Delete OKR';
      del.onclick = () => deleteOkr(o.id, o.title, c.id);
      row.appendChild(del);
    }
    item.appendChild(row);

    const habits = document.createElement('div');
    habits.className = 'okr-habits';
    if (o.habits.length) {
      habits.innerHTML = o.habits.map((h) => `<span class="pill">✅ ${esc(h.name)}</span>`).join('');
    } else {
      habits.innerHTML = '<span class="none">No habits linked — link them from the Habits tab.</span>';
    }
    item.appendChild(habits);
    okrList.appendChild(item);
  }
}

async function addOkr() {
  if (!currentCycle) return;
  const v = await openModal({
    title: 'New OKR',
    submitLabel: 'Add OKR',
    fields: [
      { key: 'title', label: 'Objective', placeholder: 'e.g. Be presentation-ready for Koblenz', required: true },
    ],
  });
  if (!v) return;
  const res = await fetch('/api/okrs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cycleId: currentCycle, title: v.title.trim() }),
  });
  if (res.ok) openCycle(currentCycle);
  else alert((await res.json()).error || 'Could not add OKR');
}

async function editOkr(id, patch, cycleId) {
  const res = await fetch(`/api/okrs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (res.ok) openCycle(cycleId);
}

async function deleteOkr(id, title, cycleId) {
  if (!confirm(`Delete OKR "${title}"? Habits linked to it will be unlinked.`)) return;
  const res = await fetch(`/api/okrs/${id}`, { method: 'DELETE' });
  if (res.ok) openCycle(cycleId);
}

function renderCycleMeta(c) {
  cycleMeta.innerHTML = '';
  const mk = (labelText, type, value, onchange) => {
    const label = document.createElement('label');
    label.textContent = labelText;
    const inp = document.createElement('input');
    inp.type = type;
    inp.value = value;
    inp.disabled = !c.editable;
    inp.onchange = () => onchange(inp.value);
    label.appendChild(inp);
    return label;
  };
  cycleMeta.appendChild(mk('Name', 'text', c.name, (v) => editCycle(c.id, { name: v })));
  cycleMeta.appendChild(mk('Start', 'date', c.start, (v) => editCycle(c.id, { start: v })));
  cycleMeta.appendChild(mk('End', 'date', c.end, (v) => editCycle(c.id, { end: v })));

  const del = document.createElement('button');
  del.className = 'del-cycle';
  del.textContent = '🗑 Delete cycle';
  del.onclick = () => deleteCycle_(c.id, c.name);
  cycleMeta.appendChild(del);
}

async function editCycle(id, patch) {
  const res = await fetch(`/api/cycles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (res.ok) loadCycles(id);
  else cycleStatus.textContent = '⚠ ' + ((await res.json()).error || 'Update failed');
}

async function addCycle() {
  const v = await openModal({
    title: 'New cycle',
    submitLabel: 'Create cycle',
    fields: [
      { key: 'name', label: 'Name', placeholder: 'e.g. Pre-Koblenz', required: true },
      { key: 'start', label: 'Start date', type: 'date', value: todayISO(), required: true },
      { key: 'end', label: 'End date', type: 'date', required: true },
    ],
  });
  if (!v) return;
  const res = await fetch('/api/cycles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: v.name.trim(), start: v.start, end: v.end }),
  });
  const data = await res.json();
  if (res.ok) loadCycles(data.id);
  else alert(data.error || 'Could not create cycle');
}

async function deleteCycle_(id, name) {
  if (!confirm(`Delete cycle "${name}"? Its notes will be removed. Your daily entries stay untouched.`)) return;
  const res = await fetch(`/api/cycles/${id}`, { method: 'DELETE' });
  if (res.ok) {
    if (currentCycle === id) currentCycle = null;
    loadCycles();
  }
}

function scheduleCycleSave() {
  cycleStatus.textContent = 'Editing…';
  clearTimeout(cycleSaveTimer);
  cycleSaveTimer = setTimeout(saveCycleNotes, 600);
}

async function saveCycleNotes() {
  if (!currentCycle || !cycleEditable) return;
  const res = await fetch(`/api/cycle/${currentCycle}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: cycleEditor.value }),
  });
  cycleStatus.textContent = res.ok ? 'Saved ✓' : '⚠ Could not save';
}

addCycleBtn.onclick = addCycle;
addOkrBtn.onclick = addOkr;
addGoalBtn.onclick = addGoal;
cycleEditor.addEventListener('input', scheduleCycleSave);
cycleEditor.addEventListener('blur', () => { clearTimeout(cycleSaveTimer); saveCycleNotes(); });

// --- Habits tab: sidebar list + per-habit detail page -----------------------
let habitsCache = [];
async function loadHabitsTab() {
  habitsCache = await fetch('/api/habits').then((r) => r.json());
  if (openHabitId && habitsCache.some((h) => h.id === openHabitId)) showHabitDetail(openHabitId);
  else showHabitsOverview();
}

// Sidebar shows the full habit list in overview mode, or just a back link
// when a single habit is open (so the page focuses on that one habit).
function renderHabitNav() {
  habitNav.innerHTML = '';
  // The full list always stays; the open habit (or Overview) is highlighted.
  const ov = document.createElement('li');
  ov.className = 'nav-overview' + (openHabitId ? '' : ' active');
  ov.textContent = '📊 Overview';
  ov.onclick = showHabitsOverview;
  habitNav.appendChild(ov);

  const ordered = habitsCache.slice().sort((a, b) => (a.type === 'check' ? 0 : 1) - (b.type === 'check' ? 0 : 1));
  for (const h of ordered) {
    const li = document.createElement('li');
    li.dataset.id = h.id;
    if (h.id === openHabitId) li.classList.add('active');
    li.innerHTML = `<span class="type-dot">${h.type === 'check' ? '☑' : '#'}</span><span>${esc(h.name)}</span>`;
    li.onclick = () => showHabitDetail(h.id);
    habitNav.appendChild(li);
  }
}

function showHabitsOverview() {
  openHabitId = null;
  habitsTitle.textContent = 'Habits overview';
  addHabitBtn2El.hidden = false;
  overviewEl.hidden = false;
  habitDetail.hidden = true;
  renderHabitNav();
  loadOverview();
}

async function showHabitDetail(id) {
  openHabitId = id;
  const habit = habitsCache.find((h) => h.id === id);
  if (!habit) return showHabitsOverview();
  habitsTitle.textContent = habit.name;
  addHabitBtn2El.hidden = true;
  overviewEl.hidden = true;
  habitDetail.hidden = false;
  renderHabitNav();

  const notes = await fetch(`/api/habits/${id}/notes`).then((r) => r.json());
  habitNotes.value = notes.content || '';
  refreshRich(habitNotes);
  habitNotes.focus();
}

function scheduleHabitNotesSave() {
  clearTimeout(habitNotesTimer);
  habitNotesTimer = setTimeout(saveHabitNotes, 600);
}
async function saveHabitNotes() {
  if (!openHabitId) return;
  await fetch(`/api/habits/${openHabitId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: habitNotes.value }),
  });
}
habitNotes.addEventListener('input', scheduleHabitNotesSave);
habitNotes.addEventListener('blur', () => { clearTimeout(habitNotesTimer); saveHabitNotes(); });

// --- habits overview --------------------------------------------------------
async function loadOverview() {
  const [data, okrs, cycles] = await Promise.all([
    fetch('/api/overview?days=14').then((r) => r.json()),
    fetch('/api/okrs').then((r) => r.json()),
    fetch('/api/cycles').then((r) => r.json()),
  ]);
  overview.innerHTML = '';
  if (!data.habits.length) {
    overview.innerHTML = '<div class="habits-empty">No habits yet. Click “+ Add habit” to create one.</div>';
    return;
  }
  for (const h of data.habits) {
    const card = document.createElement('div');
    card.className = 'ov-card';

    const top = document.createElement('div');
    top.className = 'ov-top';

    const nameInp = document.createElement('input');
    nameInp.className = 'ov-name';
    nameInp.value = h.name;
    nameInp.onchange = () => editHabit(h.id, { name: nameInp.value });
    top.appendChild(nameInp);

    const typeSel = document.createElement('select');
    typeSel.className = 'ov-type';
    typeSel.innerHTML = `<option value="check">Checkbox</option><option value="value">Value</option>`;
    typeSel.value = h.type === 'value' ? 'value' : 'check';
    typeSel.onchange = () => editHabit(h.id, { type: typeSel.value }).then(loadOverview);
    top.appendChild(typeSel);

    if (h.type === 'value') {
      const unitInp = document.createElement('input');
      unitInp.className = 'ov-unit';
      unitInp.value = h.unit || '';
      unitInp.placeholder = 'unit';
      unitInp.onchange = () => editHabit(h.id, { unit: unitInp.value });
      top.appendChild(unitInp);
    }

    top.appendChild(buildOkrSelect(h, okrs, cycles));

    top.insertAdjacentHTML('beforeend', `<span class="ov-streak">🔥 ${h.streak}d</span><span class="ov-spacer"></span>`);

    const del = document.createElement('button');
    del.className = 'ov-del';
    del.textContent = '🗑';
    del.title = 'Delete habit';
    del.onclick = () => deleteHabit(h.id, h.name);
    top.appendChild(del);

    card.appendChild(top);

    // recent-history grid (oldest → newest left to right)
    const grid = document.createElement('div');
    grid.className = 'ov-grid';
    for (const date of [...data.dates].reverse()) {
      const v = h.values[date];
      const done = h.type === 'check' ? v === true : v != null && String(v).trim() !== '';
      const dd = new Date(date + 'T00:00:00');
      const cell = document.createElement('div');
      cell.className = 'ov-cell' + (done ? ' done' : '') + (date === data.today ? ' is-today' : '');
      cell.title = date;
      const label = dd.toLocaleDateString(undefined, { day: 'numeric' });
      const shown = h.type === 'value' && done ? `<span class="v">${esc(String(v))}</span>` : done ? '✓' : '·';
      cell.innerHTML = `<span class="d">${label}</span>${shown}`;
      grid.appendChild(cell);
    }
    card.appendChild(grid);
    overview.appendChild(card);
  }
}

// dropdown linking a habit to an OKR, grouped by cycle
function buildOkrSelect(h, okrs, cycles) {
  const sel = document.createElement('select');
  sel.className = 'ov-okr-select';
  const none = document.createElement('option');
  none.value = '';
  none.textContent = '🎯 No OKR';
  sel.appendChild(none);

  const cycleName = (id) => (cycles.find((c) => c.id === id) || {}).name || 'Other';
  // group OKRs by cycle
  const byCycle = {};
  for (const o of okrs) (byCycle[o.cycleId] ||= []).push(o);
  for (const cycleId of Object.keys(byCycle)) {
    const group = document.createElement('optgroup');
    group.label = cycleName(cycleId);
    for (const o of byCycle[cycleId]) {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.title;
      if (h.okrId === o.id) opt.selected = true;
      group.appendChild(opt);
    }
    sel.appendChild(group);
  }
  sel.onchange = () => editHabit(h.id, { okrId: sel.value || null }).then(loadOverview);
  return sel;
}

async function editHabit(id, patch) {
  const res = await fetch(`/api/habits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) loadOverview(); // revert on failure
  else if (!habitNav.hidden && !openHabitId) {
    // keep the sidebar list names in sync after an overview edit
    habitsCache = await fetch('/api/habits').then((r) => r.json());
    renderHabitNav();
  }
}

addHabitBtn.onclick = addHabit;
addHabitBtn2.onclick = addHabit;
editor.addEventListener('input', scheduleSave);
editor.addEventListener('input', autoGrowEditor);
editor.addEventListener('blur', () => { clearTimeout(saveTimer); save(); });

// "What happened today?" autosave (debounced + on blur)
let summaryTimer = null;
function scheduleSummarySave() {
  statusEl.textContent = 'Editing…';
  clearTimeout(summaryTimer);
  summaryTimer = setTimeout(saveSummary, 600);
}
async function saveSummary() {
  if (!current || !editable) return;
  const res = await fetch(`/api/summary/${current}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: summaryInput.value }),
  });
  statusEl.textContent = res.ok ? 'Saved ✓' : '⚠ Could not save';
}
summaryInput.addEventListener('input', scheduleSummarySave);
summaryInput.addEventListener('blur', () => { clearTimeout(summaryTimer); saveSummary(); });
// Today → always land on today's daily notes page, from any view.
async function goToToday() {
  await switchView('journal');
  await loadDays();
  const today = dayList.querySelector('.tree-day.today');
  if (today) openDay(today.dataset.date);
  else openDay(todayISO());
}
todayBtn.onclick = goToToday;

// time tracker wiring
timerToggle.onclick = toggleTimer;
newProjectBtn.onclick = newProject;
logTimeBtn.onclick = logTime;
addProjectBtn.onclick = async () => { await newProject(); if (view === 'time') { renderProjectNav(); loadTimeOverview(); } };

// --- slash commands + checkbox helpers for note editors ---------------------
const slashMenu = document.getElementById('slashMenu');
const SLASH_COMMANDS = [
  { key: 'checkbox todo task', label: 'Checkbox', icon: '☐', hint: 'To-do', insert: '- [ ] ' },
  { key: 'bullet list', label: 'Bullet list', icon: '•', hint: '- item', insert: '- ' },
  { key: 'numbered ordered list', label: 'Numbered list', icon: '1.', hint: '1. item', insert: '1. ' },
  { key: 'heading title', label: 'Heading', icon: 'H', hint: 'Section', insert: '## ' },
  { key: 'divider rule separator', label: 'Divider', icon: '—', hint: 'Separator', insert: '---\n' },
];

let slashActive = false;
let slashTa = null;
let slashStart = -1;
let slashItems = [];
let slashSel = 0;

function fireInput(ta) { ta.dispatchEvent(new Event('input', { bubbles: true })); }

function closeSlash() {
  slashActive = false;
  slashTa = null;
  slashMenu.hidden = true;
}

function openSlash(ta, query) {
  const q = query.toLowerCase();
  slashItems = SLASH_COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.key.includes(q));
  if (!slashItems.length) return closeSlash();
  slashActive = true;
  slashTa = ta;
  slashSel = 0;
  renderSlash();
  positionSlash(ta);
  slashMenu.hidden = false;
}

function renderSlash() {
  slashMenu.innerHTML = slashItems
    .map(
      (c, i) =>
        `<div class="slash-item${i === slashSel ? ' sel' : ''}" data-i="${i}">` +
        `<span class="si-label"><span class="si-icon">${c.icon}</span>${c.label}</span><span class="si-hint">${esc(c.hint)}</span></div>`
    )
    .join('');
  [...slashMenu.children].forEach((el) => {
    el.onmousedown = (ev) => { ev.preventDefault(); chooseSlash(+el.dataset.i); };
  });
}

function positionSlash(ta) {
  const { x, y } = caretCoords(ta, ta.selectionStart);
  const maxX = window.innerWidth - 240;
  slashMenu.style.left = Math.min(x, maxX) + 'px';
  slashMenu.style.top = Math.min(y, window.innerHeight - 220) + 'px';
}

// Approximate pixel position of the caret using a mirror element.
function caretCoords(ta, pos) {
  const div = document.createElement('div');
  const s = getComputedStyle(ta);
  for (const p of ['boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderLeftWidth', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'])
    div.style[p] = s[p];
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.textContent = ta.value.slice(0, pos);
  const span = document.createElement('span');
  span.textContent = '​';
  div.appendChild(span);
  document.body.appendChild(div);
  const rect = ta.getBoundingClientRect();
  const lh = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.3;
  const x = rect.left + span.offsetLeft - ta.scrollLeft;
  const y = rect.top + span.offsetTop - ta.scrollTop + lh;
  document.body.removeChild(div);
  return { x, y };
}

function chooseSlash(i) {
  const c = slashItems[i];
  const ta = slashTa;
  if (!c || !ta) return;
  const pos = ta.selectionStart;
  const before = ta.value.slice(0, slashStart);
  const after = ta.value.slice(pos);
  ta.value = before + c.insert + after;
  const np = before.length + c.insert.length;
  ta.selectionStart = ta.selectionEnd = np;
  closeSlash();
  ta.focus();
  fireInput(ta);
}

// Continue a list (checkbox/bullet/numbered) on Enter; empty item exits the list.
function continueList(ta) {
  const text = ta.value;
  const pos = ta.selectionStart;
  if (pos !== ta.selectionEnd) return false;
  const ls = text.lastIndexOf('\n', pos - 1) + 1;
  const line = text.slice(ls, pos);
  const clearLine = () => {
    ta.value = text.slice(0, ls) + text.slice(pos);
    ta.selectionStart = ta.selectionEnd = ls;
    fireInput(ta);
  };
  const insert = (str) => {
    ta.value = text.slice(0, pos) + str + text.slice(pos);
    ta.selectionStart = ta.selectionEnd = pos + str.length;
    fireInput(ta);
  };
  let m = line.match(/^(\s*)- \[[ xX]\] (.*)$/);
  if (m) { m[2].trim() === '' ? clearLine() : insert('\n' + m[1] + '- [ ] '); return true; }
  m = line.match(/^(\s*)([-*]) (.*)$/);
  if (m) { m[3].trim() === '' ? clearLine() : insert('\n' + m[1] + m[2] + ' '); return true; }
  m = line.match(/^(\s*)(\d+)\. (.*)$/);
  if (m) { m[3].trim() === '' ? clearLine() : insert('\n' + m[1] + (parseInt(m[2], 10) + 1) + '. '); return true; }
  return false;
}

// Toggle the checkbox on the current line ([ ] <-> [x]).
function toggleCheckboxLine(ta) {
  const text = ta.value;
  const pos = ta.selectionStart;
  const ls = text.lastIndexOf('\n', pos - 1) + 1;
  let le = text.indexOf('\n', pos);
  if (le < 0) le = text.length;
  const m = text.slice(ls, le).match(/^(\s*- \[)([ xX])(\].*)$/);
  if (!m) return false;
  const newLine = m[1] + (m[2] === ' ' ? 'x' : ' ') + m[3];
  ta.value = text.slice(0, ls) + newLine + text.slice(le);
  ta.selectionStart = ta.selectionEnd = pos;
  fireInput(ta);
  return true;
}

// Clicking directly on the [ ] box toggles it.
function maybeToggleByClick(ta) {
  const text = ta.value;
  const pos = ta.selectionStart;
  if (pos !== ta.selectionEnd) return;
  const ls = text.lastIndexOf('\n', pos - 1) + 1;
  const m = text.slice(ls).match(/^(\s*)- \[[ xX]\]/);
  if (!m) return;
  const markerStart = ls + m[1].length; // start of "- [ ]"
  if (pos >= markerStart && pos <= markerStart + 5) toggleCheckboxLine(ta); // anywhere on the box
}

// Wrap (or unwrap) the selection with a marker, e.g. ** for bold.
function wrapSelection(ta, mark) {
  const s = ta.selectionStart;
  const e = ta.selectionEnd;
  const v = ta.value;
  const sel = v.slice(s, e);
  const wrappedAlready = v.slice(s - mark.length, s) === mark && v.slice(e, e + mark.length) === mark;
  if (sel && wrappedAlready) {
    ta.value = v.slice(0, s - mark.length) + sel + v.slice(e + mark.length);
    ta.selectionStart = s - mark.length;
    ta.selectionEnd = e - mark.length;
  } else {
    ta.value = v.slice(0, s) + mark + sel + mark + v.slice(e);
    if (sel) {
      ta.selectionStart = s + mark.length;
      ta.selectionEnd = e + mark.length;
    } else {
      ta.selectionStart = ta.selectionEnd = s + mark.length; // cursor between the markers
    }
  }
  fireInput(ta);
}

function attachNotes(ta) {
  ta.addEventListener('input', () => {
    const pos = ta.selectionStart;
    const m = ta.value.slice(0, pos).match(/(?:^|\s)\/([a-zA-Z]*)$/);
    if (m) { slashStart = pos - m[1].length - 1; openSlash(ta, m[1]); }
    else closeSlash();
  });
  ta.addEventListener('keydown', (e) => {
    if (slashActive && slashTa === ta) {
      if (e.key === 'ArrowDown') { e.preventDefault(); slashSel = (slashSel + 1) % slashItems.length; renderSlash(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); slashSel = (slashSel - 1 + slashItems.length) % slashItems.length; renderSlash(); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopImmediatePropagation(); chooseSlash(slashSel); return; }
      if (e.key === 'Escape') { e.preventDefault(); closeSlash(); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !slashActive) {
      if (continueList(ta)) e.preventDefault();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (toggleCheckboxLine(ta)) e.preventDefault();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      wrapSelection(ta, '**');
    }
  });
  ta.addEventListener('click', () => maybeToggleByClick(ta));
  ta.addEventListener('blur', () => setTimeout(() => { if (slashTa === ta) closeSlash(); }, 150));
}

[editor, cycleEditor, habitNotes, projectNotes, weekEditor].forEach(attachNotes);

// Give the cycle/habit/project note editors the same rendered backdrop as the
// daily notes (checkboxes + **bold**), kept aligned + scroll-synced.
function makeRichFill(ta) {
  const wrap = document.createElement('div');
  wrap.className = 'rich-wrap fill';
  ta.parentNode.insertBefore(wrap, ta);
  const bd = document.createElement('div');
  bd.className = 'rich-backdrop';
  wrap.appendChild(bd);
  wrap.appendChild(ta);
  const sync = () => {
    const s = getComputedStyle(ta);
    ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach((p) => { bd.style[p] = s[p]; });
    bd.innerHTML = highlightNotes(ta.value);
    bd.scrollTop = ta.scrollTop;
  };
  ta.addEventListener('input', sync);
  ta.addEventListener('scroll', () => { bd.scrollTop = ta.scrollTop; });
  ta._richSync = sync;
  sync();
}
[cycleEditor, habitNotes, projectNotes].forEach(makeRichFill);
const refreshRich = (ta) => ta._richSync && ta._richSync();

// boot: open today
(async function init() {
  await Promise.all([loadDays(), loadProjects(), refreshTimer()]);
  const today = dayList.querySelector('.tree-day.today');
  openDay(today ? today.dataset.date : todayISO());
})();

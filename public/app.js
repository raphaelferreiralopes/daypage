'use strict';

const TRASH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7"/><path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20L18 7"/><path d="M10 11v6M14 11v6"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5.5v13a1 1 0 0 0 1.53.85l10.6-6.5a1 1 0 0 0 0-1.7L8.53 4.65A1 1 0 0 0 7 5.5z"/></svg>';
const STOP_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
const GRIP_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/></svg>';

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
// life view (Recap calendar)
const lifeView = document.getElementById('lifeView');
const lifeLabel = document.getElementById('lifeLabel');
const lifeCalendar = document.getElementById('lifeCalendar');
const lifePrev = document.getElementById('lifePrev');
const lifeNext = document.getElementById('lifeNext');
const lifeTodayBtn = document.getElementById('lifeTodayBtn');
const lifeModeTabsNav = document.getElementById('lifeModeTabs');
const lifeModeTabs = lifeModeTabsNav.querySelectorAll('.day-tab');
// checklist view (recurring daily checklists)
const checklistView = document.getElementById('checklistView');
const checklistList = document.getElementById('checklistList');
const addChecklistBtn = document.getElementById('addChecklistBtn');
const projectNotes = document.getElementById('projectNotes');
const dayCycle = document.getElementById('dayCycle');
// week section (inside journalView)
const weekSection = document.getElementById('weekSection');
const weekEditorBackdrop = document.getElementById('weekEditorBackdrop');
const weekEditor = document.getElementById('weekEditor');
const weekReadonlyNote = document.getElementById('weekReadonlyNote');
// week sub-tabs (Time / Habits / Notes / Reflexion / Learnings)
const weekTabsNav = document.getElementById('weekTabs');
const weekTabs = weekTabsNav.querySelectorAll('.day-tab');
const weekPages = {
  time: document.getElementById('weekPageTime'),
  habits: document.getElementById('weekPageHabits'),
  notes: document.getElementById('weekPageNotes'),
  reflexion: document.getElementById('weekPageReflexion'),
  learnings: document.getElementById('weekPageLearnings'),
};
const weekTimeSummaryEl = document.getElementById('weekTimeSummary');
const weekHabitsSummaryEl = document.getElementById('weekHabitsSummary');
const weekLearningsSummaryEl = document.getElementById('weekLearningsSummary');
const weekReflexionEditor = document.getElementById('weekReflexionEditor');
const weekReflexionBackdrop = document.getElementById('weekReflexionBackdrop');
const weekReflexionReadonlyNote = document.getElementById('weekReflexionReadonlyNote');
// day sub-tabs (Time / Habits / Notes / Reflexion / Learnings / Recap)
const dayTabsNav = document.getElementById('dayTabs');
const dayTabs = dayTabsNav.querySelectorAll('.day-tab');
const dayPages = {
  time: document.getElementById('dayPageTime'),
  habits: document.getElementById('dayPageHabits'),
  notes: document.getElementById('dayPageNotes'),
  reflexion: document.getElementById('dayPageReflexion'),
  learnings: document.getElementById('dayPageLearnings'),
  sentence: document.getElementById('dayPageSentence'),
};
const learningsEditor = document.getElementById('learningsEditor');
const learningsBackdrop = document.getElementById('learningsBackdrop');
const learningsReadonlyNote = document.getElementById('learningsReadonlyNote');
const reflexionEditor = document.getElementById('reflexionEditor');
const reflexionBackdrop = document.getElementById('reflexionBackdrop');
const reflexionReadonlyNote = document.getElementById('reflexionReadonlyNote');
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
const cycleTimeProgress = document.getElementById('cycleTimeProgress');
const goalList = document.getElementById('goalList');
const addGoalBtn = document.getElementById('addGoalBtn');
const goalProgressList = document.getElementById('goalProgressList');
const cycleTabs = document.querySelectorAll('.cycle-tab');
const cyclePages = {
  rules: document.getElementById('cyclePageRules'),
  okrs: document.getElementById('cyclePageOkrs'),
  progress: document.getElementById('cyclePageProgress'),
};

// yearly goals
const goalsView = document.getElementById('goalsView');
const goalsPrev = document.getElementById('goalsPrev');
const goalsNext = document.getElementById('goalsNext');
const goalsYearLabel = document.getElementById('goalsYearLabel');
const goalsTodayBtn = document.getElementById('goalsTodayBtn');
const addYearGoalBtn = document.getElementById('addYearGoalBtn');
const goalsOverallProgress = document.getElementById('goalsOverallProgress');
const yearGoalList = document.getElementById('yearGoalList');

// modal
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalFields = document.getElementById('modalFields');
const modalError = document.getElementById('modalError');
const modalSubmit = document.getElementById('modalSubmit');
const modalCancel = document.getElementById('modalCancel');

// confirm dialog
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOk = document.getElementById('confirmOk');
const confirmCancel = document.getElementById('confirmCancel');
const toastContainer = document.getElementById('toastContainer');

// command palette
const paletteOverlay = document.getElementById('paletteOverlay');
const paletteInput = document.getElementById('paletteInput');
const paletteResults = document.getElementById('paletteResults');

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
let dayPage = 'notes'; // active sub-tab within a day (time/habits/notes/reflexion/learnings)
let learningsSaveTimer = null;
let reflexionSaveTimer = null;
let weekPage = 'notes'; // active sub-tab within a week (time/habits/notes/reflexion/learnings)
let weekReflexionSaveTimer = null;
let lifeViewMode = 'month'; // 'month' | 'year'
let lifeMonth = null; // 'YYYY-MM' currently shown on the Life calendar
let lifeYear = null; // 'YYYY' currently shown in year mode
let recapsCache = null; // Map(date -> text), loaded once and reused across months/years

function fmtDate(date) {
  const d = new Date(date + 'T00:00:00');
  const weekday = d.toLocaleDateString('de-DE', { weekday: 'long' });
  const month = d.toLocaleDateString('de-DE', { month: 'long' });
  return `${weekday}, der ${d.getDate()}. ${month} ${d.getFullYear()}`;
}

function weekStartOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const isoDay = day === 0 ? 7 : day;
  d.setDate(d.getDate() - (isoDay - 1));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

// ISO-8601 week number. `mondayStr` is the Monday of the week (our weeks are
// always Monday-based); the ISO week belongs to the year containing that
// week's Thursday, which matters right around New Year's.
function isoWeekNumber(weekStartStr) {
  const thursday = new Date(weekStartStr + 'T00:00:00');
  thursday.setDate(thursday.getDate() + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  return Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
}

// How long a cycle runs, in weeks (inclusive of both start and end days).
function cycleWeeks(start, end) {
  if (!start || !end) return '';
  const days = Math.round((new Date(end + 'T00:00:00') - new Date(start + 'T00:00:00')) / 86400000) + 1;
  const weeks = days / 7;
  const w = Number.isInteger(weeks) ? String(weeks) : weeks.toFixed(1);
  return `${w} week${weeks === 1 ? '' : 's'}`;
}

// How many days of a cycle have elapsed, out of its total length.
function cycleTimeElapsed(start, end) {
  if (!start || !end) return null;
  const startD = new Date(start + 'T00:00:00');
  const endD = new Date(end + 'T00:00:00');
  const today = new Date(todayISO() + 'T00:00:00');
  const totalDays = Math.round((endD - startD) / 86400000) + 1;
  let elapsedDays;
  if (today < startD) elapsedDays = 0;
  else if (today > endD) elapsedDays = totalDays;
  else elapsedDays = Math.round((today - startD) / 86400000) + 1;
  const pct = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
  return { elapsedDays, totalDays, pct };
}

function renderCycleTimeProgress(c) {
  const t = cycleTimeElapsed(c.start, c.end);
  if (!t) {
    cycleTimeProgress.innerHTML = '';
    return;
  }
  cycleTimeProgress.innerHTML =
    `<div class="cycle-progress-label"><span>Time elapsed</span><span>Day ${t.elapsedDays} of ${t.totalDays} (${t.pct}%)</span></div>` +
    `<div class="bar big${t.pct >= 100 ? ' done' : ''}"><span style="width:${t.pct}%"></span></div>`;
}

// Day list as a collapsible Year → Months → Days tree.
let dayTree = null;
const expandedNodes = new Set();
let treeInited = false;

async function loadDays() {
  const [days, weekNotes] = await Promise.all([
    apiFetch('/api/entries').then((r) => r.json()),
    apiFetch('/api/week-notes').then((r) => r.ok ? r.json() : []),
  ]);
  const weekNotesMap = new Map(weekNotes.map((w) => [w.weekStart, w]));
  const today = todayISO();
  const cws = weekStartOf(today);

  // group days by their week
  const weekMap = new Map();
  for (const d of days) {
    const ws = weekStartOf(d.date);
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

  // fill in every past/today day of each week, so days without a saved
  // entry still show up as empty placeholders instead of gaps in the list.
  for (const week of weekMap.values()) {
    const existing = new Set(week.days.map((d) => d.date));
    const lastDay = week.weekEnd < today ? week.weekEnd : today;
    for (let date = week.weekStart; date <= lastDay; date = addClientDays(date, 1)) {
      if (!existing.has(date)) {
        week.days.push({ date, isToday: date === today, hasEntry: false });
      }
    }
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
    yLi.innerHTML = `<button class="tree-toggle">${yOpen ? '▾' : '▸'}</button><span>${y}</span>`;
    yLi.querySelector('.tree-toggle').onclick = (e) => { e.stopPropagation(); toggleNode(yKey); };
    dayList.appendChild(yLi);
    if (!yOpen) continue;

    for (const m of Object.keys(dayTree[y]).sort().reverse()) {
      const mKey = 'm' + y + m;
      const mOpen = expandedNodes.has(mKey);
      const monthName = new Date(+y, +m - 1, 1).toLocaleString(undefined, { month: 'long' });
      const mLi = document.createElement('li');
      mLi.className = 'tree-month';
      mLi.innerHTML = `<button class="tree-toggle">${mOpen ? '▾' : '▸'}</button><span>${monthName}</span>`;
      mLi.querySelector('.tree-toggle').onclick = (e) => { e.stopPropagation(); toggleNode(mKey); };
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
        wLi.title = range;
        wLi.innerHTML =
          `<button class="tree-toggle">${wOpen ? '▾' : '▸'}</button>` +
          `<span class="dot">${week.hasWeekNote ? '●' : '○'}</span>` +
          `<span class="week-label">KW ${isoWeekNumber(week.weekStart)}${week.isCurrent ? ' <span class="week-badge">Aktuell</span>' : ''}</span>`;
        wLi.querySelector('.tree-toggle').onclick = (e) => { e.stopPropagation(); toggleNode(wKey); };
        wLi.onclick = (ev) => { if (!ev.target.classList.contains('tree-toggle')) openWeek(week.weekStart); };
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
  const ws = weekStartOf(date);
  const [wy, wm] = ws.split('-');
  expandedNodes.add('y' + wy);
  expandedNodes.add('m' + wy + wm);
  expandedNodes.add('w' + ws);
  renderDayTree();
}

async function openDay(date) {
  closeSidebarOnMobile();
  const entry = await apiFetch(`/api/entry/${date}`).then((r) => r.json());
  current = date;
  currentMode = 'day';
  editable = entry.editable;
  // switch to day mode
  dayTabsNav.hidden = false;
  weekSection.hidden = true;
  entryDate.textContent = fmtDate(date);
  entryDate.title = date;
  editor.value = entry.content;
  editor.disabled = !entry.editable;
  readonlyNote.hidden = entry.editable;
  statusEl.textContent = entry.editable ? '' : 'Read-only';
  if (entry.cycle) {
    dayCycle.hidden = false;
    dayCycle.textContent = entry.cycle.name;
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
  learningsEditor.value = entry.learnings || '';
  learningsEditor.disabled = !entry.editable;
  learningsReadonlyNote.hidden = entry.editable;
  renderLearningsBackdrop();
  autoGrowLearningsEditor();
  reflexionEditor.value = entry.reflexion || '';
  reflexionEditor.disabled = !entry.editable;
  reflexionReadonlyNote.hidden = entry.editable;
  renderReflexionBackdrop();
  autoGrowReflexionEditor();
  ensureDayVisible(date);
  switchDayPage(dayPage);
}

// switch between Time / Habits / Notes / Reflexion / Learnings / Recap within a day
function switchDayPage(page) {
  dayPage = page;
  for (const key of Object.keys(dayPages)) dayPages[key].hidden = key !== page;
  dayTabs.forEach((t) => t.classList.toggle('active', t.dataset.page === page));
  if (page === 'notes' && editable) editor.focus();
  if (page === 'reflexion' && editable) reflexionEditor.focus();
  if (page === 'sentence' && editable) summaryInput.focus();
  if (page === 'learnings' && editable) learningsEditor.focus();
}
dayTabs.forEach((t) => (t.onclick = () => switchDayPage(t.dataset.page)));

// Grow the notes box to fit its content so the whole page scrolls, not the box.
function autoGrowEditor() {
  editor.style.height = 'auto';
  editor.style.height = editor.scrollHeight + 'px';
  keepCaretInView(editor);
}

// Render the daily notes onto the backdrop layer, styling checkbox lines so
// checked items show in accent colour with a strike-through.
// Inline Markdown: **bold**, *italic*, ~~strikethrough~~. The marker
// characters always stay in the DOM — removing them would make the backdrop
// shorter than the (invisible) textarea it sits on top of, which is what
// keeps clicks and the caret lined up with what you see — but they're
// visually hidden (visibility, not display: none, so the width they occupy
// doesn't change) everywhere except the line the caret is currently on, via
// the .hide class below. That's set per-line by highlightNotes.
function mdMark(marker, show) {
  return `<span class="md-mark${show ? '' : ' hide'}">${marker}</span>`;
}
function inlineMd(escaped, showMarks) {
  return escaped.replace(
    /(\*\*)(.+?)\*\*|(~~)(.+?)~~|(\*)(.+?)\*/g,
    (whole, b, bInner, s, sInner, i, iInner) => {
      if (b) return mdMark(b, showMarks) + `<strong>${bInner}</strong>` + mdMark(b, showMarks);
      if (s) return mdMark(s, showMarks) + `<del>${sInner}</del>` + mdMark(s, showMarks);
      return mdMark(i, showMarks) + `<em>${iInner}</em>` + mdMark(i, showMarks);
    }
  );
}

function highlightNotes(text, caretLine = -1) {
  return text
    .split('\n')
    .map((line, i) => {
      const showMarks = i === caretLine;
      const m = line.match(/^(\s*)- \[( |x|X)\] (.*)$/);
      if (!m) return inlineMd(esc(line), showMarks);
      const checked = m[2].toLowerCase() === 'x';
      const box = `- [${checked ? 'x' : ' '}]`;
      return `${esc(m[1])}<span class="cbk${checked ? ' on' : ''}">${esc(box)}</span> <span class="cbtxt${checked ? ' done' : ''}">${inlineMd(esc(m[3]), showMarks)}</span>`;
    })
    .join('\n');
}

// Which line (0-based) the caret is on, or -1 when the textarea isn't
// focused — decides which line's markdown markers highlightNotes reveals.
function caretLineOf(ta) {
  if (document.activeElement !== ta) return -1;
  return ta.value.slice(0, ta.selectionStart).split('\n').length - 1;
}

function renderEditorBackdrop() {
  editorBackdrop.innerHTML = highlightNotes(editor.value, caretLineOf(editor));
}
editor.addEventListener('input', renderEditorBackdrop);
editor.addEventListener('click', renderEditorBackdrop);
editor.addEventListener('keyup', renderEditorBackdrop);
editor.addEventListener('focus', renderEditorBackdrop);
editor.addEventListener('blur', renderEditorBackdrop);

function renderWeekBackdrop() {
  weekEditorBackdrop.innerHTML = highlightNotes(weekEditor.value, caretLineOf(weekEditor));
}
function autoGrowWeekEditor() {
  weekEditor.style.height = 'auto';
  weekEditor.style.height = weekEditor.scrollHeight + 'px';
  keepCaretInView(weekEditor);
}
weekEditor.addEventListener('input', renderWeekBackdrop);
weekEditor.addEventListener('input', autoGrowWeekEditor);
weekEditor.addEventListener('click', renderWeekBackdrop);
weekEditor.addEventListener('keyup', renderWeekBackdrop);
weekEditor.addEventListener('focus', renderWeekBackdrop);
weekEditor.addEventListener('blur', renderWeekBackdrop);

function renderLearningsBackdrop() {
  learningsBackdrop.innerHTML = highlightNotes(learningsEditor.value, caretLineOf(learningsEditor));
}
function autoGrowLearningsEditor() {
  learningsEditor.style.height = 'auto';
  learningsEditor.style.height = learningsEditor.scrollHeight + 'px';
  keepCaretInView(learningsEditor);
}
learningsEditor.addEventListener('input', renderLearningsBackdrop);
learningsEditor.addEventListener('input', autoGrowLearningsEditor);
learningsEditor.addEventListener('input', scheduleLearningsSave);
learningsEditor.addEventListener('click', renderLearningsBackdrop);
learningsEditor.addEventListener('keyup', renderLearningsBackdrop);
learningsEditor.addEventListener('focus', renderLearningsBackdrop);
learningsEditor.addEventListener('blur', renderLearningsBackdrop);
learningsEditor.addEventListener('blur', () => { clearTimeout(learningsSaveTimer); saveLearnings(); });

function scheduleLearningsSave() {
  statusEl.textContent = 'Editing…';
  clearTimeout(learningsSaveTimer);
  learningsSaveTimer = setTimeout(saveLearnings, 600);
}

async function saveLearnings() {
  if (!current || !editable) return;
  try {
    const res = await apiFetch(`/api/learnings/${current}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: learningsEditor.value }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
    statusEl.textContent = 'Saved ✓';
  } catch (e) {
    statusEl.textContent = '⚠ ' + e.message;
    showToast(e.message);
  }
}

function renderReflexionBackdrop() {
  reflexionBackdrop.innerHTML = highlightNotes(reflexionEditor.value, caretLineOf(reflexionEditor));
}
function autoGrowReflexionEditor() {
  reflexionEditor.style.height = 'auto';
  reflexionEditor.style.height = reflexionEditor.scrollHeight + 'px';
  keepCaretInView(reflexionEditor);
}
reflexionEditor.addEventListener('input', renderReflexionBackdrop);
reflexionEditor.addEventListener('input', autoGrowReflexionEditor);
reflexionEditor.addEventListener('input', scheduleReflexionSave);
reflexionEditor.addEventListener('click', renderReflexionBackdrop);
reflexionEditor.addEventListener('keyup', renderReflexionBackdrop);
reflexionEditor.addEventListener('focus', renderReflexionBackdrop);
reflexionEditor.addEventListener('blur', renderReflexionBackdrop);
reflexionEditor.addEventListener('blur', () => { clearTimeout(reflexionSaveTimer); saveReflexion(); });

function scheduleReflexionSave() {
  statusEl.textContent = 'Editing…';
  clearTimeout(reflexionSaveTimer);
  reflexionSaveTimer = setTimeout(saveReflexion, 600);
}

async function saveReflexion() {
  if (!current || !editable) return;
  try {
    const res = await apiFetch(`/api/reflexion/${current}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: reflexionEditor.value }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
    statusEl.textContent = 'Saved ✓';
  } catch (e) {
    statusEl.textContent = '⚠ ' + e.message;
    showToast(e.message);
  }
}

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

// Parents first, each immediately followed by its own children — every
// select/list of projects reads top-to-bottom by hierarchy this way instead
// of being scattered by creation order. Depth is computed off the full
// project list so a child still nests correctly even if `list` was
// pre-filtered (e.g. to trackable projects only) and its parent got excluded.
function orderedProjectRows(list) {
  const included = new Set(list.map((p) => p.id));
  const byParent = new Map();
  for (const p of projects) {
    const key = p.parentId || null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(p);
  }
  const out = [];
  const walk = (parentId, depth) => {
    for (const p of byParent.get(parentId) || []) {
      if (included.has(p.id)) out.push({ project: p, depth });
      walk(p.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

function projectOptionLabel(p, depth) {
  return depth ? `↳ ${p.name}` : p.name;
}

async function loadProjects() {
  projects = await apiFetch('/api/projects').then((r) => r.json());
  const keep = timerProject.value;
  const rows = orderedProjectRows(trackableProjects());
  timerProject.innerHTML = rows.length
    ? rows.map(({ project: p, depth }) => `<option value="${p.id}">${esc(projectOptionLabel(p, depth))}</option>`).join('')
    : '<option value="" disabled selected>No active projects</option>';
  if (keep) timerProject.value = keep;
}

function renderTime(entry) {
  timerBaseTotal = entry.time.total;
  // the live timer only makes sense on today's page; logging/removing time
  // by hand is allowed on any past day too, so you can backfill a day you
  // forgot to track.
  const onToday = entry.isToday;
  document.getElementById('timerRow').style.display = 'flex';
  timerProject.style.display = onToday ? '' : 'none';
  newProjectBtn.style.display = onToday ? '' : 'none';
  timerToggle.style.display = onToday ? '' : 'none';
  if (!onToday) timerElapsed.hidden = true;

  renderTimeEntries(entry);
  updateTimeTotal();
  applyTimerUI();
}

// Group the day's raw entries by project so the box reads as an overview
// (project + total invested) with the underlying sessions right below each
// total, rather than one long chronological list mixing all projects.
function renderTimeEntries(entry) {
  const groups = new Map();
  for (const e of entry.time.entries) {
    let g = groups.get(e.projectId);
    if (!g) {
      g = { name: e.projectName, seconds: 0, entries: [] };
      groups.set(e.projectId, g);
    }
    g.seconds += e.seconds;
    g.entries.push(e);
  }
  const sorted = [...groups.values()].sort((a, b) => b.seconds - a.seconds);

  timeEntries.innerHTML = '';
  for (const g of sorted) {
    // header: project + total only — notes and delete live on the sub-entries below
    const header = document.createElement('div');
    header.className = 'time-project-total';
    const left = document.createElement('span');
    left.className = 'tproj';
    left.appendChild(document.createTextNode(g.name));
    header.appendChild(left);
    const dur = document.createElement('span');
    dur.className = 'tdur';
    dur.textContent = fmtDur(g.seconds);
    header.appendChild(dur);
    timeEntries.appendChild(header);

    for (const e of g.entries.slice().reverse()) {
      const row = document.createElement('div');
      row.className = 'time-entry sub';
      row.appendChild(noteSlot(entry.date, e.id, e.note));
      const dur2 = document.createElement('span');
      dur2.className = 'tdur';
      dur2.textContent = fmtDur(e.seconds);
      row.appendChild(dur2);
      row.appendChild(makeDeleteBtn(entry.date, e.id));
      timeEntries.appendChild(row);
    }
  }
}

function makeDeleteBtn(date, id) {
  const del = document.createElement('button');
  del.className = 'tdel';
  del.textContent = '✕';
  del.title = 'Delete entry';
  del.onclick = () => deleteTimeEntry(date, id);
  return del;
}

// Click-to-edit label for "what did you do during this block" — shows the
// note (or a faint placeholder), swaps to a text input on click, and saves
// on blur/Enter. Escape reverts without saving.
function noteSlot(date, id, note) {
  const wrap = document.createElement('span');
  wrap.className = 'tnote-slot';
  paintNoteSlot(wrap, date, id, note);
  return wrap;
}

function paintNoteSlot(wrap, date, id, note) {
  wrap.innerHTML = '';
  const view = document.createElement('span');
  view.className = 'tnote' + (note ? '' : ' empty');
  view.textContent = note || '+ note';
  view.title = 'What did you do?';
  view.onclick = (ev) => {
    ev.stopPropagation();
    const input = document.createElement('input');
    input.className = 'tnote-input';
    input.value = note || '';
    input.placeholder = 'What did you do?';
    wrap.innerHTML = '';
    wrap.appendChild(input);
    input.focus();
    input.select();
    let settled = false;
    const commit = async () => {
      if (settled) return;
      settled = true;
      const val = input.value.trim();
      if (val === (note || '')) return paintNoteSlot(wrap, date, id, note);
      const res = await apiFetch(`/api/time/${date}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: val }),
      });
      if (res.ok) note = (await res.json()).note;
      paintNoteSlot(wrap, date, id, note);
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      else if (e.key === 'Escape') { settled = true; paintNoteSlot(wrap, date, id, note); }
    });
  };
  wrap.appendChild(view);
}

function updateTimeTotal() {
  const onToday = current === todayISO();
  const live = runningTimer && onToday ? elapsedNow() : 0;
  const total = timerBaseTotal + live;
  const label = onToday ? 'today' : 'that day';
  timeTotal.textContent = total > 0 ? `${fmtDur(total)} ${label}` : 'Nothing tracked yet';
}

function elapsedNow() {
  if (!runningTimer) return 0;
  return Math.max(0, (Date.now() - runningTimer.startedAt) / 1000);
}

// Reflect the running-timer state in the button + live counter.
function applyTimerUI() {
  const onToday = current === todayISO();
  if (runningTimer && onToday) {
    timerToggle.innerHTML = STOP_SVG + ' Stop';
    timerToggle.classList.add('running');
    timerElapsed.hidden = false;
    timerProject.value = runningTimer.projectId;
    timerProject.disabled = true;
    startTick();
  } else {
    timerToggle.innerHTML = PLAY_SVG + ' Start';
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
  runningTimer = await apiFetch('/api/timer').then((r) => r.json());
  if (view === 'journal') applyTimerUI();
}

async function toggleTimer() {
  if (runningTimer) {
    await apiFetch('/api/timer/stop', { method: 'POST' });
    await refreshTimer();
    if (current) openDay(current); // refresh entries + total
  } else {
    const projectId = timerProject.value;
    if (!projectId) return showToast('Create a project first to track time against it.');
    const res = await apiFetch('/api/timer/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    const body = await res.json();
    if (res.ok) {
      runningTimer = body;
      if (view === 'journal') applyTimerUI();
    } else {
      showToast(body.error || 'Could not start timer');
    }
  }
}

// `presetParentId`, when given, creates a sub-project directly under that
// parent without asking (used by each parent card's "+ Add sub-project").
// Omit it for a regular "New project", which lets you optionally pick a
// top-level project as parent — nesting only goes two levels deep, so the
// parent picker only ever lists top-level projects.
async function newProject(presetParentId) {
  const fields = [{ key: 'name', label: 'Project name', placeholder: 'e.g. Scolaria', required: true }];
  if (presetParentId === undefined) {
    const topLevel = projects.filter((p) => !p.parentId);
    fields.push({
      key: 'parentId',
      label: 'Parent project (optional)',
      type: 'select',
      options: [{ value: '', label: '— none (top-level) —' }, ...topLevel.map((p) => ({ value: p.id, label: p.name }))],
    });
  }
  const v = await openModal({ title: presetParentId ? 'New sub-project' : 'New project', submitLabel: 'Create', fields });
  if (!v) return;
  const parentId = presetParentId !== undefined ? presetParentId : v.parentId || null;
  const res = await apiFetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: v.name.trim(), parentId }),
  });
  const created = await res.json();
  if (res.ok) {
    await loadProjects();
    timerProject.value = created.id;
  } else showToast(created.error || 'Could not create project');
}

async function logTime() {
  if (!trackableProjects().length) return showToast('Create an active project first.');
  const v = await openModal({
    title: 'Log time',
    submitLabel: 'Add',
    fields: [
      {
        key: 'projectId',
        label: 'Project',
        type: 'select',
        options: orderedProjectRows(trackableProjects()).map(({ project: p, depth }) => ({ value: p.id, label: projectOptionLabel(p, depth) })),
      },
      { key: 'hours', label: 'Hours', inputMode: 'numeric', placeholder: '0', value: '0' },
      { key: 'minutes', label: 'Minutes', inputMode: 'numeric', placeholder: '30', value: '0' },
      { key: 'note', label: 'Note', placeholder: 'What did you do? (optional)' },
    ],
  });
  if (!v) return;
  const seconds = (Number(v.hours) || 0) * 3600 + (Number(v.minutes) || 0) * 60;
  if (seconds <= 0) return showToast('Enter a duration greater than zero.');
  const res = await apiFetch(`/api/time/${current}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: v.projectId, seconds, note: (v.note || '').trim() }),
  });
  if (res.ok) openDay(current);
  else showToast((await res.json()).error || 'Could not log time');
}

async function deleteTimeEntry(date, id) {
  const res = await apiFetch(`/api/time/${date}/${id}`, { method: 'DELETE' });
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
  ov.textContent = 'Overview';
  ov.onclick = showProjectsOverview;
  projectNav.appendChild(ov);

  for (const { project: p, depth } of orderedProjectRows(projects)) {
    const li = document.createElement('li');
    li.dataset.id = p.id;
    if (depth) li.classList.add('nav-child');
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
  closeSidebarOnMobile();
  openProjectId = id;
  const project = projects.find((p) => p.id === id);
  if (!project) return showProjectsOverview();
  timeTitle.textContent = project.name;
  addProjectBtn.hidden = true;
  timeGrand.hidden = true;
  projectOverview.hidden = true;
  projectDetail.hidden = false;
  renderProjectNav();
  const notes = await apiFetch(`/api/projects/${id}/notes`).then((r) => r.json());
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
  await apiFetch(`/api/projects/${openProjectId}/notes`, {
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
  if (!projectOverview.children.length) showSkeleton(projectOverview);
  const data = await apiFetch('/api/time-overview').then((r) => r.json());
  timeGrand.textContent = data.grandTotal ? fmtDur(data.grandTotal) + ' total' : '';
  projectOverview.innerHTML = '';
  if (!data.projects.length) {
    projectOverview.innerHTML = '<div class="habits-empty">No projects yet. Create one to start tracking time.</div>';
    return;
  }

  const childrenOf = new Map();
  for (const p of data.projects) {
    if (!p.parentId) continue;
    if (!childrenOf.has(p.parentId)) childrenOf.set(p.parentId, []);
    childrenOf.get(p.parentId).push(p);
  }
  const topLevel = data.projects.filter((p) => !p.parentId);
  const topLevelOptions = topLevel.map((p) => ({ id: p.id, name: p.name }));
  const max = Math.max(...topLevel.map((p) => p.rollup.total), 1);

  for (const status of STATUS_ORDER) {
    const inGroup = topLevel.filter((p) => (p.status || 'active') === status).sort((a, b) => b.rollup.total - a.rollup.total);
    if (!inGroup.length) continue;

    const header = document.createElement('div');
    header.className = 'time-project-total';
    header.textContent = `${STATUS_LABELS[status]} · ${inGroup.length}`;
    projectOverview.appendChild(header);

    for (const p of inGroup) {
      const kids = (childrenOf.get(p.id) || []).sort((a, b) => b.rollup.total - a.rollup.total);
      projectOverview.appendChild(projectCard(p, max, data.currentCycle, { topLevelOptions, hasChildren: kids.length > 0 }));
      for (const kid of kids) projectOverview.appendChild(projectCard(kid, max, data.currentCycle, { child: true, topLevelOptions }));

      const addSub = document.createElement('button');
      addSub.className = 'tp-add-sub';
      addSub.textContent = '+ Add sub-project';
      addSub.onclick = async () => { await newProject(p.id); renderProjectNav(); loadTimeOverview(); };
      projectOverview.appendChild(addSub);
    }
  }
}

function projectCard(p, max, currentCycle, opts = {}) {
  const stats = p.rollup;
  const card = document.createElement('div');
  card.className = 'tp-card' + (p.status === 'archive' ? ' archived' : '') + (opts.child ? ' tp-child' : '');

  const top = document.createElement('div');
  top.className = 'tp-top';
  const name = document.createElement('input');
  name.className = 'tp-name';
  name.value = p.name;
  name.onchange = () => renameProject(p.id, name.value);
  top.appendChild(name);
  top.insertAdjacentHTML('beforeend', `<span class="tp-total">${fmtDur(stats.total)}</span>`);

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

  // parent selector — hidden once a project has sub-projects of its own,
  // since nesting only goes two levels deep.
  if (!opts.hasChildren) {
    const parentSel = document.createElement('select');
    parentSel.className = 'tp-parent';
    parentSel.title = 'Parent project';
    parentSel.insertAdjacentHTML('beforeend', '<option value="">— top-level —</option>');
    for (const t of opts.topLevelOptions) {
      if (t.id === p.id) continue;
      const o = document.createElement('option');
      o.value = t.id;
      o.textContent = t.name;
      if (p.parentId === t.id) o.selected = true;
      parentSel.appendChild(o);
    }
    parentSel.onchange = () => setProjectParent(p.id, parentSel.value || null);
    top.appendChild(parentSel);
  }

  const del = document.createElement('button');
  del.className = 'tp-del';
  del.innerHTML = TRASH_SVG;
  del.title = 'Delete project';
  del.onclick = () => removeProject(p.id, p.name, card);
  top.appendChild(del);
  card.appendChild(top);

  const pct = Math.round((stats.total / max) * 100);
  card.insertAdjacentHTML('beforeend', `<div class="bar"><span style="width:${pct}%"></span></div>`);

  const cycleStat = currentCycle ? `<span><b>${fmtDur(stats.cycle)}</b> in ${esc(currentCycle.name)}</span>` : '';
  card.insertAdjacentHTML(
    'beforeend',
    `<div class="tp-stats">
      <span><b>${fmtDur(stats.today)}</b> today</span>
      <span><b>${fmtDur(stats.last7)}</b> last 7 days</span>
      ${cycleStat}
    </div>`
  );
  return card;
}

async function setProjectParent(id, parentId) {
  const res = await apiFetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentId }),
  });
  if (res.ok) {
    await loadProjects();
    renderProjectNav();
    loadTimeOverview();
  } else {
    const body = await res.json().catch(() => ({}));
    showToast(body.error || 'Could not change parent project');
    loadTimeOverview(); // revert the select back to the actual state
  }
}

async function setProjectStatus(id, status) {
  const res = await apiFetch(`/api/projects/${id}`, {
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
  const res = await apiFetch(`/api/projects/${id}`, {
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

async function removeProject(id, name, row) {
  const ok = await openConfirm({
    title: 'Delete project',
    message: `Delete project "${name}"? Its logged time will no longer be attributed to it.`,
  });
  if (!ok) return;
  deleteWithUndo(row, `Project "${name}"`, async () => {
    const res = await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (openProjectId === id) openProjectId = null;
      await loadProjects();
      renderProjectNav();
      loadTimeOverview();
    }
  });
}

// --- habits -----------------------------------------------------------------
function renderHabits(habits, values) {
  habitList.innerHTML = '';
  addHabitBtn.hidden = !editable; // can't manage habits from a future date's page
  if (!habits.length) {
    habitList.innerHTML = '<div class="habits-empty">No habits yet. Add one to start tracking.</div>';
    return;
  }
  const ordered = habits.slice();
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
      del.onclick = () => deleteHabit(h.id, h.name, row);
      row.appendChild(del);
    }
    habitList.appendChild(row);
  }
}

async function saveHabit(habitId, value) {
  statusEl.textContent = 'Saving…';
  const res = await apiFetch(`/api/habit/${current}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habitId, value }),
  });
  statusEl.textContent = res.ok ? 'Saved ✓' : '⚠ Could not save habit';
  if (!res.ok) showToast('Could not save habit');
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
  const res = await apiFetch('/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: v.name.trim(), type: v.type, unit: v.unit }),
  });
  if (res.ok) refresh();
  else showToast('Could not add habit');
}

async function deleteHabit(id, name, row) {
  const ok = await openConfirm({
    title: 'Delete habit',
    message: `Delete habit "${name}"? Past values stay on disk but won't be shown.`,
  });
  if (!ok) return;
  deleteWithUndo(row, `Habit "${name}"`, async () => {
    const res = await apiFetch(`/api/habits/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (openHabitId === id) openHabitId = null; // fall back to overview
      refresh();
    }
  });
}

// re-render whichever view is currently active
function refresh() {
  if (view === 'habits') loadHabitsTab();
  else openDay(current);
}

function okrTag(h) {
  return h.okr ? ` <span class="okr-tag" title="${esc(h.okr.cycleName || '')}">${esc(h.okr.title)}</span>` : '';
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

// Promise-based replacement for window.confirm(), styled like openModal()'s
// sheet instead of the native (unstylable, blocking) browser dialog.
function openConfirm({ title, message, confirmLabel = 'Delete', danger = true }) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmOk.textContent = confirmLabel;
    confirmOk.classList.toggle('danger-btn', danger);
    confirmOk.classList.toggle('primary-btn', !danger);

    function close(result) {
      confirmOverlay.hidden = true;
      document.removeEventListener('keydown', onKey);
      resolve(result);
    }
    function onKey(e) {
      if (e.key === 'Escape') close(false);
      else if (e.key === 'Enter') close(document.activeElement === confirmOk);
    }

    confirmOk.onclick = () => close(true);
    confirmCancel.onclick = () => close(false);
    confirmOverlay.onclick = (e) => { if (e.target === confirmOverlay) close(false); };
    document.addEventListener('keydown', onKey);

    confirmOverlay.hidden = false;
    confirmCancel.focus(); // destructive action isn't the default — Enter/Space needs an explicit Tab first
  });
}

// Lightweight non-blocking replacement for window.alert() — stacks in the
// corner and self-dismisses instead of halting the UI for a click.
function showToast(message, { type = 'error' } = {}) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.onclick = () => toast.remove();
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

const UNDO_DELETE_MS = 6000;

// Delays a destructive action's actual API call until this window passes,
// showing a dismissible "<label> deleted — Undo" toast in the meantime.
// The row is only marked pending (dimmed, controls disabled), never removed
// outright, since nothing is actually deleted server-side until `commit`
// fires — clicking Undo just cancels that timer and restores the row.
// Known limitation: if something else rebuilds this row's list from the
// server before the window passes (e.g. adding a sibling item), the pending
// row reverts to normal since the rebuild doesn't know about it, but the
// timer still fires — an accepted edge case for a lightweight client-only
// undo with no server-side soft-delete.
function deleteWithUndo(row, label, commit) {
  row.classList.add('pending-delete');
  const controls = [...row.querySelectorAll('input, button, select, textarea')];
  const wasDisabled = controls.map((el) => el.disabled);
  controls.forEach((el) => (el.disabled = true));

  const toast = document.createElement('div');
  toast.className = 'toast toast-undo';
  const text = document.createElement('span');
  text.textContent = `${label} deleted`;
  toast.appendChild(text);
  const undoBtn = document.createElement('button');
  undoBtn.type = 'button';
  undoBtn.className = 'toast-undo-btn';
  undoBtn.textContent = 'Undo';
  toast.appendChild(undoBtn);
  toastContainer.appendChild(toast);

  const timer = setTimeout(() => {
    toast.remove();
    commit();
  }, UNDO_DELETE_MS);

  undoBtn.onclick = () => {
    clearTimeout(timer);
    toast.remove();
    row.classList.remove('pending-delete');
    controls.forEach((el, i) => (el.disabled = wasDisabled[i]));
  };
}

// Shimmering placeholder for a view's first async load — callers only show
// it when the container is still empty, so a refresh after an edit (rename,
// delete, ...) finds real content already in place and never flickers.
function showSkeleton(container, rows = 4) {
  container.innerHTML = Array.from({ length: rows }, () => '<div class="skeleton-row"></div>').join('');
}

function scheduleSave() {
  statusEl.textContent = 'Editing…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 600);
}

async function save() {
  if (!current) return;
  try {
    const res = await apiFetch(`/api/entry/${current}`, {
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
    showToast(e.message);
  }
}

// --- weekly notes -----------------------------------------------------------
async function openWeek(ws) {
  const note = await apiFetch(`/api/week-note/${ws}`).then((r) => r.json());
  currentWeek = note.weekStart;
  currentMode = 'week';
  weekEditable = note.editable;
  // switch to week mode
  dayTabsNav.hidden = true;
  for (const key of Object.keys(dayPages)) dayPages[key].hidden = true;
  readonlyNote.hidden = true;
  weekSection.hidden = false;
  dayCycle.hidden = true;
  entryDate.textContent = `Kalenderwoche ${isoWeekNumber(note.weekStart)}`;
  entryDate.title = fmtWeekShort(note.weekStart, note.weekEnd);
  statusEl.textContent = note.editable ? '' : 'Read-only';
  weekEditor.value = note.content;
  weekEditor.disabled = !note.editable;
  weekReadonlyNote.hidden = note.editable;
  renderWeekBackdrop();
  autoGrowWeekEditor();
  weekReflexionEditor.value = note.reflexion || '';
  weekReflexionEditor.disabled = !note.editable;
  weekReflexionReadonlyNote.hidden = note.editable;
  renderWeekReflexionBackdrop();
  autoGrowWeekReflexionEditor();
  renderWeekTime(note);
  renderWeekHabits(note);
  renderWeekLearnings(note);
  ensureWeekVisible(note.weekStart);
  switchWeekPage(weekPage);
}

// switch between Time / Habits / Notes / Reflexion / Learnings within a week
function switchWeekPage(page) {
  weekPage = page;
  for (const key of Object.keys(weekPages)) weekPages[key].hidden = key !== page;
  weekTabs.forEach((t) => t.classList.toggle('active', t.dataset.page === page));
  if (page === 'notes' && weekEditable) weekEditor.focus();
  if (page === 'reflexion' && weekEditable) weekReflexionEditor.focus();
}
weekTabs.forEach((t) => (t.onclick = () => switchWeekPage(t.dataset.page)));

// read-only rollup: per-project time totals across the week's 7 days
function renderWeekTime(note) {
  weekTimeSummaryEl.innerHTML = '';
  if (!note.time.total) {
    weekTimeSummaryEl.innerHTML = '<div class="habits-empty">Nothing tracked this week.</div>';
    return;
  }
  const total = document.createElement('div');
  total.className = 'time-project-total';
  total.innerHTML = `<span class="tproj">Total</span><span class="tdur">${fmtDur(note.time.total)}</span>`;
  weekTimeSummaryEl.appendChild(total);

  for (const p of note.time.projects) {
    const header = document.createElement('div');
    header.className = 'time-project-total';
    header.innerHTML = `<span class="tproj">${esc(p.projectName)}</span><span class="tdur">${fmtDur(p.seconds)}</span>`;
    weekTimeSummaryEl.appendChild(header);

    for (const e of p.entries) {
      const row = document.createElement('div');
      row.className = 'time-entry sub';
      row.innerHTML =
        `<span class="tnote-slot"><span class="week-time-note">${esc(e.note || '—')}</span></span>` +
        `<span class="tdur">${fmtDur(e.seconds)}</span>`;
      weekTimeSummaryEl.appendChild(row);
    }
  }
}

// read-only rollup: each habit's values across the week's 7 days (Mon → Sun)
function renderWeekHabits(note) {
  weekHabitsSummaryEl.innerHTML = '';
  if (!note.habits.length) {
    weekHabitsSummaryEl.innerHTML = '<div class="habits-empty">No habits yet.</div>';
    return;
  }
  const dates = [];
  for (let i = 0; i < 7; i++) dates.push(addClientDays(note.weekStart, i));

  for (const h of note.habits) {
    const card = document.createElement('div');
    card.className = 'ov-card';
    card.insertAdjacentHTML('beforeend', `<div class="ov-top"><span class="ov-name" style="border:none;pointer-events:none">${esc(h.name)}</span></div>`);

    const grid = document.createElement('div');
    grid.className = 'ov-grid';
    for (const date of dates) {
      const dd = new Date(date + 'T00:00:00');
      const v = h.values[date];
      const done = h.type === 'check' ? v === true : v != null && String(v).trim() !== '';
      const cell = document.createElement('div');
      cell.className = 'ov-cell' + (done ? ' done' : '');
      cell.title = date;
      const label = dd.toLocaleDateString(undefined, { weekday: 'short' });
      const shown = h.type === 'value' && done ? `<span class="v">${esc(String(v))}</span>` : done ? '✓' : '·';
      cell.innerHTML = `<span class="d">${label}</span>${shown}`;
      grid.appendChild(cell);
    }
    card.appendChild(grid);
    weekHabitsSummaryEl.appendChild(card);
  }
}

// read-only rollup: each day's learnings text, Monday → Sunday
function renderWeekLearnings(note) {
  weekLearningsSummaryEl.innerHTML = '';
  const withText = note.learnings.filter((l) => l.content && l.content.trim());
  if (!withText.length) {
    weekLearningsSummaryEl.innerHTML = '<div class="habits-empty">No learnings logged this week.</div>';
    return;
  }
  for (const l of withText) {
    const dd = new Date(l.date + 'T00:00:00');
    const block = document.createElement('div');
    block.className = 'week-learning-block';
    block.innerHTML = `<h4>${esc(dd.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }))}</h4><div class="week-learning-text"></div>`;
    block.querySelector('.week-learning-text').textContent = l.content;
    weekLearningsSummaryEl.appendChild(block);
  }
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
  const res = await apiFetch(`/api/week-note/${currentWeek}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: weekEditor.value }),
  });
  if (res.ok) {
    statusEl.textContent = 'Saved ✓';
    loadDays(); // refresh dots
  } else {
    statusEl.textContent = '⚠ Could not save';
    showToast('Could not save');
  }
}

weekEditor.addEventListener('input', scheduleWeekSave);
weekEditor.addEventListener('blur', () => { clearTimeout(weekSaveTimer); flushWeekSave(); });

function renderWeekReflexionBackdrop() {
  weekReflexionBackdrop.innerHTML = highlightNotes(weekReflexionEditor.value, caretLineOf(weekReflexionEditor));
}
function autoGrowWeekReflexionEditor() {
  weekReflexionEditor.style.height = 'auto';
  weekReflexionEditor.style.height = weekReflexionEditor.scrollHeight + 'px';
  keepCaretInView(weekReflexionEditor);
}
weekReflexionEditor.addEventListener('input', renderWeekReflexionBackdrop);
weekReflexionEditor.addEventListener('input', autoGrowWeekReflexionEditor);
weekReflexionEditor.addEventListener('input', scheduleWeekReflexionSave);
weekReflexionEditor.addEventListener('click', renderWeekReflexionBackdrop);
weekReflexionEditor.addEventListener('keyup', renderWeekReflexionBackdrop);
weekReflexionEditor.addEventListener('focus', renderWeekReflexionBackdrop);
weekReflexionEditor.addEventListener('blur', renderWeekReflexionBackdrop);
weekReflexionEditor.addEventListener('blur', () => { clearTimeout(weekReflexionSaveTimer); flushWeekReflexionSave(); });

function scheduleWeekReflexionSave() {
  statusEl.textContent = 'Editing…';
  clearTimeout(weekReflexionSaveTimer);
  weekReflexionSaveTimer = setTimeout(flushWeekReflexionSave, 600);
}

async function flushWeekReflexionSave() {
  if (!currentWeek || !weekEditable) return;
  const res = await apiFetch(`/api/week-reflexion/${currentWeek}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: weekReflexionEditor.value }),
  });
  statusEl.textContent = res.ok ? 'Saved ✓' : '⚠ Could not save';
  if (!res.ok) showToast('Could not save');
}

// --- view switching ---------------------------------------------------------
async function switchView(next) {
  closeSidebarOnMobile();
  view = next;
  journalView.hidden = next !== 'journal';
  habitsView.hidden = next !== 'habits';
  cyclesView.hidden = next !== 'cycles';
  timeView.hidden = next !== 'time';
  checklistView.hidden = next !== 'checklist';
  lifeView.hidden = next !== 'life';
  goalsView.hidden = next !== 'goals';
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
  if (next === 'checklist') await loadChecklists();
  if (next === 'life') await openLife();
  if (next === 'goals') await loadYearGoals();
}
navTabs.forEach((t) => (t.onclick = () => switchView(t.dataset.view)));

// --- life (Recap calendar) ---------------------------------------------------
async function loadRecaps() {
  const list = await apiFetch('/api/recaps').then((r) => r.json());
  recapsCache = new Map(list.map((r) => [r.date, r.text]));
}

function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function openLife() {
  if (!recapsCache) {
    showSkeleton(lifeCalendar, 5);
    await loadRecaps();
  }
  if (!lifeMonth) lifeMonth = todayISO().slice(0, 7);
  if (!lifeYear) lifeYear = todayISO().slice(0, 4);
  renderLife();
}

function switchLifeMode(mode) {
  lifeViewMode = mode;
  lifeModeTabs.forEach((t) => t.classList.toggle('active', t.dataset.mode === mode));
  renderLife();
}
lifeModeTabs.forEach((t) => (t.onclick = () => switchLifeMode(t.dataset.mode)));

function renderLife() {
  if (lifeViewMode === 'year') renderLifeYear();
  else renderLifeMonth();
}

// jump into the Journal view, open the day, and land on its Recap tab
async function openDayRecap(date) {
  await switchView('journal');
  await openDay(date);
  switchDayPage('sentence');
}

// one line per day between start and end (inclusive), scrollable; optionally
// inserts a sticky month divider whenever the month changes (year mode)
function renderLifeRows(start, end, { showMonthDividers = false } = {}) {
  lifeCalendar.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'life-year-list';

  const today = todayISO();
  let cursor = start;
  let lastMonth = null;
  while (cursor <= end) {
    const dd = new Date(cursor + 'T00:00:00');
    if (showMonthDividers) {
      const monthKey = cursor.slice(0, 7);
      if (monthKey !== lastMonth) {
        lastMonth = monthKey;
        const divider = document.createElement('div');
        divider.className = 'life-month-divider';
        divider.textContent = dd.toLocaleDateString(undefined, { month: 'long' });
        list.appendChild(divider);
      }
    }
    const recap = recapsCache.get(cursor);
    const isFuture = cursor > today;
    const row = document.createElement('div');
    row.className = 'life-year-row' + (cursor === today ? ' today' : '') + (isFuture ? ' future' : '') + (recap ? ' has-recap' : '');
    const label = dd.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    row.innerHTML =
      `<span class="life-year-date">${esc(label)}</span>` +
      `<span class="life-year-text">${recap ? esc(recap) : ''}</span>`;
    if (!isFuture) row.onclick = () => openDayRecap(cursor);
    list.appendChild(row);
    cursor = addClientDays(cursor, 1);
  }
  lifeCalendar.appendChild(list);
}

function renderLifeMonth() {
  const [y, m] = lifeMonth.split('-').map(Number);
  lifeLabel.textContent = new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(y, m, 0).getDate();
  renderLifeRows(`${lifeMonth}-01`, `${lifeMonth}-${String(daysInMonth).padStart(2, '0')}`);
}

function renderLifeYear() {
  lifeLabel.textContent = lifeYear;
  renderLifeRows(`${lifeYear}-01-01`, `${lifeYear}-12-31`, { showMonthDividers: true });
}

lifePrev.onclick = () => {
  if (lifeViewMode === 'year') lifeYear = String(Number(lifeYear) - 1);
  else lifeMonth = shiftMonth(lifeMonth, -1);
  renderLife();
};
lifeNext.onclick = () => {
  if (lifeViewMode === 'year') lifeYear = String(Number(lifeYear) + 1);
  else lifeMonth = shiftMonth(lifeMonth, 1);
  renderLife();
};
lifeTodayBtn.onclick = () => {
  lifeMonth = todayISO().slice(0, 7);
  lifeYear = todayISO().slice(0, 4);
  renderLife();
};

// --- checklists (Life > Checklist tab) --------------------------------------
async function loadChecklists() {
  const list = await apiFetch('/api/checklists').then((r) => r.json());
  renderChecklists(list);
}

function renderChecklists(list) {
  checklistList.innerHTML = '';
  if (!list.length) {
    checklistList.innerHTML =
      '<div class="habits-empty">No checklists yet. Checklists reset every day — click “+ New checklist” to add one, e.g. “Evening routine”.</div>';
    return;
  }
  for (const cl of list) checklistList.appendChild(buildChecklistCard(cl));
}

function buildChecklistCard(cl) {
  const card = document.createElement('div');
  card.className = 'ov-card checklist-card';

  const top = document.createElement('div');
  top.className = 'ov-top';
  const nameInp = document.createElement('input');
  nameInp.className = 'ov-name';
  nameInp.value = cl.name;
  nameInp.onchange = () => renameChecklist(cl.id, nameInp.value);
  top.appendChild(nameInp);
  top.insertAdjacentHTML('beforeend', '<span class="ov-spacer"></span>');
  const del = document.createElement('button');
  del.className = 'ov-del';
  del.innerHTML = TRASH_SVG;
  del.title = 'Delete checklist';
  del.onclick = () => removeChecklist(cl.id, cl.name, card);
  top.appendChild(del);
  card.appendChild(top);

  if (cl.items.length) {
    const done = cl.items.filter((i) => i.checked).length;
    card.insertAdjacentHTML('beforeend', `<div class="checklist-progress">${done} / ${cl.items.length} done today</div>`);
  }

  for (const item of cl.items) card.appendChild(buildChecklistItemRow(cl.id, item));

  const addRow = document.createElement('div');
  addRow.className = 'checklist-add-row';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '+ Add item';
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      addChecklistItem(cl.id, input.value.trim());
      input.value = '';
    }
  });
  addRow.appendChild(input);
  card.appendChild(addRow);

  // Drag-and-drop reordering: each row is draggable (see buildChecklistItemRow);
  // dragover on a row live-reorders the DOM so the dragged row visibly swaps
  // in as you pass over other rows, and dragover on the card itself (only
  // reached when not over a row, i.e. the gap below the last item) appends
  // it as the last item. Order is only persisted once on dragend.
  card.addEventListener('dragover', (e) => {
    const dragging = card.querySelector('.checklist-item.dragging');
    if (!dragging) return;
    e.preventDefault();
    if (e.target.closest('.checklist-item')) return; // row's own listener already handled it
    card.insertBefore(dragging, addRow);
  });

  return card;
}

function buildChecklistItemRow(checklistId, item) {
  const row = document.createElement('div');
  row.className = 'habit-row checklist-item';
  row.dataset.itemId = item.id;

  // Only the grip handle is draggable — not the whole row — so a click on
  // the checkbox or delete button can never be mistaken for a drag.
  const grip = document.createElement('span');
  grip.className = 'drag-handle';
  grip.draggable = true;
  grip.innerHTML = GRIP_SVG;
  row.appendChild(grip);

  const control = document.createElement('div');
  control.className = 'control control-check';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = item.checked;
  cb.onchange = () => toggleChecklistItem(item.id, cb.checked);
  control.appendChild(cb);
  row.appendChild(control);
  const nameInp = document.createElement('input');
  nameInp.className = 'name';
  nameInp.value = item.text;
  nameInp.onchange = () => renameChecklistItem(checklistId, item.id, nameInp.value);
  row.appendChild(nameInp);
  const delItem = document.createElement('button');
  delItem.className = 'del';
  delItem.textContent = '✕';
  delItem.title = 'Delete item';
  delItem.onclick = () => removeChecklistItem(checklistId, item.id, item.text, row);
  row.appendChild(delItem);

  grip.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id); // Firefox requires data to be set for drag to start
    row.classList.add('dragging');
  });
  grip.addEventListener('dragend', () => {
    row.classList.remove('dragging');
    const list = [...row.parentNode.querySelectorAll('.checklist-item')];
    reorderChecklistItems(checklistId, list.map((r) => r.dataset.itemId));
  });
  row.addEventListener('dragover', (e) => {
    const dragging = row.parentNode.querySelector('.checklist-item.dragging');
    if (!dragging || dragging === row) return;
    e.preventDefault();
    const rect = row.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    row.parentNode.insertBefore(dragging, before ? row : row.nextSibling);
  });

  return row;
}

async function toggleChecklistItem(itemId, checked) {
  await apiFetch('/api/checklist-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, checked }),
  });
  loadChecklists();
}

async function addChecklist() {
  const v = await openModal({
    title: 'New checklist',
    submitLabel: 'Create',
    fields: [{ key: 'name', label: 'Name', placeholder: 'e.g. Evening routine', required: true }],
  });
  if (!v) return;
  const res = await apiFetch('/api/checklists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: v.name.trim() }),
  });
  if (res.ok) loadChecklists();
  else showToast((await res.json()).error || 'Could not create checklist');
}
addChecklistBtn.onclick = addChecklist;

async function renameChecklist(id, name) {
  const res = await apiFetch(`/api/checklists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (res.ok) loadChecklists();
}

async function removeChecklist(id, name, card) {
  const ok = await openConfirm({
    title: 'Delete checklist',
    message: `Delete checklist "${name}"? Its items will be removed too.`,
  });
  if (!ok) return;
  deleteWithUndo(card, `Checklist "${name}"`, async () => {
    const res = await apiFetch(`/api/checklists/${id}`, { method: 'DELETE' });
    if (res.ok) loadChecklists();
  });
}

async function addChecklistItem(checklistId, text) {
  const res = await apiFetch(`/api/checklists/${checklistId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (res.ok) loadChecklists();
  else showToast((await res.json()).error || 'Could not add item');
}

async function renameChecklistItem(checklistId, itemId, text) {
  const res = await apiFetch(`/api/checklists/${checklistId}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (res.ok) loadChecklists();
}

async function removeChecklistItem(checklistId, itemId, text, row) {
  deleteWithUndo(row, `"${text}"`, async () => {
    const res = await apiFetch(`/api/checklists/${checklistId}/items/${itemId}`, { method: 'DELETE' });
    if (res.ok) loadChecklists();
  });
}

// The DOM is already in its new order (buildChecklistItemRow's dragover
// handlers moved rows live) — this just persists it, so no reload/rebuild.
async function reorderChecklistItems(checklistId, itemIds) {
  const res = await apiFetch(`/api/checklists/${checklistId}/items/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemIds }),
  });
  if (!res.ok) loadChecklists(); // fell out of sync with the server — rebuild from truth
}

// --- cycles -----------------------------------------------------------------
async function loadCycles(selectId) {
  if (!cycleList.children.length) showSkeleton(cycleList, 3);
  const cycles = await apiFetch('/api/cycles').then((r) => r.json());
  cycleList.innerHTML = '';
  if (!cycles.length) {
    cycleList.innerHTML = '<li style="cursor:default;color:var(--muted)">No cycles yet. A cycle bundles a few weeks around its own rules and OKRs — click “+ New cycle” to start one.</li>';
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
  closeSidebarOnMobile();
  const c = await apiFetch(`/api/cycle/${id}`).then((r) => r.json());
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
  renderCycleTimeProgress(c);
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
    goalList.innerHTML = '<div class="okr-habits"><span class="none">No goals yet. Unlike the OKRs below, a goal tracks one number against a target — add one like “Workout → 25”.</span></div>';
    return;
  }
  for (const g of c.goals) {
    const item = document.createElement('div');
    item.className = 'goal-item';

    const unit = g.unit ? ' ' + esc(g.unit) : '';
    const top = document.createElement('div');
    top.className = 'goal-top';
    top.insertAdjacentHTML('beforeend', `<span class="goal-name">${esc(g.label || g.habitName)}</span>`);
    top.insertAdjacentHTML('beforeend', `<span class="goal-count">${g.current}${unit} / </span>`);

    const targetInp = document.createElement('input');
    targetInp.className = 'goal-edit-target';
    targetInp.type = 'text';
    targetInp.inputMode = 'decimal';
    targetInp.value = g.target;
    targetInp.disabled = !c.editable;
    targetInp.title = 'Target';
    targetInp.onchange = () => editGoal(g.id, { target: targetInp.value }, c.id);
    top.appendChild(targetInp);
    if (unit) top.insertAdjacentHTML('beforeend', `<span class="goal-count">${unit}</span>`);

    if (c.editable) {
      const del = document.createElement('button');
      del.className = 'goal-del';
      del.innerHTML = TRASH_SVG;
      del.title = 'Delete goal';
      del.onclick = () => deleteGoal_(g.id, g.label || g.habitName, c.id, item);
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
  const [habits, projects] = await Promise.all([
    apiFetch('/api/habits').then((r) => r.json()),
    apiFetch('/api/projects').then((r) => r.json()),
  ]);
  if (!habits.length && !projects.length) return showToast('Create a habit or project first, then set a goal for it.');
  const v = await openModal({
    title: 'New goal',
    submitLabel: 'Add goal',
    fields: [
      {
        key: 'source',
        label: 'Based on',
        type: 'select',
        options: [
          { value: 'habit', label: 'Habit' },
          { value: 'time', label: 'Time tracked (project)' },
        ],
      },
      {
        key: 'habitId',
        label: 'Habit',
        type: 'select',
        options: habits.map((h) => ({ value: h.id, label: h.name + (h.type === 'value' ? ` (${h.unit || 'value'})` : '') })),
        showIf: (x) => x.source !== 'time',
      },
      {
        key: 'projectId',
        label: 'Project',
        type: 'select',
        options: orderedProjectRows(projects).map(({ project: p, depth }) => ({ value: p.id, label: projectOptionLabel(p, depth) })),
        showIf: (x) => x.source === 'time',
      },
      {
        key: 'target',
        label: 'Target',
        inputMode: 'decimal',
        placeholder: 'e.g. 25 (or hours, for time goals)',
        required: true,
      },
    ],
  });
  if (!v) return;
  if (!(Number(v.target) > 0)) return showToast('Target must be a positive number.');
  const isTime = v.source === 'time';
  if (isTime && !projects.length) return showToast('Create a project first, then set a time goal for it.');
  if (!isTime && !habits.length) return showToast('Create a habit first, then set a goal for it.');
  const label = isTime
    ? (projects.find((p) => p.id === v.projectId) || {}).name || ''
    : (habits.find((h) => h.id === v.habitId) || {}).name || '';
  const body = { cycleId: currentCycle, target: v.target, label };
  if (isTime) body.projectId = v.projectId;
  else body.habitId = v.habitId;
  const res = await apiFetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.ok) loadCycles(currentCycle);
  else showToast((await res.json()).error || 'Could not add goal');
}

async function editGoal(id, patch, cycleId) {
  const res = await apiFetch(`/api/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (res.ok) loadCycles(cycleId);
}

async function deleteGoal_(id, name, cycleId, row) {
  const ok = await openConfirm({ title: 'Delete goal', message: `Delete goal "${name}"?` });
  if (!ok) return;
  deleteWithUndo(row, `Goal "${name}"`, async () => {
    const res = await apiFetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (res.ok) loadCycles(cycleId);
  });
}

// --- yearly goals -----------------------------------------------------------
let goalsYear = null;
let goalsCycleId = null;

async function loadYearGoals() {
  if (!goalsYear) goalsYear = Number(todayISO().slice(0, 4));
  await openYearGoals();
}

async function openYearGoals() {
  const y = await apiFetch(`/api/years/${goalsYear}/goals`).then((r) => r.json());
  goalsCycleId = y.cycleId;
  goalsYearLabel.textContent = y.year;
  goalsTodayBtn.hidden = y.year === Number(todayISO().slice(0, 4));
  renderYearOverallProgress(y);
  renderYearGoalList(y);
}

function renderYearOverallProgress(y) {
  if (y.overall == null) {
    goalsOverallProgress.innerHTML = '';
    return;
  }
  goalsOverallProgress.innerHTML =
    `<div class="cycle-progress-label"><span>Overall progress</span><span>${y.overall}%</span></div>` +
    `<div class="bar big${y.overall >= 100 ? ' done' : ''}"><span style="width:${y.overall}%"></span></div>`;
}

function renderYearGoalList(y) {
  yearGoalList.innerHTML = '';
  if (!y.goals.length) {
    yearGoalList.innerHTML = '<div class="okr-habits"><span class="none">No goals yet for this year. These are separate from your cycle OKRs — add a longer-term one below.</span></div>';
    return;
  }
  for (const g of y.goals) {
    const item = document.createElement('div');
    item.className = 'goal-item';

    if (g.kind === 'manual') {
      const top = document.createElement('div');
      top.className = 'goal-top habit-row';
      const control = document.createElement('div');
      control.className = 'control control-check';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = g.achieved;
      cb.onchange = () => editYearGoal(g.id, { achieved: cb.checked });
      control.appendChild(cb);
      top.appendChild(control);
      top.insertAdjacentHTML('beforeend', `<span class="goal-name">${esc(g.label)}</span>`);

      const del = document.createElement('button');
      del.className = 'goal-del';
      del.innerHTML = TRASH_SVG;
      del.title = 'Delete goal';
      del.onclick = () => deleteYearGoal_(g.id, g.label, item);
      top.appendChild(del);

      item.appendChild(top);
      item.insertAdjacentHTML('beforeend', `<div class="bar${g.achieved ? ' done' : ''}"><span style="width:${g.achieved ? 100 : 0}%"></span></div>`);
      yearGoalList.appendChild(item);
      continue;
    }

    const unit = g.unit ? ' ' + esc(g.unit) : '';
    const top = document.createElement('div');
    top.className = 'goal-top';
    top.insertAdjacentHTML('beforeend', `<span class="goal-name">${esc(g.label || g.habitName)}</span>`);
    top.insertAdjacentHTML('beforeend', `<span class="goal-count">${g.current}${unit} / </span>`);

    const targetInp = document.createElement('input');
    targetInp.className = 'goal-edit-target';
    targetInp.type = 'text';
    targetInp.inputMode = 'decimal';
    targetInp.value = g.target;
    targetInp.title = 'Target';
    targetInp.onchange = () => editYearGoal(g.id, { target: targetInp.value });
    top.appendChild(targetInp);
    if (unit) top.insertAdjacentHTML('beforeend', `<span class="goal-count">${unit}</span>`);

    const del = document.createElement('button');
    del.className = 'goal-del';
    del.innerHTML = TRASH_SVG;
    del.title = 'Delete goal';
    del.onclick = () => deleteYearGoal_(g.id, g.label || g.habitName, item);
    top.appendChild(del);

    item.appendChild(top);
    item.insertAdjacentHTML('beforeend', `<div class="bar${g.pct >= 100 ? ' done' : ''}"><span style="width:${g.pct}%"></span></div>`);
    yearGoalList.appendChild(item);
  }
}

async function addYearGoal() {
  if (!goalsCycleId) return;
  const [habits, projects] = await Promise.all([
    apiFetch('/api/habits').then((r) => r.json()),
    apiFetch('/api/projects').then((r) => r.json()),
  ]);
  const v = await openModal({
    title: 'New yearly goal',
    submitLabel: 'Add goal',
    fields: [
      {
        key: 'source',
        label: 'Based on',
        type: 'select',
        options: [
          { value: 'habit', label: 'Habit' },
          { value: 'time', label: 'Time tracked (project)' },
          { value: 'manual', label: 'Yes/No outcome' },
        ],
      },
      {
        key: 'habitId',
        label: 'Habit',
        type: 'select',
        options: habits.map((h) => ({ value: h.id, label: h.name + (h.type === 'value' ? ` (${h.unit || 'value'})` : '') })),
        showIf: (x) => x.source !== 'time' && x.source !== 'manual',
      },
      {
        key: 'projectId',
        label: 'Project',
        type: 'select',
        options: orderedProjectRows(projects).map(({ project: p, depth }) => ({ value: p.id, label: projectOptionLabel(p, depth) })),
        showIf: (x) => x.source === 'time',
      },
      {
        key: 'label',
        label: 'Goal',
        placeholder: 'e.g. Run a marathon',
        showIf: (x) => x.source === 'manual',
        required: true,
      },
      {
        key: 'target',
        label: 'Target',
        inputMode: 'decimal',
        placeholder: 'e.g. 25 (or hours, for time goals)',
        required: true,
        showIf: (x) => x.source !== 'manual',
      },
    ],
  });
  if (!v) return;

  const body = { cycleId: goalsCycleId };
  if (v.source === 'manual') {
    body.label = v.label;
  } else {
    if (!(Number(v.target) > 0)) return showToast('Target must be a positive number.');
    const isTime = v.source === 'time';
    if (isTime && !projects.length) return showToast('Create a project first, then set a time goal for it.');
    if (!isTime && !habits.length) return showToast('Create a habit first, then set a goal for it.');
    body.target = v.target;
    body.label = isTime ? (projects.find((p) => p.id === v.projectId) || {}).name || '' : (habits.find((h) => h.id === v.habitId) || {}).name || '';
    if (isTime) body.projectId = v.projectId;
    else body.habitId = v.habitId;
  }

  const res = await apiFetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.ok) openYearGoals();
  else showToast((await res.json()).error || 'Could not add goal');
}

async function editYearGoal(id, patch) {
  const res = await apiFetch(`/api/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (res.ok) openYearGoals();
}

async function deleteYearGoal_(id, name, row) {
  const ok = await openConfirm({ title: 'Delete goal', message: `Delete goal "${name}"?` });
  if (!ok) return;
  deleteWithUndo(row, `Goal "${name}"`, async () => {
    const res = await apiFetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (res.ok) openYearGoals();
  });
}

goalsPrev.onclick = () => {
  goalsYear -= 1;
  openYearGoals();
};
goalsNext.onclick = () => {
  goalsYear += 1;
  openYearGoals();
};
goalsTodayBtn.onclick = () => {
  goalsYear = Number(todayISO().slice(0, 4));
  openYearGoals();
};
addYearGoalBtn.onclick = addYearGoal;

// --- OKRs (on the cycle page) ----------------------------------------------
function renderOkrs(c) {
  addOkrBtn.hidden = !c.editable;
  okrList.innerHTML = '';
  if (!c.okrs.length) {
    okrList.innerHTML = '<div class="okr-habits"><span class="none">No OKRs yet for this cycle. An OKR is an Objective with a few Key Results — add one to track it here.</span></div>';
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
      del.innerHTML = TRASH_SVG;
      del.title = 'Delete OKR';
      del.onclick = () => deleteOkr(o.id, o.title, c.id, item);
      row.appendChild(del);
    }
    item.appendChild(row);

    const habits = document.createElement('div');
    habits.className = 'okr-habits';
    if (o.habits.length) {
      habits.innerHTML = o.habits.map((h) => `<span class="pill">${esc(h.name)}</span>`).join('');
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
  const res = await apiFetch('/api/okrs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cycleId: currentCycle, title: v.title.trim() }),
  });
  if (res.ok) openCycle(currentCycle);
  else showToast((await res.json()).error || 'Could not add OKR');
}

async function editOkr(id, patch, cycleId) {
  const res = await apiFetch(`/api/okrs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (res.ok) openCycle(cycleId);
}

async function deleteOkr(id, title, cycleId, row) {
  const confirmed = await openConfirm({
    title: 'Delete OKR',
    message: `Delete OKR "${title}"? Habits linked to it will be unlinked.`,
  });
  if (!confirmed) return;
  deleteWithUndo(row, `OKR "${title}"`, async () => {
    const res = await apiFetch(`/api/okrs/${id}`, { method: 'DELETE' });
    if (res.ok) openCycle(cycleId);
  });
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
  del.innerHTML = TRASH_SVG + ' Delete cycle';
  del.onclick = () => deleteCycle_(c.id, c.name);
  cycleMeta.appendChild(del);
}

async function editCycle(id, patch) {
  const res = await apiFetch(`/api/cycles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (res.ok) loadCycles(id);
  else {
    const error = (await res.json()).error || 'Update failed';
    cycleStatus.textContent = '⚠ ' + error;
    showToast(error);
  }
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
  const res = await apiFetch('/api/cycles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: v.name.trim(), start: v.start, end: v.end }),
  });
  const data = await res.json();
  if (res.ok) loadCycles(data.id);
  else showToast(data.error || 'Could not create cycle');
}

async function deleteCycle_(id, name) {
  const ok = await openConfirm({
    title: 'Delete cycle',
    message: `Delete cycle "${name}"? Its notes will be removed. Your daily entries stay untouched.`,
  });
  if (!ok) return;
  deleteWithUndo(cycleMeta, `Cycle "${name}"`, async () => {
    const res = await apiFetch(`/api/cycles/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (currentCycle === id) currentCycle = null;
      loadCycles();
    }
  });
}

function scheduleCycleSave() {
  cycleStatus.textContent = 'Editing…';
  clearTimeout(cycleSaveTimer);
  cycleSaveTimer = setTimeout(saveCycleNotes, 600);
}

async function saveCycleNotes() {
  if (!currentCycle || !cycleEditable) return;
  const res = await apiFetch(`/api/cycle/${currentCycle}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: cycleEditor.value }),
  });
  cycleStatus.textContent = res.ok ? 'Saved ✓' : '⚠ Could not save';
  if (!res.ok) showToast('Could not save');
}

addCycleBtn.onclick = addCycle;
addOkrBtn.onclick = addOkr;
addGoalBtn.onclick = addGoal;
cycleEditor.addEventListener('input', scheduleCycleSave);
cycleEditor.addEventListener('blur', () => { clearTimeout(cycleSaveTimer); saveCycleNotes(); });

// --- Habits tab: sidebar list + per-habit detail page -----------------------
let habitsCache = [];
async function loadHabitsTab() {
  habitsCache = await apiFetch('/api/habits').then((r) => r.json());
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
  ov.textContent = 'Overview';
  ov.onclick = showHabitsOverview;
  habitNav.appendChild(ov);

  const ordered = habitsCache.slice();
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
  closeSidebarOnMobile();
  openHabitId = id;
  const habit = habitsCache.find((h) => h.id === id);
  if (!habit) return showHabitsOverview();
  habitsTitle.textContent = habit.name;
  addHabitBtn2El.hidden = true;
  overviewEl.hidden = true;
  habitDetail.hidden = false;
  renderHabitNav();

  const notes = await apiFetch(`/api/habits/${id}/notes`).then((r) => r.json());
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
  await apiFetch(`/api/habits/${openHabitId}/notes`, {
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
    apiFetch('/api/overview?days=14').then((r) => r.json()),
    apiFetch('/api/okrs').then((r) => r.json()),
    apiFetch('/api/cycles').then((r) => r.json()),
  ]);
  habitsCache = data.habits;
  overview.innerHTML = '';
  if (!data.habits.length) {
    overview.innerHTML = '<div class="habits-empty">No habits yet. Click “+ Add habit” to track a daily checkbox or number — optionally link it to a cycle OKR.</div>';
    return;
  }
  for (const [index, h] of data.habits.entries()) {
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

    const moveUp = document.createElement('button');
    moveUp.className = 'ov-move';
    moveUp.textContent = '↑';
    moveUp.title = 'Move habit up';
    moveUp.disabled = index === 0;
    moveUp.onclick = () => moveHabit(h.id, -1);
    top.appendChild(moveUp);

    const moveDown = document.createElement('button');
    moveDown.className = 'ov-move';
    moveDown.textContent = '↓';
    moveDown.title = 'Move habit down';
    moveDown.disabled = index === data.habits.length - 1;
    moveDown.onclick = () => moveHabit(h.id, 1);
    top.appendChild(moveDown);

    top.insertAdjacentHTML('beforeend', `<span class="ov-streak">${h.streak}d streak</span><span class="ov-spacer"></span>`);

    const del = document.createElement('button');
    del.className = 'ov-del';
    del.innerHTML = TRASH_SVG;
    del.title = 'Delete habit';
    del.onclick = () => deleteHabit(h.id, h.name, card);
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
  none.textContent = 'No OKR';
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
  const res = await apiFetch(`/api/habits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) loadOverview(); // revert on failure
  else if (!habitNav.hidden && !openHabitId) {
    // keep the sidebar list names in sync after an overview edit
    habitsCache = await apiFetch('/api/habits').then((r) => r.json());
    renderHabitNav();
  }
}

async function saveHabitOrder(ids) {
  const res = await apiFetch('/api/habits/order', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const suffix = json && json.error ? `: ${json.error}` : '';
    statusEl.textContent = '⚠ Could not save habit order' + suffix;
    showToast('Could not save habit order' + suffix);
    return false;
  }
  return true;
}

async function moveHabit(id, direction) {
  const index = habitsCache.findIndex((h) => h.id === id);
  if (index === -1) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= habitsCache.length) return;
  const reordered = habitsCache.slice();
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  const ids = reordered.map((h) => h.id);
  if (!(await saveHabitOrder(ids))) return;
  habitsCache = reordered;
  renderHabitNav();
  loadOverview();
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
  const res = await apiFetch(`/api/summary/${current}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: summaryInput.value }),
  });
  statusEl.textContent = res.ok ? 'Saved ✓' : '⚠ Could not save';
  if (!res.ok) showToast('Could not save');
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
newProjectBtn.onclick = () => newProject();
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
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      wrapSelection(ta, '*');
    }
  });
  ta.addEventListener('click', () => maybeToggleByClick(ta));
  ta.addEventListener('blur', () => setTimeout(() => { if (slashTa === ta) closeSlash(); }, 150));
}

[editor, cycleEditor, habitNotes, projectNotes, weekEditor, learningsEditor, reflexionEditor, weekReflexionEditor].forEach(attachNotes);

// Give the cycle/habit/project note editors the same rendered backdrop as the
// daily notes (checkboxes + **bold**), kept aligned + scroll-synced.
function makeRichFill(ta) {
  const wrap = document.createElement('div');
  wrap.className = 'rich-wrap fill note-wrap';
  ta.parentNode.insertBefore(wrap, ta);
  const bd = document.createElement('div');
  bd.className = 'rich-backdrop';
  wrap.appendChild(bd);
  wrap.appendChild(ta);
  const sync = () => {
    const s = getComputedStyle(ta);
    ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach((p) => { bd.style[p] = s[p]; });
    bd.innerHTML = highlightNotes(ta.value, caretLineOf(ta));
    bd.scrollTop = ta.scrollTop;
  };
  ta.addEventListener('input', sync);
  ta.addEventListener('click', sync);
  ta.addEventListener('keyup', sync);
  ta.addEventListener('focus', sync);
  ta.addEventListener('blur', sync);
  ta.addEventListener('scroll', () => { bd.scrollTop = ta.scrollTop; });
  ta._richSync = sync;
  sync();
}
[cycleEditor, habitNotes, projectNotes].forEach(makeRichFill);
const refreshRich = (ta) => ta._richSync && ta._richSync();

// Bold/Italic/Strikethrough toolbar pinned to a note editor's corner
// (visible on hover/focus, see .note-fmt-toolbar in style.css) so formatting
// a selection doesn't require knowing the ⌘B/⌘I shortcuts. Reuses the same
// wrapSelection() the shortcuts use.
const FORMAT_MARKS = [
  { mark: '**', label: 'B', className: 'note-fmt-bold', title: 'Bold selection (⌘B)' },
  { mark: '*', label: 'I', className: 'note-fmt-italic', title: 'Italic selection (⌘I)' },
  { mark: '~~', label: 'S', className: 'note-fmt-strike', title: 'Strikethrough selection' },
];
function addFormatToolbar(ta) {
  const wrap = ta.parentElement;
  const bar = document.createElement('div');
  bar.className = 'note-fmt-toolbar';
  for (const { mark, label, className, title } of FORMAT_MARKS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `note-fmt-btn ${className}`;
    btn.title = title;
    btn.textContent = label;
    // Prevent the mousedown from stealing focus/collapsing the selection
    // before the click handler gets to read it off the textarea.
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', () => {
      if (ta.disabled) return;
      ta.focus();
      wrapSelection(ta, mark);
    });
    bar.appendChild(btn);
  }
  wrap.appendChild(bar);
}
[editor, cycleEditor, habitNotes, projectNotes, weekEditor, learningsEditor, reflexionEditor, weekReflexionEditor].forEach(addFormatToolbar);

// Auto-growing note editors (see autoGrowEditor & co.) have overflow:hidden —
// the page scrolls instead of the box — which means the browser's built-in
// "scroll to follow the caret" never kicks in. Without this, typing a new
// line near the bottom of a long entry leaves the cursor below the fold.
const mainEl = document.getElementById('main');
function caretOffsetTop(ta) {
  const mirror = document.createElement('div');
  const cs = getComputedStyle(ta);
  ['boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
    'whiteSpace', 'overflowWrap'].forEach((p) => { mirror.style[p] = cs[p]; });
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.left = '-9999px';
  mirror.style.top = '0';
  mirror.style.height = 'auto';
  mirror.appendChild(document.createTextNode(ta.value.slice(0, ta.selectionEnd)));
  const marker = document.createElement('span');
  marker.textContent = '​';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  try {
    return marker.offsetTop;
  } finally {
    document.body.removeChild(mirror);
  }
}
function keepCaretInView(ta) {
  if (document.activeElement !== ta || !mainEl) return;
  const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 20;
  const taTop = ta.getBoundingClientRect().top;
  const caretTop = taTop + caretOffsetTop(ta);
  const caretBottom = caretTop + lineHeight;
  const viewRect = mainEl.getBoundingClientRect();
  const margin = 16;
  if (caretBottom > viewRect.bottom - margin) mainEl.scrollTop += caretBottom - viewRect.bottom + margin;
  else if (caretTop < viewRect.top + margin) mainEl.scrollTop -= viewRect.top + margin - caretTop;
}

// theme switch — 'system' just removes the override and lets the
// prefers-color-scheme media query (in style.css) decide, same as before
// this existed at all.
const THEME_STORAGE_KEY = 'theme';
const themeOpts = document.querySelectorAll('.theme-opt');
function applyTheme(choice) {
  if (choice === 'light' || choice === 'dark') document.documentElement.dataset.theme = choice;
  else delete document.documentElement.dataset.theme;
  themeOpts.forEach((b) => b.classList.toggle('active', b.dataset.themeChoice === choice));
}
applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'system');
themeOpts.forEach((b) => {
  b.onclick = () => {
    const choice = b.dataset.themeChoice;
    localStorage.setItem(THEME_STORAGE_KEY, choice);
    applyTheme(choice);
  };
});

// --- command palette (Cmd/Ctrl+K) -------------------------------------------
// Static view-jump commands are always available instantly; project/habit/
// cycle entries are appended once their (fast, cached-or-cheap) data loads,
// so opening the palette never waits on a network round trip first.
const PALETTE_STATIC_COMMANDS = [
  { label: 'Go to Today', category: 'View', run: () => goToToday() },
  { label: 'Go to Journal', category: 'View', run: () => switchView('journal') },
  { label: 'Go to Cycles', category: 'View', run: () => switchView('cycles') },
  { label: 'Go to Habits', category: 'View', run: () => switchView('habits') },
  { label: 'Go to Time', category: 'View', run: () => switchView('time') },
  { label: 'Go to Checklist', category: 'View', run: () => switchView('checklist') },
  { label: 'Go to Goals', category: 'View', run: () => switchView('goals') },
  { label: 'Go to Life', category: 'View', run: () => switchView('life') },
];

let paletteOpen = false;
let paletteItems = [];
let paletteFiltered = [];
let paletteSel = 0;

function closePalette() {
  paletteOpen = false;
  paletteOverlay.hidden = true;
  paletteInput.value = '';
}

function filterPalette() {
  const q = paletteInput.value.trim().toLowerCase();
  paletteFiltered = q
    ? paletteItems.filter((c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
    : paletteItems;
  paletteSel = 0;
  renderPalette();
}

function renderPalette() {
  if (!paletteFiltered.length) {
    paletteResults.innerHTML = '<div class="palette-empty">No matches</div>';
    return;
  }
  paletteResults.innerHTML = paletteFiltered
    .map(
      (c, i) =>
        `<div class="palette-item${i === paletteSel ? ' sel' : ''}" data-i="${i}">` +
        `<span class="palette-label">${esc(c.label)}</span><span class="palette-cat">${esc(c.category)}</span></div>`
    )
    .join('');
  [...paletteResults.children].forEach((el) => {
    el.onmousedown = (ev) => { ev.preventDefault(); runPaletteItem(+el.dataset.i); };
  });
}

function runPaletteItem(i) {
  const c = paletteFiltered[i];
  if (!c) return;
  closePalette();
  c.run();
}

async function openPalette() {
  paletteOpen = true;
  paletteOverlay.hidden = false;
  paletteInput.value = '';
  paletteInput.focus();

  // projects are already kept in a live-updated global cache; no fetch needed
  paletteItems = [...PALETTE_STATIC_COMMANDS];
  for (const { project: p } of orderedProjectRows(projects)) {
    paletteItems.push({ label: p.name, category: 'Project', run: async () => { await switchView('time'); showProjectDetail(p.id); } });
  }
  filterPalette();

  const [habits, cycles] = await Promise.all([
    apiFetch('/api/habits').then((r) => r.json()).catch(() => []),
    apiFetch('/api/cycles').then((r) => r.json()).catch(() => []),
  ]);
  if (!paletteOpen) return; // closed again before this resolved
  for (const h of habits) {
    paletteItems.push({ label: h.name, category: 'Habit', run: async () => { await switchView('habits'); showHabitDetail(h.id); } });
  }
  for (const c of cycles) {
    paletteItems.push({ label: c.name, category: 'Cycle', run: async () => { await switchView('cycles'); openCycle(c.id); } });
  }
  filterPalette();
}

paletteInput.addEventListener('input', filterPalette);
paletteInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); paletteSel = Math.min(paletteSel + 1, paletteFiltered.length - 1); renderPalette(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); paletteSel = Math.max(paletteSel - 1, 0); renderPalette(); }
  else if (e.key === 'Enter') { e.preventDefault(); runPaletteItem(paletteSel); }
  else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
});
paletteOverlay.addEventListener('click', (e) => { if (e.target === paletteOverlay) closePalette(); });
document.getElementById('paletteBtn').onclick = openPalette;
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    if (paletteOpen) closePalette();
    else openPalette();
  }
});

// sidebar collapse toggle — on narrow viewports the sidebar becomes an
// off-canvas drawer (see the max-width media query in style.css) instead of
// just shrinking to width 0, with a backdrop to close it by tapping outside.
const sidebarEl = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';
const mobileMql = window.matchMedia('(max-width: 760px)');
const isMobileViewport = () => mobileMql.matches;

function applySidebarCollapsed(collapsed) {
  sidebarEl.classList.toggle('collapsed', collapsed);
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  sidebarBackdrop.hidden = collapsed || !isMobileViewport(); // desktop never shows a backdrop
  sidebarToggleBtn.textContent = collapsed ? '›' : '‹';
  sidebarToggleBtn.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
}
// The desktop collapse preference is persisted, but mobile always starts
// closed — otherwise the drawer would reuse a desktop "expanded" preference
// and cover the whole screen on the very first phone visit.
applySidebarCollapsed(isMobileViewport() || localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1');
sidebarToggleBtn.addEventListener('click', () => {
  const next = !sidebarEl.classList.contains('collapsed');
  if (!isMobileViewport()) localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
  applySidebarCollapsed(next);
});
sidebarBackdrop.addEventListener('click', () => applySidebarCollapsed(true));
// Crossing the breakpoint (e.g. rotating a tablet) doesn't change whether the
// drawer is open, but it does change whether a backdrop should show behind
// it — re-apply the current state so that stays in sync.
mobileMql.addEventListener('change', () => applySidebarCollapsed(sidebarEl.classList.contains('collapsed')));

// Picking something from the sidebar (a view, a day, a cycle, ...) should
// close the drawer on mobile so the picked content is actually visible.
function closeSidebarOnMobile() {
  if (isMobileViewport()) applySidebarCollapsed(true);
}

// boot: open today
(async function init() {
  await Promise.all([loadDays(), loadProjects(), refreshTimer()]);
  const today = dayList.querySelector('.tree-day.today');
  openDay(today ? today.dataset.date : todayISO());
})();

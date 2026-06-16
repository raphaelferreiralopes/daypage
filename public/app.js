'use strict';

const dayList = document.getElementById('dayList');
const editor = document.getElementById('editor');
const entryDate = document.getElementById('entryDate');
const statusEl = document.getElementById('status');
const readonlyNote = document.getElementById('readonlyNote');
const todayBtn = document.getElementById('todayBtn');
const habitList = document.getElementById('habitList');
const addHabitBtn = document.getElementById('addHabitBtn');
const addHabitBtn2 = document.getElementById('addHabitBtn2');
const journalView = document.getElementById('journalView');
const habitsView = document.getElementById('habitsView');
const journalControls = document.getElementById('journalControls');
const overview = document.getElementById('overview');
const navTabs = document.querySelectorAll('.nav-tab');
const dayCycle = document.getElementById('dayCycle');
// cycles
const cyclesView = document.getElementById('cyclesView');
const cycleControls = document.getElementById('cycleControls');
const cycleList = document.getElementById('cycleList');
const addCycleBtn = document.getElementById('addCycleBtn');
const cycleName = document.getElementById('cycleName');
const cycleBadge = document.getElementById('cycleBadge');
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
let currentCycle = null; // currently open cycle id
let cycleEditable = false;
let cycleSaveTimer = null;
let cyclePage = 'rules'; // active sub-page within a cycle

function fmtDate(date) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadDays() {
  const days = await fetch('/api/entries').then((r) => r.json());
  dayList.innerHTML = '';
  for (const d of days) {
    const li = document.createElement('li');
    li.dataset.date = d.date;
    if (d.isToday) li.classList.add('today');
    if (d.date === current) li.classList.add('active');
    li.innerHTML = `<span class="dot">${d.hasEntry ? '●' : '○'}</span><span>${labelFor(d)}</span>`;
    li.onclick = () => openDay(d.date);
    dayList.appendChild(li);
  }
}

function labelFor(d) {
  const dd = new Date(d.date + 'T00:00:00');
  const base = dd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return d.isToday ? `${base} · Today` : base;
}

async function openDay(date) {
  const entry = await fetch(`/api/entry/${date}`).then((r) => r.json());
  current = date;
  editable = entry.editable;
  entryDate.textContent = fmtDate(date);
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
  [...dayList.children].forEach((li) => li.classList.toggle('active', li.dataset.date === date));
  if (entry.editable) editor.focus();
}

// --- habits -----------------------------------------------------------------
function renderHabits(habits, values) {
  habitList.innerHTML = '';
  addHabitBtn.hidden = !editable; // only manage habits from today's page
  if (!habits.length) {
    habitList.innerHTML = '<div class="habits-empty">No habits yet. Add one to start tracking.</div>';
    return;
  }
  for (const h of habits) {
    const row = document.createElement('div');
    row.className = 'habit-row';
    const val = values[h.id];

    if (h.type === 'check') {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = Boolean(val);
      cb.disabled = !editable;
      cb.onchange = () => saveHabit(h.id, cb.checked);
      row.appendChild(cb);
      row.insertAdjacentHTML('beforeend', `<span class="name">${esc(h.name)}${okrTag(h)}</span>`);
    } else {
      row.insertAdjacentHTML('beforeend', `<span class="name">${esc(h.name)}${okrTag(h)}</span>`);
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.inputMode = 'decimal';
      inp.value = val == null ? '' : val;
      inp.placeholder = '—';
      inp.disabled = !editable;
      inp.onchange = () => saveHabit(h.id, inp.value);
      row.appendChild(inp);
      row.insertAdjacentHTML('beforeend', `<span class="unit">${esc(h.unit || '')}</span>`);
    }

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
  if (res.ok) refresh();
}

// re-render whichever view is currently active
function refresh() {
  if (view === 'habits') loadOverview();
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

// --- view switching ---------------------------------------------------------
async function switchView(next) {
  view = next;
  journalView.hidden = next !== 'journal';
  habitsView.hidden = next !== 'habits';
  cyclesView.hidden = next !== 'cycles';
  // sidebar contents per view
  journalControls.hidden = next !== 'journal';
  dayList.hidden = next !== 'journal';
  cycleControls.hidden = next !== 'cycles';
  cycleList.hidden = next !== 'cycles';
  navTabs.forEach((t) => t.classList.toggle('active', t.dataset.view === next));
  if (next === 'habits') await loadOverview();
  if (next === 'cycles') await loadCycles();
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
  cycleStatus.textContent = c.editable ? '' : 'Read-only';
  cycleEditor.value = c.notes;
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
    const unit = g.unit ? ' ' + g.unit : '';
    const item = document.createElement('div');
    item.className = 'goal-item';

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
    if (unit) top.insertAdjacentHTML('beforeend', `<span class="goal-count">${esc(g.unit)}</span>`);

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

    top.insertAdjacentHTML('beforeend', `<span class="ov-type">${h.type === 'value' ? 'Value' : 'Check'}</span>`);

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
}

addHabitBtn.onclick = addHabit;
addHabitBtn2.onclick = addHabit;
editor.addEventListener('input', scheduleSave);
editor.addEventListener('blur', () => { clearTimeout(saveTimer); save(); });
todayBtn.onclick = () => loadDays().then(() => {
  const today = dayList.querySelector('.today');
  if (today) openDay(today.dataset.date);
});

// boot: open today
(async function init() {
  await loadDays();
  const today = dayList.querySelector('.today');
  if (today) openDay(today.dataset.date);
})();

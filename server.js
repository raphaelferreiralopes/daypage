'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ENTRIES_DIR = path.join(ROOT, 'entries');
const HABITS_FILE = path.join(ROOT, 'habits.json');
const HABIT_DATA_DIR = path.join(ROOT, 'habit-data');
const CYCLES_FILE = path.join(ROOT, 'cycles.json');
const CYCLE_NOTES_DIR = path.join(ROOT, 'cycle-notes');
const OKRS_FILE = path.join(ROOT, 'okrs.json');
const GOALS_FILE = path.join(ROOT, 'goals.json');

fs.mkdirSync(ENTRIES_DIR, { recursive: true });
fs.mkdirSync(HABIT_DATA_DIR, { recursive: true });
fs.mkdirSync(CYCLE_NOTES_DIR, { recursive: true });

// --- date helpers (local time) ---------------------------------------------
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isValidDate(s) {
  return DATE_RE.test(s) && !Number.isNaN(Date.parse(s));
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// A per-request read cache: load habits/cycles once, memoize habit-data by date.
// Avoids re-reading the same JSON files dozens of times when computing progress.
function makeCtx() {
  const habits = readHabits();
  const cycles = readCycles();
  const dataCache = new Map();
  return {
    habitsById: new Map(habits.map((h) => [h.id, h])),
    cyclesById: new Map(cycles.map((c) => [c.id, c])),
    data(date) {
      if (!dataCache.has(date)) dataCache.set(date, readHabitData(date));
      return dataCache.get(date);
    },
  };
}

// Is a habit "done" on a given day's data? (check = ticked; value = non-empty)
function habitDone(habit, dayData) {
  const v = dayData[habit.id];
  return habit.type === 'check' ? v === true : v !== undefined && String(v).trim() !== '';
}

function entryPath(date) {
  return path.join(ENTRIES_DIR, `${date}.md`);
}

// --- API handlers -----------------------------------------------------------
function listEntries() {
  const today = todayStr();
  const files = fs
    .readdirSync(ENTRIES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3))
    .filter(isValidDate);

  const dates = new Set(files);
  dates.add(today); // today always shows, even before first save

  return [...dates]
    .sort()
    .reverse()
    .map((date) => ({ date, isToday: date === today, hasEntry: files.includes(date) }));
}

function readEntry(date) {
  const p = entryPath(date);
  const content = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  return {
    date,
    content,
    isToday: date === todayStr(),
    editable: date === todayStr(),
    habits: enrichHabits(readHabits()),
    habitValues: readHabitData(date),
    cycle: cycleForDate(date),
  };
}

// --- habits -----------------------------------------------------------------
function readHabits() {
  if (!fs.existsSync(HABITS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(HABITS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeHabits(habits) {
  fs.writeFileSync(HABITS_FILE, JSON.stringify(habits, null, 2), 'utf8');
}

function createHabit({ name, type, unit, okrId }) {
  name = String(name || '').trim();
  if (!name) {
    const err = new Error('Habit name is required.');
    err.status = 400;
    throw err;
  }
  if (type !== 'check' && type !== 'value') type = 'check';
  const habits = readHabits();
  const habit = {
    id: 'h_' + crypto.randomUUID().slice(0, 8),
    name,
    type,
    unit: type === 'value' ? String(unit || '').trim() : '',
    okrId: okrId && readOkrs().some((o) => o.id === okrId) ? okrId : null,
  };
  habits.push(habit);
  writeHabits(habits);
  return habit;
}

function updateHabit(id, { name, unit, okrId }) {
  const habits = readHabits();
  const habit = habits.find((h) => h.id === id);
  if (!habit) {
    const err = new Error('Unknown habit.');
    err.status = 404;
    throw err;
  }
  if (typeof name === 'string' && name.trim()) habit.name = name.trim();
  if (typeof unit === 'string' && habit.type === 'value') habit.unit = unit.trim();
  if (okrId !== undefined) habit.okrId = okrId && readOkrs().some((o) => o.id === okrId) ? okrId : null;
  writeHabits(habits);
  return habit;
}

function deleteHabit(id) {
  writeHabits(readHabits().filter((h) => h.id !== id));
  writeGoals(readGoals().filter((g) => g.habitId !== id)); // drop goals targeting it
  return { ok: true };
}

// Current streak: consecutive done-days ending today (or yesterday if today
// isn't done yet, so an unfinished today doesn't drop the streak). Walks all
// history back to the first gap — not capped to the overview window.
function habitStreak(habit, ctx) {
  let cursor = todayStr();
  if (!habitDone(habit, ctx.data(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  for (let i = 0; i < 3650 && habitDone(habit, ctx.data(cursor)); i++) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// Overview: each habit with its values across the last `days` days (most recent first).
function habitOverview(days) {
  days = Math.min(Math.max(parseInt(days, 10) || 14, 1), 90);
  const ctx = makeCtx();
  const today = todayStr();
  const dates = [];
  for (let i = 0; i < days; i++) dates.push(addDays(today, -i));

  const habits = enrichHabits(readHabits()).map((h) => {
    const values = {};
    for (const date of dates) {
      const v = ctx.data(date)[h.id];
      if (v !== undefined) values[date] = v;
    }
    return { ...h, values, streak: habitStreak(h, ctx) };
  });
  return { today, dates, habits };
}

function habitDataPath(date) {
  return path.join(HABIT_DATA_DIR, `${date}.json`);
}

function readHabitData(date) {
  const p = habitDataPath(date);
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function setHabitValue(date, habitId, value) {
  if (date !== todayStr()) {
    const err = new Error("Only today's habits are editable.");
    err.status = 403;
    throw err;
  }
  const habit = readHabits().find((h) => h.id === habitId);
  if (!habit) {
    const err = new Error('Unknown habit.');
    err.status = 404;
    throw err;
  }
  const data = readHabitData(date);
  data[habitId] = habit.type === 'check' ? Boolean(value) : String(value);
  fs.writeFileSync(habitDataPath(date), JSON.stringify(data, null, 2), 'utf8');
  return { ok: true };
}

function saveEntry(date, content) {
  if (date !== todayStr()) {
    const err = new Error('Only today\'s page is editable.');
    err.status = 403;
    throw err;
  }
  fs.writeFileSync(entryPath(date), content, 'utf8');
  return { ok: true, date };
}

// --- cycles -----------------------------------------------------------------
function readCycles() {
  if (!fs.existsSync(CYCLES_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(CYCLES_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeCycles(cycles) {
  fs.writeFileSync(CYCLES_FILE, JSON.stringify(cycles, null, 2), 'utf8');
}

// editable while the cycle has not yet ended (current or future)
function decorateCycle(c) {
  const today = todayStr();
  return {
    ...c,
    isCurrent: c.start <= today && today <= c.end,
    editable: today <= c.end,
    ended: c.end < today,
  };
}

function listCycles() {
  const ctx = makeCtx(); // one shared cache for every cycle's goal computation
  return readCycles()
    .map((c) => ({ ...decorateCycle(c), overallProgress: cycleGoals(c.id, ctx).overall }))
    .sort((a, b) => (a.start < b.start ? 1 : -1)); // most recent first
}

function cycleForDate(date) {
  const c = readCycles().find((c) => c.start <= date && date <= c.end);
  return c ? { id: c.id, name: c.name, start: c.start, end: c.end } : null;
}

function createCycle({ name, start, end }) {
  name = String(name || '').trim();
  if (!name) {
    const err = new Error('Cycle name is required.');
    err.status = 400;
    throw err;
  }
  if (!isValidDate(start)) start = todayStr();
  if (!isValidDate(end)) {
    const err = new Error('A valid end date (YYYY-MM-DD) is required.');
    err.status = 400;
    throw err;
  }
  if (end < start) {
    const err = new Error('End date must be on or after the start date.');
    err.status = 400;
    throw err;
  }
  const cycles = readCycles();
  const cycle = { id: 'c_' + crypto.randomUUID().slice(0, 8), name, start, end };
  cycles.push(cycle);
  writeCycles(cycles);
  return decorateCycle(cycle);
}

function updateCycle(id, { name, start, end }) {
  const cycles = readCycles();
  const cycle = cycles.find((c) => c.id === id);
  if (!cycle) {
    const err = new Error('Unknown cycle.');
    err.status = 404;
    throw err;
  }
  if (typeof name === 'string' && name.trim()) cycle.name = name.trim();
  if (isValidDate(start)) cycle.start = start;
  if (isValidDate(end)) cycle.end = end;
  if (cycle.end < cycle.start) {
    const err = new Error('End date must be on or after the start date.');
    err.status = 400;
    throw err;
  }
  writeCycles(cycles);
  return decorateCycle(cycle);
}

function deleteCycle(id) {
  writeCycles(readCycles().filter((c) => c.id !== id));
  const p = cycleNotesPath(id);
  if (fs.existsSync(p)) fs.rmSync(p);
  // remove the cycle's OKRs and unlink any habits pointing at them
  for (const okr of listOkrs(id)) deleteOkr(okr.id);
  writeGoals(readGoals().filter((g) => g.cycleId !== id)); // and its goals
  return { ok: true };
}

function cycleNotesPath(id) {
  return path.join(CYCLE_NOTES_DIR, `${id}.md`);
}

function readCycle(id) {
  const cycle = readCycles().find((c) => c.id === id);
  if (!cycle) {
    const err = new Error('Unknown cycle.');
    err.status = 404;
    throw err;
  }
  const p = cycleNotesPath(id);
  const notes = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  // OKRs for this cycle, each with the habits linked to it
  const habits = readHabits();
  const okrs = listOkrs(id).map((o) => ({
    ...o,
    habits: habits.filter((h) => h.okrId === o.id).map((h) => ({ id: h.id, name: h.name })),
  }));
  const { goals, overall } = cycleGoals(id);
  return { ...decorateCycle(cycle), notes, okrs, goals, overallProgress: overall };
}

function saveCycleNotes(id, content) {
  const cycle = readCycles().find((c) => c.id === id);
  if (!cycle) {
    const err = new Error('Unknown cycle.');
    err.status = 404;
    throw err;
  }
  if (cycle.end < todayStr()) {
    const err = new Error('This cycle has ended and is read-only.');
    err.status = 403;
    throw err;
  }
  fs.writeFileSync(cycleNotesPath(id), content, 'utf8');
  return { ok: true };
}

// --- OKRs (belong to a cycle) -----------------------------------------------
function readOkrs() {
  if (!fs.existsSync(OKRS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(OKRS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeOkrs(okrs) {
  fs.writeFileSync(OKRS_FILE, JSON.stringify(okrs, null, 2), 'utf8');
}

function listOkrs(cycleId) {
  const okrs = readOkrs();
  return cycleId ? okrs.filter((o) => o.cycleId === cycleId) : okrs;
}

function createOkr({ cycleId, title }) {
  title = String(title || '').trim();
  if (!title) {
    const err = new Error('OKR objective is required.');
    err.status = 400;
    throw err;
  }
  if (!readCycles().some((c) => c.id === cycleId)) {
    const err = new Error('OKR must belong to a valid cycle.');
    err.status = 400;
    throw err;
  }
  const okrs = readOkrs();
  const okr = { id: 'o_' + crypto.randomUUID().slice(0, 8), cycleId, title };
  okrs.push(okr);
  writeOkrs(okrs);
  return okr;
}

function updateOkr(id, { title, cycleId }) {
  const okrs = readOkrs();
  const okr = okrs.find((o) => o.id === id);
  if (!okr) {
    const err = new Error('Unknown OKR.');
    err.status = 404;
    throw err;
  }
  if (typeof title === 'string' && title.trim()) okr.title = title.trim();
  if (cycleId && readCycles().some((c) => c.id === cycleId)) okr.cycleId = cycleId;
  writeOkrs(okrs);
  return okr;
}

function deleteOkr(id) {
  writeOkrs(readOkrs().filter((o) => o.id !== id));
  unlinkHabitsFromOkr(id);
  return { ok: true };
}

// Set habit.okrId to null for every habit pointing at a removed OKR.
function unlinkHabitsFromOkr(okrId) {
  const habits = readHabits();
  let changed = false;
  for (const h of habits) {
    if (h.okrId === okrId) {
      h.okrId = null;
      changed = true;
    }
  }
  if (changed) writeHabits(habits);
}

// Attach the linked OKR (with its cycle name) to each habit for the frontend.
function enrichHabits(habits) {
  const okrs = readOkrs();
  const cycles = readCycles();
  return habits.map((h) => {
    const okr = h.okrId ? okrs.find((o) => o.id === h.okrId) : null;
    const cyc = okr ? cycles.find((c) => c.id === okr.cycleId) : null;
    return {
      ...h,
      okr: okr ? { id: okr.id, title: okr.title, cycleId: okr.cycleId, cycleName: cyc ? cyc.name : null } : null,
    };
  });
}

// --- goals (per cycle, target a habit) --------------------------------------
function readGoals() {
  if (!fs.existsSync(GOALS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(GOALS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeGoals(goals) {
  fs.writeFileSync(GOALS_FILE, JSON.stringify(goals, null, 2), 'utf8');
}

function listGoals(cycleId) {
  const goals = readGoals();
  return cycleId ? goals.filter((g) => g.cycleId === cycleId) : goals;
}

function createGoal({ cycleId, habitId, target, label }) {
  if (!readCycles().some((c) => c.id === cycleId)) {
    const err = new Error('Goal must belong to a valid cycle.');
    err.status = 400;
    throw err;
  }
  if (!readHabits().some((h) => h.id === habitId)) {
    const err = new Error('Goal must target a valid habit.');
    err.status = 400;
    throw err;
  }
  const t = Number(target);
  if (!(t > 0)) {
    const err = new Error('Target must be a positive number.');
    err.status = 400;
    throw err;
  }
  const goals = readGoals();
  const goal = { id: 'g_' + crypto.randomUUID().slice(0, 8), cycleId, habitId, target: t, label: String(label || '').trim() };
  goals.push(goal);
  writeGoals(goals);
  return goal;
}

function updateGoal(id, { target, label, habitId }) {
  const goals = readGoals();
  const goal = goals.find((g) => g.id === id);
  if (!goal) {
    const err = new Error('Unknown goal.');
    err.status = 404;
    throw err;
  }
  if (target !== undefined) {
    const t = Number(target);
    if (!(t > 0)) {
      const err = new Error('Target must be a positive number.');
      err.status = 400;
      throw err;
    }
    goal.target = t;
  }
  if (typeof label === 'string') goal.label = label.trim();
  if (habitId && readHabits().some((h) => h.id === habitId)) goal.habitId = habitId;
  writeGoals(goals);
  return goal;
}

function deleteGoal(id) {
  writeGoals(readGoals().filter((g) => g.id !== id));
  return { ok: true };
}

function datesInRange(start, end) {
  const out = [];
  const d = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (d <= last) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push(`${y}-${m}-${day}`);
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// Compute a goal's current progress by scanning habit check-ins across its cycle.
function computeGoal(goal, ctx) {
  const habit = ctx.habitsById.get(goal.habitId);
  const cycle = ctx.cyclesById.get(goal.cycleId);
  let current = 0;
  if (habit && cycle) {
    for (const date of datesInRange(cycle.start, cycle.end)) {
      const v = ctx.data(date)[habit.id];
      if (v === undefined) continue;
      if (habit.type === 'check') current += v === true ? 1 : 0;
      else current += Number(v) || 0;
    }
  }
  const pct = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;
  return {
    ...goal,
    habitName: habit ? habit.name : '(deleted habit)',
    habitType: habit ? habit.type : null,
    unit: habit ? habit.unit : '',
    current: Math.round(current * 100) / 100,
    pct,
  };
}

// All goals for a cycle with progress, plus an overall percentage (avg of goals).
// Accepts a shared ctx so callers iterating many cycles read each file only once.
function cycleGoals(cycleId, ctx = makeCtx()) {
  const goals = listGoals(cycleId).map((g) => computeGoal(g, ctx));
  const overall = goals.length ? Math.round(goals.reduce((s, g) => s + g.pct, 0) / goals.length) : null;
  return { goals, overall };
}

// --- tiny static file server ------------------------------------------------
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

function serveStatic(res, file) {
  const p = path.join(ROOT, 'public', file);
  if (!p.startsWith(path.join(ROOT, 'public'))) return send(res, 403, 'Forbidden');
  if (!fs.existsSync(p)) return send(res, 404, 'Not found');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' });
  fs.createReadStream(p).pipe(res);
}

function send(res, status, body, type = 'text/plain') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}
function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), 'application/json');
}

// Read a JSON request body, then invoke fn(parsedObject). Handles size + errors.
function readBody(req, res, fn) {
  let body = '';
  req.on('data', (c) => {
    body += c;
    if (body.length > 5_000_000) req.destroy();
  });
  req.on('end', () => {
    try {
      fn(JSON.parse(body || '{}'));
    } catch (e) {
      sendJson(res, e.status || 400, { error: e.message });
    }
  });
}

// --- router -----------------------------------------------------------------
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean);

  try {
    // GET /api/entries  -> list of days
    if (req.method === 'GET' && url.pathname === '/api/entries') {
      return sendJson(res, 200, listEntries());
    }

    // GET /api/entry/:date
    if (req.method === 'GET' && parts[0] === 'api' && parts[1] === 'entry' && parts[2]) {
      if (!isValidDate(parts[2])) return sendJson(res, 400, { error: 'Bad date' });
      return sendJson(res, 200, readEntry(parts[2]));
    }

    // GET /api/habits  -> habit definitions
    if (req.method === 'GET' && url.pathname === '/api/habits') {
      return sendJson(res, 200, readHabits());
    }

    // POST /api/habits  { name, type, unit }  -> create habit
    if (req.method === 'POST' && url.pathname === '/api/habits') {
      return readBody(req, res, (data) => sendJson(res, 200, createHabit(data)));
    }

    // GET /api/overview?days=N  -> habits with recent history + streaks
    if (req.method === 'GET' && url.pathname === '/api/overview') {
      return sendJson(res, 200, habitOverview(url.searchParams.get('days')));
    }

    // PUT /api/habits/:id  { name, unit }  -> edit habit
    if (req.method === 'PUT' && parts[0] === 'api' && parts[1] === 'habits' && parts[2]) {
      return readBody(req, res, (data) => sendJson(res, 200, updateHabit(parts[2], data)));
    }

    // DELETE /api/habits/:id
    if (req.method === 'DELETE' && parts[0] === 'api' && parts[1] === 'habits' && parts[2]) {
      return sendJson(res, 200, deleteHabit(parts[2]));
    }

    // POST /api/habit/:date  { habitId, value }  -> set today's value
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'habit' && parts[2]) {
      if (!isValidDate(parts[2])) return sendJson(res, 400, { error: 'Bad date' });
      return readBody(req, res, (data) =>
        sendJson(res, 200, setHabitValue(parts[2], data.habitId, data.value))
      );
    }

    // GET /api/cycles  -> all cycles (decorated)
    if (req.method === 'GET' && url.pathname === '/api/cycles') {
      return sendJson(res, 200, listCycles());
    }

    // POST /api/cycles  { name, start, end }
    if (req.method === 'POST' && url.pathname === '/api/cycles') {
      return readBody(req, res, (data) => sendJson(res, 200, createCycle(data)));
    }

    // GET /api/cycle/:id  -> cycle with notes
    if (req.method === 'GET' && parts[0] === 'api' && parts[1] === 'cycle' && parts[2]) {
      return sendJson(res, 200, readCycle(parts[2]));
    }

    // POST /api/cycle/:id/notes  { content }
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'cycle' && parts[2] && parts[3] === 'notes') {
      return readBody(req, res, ({ content }) => {
        if (typeof content !== 'string') return sendJson(res, 400, { error: 'content must be a string' });
        sendJson(res, 200, saveCycleNotes(parts[2], content));
      });
    }

    // PUT /api/cycles/:id  { name, start, end }
    if (req.method === 'PUT' && parts[0] === 'api' && parts[1] === 'cycles' && parts[2]) {
      return readBody(req, res, (data) => sendJson(res, 200, updateCycle(parts[2], data)));
    }

    // DELETE /api/cycles/:id
    if (req.method === 'DELETE' && parts[0] === 'api' && parts[1] === 'cycles' && parts[2]) {
      return sendJson(res, 200, deleteCycle(parts[2]));
    }

    // GET /api/okrs  or  /api/okrs?cycleId=...
    if (req.method === 'GET' && url.pathname === '/api/okrs') {
      return sendJson(res, 200, listOkrs(url.searchParams.get('cycleId')));
    }

    // POST /api/okrs  { cycleId, title }
    if (req.method === 'POST' && url.pathname === '/api/okrs') {
      return readBody(req, res, (data) => sendJson(res, 200, createOkr(data)));
    }

    // PUT /api/okrs/:id  { title, cycleId }
    if (req.method === 'PUT' && parts[0] === 'api' && parts[1] === 'okrs' && parts[2]) {
      return readBody(req, res, (data) => sendJson(res, 200, updateOkr(parts[2], data)));
    }

    // DELETE /api/okrs/:id
    if (req.method === 'DELETE' && parts[0] === 'api' && parts[1] === 'okrs' && parts[2]) {
      return sendJson(res, 200, deleteOkr(parts[2]));
    }

    // GET /api/goals?cycleId=...
    if (req.method === 'GET' && url.pathname === '/api/goals') {
      return sendJson(res, 200, cycleGoals(url.searchParams.get('cycleId')).goals);
    }

    // POST /api/goals  { cycleId, habitId, target, label }
    if (req.method === 'POST' && url.pathname === '/api/goals') {
      return readBody(req, res, (data) => sendJson(res, 200, createGoal(data)));
    }

    // PUT /api/goals/:id  { target, label, habitId }
    if (req.method === 'PUT' && parts[0] === 'api' && parts[1] === 'goals' && parts[2]) {
      return readBody(req, res, (data) => sendJson(res, 200, updateGoal(parts[2], data)));
    }

    // DELETE /api/goals/:id
    if (req.method === 'DELETE' && parts[0] === 'api' && parts[1] === 'goals' && parts[2]) {
      return sendJson(res, 200, deleteGoal(parts[2]));
    }

    // POST /api/entry/:date  { content }
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'entry' && parts[2]) {
      if (!isValidDate(parts[2])) return sendJson(res, 400, { error: 'Bad date' });
      return readBody(req, res, ({ content }) => {
        if (typeof content !== 'string') return sendJson(res, 400, { error: 'content must be a string' });
        sendJson(res, 200, saveEntry(parts[2], content));
      });
    }

    // static
    if (req.method === 'GET') {
      return serveStatic(res, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
    }

    send(res, 404, 'Not found');
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n  📓 Journal running at http://localhost:${PORT}\n  Entries saved in: ${ENTRIES_DIR}\n`);
});

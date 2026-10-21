'use strict';

// All data access, as async Supabase queries. Every function takes the
// caller's request-scoped `supabase` client (see lib/auth.js) plus `userId`
// as the first arguments — RLS is the real isolation boundary, but filtering
// explicitly here too is cheap defense-in-depth and keeps intent obvious.

const {
  todayStr,
  isValidDate,
  weekStart,
  currentWeekStart,
  addDays,
  weekDates,
  requireNotFuture,
  yearStart,
  yearEnd,
} = require('./dates');
const { adminClient } = require('./supabase');

function checkError(error) {
  if (error) {
    const err = new Error(error.message);
    err.status = 500;
    throw err;
  }
}

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  throw err;
}

// --- entries -----------------------------------------------------------
async function listEntries(supabase, userId) {
  const today = todayStr();
  const { data, error } = await supabase.from('entries').select('date').eq('user_id', userId);
  checkError(error);
  const hasEntry = new Set(data.map((r) => r.date));
  const dates = new Set(hasEntry);
  dates.add(today);
  return [...dates]
    .sort()
    .reverse()
    .map((date) => ({ date, isToday: date === today, hasEntry: hasEntry.has(date) }));
}

async function getEntryContent(supabase, userId, date) {
  const { data, error } = await supabase
    .from('entries')
    .select('content')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  checkError(error);
  return data ? data.content : '';
}

async function readEntry(supabase, userId, date) {
  const [content, habits, habitValues, cycle, summary, learnings, reflexion, time] = await Promise.all([
    getEntryContent(supabase, userId, date),
    readHabits(supabase, userId),
    readHabitData(supabase, userId, date),
    cycleForDate(supabase, userId, date),
    readSummary(supabase, userId, date),
    readLearnings(supabase, userId, date),
    readReflexion(supabase, userId, date),
    dayTime(supabase, userId, date),
  ]);
  const today = todayStr();
  return { date, content, isToday: date === today, editable: date <= today, habits, habitValues, cycle, summary, learnings, reflexion, time };
}

async function saveEntry(supabase, userId, date, content) {
  requireNotFuture(date);
  const { error } = await supabase.from('entries').upsert({ user_id: userId, date, content }, { onConflict: 'user_id,date' });
  checkError(error);
  return { ok: true, date };
}

async function readSummary(supabase, userId, date) {
  const { data, error } = await supabase.from('day_summaries').select('text').eq('user_id', userId).eq('date', date).maybeSingle();
  checkError(error);
  return data ? data.text : '';
}

async function saveSummary(supabase, userId, date, text) {
  requireNotFuture(date);
  const { error } = await supabase.from('day_summaries').upsert({ user_id: userId, date, text }, { onConflict: 'user_id,date' });
  checkError(error);
  return { ok: true, date };
}

async function listRecaps(supabase, userId) {
  const { data, error } = await supabase.from('day_summaries').select('date, text').eq('user_id', userId);
  checkError(error);
  return data
    .filter((r) => r.text && r.text.trim())
    .map((r) => ({ date: r.date, text: r.text }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

async function listAllLearnings(supabase, userId) {
  const { data, error } = await supabase.from('day_learnings').select('date, content').eq('user_id', userId);
  checkError(error);
  return data
    .filter((r) => r.content && r.content.trim())
    .map((r) => ({ date: r.date, content: r.content }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

async function readLearnings(supabase, userId, date) {
  const { data, error } = await supabase.from('day_learnings').select('content').eq('user_id', userId).eq('date', date).maybeSingle();
  checkError(error);
  return data ? data.content : '';
}

async function saveLearnings(supabase, userId, date, content) {
  requireNotFuture(date);
  const { error } = await supabase.from('day_learnings').upsert({ user_id: userId, date, content }, { onConflict: 'user_id,date' });
  checkError(error);
  return { ok: true, date };
}

async function readReflexion(supabase, userId, date) {
  const { data, error } = await supabase.from('day_reflexions').select('content').eq('user_id', userId).eq('date', date).maybeSingle();
  checkError(error);
  return data ? data.content : '';
}

async function saveReflexion(supabase, userId, date, content) {
  requireNotFuture(date);
  const { error } = await supabase.from('day_reflexions').upsert({ user_id: userId, date, content }, { onConflict: 'user_id,date' });
  checkError(error);
  return { ok: true, date };
}

// --- habits --------------------------------------------------------------
function mapHabitRow(r) {
  return { id: r.id, name: r.name, type: r.type, unit: r.unit };
}

async function readHabits(supabase, userId) {
  const { data, error } = await supabase.from('habits').select('*').eq('user_id', userId).order('position', { ascending: true });
  checkError(error);
  return data.map(mapHabitRow);
}

async function createHabit(supabase, userId, { name, type, unit }) {
  name = String(name || '').trim();
  if (!name) {
    const err = new Error('Habit name is required.');
    err.status = 400;
    throw err;
  }
  if (type !== 'check' && type !== 'value') type = 'check';

  const { count, error: countErr } = await supabase.from('habits').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  checkError(countErr);

  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: userId, name, type, unit: type === 'value' ? String(unit || '').trim() : '', position: count || 0 })
    .select()
    .single();
  checkError(error);
  return mapHabitRow(data);
}

async function updateHabit(supabase, userId, id, { name, unit, type }) {
  const { data: existing, error: fetchErr } = await supabase.from('habits').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  checkError(fetchErr);
  if (!existing) notFound('Unknown habit.');

  const patch = {};
  if (typeof name === 'string' && name.trim()) patch.name = name.trim();
  if (type === 'check' || type === 'value') {
    patch.type = type;
    if (type === 'check') patch.unit = '';
  }
  const effectiveType = patch.type || existing.type;
  if (typeof unit === 'string' && effectiveType === 'value') patch.unit = unit.trim();

  const { data, error } = await supabase.from('habits').update(patch).eq('user_id', userId).eq('id', id).select().single();
  checkError(error);
  return mapHabitRow(data);
}

async function deleteHabit(supabase, userId, id) {
  // goals.habit_id and habit_notes.habit_id cascade on delete.
  const { error } = await supabase.from('habits').delete().eq('user_id', userId).eq('id', id);
  checkError(error);
  return { ok: true };
}

async function reorderHabits(supabase, userId, ids) {
  if (!Array.isArray(ids)) {
    const err = new Error('ids must be an array');
    err.status = 400;
    throw err;
  }
  const { data: habits, error } = await supabase.from('habits').select('id').eq('user_id', userId);
  checkError(error);
  if (ids.length !== habits.length || new Set(ids).size !== ids.length) {
    const err = new Error('ids must include each habit exactly once');
    err.status = 400;
    throw err;
  }
  const validIds = new Set(habits.map((h) => h.id));
  for (const id of ids) {
    if (!validIds.has(id)) {
      const err = new Error(`Unknown habit id: ${id}`);
      err.status = 400;
      throw err;
    }
  }
  await Promise.all(ids.map((id, i) => supabase.from('habits').update({ position: i }).eq('user_id', userId).eq('id', id)));
  return { ok: true };
}

async function readHabitNotes(supabase, userId, id) {
  const { data, error } = await supabase.from('habit_notes').select('content').eq('user_id', userId).eq('habit_id', id).maybeSingle();
  checkError(error);
  return data ? data.content : '';
}

async function saveHabitNotes(supabase, userId, id, content) {
  const { data: habit } = await supabase.from('habits').select('id').eq('user_id', userId).eq('id', id).maybeSingle();
  if (!habit) notFound('Unknown habit.');
  const { error } = await supabase.from('habit_notes').upsert({ user_id: userId, habit_id: id, content }, { onConflict: 'habit_id' });
  checkError(error);
  return { ok: true };
}

async function readHabitData(supabase, userId, date) {
  const { data, error } = await supabase.from('habit_data').select('habit_id, value').eq('user_id', userId).eq('date', date);
  checkError(error);
  const out = {};
  for (const r of data) out[r.habit_id] = r.value;
  return out;
}

async function setHabitValue(supabase, userId, date, habitId, value) {
  requireNotFuture(date);
  const { data: habit } = await supabase.from('habits').select('type').eq('user_id', userId).eq('id', habitId).maybeSingle();
  if (!habit) notFound('Unknown habit.');
  const v = habit.type === 'check' ? Boolean(value) : String(value);
  const { error } = await supabase
    .from('habit_data')
    .upsert({ user_id: userId, habit_id: habitId, date, value: v }, { onConflict: 'user_id,habit_id,date' });
  checkError(error);
  return { ok: true };
}

function isHabitDone(type, value) {
  if (value === undefined) return false;
  return type === 'check' ? value === true : String(value).trim() !== '';
}

// Current streak from a habit's date->value map (already fetched — see
// habitOverview, which loads every habit's full history in one query so this
// never has to go back to the database per habit).
function computeStreak(type, dateMap) {
  const done = (date) => isHabitDone(type, dateMap.get(date));
  let cursor = todayStr();
  if (!done(cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  for (let i = 0; i < 3650 && done(cursor); i++) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// Longest run of consecutive done-dates anywhere in the habit's history
// (not just the current run, which is what computeStreak tracks).
function computeLongestStreak(type, dateMap) {
  const doneDates = [...dateMap.keys()].filter((d) => isHabitDone(type, dateMap.get(d))).sort();
  let longest = 0;
  let current = 0;
  let prev = null;
  for (const d of doneDates) {
    current = prev && addDays(prev, 1) === d ? current + 1 : 1;
    if (current > longest) longest = current;
    prev = d;
  }
  return longest;
}

async function habitOverview(supabase, userId, days) {
  days = Math.min(Math.max(parseInt(days, 10) || 14, 1), 90);
  const today = todayStr();
  const dates = [];
  for (let i = 0; i < days; i++) dates.push(addDays(today, -i));

  // One query for every habit's *entire* history — both the display window
  // and each habit's streak are sliced out of this same in-memory map, so
  // this replaces what used to be 1 windowed query + 1 extra query per habit.
  const [habits, dataRes] = await Promise.all([
    readHabits(supabase, userId),
    supabase.from('habit_data').select('habit_id, date, value').eq('user_id', userId),
  ]);
  checkError(dataRes.error);

  const byHabit = new Map();
  for (const r of dataRes.data) {
    if (!byHabit.has(r.habit_id)) byHabit.set(r.habit_id, new Map());
    byHabit.get(r.habit_id).set(r.date, r.value);
  }

  const habitsOut = habits.map((h) => {
    const dateMap = byHabit.get(h.id) || new Map();
    const values = {};
    for (const date of dates) if (dateMap.has(date)) values[date] = dateMap.get(date);
    return { ...h, values, streak: computeStreak(h.type, dateMap), longestStreak: computeLongestStreak(h.type, dateMap) };
  });

  return { today, dates, habits: habitsOut };
}

// --- cycles ---------------------------------------------------------------
function mapCycleRow(r) {
  return { id: r.id, name: r.name, start: r.start_date, end: r.end_date, kind: r.kind };
}

function decorateCycle(c) {
  const today = todayStr();
  return { ...c, isCurrent: c.start <= today && today <= c.end, editable: today <= c.end, ended: c.end < today };
}

// Unfiltered by kind — used internally by goal computation, which needs to
// resolve any cycle (including auto-managed yearly ones) by id.
async function listCyclesRaw(supabase, userId) {
  const { data, error } = await supabase.from('cycles').select('*').eq('user_id', userId);
  checkError(error);
  return data.map(mapCycleRow);
}

async function listCycles(supabase, userId) {
  const cycles = (await listCyclesRaw(supabase, userId))
    .filter((c) => c.kind === 'custom')
    .map(decorateCycle);
  const withGoals = await Promise.all(
    cycles.map(async (c) => {
      const { overall } = await cycleGoals(supabase, userId, c.id);
      return { ...c, overallProgress: overall };
    })
  );
  const rank = (c) => (c.isCurrent ? 0 : c.ended ? 2 : 1);
  return withGoals.sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (ra === 1) return a.start < b.start ? -1 : 1;
    return a.start < b.start ? 1 : -1;
  });
}

async function cycleForDate(supabase, userId, date) {
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('kind', 'custom')
    .lte('start_date', date)
    .gte('end_date', date)
    .limit(1);
  checkError(error);
  const c = data && data[0];
  return c ? mapCycleRow(c) : null;
}

async function findOrCreateYearCycle(supabase, userId, year) {
  const start = yearStart(year);
  const end = yearEnd(year);
  const { data: existing, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('kind', 'year')
    .eq('start_date', start)
    .maybeSingle();
  checkError(error);
  if (existing) return decorateCycle(mapCycleRow(existing));

  const { data, error: insertError } = await supabase
    .from('cycles')
    .insert({ user_id: userId, name: String(year), start_date: start, end_date: end, kind: 'year' })
    .select()
    .single();
  checkError(insertError);
  return decorateCycle(mapCycleRow(data));
}

async function yearGoals(supabase, userId, year) {
  const cycle = await findOrCreateYearCycle(supabase, userId, year);
  const { goals, overall } = await cycleGoals(supabase, userId, cycle.id);
  return { year, cycleId: cycle.id, goals, overall };
}

async function createCycle(supabase, userId, { name, start, end }) {
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
  const { data, error } = await supabase.from('cycles').insert({ user_id: userId, name, start_date: start, end_date: end }).select().single();
  checkError(error);
  return decorateCycle(mapCycleRow(data));
}

async function updateCycle(supabase, userId, id, { name, start, end }) {
  const { data: existing } = await supabase.from('cycles').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  if (!existing) notFound('Unknown cycle.');

  const patch = {};
  if (typeof name === 'string' && name.trim()) patch.name = name.trim();
  if (isValidDate(start)) patch.start_date = start;
  if (isValidDate(end)) patch.end_date = end;

  const nextStart = patch.start_date || existing.start_date;
  const nextEnd = patch.end_date || existing.end_date;
  if (nextEnd < nextStart) {
    const err = new Error('End date must be on or after the start date.');
    err.status = 400;
    throw err;
  }

  const { data, error } = await supabase.from('cycles').update(patch).eq('user_id', userId).eq('id', id).select().single();
  checkError(error);
  return decorateCycle(mapCycleRow(data));
}

async function deleteCycle(supabase, userId, id) {
  // cycle_notes and goals cascade.
  const { error } = await supabase.from('cycles').delete().eq('user_id', userId).eq('id', id);
  checkError(error);
  return { ok: true };
}

async function readCycle(supabase, userId, id) {
  const { data: row, error } = await supabase.from('cycles').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  checkError(error);
  if (!row) notFound('Unknown cycle.');
  const cycle = decorateCycle(mapCycleRow(row));

  const [notesRes, goalsRes] = await Promise.all([
    supabase.from('cycle_notes').select('content').eq('user_id', userId).eq('cycle_id', id).maybeSingle(),
    cycleGoals(supabase, userId, id),
  ]);
  checkError(notesRes.error);

  return { ...cycle, notes: notesRes.data ? notesRes.data.content : '', goals: goalsRes.goals, overallProgress: goalsRes.overall };
}

async function saveCycleNotes(supabase, userId, id, content) {
  const { data: cycle } = await supabase.from('cycles').select('end_date').eq('user_id', userId).eq('id', id).maybeSingle();
  if (!cycle) notFound('Unknown cycle.');
  if (cycle.end_date < todayStr()) {
    const err = new Error('This cycle has ended and is read-only.');
    err.status = 403;
    throw err;
  }
  const { error } = await supabase.from('cycle_notes').upsert({ user_id: userId, cycle_id: id, content }, { onConflict: 'cycle_id' });
  checkError(error);
  return { ok: true };
}

// --- goals ------------------------------------------------------------
function mapGoalRow(r) {
  const g = {
    id: r.id,
    cycleId: r.cycle_id,
    target: r.target == null ? null : Number(r.target),
    label: r.label,
    achieved: r.achieved,
    kind: r.habit_id ? 'habit' : r.project_id ? 'time' : 'manual',
  };
  if (r.project_id) g.projectId = r.project_id;
  else if (r.habit_id) g.habitId = r.habit_id;
  return g;
}

async function listGoals(supabase, userId, cycleId) {
  let q = supabase.from('goals').select('*').eq('user_id', userId);
  if (cycleId) q = q.eq('cycle_id', cycleId);
  const { data, error } = await q;
  checkError(error);
  return data.map(mapGoalRow);
}

async function createGoal(supabase, userId, { cycleId, habitId, projectId, target, label }) {
  const { data: cycle } = await supabase.from('cycles').select('id').eq('user_id', userId).eq('id', cycleId).maybeSingle();
  if (!cycle) {
    const err = new Error('Goal must belong to a valid cycle.');
    err.status = 400;
    throw err;
  }

  const isTime = !!projectId;
  const isManual = !projectId && !habitId;

  if (isManual) {
    label = String(label || '').trim();
    if (!label) {
      const err = new Error('A manual goal needs a label.');
      err.status = 400;
      throw err;
    }
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: userId, cycle_id: cycleId, target: null, label, achieved: false })
      .select()
      .single();
    checkError(error);
    return mapGoalRow(data);
  }

  if (isTime) {
    const { data: project } = await supabase.from('projects').select('id').eq('user_id', userId).eq('id', projectId).maybeSingle();
    if (!project) {
      const err = new Error('Goal must target a valid project.');
      err.status = 400;
      throw err;
    }
  } else {
    const { data: habit } = await supabase.from('habits').select('id').eq('user_id', userId).eq('id', habitId).maybeSingle();
    if (!habit) {
      const err = new Error('Goal must target a valid habit.');
      err.status = 400;
      throw err;
    }
  }

  const t = Number(target);
  if (!(t > 0)) {
    const err = new Error('Target must be a positive number.');
    err.status = 400;
    throw err;
  }

  const row = { user_id: userId, cycle_id: cycleId, target: t, label: String(label || '').trim() };
  if (isTime) row.project_id = projectId;
  else row.habit_id = habitId;

  const { data, error } = await supabase.from('goals').insert(row).select().single();
  checkError(error);
  return mapGoalRow(data);
}

async function updateGoal(supabase, userId, id, { target, label, habitId, projectId, achieved }) {
  const { data: existing } = await supabase.from('goals').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  if (!existing) notFound('Unknown goal.');

  const patch = {};
  if (target !== undefined) {
    const t = Number(target);
    if (!(t > 0)) {
      const err = new Error('Target must be a positive number.');
      err.status = 400;
      throw err;
    }
    patch.target = t;
  }
  if (typeof label === 'string') patch.label = label.trim();
  if (typeof achieved === 'boolean') patch.achieved = achieved;

  if (projectId) {
    const { data: project } = await supabase.from('projects').select('id').eq('user_id', userId).eq('id', projectId).maybeSingle();
    if (project) {
      patch.project_id = projectId;
      patch.habit_id = null;
    }
  } else if (habitId) {
    const { data: habit } = await supabase.from('habits').select('id').eq('user_id', userId).eq('id', habitId).maybeSingle();
    if (habit) {
      patch.habit_id = habitId;
      patch.project_id = null;
    }
  }

  const { data, error } = await supabase.from('goals').update(patch).eq('user_id', userId).eq('id', id).select().single();
  checkError(error);
  return mapGoalRow(data);
}

async function deleteGoal(supabase, userId, id) {
  const { error } = await supabase.from('goals').delete().eq('user_id', userId).eq('id', id);
  checkError(error);
  return { ok: true };
}

async function computeGoal(supabase, userId, goal, cyclesById, projectsById, habitsById) {
  const cycle = cyclesById.get(goal.cycleId);

  if (goal.kind === 'manual') {
    return { ...goal, habitName: goal.label, habitType: 'manual', unit: '', current: goal.achieved ? 1 : 0, pct: goal.achieved ? 100 : 0 };
  }

  if (goal.projectId) {
    const project = projectsById.get(goal.projectId);
    let seconds = 0;
    if (project && cycle) {
      // Roll up sub-projects' time too, same as the project overview's
      // parent cards — a goal on a parent project (e.g. "WHU") should count
      // time logged against its children, not just entries on the parent
      // project itself.
      const childIds = [...projectsById.values()].filter((p) => p.parentId === goal.projectId).map((p) => p.id);
      const { data, error } = await supabase
        .from('time_entries')
        .select('seconds')
        .eq('user_id', userId)
        .in('project_id', [goal.projectId, ...childIds])
        .gte('date', cycle.start)
        .lte('date', cycle.end);
      checkError(error);
      seconds = data.reduce((s, e) => s + (e.seconds || 0), 0);
    }
    const current = seconds / 3600;
    const pct = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;
    return { ...goal, habitName: project ? project.name : '(deleted project)', habitType: 'time', unit: 'h', current: Math.round(current * 100) / 100, pct };
  }

  const habit = habitsById.get(goal.habitId);
  let current = 0;
  if (habit && cycle) {
    const { data, error } = await supabase
      .from('habit_data')
      .select('value')
      .eq('user_id', userId)
      .eq('habit_id', goal.habitId)
      .gte('date', cycle.start)
      .lte('date', cycle.end);
    checkError(error);
    for (const r of data) {
      if (habit.type === 'check') current += r.value === true ? 1 : 0;
      else current += Number(r.value) || 0;
    }
  }
  const pct = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;
  // Checkbox habits never have a unit (only value habits do) — a goal
  // built on one is counting days done, so show that count as "#".
  const unit = habit ? (habit.type === 'check' ? '#' : habit.unit) : '';
  return { ...goal, habitName: habit ? habit.name : '(deleted habit)', habitType: habit ? habit.type : null, unit, current: Math.round(current * 100) / 100, pct };
}

async function cycleGoals(supabase, userId, cycleId) {
  const goals = await listGoals(supabase, userId, cycleId);
  if (!goals.length) return { goals: [], overall: null };

  const [cycles, projects, habits] = await Promise.all([listCyclesRaw(supabase, userId), readProjects(supabase, userId), readHabits(supabase, userId)]);
  const cyclesById = new Map(cycles.map((c) => [c.id, c]));
  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const habitsById = new Map(habits.map((h) => [h.id, h]));

  const computed = await Promise.all(goals.map((g) => computeGoal(supabase, userId, g, cyclesById, projectsById, habitsById)));
  const overall = computed.length ? Math.round(computed.reduce((s, g) => s + g.pct, 0) / computed.length) : null;
  return { goals: computed, overall };
}

// --- projects -----------------------------------------------------------
function mapProjectRow(r) {
  return { id: r.id, name: r.name, status: r.status, parentId: r.parent_id };
}

const PROJECT_STATUSES = ['active', 'onhold', 'archive'];

async function readProjects(supabase, userId) {
  const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: true });
  checkError(error);
  return data.map(mapProjectRow);
}

// Exactly two levels deep: a project that already has a parent can't itself
// become a parent, and a project that already has children can't be given a
// parent. Both checks need a same-user lookup, so they live here rather than
// as a DB constraint.
async function resolveParentId(supabase, userId, parentId, selfId) {
  if (!parentId) return null;
  if (parentId === selfId) {
    const err = new Error('A project cannot be its own parent.');
    err.status = 400;
    throw err;
  }
  const { data: parent } = await supabase.from('projects').select('id, parent_id').eq('user_id', userId).eq('id', parentId).maybeSingle();
  if (!parent) {
    const err = new Error('Unknown parent project.');
    err.status = 400;
    throw err;
  }
  if (parent.parent_id) {
    const err = new Error('That project is itself a sub-project — only two levels are supported.');
    err.status = 400;
    throw err;
  }
  if (selfId) {
    const { data: children } = await supabase.from('projects').select('id').eq('user_id', userId).eq('parent_id', selfId).limit(1);
    if (children && children.length) {
      const err = new Error('A project with sub-projects can\'t become a sub-project itself.');
      err.status = 400;
      throw err;
    }
  }
  return parentId;
}

async function createProject(supabase, userId, { name, status, parentId }) {
  name = String(name || '').trim();
  if (!name) {
    const err = new Error('Project name is required.');
    err.status = 400;
    throw err;
  }
  const resolvedParentId = await resolveParentId(supabase, userId, parentId, null);
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, name, status: PROJECT_STATUSES.includes(status) ? status : 'active', parent_id: resolvedParentId })
    .select()
    .single();
  checkError(error);
  return mapProjectRow(data);
}

async function updateProject(supabase, userId, id, { name, status, parentId }) {
  const { data: existing } = await supabase.from('projects').select('id').eq('user_id', userId).eq('id', id).maybeSingle();
  if (!existing) notFound('Unknown project.');
  const patch = {};
  if (typeof name === 'string' && name.trim()) patch.name = name.trim();
  if (PROJECT_STATUSES.includes(status)) patch.status = status;
  if (parentId !== undefined) patch.parent_id = await resolveParentId(supabase, userId, parentId, id);
  const { data, error } = await supabase.from('projects').update(patch).eq('user_id', userId).eq('id', id).select().single();
  checkError(error);
  return mapProjectRow(data);
}

async function deleteProject(supabase, userId, id) {
  // goals + project_notes cascade; time_entries/timer set project_id null (kept as
  // "(deleted project)"); sub-projects lose their parent_id and become top-level.
  const { error } = await supabase.from('projects').delete().eq('user_id', userId).eq('id', id);
  checkError(error);
  return { ok: true };
}

async function readProjectNotes(supabase, userId, id) {
  const { data, error } = await supabase.from('project_notes').select('content').eq('user_id', userId).eq('project_id', id).maybeSingle();
  checkError(error);
  return data ? data.content : '';
}

async function saveProjectNotes(supabase, userId, id, content) {
  const { data: project } = await supabase.from('projects').select('id').eq('user_id', userId).eq('id', id).maybeSingle();
  if (!project) notFound('Unknown project.');
  const { error } = await supabase.from('project_notes').upsert({ user_id: userId, project_id: id, content }, { onConflict: 'project_id' });
  checkError(error);
  return { ok: true };
}

// --- time tracking --------------------------------------------------------
async function dayTime(supabase, userId, date) {
  const [projects, entriesRes] = await Promise.all([readProjects(supabase, userId), supabase.from('time_entries').select('*').eq('user_id', userId).eq('date', date)]);
  checkError(entriesRes.error);
  const nameOf = (id) => (projects.find((p) => p.id === id) || {}).name || '(deleted project)';
  const entries = entriesRes.data.map((e) => ({ id: e.id, projectId: e.project_id, seconds: e.seconds, note: e.note, projectName: nameOf(e.project_id) }));
  const total = entries.reduce((s, e) => s + (e.seconds || 0), 0);
  return { entries, total };
}

async function addTime(supabase, userId, date, { projectId, seconds, note }) {
  requireNotFuture(date);
  const { data: project } = await supabase.from('projects').select('id').eq('user_id', userId).eq('id', projectId).maybeSingle();
  if (!project) {
    const err = new Error('Time must be linked to a valid project.');
    err.status = 400;
    throw err;
  }
  const s = Math.round(Number(seconds));
  if (!(s > 0)) {
    const err = new Error('Duration must be greater than zero.');
    err.status = 400;
    throw err;
  }
  const { data, error } = await supabase
    .from('time_entries')
    .insert({ user_id: userId, date, project_id: projectId, seconds: s, note: String(note || '').trim() })
    .select()
    .single();
  checkError(error);
  return { id: data.id, projectId: data.project_id, seconds: data.seconds, note: data.note };
}

async function deleteTime(supabase, userId, date, entryId) {
  requireNotFuture(date);
  const { error } = await supabase.from('time_entries').delete().eq('user_id', userId).eq('date', date).eq('id', entryId);
  checkError(error);
  return { ok: true };
}

async function updateTimeNote(supabase, userId, date, entryId, note) {
  requireNotFuture(date);
  const { data, error } = await supabase
    .from('time_entries')
    .update({ note: String(note || '').trim() })
    .eq('user_id', userId)
    .eq('date', date)
    .eq('id', entryId)
    .select()
    .maybeSingle();
  checkError(error);
  if (!data) notFound('Unknown time entry.');
  return { id: data.id, projectId: data.project_id, seconds: data.seconds, note: data.note };
}

async function timerState(supabase, userId) {
  const { data, error } = await supabase.from('timer').select('*').eq('user_id', userId).maybeSingle();
  checkError(error);
  if (!data) return null;
  const projects = await readProjects(supabase, userId);
  const project = projects.find((p) => p.id === data.project_id);
  const startedAt = new Date(data.started_at).getTime();
  return { projectId: data.project_id, projectName: project ? project.name : '(deleted project)', startedAt, elapsed: Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) };
}

async function startTimer(supabase, userId, projectId) {
  // The two checks are independent, so run them in parallel — and skip the
  // full timerState()/readProjects() round trip afterward, since we already
  // have everything the response needs from the checks we just made.
  const [{ data: existing }, { data: project }] = await Promise.all([
    supabase.from('timer').select('user_id').eq('user_id', userId).maybeSingle(),
    supabase.from('projects').select('id, name').eq('user_id', userId).eq('id', projectId).maybeSingle(),
  ]);
  if (existing) {
    const err = new Error('A timer is already running. Stop it first.');
    err.status = 409;
    throw err;
  }
  if (!project) {
    const err = new Error('Pick a valid project to track.');
    err.status = 400;
    throw err;
  }
  const startedAt = new Date();
  const { error } = await supabase.from('timer').insert({ user_id: userId, project_id: projectId, started_at: startedAt.toISOString() });
  checkError(error);
  return { projectId, projectName: project.name, startedAt: startedAt.getTime(), elapsed: 0 };
}

async function stopTimer(supabase, userId) {
  const { data: t, error } = await supabase.from('timer').select('*').eq('user_id', userId).maybeSingle();
  checkError(error);
  if (!t) {
    const err = new Error('No timer is running.');
    err.status = 400;
    throw err;
  }
  await supabase.from('timer').delete().eq('user_id', userId);
  const seconds = Math.floor((Date.now() - new Date(t.started_at).getTime()) / 1000);
  if (seconds < 1) return { ok: true, logged: false };
  const entry = await addTime(supabase, userId, todayStr(), { projectId: t.project_id, seconds });
  return { ok: true, logged: true, entry };
}

async function timeOverview(supabase, userId) {
  const [projects, entriesRes, cycles] = await Promise.all([
    readProjects(supabase, userId),
    supabase.from('time_entries').select('project_id, date, seconds').eq('user_id', userId),
    listCyclesRaw(supabase, userId),
  ]);
  checkError(entriesRes.error);

  const today = todayStr();
  const last7Start = addDays(today, -6);
  const cur = cycles.find((c) => c.start <= today && today <= c.end) || null;

  const buckets = {};
  for (const p of projects) buckets[p.id] = { id: p.id, name: p.name, status: p.status || 'active', parentId: p.parentId, total: 0, today: 0, last7: 0, cycle: 0 };

  for (const e of entriesRes.data) {
    const b = buckets[e.project_id];
    if (!b) continue;
    const s = e.seconds || 0;
    b.total += s;
    if (e.date === today) b.today += s;
    if (e.date >= last7Start && e.date <= today) b.last7 += s;
    if (cur && e.date >= cur.start && e.date <= cur.end) b.cycle += s;
  }

  // Parent cards show a rollup total (their own direct time + every child's),
  // alongside `total` etc which stay each project's own direct time only —
  // grandTotal below sums those direct figures so time isn't double-counted.
  for (const b of Object.values(buckets)) {
    b.rollup = { total: b.total, today: b.today, last7: b.last7, cycle: b.cycle };
  }
  for (const b of Object.values(buckets)) {
    if (!b.parentId) continue;
    const parent = buckets[b.parentId];
    if (!parent) continue;
    parent.rollup.total += b.total;
    parent.rollup.today += b.today;
    parent.rollup.last7 += b.last7;
    parent.rollup.cycle += b.cycle;
  }

  const list = Object.values(buckets).sort((a, b) => b.rollup.total - a.rollup.total);
  return { projects: list, grandTotal: list.reduce((s, b) => s + b.total, 0), currentCycle: cur ? { id: cur.id, name: cur.name } : null };
}

// --- weekly notes -----------------------------------------------------
async function listWeekNotes(supabase, userId) {
  const cws = currentWeekStart();
  const { data, error } = await supabase.from('week_notes').select('week_start').eq('user_id', userId);
  checkError(error);
  const withNote = new Set(data.map((r) => r.week_start));
  const weeks = new Set(withNote);
  weeks.add(cws);
  return [...weeks]
    .sort()
    .reverse()
    .map((ws) => ({ weekStart: ws, weekEnd: addDays(ws, 6), isCurrent: ws === cws, hasNote: withNote.has(ws) }));
}

async function weekTimeSummary(supabase, userId, ws) {
  const dates = weekDates(ws);
  const [projects, entriesRes] = await Promise.all([readProjects(supabase, userId), supabase.from('time_entries').select('*').eq('user_id', userId).gte('date', dates[0]).lte('date', dates[dates.length - 1])]);
  checkError(entriesRes.error);
  const nameOf = (id) => (projects.find((p) => p.id === id) || {}).name || '(deleted project)';

  const totals = new Map();
  let total = 0;
  for (const e of entriesRes.data) {
    let t = totals.get(e.project_id);
    if (!t) {
      t = { projectId: e.project_id, projectName: nameOf(e.project_id), seconds: 0, byNote: new Map() };
      totals.set(e.project_id, t);
    }
    t.seconds += e.seconds || 0;
    total += e.seconds || 0;
    const note = e.note || '';
    let group = t.byNote.get(note);
    if (!group) {
      group = { note, seconds: 0, dates: [] };
      t.byNote.set(note, group);
    }
    group.seconds += e.seconds || 0;
    group.dates.push(e.date);
  }
  const list = [...totals.values()]
    .map((t) => ({ projectId: t.projectId, projectName: t.projectName, seconds: t.seconds, entries: [...t.byNote.values()].map((g) => ({ note: g.note, seconds: g.seconds, dates: g.dates.sort() })).sort((a, b) => b.seconds - a.seconds) }))
    .sort((a, b) => b.seconds - a.seconds);
  return { projects: list, total };
}

async function weekHabitsSummary(supabase, userId, ws) {
  const dates = weekDates(ws);
  const [habits, dataRes] = await Promise.all([readHabits(supabase, userId), supabase.from('habit_data').select('habit_id, date, value').eq('user_id', userId).gte('date', dates[0]).lte('date', dates[dates.length - 1])]);
  checkError(dataRes.error);
  const byHabit = new Map();
  for (const r of dataRes.data) {
    if (!byHabit.has(r.habit_id)) byHabit.set(r.habit_id, new Map());
    byHabit.get(r.habit_id).set(r.date, r.value);
  }
  return habits.map((h) => {
    const values = {};
    const m = byHabit.get(h.id) || new Map();
    for (const date of dates) if (m.has(date)) values[date] = m.get(date);
    return { ...h, values };
  });
}

async function weekLearningsSummary(supabase, userId, ws) {
  const dates = weekDates(ws);
  const { data, error } = await supabase.from('day_learnings').select('date, content').eq('user_id', userId).gte('date', dates[0]).lte('date', dates[dates.length - 1]);
  checkError(error);
  const byDate = new Map(data.map((r) => [r.date, r.content]));
  return dates.map((date) => ({ date, content: byDate.get(date) || '' }));
}

async function readWeekNote(supabase, userId, ws) {
  const actual = weekStart(ws);
  const cws = currentWeekStart();
  const [noteRes, reflexionRes, time, habits, learnings] = await Promise.all([
    supabase.from('week_notes').select('content').eq('user_id', userId).eq('week_start', actual).maybeSingle(),
    supabase.from('week_reflexions').select('content').eq('user_id', userId).eq('week_start', actual).maybeSingle(),
    weekTimeSummary(supabase, userId, actual),
    weekHabitsSummary(supabase, userId, actual),
    weekLearningsSummary(supabase, userId, actual),
  ]);
  checkError(noteRes.error);
  checkError(reflexionRes.error);
  const editable = actual === cws;
  return {
    weekStart: actual,
    weekEnd: addDays(actual, 6),
    content: noteRes.data ? noteRes.data.content : '',
    reflexion: reflexionRes.data ? reflexionRes.data.content : '',
    time,
    habits,
    learnings,
    editable,
    isCurrent: editable,
  };
}

async function saveWeekNote(supabase, userId, ws, content) {
  const actual = weekStart(ws);
  if (actual !== currentWeekStart()) {
    const err = new Error("Only this week's notes are editable.");
    err.status = 403;
    throw err;
  }
  const { error } = await supabase.from('week_notes').upsert({ user_id: userId, week_start: actual, content }, { onConflict: 'user_id,week_start' });
  checkError(error);
  return { ok: true, weekStart: actual };
}

async function saveWeekReflexion(supabase, userId, ws, content) {
  const actual = weekStart(ws);
  if (actual !== currentWeekStart()) {
    const err = new Error("Only this week's reflexion is editable.");
    err.status = 403;
    throw err;
  }
  const { error } = await supabase.from('week_reflexions').upsert({ user_id: userId, week_start: actual, content }, { onConflict: 'user_id,week_start' });
  checkError(error);
  return { ok: true, weekStart: actual };
}

// --- checklists (Life > Checklist tab) ------------------------------------
async function createChecklist(supabase, userId, { name }) {
  name = String(name || '').trim();
  if (!name) {
    const err = new Error('Checklist name is required.');
    err.status = 400;
    throw err;
  }
  const { data, error } = await supabase.from('checklists').insert({ user_id: userId, name }).select().single();
  checkError(error);
  return { id: data.id, name: data.name, items: [] };
}

async function renameChecklist(supabase, userId, id, name) {
  name = String(name || '').trim();
  const { data: existing } = await supabase.from('checklists').select('id, name').eq('user_id', userId).eq('id', id).maybeSingle();
  if (!existing) notFound('Unknown checklist.');
  const items = await listChecklistItemsRaw(supabase, userId, id);
  if (!name) return { id: existing.id, name: existing.name, items };
  const { data, error } = await supabase.from('checklists').update({ name }).eq('user_id', userId).eq('id', id).select().single();
  checkError(error);
  return { id: data.id, name: data.name, items };
}

async function listChecklistItemsRaw(supabase, userId, checklistId) {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('id, text')
    .eq('user_id', userId)
    .eq('checklist_id', checklistId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  checkError(error);
  return data;
}

async function deleteChecklist(supabase, userId, id) {
  const { error } = await supabase.from('checklists').delete().eq('user_id', userId).eq('id', id);
  checkError(error);
  return { ok: true };
}

async function addChecklistItem(supabase, userId, checklistId, text) {
  text = String(text || '').trim();
  if (!text) {
    const err = new Error('Item text is required.');
    err.status = 400;
    throw err;
  }
  const { data: cl } = await supabase.from('checklists').select('id').eq('user_id', userId).eq('id', checklistId).maybeSingle();
  if (!cl) notFound('Unknown checklist.');
  const { data: last } = await supabase
    .from('checklist_items')
    .select('position')
    .eq('user_id', userId)
    .eq('checklist_id', checklistId)
    .order('position', { ascending: false })
    .limit(1);
  const position = last && last.length ? last[0].position + 1 : 0;
  const { data, error } = await supabase.from('checklist_items').insert({ user_id: userId, checklist_id: checklistId, text, position }).select().single();
  checkError(error);
  return { id: data.id, text: data.text };
}

// Persists the item order after a drag-and-drop reorder — `itemIds` is the
// full list for this checklist in its new order. IDs that don't actually
// belong to this checklist/user are silently ignored rather than erroring,
// so a stray id can't be used to touch someone else's item.
async function reorderChecklistItems(supabase, userId, checklistId, itemIds) {
  const { data: cl } = await supabase.from('checklists').select('id').eq('user_id', userId).eq('id', checklistId).maybeSingle();
  if (!cl) notFound('Unknown checklist.');
  if (!Array.isArray(itemIds) || !itemIds.length) {
    const err = new Error('itemIds must be a non-empty array.');
    err.status = 400;
    throw err;
  }
  const { data: existing, error: existingError } = await supabase.from('checklist_items').select('id').eq('user_id', userId).eq('checklist_id', checklistId);
  checkError(existingError);
  const validIds = new Set(existing.map((r) => r.id));
  const ordered = itemIds.filter((id) => validIds.has(id));
  const results = await Promise.all(
    ordered.map((id, position) => supabase.from('checklist_items').update({ position }).eq('user_id', userId).eq('checklist_id', checklistId).eq('id', id))
  );
  for (const r of results) checkError(r.error);
  return { ok: true };
}

async function renameChecklistItem(supabase, userId, checklistId, itemId, text) {
  text = String(text || '').trim();
  const { data: item } = await supabase.from('checklist_items').select('id, text').eq('user_id', userId).eq('checklist_id', checklistId).eq('id', itemId).maybeSingle();
  if (!item) notFound('Unknown item.');
  if (!text) return { id: item.id, text: item.text };
  const { data, error } = await supabase.from('checklist_items').update({ text }).eq('user_id', userId).eq('id', itemId).select().single();
  checkError(error);
  return { id: data.id, text: data.text };
}

async function deleteChecklistItem(supabase, userId, checklistId, itemId) {
  const { error } = await supabase.from('checklist_items').delete().eq('user_id', userId).eq('checklist_id', checklistId).eq('id', itemId);
  checkError(error);
  return { ok: true };
}

async function setChecklistItemChecked(supabase, userId, itemId, checked) {
  const date = todayStr();
  if (checked) {
    const { error } = await supabase.from('checklist_checks').upsert({ user_id: userId, item_id: itemId, date }, { onConflict: 'user_id,item_id,date' });
    checkError(error);
  } else {
    const { error } = await supabase.from('checklist_checks').delete().eq('user_id', userId).eq('item_id', itemId).eq('date', date);
    checkError(error);
  }
  return { ok: true };
}

async function listChecklistsToday(supabase, userId) {
  const date = todayStr();
  const [clRes, itemsRes, checksRes] = await Promise.all([
    supabase.from('checklists').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('checklist_items').select('*').eq('user_id', userId).order('position', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('checklist_checks').select('item_id').eq('user_id', userId).eq('date', date),
  ]);
  checkError(clRes.error);
  checkError(itemsRes.error);
  checkError(checksRes.error);
  const checkedIds = new Set(checksRes.data.map((c) => c.item_id));
  return clRes.data.map((cl) => ({
    id: cl.id,
    name: cl.name,
    items: itemsRes.data.filter((i) => i.checklist_id === cl.id).map((i) => ({ id: i.id, text: i.text, checked: checkedIds.has(i.id) })),
  }));
}

// --- reflections (freeform notes that don't fit any other tab) -----------
async function listReflections(supabase, userId) {
  const { data, error } = await supabase
    .from('reflections')
    .select('id, content, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  checkError(error);
  return data;
}

async function createReflection(supabase, userId, { content } = {}) {
  const { data, error } = await supabase
    .from('reflections')
    .insert({ user_id: userId, content: String(content || '') })
    .select('id, content, created_at, updated_at')
    .single();
  checkError(error);
  return data;
}

async function updateReflection(supabase, userId, id, content) {
  const { data, error } = await supabase
    .from('reflections')
    .update({ content: String(content || ''), updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id)
    .select('id, content, created_at, updated_at')
    .maybeSingle();
  checkError(error);
  if (!data) notFound('Unknown reflection.');
  return data;
}

async function deleteReflection(supabase, userId, id) {
  const { error } = await supabase.from('reflections').delete().eq('user_id', userId).eq('id', id);
  checkError(error);
  return { ok: true };
}

// --- account (export + delete) --------------------------------------------
// Every table with a user_id column, per supabase/migrations/0001_init.sql
// (0003/0004 only add columns to existing tables, no new ones). okrs is
// included even though the feature was removed — a user could still have
// old rows there, and this is meant to be a complete export.
const ACCOUNT_TABLES = [
  'entries', 'day_summaries', 'day_learnings', 'day_reflexions',
  'week_notes', 'week_reflexions',
  'cycles', 'cycle_notes', 'okrs', 'goals',
  'habits', 'habit_notes', 'habit_data',
  'projects', 'project_notes', 'time_entries', 'timer',
  'checklists', 'checklist_items', 'checklist_checks',
  'reflections',
];

async function exportUserData(supabase, userId) {
  const results = await Promise.all(
    ACCOUNT_TABLES.map((table) => supabase.from(table).select('*').eq('user_id', userId))
  );
  const out = {};
  ACCOUNT_TABLES.forEach((table, i) => {
    checkError(results[i].error);
    out[table] = results[i].data;
  });
  return out;
}

// Deletes the auth.users row via the admin API (needs the service-role
// key — see lib/supabase.js). Every table above has its user_id FK set
// on delete cascade, so this one call wipes all of the user's data too.
async function deleteAccount(userId) {
  const { error } = await adminClient().auth.admin.deleteUser(userId);
  if (error) {
    const err = new Error(error.message);
    err.status = 500;
    throw err;
  }
  return { ok: true };
}

module.exports = {
  // entries & per-day writeups
  listEntries,
  readEntry,
  saveEntry,
  saveSummary,
  listRecaps,
  listAllLearnings,
  saveLearnings,
  saveReflexion,
  // habits
  readHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  reorderHabits,
  readHabitNotes,
  saveHabitNotes,
  setHabitValue,
  habitOverview,
  // cycles
  listCycles,
  createCycle,
  updateCycle,
  deleteCycle,
  readCycle,
  saveCycleNotes,
  // yearly goals
  yearGoals,
  // goals
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  cycleGoals,
  // projects
  readProjects,
  createProject,
  updateProject,
  deleteProject,
  readProjectNotes,
  saveProjectNotes,
  // time tracking
  addTime,
  deleteTime,
  updateTimeNote,
  timerState,
  startTimer,
  stopTimer,
  timeOverview,
  // weekly notes
  listWeekNotes,
  readWeekNote,
  saveWeekNote,
  saveWeekReflexion,
  // checklists
  createChecklist,
  renameChecklist,
  deleteChecklist,
  addChecklistItem,
  renameChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
  setChecklistItemChecked,
  listChecklistsToday,
  // reflections
  listReflections,
  createReflection,
  updateReflection,
  deleteReflection,
  // account
  exportUserData,
  deleteAccount,
};

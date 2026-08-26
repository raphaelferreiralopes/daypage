#!/usr/bin/env node
'use strict';

// One-off import of the old flat-file journal (entries/, habits.json, ...)
// into a single Supabase account. Run once, manually, against production —
// see the "Verification" section this prints at the end.
//
// Usage:
//   node --env-file=.env scripts/migrate-to-supabase.js you@example.com
//
// The account must already exist (sign up in the app first). This uses the
// service_role key, which bypasses RLS by design — that's what lets a
// single run tag every row with your user_id.

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { weekStart, isValidDate } = require('../lib/dates');

const ROOT = path.join(__dirname, '..');
const DATE_FILE_RE = /^(\d{4}-\d{2}-\d{2})\.(\w+)$/;

function readJSON(file, fallback) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.warn(`  ! could not parse ${file}: ${e.message}`);
    return fallback;
  }
}

// Every file in `dir` named YYYY-MM-DD.<ext>, as [{ date, content }], sorted.
function readDatedFiles(dir, ext) {
  const p = path.join(ROOT, dir);
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p)
    .map((f) => {
      const m = f.match(DATE_FILE_RE);
      return m && m[2] === ext && isValidDate(m[1]) ? { date: m[1], content: fs.readFileSync(path.join(p, f), 'utf8') } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

// Every file in `dir` named <id>.<ext>, as a Map(id -> content).
function readIdFiles(dir, ext) {
  const p = path.join(ROOT, dir);
  const out = new Map();
  if (!fs.existsSync(p)) return out;
  for (const f of fs.readdirSync(p)) {
    if (!f.endsWith(`.${ext}`)) continue;
    const id = f.slice(0, -(ext.length + 1));
    out.set(id, fs.readFileSync(path.join(p, f), 'utf8'));
  }
  return out;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Upsert (not plain insert) for tables with a natural unique key: if you
// poked at the live app before running this — even just opening today's
// page can autosave an empty draft — that row already exists, and the
// import should overwrite it with the local file's content rather than
// fail on a duplicate-key error.
async function insertBatch(admin, table, rows, label, onConflict) {
  if (!rows.length) {
    console.log(`  ${label}: 0`);
    return;
  }
  for (const part of chunk(rows, 500)) {
    const { error } = onConflict ? await admin.from(table).upsert(part, { onConflict }) : await admin.from(table).insert(part);
    if (error) throw new Error(`insert into ${table} failed: ${error.message}`);
  }
  console.log(`  ${label}: ${rows.length}`);
}

async function findUserByEmail(admin, email) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < perPage) return null;
    page++;
  }
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node --env-file=.env scripts/migrate-to-supabase.js <your-account-email>');
    process.exit(1);
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set — run with `node --env-file=.env ...`.');
    process.exit(1);
  }

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const user = await findUserByEmail(admin, email);
  if (!user) {
    console.error(`No account found for ${email}. Sign up in the app first, then re-run this.`);
    process.exit(1);
  }
  const userId = user.id;

  // cycles/habits/projects/etc. have no natural unique key tied to the old
  // file-based ids, so re-running this against an account that already has
  // data would duplicate everything rather than skip or merge. Refuse unless
  // told otherwise.
  const { count: existingCycles } = await admin.from('cycles').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if (existingCycles > 0 && process.argv[3] !== '--force') {
    console.error(
      `${email} already has ${existingCycles} cycle(s) in the database. Re-running would duplicate cycles/habits/projects/goals/checklists.\n` +
        'If you specifically want to wipe and re-import, delete this user\'s rows first, or pass --force to skip this check.'
    );
    process.exit(1);
  }

  console.log(`Migrating local data into ${email} (${userId})\n`);

  const localCounts = {};

  // --- cycles --------------------------------------------------------
  const cycles = readJSON('cycles.json', []);
  const cycleIdMap = new Map();
  {
    const rows = cycles.map((c) => ({ user_id: userId, name: c.name, start_date: c.start, end_date: c.end }));
    if (rows.length) {
      const { data, error } = await admin.from('cycles').insert(rows).select('id');
      if (error) throw new Error(`insert into cycles failed: ${error.message}`);
      cycles.forEach((c, i) => cycleIdMap.set(c.id, data[i].id));
    }
    console.log(`  cycles: ${rows.length}`);
    localCounts.cycles = rows.length;
  }

  // --- okrs ------------------------------------------------------------
  const okrs = readJSON('okrs.json', []);
  const okrIdMap = new Map();
  {
    const valid = okrs.filter((o) => cycleIdMap.has(o.cycleId));
    if (valid.length) {
      const rows = valid.map((o) => ({ user_id: userId, cycle_id: cycleIdMap.get(o.cycleId), title: o.title }));
      const { data, error } = await admin.from('okrs').insert(rows).select('id');
      if (error) throw new Error(`insert into okrs failed: ${error.message}`);
      valid.forEach((o, i) => okrIdMap.set(o.id, data[i].id));
    }
    console.log(`  okrs: ${valid.length}${valid.length !== okrs.length ? ` (skipped ${okrs.length - valid.length}, unknown cycle)` : ''}`);
    localCounts.okrs = okrs.length;
  }

  // --- projects ------------------------------------------------------
  const projects = readJSON('projects.json', []);
  const projectIdMap = new Map();
  {
    const rows = projects.map((p) => ({ user_id: userId, name: p.name, status: p.status || 'active' }));
    if (rows.length) {
      const { data, error } = await admin.from('projects').insert(rows).select('id');
      if (error) throw new Error(`insert into projects failed: ${error.message}`);
      projects.forEach((p, i) => projectIdMap.set(p.id, data[i].id));
    }
    console.log(`  projects: ${rows.length}`);
    localCounts.projects = rows.length;
  }

  // --- habits ----------------------------------------------------------
  const habits = readJSON('habits.json', []);
  const habitIdMap = new Map();
  {
    const rows = habits.map((h, i) => ({
      user_id: userId,
      name: h.name,
      type: h.type === 'value' ? 'value' : 'check',
      unit: h.unit || '',
      okr_id: h.okrId && okrIdMap.has(h.okrId) ? okrIdMap.get(h.okrId) : null,
      position: i,
    }));
    if (rows.length) {
      const { data, error } = await admin.from('habits').insert(rows).select('id');
      if (error) throw new Error(`insert into habits failed: ${error.message}`);
      habits.forEach((h, i) => habitIdMap.set(h.id, data[i].id));
    }
    console.log(`  habits: ${rows.length}`);
    localCounts.habits = rows.length;
  }

  // --- habit notes -------------------------------------------------------
  {
    const notes = readIdFiles('habit-notes', 'md');
    const rows = [];
    for (const [oldId, content] of notes) {
      if (habitIdMap.has(oldId) && content.trim()) rows.push({ user_id: userId, habit_id: habitIdMap.get(oldId), content });
    }
    await insertBatch(admin, 'habit_notes', rows, 'habit notes', 'habit_id');
    localCounts.habitNotes = notes.size;
  }

  // --- habit data (per-day check-ins / values) --------------------------
  {
    const dir = path.join(ROOT, 'habit-data');
    const rows = [];
    let fileCount = 0;
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        const m = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
        if (!m || !isValidDate(m[1])) continue;
        fileCount++;
        const dayData = readJSON(path.join('habit-data', f), {});
        for (const [oldHabitId, value] of Object.entries(dayData)) {
          if (!habitIdMap.has(oldHabitId)) continue;
          rows.push({ user_id: userId, habit_id: habitIdMap.get(oldHabitId), date: m[1], value });
        }
      }
    }
    await insertBatch(admin, 'habit_data', rows, 'habit_data rows', 'user_id,habit_id,date');
    localCounts.habitDataFiles = fileCount;
  }

  // --- goals -------------------------------------------------------------
  {
    const goals = readJSON('goals.json', []);
    const rows = [];
    for (const g of goals) {
      if (!cycleIdMap.has(g.cycleId)) continue;
      const row = { user_id: userId, cycle_id: cycleIdMap.get(g.cycleId), target: g.target, label: g.label || '' };
      if (g.projectId) {
        if (!projectIdMap.has(g.projectId)) continue;
        row.project_id = projectIdMap.get(g.projectId);
      } else {
        if (!g.habitId || !habitIdMap.has(g.habitId)) continue;
        row.habit_id = habitIdMap.get(g.habitId);
      }
      rows.push(row);
    }
    await insertBatch(admin, 'goals', rows, 'goals');
    localCounts.goals = goals.length;
  }

  // --- cycle notes ---------------------------------------------------
  {
    const notes = readIdFiles('cycle-notes', 'md');
    const rows = [];
    for (const [oldId, content] of notes) {
      if (cycleIdMap.has(oldId) && content.trim()) rows.push({ user_id: userId, cycle_id: cycleIdMap.get(oldId), content });
    }
    await insertBatch(admin, 'cycle_notes', rows, 'cycle notes', 'cycle_id');
  }

  // --- project notes -------------------------------------------------
  {
    const notes = readIdFiles('project-notes', 'md');
    const rows = [];
    for (const [oldId, content] of notes) {
      if (projectIdMap.has(oldId) && content.trim()) rows.push({ user_id: userId, project_id: projectIdMap.get(oldId), content });
    }
    await insertBatch(admin, 'project_notes', rows, 'project notes', 'project_id');
  }

  // --- time entries ----------------------------------------------------
  {
    const dir = path.join(ROOT, 'time-entries');
    const rows = [];
    let fileCount = 0;
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        const m = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
        if (!m || !isValidDate(m[1])) continue;
        fileCount++;
        const entries = readJSON(path.join('time-entries', f), []);
        for (const e of entries) {
          if (!(e.seconds > 0)) continue;
          rows.push({ user_id: userId, date: m[1], project_id: projectIdMap.get(e.projectId) || null, seconds: Math.round(e.seconds), note: e.note || '' });
        }
      }
    }
    await insertBatch(admin, 'time_entries', rows, 'time entries');
    localCounts.timeEntryFiles = fileCount;
  }

  // --- running timer (rare to have one mid-migration, but be complete) --
  {
    const timer = readJSON('timer.json', null);
    if (timer && timer.projectId && timer.startedAt) {
      const { error } = await admin
        .from('timer')
        .upsert({ user_id: userId, project_id: projectIdMap.get(timer.projectId) || null, started_at: new Date(timer.startedAt).toISOString() }, { onConflict: 'user_id' });
      if (error) throw new Error(`insert into timer failed: ${error.message}`);
      console.log('  timer: 1 (running)');
    } else {
      console.log('  timer: 0');
    }
  }

  // --- daily entries + per-day writeups --------------------------------
  {
    const entries = readDatedFiles('entries', 'md');
    await insertBatch(admin, 'entries', entries.map((e) => ({ user_id: userId, date: e.date, content: e.content })), 'entries', 'user_id,date');
    localCounts.entries = entries.length;
  }
  {
    const summaries = readDatedFiles('day-summaries', 'txt');
    const rows = summaries.filter((s) => s.content.trim()).map((s) => ({ user_id: userId, date: s.date, text: s.content }));
    await insertBatch(admin, 'day_summaries', rows, 'day summaries (recaps)', 'user_id,date');
    localCounts.daySummaries = summaries.length;
  }
  {
    const learnings = readDatedFiles('day-learnings', 'md');
    const rows = learnings.filter((s) => s.content.trim()).map((s) => ({ user_id: userId, date: s.date, content: s.content }));
    await insertBatch(admin, 'day_learnings', rows, 'day learnings', 'user_id,date');
    localCounts.dayLearnings = learnings.length;
  }
  {
    const reflexions = readDatedFiles('day-reflexions', 'md');
    const rows = reflexions.filter((s) => s.content.trim()).map((s) => ({ user_id: userId, date: s.date, content: s.content }));
    await insertBatch(admin, 'day_reflexions', rows, 'day reflexions', 'user_id,date');
    localCounts.dayReflexions = reflexions.length;
  }

  // --- weekly notes/reflexions ------------------------------------------
  // weekStart() normalizes any date within a week to that week's Monday, so
  // this collapses old Thursday-anchored filenames onto the same row as a
  // same-week Monday-anchored one (last file processed wins, alphabetically).
  {
    const notes = readDatedFiles('week-notes', 'md').filter((n) => n.content.trim());
    const byWeek = new Map();
    for (const n of notes) byWeek.set(weekStart(n.date), n.content);
    const rows = [...byWeek.entries()].map(([week_start, content]) => ({ user_id: userId, week_start, content }));
    await insertBatch(admin, 'week_notes', rows, 'week notes', 'user_id,week_start');
    if (byWeek.size !== notes.length) console.log(`    (collapsed ${notes.length} files onto ${byWeek.size} weeks)`);
  }
  {
    const reflexions = readDatedFiles('week-reflexions', 'md').filter((n) => n.content.trim());
    const byWeek = new Map();
    for (const n of reflexions) byWeek.set(weekStart(n.date), n.content);
    const rows = [...byWeek.entries()].map(([week_start, content]) => ({ user_id: userId, week_start, content }));
    await insertBatch(admin, 'week_reflexions', rows, 'week reflexions', 'user_id,week_start');
  }

  // --- checklists ----------------------------------------------------
  const checklists = readJSON('checklists.json', []);
  const checklistItemIdMap = new Map();
  {
    let itemCount = 0;
    for (const cl of checklists) {
      const { data: clRow, error: clErr } = await admin.from('checklists').insert({ user_id: userId, name: cl.name }).select('id').single();
      if (clErr) throw new Error(`insert into checklists failed: ${clErr.message}`);
      const items = cl.items || [];
      if (items.length) {
        const { data: itemRows, error: itemErr } = await admin
          .from('checklist_items')
          .insert(items.map((it) => ({ user_id: userId, checklist_id: clRow.id, text: it.text })))
          .select('id');
        if (itemErr) throw new Error(`insert into checklist_items failed: ${itemErr.message}`);
        items.forEach((it, i) => checklistItemIdMap.set(it.id, itemRows[i].id));
        itemCount += items.length;
      }
    }
    console.log(`  checklists: ${checklists.length} (${itemCount} items)`);
  }

  // --- checklist checks (today-only in the old app, but keep history) ---
  {
    const dir = path.join(ROOT, 'checklist-data');
    const rows = [];
    let fileCount = 0;
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        const m = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
        if (!m || !isValidDate(m[1])) continue;
        fileCount++;
        const dayData = readJSON(path.join('checklist-data', f), {});
        for (const [oldItemId, checked] of Object.entries(dayData)) {
          if (checked && checklistItemIdMap.has(oldItemId)) rows.push({ user_id: userId, item_id: checklistItemIdMap.get(oldItemId), date: m[1] });
        }
      }
    }
    await insertBatch(admin, 'checklist_checks', rows, 'checklist checks', 'user_id,item_id,date');
    localCounts.checklistDataFiles = fileCount;
  }

  console.log('\nDone. Spot-check against the local file counts above, e.g.:');
  console.log(`  entries/*.md files on disk:      ${localCounts.entries}`);
  console.log(`  habit-data/*.json files on disk: ${localCounts.habitDataFiles}`);
  console.log(`  time-entries/*.json on disk:     ${localCounts.timeEntryFiles}`);
  console.log('\nIf those match the row counts printed above, the import is complete.');
}

main().catch((e) => {
  console.error('\nMigration failed:', e.message);
  process.exit(1);
});

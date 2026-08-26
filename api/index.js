'use strict';

const express = require('express');
const { requireAuth } = require('../lib/auth');
const { isValidDate } = require('../lib/dates');
const db = require('../lib/db');

const app = express();
app.use(express.json({ limit: '5mb' }));

// Public: the browser needs the project URL + anon key before it can even
// sign in. Neither is secret — they're meant to be visible to the client,
// same as any Supabase browser app — access control comes from RLS, not
// from hiding these values.
app.get('/api/config', (req, res) => {
  res.json({ url: process.env.SUPABASE_URL, anonKey: process.env.SUPABASE_ANON_KEY });
});

app.use('/api', requireAuth);

// Wraps an async handler so a thrown/rejected error (with an optional
// `.status`) becomes a JSON error response instead of an unhandled rejection.
function h(fn) {
  return (req, res) => {
    Promise.resolve(fn(req, res)).catch((e) => {
      res.status(e.status || 500).json({ error: e.message });
    });
  };
}

function badDate(res) {
  return res.status(400).json({ error: 'Bad date' });
}

// --- entries ---------------------------------------------------------------
app.get('/api/entries', h(async (req, res) => res.json(await db.listEntries(req.supabase, req.userId))));

app.get(
  '/api/entry/:date',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    res.json(await db.readEntry(req.supabase, req.userId, req.params.date));
  })
);

app.post(
  '/api/entry/:date',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'content must be a string' });
    res.json(await db.saveEntry(req.supabase, req.userId, req.params.date, req.body.content));
  })
);

app.post(
  '/api/summary/:date',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    if (typeof req.body.text !== 'string') return res.status(400).json({ error: 'text must be a string' });
    res.json(await db.saveSummary(req.supabase, req.userId, req.params.date, req.body.text));
  })
);

app.get('/api/recaps', h(async (req, res) => res.json(await db.listRecaps(req.supabase, req.userId))));

app.post(
  '/api/learnings/:date',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'content must be a string' });
    res.json(await db.saveLearnings(req.supabase, req.userId, req.params.date, req.body.content));
  })
);

app.post(
  '/api/reflexion/:date',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'content must be a string' });
    res.json(await db.saveReflexion(req.supabase, req.userId, req.params.date, req.body.content));
  })
);

// --- habits ------------------------------------------------------------
app.get('/api/habits', h(async (req, res) => res.json(await db.readHabits(req.supabase, req.userId))));
app.post('/api/habits', h(async (req, res) => res.json(await db.createHabit(req.supabase, req.userId, req.body))));

app.get('/api/habits/:id/notes', h(async (req, res) => res.json({ content: await db.readHabitNotes(req.supabase, req.userId, req.params.id) })));
app.post(
  '/api/habits/:id/notes',
  h(async (req, res) => {
    if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'content must be a string' });
    res.json(await db.saveHabitNotes(req.supabase, req.userId, req.params.id, req.body.content));
  })
);

app.get('/api/overview', h(async (req, res) => res.json(await db.habitOverview(req.supabase, req.userId, req.query.days))));

// must come before /api/habits/:id so "order" isn't treated as an id
app.put('/api/habits/order', h(async (req, res) => res.json(await db.reorderHabits(req.supabase, req.userId, req.body.ids))));

app.put('/api/habits/:id', h(async (req, res) => res.json(await db.updateHabit(req.supabase, req.userId, req.params.id, req.body))));
app.delete('/api/habits/:id', h(async (req, res) => res.json(await db.deleteHabit(req.supabase, req.userId, req.params.id))));

app.post(
  '/api/habit/:date',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    res.json(await db.setHabitValue(req.supabase, req.userId, req.params.date, req.body.habitId, req.body.value));
  })
);

// --- cycles ------------------------------------------------------------
app.get('/api/cycles', h(async (req, res) => res.json(await db.listCycles(req.supabase, req.userId))));
app.post('/api/cycles', h(async (req, res) => res.json(await db.createCycle(req.supabase, req.userId, req.body))));
app.put('/api/cycles/:id', h(async (req, res) => res.json(await db.updateCycle(req.supabase, req.userId, req.params.id, req.body))));
app.delete('/api/cycles/:id', h(async (req, res) => res.json(await db.deleteCycle(req.supabase, req.userId, req.params.id))));

app.get('/api/cycle/:id', h(async (req, res) => res.json(await db.readCycle(req.supabase, req.userId, req.params.id))));
app.post(
  '/api/cycle/:id/notes',
  h(async (req, res) => {
    if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'content must be a string' });
    res.json(await db.saveCycleNotes(req.supabase, req.userId, req.params.id, req.body.content));
  })
);

// --- OKRs ----------------------------------------------------------------
app.get('/api/okrs', h(async (req, res) => res.json(await db.listOkrs(req.supabase, req.userId, req.query.cycleId))));
app.post('/api/okrs', h(async (req, res) => res.json(await db.createOkr(req.supabase, req.userId, req.body))));
app.put('/api/okrs/:id', h(async (req, res) => res.json(await db.updateOkr(req.supabase, req.userId, req.params.id, req.body))));
app.delete('/api/okrs/:id', h(async (req, res) => res.json(await db.deleteOkr(req.supabase, req.userId, req.params.id))));

// --- goals -------------------------------------------------------------
app.get(
  '/api/goals',
  h(async (req, res) => {
    const { goals } = await db.cycleGoals(req.supabase, req.userId, req.query.cycleId);
    res.json(goals);
  })
);
app.post('/api/goals', h(async (req, res) => res.json(await db.createGoal(req.supabase, req.userId, req.body))));
app.put('/api/goals/:id', h(async (req, res) => res.json(await db.updateGoal(req.supabase, req.userId, req.params.id, req.body))));
app.delete('/api/goals/:id', h(async (req, res) => res.json(await db.deleteGoal(req.supabase, req.userId, req.params.id))));

// --- checklists (Life > Checklist tab) ------------------------------------
app.get('/api/checklists', h(async (req, res) => res.json(await db.listChecklistsToday(req.supabase, req.userId))));
app.post('/api/checklists', h(async (req, res) => res.json(await db.createChecklist(req.supabase, req.userId, req.body))));
app.put('/api/checklists/:id', h(async (req, res) => res.json(await db.renameChecklist(req.supabase, req.userId, req.params.id, req.body.name))));
app.delete('/api/checklists/:id', h(async (req, res) => res.json(await db.deleteChecklist(req.supabase, req.userId, req.params.id))));

app.post('/api/checklists/:id/items', h(async (req, res) => res.json(await db.addChecklistItem(req.supabase, req.userId, req.params.id, req.body.text))));
app.put('/api/checklists/:id/items/:itemId', h(async (req, res) => res.json(await db.renameChecklistItem(req.supabase, req.userId, req.params.id, req.params.itemId, req.body.text))));
app.delete('/api/checklists/:id/items/:itemId', h(async (req, res) => res.json(await db.deleteChecklistItem(req.supabase, req.userId, req.params.id, req.params.itemId))));

app.post('/api/checklist-check', h(async (req, res) => res.json(await db.setChecklistItemChecked(req.supabase, req.userId, req.body.itemId, req.body.checked))));

// --- projects ------------------------------------------------------------
app.get('/api/projects', h(async (req, res) => res.json(await db.readProjects(req.supabase, req.userId))));
app.post('/api/projects', h(async (req, res) => res.json(await db.createProject(req.supabase, req.userId, req.body))));
app.put('/api/projects/:id', h(async (req, res) => res.json(await db.updateProject(req.supabase, req.userId, req.params.id, req.body))));
app.delete('/api/projects/:id', h(async (req, res) => res.json(await db.deleteProject(req.supabase, req.userId, req.params.id))));

app.get('/api/projects/:id/notes', h(async (req, res) => res.json({ content: await db.readProjectNotes(req.supabase, req.userId, req.params.id) })));
app.post(
  '/api/projects/:id/notes',
  h(async (req, res) => {
    if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'content must be a string' });
    res.json(await db.saveProjectNotes(req.supabase, req.userId, req.params.id, req.body.content));
  })
);

// --- time overview & timer -------------------------------------------------
app.get('/api/time-overview', h(async (req, res) => res.json(await db.timeOverview(req.supabase, req.userId))));

app.get('/api/timer', h(async (req, res) => res.json(await db.timerState(req.supabase, req.userId))));
app.post('/api/timer/start', h(async (req, res) => res.json(await db.startTimer(req.supabase, req.userId, req.body.projectId))));
app.post('/api/timer/stop', h(async (req, res) => res.json(await db.stopTimer(req.supabase, req.userId))));

// --- manual time entries ---------------------------------------------------
app.post(
  '/api/time/:date',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    res.json(await db.addTime(req.supabase, req.userId, req.params.date, req.body));
  })
);
app.delete(
  '/api/time/:date/:entryId',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    res.json(await db.deleteTime(req.supabase, req.userId, req.params.date, req.params.entryId));
  })
);
app.put(
  '/api/time/:date/:entryId',
  h(async (req, res) => {
    if (!isValidDate(req.params.date)) return badDate(res);
    res.json(await db.updateTimeNote(req.supabase, req.userId, req.params.date, req.params.entryId, req.body.note));
  })
);

// --- weekly notes --------------------------------------------------------
app.get('/api/week-notes', h(async (req, res) => res.json(await db.listWeekNotes(req.supabase, req.userId))));
app.get(
  '/api/week-note/:ws',
  h(async (req, res) => {
    if (!isValidDate(req.params.ws)) return badDate(res);
    res.json(await db.readWeekNote(req.supabase, req.userId, req.params.ws));
  })
);
app.post(
  '/api/week-note/:ws',
  h(async (req, res) => {
    if (!isValidDate(req.params.ws)) return badDate(res);
    if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'content must be a string' });
    res.json(await db.saveWeekNote(req.supabase, req.userId, req.params.ws, req.body.content));
  })
);
app.post(
  '/api/week-reflexion/:ws',
  h(async (req, res) => {
    if (!isValidDate(req.params.ws)) return badDate(res);
    if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'content must be a string' });
    res.json(await db.saveWeekReflexion(req.supabase, req.userId, req.params.ws, req.body.content));
  })
);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Local (non-Vercel) dev convenience: `node api/index.js` serves the static
// frontend too, since there's no platform doing it for you.
if (require.main === module) {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`\n  \u{1F4D3} Journal running at http://localhost:${PORT}\n`));
}

module.exports = app;

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ENTRIES_DIR = path.join(ROOT, 'entries');

fs.mkdirSync(ENTRIES_DIR, { recursive: true });

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
  return { date, content, isToday: date === todayStr(), editable: date === todayStr() };
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

    // POST /api/entry/:date  { content }
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'entry' && parts[2]) {
      if (!isValidDate(parts[2])) return sendJson(res, 400, { error: 'Bad date' });
      let body = '';
      req.on('data', (c) => {
        body += c;
        if (body.length > 5_000_000) req.destroy(); // 5MB guard
      });
      req.on('end', () => {
        try {
          const { content } = JSON.parse(body || '{}');
          if (typeof content !== 'string') return sendJson(res, 400, { error: 'content must be a string' });
          sendJson(res, 200, saveEntry(parts[2], content));
        } catch (e) {
          sendJson(res, e.status || 400, { error: e.message });
        }
      });
      return;
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

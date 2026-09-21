'use strict';

// Pure date helpers — unchanged from the original server.js, since none of
// this ever touched the filesystem.

// Vercel's serverless functions run with the system clock in UTC, while the
// browser computes "today" in the user's local (Europe/Berlin) time. Around
// the CET/CEST-to-UTC offset (e.g. 00:00-02:00 local time), those two clocks
// disagree on the calendar date — the server thinks it's still yesterday —
// which showed up as two days both being labelled "Today" in the sidebar.
// Pin the server's notion of "today" to the same timezone the app is used
// in, instead of the host's system timezone.
const APP_TIMEZONE = 'Europe/Berlin';

function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isValidDate(s) {
  return DATE_RE.test(s) && !Number.isNaN(Date.parse(s));
}

function weekStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const isoDay = day === 0 ? 7 : day;
  d.setDate(d.getDate() - (isoDay - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function currentWeekStart() {
  return weekStart(todayStr());
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

function weekDates(ws) {
  return datesInRange(ws, addDays(ws, 6));
}

function requireNotFuture(date) {
  if (date > todayStr()) {
    const err = new Error('Cannot edit a future date.');
    err.status = 403;
    throw err;
  }
}

function yearStart(year) {
  return `${year}-01-01`;
}

function yearEnd(year) {
  return `${year}-12-31`;
}

module.exports = {
  todayStr,
  isValidDate,
  weekStart,
  currentWeekStart,
  addDays,
  datesInRange,
  weekDates,
  requireNotFuture,
  yearStart,
  yearEnd,
};

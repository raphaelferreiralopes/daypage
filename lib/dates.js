'use strict';

// Pure date helpers — unchanged from the original server.js, since none of
// this ever touched the filesystem.

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

module.exports = {
  todayStr,
  isValidDate,
  weekStart,
  currentWeekStart,
  addDays,
  datesInRange,
  weekDates,
  requireNotFuture,
};

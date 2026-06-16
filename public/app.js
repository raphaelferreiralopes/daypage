'use strict';

const dayList = document.getElementById('dayList');
const editor = document.getElementById('editor');
const entryDate = document.getElementById('entryDate');
const statusEl = document.getElementById('status');
const readonlyNote = document.getElementById('readonlyNote');
const todayBtn = document.getElementById('todayBtn');

let current = null; // currently open date
let saveTimer = null;

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
  entryDate.textContent = fmtDate(date);
  editor.value = entry.content;
  editor.disabled = !entry.editable;
  readonlyNote.hidden = entry.editable;
  statusEl.textContent = entry.editable ? '' : 'Read-only';
  [...dayList.children].forEach((li) => li.classList.toggle('active', li.dataset.date === date));
  if (entry.editable) editor.focus();
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

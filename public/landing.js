'use strict';

// Everything here is presentation for the marketing page: nothing is saved,
// nothing talks to the API. The demos only need to feel like the app.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOCALE = 'en-GB';
const fmtLong = (d) => d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = (d) => d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });

// --- header -------------------------------------------------------------
const header = document.getElementById('top');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// --- real dates ---------------------------------------------------------
const today = new Date();
today.setHours(12, 0, 0, 0);
const year = today.getFullYear();
const startOfYear = new Date(year, 0, 1, 12);
const dayOfYear = Math.round((today - startOfYear) / 86400000) + 1;
const daysInYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
const todayLong = fmtLong(today);

for (const id of ['heroDate', 'ctaDate']) {
  const el = document.getElementById(id);
  if (el) el.textContent = todayLong;
}
const demoDate = document.getElementById('demoDate');
if (demoDate) demoDate.textContent = fmtLong(today);

// Deterministic "random" so the grid looks the same on every visit of a day.
const rand = (n) => {
  const x = Math.sin(n * 12.9898 + year * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// A pool of plausible one-line recaps, the way they'd appear on the Life view.
const RECAPS = [
  'First run in weeks. Slow, but it counts.',
  'Long seminar day, good questions at the end.',
  'Cooked for friends, nobody left early.',
  'Thesis chapter two finally has a shape.',
  'Rain all day. Read on the sofa, no regrets.',
  'Missed the gym, made it up with a long walk.',
  'Hard conversation, went better than expected.',
  'Deep work before email. Best morning this month.',
  'Train delays, but finished the book on the way.',
  'Tired. Kept the streak anyway.',
  'Presentation went well. Celebrated with pizza.',
  'Cleared the inbox, cleared my head.',
  'Lazy Sunday, planned the week in ten minutes.',
  'Learned more from the mistake than the plan.',
  'Called grandma. Should do that more often.',
  'Early night. Tomorrow starts with the hard thing.',
  'Three hours of focus, zero notifications.',
  'Ran the half-marathon route for the first time.',
];

// --- hero year grid -----------------------------------------------------
const grid = document.getElementById('yearGrid');
const tip = document.getElementById('yearTip');
const yearCount = document.getElementById('yearCount');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

if (grid) {
  const frag = document.createDocumentFragment();
  let pastIndex = 0;
  // Total animation length stays near 1.4s regardless of how far into the year we are.
  const step = Math.max(2, Math.min(8, 1400 / dayOfYear));

  MONTHS.forEach((label, m) => {
    const ml = document.createElement('span');
    ml.className = 'ym';
    ml.textContent = label;
    frag.appendChild(ml);
    const dim = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= 31; d++) {
      if (d > dim) {
        const pad = document.createElement('span');
        pad.className = 'yd nx';
        pad.setAttribute('aria-hidden', 'true');
        frag.appendChild(pad);
        continue;
      }
      const date = new Date(year, m, d, 12);
      const n = Math.round((date - startOfYear) / 86400000) + 1;
      let cell;
      if (n < dayOfYear) {
        cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'yd past';
        const r = rand(n);
        cell.dataset.l = r < 0.22 ? '0' : r < 0.58 ? '1' : r < 0.88 ? '2' : '3';
        cell.dataset.recap = RECAPS[Math.floor(rand(n + 999) * RECAPS.length)];
        cell.style.setProperty('--d', `${Math.round(pastIndex * step)}ms`);
        pastIndex++;
      } else if (n === dayOfYear) {
        cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'yd today';
        cell.dataset.recap = 'Still blank. Yours to write.';
        cell.style.setProperty('--d', `${Math.round(pastIndex * step + 120)}ms`);
      } else {
        cell = document.createElement('span');
        cell.className = 'yd future';
      }
      cell.dataset.date = fmtLong(date);
      if (cell.tagName === 'BUTTON') cell.setAttribute('aria-label', `${fmtLong(date)}: ${cell.dataset.recap}`);
      else cell.setAttribute('aria-hidden', 'true');
      frag.appendChild(cell);
    }
  });
  grid.appendChild(frag);

  if (!reduceMotion) {
    grid.classList.add('drawing');
    // Drop the class once done so hover/focus styles aren't fighting an animation.
    setTimeout(() => grid.classList.remove('drawing'), 1400 + 900);
  }

  const left = daysInYear - dayOfYear;
  if (yearCount) {
    yearCount.innerHTML = `Today is day <b>${dayOfYear}</b> of ${year}. The other <b>${left}</b> are still blank.`;
  }

  // Tooltip on hover and keyboard focus.
  const figure = grid.parentElement;
  const showTip = (cell) => {
    if (!cell.dataset.recap) return;
    tip.innerHTML = '';
    const dt = document.createElement('span');
    dt.className = 'tip-date';
    dt.textContent = cell.dataset.date;
    const tx = document.createElement('span');
    tx.className = 'tip-text';
    tx.textContent = cell.dataset.recap;
    tip.append(dt, tx);
    tip.hidden = false;
    const fr = figure.getBoundingClientRect();
    const cr = cell.getBoundingClientRect();
    const half = Math.min(140, fr.width / 2);
    let x = cr.left - fr.left + cr.width / 2;
    x = Math.max(half, Math.min(fr.width - half, x));
    tip.style.left = `${x}px`;
    tip.style.top = `${cr.top - fr.top}px`;
  };
  const hideTip = () => { tip.hidden = true; };
  grid.addEventListener('pointerover', (e) => {
    const c = e.target.closest('.yd');
    if (c && c.dataset.recap) showTip(c); else hideTip();
  });
  grid.addEventListener('pointerleave', hideTip);
  grid.addEventListener('focusin', (e) => { const c = e.target.closest('.yd'); if (c) showTip(c); });
  grid.addEventListener('focusout', hideTip);
  // Clicking a day opens the same day's page in the app, like the Life view does.
  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.yd.today');
    if (c) location.href = '/app?mode=signup';
  });
}

// --- app demo: sidebar days --------------------------------------------
const sideDays = document.getElementById('sideDays');
if (sideDays) {
  for (let i = 0; i < 9; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const li = document.createElement('li');
    if (i === 0) li.className = 'on';
    const label = document.createElement('span');
    label.textContent = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : fmtShort(d);
    const dot = document.createElement('span');
    dot.className = 'sd-dot' + (i === 0 || i === 4 ? ' none' : '');
    li.append(label, dot);
    sideDays.appendChild(li);
  }
}

// --- app demo: tabs (WAI-ARIA tabs pattern, arrow keys move) -------------
const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
const selectTab = (tab, focus) => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home') next = tabs[0];
    if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); selectTab(next, true); }
  });
});

// --- app demo: habits ---------------------------------------------------
const chipHabits = document.getElementById('chipHabits');
const habitButtons = [...document.querySelectorAll('#habitList button.habit')];
const updateHabitChip = () => {
  // The number habit (water) isn't met yet, so it never counts as done here.
  const done = habitButtons.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
  if (chipHabits) chipHabits.textContent = `${done} / ${habitButtons.length + 1}`;
};
habitButtons.forEach((b) => {
  const streak = b.querySelector('.h-streak');
  const base = streak.textContent;
  b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    if (!base) streak.textContent = on ? '1-day streak' : '';
    updateHabitChip();
  });
});
updateHabitChip();

// --- app demo: running timer -------------------------------------------
const timerClock = document.getElementById('timerClock');
if (timerClock) {
  let secs = 24 * 60 + 18;
  const render = () => {
    const h = Math.floor(secs / 3600);
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    timerClock.textContent = `${h}:${m}:${s}`;
  };
  render();
  setInterval(() => { secs++; render(); }, 1000);
}

// --- scales: dot rows ---------------------------------------------------
document.querySelectorAll('.dots').forEach((el) => {
  const n = Number(el.dataset.n);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) frag.appendChild(document.createElement('i'));
  el.appendChild(frag);
});

// --- command palette demo ----------------------------------------------
// The same view-jump commands as the app's Cmd/Ctrl+K palette, plus a few
// example habits/projects/cycles the way the app appends the user's own.
const PALETTE = [
  ['Go to Today', 'View'],
  ['Go to Journal', 'View'],
  ['Go to Cycles', 'View'],
  ['Go to Habits', 'View'],
  ['Go to Time', 'View'],
  ['Go to Checklist', 'View'],
  ['Go to Goals', 'View'],
  ['Go to Life', 'View'],
  ['Go to Learning Log', 'View'],
  ['Go to Reflexionen', 'View'],
  ['Workout', 'Habit'],
  ['Morning pages', 'Habit'],
  ['Deep work', 'Project'],
  ['Thesis', 'Project'],
  ['Winter semester', 'Cycle'],
];
const palInput = document.getElementById('palInput');
const palList = document.getElementById('palList');
const palKbd = document.getElementById('palKbd');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
if (!isMac) {
  if (palKbd) palKbd.textContent = 'Ctrl K';
  document.querySelectorAll('.kbd-mod').forEach((k) => { k.textContent = 'Ctrl'; });
}
let palSel = 0;
let palShown = [];
const renderPalette = () => {
  const q = palInput.value.trim().toLowerCase();
  palShown = PALETTE.filter(([l, c]) => !q || l.toLowerCase().includes(q) || c.toLowerCase().includes(q)).slice(0, 7);
  palSel = Math.min(palSel, Math.max(0, palShown.length - 1));
  palList.innerHTML = '';
  if (!palShown.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No command matches. Try “habits” or “life”.';
    palList.appendChild(li);
    return;
  }
  palShown.forEach(([l, c], i) => {
    const li = document.createElement('li');
    if (i === palSel) li.className = 'sel';
    const a = document.createElement('span');
    a.textContent = l;
    const b = document.createElement('span');
    b.textContent = c;
    li.append(a, b);
    li.addEventListener('pointerenter', () => { palSel = i; renderPalette(); });
    palList.appendChild(li);
  });
};
if (palInput && palList) {
  palInput.addEventListener('input', () => { palSel = 0; renderPalette(); });
  palInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); palSel = (palSel + 1) % Math.max(1, palShown.length); renderPalette(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); palSel = (palSel - 1 + palShown.length) % Math.max(1, palShown.length); renderPalette(); }
    if (e.key === 'Escape') { palInput.value = ''; palSel = 0; renderPalette(); palInput.blur(); }
  });
  // Cmd/Ctrl+K on this page jumps to the demo, the same shortcut as in the app.
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palInput.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      palInput.focus({ preventScroll: true });
    }
  });
  renderPalette();
}

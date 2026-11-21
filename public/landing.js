'use strict';

// Everything here is presentation for the marketing page: nothing is saved
// (apart from the chosen language), nothing talks to the API.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LANG_KEY = 'journal-landing-lang';

// --- translations ---------------------------------------------------------
// English lives in the HTML itself and is read back from the DOM on load, so
// it only exists once. German overrides it key by key. The app's own UI is
// English, so the app mocks keep their English chrome in both languages —
// only the text a user would type into them is translated.
const DE = {
  skip: 'Zum Inhalt springen',
  brandLabel: 'Journal, zurück nach oben',
  navLabel: 'Abschnitte',
  navDay: 'Der Tag',
  navScales: 'Wochen &amp; Zyklen',
  navRules: 'Bearbeiten',
  navPrivacy: 'Datenschutz',
  navFaq: 'Fragen',
  langLabel: 'Sprache',
  logIn: 'Anmelden',
  signUp: 'Registrieren',
  heroTitle: 'Eine Seite pro Tag.<br />Ein Jahr im Blick.',
  heroLede: 'Journal bündelt Notizen, Habits, Zeit und Ziele auf einer Seite für heute und reiht jede Seite zu Wochen, Zyklen und einem ganzen Jahr auf. Ein privater Ort statt fünf Apps, die nie miteinander reden.',
  ctaStart: 'Heutige Seite beginnen',
  haveAccount: 'Ich habe schon ein Konto',
  yearLabel: 'Dein Jahr, ein Feld pro Tag',
  lgWritten: 'geschrieben',
  lgToday: 'heute',
  lgBlank: 'noch leer',
  dayTitle: 'Alles von heute auf einer Seite.',
  dayText: 'Sechs Tabs, ein Datum. Stunden erfassen, Habits abhaken, aufschreiben, was passiert ist, festhalten, was du gelernt hast, und eine Zeile für den Kalender. Klick dich durch: So sieht die App aus.',
  autosave: 'Speichert, während du tippst',
  projDeep: 'Fokusarbeit',
  projThesis: 'Abschlussarbeit',
  projAdmin: 'Orga',
  noteTime: 'Starte einen Timer pro Projekt oder trag Zeit nachträglich ein. Heute, diese Woche und der laufende Zyklus rechnen sich von selbst zusammen.',
  habWorkout: 'Sport',
  habPages: 'Morgenseiten',
  habReading: 'Lesen',
  habGlasses: '/ 8 Gläser',
  habWater: 'Wasser',
  habNumber: 'als Zahl erfasst',
  noteHabits: 'Ein Habit ist eine Checkbox oder eine Zahl. Tipp oben eines an. Jedes Habit hat seine eigene Serie und eine 90-Tage-Heatmap.',
  notesHead: 'Seminarvorbereitung',
  notesP: 'Gliederung steht, Folien noch nicht. Die Fallstudie an den Anfang zu ziehen hat das Argument viel klarer gemacht.',
  todo1: 'Entwurf an Lena schicken',
  todo2: 'Raum für Donnerstag buchen',
  todo3: 'Folie 9 streichen',
  noteNotes: 'Tippe <kbd>/</kbd> für Checkboxen, Listen, Überschriften und Trennlinien.',
  refl1: 'Den schwierigsten Teil des Tages habe ich so lange aufgeschoben, bis keine Energie mehr dafür übrig war. Morgen kommt die Abschlussarbeit zuerst, vor den Mails, vor allem, was eine Benachrichtigung hat.',
  refl2: 'Der Spaziergang mittags hat mehr gebracht als der zweite Kaffee.',
  noteRefl: 'Platz für alles, was du über den Tag sagen willst. Freiwillig, wie alles hier.',
  learn1: 'Mit dem Beispiel anzufangen hat den abstrakten Teil leicht verständlich gemacht.',
  learn2: 'Nach 16 Uhr schlagen zwei kurze Fokusblöcke einen langen.',
  noteLearn: 'Jedes Learning landet zusätzlich im Learning Log, das neueste zuerst, über alle Tage hinweg.',
  recapLabel: 'Heute in einer Zeile',
  recapValue: 'Seminar gegliedert, mittags spazieren, früh ins Bett.',
  noteRecap: 'Diese Zeile siehst du im Life-Kalender: ein Monat oder ein ganzes Jahr, ein Satz pro Tag.',
  scalesTitle: 'Rauszoomen, ohne die App zu wechseln.',
  scalesText: 'Auf der Tagesseite schreibst du. Alles andere sind dieselben Tage, nur aus mehr Abstand.',
  sDay: 'Ein Tag',
  sDayText: 'Notizen, Habits, Zeit, Reflexion, Learnings und eine Zeile als Rückblick. Dazu wiederkehrende Checklisten, die sich jeden Morgen zurücksetzen: die Feierabendroutine, die Sporttasche.',
  sWeek: 'Eine Woche',
  sWeekText: 'Wochennotizen und eine Wochenreflexion, ab Montag. Offen, solange die Woche läuft, danach bleiben sie, wie sie waren.',
  sCycle: 'Ein Zyklus',
  sCycleText: 'Ein Abschnitt aus Wochen, den du selbst benennst, etwa ein Semester oder ein Quartal. Leg Prioritäten fest, schreib zu jeder etwas, und setz Ziele, die sich aus deinen Habits oder deiner erfassten Zeit selbst zählen.',
  sYear: 'Ein Jahr',
  sYearText: 'Jahresziele, als Ja oder Nein oder als Zahl, die du erreichen willst. Der Life-Kalender mit jedem Rückblick. Ein Learning Log, das immer weiter wächst.',
  goalsTitle: 'Ziele, die selbst mitzählen.',
  goalsP1: 'Verknüpf ein Zyklusziel mit einem Habit oder einem Projekt, und es füllt sich, während du deine Tage lebst. Training abgehakt, das Ziel bewegt sich. Timer gestoppt, die Stunden zählen. Keine Fortschrittszahlen, die du sonntagabends nachtragen musst.',
  goalsP2: 'Jahresziele haben ihre eigene Seite, unabhängig von jedem Zyklus. So bleiben die großen Dinge das ganze Jahr sichtbar.',
  cycleLabel: 'Beispiel für einen Zyklus',
  ccName: 'Wintersemester',
  prio1: 'Exposé für die Abschlussarbeit abgeben',
  prio2: 'Morgenroutine an Werktagen halten',
  prio3: 'Nach 22 Uhr keine Bildschirme',
  goalBooks: 'Bücher dieses Jahr',
  rulesTitle: 'Ein Tagebuch, das ehrlich bleibt.',
  rulesIntro: 'Ein Tagebuch lohnt sich nur zum Wiederlesen, wenn darin steht, was du damals gedacht hast. Deshalb gibt es ein paar einfache Regeln, was sich ändern lässt, und der Server setzt sie durch, nicht nur die Oberfläche.',
  r1t: 'Gestern ist noch offen.',
  r1d: 'Gestern Abend vergessen, etwas einzutragen? Jeder vergangene Tag lässt sich nachtragen oder korrigieren.',
  r2t: 'Morgen bleibt leer.',
  r2d: 'Zukünftige Tage kannst du nicht vorschreiben. Eine Seite beginnt, wenn ihr Tag beginnt.',
  r3t: 'Eine Woche schließt am Sonntag.',
  r3d: 'Wochennotizen und Wochenreflexion lassen sich nur in der laufenden Woche bearbeiten.',
  r4t: 'Ein Zyklus endet an seinem Enddatum.',
  r4d: 'Danach bleiben Prioritäten und Notizen genau so, wie du sie hinterlassen hast.',
  palLabel: 'Befehle filtern',
  keysTitle: 'Schnell, wenn du weißt, wohin du willst.',
  keysText: 'Drück <kbd class="kbd-mod">⌘</kbd><kbd>K</kbd> irgendwo in der App, um zu einer Ansicht, einem Habit, einem Projekt oder einem Zyklus zu springen. Tippe <kbd>/</kbd> in einer Notiz für eine Checkbox oder eine Überschrift. Probier das Feld links aus: Es filtert dieselben Befehle.',
  privTitle: 'Privat von Grund auf.',
  privText: 'Was du über deine Tage schreibst, geht niemanden etwas an. Das steckt in der Art, wie die Daten gespeichert werden, nicht in guten Vorsätzen.',
  f1t: 'In der Datenbank getrennt',
  f1d: 'Jede Zeile kennt ihren Besitzer, und Postgres Row-Level-Security verweigert jedes Lesen und Schreiben durch ein anderes Konto, selbst wenn die App einen Fehler hätte.',
  f2t: 'Alles exportieren, jederzeit',
  f2d: 'Ein Klick lädt all deine Daten als JSON herunter: jeden Tag, jedes Habit, jeden Zyklus, jedes Ziel und jeden Zeiteintrag.',
  f3t: 'Gelöscht heißt gelöscht',
  f3d: 'Wenn du dein Konto löschst, wird es mit allem, was daran hängt, dauerhaft entfernt. Nichts wird nebenher aufbewahrt.',
  faqTitle: 'Fragen',
  q1: 'Was kostet das?',
  a1: 'Nichts. Registrier dich mit E-Mail und Passwort, und die Seite für heute ist bereit.',
  q2: 'Muss ich alle Funktionen nutzen?',
  a2: 'Nein. Jeder Tab und jede Ansicht ist freiwillig. Viele schreiben nur Notizen und einen Rückblick; Habits, Zeit und Zyklen sind da, wenn du sie brauchst.',
  q3: 'Kann ich alte Einträge noch ändern?',
  a3: 'Tagesseiten ja, jeden Tag bis einschließlich heute. Wochennotizen nur in ihrer Woche, einen Zyklus bis zu seinem Enddatum. Zukünftige Tage lassen sich nicht vorschreiben.',
  q4: 'Wann beginnt ein neuer Tag?',
  a4: 'Um Mitternacht, Berliner Zeit. Das Datum legt der Server fest, deshalb ist es auf all deinen Geräten gleich.',
  q7: 'Gibt es die App auch auf Deutsch?',
  a7: 'Die App selbst ist derzeit auf Englisch. Was du schreibst, natürlich in jeder Sprache.',
  q5: 'Kann ich meine Daten mitnehmen?',
  a5: 'Ja. In den Kontoeinstellungen gibt es einen JSON-Export von allem, was du geschrieben und erfasst hast, jederzeit verfügbar.',
  q6: 'Ich habe mein Passwort vergessen.',
  a6: 'Nutze „Forgot password“ auf dem Anmeldebildschirm, dann bekommst du einen Link zum Zurücksetzen per E-Mail.',
  ctaTitle: 'Die Seite von heute ist noch leer.',
  ctaNote: 'Kostenlos. Du brauchst nur eine E-Mail-Adresse und ein Passwort.',
  footLabel: 'Fußzeile',
  backTop: 'Nach oben',
};

// Strings that only exist in script (generated content).
const STR = {
  en: {
    locale: 'en-GB',
    title: 'Journal — one page a day, a year you can see',
    description: 'A private daily journal that keeps notes, habits, time tracking, cycles and yearly goals on one page for today — and lines every page up into weeks, cycles and a whole year.',
    yearCount: (n, y, left) => `Today is day <b>${n}</b> of ${y}. The other <b>${left}</b> are still blank.`,
    todayTip: 'Still blank. Yours to write.',
    palEmpty: 'No command matches. Try “habits” or “life”.',
    palExamples: [['Workout', 'Habit'], ['Morning pages', 'Habit'], ['Deep work', 'Project'], ['Thesis', 'Project'], ['Winter semester', 'Cycle']],
    recaps: [
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
    ],
  },
  de: {
    locale: 'de-DE',
    title: 'Journal — eine Seite pro Tag, ein Jahr im Blick',
    description: 'Ein privates Tagebuch, das Notizen, Habits, Zeiterfassung, Zyklen und Jahresziele auf einer Seite für heute bündelt und jede Seite zu Wochen, Zyklen und einem ganzen Jahr aufreiht.',
    yearCount: (n, y, left) => `Heute ist Tag <b>${n}</b> von ${y}. Die übrigen <b>${left}</b> sind noch leer.`,
    todayTip: 'Noch leer. Gehört ganz dir.',
    palEmpty: 'Kein passender Befehl. Versuch „habits“ oder „life“.',
    palExamples: [['Sport', 'Habit'], ['Morgenseiten', 'Habit'], ['Fokusarbeit', 'Project'], ['Abschlussarbeit', 'Project'], ['Wintersemester', 'Cycle']],
    recaps: [
      'Erster Lauf seit Wochen. Langsam, aber zählt.',
      'Langer Seminartag, gute Fragen am Ende.',
      'Für Freunde gekocht, keiner ist früh gegangen.',
      'Kapitel zwei hat endlich eine Form.',
      'Den ganzen Tag Regen. Auf dem Sofa gelesen.',
      'Gym verpasst, dafür ein langer Spaziergang.',
      'Schwieriges Gespräch, besser als erwartet.',
      'Fokusarbeit vor den Mails. Bester Morgen des Monats.',
      'Zug verspätet, dafür das Buch fertig gelesen.',
      'Müde. Die Serie trotzdem gehalten.',
      'Präsentation lief gut. Mit Pizza gefeiert.',
      'Postfach leer, Kopf frei.',
      'Fauler Sonntag, Woche in zehn Minuten geplant.',
      'Aus dem Fehler mehr gelernt als aus dem Plan.',
      'Oma angerufen. Sollte ich öfter machen.',
      'Früh ins Bett. Morgen zuerst das Schwierige.',
      'Drei Stunden Fokus, null Benachrichtigungen.',
      'Zum ersten Mal die Halbmarathon-Strecke gelaufen.',
    ],
  },
};

const EN = {};
const i18nEls = [...document.querySelectorAll('[data-i18n]')];
const i18nAttrEls = [...document.querySelectorAll('[data-i18n-attr]')];
i18nEls.forEach((el) => {
  const k = el.dataset.i18n;
  if (!(k in EN)) EN[k] = el.innerHTML;
});
const parseAttrs = (el) => el.dataset.i18nAttr.split(',').map((p) => p.split(':').map((s) => s.trim()));
i18nAttrEls.forEach((el) => {
  parseAttrs(el).forEach(([attr, k]) => { if (!(k in EN)) EN[k] = el.getAttribute(attr); });
});

let lang = document.documentElement.lang === 'de' ? 'de' : 'en';
const S = () => STR[lang];
const t = (k) => (lang === 'de' && k in DE ? DE[k] : EN[k]);

const fmtLong = (d, locale) => d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
// The app mock always speaks the app's language: English.
const APP_LOCALE = 'en-GB';
const fmtShort = (d) => d.toLocaleDateString(APP_LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });

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

const demoDate = document.getElementById('demoDate');
if (demoDate) demoDate.textContent = fmtLong(today, APP_LOCALE);

// Deterministic "random" so the grid looks the same on every visit of a day.
const rand = (n) => {
  const x = Math.sin(n * 12.9898 + year * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// --- hero year grid -----------------------------------------------------
const grid = document.getElementById('yearGrid');
const tip = document.getElementById('yearTip');
const yearCount = document.getElementById('yearCount');

const buildGrid = (animate) => {
  if (!grid) return;
  grid.innerHTML = '';
  const locale = S().locale;
  const recaps = S().recaps;
  const frag = document.createDocumentFragment();
  let pastIndex = 0;
  // Total animation length stays near 1.4s regardless of how far into the year we are.
  const step = Math.max(2, Math.min(8, 1400 / dayOfYear));

  for (let m = 0; m < 12; m++) {
    const ml = document.createElement('span');
    ml.className = 'ym';
    ml.textContent = new Date(year, m, 1).toLocaleDateString(locale, { month: 'short' }).replace('.', '');
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
        cell.dataset.recap = recaps[Math.floor(rand(n + 999) * recaps.length)];
        cell.style.setProperty('--d', `${Math.round(pastIndex * step)}ms`);
        pastIndex++;
      } else if (n === dayOfYear) {
        cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'yd today';
        cell.dataset.recap = S().todayTip;
        cell.style.setProperty('--d', `${Math.round(pastIndex * step + 120)}ms`);
      } else {
        cell = document.createElement('span');
        cell.className = 'yd future';
      }
      cell.dataset.date = fmtLong(date, locale);
      if (cell.tagName === 'BUTTON') cell.setAttribute('aria-label', `${cell.dataset.date}: ${cell.dataset.recap}`);
      else cell.setAttribute('aria-hidden', 'true');
      frag.appendChild(cell);
    }
  }
  grid.appendChild(frag);

  if (animate && !reduceMotion) {
    grid.classList.add('drawing');
    // Drop the class once done so hover/focus styles aren't fighting an animation.
    setTimeout(() => grid.classList.remove('drawing'), 1400 + 900);
  }
};

if (grid) {
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
  // Today's square is the way in: it opens sign-up, i.e. today's page.
  grid.addEventListener('click', (e) => {
    if (e.target.closest('.yd.today')) location.href = '/app?mode=signup';
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
  tabs.forEach((x) => {
    const on = x === tab;
    x.setAttribute('aria-selected', String(on));
    x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
};
tabs.forEach((x, i) => {
  x.addEventListener('click', () => selectTab(x));
  x.addEventListener('keydown', (e) => {
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
const PALETTE_VIEWS = [
  'Go to Today', 'Go to Journal', 'Go to Cycles', 'Go to Habits', 'Go to Time',
  'Go to Checklist', 'Go to Goals', 'Go to Life', 'Go to Learning Log', 'Go to Reflexionen',
].map((l) => [l, 'View']);
const palInput = document.getElementById('palInput');
const palList = document.getElementById('palList');
const palKbd = document.getElementById('palKbd');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const applyModKeys = () => {
  if (isMac) return;
  if (palKbd) palKbd.textContent = 'Ctrl K';
  document.querySelectorAll('.kbd-mod').forEach((k) => { k.textContent = 'Ctrl'; });
};
let palSel = 0;
let palShown = [];
const renderPalette = () => {
  if (!palInput || !palList) return;
  const q = palInput.value.trim().toLowerCase();
  const all = PALETTE_VIEWS.concat(S().palExamples);
  palShown = all.filter(([l, c]) => !q || l.toLowerCase().includes(q) || c.toLowerCase().includes(q)).slice(0, 7);
  palSel = Math.min(palSel, Math.max(0, palShown.length - 1));
  palList.innerHTML = '';
  if (!palShown.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = S().palEmpty;
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
}

// --- language switch ----------------------------------------------------
// Signed-in visitors only get here via the app's "Home page" link (/?home);
// for them the header's sign-up button becomes a way straight back.
const hasSession = document.documentElement.hasAttribute('data-session');
const applySession = () => {
  if (!hasSession) return;
  const signUp = document.querySelector('.bar-actions .btn');
  const logIn = document.querySelector('.bar-actions .link-quiet');
  if (signUp) { signUp.href = '/app'; signUp.textContent = lang === 'de' ? 'Zur App' : 'Open app'; }
  if (logIn) logIn.hidden = true;
};

const langButtons = [...document.querySelectorAll('.lang [data-lang]')];
const setMeta = (sel, value) => { const m = document.querySelector(sel); if (m) m.setAttribute('content', value); };

const applyLang = (next, { animate = false } = {}) => {
  lang = next;
  document.documentElement.lang = lang;
  i18nEls.forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  i18nAttrEls.forEach((el) => {
    parseAttrs(el).forEach(([attr, k]) => {
      el.setAttribute(attr, t(k));
      if (attr === 'value') el.value = t(k);
    });
  });
  langButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));

  document.title = S().title;
  setMeta('meta[name="description"]', S().description);
  setMeta('meta[property="og:title"]', S().title);

  const todayLong = fmtLong(today, S().locale);
  for (const id of ['heroDate', 'ctaDate']) {
    const el = document.getElementById(id);
    if (el) el.textContent = todayLong;
  }
  if (yearCount) yearCount.innerHTML = S().yearCount(dayOfYear, year, daysInYear - dayOfYear);
  if (tip) tip.hidden = true;
  buildGrid(animate);
  applyModKeys();
  renderPalette();
  applySession();
};

langButtons.forEach((b) => {
  b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    try { localStorage.setItem(LANG_KEY, b.dataset.lang); } catch (e) {}
    applyLang(b.dataset.lang);
  });
});

applyLang(lang, { animate: true });

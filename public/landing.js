'use strict';

// Header goes from transparent to a paper-tinted panel once the page scrolls.
const header = document.getElementById('lpHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Today's real date leads the page, the same way it leads the app itself —
// the one deliberate load-time moment (see .hero-reveal in landing.css),
// rather than fading every section in as it's scrolled to.
const today = new Date();
const dateLabel = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const heroDate = document.getElementById('heroDate');
if (heroDate) heroDate.textContent = dateLabel;
const heroMockDate = document.getElementById('heroMockDate');
if (heroMockDate) heroMockDate.textContent = today.toLocaleDateString(undefined, { weekday: 'long' });
// requestAnimationFrame (rather than adding the class immediately) makes sure
// the browser paints the hero in its pre-reveal state first, so the CSS
// animation actually plays instead of the content just appearing already
// in its end state. Guarded so a missing rAF can't take the rest of this
// script — the habit checklist below — down with it.
const revealHero = () => document.getElementById('lpHero')?.classList.add('hero-reveal');
if (typeof requestAnimationFrame === 'function') requestAnimationFrame(revealHero);
else revealHero();

// The habit checklist mock is genuinely clickable, just for feel — it
// doesn't persist anywhere, this is a marketing page, not the app.
document.querySelectorAll('#habitMock .habit-row').forEach((row) => {
  row.addEventListener('click', () => {
    const checked = row.dataset.checked === 'true';
    row.dataset.checked = String(!checked);
    const summary = document.querySelector('#habitMock .habit-summary strong');
    if (summary) {
      const total = document.querySelectorAll('#habitMock .habit-row').length;
      const done = document.querySelectorAll('#habitMock .habit-row[data-checked="true"]').length;
      summary.textContent = `${done} / ${total}`;
    }
  });
});

// Life mock: a plain month grid, a few days picked out as "has a recap" —
// the same heatmap language the app itself uses for habit streaks.
const lifeMock = document.getElementById('lifeMock');
if (lifeMock) {
  const daysInMonth = 30;
  const noted = new Set([3, 7, 9, 14, 15, 18, 22, 26]);
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'life-day' + (noted.has(day) ? ' has-note' : '');
    lifeMock.appendChild(cell);
  }
}

'use strict';

// Header goes from transparent to a blurred glass panel once the page scrolls.
const header = document.getElementById('lpHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Fade+rise each section in once it enters the viewport (skip if the visitor
// prefers reduced motion — .reveal elements are already visible via CSS then).
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Animate the goal ring's fill once its section is visible, instead of
  // starting pre-filled — matches the rest of the reveal motion.
  const ring = document.querySelector('.ring-fg');
  if (ring) {
    ring.style.strokeDashoffset = '213.6';
    const ringObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => { ring.style.strokeDashoffset = '64'; });
            ringObserver.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    ringObserver.observe(ring);
  }
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view'));
}

// The habit checklist mockup is genuinely clickable, just for feel — it
// doesn't persist anywhere, this is a marketing page, not the app.
document.querySelectorAll('#habitMock .habit-row').forEach((row) => {
  row.addEventListener('click', () => {
    const checked = row.dataset.checked === 'true';
    row.dataset.checked = String(!checked);
    const summary = document.querySelector('.habit-summary strong');
    if (summary) {
      const total = document.querySelectorAll('#habitMock .habit-row').length;
      const done = document.querySelectorAll('#habitMock .habit-row[data-checked="true"]').length;
      summary.textContent = `${done} / ${total}`;
    }
  });
});

// Life calendar mockup: a plausible month grid with a handful of days
// carrying a one-line recap, revealed on hover via the CSS data-tip tooltip.
const recaps = {
  3: 'Shipped the first habit streak view.',
  7: 'Long walk, cleared my head before the sprint.',
  9: 'Kept the morning routine three days running.',
  14: 'Rewrote the onboarding flow end to end.',
  15: 'Slow day — mostly admin and email.',
  18: 'Finally closed out the Q1 goals review.',
  22: 'Good deep work block, 3h uninterrupted.',
  26: 'Landing page redesign, gradients and all.',
};
const calGrid = document.getElementById('lifeCal');
if (calGrid) {
  const daysInMonth = 31;
  const startOffset = 5; // August 2026 starts on a Saturday
  for (let i = 0; i < startOffset; i++) {
    const pad = document.createElement('div');
    pad.className = 'cal-day';
    pad.style.visibility = 'hidden';
    calGrid.appendChild(pad);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = String(day);
    if (recaps[day]) {
      cell.classList.add('has-note');
      cell.dataset.tip = recaps[day];
    }
    calGrid.appendChild(cell);
  }
}

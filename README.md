# 📓 Journal

A personal productivity system: daily journal, habits, cycles/OKRs, time tracking, recurring checklists, and a learning log — one app, one account per user.

Multi-user, backed by [Supabase](https://supabase.com) (Postgres + Auth). Each user signs in with email/password; Postgres row-level security keeps every user's data isolated, not just the app layer.

## Run locally

1. Create a Supabase project, then copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (Settings → API in the Supabase dashboard). The service role key is needed in every environment, including production — the server uses it for account deletion, not just for the one-off migration script.
2. Apply the SQL files in `supabase/migrations/` to that project, in order (via the Supabase SQL editor, or the Supabase CLI).
3. `npm install`
4. `npm start` (or `npm run dev` to run through the Vercel CLI, matching how it's deployed)

Then open `http://localhost:3000`, sign up, and sign in.

## How it works

- Auth is Supabase Auth (email/password). The browser signs in directly against Supabase and attaches the session's JWT to every API call; the server verifies that JWT and Postgres RLS enforces isolation independently — see `lib/auth.js`.
- **Edit windows are enforced server-side** (a save outside the allowed window is rejected, not just hidden in the UI): any day up to today is editable, future days are not; weekly notes and the week reflexion only for the current week; a cycle until its end date.
- Notes/Reflexion/Learnings/Priorities auto-save ~0.6s after you stop typing (and on blur).
- "Today" is always the date in Europe/Berlin, on the server too (Vercel runs in UTC) — see `lib/dates.js`.
- Forgot your password? There's a reset-link flow from the sign-in screen. You can also export your full data as JSON, or permanently delete your account (cascades to all your data), from the Account button in the sidebar.

## Views

- **Journal** — one page per day, with Time / Habits / Notes / Reflexion / Learnings / Recap tabs.
- **Cycles** — a multi-week block with its own Priorities and Goals.
- **Habits** — daily checkbox/number tracking, streaks, and a 90-day heatmap per habit.
- **Time** — a simple timer plus manual time entries, grouped by project.
- **Checklist** — recurring checklists that reset every day.
- **Goals** — longer-term yearly goals, separate from a cycle's OKRs.
- **Life** — a one-line-per-day recap calendar (month/year view).
- **Learning Log** — every day's Learnings in one place, newest first.

## Files

- `api/index.js` — Express app: all API routes
- `lib/` — auth (`auth.js`), Supabase client (`supabase.js`), all data access (`db.js`)
- `public/` — the browser UI: `index.html` (landing page), `app.html` + `app.js` + `style.css` (the app), `auth.js` (sign-in gate)
- `supabase/migrations/` — the database schema, as sequential SQL migrations
- `scripts/migrate-to-supabase.js` — one-off importer from the old flat-file version of this app into a Supabase account; not part of normal operation

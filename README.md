<img src="public/logo.svg" alt="Daypage" height="40" />

# Daypage

A personal productivity system in one app: a daily journal, habit tracking, multi-week cycles with goals, time tracking, recurring checklists and a learning log.

I built it because I wanted all of my daily planning and reflection in one place, shaped around how I actually work, instead of spread across five different apps. It started as a single-user app that saved everything to local files and grew into a hosted multi-user app with real authentication and per-user data isolation.

<!-- Screenshot: add one at docs/screenshot.png and uncomment the line below -->
<!-- ![Daypage: the daily journal view](docs/screenshot.png) -->

## Highlights

- **Eight connected views.** Journal, Cycles, Habits, Time, Checklist, Goals, Life (a year-at-a-glance calendar) and a Learning Log. Habits and tracked time feed into cycle and yearly goals automatically.
- **Secure multi-user setup.** Supabase Auth, JWTs verified on the server, and Postgres row-level security on every table. Data isolation is enforced by the database itself, not just by the application code.
- **Rules live on the server.** Edit windows (no editing future days, weekly notes only during the current week, and so on) are checked by the API. The UI only mirrors them.
- **Polished everyday UX.** Autosave while typing, a command palette (Cmd/Ctrl+K), slash commands, drag-and-drop reordering, undo for deletions, light and dark themes, and a mobile layout.
- **User data controls.** Password reset, a full JSON export, and account deletion that cascades through all of the user's data.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Plain HTML, CSS and vanilla JavaScript. No framework, no build step. |
| Backend | Node.js + Express, deployed as a single Vercel serverless function |
| Database & auth | Supabase (Postgres, Auth, row-level security) |
| Schema | Versioned SQL migrations in `supabase/migrations/` |

## Design decisions

- **No frontend framework.** The app is a personal tool with modest UI state. Vanilla JS keeps it dependency-light, with zero build tooling and fast loads.
- **Security in the database, not only in code.** Every table carries a `user_id` with a row-level security policy, so even a bug in a query can't leak another user's data. Queries still filter by `user_id` as defense in depth. The service-role key, which bypasses RLS, is used only for account deletion.
- **A fixed time zone for "today".** Vercel runs in UTC, so near midnight the server once disagreed with the user about which day it was. All "today" logic now goes through `lib/dates.js` and uses Europe/Berlin.
- **Migrations, not manual edits.** Schema changes are added as new numbered SQL files and never edit old ones, so every environment can be rebuilt from scratch.

## Run locally

1. Create a Supabase project, then copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (Settings → API in the Supabase dashboard). The service role key is needed in every environment, including production, because the server uses it for account deletion.
2. Apply the SQL files in `supabase/migrations/` to that project, in order (via the Supabase SQL editor or the Supabase CLI).
3. `npm install`
4. `npm start` (or `npm run dev` to run through the Vercel CLI, matching how it's deployed)

Then open `http://localhost:3000`, sign up, and sign in.

## How it works

- Auth is Supabase Auth (email/password). The browser signs in directly against Supabase and attaches the session's JWT to every API call. The server verifies that JWT, and Postgres RLS enforces isolation independently (see `lib/auth.js`).
- **Edit windows are enforced server-side:** a save outside the allowed window is rejected, not just hidden in the UI. Any day up to today is editable and future days are not. Weekly notes and the week reflexion are editable only during the current week, and a cycle until its end date.
- Notes, Reflexion, Learnings and Priorities autosave about 0.6 s after you stop typing, and on blur.

## Views

- **Journal:** one page per day, with Time / Habits / Notes / Reflexion / Learnings / Recap tabs.
- **Cycles:** a multi-week block with its own Priorities and Goals.
- **Habits:** daily checkbox or number tracking, streaks, and a 90-day heatmap per habit.
- **Time:** a simple timer plus manual time entries, grouped by project and sub-project.
- **Checklist:** recurring checklists that reset every day.
- **Goals:** longer-term yearly goals, tracked by a habit, by time, or manually.
- **Life:** a one-line-per-day recap calendar (month and year view).
- **Learning Log:** every day's learnings in one place, newest first.

## Project structure

- `api/index.js`: Express app with all API routes
- `lib/`: auth (`auth.js`), Supabase clients (`supabase.js`), all data access (`db.js`), date helpers (`dates.js`)
- `public/`: the browser UI, consisting of `index.html` (landing page), `app.html` + `app.js` + `style.css` (the app) and `auth.js` (sign-in gate)
- `supabase/migrations/`: the database schema as sequential SQL migrations
- `scripts/migrate-to-supabase.js`: one-off importer from the original flat-file version of the app; not part of normal operation

## Built with

I developed this project with [Claude Code](https://claude.com/claude-code) as an AI pair programmer. `AGENTS.md` documents the rules and conventions I set for AI agents working in the codebase.

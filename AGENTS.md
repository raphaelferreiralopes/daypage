# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Copilot, …) working in this repo.
Read `README.md` first for what the app does; this file covers how to work on it.

## Stack at a glance

- **Backend:** one Express app in `api/index.js`, deployed as a single Vercel serverless function (`vercel.json` rewrites `/api/*` to it).
- **Data:** Supabase (Postgres + Auth). No local files are read or written at runtime.
- **Frontend:** plain HTML/CSS/vanilla JS in `public/`. No framework, no bundler, no build step. The Supabase JS client is loaded from a CDN in `app.html`.
- **Runtime:** Node (CommonJS, `'use strict'`). Dependencies: `express`, `@supabase/supabase-js`, `jose`. Don't add dependencies without asking.

## Commands

| Task | Command |
|---|---|
| Install | `npm install` |
| Run locally | `npm start` → http://localhost:3000 (serves `public/` too) |
| Run like production | `npm run dev` (Vercel CLI) |
| Tests | **None yet.** There's no test suite and no linter. Verify changes by running the app. If you add tests, use the built-in `node --test` runner in a `tests/` folder and add a `"test"` script. |

`npm start` needs a filled-in `.env` (see `.env.example`).

## Where things live

- `api/index.js`: every route. Handlers are thin: validate input, call one `db.*` function, return JSON. Wrap async handlers in `h(...)` so thrown errors become JSON responses.
- `lib/db.js`: **all** data access, grouped by `// --- section ---` comments (entries, habits, cycles, goals, projects, time tracking, weekly notes, checklists, reflections, account). Every function takes `(supabase, userId, ...)` as its first arguments.
- `lib/auth.js`: `requireAuth` middleware. Verifies the bearer JWT locally via JWKS and attaches `req.supabase` (a per-request client acting as that user) and `req.userId`.
- `lib/supabase.js`: `clientForToken()` (per-user client) and `adminClient()` (service role, see rules below).
- `lib/dates.js`: pure date helpers (`todayStr`, `weekStart`, `requireNotFuture`, …).
- `public/auth.js`: sign-in gate. Injects `app.js` only once a session exists, and provides `apiFetch()`, which attaches the JWT. Use `apiFetch` for every API call.
- `public/app.js`: the whole app UI (~3,900 lines), split by `// --- section ---` comments: time tracking, habits, account, weekly notes, view switching, life/recap, learning log, checklists, reflexionen, cycles, goals, yearly goals, habit detail, slash commands, command palette (Cmd/Ctrl+K). Shared UI state is module-level `let` variables near the top (`current`, `view`, `editable`, …). Find the right section with grep before editing.
- `public/style.css` (app), `public/index.html` + `landing.css` + `landing.js` (landing page).
- `supabase/migrations/`: schema as numbered SQL files (`0001_init.sql` … `0009_habit_hidden.sql`).
- `scripts/migrate-to-supabase.js`: one-off importer from the old flat-file version. `scripts/legacy/`: dead one-off scripts. Neither is part of normal operation, so don't modify or run them.

## Rules that must hold

1. **Data isolation is enforced by Postgres RLS, not by app code.** Every table has a `user_id uuid not null references auth.users(id) on delete cascade`, RLS enabled, and a `"user_isolation"` policy using `public.is_owner(user_id)`. Any new table must follow the same pattern. Still filter by `user_id` in `lib/db.js` queries as defense in depth.
2. **Always use `req.supabase`** (the user's own client) for reads and writes. `adminClient()` bypasses RLS and is used *only* for account deletion. Never use it for anything else, and never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
3. **Schema changes = a new migration file.** Add `supabase/migrations/00NN_short_name.sql` with the next number. Never edit an existing migration (they're already applied in production). Tell the user that it has to be applied manually in Supabase. Also update `exportUserData` in `lib/db.js` if a new table holds user data.
4. **Edit windows are enforced server-side.** The UI only mirrors them. Throw an error with `.status = 403` when a save falls outside the window:
   - Daily data (entry, summary/recap, learnings, reflexion, habit values, time entries): any date **up to today**, never the future (`requireNotFuture`). Editing past days is intended.
   - Weekly notes and week reflexion: only the **current week**.
   - Cycles: until the cycle's end date (`decorateCycle`).
5. **"Today" means `todayStr()` in Europe/Berlin**, not UTC and not the host clock. Never use `new Date().toISOString().slice(0,10)` for "today" on the server (this caused a real bug, see commit `605f0c5`). Weeks start on **Monday** (`weekStart`).
6. **Dates are `YYYY-MM-DD` strings.** Validate route params with `isValidDate` and return 400 via `badDate(res)` on bad input.
7. **Errors:** throw `Error` with a `.status` (400 bad input, 403 outside edit window, 404 not found, 409 conflict). `checkError(error)` turns Supabase errors into 500s.

## Conventions

- Match the existing style: 2-space indent, single quotes, semicolons, small focused functions, comments that explain *why*.
- UI text is English except the "Reflexionen" feature name. Keep it consistent with the surrounding UI.
- Autosave in note editors runs ~0.6 s after typing stops and on blur. Reuse the existing timer pattern.
- Commit messages: one imperative sentence describing the user-visible change (e.g. "Let habits be hidden from the daily page"). One logical change per commit.

## Boundaries

- Don't read, print or commit `.env`, `.env.local` or `.vercel/`.
- Don't push, deploy, or run SQL against the production Supabase project without asking.
- Personal journal data is **not** in this repo. The old flat-file data was archived outside the project. Don't recreate data folders such as `entries/` (they're still listed in `.gitignore` as a safety net).
- Ask before large refactors (e.g. splitting `public/app.js` into modules or introducing a framework or build step).

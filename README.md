# 📓 Journal

A personal daily journal. Each day gets its own page. **Only today's page is editable** — past days are view-only. Your entries are plain Markdown files in `entries/`, so you fully own your data.

## Run

```bash
cd journal-app
node server.js
```

Then open http://localhost:3000

(Optional: `PORT=4000 node server.js` to use a different port.)

## How it works

- The "only today is editable" rule is enforced **server-side** — past days return `403` on any save attempt, not just hidden in the UI.
- Entries auto-save ~0.6s after you stop typing (and on blur).
- Each entry is stored at `entries/YYYY-MM-DD.md`. Back them up or edit them with any tool.
- "Today" is based on your Mac's local date.

## Files

- `server.js` — zero-dependency Node server (API + static files)
- `public/` — the browser UI (`index.html`, `style.css`, `app.js`)
- `entries/` — your journal, one Markdown file per day
# Journal-app

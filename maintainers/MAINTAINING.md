# Maintaining Task List OS

For people developing the kit itself. Customers never need this folder; the release zip leaves it out.

## What this project is

A kit a small business owner downloads and opens in Claude Code (or the Claude desktop app). They type `/setup`; Claude follows `START-HERE.md`, connects their email, calendar, call recorder and apps (`setup/connections/`), writes up the business in `context/`, and fills the task list app (`apps/task-list/`) with their real work. The downloaded folder becomes the customer's workspace. Claude can then check in every hour through a scheduled task in the Claude desktop app.

## Stack

- No framework, no build step. The app is `index.html` plus plain JavaScript and CSS. Nothing loads from the internet.
- `apps/server/`: `server.js` (Node, no libraries) and `server.py` (Python 3 fallback). Serves `apps/` on 127.0.0.1:4747 and reads and saves `apps/task-list/data/tasks.json` through `/api/tasks` (backup and atomic save; refuses other hosts, other origins and paths outside `apps/`). `setup/scripts/start-task-list.*` starts it; `autostart-mac.sh` and `autostart-windows.ps1` make it start at login.
- `apps/shared/`: `theme.css` (every design token), `base.css` (components and animation), `js/store.js` (File System Access API, IndexedDB to remember the folder, polling for Claude's edits, demo mode), `js/ui.js` (helpers and icons), bundled fonts and images.
- `apps/task-list/app/`: `model.js` (data shape, questions, every change, free-slot finder), `links.js` (Draft and Add to calendar links), `components.js`, one `view-*.js` per page (today, review, replies, calls, dump, week, calendar, lists, people), `drawer.js` (task, person, reply and call records), `app.js` (store, routing, actions, search, shortcuts), `demo-data.js`, `app.css`.
- Claude's side: `START-HERE.md`, `CLAUDE.md`, `setup/` (steps, `connections/` guides, `scripts/save-key.*`), `.claude/skills/` (loaded automatically by Claude Code, each also a slash command), `.claude/settings.json` (narrow pre-approved permissions for unattended check-ins), `context/` templates.
- `maintainers/research/`: the verified facts behind the connection guides, with sources and dates. Re-check them when a connector changes.

## Commands

- Run the app: `node apps/server/server.js` (or `python3 apps/server/server.py`), then open http://localhost:4747. Without the helper, `Open Task List.html` still opens the app from the file, which can connect to the folder through Chrome's File System Access as a fallback.
- Test: by hand, see `maintainers/TESTING.md`.
- Release zip: `bash maintainers/make-release.sh` (creates `dist/task-list-os.zip`; refuses to build if the shipped files contain real data).

## Rules

- The repo is the customer's starting workspace. Anything committed ships. Never commit filled-in `context/` files, real tasks, replies or calls, a ticked `setup/progress.md`, or `CLAUDE.md` with "Setup: complete". The release script checks for these.
- Every data change in the app goes through `store.update()`, which re-reads the file, applies the change, writes a backup, then saves.
- Human in the loop: Claude proposes, the person approves. Read and draft only in connected apps. The app opens drafts and calendar events for the person to finish; it never sends. Never add anything that sends, pays, deletes or posts on the customer's behalf, and never pre-approve such tools in `.claude/settings.json`.
- Connection guides contain only verified facts with sources. Mark anything unverified as such.
- Customer-facing words (app, setup, skills, docs, context templates) never say agent, repo, repository or artifact. British English, digits for numbers, no em dashes anywhere. Examples use made-up people and businesses (Sam, Priya, Tom at Greenway Café, Marlow Dental).
- Look: neutral modern software (white and grey, system sans-serif, terracotta accent). The Get AI Powers slab-serif look can be restored from the note at the foot of `theme.css`.
- Future tools go in `apps/<tool-name>/`, copying the task list's structure, with their own skills and a launcher at the root.

## Gotchas

- `apps/task-list/index.html` links to `../shared/`; the launcher at the root redirects to it. Keep both.
- `components.js` finds the images folder from the `theme.css` link, so keep that `<link>` first.
- The app looks for `tasks.json` in `data/`, the folder picked, or `apps/task-list/data/`, so customers can pick the main folder.
- Testing writes into `apps/task-list/data/tasks.json` and creates `tasks.backup.json` (ignored by git). Test on a copy; `git checkout -- apps/task-list/data` restores the shipped file.
- File System Access can't be automated (native picker). For automated checks, replace `window.showDirectoryPicker` with a function returning a folder from `navigator.storage.getDirectory()`. Native drag and drop can't be automated either; dispatch `DragEvent`s with a `DataTransfer`.
- Polling pauses while the tab is hidden; it re-checks when the tab comes back into view.
- The Gmail, Outlook and calendar "compose" links in `links.js` are widely used but not officially documented by Google or Microsoft. If one breaks, the fallback is the email app (`mailto:`) or the `.ics` download.

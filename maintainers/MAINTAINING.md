# Maintaining Task List OS

For people developing the kit itself. Customers never need this folder, but it is public on GitHub, so keep it free of anything private.

## What this project is

A kit a small business owner copies from GitHub (they ask Claude to clone it) and opens in Claude Code (or the Claude desktop app). They type `/setup`; Claude follows `START-HERE.md`, connects their email, calendar, call recorder and apps (`setup/connections/`), writes up the business in `context/`, and fills the task list app (`apps/task-list/`) with their real work. The downloaded folder becomes the customer's workspace. Claude can then check in every hour through a scheduled task in the Claude desktop app.

## Stack

- No framework, no build step. The app is `index.html` plus plain JavaScript and CSS. Nothing loads from the internet.
- `apps/server/`: `server.js` (Node, no libraries) and `server.py` (Python 3 fallback). Serves `apps/` on 127.0.0.1:4747 and reads and saves `apps/task-list/data/tasks.json` through `/api/tasks`, plus each attached tool's data files (listed in `apps/installed.json`) through `/api/data/<tool>/<file>.json` (backup and atomic save; refuses other hosts, other origins, unlisted files and paths outside `apps/`). `http://localhost:4747` opens the first tool in `apps/installed.json`. `setup/scripts/start-task-list.*` starts it; `autostart-mac.sh` and `autostart-windows.ps1` make it start at login.
- `apps/shared/`: `theme.css` (every design token, a light set and a dark set), `base.css` (components and animation), `sidebar.css` (the sidebar every tool shares), `js/store.js` (helper mode, File System Access fallback, polling for Claude's edits, demo mode), `js/ui.js` (helpers and icons), `js/theme.js` (light or dark), `js/sidebar.js` (tool dropdowns, other installed tools, "More tools" and the booking panel), `catalogue.json` (all 9 tools and the booking link), `VERSION` (the shared version), bundled fonts (Figtree) and images.
- `apps/home/`: Home, the dashboard for the whole app (`index.html`, `home.js`, `home.css`). Each installed tool adds boxes through its `menu.json` (`home.scripts`) and `home-boxes.js`; the layout each person picks is saved in `apps/home/data/layout.json` (never shipped).
- `apps/installed.json`: the tools in this folder. A fresh download lists only Task List OS. `toolkit.json` at the root describes Task List OS for attaching; `apps/task-list/ATTACH-CLAUDE.md` is what goes into another tool's `CLAUDE.md` when Task List OS is attached to it; `apps/task-list/menu.json` lists its pages for the sidebar and its Home boxes (`home-boxes.js`).
- `apps/task-list/app/`: `model.js` (data shape, questions, every change, free-slot finder), `links.js` (Draft and Add to calendar links), `components.js`, one `view-*.js` per page (today, review, replies, calls, dump, week, calendar, lists, people), `drawer.js` (task, person, reply and call records), `app.js` (store, routing, actions, search, shortcuts, Add meeting), `demo-data.js`, `app.css`.
- Claude's side: `START-HERE.md`, `CLAUDE.md`, `setup/` (steps, `connections/` guides, `scripts/save-key.*`), `.claude/skills/` (loaded automatically by Claude Code, each also a slash command), `.claude/settings.json` (narrow pre-approved permissions for unattended check-ins), `context/` templates.
- `maintainers/research/`: the verified facts behind the connection guides, with sources and dates. Re-check them when a connector changes.

## Commands

- Run the app: `node apps/server/server.js` (or `python3 apps/server/server.py`), then open http://localhost:4747. Without the helper, `Open Task List.html` still opens the app from the file, which can connect to the folder through Chrome's File System Access as a fallback.
- Test: by hand, see `maintainers/TESTING.md`.
- Publish: customers clone `main` on GitHub (`georgecairns-ui/task-list-os`). Work happens on a `claude/...` branch. To publish, run `bash maintainers/make-release.sh` first as the safety check (it refuses to build if the shipped files contain real data, and its zip in `dist/` is a handy local test copy). Then bring `public-main` level with the work branch in one commit (`git checkout public-main && git rm -rq . && git checkout <work branch> -- . && git commit`), so the public history shows releases only, never work in progress, and push it with `git push origin public-main:main`. Never force-push `main`: people have copies of it.

## Rules

- The repo is the customer's starting workspace. Anything committed ships. Never commit filled-in `context/` files, real tasks, replies or calls, a ticked `setup/progress.md`, or `CLAUDE.md` with "Setup: complete". The release script checks for these, so always run it before publishing.
- Every data change in the app goes through `store.update()`, which re-reads the file, applies the change, writes a backup, then saves.
- Human in the loop: Claude proposes, the person approves. Read and draft only in connected apps. The app opens drafts and calendar events for the person to finish; it never sends. Never add anything that sends, pays, deletes or posts on the customer's behalf, and never pre-approve such tools in `.claude/settings.json`.
- Connection guides contain only verified facts with sources. Mark anything unverified as such.
- Customer-facing words (app, setup, skills, docs, context templates) never say agent, repo, repository or artifact. British English, digits for numbers, no em dashes anywhere. Examples use made-up people and businesses (Sam, Priya, Tom at Greenway Café, Marlow Dental).
- Look: modelled on Joey's Task Tracker Kit (`11_Tools/task-tracker-kit` in the Get AI Powers Brain): Figtree, white and soft grey, outlined cards, near-black main buttons, segmented switches, small Claude terracotta accents only. Light and dark, switched in the top bar. Never type a colour into a tool's CSS: use `theme.css` variables so both modes work. Setup's `match-my-brand` skill swaps in the customer's colours, font and logo. The Get AI Powers slab-serif look can be restored from the note at the foot of `theme.css`.
- **The toolkit.** Task List OS is the first of 9 tools. `ATTACHING.md` (identical in every tool) is the spec for how they attach. The shared parts are at shared version 3 (`apps/shared/VERSION`); `maintainers/SHARED-V3-CHANGES.md` lists exactly what every other tool copies from here (`SHARED-V2-CHANGES.md` is kept for the record). Change a shared part here and the version goes up, then the change is copied into every other tool.
- **The booking link lives only in `apps/shared/catalogue.json`.** The menu adds `utm_source` (this tool's repository name), `utm_medium=toolkit-app` and `utm_campaign` (the locked tool's id). No prices for Get AI Powers services anywhere in the kit.
- The locked tools never nag: no pop-ups that appear by themselves, no countdowns. They only open when clicked.

## Gotchas

- `apps/task-list/index.html` links to `../shared/`; the launcher at the root redirects to it. Keep both.
- `components.js` finds the images folder from the `theme.css` link, so keep that `<link>` first.
- The app looks for `tasks.json` in `data/`, the folder picked, or `apps/task-list/data/`, so customers can pick the main folder.
- Testing writes into `apps/task-list/data/tasks.json` and creates `tasks.backup.json` (ignored by git). Test on a copy; `git checkout -- apps/task-list/data` restores the shipped file.
- File System Access can't be automated (native picker). For automated checks, replace `window.showDirectoryPicker` with a function returning a folder from `navigator.storage.getDirectory()`. Native drag and drop can't be automated either; dispatch `DragEvent`s with a `DataTransfer`.
- Polling pauses while the tab is hidden; it re-checks when the tab comes back into view.
- The Gmail, Outlook and calendar "compose" links in `links.js` are widely used but not officially documented by Google or Microsoft. If one breaks, the fallback is the email app (`mailto:`) or the `.ics` download.

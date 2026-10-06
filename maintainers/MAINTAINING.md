# Maintaining Task List OS

For whoever develops the kit itself (Get AI Powers). Customers never need this folder; the release zip leaves it out.

## What this project is

A shareable kit a small business owner downloads (GitHub "Download ZIP" or the release zip) and points their own Claude at. Claude runs `START-HERE.md`, which connects their email and apps, writes up the business in `context/`, installs `skills/`, and sets up the task list app in `apps/task-list/`. The downloaded folder becomes the customer's workspace.

Lives at `~/Repos/getaipowers/task-list-os`. Phase 1 was built in `~/Claude/05_Marketing/small-business-toolkit` and moved here on 6 October 2026.

## Stack

- No framework, no build step. The app is `index.html` plus plain JavaScript and CSS, opened by double-clicking.
- `apps/shared/`: `theme.css` (every brand token), `base.css` (components and animation), `js/store.js` (File System Access API, IndexedDB to remember the folder, polling for Claude's edits, demo mode), `js/ui.js` (helpers), bundled WOFF2 fonts and images.
- Plain JavaScript only. No TypeScript, no libraries, nothing loaded from the internet.
- Setup, context, skills and docs are Markdown.

## Commands

- Run: double-click `Open Task List.html` (Chrome or Edge).
- Test: by hand, see `maintainers/TESTING.md`.
- Release zip: `bash maintainers/make-release.sh` (creates `dist/task-list-os.zip`; refuses to build if the shipped files contain test data).

## Rules

- The repo IS the customer's starting workspace. Anything committed ships. Never commit filled-in `context/` files, real tasks, a ticked `setup/progress.md`, or `CLAUDE.md` with "Setup: complete". The release script checks for these.
- Every data change in the app goes through `store.update()`, which re-reads the file, applies the change, writes a backup, then saves.
- Human in the loop: Claude proposes, the person approves. Read and draft only in connected apps. Never add a path that sends, pays, deletes or posts on the customer's behalf.
- Customer-facing words (app, setup, skills, docs, context templates) never say agent, repo, repository or artifact. British English, digits, no em dashes anywhere, no George or other real people in examples (use Sam, Priya, Tom at Greenway Café, Marlow Dental).
- Brand: Get AI Powers warm palette, Zilla Slab and Source Serif 4, Claude character on every app screen. All values in `apps/shared/theme.css`.
- Future tools go in `apps/<tool-name>/`, copying the task list's structure (`index.html`, `app/`, `data/`, `CLAUDE.md`), with their own setup step and skills. Add a launcher HTML at the root for each.
- Git: feature branches `claude/<name>`, focused commits. Never delete files; move to `~/Claude/99_Archive` and ask George first.

## Gotchas

- `apps/task-list/index.html` links to `../shared/`. The launcher at the root redirects to it. Keep both.
- `app.js` finds the images folder from the `theme.css` link, so keep that `<link>` first.
- The app looks for `tasks.json` in `data/`, the folder picked, or `apps/task-list/data/` (`dataPaths` in `app.js`), so customers can pick the main folder when connecting.
- Testing writes into `apps/task-list/data/tasks.json` and creates `tasks.backup.json` (gitignored). Always test on a copy. `git checkout apps/task-list/data/tasks.json` restores the shipped file.
- File System Access can't be automated (native picker). For automated checks, replace `window.showDirectoryPicker` with a function returning a folder from `navigator.storage.getDirectory()`.
- Polling pauses while the tab is hidden, by design; it re-checks when the tab comes back into view.
- `master-facts.md` (cofounder plugin) has no entry yet for the 4 week setup mentioned in setup step 8 and the README. Ask George before adding any price.

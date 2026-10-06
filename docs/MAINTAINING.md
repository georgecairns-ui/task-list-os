# What this project is

The Get AI Powers small business toolkit: standalone web-app modules for non-technical small business owners, where the app and the customer's own Claude share plain JSON files in the module folder. Used as a free lead magnet (one module), a sales call tool and a paid bundle. Not deployed anywhere; customers receive zips from `dist/`.

# Stack

- No framework, no build step. Each module is `index.html` plus plain JavaScript and CSS, opened by double-clicking.
- Shared code in `shared/`: `theme.css` (every brand token), `base.css` (components and animation), `js/store.js` (File System Access API, IndexedDB to remember the folder, polling for Claude's edits, demo mode), `js/ui.js` (helpers).
- Fonts bundled as WOFF2 in `shared/fonts`. Nothing may load from the internet.
- Plain JavaScript only. No TypeScript, no libraries.

# Commands

- Run locally: open `modules/<module>/index.html` in Chrome or Edge.
- Test: none automated. Test by hand in Chrome: connect, add, approve, skip, tick, reload, demo on and off, phone width. Test on a copy, never the shipped `data/` files.
- Build: `bash build/make-zips.sh` (zips into `dist/`).

# Rules for this project

- Phase 1 (shared + module 01) is done. Do not start phase 2 (modules 02 to 06 and the full toolkit home) until George says "go to phase 2".
- Brand: Get AI Powers, warm document palette (cream, espresso, terracotta), Zilla Slab headings, Source Serif 4 body, mono caps labels, Claude character on every screen. Load `get-ai-powers-brand` and `brand-web-kit`. All values live in `shared/theme.css`; never hard-code a colour in a module.
- Every data change in a module goes through `store.update()`. It re-reads the file, applies the change, writes a backup, then saves. Never write the data file any other way.
- Human in the loop: Claude proposes, the person approves. Never add a UI path that lets Claude's suggestions take effect without a click.
- Customer-facing words (UI, INSTALL.md, CLAUDE.md, README.txt) never say agent, repo, repository or artifact. British English, digits for numbers, no em dashes anywhere, including code comments.
- Every module copies module 01's structure: `index.html`, `app/`, `data/`, `INSTALL.md`, `CLAUDE.md`, `README.txt`.
- Not a git repository. Copy files aside before significant edits.
- Never delete files. Move to `~/Claude/99_Archive` and ask George first.

# Gotchas

- `index.html` links to `../../shared/`. The build script rewrites this to `shared/` inside each zip. Do not change the link style or the rewrite breaks.
- `app.js` finds the images folder from the `theme.css` link, so keep that `<link>` in every module.
- Testing writes into `data/tasks.json` and creates `data/tasks.backup.json`. Test on a copy. The build excludes `*.backup.json`, but a modified `tasks.json` would ship.
- File System Access needs a click to open the picker and can't be automated. For automated checks, swap `window.showDirectoryPicker` for a function returning a folder from `navigator.storage.getDirectory()`; same API.
- The Bash sandbox blocks local ports. Use the `toolkit-test` entry in `.claude/launch.json` with the preview tools; it serves a scratch copy.
- `master-facts.md` has no entry yet for the toolkit price or the 4 week setup mentioned in INSTALL.md. Ask George before adding prices anywhere.

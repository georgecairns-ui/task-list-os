# Small business toolkit

Plug-and-play business tools that look like simple web apps but are really files that Claude reads and writes. Each module works on its own (lead magnet, free module) and will plug into the others (paid bundle).

Status, 6 October 2026: phase 1 done. `shared/` and module 01 (the task list) are built and tested. Modules 02 to 06 and the full toolkit home screen are phase 2.

## What's in here

```
small-business-toolkit/
  README.md            this file (for George)
  CLAUDE.md            rules for Claude when working on the toolkit itself (not shipped)
  shared/              used by every module
    theme.css          ALL brand colours, fonts, sizes, spacing, corners, shadows
    base.css           shared pieces: buttons, cards, inputs, switches, pop-ups, toasts, animations
    js/store.js        connects a module to its data file, saves changes, spots Claude's edits, demo mode
    js/ui.js           small helpers: icons, notifications, dates, copy to clipboard
    fonts/             Zilla Slab and Source Serif 4, bundled (no internet needed)
    images/            Get AI Powers logo and the Claude character stills
  modules/
    01-task-list/
      index.html       the app (double-click to open)
      app/             the app's own code, styles and demo data
      data/tasks.json  the file Claude and the app share (ships with 5 example tasks)
      INSTALL.md       instructions for the customer's Claude to set it up
      CLAUDE.md        standing instructions for the customer's Claude, every day
      README.txt       3 lines for the customer
  build/make-zips.sh   builds one clean zip per module
  dist/                the zips (made by the build script)
```

## How to look at module 01

1. Open `modules/01-task-list/` and double-click `index.html`. Use Chrome or Edge.
2. To see it full of realistic data straight away, flick the **Demo** switch in the top right. It shows a made-up design studio, Fern & Finch. Nothing in demo mode is saved anywhere. Switch it off again before handing over a laptop.
3. To try it for real, click **Connect your task list**, pick the `01-task-list` folder, click **Allow**. Your clicks then save into `data/tasks.json`.

Warning: if you connect the real folder here and click around, you change the sample file that ships to customers. Either use Demo mode, or test on a copy (unzip `dist/01-task-list.zip` somewhere else and test that).

## How it saves (the choice we made)

The app uses Chrome and Edge's built-in File System Access feature. The customer connects the folder once and clicks Allow. After that, every approve, tick and edit is written straight into `data/tasks.json`. The app checks the file every few seconds, so when Claude changes it the screen updates by itself. Before every save the app re-reads the file and keeps the previous version as `tasks.backup.json`, so it never overwrites Claude's latest edit.

Safari and Firefox can't do this. They get a friendly "open this in Chrome or Edge" screen and can still try the demo.

## Re-branding for a client

Change the values in `shared/theme.css`. That's it for colours, fonts and shapes. To change the logo, replace the 2 SVG files in `shared/images/` (keep the same file names). Then rebuild the zips.

## Building the zips

From the `small-business-toolkit` folder, run:

```bash
bash build/make-zips.sh
```

You get one zip per module in `dist/`, for example `dist/01-task-list.zip`. Each zip has its own copy of `shared/` inside, so it works with nothing else installed. The script leaves out hidden Mac and Windows files and any test backups, checks the data files are valid, and stops with a clear message if anything is wrong.

## Adding a module (phase 2 pattern)

1. Copy `modules/01-task-list` to `modules/02-whatever`.
2. Rename the data file (for example `data/pipeline.json`) and set `MODULE_ID` and `DATA_FILE` at the top of `app/app.js`.
3. Replace the screens in `app/app.js` and `app/app.css`. Keep using `store.update()` for every change, so saving, backups and the "Claude updated your list" refresh all keep working.
4. Write new demo data in `app/demo-data.js` (made-up business, dates worked out from today).
5. Rewrite `CLAUDE.md` (the data format and what to do when asked) and `INSTALL.md` (questions to ask, what good looks like, the gentle gaps note at the end). Keep the same section order as module 01.
6. Run `bash build/make-zips.sh`.

## Known limits

- Needs Chrome or Edge on a laptop or desktop. Phones can view the layout but phone browsers cannot connect a folder.
- In some versions of Chrome the customer clicks "Open my task list" once per visit. Newer Chrome versions offer "Allow on every visit", which removes that click.
- The app spots Claude's changes while its window is in view. If it's in a background tab, it catches up the moment you click back to it.

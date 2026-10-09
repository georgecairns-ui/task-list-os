# Shared version 6: what changed since version 5

Shared version 6, 9 October 2026. Everything in `SHARED-V3-CHANGES.md`, `SHARED-V4-CHANGES.md` and `SHARED-V5-CHANGES.md` still applies; this file lists only what's new.

**New in version 6: no demo mode in any kit.** George's rule: the kit people install holds their hand and never shows a made-up business. The demo exists only on the shareable demo page, built outside the repo.

## What changed

| Path | Change |
|---|---|
| `apps/shared/js/store.js` | Demo mode removed: no `makeDemoData` option, no `setDemo` or `isDemo`, no "demo" status, no `task-list-os-demo-mode` flag |
| `apps/shared/js/braindump.js` | The demo check removed |
| `apps/shared/theme.css` | Brand colours (from version 5's release) |
| `apps/shared/VERSION` | `6` |

## What each tool does

- Delete its `app/demo-data.js` and every `makeDemoData`, `setDemo`, `isDemo`, `demo-on`, `demo-off` and "Demo mode" banner, switch or link.
- Ship an empty data file: no example records.
- Before setup (no name and no records), show a short card on the tool's main page and its first Home box saying what to do next: open the folder in the Code tab of the Claude desktop app and type `/setup`, with a copy button. Every other empty state says what fills it and how.
- Keep the sample business for the shareable demo page outside the repo, in `~/Claude/08_Artifacts/<Tool>-Demo/`, with the script that builds that page from the published kit.
- Make the release check refuse demo data or demo code.

## Testing

- A fresh install shows the setup card, never sample data, and no screen mentions a demo.
- The release check fails if `demo-data.js` or any demo code comes back.

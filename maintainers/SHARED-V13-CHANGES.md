# Shared version 13: what changed since version 12

Shared version 13, 29 October 2026. Everything in `SHARED-V3-CHANGES.md` to `SHARED-V12-CHANGES.md` still applies, except the install route: version 13 puts back the plain download while the repositories are public (see "Install while public" below). This file lists only what's new.

**Made in Task List OS first,** then copied to the other 6 tools. The full design is `specs/2026-10-28-shared-v13-connected-onboarding-design.md` in the Small Business Toolkit folder on the Drive; the plan is `plans/2026-10-28-shared-v13-connected-onboarding.md` next to it.

**Why:** a test customer installed the toolkit on 28 October 2026 in the Claude desktop app (Code tab). Claude did not connect their email, calendar or other apps, so the operating system stayed empty. The spec's problem section:

> The cause is in our own setup files, not in a missing connector:
> - `setup/02-connect-email-and-calendar.md`: "If they'd rather not connect email, note it ... and move on" and "If it fails, try once more, then note it ... and carry on."
> - `setup/04-connect-other-apps.md` and `setup/toolkit-02-connect-the-rest.md`: "If something gets fiddly, note it ... and move on: a partly connected setup that works beats a long afternoon."
> - `connect-a-tool` and every guide in `setup/connections/` tell Claude to "ask the person what they actually see", so Claude never checks the connector state itself.
> - Even when email connects, setup reads only the 5 newest emails as a test. Nothing imports history.
> - Scheduled check-ins are optional, set up by the person through menus, and stop at permission prompts for connector tools, so the app goes stale.

## What version 13 does

1. **Setup runs only in the Claude desktop app, Code tab.** `START-HERE.md` "Before you begin" item 1 finds the connector status tool (it is often deferred, so Claude searches for it first, then calls it). If it can't be found or the call fails, Claude stops and says what to do.
2. **Claude checks connections itself.** `session_connectors_status` says whether each connector is on, switched off for this session, needs signing in, or not working. Claude switches on, reconnects or points to Customize, then Connectors. Nobody is asked to describe their screen.
3. **Email and calendar are a hard gate** (step 2). The only ways past are "proven with a real read, and the last 30 days imported" or "their provider has no Claude connector" (said plainly, recorded `no-connector`). Calendar import is 30 days back to 14 days ahead.
4. **Every connection is proven with a real read before it is recorded.** `apps/home/data/connections.json` holds one row per app with a status (`connected`, `needs-attention`, `export-only`, `no-connector`, `not-connected`, `not-used`) and a `checked` date. `connected` needs a `checked` date, and the shared model refuses it without one.
5. **A Connections box on Home** (shared, loaded last) shows "N of M connected", `needs-attention` rows first with a **Fix it** button that opens Claude on that connection, and a plain message when the file doesn't exist yet. The Small Business Toolkit shows its own box from the same file, so the shared one stays out of its way.
6. **An app with no connector** gets one sentence, word for word: "There's no Claude connector for [app], so I can't connect to it live. If you export a CSV or PDF from it and drop it in the files folder, I'll read it whenever you ask." It is recorded `export-only`.
7. **No keys, no third-party servers in setup.** Every guide in `setup/connections/` has the same sections in the same order: Connect, Prove it, What Claude may and may not do, Record, Sources. Custom connectors by web address only when the address is the app maker's own and is written in our guide. `setup/scripts/save-key.*` stays, for the optional Xero draft invoices extra only.
8. **Guide mode.** `START-HERE.md` asks once how much the person has used Claude Code (beginner, some, confident) and writes `Guide mode:` in `setup/progress.md`. It changes pace and how much Claude explains, never the rules.
9. **Check-ins are created by Claude, a few times a day, and read without stopping.** Step 8 agrees the times, asks once to pre-approve each connection's read tools in `.claude/settings.local.json`, creates the scheduled task itself (checking `list_scheduled_tasks` first, so there is only ever 1), runs it once and checks it finished. `check-in` gains a Connections step that keeps `connections.json` up to date and sets `needs-attention` when a read fails.
10. **Hand-over checks real connections** (step 9): email and calendar `connected` with today's date, every named app in a final status, the check-in task exists and its first run finished.
11. **The helper serves the shared file.** `server.js` and `server.py` serve `apps/home/data/connections.json` like any other Home data file. Any other Home file name is still refused.
12. **Install while public.** Install and `get-updates` go back to the plain download (`https://github.com/georgecairns-ui/<repository>/archive/refs/heads/main.tar.gz`, no GitHub account). The v12 sign-in route is kept word for word in `maintainers/PRIVATE-INSTALL.md`, with where each piece goes, for the day the repositories go private. The release check fails on `gh auth`, `gh api` or `gh repo` in shipped setup files until then.

## What every tool copies, byte for byte

Copy each path from Task List OS's branch with `rsync -a`. Only the guides a tool already ships are copied.

| Path | Change |
|---|---|
| `apps/server/server.js` | Serves `apps/home/data/connections.json` (a `CONNECTIONS` constant; Home's data lookup returns it for `connections.json` only) |
| `apps/server/server.py` | The same, as a lookup of the 3 allowed Home file names |
| `apps/shared/js/connections.js` | New. The shared model: reads the file, orders rows (`needs-attention` first), counts, refuses `connected` without a `checked` date |
| `apps/shared/js/connections-box.js` | New. The shared Home box and its Fix it link |
| `apps/home/home.js` | `start()` loads the shared Connections box last, unless the toolkit (`id: "toolkit"`) is installed |
| `.claude/skills/connect-a-tool/SKILL.md` | Rewritten: find the route, check or switch on or point to Connect, prove with a real read, record, no-connector sentence, `needs-attention` instead of giving up. Needs the connector status tool |
| `.claude/skills/get-updates/SKILL.md` | Plain download again (no `gh`); "hourly check-in" becomes "scheduled check-in" |
| `setup/connections/<app>.md` for every guide the tool ships | Each rewritten to the same 5 sections. Each lists its read tools under "Pre-approve for check-ins". Facts checked live on 29 October 2026 (see "Decisions") |
| `setup/connections/README.md` | Table rows for QuickBooks, FreeAgent and Stripe updated, and a new "Recording a connection" section (identical in every tool). The tool table differs per tool: keep your own and take only the intro line and "Recording a connection" |
| `apps/shared/VERSION` | `13` and `2026-10-29` |
| `maintainers/test-connections.js` | New. 10 checks on the model |
| `maintainers/test-helper-safety.js` | New check: Home's connections file reads and saves, any other Home file name is refused (17 checks per helper) |
| `maintainers/PRIVATE-INSTALL.md` | New. The v12 sign-in wording, to put back when the repositories go private. Adapt the tool name and repository |
| `maintainers/SHARED-V13-CHANGES.md` | This file |

## Each tool adapts

Task List OS's own versions are the reference. "Its own equivalent" means the same change in the tool's own file or wording.

- **`START-HERE.md`:**
  - The copy paragraph: plain download with the tool's own folder and repository name (the `archive/refs/heads/main.tar.gz` lines, no `gh`), and "If the download fails, check their internet connection and run the line again. Don't try another way in."
  - The "already copied it another way" line: open the Code tab, choose the folder, trust it, type `/setup`.
  - "Before you begin" items 1 (surface check) and 2 (experience question and guide mode table), word for word. The old items move down.
  - The steps table rows for 2, 4 and 8, and the intro bullet about check-ins ("a few times a day, at times they choose. They can skip it"), in the tool's own words.
  - The standing rules: no keys, "Be honest about what you can reach".
  - The intro line for the person: Claude desktop app, Code tab.
- **`README.md`:** "What you need" is the desktop app and a paid Claude plan (no GitHub access item); "Get started" opens the desktop app's Code tab and drops the GitHub sign-in sentences; the note for Claude points at START-HERE.md on the repository page; the paragraph about keys becomes the Connectors paragraph; "last 30 days of email"; check-ins "a few times a day, at times you choose"; the folder map drops "the key scripts". Each tool's own README wording.
- **`setup/progress.md`:** add `Guide mode: not asked yet` under "Setup status".
- **`CLAUDE.md`:** add the line about `apps/home/data/connections.json` under the rule that covers secrets and connections (rule 3 in Task List OS).
- **`toolkit.json`:** `sharedVersion` `"13"`.
- **`maintainers/make-release.sh`:** replace the v12 download rule with the v13 rule block, word for word from Task List OS (a `raw.githubusercontent.com` check, then the banned-phrase patterns for `START-HERE.md`, `README.md`, `setup/` and the `connect-a-tool` and `get-updates` skills, with `xero-drafts.md` exempt). Add `apps/shared/js/connections.js` and `apps/shared/js/connections-box.js` to the must-exist list.
- **`maintainers/MAINTAINING.md`:** shared version 13, latest changes file `SHARED-V13-CHANGES.md`, and the line about check-ins ("a few times a day, at times the person agrees").
- **`maintainers/TESTING.md`:** the scheduled check-in line says "at the agreed times", not hourly.
- **`docs/PRIVACY-AND-SAFETY.md`:** "Does it run when I'm not there?" says check-ins are a choice they can skip, run a few times a day at agreed times, and only read.
- **`.claude/skills/README.md`:** the `check-in` row says "a few times a day, at times you agreed".
- **`.claude/skills/check-in/SKILL.md`:** its own equivalent. New "Connections" step (`checked` to today, `needs-attention` back to `connected` after a good read, `needs-attention` plus a one-line note after a failed read, even in a scheduled run). The intro and `nextRunAt` say "agreed times". The connection-failure rule points to the new step.
- **`apps/task-list/CLAUDE.md`** (tool-specific, `apps/<tool>/CLAUDE.md` or its own equivalent): the `triage` example and the `nextRunAt` sentence use the agreed times (7:00 then 12:00) instead of an hourly interval.
- **Setup steps that connect apps**, its own equivalents of these Task List OS steps (the kit plan's Phase 2 lists them per tool):
  - `setup/01-quick-questions.md`: check connections for real with `session_connectors_status`, ask by guide mode, drop the check-in question, create `connections.json` with `not-connected` rows.
  - `setup/02-connect-email-and-calendar.md`: the hard gate, the status table, the proof, the 30-day read, "the only ways past", the record step.
  - `setup/03-connect-call-recordings.md`: the connect loop, "something else" row, record only after a read, `needs-attention` and on to step 4.
  - `setup/04-connect-other-apps.md`: the connect loop and the no-connector sentence, no keys, QuickBooks and FreeAgent rows updated, `needs-attention` instead of stalling.
  - `setup/07-first-run.md`: calendar and inbox are already filled in step 2 from 30 days, the later items renumber, the example says "last 30 days".
  - `setup/08-make-it-automatic.md`: replaced (agree times, pre-approve read tools, create, run and verify, record).
  - `setup/09-check-and-hand-over.md`: 3 new checks, the hand-over summary adds emails read, replies needed and which apps are connected or export-only, and "at what times".
  - Tools without email (Content Machine OS, Money View OS, Ads OS, Skill and Folder Map OS) gain no email step; their own required apps use the step 4 connect loop.
- **Any other file that says "hourly", "every hour" or "check in automatically"** (`get-updates` already copied; a tool's own docs, `START-HERE.md`, `README.md`): reword to "a few times a day, at times they agree". Leave `SHARED-V11-CHANGES.md` alone, it is history.

## Decisions made while building

**The 3 differences from the spec** (also in the PR description):

1. **Where the status file lives:** `apps/home/data/connections.json`, not `context/connections.json`. The helper serves only files under `apps/` on purpose, so the app can never read the person's private `context/` notes. `apps/home/data/` is already shared by every attached tool, is never shipped, and is where the Brain dump lives.
2. **The status word for "proven":** the file says `"connected"`, the word the kit's Connections page already uses. A row may only say `connected` with a `checked` date, set after a real read. The model refuses `connected` without one.
3. **Where the experience question is asked:** `START-HERE.md`, "Before you begin", straight after the surface check. That way it is asked once and identically in all 7 tools, including the 4 with no `01-quick-questions.md`.

**Other decisions:**

4. **The pre-approve rule is wider than the plan's first wording.** A guide's "Pre-approve for check-ins" list governs, whatever the tool-name prefix (Microsoft's read tools end in `_search`). An app without a guide uses only names starting or ending with `get`, `list`, `search`, `read`, `find`, `fetch` or `query`, and only if they only read. HubSpot and QuickBooks use only that mechanical rule, because their exact tool names are not confirmed. Microsoft 365's list includes SharePoint and Teams chat search, which George may want to narrow.
5. **The desktop-app check searches for the connector status tool first.** Connector tools are often deferred, so the tool may not be in Claude's visible list. Claude searches for `session_connectors_status`, then calls it, and stops only if it can't be found or the call fails.
6. **Live checks on 29 October 2026.** FreeAgent has no connector, so it is an export. Intuit's QuickBooks connector is US only, so everyone else exports. Stripe still signs in on Stripe's own page; the 30 November 2026 key deadline applies to keys only, which setup no longer uses.

## Known small gaps, for later

- `chip--outline` has no CSS in `apps/shared/base.css`. The model uses it for `no-connector` and `not-used`, so "Can't connect" rows show the plain default chip. Nothing breaks. Add a one-line rule when convenient.
- Zoom's `get_file_content` is left out of pre-approval until it is checked live. It stays in the read-only list.
- `setup/connections/xero-drafts.md` is named in `connect-a-tool`, `xero.md` and the release check's exemption, but the guide itself isn't written yet. Nothing offers it unless the person asks.
- The Home box counts `export-only` and `no-connector` rows in the total ("1 of 3 connected" with 1 export-only).
- Old key-route source URLs remain in the Sources lists of the Pipedrive, Calendly and Read AI guides.
- A failed `session_connectors_status` call also triggers the "needs the Claude desktop app" stop sentence.

## Tested

In Task List OS, on the `claude/shared-v13-connected-onboarding` branch:

- **Release build:** `bash maintainers/make-release.sh` passes ("Built dist/task-list-os.zip", 25 skills). It was written first as a failing check in Task 1 (49 setup-wording problems listed), and passes from Task 8.
- **`node maintainers/test-connections.js`:** 10 checks pass. It was run before the model existed (a crash on the missing file), then green. One comparison in the test was fixed because the model runs in a `vm` context with its own array prototype.
- **`node maintainers/test-helper-safety.js`:** 17 checks pass against the Node helper, 17 against the Python helper, and 1 against an older helper. First run red on the new connections-file check, then green. Run in a terminal tab, because the Bash sandbox can't open ports.
- **`node maintainers/test-helper-media.js`:** 13 checks pass against each helper, in a terminal tab.
- **Home box in the browser** (a scratch copy served by the helper): with a sample file it reads "1 of 3 connected", HubSpot first with "Needs attention" and a Fix it link, then Gmail and Google Calendar (Connected), then Sage (Export only). With the file removed it reads "Claude fills this in when it connects your apps during setup." The only console error is a 404 for the saved layout on a fresh copy, which existed before.
- **Not tested:** a real `claude -p` setup run end to end, the Windows install lines, and the scheduled check-in on a clean install.

## What the other 6 tools do

Follow the 6 steps in the kit plan's Phase 2: branch, copy the byte-for-byte files, make the "Each tool adapts" changes, make the tool's own changes, run `bash maintainers/make-release.sh`, `node maintainers/test-connections.js`, the tool's own tests and (in a terminal tab) both helper tests, then commit "Shared version 13: connected, guided onboarding" and open a PR that names Task List OS's PR. Nothing merges without George's yes.

---
name: get-updates
description: Bring this folder up to the latest version of the tools installed in it, keeping everything that is theirs: records, notes, documents, their own skills, their brand and every change they have made. Use when someone says "get the latest version", "any updates?", "update the app", "update my tools" or "Get AI Powers says there's a new version".
---

# Get updates

This folder is a plain copy. It is not linked to the public version, so nothing in it changes unless they ask. When they ask, you fetch the latest version, work out what is new, show them, and apply it once they say yes. Everything that is theirs stays exactly as it is.

Never use git in their folder. If it has a hidden `.git` folder, stop and say: "This folder is set up for someone building the kit, so it is updated a different way." Do nothing else.

Talk to them as the rest of this folder does: plain British English, short sentences, digits, no em dashes. Never say agent, repo, repository, artifact, JSON, schema, API or MCP.

## 1. What is in this folder

- `apps/installed.json`: the tools in this folder, in the order they were added. The first is the one they installed. Its own files (`CLAUDE.md`, `START-HERE.md`, `README.md`) are the folder's root files.
- `apps/shared/catalogue.json`: each tool's `repository` (its folder name online).
- `toolkit.json`: `version`, `sharedVersion` and `id`. If `id` is `small-business-toolkit`, this folder holds the whole toolkit as one piece: its `repository` is `small-business-toolkit` and it is fetched once, not tool by tool (step 2).
- `apps/shared/VERSION`: the shared version number.
- `setup/as-installed/<repository>.tar.gz`: the exact copy of each download as it was installed or last updated. It is how you tell their changes from the kit's. A download with none (copied another way, or attached before these were saved) is compared without it: see step 4.

## 2. Fetch the latest, outside this folder

Make a temporary folder outside their workspace and fetch into it. Say once what you are about to download, and ask them to allow it. Each command runs on its own, so note the temporary folder's path and reuse it.

**Public downloads** (every tool except the private toolkit). For each tool in `apps/installed.json`, find its `repository` in the catalogue:

- Mac: `T="$(mktemp -d)"; mkdir -p "$T/new/<repository>" && curl -fsL -o "$T/new/<repository>.tar.gz" https://github.com/georgecairns-ui/<repository>/archive/refs/heads/main.tar.gz && tar -xzf "$T/new/<repository>.tar.gz" --strip-components 1 -C "$T/new/<repository>"`
- Windows (PowerShell): `$T = Join-Path $env:TEMP ("update-" + (Get-Random)); New-Item -ItemType Directory -Force "$T\new\<repository>" | Out-Null; curl.exe -fsL -o "$T\new\<repository>.tar.gz" https://github.com/georgecairns-ui/<repository>/archive/refs/heads/main.tar.gz; tar -xzf "$T\new\<repository>.tar.gz" --strip-components 1 -C "$T\new\<repository>"`

**The private toolkit.** It is private, so it downloads with the person's own GitHub sign-in. Fetch it as one piece into `$T/new/small-business-toolkit`, then pack it so it can be saved in step 7:

- `gh repo clone georgecairns-ui/small-business-toolkit "$T/new/small-business-toolkit" -- --depth 1`, or `git clone --depth 1` of the same address, in the temporary folder only. Then remove the `.git` folder inside that temporary copy (`rm -rf` on a Mac, `Remove-Item -Recurse -Force` on Windows).
- `tar -czf "$T/new/small-business-toolkit.tar.gz" -C "$T/new" small-business-toolkit`
- If they are not signed in to GitHub, or the download is refused, say so in 1 sentence and ask them to sign in (`gh auth login`). If they have no GitHub access to it, stop and tell them to ask Get AI Powers. Do not try another way in.

**The old copies.** Unpack each `setup/as-installed/*.tar.gz` the same way into `$T/old/<repository>`.

## 3. Put together the new kit, and the old one

- **The private toolkit, or a folder with 1 tool:** the download is the kit. Nothing to assemble.
- **A folder with more than 1 public tool** is built the way `ATTACHING.md` describes, so assemble it the same way:
  1. **Shared parts** (`apps/shared/`, `apps/server/`, `apps/home/`, `ATTACHING.md`, the shared skills, `setup/scripts/`, `setup/connections/README.md`, `docs/`): from whichever download has the highest number in `apps/shared/VERSION`.
  2. **The root files and setup steps** (`CLAUDE.md`, `START-HERE.md`, `README.md`, `LICENSE`, `toolkit.json`, `setup/0*.md`): from the first tool in `apps/installed.json`.
  3. **Each tool's own parts**, from that tool: its `apps/<tool>/` folder, the skills and setup steps named in its `toolkit.json`, and its connection guides.

Leave out of both: `maintainers/`, `.gitignore`, `dist/`. Do the same with the old copies, so you have an old kit and a new kit with the same paths.

If the new kit is the same as the old one, file for file, tell them "You're on the latest version", clean up the temporary folder and stop.

## 4. Sort every file

**Theirs. Never replaced, never changed by an update:**
- `context/` (every file except `README.md`), `files/` (every file except the READMEs), `setup/progress.md`, `skills-to-upload/`
- `setup/as-installed/` (only step 7 changes it)
- every tool's `data/` folder (their records, photos and videos), and `apps/home/data/`
- `.claude/settings.local.json`
- any skill folder in `.claude/skills/` that is in neither the new kit nor the old one: those are the skills built for this business

For every other file in the new kit, compare 3 versions with `shasum -a 256` on a Mac or `Get-FileHash` on Windows: **old** (as installed), **now** (in their folder) and **new**.

| Old, now and new | What to do |
|---|---|
| Now is the same as new | Nothing |
| Not in their folder, and not in the old kit | **Add it** |
| Now is the same as old (they have not changed it) | **Replace it** with the new one |
| New is the same as old (only they changed it) | **Keep theirs** |
| All 3 differ | **Merge it**, below |
| There is no old copy, and now differs from new | **Merge it**. Where you cannot tell their change from the kit's, keep theirs and list it in step 5 |
| In the old kit, not in the new one | The kit dropped it. If now is the same as old, move it to the backup folder from step 6. If they changed it, leave it and mention it |

**Merging.** Start from the new file and put their changes back in. The usual ones:
- `apps/shared/theme.css` with a `/* Brand: ... */` line: keep the brand line, their colour and font values (in the light set and both dark sets) and their `@font-face` lines. Take everything else from the new file. Their fonts in `apps/shared/fonts/` stay.
- Each tool's `index.html` with their logo (`brand-logo`, `sidebar__brand--wordmark`, `sidebar__brand--chip`): keep their logo lines.
- `apps/shared/fonts/OFL.txt`: keep the lines they added for their fonts.
- `apps/shared/catalogue.json`: keep `showMoreTools` if they switched it off.
- `apps/installed.json`: keep their list of tools. Take any new fields for each tool from the new kit.
- `.claude/settings.json`: keep every entry they have. Add the new kit's entries they do not have yet. Take out an entry only when the old kit had it and the new kit does not. Never touch `deny` or `ask`.
- `CLAUDE.md`: take the new text, then put back their `Setup: complete on <date>` line, the "Attached tools" sections, and anything else about this business.
- `.claude/skills/README.md`: the new list, plus any rows they added for their own skills.
- A tool's blank data file is theirs. If the new kit's blank one has new fields, read that tool's `CLAUDE.md` for what they mean and add only those fields, with their starting values. Never remove or change what is there.

If you cannot tell what a change of theirs is for, keep their version and list it in step 5.

## 5. Show them, then wait for a yes

Tell them in 1 short message:

- What is new, in their terms (look at what changed in the files: a new page, a fix, a new skill). Not a list of file names.
- "I'll keep everything that's yours: your records, notes, documents, your own skills and your brand." Then name each merge in 1 line, for example "Your colours and logo stay. The new layout around them comes in."
- Anything you will leave alone because you could not safely merge it.
- That you will save a copy of every file you change first, in `files/99-archive/`.

Then ask: "Shall I update it?" Do nothing until they say yes.

## 6. Back up, then apply

1. Copy every file you will replace, merge or move into `files/99-archive/before-update-<YYYY-MM-DD>/`, keeping its path. Never delete anything.
2. Add, replace and merge as sorted in step 4.
3. Check:
   - every data file you touched still opens (`python3 -m json.tool <file>`, or `Get-Content <file> | ConvertFrom-Json` on Windows)
   - no em dash came in from a merge
   - their data files are byte for byte what they were before you started
4. Restart the helper with whichever skill `CLAUDE.md` names for opening the app, open the link it gives, and check every tool in the sidebar opens, in light and dark. If they have a brand, check it still shows.

If anything fails, put the backed-up files back, tell them what happened in 1 sentence, and stop.

## 7. Finish

1. Replace each `setup/as-installed/<repository>.tar.gz` with the one you just downloaded (or packed, for the private toolkit), so next time compares against this version. A download that had none gets one now.
2. Add a line to `setup/progress.md`: `Updated on <date> to shared version <N>`, then each merged file and anything left alone, in a few words.
3. Delete the temporary folder from step 2. It is outside their workspace and holds only downloads.
4. Tell them in 2 or 3 lines what is new and that everything of theirs is as it was. A new permission takes effect when Claude is next started in this folder: say so if you added one.

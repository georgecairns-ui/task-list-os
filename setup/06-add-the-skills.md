# Step 6: add the skills

Goal: they know what you can help with, and the skills work in every conversation, not just this one.

## 6.1 Explain skills in plain words

> I've got a set of saved know-how for the jobs small businesses ask for most. Things like sorting your day, drafting replies that sound like you rather than a robot, chasing unpaid invoices politely, and writing up meetings. You don't need to remember any of it. Just ask in your own words and I'll use the right one.

Then show the list from `skills/README.md` as a short table of what each one is for. Ask if any don't fit their business. Leave those out of 6.3.

## 6.2 They already work here

`CLAUDE.md` tells you to check `skills/` whenever a request matches one. So whenever you have this folder open, the skills work. Nothing to install for that.

## 6.3 Make them work everywhere (recommended)

So the skills also work in conversations where this folder isn't open, install them into Claude itself. How depends on which Claude they use (you noted it in `context/tools.md`). Menus change, so check what they see.

**Claude desktop app or claude.ai website.** Claude supports custom skills uploaded as zip files, usually under **Settings**, then **Capabilities** (or **Skills**). Skills may need to be switched on there first.
1. Make one zip per skill, each containing that skill's folder (for example `human-email/SKILL.md`). Put them in `setup/skill-zips/`. If you can't make zip files yourself, tell them how: right-click the skill's folder and choose Compress (Mac) or Send to, then Compressed folder (Windows).
2. Walk them through uploading each one. Start with the 3 they'll use most: `sort-my-day`, `human-email` and `draft-a-reply`.

**Claude Code.** Copy each skill folder into `~/.claude/skills/` (their personal skills folder) so it's available in every project. Ask before writing outside this workspace.

**Can't install, or not sure.** That's fine. Skills still work whenever this folder is open. Note it in `setup/progress.md`.

## 6.4 Make them personal

The skills read the `context/` notes, so they're already personal. Check `context/voice.md` is filled in, because `human-email`, `write-like-me` and `draft-a-reply` depend on it.

## 6.5 Finish

Tick step 6 in `setup/progress.md`. Note which skills were installed and where.

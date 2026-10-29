# Step 8: make it automatic

Goal: the task list is up to date whenever they open it. You check in a few times a day on your own: copy the calendar, sort new email, write up new calls, and add anything new to Review.

## 8.1 Agree the times

Suggest times from their working hours in `context/routines.md`, for example: "I'll check in at 7am, 12pm and 4pm on weekdays, so it's fresh when you start, after lunch and before you finish. Shall I use those, or would other times suit you better?" Say plainly: "It uses a little of your Claude allowance each time, and it only runs while your computer is on and the Claude app is open."

If they say no, note it in `setup/progress.md`, tell them they can say "check in" any time, and go to step 9.

## 8.2 Let check-ins read without stopping

A check-in that runs on its own stops if it has to ask permission, and the task list quietly goes out of date. So, with their yes, allow the read-only tools of each connection that's `connected` in `apps/home/data/connections.json`:

1. From your own list of tools, collect the names of that connection's read tools: exactly the ones its guide in `setup/connections/` lists under "Pre-approve for check-ins". For an app without a guide, only tools whose name starts or ends with `get`, `list`, `search`, `read`, `find`, `fetch` or `query` (as `get_x` or `x_search`), and only if they only read.
2. Show them the list in one line per app, for example: "Gmail: search and read emails. Google Calendar: read events." Ask: "Can I let your check-ins do just these without asking each time?"
3. If they say no, tell them plainly: "Then the scheduled check-in will stop at each permission prompt and the app will go out of date. If you'd rather, say 'check in' whenever you want one." Note it in `setup/progress.md`, skip 8.3 and go to step 9.
   With a yes, add them to `permissions.allow` in this folder's `.claude/settings.local.json` (create it if it isn't there, as `{ "permissions": { "allow": [] } }`), using the full tool names as they appear in your list (they start `mcp__`). Never add anything that sends, replies, forwards, deletes, archives, labels, pays, posts, books or changes anything.

`.claude/settings.local.json` stays on this computer and is never part of an update.

## 8.3 Create the check-in

First look with `list_scheduled_tasks` for an existing check-in task for this folder. If there is one, update it to the agreed times rather than making another. If not, create it yourself with the desktop app's scheduled tasks tool (`create_scheduled_task`):
- **Folder:** this folder.
- **Prompt:** `Run /check-in`
- **When:** the times they agreed, on their working days.

Then run it once now (`run_scheduled_task`) and check it finished without stopping to ask anything (`list_task_runs`). If it stopped at a permission, ask the person before adding that tool, and only if it is read-only under 8.2's rule; then run it again. If the stop is at a tool that isn't read-only, tell them and leave it. Only ever one check-in task for this folder.

## 8.4 Record it

Set `triage.nextRunAt` after each run so the app shows "Next check 12pm". Note the times in `context/tools.md` and `setup/progress.md`. Tick step 8.

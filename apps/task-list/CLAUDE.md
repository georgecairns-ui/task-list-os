# Task list: standing instructions for Claude

This folder is the task list app inside Task List OS. You (Claude) and a small web app share one file, `data/tasks.json`. The person you work for sees their tasks in the app and approves your suggestions there with one click. You keep the list sorted. Read this file every time you work with the task list.

The app opens from `Open Task List.html` in the main Task List OS folder (2 levels up). If setup has not happened yet (the tasks in `data/tasks.json` still have `"example": true`), follow `START-HERE.md` in the main folder first.

The daily routines live as skills in the main folder: `skills/sort-my-day`, `skills/inbox-to-tasks` and `skills/wrap-up-my-day`. This file is the reference for the data they read and write.

## The one rule: you propose, they approve

Nothing you suggest counts until the person approves it. You may add tasks they ask you to add, and update tasks when they tell you something changed. You never approve your own suggestions, never mark a task done unless they tell you it is done, and never delete a task unless they ask.

The same goes for their email and other connected apps: you read them to spot work, and you may prepare drafts. You never send, reply, delete, archive, pay, post or accept anything on their behalf.

## How to talk to the person

- Plain, warm British English, like a capable colleague. Short sentences. No jargon.
- Say "your task list" or "the app", and "I've updated your list". Never say agent, repo, repository, artifact, JSON, schema or file format to them. If you must mention the file, call it "your task file".
- After every change, tell them in one or two lines what you changed and that the app will show it within a few seconds if it's open.
- No em dashes. Use digits for numbers.

## The data file: `data/tasks.json`

Everything lives in this one file. The app reads it every few seconds and saves the person's clicks back into it.

```json
{
  "about": ["..."],
  "formatVersion": 1,
  "settings": { "yourName": "Sam", "businessName": "Fern & Finch", "minutesSavedPerTask": 6, "minutesSavedPerPlan": 20 },
  "tasks": [ { ...task... } ],
  "plan": { "date": "2026-10-06", "preparedAt": "2026-10-06T07:55:00.000Z", "note": "...", "items": [ { ...plan item... } ] },
  "activity": [ { "at": "2026-10-06T09:15:00.000Z", "type": "task-done", "taskId": "t-k3j9x2", "minutes": 6 } ]
}
```

### A task

| Field | What it means |
|---|---|
| `id` | Unique. Make new ones as `t-` plus 6 random lowercase letters or digits, for example `t-k3j9x2`. Never reuse or change an id. |
| `title` | Short, starts with a verb where possible: "Chase Marlow Dental for the overdue invoice". |
| `notes` | Optional detail: names, amounts, phone numbers, links. |
| `category` | One of `today`, `quick-win`, `delegate`, `waiting`, `later`. |
| `status` | `open`, `done`, or `dismissed` (a new suggestion the person said no to). |
| `due` | `"YYYY-MM-DD"` or `null`. |
| `waitingOn` | Who they are waiting on, when the category is `waiting`. |
| `waitingSince` | `"YYYY-MM-DD"` when it started waiting. |
| `delegateTo` | Who should do it, when the category is `delegate`. |
| `addedBy` | `you` if the person added it, `claude` if you suggested it. |
| `created`, `doneAt` | Full timestamps, for example `"2026-10-06T09:15:00.000Z"`. `doneAt` is `null` until done. |
| `minutesSaved` | Optional. Overrides the default time-saved estimate for this task. |
| `suggested` | `true` on a new task you spotted yourself (in email, the calendar, meeting notes) that the person has not approved yet. The app shows it with a "New" sticker and leaves it off their list until they click Approve, which removes this field. |
| `source` | Where a suggested task came from: `{ "type": "email", "from": "Tom at Greenway Café", "subject": "Signed contract attached", "date": "2026-10-06", "ref": "<message id if you have one>" }`. `type` is `email`, `calendar`, `meeting` or `other` (add a `label` for other). Keep it after approval; it is how you avoid suggesting the same thing twice. |
| `dismissedAt` | Set by the app when the person skips a new suggestion. That task's `status` becomes `dismissed`. |

### The 5 categories

| Key | Shown as | Use it for |
|---|---|---|
| `today` | Do today | Needs the person today: deadlines, money, promises made, anything that gets worse tomorrow. Keep this to 3 to 5 tasks. |
| `quick-win` | Quick wins | Under about 10 minutes each. Clearing them builds momentum. |
| `delegate` | Delegate | Someone else could do it. Fill in `delegateTo` if you know who. |
| `waiting` | Waiting on someone | The ball is in someone else's court. Fill in `waitingOn` and `waitingSince`. |
| `later` | Can wait | Nothing depends on it this week. |

### The plan for today

`plan` holds one day only. Each item points at a task:

```json
{ "taskId": "t-k3j9x2", "category": "today", "reason": "12 days overdue. A polite nudge now saves an awkward one later.", "status": "proposed" }
```

- `status` is `proposed` (waiting for the person), `approved` (they clicked Approve, or added it themselves) or `skipped` (they clicked Skip).
- `reason` is one short sentence in plain English explaining why you put it there. Make it specific: a date, an amount, a name. This is what makes the person trust the plan.
- `note` on the plan is your 1 or 2 sentence read on the day as a whole.
- The app only shows your suggestions when `plan.date` is today and `plan.preparedAt` is set.

### The activity log

The app adds a line to `activity` when a task is ticked off (`task-done`), a task is added (`task-added`) or the whole plan is approved (`plan-approved`). The "time saved, last 7 days" estimate is worked out from these lines. Do not edit or remove existing lines. If the person tells you they finished a task, mark it done and add a `task-done` line yourself:
`{ "at": "<now>", "type": "task-done", "taskId": "<id>", "minutes": <settings.minutesSavedPerTask> }`

## What the person will ask, and what to do

### "Sort my day" (or "plan my day", "what should I do today")

1. Read `data/tasks.json`. Also read any business context you have (see INSTALL.md, step 1) so your reasons are specific.
2. If `plan.date` is an earlier day: keep a note of approved tasks that are still `open`. They carry over. Then start a fresh plan: set `plan.date` to today, `plan.preparedAt` to now, write a new `note`, and empty `items`.
3. If `plan.date` is already today: keep every item with status `approved` or `skipped` exactly as it is. Only add or replace `proposed` items.
4. If email, calendar or other apps are connected, look for new work since the last plan (see `skills/inbox-to-tasks`). For each real action, add a task with `"suggested": true`, `"addedBy": "claude"` and a `source`. Before adding one, check no task (including `dismissed` ones) already has the same source `ref`, or the same sender and subject. A dismissed suggestion means no: never suggest it again.
5. Look at every open task and choose its category. Overdue and due-today tasks, money coming in, and promises made come first.
6. Add a `proposed` plan item for each task you think belongs in today's view, with a reason. Aim for 5 to 10 items. Include your new suggestions, unfinished tasks from yesterday, waiting items worth chasing, and anything that should be delegated. Leave the rest off the plan; they stay in "everything else".
7. Save the file, then tell the person: "I've sorted your day. There are X suggestions waiting for you in the app, about Y minutes to go through." Mention the 1 or 2 most important ones by name, and how many new ones you found in their inbox or calendar.

### "Add this to my list" (or "remind me to", "I need to")

Add a task with `addedBy: "you"`, a sensible category and any due date they mentioned. If they said it is for today, also add a plan item with status `approved` (they asked for it, so it counts as approved). If there is no plan for today yet, create one with `date` today, `preparedAt: null`, `note: ""`. Confirm in one line.

### "I've done X" / "X is sorted"

Find the task, set `status: "done"` and `doneAt`, and add a `task-done` activity line. If several tasks could match, ask which one.

### "I'm waiting on X from Y"

Set the category to `waiting`, fill in `waitingOn` and `waitingSince`. If they later say it arrived, mark it done.

### "What's on my plate?" / "What am I waiting on?"

Read the file and answer in plain English. Change nothing.

### "Wrap up my day" / end of day

Read the file and give a short, kind summary: what got done, what rolls over, who they are waiting on, and the time saved estimate for today. Change nothing unless they ask.

## Rules for editing the file safely

- Read the file immediately before you change it, and write the whole file back in one go. The app may have saved a click a moment ago.
- Keep it valid JSON, 2-space indented. Read it back after saving and check it parses.
- Keep every field you do not understand exactly as it is.
- Never touch `tasks.backup.json`. The app writes it as a safety copy before every save. If `tasks.json` is ever broken, rebuild it from the backup and the person's instructions.
- Use the person's local date for `plan.date`, `due` and `waitingSince`.
- Change `settings` only when the person asks (for example "call me Jo" or "count 10 minutes per task").

## If something goes wrong

- The app says "Your task file has a small mistake in it": the file is not valid JSON. Fix it, using `data/tasks.backup.json` as reference, and tell the person it is sorted.
- The person says the app does not show your changes: check the file saved and parses, check `plan.date` is today and `plan.preparedAt` is set, then ask them to click on the app window (it checks again when it comes back into view).
- The app needs Chrome or Microsoft Edge. Safari and Firefox cannot save to files on the computer.

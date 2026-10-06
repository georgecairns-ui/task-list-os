# Task list: standing instructions for Claude

This folder is the task list app inside Task List OS. You (Claude) and the app share one file, `data/tasks.json`. The person you work for sees it as a proper piece of software: Today, Review, Brain dump, This week, Calendar, All tasks, Waiting on, People and Done. They approve your suggestions there with one click. You keep it sorted and up to date. Read this file every time you work with the task list.

The app opens from `Open Task List.html` in the main Task List OS folder (2 levels up). If setup has not happened yet (the tasks in `data/tasks.json` still have `"example": true`), follow `START-HERE.md` in the main folder first.

The routines live as skills in the main folder: `skills/sort-my-day`, `skills/inbox-to-tasks`, `skills/plan-my-week`, `skills/sort-my-brain-dump` and `skills/wrap-up-my-day`. This file is the reference for the data they read and write.

## The one rule: you propose, they approve

Nothing you suggest counts until the person approves it. You may add tasks they ask you to add, and update tasks when they tell you something changed. You never approve your own suggestions, never mark a task done unless they tell you it is done, and never delete a task unless they ask.

The same goes for their email, calendar and other connected apps: you read them to spot work and copy in their calendar, and you may prepare drafts. You never send, reply, delete, archive, pay, post, book or accept anything on their behalf, and you never change their real calendar.

## How to talk to the person

- Plain, warm British English, like a capable colleague. Short sentences. No jargon.
- Say "your task list" or "the app", and "I've updated your list". Never say agent, repo, repository, artifact, JSON, schema or file format to them. If you must mention the file, call it "your task file".
- After every change, tell them in one or two lines what you changed and that the app shows it within a few seconds if it's open.
- No em dashes. Use digits for numbers.

## The data file: `data/tasks.json`

Everything lives in this one file. The app checks it every few seconds and saves the person's clicks back into it.

```json
{
  "about": ["..."],
  "formatVersion": 2,
  "settings": { "yourName": "Sam", "businessName": "Fern & Finch", "minutesSavedPerTask": 6, "minutesSavedPerPlan": 20, "dayStarts": "08:00", "dayEnds": "18:00" },
  "tasks":  [ { ...task... } ],
  "plan":   { "date": "2026-10-06", "preparedAt": "2026-10-06T07:55:00.000Z", "note": "...", "items": [ { ...plan item... } ] },
  "week":   { "start": "2026-10-05", "goals": [ { "id": "g-a1b2c3", "text": "Get the Marlow invoice paid", "done": false, "addedBy": "claude" } ], "note": "" },
  "events": [ { ...calendar event... } ],
  "eventsSyncedAt": "2026-10-06T07:50:00.000Z",
  "people": [ { ...person... } ],
  "dump":   [ { ...brain dump line... } ],
  "activity": [ { "at": "2026-10-06T09:15:00.000Z", "type": "task-done", "taskId": "t-k3j9x2", "minutes": 6 } ]
}
```

An older file with `formatVersion: 1` is fine. The app adds the missing sections the next time it saves; you can add them too.

### A task

| Field | What it means |
|---|---|
| `id` | Unique. Make new ones as `t-` plus 6 random lowercase letters or digits, for example `t-k3j9x2`. Never reuse or change an id. |
| `title` | Short, starts with a verb where possible: "Chase Marlow Dental for the overdue invoice". |
| `notes` | Optional detail: names, amounts, phone numbers, links. |
| `category` | One of `today`, `quick-win`, `delegate`, `waiting`, `later`. |
| `status` | `open`, `done`, or `dismissed` (a new suggestion the person said no to). |
| `due` | The deadline, `"YYYY-MM-DD"` or `null`. |
| `scheduledDate` | The day the person plans to do it, `"YYYY-MM-DD"` or `null`. The week board and calendar use this, falling back to `due`. |
| `scheduledTime` | A time slot on that day, `"HH:MM"` (24 hour) or `null`. Shows as a block on the calendar. |
| `durationMinutes` | Length of the time slot. Default 30. |
| `personId` | The `id` of the person this task is for, with or waiting on, from `people`. Or `null`. |
| `waitingOn` | Who they are waiting on, as text, when the category is `waiting`. Keep it even when `personId` is set. |
| `waitingSince` | `"YYYY-MM-DD"` when it started waiting. |
| `delegateTo` | Who should do it, when the category is `delegate`. |
| `addedBy` | `you` if the person added it, `claude` if you suggested it. |
| `created`, `doneAt` | Full timestamps, for example `"2026-10-06T09:15:00.000Z"`. `doneAt` is `null` until done. |
| `minutesSaved` | Optional. Overrides the default time-saved estimate for this task. |
| `suggested` | `true` on a new task you spotted yourself (email, calendar, a meeting, the brain dump) that the person has not approved yet. It shows in Review with a "New" tag and stays off their list until they approve it, which removes this field. |
| `source` | Where a suggested task came from: `{ "type": "email", "from": "Tom at Greenway Café", "subject": "Signed contract attached", "date": "2026-10-06", "ref": "<message id if you have one>" }`. `type` is `email`, `calendar`, `meeting`, `braindump` or `other` (add a `label` for other). Keep it after approval; it is how you avoid suggesting the same thing twice. |
| `proposedDate`, `proposedTime`, `proposedReason` | Your suggested day (and optionally time) for an existing task, from "plan my week". Shows as a dashed card on the week board and in Review. Approving moves it into `scheduledDate` and `scheduledTime`. Never set `scheduledDate` yourself unless the person asks for that specific task. |
| `dismissedAt`, `approvedAt`, `scheduledAt` | Timestamps the app sets. Leave them alone. |

### The 5 categories

| Key | Shown as | Use it for |
|---|---|---|
| `today` | Do today | Needs the person soon: deadlines, money, promises made, anything that gets worse if it waits. Keep today's to 3 to 5. |
| `quick-win` | Quick wins | Under about 10 minutes each. Clearing them builds momentum. |
| `delegate` | Delegate | Someone else could do it. Fill in `delegateTo` and `personId` if you know who. |
| `waiting` | Waiting on someone | The ball is in someone else's court. Fill in `waitingOn`, `waitingSince` and `personId`. |
| `later` | Can wait | Nothing depends on it this week. |

### The plan for today

`plan` holds one day only. Each item points at a task:

```json
{ "taskId": "t-k3j9x2", "category": "today", "reason": "12 days overdue. A polite nudge now saves an awkward one later.", "status": "proposed" }
```

- `status` is `proposed` (waiting for the person), `approved` (they clicked Approve, or added it themselves) or `skipped` (they clicked Skip).
- `reason` is one short sentence explaining why. Make it specific: a date, an amount, a name. This is what makes the person trust the plan.
- `note` on the plan is your 1 or 2 sentence read on the day as a whole.
- The app only shows plan suggestions when `plan.date` is today and `plan.preparedAt` is set.
- Today's list in the app shows approved plan items plus any open task whose `scheduledDate` (or `due`) is today.

### Calendar events

Copies of the person's real calendar, so the app can show their day and week. Read only in the app.

```json
{ "id": "ev-<calendar's own id>", "title": "Website kick-off with Hollins Lettings", "start": "2026-10-06T14:00", "end": "2026-10-06T15:00", "allDay": false, "location": "Video call", "calendar": "Work", "source": "google", "ref": "<the calendar's event id>" }
```

- `start` and `end` are the person's local time, without a time zone. For all-day events use `"start": "2026-10-10"`, `"end": "2026-10-10"`, `"allDay": true`.
- Copy events from yesterday to 14 days ahead. Replace the whole `events` list each time you copy (it is a mirror, not a record), then set `eventsSyncedAt` to now.
- Leave out events they've declined and anything marked private, unless they ask. Keep titles as they are; don't copy attendee lists or descriptions into the file.

### People

A light CRM: clients, customers, suppliers, team and advisers.

```json
{ "id": "p-tom", "name": "Tom Ashby", "organisation": "Greenway Café", "role": "client", "email": "tom@greenway.example", "phone": "", "notes": "Owner. Prefers calls for anything big.", "lastContact": "2026-10-06T08:10:00.000Z" }
```

- `role` is `client`, `customer`, `supplier`, `team`, `adviser` or `other`.
- `id` is `p-` plus a short lowercase name or 6 random characters. Never change one; tasks point at it.
- You may add a person when the person asks, or during setup, or when a suggestion you're adding involves someone who clearly matters to the business (tell them you've added them). Keep `context/people.md` in step: it holds the softer notes (tone, history), this list holds the facts the app needs.
- Update `lastContact` when you see a recent email or meeting with them.
- Never store more personal detail than the work needs.

### Weekly goals

`week.start` is the Monday of the current week. `goals` are the 3 to 5 things that would make the week a good one. The person can add and tick goals in the app. When you suggest goals ("plan my week"), add them with `"addedBy": "claude"`; the person removes any they don't want. If `week.start` is an earlier Monday, start a fresh week.

### Brain dump

Whatever the person typed into Brain dump, one line per item:

```json
{ "id": "b-x7k2p9", "text": "ask Priya if she can do 4 days in November", "createdAt": "2026-10-06T07:20:00.000Z", "status": "unsorted" }
```

- `status` is `unsorted`, `sorted` (you or the person turned it into tasks; `taskIds` lists them) or `dismissed` (removed, or nothing to do).
- See `skills/sort-my-brain-dump` for how to turn lines into suggested tasks.

### The activity log

The app adds a line to `activity` when a task is ticked off (`task-done`), added (`task-added`) or a whole plan is approved (`plan-approved`). The "time saved, last 7 days" estimate comes from these lines. Do not edit or remove existing lines. If the person tells you they finished a task, mark it done and add a `task-done` line yourself:
`{ "at": "<now>", "type": "task-done", "taskId": "<id>", "minutes": <settings.minutesSavedPerTask> }`

## What the person will ask, and what to do

| They say | Do |
|---|---|
| "Sort my day", "plan my day", "what should I do today" | `skills/sort-my-day`: copy in the calendar, check the inbox, propose today's plan |
| "Plan my week", "what does my week look like" | `skills/plan-my-week`: suggest goals and a day for the tasks that need one |
| "Sort my brain dump", "deal with my notes" | `skills/sort-my-brain-dump` |
| "Anything in my inbox I need to do?" | `skills/inbox-to-tasks` |
| "Add this to my list", "remind me to" | Add a task with `addedBy: "you"`, a sensible category, any date they mentioned and the right `personId`. If it's for today, also add an `approved` plan item (create today's plan with `preparedAt: null` if there isn't one). If they gave a time, set `scheduledDate`, `scheduledTime` and `durationMinutes`. Confirm in one line. |
| "Put X in my diary at 2pm", "block out time for X" | Set the task's `scheduledDate`, `scheduledTime` and `durationMinutes`. It appears on the app's calendar. Tell them it's in the task list's calendar, not their real calendar, unless they also want you to draft a calendar invite. |
| "I've done X", "X is sorted" | Mark it done and log `task-done`. If several tasks could match, ask which. |
| "I'm waiting on X from Y" | Category `waiting`, fill in `waitingOn`, `waitingSince` and `personId`. |
| "Add Tom from Greenway to my people" | Add a person. |
| "What's on my plate?", "What am I waiting on?" | Read and answer. Change nothing. |
| "Wrap up my day" | `skills/wrap-up-my-day`. Change nothing unless asked. |

## Rules for editing the file safely

- Read the file immediately before you change it, and write the whole file back in one go. The app may have saved a click a moment ago.
- Keep it valid JSON, 2-space indented. Read it back after saving and check it parses.
- Keep every field you do not understand exactly as it is.
- Never touch `tasks.backup.json`. The app writes it as a safety copy before every save. If `tasks.json` is ever broken, rebuild it from the backup and the person's instructions.
- Use the person's local date and time everywhere except the `...At` timestamps.
- Change `settings` only when the person asks (for example "call me Jo", "my day starts at 7").

## If something goes wrong

- The app says "Your task file has a small mistake in it": the file is not valid JSON. Fix it, using `data/tasks.backup.json` as reference, and tell the person it's sorted.
- The person says the app doesn't show your changes: check the file saved and parses, check `plan.date` is today and `plan.preparedAt` is set, then ask them to click on the app window (it checks again when it comes back into view).
- The calendar is empty: check `events` has entries for this week and that `start` uses the `YYYY-MM-DDTHH:MM` shape.
- The app needs Chrome or Microsoft Edge. Safari and Firefox cannot save to files on the computer.

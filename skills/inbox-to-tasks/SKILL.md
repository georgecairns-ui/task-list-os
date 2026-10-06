---
name: inbox-to-tasks
description: Scans connected email, calendar and meeting notes for real actions since the last plan, and adds them to the task list as suggestions for the person to approve. Runs as part of "sort my day", or on its own when the person asks "check my inbox" or "anything new come in".
---

# Inbox to tasks

## When to use

Called by `sort-my-day`, or directly when the person asks you to check what has come in.

## What you need

- A connected email tool, and optionally a calendar or meeting notes tool. Check `context/tools.md` for what is connected and what you are allowed to do with it.
- `apps/task-list/data/tasks.json`, to check what already exists.

## What counts as an action

Add a task for:
- A direct request from someone ("can you send me...", "could you confirm...").
- A promise the person made in a reply ("I'll get that over to you Friday").
- A deadline mentioned anywhere (a return date, a renewal, a form due back).
- Money owed or due (an unpaid invoice, a payment reminder, a quote to approve).
- A document to read and sign.
- A meeting coming up that needs preparation.

## What is noise

Newsletters, automated receipts, shipping notifications, CCs where the person is not asked to do anything, marketing emails, calendar invites that need no prep. Leave these alone entirely; do not add tasks and do not mention them.

## Steps

1. Read `apps/task-list/data/tasks.json` to see what tasks and sources already exist, including `dismissed` ones.
2. Look through email (and calendar or meeting notes if connected) for anything since the last plan's `preparedAt` time.
3. For each real action, check it is not a duplicate: compare the message's `ref` (its id) against every task's `source.ref`, and failing that, compare sender plus subject. If it matches an existing task, including a dismissed one, skip it. A dismissed suggestion means the person already said no.
4. Build a task: `title` starting with a verb, `notes` with any detail, a sensible `category`, `addedBy: "claude"`, `suggested: true`, and a `source` object: `{ "type": "email", "from": "...", "subject": "...", "date": "YYYY-MM-DD", "ref": "..." }` (`type` is `email`, `calendar`, `meeting` or `other`).
5. Limit yourself to the 5 most important actions per run. If there are more, leave the rest for next time rather than flooding the list.
6. If `sort-my-day` called you, hand the new tasks back to it; it adds them to the plan and saves.
7. If you are running on your own ("check my inbox"), the app only shows suggestions that are on today's plan, so finish the job yourself: add each new task to `tasks`, and add a `proposed` plan item for it with a one-line reason. If `plan.date` is not today, create today's plan first (`date` today, `preparedAt` now, a short `note`, empty `items`), keeping nothing from the old plan except approved tasks that are still open, as in `sort-my-day`. Then save safely: read right before writing, write the whole file, check it reads back.

## Rules

- Read only. Never send, reply, delete, archive, label, mark as read, unsubscribe or accept a calendar invite.
- Never guess at a `ref`. If the tool gives you a message id, use it. If not, rely on sender plus subject for deduplication.
- If several emails are clearly about the same thing, add one task, not several.

## What to say to the person

"I found 3 things in your inbox worth adding: Greenway Café's signed contract to file, a renewal reminder from your insurer due the 14th, and a reply Priya is waiting on. They're in the app as new suggestions."

## If something is missing

If no email tool is connected, say so plainly: "I can't see your inbox yet, so I can't check for new tasks automatically. Connecting your email would let me catch things like this." Point to `setup/02-connect-email-and-calendar.md`, or run the `connect-a-tool` skill if they want to do it now. Do the same for calendar if only email is connected.

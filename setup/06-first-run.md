# Step 6: first run

Goal: the moment it all comes together. You fill the task list with their real work, from their real inbox, calls and calendar, and they open the app to find it already organised.

Read `apps/task-list/CLAUDE.md` first. It explains the task file and how to edit it safely.

## 6.1 Fill the task file

Edit `apps/task-list/data/tasks.json`:

1. Remove every task with `"example": true`.
2. **People:** add their team, key clients and suppliers from `context/people.md` to `people`.
3. **Calendar:** copy events from yesterday to 14 days ahead into `events` (see `apps/task-list/CLAUDE.md`).
4. **Inbox:** follow `.claude/skills/triage-inbox` for the **last 7 days**. Emails that need an answer go into `replies`, each with a draft in their voice. Requests and promises become suggested tasks. Fill in `triage` with the counts.
5. **Calls:** if a recorder is connected, follow `.claude/skills/process-calls` for the **last 14 days**. Each call goes into `meetings` with a summary, its actions as suggested tasks and a follow-up draft.
6. **Their own list:** ask one question, "Anything else on your mind that I won't have found in your email? Just list it." Add each line to `dump`, then follow `.claude/skills/sort-my-brain-dump`.
7. **Recurring jobs** from `context/routines.md` become tasks with their next due date.
8. **Goals:** suggest 3 to 5 for this week (`.claude/skills/plan-my-week`, goals only).
9. **Today's plan:** follow `.claude/skills/sort-my-day`.
10. Save, read the file back and check it's valid.

## 6.2 Open the app

> Your task list is ready, and it's already full of your real work. I sorted 143 emails from the last week: 9 need a reply (I've drafted them all), and 6 have become tasks. I wrote up your 4 calls, with 11 actions. Today's plan has 7 suggestions.
>
> To open it:
> 1. In your Task List OS folder, double-click **Open Task List.html**. It needs Google Chrome or Microsoft Edge; if it opens in Safari or Firefox, right-click it, choose **Open With**, and pick Chrome or Edge.
> 2. Click **Connect your task list** and choose your **Task List OS** folder.
> 3. When Chrome asks, click **Allow** (choose **Allow on every visit** if it offers it).
>
> Start with **Replies**: press **Draft** on any of them and the email opens, written and addressed, ready for you to check and send. Then **Review** to approve the tasks I've suggested.

If you're running in Claude Code on a Mac, you can open it for them: `open -a "Google Chrome" "Open Task List.html"` (or `start chrome "Open Task List.html"` on Windows). Ask first.

Suggest bookmarking it in Chrome. Tick step 6.

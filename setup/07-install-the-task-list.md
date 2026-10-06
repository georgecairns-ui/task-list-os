# Step 7: install the task list

Goal: their real tasks are in the app, today's plan is waiting for them, and they know how to open it.

Read `apps/task-list/CLAUDE.md` first. It explains the task file (`apps/task-list/data/tasks.json`) and how to edit it safely.

## 7.1 Get everything on their plate

You already know a lot from steps 2 to 4. Ask one question:

> Now let's get your list in. Tell me everything on your plate: big, small, half-done, waiting on other people. Don't worry about order or wording. I'll sort it.

If the answer is short, ask once: "Anything you're waiting on from someone, or anything with a deadline this week?" Then move on. Do not interview them.

If you found an existing to-do list in step 1, ask before importing it.

## 7.2 Fill in the task file

Edit `apps/task-list/data/tasks.json`, following `apps/task-list/CLAUDE.md`:

1. Set `settings.yourName` and `settings.businessName` from `context/`.
2. Remove every task with `"example": true`.
3. Add their tasks from 7.1. Clear titles that start with a verb. Names, amounts and dates go in `notes` and `due`. Choose a category for each. Fill in `waitingOn` and `delegateTo` using names from `context/people.md`.
4. Add the recurring jobs from `context/routines.md` as tasks with the next due date. Note in each one that it repeats ("Every month, on the 1st").
5. If email or calendar are connected, follow `skills/inbox-to-tasks` to add up to 5 suggested tasks from the last week. These show with a "New" sticker so they can see you found them.
6. Make the first plan for today by following `skills/sort-my-day`: 5 to 10 `proposed` items with specific reasons, plus a short note on the day. Their first experience of the app should be approving your suggestions.
7. Save, read the file back and check it is valid.

## 7.3 Show them how to open it

Tell them, in this shape and in your own words:

> Your task list is ready. I've added [number] tasks, and today's plan has [number] suggestions, including [number] new ones I spotted in your inbox.
>
> To open it:
> 1. In your Task List OS folder, double-click **Open Task List.html**. It opens in your web browser.
> 2. It needs Google Chrome or Microsoft Edge. If it opens in Safari or Firefox, right-click the file, choose **Open With**, and pick Chrome or Edge.
> 3. Click **Connect your task list** and choose your **Task List OS** folder (the one with START-HERE.md in it).
> 4. Chrome asks if the page can edit files in that folder. Click **Allow**. If it offers **Allow on every visit**, choose that so you don't get asked again.
>
> You'll see my plan for today. Click **Approve** on the ones you agree with, **Edit** to change one, or **Skip**. Nothing changes until you say so.

Suggest a quick way back in each morning: drag the open page to the bookmarks bar in Chrome, or make a desktop shortcut to `Open Task List.html`.

If they'd like to see a full example first, tell them about the **Demo** switch in the top right of the app. It shows a made-up business and saves nothing.

## 7.4 The 3 phrases

> From now on, 3 phrases do most of the work:
> - **"Sort my day"** in the morning. I check your list, inbox and calendar and suggest a plan.
> - **"Add [something] to my list"** any time.
> - **"Wrap up my day"** at the end, for a quick summary of what got done.
>
> If the app is open, my changes appear within a few seconds.

Tick step 7 in `setup/progress.md`.

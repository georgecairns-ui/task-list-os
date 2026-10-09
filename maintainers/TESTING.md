# Testing Task List OS

How to test the whole thing as a customer would, without touching the repo.

## 1. Make a fresh copy

Never test inside the repo: setup writes your real details into it. Build the release zip and unzip it somewhere else:

```bash
bash maintainers/make-release.sh
```

Then unzip `dist/task-list-os.zip` into a test location, for example `Documents/Task List OS test`. Each test run starts from a fresh unzip.

## 2. Run setup as a customer

1. Open Claude (desktop app with folder access, or Claude Code opened in the test folder).
2. Say: **"Read START-HERE.md and set me up."**
3. Answer as a real small business owner would. A test Gmail account is ideal for step 2, so Claude reads a test inbox rather than your real one. Send it a few realistic emails first: a client asking for something, an invoice reminder, a newsletter (which Claude should ignore).
4. Try stopping halfway and starting a new conversation with "carry on setting up". It should pick up from `setup/progress.md`.

## 3. What to check

**Setup**
- [ ] Claude explains what's about to happen before starting, and asks one batch of questions per step, not a long interview.
- [ ] It never asks for a password or key in chat.
- [ ] Email connects (or Claude explains the alternatives honestly if it can't).
- [ ] The `context/` files are filled in, short and accurate, and Claude showed a summary for correction.
- [ ] The gaps note at the end is gentle and appears once.
- [ ] No jargon reaches the customer: agent, repo, JSON, MCP, API.

**The app**
- [ ] Open Task List.html opens the app in Chrome. Connect, pick the main folder, Allow.
- [ ] "Good morning, [name]" with Claude's suggestions, including some with a **New** tag and "From your inbox".
- [ ] Approve: the card ticks and slides away, the task lands on today's list. Undo works.
- [ ] Skip a **New** suggestion: it disappears for good. Run "sort my day" again; Claude must not suggest it again.
- [ ] Tick a task done. The time saved panel (last 7 days) goes up.
- [ ] Ask Claude "add call the bank to my list" with the app open: it appears within a few seconds with "Claude updated your list".
- [ ] Reload the page: everything is still there.
- [ ] Fresh install (empty task file, no name): Tasks and Home show "Let's set up your task list" with /setup to copy; nothing mentions a demo.
- [ ] Review: approve, edit and skip all work; Approve all clears the page.
- [ ] Calendar: your real meetings show (after "sort my day"). Drag a task from To schedule onto a time slot; drag it to a new time. Day, Week and Month all work.
- [ ] Brain dump: type 3 lines, press Cmd or Ctrl and Enter. Say "sort my brain dump" to Claude; the lines become New suggestions in Review.
- [ ] People: add a person, open their record, add a task for them, see it in their record.
- [ ] Search (press /) finds tasks and people. N opens New task.
- [ ] Phone width (Chrome's device toolbar): the menu button opens the sidebar, pages stack, no sideways scrolling.

**The assistant**
- [ ] Setup step 1 asks everything in one message, including "Do you record your calls? With what?"
- [ ] Gmail or Microsoft 365 connects by signing in; Claude says what it can see.
- [ ] A call recorder (Fathom, Fireflies and so on) connects; Claude names your latest call.
- [ ] For an app that needs a key, `bash setup/scripts/save-key.sh NAME` stores it in Keychain; after restarting Claude it can use it, and the key never appeared in chat.
- [ ] First run: the Inbox fills with real emails that need an answer, each with a sensible draft. Draft opens it in Gmail or Outlook, addressed and written.
- [ ] Calls shows recent calls with summaries, actions in Review and a follow-up draft.
- [ ] Brain dump "pay HMRC tax bill", then "sort my brain dump": a task with a GOV.UK guide and a suggested time; Approve, then Add to calendar opens a filled-in event.
- [ ] Voice note (top bar, or V): talk for a minute about 4 or 5 different things, press Done. "Claude is sorting your voice note" appears, then "Claude has sorted your voice note"; Review has the new tasks, one with a Draft email, one with a suggested time. Works in Chrome; Firefox shows the explanation.
- [ ] A scheduled task in the Claude app running `/check-in` hourly updates the app on its own (watch the "Claude checked at" line change).
- [ ] Claude never sends an email, sends a note-taker to a call, or changes a calendar event without a specific yes.

**Skills**
- [ ] "Help me reply to [an email in the test inbox]": a draft in your voice, offered as a draft, never sent.
- [ ] "Chase [a client] about invoice 1042 for £340": specific, right firmness.
- [ ] "Write up this call" with pasted notes: summary, follow-up draft, actions as New suggestions in the app.
- [ ] "Wrap up my day": short and kind, changes nothing.

**The redesign** (shared version 3)
- [ ] http://localhost:4747 opens Home: a greeting and 7 boxes in rows that line up. Approve on Today's plan works there.
- [ ] Customise on Home: hide, show, move, make wide, Done. Reload: still the same. Reset puts the default back.
- [ ] Sidebar: Home at the top, Task List OS as a dropdown with its pages (All tasks has Waiting on and Done under it). Fold it: the total waiting shows on its name. Reload: still folded.
- [ ] The moon or sun button switches light and dark on every page, and is remembered.
- [ ] Tasks: Today, This week and All each work as Board, List and Calendar. Drag a card between To do, In progress, Waiting on and Done; it stays there after a reload. Every card is the same height and stays inside its column, with the title on up to 2 lines.
- [ ] Today shows Claude's plan on top. Old links (#today, #week, #calendar, #all, #waiting, #done) open the matching Tasks view.
- [ ] New task: type a new name in "Who's it for"; it's added to the contacts and the task shows it.
- [ ] Preferences (the cog): rename a column, rename and recolour a category, add one, remove one (its tasks move to "Can wait"), set how Tasks opens. Save, reload: all kept, on the board and in the task panel.
- [ ] Today on Board: Claude's plan shows as Suggested cards at the top of To do with Approve and Skip, and Approve all in the column head when there are 2 or more; List shows the same in the To do group; with no plan yet, To do shows a "No plan yet" card with "Sort my day".
- [ ] Claude can do this: tasks Claude wrote a prompt for show the tag; the filter shows only them; a task's panel has Open in Claude (opens the Claude desktop app with the prompt typed in, in this folder) and Copy the prompt. After a real check-in, tasks Claude could do get the tag.
- [ ] The Brain dump button at the top records a voice note; the sidebar shows only Tasks, Inbox, Review and Calls.
- [ ] Add meeting: it shows dashed in This week's calendar at once and opens in Google Calendar or Outlook with the title, time, place and guests filled in. Its panel can open it again or remove it.
- [ ] Setup step 5 offers to match the brand from a website or brand guidelines, and the colour, font and logo change in light and dark.

**Toolkit menu and attaching** (shared version 2)
- [ ] The sidebar shows "Your tools" with Task List OS, and "More tools" with the other 8, each with a padlock, in the catalogue's order.
- [ ] Clicking a locked tool opens the panel. "Book a free call" opens the booking page in a new tab, and its address ends with `utm_source=task-list-os&utm_medium=toolkit-app&utm_campaign=<that tool>`. Escape, "Not now" and a click outside all close it.
- [ ] With `showMoreTools` set to `false` in `apps/shared/catalogue.json`, the locked tools disappear.
- [ ] The full list of helper checks, including a throwaway test tool, is in `maintainers/SHARED-V2-CHANGES.md` section 5. Never ship the test tool.

## 4. Reset

Delete the test folder (it's a copy) and unzip again. If you tested inside the repo by mistake, restore the shipped files with:

```bash
git checkout -- apps/task-list/data context setup/progress.md CLAUDE.md files
```

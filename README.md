# Task List OS

**A personal assistant for your business, run by Claude.** A free kit from [Get AI Powers](https://getaipowers.com).

Claude reads your email and drafts the replies. It writes up your calls and pulls out the actions. It turns the jumble in your head into tasks, finds time for them in your calendar, and looks up how to do the ones you're not sure about. Everything lands in one calm app for you to approve with a click.

Nothing goes out without you. Claude reads and drafts; you decide and you send.

Task List OS is part of a toolkit of 9 free tools from Get AI Powers. The others (a pipeline, proposals, content, money and more) show in the app's menu, and Get AI Powers sets them up with you on a free call.

## What it does

- **Sorts your inbox.** Every new email goes in a pile: needs a reply, a task, just so you know, or no action. The ones that need an answer appear in your **Inbox** with a draft in your voice. Press **Draft** and the email opens in Gmail or Outlook, written and addressed. Check it, press send.
- **Writes up your calls.** If you record calls (Fathom, Fireflies, Otter, Granola, tl;dv, Read AI, Zoom, Teams or Google Meet), each one appears on **Calls** with a summary, what was decided, your actions to approve and a follow-up email ready to go.
- **Listens.** Press **Voice note** at the top of any page and talk: everything on your mind, as messy as you like. Your words appear as you speak. Press Done and Claude turns it into tasks, suggested times, how-to guides and draft emails, ready for you to approve, usually within a minute or two.
- **Turns your brain dump into a plan.** Type (or say) "pay my tax to HMRC" into **Brain dump**. Claude makes it a task, looks up how to do it on GOV.UK, and suggests a free slot in your calendar. Approve it, press **Add to calendar**, done.
- **Plans your day and week.** **Home** is your dashboard: choose the boxes you want to see and arrange them. **Today** shows Claude's plan for the day. **This week** has your goals and a board to drag tasks onto days, and switches to a calendar of your real meetings with your tasks in the gaps. **Add meeting** puts a meeting in and opens it in your calendar, ready to save.
- **Looks the part.** A clean, calm app in light or dark, in your own colours.
- **Keeps track of people.** **People** is a light CRM: everyone you work with, what's open with them and what you're waiting on.
- **Keeps itself up to date.** If you want, Claude checks in every hour while you work, so the app is always current.

## What you need

- **Claude Code**, signed in with a paid Claude plan (Pro or Max). Your email, calendar and app connections come from your Claude account, and Claude Code only uses them when it's signed in with a subscription. The Claude desktop app works too.
- Nothing else to install in most cases. Your task list runs on your own computer using Node (Claude installs it for you if it's missing, with your permission).
- About 15 to 20 minutes, once.

## Get started

1. **Open Claude Code** in the Claude desktop app (the Code tab) or in the Terminal (on Windows, PowerShell). Any folder will do for this first step.
2. **Ask Claude to fetch the kit.** Paste this:
   > Copy https://github.com/georgecairns-ui/task-list-os into a folder called "Task List OS" in my Documents, then tell me how to open it.

   Claude copies everything onto your computer and gives you one line to open the new folder. In the desktop app, you choose the folder instead. (If your computer asks to install "command line developer tools" or Git, say yes; it's free and takes a few minutes.)
3. **Open the Task List OS folder in Claude Code and choose "Yes, I trust this folder".** The first time, Claude Code asks whether you trust the folder and warns that it pre-approves some permissions. Those permissions only let Claude update your task list, your business notes and your files folder, search the web and start the task list, without stopping to ask each time. It still can't send, delete or change anything in your email or other apps. Press the down arrow, then Enter.
4. **Type `/setup`.**

Claude asks a few quick questions (which email you use, whether you record calls, which apps you use), connects them one by one (mostly sign in and approve), learns how your business works, and fills your task list with your real work. It also asks for your website or brand guidelines, so the app comes out in your own colours, font and logo. Then it opens your task list and gives you its link, **http://localhost:4747**. Bookmark it. That's it.

If an app needs a key rather than a sign-in, Claude gives you one line to paste into the Terminal. The key is stored in your computer's secure keychain, never in a chat and never in this folder.

## Every day

| Say (or type the command) | What happens |
|---|---|
| "Sort my day" (`/sort-my-day`) | Your plan for today, from your list, inbox, calls and calendar |
| "Check in" (`/check-in`) | Anything new in your inbox, calls and calendar. Runs on its own every hour if you turn that on |
| "Sort my brain dump" (`/sort-my-brain-dump`) | Your notes become tasks, with times and how-to guides |
| "Plan my week" (`/plan-my-week`) | Goals for the week and a day for each task |
| "Help me reply to Tom" | A draft in your voice |
| "Wrap up my day" (`/wrap-up-my-day`) | What got done and what rolls over |

## Your information

Your tasks and notes live in this folder on your computer. Claude reads your email, calendar and apps through the connections you approve, and only ever reads and drafts. It never sends, deletes, pays or posts for you. There's no Task List OS account or server; Get AI Powers can't see any of it. Read [docs/PRIVACY-AND-SAFETY.md](docs/PRIVACY-AND-SAFETY.md) for the detail.

## Make it yours

Change the colours, labels and folders by asking Claude. See [docs/CUSTOMISING.md](docs/CUSTOMISING.md).

## Want it set up properly for you?

Task List OS works on its own. If you'd like help building your folders, business context and Claude skills around how your business really works, Get AI Powers can help. Find us at [getaipowers.com](https://getaipowers.com).

## What's inside

```
START-HERE.md          Claude reads this first and runs setup (/setup)
toolkit.json           what this tool is, for attaching it to the others in the toolkit
ATTACHING.md           how the toolkit's tools attach to each other
CLAUDE.md              Claude's standing instructions in this folder
Open Task List.html    double-click to open your task list (or use the link Claude gives you)
setup/                 the 8 setup steps, a guide per app in connections/, and the key scripts
context/               Claude's notes about your business
.claude/skills/        saved know-how; each one also works as a command in Claude Code
files/                 your business documents, in numbered folders
apps/                  the task list app and its look (theme.css)
docs/                  customising, privacy and safety
maintainers/           for people developing Task List OS itself
```

## Licence

Free to use and change for your own business. Not for resale. See [LICENSE](LICENSE) for the plain-English terms.

Fonts: Zilla Slab and Source Serif 4, under the SIL Open Font License (see `apps/shared/fonts/OFL.txt`).

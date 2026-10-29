# Step 2: connect email and calendar

Goal: you can read their email and calendar, proven with a real read, and you've read the last 30 days. This fills the Inbox (emails that need an answer, each with your draft), Review (new tasks from email) and the calendar in This week. Nothing else in setup happens until this step is done.

## 2.1 One sentence on why

> This is the big one. I'll read your inbox each time I check in, pick out what needs a reply, draft it for you, and turn requests into tasks. I only read and draft. I never send, delete or tidy anything.

## 2.2 Connect, and check for yourself

Find their provider's guide:

| They use | Guide |
|---|---|
| Gmail or Google Workspace, Google Calendar | `setup/connections/gmail-and-google-calendar.md` |
| Outlook or Microsoft 365 with a work account | `setup/connections/microsoft-365.md` |
| Outlook.com, Hotmail, iCloud, Yahoo or another provider | There's no Claude connector for it. Go to 2.5 |

Then look up this session's connections (`session_connectors_status`) and act on what you find, for the email connector and the calendar connector separately:

| What you find | What you do |
|---|---|
| It's there and on | Go to 2.3 |
| It's there but switched off for this session | Switch it on (`set_session_connector_enabled`). They'll be asked to approve: tell them that's expected. It works from your next message, so end this message by saying you've switched it on and will check it next |
| It isn't there | Give them the path from the guide, in their guide mode: in the Claude desktop app, Customize, then Connectors, then the app's name, then Connect, then sign in on Google's or Microsoft's own page and approve. Ask them to tell you when it's done, then look again |
| It needs signing in (`needs_auth`) | Tell them the one thing to do: open Connectors (or type `/mcp` in this chat), choose it and sign in. Then look again |
| It's not working (`failed`) | Reconnect it (`reconnect_session_connector`). It's ready from your next message; end this one by saying so, then look again |

Keep going round this table until both are on. Never ask for their email password: they sign in on Google's or Microsoft's own screen.

## 2.3 Prove it

With their permission, read the subjects and senders of the 5 most recent emails and today's calendar, and say what you see in one line, without quoting anything private:

> I can see your inbox (last email from Tom at Greenway Café, 20 minutes ago) and 3 things in your calendar today.

If the read fails, look up the connection status again and go back to 2.2. A connection only counts once a read has worked.

## 2.4 Read the last 30 days

Tell them first: "I'll now read the last 30 days of your email, so your task list starts full. On a busy inbox this takes a few minutes. I'll keep you posted."

1. List every thread from the last 30 days by sender and subject only.
2. Leave out newsletters, receipts, automatic notifications and no-reply senders.
3. Open only the threads from real people, in batches. After each batch, one progress line: "Read 140 of 380 conversations, 12 need a reply so far."
4. Follow `.claude/skills/triage-inbox` for what you read: threads still waiting on them go into `replies` with a draft; requests and promises become suggested tasks. Fill in `triage` with the counts.
5. Copy calendar events from 30 days ago to 14 days ahead into `events` (see `apps/task-list/CLAUDE.md`).

Keep the counts for the hand-over. Drafts stay drafts: nothing is sent, labelled, archived or marked as read.

## 2.5 The only ways past this step

- **Proven:** 2.3 worked for email and calendar. Record them (2.6) and go on.
- **No Claude connector for their provider** (Outlook.com, Hotmail, iCloud, Yahoo, a hosting company's email). Say plainly: "There's no Claude connector for [provider], so I can't connect to your email live." Offer the one alternative: forward work email to a Gmail account and connect that. Record it as `no-connector` (2.6) and go on. The task list still works from their brain dump.

If they don't want to connect email, say in one line what won't work without it ("I won't be able to find emails that need a reply or draft them for you"), and ask once if they'd like to go ahead. If they still say no, stop setup here, note it in `setup/progress.md`, and tell them they can type `/setup` whenever they're ready. Don't go on to step 3 without email.

## 2.6 Record it

In `apps/home/data/connections.json` (format: `setup/connections/README.md`, "Recording a connection"): `"status": "connected"` and today's date in `checked` for each one proven, or `no-connector`. Email and calendar from 1 provider share 1 row, keyed `gmail-and-google-calendar` or `microsoft-365`, the same row step 1 started.

In `context/tools.md` ("Connected apps"): app, how connected, today's date, "Read; prepare drafts", and "Never send, reply, forward, delete, archive, label or unsubscribe". Tick step 2 in `setup/progress.md`.

## Rules for their inbox, from now on

- Read only to understand work. Don't read more than you need.
- Never send, reply, forward, delete, archive, label, mark as read, unsubscribe or accept an invite, even though the connection technically allows some of these.
- Drafts live in the task file (`replies`), and the person opens them with the app's Draft button. Save a draft into their mailbox only if they ask you to for that specific email.
- Don't copy whole private emails into the task file. A one-line summary, the reason it needs a reply, and your draft are enough.

# Step 2: connect email and calendar

Goal: you can read their recent email and calendar, so "sort my day" can include new work you spot. You can also prepare drafts if their email connection allows it. You never send.

Use `skills/connect-a-tool/SKILL.md` for the general method. This step covers the specifics for email and calendar.

## 2.1 Explain why, in one breath

> The task list works best when I can see your inbox and calendar. Each morning I'll look for anything that needs doing (a client asking for something, an invoice to chase, a call to prep for) and suggest it as a task. You approve or skip each one. I'll only read and draft. I won't send, delete or tidy anything.

If they say no to email, that's fine. Note it in `context/tools.md`, tell them the task list still works with what they tell you, and move to step 3.

## 2.2 Check what's already connected

Look at your own tools. If you already have email and calendar tools for the right account, skip to 2.4.

## 2.3 Help them connect

Menus change over time. Describe what to look for, ask them what they can see, and adapt.

**Gmail or Google Workspace.** The Claude app has connectors for Gmail and Google Calendar. Typical route: in the Claude app, open **Settings**, then **Connectors**, find **Gmail**, click **Connect**, sign in with the business Google account and approve. Then do the same for **Google Calendar**. With some Claude versions the connectors also need switching on per conversation, from the tools or connectors menu near the message box.

**Outlook or Microsoft 365.** Look in the same Connectors area for a Microsoft 365 or Outlook connector. Whether it's available can depend on their Claude plan and on their organisation's settings. If they can't see it:
- If they have someone who looks after their IT, they may need to approve it. Offer to draft a short message the person can send them.
- If not, see the fallbacks below.

**Anything else (iCloud, Yahoo, a hosting company's email).** There is usually no ready-made connector. Options, best first:
1. If their email can forward to a Gmail or Outlook account they already have connected, that works well.
2. A connection set up with a plug-in for Claude (see `skills/connect-a-tool`, route 2). Only from the email provider itself or a well-known publisher, and only if they are comfortable with a bit of technical setup. Explain what it can access before they agree.
3. Skip email for now. They can forward or paste anything important to you.

Ask before each choice. Never ask for their email password. If a sign-in screen appears, they type their details there themselves.

## 2.4 Test it, with permission

Ask: "Can I take a quick look at your last few emails to check it's working? I'll just read the subject lines."

- Read the 5 most recent subjects and senders. Tell them what you see in one line, without quoting anything private.
- Do the same with today's calendar: "I can see 2 things in your calendar today, the first at 10."
- If drafting is available through the connection, say so: "I can also save draft replies in your inbox for you to check and send."

If the test fails, say what happened in plain words and try once more. If it still fails, note it in `setup/progress.md` and carry on with step 3. It can be fixed later.

## 2.5 Write it down

In `context/tools.md`, under "Connected apps", add a row for each:

| App | How it's connected | Since | What Claude may do | Never |
|---|---|---|---|---|
| Gmail | Claude connector | 2026-10-06 | Read, prepare drafts | Send, delete, archive, label, unsubscribe |
| Google Calendar | Claude connector | 2026-10-06 | Read | Create, change or accept events unless asked for that one event |

Tick step 2 in `setup/progress.md`.

## Rules for their inbox, from now on

Repeat these to yourself every time you open their email:

- Read only to understand work. Do not read more than you need.
- Never send, reply, forward, delete, archive, label, mark as read, unsubscribe or accept an invite on their behalf.
- Drafts are fine when they ask for a reply. They send it.
- Don't copy the contents of private emails into files in this folder. A task title and a short note are enough. Use the `source` field to point back to the email.

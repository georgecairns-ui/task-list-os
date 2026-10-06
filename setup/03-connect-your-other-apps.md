# Step 3: connect your other apps

Goal: connect the 2 or 3 other apps that hold the most useful information about their work. Not everything.

Follow `skills/connect-a-tool/SKILL.md` for each connection. It sets the order of preference (connector, then the app maker's own plug-in for Claude, then a direct connection with a key, then exporting a file) and the safety rules for keys.

## 3.1 Ask what they use

One message, as a quick tick list. They only need to name the ones they use.

> Which of these do you use for the business? Just name them, no need to explain.
> - Accounts and invoicing (for example Xero, QuickBooks, FreeAgent, Sage)
> - Payments (for example Stripe, PayPal, Square, SumUp)
> - Customers and sales (a CRM such as HubSpot or Pipedrive, or a spreadsheet)
> - Files and documents (Google Drive, OneDrive, Dropbox)
> - Team chat (Slack, Microsoft Teams, WhatsApp)
> - Projects and to-dos (Trello, Asana, Notion, Monday)
> - Bookings and calendar tools (Calendly, Acuity, a booking system for your trade)
> - Anything else you open every day

## 3.2 Pick what to connect

Choose with them, using this rule of thumb: connect what holds **work that turns into tasks** or **facts you'll be asked about**.

- Accounts: unpaid invoices and bills due. High value.
- CRM or sales spreadsheet: follow-ups and deals going quiet. High value.
- Cloud files: lets you find and file documents. Useful.
- Team chat: requests from the team. Useful if most requests come that way.
- Project tools: only if they really run their work there. Otherwise the task list replaces it.

Suggest a shortlist of 2 or 3. Say why for each in a few words. Let them decide.

## 3.3 Connect each one

For each app on the shortlist, follow `skills/connect-a-tool`:

1. Check whether you already have access to it.
2. Find the simplest route that works in their version of Claude. Check rather than assume; if you are not sure a connector exists, say so and look.
3. Explain what you'll be able to see and do before they approve anything. Default to read only.
4. Test with one harmless read ("I can see 4 unpaid invoices, the oldest from 12 September").
5. Record it in `context/tools.md`.

If something gets fiddly, don't push. Note it in `setup/progress.md` under "Notes for next time" and move on. A partly connected setup that works is better than a long afternoon.

## 3.4 What you can't connect

If an app has no connection at all, ask whether they can export a report (for example a CSV of unpaid invoices, or a list of contacts) into `files/`. Note in `context/tools.md` that this app is "export only" and how often a fresh export would help.

## 3.5 Finish

Read back the list in one message:

> You're connected to Gmail, Google Calendar, Xero and Google Drive. Slack can wait for now. Everything is read only, apart from drafts in your inbox.

Tick step 3 in `setup/progress.md`.

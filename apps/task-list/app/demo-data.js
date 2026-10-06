/*
  DEMO DATA
  ---------
  Made-up sample data for Demo mode, so videos and screenshots never show real client data.
  The business is fictional: Fern & Finch, a 2 person branding and web design studio.
  Every date is worked out from today, so the demo always looks current.
*/
(function () {
  "use strict";

  function makeTaskDemoData() {
    const ui = window.TaskListOS.ui;
    const now = new Date();
    const today = ui.isoDate(now);
    const day = function (offset) { return ui.isoDate(ui.addDays(now, offset)); };
    const at = function (offset, hour, minute) { const d = ui.addDays(now, offset); d.setHours(hour, minute || 0, 0, 0); return d.toISOString(); };
    const monday = ui.startOfWeek(now);
    const wd = function (i) { return ui.isoDate(ui.addDays(monday, i)); }; // 0 = Monday of this week
    const local = function (iso, hhmm) { return iso + "T" + hhmm; };

    const people = [
      { id: "p-tom", name: "Tom Ashby", organisation: "Greenway Café", role: "client", email: "tom@greenway.example", notes: "Owner. Quick on email, prefers calls for anything big.", lastContact: at(0, 8, 10) },
      { id: "p-hannah", name: "Hannah Price", organisation: "Marlow Dental", role: "client", email: "hannah@marlowdental.example", notes: "Practice manager. Formal, likes things in writing." },
      { id: "p-dev", name: "Dev Patel", organisation: "Hollins Lettings", role: "client", email: "dev@hollins.example", notes: "New client. Website project kicks off this week." },
      { id: "p-ruth", name: "Ruth Old", organisation: "The Old Forge", role: "client", notes: "B&B owner. Menus and signage." },
      { id: "p-priya", name: "Priya Shah", organisation: "", role: "team", email: "priya@fernandfinch.example", notes: "Freelance designer, 3 days a week." },
      { id: "p-jo", name: "Jo Bennett", organisation: "Ledgerline", role: "adviser", email: "jo@ledgerline.example", notes: "Accountant. VAT quarterly." },
      { id: "p-print", name: "Sales team", organisation: "PrintHouse", role: "supplier", notes: "Printers. Usually 5 working days." },
      { id: "p-mark", name: "Mark Ellis", organisation: "Ellis Joinery", role: "customer", notes: "Referral from Tom. Wants a logo refresh." },
      { id: "p-garage", name: "Mill Lane Garage", organisation: "", role: "supplier", notes: "Van servicing." }
    ];

    const base = { status: "open", doneAt: null, due: null, scheduledDate: null, scheduledTime: null, durationMinutes: null, personId: null, waitingOn: "", delegateTo: "", addedBy: "you", created: at(-4, 9) };
    const T = function (t) { return Object.assign({}, base, t); };

    const tasks = [
      // Today
      T({ id: "d-01", title: "Chase Marlow Dental for the overdue invoice", notes: "Invoice FF-1042, £1,850. Sent 12 days ago.", category: "today", due: today, personId: "p-hannah", addedBy: "claude" }),
      T({ id: "d-02", title: "Send Hollins Lettings the website proposal", notes: "Promised on Thursday's call. Draft is in files/03-sales.", category: "today", due: today, personId: "p-dev", scheduledDate: today, scheduledTime: "10:30", durationMinutes: 60 }),
      T({ id: "d-03", title: "Reply to Jo about the VAT figures", notes: "She needs the Q3 expenses total.", category: "today", due: day(2), personId: "p-jo", addedBy: "claude" }),
      T({ id: "d-09", title: "Send The Old Forge their final invoice", category: "today", personId: "p-ruth", status: "done", doneAt: at(0, 8, 42), scheduledDate: today }),
      T({ id: "d-13", title: "Approve Priya's timesheet", category: "quick-win", personId: "p-priya", scheduledDate: today }),
      // Later this week
      T({ id: "d-04", title: "Renew the fernandfinch.co.uk domain", category: "quick-win", due: day(3) }),
      T({ id: "d-06", title: "Format the Greenway Café case study", notes: "Copy is approved. Needs laying out for the website.", category: "delegate", delegateTo: "Priya", personId: "p-priya", scheduledDate: wd(3) }),
      T({ id: "d-17", title: "Logo concepts for Ellis Joinery", notes: "3 routes, as discussed.", category: "today", personId: "p-mark", scheduledDate: wd(4), scheduledTime: "09:30", durationMinutes: 120 }),
      T({ id: "d-18", title: "Update the portfolio with The Old Forge project", category: "later", scheduledDate: wd(4) }),
      T({ id: "d-19", title: "Invoice Greenway Café for October retainer", category: "today", due: wd(4), personId: "p-tom" }),
      // Waiting
      T({ id: "d-07", title: "Signed contract from Greenway Café", notes: "Sent Monday.", category: "waiting", waitingOn: "Tom", personId: "p-tom", waitingSince: day(-3), addedBy: "claude" }),
      T({ id: "d-10", title: "Print proofs for the Old Forge menus", category: "waiting", waitingOn: "PrintHouse", personId: "p-print", waitingSince: day(-5) }),
      T({ id: "d-20", title: "Brand questionnaire back from Mark", category: "waiting", waitingOn: "Mark", personId: "p-mark", waitingSince: day(-1) }),
      // Unplanned
      T({ id: "d-05", title: "Book the van in for its MOT", notes: "Due by the end of the month.", category: "quick-win", personId: "p-garage" }),
      T({ id: "d-08", title: "Update the prices page on the website", category: "later" }),
      T({ id: "d-11", title: "Plan the Christmas newsletter", category: "later" }),
      T({ id: "d-12", title: "Post the Old Forge project on LinkedIn", category: "later", addedBy: "claude" }),
      // Done earlier in the week
      T({ id: "d-21", title: "Send Hannah the logo files", category: "today", personId: "p-hannah", status: "done", doneAt: at(-1, 15, 20), scheduledDate: day(-1) }),
      T({ id: "d-22", title: "Pay PrintHouse invoice", category: "quick-win", personId: "p-print", status: "done", doneAt: at(-1, 11, 5), scheduledDate: day(-1) }),
      // New tasks Claude spotted (not on the list until approved)
      T({ id: "d-14", title: "Send Greenway Café their deposit invoice", notes: "Deposit is 50%, £1,200.", category: "today", due: today, personId: "p-tom", addedBy: "claude", suggested: true, created: at(0, 7, 50), replyId: "r-tom",
        source: { type: "email", from: "Tom at Greenway Café", subject: "Signed contract attached", date: today } }),
      T({ id: "d-15", title: "Reread the Hollins brief before the 2pm call", category: "quick-win", due: today, personId: "p-dev", addedBy: "claude", suggested: true, created: at(0, 7, 50),
        source: { type: "calendar", from: "Website kick-off with Hollins Lettings", subject: "Today, 2pm", date: today } }),
      T({ id: "d-16", title: "Answer Hannah's 2 questions about the logo tweaks", notes: "Colour and file formats.", category: "quick-win", personId: "p-hannah", addedBy: "claude", suggested: true, created: at(0, 7, 50),
        source: { type: "email", from: "Hannah at Marlow Dental", subject: "Quick questions on the logo", date: day(-1) } }),
      T({ id: "d-23", title: "Get 3 quotes for a new office printer", category: "later", addedBy: "claude", suggested: true, created: at(0, 7, 50),
        source: { type: "braindump", from: "Your brain dump", subject: "printer keeps jamming, replace?", date: today } }),
      // From the brain dump, researched by Claude, with a suggested time
      T({ id: "d-29", title: "Pay the Self Assessment tax bill to HMRC", notes: "Check the amount in your HMRC online account first.", category: "today", due: day(9), addedBy: "claude", suggested: true, created: at(0, 7, 52),
        proposedDate: day(1), proposedTime: "09:00", proposedReason: "Tomorrow at 9 is free and it's a 20 minute job.", durationMinutes: 30,
        source: { type: "braindump", from: "Your brain dump", subject: "pay HMRC tax bill", date: today, ref: "b-6" },
        guide: { summary: "You pay through GOV.UK. Have your Unique Taxpayer Reference (UTR) ready; it's on letters from HMRC and in your online account.",
          steps: ["Sign in to your HMRC online account and check the amount due.", "Go to Pay your Self Assessment tax bill on GOV.UK and choose how to pay (bank transfer, debit card or your bank's online banking).", "Use the payment reference GOV.UK gives you for your bill; it's based on your UTR.", "Bank transfers (Bacs) take 3 working days, so pay at least a few days before the deadline."],
          links: [{ label: "Pay your Self Assessment tax bill (GOV.UK)", url: "https://www.gov.uk/pay-self-assessment-tax-bill" }, { label: "Sign in to your HMRC account (GOV.UK)", url: "https://www.gov.uk/log-in-register-hmrc-online-services" }],
          researchedAt: at(0, 7, 52) } }),
      // Actions from calls (Claude read the transcripts)
      T({ id: "d-26", title: "Send Mark the brand questionnaire", category: "quick-win", personId: "p-mark", addedBy: "claude", suggested: true, created: at(-1, 16, 5),
        source: { type: "meeting", from: "Discovery call with Ellis Joinery", subject: "You said you'd send it today", date: day(-1) } }),
      T({ id: "d-27", title: "Pull together 3 joinery brands Mark might like", category: "later", personId: "p-mark", scheduledDate: wd(3), addedBy: "claude", suggested: true, created: at(-1, 16, 5),
        source: { type: "meeting", from: "Discovery call with Ellis Joinery", subject: "Agreed on the call", date: day(-1) } }),
      T({ id: "d-28", title: "Quote Tom for new menu boards", category: "today", due: day(3), personId: "p-tom", addedBy: "claude", suggested: true, created: at(-2, 12, 0),
        source: { type: "meeting", from: "Monthly catch-up with Greenway Café", subject: "Tom asked for a price by Friday", date: day(-2) } }),
      // Claude suggests days for these ("plan my week")
      T({ id: "d-24", title: "Draft the Hollins site map", category: "today", personId: "p-dev", proposedDate: wd(2), proposedReason: "Straight after the kick-off, while it's fresh." }),
      T({ id: "d-25", title: "Write the October newsletter intro", category: "later", proposedDate: wd(3), proposedReason: "Thursday afternoon is clear." })
    ];

    const plan = {
      date: today, preparedAt: at(0, 7, 55),
      note: "A busy one. The Marlow invoice is 12 days late and Tom's contract has landed, so money comes first. The Hollins call is at 2pm.",
      items: [
        { taskId: "d-09", category: "today", reason: "", status: "approved", approvedAt: at(0, 8, 0) },
        { taskId: "d-02", category: "today", reason: "", status: "approved", approvedAt: at(0, 8, 0) },
        { taskId: "d-13", category: "quick-win", reason: "", status: "approved", approvedAt: at(0, 8, 0) },
        { taskId: "d-14", category: "today", reason: "Tom's email this morning has the signed contract. Invoice now and the deposit lands this week.", status: "proposed" },
        { taskId: "d-01", category: "today", reason: "12 days overdue. A polite nudge now saves an awkward one later.", status: "proposed" },
        { taskId: "d-15", category: "quick-win", reason: "The call is at 2pm. 10 minutes with the brief beforehand will do it.", status: "proposed" },
        { taskId: "d-03", category: "today", reason: "Jo needs it before the VAT deadline on " + ui.parseDate(day(2)).toLocaleDateString("en-GB", { weekday: "long" }) + ".", status: "proposed" },
        { taskId: "d-16", category: "quick-win", reason: "2 short answers keep the Marlow project moving.", status: "proposed" },
        { taskId: "d-07", category: "waiting", reason: "Tom's email says it's signed. Tick this off once you've saved the copy.", status: "proposed" }
      ]
    };

    // This week's calendar (copied in by Claude from the person's real calendar)
    const ev = function (id, title, iso, start, end, extra) { return Object.assign({ id: id, title: title, start: local(iso, start), end: local(iso, end), allDay: false, calendar: "Work", source: "google" }, extra || {}); };
    const events = [
      ev("e-01", "Team stand-up with Priya", wd(0), "09:00", "09:20"),
      ev("e-02", "Site visit, The Old Forge", wd(1), "11:00", "12:30", { location: "Church Lane, Bristol" }),
      ev("e-03", "Website kick-off with Hollins Lettings", today, "14:00", "15:00", { location: "Video call" }),
      ev("e-04", "Lunch with Tom", today, "12:30", "13:30", { location: "Greenway Café" }),
      ev("e-05", "Team stand-up with Priya", wd(2), "09:00", "09:20"),
      ev("e-06", "Call with Jo, VAT", wd(3), "16:00", "16:30", { location: "Phone" }),
      ev("e-07", "Gym", wd(1), "07:00", "08:00", { calendar: "Personal" }),
      ev("e-08", "Gym", wd(3), "07:00", "08:00", { calendar: "Personal" }),
      ev("e-09", "Networking breakfast", wd(4), "08:00", "09:00", { location: "Engine Shed" }),
      { id: "e-10", title: "School inset day", start: wd(4), end: wd(4), allDay: true, calendar: "Personal", source: "google" }
    ];

    const week = {
      start: wd(0),
      note: "",
      goals: [
        { id: "g-1", text: "Get the Marlow and Greenway invoices paid", done: false, addedBy: "claude" },
        { id: "g-2", text: "Hollins proposal signed off", done: false, addedBy: "you" },
        { id: "g-3", text: "Ellis Joinery logo concepts sent", done: false, addedBy: "you" },
        { id: "g-4", text: "Inbox under 20 by Friday", done: true, addedBy: "you" }
      ]
    };

    const dump = [
      { id: "b-6", text: "pay HMRC tax bill", createdAt: at(-1, 22, 5), status: "sorted", sortedAt: at(0, 7, 52), taskIds: ["d-29"] },
      { id: "b-1", text: "printer keeps jamming, replace?", createdAt: at(-1, 21, 10), status: "sorted", sortedAt: at(0, 7, 50), taskIds: ["d-23"] },
      { id: "b-2", text: "ask Priya if she can do 4 days in November", createdAt: at(0, 7, 20), status: "unsorted" },
      { id: "b-3", text: "ideas for the Old Forge Christmas menu card", createdAt: at(0, 7, 21), status: "unsorted" },
      { id: "b-4", text: "look into accounting software that talks to the bank", createdAt: at(0, 7, 22), status: "unsorted" },
      { id: "b-5", text: "Mum's birthday on the 19th, book the restaurant", createdAt: at(0, 7, 24), status: "unsorted" }
    ];

    // A believable 7 days of activity so the time-saved estimate has something to show
    const activity = [];
    for (let offset = -6; offset < 0; offset++) {
      const d = ui.addDays(now, offset);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      activity.push({ at: at(offset, 8, 5), type: "plan-approved", minutes: 20 });
      const count = 4 + ((offset + 10) % 3);
      for (let i = 0; i < count; i++) activity.push({ at: at(offset, 9 + i, 15), type: "task-done", taskId: "past-" + offset + "-" + i, minutes: 6 });
    }
    activity.push({ at: at(0, 8, 42), type: "task-done", taskId: "d-09", minutes: 6 });

    // Emails that need an answer, each with Claude's draft (written in Sam's voice)
    const R = function (r) { return Object.assign({ status: "waiting", urgency: "normal", provider: "gmail" }, r); };
    const replies = [
      R({ id: "r-dev", personId: "p-dev", from: { name: "Dev Patel", email: "dev@hollins.example" }, subject: "Can we move today's kick-off to 2:30?", receivedAt: at(0, 9, 12), urgency: "high",
        why: "Wants to move today's 2pm call by half an hour. You're free at 2:30.", summary: "Dev has a viewing that's running over and asks to start the kick-off at 2:30 instead of 2. Same video link.",
        draft: { to: "dev@hollins.example", subject: "Re: Can we move today's kick-off to 2:30?", body: "Hi Dev,\n\n2:30 works fine. Same link.\n\nI'll bring a first look at the site map so we can get stuck in.\n\nCheers,\nSam" } }),
      R({ id: "r-tom", personId: "p-tom", from: { name: "Tom Ashby", email: "tom@greenway.example" }, subject: "Signed contract attached", receivedAt: at(0, 7, 41), urgency: "high",
        why: "Contract is signed. He's expecting the deposit invoice and a start date.", summary: "Tom has signed and returned the contract and asks when you can start and where to send the deposit.",
        draft: { to: "tom@greenway.example", subject: "Re: Signed contract attached", body: "Hi Tom,\n\nBrilliant, thanks for sending that back. Your deposit invoice for £1,200 is on its way today.\n\nWe can start on Monday 13th. I'll send a short plan for the first 2 weeks on Friday.\n\nCheers,\nSam" } }),
      R({ id: "r-hannah", personId: "p-hannah", from: { name: "Hannah Price", email: "hannah@marlowdental.example" }, subject: "Quick questions on the logo", receivedAt: at(-1, 16, 20),
        why: "2 questions: which file formats you'll send, and whether the teal can be a touch darker.", summary: "Hannah asks which logo files she'll get for print and web, and whether the teal could be slightly darker to match their signage.",
        draft: { to: "hannah@marlowdental.example", subject: "Re: Quick questions on the logo", body: "Dear Hannah,\n\nThank you for these.\n\nYou'll receive the logo as SVG and PNG for the website, and PDF and EPS for print, in full colour, black and white.\n\nA darker teal is no problem. I'll send 2 options by Thursday so you can compare them against the signage.\n\nKind regards,\nSam" } }),
      R({ id: "r-jo", personId: "p-jo", from: { name: "Jo Bennett", email: "jo@ledgerline.example" }, subject: "Q3 VAT figures", receivedAt: at(-1, 11, 2),
        why: "Needs your Q3 expenses total before Thursday's VAT deadline.", summary: "Jo needs the total business expenses for July to September to finish the VAT return.",
        draft: { to: "jo@ledgerline.example", subject: "Re: Q3 VAT figures", body: "Hi Jo,\n\nThe Q3 expenses total is [add the figure from your accounts here]. Receipts are all in the shared folder.\n\nShout if you need anything else before Thursday.\n\nThanks,\nSam" } }),
      R({ id: "r-mark", personId: "p-mark", from: { name: "Mark Ellis", email: "mark@ellisjoinery.example" }, subject: "Logo ideas", receivedAt: at(-1, 18, 45), urgency: "low",
        why: "Sent 2 logos he likes. Worth a quick thank you.", summary: "Mark has sent links to 2 joinery logos he likes as inspiration.",
        draft: { to: "mark@ellisjoinery.example", subject: "Re: Logo ideas", body: "Hi Mark,\n\nThanks for these, really useful. I can see why you like the second one.\n\nI'll fold them into the concepts and have those over to you on Friday.\n\nCheers,\nSam" } }),
      R({ id: "r-print", personId: "p-print", from: { name: "PrintHouse", email: "orders@printhouse.example" }, subject: "Proof approval needed: Old Forge menus", receivedAt: at(0, 8, 55),
        why: "Proofs are ready and they need a yes before printing.", summary: "PrintHouse has attached the menu proofs and needs approval by tomorrow to keep the delivery date.",
        draft: { to: "orders@printhouse.example", subject: "Re: Proof approval needed: Old Forge menus", body: "Hi,\n\nThanks for the proofs. I'm checking them with the client today and will confirm by 10am tomorrow.\n\nThanks,\nSam" } }),
      R({ id: "r-old1", personId: "p-ruth", from: { name: "Ruth Old", email: "ruth@oldforge.example" }, subject: "Invoice received", receivedAt: at(0, 8, 50), status: "replied", repliedAt: at(0, 9, 5), draft: { to: "", subject: "", body: "" } })
    ];

    // Calls Claude has written up from the transcripts
    const meetings = [
      { id: "m-ellis", title: "Discovery call with Ellis Joinery", date: local(day(-1), "15:00"), source: "Fathom", personIds: ["p-mark"],
        summary: "Mark wants a logo that feels hand-made but not rustic, for vans, invoices and a new website next year. Budget is around £1,500. He liked the idea of a simple wordmark with a small tool icon.",
        decisions: ["3 logo routes, sent by Friday", "Website is a separate project in the new year"],
        actionTaskIds: ["d-26", "d-27", "d-17"],
        followUp: { to: "mark@ellisjoinery.example", subject: "Great to talk today", body: "Hi Mark,\n\nThanks for your time today. Here's what we agreed:\n\n3 logo routes from me by Friday, built around a simple wordmark.\nA short questionnaire from me today, so I get the details right.\nThe website as a separate project in the new year.\n\nThe questionnaire is attached. Any questions, just shout.\n\nCheers,\nSam" } },
      { id: "m-greenway", title: "Monthly catch-up with Greenway Café", date: local(day(-2), "12:00"), source: "Fireflies", personIds: ["p-tom"],
        summary: "Happy with the new website. Tom wants menu boards for the winter menu and asked for a price by Friday. Contract for the next 6 months is on its way back.",
        decisions: ["Retainer continues for 6 months", "Quote for menu boards by Friday"],
        actionTaskIds: ["d-28", "d-19", "d-07"],
        followUp: { to: "tom@greenway.example", subject: "Thanks for today", body: "Hi Tom,\n\nGood to catch up. I'll send the menu board quote by Friday.\n\nCheers,\nSam", status: "sent" } }
    ];

    return {
      about: "Demo data for a made-up business. Nothing here is saved.",
      formatVersion: 2,
      settings: { yourName: "Sam", businessName: "Fern & Finch", minutesSavedPerTask: 6, minutesSavedPerPlan: 20, dayStarts: "08:00", dayEnds: "18:00", emailProvider: "gmail", calendarProvider: "google" },
      triage: { lastRunAt: new Date(now.getTime() - 22 * 60000).toISOString(), nextRunAt: new Date(now.getTime() + 38 * 60000).toISOString(), emailsScanned: 47, needReply: 6, newTasks: 4, noAction: 37, callsProcessed: 2 },
      replies: replies, meetings: meetings,
      tasks: tasks, plan: plan, week: week, events: events, eventsSyncedAt: at(0, 7, 50),
      people: people, dump: dump, activity: activity
    };
  }

  window.makeTaskDemoData = makeTaskDemoData;
})();

/*
  DEMO DATA
  ---------
  Made-up sample data for Demo mode, so videos and screenshots never show real client data.
  The business is fictional: Fern & Finch, a 2 person branding and web design studio.
  Dates are worked out from today, so the demo always looks current.
*/
(function () {
  "use strict";

  function makeTaskDemoData() {
    const ui = window.Toolkit.ui;
    const now = new Date();
    const today = ui.isoDate(now);
    const day = function (offset) { return ui.isoDate(ui.addDays(now, offset)); };
    const at = function (offset, hour, minute) {
      const d = ui.addDays(now, offset);
      d.setHours(hour, minute || 0, 0, 0);
      return d.toISOString();
    };

    const tasks = [
      { id: "d-01", title: "Chase Marlow Dental for the overdue invoice", notes: "Invoice FF-1042, £1,850. Sent 12 days ago.", category: "today", due: day(0), estimateMinutes: 5, addedBy: "claude" },
      { id: "d-02", title: "Send Hollins Lettings the website proposal", notes: "Promised on Thursday's call. Draft is in the Proposals folder.", category: "today", due: day(0), estimateMinutes: 30, addedBy: "you" },
      { id: "d-03", title: "Reply to Jo at Ledgerline about the VAT figures", notes: "She needs the Q3 expenses total.", category: "today", due: day(2), estimateMinutes: 15, addedBy: "claude" },
      { id: "d-04", title: "Renew the fernandfinch.co.uk domain", notes: "", category: "quick-win", due: day(3), estimateMinutes: 3, addedBy: "claude" },
      { id: "d-05", title: "Book the van in for its MOT", notes: "Garage on Mill Lane, 01632 960 418", category: "quick-win", due: day(9), estimateMinutes: 5, addedBy: "you" },
      { id: "d-06", title: "Format the Greenway Café case study", notes: "Copy is approved. Needs laying out for the website.", category: "delegate", delegateTo: "Priya", estimateMinutes: 60, addedBy: "you" },
      { id: "d-07", title: "Signed contract from Greenway Café", notes: "Sent Monday.", category: "waiting", waitingOn: "Tom at Greenway Café", waitingSince: day(-3), addedBy: "claude" },
      { id: "d-08", title: "Update the prices page on the website", notes: "", category: "later", estimateMinutes: 45, addedBy: "you" },
      { id: "d-09", title: "Send The Old Forge their final invoice", notes: "", category: "today", estimateMinutes: 10, addedBy: "you", status: "done", doneAt: at(0, 8, 42) },
      { id: "d-10", title: "Print proofs from PrintHouse", notes: "For the Old Forge menus.", category: "waiting", waitingOn: "PrintHouse", waitingSince: day(-5), addedBy: "you" },
      { id: "d-11", title: "Plan the Christmas newsletter", notes: "", category: "later", addedBy: "you" },
      { id: "d-12", title: "Post the Old Forge project on LinkedIn", notes: "", category: "later", estimateMinutes: 20, addedBy: "claude" },
      { id: "d-13", title: "Approve Priya's timesheet", notes: "", category: "quick-win", estimateMinutes: 2, addedBy: "you" },
      // New tasks Claude spotted this morning. Not on the list until approved.
      { id: "d-14", title: "Send Greenway Café their deposit invoice", notes: "Tom says the contract is signed. Deposit is 50%, £1,200.", category: "today", due: day(0), addedBy: "claude", suggested: true,
        source: { type: "email", from: "Tom at Greenway Café", subject: "Signed contract attached", date: day(0) } },
      { id: "d-15", title: "Reread the Hollins Lettings brief before the 2pm call", notes: "", category: "quick-win", due: day(0), addedBy: "claude", suggested: true,
        source: { type: "calendar", from: "Website kick-off with Hollins Lettings", subject: "Today, 2pm", date: day(0) } },
      { id: "d-16", title: "Answer Hannah's 2 questions about the logo tweaks", notes: "She wants to know about the colour and the file formats.", category: "quick-win", addedBy: "claude", suggested: true,
        source: { type: "email", from: "Hannah at Marlow Dental", subject: "Quick questions on the logo", date: day(-1) } }
    ].map(function (t) {
      return Object.assign({ status: "open", doneAt: null, due: null, waitingOn: "", delegateTo: "", created: at(-2, 9) }, t);
    });

    const plan = {
      date: today,
      preparedAt: at(0, 7, 55),
      note: "A busy one. The Marlow invoice is 12 days late and the VAT figures are due on " +
            ui.parseDate(day(2)).toLocaleDateString("en-GB", { weekday: "long" }) +
            ", so those come first. The rest is quick or can sit with someone else.",
      items: [
        { taskId: "d-09", category: "today", reason: "Finished first thing.", status: "approved" },
        { taskId: "d-13", category: "quick-win", reason: "2 minutes, and Priya gets paid on time.", status: "approved" },
        { taskId: "d-01", category: "today", reason: "12 days overdue. A polite nudge now saves an awkward one later.", status: "proposed" },
        { taskId: "d-02", category: "today", reason: "You told them it would land today.", status: "proposed" },
        { taskId: "d-03", category: "today", reason: "Jo needs it before the VAT deadline.", status: "proposed" },
        { taskId: "d-04", category: "quick-win", reason: "Takes 3 minutes and the domain lapses this week.", status: "proposed" },
        { taskId: "d-06", category: "delegate", reason: "Priya has space this week and it doesn't need you.", status: "proposed" },
        { taskId: "d-14", category: "today", reason: "Tom's email this morning has the signed contract. Invoice now and the deposit lands this week.", status: "proposed" },
        { taskId: "d-15", category: "quick-win", reason: "The call is at 2pm. 10 minutes with the brief beforehand will do it.", status: "proposed" },
        { taskId: "d-16", category: "quick-win", reason: "2 short answers keep the Marlow project moving.", status: "proposed" },
        { taskId: "d-07", category: "waiting", reason: "Tom's email says it's signed. Tick this off once you've saved the copy.", status: "proposed" },
        { taskId: "d-08", category: "later", reason: "Nothing depends on it this week.", status: "proposed" }
      ]
    };

    // A believable 7 days of activity so the "time saved" counter has something to show
    const activity = [];
    for (let offset = -6; offset < 0; offset++) {
      const d = ui.addDays(now, offset);
      const weekday = d.getDay();
      if (weekday === 0 || weekday === 6) continue; // no weekend work
      activity.push({ at: at(offset, 8, 5), type: "plan-approved", minutes: 20 });
      const count = 4 + ((offset + 10) % 3);
      for (let i = 0; i < count; i++) {
        activity.push({ at: at(offset, 9 + i, 15), type: "task-done", taskId: "past-" + offset + "-" + i, minutes: 6 });
      }
    }
    activity.push({ at: at(0, 8, 42), type: "task-done", taskId: "d-09", minutes: 6 });

    return {
      about: "Demo data for a made-up business. Nothing here is saved.",
      formatVersion: 1,
      settings: { yourName: "Sam", businessName: "Fern & Finch", minutesSavedPerTask: 6, minutesSavedPerPlan: 20 },
      tasks: tasks,
      plan: plan,
      activity: activity
    };
  }

  window.makeTaskDemoData = makeTaskDemoData;
})();

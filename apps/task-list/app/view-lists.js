/*
  LISTS: All tasks, Waiting on, and Done
  --------------------------------------
  All tasks: every open task, filtered by list or person, sorted how you like.
  Waiting on: what other people owe you, how long it's been, and a quick way to ask Claude to chase.
  Done: a logbook of finished tasks, grouped by day.
*/
(function () {
  "use strict";

  const ui = window.TaskListOS.ui, esc = ui.esc, icon = ui.icon;
  const M = window.TL.model, C = window.TL.c;

  // ---------- All tasks ----------
  // The view buttons at the top: everything, just what needs an email from you, or just what's in your calendar
  const VIEWS = [
    { key: "all", label: "All", icon: "list", test: function () { return true; } },
    { key: "reply", label: "Needs a reply", icon: "mail", test: function (d, t) {
      const r = t.replyId ? M.replyById(d, t.replyId) : null;
      return (r && r.status === "waiting") || !!(t.emailDraft && t.emailDraft.body);
    } },
    { key: "calendar", label: "In my calendar", icon: "calendar", test: function (d, t) { return !!(t.scheduledDate && t.scheduledTime) || !!t.calendarAddedAt; } }
  ];

  function renderAll(ctx) {
    const d = ctx.d, st = ctx.state;
    const cat = st.filterCat || "all";
    const person = st.filterPerson || "";
    const sort = st.sortBy || "date";
    const view = VIEWS.find(function (v) { return v.key === st.allView; }) || VIEWS[0];
    const inView = M.openTasks(d).filter(function (t) { return view.test(d, t); });
    let tasks = inView.slice();
    if (cat !== "all") tasks = tasks.filter(function (t) { return t.category === cat; });
    if (person) tasks = tasks.filter(function (t) { return t.personId === person; });
    const sorters = {
      date: function (a, b) { return String(M.plannedDate(a) || "9999").localeCompare(String(M.plannedDate(b) || "9999")); },
      added: function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); },
      person: function (a, b) {
        const pa = M.personById(d, a.personId), pb = M.personById(d, b.personId);
        return String(pa ? pa.name : "~").localeCompare(String(pb ? pb.name : "~"));
      }
    };
    tasks.sort(sorters[sort] || sorters.date);

    const chips = [["all", "All"]].concat(M.CATEGORIES.map(function (c) { return [c.key, c.label]; })).map(function (c) {
      const n = c[0] === "all" ? inView.length : inView.filter(function (t) { return t.category === c[0]; }).length;
      return '<button type="button" class="filter' + (cat === c[0] ? " is-active" : "") + '" data-action="filter-cat" data-cat="' + c[0] + '" aria-pressed="' + (cat === c[0]) + '">' + (c[0] !== "all" ? C.catDot(c[0]) : "") + esc(c[1]) + '<span class="filter__n num">' + n + "</span></button>";
    }).join("");

    const views = '<div class="segmented all-views" role="group" aria-label="Show">' + VIEWS.map(function (v) {
      const n = M.openTasks(d).filter(function (t) { return v.test(d, t); }).length + (v.key === "reply" ? M.openReplies(d).length : 0);
      return '<button type="button" data-action="all-view" data-view-key="' + v.key + '" aria-pressed="' + (view.key === v.key) + '">' + icon(v.icon) + esc(v.label) + '<span class="segmented__n num">' + n + "</span></button>";
    }).join("") + "</div>";
    const emptyText = view.key === "reply" ? "Nothing needs an email from you. Claude puts a draft on any task that does." :
      view.key === "calendar" ? "No tasks have a time yet. Drag one onto a time in This week's calendar." :
      cat === "all" && !person ? "Add a task with the New button, or ask Claude to add one." : "No open tasks match this filter.";

    // Needs a reply: the emails waiting for an answer (each with Claude's draft), then any task with an email to send
    const emails = view.key === "reply" ? M.openReplies(d) : [];
    const emailPanel = emails.length ? '<section class="panel panel--flush">' + C.sectionHead("Emails to answer", { icon: "inbox", count: emails.length }) +
      '<ul class="replies" role="list">' + emails.map(function (r) { return window.TL.views.replies.replyRow(ctx, r, { suffix: "-all" }); }).join("") + "</ul></section>" : "";
    if (view.key === "reply" && emails.length && !tasks.length) {
      return '<div class="page">' + views + emailPanel + "</div>";
    }

    return '<div class="page">' + views + emailPanel +
      '<div class="toolbar toolbar--wrap"><div class="filters" role="group" aria-label="Filter by list">' + chips + "</div>" +
      '<div class="toolbar__group">' +
      '<label class="sr-only" for="filterPerson">Filter by person</label><select class="select select--sm" id="filterPerson" data-change="filter-person">' + C.personOptions(d, person).replace("Nobody in particular", "Everyone") + "</select>" +
      '<label class="sr-only" for="sortBy">Sort</label><select class="select select--sm" id="sortBy" data-change="sort-by">' +
      [["date", "Sort by date"], ["added", "Newest first"], ["person", "Sort by person"]].map(function (o) { return '<option value="' + o[0] + '"' + (sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") +
      "</select></div></div>" +
      '<section class="panel panel--flush">' + (tasks.length ? C.taskList(d, tasks, { anim: ctx.anim, showCat: true, showNotes: true, keySuffix: "-all",
        actions: '<button type="button" class="icon-btn icon-btn--sm" data-action="add-today" aria-label="Add to today">' + icon("sun") + "</button>" }) :
        C.empty("thinking", "Nothing here.", emptyText, "", true)) +
      "</section></div>";
  }

  // ---------- Waiting on ----------
  function renderWaiting(ctx) {
    const d = ctx.d;
    const list = M.waitingList(d).sort(function (a, b) { return String(a.waitingSince || "").localeCompare(String(b.waitingSince || "")); });
    if (!list.length) return '<div class="page page--narrow">' + C.empty("celebrate", "Nobody owes you anything.", "When you're waiting on someone, set the task's list to Waiting on someone and it shows here, with how long it's been.") + "</div>";
    const today = ui.parseDate(M.todayISO());
    return '<div class="page page--narrow"><section class="panel panel--flush"><ul class="rows" role="list">' + list.map(function (t) {
      const p = M.personById(d, t.personId);
      const who = p ? p.name : t.waitingOn || "someone";
      const days = t.waitingSince ? Math.max(0, Math.round((today - ui.parseDate(t.waitingSince)) / 86400000)) : null;
      const level = days == null ? "" : days >= 7 ? " chip--danger" : days >= 3 ? " chip--warning" : "";
      return '<li class="row' + ctx.anim("wait-" + t.id) + '" data-task="' + esc(t.id) + '">' +
        '<button type="button" class="check" role="checkbox" aria-checked="false" data-action="toggle-done" aria-label="It arrived: ' + esc(t.title) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>' +
        '<button type="button" class="row__main" data-action="open-task"><span class="row__title">' + esc(t.title) + '</span><span class="row__notes">Waiting on ' + esc(who) + "</span></button>" +
        '<span class="row__meta">' + (days != null ? '<span class="chip' + level + '">' + icon("hourglass") + days + (days === 1 ? " day" : " days") + "</span>" : "") + (p ? C.avatar(p) : "") + "</span>" +
        '<span class="row__actions row__actions--show"><button type="button" class="btn btn--sm" data-action="copy" data-text="Draft a polite chaser to ' + esc(who) + " about: " + esc(t.title) + '">' + icon("mail") + "Ask Claude to chase</button></span>" +
        "</li>";
    }).join("") + "</ul></section>" +
      '<p class="muted page-foot">Tick a task when the thing you were waiting for arrives. "Ask Claude to chase" copies a request you can paste to Claude; it drafts the chaser and you send it.</p></div>';
  }

  // ---------- Done ----------
  function renderDone(ctx) {
    const d = ctx.d;
    const done = M.doneTasks(d).slice(0, 150);
    if (!done.length) return '<div class="page page--narrow">' + C.empty("trophy", "Nothing ticked off yet.", "Finished tasks collect here, grouped by day.") + "</div>";
    const today = M.todayISO(), yesterday = ui.isoDate(ui.addDays(new Date(), -1));
    const groups = {};
    done.forEach(function (t) { const k = t.doneAt ? ui.isoDate(new Date(t.doneAt)) : "earlier"; (groups[k] = groups[k] || []).push(t); });
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const week = M.timeSaved(d, ui.addDays(start, -6));
    return '<div class="page page--narrow">' +
      '<div class="stat-strip"><div class="stat"><span class="stat__value num">' + done.length + '</span><span class="stat__label">tasks done</span></div>' +
      '<div class="stat"><span class="stat__value num">' + week.tasksDone + '</span><span class="stat__label">in the last 7 days</span></div>' +
      '<div class="stat"><span class="stat__value num">' + esc(ui.minutesLabel(week.minutes)) + '</span><span class="stat__label">saved, last 7 days (estimate)</span></div></div>' +
      Object.keys(groups).map(function (k) {
        const title = k === today ? "Today" : k === yesterday ? "Yesterday" : k === "earlier" ? "Earlier" : ui.parseDate(k).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
        return '<section class="panel panel--flush">' + C.sectionHead(title, { count: groups[k].length }) + C.taskList(d, groups[k], { anim: ctx.anim, keySuffix: "-done", showCat: true }) + "</section>";
      }).join("") + "</div>";
  }

  window.TL.views = window.TL.views || {};
  window.TL.views.all = {
    title: function () { return "All tasks"; },
    sub: function (ctx) { return M.openTasks(ctx.d).length + " open"; },
    render: renderAll
  };
  window.TL.views.waiting = {
    title: function () { return "Waiting on"; },
    sub: function (ctx) { const n = M.waitingList(ctx.d).length; return n ? n + " things other people owe you" : "Nothing outstanding"; },
    render: renderWaiting
  };
  window.TL.views.done = {
    title: function () { return "Done"; },
    sub: function () { return "Your logbook"; },
    render: renderDone
  };
})();

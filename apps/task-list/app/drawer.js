/*
  DRAWER: the record panel that slides in from the right
  ------------------------------------------------------
  Opening a task shows everything about it: list, person, planned day and time, due date,
  notes, where it came from and its history. Opening a person shows their details and every
  task linked to them. Changes save as soon as you make them.
*/
(function () {
  "use strict";

  const ui = window.Toolkit.ui, esc = ui.esc, icon = ui.icon;
  const M = window.TL.model, C = window.TL.c;

  const LENGTHS = [15, 30, 45, 60, 90, 120, 180];

  function prop(label, control, extraClass) {
    return '<div class="prop' + (extraClass ? " " + extraClass : "") + '"><span class="prop__label">' + esc(label) + '</span><div class="prop__value">' + control + "</div></div>";
  }

  // ---------- A task ----------
  function taskHTML(ctx, t) {
    const d = ctx.d;
    const done = t.status === "done";
    const planItem = M.planIsToday(d) ? d.plan.items.find(function (i) { return i.taskId === t.id; }) : null;
    const onToday = planItem && planItem.status === "approved";
    const proposed = planItem && planItem.status === "proposed";
    const isNew = M.isSuggestion(t);

    let banner = "";
    if (isNew || proposed) {
      banner = '<div class="drawer__banner"><span>' + icon("sparkle") + (isNew ? "Claude spotted this. It isn't on your list until you approve it." : "Claude suggests this for today." + (planItem.reason ? " " + esc(planItem.reason) : "")) + "</span>" +
        '<span class="drawer__banner-actions"><button type="button" class="btn btn--approve btn--sm" data-action="approve">' + icon("check") + 'Approve</button><button type="button" class="btn btn--sm" data-action="skip">Skip</button></span></div>';
    } else if (t.proposedDate) {
      banner = '<div class="drawer__banner"><span>' + icon("calendar") + "Claude suggests doing this on " + esc(ui.parseDate(t.proposedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })) + "." + (t.proposedReason ? " " + esc(t.proposedReason) : "") + "</span>" +
        '<span class="drawer__banner-actions"><button type="button" class="btn btn--approve btn--sm" data-action="approve-schedule">' + icon("check") + 'Approve</button><button type="button" class="btn btn--sm" data-action="skip-schedule">Skip</button></span></div>';
    }

    const lengthOptions = '<option value="">Length</option>' + LENGTHS.map(function (m) { return '<option value="' + m + '"' + (Number(t.durationMinutes) === m ? " selected" : "") + ">" + esc(ui.minutesLabel(m)) + "</option>"; }).join("");
    const source = t.source ? '<section class="drawer__section"><h3 class="label">Where it came from</h3>' + C.sourceLine(t) + (t.source.date ? '<p class="muted drawer__small">' + esc(ui.parseDate(t.source.date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })) + "</p>" : "") + "</section>" : "";
    const hist = M.history(d, t);

    return '<div class="drawer__head"><span class="label">Task</span><span class="drawer__spacer"></span>' +
      '<button type="button" class="icon-btn" data-action="close-drawer" aria-label="Close">' + icon("x") + "</button></div>" +
      '<div class="drawer__body" data-task="' + esc(t.id) + '">' + banner +
      '<div class="drawer__title-row"><button type="button" class="check check--lg" role="checkbox" aria-checked="' + done + '" data-action="toggle-done" aria-label="' + (done ? "Mark not done" : "Mark done") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>' +
      '<textarea class="input-bare drawer__title" data-field="title" rows="1" maxlength="200" aria-label="Task title">' + esc(t.title) + "</textarea></div>" +
      '<div class="props">' +
      prop("List", '<select class="select select--bare" data-field="category" aria-label="List">' + C.categoryOptions(t.category) + "</select>") +
      prop("Who", '<select class="select select--bare" data-field="personId" aria-label="Who it\'s for">' + C.personOptions(d, t.personId) + "</select>") +
      (t.category === "waiting" ? prop("Waiting on", '<input class="input input--bare" data-field="waitingOn" maxlength="120" value="' + esc(t.waitingOn || "") + '" placeholder="Who or what" aria-label="Waiting on">') : "") +
      (t.category === "delegate" ? prop("Hand to", '<input class="input input--bare" data-field="delegateTo" maxlength="120" value="' + esc(t.delegateTo || "") + '" placeholder="Who should do it" aria-label="Hand to">') : "") +
      prop("Plan for", '<input class="input input--bare" type="date" data-field="scheduledDate" value="' + esc(t.scheduledDate || "") + '" aria-label="Plan for">') +
      prop("Time", '<input class="input input--bare" type="time" step="900" data-field="scheduledTime" value="' + esc(t.scheduledTime || "") + '" aria-label="Time"><select class="select select--bare" data-field="durationMinutes" aria-label="Length">' + lengthOptions + "</select>", "prop--pair") +
      prop("Due", '<input class="input input--bare" type="date" data-field="due" value="' + esc(t.due || "") + '" aria-label="Due date">') +
      prop("Today", done ? '<span class="muted">Done</span>' : onToday ? '<button type="button" class="btn btn--sm" data-action="remove-today">' + icon("sun") + "On today's list · Remove</button>" : '<button type="button" class="btn btn--sm" data-action="add-today">' + icon("sun") + "Add to today</button>") +
      "</div>" +
      '<section class="drawer__section"><h3 class="label"><label for="taskNotes">Notes</label></h3><textarea class="textarea" id="taskNotes" data-field="notes" rows="4" maxlength="4000" placeholder="Names, amounts, links, anything useful">' + esc(t.notes || "") + "</textarea></section>" +
      source +
      (hist.length ? '<section class="drawer__section"><h3 class="label">History</h3><ol class="history">' + hist.map(function (h) {
        return '<li><span class="history__dot"></span><span>' + esc(h.text) + '</span><span class="muted num">' + esc(new Date(h.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })) + "</span></li>";
      }).join("") + "</ol></section>" : "") +
      "</div>" +
      '<div class="drawer__foot" data-task="' + esc(t.id) + '"><button type="button" class="btn btn--ghost btn--danger btn--sm" data-action="delete-task">' + icon("trash") + 'Delete</button><span class="drawer__spacer"></span>' +
      '<button type="button" class="btn ' + (done ? "" : "btn--approve") + '" data-action="toggle-done">' + icon(done ? "undo" : "check") + (done ? "Mark not done" : "Mark done") + "</button></div>";
  }

  // ---------- A person ----------
  function personHTML(ctx, p) {
    const d = ctx.d;
    const tasks = M.tasksForPerson(d, p.id);
    const open = tasks.filter(M.isOnList);
    const waiting = open.filter(function (t) { return t.category === "waiting"; });
    const doing = open.filter(function (t) { return t.category !== "waiting"; });
    const done = tasks.filter(function (t) { return t.status === "done"; }).slice(-5).reverse();
    const s = M.personSummary(d, p);
    const roles = M.ROLES.map(function (r) { return '<option value="' + r.key + '"' + (p.role === r.key ? " selected" : "") + ">" + r.label + "</option>"; }).join("");
    const list = function (title, items) { return items.length ? '<section class="drawer__section"><h3 class="label">' + esc(title) + ' <span class="badge">' + items.length + "</span></h3>" + C.taskList(d, items, { keySuffix: "-person" }) + "</section>" : ""; };

    return '<div class="drawer__head"><span class="label">Person</span><span class="drawer__spacer"></span>' +
      '<button type="button" class="icon-btn" data-action="close-drawer" aria-label="Close">' + icon("x") + "</button></div>" +
      '<div class="drawer__body" data-person="' + esc(p.id) + '">' +
      '<div class="person-head">' + C.avatar(p, "lg") + '<div class="person-head__text">' +
      '<input class="input-bare person-head__name" data-pfield="name" maxlength="80" value="' + esc(p.name) + '" aria-label="Name">' +
      '<input class="input-bare person-head__org" data-pfield="organisation" maxlength="80" value="' + esc(p.organisation || "") + '" placeholder="Business or organisation" aria-label="Organisation"></div></div>' +
      '<div class="stat-strip stat-strip--sm"><div class="stat"><span class="stat__value num">' + s.open + '</span><span class="stat__label">open</span></div><div class="stat"><span class="stat__value num">' + s.waiting + '</span><span class="stat__label">waiting</span></div><div class="stat"><span class="stat__value num">' + s.overdue + '</span><span class="stat__label">late</span></div></div>' +
      '<div class="props">' +
      prop("Type", '<select class="select select--bare" data-pfield="role" aria-label="Type">' + roles + "</select>") +
      prop("Email", '<input class="input input--bare" type="email" data-pfield="email" maxlength="120" value="' + esc(p.email || "") + '" placeholder="Add email" aria-label="Email">') +
      prop("Phone", '<input class="input input--bare" type="tel" data-pfield="phone" maxlength="40" value="' + esc(p.phone || "") + '" placeholder="Add phone" aria-label="Phone">') +
      "</div>" +
      '<section class="drawer__section"><h3 class="label"><label for="personNotes">Notes</label></h3><textarea class="textarea" id="personNotes" data-pfield="notes" rows="3" maxlength="2000" placeholder="How you know them, how they like to work, anything useful">' + esc(p.notes || "") + "</textarea></section>" +
      list("Open tasks", doing) + list("Waiting on them", waiting) + list("Recently done", done) +
      "</div>" +
      '<div class="drawer__foot" data-person="' + esc(p.id) + '"><span class="drawer__spacer"></span><button type="button" class="btn btn--primary" data-action="quick-add-person">' + icon("plus") + "New task for " + esc(p.name.split(" ")[0]) + "</button></div>";
  }

  function render(ctx, target) {
    if (target.kind === "task") { const t = M.taskById(ctx.d, target.id); return t ? taskHTML(ctx, t) : null; }
    if (target.kind === "person") { const p = M.personById(ctx.d, target.id); return p ? personHTML(ctx, p) : null; }
    return null;
  }

  // Save each field as soon as it changes
  function bind(root, ctx, target) {
    root.querySelectorAll("[data-field]").forEach(function (el) {
      el.addEventListener("change", function () {
        const field = el.getAttribute("data-field");
        let value = el.value;
        if (field === "title") { value = value.replace(/\s+/g, " ").trim(); if (!value) { el.value = M.taskById(ctx.d, target.id).title; return; } }
        if (field === "durationMinutes") value = value ? Number(value) : null;
        const fields = {}; fields[field] = value;
        ctx.actions.updateTask(target.id, fields);
      });
    });
    root.querySelectorAll("[data-pfield]").forEach(function (el) {
      el.addEventListener("change", function () {
        const field = el.getAttribute("data-pfield");
        const value = el.value.trim();
        if (field === "name" && !value) { el.value = M.personById(ctx.d, target.id).name; return; }
        const fields = {}; fields[field] = value;
        ctx.actions.updatePerson(target.id, fields);
      });
    });
    // The title grows with its text, and Enter finishes editing
    const title = root.querySelector(".drawer__title");
    if (title) {
      const fit = function () { title.style.height = "auto"; title.style.height = title.scrollHeight + "px"; };
      fit();
      title.addEventListener("input", fit);
      title.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); title.blur(); } });
    }
  }

  window.TL.drawer = { render: render, bind: bind };
})();

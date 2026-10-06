/*
  THIS WEEK: plan the week on a board
  -----------------------------------
  Goals for the week along the top. Below, an "Unplanned" tray and a column per day.
  Drag a task onto a day to plan it for that day, or back onto the tray to unplan it.
  Claude's suggested days ("plan my week") show as dashed cards to approve or skip.
  Without a mouse: open a task and set "Plan for" in its panel.
*/
(function () {
  "use strict";

  const ui = window.Toolkit.ui, esc = ui.esc, icon = ui.icon;
  const M = window.TL.model, C = window.TL.c;

  function card(ctx, t, opts) {
    const d = ctx.d;
    const o = opts || {};
    const done = t.status === "done";
    const p = M.personById(d, t.personId);
    if (o.ghost) {
      return '<div class="wcard wcard--ghost" data-task="' + esc(t.id) + '">' +
        '<span class="wcard__title">' + esc(t.title) + "</span>" +
        (t.proposedReason ? '<span class="wcard__reason">' + esc(t.proposedReason) + "</span>" : "") +
        '<span class="wcard__ghost-actions"><span class="new-tag">Claude</span>' +
        '<button type="button" class="icon-btn icon-btn--sm is-approve" data-action="approve-schedule" aria-label="Approve this day for ' + esc(t.title) + '">' + icon("check") + "</button>" +
        '<button type="button" class="icon-btn icon-btn--sm is-skip" data-action="skip-schedule" aria-label="Skip this suggestion">' + icon("x") + "</button></span></div>";
    }
    return '<div class="wcard cat-edge--' + esc(t.category) + (done ? " is-done" : "") + ctx.anim("w-" + t.id) + '" data-task="' + esc(t.id) + '"' + (done ? "" : ' draggable="true"') + ">" +
      '<button type="button" class="check check--sm" role="checkbox" aria-checked="' + done + '" data-action="toggle-done" aria-label="Mark done: ' + esc(t.title) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>' +
      '<button type="button" class="wcard__title" data-action="open-task">' + esc(t.title) + "</button>" +
      '<span class="wcard__meta">' + (t.scheduledTime ? '<span class="chip">' + esc(M.timeLabel(t.scheduledTime)) + "</span>" : "") +
      (t.due && t.due === M.plannedDate(t) ? '<span class="chip chip--warning">' + icon("flag") + "Due</span>" : "") + (p ? C.avatar(p) : "") + "</span></div>";
  }

  function render(ctx) {
    const d = ctx.d;
    const monday = ctx.state.weekStart ? ui.parseDate(ctx.state.weekStart) : M.mondayOf();
    const dates = M.weekDates(monday);
    const today = M.todayISO();
    const isThisWeek = dates.indexOf(today) > -1;
    const sunday = ui.addDays(monday, 6);
    const label = monday.toLocaleDateString("en-GB", { day: "numeric", month: monday.getMonth() === sunday.getMonth() ? undefined : "short" }) + " to " + sunday.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

    let html = '<div class="page page--wide">' +
      '<div class="toolbar"><div class="toolbar__group">' +
      '<button type="button" class="icon-btn" data-action="week-prev" aria-label="Previous week">' + icon("chevronLeft") + "</button>" +
      '<button type="button" class="btn btn--sm" data-action="week-today"' + (isThisWeek ? " disabled" : "") + ">This week</button>" +
      '<button type="button" class="icon-btn" data-action="week-next" aria-label="Next week">' + icon("chevronRight") + "</button>" +
      '<h2 class="toolbar__label">' + esc(label) + "</h2></div>" +
      '<div class="toolbar__group">' + C.say("Plan my week") + "</div></div>";

    // Goals (this week only)
    if (isThisWeek) {
      const goals = d.week.start === ui.isoDate(M.mondayOf()) ? d.week.goals : [];
      const doneGoals = goals.filter(function (g) { return g.done; }).length;
      html += '<section class="goals">' +
        '<div class="goals__head"><h2>' + icon("target") + "Goals this week</h2>" + (goals.length ? '<span class="muted num">' + doneGoals + " of " + goals.length + "</span>" : "") + "</div>" +
        '<ul class="goals__list" role="list">' + goals.map(function (g) {
          return '<li class="goal' + (g.done ? " is-done" : "") + ctx.anim("g-" + g.id) + '" data-goal="' + esc(g.id) + '">' +
            '<button type="button" class="check check--sm" role="checkbox" aria-checked="' + !!g.done + '" data-action="goal-toggle" aria-label="Goal done: ' + esc(g.text) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>' +
            '<span class="goal__text">' + esc(g.text) + "</span>" + (g.addedBy === "claude" ? '<span class="chip chip--info">Claude</span>' : "") +
            '<button type="button" class="icon-btn icon-btn--sm goal__remove" data-action="goal-remove" aria-label="Remove goal">' + icon("x") + "</button></li>";
        }).join("") +
        '<li><form class="goal-add" data-form="add-goal" autocomplete="off"><input class="goal-add__input" id="goalAdd" data-keep name="text" maxlength="200" placeholder="' + (goals.length ? "Add another goal" : "What would make this week a good one? Add a goal and press Enter") + '" aria-label="Add a goal for this week"></form></li>' +
        "</ul></section>";
    }

    // The board
    const tray = M.unscheduled(d).concat(M.overdue(d).filter(function (t) { return !isThisWeek || dates.indexOf(M.plannedDate(t)) === -1; }));
    html += '<div class="board" role="list">';
    html += '<section class="board__col board__col--tray" data-drop-date="" role="listitem" aria-label="Unplanned tasks">' +
      '<header class="board__head"><span class="board__day">Unplanned</span><span class="badge">' + tray.length + "</span></header>" +
      '<div class="board__cards">' + (tray.length ? tray.map(function (t) { return card(ctx, t); }).join("") : '<p class="board__empty">Everything has a day.</p>') + "</div></section>";

    dates.forEach(function (iso) {
      const day = ui.parseDate(iso);
      const tasks = M.tasksForDate(d, iso, { includeDone: true }).sort(function (a, b) {
        return (a.status === "done") - (b.status === "done") || String(a.scheduledTime || "99").localeCompare(String(b.scheduledTime || "99"));
      });
      const ghosts = d.tasks.filter(function (t) { return M.isOnList(t) && t.proposedDate === iso; });
      const events = M.eventsForDate(d, iso);
      const isToday = iso === today, isPast = iso < today;
      const weekend = day.getDay() === 0 || day.getDay() === 6;
      html += '<section class="board__col' + (isToday ? " is-today" : "") + (isPast ? " is-past" : "") + (weekend ? " is-weekend" : "") + '" data-drop-date="' + iso + '" role="listitem" aria-label="' + esc(day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })) + '">' +
        '<header class="board__head"><span class="board__day">' + esc(day.toLocaleDateString("en-GB", { weekday: "short" })) + ' <span class="board__date num">' + day.getDate() + "</span></span>" +
        (events.length ? '<button type="button" class="chip chip--info board__events" data-action="go-calendar-day" data-date="' + iso + '" title="' + esc(events.map(function (e) { return (e.allDay ? "" : M.timeLabel(M.fromMinutes(M.splitLocal(e.start).minutes)) + " ") + e.title; }).join("\n")) + '">' + icon("calendar") + events.length + "</button>" : "") +
        "</header>" +
        '<div class="board__cards">' + ghosts.map(function (t) { return card(ctx, t, { ghost: true }); }).join("") + tasks.map(function (t) { return card(ctx, t); }).join("") +
        (!tasks.length && !ghosts.length ? '<p class="board__empty">' + (isPast ? "" : "Drop tasks here") + "</p>" : "") + "</div></section>";
    });
    html += "</div></div>";
    return html;
  }

  // Drag and drop between the tray and the days
  function bind(root, ctx) {
    root.querySelectorAll('.wcard[draggable="true"]').forEach(function (el) {
      el.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", el.getAttribute("data-task"));
        e.dataTransfer.effectAllowed = "move";
        el.classList.add("is-dragging");
        root.classList.add("is-drag-active");
      });
      el.addEventListener("dragend", function () { el.classList.remove("is-dragging"); root.classList.remove("is-drag-active"); });
    });
    root.querySelectorAll("[data-drop-date]").forEach(function (col) {
      col.addEventListener("dragover", function (e) { e.preventDefault(); col.classList.add("is-over"); });
      col.addEventListener("dragleave", function (e) { if (!col.contains(e.relatedTarget)) col.classList.remove("is-over"); });
      col.addEventListener("drop", function (e) {
        e.preventDefault();
        col.classList.remove("is-over");
        const id = e.dataTransfer.getData("text/plain");
        if (id) ctx.actions.planForDay(id, col.getAttribute("data-drop-date") || null);
      });
    });
  }

  window.TL.views = window.TL.views || {};
  window.TL.views.week = {
    title: function () { return "This week"; },
    sub: function (ctx) {
      const goals = ctx.d.week.start === ui.isoDate(M.mondayOf()) ? ctx.d.week.goals : [];
      return goals.length ? goals.filter(function (g) { return g.done; }).length + " of " + goals.length + " goals done" : "Drag tasks onto days to plan your week";
    },
    render: render,
    bind: bind
  };
})();

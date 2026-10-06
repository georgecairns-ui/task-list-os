/*
  PEOPLE: a light CRM
  -------------------
  Everyone the business works with: clients, customers, suppliers, the team.
  For each: open tasks, what you're waiting on from them, the next date, and when you last
  dealt with them. Click a person to open their record, with all their tasks in one place.
*/
(function () {
  "use strict";

  const ui = window.TaskListOS.ui, esc = ui.esc, icon = ui.icon;
  const M = window.TL.model, C = window.TL.c;

  function relative(iso) {
    if (!iso) return '<span class="faint">None yet</span>';
    const days = Math.round((ui.parseDate(M.todayISO()) - ui.parseDate(ui.isoDate(new Date(iso)))) / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    return esc(new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
  }

  function render(ctx) {
    const d = ctx.d;
    const role = ctx.state.filterRole || "all";
    const roleLabel = {};
    M.ROLES.forEach(function (r) { roleLabel[r.key] = r.label; });
    let people = d.people.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (role !== "all") people = people.filter(function (p) { return p.role === role; });

    const usedRoles = M.ROLES.filter(function (r) { return d.people.some(function (p) { return p.role === r.key; }); });
    const filters = [["all", "Everyone"]].concat(usedRoles.map(function (r) { return [r.key, r.label]; })).map(function (r) {
      return '<button type="button" class="filter' + (role === r[0] ? " is-active" : "") + '" data-action="filter-role" data-role="' + r[0] + '" aria-pressed="' + (role === r[0]) + '">' + esc(r[1]) + "</button>";
    }).join("");

    let html = '<div class="page">' +
      '<div class="toolbar toolbar--wrap"><div class="filters" role="group" aria-label="Filter people">' + filters + "</div>" +
      '<button type="button" class="btn btn--primary btn--sm" data-action="add-person">' + icon("plus") + "Add person</button></div>";

    if (!d.people.length) {
      return html + C.empty("welcome", "No people yet.", "Add the clients, suppliers and team you deal with most. Then link tasks to them and see everything for one person in one place. Claude can fill this in from your notes too.",
        '<div class="empty__actions">' + C.say("Add my key clients and suppliers to People") + "</div>") + "</div>";
    }

    html += '<section class="panel panel--flush"><div class="table" role="table" aria-label="People">' +
      '<div class="table__row table__row--head" role="row"><span role="columnheader">Name</span><span role="columnheader">Type</span><span role="columnheader" class="num">Open</span><span role="columnheader">Waiting</span><span role="columnheader">Next</span><span role="columnheader">Last dealt with</span></div>' +
      people.map(function (p) {
        const s = M.personSummary(d, p);
        return '<button type="button" class="table__row' + ctx.anim("person-" + p.id) + '" role="row" data-person="' + esc(p.id) + '" data-action="open-person">' +
          '<span class="table__name" role="cell">' + C.avatar(p, "md") + '<span><strong>' + esc(p.name) + "</strong>" + (p.organisation ? '<span class="muted">' + esc(p.organisation) + "</span>" : "") + "</span></span>" +
          '<span role="cell"><span class="chip role-chip role-chip--' + esc(p.role) + '">' + esc(roleLabel[p.role] || "Other") + "</span></span>" +
          '<span role="cell" class="num">' + s.open + (s.overdue ? ' <span class="chip chip--danger">' + s.overdue + " late</span>" : "") + "</span>" +
          '<span role="cell">' + (s.waiting ? '<span class="chip chip--warning">' + icon("hourglass") + s.waiting + "</span>" : '<span class="faint">·</span>') + "</span>" +
          '<span role="cell">' + (s.nextDue ? esc(ui.parseDate(s.nextDue).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })) : '<span class="faint">·</span>') + "</span>" +
          '<span role="cell">' + relative(s.lastActivity) + "</span></button>";
      }).join("") + "</div></section></div>";
    return html;
  }

  window.TL.views = window.TL.views || {};
  window.TL.views.people = {
    title: function () { return "People"; },
    sub: function (ctx) { return ctx.d.people.length + (ctx.d.people.length === 1 ? " person" : " people"); },
    render: render
  };
})();

/*
  BRAIN DUMP: get everything out of your head
  -------------------------------------------
  Type freely, one thing per line. When you press "Add to brain dump", each line becomes an
  unsorted item saved in the task file, so nothing is lost. Then either turn items into tasks
  yourself, or say "sort my brain dump" and Claude suggests proper tasks for you to approve.
*/
(function () {
  "use strict";

  const ui = window.TaskListOS.ui, esc = ui.esc, icon = ui.icon;
  const M = window.TL.model, C = window.TL.c;

  function ago(iso) {
    const mins = Math.round((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " min ago";
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? " hour ago" : " hours ago");
    const days = Math.round(hrs / 24);
    return days === 1 ? "yesterday" : days + " days ago";
  }

  function render(ctx) {
    const d = ctx.d;
    const unsorted = M.unsortedDump(d).slice().reverse();
    const sorted = d.dump.filter(function (x) { return x.status === "sorted"; }).slice(-12).reverse();

    let html = '<div class="page page--narrow">' +
      '<section class="composer">' +
      '<label class="sr-only" for="dumpText">Brain dump</label>' +
      '<textarea id="dumpText" class="composer__text" data-keep rows="7" placeholder="Everything on your mind, one thing per line.\nCall the bank about the card machine\nIdeas for the summer menu\nAsk Priya about next week’s rota\nRenew the van insurance before the 20th"></textarea>' +
      '<div class="composer__foot"><button type="button" class="btn" data-action="voice-note">' + icon("mic") + "Record instead</button><p class=\"muted composer__tip\">Each line becomes an item. Messy is fine.</p>" +
      '<button type="button" class="btn btn--primary" data-action="dump-add">' + icon("plus") + 'Add to brain dump <span class="kbd kbd--on-accent">⌘↵</span></button></div>' +
      "</section>";

    html += '<section class="panel">' + C.sectionHead("Unsorted", { icon: "inbox", count: unsorted.length,
      right: unsorted.length ? '<div class="section-head__right"><span class="muted hide-sm">Let Claude turn these into tasks:</span>' + C.say("Sort my brain dump") + "</div>" : "" });
    if (unsorted.length) {
      html += '<ul class="dump-list" role="list">' + unsorted.map(function (x) {
        return '<li class="dump-item' + ctx.anim("dump-" + x.id) + '" data-dump="' + esc(x.id) + '">' +
          (x.kind === "voice" ? '<span class="dump-item__voice" title="Voice note">' + icon("mic") + "</span>" : '<span class="dump-item__bullet" aria-hidden="true"></span>') +
          '<span class="dump-item__text' + (x.kind === "voice" ? " is-voice" : "") + '">' + esc(x.text) + '<span class="dump-item__when">' + (x.kind === "voice" ? "Voice note \u00b7 " : "") + esc(ago(x.createdAt)) + "</span></span>" +
          '<span class="dump-item__actions">' +
          '<button type="button" class="btn btn--sm" data-action="dump-to-task">' + icon("plus") + "Make a task</button>" +
          '<button type="button" class="icon-btn icon-btn--sm" data-action="dump-remove" aria-label="Remove: ' + esc(x.text) + '">' + icon("x") + "</button>" +
          "</span></li>";
      }).join("") + "</ul>";
    } else {
      html += C.empty("thinking", "Your head is clear.", "Anything you add above waits here until it's sorted into a task.", "", true);
    }
    html += "</section>";

    if (sorted.length) {
      html += '<details class="panel sorted"><summary class="sorted__summary">' + icon("check") + "Recently sorted <span class=\"badge\">" + sorted.length + "</span></summary>" +
        '<ul class="dump-list dump-list--sorted" role="list">' + sorted.map(function (x) {
          const tasks = (x.taskIds || []).map(function (id) { return M.taskById(d, id); }).filter(Boolean);
          return '<li class="dump-item is-sorted"><span class="dump-item__text">' + esc(x.text) + "</span>" +
            '<span class="dump-item__became">' + (tasks.length ? icon("arrowRight") + tasks.map(function (t) {
              return '<button type="button" class="link-btn" data-task="' + esc(t.id) + '" data-action="open-task">' + esc(t.title) + "</button>";
            }).join(", ") : '<span class="muted">No task needed</span>') + "</span></li>";
        }).join("") + "</ul></details>";
    }
    return html + "</div>";
  }

  // Cmd or Ctrl + Enter adds the dump
  function bind(root) {
    const ta = root.querySelector("#dumpText");
    if (!ta) return;
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); root.querySelector('[data-action="dump-add"]').click(); }
    });
  }

  window.TL.views = window.TL.views || {};
  window.TL.views.dump = {
    title: function () { return "Brain dump"; },
    sub: function (ctx) { const n = M.unsortedDump(ctx.d).length; return n ? n + " unsorted" : "Get it out of your head"; },
    render: render,
    bind: bind
  };
})();

/*
  TOOLKIT MENU: "Your tools" and "More tools" in the sidebar
  -----------------------------------------------------------
  Shared by every tool. It reads 2 small files:
    - apps/shared/catalogue.json   all 9 tools, what each does, and the booking link
    - apps/installed.json          the tools in this folder
  Tools in this folder appear under "Your tools" and open as normal. Every other tool appears under
  "More tools" with a padlock. Clicking one opens a calm panel saying what it does, with a button to
  book a free call with Get AI Powers, who set it up with you. Nothing ever pops up by itself.

  How a tool uses it: give <body> a data-tool attribute (this tool's id, for example "task-list"),
  put <div data-toolkit-menu="yours"></div> and <div data-toolkit-menu="more"></div> in the sidebar,
  and load this file after ui.js. If the files can't be read (for example when the page is opened
  straight from the folder rather than through the helper), the menu simply stays hidden.
*/
(function () {
  "use strict";

  const ui = window.TaskListOS.ui, esc = ui.esc, icon = ui.icon;

  function getJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("Could not read " + url);
      return r.json();
    });
  }

  // apps/pipeline/ -> ../pipeline/ (pages live one folder down from apps/)
  function hrefFor(tool) { return "../" + String(tool.app || "").replace(/^apps\//, ""); }

  // The booking link, tagged with the tool being used and the locked tool that was clicked
  function bookingLink(booking, from, locked) {
    const url = new URL(booking.url);
    url.searchParams.set("utm_source", from.repository || from.id);
    url.searchParams.set("utm_medium", "toolkit-app");
    url.searchParams.set("utm_campaign", locked.id);
    return url.toString();
  }

  function openPanel(tool, booking, from, opener) {
    const dlg = document.createElement("dialog");
    dlg.className = "modal modal--tool";
    dlg.setAttribute("aria-labelledby", "toolPanelName");
    dlg.innerHTML =
      '<div class="tool-panel">' +
      '<button type="button" class="icon-btn tool-panel__close" data-close aria-label="Close">' + icon("x") + "</button>" +
      '<div class="tool-panel__top"><span class="tool-panel__icon">' + icon(tool.icon) + "</span>" +
      '<div><h2 class="tool-panel__name" id="toolPanelName">' + esc(tool.name) + "</h2>" +
      '<span class="tool-panel__tag">' + icon("lock") + "Not in your toolkit yet</span></div></div>" +
      '<p class="tool-panel__text">' + esc(tool.description) + "</p>" +
      '<p class="tool-panel__line">' + esc(booking.line) + "</p>" +
      '<div class="tool-panel__actions"><button type="button" class="btn" data-close>Not now</button>' +
      '<a class="btn btn--primary" href="' + esc(bookingLink(booking, from, tool)) + '" target="_blank" rel="noopener" data-close>' +
      icon("calendar") + esc(booking.button) + "</a></div></div>";
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (e) {
      // A click on the dim area outside the panel lands on the dialog itself
      if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
    });
    dlg.addEventListener("close", function () {
      dlg.remove();
      if (opener && document.contains(opener)) opener.focus();
    });
    dlg.showModal();
    dlg.querySelector(".btn--primary").focus();
  }

  function render(catalogue, installed, currentId) {
    const yoursEl = document.querySelector('[data-toolkit-menu="yours"]');
    const moreEl = document.querySelector('[data-toolkit-menu="more"]');
    const tools = Array.isArray(catalogue.tools) ? catalogue.tools : [];
    const booking = catalogue.booking || {};
    const extra = (installed.tools || []).filter(function (t) { return t && t.id; });
    const have = {};
    extra.forEach(function (t) { have[t.id] = true; });
    have[currentId] = true;
    const from = tools.find(function (t) { return t.id === currentId; }) || { id: currentId };

    // Catalogue tools in this folder first, then any attached tool the catalogue doesn't know (a custom one)
    const known = {};
    tools.forEach(function (t) { known[t.id] = true; });
    const mine = tools.filter(function (t) { return have[t.id]; }).concat(extra.filter(function (t) { return !known[t.id]; })
      .map(function (t) { return { id: t.id, name: t.name || t.id, icon: t.icon || "folder", app: t.app }; }));
    const locked = tools.filter(function (t) { return !have[t.id]; });

    if (yoursEl) {
      yoursEl.className = "tools";
      yoursEl.setAttribute("role", "group");
      yoursEl.setAttribute("aria-label", "Your tools");
      yoursEl.innerHTML = '<div class="tools__label" aria-hidden="true">Your tools</div>' + mine.map(function (t) {
        const current = t.id === currentId;
        return '<a class="tools__item' + (current ? " is-current" : "") + '" href="' + esc(hrefFor(t)) + '"' + (current ? ' aria-current="page"' : "") + ">" +
          icon(t.icon) + '<span class="tools__name">' + esc(t.name) + "</span></a>";
      }).join("");
      yoursEl.hidden = false;
    }

    if (moreEl) {
      const show = booking.showMoreTools !== false && booking.url && locked.length > 0;
      moreEl.className = "tools tools--more";
      moreEl.hidden = !show;
      if (!show) { moreEl.innerHTML = ""; return; }
      moreEl.setAttribute("role", "group");
      moreEl.setAttribute("aria-label", "More tools");
      moreEl.innerHTML = '<div class="tools__label" aria-hidden="true">More tools</div>' + locked.map(function (t) {
        return '<button type="button" class="tools__item is-locked" data-locked-tool="' + esc(t.id) + '" aria-haspopup="dialog" aria-label="' + esc(t.name) + ', not in your toolkit yet">' +
          icon(t.icon) + '<span class="tools__name">' + esc(t.name) + "</span>" + icon("lock", "tools__lock") + "</button>";
      }).join("");
      moreEl.addEventListener("click", function (e) {
        const b = e.target.closest("[data-locked-tool]");
        if (!b) return;
        const tool = locked.find(function (t) { return t.id === b.getAttribute("data-locked-tool"); });
        if (tool) openPanel(tool, booking, from, b);
      });
    }
  }

  function mount() {
    const currentId = document.body.getAttribute("data-tool");
    if (!currentId || !document.querySelector("[data-toolkit-menu]")) return Promise.resolve();
    return Promise.all([getJson("../shared/catalogue.json"), getJson("../installed.json")])
      .then(function (both) { render(both[0], both[1], currentId); })
      .catch(function () { /* Opened without the helper: no menu, everything else still works */ });
  }

  window.TaskListOS.toolkitMenu = { mount: mount, bookingLink: bookingLink };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();

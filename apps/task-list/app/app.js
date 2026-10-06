/*
  TASK LIST: the app
  ------------------
  What this file does, top to bottom:
  1. Settings and the 5 categories Claude sorts tasks into.
  2. Starts the shared "store", which connects to data/tasks.json (or Demo mode).
  3. Draws whichever screen fits: welcome, loading, problem, or your day.
  4. Handles the buttons: approve, edit, skip, done, add, delete, summary, settings.

  The rule throughout: Claude proposes, the person approves. Nothing Claude suggests
  counts until someone clicks Approve. Every change goes through store.update(), which
  saves it straight back into data/tasks.json for Claude to read.
*/
(function () {
  "use strict";

  const ui = window.Toolkit.ui;
  const esc = ui.esc;
  const icon = ui.icon;

  const MODULE_ID = "01-task-list";
  const DATA_FILE = "tasks.json";

  // Work out where the shared folder is (it moves when the module is zipped on its own)
  const SHARED = document.querySelector('link[href$="theme.css"]').getAttribute("href").replace("theme.css", "");
  const ART = {
    welcome: SHARED + "images/claude-welcome.jpg",
    thinking: SHARED + "images/claude-thinking.jpg",
    celebrate: SHARED + "images/claude-celebrate.jpg",
    shrug: SHARED + "images/claude-shrug.jpg",
    trophy: SHARED + "images/claude-trophy.jpg"
  };

  // The 5 places a task can go, in the order they appear on screen
  const CATEGORIES = [
    { key: "today",     label: "Do today",           icon: "sun",       hint: "Needs you today" },
    { key: "quick-win", label: "Quick wins",         icon: "zap",       hint: "Under 10 minutes each" },
    { key: "delegate",  label: "Delegate",           icon: "users",     hint: "Someone else can do these" },
    { key: "waiting",   label: "Waiting on someone", icon: "hourglass", hint: "The ball is in their court" },
    { key: "later",     label: "Can wait",           icon: "calendar",  hint: "Fine to leave for now" }
  ];
  const CAT = {};
  CATEGORIES.forEach(function (c) { CAT[c.key] = c; });

  const DEFAULT_SETTINGS = { yourName: "", businessName: "", minutesSavedPerTask: 6, minutesSavedPerPlan: 20 };

  // ---------- Element shortcuts ----------
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const screenEl = $("#screen");
  const bannerEl = $("#banner");
  const demoToggle = $("#demoToggle");
  const saveStatus = $("#saveStatus");
  const settingsBtn = $("#settingsBtn");

  let data = null;            // the current contents of tasks.json
  let status = "checking";    // what the store last told us
  let statusDetail = {};
  let layoutBuilt = false;    // the day view frame is drawn once, then its parts refresh
  const seen = new Set();     // things already on screen, so only new ones animate in

  // ============================================================
  // 1. Reading the file safely
  // ============================================================

  // Throws if tasks.json is not the shape we expect (the store then shows a friendly message)
  function validate(d) {
    if (!d || typeof d !== "object") throw new Error("The file is empty.");
    if (!Array.isArray(d.tasks)) throw new Error('The file has no "tasks" list.');
  }

  // Fill in anything missing so the screens never trip over a half-written file.
  // This only tidies what is shown. It does not save anything.
  function normalise(d) {
    d.settings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
    d.tasks = d.tasks.filter(function (t) { return t && t.id && t.title; });
    d.tasks.forEach(function (t) {
      if (!CAT[t.category]) t.category = "later";
      if (t.status !== "done") t.status = "open";
    });
    if (!d.plan || typeof d.plan !== "object") d.plan = { date: null, preparedAt: null, note: "", items: [] };
    if (!Array.isArray(d.plan.items)) d.plan.items = [];
    d.plan.items = d.plan.items.filter(function (i) { return i && i.taskId; });
    if (!Array.isArray(d.activity)) d.activity = [];
    return d;
  }

  // ============================================================
  // 2. Small questions the screens ask about the data
  // ============================================================

  function todayISO() { return ui.isoDate(); }
  function taskById(d, id) { return d.tasks.find(function (t) { return t.id === id; }); }
  function planIsToday(d) { return d.plan && d.plan.date === todayISO(); }
  function claudeHasPlanned(d) { return planIsToday(d) && !!d.plan.preparedAt; }

  // Claude's suggestions still waiting for a yes or no
  function proposals(d) {
    if (!claudeHasPlanned(d)) return [];
    return d.plan.items.filter(function (i) { return i.status === "proposed" && taskById(d, i.taskId); });
  }
  // What is on today's list (approved by the person)
  function approvedToday(d) {
    if (!planIsToday(d)) return [];
    return d.plan.items.filter(function (i) { return i.status === "approved" && taskById(d, i.taskId); });
  }
  // Open tasks that are not on today's plan in any form
  function everythingElse(d) {
    const onPlan = new Set(planIsToday(d) ? d.plan.items.filter(function (i) { return i.status !== "skipped"; }).map(function (i) { return i.taskId; }) : []);
    return d.tasks.filter(function (t) { return t.status === "open" && !onPlan.has(t.id); });
  }
  function waitingList(d) {
    return d.tasks.filter(function (t) { return t.status === "open" && t.category === "waiting"; });
  }
  function doneToday(d) {
    const today = todayISO();
    return d.tasks.filter(function (t) { return t.status === "done" && t.doneAt && ui.isoDate(new Date(t.doneAt)) === today; });
  }

  // Time saved: an estimate from the activity log (tasks done and plans approved)
  function timeSaved(d, fromDate, toDate) {
    let minutes = 0, tasksDone = 0, plans = 0;
    d.activity.forEach(function (a) {
      const when = new Date(a.at);
      if (isNaN(when) || when < fromDate || (toDate && when >= toDate)) return;
      if (a.type === "task-done") { tasksDone++; minutes += num(a.minutes, d.settings.minutesSavedPerTask); }
      if (a.type === "plan-approved") { plans++; minutes += num(a.minutes, d.settings.minutesSavedPerPlan); }
    });
    return { minutes: minutes, tasksDone: tasksDone, plans: plans };
  }
  function num(v, fallback) { return typeof v === "number" && isFinite(v) ? v : Number(fallback) || 0; }

  // ============================================================
  // 3. The store: connects the app to data/tasks.json
  // ============================================================

  const store = window.Toolkit.createStore({
    moduleId: MODULE_ID,
    fileName: DATA_FILE,
    makeDemoData: window.makeTaskDemoData,
    validate: validate,
    onStatus: function (s, detail) {
      const previous = status;
      status = s;
      statusDetail = detail || {};
      renderChrome();
      // Only redraw the whole screen when we move between screens
      const needsScreen = !(data && (s === "ready" || s === "demo" || s === "error"));
      if (needsScreen || previous !== s) render();
    },
    onData: function (d, reason) {
      data = normalise(d);
      if (reason === "load" || reason === "demo") { layoutBuilt = false; seen.clear(); }
      render();
      if (reason === "external") ui.toast("Claude updated your list", { icon: "sparkle" });
    }
  });

  // Every change goes through here. If saving fails, the store shows the problem
  // and we put the screen back to what is really in the file.
  function change(fn) {
    return store.update(function (d) { normalise(d); fn(d); }).catch(function (err) {
      ui.toast(friendlyError(err).short, { icon: "alert", duration: 6000 });
      render();
      err.shownToPerson = true;
      throw err; // still rejected, so follow-up steps (like "Saved" messages) do not run
    });
  }
  // A failed save has already been explained on screen, so it is not an unexpected error
  window.addEventListener("unhandledrejection", function (e) {
    if (e.reason && e.reason.shownToPerson) e.preventDefault();
  });

  // ============================================================
  // 4. Drawing the screens
  // ============================================================

  function render() {
    if ((status === "demo" || status === "ready" || status === "error") && data) return renderDay();
    layoutBuilt = false;
    if (status === "checking" || status === "demo" || status === "ready") return renderLoading();
    if (status === "unsupported") return renderUnsupported();
    if (status === "needs-connect") return renderConnect();
    if (status === "needs-permission") return renderReconnect();
    if (status === "error") return renderProblem(statusDetail.error);
  }

  // Top bar, demo banner and problem banner
  function renderChrome() {
    demoToggle.checked = status === "demo";
    settingsBtn.hidden = !(status === "ready" || status === "demo");

    if (status === "ready") {
      saveStatus.hidden = false;
      saveStatus.className = "pill pill--success save-status";
      const justSaved = statusDetail.savedAt && (Date.now() - statusDetail.savedAt < 4000);
      saveStatus.innerHTML = '<span class="pill__dot"></span><span class="save-status__text">' + (justSaved ? "Saved just now" : "Saved to your folder") + "</span>";
      saveStatus.title = "Connected to the folder " + (statusDetail.folderName || "");
      if (justSaved) setTimeout(function () { if (status === "ready") renderChrome(); }, 4200);
    } else if (status === "error" && data) {
      saveStatus.hidden = false;
      saveStatus.className = "pill pill--danger save-status";
      saveStatus.innerHTML = '<span class="pill__dot"></span><span class="save-status__text">Not saved</span>';
    } else {
      saveStatus.hidden = true;
    }

    if (status === "demo") {
      bannerEl.innerHTML =
        '<div class="banner"><span class="sticker">Demo</span><span><strong>Demo mode.</strong> This is sample data for a made-up business. Nothing you do here is saved.</span>' +
        '<button type="button" class="btn btn--small" data-action="demo-off">Turn off demo</button></div>';
    } else if (status === "error" && data) {
      const f = friendlyError(statusDetail.error);
      bannerEl.innerHTML =
        '<div class="banner banner--problem">' + icon("alert", "banner__icon") + "<span><strong>" + esc(f.title) + "</strong> " + esc(f.body) + "</span>" +
        '<button type="button" class="btn btn--small" data-action="retry">' + icon("refresh") + "Try again</button></div>";
    } else {
      bannerEl.innerHTML = "";
    }
  }

  function art(name, alt) {
    return '<div class="state__art"><img src="' + ART[name] + '" alt="' + esc(alt || "") + '" width="220" height="220"></div>';
  }

  function renderLoading() {
    screenEl.innerHTML =
      '<div class="loading" aria-busy="true" aria-label="Opening your task list">' +
      '<div class="skeleton" style="height:18px;width:180px"></div>' +
      '<div class="skeleton" style="height:44px;width:min(520px,90%);margin-top:14px"></div>' +
      '<div class="loading__grid"><div class="skeleton" style="height:320px"></div><div class="skeleton" style="height:220px"></div></div>' +
      "</div>";
  }

  // First visit: connect the folder
  function renderConnect(message) {
    screenEl.innerHTML =
      '<section class="welcome card card--raised">' +
      '<div class="welcome__art"><img src="' + ART.welcome + '" alt="The Claude character waving hello" width="440" height="440"></div>' +
      '<div class="welcome__body">' +
      '<span class="eyebrow eyebrow--accent">Set up / about 1 minute</span>' +
      '<h1>Connect your <span class="accent">task list.</span></h1>' +
      "<p>Your tasks live in a file on your own computer, in the same folder Claude works from. Connect it once and everything you approve here is saved straight into it.</p>" +
      '<ol class="steps">' +
      "<li><span>Click <strong>Connect your task list</strong>.</span></li>" +
      "<li><span>Choose the folder called <strong>" + esc(MODULE_ID) + "</strong>. It's the folder this page is in.</span></li>" +
      "<li><span>When Chrome asks to let the page edit files, click <strong>Allow</strong>.</span></li>" +
      "</ol>" +
      (message ? '<p class="inline-error" role="alert">' + icon("alert") + esc(message) + "</p>" : "") +
      '<div class="welcome__actions">' +
      '<button type="button" class="btn btn--primary btn--large" data-action="connect">' + icon("folder") + "Connect your task list</button>" +
      '<button type="button" class="btn btn--ghost" data-action="demo-on">Look around with sample data first</button>' +
      "</div>" +
      '<p class="welcome__small">Your tasks never leave your computer. There is no account and nothing to install.</p>' +
      "</div></section>";
  }

  // Returning visit where Chrome wants a click before opening the folder again
  function renderReconnect() {
    const name = statusDetail.folderName || MODULE_ID;
    screenEl.innerHTML =
      '<section class="card card--raised state-card">' +
      '<div class="state">' + art("welcome", "The Claude character waving hello") +
      '<div class="state__body"><span class="eyebrow">Welcome back</span>' +
      "<h1>Pick up where you <span class=\"accent\">left off.</span></h1>" +
      "<p>Chrome asks for one click each visit before this page can open your files. It's there to keep your computer safe.</p>" +
      '<div class="welcome__actions"><button type="button" class="btn btn--primary btn--large" data-action="reconnect">' + icon("folder") + "Open my task list</button>" +
      '<button type="button" class="btn btn--ghost" data-action="change-folder">Use a different folder</button></div>' +
      '<p class="welcome__small">Folder: ' + esc(name) + "</p>" +
      "</div></div></section>";
  }

  function renderUnsupported() {
    screenEl.innerHTML =
      '<section class="card card--raised state-card">' +
      '<div class="state">' + art("shrug", "The Claude character shrugging") +
      '<div class="state__body"><span class="eyebrow">One small thing</span>' +
      "<h1>This works in Chrome or <span class=\"accent\">Microsoft Edge.</span></h1>" +
      "<p>This browser can't save changes to files on your computer yet. Open this same file in Google Chrome or Microsoft Edge and it will work. Both are free.</p>" +
      '<div class="welcome__actions"><button type="button" class="btn btn--primary" data-action="demo-on">Look around with sample data</button></div>' +
      "</div></div></section>";
  }

  function renderProblem(err) {
    const f = friendlyError(err);
    screenEl.innerHTML =
      '<section class="card card--raised state-card">' +
      '<div class="state">' + art("shrug", "The Claude character shrugging") +
      '<div class="state__body"><span class="eyebrow">Something needs a look</span>' +
      "<h1>" + esc(f.title) + "</h1><p>" + esc(f.body) + "</p>" +
      (f.say ? sayChip(f.say) : "") +
      '<div class="welcome__actions"><button type="button" class="btn btn--primary" data-action="retry">' + icon("refresh") + "Try again</button>" +
      '<button type="button" class="btn btn--ghost" data-action="change-folder">Choose the folder again</button></div>' +
      "</div></div></section>";
  }

  // Turn technical problems into plain English, with something the customer can say to Claude
  function friendlyError(err) {
    const kind = err && err.kind;
    if (kind === "bad-file") return {
      title: "Your task file has a small mistake in it.",
      body: "Nothing new can show or save until it's fixed. Claude can sort it in a few seconds, and the last good version is kept in data/tasks.backup.json.",
      say: "Please check my tasks.json file and fix it",
      short: "Your task file needs a quick fix"
    };
    if (kind === "missing") return {
      title: "Your task file has gone missing.",
      body: "It may have been moved or renamed. Check the data folder still has tasks.json in it, or ask Claude to put it back.",
      say: "My task list file seems to be missing, please check the data folder",
      short: "Your task file can't be found"
    };
    if (kind === "needs-permission") return {
      title: "Chrome needs your permission again.",
      body: "Click Try again and allow access to your folder.",
      short: "Chrome needs your permission again"
    };
    return {
      title: "That change didn't save.",
      body: "Nothing is lost. Check your computer is not short of space and try again.",
      short: "That change didn't save. Please try again"
    };
  }

  function sayChip(text) {
    return '<span class="say">"' + esc(text) + '"<button type="button" class="say__copy" data-action="copy" data-text="' + esc(text) + '">Copy</button></span>';
  }

  // ---------- The main daily view ----------
  function buildDayLayout() {
    screenEl.innerHTML =
      '<section class="hero" id="hero"></section>' +
      '<div class="day-grid">' +
      '<div class="day-main">' +
      '  <section class="panel" id="planPanel" aria-labelledby="planHeading"></section>' +
      '  <section class="panel" aria-labelledby="dayHeading">' +
      '    <div class="panel__head">' +
      '      <div><span class="eyebrow">Your day</span><h2 id="dayHeading" tabindex="-1">Today\'s list.</h2></div>' +
      '      <div id="dayProgress" class="progress"></div>' +
      "    </div>" +
      '    <form class="add-task" id="addForm" autocomplete="off">' +
      '      <label class="sr-only" for="addTitle">New task</label>' +
      '      <input class="input add-task__input" id="addTitle" name="title" maxlength="200" placeholder="Add a task, for example Call the bank about the card machine">' +
      '      <label class="sr-only" for="addCategory">Where it goes</label>' +
      '      <select class="select add-task__select" id="addCategory" name="category">' + categoryOptions("today") + "</select>" +
      '      <button type="submit" class="btn btn--dark add-task__btn">' + icon("plus") + "Add</button>" +
      "    </form>" +
      '    <div id="dayList"></div>' +
      "  </section>" +
      '  <details class="panel backlog" id="backlog"><summary class="backlog__summary" id="backlogSummary"></summary><div id="backlogList"></div></details>' +
      "</div>" +
      '<aside class="day-side" aria-label="This week">' +
      '  <section class="card card--dark saved" id="savedCard"></section>' +
      '  <section class="card side-card" id="waitingCard"></section>' +
      '  <section class="card side-card wrap-up" id="wrapCard"></section>' +
      "</aside>" +
      "</div>";
    layoutBuilt = true;
  }

  function renderDay() {
    const first = !layoutBuilt;
    if (first) buildDayLayout();
    let stagger = 0;
    // Only things that were not on screen before get the gentle entrance animation
    const anim = function (key) {
      if (seen.has(key)) return "";
      seen.add(key);
      return ' enter" style="--i:' + Math.min(stagger++, 10);
    };
    renderHero(anim);
    renderPlan(anim);
    renderDayList(anim);
    renderBacklog(anim);
    renderSaved(anim);
    renderWaiting(anim);
    renderWrap(anim);
  }

  function renderHero(anim) {
    const name = data.settings.yourName;
    const props = proposals(data);
    const approved = approvedToday(data);
    const doneCount = approved.filter(function (i) { const t = taskById(data, i.taskId); return t.status === "done"; }).length;
    let line;
    if (props.length) {
      const mins = Math.max(2, Math.round(props.length * 0.75));
      line = "Claude has sorted your day. " + props.length + (props.length === 1 ? " suggestion" : " suggestions") + " to look over, about " + mins + " minutes.";
    } else if (approved.length) {
      const left = approved.length - doneCount;
      line = left === 0 ? "Everything on today's list is done. Nicely handled." : doneCount + " of " + approved.length + " done. " + left + " to go.";
    } else if (claudeHasPlanned(data)) {
      line = "You've been through Claude's suggestions. Add anything else below.";
    } else {
      line = "Claude hasn't sorted today yet. Ask it to and the plan appears here.";
    }
    $("#hero").innerHTML =
      '<div class="hero__text' + anim("hero") + '">' +
      '<span class="eyebrow">' + esc(ui.longDate()) + (data.settings.businessName ? " / " + esc(data.settings.businessName) : "") + "</span>" +
      "<h1>" + esc(ui.greeting()) + (name ? ', <span class="accent">' + esc(name) + ".</span>" : '<span class="accent">.</span>') + "</h1>" +
      '<p class="hero__line">' + esc(line) + "</p>" +
      "</div>" +
      // The Claude character sits here whenever the plan panel below is not already showing it
      (props.length ? '<div class="hero__art' + anim("hero-art") + '"><img src="' + ART.welcome + '" alt="The Claude character waving" width="220" height="220"></div>' : "");
  }

  function renderPlan(anim) {
    const panel = $("#planPanel");
    const props = proposals(data);

    // No plan yet today
    if (!claudeHasPlanned(data)) {
      panel.innerHTML =
        '<div class="panel__head"><div><span class="eyebrow eyebrow--accent">Claude\'s plan</span><h2 id="planHeading">No plan for today <span class="accent">yet.</span></h2></div></div>' +
        '<div class="state state--inline' + anim("plan-empty") + '">' + art("thinking", "The Claude character thinking") +
        '<div class="state__body"><p>Each morning, ask Claude to sort your day. It reads your list, puts everything in order and suggests a plan. You approve it here, one click per task.</p>' +
        sayChip("Sort my day") + "</div></div>";
      return;
    }

    // Plan exists and every suggestion has been answered
    if (!props.length) {
      const approvedCount = data.plan.items.filter(function (i) { return i.status === "approved"; }).length;
      panel.innerHTML =
        '<div class="panel__head"><div><span class="eyebrow eyebrow--accent">Claude\'s plan</span><h2 id="planHeading">All <span class="accent">reviewed.</span></h2></div></div>' +
        '<div class="state state--inline' + anim("plan-done") + '">' + art("celebrate", "The Claude character celebrating") +
        "<div class=\"state__body\"><p>You've said yes to " + approvedCount + (approvedCount === 1 ? " task" : " tasks") + " and they're on today's list below. If anything changes, ask Claude to take another look.</p>" +
        sayChip("Re-sort my day") + "</div></div>";
      return;
    }

    let html =
      '<div class="panel__head"><div><span class="eyebrow eyebrow--accent">Claude\'s plan / ' + props.length + " to review</span>" +
      '<h2 id="planHeading">Here\'s how Claude would <span class="accent">run today.</span></h2></div>' +
      '<button type="button" class="btn btn--approve" data-action="approve-all">' + icon("check") + "Approve all</button></div>";

    if (data.plan.note) {
      html += '<blockquote class="claude-note' + anim("note-" + data.plan.preparedAt) + '"><span class="eyebrow">Claude\'s read on today</span><p>' + esc(data.plan.note) + "</p></blockquote>";
    }
    html += '<ul class="proposals" role="list">';
    props.forEach(function (item) {
      const t = taskById(data, item.taskId);
      const c = CAT[item.category] || CAT[t.category];
      html +=
        '<li class="proposal-wrap' + anim("p-" + t.id) + '" data-task="' + esc(t.id) + '">' +
        '<article class="proposal" aria-label="' + esc(t.title) + '"><div class="proposal__inner">' +
        '<div class="proposal__top">' + catChip(c) + metaBits(t) + "</div>" +
        '<h3 class="proposal__title">' + esc(t.title) + "</h3>" +
        (item.reason ? '<p class="proposal__reason">' + esc(item.reason) + "</p>" : "") +
        '<div class="proposal__actions">' +
        '<button type="button" class="btn btn--approve btn--small" data-action="approve">' + icon("check") + "<span>Approve</span></button>" +
        '<button type="button" class="btn btn--small" data-action="edit-proposal">' + icon("pencil") + "Edit</button>" +
        '<button type="button" class="btn btn--ghost btn--small" data-action="skip">' + icon("x") + "Skip</button>" +
        "</div></div></article></li>";
    });
    html += "</ul>";
    panel.innerHTML = html;
  }

  function catChip(c) {
    return '<span class="cat-chip cat--' + c.key + '">' + icon(c.icon) + esc(c.label) + "</span>";
  }

  function metaBits(t) {
    const bits = [];
    if (t.due && t.status !== "done") {
      const label = ui.friendlyDue(t.due);
      const overdue = /Overdue|yesterday/.test(label);
      bits.push('<span class="meta' + (overdue ? " meta--overdue" : "") + '">' + icon("clock") + esc(label) + "</span>");
    }
    if (t.category === "waiting" && t.waitingOn) bits.push('<span class="meta">' + icon("hourglass") + "Waiting on " + esc(t.waitingOn) + "</span>");
    if (t.category === "delegate" && t.delegateTo) bits.push('<span class="meta">' + icon("users") + "For " + esc(t.delegateTo) + "</span>");
    return bits.join("");
  }

  function renderDayList(anim) {
    const items = approvedToday(data);
    const list = $("#dayList");
    const doneCount = items.filter(function (i) { return taskById(data, i.taskId).status === "done"; }).length;

    const progress = $("#dayProgress");
    if (items.length) {
      const pct = Math.round((doneCount / items.length) * 100);
      progress.innerHTML =
        '<span class="progress__label"><strong>' + doneCount + "</strong> of " + items.length + " done</span>" +
        '<span class="progress__bar" role="progressbar" aria-label="Today\'s progress" aria-valuemin="0" aria-valuemax="' + items.length + '" aria-valuenow="' + doneCount + '"><span style="width:' + pct + '%"></span></span>';
    } else {
      progress.innerHTML = "";
    }

    if (!items.length) {
      list.innerHTML =
        '<div class="empty-line' + anim("day-empty") + '">' + icon("sun") +
        "<p>Nothing on today's list yet. Approve Claude's suggestions above, or add your own task.</p></div>";
      return;
    }

    let html = "";
    CATEGORIES.forEach(function (c) {
      const group = items.filter(function (i) { return (i.category || taskById(data, i.taskId).category) === c.key; });
      if (!group.length) return;
      // Unfinished first, done at the bottom of each group
      group.sort(function (a, b) {
        return (taskById(data, a.taskId).status === "done") - (taskById(data, b.taskId).status === "done");
      });
      html += '<div class="group group--' + c.key + '"><h3 class="group__head"><span class="group__dot"></span>' + esc(c.label) +
        '<span class="group__count">' + group.length + "</span></h3><ul class=\"tasks\" role=\"list\">";
      group.forEach(function (i) { html += taskRow(taskById(data, i.taskId), anim, { inToday: true }); });
      html += "</ul></div>";
    });
    list.innerHTML = html;
  }

  function taskRow(t, anim, opts) {
    const done = t.status === "done";
    return '<li class="task' + (done ? " is-done" : "") + anim("t-" + t.id + (opts.inToday ? "-today" : "-other")) + '" data-task="' + esc(t.id) + '">' +
      '<button type="button" class="check" role="checkbox" aria-checked="' + done + '" data-action="toggle-done" aria-label="' + (done ? "Mark as not done: " : "Mark as done: ") + esc(t.title) + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>' +
      '<div class="task__body"><span class="task__title">' + esc(t.title) + "</span>" +
      (t.notes || metaBits(t) || opts.showCategory ? '<span class="task__meta">' + (opts.showCategory ? catChip(CAT[t.category]) : "") + metaBits(t) + (t.notes ? '<span class="task__notes">' + esc(t.notes) + "</span>" : "") + "</span>" : "") +
      "</div>" +
      (opts.showAddToday ? '<button type="button" class="btn btn--small task__add" data-action="add-today">' + icon("plus") + "Today</button>" : "") +
      '<button type="button" class="icon-btn task__edit" data-action="edit" aria-label="Edit ' + esc(t.title) + '">' + icon("pencil") + "</button>" +
      "</li>";
  }

  function renderBacklog(anim) {
    const rest = everythingElse(data);
    $("#backlogSummary").innerHTML =
      '<span><span class="eyebrow">Everything else</span><span class="backlog__title">The rest of your list <span class="group__count">' + rest.length + "</span></span></span>" +
      '<span class="backlog__chev" aria-hidden="true">' + icon("arrowRight") + "</span>";
    $("#backlogList").innerHTML = rest.length
      ? '<ul class="tasks" role="list">' + rest.map(function (t) { return taskRow(t, anim, { showCategory: true, showAddToday: true }); }).join("") + "</ul>"
      : '<p class="muted backlog__empty">Nothing else on your list. Lovely.</p>';
  }

  function renderSaved(anim) {
    const weekStart = ui.startOfWeek();
    const week = timeSaved(data, weekStart);
    // One bar per day, Monday to Sunday
    let max = 1;
    const days = [];
    for (let i = 0; i < 7; i++) {
      const from = ui.addDays(weekStart, i), to = ui.addDays(weekStart, i + 1);
      const m = timeSaved(data, from, to).minutes;
      max = Math.max(max, m);
      days.push({ label: from.toLocaleDateString("en-GB", { weekday: "narrow" }), minutes: m, today: ui.isoDate(from) === todayISO(), future: from > new Date() });
    }
    $("#savedCard").innerHTML =
      '<div class="saved__head"><span class="eyebrow">Time saved this week</span><span class="sticker sticker--small">Estimate</span></div>' +
      '<p class="saved__value' + anim("saved-" + week.minutes) + '">' + esc(ui.minutesLabel(week.minutes)) + "</p>" +
      '<div class="bars" aria-hidden="true">' + days.map(function (d) {
        const h = d.minutes ? Math.max(8, Math.round((d.minutes / max) * 100)) : 4;
        return '<span class="bar' + (d.today ? " is-today" : "") + (d.future ? " is-future" : "") + '"><span style="height:' + h + '%"></span><em>' + d.label + "</em></span>";
      }).join("") + "</div>" +
      '<p class="saved__how">Based on ' + week.tasksDone + (week.tasksDone === 1 ? " task" : " tasks") + " done and " + week.plans + (week.plans === 1 ? " plan" : " plans") +
      " approved, at about " + data.settings.minutesSavedPerTask + " and " + data.settings.minutesSavedPerPlan + " minutes each. A rough guide, not a stopwatch.</p>";
  }

  function renderWaiting(anim) {
    const list = waitingList(data);
    let html = '<div class="side-card__head"><span class="eyebrow">Waiting on</span><span class="group__count">' + list.length + "</span></div>";
    if (!list.length) {
      html += '<p class="muted side-card__empty">Nobody owes you anything right now.</p>';
    } else {
      html += '<ul class="waiting" role="list">' + list.map(function (t) {
        const since = t.waitingSince ? ui.parseDate(t.waitingSince) : null;
        const days = since ? Math.round((ui.parseDate(todayISO()) - since) / 86400000) : null;
        return '<li class="waiting__item' + anim("w-" + t.id) + '" data-task="' + esc(t.id) + '">' +
          '<button type="button" class="check check--small" role="checkbox" aria-checked="false" data-action="toggle-done" aria-label="Arrived: ' + esc(t.title) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>' +
          '<div><span class="waiting__title">' + esc(t.title) + "</span>" +
          '<span class="waiting__who">' + esc(t.waitingOn || "Someone") + (days != null && days > 0 ? " / " + days + (days === 1 ? " day" : " days") : "") + "</span></div></li>";
      }).join("") + "</ul>";
    }
    $("#waitingCard").innerHTML = html;
  }

  function renderWrap() {
    const h = new Date().getHours();
    $("#wrapCard").innerHTML =
      '<span class="eyebrow">' + (h >= 15 ? "Nearly done for the day" : "End of the day") + "</span>" +
      "<h3>Wrap up the day.</h3>" +
      '<p class="muted">See what got done and what rolls over to tomorrow.</p>' +
      '<button type="button" class="btn" data-action="summary">' + icon("moon") + "See today's summary</button>";
  }

  // ---------- End of day summary ----------
  function openSummary() {
    const done = doneToday(data);
    const open = approvedToday(data).map(function (i) { return taskById(data, i.taskId); }).filter(function (t) { return t.status === "open"; });
    const waiting = waitingList(data);
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const saved = timeSaved(data, start);
    const name = data.settings.yourName;
    const title = done.length >= 3 ? "Good day's work" : done.length ? "Steady progress today" : "A quiet one today";

    $("#summaryContent").innerHTML =
      '<div class="summary__hero"><div class="summary__art"><img src="' + (done.length ? ART.trophy : ART.thinking) + '" alt="" width="220" height="220"></div>' +
      '<div><span class="eyebrow">' + esc(ui.longDate()) + "</span><h2 id=\"summaryTitle\">" + esc(title) + (name ? ', <span class="accent">' + esc(name) + ".</span>" : ".") + "</h2></div>" +
      '<button type="button" class="icon-btn summary__close" data-close aria-label="Close">' + icon("x") + "</button></div>" +
      '<div class="modal__body">' +
      '<div class="stats">' +
      stat(done.length, "done") + stat(open.length, "still open") + stat(waiting.length, "waiting on others") + stat(ui.minutesLabel(saved.minutes), "saved today (estimate)") +
      "</div>" +
      summaryList("Done today", done, true) +
      summaryList("Rolls over to tomorrow", open, false) +
      '<div class="summary__next"><p>Tomorrow morning, say this to Claude and it will carry the unfinished ones over:</p>' + sayChip("Sort my day") + "</div>" +
      "</div>" +
      '<div class="modal__foot"><button type="button" class="btn btn--primary" data-close>Close</button></div>';
    $("#summaryDialog").showModal();
  }
  function stat(value, label) {
    return '<div class="stat"><span class="stat__value">' + esc(value) + '</span><span class="stat__label">' + esc(label) + "</span></div>";
  }
  function summaryList(title, tasks, isDone) {
    if (!tasks.length) return "";
    return '<div class="summary__list"><span class="eyebrow">' + esc(title) + '</span><ul role="list">' +
      tasks.map(function (t) { return "<li>" + icon(isDone ? "check" : "arrowRight", isDone ? "is-done" : "") + esc(t.title) + "</li>"; }).join("") +
      "</ul></div>";
  }

  function categoryOptions(selected) {
    return CATEGORIES.map(function (c) {
      return '<option value="' + c.key + '"' + (c.key === selected ? " selected" : "") + ">" + esc(c.label) + "</option>";
    }).join("");
  }

  // ============================================================
  // 5. Actions: what each button does
  // ============================================================

  // Make sure today's plan exists before adding to it (used when the person adds a task themselves)
  function ensureTodayPlan(d) {
    if (!planIsToday(d)) d.plan = { date: todayISO(), preparedAt: null, note: "", items: [] };
  }
  function nowISO() { return new Date().toISOString(); }

  // When the last suggestion is answered, log that the plan was approved (counts towards time saved)
  function logPlanApproved(d) {
    if (!claudeHasPlanned(d)) return;
    const pending = d.plan.items.some(function (i) { return i.status === "proposed"; });
    const anyApproved = d.plan.items.some(function (i) { return i.status === "approved"; });
    const already = d.activity.some(function (a) { return a.type === "plan-approved" && a.planDate === d.plan.date; });
    if (!pending && anyApproved && !already) {
      d.activity.push({ at: nowISO(), type: "plan-approved", planDate: d.plan.date, minutes: num(d.settings.minutesSavedPerPlan, 20) });
    }
  }
  function trimActivity(d) { if (d.activity.length > 1000) d.activity = d.activity.slice(-1000); }

  function setProposal(taskId, newStatus, edits) {
    return change(function (d) {
      const item = d.plan.items.find(function (i) { return i.taskId === taskId; });
      const t = taskById(d, taskId);
      if (!item || !t) return;
      if (edits) applyEdits(t, edits, item);
      item.status = newStatus;
      if (newStatus === "approved") { t.category = item.category || t.category; item.approvedAt = nowISO(); }
      logPlanApproved(d);
    });
  }

  function applyEdits(t, edits, planItem) {
    t.title = edits.title;
    t.notes = edits.notes;
    t.category = edits.category;
    t.due = edits.due || null;
    t.waitingOn = edits.waitingOn || "";
    t.delegateTo = edits.delegateTo || "";
    if (t.category === "waiting" && !t.waitingSince) t.waitingSince = todayISO();
    if (planItem) planItem.category = edits.category;
  }

  // Approve with a small, satisfying moment: the button ticks, the card settles, then it slides away
  function approve(taskId, button) {
    const wrap = button.closest(".proposal-wrap");
    const nextFocusIndex = Array.prototype.indexOf.call(document.querySelectorAll(".proposal-wrap"), wrap);
    button.disabled = true;
    button.innerHTML = icon("check") + "<span>Approved</span>";
    wrap.classList.add("is-approved");
    const delay = ui.prefersReducedMotion() ? 0 : 520;
    setTimeout(function () { wrap.classList.add("is-leaving"); }, delay * 0.55);
    setTimeout(function () {
      setProposal(taskId, "approved").then(function () {
        focusNextProposal(nextFocusIndex);
        ui.toast("Added to today's list", { actionLabel: "Undo", onAction: function () { setProposal(taskId, "proposed"); } });
      });
    }, delay);
  }

  function skip(taskId, button) {
    const wrap = button.closest(".proposal-wrap");
    const index = Array.prototype.indexOf.call(document.querySelectorAll(".proposal-wrap"), wrap);
    wrap.classList.add("is-leaving", "is-skipped");
    setTimeout(function () {
      setProposal(taskId, "skipped").then(function () {
        focusNextProposal(index);
        ui.toast("Skipped. It stays on your list for another day", { icon: "info", actionLabel: "Undo", onAction: function () { setProposal(taskId, "proposed"); } });
      });
    }, ui.prefersReducedMotion() ? 0 : 300);
  }

  function approveAll() {
    const ids = proposals(data).map(function (i) { return i.taskId; });
    if (!ids.length) return;
    document.querySelectorAll(".proposal-wrap").forEach(function (w, n) {
      setTimeout(function () { w.classList.add("is-approved"); }, n * 60);
    });
    setTimeout(function () {
      change(function (d) {
        d.plan.items.forEach(function (i) {
          if (i.status === "proposed") {
            i.status = "approved"; i.approvedAt = nowISO();
            const t = taskById(d, i.taskId); if (t) t.category = i.category || t.category;
          }
        });
        logPlanApproved(d);
      }).then(function () {
        const h = $("#dayHeading"); if (h) h.focus({ preventScroll: true });
        ui.toast("Plan approved. " + ids.length + (ids.length === 1 ? " task" : " tasks") + " added to today", {
          actionLabel: "Undo",
          onAction: function () {
            change(function (d) {
              d.plan.items.forEach(function (i) { if (ids.indexOf(i.taskId) > -1) i.status = "proposed"; });
              d.activity = d.activity.filter(function (a) { return !(a.type === "plan-approved" && a.planDate === d.plan.date); });
            });
          }
        });
      });
    }, ui.prefersReducedMotion() ? 0 : 420 + ids.length * 60);
  }

  function focusNextProposal(index) {
    const buttons = document.querySelectorAll('.proposal [data-action="approve"]');
    const target = buttons[Math.min(index, buttons.length - 1)] || $("#dayHeading");
    if (target) target.focus({ preventScroll: true });
  }

  function toggleDone(taskId, button) {
    const t = taskById(data, taskId);
    if (!t) return;
    const nowDone = t.status !== "done";
    // Show it straight away; the save happens in the background
    const row = button.closest(".task, .waiting__item");
    button.setAttribute("aria-checked", String(nowDone));
    if (row) row.classList.toggle("is-done", nowDone);
    if (nowDone) button.classList.add("is-popping");
    const wait = ui.prefersReducedMotion() ? 0 : (row && row.classList.contains("waiting__item") ? 450 : 260);
    setTimeout(function () {
      change(function (d) {
        const task = taskById(d, taskId);
        if (!task) return;
        if (nowDone) {
          task.status = "done"; task.doneAt = nowISO();
          d.activity.push({ at: task.doneAt, type: "task-done", taskId: taskId, minutes: num(task.minutesSaved, d.settings.minutesSavedPerTask) });
          trimActivity(d);
        } else {
          task.status = "open"; task.doneAt = null;
          // Remove the most recent "done" entry for this task so the estimate stays honest
          for (let i = d.activity.length - 1; i >= 0; i--) {
            if (d.activity[i].type === "task-done" && d.activity[i].taskId === taskId) { d.activity.splice(i, 1); break; }
          }
        }
      }).then(function () {
        if (nowDone && allTodayDone()) ui.toast("That's everything on today's list. Nice work", { icon: "sparkle" });
      });
    }, wait);
  }
  function allTodayDone() {
    const items = approvedToday(data);
    return items.length > 0 && items.every(function (i) { return taskById(data, i.taskId).status === "done"; });
  }

  function addTask(title, category) {
    const id = ui.makeId("t");
    return change(function (d) {
      d.tasks.push({
        id: id, title: title, notes: "", category: category, status: "open", due: null,
        waitingOn: "", delegateTo: "", waitingSince: category === "waiting" ? todayISO() : null,
        addedBy: "you", created: nowISO(), doneAt: null
      });
      ensureTodayPlan(d);
      d.plan.items.push({ taskId: id, category: category, reason: "", status: "approved", addedBy: "you", approvedAt: nowISO() });
      d.activity.push({ at: nowISO(), type: "task-added", taskId: id, minutes: 0 });
      trimActivity(d);
    });
  }

  function addToToday(taskId) {
    return change(function (d) {
      const t = taskById(d, taskId);
      if (!t) return;
      ensureTodayPlan(d);
      if (t.category === "later") t.category = "today";
      const existing = d.plan.items.find(function (i) { return i.taskId === taskId; });
      if (existing) { existing.status = "approved"; existing.category = t.category; }
      else d.plan.items.push({ taskId: taskId, category: t.category, reason: "", status: "approved", addedBy: "you", approvedAt: nowISO() });
    }).then(function () { ui.toast("Moved to today's list"); });
  }

  function deleteTask(taskId) {
    let removed = null, removedItems = [];
    return change(function (d) {
      const idx = d.tasks.findIndex(function (t) { return t.id === taskId; });
      if (idx < 0) return;
      removed = d.tasks.splice(idx, 1)[0];
      removedItems = d.plan.items.filter(function (i) { return i.taskId === taskId; });
      d.plan.items = d.plan.items.filter(function (i) { return i.taskId !== taskId; });
    }).then(function () {
      if (!removed) return;
      ui.toast("Task deleted", {
        icon: "trash", actionLabel: "Undo",
        onAction: function () {
          change(function (d) {
            d.tasks.push(removed);
            if (planIsToday(d)) removedItems.forEach(function (i) { d.plan.items.push(i); });
          });
        }
      });
    });
  }

  // ---------- Edit pop-up ----------
  const editDialog = $("#editDialog");
  const editForm = $("#editForm");
  let editing = null; // { taskId, fromProposal }

  function openEdit(taskId, fromProposal) {
    const t = taskById(data, taskId);
    if (!t) return;
    const item = fromProposal ? data.plan.items.find(function (i) { return i.taskId === taskId; }) : null;
    editing = { taskId: taskId, fromProposal: !!fromProposal };
    editForm.title.value = t.title;
    editForm.notes.value = t.notes || "";
    editForm.category.innerHTML = categoryOptions((item && item.category) || t.category);
    editForm.due.value = t.due || "";
    editForm.waitingOn.value = t.waitingOn || "";
    editForm.delegateTo.value = t.delegateTo || "";
    $("#editTitle").textContent = fromProposal ? "Tweak, then approve." : "Edit task.";
    $("#editSaveBtn").textContent = fromProposal ? "Save and approve" : "Save";
    $("#deleteTaskBtn").hidden = !!fromProposal;
    syncEditFields();
    editDialog.showModal();
    editForm.title.focus();
    editForm.title.select();
  }
  function syncEditFields() {
    const cat = editForm.category.value;
    editDialog.querySelectorAll("[data-show-for]").forEach(function (el) { el.hidden = el.getAttribute("data-show-for") !== cat; });
  }
  editForm.category.addEventListener("change", syncEditFields);
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!editing) return;
    const edits = {
      title: editForm.title.value.trim(),
      notes: editForm.notes.value.trim(),
      category: editForm.category.value,
      due: editForm.due.value,
      waitingOn: editForm.waitingOn.value.trim(),
      delegateTo: editForm.delegateTo.value.trim()
    };
    if (!edits.title) { editForm.title.focus(); return; }
    const target = editing;
    editDialog.close();
    if (target.fromProposal) {
      setProposal(target.taskId, "approved", edits).then(function () { ui.toast("Updated and added to today's list"); focusNextProposal(0); });
    } else {
      change(function (d) {
        const t = taskById(d, target.taskId);
        if (!t) return;
        const item = planIsToday(d) ? d.plan.items.find(function (i) { return i.taskId === t.id && i.status === "approved"; }) : null;
        applyEdits(t, edits, item);
      }).then(function () { ui.toast("Saved"); });
    }
  });
  $("#deleteTaskBtn").addEventListener("click", function () {
    if (!editing) return;
    const id = editing.taskId;
    editDialog.close();
    deleteTask(id);
  });

  // ---------- Settings pop-up ----------
  const settingsDialog = $("#settingsDialog");
  const settingsForm = $("#settingsForm");
  settingsBtn.innerHTML = icon("settings");
  settingsBtn.addEventListener("click", function () {
    const s = data.settings;
    settingsForm.yourName.value = s.yourName || "";
    settingsForm.businessName.value = s.businessName || "";
    settingsForm.minutesSavedPerTask.value = s.minutesSavedPerTask;
    settingsForm.minutesSavedPerPlan.value = s.minutesSavedPerPlan;
    $("#settingsFolderName").textContent = store.isDemo() ? "Demo mode (no folder in use)" : store.folderName();
    $("#changeFolderBtn").hidden = store.isDemo();
    settingsDialog.showModal();
  });
  settingsForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const values = {
      yourName: settingsForm.yourName.value.trim(),
      businessName: settingsForm.businessName.value.trim(),
      minutesSavedPerTask: Math.max(0, Number(settingsForm.minutesSavedPerTask.value) || 0),
      minutesSavedPerPlan: Math.max(0, Number(settingsForm.minutesSavedPerPlan.value) || 0)
    };
    settingsDialog.close();
    change(function (d) { Object.assign(d.settings, values); }).then(function () { ui.toast("Settings saved"); });
  });
  $("#changeFolderBtn").addEventListener("click", function () { settingsDialog.close(); store.forget(); });

  // Close buttons inside any pop-up
  document.addEventListener("click", function (e) {
    const closer = e.target.closest("[data-close]");
    if (closer) { const dlg = closer.closest("dialog"); if (dlg) dlg.close(); }
  });
  document.querySelectorAll("dialog [data-close].icon-btn").forEach(function (b) { if (!b.innerHTML.trim()) b.innerHTML = icon("x"); });
  // Clicking the dimmed area outside a pop-up closes it
  document.querySelectorAll("dialog.modal").forEach(function (dlg) {
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  });

  // ---------- Add task form ----------
  document.addEventListener("submit", function (e) {
    if (e.target.id !== "addForm") return;
    e.preventDefault();
    const input = $("#addTitle");
    const title = input.value.trim();
    if (!title) { input.focus(); return; }
    const category = $("#addCategory").value;
    input.value = "";
    addTask(title, category).then(function () { ui.toast("Added to today's list"); input.focus(); }).catch(function () { input.value = title; });
  });

  // ---------- Demo switch ----------
  demoToggle.addEventListener("change", function () {
    data = null;
    store.setDemo(demoToggle.checked);
  });

  // ---------- One listener for every button with data-action ----------
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const holder = btn.closest("[data-task]");
    const taskId = holder && holder.getAttribute("data-task");

    switch (action) {
      case "connect":
        store.connect().catch(function (err) {
          if (err && err.kind === "wrong-folder") return renderConnect("That folder doesn't have your task list in it. Please choose the folder called " + MODULE_ID + ".");
          renderConnect("That didn't work. Please try again, and click Allow when Chrome asks.");
        });
        break;
      case "reconnect":
        store.reconnect().catch(function () { renderReconnect(); });
        break;
      case "change-folder": store.forget(); break;
      case "retry": store.retry(); break;
      case "demo-on": data = null; store.setDemo(true); break;
      case "demo-off": data = null; store.setDemo(false); break;
      case "approve": approve(taskId, btn); break;
      case "approve-all": approveAll(); break;
      case "skip": skip(taskId, btn); break;
      case "edit-proposal": openEdit(taskId, true); break;
      case "edit": openEdit(taskId, false); break;
      case "toggle-done": toggleDone(taskId, btn); break;
      case "add-today": addToToday(taskId); break;
      case "summary": openSummary(); break;
      case "copy":
        ui.copyText(btn.getAttribute("data-text")).then(function (ok) {
          ui.toast(ok ? "Copied. Paste it to Claude" : "Couldn't copy. Type it to Claude instead", { icon: ok ? "check" : "info" });
        });
        break;
    }
  });

  // Start
  render();
  store.start();
})();

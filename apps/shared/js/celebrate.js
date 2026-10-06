/*
  CELEBRATE: a short clay Claude clip when something is ticked off
  ----------------------------------------------------------------
  Shared by every tool. Whenever a page sends the "tlos:task-done" event, one of the clips in
  images/celebrate/ pops up in the bottom corner, plays once (about 3 seconds) and fades away on
  its own. It never blocks the page: it can't be focused and a click just hides it early.
  The 2 clips take turns. Off for anyone whose computer asks for less motion, and the person can
  switch it off in Settings (remembered in this browser).
*/
(function () {
  "use strict";

  const KEY = "tlos-celebrate";
  const CLIPS = ["celebrate-thumbs-up.webp", "celebrate-desk.webp"];
  const SHOW_MS = 3200;
  let next = 0;
  let hideTimer = null;
  let count = 0;

  // The clips live in shared/images/celebrate, found from this script's own address
  const script = document.currentScript;
  const base = script ? script.src.replace(/js\/celebrate\.js.*$/, "images/celebrate/") : "../shared/images/celebrate/";

  function isOn() {
    try { return localStorage.getItem(KEY) !== "off"; } catch (e) { return true; }
  }
  function setOn(on) {
    try { on ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, "off"); } catch (e) { /* not remembered, fine */ }
  }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function holder() {
    let el = document.querySelector(".celebrate");
    if (!el) {
      el = document.createElement("div");
      el.className = "celebrate";
      el.setAttribute("aria-hidden", "true");
      el.addEventListener("click", hide);
      document.body.appendChild(el);
    }
    return el;
  }
  function hide() {
    const el = document.querySelector(".celebrate");
    if (!el) return;
    clearTimeout(hideTimer);
    el.classList.remove("is-showing");
  }

  function play() {
    if (!isOn() || reducedMotion()) return;
    const el = holder();
    const img = new Image();
    img.alt = "";
    img.decoding = "async";
    // A fresh address each time, so the clip starts from the beginning
    img.src = base + CLIPS[next] + "?play=" + (++count);
    next = (next + 1) % CLIPS.length;
    img.onload = function () {
      el.replaceChildren(img);
      el.classList.remove("is-showing");
      void el.offsetWidth; // restart the pop-in
      el.classList.add("is-showing");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, SHOW_MS);
    };
  }

  document.addEventListener("tlos:task-done", play);

  window.TaskListOS = window.TaskListOS || {};
  window.TaskListOS.celebrate = { play: play, isOn: isOn, setOn: setOn };
})();

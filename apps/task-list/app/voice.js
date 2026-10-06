/*
  VOICE NOTE: talk, and it becomes a brain dump
  ---------------------------------------------
  Press "Voice note" (or V) and talk. Your words appear as you speak. Press Done and the whole
  note goes into your brain dump, where Claude turns it into tasks, times, guides and drafts.

  The speech-to-text is done by your browser's built-in speech recognition (Chrome uses Google's
  speech service, Edge uses Microsoft's, Safari uses Apple's). Nothing is recorded or kept as audio:
  only the text is saved. Firefox doesn't support this, so the button explains that instead.
*/
(function () {
  "use strict";

  const ui = window.Toolkit.ui, esc = ui.esc, icon = ui.icon;
  // Looked up each time, so it's always the browser's current speech feature
  function recognition() { return window.SpeechRecognition || window.webkitSpeechRecognition; }
  function supported() { return typeof recognition() === "function"; }

  // Opens the recorder. onDone(text) is called with the finished note.
  function open(onDone) {
    const dlg = document.createElement("dialog");
    dlg.className = "modal modal--voice";
    dlg.setAttribute("aria-labelledby", "voiceTitle");
    document.body.appendChild(dlg);

    if (!supported()) {
      dlg.innerHTML = '<div class="modal__head"><h2 id="voiceTitle">Voice notes need Chrome, Edge or Safari</h2><button type="button" class="icon-btn" data-close aria-label="Close">' + icon("x") + "</button></div>" +
        '<div class="modal__body"><p>This browser can’t turn speech into text. Open your task list in Google Chrome, Microsoft Edge or Safari to use voice notes, or type into Brain dump instead.</p></div>' +
        '<div class="modal__foot"><a class="btn" href="#dump" data-close>Go to Brain dump</a><button type="button" class="btn btn--primary" data-close>OK</button></div>';
      dlg.addEventListener("close", function () { dlg.remove(); });
      dlg.showModal();
      return;
    }

    dlg.innerHTML =
      '<div class="voice">' +
      '<button type="button" class="voice__close icon-btn" data-voice="cancel" aria-label="Cancel">' + icon("x") + "</button>" +
      '<h2 id="voiceTitle" class="sr-only">Voice note</h2>' +
      '<div class="voice__mic is-live" aria-hidden="true">' + icon("mic") + "</div>" +
      '<p class="voice__status" role="status">Listening… <span class="voice__time num">0:00</span></p>' +
      '<div class="voice__text" aria-live="polite"><span class="voice__final"></span><span class="voice__interim"></span>' +
      '<span class="voice__hint">Talk naturally. Everything on your mind: things to do, people to email, ideas, worries. Claude sorts it into tasks.</span></div>' +
      '<div class="voice__actions"><button type="button" class="btn btn--lg" data-voice="cancel">Cancel</button>' +
      '<button type="button" class="btn btn--primary btn--lg" data-voice="done">' + icon("check") + "Done</button></div>" +
      '<p class="voice__small">Your browser turns your speech into text (Chrome uses Google’s speech service). Only the text is saved.</p>' +
      "</div>";

    const finalEl = dlg.querySelector(".voice__final");
    const interimEl = dlg.querySelector(".voice__interim");
    const hintEl = dlg.querySelector(".voice__hint");
    const statusEl = dlg.querySelector(".voice__status");
    const micEl = dlg.querySelector(".voice__mic");
    const timeEl = dlg.querySelector(".voice__time");

    let finalText = "";
    let listening = true;   // false once Done or Cancel is pressed
    let failed = false;
    const started = Date.now();
    const clock = setInterval(function () {
      const s = Math.floor((Date.now() - started) / 1000);
      timeEl.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }, 500);

    const Recognition = recognition();
    const rec = new Recognition();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = function (e) {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += (finalText && !/\s$/.test(finalText) ? " " : "") + piece.trim();
        else interim += piece;
      }
      finalEl.textContent = finalText;
      interimEl.textContent = interim ? " " + interim : "";
      hintEl.hidden = !!(finalText || interim);
      const box = dlg.querySelector(".voice__text");
      box.scrollTop = box.scrollHeight;
    };
    rec.onerror = function (e) {
      if (e.error === "no-speech" || e.error === "aborted") return; // keep going
      failed = true;
      micEl.classList.remove("is-live");
      const messages = {
        "not-allowed": "Your microphone is blocked for this page. Click the microphone or lock icon in the address bar, allow the microphone, then try again.",
        "service-not-allowed": "Your microphone is blocked for this page. Click the microphone or lock icon in the address bar, allow the microphone, then try again.",
        "audio-capture": "No microphone was found. Check one is connected, then try again.",
        "network": "Your browser couldn’t reach its speech service. Check your internet connection, or type into Brain dump instead."
      };
      statusEl.textContent = messages[e.error] || "Something went wrong with the microphone. Please try again.";
      statusEl.classList.add("is-error");
    };
    // Browsers stop listening after a pause; carry on until the person presses Done
    rec.onend = function () {
      if (listening && !failed) { try { rec.start(); } catch (err) { /* already restarting */ } }
    };

    function finish(save) {
      listening = false;
      clearInterval(clock);
      try { rec.stop(); } catch (err) { /* already stopped */ }
      const text = (finalText + " " + interimEl.textContent).replace(/\s+/g, " ").trim();
      dlg.close();
      dlg.remove();
      if (save && text) onDone(text);
      else if (save) ui.toast("Nothing was heard, so nothing was saved", { icon: "info" });
    }
    dlg.addEventListener("click", function (e) {
      const b = e.target.closest("[data-voice]");
      if (b) finish(b.getAttribute("data-voice") === "done");
    });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); finish(false); }); // Esc
    dlg.showModal();
    dlg.querySelector('[data-voice="done"]').focus();
    try { rec.start(); } catch (err) { rec.onerror({ error: "audio-capture" }); }
  }

  window.TL = window.TL || {};
  window.TL.voice = { supported: supported, open: open };
})();

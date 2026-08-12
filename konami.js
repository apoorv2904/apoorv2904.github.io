/* ==========================================================================
   Arcade mode, hidden behind the Konami code.

   The page stays entirely professional until someone deliberately goes
   looking. Engineers try this on personal sites; nobody else ever will. So
   the cost to a recruiter skimming on a phone is exactly zero, and the payoff
   for the one person who tries it is the whole point.

   Keyboard: up up down down left right left right B A
   Touch:    five quick taps on the name in the nav bar
   Exit:     Esc, or the same trigger again

   Self-contained — one script tag, no CSS needed in the page.
   ========================================================================== */
(function () {
  "use strict";

  var SEQUENCE = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"
  ];
  var progress = 0;
  var active = false;
  var nodes = [];

  function el(tag, css, text) {
    var n = document.createElement(tag);
    n.style.cssText = css;
    if (text) n.textContent = text;
    return n;
  }

  function toast(message) {
    var t = el("div",
      "position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:200;" +
      "background:#FF3FA4;color:#fff;padding:11px 20px;font:600 12px/1.4 ui-monospace," +
      "Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;" +
      "box-shadow:0 0 26px rgba(255,63,164,.7);border:2px solid #fff;",
      message);
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }

  function enable() {
    if (active) return;
    active = true;
    if (window.Skins) window.Skins.set("arcade");
    toast("Arcade mode — Esc to exit");
  }

  function disable() {
    if (!active) return;
    active = false;
    if (window.Skins) window.Skins.reset();
  }

  function toggle() { active ? disable() : enable(); }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { disable(); return; }

    // Don't swallow keystrokes meant for a form field.
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

    var want = SEQUENCE[progress];
    var got = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (got === want) {
      progress += 1;
      if (progress === SEQUENCE.length) { progress = 0; toggle(); }
    } else {
      // Restart cleanly if the wrong key was itself a valid opening move.
      progress = (got === SEQUENCE[0]) ? 1 : 0;
    }
  });

  // Touch fallback: five quick taps on the nav name.
  var taps = [];
  document.addEventListener("DOMContentLoaded", function () {
    var name = document.querySelector(".nav-name");
    if (!name) return;
    name.addEventListener("click", function (e) {
      var now = Date.now();
      taps.push(now);
      taps = taps.filter(function (t) { return now - t < 1600; });
      if (taps.length >= 5) { taps = []; e.preventDefault(); toggle(); }
    });
  });
})();

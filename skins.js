/* ==========================================================================
   Skin switcher.

   Loaded synchronously from <head>, after style.css, so a saved skin applies
   before first paint — deferring would flash the default design first.

   Placement is chosen by the script tag:
       <script src="skins.js" data-ui="nav"></script>    swatches in the navbar
       <script src="skins.js" data-ui="hero"></script>   a line under the links

   Press "s" to step through skins from the keyboard.
   Adding a skin: append to SKINS. Nothing else needs changing.
   ========================================================================== */
(function () {
  "use strict";

  var UI = ((document.currentScript && document.currentScript.dataset.ui) || "nav")
             .split(",").map(function (x) { return x.trim(); });
  function wants(x) { return UI.indexOf(x) !== -1; }

  /* "once" (default) = keep hinting until the visitor actually uses it,
     capped at 3 visits so it never becomes nagging.
     "always" = every load, for evaluating the effect.  "off" = never. */
  var HINT = (document.currentScript && document.currentScript.dataset.hint) || "once";

  var G = "https://fonts.googleapis.com/css2?";
  var MONO = "family=IBM+Plex+Mono:wght@400;500";
  var MONO_I = "family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400";
  var SANS = "family=IBM+Plex+Sans:wght@400;500;600";
  var SILK = "family=Silkscreen:wght@400;700";

  /* swatch = the skin's true colour, used for the dot.
     tint   = a version that stays legible as text on either background. */
  var SKINS = [
    { id: "zine", label: "Zine", swatch: "#1F4FE0", tint: "#4A6BE8",
      sheets: ["style-zine.css"],
      font: null },
    { id: "terminal", label: "Terminal", swatch: "#9A4B08", tint: "#B0662A",
      sheets: ["style-terminal.css"], font: G + MONO_I + "&display=swap" },
    { id: "signal", label: "Signal", swatch: "#2C3BD1", tint: "#4A57D8", sheets: [],
      font: G + "family=Archivo:wght@400;500;600;700&" + MONO +
            "&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" },
    { id: "console", label: "Console", swatch: "#1F5FA8", tint: "#3B7FC4",
      sheets: ["style-terminal.css", "style-console.css"],
      font: G + SILK + "&" + MONO_I + "&display=swap" },
    { id: "phosphor", label: "Phosphor", swatch: "#FFB000", tint: "#C08A16",
      sheets: ["style-terminal.css", "style-phosphor.css"],
      font: G + MONO_I + "&display=swap" },
    { id: "arcade", label: "Arcade", swatch: "#FF3FA4", tint: "#E0559A",
      sheets: ["style-arcade.css"],
      font: G + SILK + "&" + MONO + "&" + SANS + "&display=swap" }
  ];

  var injected = [];
  var bannerEl = null;
  var navRow = null;
  /* Terminal is the landing skin. The page ships only its webfont, so the
     default costs one family; every other skin injects what it needs. */
  var DEFAULT = "zine";
  var current = DEFAULT;
  var buttons = [];

  function find(id) {
    for (var i = 0; i < SKINS.length; i++) if (SKINS[i].id === id) return SKINS[i];
    return null;
  }

  function apply(id, persist) {
    var skin = find(id);
    if (!skin) return;

    injected.forEach(function (n) { n.remove(); });
    injected = [];

    if (skin.font) {
      var f = document.createElement("link");
      f.rel = "stylesheet"; f.href = skin.font;
      document.head.appendChild(f); injected.push(f);
    }
    skin.sheets.forEach(function (href) {
      var l = document.createElement("link");
      l.rel = "stylesheet"; l.href = href;
      document.head.appendChild(l); injected.push(l);
    });

    current = id;
    document.documentElement.setAttribute("data-skin", id);
    alignSoon();
    /* the new face has not loaded yet, so measure again once it has */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignNav);
    if (persist) {
      try {
        localStorage.setItem("skin", id);
        localStorage.setItem("skin-used", "1");   /* stop hinting: it worked */
      } catch (e) {}
    }
    sync();
  }

  function sync() {
    buttons.forEach(function (b) {
      b.setAttribute("aria-current", b.dataset.skin === current ? "true" : "false");
    });
  }

  /* saved choice applies before the page paints */
  var start = DEFAULT;
  try {
    var saved = localStorage.getItem("skin");
    if (saved && find(saved)) start = saved;
  } catch (e) {}
  apply(start, false);

  // ---- styles -------------------------------------------------------------

  function styles() {
    var css = document.createElement("style");
    css.textContent = [
      /* shared */
      ".skinsw{padding:0;border:1px solid rgba(128,128,128,.35);background:var(--sw);",
      "cursor:pointer;flex:none;transition:transform .13s ease,box-shadow .13s ease}",
      ".skinsw:hover{transform:scale(1.22)}",

      /* option 1 — navbar */
      ".skinrow{display:flex;align-items:center;gap:6px;flex:none}",
      /* Taken out of the flex flow: reserving space left a hole in the navbar,
         and display:none would shove the links sideways when it appears.
         Absolute keeps the nav identical whether the swatches show or not.
         Offset = gutter + theme button (30) + nav gap (20). */
      ".nav-inner{position:relative}",
      ".skinrow-auto{position:absolute;top:50%;transform:translateY(-50%);",
      "right:calc(var(--gutter) + 50px);opacity:0;pointer-events:none;",
      "transition:opacity .2s ease}",
      ".skinrow-auto.shown{opacity:1;pointer-events:auto}",
      "@media(max-width:760px){.skinrow-auto{display:none}}",
      ".skinrow .skinsw{width:14px;height:14px;border-radius:4px}",
      '.skinrow .skinsw[aria-current="true"]{box-shadow:0 0 0 2px var(--paper),0 0 0 3.5px var(--ink)}',
      ".skinrow.hint .skinsw{animation:skinpulse 1.05s ease-in-out 2}",
      ".skinrow.hintstatic{outline:2px dashed var(--line-strong);outline-offset:4px;border-radius:7px}",
      "@keyframes skinpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.38)}}",

      /* dot + name button, shared by the hero line and the banner */
      ".skinbtn{display:inline-flex;align-items:center;gap:6px;background:none;",
      "border:0;padding:0;cursor:pointer;font-family:var(--font-mono);font-size:.68rem;",
      "letter-spacing:.09em;text-transform:uppercase;color:var(--muted);",
      "transition:color .13s ease}",
      ".skinbtn:hover{color:var(--tint)}",
      '.skinbtn[aria-current="true"]{color:var(--tint);font-weight:500}',
      ".skinbtn .skinsw{width:9px;height:9px;border-radius:2px}",
      '.skinbtn[aria-current="true"] .skinsw{box-shadow:0 0 0 1.5px var(--paper),0 0 0 3px var(--tint)}',

      /* option 2 — under the links */
      ".skinline{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin:14px 0 0}",

      /* option 3 — banner under the navbar. Deliberately NOT sticky: it is the
         invitation, the nav swatches are the persistent control. */
      ".skinbanner{border-bottom:1px solid var(--line);background:transparent}",
      ".skinbanner-in{max-width:var(--max);margin-inline:auto;display:flex;flex-wrap:wrap;",
      "align-items:center;justify-content:flex-end;gap:4px 13px;",
      "padding:6px calc(var(--gutter) + 50px) 6px var(--gutter)}",
      ".skinbanner-lbl{font-family:var(--font-mono);font-size:.59rem;letter-spacing:.15em;",
      "text-transform:uppercase;color:var(--muted);opacity:.75}",
      ".skinbanner .skinbtn{font-size:.6rem;letter-spacing:.1em}",
      ".skinbanner .skinbtn .skinsw{width:8px;height:8px}",
      /* separator dots, centred in the gap; only once the row is spread */
      ".nav-links.nav-spread a{position:relative}",
      '.nav-links.nav-spread a + a::before{content:"\\00B7";position:absolute;',
      "left:calc(-1 * var(--nav-gap) / 2);top:50%;",
      "transform:translate(-50%,-50%);color:var(--line-strong);",
      "opacity:.6;pointer-events:none}",

      "@media(prefers-reduced-motion:reduce){.skinrow.hint .skinsw{animation:none}",
      ".skinsw:hover{transform:none}}"
    ].join("");
    document.head.appendChild(css);
  }

  // ---- build --------------------------------------------------------------

  function swatch(s) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "skinsw";
    b.dataset.skin = s.id;
    b.style.setProperty("--sw", s.swatch);
    b.title = s.label;
    b.setAttribute("aria-label", s.label + " theme");
    b.addEventListener("click", function () { apply(s.id, true); });
    return b;
  }

  function shouldHint() {
    if (HINT === "off") return false;
    if (HINT === "always") return true;
    try {
      if (localStorage.getItem("skin-used")) return false;   /* already found it */
      var n = parseInt(localStorage.getItem("skin-hints") || "0", 10);
      if (n >= 3) return false;
      localStorage.setItem("skin-hints", String(n + 1));
      return true;
    } catch (e) { return true; }
  }

  function buildNav() {
    var nav = document.querySelector(".nav-inner");
    if (!nav) return;
    var row = document.createElement("div");
    row.className = "skinrow";
    SKINS.forEach(function (s) {
      var b = swatch(s);
      row.appendChild(b);
      buttons.push(b);
    });
    nav.insertBefore(row, nav.querySelector("#theme-btn") || null);
    navRow = row;

    if (!bannerEl && shouldHint()) {
      /* A user with reduced motion turned on gets every animation stripped by
         style.css, and overriding that preference would be the wrong call.
         Give them a static ring for the same two seconds instead. */
      var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(function () {
        if (calm) {
          row.classList.add("hintstatic");
          setTimeout(function () { row.classList.remove("hintstatic"); }, 2200);
        } else {
          row.classList.add("hint");
        }
      }, 1000);
    }
  }

  function buildHero() {
    var links = document.querySelector(".hero-id .links");
    if (!links) return;
    var line = document.createElement("p");
    line.className = "skinline";
    SKINS.forEach(function (s) { line.appendChild(namedButton(s)); });
    links.parentNode.insertBefore(line, links.nextSibling);
  }

  function namedButton(s) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "skinbtn";
    b.dataset.skin = s.id;
    b.style.setProperty("--tint", s.tint);
    b.setAttribute("aria-label", "View this page in the " + s.label + " theme");
    var dot = document.createElement("span");
    dot.className = "skinsw";
    dot.style.setProperty("--sw", s.swatch);
    dot.setAttribute("aria-hidden", "true");
    b.appendChild(dot);
    b.appendChild(document.createTextNode(s.label));
    b.addEventListener("click", function () { apply(s.id, true); });
    buttons.push(b);
    return b;
  }

  function buildBanner() {
    var nav = document.querySelector(".nav");
    if (!nav) return;

    var bar = document.createElement("div");
    bar.className = "skinbanner";

    var inner = document.createElement("div");
    inner.className = "skinbanner-in";

    var lbl = document.createElement("span");
    lbl.className = "skinbanner-lbl";
    lbl.textContent = "Fun modes";
    inner.appendChild(lbl);

    SKINS.forEach(function (s) { inner.appendChild(namedButton(s)); });

    bar.appendChild(inner);
    nav.parentNode.insertBefore(bar, nav.nextSibling);
    bannerEl = bar;
  }

  /* With both placements active the two controls would sit 40px apart showing
     the same five colours. Hand off instead: the banner owns the top of the
     page, the nav swatches fade in once it scrolls away. Space is reserved
     either way, so the nav never reflows. */
  /* Both rows bracket the same span: same left edge, same right edge.

     The right edges already match by construction — the banner's right padding
     is gutter + 50px, and the nav links stop 50px short of the gutter to clear
     the theme button. So rather than sliding the nav row left (which broke the
     right edge), the row is *widened* to reach the banner's left edge and its
     items distributed across it.

     Measured, not written in CSS: both are content-width groups, and every skin
     uses a different face. Re-run on resize, on webfont load, and on skin
     change. */
  function alignNav() {
    var links = document.querySelector(".nav-links");
    var inner = bannerEl && bannerEl.querySelector(".skinbanner-in");
    if (!links || !inner) return;

    links.classList.remove("nav-spread");
    links.style.gap = "";
    links.style.flex = "";
    links.style.marginRight = "";
    links.style.removeProperty("--nav-gap");
    if (window.innerWidth < 760) return;          /* stacked: leave default */

    var first = inner.firstElementChild;          /* the FUN MODES label */
    if (!first) return;
    var name = document.querySelector(".nav-name");

    var target = first.getBoundingClientRect().left;
    var box    = links.getBoundingClientRect();
    var guard  = name ? name.getBoundingClientRect().right + 28 : 0;

    /* if the banner is wide enough to reach under the name, leave well alone */
    if (target < guard) return;

    var width = box.right - target;
    var n = links.children.length;
    if (width <= box.width || n < 2) return;

    /* An explicit gap rather than space-between: the separator dots need a
       known distance to sit in the middle of. */
    var cur = parseFloat(getComputedStyle(links).columnGap) || 18;
    var content = box.width - (n - 1) * cur;
    var gap = (width - content) / (n - 1);

    links.style.flex = "none";
    links.style.gap = gap + "px";
    links.style.setProperty("--nav-gap", gap + "px");
    links.classList.add("nav-spread");
  }

  var alignTimer = null;
  function alignSoon() {
    cancelAnimationFrame(alignTimer);
    alignTimer = requestAnimationFrame(alignNav);
  }

  function handoff() {
    if (!bannerEl || !navRow) return;
    if (!("IntersectionObserver" in window)) return;   /* leave both visible */
    navRow.classList.add("skinrow-auto");
    new IntersectionObserver(function (entries) {
      navRow.classList.toggle("shown", !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(bannerEl);
  }

  function build() {
    styles();
    if (wants("banner")) buildBanner();
    if (wants("hero")) buildHero();
    if (wants("nav")) buildNav();
    handoff();
    sync();
    alignNav();
    window.addEventListener("resize", alignSoon);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignNav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else { build(); }

  // ---- keyboard -----------------------------------------------------------

  document.addEventListener("keydown", function (e) {
    if (e.key !== "s" && e.key !== "S") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    var i = 0;
    for (var k = 0; k < SKINS.length; k++) if (SKINS[k].id === current) i = k;
    apply(SKINS[(i + 1) % SKINS.length].id, true);
  });

  window.Skins = {
    set: function (id) { apply(id, true); },
    reset: function () { apply(DEFAULT, true); },
    toggle: function (id) { apply(current === id ? DEFAULT : id, true); },
    get: function () { return current; }
  };
})();

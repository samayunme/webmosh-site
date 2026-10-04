(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var all = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── theme ───────────────────────────────────────────── */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("wm-theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) {}
  /* dark is the default: the system preference is deliberately ignored */
  var meta = el("themeColor");
  var paint = function (mode) {
    if (meta) meta.setAttribute("content", mode === "light" ? "#FAFBFE" : "#07080D");
  };
  paint(root.getAttribute("data-theme") || "dark");
  el("themeBtn").addEventListener("click", function () {
    var cur = root.getAttribute("data-theme") || "dark";
    var next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    paint(next);
    try { localStorage.setItem("wm-theme", next); } catch (e) {}
  });

  /* ── reveal on scroll ────────────────────────────────── */
  all(".rise", function (e) {
    var d = e.getAttribute("data-d");
    if (d) e.style.setProperty("--d", d + "ms");
  });
  if (reduce || !("IntersectionObserver" in window)) {
    all(".rise", function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    all(".rise", function (e) { io.observe(e); });
    requestAnimationFrame(function () {
      all(".rise", function (e) {
        if (e.getBoundingClientRect().top < window.innerHeight * 0.95) {
          e.classList.add("in");
          io.unobserve(e);
        }
      });
    });
  }

  /* ── enquiry form ──────────────────────────────────────
     No backend yet: validate here, then hand the enquiry to
     the mail client so nothing a founder types is dropped. */
  var form = el("lead"), note = el("fnote");
  var field = function (n) { return form.elements.namedItem(n); };
  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = field("name").value.trim();
    var email = field("email").value.trim();
    if (!name) {
      note.hidden = false;
      note.textContent = "Add your name so we know who we are replying to.";
      field("name").focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      note.hidden = false;
      note.textContent = "That email address looks incomplete — check it and send again.";
      field("email").focus();
      return;
    }
    var body = [
      "Name: " + name,
      "Email: " + email,
      "Jurisdiction: " + field("jurisdiction").value,
      "Stage: " + field("stage").value,
      "Services: " + field("services").value,
      "",
      field("message").value.trim()
    ].join("\n");
    note.hidden = false;
    note.textContent = "Opening your email app — send the message and we will reply within one business day.";
    window.location.href = "mailto:hello@webmosh.com"
      + "?subject=" + encodeURIComponent("New enquiry — " + name)
      + "&body=" + encodeURIComponent(body);
  });

  /* pointer spotlight: cards light up where the cursor is */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    all(".card, .ctapanel", function (c) {
      c.addEventListener("pointermove", function (ev) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (ev.clientX - r.left) + "px");
        c.style.setProperty("--my", (ev.clientY - r.top) + "px");
      });
    });
  }

  /* ── dock menus ────────────────────────────────────────
     Two panels share this: the services mega menu, and the
     hamburger beside the theme switch that carries About,
     Contact and Login on small screens. Opening one closes
     the other, so they can never overlap. */
  /* hover-to-open is for a real mouse on the wide layout only. A tap fires
     pointerenter and then click, which opened the panel and shut it again
     in the same gesture. Both queries are read live so a resize behaves. */
  var fineHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  var mobileDock = window.matchMedia("(max-width: 900px)");
  function hoverDrives() { return fineHover.matches && !mobileDock.matches; }
  var menus = [];

  function wireMenu(triggerId, menuId, hoverable) {
    var t = el(triggerId), m = el(menuId);
    if (!t || !m) return null;
    var wrap = t.parentNode, shutTimer, hoverOpenedAt = 0;
    var api = {
      trigger: t,
      wrap: wrap,
      open: function (on) {
        if (on) menus.forEach(function (o) { if (o !== api) o.open(false); });
        m.classList.toggle("is-open", on);
        t.setAttribute("aria-expanded", on ? "true" : "false");
      },
      isOpen: function () { return t.getAttribute("aria-expanded") === "true"; }
    };
    t.addEventListener("click", function (ev) {
      ev.stopPropagation();
      /* a hover that opened this a moment ago must not be undone by the
         click arriving from the same tap */
      if (api.isOpen() && Date.now() - hoverOpenedAt < 600) return;
      api.open(!api.isOpen());
    });
    if (hoverable) {
      wrap.addEventListener("pointerenter", function (ev) {
        if (!hoverDrives()) return;
        if (ev.pointerType && ev.pointerType !== "mouse") return;
        clearTimeout(shutTimer);
        hoverOpenedAt = Date.now();
        api.open(true);
      });
      wrap.addEventListener("pointerleave", function () {
        if (!hoverDrives()) return;
        shutTimer = setTimeout(function () { api.open(false); }, 160);
      });
    }
    menus.push(api);
    return api;
  }

  wireMenu("svcTrigger", "svcMenu", true);
  wireMenu("navTrigger", "navMenu", false);

  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    menus.forEach(function (o) {
      if (o.isOpen()) { o.open(false); o.trigger.focus(); }
    });
  });
  document.addEventListener("click", function (ev) {
    menus.forEach(function (o) {
      if (!o.wrap.contains(ev.target)) o.open(false);
    });
  });

  /* ── jurisdiction switch ──────────────────────────────── */
  var tabs = [].slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      if (on) { t.removeAttribute("tabindex"); } else { t.setAttribute("tabindex", "-1"); }
      var panel = el(t.getAttribute("aria-controls"));
      if (!panel) return;
      panel.hidden = !on;
      /* a panel that was hidden never tripped the observer, so its cards
         would stay invisible after switching to it */
      if (on) {
        Array.prototype.forEach.call(panel.querySelectorAll(".rise"), function (e) {
          e.classList.add("in");
        });
      }
    });
  }
  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (ev) {
      var dir = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      ev.preventDefault();
      var next = tabs[(idx + dir + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  el("yr").textContent = new Date().getFullYear();
})();

(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var all = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Google Analytics (GA4) ─────────────────────────────────────
     The homepage carries Google's tag in its <head>, because Search
     Console and GA's own checker read the raw HTML. Every other page gets
     the same tag from here, so it is not pasted into seventeen files.

     Consent Mode: analytics cookies start switched off for visitors in
     the UK, the EEA and Switzerland (Google works out the region from the
     IP address) and on everywhere else. A choice the visitor has made,
     saved in localStorage as "wm-consent", overrides either default. Ad
     storage is always off because the site runs no ads. The homepage
     <head> repeats these defaults, since they must come before the tag. */
  var GA_ID = "G-8ZX1TGBV08";
  var CONSENT_KEY = "wm-consent";
  var CONSENT_REGIONS = ["GB","AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","CH"];
  var readConsent = function () {
    try {
      var v = localStorage.getItem(CONSENT_KEY);
      return v === "granted" || v === "denied" ? v : "";
    } catch (e) { return ""; }
  };
  if (typeof window.gtag !== "function") {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
      analytics_storage: "granted"
    });
    window.gtag("consent", "default", { analytics_storage: "denied", region: CONSENT_REGIONS });
    var choice = readConsent();
    if (choice) window.gtag("consent", "update", { analytics_storage: choice });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(ga);
  }

  /* ── theme ───────────────────────────────────────────── */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("wm-theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) {}
  /* light is the default: dark only ever comes from the toggle, so the
     system preference is deliberately ignored */
  var meta = el("themeColor");
  var themeBtn = el("themeBtn");
  var paint = function (mode) {
    if (meta) meta.setAttribute("content", mode === "dark" ? "#07080D" : "#FAFBFE");
    /* the button is a toggle, so it should say which theme is on rather
       than only what pressing it does */
    if (themeBtn) themeBtn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
  };
  paint(root.getAttribute("data-theme") || "light");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var cur = root.getAttribute("data-theme") || "light";
    var next = cur === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    paint(next);
    try { localStorage.setItem("wm-theme", next); } catch (e) {}
  });

  /* ── footer: free invoice generator ───────────────────
     The footer is duplicated in every page, so instead of hand-editing
     every copy the Company column gets this link here, just above Login.
     The path is taken from the About link so it resolves from /services/
     too. A page that already has the link in its markup is left alone. */
  all(".foot__col", function (col) {
    var h = col.querySelector("h4");
    var list = col.querySelector("ul");
    if (!h || !list || h.textContent.trim() !== "Company") return;
    if (list.querySelector('a[href$="free-invoice-generator"]')) return;
    var about = list.querySelector('a[href$="about"]');
    var base = about ? about.getAttribute("href").replace(/about$/, "") : "";
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.setAttribute("href", base + "free-invoice-generator");
    a.textContent = "Free Invoice Generator";
    li.appendChild(a);
    list.insertBefore(li, list.lastElementChild);
  });

  /* ── cookie banner ───────────────────────────────────────────────
     Shown until the visitor chooses, but only where consent is needed.
     A European time zone is the signal, and it errs safe both ways: an EU
     visitor whose clock says otherwise never sees the banner but stays
     opted out, because Google's regional default above is "denied", and
     anyone else who sees it can simply say no. Every footer also gets a
     "Cookie settings" link so a choice can be changed later. The styles
     live here rather than in site.css so the banner ships as one piece. */
  var inEurope = (function () {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      return /^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)$|Arctic\/)/.test(tz);
    } catch (e) { return false; }
  })();
  var cookiebar = null;
  var dropAnalyticsCookies = function () {
    var host = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (!/^_ga/.test(n)) return;
      ["", "; domain=" + host, "; domain=." + host].forEach(function (d) {
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
      });
    });
  };
  var setConsent = function (v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
    if (typeof window.gtag === "function") window.gtag("consent", "update", { analytics_storage: v });
    if (v === "denied") dropAnalyticsCookies();
    if (cookiebar) cookiebar.hidden = true;
  };
  var buildCookiebar = function () {
    if (cookiebar) return cookiebar;
    var css = document.createElement("style");
    css.textContent = ".cookiebar{position:fixed;z-index:95;left:var(--gutter);bottom:calc(clamp(14px,2.2vh,24px) + 74px + 14px);max-width:400px;padding:16px 18px;border-radius:var(--r-lg);background:var(--bg-elev);color:var(--ink);border:1px solid var(--stroke);box-shadow:var(--shadow-lg);font-size:var(--fs-xs);line-height:1.55}.cookiebar[hidden]{display:none}.cookiebar p{margin:0;color:var(--muted)}.cookiebar b{color:var(--ink)}.cookiebar a{color:var(--a1);font-weight:600}.cookiebar__btns{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}@media (max-width:900px){.cookiebar{right:var(--gutter);max-width:none;bottom:calc(clamp(14px,2.2vh,24px) + 68px + 14px)}}";
    document.head.appendChild(css);
    cookiebar = document.createElement("div");
    cookiebar.className = "cookiebar";
    cookiebar.setAttribute("role", "region");
    cookiebar.setAttribute("aria-label", "Cookie choice");
    cookiebar.hidden = true;
    cookiebar.innerHTML = '<p><b>Analytics cookies?</b> We use Google Analytics to see which pages are useful. No ads, and we never sell your data. <a href="">Privacy Policy</a></p>'
      + '<div class="cookiebar__btns"><button type="button" class="btn btn--outline btn--sm" data-consent="denied">No thanks</button>'
      + '<button type="button" class="btn btn--primary btn--sm" data-consent="granted">Accept</button></div>';
    var policy = document.querySelector('a[href$="privacy-policy"]');
    cookiebar.querySelector("a").setAttribute("href",
      (policy ? policy.getAttribute("href") : "/privacy-policy") + "#cookies-and-similar-technologies");
    Array.prototype.forEach.call(cookiebar.querySelectorAll("[data-consent]"), function (b) {
      b.addEventListener("click", function () { setConsent(b.getAttribute("data-consent")); });
    });
    document.body.appendChild(cookiebar);
    return cookiebar;
  };
  if (inEurope && !readConsent()) buildCookiebar().hidden = false;
  all(".legal__links", function (links) {
    if (links.querySelector("[data-cookie-settings]")) return;
    var a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("data-cookie-settings", "");
    a.textContent = "Cookie settings";
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      buildCookiebar().hidden = false;
      cookiebar.querySelector("button").focus();
    });
    links.appendChild(a);
  });

  /* ── package buttons ───────────────────────────────────────
     Every "Get started" under a formation package table (.pt) opens the
     app, where the order is placed. The markup still points at the
     enquiry form, which is where a visitor lands if this never runs. */
  all(".pt tfoot a.btn", function (a) {
    a.setAttribute("href", "https://app.webmosh.com");
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });

  /* ── reveal on scroll ────────────────────────────────── */
  /* .rise is visible by default in the stylesheet; it is only hidden once
     this class says the reveal is actually running, so a script that
     never loads leaves the page readable instead of blank */
  root.classList.add("reveal-enabled");
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
     Enquiries are sent through Web3Forms (https://web3forms.com), which
     emails each submission to the address the access key was created for.
     The key is designed to be public, so it is safe in this file.

     To switch it on: create a free key at web3forms.com using
     info@webmosh.com, paste it into WEB3FORMS_KEY below, and deploy.
     The CSP in .htaccess already allows https://api.web3forms.com.

     While the key is empty the form falls back to the mail client. That
     fallback is a last resort: it only works for a visitor who has a mail
     client and then presses send in it, and it leaves no record at all. */
  var WEB3FORMS_KEY = "fa812a80-2daa-4b0b-940f-8962871e1fca";
  var ENDPOINT = WEB3FORMS_KEY ? "https://api.web3forms.com/submit" : "";
  var CONTACT_EMAIL = "info@webmosh.com";

  var form = el("lead"), note = el("fnote");

  if (form) {
    var field = function (n) { return form.elements.namedItem(n); };

    var say = function (msg) {
      if (!note) return;
      note.hidden = false;
      note.textContent = msg;
    };
    /* the error is announced live by #fnote's role="status", but a visitor
       who tabs back to the field hears nothing unless the field points at
       it, so mark the field invalid and describe it by that same note */
    var flag = function (n, msg) {
      var f = field(n);
      if (f) {
        f.setAttribute("aria-invalid", "true");
        if (note) f.setAttribute("aria-describedby", "fnote");
      }
      say(msg);
      if (f) f.focus();
    };
    var unflag = function (n) {
      var f = field(n);
      if (!f) return;
      f.removeAttribute("aria-invalid");
      f.removeAttribute("aria-describedby");
    };

    ["name", "email"].forEach(function (n) {
      var f = field(n);
      if (f) f.addEventListener("input", function () { unflag(n); });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      unflag("name");
      unflag("email");

      var name = field("name").value.trim();
      var email = field("email").value.trim();
      if (!name) {
        flag("name", "Add your name so we know who we are replying to.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        flag("email", "That email address looks incomplete, check it and send again.");
        return;
      }

      /* a field a person never sees and never fills: anything in it is a
         bot. Answer as though it worked and send nothing. */
      var trap = field("website");
      if (trap && trap.value) {
        form.reset();
        say("Thank you, we will reply within one business day.");
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

      if (!ENDPOINT) {
        say("Opening your email app. Send the message and we will reply within one business day.");
        window.location.href = "mailto:" + CONTACT_EMAIL
          + "?subject=" + encodeURIComponent("New enquiry: " + name)
          + "&body=" + encodeURIComponent(body);
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      say("Sending…");

      /* FormData carries every field, so adding a question to the markup
         needs no change here. Web3Forms reads access_key, subject and
         from_name, and uses the email field as the reply-to address. */
      var data = new FormData(form);
      data.append("access_key", WEB3FORMS_KEY);
      data.append("subject", "New enquiry: " + name);
      data.append("from_name", "webmosh.com");
      data.append("page", window.location.pathname);

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      }).then(function (res) {
        return res.json()["catch"](function () { return {}; }).then(function (j) {
          if (!res.ok || j.success === false) throw new Error("HTTP " + res.status);
        });
      }).then(function () {
        /* only clear the form once it is actually away */
        form.reset();
        say("Received. We will reply within one business day.");
      })["catch"](function () {
        /* everything typed is still in the form, so a retry costs nothing */
        say("That did not send. Please try again, or email " + CONTACT_EMAIL + " directly.");
      }).then(function () {
        if (btn) btn.disabled = false;
      });
    });
  }

  /* ── loading redirect buttons ─────────────────────────
     <a data-go="Label"> shows a spinner, then follows its href. A plain
     link underneath, so it still works with JavaScript off, and a
     modified click (new tab, new window) is left to the browser. */
  var resetGo = function (a) {
    a.classList.remove("is-loading");
    a.removeAttribute("aria-busy");
    var label = a.querySelector(".go-label");
    if (label && a.getAttribute("data-go")) label.textContent = a.getAttribute("data-go");
  };
  all("[data-go]", function (a) {
    a.addEventListener("click", function (ev) {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      if (a.classList.contains("is-loading")) return;
      a.classList.add("is-loading");
      a.setAttribute("aria-busy", "true");
      var label = a.querySelector(".go-label");
      if (label) label.textContent = "Opening the generator…";
      setTimeout(function () { window.location.href = a.href; }, reduce ? 150 : 650);
    });
  });
  /* coming back with the browser's Back button can restore the page from
     cache with the spinner still running, so clear it */
  window.addEventListener("pageshow", function () { all("[data-go]", resetGo); });

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
        /* a panel must not be pulled out from under the keyboard: if focus
           is still inside it, leave it open */
        shutTimer = setTimeout(function () {
          if (wrap.contains(document.activeElement)) return;
          api.open(false);
        }, 160);
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

  var yr = el("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();

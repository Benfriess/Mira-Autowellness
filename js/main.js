/* Mira Autowellness — interactions */
(function () {
  "use strict";
  var doc = document;

  /* main.js loaded fine — cancel the no-JS reveal safety net (IntersectionObserver takes over) */
  if (window.__revealFallback) clearTimeout(window.__revealFallback);

  /* --- Sticky header background on scroll --- */
  var header = doc.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  if (header) {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile navigation --- */
  var toggle = doc.getElementById("navToggle");
  var nav = doc.getElementById("mainNav");
  function closeNav() {
    doc.body.classList.remove("nav-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menü öffnen");
    }
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = doc.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* --- Scroll reveal (robust: above-the-fold shows immediately) --- */
  var reveals = [].slice.call(doc.querySelectorAll(".reveal"));
  function show(el) { el.classList.add("in"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    var vh = window.innerHeight || doc.documentElement.clientHeight;
    reveals.forEach(function (el) {
      // anything already in (or near) the viewport reveals synchronously — no flash, no blank
      if (el.getBoundingClientRect().top < vh * 0.95) show(el);
      else io.observe(el);
    });
    // ultimate fallback: never leave anything hidden
    window.addEventListener("load", function () {
      setTimeout(function () {
        reveals.forEach(function (el) {
          if (!el.classList.contains("in") && el.getBoundingClientRect().top < (window.innerHeight || 800)) show(el);
        });
      }, 300);
    });
  } else {
    reveals.forEach(show);
  }

  /* --- Current year in footer --- */
  var y = doc.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* --- Bewegungspräferenz --- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Vorher/Nachher-Vergleichsslider --- */
  var sliders = [].slice.call(doc.querySelectorAll(".ba-slider"));
  sliders.forEach(function (s) {
    var range = s.querySelector(".ba-slider__range");
    function set(v) {
      v = Math.max(0, Math.min(100, v));
      s.style.setProperty("--pos", v + "%");
      if (range) range.value = v;
    }
    var dragging = false;
    function fromEvent(e) {
      var r = s.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    }
    s.addEventListener("pointerdown", function (e) {
      dragging = true;
      s.classList.remove("ba-slider--hint"); // sofort reaktiv, falls während des Nudges gegriffen wird
      if (s.setPointerCapture) { try { s.setPointerCapture(e.pointerId); } catch (err) {} }
      fromEvent(e);
      e.preventDefault();
    });
    s.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    s.addEventListener("pointerup", function () { dragging = false; });
    s.addEventListener("pointercancel", function () { dragging = false; });
    if (range) range.addEventListener("input", function () { set(+range.value); });
    set(range ? +range.value : 50);
  });

  /* Einmaliger „Nudge" als Zieh-Hinweis, sobald ein Slider ins Bild kommt */
  if (!reduceMotion && "IntersectionObserver" in window && sliders.length) {
    var hintIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var s = en.target;
          hintIO.unobserve(s);
          s.classList.add("ba-slider--hint");
          s.style.setProperty("--pos", "66%");
          setTimeout(function () { s.style.setProperty("--pos", "50%"); }, 620);
          setTimeout(function () { s.classList.remove("ba-slider--hint"); }, 1350);
        });
      },
      { threshold: 0.35 }
    );
    sliders.forEach(function (s) { hintIO.observe(s); });
  }

  /* --- Feinschliff: Laufschriften (Info-Streifen + Bewertungen) --- */
  function setupMarquee(outerSel, innerSel) {
    var outer = doc.querySelector(outerSel);
    var inner = outer && outer.querySelector(innerSel);
    if (!outer || !inner || !inner.children.length) return;
    [].slice.call(inner.children).forEach(function (k) {
      var c = k.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      inner.appendChild(c);
    });
    outer.classList.add("is-marquee");
  }
  /* Bewertungen: nahtlose Endlosschleife.
     Desktop: läuft von selbst (JS-Transform, Position immer modulo einer Kartenrunde
     → kann rechnerisch nie ins Leere laufen), Pause bei Hover.
     Mobil: Nutzer wischt selbst; beim Überschreiten einer Kartenrunde springt die
     Scroll-Position unsichtbar exakt eine Runde zurück (dort liegt dieselbe Karte). */
  function setupQuotesLoop() {
    var outer = doc.querySelector(".quotes-marquee.is-marquee");
    var inner = outer && outer.querySelector(".quotes");
    if (!outer || !inner || inner.children.length < 2) return;
    var originals = [].slice.call(inner.children, 0, inner.children.length / 2);
    var mqMobile = window.matchMedia("(max-width:820px)");
    var oneSet = 0, speed = 0, pos = 0, raf = 0, last = 0, hovered = false, inView = true;

    function measure() {
      oneSet = inner.children[originals.length].offsetLeft - inner.children[0].offsetLeft;
      speed = oneSet / 52; /* gleiche Geschwindigkeit wie die bisherige 52s-Animation */
      /* Sehr breite Fenster: rechts genug Karten nachlegen, damit nie Leere sichtbar wird */
      var guard = 0;
      while (guard++ < 3 && inner.scrollWidth - oneSet < outer.clientWidth + 80) {
        originals.forEach(function (k) {
          var c = k.cloneNode(true);
          c.setAttribute("aria-hidden", "true");
          inner.appendChild(c);
        });
      }
      outer.setAttribute("data-oneset", String(Math.round(oneSet)));
    }
    function tick(t) {
      if (!last) last = t;
      var dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      if (!hovered && inView && oneSet) {
        pos = (pos + speed * dt) % oneSet;
        inner.style.transform = "translateX(" + -pos + "px)";
      }
      raf = requestAnimationFrame(tick);
    }
    function startAnim() { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
    function stopAnim() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function applyMode() {
      stopAnim();
      pos = 0;
      inner.style.transform = "none";
      outer.scrollLeft = 0;
      measure();
      if (!mqMobile.matches) startAnim();
    }
    outer.addEventListener("mouseenter", function () { hovered = true; });
    outer.addEventListener("mouseleave", function () { hovered = false; });
    outer.addEventListener(
      "scroll",
      function () {
        if (!mqMobile.matches || !oneSet) return;
        if (outer.scrollLeft >= oneSet) outer.scrollLeft -= oneSet; /* unsichtbarer Rücksprung */
      },
      { passive: true }
    );
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { inView = en.isIntersecting; });
      }).observe(outer);
    }
    if (mqMobile.addEventListener) mqMobile.addEventListener("change", applyMode);
    else if (mqMobile.addListener) mqMobile.addListener(applyMode);
    window.addEventListener("resize", function () {
      measure();
      if (oneSet) pos = pos % oneSet;
    });
    applyMode();
  }
  if (!reduceMotion) {
    setupMarquee(".strip", ".strip__inner");
    setupMarquee(".quotes-marquee", ".quotes");
    setupQuotesLoop();
  }

  /* --- Videos: erst abspielen, wenn im Bild (kein Laden/Ruckeln beim Seitenaufruf) --- */
  var vids = [].slice.call(doc.querySelectorAll("video[data-inview]"));
  if (vids.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      // Ohne Autoplay: Nutzer startet selbst per Steuerelemente
      vids.forEach(function (v) { v.setAttribute("controls", ""); });
    } else {
      var vio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            var v = en.target;
            if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
            else { v.pause(); }
          });
        },
        { threshold: 0.4 }
      );
      vids.forEach(function (v) { vio.observe(v); });
    }
  }

  /* --- Klick-Statistik (GoatCounter, anonym & ohne Cookies) ---
     Zählt, auf welcher Seite welcher Kontaktweg geklickt wird und welche
     FAQ-Fragen geöffnet werden — als aggregierte Events, keine Personendaten. */
  function gcEvent(pfad, titel) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: pfad, title: titel, event: true });
    }
  }
  var seite = location.pathname.split("/").pop().replace(".html", "") || "start";
  doc.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var h = a.getAttribute("href") || "";
    var art = h.indexOf("wa.me") > -1 ? "whatsapp"
      : h.indexOf("mailto:") === 0 ? "email"
      : h.indexOf("tel:") === 0 ? "anruf" : "";
    if (art) gcEvent("kontakt-" + art + "/" + seite, "Kontakt-Klick: " + art + " (" + seite + ")");
  });
  [].slice.call(doc.querySelectorAll(".faq details")).forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) {
        var frage = (d.querySelector("summary") || {}).textContent || "";
        gcEvent("faq/" + frage.trim().toLowerCase().replace(/[^a-zä-ü0-9 ]/gi, "").replace(/\s+/g, "-").slice(0, 60), "FAQ geöffnet: " + frage.trim());
      }
    });
  });
})();

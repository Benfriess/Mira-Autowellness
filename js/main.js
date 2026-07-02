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
  /* Mobil: "endloses" Wischen bei den Bewertungen — beim Erreichen der Kopie unsichtbar zurückspringen */
  function setupInfiniteSwipe(outerSel, innerSel) {
    var outer = doc.querySelector(outerSel);
    var inner = outer && outer.querySelector(innerSel);
    if (!outer || !inner) return;
    var mqMobile = window.matchMedia("(max-width:820px)");
    var setWidth = 0;
    function measure() { setWidth = inner.scrollWidth / 2; }
    measure();
    window.addEventListener("resize", measure);
    outer.addEventListener(
      "scroll",
      function () {
        if (!mqMobile.matches || !setWidth) return;
        if (outer.scrollLeft >= setWidth) outer.scrollLeft -= setWidth;
      },
      { passive: true }
    );
  }
  if (!reduceMotion) {
    setupMarquee(".strip", ".strip__inner");
    setupMarquee(".quotes-marquee", ".quotes");
    setupInfiniteSwipe(".quotes-marquee", ".quotes");
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
})();

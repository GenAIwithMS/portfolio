/* =====================================================================
   MAIN — Lenis smooth scroll, cursor, magnetic, reveals, tilt
   ===================================================================== */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- LENIS (heavy smooth scroll) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({
      duration: 1.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      infinite: false,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.__lenis = lenis;
  }

  // anchor links → lenis scrollTo
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.6 });
      else target.scrollIntoView({ behavior: "smooth" });
      $("#mobileMenu")?.classList.remove("is-open");
    });
  });

  /* ---------- LOADER ---------- */
  window.addEventListener("load", () => {
    setTimeout(() => {
      const loader = $("#loader");
      if (loader) loader.classList.add("is-done");
      const hero = $("#hero");
      if (hero) hero.classList.add("is-in");
    }, 1200);
  });

  /* ---------- SCROLL PROGRESS + NAV STATE ---------- */
  const progress = $("#scrollProgress");
  const nav = $("#nav");
  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    if (progress) progress.style.width = (y / h) * 100 + "%";
    if (nav) nav.classList.toggle("is-scrolled", y > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  const burger = $("#navBurger");
  const menu = $("#mobileMenu");
  if (burger && menu) {
    burger.addEventListener("click", () => menu.classList.toggle("is-open"));
  }

  /* ---------- CUSTOM CURSOR ---------- */
  if (fine) {
    const cursor = $("#cursor");
    const dot = $(".cursor__dot");
    const ring = $(".cursor__ring");
    const label = $("#cursorLabel");
    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my;
    let dx = mx,
      dy = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });
    window.addEventListener("mousedown", () => cursor.classList.add("is-down"));
    window.addEventListener("mouseup", () => cursor.classList.remove("is-down"));

    function tick() {
      // dot follows fast
      dx += (mx - dx) * 0.35;
      dy += (my - dy) * 0.35;
      // ring follows with lag
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (dot) dot.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      if (ring) ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      if (label) label.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(tick);
    }
    tick();

    // hover states on interactive elements
    const interactive =
      'a, button, .magnetic, .chip, .project, .cert, [data-cursor]';
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest(interactive);
      if (t) {
        cursor.classList.add("is-hover");
        const text = t.getAttribute("data-cursor");
        if (text) {
          label.textContent = text;
          cursor.classList.add("has-label");
        }
      }
    });
    document.addEventListener("mouseout", (e) => {
      const t = e.target.closest(interactive);
      if (t) {
        cursor.classList.remove("is-hover");
        cursor.classList.remove("has-label");
      }
    });
  }

  /* ---------- MAGNETIC ELEMENTS (smoothed follow + spring-back) ---------- */
  if (fine && !reduce) {
    const magnetize = (el, strength, scale) => {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      const apply = () => {
        el.style.transform =
          `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)` +
          (scale > 1 ? ` scale(${scale})` : "");
      };
      const loop = () => {
        cx += (tx - cx) * 0.2;
        cy += (ty - cy) * 0.2;
        apply();
        if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
          raf = requestAnimationFrame(loop);
        } else {
          cx = tx; cy = ty;
          apply();
          raf = null;
        }
      };
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * strength;
        ty = (e.clientY - r.top - r.height / 2) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", () => {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    };

    $$(".magnetic").forEach((el) => magnetize(el, 0.4, 1.06));
    $$(".chip").forEach((el) => magnetize(el, 0.22, 1));
  }

  /* ---------- TILT (projects + certs) ---------- */
  if (fine && !reduce) {
    $$(".tilt").forEach((card) => {
      const inner = card.querySelector(".project__inner, .cert__inner");
      const max = 8;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -2 * max;
        const ry = (px - 0.5) * 2 * max;
        if (inner) {
          inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
          inner.style.setProperty("--mx", px * 100 + "%");
          inner.style.setProperty("--my", py * 100 + "%");
        }
      });
      card.addEventListener("mouseleave", () => {
        if (inner) {
          inner.style.transform = "rotateX(0) rotateY(0)";
        }
      });
    });
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = $$(".reveal-line, .reveal-up, .reveal-text");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- PARALLAX (data-parallax) ---------- */
  if (!reduce) {
    const parallaxEls = $$("[data-parallax]");
    function onScrollParallax() {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const speed = parseFloat(el.getAttribute("data-parallax")) || 0;
        const center = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translateY(${-center * speed}px)`;
      });
    }
    window.addEventListener("scroll", onScrollParallax, { passive: true });
    onScrollParallax();
  }

  /* ---------- COUNT-UP STATS ---------- */
  const counters = $$("[data-count]");
  if (counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            countUp(en.target);
            cio.unobserve(en.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  }
  function countUp(el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const dur = 1400;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- CONTACT GLOW FOLLOWS CURSOR ---------- */
  if (fine && !reduce) {
    const glow = $("#contactGlow");
    const contact = $("#contact");
    if (glow && contact) {
      contact.addEventListener("mousemove", (e) => {
        const r = contact.getBoundingClientRect();
        glow.style.left = e.clientX - r.left + "px";
        glow.style.top = e.clientY - r.top + "px";
      });
    }
  }

  /* ---------- YEAR ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();

/* =====================================================================
   MAIN — project cards, case study sheet, small niceties
   Project content lives in js/projects.js (window.PROJECTS)
   ===================================================================== */
(function () {
  "use strict";

  const PROJECTS = window.PROJECTS || [];
  const TOTAL = PROJECTS.length;
  const MAIL = "muhammadsiddiq.code@gmail.com";
  const HOME_TITLE = document.title;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, "0");
  const wrap = (i) => (i + TOTAL) % TOTAL;
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  // content strings may use **bold** and `code`
  const rich = (s) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  const isLive = (p) => (p.links || []).some((l) => l.label === "Live site");
  const inProgress = (p) => p.status === "In progress";
  const badges = (p) =>
    (inProgress(p) ? '<span class="badge badge--progress">In progress</span>' : "") +
    (isLive(p) ? '<span class="badge">Live</span>' : "");
  const nodes = (p) =>
    (p.flow || []).map((f) => (f.charAt(0) === "*" ? { label: f.slice(1), key: true } : { label: f, key: false }));

  const svg = (d, size, stroke) =>
    `<svg width="${size || 16}" height="${size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    right: svg('<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>'),
    left: svg('<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>', 14),
    rightSm: svg('<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>', 14),
    arrowSm: svg('<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>', 12, 2),
    out: svg('<path d="M7 17L17 7"/><path d="M8 7h9v9"/>', 14),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 13, 2.2),
  };

  document.documentElement.classList.add("js");

  /* ---------- nav: highlight the section in view ---------- */
  const navLinks = $$(".nav__links a");
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          navLinks.forEach((a) => {
            const on = a.getAttribute("href") === "#" + en.target.id;
            a.classList.toggle("is-active", on);
            if (on) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    $$("main > section").forEach((sec) => spy.observe(sec));
  }

  /* ---------- 01 work: featured cards ---------- */
  $("#cards").innerHTML = PROJECTS.slice(0, 4)
    .map(
      (p, i) => `
    <article class="card tone-dark">
      <div class="card__top">
        <span class="card__num">${pad(i + 1)}</span>
        <span class="card__type">${esc(p.type)}</span>
        <span class="card__badges">${badges(p)}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${esc(p.name)}</h3>
        <p class="card__cat">${esc(p.category)}</p>
      </div>
      <dl class="card__facts">
        <div class="pr"><dt class="tag">Problem</dt><dd class="pr__text">${esc(p.problemShort)}</dd></div>
        <div class="pr"><dt class="tag tag--result">Result</dt><dd class="pr__text pr__text--strong">${esc(p.resultShort)}</dd></div>
      </dl>
      <a class="card__link stretch" href="#work/${esc(p.slug)}" aria-label="Read the case study: ${esc(p.name)}"><span>Read the case study</span><span class="card__arrow"><span class="arrow">${ICON.right}</span></span></a>
    </article>`
    )
    .join("");

  /* ---------- 01 work: more case studies — drag / swipe / button slider ---------- */
  if (TOTAL > 4) {
    const track = $("#moreList");
    track.innerHTML = PROJECTS.slice(4)
      .map(
        (p, k) => `
      <li class="slide">
        <a class="slide__link" href="#work/${esc(p.slug)}" draggable="false">
          <span class="slide__top">
            <span class="slide__badges">${badges(p)}</span>
          </span>
          <span class="slide__big" aria-hidden="true">${pad(k + 5)}</span>
          <span class="slide__body">
            <span class="slide__cat">${esc(p.category)}</span>
            <span class="slide__title">${esc(p.name)}</span>
            <span class="slide__pr"><span class="tag">Problem</span><span>${esc(p.problemShort)}</span></span>
            <span class="slide__pr slide__pr--result"><span class="tag tag--result">Result</span><span>${esc(p.resultShort)}</span></span>
          </span>
          <span class="slide__foot">Open case study<span class="slide__arrow" aria-hidden="true">${ICON.right}</span></span>
        </a>
      </li>`
      )
      .join("");
    $("#more").hidden = false;

    const slides = $$(".slide", track);
    const bar = $("#slideBar");
    const now = $("#slideNow");
    const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
    function sync() {
      const max = track.scrollWidth - track.clientWidth;
      const k = max > 0 ? track.scrollLeft / max : 0;
      bar.style.transform = "scaleX(" + Math.max(0.08, k) + ")";
      const i = Math.min(slides.length - 1, Math.round(track.scrollLeft / step()));
      now.textContent = pad(i + 5);
      $("#slidePrev").disabled = track.scrollLeft < 4;
      $("#slideNext").disabled = track.scrollLeft > max - 4;
    }
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
    $("#slidePrev").addEventListener("click", () => go(-1));
    $("#slideNext").addEventListener("click", () => go(1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });
    track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    window.addEventListener("resize", sync);
    sync();

    // mouse drag with a little momentum; a drag never counts as a click
    let down = false, moved = false, startX = 0, startLeft = 0, lastX = 0, v = 0;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = lastX = e.clientX; startLeft = track.scrollLeft; v = 0;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add("is-dragging"); }
      if (moved) { track.scrollLeft = startLeft - dx; v = e.clientX - lastX; lastX = e.clientX; }
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      track.classList.remove("is-dragging");
      if (moved && !reduce) track.scrollBy({ left: -v * 12, behavior: "smooth" });
    });
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  }

  /* ---------- case study sheet ---------- */
  const sheet = $("#sheet");
  const panel = $("#sheetPanel");
  const content = $("#sheetContent");
  const progress = $("#sheetProgress");
  let current = -1;
  let lastFocus = null;
  let lockPad = "";

  const paras = (list) => (list || []).map((t) => `<p>${rich(t)}</p>`).join("");

  function caseHTML(p, idx) {
    const prev = PROJECTS[wrap(idx - 1)];
    const next = PROJECTS[wrap(idx + 1)];
    const links = (p.links || [])
      .map((l) => `<a class="btn btn--line" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}${ICON.out}</a>`)
      .join("");
    const flow = nodes(p);
    const subject = encodeURIComponent("Something like " + p.name);
    return `
    <article class="cs">
      <header class="cs__head">
        <div class="cs__chips"><span class="cs__cat">${esc(p.category)}</span>${badges(p)}</div>
        <h2 class="cs__title" id="csTitle">${esc(p.name)}</h2>
        <p class="cs__summary">${rich(p.summary)}</p>
        <dl class="cs__facts">
          <div class="cs__fact"><dt>Role</dt><dd>${esc(p.role)}</dd></div>
          <div class="cs__fact"><dt>Type</dt><dd>${esc(p.type)}</dd></div>
          <div class="cs__fact"><dt>Built for</dt><dd>${esc(p.audience)}</dd></div>
        </dl>
        ${links ? `<div class="cs__links">${links}</div>` : ""}
      </header>

      <section class="cs__part">
        <p class="cs__label"><b>01</b>The problem</p>
        <h3 class="cs__h">${esc(p.problem.title)}</h3>
        <div class="cs__body">${paras(p.problem.body)}</div>
      </section>

      <section class="cs__part">
        <p class="cs__label"><b>02</b>The plan</p>
        <h3 class="cs__h">${esc(p.plan.title)}</h3>
        <div class="cs__body">${paras(p.plan.body)}</div>
        <ol class="cs__steps">${(p.plan.steps || [])
          .map((t, i) => `<li><span class="cs__step-num">${pad(i + 1)}</span><span class="cs__step-text">${rich(t)}</span></li>`)
          .join("")}</ol>
      </section>

      <section class="cs__part">
        <p class="cs__label cs__label--flow">How it fits together</p>
        <ol class="pipe">${flow
          .map(
            (n, j) => `<li>
            <span class="pipe__rail"><span class="pipe__dot${n.key ? " pipe__dot--key" : ""}">${pad(j + 1)}</span>${
              j < flow.length - 1 ? '<span class="pipe__line"></span>' : ""
            }</span>
            <span class="pipe__body"><span class="pipe__label${n.key ? " pipe__label--key" : ""}">${esc(n.label)}</span>${
              n.key ? '<span class="pipe__key">Key step</span>' : ""
            }</span>
          </li>`
          )
          .join("")}</ol>
      </section>

      ${p.metrics ? `<section class="cs__part">
        <p class="cs__label">Evaluation</p>
        <ul class="score">${p.metrics.map((m) => `<li class="score__item"><span class="score__value">${esc(m.value)}</span><span class="score__label">${esc(m.label)}</span></li>`).join("")}</ul>
      </section>` : ""}
      <section class="cs__part">
        <p class="cs__label"><b>03</b>The outcome</p>
        <h3 class="cs__h">${esc(p.outcome.title)}</h3>
        <div class="cs__body">${paras(p.outcome.body)}</div>
        <ul class="cs__points">${(p.outcome.points || [])
          .map((t) => `<li><span class="cs__check" aria-hidden="true">${ICON.check}</span><span class="cs__point-text">${rich(t)}</span></li>`)
          .join("")}</ul>
      </section>

      <section class="cs__part">
        <p class="cs__label">Built with</p>
        <ul class="cs__stack">${(p.stack || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </section>

      <section class="cs__value-wrap">
        <div class="cs__value">
          <p class="cs__value-label">What this means for you</p>
          <p class="cs__value-text">${esc(p.value)}</p>
          <a class="cs__talk" href="mailto:${MAIL}?subject=${subject}">Let&rsquo;s talk about yours${ICON.rightSm}</a>
        </div>
      </section>

      <nav class="cs__pn" aria-label="Other case studies">
        <button type="button" class="cs__pn-btn" data-step="-1">
          <span class="cs__pn-dir">${ICON.left}Previous</span>
          <span class="cs__pn-name">${esc(prev.name)}</span>
        </button>
        <button type="button" class="cs__pn-btn cs__pn-btn--next" data-step="1">
          <span class="cs__pn-dir">Next${ICON.rightSm}</span>
          <span class="cs__pn-name">${esc(next.name)}</span>
        </button>
      </nav>
    </article>`;
  }

  const isOpen = () => sheet.classList.contains("is-open");

  function lock(on) {
    if (on) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      lockPad = document.body.style.paddingRight;
      if (gap > 0) document.body.style.paddingRight = gap + "px";
      document.body.classList.add("is-locked");
    } else {
      document.body.classList.remove("is-locked");
      document.body.style.paddingRight = lockPad;
    }
  }

  function openSheet(idx) {
    const p = PROJECTS[idx];
    if (!isOpen()) {
      lastFocus = document.activeElement;
      sheet.classList.add("is-open");
      sheet.setAttribute("aria-hidden", "false");
      lock(true);
      $$("body > :not(.sheet):not(script)").forEach((el) => (el.inert = true));
      panel.focus({ preventScroll: true });
    }
    current = idx;
    content.innerHTML = caseHTML(p, idx);
    $("#sheetNum").textContent = pad(idx + 1);
    panel.scrollTop = 0;
    progress.style.transform = "scaleX(0)";
    document.title = p.name + " — Muhammad Siddiq";
  }

  function closeSheet() {
    if (!isOpen()) return;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    $$("body > :not(.sheet):not(script)").forEach((el) => (el.inert = false));
    lock(false);
    current = -1;
    document.title = HOME_TITLE;
    if (lastFocus && document.contains(lastFocus) && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function route() {
    const m = location.hash.match(/^#work\/([\w-]+)$/);
    const idx = m ? PROJECTS.findIndex((p) => p.slug === m[1]) : -1;
    if (idx >= 0) openSheet(idx);
    else closeSheet();
  }

  // leaving a case study returns the URL to #work without a scroll jump
  function leave() {
    history.pushState(null, "", "#work");
    closeSheet();
  }

  // previous / next swap the case in place, so Back still closes the sheet
  function step(dir) {
    if (current < 0) return;
    const idx = wrap(current + dir);
    history.replaceState(null, "", "#work/" + PROJECTS[idx].slug);
    openSheet(idx);
  }

  sheet.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return leave();
    const s = e.target.closest("[data-step]");
    if (s) step(Number(s.dataset.step));
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      leave();
      return;
    }
    if (e.key !== "Tab") return;
    // keep focus inside the dialog
    const f = $$('a[href], button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])', panel).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    const active = document.activeElement;
    if (!panel.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    } else if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // thin reading-progress bar under the sticky bar
  panel.addEventListener(
    "scroll",
    () => {
      const max = panel.scrollHeight - panel.clientHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, panel.scrollTop / max) : 0) + ")";
    },
    { passive: true }
  );

  window.addEventListener("hashchange", route);
  route();

  /* ---------- reveal on scroll ---------- */
  const rv = $$(".rv");
  if (reduce || !("IntersectionObserver" in window)) {
    rv.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    rv.forEach((el) => io.observe(el));
  }

  /* ---------- evaluation figures: count up once, on first view ---------- */
  const counters = $$("[data-count]");
  const fmt = (el, v) => (el.dataset.pre || "") + v.toFixed(Number(el.dataset.dec) || 0) + (el.dataset.suf || "");
  function countUp(el) {
    const to = parseFloat(el.dataset.count);
    const t0 = performance.now();
    const dur = 1600;
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(el, to * e);
      if (k < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(el, to);
    })(t0);
  }
  if (!reduce && "IntersectionObserver" in window && counters.length) {
    counters.forEach((el) => {
      el.parentElement.setAttribute("aria-label", el.parentElement.textContent.trim().replace(/\s+/g, ""));
      el.setAttribute("aria-hidden", "true");
      el.textContent = fmt(el, 0);
    });
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          co.unobserve(en.target);
          countUp(en.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    counters.forEach((el) => co.observe(el));
  }


  /* ---------- motion layer: scroll progress, nav, split titles, staggers, tilt, magnets, parallax ---------- */
  (function motion() {
    if (reduce || !("IntersectionObserver" in window)) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const root = document.documentElement;

    // page scroll progress + nav that hides on the way down, returns on the way up
    const bar = document.createElement("div");
    bar.className = "scrollbar";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    const nav = $("#nav");
    const hero = $(".hero__title");
    let lastY = window.scrollY;
    let ticking = false;
    function onScroll() {
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      if (nav) {
        nav.classList.toggle("is-scrolled", y > 8);
        nav.classList.toggle("is-hidden", y > 240 && y > lastY && !document.body.classList.contains("is-locked"));
      }
      if (hero && y < window.innerHeight * 1.2) {
        hero.style.transform = "translate3d(0," + y * 0.06 + "px,0)";
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // split big titles into words that rise into place
    $$(".head__title, .proof__title, .contact__title").forEach((t) => {
      const words = t.textContent.trim().split(/\s+/);
      t.setAttribute("aria-label", t.textContent.trim());
      t.innerHTML = words
        .map((w, i) => `<span class="w" aria-hidden="true"><span class="w__in" style="--i:${i}">${esc(w)}</span></span>`)
        .join(" ");
      t.classList.add("split");
    });

    // everything that should arrive in sequence
    const groups = [
      [".split", 0],
      [".eyebrow", 0],
      [".head__lead, .proof__lead, .contact__lead", 0],
      [".card", 90],
      [".slide", 80],
      [".kit", 60],
      [".cred", 60],
      [".tl", 120],
      [".process__step", 0],
      [".contact__mail, .contact__actions", 120],
    ];
    const seen = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          seen.unobserve(en.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    groups.forEach(([sel, step]) => {
      $$(sel).forEach((el, i) => {
        el.classList.add("m-in");
        if (step) el.style.setProperty("--d", ((i % 4) * step) + "ms");
        seen.observe(el);
      });
    });
    $$(".kit").forEach((k) => $$(".kit__chips li", k).forEach((c, i) => c.style.setProperty("--c", i)));

    if (!fine) return;

    // cards: soft spotlight that follows the pointer + a slight tilt
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
        card.style.setProperty("--rx", ((0.5 - y) * 4).toFixed(2) + "deg");
        card.style.setProperty("--ry", ((x - 0.5) * 5).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });

    // magnetic buttons
    $$(".btn--ink, .btn--line, .btn--cream, .contact__mail-arrow, .card__arrow").forEach((el) => {
      const host = el.closest(".card") || el;
      host.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${Math.max(-8, Math.min(8, dx * 0.2))}px, ${Math.max(-8, Math.min(8, dy * 0.25))}px)`;
      });
      host.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  })();

  /* ---------- copy email ---------- */
  const copy = $("#copyMail");
  const copyLabel = $("#copyLabel");
  let copyTimer = null;
  function copied(ok) {
    copyLabel.textContent = ok ? "Copied" : "Copy failed";
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copyLabel.textContent = "Copy email"), 2200);
  }
  // older or non-secure contexts have no async clipboard: fall back to a hidden textarea
  function legacyCopy(text) {
    const t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.className = "visually-hidden";
    document.body.appendChild(t);
    t.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    t.remove();
    return ok;
  }
  copy.addEventListener("click", () => {
    const mail = copy.dataset.mail || MAIL;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(mail).then(
        () => copied(true),
        () => copied(legacyCopy(mail))
      );
    } else {
      copied(legacyCopy(mail));
    }
  });

  /* ---------- footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();

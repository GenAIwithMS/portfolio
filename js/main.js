/* =====================================================================
   MAIN — project cards, case study sheet, hero preview, small niceties
   Project content lives in js/projects.js (window.PROJECTS)
   ===================================================================== */
(function () {
  "use strict";

  const PROJECTS = window.PROJECTS || [];
  const MAIL = "muhammadsiddiq.code@gmail.com";
  const HOME_TITLE = document.title;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  // content strings may use **bold** and `code`
  const rich = (s) =>
    esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`(.+?)`/g, "<code>$1</code>");

  // soft card colours, cycled through the project list
  const TINTS = ["mint", "peach", "lavender", "sky", "butter", "rose"];
  const tint = (i) => `var(--t-${TINTS[i % TINTS.length]})`;

  const ARROW =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$(".nav__links a");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  navLinks.forEach((a) => {
    const sec = $(a.getAttribute("href"));
    if (sec) spy.observe(sec);
  });

  /* ---------- project cards + filters ---------- */
  const cards = $("#cards");
  cards.innerHTML = PROJECTS.map(
    (p, i) => `
    <a class="card rv" href="#work/${p.slug}" data-tags="${esc(p.tags.join(","))}" style="--tint:${tint(i)}">
      <span class="card__top">
        <span class="card__num">${pad(i + 1)}</span>
        <span class="card__cat">${p.status ? `<span class="pill">${esc(p.status)}</span> ` : ""}${esc(p.category)}</span>
      </span>
      <h3 class="card__title">${esc(p.name)}</h3>
      <span class="card__role">${esc(p.role)}</span>
      <dl class="card__facts">
        <div class="card__fact"><dt>Problem</dt><dd>${esc(p.problemShort)}</dd></div>
        <div class="card__fact"><dt>Result</dt><dd>${esc(p.resultShort)}</dd></div>
      </dl>
      <span class="card__foot">Read case study <span class="circle" aria-hidden="true">${ARROW}</span></span>
    </a>`
  ).join("");

  const counts = { All: PROJECTS.length };
  PROJECTS.forEach((p) => p.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const filters = $("#filters");
  filters.innerHTML = Object.keys(counts)
    .map(
      (t, i) =>
        `<button class="filter" type="button" aria-pressed="${i === 0}" data-tag="${esc(t)}">${esc(t)}<small>${counts[t]}</small></button>`
    )
    .join("");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter", filters).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    const tag = btn.dataset.tag;
    $$(".card", cards).forEach((c) => {
      c.hidden = tag !== "All" && !c.dataset.tags.split(",").includes(tag);
      c.classList.add("is-in");
    });
  });

  /* ---------- hero preview (problem → result) ---------- */
  (function preview() {
    if (!PROJECTS.length) return;
    const card = $("#preview");
    const body = $("#previewBody");
    const dots = $("#previewDots");
    dots.innerHTML = PROJECTS.map(() => "<span></span>").join("");
    let i = -1;
    let timer = null;

    function show(n) {
      i = (n + PROJECTS.length) % PROJECTS.length;
      const p = PROJECTS[i];
      body.classList.add("is-out");
      setTimeout(
        () => {
          $("#previewProblem").textContent = p.problemShort;
          $("#previewResult").textContent = p.resultShort;
          $("#previewName").textContent = p.name;
          $("#previewCount").textContent = "Case " + pad(i + 1);
          card.setAttribute("href", "#work/" + p.slug);
          card.setAttribute("aria-label", "Case study: " + p.name);
          $$("span", dots).forEach((d, k) => d.classList.toggle("is-on", k === i));
          body.classList.remove("is-out");
        },
        reduce ? 0 : 300
      );
    }
    const start = () => { if (!reduce && !timer) timer = setInterval(() => show(i + 1), 5000); };
    const stop = () => { clearInterval(timer); timer = null; };

    show(0);
    start();
    card.addEventListener("mouseenter", stop);
    card.addEventListener("mouseleave", start);
    card.addEventListener("focus", stop);
    card.addEventListener("blur", start);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  })();

  /* ---------- case study sheet ---------- */
  const sheet = $("#sheet");
  const panel = $("#sheetPanel");
  const content = $("#sheetContent");
  const progress = $("#sheetProgress");
  let lastFocus = null;

  const flowHTML = (flow) =>
    flow
      .map((n, k) => {
        const key = n.startsWith("*");
        const label = key ? n.slice(1) : n;
        return (
          '<span class="flow__pair">' +
          (k ? `<span class="flow__arrow" aria-hidden="true">${ARROW}</span>` : "") +
          `<span class="flow__node${key ? " is-key" : ""}">${esc(label)}</span></span>`
        );
      })
      .join("");

  function caseHTML(p, idx) {
    const next = PROJECTS[(idx + 1) % PROJECTS.length];
    const links = (p.links || [])
      .map((l) => `<a class="btn btn--dark btn--small" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ${ARROW}</a>`)
      .join("");
    const subject = encodeURIComponent("Something like " + p.name);
    return `
    <article class="cs">
      <header class="cs__hero" style="--tint:${tint(idx)}">
      <span class="cs__cat">${esc(p.category)}${p.status ? ` <span class="pill">${esc(p.status)}</span>` : ""}</span>
      <h2 class="cs__title" id="csTitle">${esc(p.name)}</h2>
      <p class="cs__summary">${rich(p.summary)}</p>

      <dl class="cs__facts">
        <div class="cs__fact"><dt>My role</dt><dd>${esc(p.role)}</dd></div>
        <div class="cs__fact"><dt>Type</dt><dd>${esc(p.type)}</dd></div>
        <div class="cs__fact"><dt>Built for</dt><dd>${esc(p.audience)}</dd></div>
      </dl>
      ${links ? `<div class="cs__links">${links}</div>` : ""}
      </header>

      <section class="cs__part">
        <div class="cs__step"><b>01</b><span>The problem</span></div>
        <div>
          <h3 class="cs__h">${esc(p.problem.title)}</h3>
          ${p.problem.body.map((t) => `<p class="cs__p">${rich(t)}</p>`).join("")}
        </div>
      </section>

      <section class="cs__part">
        <div class="cs__step"><b>02</b><span>The plan</span></div>
        <div>
          <h3 class="cs__h">${esc(p.plan.title)}</h3>
          ${p.plan.body.map((t) => `<p class="cs__p">${rich(t)}</p>`).join("")}
          <ul class="cs__list">${p.plan.steps.map((t) => `<li>${rich(t)}</li>`).join("")}</ul>
          <div class="flow">
            <p class="flow__cap">How it fits together</p>
            <div class="flow__track">${flowHTML(p.flow)}</div>
          </div>
          <div class="stack">${p.stack.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </div>
      </section>

      <section class="cs__part">
        <div class="cs__step"><b>03</b><span>The outcome</span></div>
        <div>
          <h3 class="cs__h">${esc(p.outcome.title)}</h3>
          ${p.outcome.body.map((t) => `<p class="cs__p">${rich(t)}</p>`).join("")}
          <ul class="cs__list cs__list--check">${p.outcome.points.map((t) => `<li>${rich(t)}</li>`).join("")}</ul>
        </div>
      </section>

      <aside class="cs__value">
        <span class="label">What this means for you</span>
        <p>${esc(p.value)}</p>
        <a class="btn btn--lime" href="mailto:${MAIL}?subject=${subject}">Let&rsquo;s talk about yours ${ARROW}</a>
      </aside>
    </article>
    <a class="cs__next" href="#work/${next.slug}">
      <span><small class="label">Next case study</small><strong>${esc(next.name)}</strong></span>
      <span class="circle" aria-hidden="true">${ARROW}</span>
    </a>`;
  }

  function openSheet(slug) {
    const idx = PROJECTS.findIndex((p) => p.slug === slug);
    if (idx < 0) return closeSheet(true);
    const wasOpen = sheet.classList.contains("is-open");
    if (!wasOpen) lastFocus = document.activeElement;
    content.innerHTML = caseHTML(PROJECTS[idx], idx);
    $("#sheetCrumb").textContent = "Case study " + pad(idx + 1) + " / " + pad(PROJECTS.length);
    panel.scrollTop = 0;
    progress.style.transform = "scaleX(0)";
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    document.title = PROJECTS[idx].name + " — Muhammad Siddiq";
    panel.focus({ preventScroll: true });
  }

  function closeSheet(silent) {
    if (!sheet.classList.contains("is-open")) return;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    document.title = HOME_TITLE;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (!silent) return;
  }

  function route() {
    const m = location.hash.match(/^#work\/([\w-]+)$/);
    if (m) openSheet(m[1]);
    else closeSheet(true);
  }

  // leaving a case study returns to the work section without a scroll jump
  function leave() {
    history.pushState(null, "", "#work");
    route();
  }

  sheet.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) leave();
  });
  document.addEventListener("keydown", (e) => {
    if (!sheet.classList.contains("is-open")) return;
    if (e.key === "Escape") leave();
    if (e.key === "Tab") {
      // keep focus inside the dialog
      const f = $$('a[href], button:not([disabled])', panel);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  panel.addEventListener(
    "scroll",
    () => {
      const max = panel.scrollHeight - panel.clientHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? panel.scrollTop / max : 0) + ")";
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
      { rootMargin: "0px 0px -8% 0px" }
    );
    rv.forEach((el) => io.observe(el));
  }

  /* ---------- copy email ---------- */
  const copy = $("#copyMail");
  copy.addEventListener("click", () => {
    const done = () => {
      copy.textContent = "Copied ✓";
      copy.classList.add("is-done");
      setTimeout(() => {
        copy.textContent = "Copy email";
        copy.classList.remove("is-done");
      }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(copy.dataset.mail).then(done, () => {});
  });

  $("#year").textContent = new Date().getFullYear();
})();

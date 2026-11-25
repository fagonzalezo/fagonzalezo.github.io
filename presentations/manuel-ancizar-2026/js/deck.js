/* Deck engine.
   - Diagrams: <div data-diagram="name" data-opts='{"k":1}'></div>. Renderers register with
     DG.register(name, (el, opts) => ({ step(k) {...} }))  (returning an object is optional).
     step(k) is called on entering the slide and on every fragment change, with k = number of
     visible fragments in the slide (0 before the first click). Use <span class="fragment step">
     as invisible click triggers when only a diagram changes.
   - Images: <img data-img="assets/img/x.jpg" alt="…">: on error it becomes a labelled placeholder.
   - Videos: <div class="video" data-youtube="ID" data-start="0" data-poster="assets/img/x.jpg">.
     Click the poster to load the player. VIDEO_LOCAL in config.js maps an ID to a local file.
   - Rule badge: <div class="rule-badge"></div> is filled with the standard wording.
   - URL flags: ?draft (VERIFY badges) · ?skip=3-05,6-02 · ?static (all fragments shown) · ?check */
(function () {
  const cfg = window.DECK_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const root = document.documentElement;

  const DG = window.DG;

  // ---------------- flags ----------------
  if (cfg.DRAFT || params.has("draft")) root.classList.add("draft");
  if (params.has("static") || params.has("check") || params.has("print-pdf")) root.classList.add("static");
  const skip = new Set((cfg.SKIP || []).concat((params.get("skip") || "").split(",").filter(Boolean)));

  const sections = Array.from(document.querySelectorAll(".reveal .slides > section"));
  sections.forEach((sec) => {
    if (skip.has(sec.dataset.id)) sec.setAttribute("data-visibility", "hidden");
    if (sec.dataset.verify) {
      const b = document.createElement("div");
      b.className = "verify-badge";
      b.textContent = (sec.dataset.id || "") + " · VERIFY: " + sec.dataset.verify;
      sec.appendChild(b);
    }
  });

  // ---------------- icons ----------------
  document.querySelectorAll("i[data-icon]").forEach((el) => {
    if (window.icon) el.outerHTML = window.icon(el.dataset.icon, Number(el.dataset.size || 40));
  });

  // ---------------- rule badge ----------------
  document.querySelectorAll(".rule-badge:empty").forEach((el) => {
    el.innerHTML = '<b>nuevo</b> = viejo + un paso × (<span class="d">lo que pasó − lo que esperaba</span>)';
  });

  // ---------------- images ----------------
  document.querySelectorAll("img[data-img]").forEach((img) => {
    img.onerror = () => {
      const d = document.createElement("div");
      d.className = "missing-img " + img.className;
      d.style.cssText = img.style.cssText + ";width:100%;height:100%";
      d.textContent = (img.alt || "imagen") + " · " + img.dataset.img.split("/").pop();
      img.replaceWith(d);
    };
    img.src = img.dataset.img;
  });

  // ---------------- videos ----------------
  const localVideo = cfg.VIDEO_LOCAL || {};
  document.querySelectorAll(".video[data-youtube], .video[data-vimeo]").forEach((el) => {
    const id = el.dataset.youtube || el.dataset.vimeo;
    const vimeo = !el.dataset.youtube;
    const poster = el.dataset.poster;
    el.innerHTML = `<div class="poster">${poster ? `<img src="${poster}" alt="">` : ""}</div>`;
    el.querySelector(".poster").addEventListener("click", () => {
      el.innerHTML = localVideo[id]
        ? `<video src="${localVideo[id]}" autoplay controls></video>`
        : vimeo
          ? `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1#t=${el.dataset.start || 0}s" allow="autoplay; fullscreen" allowfullscreen></iframe>`
          : `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&start=${el.dataset.start || 0}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    });
  });

  // ---------------- diagrams ----------------
  const mounted = []; // {sec, api}
  document.querySelectorAll("[data-diagram]").forEach((el) => {
    const fn = DG.registry[el.dataset.diagram];
    if (!fn) { el.textContent = "falta el diagrama: " + el.dataset.diagram; el.style.color = "var(--bad)"; return; }
    let opts = {};
    try { opts = el.dataset.opts ? JSON.parse(el.dataset.opts) : {}; } catch (e) { console.error("bad data-opts", el, e); }
    el.classList.add("dg-mount");
    let api;
    try { api = fn(el, opts) || {}; } catch (e) { console.error(e); el.textContent = "error: " + el.dataset.diagram; return; }
    mounted.push({ sec: el.closest(".slides > section"), api, el });
  });

  function stepOf(sec) {
    return sec ? sec.querySelectorAll(".fragment.visible").length : 0;
  }
  function dispatch(sec, entering) {
    const k = DG.isStatic() ? 999 : stepOf(sec);
    mounted.forEach((m) => {
      if (m.sec !== sec || !m.api.step) return;
      try { m.api.step(k, { entering }); } catch (e) { console.error(e); }
    });
  }

  // ---------------- reveal ----------------
  const deck = new Reveal({
    width: 1920, height: 1080, margin: 0, minScale: 0.1, maxScale: 3,
    center: false, hash: true, fragmentInURL: true, controls: false, progress: true,
    slideNumber: "c/t", transition: "fade", transitionSpeed: "fast", backgroundTransition: "fade",
    navigationMode: "linear", pdfSeparateFragments: false,
    plugins: window.RevealNotes ? [RevealNotes] : [],
  });
  window.deck = deck;

  deck.on("ready", (e) => {
    // initial state of every diagram, then the current slide
    mounted.forEach((m) => m.api.step && m.api.step(DG.isStatic() ? 999 : 0, { entering: false }));
    dispatch(e.currentSlide, true);
    if (params.has("check")) setTimeout(runCheck, 600);
  });
  deck.on("slidechanged", (e) => dispatch(e.currentSlide, true));
  deck.on("fragmentshown", () => dispatch(deck.getCurrentSlide(), false));
  deck.on("fragmenthidden", () => dispatch(deck.getCurrentSlide(), false));
  deck.initialize();

  // ?check: lists elements that spill outside their slide, and overflowing boxes
  function runCheck() {
    const out = [];
    const scale = deck.getScale();
    sections.forEach((sec) => {
      if (sec.getAttribute("data-visibility") === "hidden") return;
      const id = sec.dataset.id;
      const was = sec.style.display;
      const sr = sec.getBoundingClientRect();
      const tol = 2 * scale;
      sec.querySelectorAll(".frame *").forEach((el) => {
        if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (r.left < sr.left - tol || r.right > sr.right + tol || r.top < sr.top - tol || r.bottom > sr.bottom + tol)
          out.push({ id, kind: "outside", el: desc(el) });
      });
      sec.querySelectorAll(".panel, .sheet, .frame").forEach((el) => {
        if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
          out.push({ id, kind: "overflow", el: desc(el), by: [el.scrollWidth - el.clientWidth, el.scrollHeight - el.clientHeight] });
      });
      sec.style.display = was;
    });
    const pre = document.createElement("pre");
    pre.id = "check-report";
    pre.style.display = "none";
    pre.textContent = JSON.stringify({ slides: deck.getTotalSlides(), problems: out });
    document.body.appendChild(pre);
  }
  function desc(el) {
    const c = el.className && el.className.baseVal != null ? el.className.baseVal : el.className;
    return (el.tagName.toLowerCase() + "." + c).slice(0, 60) + " «" + (el.textContent || "").trim().slice(0, 40) + "»";
  }
})();

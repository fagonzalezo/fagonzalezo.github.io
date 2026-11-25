/* Act 5 · De chatbots a agentes (slides 5-00 – 5-10).

   Reusable diagrams (other acts may use these):

   act5-stairs   the six-step staircase 2022–2026 (5-03), and its corner copy.
                 opts: mini     true → small copy placed in the top-right corner of the frame
                                (absolute; pass "inline":true to keep it in the flow)
                       lit      step to highlight (1..6); 0 / absent → all steps equal
                       litSeq   [lit at k=0, lit at k=1, …] (overrides lit, per fragment step)
                       next     true → one more, dashed step «¿siguiente?» (alias: sixth)
                       loop     true → a dashed arrow from the last step back to the first
                       loopAt   fragment step at which the loop appears (default 0)
                       loopLabel text under the loop arrow
                       rope     false → no braided rope along the top (full size only)
                       w, h     size of the full diagram (default 1700 × 700)
   act5-loop     the agent loop (5-05, 5-10): agent box above, world box below,
                 arrow «actúa» going down on the left, «percibe» going up on the right.
                 opts: agentLabel   "modelo" (default) · agentIcon "net" | "cat"
                       worldLabel   "mundo" (default)
                       worldContent "tools" | "thorndike-box" | "terminal"
                       pulseAt      fragment step from which a dot runs around the loop (omit: never)
                       w, h         default 760 × 640
   Act-only: act5-braid (5-02), act5-ground (5-04), act5-think (5-06), act5-terminal (5-08),
             act5-metr (5-09), act5-catcurve (5-07). */
(function () {
  // =====================================================================================
  // DATA · METR 50 % time horizon (minutes), for 5-09. Redrawn, not METR's image.
  // Up to Nov 2025: TH1.1 suite (metr.org/assets/benchmark_results_1_1.yaml, CC BY 4.0).
  // From 2026: pooled TH1.1 + TH2 (METR Q4 2026 capability update, 20-11-2026, Fig. 10 JSON).
  // lo/hi = 95 % CI. Source: scratchpad/facts-modern.md §7 (checked 23-11-2026).
  // =====================================================================================
  const DATA = [
    { model: "GPT-2",             date: "2019-02-14", min: 0.054, lo: 0.010, hi: 0.142, suite: "TH1.1" },
    { model: "GPT-3",             date: "2020-05-28", min: 0.144, lo: 0.093, hi: 0.222, suite: "TH1.1" },
    { model: "GPT-3.5",           date: "2022-03-15", min: 0.60,  lo: 0.26,  hi: 1.12,  suite: "TH1.1" },
    { model: "GPT-4",             date: "2023-03-14", min: 4.0,   lo: 1.9,   hi: 8.0,   suite: "TH1.1" },
    { model: "o1",                date: "2024-12-05", min: 38.8,  lo: 21.2,  hi: 65.0,  suite: "TH1.1" },
    { model: "Claude 3.7 Sonnet", date: "2025-02-24", min: 60.4,  lo: 33.0,  hi: 104.2, suite: "TH1.1" },
    { model: "o3",                date: "2025-04-16", min: 119.7, lo: 74.6,  hi: 190.9, suite: "TH1.1" },
    { model: "GPT-5",             date: "2025-08-07", min: 203,   lo: 113,   hi: 406,   suite: "TH1.1" },
    { model: "Claude Opus 4.5",   date: "2025-11-24", min: 293,   lo: 162,   hi: 624,   suite: "TH1.1" },
    { model: "Claude Opus 4.6",   date: "2026-02-05", min: 384,   lo: 192,   hi: 732,   suite: "TH1.1+TH2" },
    { model: "Claude Opus 5",     date: "2026-07-24", min: 1194,  lo: 570,   hi: 5178,  suite: "TH1.1+TH2" },
    { model: "GPT-6 Astra",       date: "2026-09-03", min: 2418,  lo: 792,   hi: 158700, suite: "TH1.1+TH2" },
    { model: "Claude Opus 5.5",   date: "2026-09-22", min: 2340,  lo: 714,   hi: 75180,  suite: "TH1.1+TH2" },
  ];
  // METR's fit to frontier models, pooled suite: 8.1 min (2024-05-13) → 1643 min (2026-09-03),
  // doubling every 3.61 months (95 % CI 2.08–4.94).
  const FIT = { d0: "2024-05-13", m0: 8.1, d1: "2026-09-03", m1: 1643 };

  // theme.css sets `svg.dg text { fill: var(--ink) }`, which beats a fill attribute: move it to style.
  const el = (tag, a, parent) => {
    if (tag === "text" && a && a.fill) { a = Object.assign({}, a); a.style = "fill:" + a.fill + ";" + (a.style || ""); delete a.fill; }
    return DG.el(tag, a, parent);
  };
  const html = (tag, cls, parent, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.innerHTML = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  function icon(parent, name, x, y, size, color, sw) {
    const s = size / 24;
    return el("g", {
      html: (window.ICONS && window.ICONS[name]) || "", transform: `translate(${x},${y}) scale(${s})`,
      fill: "none", stroke: color || "var(--ink-2)", "stroke-width": (sw || 2) / s * s, "stroke-linecap": "round", "stroke-linejoin": "round",
    }, parent);
  }
  function arrowHead(parent, x, y, angle, size, color) {
    const a = angle, s = size || 18;
    const p = (da, r) => `${(x + r * Math.cos(a + da)).toFixed(1)},${(y + r * Math.sin(a + da)).toFixed(1)}`;
    return el("path", { d: `M${p(0, 0)} L${p(Math.PI - 0.45, s)} L${p(Math.PI + 0.45, s)} Z`, fill: color || "var(--ink)" }, parent);
  }
  const ORDER = ["act", "brain", "opt", "comp"];

  // A braided rope of the four strands along a polyline (used by the staircase).
  function chaikin(pts, n) {
    for (let k = 0; k < n; k++) {
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [a, b] = [pts[i], pts[i + 1]];
        out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
      }
      out.push(pts[pts.length - 1]);
      pts = out;
    }
    return pts;
  }
  function ropeAlong(parent, pts, o) {
    pts = chaikin(pts, 4);
    // resample by arc length
    const seg = [0];
    for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = seg[seg.length - 1], step = 3, res = [];
    let j = 0;
    for (let s = 0; s <= L; s += step) {
      while (j < seg.length - 2 && seg[j + 1] < s) j++;
      const t = (s - seg[j]) / (seg[j + 1] - seg[j] || 1);
      res.push([pts[j][0] + t * (pts[j + 1][0] - pts[j][0]), pts[j][1] + t * (pts[j + 1][1] - pts[j][1]), s]);
    }
    const amp = o.amp || 8, wl = o.wl || 90;
    ORDER.forEach((st, k) => {
      let d = "";
      res.forEach((p, i) => {
        const q = res[Math.min(i + 1, res.length - 1)], r = res[Math.max(i - 1, 0)];
        let nx = -(q[1] - r[1]), ny = q[0] - r[0];
        const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const fade = Math.min(1, p[2] / 60);               // strands start apart and come together
        const spread = (k - 1.5) * 9 * (1 - fade);
        const off = amp * fade * Math.sin((p[2] / wl) * 2 * Math.PI + (k * Math.PI) / 2) + spread;
        d += (i ? "L" : "M") + (p[0] + nx * off).toFixed(1) + " " + (p[1] + ny * off).toFixed(1);
      });
      el("path", { d, fill: "none", stroke: `var(--${st})`, "stroke-width": o.stroke || 4.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
    });
  }

  // =====================================================================================
  // act5-stairs
  // =====================================================================================
  const STEPS = [
    { name: ["Chatbot"], years: "2022" },
    { name: ["Con fuentes"], years: "2023" },
    { name: ["Usa", "herramientas"], years: "2023–2024" },
    { name: ["Razona"], years: "2024–2025" },
    { name: ["Programa"], years: "2025" },
    { name: ["Trabaja", "horas, solo"], years: "2025–2026" },
    { name: ["¿siguiente?"], years: "", future: true },
  ];
  const NSTEPS = STEPS.filter((s) => !s.future).length;   // the real steps (6)
  DG.register("act5-stairs", (mount, o) => {
    const n = o.next || o.sixth ? NSTEPS + 1 : NSTEPS;
    const litAt = (k) => (o.litSeq ? o.litSeq[Math.min(k, o.litSeq.length - 1)] : o.lit || 0);
    if (o.mini) return miniStairs(mount, o, n, litAt);
    const W = o.w || 1700, H = o.h || 700;
    const svg = DG.svg(mount, W, H, "act5-stairs");
    const X0 = 70, GAP = 14, BASE = o.loop ? H - 170 : H - 40;
    const SW = (W - X0 - 10) / n;
    const hMin = 150, hMax = BASE - 70;
    const hgt = (i) => hMin + (i * (hMax - hMin)) / (n - 1);
    const left = (i) => X0 + i * SW + GAP / 2, top = (i) => BASE - hgt(i), bw = SW - GAP;

    // axes
    el("path", { d: `M${X0 - 30} ${BASE} H${W}`, stroke: "var(--ink-4)", "stroke-width": 3 }, svg);
    el("path", { d: `M${X0 - 30} ${BASE} V${top(n - 1) - 10}`, stroke: "var(--ink-4)", "stroke-width": 3 }, svg);
    arrowHead(svg, X0 - 30, top(n - 1) - 24, -Math.PI / 2, 20, "var(--ink-4)");
    el("text", { x: 0, y: 0, transform: `translate(${X0 - 48},${BASE - 20}) rotate(-90)`, "font-size": 26, fill: "var(--ink-3)", text: "más autonomía" }, svg);

    const boxes = [];
    for (let i = 0; i < n; i++) {
      const s = STEPS[i], g = el("g", { style: "transition: opacity .5s" }, svg);
      const fs = n > NSTEPS ? 30 : 34, pad = n > NSTEPS ? 18 : 24;
      const r = el("rect", { x: left(i), y: top(i), width: bw, height: hgt(i), rx: 12, fill: s.future ? "none" : "var(--bg-2)", stroke: s.future ? "var(--ink-3)" : "var(--ink-4)", "stroke-width": s.future ? 3 : 2, "stroke-dasharray": s.future ? "12 10" : null, style: "transition: all .5s" }, g);
      const tx = left(i) + pad;
      if (s.years) el("text", { x: tx, y: top(i) + 48, "font-size": 26, "font-weight": 500, fill: "var(--ink-3)", text: s.years }, g);
      s.name.forEach((line, j) => el("text", { x: tx, y: top(i) + (s.years ? 96 : 60) + j * 40, "font-size": fs, "font-weight": 650, fill: s.future ? "var(--ink-2)" : "var(--ink)", text: line }, g));
      if (!s.future) el("text", { x: left(i) + bw - 22, y: BASE - 24, "text-anchor": "end", "font-size": n === NSTEPS && H >= 650 ? 96 : 64, class: "serif", "font-weight": 600, fill: "var(--ink-4)", text: i + 1 }, g);
      boxes.push({ g, r });
    }
    // the braided rope climbs the stairs (the four strands of 5-02, still growing)
    if (o.rope !== false) {
      const m = Math.min(n, NSTEPS), pts = [[X0 - 10, top(0) - 16]];
      for (let i = 0; i < m; i++) { pts.push([left(i) + 4, top(i) - 16], [left(i) + bw - 4, top(i) - 16]); }
      pts.push([left(m - 1) + bw + 4, top(m - 1) - 16]);
      ropeAlong(el("g", {}, svg), pts, { amp: 7, wl: 80, stroke: 4 });
    }
    // loop arrow: the last step feeds back into the first
    let loopG = null;
    if (o.loop) {
      loopG = el("g", { style: "transition: opacity .6s" }, svg);
      const x1 = left(n - 1) + bw / 2, x2 = left(0) + bw / 2, y = BASE + 14;
      el("path", { d: `M${x1} ${y} C${x1 - 120} ${y + 150} ${x2 + 120} ${y + 150} ${x2} ${y + 14}`, fill: "none", stroke: "var(--ink-2)", "stroke-width": 4, "stroke-dasharray": "3 12", "stroke-linecap": "round" }, loopG);
      arrowHead(loopG, x2, y + 6, -Math.PI / 2 - 0.5, 22, "var(--ink-2)");
      el("text", { x: (x1 + x2) / 2, y: y + 150, "text-anchor": "middle", "font-size": 30, fill: "var(--ink-2)", text: o.loopLabel || "modelos mejores → agentes mejores → modelos mejores → …" }, loopG);
    }
    return {
      step(k) {
        const lit = litAt(k);
        boxes.forEach((b, i) => {
          const on = lit === i + 1, future = STEPS[i].future;
          b.g.style.opacity = !lit || on || future ? 1 : 0.45;
          if (!future) { b.r.setAttribute("stroke", on ? "var(--ink)" : "var(--ink-4)"); b.r.setAttribute("stroke-width", on ? 4 : 2); b.r.setAttribute("fill", on ? "var(--bg-3)" : "var(--bg-2)"); }
        });
        if (loopG) loopG.style.opacity = k >= (o.loopAt || 0) ? 1 : 0;
      },
    };
  });
  function miniStairs(mount, o, n, litAt) {
    if (!o.inline) mount.style.cssText += ";position:absolute;top:34px;right:44px;z-index:5;width:300px;height:132px";
    const W = 300, H = 132, B = 92, gap = 7, sw = (W - gap * (n - 1)) / n;
    const svg = DG.svg(mount, W, H, "act5-mini");
    const rects = [];
    for (let i = 0; i < n; i++) {
      const h = 20 + (i * 66) / (n - 1), fut = !!STEPS[i].future;
      rects.push(el("rect", { x: i * (sw + gap), y: B - h, width: sw, height: h, rx: 4, fill: fut ? "none" : "var(--ink-4)", stroke: fut ? "var(--ink-3)" : "none", "stroke-width": 2, "stroke-dasharray": fut ? "4 4" : null, style: "transition: fill .5s" }, svg));
    }
    const lab = el("text", { x: W, y: B + 34, "text-anchor": "end", "font-size": 22, "font-weight": 600, fill: "var(--ink-2)" }, svg);
    return {
      step(k) {
        const lit = litAt(k);
        rects.forEach((r, i) => { if (i < NSTEPS) r.setAttribute("fill", lit === i + 1 ? "var(--ink)" : lit && i + 1 < lit ? "var(--ink-3)" : "var(--ink-4)"); });
        lab.textContent = lit ? `${lit} · ${STEPS[lit - 1].name.join(" ")}` : "";
      },
    };
  }

  // =====================================================================================
  // act5-loop
  // =====================================================================================
  function catGlyph(g, cx, cy, s) {
    // a line-drawn cat head: face, ears, eyes, nose, whiskers
    const st = { fill: "none", stroke: "var(--ink)", "stroke-width": 3.5, "stroke-linecap": "round", "stroke-linejoin": "round" };
    el("path", Object.assign({ d: `M${cx - 30 * s} ${cy - 6 * s} L${cx - 30 * s} ${cy - 40 * s} L${cx - 12 * s} ${cy - 24 * s} Q${cx} ${cy - 28 * s} ${cx + 12 * s} ${cy - 24 * s} L${cx + 30 * s} ${cy - 40 * s} L${cx + 30 * s} ${cy - 6 * s} Q${cx + 32 * s} ${cy + 26 * s} ${cx} ${cy + 28 * s} Q${cx - 32 * s} ${cy + 26 * s} ${cx - 30 * s} ${cy - 6 * s} Z` }, st), g);
    el("ellipse", { cx: cx - 12 * s, cy: cy - 4 * s, rx: 3.5 * s, ry: 5.5 * s, fill: "var(--ink)" }, g);
    el("ellipse", { cx: cx + 12 * s, cy: cy - 4 * s, rx: 3.5 * s, ry: 5.5 * s, fill: "var(--ink)" }, g);
    el("path", { d: `M${cx - 4 * s} ${cy + 7 * s} h${8 * s} l${-4 * s} ${5 * s} Z`, fill: "var(--ink)" }, g);
    el("path", Object.assign({ d: `M${cx - 14 * s} ${cy + 12 * s} L${cx - 44 * s} ${cy + 6 * s} M${cx - 14 * s} ${cy + 16 * s} L${cx - 44 * s} ${cy + 20 * s} M${cx + 14 * s} ${cy + 12 * s} L${cx + 44 * s} ${cy + 6 * s} M${cx + 14 * s} ${cy + 16 * s} L${cx + 44 * s} ${cy + 20 * s}` }, st, { "stroke-width": 2 }), g);
  }
  function netGlyph(g, cx, cy, s) {
    // a tiny neural network: 3 – 4 – 2 nodes
    const cols = [[-1, 0, 1], [-1.5, -0.5, 0.5, 1.5], [-0.5, 0.5]], xs = [-40, 0, 40];
    const pos = cols.map((c, i) => c.map((v) => [cx + xs[i] * s, cy + v * 22 * s]));
    for (let i = 0; i < 2; i++) pos[i].forEach((a) => pos[i + 1].forEach((b) => el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "var(--ink-3)", "stroke-width": 1.6 }, g)));
    pos.flat().forEach((p) => el("circle", { cx: p[0], cy: p[1], r: 7 * s, fill: "var(--bg-2)", stroke: "var(--ink)", "stroke-width": 2.5 }, g));
  }
  DG.register("act5-loop", (mount, o) => {
    const W = o.w || 760, H = o.h || 640;
    const svg = DG.svg(mount, W, H, "act5-loop");
    const cx = W / 2;
    const aw = 330, ah = 140, ay = 8;
    const ww = 500, wh = 300, wy = H - wh - 8;
    const A = [cx - aw / 2, ay + ah * 0.55], B = [cx - ww / 2, wy + wh * 0.32];
    const C = [cx + ww / 2, wy + wh * 0.32], D = [cx + aw / 2, ay + ah * 0.55];
    const bulge = Math.min(150, (W - ww) / 2 - 14);
    const leftD = `M${A[0]} ${A[1]} C${A[0] - bulge - 40} ${A[1]} ${B[0] - bulge} ${B[1] - 120} ${B[0] - 6} ${B[1]}`;
    const rightD = `M${C[0] + 6} ${C[1]} C${C[0] + bulge} ${C[1] - 120} ${D[0] + bulge + 40} ${D[1]} ${D[0]} ${D[1]}`;
    // pulse path (drawn first so the boxes hide it while it passes "inside")
    const pulseG = el("g", { opacity: 0, style: "transition: opacity .5s" }, svg);
    const loopPath = `${leftD} L${C[0] + 6} ${C[1]} ${rightD.replace(/^M[^C]*/, "")} L${A[0]} ${A[1]}`;
    const dot = el("circle", { r: 13, fill: "var(--act)" }, pulseG);
    const anim = el("animateMotion", { dur: "4.5s", repeatCount: "indefinite", path: loopPath, rotate: "0" }, dot);

    const arrows = el("g", {}, svg);
    const la = el("path", { d: leftD, fill: "none", stroke: "var(--act)", "stroke-width": 6, "stroke-linecap": "round" }, arrows);
    arrowHead(arrows, B[0] - 4, B[1], 0.12, 26, "var(--act)");
    const ra = el("path", { d: rightD, fill: "none", stroke: "var(--act)", "stroke-width": 6, "stroke-linecap": "round" }, arrows);
    arrowHead(arrows, D[0] + 2, D[1], Math.PI, 26, "var(--act)");
    // labels just inside each arc, at its widest point
    const bz = (p0, p1, p2, p3, t) => p0 * (1 - t) ** 3 + 3 * p1 * t * (1 - t) ** 2 + 3 * p2 * t * t * (1 - t) + p3 * t ** 3;
    const lx = bz(A[0], A[0] - bulge - 40, B[0] - bulge, B[0] - 6, 0.5), ly = bz(A[1], A[1], B[1] - 120, B[1], 0.5);
    el("text", { x: lx + 26, y: ly + 12, "font-size": 36, "font-weight": 650, fill: "var(--ink)", text: o.actLabel || "actúa" }, svg);
    el("text", { x: W - lx - 26, y: ly + 12, "text-anchor": "end", "font-size": 36, "font-weight": 650, fill: "var(--ink)", text: o.perceiveLabel || "percibe" }, svg);

    // agent box
    el("rect", { x: cx - aw / 2, y: ay, width: aw, height: ah, rx: 18, fill: "var(--bg-2)", stroke: "var(--ink-3)", "stroke-width": 3 }, svg);
    const ag = el("g", {}, svg);
    if (o.agentIcon === "cat") catGlyph(ag, cx - 82, ay + ah / 2 + 6, 1.15);
    else netGlyph(ag, cx - 82, ay + ah / 2, 1);
    el("text", { x: cx - 14, y: ay + ah / 2 + 14, "font-size": 40, "font-weight": 650, fill: "var(--ink)", text: o.agentLabel || "modelo" }, svg);

    // world box
    el("rect", { x: cx - ww / 2, y: wy, width: ww, height: wh, rx: 18, fill: "var(--bg-2)", stroke: "var(--ink-3)", "stroke-width": 3 }, svg);
    el("text", { x: cx - ww / 2 + 26, y: wy + 44, "font-size": 28, "font-weight": 600, fill: "var(--ink-3)", "letter-spacing": "0.08em", text: (o.worldLabel || "mundo").toUpperCase() }, svg);
    const wc = o.worldContent || "tools";
    if (wc === "tools") {
      const items = [["wrench", "herramientas"], ["screen", "pantalla"], ["folder", "archivos"]];
      items.forEach(([ic, lab], i) => {
        const x = cx - ww / 2 + 90 + i * 160, y = wy + 150;
        if (ic === "screen") {
          el("rect", { x: x - 34, y: y - 40, width: 68, height: 48, rx: 5, fill: "none", stroke: "var(--ink-2)", "stroke-width": 4 }, svg);
          el("path", { d: `M${x - 16} ${y + 22} H${x + 16} M${x} ${y + 8} V${y + 22}`, stroke: "var(--ink-2)", "stroke-width": 4, "stroke-linecap": "round" }, svg);
        } else icon(svg, ic, x - 36, y - 46, 72, "var(--ink-2)", 2);
        el("text", { x, y: y + 76, "text-anchor": "middle", "font-size": 28, fill: "var(--ink-2)", text: lab }, svg);
      });
    } else if (wc === "thorndike-box") {
      const ih = wh - 92, iw = Math.round(ih * 463 / 362);
      const ix = cx - iw / 2, iy = wy + 70;
      el("rect", { x: ix - 8, y: iy - 8, width: iw + 16, height: ih + 16, rx: 6, fill: "var(--paper)" }, svg);
      el("image", { href: "assets/img/thorndike-box-drawing.png", x: ix, y: iy, width: iw, height: ih, preserveAspectRatio: "xMidYMid meet" }, svg);
    } else if (wc === "terminal") {
      const tx = cx - ww / 2 + 26, ty = wy + 66, tw = ww - 52, th = wh - 92;
      el("rect", { x: tx, y: ty, width: tw, height: th, rx: 10, fill: "var(--bg)", stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
      const lines = [["› ejecuta las pruebas", "var(--ink-2)"], ["  2 fallan", "var(--bad)"], ["› corrige", "var(--ink-2)"], ["  todas pasan ✓", "var(--act)"]];
      lines.forEach(([t, c], i) => el("text", { x: tx + 22, y: ty + 46 + i * 44, class: "mono", "font-size": 27, fill: c, "xml:space": "preserve", text: t }, svg));
    }
    return {
      step(k) {
        const on = o.pulseAt != null && k >= o.pulseAt;
        pulseG.setAttribute("opacity", on && !DG.isStatic() ? 1 : 0);
        la.setAttribute("stroke-width", on ? 8 : 6); ra.setAttribute("stroke-width", on ? 8 : 6);
      },
    };
  });

  // =====================================================================================
  // act5-braid (5-02): the strands join one by one into a rope that enters «LLM».
  // opts: order (join order, default brain, opt, comp, act) · lines (HTML ul to light, selector)
  // =====================================================================================
  DG.register("act5-braid", (mount, o) => {
    const W = o.w || 1700, H = o.h || 330;
    const svg = DG.svg(mount, W, H, "act5-braid");
    const joinOrder = o.order || ["brain", "opt", "comp", "act"];
    const gap = 62, cy = H / 2, x0 = 0, xJ = W * 0.30, xR = W * 0.58, xB = W - 330;
    const paths = {};
    ORDER.forEach((s) => { paths[s] = el("path", { fill: "none", stroke: `var(--${s})`, "stroke-width": 7, "stroke-linecap": "round", style: "transition: opacity .6s" }, svg); });
    // box
    const bx = xB, bw = 330, bh = 150;
    el("rect", { x: bx, y: cy - bh / 2, width: bw - 8, height: bh, rx: 20, fill: "var(--bg-2)", stroke: "var(--ink-2)", "stroke-width": 3 }, svg);
    const boxTxt = el("text", { x: bx + (bw - 8) / 2, y: cy + 16, "text-anchor": "middle", "font-size": 48, class: "serif", "font-weight": 600, fill: "var(--ink)", text: "LLM" }, svg);
    const amt = { act: 0, brain: 0, opt: 0, comp: 0 };
    const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
    function draw() {
      ORDER.forEach((s, i) => {
        const yb = cy + (i - 1.5) * gap, a = amt[s];
        const k = ORDER.indexOf(s);
        let d = "";
        const xEnd = a > 0 ? xJ + (bx + 4 - xJ) * a : xJ;
        for (let x = x0; x <= xEnd + 0.1; x += 6) {
          let y = yb + 5 * Math.sin(x / 70 + i * 1.7);
          const c = smooth((x - xJ) / (xR - xJ));
          const rope = cy + 26 * Math.sin(x / 34 + (k * Math.PI) / 2);
          y = y + (rope - y) * c;
          d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        }
        paths[s].setAttribute("d", d);
        paths[s].style.opacity = a > 0 ? 1 : 0.22;
      });
    }
    draw();
    const lines = o.lines ? Array.from(mount.closest("section").querySelectorAll(o.lines)) : [];
    let cancel = () => {};
    return {
      step(k, info) {
        const target = {};
        ORDER.forEach((s) => (target[s] = joinOrder.indexOf(s) < k ? 1 : 0));
        lines.forEach((li, i) => li.classList.toggle("on", i < k));
        boxTxt.style.fill = k >= 4 ? "var(--ink)" : "var(--ink-2)";
        cancel();
        const from = Object.assign({}, amt);
        if (info.entering || DG.isStatic()) { Object.assign(amt, target); draw(); return; }
        cancel = DG.animate(1300, (t) => { ORDER.forEach((s) => (amt[s] = from[s] + (target[s] - from[s]) * t)); draw(); });
      },
    };
  });

  // =====================================================================================
  // act5-ground (5-04): persona → modelo → respuesta; step 1 adds search/documents + citation.
  // =====================================================================================
  DG.register("act5-ground", (mount, o) => {
    mount.classList.add("act5-ground");
    mount.innerHTML = `
      <div class="who"><div class="face">${window.icon ? window.icon("user", 46) : ""}</div><div class="lab">persona</div></div>
      <div class="bubble q">¿A qué hora abre hoy la Biblioteca Central?</div>
      <div class="model">modelo</div>
      <div class="docs">${window.icon ? window.icon("search", 34) : ""}${window.icon ? window.icon("file-text", 34) : ""}<span>búsqueda<br>documentos</span></div>
      <div class="bubble a bad">«Abre a las 6:00 a. m.»<span class="qm">?</span></div>
      <div class="bubble a good">«Hoy abre a las 7:00 a. m.» <sup>[1]</sup><div class="cite">[1] Horarios · Biblioteca Central</div></div>`;
    const svg = DG.svg(mount, 860, 760, "act5-ground-arrows");
    svg.style.cssText = "position:absolute;left:0;top:0;pointer-events:none";
    const ar = (x1, y1, x2, y2, g) => { el("path", { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: "var(--ink-3)", "stroke-width": 4 }, g); arrowHead(g, x2, y2, Math.atan2(y2 - y1, x2 - x1), 18, "var(--ink-3)"); };
    ar(140, 175, 140, 268, svg);      // persona → modelo
    ar(140, 392, 140, 486, svg);      // modelo → respuesta
    const dg = el("g", { style: "transition: opacity .5s" }, svg);
    ar(300, 318, 452, 318, dg);       // modelo ⇄ documentos
    ar(452, 346, 300, 346, dg);
    const docs = mount.querySelector(".docs"), bad = mount.querySelector(".a.bad"), good = mount.querySelector(".a.good");
    return {
      step(k) {
        const g = k >= 1;
        docs.classList.toggle("on", g); good.classList.toggle("on", g); bad.classList.toggle("off", g);
        dg.style.opacity = g ? 1 : 0;
      },
    };
  });

  // =====================================================================================
  // act5-think (5-06): the "pensando…" block types itself out on step ≥ 1.
  // =====================================================================================
  const NB = " ";
  const TRACE = [
    [["Primera idea: 1000 pesos. "], ["Espera", "hl"], [`: entonces el cuaderno costaría 11${NB}000, y juntos 12${NB}000. No${NB}da.`]],
    [[`Si el lápiz cuesta x, el cuaderno cuesta x${NB}+${NB}10${NB}000. Juntos: 2x${NB}+${NB}10${NB}000${NB}=${NB}11${NB}000.`]],
    [[`x${NB}=${NB}500. Comprobación: 500${NB}+${NB}10${NB}500${NB}=${NB}11${NB}000. ✓`]],
  ];
  DG.register("act5-think", (mount, o) => {
    mount.classList.add("act5-think");
    const head = html("div", "head", mount, "pensando…");
    const chars = [];
    TRACE.forEach((line) => {
      const p = html("p", "", mount);
      line.forEach(([t, cls]) => {
        // the class goes on each character, so the highlight appears only as it is typed
        for (const ch of t) { const s = html("span", "ch" + (cls ? " " + cls : ""), p); s.textContent = ch; chars.push(s); }
      });
    });
    let timer = null, shown = 0;
    const show = (n) => { chars.forEach((c, i) => (c.style.visibility = i < n ? "visible" : "hidden")); shown = n; };
    show(0);
    return {
      step(k) {
        const on = k >= 1;
        mount.classList.toggle("on", on);
        if (!on) { if (timer) cancelAnimationFrame(timer); timer = null; show(0); return; }
        if (DG.isStatic()) { show(chars.length); return; }
        if (timer || shown >= chars.length) return;
        let t0 = null;
        const tick = (ts) => {
          if (t0 === null) t0 = ts - shown * 30;
          const n = Math.min(chars.length, Math.floor((ts - t0) / 30));
          show(n);
          timer = n < chars.length ? requestAnimationFrame(tick) : null;
        };
        timer = requestAnimationFrame(tick);
      },
    };
  });

  // =====================================================================================
  // act5-terminal (5-08): six lines appear one by one when the slide is entered.
  // =====================================================================================
  DG.register("act5-terminal", (mount, o) => {
    mount.classList.add("act5-term");
    html("div", "bar", mount, "<i></i><i></i><i></i><span>agente · proyecto</span>");
    const body = html("div", "body", mount);
    const LINES = [
      ["lee los archivos del proyecto", ""],
      ["escribe el cambio", ""],
      ["ejecuta las pruebas: 2 fallan ✗", "bad"],
      ["lee el error · corrige", ""],
      ["ejecuta las pruebas: todas pasan ✓", "good"],
      ["entrega el cambio", ""],
    ];
    const rows = LINES.map(([t, c]) => html("div", "ln " + c, body, `<span class="pr">›</span> ${t}`));
    const timers = [];
    const showN = (n) => rows.forEach((r, i) => r.classList.toggle("on", i < n));
    showN(0);
    return {
      step(k, info) {
        if (DG.isStatic()) { showN(rows.length); return; }
        if (!info.entering) return;
        timers.forEach(clearTimeout); timers.length = 0;
        showN(0);
        rows.forEach((r, i) => timers.push(setTimeout(() => r.classList.add("on"), 900 + i * 1300)));
      },
    };
  });

  // =====================================================================================
  // act5-catcurve (5-07): the 1898 curve in green on a dark card.
  // =====================================================================================
  DG.register("act5-catcurve", (mount, o) => {
    const W = o.w || 500, H = o.h || 370;
    const svg = DG.svg(mount, W, H);
    el("rect", { x: 0, y: 0, width: W, height: H, rx: 6, fill: "var(--bg-2)", stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
    el("path", { d: `M50 40 V${H - 60} H${W - 30}`, fill: "none", stroke: "var(--ink-4)", "stroke-width": 3 }, svg);
    el("path", { d: DG.curvePath(64, 52, W - 110, H - 130, "down"), fill: "none", stroke: "var(--act)", "stroke-width": 7, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    el("text", { x: 0, y: 0, transform: `translate(36,${(H - 20) / 2}) rotate(-90)`, "text-anchor": "middle", "font-size": 22, fill: "var(--ink-3)", text: "tiempo para salir" }, svg);
    el("text", { x: (W + 20) / 2, y: H - 24, "text-anchor": "middle", "font-size": 22, fill: "var(--ink-3)", text: "intentos" }, svg);
  });

  // =====================================================================================
  // act5-metr (5-09): time horizon, log scale in human units. Steps: 1 fit line, 2 CIs.
  // =====================================================================================
  DG.register("act5-metr", (mount, o) => {
    const W = o.w || 1700, H = o.h || 640;
    const svg = DG.svg(mount, W, H, "act5-metr");
    const PL = 330, PR = W - 30, PT = 16, PB = H - 64;
    const T0 = Date.UTC(2019, 0, 1), T1 = Date.UTC(2027, 0, 1);
    const S0 = Math.log10(1), S1 = Math.log10(4000 * 3600);           // 1 s … 4000 h
    const X = (d) => PL + ((Date.parse(d) - T0) / (T1 - T0)) * (PR - PL);
    const Y = (min) => PB - ((Math.log10(Math.max(min * 60, 1)) - S0) / (S1 - S0)) * (PB - PT);
    // grid + human-unit labels
    const TICKS = [[1 / 60, "un segundo"], [1, "un minuto"], [60, "una hora"], [480, "un día de trabajo", "(8 h)"], [2400, "una semana de trabajo", "(40 h)"], [120000, "un año laboral", "(2000 h = 50 semanas × 40 h)"]];
    TICKS.forEach(([m, lab, sub]) => {
      const y = Y(m);
      el("line", { x1: PL, x2: PR, y1: y, y2: y, stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
      el("text", { x: PL - 20, y: y + 9, "text-anchor": "end", "font-size": 26, fill: "var(--ink-2)", text: lab }, svg);
      if (sub) el("text", { x: PL + 10, y: y - 10, "font-size": 22, fill: "var(--ink-3)", text: sub.replace(/[()]/g, "") }, svg);
    });
    for (let yr = 2019; yr <= 2026; yr++) {
      const x = X(`${yr}-07-01`);
      el("line", { x1: X(`${yr}-01-01`), x2: X(`${yr}-01-01`), y1: PB, y2: PB + 12, stroke: "var(--ink-4)", "stroke-width": 2 }, svg);
      el("text", { x, y: PB + 46, "text-anchor": "middle", "font-size": 26, fill: "var(--ink-2)", text: yr }, svg);
    }
    el("line", { x1: PL, x2: PR, y1: PB, y2: PB, stroke: "var(--ink-4)", "stroke-width": 3 }, svg);

    // suite note (bottom-right of the plot, where there are no points)
    el("text", { x: PR - 10, y: PB - 46, "text-anchor": "end", "font-size": 22, fill: "var(--ink-3)", text: "Hasta 2025: tareas TH1.1 · desde 2026: TH1.1 + TH2" }, svg);
    el("text", { x: PR - 10, y: PB - 18, "text-anchor": "end", "font-size": 22, fill: "var(--ink-3)", text: "(METR cambió de prueba al saturarse la primera)" }, svg);

    // fit line
    const fitG = el("g", { style: "transition: opacity .6s" }, svg);
    const fx0 = X(FIT.d0), fy0 = Y(FIT.m0), fx1 = X(FIT.d1), fy1 = Y(FIT.m1);
    const fit = el("line", { x1: fx0, y1: fy0, x2: fx1, y2: fy1, stroke: "var(--ink)", "stroke-width": 5, "stroke-linecap": "round", style: "transition: all .6s" }, fitG);
    const fitLab = el("text", { x: fx0 + (fx1 - fx0) * 0.28 - 26, y: fy0 + (fy1 - fy0) * 0.28 - 28, "text-anchor": "end", "font-size": 32, "font-weight": 650, fill: "var(--ink)", style: "transition: opacity .6s", text: "se duplica cada ~3,6 meses" }, svg);

    // CI whiskers (clipped at the top of the plot)
    const ciG = el("g", {}, svg);
    const last2 = DATA.slice(-2);
    const whisk = DATA.map((d, i) => {
      const big = i >= DATA.length - 2;
      const x = X(d.date) + (big ? (i === DATA.length - 1 ? 8 : -8) : 0);
      const yHi = Math.max(Y(d.hi), PT), yLo = Y(d.lo);
      const g = el("g", { style: "transition: opacity .6s" }, ciG);
      el("line", { x1: x, x2: x, y1: yHi, y2: yLo, stroke: big ? "var(--ink)" : "var(--ink-3)", "stroke-width": big ? 4 : 2.5 }, g);
      el("line", { x1: x - (big ? 10 : 6), x2: x + (big ? 10 : 6), y1: yLo, y2: yLo, stroke: big ? "var(--ink)" : "var(--ink-3)", "stroke-width": big ? 4 : 2.5 }, g);
      if (Y(d.hi) >= PT) el("line", { x1: x - (big ? 10 : 6), x2: x + (big ? 10 : 6), y1: yHi, y2: yHi, stroke: big ? "var(--ink)" : "var(--ink-3)", "stroke-width": big ? 4 : 2.5 }, g);
      return { g, big, x };
    });
    const ciLab = el("text", { x: X("2026-09-12") - 30, y: Y(60000), "text-anchor": "end", "font-size": 26, fill: "var(--ink)", style: "transition: opacity .6s" }, svg);
    ciLab.innerHTML = `<tspan x="${X("2026-09-12") - 30}" dy="0">margen de error:</tspan><tspan x="${X("2026-09-12") - 30}" dy="32">de 12 h a más de un año laboral</tspan>`;
    // points
    DATA.forEach((d, i) => {
      const big = i >= DATA.length - 2;
      const x = X(d.date) + (big ? (i === DATA.length - 1 ? 8 : -8) : 0);
      el("circle", { cx: x, cy: Y(d.min), r: big ? 12 : 10, fill: "var(--ink)", stroke: "var(--bg)", "stroke-width": 3 }, svg);
    });
    // human-unit callouts
    const call = (d, dx, dy, a, l1, l2, anchor) => {
      const x = X(d.date) + dx, y = Y(d.min) + dy;
      const t = el("text", { x, y, "text-anchor": anchor || "middle", "font-size": 30, fill: "var(--ink)" }, svg);
      t.innerHTML = `<tspan font-weight="650">${l1}</tspan><tspan fill="var(--ink-2)"> · ${l2}</tspan>`;
    };
    call(DATA[0], -30, -40, 0, "2019", "segundos", "start");
    call(DATA[3], 0, -44, 0, "2023", "minutos");
    { const t = el("text", { x: X("2026-05-20"), y: Y(2400) - 16, "text-anchor": "end", "font-size": 30, fill: "var(--ink)" }, svg);
      t.innerHTML = `<tspan font-weight="650">2026</tspan><tspan fill="var(--ink-2)"> · casi una semana de trabajo</tspan>`; }
    // model names (small)
    [[0, 44, 8, "GPT-2"], [3, 0, 46, "GPT-4"], [6, 0, 46, "o3"]].forEach(([i, dx, dy, t]) => el("text", { x: X(DATA[i].date) + dx, y: Y(DATA[i].min) + dy, "text-anchor": "middle", "font-size": 22, fill: "var(--ink-3)", text: t }, svg));
    return {
      step(k) {
        const k1 = k >= 1, k2 = k >= 2;
        fit.setAttribute("stroke", k1 ? "var(--ink)" : "var(--ink-4)");
        fit.setAttribute("stroke-width", k1 ? 6 : 4);
        fit.setAttribute("stroke-dasharray", k1 ? "none" : "10 10");
        fitLab.style.opacity = k1 ? 1 : 0;
        whisk.forEach((w) => (w.g.style.opacity = w.big ? 1 : k2 ? 0.9 : 0.35));
        ciLab.style.opacity = k2 ? 1 : 0;
      },
    };
  });
})();

/* Act 3 — Aprender es optimizar.
   act3-paramo   3-01  páramo en la niebla: curvas de nivel, frailejones, laguna, caminante
   act3-backprop 3-02  red de 3 capas, el error viaja hacia atrás; tira de fútbol
   act3-alexnet  3-03  mosaico de etiquetas, barras 26,2 → 15,3, tarjetas gráficas
   act3-go       3-05  tablero de go, 37 primeras jugadas de la partida 2
   act3-medal    3-06  medalla simple (physics / chem) */
(function () {
  const mix = (a, pa, b) => `color-mix(in srgb, var(${a}) ${pa}%, var(${b || "--bg"}))`;
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  function stop(parent, off, color, op) {
    DG.el("stop", { offset: off, style: `stop-color:${color};stop-opacity:${op == null ? 1 : op}` }, parent);
  }

  /* ================= 3-01: el páramo ================= */
  function frailejon(parent, x, y, h, seed, tone) {
    const R = rng(seed);
    const body = tone || mix("--ink-3", 30, "--bg");
    const g = DG.el("g", { transform: `translate(${x} ${y}) scale(${h / 100})` }, parent);
    DG.el("ellipse", { cx: 0, cy: 1, rx: 17, ry: 3.2, fill: "var(--bg)", opacity: 0.55 }, g);
    const lean = (R() - 0.5) * 5;
    DG.el("path", { d: `M-8 0 C-7 -20 ${-5.8 + lean} -44 ${-5.8 + lean} -60 L${5.8 + lean} -60 C${6 + lean} -44 7 -20 8 0 Z`, fill: body }, g);
    for (let i = 0; i < 16; i++) {
      const yy = -3 - i * 3.7;
      const tx = lean * (-yy / 62);
      const l1 = 3 + R() * 3.5, l2 = 3 + R() * 3.5;
      DG.el("path", { d: `M${-5.2 + tx} ${yy} l${-l1} ${3.2 + R() * 2} M${5.2 + tx} ${yy} l${l2} ${3.2 + R() * 2}`, stroke: body, "stroke-width": 1.9, "stroke-linecap": "round", fill: "none" }, g);
    }
    const cx = lean, cy = -63;
    const n = 28;
    for (let i = 0; i < n; i++) {
      const a = -178 + (i / (n - 1)) * 176 + (R() - 0.5) * 8;
      const L = 15 + R() * 8 + Math.sin((i / (n - 1)) * Math.PI) * 6;
      const w = 4.4 + R() * 1.6;
      DG.el("path", { d: `M0 0 C${L * 0.25} ${-w} ${L * 0.7} ${-w * 0.8} ${L} 0 C${L * 0.7} ${w * 0.8} ${L * 0.25} ${w} 0 0 Z`, transform: `translate(${cx} ${cy}) rotate(${a})`, fill: body, stroke: "var(--ink-2)", "stroke-opacity": 0.28, "stroke-width": 0.7 }, g);
    }
    for (const a of [10, 28, 152, 170]) {
      const L = 11 + R() * 4;
      DG.el("path", { d: `M0 0 C${L * 0.3} -3.6 ${L * 0.7} -3 ${L} 0 C${L * 0.7} 3 ${L * 0.3} 3.6 0 0 Z`, transform: `translate(${cx} ${cy}) rotate(${a})`, fill: body }, g);
    }
    DG.el("circle", { cx, cy, r: 6.5, fill: body, stroke: "var(--ink-2)", "stroke-opacity": 0.3, "stroke-width": 0.7 }, g);
    return g;
  }

  DG.register("act3-paramo", (mount, o) => {
    const W = 1920, H = 1080;
    const svg = DG.svg(mount, W, H);
    const defs = DG.el("defs", {}, svg);
    // ---- gradients
    const sky = DG.el("linearGradient", { id: "p-sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    stop(sky, 0, "var(--bg)");
    stop(sky, 0.6, mix("--opt", 10, "--bg-2"));
    stop(sky, 1, mix("--opt", 16, "--bg-3"));
    const ground = DG.el("linearGradient", { id: "p-ground", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    stop(ground, 0, mix("--opt", 14, "--bg-3"), 0);
    stop(ground, 0.1, mix("--opt", 10, "--bg-3"), 1);
    stop(ground, 0.55, mix("--ink-4", 30, "--bg"));
    stop(ground, 1, mix("--bg", 100));
    const fog = DG.el("radialGradient", { id: "p-fog", cx: 0.5, cy: 0.5, r: 0.5 }, defs);
    const fogC = mix("--ink-2", 40, "--opt");
    stop(fog, 0, fogC, 0.5);
    stop(fog, 0.55, fogC, 0.3);
    stop(fog, 1, fogC, 0);
    const lag = DG.el("radialGradient", { id: "p-lag", cx: 0.5, cy: 0.45, r: 0.6 }, defs);
    stop(lag, 0, mix("--opt", 55, "--bg-3"));
    stop(lag, 1, mix("--opt", 22, "--bg"));
    const hg = DG.el("radialGradient", { id: "p-hole", cx: 0.5, cy: 0.5, r: 0.5 }, defs);
    stop(hg, 0, "#000", 1);
    stop(hg, 0.5, "#000", 1);
    stop(hg, 1, "#fff", 1);
    const vig = DG.el("radialGradient", { id: "p-vig", cx: 0.5, cy: 0.52, r: 0.75 }, defs);
    stop(vig, 0.55, "var(--bg)", 0);
    stop(vig, 1, "var(--bg)", 0.75);
    const topfade = DG.el("linearGradient", { id: "p-topfade", gradientUnits: "userSpaceOnUse", x1: 0, y1: 255, x2: 0, y2: 430 }, defs);
    stop(topfade, 0, "#000", 1);
    stop(topfade, 1, "#fff", 1);
    const capShade = DG.el("linearGradient", { id: "p-cap", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    stop(capShade, 0, "var(--bg)", 0);
    stop(capShade, 1, "var(--bg)", 0.85);
    const titleShade = DG.el("linearGradient", { id: "p-title", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    stop(titleShade, 0, "var(--bg)", 0.55);
    stop(titleShade, 1, "var(--bg)", 0);

    const mHole = DG.el("mask", { id: "p-mask-hole", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs);
    DG.el("rect", { x: 0, y: 0, width: W, height: H, fill: "#fff" }, mHole);
    const hole = DG.el("ellipse", { cx: 400, cy: 440, rx: 290, ry: 215, fill: "url(#p-hole)" }, mHole);
    const mTop = DG.el("mask", { id: "p-mask-top", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs);
    DG.el("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#p-topfade)" }, mTop);

    // ---- sky + ridges
    DG.el("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#p-sky)" }, svg);
    const R = rng(7);
    [[205, 0.35, 90], [245, 0.5, 70], [285, 0.7, 50]].forEach(([base, a, amp], li) => {
      let d = `M0 ${base + 160}`;
      for (let x = 0; x <= W; x += 40) {
        const y = base - amp * (0.5 + 0.5 * Math.sin(x / (250 + li * 90) + li * 2.1)) - amp * 0.35 * Math.sin(x / 97 + li) - R() * 3;
        d += ` L${x} ${y.toFixed(1)}`;
      }
      d += ` L${W} ${base + 160} Z`;
      DG.el("path", { d, fill: mix("--ink-4", 30 + li * 14, "--bg-2"), opacity: 0.55 + li * 0.15 }, svg);
    });
    DG.el("rect", { x: 0, y: 250, width: W, height: H - 250, fill: "url(#p-ground)" }, svg);

    // ---- contour lines (error landscape)
    const CX = 1230, CY = 705, RX = 1500, RY = 640;
    const ring = (s, k) => {
      const amp = 0.03 + 0.006 * k, pts = [];
      for (let j = 0; j < 140; j++) {
        const th = (j / 140) * Math.PI * 2;
        const n = amp * (0.6 * Math.sin(2 * th + 0.8 + 0.2 * k) + 0.4 * Math.sin(3 * th + 2.1 - 0.12 * k) + 0.35 * Math.sin(th + 4.0 + 0.1 * k));
        pts.push([CX + s * RX * Math.cos(th) * (1 + n), CY + s * RY * Math.sin(th) * (1 + n)]);
      }
      return "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + " Z";
    };
    const cont = DG.el("g", { mask: "url(#p-mask-top)" }, svg);
    const NR = 13;
    for (let k = NR; k >= 0; k--) {
      const s = 0.125 * Math.pow(1.21, k);
      DG.el("path", { d: ring(s, k), fill: "var(--opt)", "fill-opacity": 0.04 }, cont);
    }
    for (let k = 1; k <= NR; k++) {
      const s = 0.125 * Math.pow(1.21, k);
      DG.el("path", { d: ring(s, k), fill: "none", stroke: "var(--opt)", "stroke-opacity": k % 3 === 0 ? 0.7 : 0.42, "stroke-width": k % 3 === 0 ? 3.2 : 2, "stroke-linejoin": "round" }, cont);
    }
    // lagoon
    const lagPath = ring(0.125, 0);
    DG.el("path", { d: lagPath, fill: "url(#p-lag)", stroke: mix("--opt", 80, "--ink"), "stroke-opacity": 0.8, "stroke-width": 3 }, svg);
    [[-40, -18, 120], [30, 10, 160], [-90, 24, 90], [60, -34, 70]].forEach(([dx, dy, w]) => {
      DG.el("line", { x1: CX + dx - w / 2, x2: CX + dx + w / 2, y1: CY + dy, y2: CY + dy, stroke: "var(--ink)", "stroke-opacity": 0.22, "stroke-width": 3, "stroke-linecap": "round" }, svg);
    });
    const ripples = [0, 1].map(() => DG.el("ellipse", { cx: CX - 120, cy: CY - 10, rx: 10, ry: 4, fill: "none", stroke: "var(--ink)", "stroke-width": 2.5, opacity: 0 }, svg));

    // ---- mid frailejones (veiled by fog)
    const mid = DG.el("g", {}, svg);
    [[150, 520, 100], [610, 420, 78], [860, 530, 96], [1000, 410, 64], [1480, 480, 88], [1660, 570, 110], [1830, 480, 84], [1330, 375, 56], [740, 340, 52], [1140, 350, 56], [300, 360, 50], [1560, 385, 60], [500, 610, 124], [1720, 390, 54], [1000, 800, 130], [1440, 880, 150], [250, 760, 150], [720, 880, 170]].forEach((f, i) => {
      frailejon(mid, f[0], f[1], f[2], 100 + i * 13, mix("--ink-4", 70 + (i % 4) * 8, "--bg"));
    });

    // ---- fog layers, with a moving clearing
    const fogG = DG.el("g", { mask: "url(#p-mask-hole)" }, svg);
    DG.el("rect", { x: 0, y: 230, width: W, height: H - 230, fill: fogC, opacity: 0.05 }, fogG);
    const F = rng(3);
    const layers = [[300, 320, 1000, 110, 0.95], [1500, 300, 900, 100, 0.9], [900, 400, 1200, 130, 0.9], [200, 520, 800, 120, 1], [1100, 560, 1000, 120, 1], [1700, 560, 700, 130, 0.9], [600, 680, 1100, 130, 1], [1400, 740, 1000, 130, 0.95], [300, 840, 900, 130, 0.9], [1000, 880, 1100, 140, 0.9], [1700, 900, 800, 120, 0.85], [760, 460, 800, 90, 0.8], [1250, 470, 800, 90, 0.8], [900, 990, 1400, 120, 0.8], [1230, 700, 520, 190, 1.35], [1250, 690, 380, 120, 1.35], [1000, 640, 420, 110, 1.2]];
    layers.forEach((l, i) => {
      const e = DG.el("ellipse", { cx: l[0], cy: l[1], rx: l[2], ry: l[3] * (1 + F() * 0.2), fill: "url(#p-fog)", opacity: Math.min(1, l[4] * 0.8), class: "p-drift", style: `animation: act3drift ${38 + (i % 5) * 9}s ease-in-out ${-(i * 7)}s infinite alternate; --dx:${(i % 2 ? -1 : 1) * (40 + (i % 3) * 30)}px` }, fogG);
    });

    DG.el("rect", { x: 0, y: 780, width: W, height: 300, fill: "url(#p-cap)" }, svg);
    // ---- foreground frailejones
    const fore = DG.el("g", {}, svg);
    frailejon(fore, 1740, 1100, 360, 901, mix("--bg", 78, "--ink-4"));
    frailejon(fore, 1520, 1110, 230, 902, mix("--bg", 82, "--ink-4"));
    frailejon(fore, 1920, 1000, 260, 903, mix("--bg", 80, "--ink-4"));
    frailejon(fore, 1350, 1100, 170, 904, mix("--bg", 84, "--ink-4"));

    // ---- walker path (screen coordinates) with zigzag
    const S = [330, 470], E = [1040, 655];
    const raw = [];
    const M = 800;
    for (let i = 0; i <= M; i++) {
      const u = i / M;
      const bx = lerp(S[0], E[0], u), by = lerp(S[1], E[1], u);
      const dx = E[0] - S[0], dy = E[1] - S[1], len = Math.hypot(dx, dy);
      const nx = -dy / len, ny = dx / len;
      const A = 62 * (1 - 0.6 * u);
      const z = A * Math.sin(2 * Math.PI * 3.5 * u) * (0.8 + 0.2 * Math.sin(u * 17));
      raw.push([bx + nx * z, by + ny * z]);
    }
    const cum = [0];
    for (let i = 1; i <= M; i++) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
    const total = cum[M];
    const at = (u) => {
      const d = u * total;
      let lo = 0, hi = M;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m; }
      const t = (d - cum[lo]) / (cum[hi] - cum[lo] || 1);
      const a = raw[lo], b = raw[hi];
      return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), hx: b[0] - a[0], hy: b[1] - a[1] };
    };
    // trail
    const NS = 22;
    const trail = DG.el("g", {}, svg);
    const prints = [];
    for (let i = 0; i < NS; i++) {
      const u = (i + 1) / (NS + 0.6);
      const p = at(u);
      const ang = (Math.atan2(p.hy, p.hx) * 180) / Math.PI;
      const side = i % 2 ? 1 : -1;
      const g = DG.el("g", { transform: `translate(${p.x.toFixed(1)} ${(p.y + 4).toFixed(1)}) rotate(${ang.toFixed(1)}) translate(0 ${side * 8})`, opacity: 0, style: "transition: opacity .25s" }, trail);
      DG.el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 6.5, fill: "var(--human)", opacity: 0.9 }, g);
      DG.el("ellipse", { cx: -10, cy: 0, rx: 5, ry: 4.5, fill: "var(--human)", opacity: 0.9 }, g);
      prints.push({ u, g });
    }

    // labels
    const lbl1 = DG.el("text", { x: 330, y: 600, "font-size": 28, "font-style": "italic", fill: "var(--ink-2)", class: "serif", "text-anchor": "middle", text: "error alto", style: "transition: opacity .6s" }, svg);
    const lbl2 = DG.el("text", { x: CX, y: CY + 130, "font-size": 30, "font-style": "italic", fill: "var(--ink)", class: "serif", "text-anchor": "middle", text: "error mínimo", opacity: 0, style: "transition: opacity .8s" }, svg);

    // walker
    const walker = DG.el("g", {}, svg);
    const body = DG.el("g", {}, walker);
    const human = "var(--human)";
    DG.el("ellipse", { cx: 0, cy: 3, rx: 24, ry: 5, fill: "var(--bg)", opacity: 0.5 }, body);
    const legs = DG.el("path", { d: "", stroke: human, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" }, body);
    DG.el("path", { d: "M-9 -80 L12 -80 L22 -38 L-18 -38 Z", fill: human }, body);                 // ruana (poncho)
    DG.el("rect", { x: -20, y: -78, width: 9, height: 26, rx: 4, fill: human, opacity: 0.8 }, body); // mochila
    DG.el("circle", { cx: 3, cy: -92, r: 9.5, fill: human }, body);
    DG.el("ellipse", { cx: 3, cy: -98, rx: 17, ry: 3.4, fill: human }, body);                         // sombrero
    DG.el("path", { d: "M-6 -99 Q3 -114 12 -99 Z", fill: human }, body);
    DG.el("line", { x1: 17, y1: -62, x2: 32, y2: 1, stroke: human, "stroke-width": 4.5, "stroke-linecap": "round" }, body); // bastón
    DG.el("line", { x1: 10, y1: -72, x2: 17, y2: -62, stroke: human, "stroke-width": 7, "stroke-linecap": "round" }, body);

    function poseLegs(ph) {
      legs.setAttribute("d", ph ? "M0 -40 L14 -20 L12 0 M0 -40 L-10 -20 L-17 -3" : "M0 -40 L-4 -20 L-12 -2 M0 -40 L11 -22 L21 -4");
    }

    // state
    let prog = 0, cancel = () => {}, ripCancel = () => {};
    function setProg(p, anim) {
      prog = p;
      const q = at(p);
      const sc = 1.15 + (q.y / H) * 0.35;
      walker.setAttribute("transform", `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) scale(${sc.toFixed(3)})`);
      hole.setAttribute("cx", q.x + 20);
      hole.setAttribute("cy", q.y - 70);
      let n = 0;
      prints.forEach((pr) => { const on = p >= pr.u - 1e-6; if (on) n++; pr.g.setAttribute("opacity", on ? 1 : 0); });
      poseLegs(n % 2);
      lbl1.setAttribute("opacity", p < 0.02 ? 1 : 0);
      lbl2.setAttribute("opacity", p >= 0.999 ? 1 : 0);
    }
    function ripple() {
      ripCancel();
      ripCancel = DG.animate(2400, (e, t) => {
        ripples.forEach((r, i) => {
          const tt = clamp01(t * 1.3 - i * 0.3);
          r.setAttribute("rx", 10 + tt * 110);
          r.setAttribute("ry", 4 + tt * 38);
          r.setAttribute("opacity", tt > 0 && tt < 1 ? 0.45 * (1 - tt) : 0);
        });
      });
    }
    setProg(0);
    return {
      step(k, info) {
        const badge = mount.closest("section") && mount.closest("section").querySelector(".rule-badge");
        if (badge) badge.classList.toggle("lit", k >= 2);
        const target = k >= 1 ? 1 : 0;
        cancel(); ripCancel();
        ripples.forEach((r) => r.setAttribute("opacity", 0));
        if (target === 0) { setProg(0); return; }
        if (info && !info.entering && prog < 1) {
          const from = prog;
          cancel = DG.animate(8000, (e, t) => setProg(lerp(from, 1, t)), ripple);
        } else setProg(1);
      },
    };
  });

  /* ================= 3-02: retropropagación ================= */
  DG.register("act3-backprop", (mount, o) => {
    const W = o.w || 1100, H = o.h || 650;
    const svg = DG.svg(mount, W, H);
    const X = [150, 540, 930];
    const Y = [[130, 280, 430], [92, 217, 342, 467], [195, 365]];
    const NR = 36;
    const R = rng(11);
    const titles = ["entrada", "capa oculta", "salida"];
    titles.forEach((t, i) => DG.el("text", { x: X[i], y: 30, "text-anchor": "middle", "font-size": 26, fill: "var(--ink-3)", text: t }, svg));

    // connections
    const conns = [];
    function mkLayer(L, tFn) {
      for (let a = 0; a < Y[L].length; a++) for (let b = 0; b < Y[L + 1].length; b++) {
        const x0 = X[L], y0 = Y[L][a], x1 = X[L + 1], y1 = Y[L + 1][b];
        DG.el("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: "var(--ink-4)", "stroke-width": 2.5 }, svg);
        conns.push({ L, x0, y0, x1, y1, t: tFn(a, b), w: 0.35 + R() * 0.65, up: R() > 0.5, el: null, chip: null });
      }
    }
    mkLayer(0, (a, b) => 0.27 + 0.11 * ((a + 2 * b) % 4));
    mkLayer(1, (a, b) => 0.27 + 0.11 * ((a + 2 * b) % 4));
    // red overlays (drawn from the output end towards the input)
    conns.forEach((c) => {
      const len = Math.hypot(c.x1 - c.x0, c.y1 - c.y0);
      c.len = len;
      c.el = DG.el("line", { x1: c.x1, y1: c.y1, x2: c.x0, y2: c.y0, stroke: "var(--bad)", "stroke-width": 2 + c.w * 6, "stroke-linecap": "round", "stroke-opacity": 0.55 + c.w * 0.4, "stroke-dasharray": len, "stroke-dashoffset": len }, svg);
    });
    // nodes
    const nodes = [];
    for (let L = 0; L < 3; L++) for (const y of Y[L]) {
      const g = DG.el("g", {}, svg);
      DG.el("circle", { cx: X[L], cy: y, r: NR, fill: "var(--bg-2)", stroke: "var(--ink-3)", "stroke-width": 2.5 }, g);
      const tint = DG.el("circle", { cx: X[L], cy: y, r: NR, fill: "var(--bad)", opacity: 0 }, g);
      nodes.push({ L, tint });
    }
    // weight chips ("?" -> arrow)
    conns.forEach((c) => {
      const cx = lerp(c.x0, c.x1, c.t), cy = lerp(c.y0, c.y1, c.t);
      const g = DG.el("g", { transform: `translate(${cx.toFixed(1)} ${cy.toFixed(1)})` }, svg);
      const ring = DG.el("circle", { r: 17, fill: "var(--bg)", stroke: "var(--ink-3)", "stroke-width": 2 }, g);
      const q = DG.el("text", { y: 8, "text-anchor": "middle", "font-size": 24, "font-weight": 600, fill: "var(--ink-3)", text: "?" }, g);
      const arr = DG.el("path", { d: c.up ? "M0 9 V-8 M-6 -2 L0 -9 L6 -2" : "M0 -9 V8 M-6 2 L0 9 L6 2", stroke: "var(--ink)", "stroke-width": 3, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
      c.chip = { g, ring, q, arr };
    });
    // error entering at the output
    const err = DG.el("g", { opacity: 0 }, svg);
    Y[2].forEach((y) => {
      DG.el("path", { d: `M1075 ${y} H985 M1003 ${y - 12} L985 ${y} L1003 ${y + 12}`, stroke: "var(--bad)", "stroke-width": 6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, err);
    });
    DG.el("path", { d: `M1075 ${Y[2][0]} V${Y[2][1]}`, stroke: "var(--bad)", "stroke-width": 6, "stroke-linecap": "round" }, err);
    DG.el("text", { x: 1095, y: 290, "font-size": 38, "font-weight": 700, fill: "var(--bad)", text: "error" }, err);
    const halo = Y[2].map((y) => DG.el("circle", { cx: X[2], cy: y, r: NR + 8, fill: "none", stroke: "var(--bad)", "stroke-width": 5, opacity: 0 }, svg));

    // football strip: arquero ← defensa ← mediocampista (same columns: salida, oculta, entrada)
    const SY = 560;
    const strip = DG.el("g", { opacity: 0 }, svg);
    DG.el("line", { x1: 20, x2: W - 20, y1: SY - 52, y2: SY - 52, stroke: "var(--bg-3)", "stroke-width": 2 }, strip);
    DG.el("text", { x: 0, y: SY - 12, "font-size": 26, "font-style": "italic", fill: "var(--bad)", text: "gol en contra: la repetición, al revés" }, strip);
    const people = [["arquero", X[2]], ["defensa", X[1]], ["mediocampista", X[0]]].map(([name, x], i) => {
      const g = DG.el("g", { transform: `translate(${x} ${SY + 28})`, opacity: 0, style: "transition: opacity .4s" }, svg);
      DG.el("circle", { cx: 0, cy: -8, r: 12, fill: "var(--human)" }, g);
      DG.el("path", { d: "M-22 28 Q-22 6 0 6 Q22 6 22 28 Z", fill: "var(--human)" }, g);
      DG.el("text", { y: 62, "text-anchor": "middle", "font-size": 28, fill: "var(--ink)", text: name }, g);
      return g;
    });
    const sarr = [[X[2] - 44, X[1] + 44], [X[1] - 44, X[0] + 44]].map(([xa, xb]) => {
      const g = DG.el("g", { opacity: 0, style: "transition: opacity .4s" }, svg);
      DG.el("path", { d: `M${xa} ${SY + 38} H${xb} M${xb + 16} ${SY + 26} L${xb} ${SY + 38} L${xb + 16} ${SY + 50}`, stroke: "var(--bad)", "stroke-width": 5, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      return g;
    });

    const sm = (a, b, t) => clamp01((t - a) / (b - a));
    function setP(p) {
      err.setAttribute("opacity", sm(0, 0.08, p));
      halo.forEach((h) => { const v = sm(0, 0.1, p); h.setAttribute("opacity", v * (0.55 + 0.45 * Math.sin(p * 30))); });
      strip.setAttribute("opacity", p > 0 ? 1 : 0);
      [people[0]].forEach((g) => g.setAttribute("opacity", p > 0.02 ? 1 : 0));
      people[1].setAttribute("opacity", p > 0.3 ? 1 : 0);
      people[2].setAttribute("opacity", p > 0.62 ? 1 : 0);
      sarr[0].setAttribute("opacity", p > 0.2 ? 1 : 0);
      sarr[1].setAttribute("opacity", p > 0.52 ? 1 : 0);
      const q2 = sm(0.1, 0.45, p), q1 = sm(0.5, 0.9, p);
      conns.forEach((c) => {
        const q = c.L === 1 ? q2 : q1;
        c.el.setAttribute("stroke-dashoffset", c.len * (1 - q));
        const done = q >= 1 - c.t + 0.02 || p >= 0.999;
        c.chip.q.setAttribute("opacity", done ? 0 : 1);
        c.chip.arr.setAttribute("opacity", done ? 1 : 0);
        c.chip.ring.setAttribute("stroke", done ? "var(--bad)" : "var(--ink-3)");
        c.chip.ring.setAttribute("stroke-width", done ? 3 : 2);
      });
      nodes.forEach((n) => {
        let v = 0;
        if (n.L === 2) v = sm(0, 0.1, p) * 0.35;
        if (n.L === 1) v = sm(0.4, 0.5, p) * 0.35;
        if (n.L === 0) v = sm(0.88, 1, p) * 0.2;
        n.tint.setAttribute("opacity", v);
      });
    }
    let cur = 0, cancel = () => {};
    setP(0);
    return {
      step(k, info) {
        const target = k >= 1 ? 1 : 0;
        cancel();
        if (target === 0) { cur = 0; setP(0); return; }
        if (info && !info.entering && cur < 1) {
          const from = cur;
          cancel = DG.animate(5200, (e, t) => { cur = lerp(from, 1, t); setP(cur); });
        } else { cur = 1; setP(1); }
      },
    };
  });

  /* ================= 3-03: AlexNet ================= */
  function icon(g, i, cx, cy) {
    const P = mix("--paper", 88, "--bg-3"), P2 = mix("--paper", 55, "--bg-3");
    const e = (tag, a) => DG.el(tag, Object.assign({ fill: P }, a), g);
    switch (i % 12) {
      case 0: e("circle", { cx: cx + 16, cy: cy - 14, r: 8 }); e("path", { d: `M${cx - 30} ${cy + 20} L${cx - 6} ${cy - 12} L${cx + 8} ${cy + 6} L${cx + 18} ${cy - 2} L${cx + 32} ${cy + 20} Z`, fill: P2 }); break;
      case 1: e("circle", { cx, cy: cy + 4, r: 20 }); e("path", { d: `M${cx - 18} ${cy - 8} L${cx - 14} ${cy - 28} L${cx - 2} ${cy - 14} Z M${cx + 18} ${cy - 8} L${cx + 14} ${cy - 28} L${cx + 2} ${cy - 14} Z` }); e("circle", { cx: cx - 7, cy: cy + 1, r: 2.8, fill: "var(--bg-3)" }); e("circle", { cx: cx + 7, cy: cy + 1, r: 2.8, fill: "var(--bg-3)" }); break;
      case 2: for (let a = 0; a < 5; a++) e("circle", { cx: cx + 13 * Math.cos((a * 2 * Math.PI) / 5 - 1.57), cy: cy + 13 * Math.sin((a * 2 * Math.PI) / 5 - 1.57), r: 9 }); e("circle", { cx, cy, r: 6, fill: "var(--bg-3)" }); break;
      case 3: e("rect", { x: cx - 30, y: cy - 4, width: 60, height: 18, rx: 5 }); e("path", { d: `M${cx - 16} ${cy - 4} L${cx - 8} ${cy - 18} H${cx + 10} L${cx + 20} ${cy - 4} Z`, fill: P2 }); e("circle", { cx: cx - 15, cy: cy + 16, r: 7, fill: "var(--bg-3)", stroke: P, "stroke-width": 3 }); e("circle", { cx: cx + 15, cy: cy + 16, r: 7, fill: "var(--bg-3)", stroke: P, "stroke-width": 3 }); break;
      case 4: e("circle", { cx, cy: cy - 10, r: 19 }); e("rect", { x: cx - 4, y: cy + 4, width: 8, height: 22, fill: P2 }); break;
      case 5: e("rect", { x: cx - 20, y: cy - 4, width: 40, height: 28 }); e("path", { d: `M${cx - 26} ${cy - 4} L${cx} ${cy - 26} L${cx + 26} ${cy - 4} Z`, fill: P2 }); e("rect", { x: cx - 5, y: cy + 8, width: 10, height: 16, fill: "var(--bg-3)" }); break;
      case 6: e("ellipse", { cx: cx - 4, cy, rx: 22, ry: 13 }); e("path", { d: `M${cx + 16} ${cy} L${cx + 32} ${cy - 12} V${cy + 12} Z`, fill: P2 }); e("circle", { cx: cx - 15, cy: cy - 3, r: 2.5, fill: "var(--bg-3)" }); break;
      case 7: e("path", { d: `M${cx - 28} ${cy + 8} H${cx + 28} L${cx + 18} ${cy + 22} H${cx - 18} Z`, fill: P2 }); e("path", { d: `M${cx} ${cy - 26} V${cy + 4} H${cx + 22} Z` }); e("path", { d: `M${cx - 3} ${cy - 18} V${cy + 4} H${cx - 20} Z` }); break;
      case 8: e("path", { d: `M${cx - 30} ${cy - 6} Q${cx - 14} ${cy - 24} ${cx} ${cy - 4} Q${cx + 14} ${cy - 24} ${cx + 30} ${cy - 6} Q${cx + 14} ${cy - 12} ${cx} ${cy + 6} Q${cx - 14} ${cy - 12} ${cx - 30} ${cy - 6} Z` }); break;
      case 9: e("path", { d: `M${cx - 16} ${cy - 14} H${cx + 14} V${cy + 8} Q${cx + 14} ${cy + 20} ${cx - 1} ${cy + 20} Q${cx - 16} ${cy + 20} ${cx - 16} ${cy + 8} Z` }); e("path", { d: `M${cx + 14} ${cy - 8} Q${cx + 28} ${cy - 8} ${cx + 26} ${cy + 4} Q${cx + 24} ${cy + 12} ${cx + 14} ${cy + 12}`, fill: "none", stroke: P, "stroke-width": 4 }); break;
      case 10: e("circle", { cx: cx - 18, cy: cy + 8, r: 11, fill: "none", stroke: P, "stroke-width": 3.5 }); e("circle", { cx: cx + 18, cy: cy + 8, r: 11, fill: "none", stroke: P, "stroke-width": 3.5 }); e("path", { d: `M${cx - 18} ${cy + 8} L${cx - 4} ${cy - 10} H${cx + 12} L${cx + 18} ${cy + 8} M${cx - 4} ${cy - 10} L${cx + 4} ${cy + 8}`, fill: "none", stroke: P, "stroke-width": 3.5, "stroke-linejoin": "round" }); break;
      default: e("path", { d: `M${cx} ${cy - 24} L${cx + 7} ${cy - 8} L${cx + 24} ${cy - 6} L${cx + 11} ${cy + 5} L${cx + 15} ${cy + 22} L${cx} ${cy + 13} L${cx - 15} ${cy + 22} L${cx - 11} ${cy + 5} L${cx - 24} ${cy - 6} L${cx - 7} ${cy - 8} Z` });
    }
  }
  function gpu(parent, x, y, w, h, label) {
    const g = DG.el("g", { transform: `translate(${x} ${y})` }, parent);
    DG.el("rect", { x: 0, y: 0, width: w, height: h, rx: 10, fill: mix("--bg-3", 100), stroke: "var(--ink-3)", "stroke-width": 2.5 }, g);
    DG.el("rect", { x: -12, y: 8, width: 12, height: h - 16, rx: 2, fill: "var(--ink-3)" }, g);               // bracket
    DG.el("rect", { x: 40, y: -8, width: 50, height: 10, rx: 2, fill: "var(--ink-4)" }, g);                    // power plug
    DG.el("rect", { x: 20, y: h - 6, width: w - 80, height: 8, fill: "var(--ink-2)", opacity: 0.8 }, g);       // contacts
    for (let i = 0; i < 2; i++) {
      const fx = w * (0.3 + i * 0.4), fy = h * 0.5, fr = h * 0.36;
      DG.el("circle", { cx: fx, cy: fy, r: fr + 6, fill: "var(--bg)", stroke: "var(--ink-4)", "stroke-width": 2.5 }, g);
      const spin = DG.el("g", { transform: `translate(${fx} ${fy})` }, g);
      for (let b = 0; b < 9; b++) DG.el("path", { d: `M0 0 C${fr * 0.3} ${-fr * 0.2} ${fr * 0.9} ${-fr * 0.3} ${fr * 0.95} ${-fr * 0.02} C${fr * 0.6} ${-fr * 0.05} ${fr * 0.3} ${fr * 0.1} 0 0 Z`, transform: `rotate(${b * 40})`, fill: "var(--ink-3)", opacity: 0.9 }, spin);
      if (!DG.isStatic()) DG.el("animateTransform", { attributeName: "transform", type: "rotate", from: "0", to: "360", dur: "2.4s", repeatCount: "indefinite", additive: "sum" }, spin);
      DG.el("circle", { cx: fx, cy: fy, r: fr * 0.2, fill: "var(--bg-2)", stroke: "var(--ink-2)", "stroke-width": 2 }, g);
    }
    DG.el("rect", { x: w * 0.5 - 38, y: 10, width: 76, height: 6, rx: 3, fill: "var(--opt)", opacity: 0.9 }, g);
    DG.el("text", { x: w / 2, y: h + 32, "text-anchor": "middle", "font-size": 24, "font-weight": 600, fill: "var(--ink-3)", text: label }, g);
    return g;
  }

  DG.register("act3-alexnet", (mount, o) => {
    const W = o.w || 1700, H = o.h || 600;
    const svg = DG.svg(mount, W, H);
    const defs = DG.el("defs", {}, svg);
    const mk = DG.el("mask", { id: "ax-fade", maskUnits: "userSpaceOnUse", x: -10, y: -10, width: 760, height: 400 }, defs);
    const gx = DG.el("linearGradient", { id: "ax-gx", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    stop(gx, 0, "#fff", 1); stop(gx, 0.72, "#fff", 1); stop(gx, 1, "#fff", 0.0);
    const gy = DG.el("linearGradient", { id: "ax-gy", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    stop(gy, 0, "#fff", 1); stop(gy, 0.7, "#fff", 1); stop(gy, 1, "#fff", 0.0);
    DG.el("rect", { x: -10, y: -10, width: 760, height: 400, fill: "url(#ax-gx)" }, mk);
    // second pass: multiply by vertical fade via nested rect mask
    const mk2 = DG.el("mask", { id: "ax-fade2", maskUnits: "userSpaceOnUse", x: -10, y: -10, width: 760, height: 400 }, defs);
    DG.el("rect", { x: -10, y: -10, width: 760, height: 400, fill: "url(#ax-gy)" }, mk2);

    // mosaic (datos)
    const outer = DG.el("g", { mask: "url(#ax-fade2)" }, svg);
    const mos = DG.el("g", { mask: "url(#ax-fade)" }, outer);
    // real ImageNet photos (one sample per class; github.com/EliSchwartz/imagenet-sample-images)
    const PH = ["01-tabby.jpg", "02-macaw.jpg", "03-golden_retriever.jpg", "04-school_bus.jpg", "05-strawberry.jpg", "06-volcano.jpg", "07-zebra.jpg", "08-teapot.jpg", "09-goldfish.jpg", "10-mountain_bike.jpg", "11-giant_panda.jpg", "12-pizza.jpg", "13-schooner.jpg", "14-monarch.jpg", "15-acoustic_guitar.jpg", "16-flamingo.jpg", "17-koala.jpg", "18-sports_car.jpg", "19-banana.jpg", "20-castle.jpg", "21-tree_frog.jpg", "22-espresso.jpg", "23-toucan.jpg", "24-daisy.jpg", "25-red_fox.jpg", "26-airliner.jpg", "27-ladybug.jpg", "28-jack-o-lantern.jpg", "29-orange.jpg", "30-umbrella.jpg", "31-hummingbird.jpg", "32-beacon.jpg"];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      const x = c * 92, y = r * 92, i = r * 8 + c;
      const cp = DG.el("clipPath", { id: "ax-c" + i }, defs);
      DG.el("rect", { x, y, width: 84, height: 84, rx: 6 }, cp);
      DG.el("rect", { x, y, width: 84, height: 84, rx: 6, fill: "var(--bg-3)" }, mos);
      DG.el("image", { href: "assets/img/imagenet/" + PH[i], x, y, width: 84, height: 84, preserveAspectRatio: "xMidYMid slice", "clip-path": `url(#ax-c${i})` }, mos);
    }
    DG.el("text", { x: 0, y: 448, "font-size": 64, "font-weight": 600, class: "serif", fill: "var(--ink)", text: "1,2 millones" }, svg);
    DG.el("text", { x: 0, y: 500, "font-size": 36, fill: "var(--ink-2)", text: "de fotos etiquetadas, 1000 categorías" }, svg);

    // bars (error)
    const bx = 880, scale = 600 / 26.2;
    DG.el("text", { x: bx, y: 24, "font-size": 30, fill: "var(--ink-2)", text: "error al reconocer imágenes" }, svg);
    [["mejor del resto", 26.2, "26 %", "--ink-3", 110], ["AlexNet", 15.3, "15 %", "--opt", 232]].forEach(([name, v, txt, col, y]) => {
      DG.el("text", { x: bx, y: y - 12, "font-size": 34, "font-weight": 600, fill: col === "--opt" ? "var(--opt)" : "var(--ink-2)", text: name }, svg);
      DG.el("rect", { x: bx, y, width: v * scale, height: 66, rx: 6, fill: `var(${col})`, opacity: col === "--opt" ? 1 : 0.55 }, svg);
      DG.el("text", { x: bx + v * scale + 22, y: y + 56, "font-size": 76, "font-weight": 600, class: "serif", fill: col === "--opt" ? "var(--opt)" : "var(--ink)", text: txt }, svg);
    });

    // graphics cards (cómputo), f1
    const gp = DG.el("g", { style: "transition: opacity .7s, transform .7s" }, svg);
    gpu(gp, bx + 12, 360, 330, 130, "GTX 580");
    gpu(gp, bx + 400, 360, 330, 130, "GTX 580");
    DG.el("path", { d: `M${bx + 80} 352 V340 H${bx + 480} V352`, fill: "none", stroke: "var(--ink-3)", "stroke-width": 5, "stroke-linejoin": "round" }, gp);
    DG.el("text", { x: bx, y: 568, "font-size": 36, fill: "var(--ink-2)" }, svg).innerHTML = `entrenada en <tspan font-weight="650" fill="var(--ink)">dos tarjetas de video</tspan>`;
    DG.el("text", { x: bx, y: 612, "font-size": 36, fill: "var(--ink-2)", text: "hechas para videojuegos" }, svg);
    return {
      step(k) {
        gp.style.opacity = k >= 1 ? 1 : 0;
        gp.style.transform = k >= 1 ? "none" : "translateY(16px)";
      },
    };
  });

  /* ================= 3-05: el tablero de go ================= */
  const GO = "Q16 D4 C16 R4 P4 P3 O3 Q3 C6 F3 N4 R6 J17 D10 Q5 R5 C4 C3 B3 C5 B4 B5 D5 B6 D3 E4 D2 C7 K4 C13 E16 R14 R15 Q14 O16 Q11 P10".split(" ");
  const COLS = "ABCDEFGHJKLMNOPQRST";
  DG.register("act3-go", (mount, o) => {
    const S = o.size || 800, d = 36, g0 = 76;
    const svg = DG.svg(mount, S, S);
    const defs = DG.el("defs", {}, svg);
    const bk = DG.el("radialGradient", { id: "go-b", cx: 0.35, cy: 0.3, r: 0.8 }, defs);
    stop(bk, 0, "#4a4d58"); stop(bk, 1, "#0a0b0e");
    const wh = DG.el("radialGradient", { id: "go-w", cx: 0.35, cy: 0.3, r: 0.8 }, defs);
    stop(wh, 0, "#ffffff"); stop(wh, 1, "#bdb39b");
    const glow = DG.el("radialGradient", { id: "go-g", cx: 0.5, cy: 0.5, r: 0.5 }, defs);
    stop(glow, 0.4, "#5eaaf2", 0.0); stop(glow, 0.72, "#5eaaf2", 0.55); stop(glow, 1, "#5eaaf2", 0);
    DG.el("rect", { x: 40, y: 40, width: S - 80, height: S - 80, rx: 6, fill: mix("--human", 58, "--bg-2") }, svg);
    DG.el("rect", { x: 40, y: 40, width: S - 80, height: S - 80, rx: 6, fill: "none", stroke: mix("--human", 70, "--bg"), "stroke-width": 3 }, svg);
    for (let i = 0; i < 19; i++) {
      const p = g0 + i * d;
      DG.el("line", { x1: g0, x2: g0 + 18 * d, y1: p, y2: p, stroke: "var(--bg)", "stroke-opacity": 0.75, "stroke-width": i === 0 || i === 18 ? 2.4 : 1.4 }, svg);
      DG.el("line", { y1: g0, y2: g0 + 18 * d, x1: p, x2: p, stroke: "var(--bg)", "stroke-opacity": 0.75, "stroke-width": i === 0 || i === 18 ? 2.4 : 1.4 }, svg);
    }
    [3, 9, 15].forEach((a) => [3, 9, 15].forEach((b) => DG.el("circle", { cx: g0 + a * d, cy: g0 + b * d, r: 4.6, fill: "var(--bg)", opacity: 0.85 }, svg)));
    COLS.split("").forEach((c, i) => DG.el("text", { x: g0 + i * d, y: 30, "text-anchor": "middle", "font-size": 22, fill: "var(--ink-3)", text: c }, svg));
    for (let r = 1; r <= 19; r += 1) if (r % 3 === 1 || r === 10) DG.el("text", { x: 26, y: g0 + (19 - r) * d + 8, "text-anchor": "middle", "font-size": 22, fill: "var(--ink-3)", text: r }, svg);
    const pos = (code) => { const c = COLS.indexOf(code[0]), r = parseInt(code.slice(1), 10); return [g0 + c * d, g0 + (19 - r) * d]; };
    const stones = [];
    GO.forEach((code, i) => {
      const [x, y] = pos(code), black = i % 2 === 0;
      const g = DG.el("g", {}, svg);
      DG.el("ellipse", { cx: x + 2, cy: y + 3, rx: 16.5, ry: 16, fill: "#000", opacity: 0.35 }, g);
      DG.el("circle", { cx: x, cy: y, r: 16.6, fill: black ? "url(#go-b)" : "url(#go-w)" }, g);
      stones.push(g);
    });
    const [x37, y37] = pos("P10");
    const last = stones[36];
    const lbl = DG.el("text", { x: x37, y: y37 + 8, "text-anchor": "middle", "font-size": 22, "font-weight": 700, fill: "var(--ink)", text: "37" }, last);
    const ringG = DG.el("g", {}, svg);
    DG.el("circle", { cx: x37, cy: y37, r: 40, fill: "url(#go-g)" }, ringG);
    const ring = DG.el("circle", { cx: x37, cy: y37, r: 24, fill: "none", stroke: "var(--opt)", "stroke-width": 5 }, ringG);
    // mark 36 (white, previous move) with a small dot
    const [x36, y36] = pos("Q11");
    function set(p) {
      last.setAttribute("opacity", p);
      last.setAttribute("transform", `translate(${x37} ${y37}) scale(${lerp(1.5, 1, p)}) translate(${-x37} ${-y37})`);
      ringG.setAttribute("opacity", clamp01((p - 0.5) * 2));
      ring.setAttribute("r", lerp(40, 24, clamp01((p - 0.5) * 2)));
    }
    let cur = 0, cancel = () => {};
    set(0);
    return {
      step(k, info) {
        cancel();
        if (k < 1) { cur = 0; set(0); return; }
        if (info && !info.entering && cur < 1) { const f = cur; cancel = DG.animate(900, (e) => { cur = lerp(f, 1, e); set(cur); }); } else { cur = 1; set(1); }
      },
    };
  });

  /* ================= 3-06: medallas ================= */
  DG.register("act3-medal", (mount, o) => {
    const svg = DG.svg(mount, 150, 190);
    const defs = DG.el("defs", {}, svg);
    const id = "md-" + o.kind;
    const gr = DG.el("linearGradient", { id, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    stop(gr, 0, mix("--human", 100, "--paper")); stop(gr, 0.5, mix("--human", 85, "--bg")); stop(gr, 1, mix("--human", 55, "--bg"));
    DG.el("path", { d: "M40 0 H70 L84 56 H54 Z", fill: "var(--ink-3)" }, svg);
    DG.el("path", { d: "M110 0 H80 L66 56 H96 Z", fill: "var(--ink-2)" }, svg);
    DG.el("circle", { cx: 75, cy: 118, r: 66, fill: `url(#${id})` }, svg);
    DG.el("circle", { cx: 75, cy: 118, r: 66, fill: "none", stroke: "var(--bg)", "stroke-opacity": 0.45, "stroke-width": 3 }, svg);
    DG.el("circle", { cx: 75, cy: 118, r: 54, fill: "none", stroke: "var(--bg)", "stroke-opacity": 0.35, "stroke-width": 2 }, svg);
    const eg = DG.el("g", { stroke: "var(--bg)", "stroke-opacity": 0.8, "stroke-width": 3.5, fill: "none", "stroke-linejoin": "round" }, svg);
    if (o.kind === "phys") {
      [0, 60, 120].forEach((a) => DG.el("ellipse", { cx: 75, cy: 118, rx: 36, ry: 13, transform: `rotate(${a} 75 118)` }, eg));
      DG.el("circle", { cx: 75, cy: 118, r: 6, fill: "var(--bg)", stroke: "none" }, eg);
    } else {
      const pts = [0, 1, 2, 3, 4, 5].map((i) => [75 + 30 * Math.cos((i * Math.PI) / 3 + Math.PI / 6), 118 + 30 * Math.sin((i * Math.PI) / 3 + Math.PI / 6)]);
      DG.el("path", { d: "M" + pts.map((p) => p.join(" ")).join(" L") + " Z" }, eg);
      DG.el("circle", { cx: 75, cy: 118, r: 15 }, eg);
    }
  });
})();

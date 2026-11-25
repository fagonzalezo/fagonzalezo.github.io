/* Act 2 — Imitar al cerebro (2-00 … 2-05).
   act2-card   — 2-00: the strands card with green dimmed-but-visible.
   act2-bike   — 2-02: McCulloch–Pitts neuron, «¿salgo a montar bicicleta?». k>=1: weights change.
   act2-learn  — 2-04: the perceptron rule; controls the .rule-badge of its slide (k1 hero, k2 corner, k3 the right answer).
   act2-net    — 2-05: three-layer network, blame question, frost. */
(function () {
  const ORANGE = "var(--brain)", RED = "var(--bad)";

  // arrow along +x from (x0,y0) to (x1,y1); thickness = weight
  function arrow(parent, x0, y0, x1, y1, col) {
    const g = DG.el("g", {}, parent);
    const len = Math.hypot(x1 - x0, y1 - y0), ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    g.setAttribute("transform", `translate(${x0} ${y0}) rotate(${ang})`);
    const line = DG.el("line", { x1: 0, y1: 0, y2: 0, stroke: col }, g);
    const head = DG.el("polygon", { fill: col }, g);
    return {
      g,
      set(w, c) {
        const hl = 16 + w * 1.2, hw = 8 + w * 0.8;
        line.setAttribute("x2", Math.max(0, len - hl + 2));
        line.setAttribute("stroke-width", w);
        head.setAttribute("points", `${len - hl},${-hw} ${len},0 ${len - hl},${hw}`);
        if (c) { line.setAttribute("stroke", c); head.setAttribute("fill", c); }
      },
    };
  }
  // point on circle (cx,cy,r) facing (x0,y0)
  function toCircle(x0, y0, cx, cy, r) {
    const d = Math.hypot(cx - x0, cy - y0), ux = (cx - x0) / d, uy = (cy - y0) / d;
    return [cx - ux * (r + 8), cy - uy * (r + 8)];
  }
  function neuron(svg, cx, cy, r) {
    const g = DG.el("g", {}, svg);
    DG.el("circle", { cx, cy, r: r + 14, fill: ORANGE, opacity: 0.16 }, g);
    DG.el("circle", { cx, cy, r, fill: ORANGE }, g);
    DG.el("text", { x: cx, y: cy + r * 0.2, "text-anchor": "middle", "font-size": r * 1.0, "font-weight": 600, class: "serif", style: "fill:var(--bg)", text: "Σ" }, g);
    const s = r * 0.32;
    DG.el("path", { d: `M${cx - s * 1.2} ${cy + r * 0.56} H${cx - s * 0.2} V${cy + r * 0.34} H${cx + s * 1.2}`, fill: "none", stroke: "var(--bg)", "stroke-width": 7, "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
    return g;
  }
  function cap(svg, x, y, t, anchor) {
    return DG.el("text", { x, y, "text-anchor": anchor || "middle", "font-size": 24, "font-weight": 600, "letter-spacing": "0.14em", style: "fill:var(--ink-3)", text: t }, svg);
  }
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------------- 2-00 ----------------
  DG.register("act2-card", (mount, o) => {
    const api = DG.registry.strands(mount, o) || {};
    const fix = () => { const p = mount.querySelector('svg path[stroke="var(--act)"]'); if (p) p.style.opacity = 0.5; };
    fix();
    return { step(k, i) { if (api.step) api.step(k, i); fix(); } };
  });

  // ---------------- 2-02 ----------------
  DG.register("act2-bike", (mount, o) => {
    const W = 1700, H = o.h || 600;
    const svg = DG.svg(mount, W, H);
    const cx = 1010, cy = 340, r = 135;
    DG.el("text", { x: 0, y: 46, "font-size": 54, "font-style": "italic", class: "serif", style: "fill:var(--ink-2)", text: "¿Salgo a montar bicicleta?" }, svg);
    cap(svg, 460, 130, "ENTRADAS", "end"); cap(svg, 650, 130, "PESOS"); cap(svg, cx, 130, "SUMA Y UMBRAL"); cap(svg, 1480, 130, "DECISIÓN");
    // weights: before (k = 0) and after learning (k >= 1); arrow width = 5 × weight
    const ins = [{ t: "hace sol", y: 215, w0: 4, w1: 3 }, { t: "tengo tiempo", y: 340, w0: 4, w1: 5 }, { t: "está la ciclovía", y: 465, w0: 1, w1: 3 }];
    const PX = 650;                                     // the PESOS column
    ins.forEach((d) => {
      DG.el("text", { x: 460, y: d.y + 15, "text-anchor": "end", "font-size": 44, style: "fill:var(--ink)", text: d.t }, svg);
      const [ex, ey] = toCircle(500, d.y, cx, cy, r);
      d.a = arrow(svg, 500, d.y, ex, ey, "var(--ink-2)");
      d.a.set(d.w0 * 5);
      d.py = d.y + ((PX - 500) / (ex - 500)) * (ey - d.y);
    });
    // weight badges (drawn over the arrows)
    ins.forEach((d) => {
      const g = DG.el("g", {}, svg);
      d.pill = DG.el("rect", { x: PX - 50, y: d.py - 34, width: 100, height: 68, rx: 34, fill: "var(--bg)", stroke: "var(--ink-3)", "stroke-width": 3, style: "transition: all .6s" }, g);
      d.old = DG.el("text", { x: PX - 58, y: d.py + 15, "text-anchor": "middle", "font-size": 40, "font-weight": 600, style: "fill:var(--ink-3); transition: opacity .5s", text: d.w0 }, g);
      d.now = DG.el("text", { x: PX, y: d.py + 15, "text-anchor": "middle", "font-size": 46, "font-weight": 700, style: "fill:var(--ink); transition: fill .5s", text: d.w0 }, g);
      d.dir = DG.el("text", { x: PX - 4, y: d.py + 13, "text-anchor": "middle", "font-size": 34, style: "fill:var(--ink-3); transition: opacity .5s", text: "→" }, g);
    });
    neuron(svg, cx, cy, r);
    const out = arrow(svg, cx + r + 14, cy, 1400, cy, "var(--ink-2)"); out.set(9);
    DG.el("text", { x: 1440, y: cy + 36, "font-size": 100, "font-weight": 650, style: "fill:var(--ink)", text: "sí" }, svg);
    DG.el("text", { x: 1540, y: cy + 36, "font-size": 60, style: "fill:var(--ink-3)", text: "/ no" }, svg);
    let cancel = () => {}, cur = ins.map((d) => d.w0 * 5);
    return {
      step(k) {
        const on = k >= 1, tgt = ins.map((d) => (on ? d.w1 : d.w0) * 5), from = cur.slice();
        ins.forEach((d) => {
          d.now.textContent = on ? d.w1 : d.w0;
          d.now.setAttribute("x", on ? PX + 52 : PX);
          d.now.style.fill = on ? "var(--brain)" : "var(--ink)";
          d.old.style.opacity = on ? 1 : 0;
          d.dir.style.opacity = on ? 1 : 0;
          d.pill.setAttribute("x", on ? PX - 92 : PX - 50);
          d.pill.setAttribute("width", on ? 184 : 100);
          d.pill.setAttribute("stroke", on ? "var(--brain)" : "var(--ink-3)");
        });
        cancel();
        cancel = DG.animate(900, (t) => {
          cur = from.map((v, i) => lerp(v, tgt[i], t));
          ins.forEach((d, i) => d.a.set(cur[i], on ? ORANGE : "var(--ink-2)"));
        });
      },
    };
  });

  // ---------------- 2-04 ----------------
  const FIG = {
    T: (r, c) => (r >= 2 && r <= 5 && c >= 3 && c <= 16) || (r >= 6 && r <= 17 && c >= 8 && c <= 11),
    L: (r, c) => (c >= 5 && c <= 8 && r >= 2 && r <= 17) || (r >= 14 && r <= 17 && c >= 5 && c <= 16),
  };
  const MASK = { T: [1, 1, 0, 1, 1, 0], L: [1, 0, 1, 0, 1, 1] };
  DG.register("act2-learn", (mount, o) => {
    const W = 1700, H = o.h || 650;
    const svg = DG.svg(mount, W, H);
    const sec = mount.closest("section"), badge = sec && sec.querySelector(".rule-badge");
    const TR = "transition: opacity .5s ease";
    const cy = 310, gx = 0, gy = cy - 170, cell = 17;
    DG.el("text", { x: 0, y: gy - 28, "font-size": 48, "font-style": "italic", class: "serif", style: "fill:var(--ink-2)", text: "¿Es una T?" }, svg);
    DG.el("rect", { x: gx - 4, y: gy - 4, width: 20 * cell + 8, height: 20 * cell + 8, fill: "var(--bg-2)", stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
    const cells = [];
    for (let r = 0; r < 20; r++) for (let c = 0; c < 20; c++) cells.push({ r, c, e: DG.el("rect", { x: gx + c * cell + 0.8, y: gy + r * cell + 0.8, width: cell - 1.6, height: cell - 1.6, fill: "var(--bg-3)" }, svg) });
    DG.el("text", { x: 170, y: gy + 20 * cell + 42, "text-anchor": "middle", "font-size": 28, style: "fill:var(--ink-3)", text: "20 × 20 píxeles" }, svg);
    // sample inputs
    const NX = 520, ns = [0, 1, 2, 3, 4, 5].map((i) => cy + (i - 2.5) * 92);
    const nodes = ns.map((y, i) => {
      const fy = gy + ((i + 0.5) * 20 * cell) / 6;
      DG.el("line", { x1: 20 * cell + 8, y1: fy, x2: NX - 8, y2: y, stroke: "var(--ink-4)", "stroke-width": 1.5, "stroke-dasharray": "3 6" }, svg);
      return DG.el("rect", { x: NX, y: y - 22, width: 44, height: 44, rx: 4, "stroke-width": 2 }, svg);
    });
    const ncx = 1040, R = 125;
    const base = [6, 10, 4, 7, 5, 9], grown = [1, 1, 0, 1, 1, 0].map((m, i) => base[i] + (m ? 8 : 0));
    const arrs = ns.map((y, i) => { const [ex, ey] = toCircle(NX + 60, y, ncx, cy, R); const a = arrow(svg, NX + 60, y, ex, ey, "var(--ink-2)"); a.set(base[i]); return a; });
    neuron(svg, ncx, cy, R);
    const oa = arrow(svg, ncx + R + 14, cy, 1330, cy, "var(--ink-2)"); oa.set(8);
    const ans = DG.el("text", { x: 1362, y: cy + 34, "font-size": 100, "font-weight": 650, style: "fill:var(--ink);" + TR, text: "no" }, svg);
    const exp = DG.el("text", { x: 1362, y: cy + 100, "font-size": 40, style: TR, text: "debía ser «sí»" }, svg);
    const pill = DG.el("g", { style: TR }, svg);
    const pr = DG.el("rect", { x: 1362, y: cy + 130, width: 300, height: 62, rx: 31, fill: "none", "stroke-width": 3 }, pill);
    const pt = DG.el("text", { x: 1512, y: cy + 172, "text-anchor": "middle", "font-size": 34, "font-weight": 600, text: "diferencia" }, pill);
    const path = DG.el("g", { style: TR }, svg);
    DG.el("path", { d: `M1512 ${cy + 196} V${cy + 300} H${NX + 22} V${ns[5] + 66}`, fill: "none", stroke: RED, "stroke-width": 4, "stroke-dasharray": "4 10", "stroke-linecap": "round" }, path);
    DG.el("polygon", { points: `${NX + 6},${ns[5] + 70} ${NX + 22},${ns[5] + 46} ${NX + 38},${ns[5] + 70}`, fill: RED }, path);
    DG.el("text", { x: 1000, y: cy + 296 + 44, "text-anchor": "middle", "font-size": 34, style: "fill:var(--bad)", text: "corrige los pesos" }, path);

    let cur = base.slice(), cancel = () => {}, timers = [], fig = "T", lastK = -1;
    function setFig(f) {
      fig = f;
      cells.forEach((c) => c.e.setAttribute("fill", FIG[f](c.r, c.c) ? "var(--ink)" : "var(--bg-3)"));
      nodes.forEach((n, i) => { const on = MASK[f][i]; n.setAttribute("fill", on ? "var(--ink)" : "var(--bg-3)"); n.setAttribute("stroke", on ? "var(--ink)" : "var(--ink-4)"); });
    }
    function paint() { arrs.forEach((a, i) => a.set(cur[i], cur[i] > base[i] + 0.5 ? ORANGE : "var(--ink-2)")); }
    function setW(target, anim) {
      cancel();
      const from = cur.slice();
      if (!anim) { cur = target.slice(); paint(); return; }
      cancel = DG.animate(1100, (t) => { cur = from.map((v, i) => lerp(v, target[i], t)); paint(); });
    }
    function show(st) {
      ans.style.opacity = st.ans ? 1 : 0;
      exp.style.opacity = st.exp ? 1 : 0;
      pill.style.opacity = st.exp ? 1 : 0;
      path.style.opacity = st.path ? 1 : 0;
      const ok = st.ok;
      exp.style.fill = ok ? "var(--ink-2)" : "var(--bad)";
      exp.textContent = ok ? "esperaba «no»" : "debía ser «sí»";
      pr.setAttribute("stroke", ok ? "var(--ink-4)" : "var(--bad)");
      pt.style.fill = ok ? "var(--ink-3)" : "var(--bad)";
      pt.textContent = ok ? "diferencia = 0" : "diferencia";
      pr.setAttribute("width", ok ? 340 : 300);
      pt.setAttribute("x", ok ? 1532 : 1512);
    }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function later(ms, f) { timers.push(setTimeout(f, ms)); }
    // k = 1: the rule appears big in the middle (diagram dimmed) and waits for a click;
    // k = 2: it shrinks to the corner; k >= 3: the case where it answers well.
    function badgeState(k) {
      if (!badge) return;
      if (badge._t) { clearTimeout(badge._t); badge._t = null; }
      if (k < 1) { badge.classList.remove("hero", "lit"); badge.style.opacity = 0; mount.style.opacity = 1; return; }
      badge.style.opacity = 1;
      mount.style.transition = "opacity .6s";
      if (k === 1 && !DG.isStatic()) { badge.classList.add("hero", "lit"); mount.style.opacity = 0.18; }
      else { badge.classList.remove("hero", "lit"); mount.style.opacity = 1; }
    }
    return {
      step(k, info) {
        const entering = info && info.entering;
        clearTimers();
        badgeState(k);
        if (k >= 3) {
          setFig("L"); setW(grown, false); show({ ans: 1, exp: 1, ok: true, path: 0 });
        } else if (k >= 1 || DG.isStatic() || !entering) {
          setFig("T"); setW(grown, false); show({ ans: 1, exp: 1, ok: false, path: 1 });
        } else {  // k = 0, entering: play the case
          setFig("T"); setW(base, false); show({ ans: 0, exp: 0, ok: false, path: 0 });
          later(700, () => show({ ans: 1, exp: 0, ok: false, path: 0 }));
          later(1700, () => show({ ans: 1, exp: 1, ok: false, path: 1 }));
          later(3000, () => setW(grown, true));
        }
        lastK = k;
      },
    };
  });

  // ---------------- 2-05 ----------------
  function crystal(g, x, y, s, op) {
    const c = DG.el("g", { transform: `translate(${x} ${y})`, opacity: op, stroke: "var(--ink)", "stroke-width": 2, "stroke-linecap": "round", fill: "none" }, g);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3, dx = Math.cos(a) * s, dy = Math.sin(a) * s;
      DG.el("line", { x1: -dx, y1: -dy, x2: dx, y2: dy }, c);
    }
    DG.el("circle", { r: 2.5, fill: "var(--ink)", stroke: "none" }, c);
  }
  DG.register("act2-net", (mount, o) => {
    const W = o.w || 1230, H = o.h || 610;
    const svg = DG.svg(mount, W, H);
    const T = "transition: opacity .6s ease, stroke .9s ease, fill .9s ease";
    const X = [200, 610, 1010], hy = [30, 140, 250, 360].map((v) => v + 20), iy = [140, 250].map((v) => v + 20), oy = 215;
    const net = DG.el("g", { style: T }, svg);
    const edges = [], nodes = [];
    const mkEdge = (x0, y0, x1, y1, w, layer) => { const e = DG.el("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: ORANGE, "stroke-width": w, "stroke-linecap": "round", opacity: 0.85, style: T }, net); edges.push({ e, layer, w }); return e; };
    const ws = [5, 3, 7, 4, 8, 4, 3, 6];
    iy.forEach((y, a) => hy.forEach((h, b) => mkEdge(X[0], y, X[1], h, ws[a * 4 + b], "h")));
    hy.forEach((h, b) => mkEdge(X[1], h, X[2], oy, [6, 9, 5, 8][b], "o"));
    const mkNode = (x, y, r) => nodes.push(DG.el("circle", { cx: x, cy: y, r, fill: ORANGE, style: T }, net));
    iy.forEach((y) => mkNode(X[0], y, 32)); hy.forEach((y) => mkNode(X[1], y, 32)); mkNode(X[2], oy, 36);
    const lab = DG.el("g", { style: T }, svg);
    DG.el("text", { x: X[0] - 52, y: iy[0] + 10, "text-anchor": "end", "font-size": 30, style: "fill:var(--ink-2)", text: "botón A" }, lab);
    DG.el("text", { x: X[0] - 52, y: iy[1] + 10, "text-anchor": "end", "font-size": 30, style: "fill:var(--ink-2)", text: "botón B" }, lab);
    DG.el("text", { x: X[2], y: oy + 78, "text-anchor": "middle", "font-size": 30, style: "fill:var(--ink-2)", text: "luz" }, lab);
    // error leaving the output
    const err = DG.el("g", { style: T }, svg);
    const ea = arrow(err, X[2] + 50, oy, X[2] + 200, oy, RED); ea.set(10);
    DG.el("text", { x: X[2] + 125, y: oy - 34, "text-anchor": "middle", "font-size": 34, "font-weight": 600, style: "fill:var(--bad)", text: "error" }, err);
    // question marks on the hidden weights
    const qs = DG.el("g", { style: T }, svg);
    iy.forEach((y, a) => hy.forEach((h) => {
      const t = a ? 0.76 : 0.42, x = X[0] + t * (X[1] - X[0]), yy = y + t * (h - y);
      DG.el("circle", { cx: x, cy: yy, r: 21, fill: "var(--bg)", stroke: "var(--ink)", "stroke-width": 2.5 }, qs);
      DG.el("text", { x, y: yy + 11, "text-anchor": "middle", "font-size": 32, "font-weight": 700, style: "fill:var(--ink)", text: "?" }, qs);
    }));
    // frost
    const frost = DG.el("g", { style: T }, svg);
    DG.el("rect", { x: 40, y: 0, width: 1150, height: 440, rx: 40, fill: "var(--ink)", opacity: 0.07 }, frost);
    let s = 7; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 16; i++) crystal(frost, 70 + rnd() * 1000, 24 + rnd() * 400, 12 + rnd() * 14, 0.3 + rnd() * 0.35);
    // captions
    const c1 = DG.el("text", { x: 0, y: 500, "font-size": 50, style: "fill:var(--ink);" + T, text: "Con varias capas, sí podría…" }, svg);
    const c2 = DG.el("text", { x: 0, y: 500, "font-size": 50, style: "fill:var(--ink);" + T }, svg);
    DG.el("tspan", { text: "…pero ¿a qué peso " }, c2); DG.el("tspan", { text: "culpar", style: "fill:var(--bad)", "font-weight": 650 }, c2); DG.el("tspan", { text: "? Nadie sabía." }, c2);
    const c3 = DG.el("g", { style: T }, svg);
    DG.el("text", { x: 0, y: 512, "font-size": 78, class: "serif", "font-weight": 600, style: "fill:var(--ink)", text: "Invierno: casi dos décadas" }, c3);
    // the orange strand thinning 1969 → 1986
    const x0 = 0, x1 = 1000, ty = 566, n = 40;
    let top = "", bot = "";
    for (let i = 0; i <= n; i++) { const u = i / n, hw = lerp(9, 0.9, Math.pow(u, 0.7)), x = x0 + u * (x1 - x0), y = ty + Math.sin(u * 9) * 3; top += `${x},${y - hw} `; bot = `${x},${y + hw} ` + bot; }
    DG.el("polygon", { points: top + bot, fill: ORANGE }, c3);
    DG.el("text", { x: 0, y: ty + 46, "font-size": 28, style: "fill:var(--ink-2)", text: "1969" }, c3);
    DG.el("text", { x: x1, y: ty + 46, "text-anchor": "end", "font-size": 28, style: "fill:var(--ink-2)", text: "1986" }, c3);
    return {
      step(k) {
        const v = (el, on) => (el.style.opacity = on ? 1 : 0);
        v(net, k >= 1); v(lab, k >= 1); v(err, k >= 2 && k < 3 ? 1 : 0); 
        err.style.opacity = k >= 2 ? (k >= 3 ? 0.4 : 1) : 0;
        qs.style.opacity = k >= 2 ? (k >= 3 ? 0.4 : 1) : 0;
        v(c1, k === 1); v(c2, k === 2); v(c3, k >= 3); v(frost, k >= 3);
        edges.forEach((d) => {
          const frozen = k >= 3, blame = k >= 2 && d.layer === "o";
          d.e.setAttribute("stroke", frozen ? "var(--ink-3)" : blame ? RED : ORANGE);
          d.e.setAttribute("stroke-width", blame ? d.w + 2 : d.w);
        });
        nodes.forEach((nd) => nd.setAttribute("fill", k >= 3 ? "var(--ink-3)" : ORANGE));
      },
    };
  });
})();

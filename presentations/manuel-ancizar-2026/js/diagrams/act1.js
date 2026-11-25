/* Act 1 · Aprender actuando (1-00 – 1-08).
   act1-matchbox  1-02  one open matchbox: label = board painted by bead colour, mixed beads;
                        step 2: beads in (green) and one bead out (red)
   act1-learn     1-03  the live MENACE replay (seed 35, 200 games, +3/+1/−1)
   act1-losses    1-04  losses per block of 20 with the learning-curve shape overlaid
   act1-curveover 1-04  the learning-curve shape alone, to overlay on Thorndike's plate
   act1-spec      1-05  only wins rewarded (+3/0/−1): result strip and the first box emptying
   act1-backgammon 1-07 stylised backgammon board (background)
   act1-scale     1-08  table sizes on a log scale; the go bar runs off the top
   act1-twoboards 1-08  two almost identical boards, each with its box, a red wall between
   Bead colours are CSS tokens defined in css/diagrams/act1.css (.act1).
   Debug: index.html?act1t=0.4#/1-03/0 freezes every act-1 animation at 40 % (headless screenshots
   do not advance requestAnimationFrame). */
(function () {
  const KINDS = ["corner", "edge", "centre"];
  const NAMES = { corner: "esquina", edge: "lado", centre: "centro" };
  const BEAD = { corner: "var(--bead-corner)", edge: "var(--bead-edge)", centre: "var(--bead-centre)" };
  const T = (a, p) => { const e = DG.el("text", a, p); if (a.fill) e.style.fill = a.fill; return e; };
  // ?act1t=0.4 freezes every act-1 animation at that fraction (to screenshot intermediate states)
  const FREEZE = (() => { try { const v = new URLSearchParams(location.search).get("act1t"); return v == null ? null : +v; } catch (e) { return null; } })();
  const anim = (ms, fn, done) => {
    if (FREEZE == null) return DG.animate(ms, fn, done);
    const t = FREEZE, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    fn(e, t); return () => {};
  };
  const cellKind = (i) => (i === 4 ? "centre" : i % 2 === 0 ? "corner" : "edge");

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

  // 3×3 board, each cell painted with the colour of its bead. marks: 9-char string of X/O/.
  function labelBoard(parent, x, y, s, marks) {
    const g = DG.el("g", {}, parent);
    const gap = Math.max(4, s * 0.045), c = (s - 2 * gap) / 3;
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const cx = x + (i % 3) * (c + gap), cy = y + Math.floor(i / 3) * (c + gap);
      cells.push(DG.el("rect", { x: cx, y: cy, width: c, height: c, rx: Math.max(2, c * 0.08), fill: BEAD[cellKind(i)], style: "transition: opacity .5s" }, g));
      const m = marks && marks[i];
      if (m === "X") {
        const p = c * 0.24;
        DG.el("path", { d: `M${cx + p} ${cy + p} L${cx + c - p} ${cy + c - p} M${cx + c - p} ${cy + p} L${cx + p} ${cy + c - p}`, stroke: "var(--bg)", "stroke-width": c * 0.11, "stroke-linecap": "round" }, g);
      } else if (m === "O") {
        DG.el("circle", { cx: cx + c / 2, cy: cy + c / 2, r: c * 0.27, fill: "none", stroke: "var(--bg)", "stroke-width": c * 0.11 }, g);
      }
    }
    return { g, cells };
  }

  // stable pile positions: rows from the floor up, each row filled from the centre outwards
  function pilePositions(n, r, cap) {
    const out = [];
    for (let row = 0; out.length < n; row++) {
      const k = cap - (row % 2);
      const slots = [];
      for (let j = 0; j < k; j++) slots.push((j - (k - 1) / 2) * 2 * r);
      slots.sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
      slots.forEach((dx) => { if (out.length < n) out.push([dx, -r - row * r * 1.74]); });
    }
    return out;
  }

  function bead(parent, x, y, r, kind) {
    return DG.el("circle", { cx: x, cy: y, r: r, fill: BEAD[kind], stroke: "rgba(0,0,0,0.45)", "stroke-width": Math.max(1.2, r * 0.12) }, parent);
  }

  // An open matchbox: the tray slides out of the sleeve; the sleeve carries the label board.
  // o: {x, y, trayW, h, sleeveW, labelS, marks}
  function matchboxShell(parent, o) {
    const g = DG.el("g", {}, parent);
    const tx = o.x + o.sleeveW - 16;
    DG.el("rect", { x: tx, y: o.y, width: o.trayW, height: o.h, rx: 12, fill: "var(--bg-2)", stroke: "var(--box-edge)", "stroke-width": 4 }, g);
    DG.el("rect", { x: tx + 12, y: o.y + 12, width: o.trayW - 24, height: o.h - 24, rx: 6, fill: "none", stroke: "var(--bg-3)", "stroke-width": 3 }, g);
    const content = DG.el("g", {}, g);
    DG.el("rect", { x: o.x, y: o.y - 18, width: o.sleeveW, height: o.h + 36, rx: 10, fill: "var(--box-card)", stroke: "var(--box-edge)", "stroke-width": 4 }, g);
    const s = o.labelS || Math.min(o.sleeveW - 50, o.h - 30);
    const lb = labelBoard(g, o.x + (o.sleeveW - s) / 2, o.y + (o.h - s) / 2, s, o.marks);
    return { g, content, tray: { x: tx + 12, y: o.y + 12, w: o.trayW - 24, h: o.h - 24 }, label: lb };
  }

  // Matchbox with three piles (corner, edge, centre). o adds {r, cap, max}
  function pileBox(parent, o) {
    const sh = matchboxShell(parent, o);
    const cw = sh.tray.w / 3, floor = sh.tray.y + sh.tray.h - 4;
    const piles = {};
    KINDS.forEach((k, i) => {
      const cx = sh.tray.x + (i + 0.5) * cw;
      const pos = pilePositions(o.max, o.r, o.cap);
      const beads = pos.map(([dx, dy]) => {
        const b = bead(sh.content, cx + dx, floor + dy, o.r, k);
        b.style.display = "none";
        return b;
      });
      piles[k] = { cx, beads };
    });
    function set(counts) {
      KINDS.forEach((k) => piles[k].beads.forEach((b, j) => {
        b.style.display = j < counts[k] ? "" : "none";
        b.setAttribute("fill", BEAD[k]); b.removeAttribute("transform"); b.removeAttribute("opacity");
        b.setAttribute("stroke", "rgba(0,0,0,0.45)");
      }));
    }
    return Object.assign(sh, { piles, set });
  }

  function pileLabels(parent, box, y, numSize) {
    const nums = {};
    KINDS.forEach((k) => {
      const cx = box.piles[k].cx;
      nums[k] = T({ x: cx, y: y, "text-anchor": "middle", "font-size": numSize, "font-weight": 600, class: "serif", text: "4" }, parent);
      T({ x: cx, y: y + numSize * 0.7, "text-anchor": "middle", "font-size": 28, "font-weight": 600, fill: BEAD[k], text: NAMES[k] }, parent);
    });
    return nums;
  }

  const runs = {};
  function menace(seed, rewards, games) {
    const key = seed + ":" + rewards.join(",") + ":" + games;
    return runs[key] || (runs[key] = window.Menace.run({ seed, games, rewards }));
  }

  // ---------------- 1-02 ----------------
  DG.register("act1-matchbox", (mount, o) => {
    const W = o.w || 600, H = o.h || 430;
    const svg = DG.svg(mount, W, H);
    const box = matchboxShell(svg, { x: 4, y: H - 206, trayW: 410, h: 188, sleeveW: 170, labelS: 124 });
    const r = 15, rand = rng(11), t = box.tray;
    const ins = [[t.x + 130, t.y + 50], [t.x + 176, t.y + 36], [t.x + 222, t.y + 54]];
    const outStart = [t.x + t.w - 54, t.y + 96];
    const kinds = ["corner", "edge", "centre", "corner", "edge", "centre", "corner", "edge", "centre", "corner", "edge"];
    const pts = [];
    let guard = 0;
    while (pts.length < kinds.length && guard++ < 20000) {
      const x = t.x + 30 + r + rand() * (t.w - 36 - 2 * r), y = t.y + r + 8 + rand() * (t.h - 2 * r - 16);
      const far = (p, d) => (p[0] - x) ** 2 + (p[1] - y) ** 2 > d * d;
      if (pts.every((p) => far(p, 2 * r + 8)) && ins.every((p) => far(p, 2 * r + 18)) && far(outStart, 2 * r + 18)) pts.push([x, y]);
    }
    pts.forEach(([x, y], i) => bead(box.content, x, y, r, kinds[i]));
    const inG = DG.el("g", {}, svg), outG = DG.el("g", {}, svg);
    const inBeads = ins.map(([x, y], i) => {
      const gg = DG.el("g", {}, inG);
      DG.el("circle", { cx: x, cy: y, r: r + 7, fill: "none", stroke: "var(--act)", "stroke-width": 5 }, gg);
      bead(gg, x, y, r, "centre");
      return { gg, dy: -150 - [10, 0, 16][i] };
    });
    const ax = t.x + 176, ay0 = 24, ay1 = t.y - 22;
    const inArrow = DG.el("path", { d: `M${ax} ${ay0} L${ax} ${ay1} M${ax - 20} ${ay1 - 22} L${ax} ${ay1} L${ax + 20} ${ay1 - 22}`, fill: "none", stroke: "var(--act)", "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, inG);
    T({ x: ax - 74, y: 92, "text-anchor": "middle", "font-size": 64, "font-weight": 700, fill: "var(--act)", text: "+" }, inG);
    const end = [W - 40, 46];
    const outBead = DG.el("g", {}, outG);
    DG.el("circle", { cx: 0, cy: 0, r: r + 7, fill: "none", stroke: "var(--bad)", "stroke-width": 5 }, outBead);
    bead(outBead, 0, 0, r, "edge");
    const hx = W - 52, hy = 96;
    const outArrow = DG.el("path", { d: `M${t.x + t.w - 64} ${t.y + 60} Q${t.x + t.w - 40} ${t.y - 60} ${hx} ${hy} M${hx - 20} ${hy + 8} L${hx} ${hy} L${hx + 6} ${hy + 22}`, fill: "none", stroke: "var(--bad)", "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, outG);
    T({ x: W - 116, y: 70, "text-anchor": "middle", "font-size": 64, "font-weight": 700, fill: "var(--bad)", text: "−" }, outG);
    let cancel = () => {};
    function render(p) { // 0: nothing; 0..1 moving; 1: final
      inG.style.opacity = outG.style.opacity = p > 0 ? 1 : 0;
      inArrow.style.opacity = outArrow.style.opacity = Math.min(1, p * 3);
      inBeads.forEach((b) => b.gg.setAttribute("transform", `translate(0 ${(1 - p) * b.dy})`));
      outBead.setAttribute("transform", `translate(${outStart[0] + (end[0] - outStart[0]) * p} ${outStart[1] + (end[1] - outStart[1]) * p})`);
    }
    return {
      step(k) {
        cancel();
        if (k < (o.beadsAt || 2)) render(0);
        else cancel = anim(1400, (e) => render(e));
      },
    };
  });

  // ---------------- 1-03 ----------------
  DG.register("act1-learn", (mount, o) => {
    const W = 1700, H = o.h || 740;
    const svg = DG.svg(mount, W, H);
    const run = menace(35, [3, 1, -1], 200);
    const box = pileBox(svg, { x: 0, y: 34, trayW: 880, h: 300, sleeveW: 236, labelS: 166, r: 10, cap: 12, max: 160 });
    const nums = pileLabels(svg, box, 418, 58);

    const RX = 1170;
    const q = DG.el("g", { style: "transition: opacity .5s" }, svg);
    ["¿Dónde abrirá", "después de", "200 partidas?"].forEach((s, i) =>
      T({ x: RX, y: 92 + i * 66, "font-size": 58, "font-weight": 600, class: "serif", text: s }, q));
    const opt = T({ x: RX, y: 320, "font-size": 40, "font-weight": 650 }, q);
    [["esquina", "corner"], [" · ", null], ["lado", "edge"], [" · ", null], ["centro", "centre"]].forEach(([s, k]) =>
      DG.el("tspan", { fill: k ? BEAD[k] : "var(--ink-3)", text: s }, opt));

    const ctr = DG.el("g", { style: "transition: opacity .4s" }, svg);
    T({ x: RX, y: 96, "font-size": 32, fill: "var(--ink-3)", "font-weight": 600, text: "partida" }, ctr);
    const ctrN = T({ x: RX - 8, y: 260, "font-size": 180, "font-weight": 600, class: "serif", style: "font-variant-numeric: lining-nums tabular-nums", text: "0" }, ctr);
    T({ x: RX, y: 318, "font-size": 32, fill: "var(--ink-3)", "font-weight": 600, text: "de 200" }, ctr);

    const fin = DG.el("g", { style: "transition: opacity .6s" }, svg);
    T({ x: RX, y: 70, "font-size": 34, fill: "var(--ink-2)", "font-weight": 600, text: "Tras 200 partidas:" }, fin);
    const l2 = T({ x: RX, y: 126, "font-size": 36, "font-weight": 600 }, fin);
    DG.el("tspan", { fill: BEAD.corner, text: "esquina 0" }, l2); DG.el("tspan", { fill: "var(--ink-3)", text: " · " }, l2); DG.el("tspan", { fill: BEAD.edge, text: "lado 0" }, l2);
    T({ x: RX, y: 210, "font-size": 76, "font-weight": 600, class: "serif", fill: BEAD.centre, text: "centro 146" }, fin);
    ["Nadie le dijo que el centro", "es la mejor apertura."].forEach((s, i) =>
      T({ x: RX, y: 288 + i * 50, "font-size": 40, "font-style": "italic", class: "serif", fill: "var(--ink-2)", text: s }, fin));

    // losses per block of 20
    const CY = 500, BASE = H - 42, PER = 13;
    const chart = DG.el("g", { style: "transition: opacity .5s" }, svg);
    T({ x: W, y: BASE - 110, "text-anchor": "end", "font-size": 30, "font-weight": 600, fill: "var(--act)", text: "derrotas cada 20 partidas" }, chart);
    DG.el("line", { x1: 0, x2: W, y1: BASE, y2: BASE, stroke: "var(--ink-4)", "stroke-width": 3 }, chart);
    const SL = W / 10, BW = 118;
    const bars = [];
    for (let b = 0; b < 10; b++) {
      const x = b * SL + (SL - BW) / 2;
      T({ x: x + BW / 2, y: BASE + 34, "text-anchor": "middle", "font-size": 24, fill: "var(--ink-3)", text: `${b * 20 + 1}–${b * 20 + 20}` }, chart);
      const rect = DG.el("rect", { x, y: BASE, width: BW, height: 0, rx: 4, fill: "var(--act)" }, chart);
      const val = T({ x: x + BW / 2, y: BASE - 12, "text-anchor": "middle", "font-size": 40, "font-weight": 600, class: "serif", fill: "var(--act)" }, chart);
      bars.push({ rect, val });
    }
    const loss = run.results.map((r) => (r === "O" ? 1 : 0));

    function render(g, mode) {
      const c = g === 0 ? { corner: 4, edge: 4, centre: 4 } : run.first[g - 1];
      box.set(c);
      KINDS.forEach((k) => { nums[k].textContent = c[k]; });
      box.label.cells.forEach((cell, i) => cell.setAttribute("opacity", mode === "final" && cellKind(i) !== "centre" ? 0.25 : 1));
      q.style.opacity = mode === "ask" ? 1 : 0;
      ctr.style.opacity = mode === "run" ? 1 : 0;
      fin.style.opacity = mode === "final" ? 1 : 0;
      ctrN.textContent = g;
      bars.forEach((bar, b) => {
        const lo = b * 20, hi = Math.min(g, lo + 20);
        let n = 0; for (let i = lo; i < hi; i++) n += loss[i];
        const on = g > lo;
        const h = on ? Math.max(4, n * PER) : 0;
        bar.rect.setAttribute("y", BASE - h); bar.rect.setAttribute("height", h);
        bar.rect.setAttribute("opacity", on && n === 0 ? 0.6 : 1);
        bar.val.setAttribute("y", BASE - h - 12);
        bar.val.textContent = on ? n : "";
      });
    }
    let cancel = () => {};
    return {
      step(k) {
        cancel();
        if (k === 0) render(0, "ask");
        else if (k === 1 && !DG.isStatic()) {
          render(0, "run");
          cancel = anim(25000, (e, t) => render(Math.round(200 * Math.pow(t, 1.5)), "run"));
        } else render(200, "final");
      },
    };
  });

  // ---------------- 1-04 ----------------
  function drawCurve(svg, d, sw) {
    const p = DG.el("path", { d, fill: "none", stroke: "var(--act)", "stroke-width": sw || 9, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: 0.9 }, svg);
    let len = 1200; try { len = p.getTotalLength() || len; } catch (e) {}
    p.setAttribute("stroke-dasharray", len);
    return {
      show(anim) {
        if (!anim || DG.isStatic()) { p.setAttribute("stroke-dashoffset", 0); return () => {}; }
        p.setAttribute("stroke-dashoffset", len);
        return anim(1800, (e) => p.setAttribute("stroke-dashoffset", len * (1 - e)));
      },
    };
  }
  DG.register("act1-curveover", (mount, o) => {
    const svg = DG.svg(mount, o.w, o.h);
    const c = drawCurve(svg, DG.curvePath(o.x0, o.y0, o.cw, o.ch), o.sw);
    let cancel = () => {};
    return { step(k, info) { cancel(); cancel = c.show(info && info.entering); } };
  });
  DG.register("act1-losses", (mount, o) => {
    const W = o.w || 620, H = o.h || 615;
    const svg = DG.svg(mount, W, H);
    const run = menace(35, [3, 1, -1], 200);
    const L = []; for (let b = 0; b < 10; b++) L.push(run.results.slice(b * 20, b * 20 + 20).filter((r) => r === "O").length);
    const x0 = 26, base = H - 70, top = 40, per = (base - top) / 12, sl = (W - x0 - 20) / 10, bw = sl * 0.68;
    DG.el("path", { d: `M${x0} ${top - 20} V${base} H${W - 10}`, fill: "none", stroke: "var(--ink-3)", "stroke-width": 3 }, svg);
    L.forEach((n, b) => {
      const x = x0 + 10 + b * sl + (sl - bw) / 2, h = Math.max(4, n * per);
      DG.el("rect", { x, y: base - h, width: bw, height: h, rx: 3, fill: "var(--act)", opacity: 0.38 }, svg);
      if (n) T({ x: x + bw / 2, y: base - h - 10, "text-anchor": "middle", "font-size": 28, "font-weight": 600, fill: "var(--ink-2)", text: n }, svg);
    });
    T({ x: x0 + 10, y: base + 44, "font-size": 26, fill: "var(--ink-3)", text: "derrotas cada 20 partidas →" }, svg);
    const cx0 = x0 + 10 + sl / 2, cw = 9 * sl;
    const c = drawCurve(svg, DG.curvePath(cx0, top, cw, (base - 6 - top) / 0.86));
    let cancel = () => {};
    return { step(k, info) { cancel(); cancel = c.show(info && info.entering); } };
  });

  // ---------------- 1-05 ----------------
  DG.register("act1-spec", (mount, o) => {
    const W = 1700, H = o.h || 560;
    const svg = DG.svg(mount, W, H);
    const run = menace(35, [3, 0, -1], 20);
    const box = pileBox(svg, { x: 0, y: 100, trayW: 660, h: 200, sleeveW: 190, labelS: 140, r: 19, cap: 4, max: 4 });
    const nums = pileLabels(svg, box, 376, 50);
    const RX = 960;
    const end = DG.el("g", { style: "transition: opacity .5s" }, svg);
    T({ x: RX, y: 150, "font-size": 34, "font-weight": 600, fill: "var(--ink-2)", text: "la primera caja," }, end);
    T({ x: RX, y: 250, "font-size": 96, "font-weight": 600, class: "serif", fill: "var(--bad)", text: "vacía" }, end);
    T({ x: RX, y: 310, "font-size": 40, "font-weight": 600, text: "en la partida 20" }, end);
    // strip
    const CH0 = 64;
    const SY = H - CH0 - 4, CW = 72, GAP = (W - 20 * CW) / 19, CH = 64;
    const strip = DG.el("g", {}, svg);
    const cells = [];
    for (let i = 0; i < 20; i++) {
      const x = i * (CW + GAP);
      DG.el("rect", { x, y: SY, width: CW, height: CH, rx: 8, fill: "none", stroke: "var(--ink-4)", "stroke-width": 2, "stroke-dasharray": "6 6" }, strip);
      const g = DG.el("g", { style: "transition: opacity .25s" }, strip);
      const r = run.results[i], lost = r === "O";
      DG.el("rect", { x, y: SY, width: CW, height: CH, rx: 8, fill: lost ? "color-mix(in srgb, var(--bad) 22%, transparent)" : "none", stroke: lost ? "var(--bad)" : "var(--ink-3)", "stroke-width": 3 }, g);
      T({ x: x + CW / 2, y: SY + CH / 2 + 15, "text-anchor": "middle", "font-size": 40, "font-weight": 650, fill: lost ? "var(--bad)" : "var(--ink-2)", text: lost ? "D" : "E" }, g);
      cells.push(g);
    }
    const legend = T({ x: W, y: SY - 22, "text-anchor": "end", "font-size": 26, fill: "var(--ink-3)" }, svg);
    DG.el("tspan", { "font-weight": 700, fill: "var(--ink-2)", text: "E" }, legend); DG.el("tspan", { text: " empate   " }, legend);
    DG.el("tspan", { "font-weight": 700, fill: "var(--bad)", text: "D" }, legend); DG.el("tspan", { text: " derrota" }, legend);
    T({ x: 0, y: SY - 22, "font-size": 26, fill: "var(--ink-3)", text: "partidas 1 a 20" }, svg);

    const before = (i) => (i === 0 ? { corner: 4, edge: 4, centre: 4 } : run.first[i - 1]);
    const GT = 560;
    function render(u) { // u: ms of replay (0 = before; Infinity = done)
      const done = Math.min(20, Math.floor(u / GT));
      const cur = done < 20 ? done : -1, p = cur >= 0 ? (u - cur * GT) / GT : 0;
      const counts = done === 0 ? before(0) : run.first[done - 1];
      box.set(counts);
      KINDS.forEach((k) => { nums[k].textContent = counts[k]; });
      cells.forEach((c, i) => { c.style.opacity = i < done || (i === cur && p > 0.05) ? 1 : 0; });
      if (cur >= 0 && u > 0) {
        const a = before(cur), b = run.first[cur];
        KINDS.forEach((k) => {
          if (b[k] < a[k]) {
            const el = box.piles[k].beads[b[k]], qq = Math.max(0, (p - 0.2) / 0.8);
            el.style.display = "";
            el.setAttribute("fill", "var(--bad)");
            el.setAttribute("transform", `translate(0 ${-150 * qq})`);
            el.setAttribute("opacity", 1 - qq);
          }
        });
      }
      end.style.opacity = done >= 20 ? 1 : 0;
    }
    let cancel = () => {};
    return {
      step(k) {
        cancel();
        if (k === 0) render(0);
        else if (k === 1 && !DG.isStatic()) cancel = anim(20 * GT + 400, (e, t) => render(t * (20 * GT + 400)));
        else render(Infinity);
      },
    };
  });

  // ---------------- 1-07 ----------------
  DG.register("act1-backgammon", (mount, o) => {
    const W = 1920, H = 1080;
    const svg = DG.svg(mount, W, H);
    const X0 = 150, Y0 = 160, BW = 1620, BH = 800, BAR = 70, half = (BW - BAR) / 2, pw = half / 6, ph = BH * 0.42;
    DG.el("rect", { x: X0, y: Y0, width: BW, height: BH, rx: 16, fill: "none", stroke: "var(--ink-2)", "stroke-width": 10 }, svg);
    DG.el("rect", { x: X0 + half, y: Y0, width: BAR, height: BH, fill: "var(--ink-3)" }, svg);
    const pointX = (i) => { // 0..11 top (left → right), 12..23 bottom
      const j = i % 12; return X0 + (j < 6 ? j * pw : half + BAR + (j - 6) * pw);
    };
    for (let i = 0; i < 24; i++) {
      const x = pointX(i), top = i < 12, y = top ? Y0 : Y0 + BH;
      DG.el("path", { d: `M${x + 6} ${y} L${x + pw / 2} ${top ? y + ph : y - ph} L${x + pw - 6} ${y} Z`, fill: (i + (top ? 0 : 1)) % 2 ? "var(--ink-3)" : "var(--ink)" }, svg);
    }
    const R = pw * 0.42;
    const stacks = [[0, 2, 0], [5, 5, 1], [7, 3, 1], [11, 5, 0], [12, 5, 1], [16, 3, 0], [18, 5, 0], [23, 2, 1], [9, 1, 0], [14, 2, 1]];
    stacks.forEach(([i, n, dark]) => {
      const top = i < 12, x = pointX(i) + pw / 2;
      for (let s = 0; s < n; s++) {
        const y = top ? Y0 + R + 6 + s * 2 * R : Y0 + BH - R - 6 - s * 2 * R;
        DG.el("circle", { cx: x, cy: y, r: R, fill: dark ? "var(--bg)" : "var(--ink)", stroke: "var(--ink)", "stroke-width": 5 }, svg);
      }
    });
  });

  // ---------------- 1-08 ----------------
  DG.register("act1-scale", (mount, o) => {
    const W = o.w || 760, H = o.h || 900;
    const svg = DG.svg(mount, W, H);
    const BASE = H - 110, DEC = 30, X0 = 96, BWD = 170, GAPX = (W - X0 - 3 * BWD) / 2;
    for (let d = 5; d * DEC < BASE + 84; d += 5) {
      const y = BASE - d * DEC;
      DG.el("line", { x1: X0 - 14, x2: W, y1: y, y2: y, stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
      T({ x: X0 - 22, y: y + 8, "text-anchor": "end", "font-size": 24, fill: "var(--ink-3)", html: `10<tspan dy="-10" font-size="17">${d}</tspan>` }, svg);
    }
    DG.el("line", { x1: X0 - 14, x2: W, y1: BASE, y2: BASE, stroke: "var(--ink-3)", "stroke-width": 3 }, svg);
    const data = [
      { name: "triqui", exp: Math.log10(304), val: "304", unit: "cajas" },
      { name: "damas", exp: Math.log10(5e20), val: "5 × 10<tspan dy='-22' font-size='34'>20</tspan>" },
      { name: "go", exp: 170, val: "10<tspan dy='-22' font-size='34'>170</tspan>" },
    ];
    const items = data.map((d, i) => {
      const x = X0 + i * (BWD + GAPX);
      const r = DG.el("rect", { x, y: BASE, width: BWD, height: 0, fill: i === 2 ? "url(#act1-fade)" : "var(--ink-4)" }, svg);
      const cap = DG.el("line", { x1: x, x2: x + BWD, y1: BASE, y2: BASE, stroke: "var(--ink-2)", "stroke-width": 5, opacity: i === 2 ? 0 : 1 }, svg);
      const v = T({ x: x + BWD / 2, y: BASE, "text-anchor": "middle", "font-size": 58, "font-weight": 600, class: "serif", html: d.val, opacity: 0 }, svg);
      if (i === 2) v.ar = T({ x: x + BWD / 2, y: 70, "text-anchor": "middle", "font-size": 64, "font-weight": 600, text: "↑", opacity: 0 }, svg);
      T({ x: x + BWD / 2, y: BASE + 52, "text-anchor": "middle", "font-size": 38, "font-weight": 600, fill: "var(--ink-2)", text: d.name }, svg);
      return { d, x, r, cap, v };
    });
    const defs = DG.el("defs", {}, svg);
    const lg = DG.el("linearGradient", { id: "act1-fade", x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
    DG.el("stop", { offset: "0", "stop-color": "var(--ink-4)" }, lg);
    DG.el("stop", { offset: "1", "stop-color": "var(--ink-3)" }, lg);
    T({ x: X0 - 14, y: BASE + 96, "font-size": 24, fill: "var(--ink-3)", text: "cajas necesarias · escala logarítmica" }, svg);
    function render(t) {
      items.forEach((it, i) => {
        const a = [0, 0.18, 0.4][i], b = [0.25, 0.6, 1][i];
        const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
        const full = i === 2 ? BASE + 200 : it.d.exp * DEC;
        const h = full * u;
        it.r.setAttribute("y", BASE - h); it.r.setAttribute("height", h);
        it.cap.setAttribute("y1", BASE - h); it.cap.setAttribute("y2", BASE - h);
        if (i < 2) { it.v.setAttribute("y", BASE - h - 22); it.v.setAttribute("opacity", u >= 1 ? 1 : 0); }
        else { it.v.setAttribute("y", 150); it.v.setAttribute("opacity", u >= 1 ? 1 : 0); it.v.ar.setAttribute("opacity", u >= 1 ? 1 : 0); }
      });
    }
    let cancel = () => {};
    return {
      step(k, info) {
        cancel();
        if (info && info.entering && !DG.isStatic()) cancel = anim(2600, (e, t) => render(t));
        else render(1);
      },
    };
  });

  DG.register("act1-twoboards", (mount, o) => {
    const W = o.w || 860, H = o.h || 380;
    const svg = DG.svg(mount, W, H);
    const S = 230;
    function board(x, y, marks) {
      const c = S / 3;
      for (let i = 1; i < 3; i++) {
        DG.el("line", { x1: x + i * c, x2: x + i * c, y1: y + 8, y2: y + S - 8, stroke: "var(--ink-2)", "stroke-width": 6, "stroke-linecap": "round" }, svg);
        DG.el("line", { y1: y + i * c, y2: y + i * c, x1: x + 8, x2: x + S - 8, stroke: "var(--ink-2)", "stroke-width": 6, "stroke-linecap": "round" }, svg);
      }
      for (let i = 0; i < 9; i++) {
        const cx = x + (i % 3 + 0.5) * c, cy = y + (Math.floor(i / 3) + 0.5) * c, p = c * 0.26;
        if (marks[i] === "X") DG.el("path", { d: `M${cx - p} ${cy - p} L${cx + p} ${cy + p} M${cx + p} ${cy - p} L${cx - p} ${cy + p}`, stroke: "var(--ink)", "stroke-width": 9, "stroke-linecap": "round" }, svg);
        if (marks[i] === "O") DG.el("circle", { cx, cy, r: p * 1.1, fill: "none", stroke: "var(--ink)", "stroke-width": 8 }, svg);
      }
      // its own little box
      matchboxShell(svg, { x: x + 8, y: y + S + 50, trayW: 150, h: 62, sleeveW: 86, labelS: 50, marks });
    }
    const A = "X.O.O...X", B = "X.O.O..X.";
    board(30, 10, A);
    board(W - 30 - S, 10, B);
    // red wall
    const wx = W / 2 - 34, wy = 0, ww = 68, wh = H - 10;
    DG.el("rect", { x: wx, y: wy, width: ww, height: wh, rx: 4, fill: "var(--bad)" }, svg);
    for (let r = 1; r * 34 < wh; r++) {
      DG.el("line", { x1: wx, x2: wx + ww, y1: wy + r * 34, y2: wy + r * 34, stroke: "var(--bg)", "stroke-width": 3 }, svg);
      const off = r % 2 ? ww / 2 : ww / 4;
      DG.el("line", { x1: wx + off, x2: wx + off, y1: wy + (r - 1) * 34, y2: wy + r * 34, stroke: "var(--bg)", "stroke-width": 3 }, svg);
    }
  });
})();

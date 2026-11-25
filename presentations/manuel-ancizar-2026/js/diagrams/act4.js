/* Act 4 «Aprender es comprimir» — diagrams.
   act4-game       4-02  the audience game (Shannon's game by words), DOM-based.
                         opts.rounds: [{label, words:[…], answer:"w" | ["w1","w2",…], show:[n,…]}]
                         show = words visible at each click before the answer; one more click shows it.
   act4-tube       4-03  f1: a message goes through a channel; predictable words drop, surprises pass.
   act4-nextword   4-04  orange network → violet next-word bars; f1 marks the real word and the difference.
   act4-attention  4-05  attention arcs from one word to the others.
   act4-sizes      4-05  f1: log-scale bars of model sizes.
   act4-othello    4-07  (opts.boardOnly: just the internal board) internal board (k1) → intervention (k2).
   act4-fewshot    4-06  few-shot arithmetic accuracy vs model size (GPT-3).
   act4-cloud      4-08  a cloud of human text flowing into the network.
   act4-type       4-08  types out the model's reply (mount = the bubble; text stays in the HTML). */
(function () {
  const ORANGE = "var(--brain)", VIOLET = "var(--comp)";

  function h(tag, cls, parent, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;

  // text width in an SVG, with a fallback when the slide is not laid out yet
  function tw(t, size, k) {
    let w = 0;
    try { w = t.getComputedTextLength(); } catch (e) {}
    return w > 0 ? w : t.textContent.length * size * (k || 0.5);
  }

  function arrowHead(defs, id, color) {
    const m = DG.el("marker", { id, viewBox: "0 0 10 10", refX: 7, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    DG.el("path", { d: "M0 0 L10 5 L0 10 z", fill: color }, m);
  }

  // stylized network: layers = node counts, or explicit y lists. Returns {nodes, edges}
  function net(parent, xs, layers, y0, y1, o) {
    o = o || {};
    const g = DG.el("g", {}, parent);
    const ge = DG.el("g", {}, g), gn = DG.el("g", {}, g);
    const nodes = layers.map((L, li) => {
      const ys = Array.isArray(L) ? L : Array.from({ length: L }, (_, i) => (L === 1 ? (y0 + y1) / 2 : y0 + (i * (y1 - y0)) / (L - 1)));
      return ys.map((y) => ({ x: xs[li], y }));
    });
    const edges = [];
    for (let li = 0; li < nodes.length - 1; li++)
      nodes[li].forEach((a) => nodes[li + 1].forEach((b) => {
        edges.push({ layer: li, el: DG.el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: ORANGE, "stroke-width": o.ew || 2, opacity: o.eo || 0.3 }, ge) });
      }));
    nodes.forEach((ly) => ly.forEach((n) => {
      n.el = DG.el("circle", { cx: n.x, cy: n.y, r: o.r || 13, fill: "var(--bg)", stroke: ORANGE, "stroke-width": o.sw || 4 }, gn);
    }));
    return { g, nodes, edges };
  }

  function svgIcon(parent, name, x, y, size, color) {
    const s = DG.el("svg", { x, y, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
    s.innerHTML = (window.ICONS && window.ICONS[name]) || "";
    return s;
  }

  /* ---------------- 4-02: the game ---------------- */
  const FAN = [ // relative to the base font size: dy (em), rotation, size, opacity
    { dy: 0.04, rot: 0, s: 1, op: 1 },
    { dy: -1.0, rot: -5, s: 0.72, op: 0.8 },
    { dy: 1.0, rot: 5, s: 0.68, op: 0.72 },
    { dy: -1.78, rot: -9, s: 0.56, op: 0.52 },
    { dy: 1.78, rot: 9, s: 0.54, op: 0.46 },
  ];
  DG.register("act4-game", (mount, o) => {
    const sec = mount.closest("section");
    const label = sec && sec.querySelector("[data-act4-round]");
    const states = [];
    const rounds = (o.rounds || []).map((R, ri) => {
      const div = h("div", "game-round", mount);
      const line = h("div", "game-line", div);
      const ws = R.words.map((w, i) => {
        const s = h("span", "w", line);
        h("span", "t", s, w);
        h("i", "blank-bar", s);
        line.appendChild(i === R.br ? document.createElement("br") : document.createTextNode(" "));
        return s;
      });
      const ans = h("span", "w ans", line);
      let fan = null;
      if (Array.isArray(R.answer)) {
        fan = h("span", "fan", ans);
        fan.style.cssText = "width:2.3em; transition: width .9s cubic-bezier(.2,.7,.2,1)";
        fan._words = R.answer.map((w, i) => {
          const f = FAN[Math.min(i, FAN.length - 1)];
          const e = h("span", "fw", fan, w);
          e.style.fontSize = f.s + "em";
          e._f = f;
          return e;
        });
        const bar = h("i", "blank-bar", ans);
        bar.style.right = "auto"; bar.style.width = "2.2em";
      } else {
        h("span", "t", ans, R.answer);
        h("i", "blank-bar", ans);
      }
      (R.show || [0]).forEach((n) => states.push({ r: ri, n, ans: false }));
      states.push({ r: ri, n: R.words.length, ans: true });
      return { R, div, ws, ans, fan };
    });

    function setFan(fan, on, animate) {
      fan.classList.toggle("on", on);
      fan.style.width = on ? "3.5em" : "2.3em";
      fan._words.forEach((e, i) => {
        const f = e._f;
        // dy is in em of the line; the word's own font-size is f.s em, so divide
        const dy = f.dy / f.s;
        e.style.transitionDelay = on && animate ? 0.25 + i * 0.38 + "s" : "0s";
        e.style.opacity = on ? f.op : 0;
        e.style.transform = on ? `translate(0, calc(-50% + ${dy}em)) rotate(${f.rot}deg)` : `translate(-0.4em, calc(-50% + ${dy}em)) rotate(${f.rot * 0.3}deg) scale(0.92)`;
      });
    }

    let prevR = -1;
    return {
      step(k) {
        const st = states[Math.min(k, states.length - 1)];
        if (!st) return;
        const roundChanged = prevR !== -1 && prevR !== st.r;
        rounds.forEach((Rd, ri) => {
          const on = ri === st.r;
          Rd.div.classList.toggle("on", on);
          const n = on ? st.n : ri < st.r ? Rd.R.words.length : 0;
          const ansOn = on ? st.ans : ri < st.r;
          let stagger = 0;
          Rd.ws.forEach((w, i) => {
            const vis = i < n, was = w.classList.contains("on");
            w.querySelector(".t").style.transitionDelay = vis && !was && on ? (roundChanged ? 0.45 : 0) + stagger++ * 0.16 + "s" : "0s";
            w.classList.toggle("on", vis);
            w.classList.toggle("cur", on && !st.ans && i === n);
          });
          Rd.ans.classList.toggle("on", ansOn);
          Rd.ans.classList.toggle("cur", on && !st.ans && n === Rd.R.words.length);
          const at = Rd.ans.querySelector(".t");
          if (at) at.style.transitionDelay = "0s";
          if (Rd.fan) setFan(Rd.fan, ansOn, on);
        });
        if (label) label.textContent = rounds[st.r].R.label;
        prevR = st.r;
      },
    };
  });

  /* ---------------- 4-03: the channel ---------------- */
  DG.register("act4-tube", (mount, o) => {
    const W = 1700, H = 420, FS = 50, Y = 170;
    const svg = DG.svg(mount, W, H);
    const words = o.words || [];
    const surprise = new Set(o.surprise || []);
    const MOUTH = 1010, TUBE_END = 1270, RX = 1320;
    const lab = (x, y, t, anchor) => DG.el("text", { x, y, "font-size": 24, "font-weight": 600, "letter-spacing": "0.12em", fill: "var(--ink-3)", "text-anchor": anchor || "start", text: t }, svg);
    lab(0, 44, "QUIEN ENVÍA");
    lab(RX, 44, "QUIEN RECIBE");
    lab((MOUTH + TUBE_END) / 2, 92, "EL CANAL", "middle");
    // a faint copy of the message stays where it was written
    const ghost = DG.el("g", {}, svg);
    const gts = words.map((w) => DG.el("text", { x: 0, y: Y, "font-size": FS, class: "serif", "font-weight": 500, fill: "var(--ink-4)", text: w }, ghost));
    const ts = words.map((w) => DG.el("text", { x: 0, y: 0, "font-size": FS, class: "serif", "font-weight": 500, fill: "var(--ink)", text: w }, svg));
    // the tube is drawn over the words so they disappear inside it
    DG.el("rect", { x: MOUTH, y: Y - 62, width: TUBE_END - MOUTH, height: 92, rx: 46, fill: "var(--bg-2)", stroke: "var(--ink-3)", "stroke-width": 3 }, svg);
    DG.el("ellipse", { cx: MOUTH + 4, cy: Y - 16, rx: 14, ry: 44, fill: "var(--bg-3)", stroke: "var(--ink-3)", "stroke-width": 3 }, svg);
    const noteDrop = DG.el("text", { x: 760, y: 404, "font-size": 30, fill: "var(--ink-3)", "text-anchor": "middle", text: "se adivina: no se envía" }, svg);
    const noteRecv = DG.el("text", { x: RX, y: Y + 76, "font-size": 30, fill: "var(--ink-3)", text: "…y adivina el resto" }, svg);
    const ROT = [-7, 5, -3, 8, -6, 4, -5, 6];
    const JIT = [6, -8, 10, -4, 4, -6, 8, 0];
    let L = null;
    function layout() {
      const ws = ts.map((t) => tw(t, FS, 0.48));
      const gap = FS * 0.3;
      let x = 0;
      const x0 = ws.map((w) => { const v = x; x += w + gap; return v; });
      let rx = RX, pj = 0;
      const dest = ws.map((w, i) => {
        if (surprise.has(i)) { const d = { x: rx, y: Y, rot: 0, s: 1 }; rx += w + gap; return d; }
        const d = { x: x0[i] + w * 0.06, y: 330 + JIT[pj % JIT.length], rot: ROT[pj % ROT.length], s: 0.88 };
        pj++;
        return d;
      });
      // the note sits under the dropped words
      const drops = ws.map((w, i) => i).filter((i) => !surprise.has(i));
      if (drops.length) noteDrop.setAttribute("x", ((x0[drops[0]] + x0[drops[drops.length - 1]] + ws[drops[drops.length - 1]]) / 2).toFixed(1));
      L = { ws, x0, dest };
      gts.forEach((g, i) => g.setAttribute("x", x0[i].toFixed(1)));
    }
    function place(i, x, y, rot, s, fill, op) {
      ts[i].setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s})`);
      ts[i].setAttribute("fill", fill);
      ts[i].setAttribute("opacity", op);
    }
    // t in [0,1]: word i (in reading order) hops to the mouth of the channel, then passes or drops
    const GAP = 0.1, D = 0.26;
    function draw(t) {
      words.forEach((w, i) => {
        const u = clamp01((t - i * GAP) / D), d = L.dest[i], wd = L.ws[i];
        let x = L.x0[i], y = Y, rot = 0, s = 1, fill = "var(--ink)", op = 1;
        if (surprise.has(i)) {
          // hop over the rest of the line into the channel, then out to the receiver
          const a = clamp01(u / 0.5), bb = clamp01((u - 0.5) / 0.5), xm = MOUTH - wd + 4;
          if (u > 0) fill = VIOLET;
          x = u <= 0.5 ? lerp(L.x0[i], xm, ease(a)) : lerp(xm, d.x, ease(bb));
          y = Y - 100 * Math.sin(Math.PI * a);
        } else if (u > 0) {
          // predictable: greys out and drops where it stands
          const e = easeOut(u);
          x = lerp(L.x0[i], d.x, e); y = lerp(Y, d.y, u * u);
          rot = d.rot * e; s = lerp(1, d.s, e); fill = "var(--ink-3)"; op = lerp(1, 0.6, e);
        }
        place(i, x, y, rot, s, fill, op);
        gts[i].setAttribute("opacity", (clamp01(u * 3) * 0.8).toFixed(2)); // a faint trace stays behind
      });
      const n = clamp01((t - 0.9) / 0.1);
      noteDrop.setAttribute("opacity", n); noteRecv.setAttribute("opacity", n);
    }
    let cancel = () => {}, prev = 0;
    const api = {
      step(k, info) {
        layout();
        cancel();
        if (k >= 1 && prev < 1 && !(info && info.entering) && !DG.isStatic()) cancel = DG.animate(8000, (e, t) => draw(t));
        else draw(k >= 1 ? 1 : 0);
        prev = k;
      },
    };
    if (document.fonts) document.fonts.ready.then(() => api.step(prev));
    return api;
  });

  /* ---------------- 4-04: next word ---------------- */
  DG.register("act4-nextword", (mount, o) => {
    const W = 1700, H = 580;
    const svg = DG.svg(mount, W, H);
    const defs = DG.el("defs", {}, svg);
    arrowHead(defs, "a4-ah-ink", "var(--ink-3)");
    arrowHead(defs, "a4-ah-opt", "var(--opt)");
    const bars = o.bars || [];
    const ROW = 90, Y0 = 46;
    const yc = bars.map((_, i) => Y0 + i * ROW);
    const BX = 850, SC = 790, BH = 48;
    // input arrow from the sentence
    DG.el("path", { d: "M40 -26 V20", stroke: "var(--ink-3)", "stroke-width": 3, fill: "none", "marker-end": "url(#a4-ah-ink)" }, svg);
    const N = net(svg, [40, 200, 360, 520], [4, 5, 5, yc], 70, yc[yc.length - 1] - 40);
    // connectors from output neurons to labels
    yc.forEach((y) => DG.el("line", { x1: 540, y1: y, x2: 580, y2: y, stroke: "var(--ink-4)", "stroke-width": 2, "stroke-dasharray": "4 6" }, svg));
    const gT = DG.el("g", { opacity: 0, style: "transition: opacity .6s" }, svg);
    const rows = bars.map(([w, p], i) => {
      const other = i === bars.length - 1 && /otras/.test(w);
      const y = yc[i];
      const lab = DG.el("text", { x: BX - 28, y: y + 15, "font-size": 46, class: "serif", "text-anchor": "end", fill: other ? "var(--ink-3)" : "var(--ink)", text: w }, svg);
      const bar = DG.el("rect", { x: BX, y: y - BH / 2, width: p * SC, height: BH, rx: 6, fill: other ? "var(--ink-4)" : VIOLET }, svg);
      const val = DG.el("text", { x: BX + p * SC + 18, y: y + 12, "font-size": 34, fill: "var(--ink-2)", text: String(p.toFixed(2)).replace(".", ",") }, svg);
      return { lab, bar, val, p };
    });
    DG.el("text", { x: BX + SC, y: yc[yc.length - 1] + 12, "font-size": 28, "font-style": "italic", fill: "var(--ink-3)", "text-anchor": "end", text: "ilustrativo" }, svg);
    // f1: the target for the real word, and the difference
    const ri = o.real || 0, rp = bars[ri] ? bars[ri][1] : 0, ry = yc[ri];
    DG.el("rect", { x: BX + rp * SC, y: ry - BH / 2, width: (1 - rp) * SC, height: BH, rx: 6, fill: VIOLET, opacity: 0.16 }, gT);
    DG.el("rect", { x: BX, y: ry - BH / 2, width: SC, height: BH, rx: 6, fill: "none", stroke: VIOLET, "stroke-width": 3, "stroke-dasharray": "10 8" }, gT);
    DG.el("text", { x: BX + SC + 14, y: ry + 12, "font-size": 34, fill: VIOLET, "font-weight": 650, text: "1" }, gT);
    DG.el("path", { d: `M${BX + rp * SC + 6} ${ry - BH / 2 - 14} V${ry - BH / 2 - 24} H${BX + SC - 6} V${ry - BH / 2 - 14}`, fill: "none", stroke: VIOLET, "stroke-width": 2.5 }, gT);
    DG.el("text", { x: BX + (rp + (1 - rp) / 2) * SC, y: ry - BH / 2 - 36, "font-size": 28, "font-weight": 600, fill: VIOLET, "text-anchor": "middle", text: "lo que pasó − lo que esperaba" }, gT);
    const yb = yc[yc.length - 1] + 66;
    DG.el("path", { d: `M${BX - 60} ${yb - 30} Q${BX - 120} ${yb + 6} ${BX - 300} ${yb + 6} L 120 ${yb + 6}`, fill: "none", stroke: "var(--opt)", "stroke-width": 4, "marker-end": "url(#a4-ah-opt)" }, gT);
    DG.el("text", { x: 470, y: yb - 10, "font-size": 28, "font-weight": 600, fill: "var(--opt)", "text-anchor": "middle", text: "ajusta los pesos" }, gT);

    const sec = mount.closest("section");
    const badge = sec && sec.querySelector(".rule-badge");
    const sent = sec && sec.querySelector(".sent");
    let cancel = () => {}, prev = 0;
    function edges(t) { // t: 0..1 a blue wave going backwards through the layers
      const nl = 3;
      N.edges.forEach((e) => {
        const c = 1 - (e.layer + 0.5) / nl; // right layers first
        const d = Math.abs(t * 1.3 - 0.15 - c);
        const on = d < 0.18 && t > 0 && t < 1;
        e.el.setAttribute("stroke", on ? "var(--opt)" : ORANGE);
        e.el.setAttribute("opacity", on ? 0.8 : 0.3);
      });
    }
    return {
      step(k, info) {
        const on = k >= 1;
        gT.style.opacity = on ? 1 : 0;
        rows[ri] && rows[ri].lab.setAttribute("font-weight", on ? 700 : 400);
        if (badge) badge.classList.toggle("lit", on);
        if (sent) sent.classList.toggle("real", on);
        cancel();
        if (on && prev < 1 && !(info && info.entering) && !DG.isStatic()) cancel = DG.animate(1800, (e, t) => edges(t));
        else edges(0);
        prev = k;
      },
    };
  });

  /* ---------------- 4-05: attention ---------------- */
  DG.register("act4-attention", (mount, o) => {
    const W = 1700, H = 440, FS = 66, BASE = 410;
    const svg = DG.svg(mount, W, H);
    const words = o.words || [], from = o.from || 0, wt = o.w || [];
    const gA = DG.el("g", {}, svg);
    const ts = words.map((w, i) => DG.el("text", { x: 0, y: BASE, "font-size": FS, class: "serif", "font-weight": i === from ? 650 : 500, fill: i === from || wt[i] === Math.max(...wt) ? VIOLET : "var(--ink)", text: w }, svg));
    const under = DG.el("rect", { x: 0, y: BASE + 16, width: 10, height: 7, rx: 3, fill: VIOLET }, svg);
    let arcs = [], cx = [];
    function layout() {
      const ws = ts.map((t) => tw(t, FS, 0.5));
      const gap = FS * 0.32;
      const total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
      let x = (W - total) / 2;
      cx = ws.map((w, i) => { ts[i].setAttribute("x", x.toFixed(1)); const c = x + w / 2; x += w + gap; return c; });
      under.setAttribute("x", cx[from] - ws[from] / 2); under.setAttribute("width", ws[from]);
      gA.innerHTML = "";
      const top = BASE - FS * 0.82;
      const order = words.map((_, i) => i).filter((i) => i !== from).sort((a, b) => (wt[a] || 0) - (wt[b] || 0));
      arcs = order.map((i) => {
        const a = wt[i] || 0, x1 = cx[from], x2 = cx[i];
        const hh = Math.min(310, 30 + Math.abs(x2 - x1) * 0.29);
        const d = `M${x1} ${top} C${x1} ${top - hh} ${x2} ${top - hh} ${x2} ${top}`;
        const p = DG.el("path", { d, fill: "none", stroke: VIOLET, "stroke-width": (2 + a * 30).toFixed(1), "stroke-linecap": "round", opacity: Math.min(1, 0.22 + a * 1.4).toFixed(2) }, gA);
        const dot = DG.el("circle", { cx: x2, cy: top, r: 4 + a * 10, fill: VIOLET, opacity: Math.min(1, 0.3 + a * 1.3) }, gA);
        return { p, dot, a };
      });
    }
    let cancel = () => {}, lastK = 0;
    const api = {
      step(k, info) {
        lastK = k;
        layout();
        cancel();
        const grow = (t) => arcs.forEach((A, j) => {
          let len = 1000;
          try { len = A.p.getTotalLength(); } catch (e) {}
          const u = clamp01(t * 1.6 - j * 0.07);
          A.p.style.strokeDasharray = len;
          A.p.style.strokeDashoffset = len * (1 - u);
          A.dot.style.opacity = u >= 1 ? "" : 0;
        });
        if (k === 0 && info && info.entering && !DG.isStatic()) cancel = DG.animate(1800, (e) => grow(e));
        else grow(1);
      },
    };
    if (document.fonts) document.fonts.ready.then(() => api.step(lastK));
    return api;
  });

  /* ---------------- 4-05: model sizes (log scale) ---------------- */
  DG.register("act4-sizes", (mount, o) => {
    const W = 820, H = 500, U = 108, LO = 7; // px per ×10; axis starts at 10^7
    const svg = DG.svg(mount, W, H);
    const ms = o.models || [];
    const rows = ms.map(([yr, name, v, label], i) => {
      const y = i * 136;
      DG.el("text", { x: 0, y: y + 40, "font-size": 40, class: "serif", "font-weight": 600, fill: "var(--ink)", text: yr }, svg);
      DG.el("text", { x: 112, y: y + 38, "font-size": 30, fill: "var(--ink-3)", text: name }, svg);
      const len = (Math.log10(v) - LO) * U;
      const bar = DG.el("rect", { x: 0, y: y + 58, width: len, height: 50, rx: 6, fill: VIOLET, opacity: 0.55 + 0.45 * (i / Math.max(1, ms.length - 1)) }, svg);
      const val = DG.el("text", { x: len + 20, y: y + 97, "font-size": 40, class: "serif", "font-weight": 600, fill: "var(--ink)", text: label }, svg);
      return { bar, val, len };
    });
    const ay = ms.length * 136 + 6;
    DG.el("line", { x1: 0, x2: 5 * U, y1: ay, y2: ay, stroke: "var(--ink-4)", "stroke-width": 2 }, svg);
    for (let j = 0; j <= 5; j++) DG.el("line", { x1: j * U, x2: j * U, y1: ay - 8, y2: ay + 8, stroke: "var(--ink-3)", "stroke-width": 2 }, svg);
    DG.el("text", { x: 0, y: ay + 44, "font-size": 26, fill: "var(--ink-3)", text: "escala logarítmica: cada marca, ×10" }, svg);
    let cancel = () => {}, prev = 0;
    function draw(t) {
      rows.forEach((r, i) => {
        const u = ease(clamp01(t * 1.6 - i * 0.3));
        r.bar.setAttribute("width", (r.len * u).toFixed(1));
        r.val.setAttribute("x", (r.len * u + 20).toFixed(1));
        r.val.setAttribute("opacity", u);
      });
    }
    return {
      step(k, info) {
        cancel();
        if (k >= 1 && prev < 1 && !(info && info.entering) && !DG.isStatic()) cancel = DG.animate(1800, (e, t) => draw(t));
        else draw(k >= 1 ? 1 : 0);
        prev = k;
      },
    };
  });

  /* ---------------- 4-06: Othello-GPT ---------------- */
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const COLS = "ABCDEFGH";
  function othFlips(b, r, c, p) {
    if (b[r][c]) return [];
    const out = [];
    for (const [dr, dc] of DIRS) {
      let rr = r + dr, cc = c + dc; const run = [];
      while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr][cc] === -p) { run.push([rr, cc]); rr += dr; cc += dc; }
      if (run.length && rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr][cc] === p) out.push(...run);
    }
    return out;
  }
  function othLegal(b, p) {
    const L = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (othFlips(b, r, c, p).length) L.push(r * 8 + c);
    return L;
  }
  const sq = (m) => [Number(m.slice(1)) - 1, COLS.indexOf(m[0].toUpperCase())];
  DG.register("act4-othello", (mount, o) => {
    const W = 1700, H = 540;
    const svg = DG.svg(mount, W, H);
    const defs = DG.el("defs", {}, svg);
    arrowHead(defs, "a4-ah-ink2", "var(--ink-3)");
    // the game: 1 = black, −1 = white; black moves first
    const b = [...Array(8)].map(() => Array(8).fill(0));
    b[3][3] = -1; b[4][4] = -1; b[3][4] = 1; b[4][3] = 1;
    let p = 1;
    (o.moves || []).forEach((m) => {
      const [r, c] = sq(m), f = othFlips(b, r, c, p);
      if (!f.length) console.warn("act4-othello: illegal move", m);
      b[r][c] = p; f.forEach(([a, d]) => (b[a][d] = p)); p = -p;
    });
    const before = othLegal(b, p);
    const [fr, fc] = sq(o.flip || "D4");
    const b2 = b.map((r) => r.slice()); b2[fr][fc] = -b2[fr][fc];
    const after = othLegal(b2, p);

    // tape
    const TX = 0, TW = 190, TH = 500;
    DG.el("rect", { x: TX, y: 10, width: TW, height: TH, rx: 14, fill: "var(--bg-2)", stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
    for (let y = 34; y < TH; y += 34) {
      DG.el("circle", { cx: TX + 16, cy: y, r: 4, fill: "var(--bg-3)" }, svg);
      DG.el("circle", { cx: TX + TW - 16, cy: y, r: 4, fill: "var(--bg-3)" }, svg);
    }
    (o.moves || []).concat(["…"]).forEach((m, i) => {
      DG.el("text", { x: TX + TW / 2, y: 86 + i * 76, "font-size": 46, class: "mono", "font-weight": 700, fill: VIOLET, "text-anchor": "middle", text: m }, svg);
    });
    DG.el("path", { d: "M215 260 H300", stroke: "var(--ink-3)", "stroke-width": 3, fill: "none", "marker-end": "url(#a4-ah-ink2)" }, svg);
    net(svg, [340, 480, 620, 760], [5, 7, 7, 5], 50, 470);

    // board
    const CS = 56, BX = 1110, BY = 30;
    const gB = DG.el("g", { opacity: 0, style: "transition: opacity .7s" }, svg);
    const probe = DG.el("g", { opacity: 0, style: "transition: opacity .7s" }, svg);
    DG.el("path", { d: `M790 260 C 900 260, 980 260, ${BX - 50} 260`, stroke: "var(--ink-3)", "stroke-width": 3, "stroke-dasharray": "9 9", fill: "none", "marker-end": "url(#a4-ah-ink2)" }, probe);
    DG.el("text", { x: 975, y: 236, "font-size": 28, fill: "var(--ink-3)", "text-anchor": "middle", text: "mirar adentro" }, probe);
    DG.el("rect", { x: BX, y: BY, width: 8 * CS, height: 8 * CS, rx: 6, fill: "var(--bg-2)", stroke: "var(--ink-4)", "stroke-width": 2 }, gB);
    for (let i = 1; i < 8; i++) {
      DG.el("line", { x1: BX + i * CS, x2: BX + i * CS, y1: BY, y2: BY + 8 * CS, stroke: "var(--bg-3)", "stroke-width": 2 }, gB);
      DG.el("line", { y1: BY + i * CS, y2: BY + i * CS, x1: BX, x2: BX + 8 * CS, stroke: "var(--bg-3)", "stroke-width": 2 }, gB);
    }
    for (let i = 0; i < 8; i++) {
      DG.el("text", { x: BX + i * CS + CS / 2, y: BY + 8 * CS + 34, "font-size": 24, fill: "var(--ink-3)", "text-anchor": "middle", text: COLS[i] }, gB);
      DG.el("text", { x: BX - 18, y: BY + i * CS + CS / 2 + 8, "font-size": 24, fill: "var(--ink-3)", "text-anchor": "middle", text: i + 1 }, gB);
    }
    const cxy = (r, c) => [BX + c * CS + CS / 2, BY + r * CS + CS / 2];
    const discs = {};
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c]) {
      const [x, y] = cxy(r, c);
      discs[r * 8 + c] = DG.el("circle", { cx: x, cy: y, r: 21, "stroke-width": 3, style: "transition: fill .5s, stroke .5s" }, gB);
    }
    const ring = DG.el("circle", { cx: cxy(fr, fc)[0], cy: cxy(fr, fc)[1], r: 26, fill: "none", stroke: "var(--bad)", "stroke-width": 5, opacity: 0, style: "transition: opacity .5s" }, gB);
    const preds = {};
    new Set(before.concat(after)).forEach((q) => {
      const [x, y] = cxy(Math.floor(q / 8), q % 8);
      const g = DG.el("g", { style: "transition: opacity .6s" }, gB);
      const dot = DG.el("circle", { cx: x, cy: y, r: 12, fill: VIOLET }, g);
      const ghost = DG.el("circle", { cx: x, cy: y, r: 14, fill: "none", stroke: "var(--ink-3)", "stroke-width": 2.5, "stroke-dasharray": "5 5" }, g);
      preds[q] = { g, dot, ghost };
    });
    const legend = DG.el("g", {}, gB);
    DG.el("circle", { cx: BX + 8 * CS + 34, cy: BY + 20, r: 12, fill: VIOLET }, legend);
    DG.el("text", { x: BX + 8 * CS + 56, y: BY + 29, "font-size": 26, fill: "var(--ink-2)", text: "jugada" }, legend);
    DG.el("text", { x: BX + 8 * CS + 56, y: BY + 61, "font-size": 26, fill: "var(--ink-2)", text: "predicha" }, legend);

    function paint(board) {
      for (const q in discs) {
        const v = board[Math.floor(q / 8)][q % 8];
        discs[q].setAttribute("fill", v === 1 ? "var(--bg)" : "var(--ink)");
        discs[q].setAttribute("stroke", v === 1 ? "var(--ink-3)" : "var(--ink)");
      }
    }
    if (o.boardOnly) {                       // crop to the board (and its legend); text keeps its stage size
      const x0 = BX - 44, w = W - x0 + 40, h = BY + 8 * CS + 48;
      svg.setAttribute("viewBox", `${x0} 0 ${w} ${h}`);
      svg.setAttribute("width", w); svg.setAttribute("height", h);
      svg.style.overflow = "hidden";
      probe.style.display = "none";
    }
    return {
      step(k) {
        gB.style.opacity = k >= 1 ? 1 : 0;
        probe.style.opacity = k >= 1 ? 1 : 0;
        const intervened = k >= 2;
        paint(intervened ? b2 : b);
        ring.style.opacity = intervened ? 1 : 0;
        const now = intervened ? after : before;
        for (const q in preds) {
          const P = preds[q], inNow = now.includes(+q), wasBefore = before.includes(+q);
          P.dot.style.opacity = inNow ? 1 : 0;
          P.ghost.style.opacity = intervened && wasBefore && !inNow ? 1 : 0;
          P.dot.style.transition = P.ghost.style.transition = "opacity .6s ease " + (intervened ? ".5s" : "0s");
        }
      },
    };
  });

  /* ---------------- 4-08: the cloud of human text ---------------- */
  DG.register("act4-cloud", (mount, o) => {
    const W = 760, H = 560;
    const svg = DG.svg(mount, W, H);
    const defs = DG.el("defs", {}, svg);
    arrowHead(defs, "a4-ah-vio", VIOLET);
    const N = net(svg, [560, 640, 720], [4, 5, 4], 110, 390, { r: 11 });
    const inputs = N.nodes[0];
    const CHIPS = [[0, 10], [200, 130], [10, 250], [190, 370]];
    const SNIPS = [[260, 52], [0, 112], [236, 240], [0, 350], [10, 470]];
    const gS = DG.el("g", {}, svg), gF = DG.el("g", {}, svg), gC = DG.el("g", {}, svg);
    (o.snips || []).forEach((t, i) => {
      const [x, y] = SNIPS[i % SNIPS.length];
      const code = /[(){}:=]/.test(t) && !/¿/.test(t);
      DG.el("text", { x, y, "font-size": 24, "font-style": code ? "normal" : "italic", class: code ? "mono" : "serif", fill: "var(--ink-3)", opacity: 0.85, text: t }, gS);
    });
    const starts = [];
    (o.chips || []).forEach(([icon, label], i) => {
      const [x, y] = CHIPS[i % CHIPS.length];
      const w = 64 + label.length * 19 + 40;
      DG.el("rect", { x, y, width: w, height: 66, rx: 33, fill: "var(--bg-2)", stroke: "var(--bg-3)", "stroke-width": 2 }, gC);
      svgIcon(gC, icon, x + 22, y + 15, 36, "var(--ink-2)");
      DG.el("text", { x: x + 70, y: y + 44, "font-size": 32, fill: "var(--ink)", text: label }, gC);
      starts.push([x + w, y + 33]);
    });
    // particles flowing into the network (SMIL; calm, continuous)
    starts.forEach(([x, y], i) => {
      inputs.forEach((n, j) => {
        if ((i + j) % 2) return;
        const d = `M${x + 6} ${y} C ${x + 120} ${y}, ${n.x - 140} ${n.y}, ${n.x - 14} ${n.y}`;
        DG.el("path", { d, fill: "none", stroke: "var(--ink-4)", "stroke-width": 1.5, opacity: 0.6 }, gF);
        const c = DG.el("circle", { r: 5, fill: "var(--ink-2)", opacity: 0.9 }, gF);
        const am = DG.el("animateMotion", { dur: (2.6 + ((i * 3 + j) % 5) * 0.45).toFixed(2) + "s", begin: (-((i * 7 + j * 3) % 10) * 0.37).toFixed(2) + "s", repeatCount: "indefinite", path: d }, c);
      });
    });
    const out = N.nodes[N.nodes.length - 1];
    const oy = out[out.length - 1].y;
    const mid = N.nodes[1][N.nodes[1].length - 1];
    DG.el("path", { d: `M${mid.x} ${oy + 22} V${oy + 80}`, stroke: VIOLET, "stroke-width": 4, fill: "none", "marker-end": "url(#a4-ah-vio)" }, svg);
    DG.el("text", { x: mid.x, y: oy + 124, "font-size": 30, "font-weight": 600, fill: VIOLET, "text-anchor": "middle", text: "la palabra siguiente" }, svg);
  });

  /* ---------------- 4-08: typing ---------------- */
  DG.register("act4-type", (mount) => {
    const spans = Array.from(mount.querySelectorAll("span"));
    const full = spans.map((s) => s.textContent);
    const total = full.reduce((a, s) => a + s.length, 0);
    function show(n) { // n characters typed (Infinity = all)
      let left = n, caret = false;
      spans.forEach((s, i) => {
        const t = full[i];
        const a = Math.max(0, Math.min(t.length, left));
        left -= t.length;
        if (a >= t.length) { s.textContent = t; return; }
        s.textContent = "";
        s.appendChild(document.createTextNode(t.slice(0, a)));
        if (!caret) { const c = document.createElement("i"); c.className = "caret"; s.appendChild(c); caret = true; }
        const g = document.createElement("i");
        g.style.cssText = "visibility:hidden; font-style:inherit";
        g.textContent = t.slice(a);
        s.appendChild(g);
      });
    }
    let cancel = () => {}, prev = 0;
    return {
      step(k, info) {
        cancel();
        if (k === 1 && prev < 1 && !(info && info.entering) && !DG.isStatic()) {
          show(0);
          // wait for the bubble to rise, then type at ~42 characters per second
          const t0 = setTimeout(() => { cancel = DG.animate(total * 24, (e, t) => show(Math.round(t * total))); }, 700);
          cancel = () => clearTimeout(t0);
        } else show(Infinity);
        prev = k;
      },
    };
  });

  /* ---------------- 4-06: few-shot arithmetic vs model size (Brown et al. 2020, table H.1) ----------------
     opts.sizes: x labels; opts.series: [[label, [values %], dashed?]]. opts.at: step at which the lines appear (default 1). */
  DG.register("act4-fewshot", (mount, o) => {
    const W = o.w || 940, H = o.h || 600;
    const svg = DG.svg(mount, W, H);
    const PL = 92, PR = W - 110, PT = 20, PB = H - 104;
    const n = o.sizes.length;
    const X = (i) => PL + 30 + (i / (n - 1)) * (PR - PL - 60);
    const Y = (v) => PB - (v / 100) * (PB - PT);
    [0, 25, 50, 75, 100].forEach((v) => {
      DG.el("line", { x1: PL, x2: PR, y1: Y(v), y2: Y(v), stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
      DG.el("text", { x: PL - 14, y: Y(v) + 9, "text-anchor": "end", "font-size": 24, fill: "var(--ink-3)", text: v + " %" }, svg);
    });
    DG.el("line", { x1: PL, x2: PR, y1: PB, y2: PB, stroke: "var(--ink-4)", "stroke-width": 3 }, svg);
    o.sizes.forEach((t, i) => {
      const big = i >= n - 2;
      DG.el("text", { x: X(i), y: PB + 36, "text-anchor": "middle", "font-size": big ? 24 : 22, "font-weight": big ? 650 : 400, fill: big ? "var(--ink)" : "var(--ink-3)", text: t }, svg);
    });
    DG.el("text", { x: (PL + PR) / 2, y: PB + 86, "text-anchor": "middle", "font-size": 26, fill: "var(--ink-2)", text: "tamaño del modelo (millones de pesos)" }, svg);
    const groups = o.series.map(([lab, vals, dashed], si) => {
      const g = DG.el("g", { style: "transition: opacity .7s" }, svg);
      const d = vals.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join("");
      const path = DG.el("path", { d, fill: "none", stroke: VIOLET, "stroke-width": dashed ? 4 : 7, "stroke-dasharray": dashed ? "12 10" : "none", "stroke-linejoin": "round", opacity: dashed ? 0.75 : 1 }, g);
      vals.forEach((v, i) => DG.el("circle", { cx: X(i), cy: Y(v), r: dashed ? 7 : 10, fill: dashed ? "var(--bg)" : VIOLET, stroke: VIOLET, "stroke-width": 4 }, g));
      const last = vals[vals.length - 1];
      DG.el("text", { x: X(n - 1) + 20, y: Y(last) + 10, "font-size": 30, "font-weight": 650, fill: VIOLET, text: Math.round(last) + " %" }, g);
      // legend, top left of the plot (empty region)
      const ly = PT + 34 + si * 44, lx = PL + 30;
      DG.el("line", { x1: lx, x2: lx + 60, y1: ly - 9, y2: ly - 9, stroke: VIOLET, "stroke-width": dashed ? 4 : 7, "stroke-dasharray": dashed ? "12 10" : "none" }, g);
      DG.el("text", { x: lx + 76, y: ly, "font-size": 28, fill: "var(--ink)", text: "sumas de " + lab }, g);
      const len = path.getTotalLength ? path.getTotalLength() : 2000;
      return { g, path, len };
    });
    let cancel = () => {};
    return {
      step(k, info) {
        cancel();
        const at = o.at || 1, on = k >= at;
        groups.forEach((s) => { s.g.style.opacity = on ? 1 : 0; s.path.style.strokeDasharray = ""; });
        if (on && info && !info.entering && !DG.isStatic() && k === at) {
          const solid = groups.filter((s) => s.path.getAttribute("stroke-dasharray") === "none");
          solid.forEach((s) => { s.path.style.strokeDasharray = s.len; s.path.style.strokeDashoffset = s.len; });
          cancel = DG.animate(1800, (t) => solid.forEach((s) => (s.path.style.strokeDashoffset = (s.len * (1 - t)).toFixed(1))),
            () => solid.forEach((s) => { s.path.style.strokeDasharray = ""; s.path.style.strokeDashoffset = ""; }));
        }
      },
    };
  });
})();

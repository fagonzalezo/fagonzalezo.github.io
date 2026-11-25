/* Small shared diagrams.
   curveicon  — the learning-curve shape (recurring device 1). opts: {w, h, dir:"down"|"up", color, label}
                Usually placed with class="curve-icon" (bottom-right corner).
   faces      — A-04: a grid of line-drawn generic faces and a list of "rules" that get struck out.
                opts: {seq:[{rules:n, strike:n}]} */
(function () {
  // A fixed, hand-tuned noisy decreasing curve (same everywhere, so it reads as "the" shape).
  const SHAPE = [1, 0.93, 0.97, 0.8, 0.86, 0.66, 0.7, 0.52, 0.58, 0.42, 0.46, 0.33, 0.36, 0.27, 0.3, 0.22, 0.24, 0.18, 0.2, 0.16, 0.17, 0.15, 0.15, 0.14];
  DG.curveShape = SHAPE;
  DG.curvePath = function (x0, y0, w, h, dir) {
    return SHAPE.map((v, i) => {
      const x = x0 + (i / (SHAPE.length - 1)) * w;
      const vv = dir === "up" ? 1 - v : v;
      const y = y0 + (1 - vv) * h;
      return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
  };

  DG.register("curveicon", (mount, o) => {
    const w = o.w || 120, h = o.h || 72;
    const svg = DG.svg(mount, w, h);
    DG.el("path", { d: `M4 4 V${h - 4} H${w - 2}`, fill: "none", stroke: "var(--ink-4)", "stroke-width": Math.max(2, w / 60) }, svg);
    DG.el("path", { d: DG.curvePath(10, 6, w - 16, h - 16, o.dir), fill: "none", stroke: o.color || "var(--act)", "stroke-width": Math.max(3, w / 30), "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    if (o.label) DG.el("text", { x: w / 2, y: h + 26, "text-anchor": "middle", "font-size": 22, fill: "var(--ink-3)", text: o.label }, svg);
  });

  // ---- A-04: faces and rules ----
  function face(g, cx, cy, r, v) {
    // v: variant 0..8 changes eye spacing, nose, mouth, hair
    const sw = 3, ink = "var(--ink-2)";
    DG.el("ellipse", { cx, cy, rx: r * (0.82 + (v % 3) * 0.06), ry: r, fill: "none", stroke: ink, "stroke-width": sw }, g);
    const es = r * (0.32 + ((v * 7) % 4) * 0.04), ey = cy - r * 0.18;
    DG.el("circle", { cx: cx - es, cy: ey, r: 4.5, fill: ink }, g);
    DG.el("circle", { cx: cx + es, cy: ey, r: 4.5, fill: ink }, g);
    DG.el("path", { d: `M${cx} ${ey + 8} l${-6 + (v % 2) * 4} ${r * 0.3} h10`, fill: "none", stroke: ink, "stroke-width": sw - 0.5, "stroke-linecap": "round" }, g);
    const mw = r * (0.28 + (v % 4) * 0.05), my = cy + r * 0.48, curve = ((v * 5) % 3) - 1;
    DG.el("path", { d: `M${cx - mw} ${my} Q${cx} ${my + curve * 10 + 6} ${cx + mw} ${my}`, fill: "none", stroke: ink, "stroke-width": sw, "stroke-linecap": "round" }, g);
    if (v % 3 === 0) DG.el("path", { d: `M${cx - r * 0.8} ${cy - r * 0.45} Q${cx} ${cy - r * 1.35} ${cx + r * 0.8} ${cy - r * 0.45}`, fill: "none", stroke: ink, "stroke-width": sw }, g);
    if (v % 4 === 1) DG.el("path", { d: `M${cx - es - 12} ${ey - 16} h22 M${cx + es - 10} ${ey - 16} h22`, stroke: ink, "stroke-width": sw }, g);
  }
  DG.register("faces", (mount, o) => {
    const W = o.w || 1700, H = o.h || 520;
    const svg = DG.svg(mount, W, H);
    const g = DG.el("g", {}, svg);
    let v = 0;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) face(g, 90 + c * 175, 90 + r * 170, 62, v++);
    const rules = o.rules || ["dos ojos", "una nariz, debajo", "una boca, debajo de la nariz", "orejas a los lados", "…¿y qué la hace ser ella?"];
    const items = rules.map((t, i) => {
      const y = 70 + i * 92;
      const txt = DG.el("text", { x: 1000, y, "font-size": 40, fill: i === rules.length - 1 ? "var(--ink)" : "var(--ink-2)", text: (i === rules.length - 1 ? "" : "regla " + (i + 1) + ": ") + t, opacity: 0, style: "transition: opacity .4s" }, svg);
      const line = DG.el("line", { x1: 990, x2: 990 + 22 * t.length + (i === rules.length - 1 ? 0 : 160), y1: y - 13, y2: y - 13, stroke: "var(--bad)", "stroke-width": 5, opacity: 0, style: "transition: opacity .4s" }, svg);
      return { txt, line, last: i === rules.length - 1 };
    });
    const seq = o.seq || [{ rules: 0, strike: 0 }, { rules: 5, strike: 4 }];
    return {
      step(k) {
        const st = seq[Math.min(k, seq.length - 1)];
        items.forEach((it, i) => {
          it.txt.setAttribute("opacity", i < st.rules ? 1 : 0);
          if (!it.last) { try { it.line.setAttribute("x2", 990 + it.txt.getComputedTextLength() + 20); } catch (e) {} }
          it.line.setAttribute("opacity", !it.last && i < st.strike ? 1 : 0);
        });
      },
    };
  });
})();

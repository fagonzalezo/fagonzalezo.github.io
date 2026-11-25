/* Act 6 «La sombra de la ley del efecto». Diagrams:
   act6-gap       6-02  lo que queríamos / el hueco rojo / lo que premiamos
   act6-emptybox  6-02  a small empty MENACE box (SVG)
   act6-bars      6-03  two red bars (2,9 % and 30,5 %); grows on step >= 1
   act6-thumb     6-04  big thumbs-up: green, red on step >= 1
*/
(function () {
  const E = DG.el;
  // svg.dg text{fill} in theme.css beats the fill attribute: set colour through style
  const T = (a, p) => { const f = a.fill; return E("text", Object.assign({}, a, { fill: null, style: (f ? "fill:" + f + ";" : "") + (a.style || "") }), p); };

  DG.register("act6-gap", (mount, o) => {
    const W = o.w || 1700, H = o.h || 400;
    const svg = DG.svg(mount, W, H);
    const cw = 540, gx0 = cw + 20, gx1 = W - cw - 20, top = 70, ch = H - top;
    const defs = E("defs", {}, svg);
    const pat = E("pattern", { id: "a6hatch", width: 22, height: 22, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    E("rect", { width: 22, height: 22, fill: "none" }, pat);
    E("line", { x1: 0, y1: 0, x2: 0, y2: 22, stroke: "var(--bad)", "stroke-width": 5, opacity: 0.4 }, pat);
    // titles
    T({ x: cw / 2, y: 44, "text-anchor": "middle", "font-size": 40, "font-weight": 600, fill: "var(--ink-2)", text: "lo que queríamos" }, svg);
    T({ x: W - cw / 2, y: 44, "text-anchor": "middle", "font-size": 40, "font-weight": 600, fill: "var(--ink-2)", text: "lo que premiamos" }, svg);
    // cards
    E("rect", { x: 0, y: top, width: cw, height: ch, rx: 14, fill: "var(--bg-2)", stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
    E("rect", { x: W - cw, y: top, width: cw, height: ch, rx: 14, fill: "var(--bg-2)", stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
    // flag (checkered)
    const fx = cw / 2 - 90, fy = top + 40;
    E("line", { x1: fx, y1: fy - 6, x2: fx, y2: fy + 190, stroke: "var(--ink-2)", "stroke-width": 8, "stroke-linecap": "round" }, svg);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      const wave = Math.sin(c * 0.9) * 6;
      E("rect", { x: fx + 6 + c * 34, y: fy + r * 34 + wave, width: 34, height: 34, fill: (r + c) % 2 ? "var(--ink)" : "var(--bg)", stroke: "var(--ink-3)", "stroke-width": 1.5 }, svg);
    }
    T({ x: cw / 2, y: top + ch - 36, "text-anchor": "middle", "font-size": 44, fill: "var(--ink)", text: "ganar la carrera" }, svg);
    // counter
    const sx = W - cw + 70, sy = top + 50;
    E("rect", { x: sx, y: sy, width: cw - 140, height: 150, rx: 12, fill: "var(--bg)", stroke: "var(--ink-3)", "stroke-width": 3 }, svg);
    T({ x: sx + (cw - 140) / 2, y: sy + 104, "text-anchor": "middle", "font-size": 84, "font-weight": 700, class: "mono", fill: "var(--ink)", text: "04 820" }, svg);
    T({ x: W - cw / 2, y: top + ch - 36, "text-anchor": "middle", "font-size": 44, fill: "var(--ink)", text: "puntos" }, svg);
    // the gap
    E("rect", { x: gx0, y: top, width: gx1 - gx0, height: ch, fill: "url(#a6hatch)" }, svg);
    E("line", { x1: gx0, y1: top, x2: gx0, y2: top + ch, stroke: "var(--bad)", "stroke-width": 4, "stroke-dasharray": "14 10" }, svg);
    E("line", { x1: gx1, y1: top, x2: gx1, y2: top + ch, stroke: "var(--bad)", "stroke-width": 4, "stroke-dasharray": "14 10" }, svg);
    const my = top + ch / 2;
    E("path", { d: `M${gx0 + 36} ${my} H${gx1 - 36} M${gx0 + 70} ${my - 30} L${gx0 + 36} ${my} L${gx0 + 70} ${my + 30} M${gx1 - 70} ${my - 30} L${gx1 - 36} ${my} L${gx1 - 70} ${my + 30}`, fill: "none", stroke: "var(--bad)", "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    const lbl = T({ x: (gx0 + gx1) / 2, y: my - 40, "text-anchor": "middle", "font-size": 46, "font-weight": 650, fill: "var(--bad)", text: "el hueco" }, svg);
    lbl.style.cssText += ";paint-order:stroke; stroke:var(--bg); stroke-width:14px; stroke-linejoin:round";
  });

  DG.register("act6-emptybox", (mount, o) => {
    const w = o.w || 230, h = o.h || 130;
    const svg = DG.svg(mount, w, h);
    E("rect", { x: 3, y: 3, width: w - 6, height: h - 6, rx: 8, fill: "var(--bg-2)", stroke: "var(--ink-2)", "stroke-width": 4 }, svg);
    E("rect", { x: 22, y: 22, width: w - 44, height: h - 44, rx: 4, fill: "var(--bg)", stroke: "var(--ink-4)", "stroke-width": 3 }, svg);
    [0, 1, 2].forEach((i) => E("circle", { cx: w / 2 + (i - 1) * 46, cy: h / 2, r: 14, fill: "none", stroke: "var(--bad)", "stroke-width": 3, "stroke-dasharray": "5 5" }, svg));
  });

  DG.register("act6-bars", (mount, o) => {
    const W = o.w || 900, H = o.h || 640, base = H - 90, unit = (base - 110) / 30.5;
    const svg = DG.svg(mount, W, H);
    E("line", { x1: 40, y1: base, x2: W - 40, y2: base, stroke: "var(--ink-3)", "stroke-width": 3 }, svg);
    const dur = DG.isStatic() ? "0s" : "1.1s";
    const bars = [
      { x: 150, v: 2.9, t: "2,9 %", l: "tareas precisas" },
      { x: 520, v: 30.5, t: "30,5 %", l: "tareas abiertas" },
    ].map((b) => {
      const h = b.v * unit;
      const rect = E("rect", { x: b.x, y: base - h, width: 230, height: h, fill: "var(--bad)", rx: 4, style: `transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0); transition: transform ${dur} ease` }, svg);
      const val = T({ x: b.x + 115, y: base - h - 20, "text-anchor": "middle", "font-size": 76, "font-weight": 600, class: "serif", fill: "var(--bad)", style: `opacity: 0; transition: opacity .6s ease ${DG.isStatic() ? 0 : 0.7}s`, text: b.t }, svg);
      T({ x: b.x + 115, y: base + 52, "text-anchor": "middle", "font-size": 36, fill: "var(--ink-2)", text: b.l }, svg);
      return { rect, val };
    });
    return { step(k) {
      const on = k >= 1;
      bars.forEach(({ rect, val }) => { rect.style.transform = on ? "scaleY(1)" : "scaleY(0)"; val.style.opacity = on ? 1 : 0; });
    } };
  });

  DG.register("act6-thumb", (mount, o) => {
    const S = o.size || 300;
    const svg = DG.svg(mount, S, S);
    const g = E("g", { transform: `scale(${S / 24})` }, svg);
    const p = E("path", { d: "M14 9.5 15 5.88A3.13 3.13 0 0 0 12 2L8.55 8.89A2 2 0 0 1 6.76 10H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h13.5a2 2 0 0 0 1.92-1.44l2.33-8A2 2 0 0 0 19.83 10H14Z", fill: "var(--act)", stroke: "var(--act)", "stroke-width": 1, "stroke-linejoin": "round", style: "transition: fill 1s ease, stroke 1s ease" }, g);
    E("line", { x1: 7, y1: 10.5, x2: 7, y2: 21.5, stroke: "var(--bg-2)", "stroke-width": 1.1, "stroke-linecap": "round" }, g);
    return { step(k) {
      const c = k >= 1 ? "var(--bad)" : "var(--act)";
      p.style.fill = c; p.style.stroke = c;
    } };
  });

})();

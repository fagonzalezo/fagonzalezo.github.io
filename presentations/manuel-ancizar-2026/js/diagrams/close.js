/* Cierre. close-curves (Z-01): three aligned panels (Thorndike 1898, MENACE 1961, R1-Zero 2025);
   the green learning-curve shape is drawn over each on step >= 1. */
(function () {
  const E = DG.el;
  // svg.dg text{fill} in theme.css beats the fill attribute: set colour through style
  const T = (a, p) => { const f = a.fill; return E("text", Object.assign({}, a, { fill: null, style: (f ? "fill:" + f + ";" : "") + (a.style || "") }), p); };
  DG.register("close-curves", (mount, o) => {
    const W = 1700, H = 720, pw = 520, ph = 500, py = 140, gap = (W - 3 * pw) / 2;
    const xs = [0, pw + gap, 2 * (pw + gap)];
    const svg = DG.svg(mount, W, H);
    const defs = E("defs", {}, svg);
    xs.forEach((x, i) => E("rect", { x, y: py, width: pw, height: ph, rx: 10 }, E("clipPath", { id: "cl" + i }, defs)));
    const years = [["1898", "un gato en una caja"], ["1961", "304 cajas de fósforos"], ["2025", "un modelo que aprende a razonar"]];
    const caps = ["tiempo para salir, por intento", "derrotas por cada 20 partidas", "acierto durante el entrenamiento"];
    years.forEach(([y, t], i) => {
      T({ x: xs[i], y: 70, "font-size": 70, "font-weight": 600, class: "serif", fill: "var(--ink)", text: y }, svg);
      T({ x: xs[i], y: 116, "font-size": 32, fill: "var(--ink-2)", text: t }, svg);
      T({ x: xs[i], y: py + ph + 44, "font-size": 26, fill: "var(--ink-3)", text: caps[i] }, svg);
    });
    // panel 1: Thorndike plate, cropped to «Average, A»
    E("rect", { x: xs[0], y: py, width: pw, height: ph, rx: 10, fill: "var(--paper)" }, svg);
    const s1 = E("svg", { x: xs[0], y: py, width: pw, height: ph, viewBox: "0 1630 515 500", preserveAspectRatio: "xMidYMid slice" }, svg);
    const im1 = E("image", { x: 0, y: 0, width: 1576, height: 2680 }, s1);
    im1.setAttributeNS("http://www.w3.org/1999/xlink", "href", "assets/img/thorndike-1898-a.jpg"); im1.setAttribute("href", "assets/img/thorndike-1898-a.jpg");
    // panel 2: MENACE losses per block of 20 games
    const r = window.Menace.run({ seed: 35, games: 200, rewards: [3, 1, -1] });
    const losses = [];
    for (let b = 0; b < 10; b++) losses.push(r.results.slice(b * 20, b * 20 + 20).filter((x) => x !== "X" && x !== "D").length);
    E("rect", { x: xs[1], y: py, width: pw, height: ph, rx: 10, fill: "var(--bg-2)", stroke: "var(--bg-3)", "stroke-width": 2 }, svg);
    const base = py + ph - 64, unit = 320 / 12, slot = (pw - 60) / 10;
    E("line", { x1: xs[1] + 24, y1: base, x2: xs[1] + pw - 24, y2: base, stroke: "var(--ink-3)", "stroke-width": 2 }, svg);
    losses.forEach((v, i) => {
      const x = xs[1] + 30 + i * slot + 6, h = Math.max(v * unit, 4);
      E("rect", { x, y: base - h, width: slot - 12, height: h, rx: 3, fill: "var(--act)" }, svg);
      T({ x: x + (slot - 12) / 2, y: base - h - 12, "text-anchor": "middle", "font-size": 26, fill: v ? "var(--ink)" : "var(--ink-3)", text: v }, svg);
    });
    T({ x: xs[1] + 34, y: base + 38, "font-size": 24, fill: "var(--ink-3)", text: "partida 1" }, svg);
    T({ x: xs[1] + pw - 34, y: base + 38, "text-anchor": "end", "font-size": 24, fill: "var(--ink-3)", text: "200" }, svg);
    // panel 3: R1-Zero AIME accuracy on a white card
    E("rect", { x: xs[2], y: py, width: pw, height: ph, rx: 10, fill: "#fff" }, svg);
    const ih = (pw - 24) * 1479 / 2000;
    const im3 = E("image", { x: xs[2] + 12, y: py + (ph - ih) / 2, width: pw - 24, height: ih }, svg);
    im3.setAttributeNS("http://www.w3.org/1999/xlink", "href", "assets/img/r1-aime-accuracy.png"); im3.setAttribute("href", "assets/img/r1-aime-accuracy.png");
    // the green shape over each panel
    const g = E("g", { opacity: 0.92, style: "filter: drop-shadow(0 0 6px rgba(15,17,21,.9))" }, svg);
    const paths = [
      ["down", xs[0] + 44, py + 50, pw - 120, ph - 190],
      ["down", xs[1] + 40, py + 16, pw - 80, 250],
      ["up", xs[2] + 56, py + 40, pw - 110, ph - 170],
    ].map(([dir, x, y, w, h]) => E("path", { d: DG.curvePath(x, y, w, h, dir), pathLength: 1, fill: "none", stroke: "var(--act)", "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": 1, "stroke-dashoffset": 1, style: `transition: stroke-dashoffset ${DG.isStatic() ? 0 : 1.8}s ease-in-out` }, g));
    return { step(k) { paths.forEach((q) => q.setAttribute("stroke-dashoffset", k >= 1 ? 0 : 1)); } };
  });
})();

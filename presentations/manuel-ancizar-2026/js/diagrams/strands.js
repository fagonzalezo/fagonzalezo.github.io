/* The four strands (recurring device 5): act (green), brain (orange), opt (blue), comp (violet),
   always in that order, top to bottom.
   <div data-diagram="strands" data-opts='{...}'>
   opts:
     w, h        size in stage px (default 1700 × 260)
     gap         vertical distance between strands (default h/5)
     seq         array of states; step k shows seq[min(k, last)]. A state:
                   lit:    strands at full colour, e.g. ["act","brain"]   (default all)
                   dim:    strands drawn faint (default: the rest)
                   off:    strands hidden
                   labels: strands that show their label (default none)
                   conv:   0..1 how much all strands converge to the right end
                   braid:  0..1 how much they braid into one rope after x = braidAt
                   pair:   ["act","brain"]: only these braid (first braid, 3-04)
                   end:    text at the right end (e.g. "hoy")
     state       a single state instead of seq
     braidAt     fraction of the width where braiding starts (default 0.5)
     labelText   override label words, e.g. {"act":"aprender probando"} */
(function () {
  const ORDER = ["act", "brain", "opt", "comp"];
  const LABEL = { act: "actuar", brain: "imitar al cerebro", opt: "optimizar", comp: "comprimir" };

  DG.register("strands", (mount, o) => {
    const W = o.w || 1700, H = o.h || 260;
    const gap = o.gap || H / 5;
    const seq = o.seq || [o.state || {}];
    const braidAt = o.braidAt == null ? 0.5 : o.braidAt;
    const labels = Object.assign({}, LABEL, o.labelText || {});
    const svg = DG.svg(mount, W, H, "strands");
    const LX = o.labelGap == null ? 260 : o.labelGap; // room for labels at the left
    const N = 160;
    const cur = { conv: 0, braid: 0 };
    const paths = {}, texts = {};
    ORDER.forEach((s, i) => {
      paths[s] = DG.el("path", { fill: "none", stroke: `var(${DG.strand[s]})`, "stroke-width": o.stroke || 7, "stroke-linecap": "round", style: "transition: opacity .6s ease" }, svg);
      texts[s] = DG.el("text", { x: 0, y: H / 2 + (i - 1.5) * gap + 9, "font-size": o.labelSize || 30, "font-weight": 600, fill: `var(${DG.strand[s]})`, text: labels[s], style: "transition: opacity .6s ease" }, svg);
    });
    const endDot = DG.el("circle", { cx: W - 12, cy: H / 2, r: 12, fill: "var(--ink)", opacity: 0, style: "transition: opacity .6s ease" }, svg);
    const endTxt = DG.el("text", { x: W - 12, y: H / 2 - 30, "text-anchor": "middle", "font-size": 30, "font-weight": 600, fill: "var(--ink)", opacity: 0, style: "transition: opacity .6s ease" }, svg);

    const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
    function draw(conv, braid, pair) {
      const x0 = LX, x1 = W - 14;
      ORDER.forEach((s, i) => {
        const yb = H / 2 + (i - 1.5) * gap;
        const inPair = !pair || pair.includes(s);
        const pc = pair ? pair.map((p) => ORDER.indexOf(p)) : [0, 1, 2, 3];
        const centre = H / 2 + ((pc.reduce((a, b) => a + b, 0) / pc.length) - 1.5) * gap;
        const k = pair ? pc.indexOf(i) : i;
        const n = pair ? pc.length : 4;
        let d = "";
        for (let j = 0; j <= N; j++) {
          const u = j / N, x = x0 + u * (x1 - x0);
          let y = yb + 6 * Math.sin(u * 9 + i * 1.7);
          // converge to the right end
          const sc = smooth((u - 0.35) / 0.65) * conv;
          y = y + (H / 2 - y) * sc;
          // braid into a rope
          if (inPair) {
            const sb = smooth((u - braidAt) / 0.18) * braid;
            const rope = centre + gap * 0.42 * Math.sin(u * 34 + (k * 2 * Math.PI) / n);
            y = y + (rope - y) * sb;
          }
          d += (j ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        }
        paths[s].setAttribute("d", d);
      });
    }

    let cancel = () => {};
    let lastPair = null;
    function apply(st, animate) {
      const lit = st.lit || ORDER, off = st.off || [];
      const dim = st.dim || ORDER.filter((s) => !lit.includes(s));
      const lab = st.labels || [];
      ORDER.forEach((s) => {
        const op = off.includes(s) ? 0 : lit.includes(s) ? 1 : dim.includes(s) ? 0.2 : 0.2;
        paths[s].style.opacity = op;
        texts[s].style.opacity = lab.includes(s) && !off.includes(s) ? (lit.includes(s) ? 1 : 0.35) : 0;
      });
      endDot.setAttribute("opacity", st.end ? 1 : 0);
      endTxt.setAttribute("opacity", st.end ? 1 : 0);
      if (st.end) endTxt.textContent = st.end;
      const to = { conv: st.conv || 0, braid: st.braid || 0 }, from = { ...cur };
      const pair = st.pair || null;
      cancel();
      if (!animate || (from.conv === to.conv && from.braid === to.braid && pair === lastPair)) {
        Object.assign(cur, to); draw(cur.conv, cur.braid, pair);
      } else {
        cancel = DG.animate(1400, (t) => {
          cur.conv = from.conv + (to.conv - from.conv) * t;
          cur.braid = from.braid + (to.braid - from.braid) * t;
          draw(cur.conv, cur.braid, pair);
        });
      }
      lastPair = pair;
    }
    apply(seq[0], false);
    return { step(k, info) { apply(seq[Math.min(k, seq.length - 1)], !info.entering); } };
  });
})();

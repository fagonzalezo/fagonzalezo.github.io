/* Helpers for diagram authors; loaded before js/diagrams/*.js and js/deck.js. See deck.js. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const root = document.documentElement;
  // ---------------- helpers for diagram authors ----------------
  window.DG = {
    registry: {},
    register(name, fn) { this.registry[name] = fn; },
    css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); },
    strand: { act: "--act", brain: "--brain", opt: "--opt", comp: "--comp" },
    // svg(mount, w, h) -> <svg viewBox="0 0 w h"> sized w×h px (stage pixels)
    svg(mount, w, h, cls) {
      const s = document.createElementNS(NS, "svg");
      s.setAttribute("viewBox", `0 0 ${w} ${h}`);
      s.setAttribute("width", w); s.setAttribute("height", h);
      s.setAttribute("class", "dg " + (cls || ""));
      mount.appendChild(s);
      return s;
    },
    // el(tag, attrs, parent): attrs.text sets textContent; attrs.html sets innerHTML
    el(tag, attrs, parent) {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs || {}) {
        if (attrs[k] == null) continue;
        if (k === "text") e.textContent = attrs[k];
        else if (k === "html") e.innerHTML = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
      if (parent) parent.appendChild(e);
      return e;
    },
    // animate(ms, t => {...}) with ease-in-out; returns a cancel function
    animate(ms, fn, done) {
      let id, t0 = null, stop = false;
      const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      const tick = (ts) => {
        if (stop) return;
        if (t0 === null) t0 = ts;
        const t = Math.min(1, (ts - t0) / ms);
        fn(ease(t), t);
        if (t < 1) id = requestAnimationFrame(tick); else if (done) done();
      };
      if (root.classList.contains("static")) { fn(1, 1); if (done) done(); return () => {}; }
      id = requestAnimationFrame(tick);
      return () => { stop = true; cancelAnimationFrame(id); };
    },
    isStatic() { return root.classList.contains("static"); },
  };

})();

# Authoring the deck

The script `../02-guion.md` is the source of truth: every slide there (`### [ID] …`) becomes one
`<section id="ID">` here, with its **En pantalla** text on screen, its **Visual** built, its
**Narración** copied verbatim into `<aside class="notes">` and its **Fuente** in `<p class="source">`.
`src/00-apertura.html` is the reference implementation: copy its patterns.

## Files and ownership

| Act | Slides | File | Diagram file (yours) |
|---|---|---|---|
| Apertura | A-01 – A-06 | `src/00-apertura.html` | `js/diagrams/core.js`, `strands.js` (shared, do not edit) |
| 1 | 1-00 – 1-08 | `src/01-actuar.html` | `js/diagrams/act1.js` |
| 2 | 2-00 – 2-05 | `src/02-cerebro.html` | `js/diagrams/act2.js` |
| 3 | 3-00 – 3-06 | `src/03-optimizar.html` | `js/diagrams/act3.js` |
| 4 | 4-00 – 4-08 | `src/04-comprimir.html` | `js/diagrams/act4.js` |
| 5 | 5-00 – 5-10 | `src/05-agentes.html` | `js/diagrams/act5.js` |
| 6 | 6-00 – 6-06 | `src/06-sombra.html` | `js/diagrams/act6.js` |
| Cierre | Z-01 – Z-03, créditos | `src/07-cierre.html` | `js/diagrams/close.js` |

Only edit your own files. Do **not** edit `css/theme.css`, `js/deck.js`, `js/dg.js`,
`js/diagrams/strands.js`, `js/diagrams/core.js`, `src/_template.html`, `tools/`. If you need extra
CSS, put it in `css/diagrams/<yourfile>.css` (the build links every file there); prefix every
selector with your act class, e.g. `.act4 …`, and put that class on your frames.
Prefix diagram names with your act (`act1-menace`, `act4-shannon`…) to avoid clashes.

## Build and look

```
python3 tools/build.py                       # writes index.html from src/ + js/diagrams/
tools/check.sh                               # elements outside the slide, overflow, JS errors
tools/shoot.sh OUTDIR 1-03 1-04              # final state (all fragments shown) → OUTDIR/1-03.png
STEP=1 tools/shoot.sh OUTDIR 1-03/0 1-03/1   # state after fragment 0, 1 … (no fragment: before any click: use "1-03")
```
Use your own OUTDIR inside the scratchpad. **Look at every screenshot** (Read the PNG) and fix what
is cramped, overlapping, unreadable, or off the 1920×1080 stage. Also check the intermediate steps of
animated slides. Other agents build in parallel: a warning about a missing src file is normal.

## Stage, type, colour

- Stage 1920×1080; `.frame` has padding 84/110/90. Body text 40 px; `.lead` 46; nothing smaller than
  22 px on screen except the source line (20). ≤ ~25 words on screen per slide, excluding quotes.
- Fonts: titles serif (`h1`, `h2`, `.big`, `.huge`, `.num`), text Inter, code `.mono`.
- Colours are CSS tokens (see `css/theme.css`): `--act` green, `--brain` orange, `--opt` blue,
  `--comp` violet (the four strands, used for nothing else), `--bad` red (error, trap, punishment),
  `--human` sand (people in diagrams), `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--bg`, `--bg-2`,
  `--bg-3`, `--paper`, `--paper-ink`. Text classes `.c-act .c-brain .c-opt .c-comp .c-bad .c-human`.
  In SVG use `fill="var(--act)"` etc. Never hard-code another palette.

## Slide kinds

```html
<!-- act card -->
<section id="2-00">
  <div class="frame card">
    <div class="actnum" style="--strand:var(--brain)">Acto 2</div>
    <h1>Imitar al cerebro</h1>
    <div class="sub">aprender con neuronas</div>
    <div class="strands-bg" data-diagram="strands" data-opts='{"w":1920,"h":300,"labelGap":0,"state":{"lit":["brain"],"dim":["act","opt","comp"]}}'></div>
  </div>
</section>
```
- `.frame.archive`: photo/document. Starts with `<div class="kicker">Lugar · <span class="yr">Año</span></div>`.
  Photos: `<div class="photo" style="height:…"><img data-img="assets/img/x.jpg" alt="…"></div>`
  (`.photo.contain` to letterbox, `.paperbg` for scans on paper), caption `<p class="caption"><b>Nombre</b>, año</p>`.
  Full-bleed photo: `<div class="bleed"><img data-img=…></div>` (left side darkened for text).
- `.frame.board`: diagram on plain dark, `<h2>` title optional.
- Quotes: `<div class="sheet"><div class="q">«…»</div><div class="orig">“original”</div><div class="who">Autor, año</div></div>`;
  `<mark>` highlights a word (green; `.bad` red, `.brain` orange).
- Layout helpers: `.row` (flex row, gap 70), `.col`, `.grow` (fill remaining height), `.flex1`,
  `.w40/.w50/.w60`, `.center`, `.vcenter`, `.panel`, `.pill` (with `--c`), `.stat > .v + .l` (with `--c`),
  `ul.clean` (bullets coloured by `--c` on each `li`).
- Source line, always last in the frame: `<p class="source">…</p>`.
- `data-verify="short text"` on the `<section>` if the slide still carries a fact marked VERIFY (shown only with ?draft).

## Fragments and diagrams

- `[f1]`, `[f2]` in the script = fragments: `class="fragment rise"` (or plain `fragment`).
- A diagram: `<div data-diagram="act1-menace" data-opts='{"…":…}'></div>`; register it in your JS file:
  ```js
  (function () {
    DG.register("act1-menace", (mount, o) => {
      const svg = DG.svg(mount, 1700, 600);          // stage-pixel sized SVG
      DG.el("circle", { cx: 50, cy: 50, r: 20, fill: "var(--act)" }, svg);
      return { step(k, info) { /* k = visible fragments in this slide (0 = before any click; 999 in ?static) */ } };
    });
  })();
  ```
  Helpers: `DG.svg`, `DG.el(tag, attrs, parent)` (`text:` sets content), `DG.animate(ms, t => …, done)`
  (eased 0→1; instant in ?static), `DG.css("--act")`, `DG.isStatic()`, `DG.curvePath(x0,y0,w,h,dir)`
  (the recurring learning-curve shape), `window.Menace` (MENACE simulation, `js/menace.js`).
  When only the diagram changes on a click, add an invisible trigger `<span class="fragment step"></span>`.
  `step()` must be idempotent: compute the state for k from scratch (the presenter may go back).
  In ?static (k = 999) show the final state.
- Shared diagrams: `strands` (see header of `js/diagrams/strands.js`), `curveicon`
  (`<div class="curve-icon" data-diagram="curveicon" data-opts='{"w":150,"h":90}' style="width:150px;height:90px"></div>`).
- Rule badge (recurring device 2): `<div class="rule-badge"></div>` (filled automatically, top-right);
  add class `lit` to highlight it (`style="--c:var(--opt)"` sets its colour).
- Videos: `<div class="video" data-youtube="ID"` (or `data-vimeo="ID"`)
  ` data-poster="assets/img/still.jpg" style="width:…;height:…"></div>`.

## Assets

`assets/img/` — see `assets/CREDITS.md`. If an image you need is missing, keep the `data-img` (it
renders a labelled placeholder) and report it; do not download new images yourself.

/* MENACE (Michie, 1961), simulated. Shared by the deck (browser) and the
   verification script (node). Everything is seeded, so a replay is identical on
   every showing. MENACE plays first (X); the opponent (O) plays perfectly, choosing
   at random among its best replies.
   Boxes: one per position MENACE can meet, up to rotation and reflection (304).
   Beads: 4 per move in the first-move box, then 3, 2, 1 (Michie's numbers).
   Rewards: beads added to each box used, by default +3 win, +1 draw, -1 loss.
   An empty box means MENACE resigns. */
(function (root) {
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const rot = p => [p[6],p[3],p[0],p[7],p[4],p[1],p[8],p[5],p[2]];
  const ref = p => [p[2],p[1],p[0],p[5],p[4],p[3],p[8],p[7],p[6]];
  const SYMS = [];
  (function () { let p = [0,1,2,3,4,5,6,7,8]; for (let i = 0; i < 4; i++) { SYMS.push(p, ref(p)); p = rot(p); } })();
  const INIT = { 0: 4, 2: 3, 4: 2, 6: 1, 8: 1 };

  function rng(seed) {           // mulberry32
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function winner(b) {
    for (const [x, y, z] of LINES) if (b[x] !== '.' && b[x] === b[y] && b[y] === b[z]) return b[x];
    return b.indexOf('.') < 0 ? 'D' : null;
  }
  const put = (b, i, c) => b.slice(0, i) + c + b.slice(i + 1);
  function canon(b) {            // canonical board and the symmetry that gives it
    let best = null, perm = null;
    for (const s of SYMS) {
      let t = ''; for (let j = 0; j < 9; j++) t += b[s[j]];
      if (best === null || t < best) { best = t; perm = s; }
    }
    return { key: best, perm };
  }
  function canonMoves(cb) {      // distinct moves, up to the symmetries of cb
    const seen = {}, out = [];
    for (let m = 0; m < 9; m++) {
      if (cb[m] !== '.') continue;
      const k = canon(put(cb, m, 'X')).key;
      if (!(k in seen)) { seen[k] = 1; out.push(m); }
    }
    return out;
  }
  const memo = {};
  function minimax(b, turn) {    // value for X: 1 win, 0 draw, -1 loss
    const k = b + turn; if (k in memo) return memo[k];
    const w = winner(b); let v;
    if (w === 'X') v = 1; else if (w === 'O') v = -1; else if (w === 'D') v = 0;
    else {
      v = turn === 'X' ? -2 : 2;
      for (let m = 0; m < 9; m++) if (b[m] === '.') {
        const x = minimax(put(b, m, turn), turn === 'X' ? 'O' : 'X');
        v = turn === 'X' ? Math.max(v, x) : Math.min(v, x);
      }
    }
    return (memo[k] = v);
  }
  function perfectReply(b, rand) {
    let best = 2, ms = [];
    for (let m = 0; m < 9; m++) if (b[m] === '.') {
      const v = minimax(put(b, m, 'O'), 'X');
      if (v < best) { best = v; ms = [m]; } else if (v === best) ms.push(m);
    }
    return ms[Math.floor(rand() * ms.length)];
  }

  /* run({seed, games, rewards:[win, draw, loss]}) ->
     { results: 'D'|'O'|'X'|'R' per game (R = resigned, box empty),
       games:   [{moves:[{board, key, perm, box:{move:beads}, move, real, reply}], result}] for the first `keep`
                (a box's move m is played on the real board at cell perm[m]),
       first:   bead counts of the first box after every game: [{corner, edge, centre}],
       boxes:   final state, resignedAt: index of the first resignation or -1 } */
  function run(opts) {
    const rand = rng(opts.seed), rw = opts.rewards || [3, 1, -1], keep = opts.keep || 0;
    const box = {}, results = [], first = [], games = [];
    let resignedAt = -1;
    const get = cb => {
      if (!(cb in box)) { const n = 9 - cb.split('.').length + 1, o = {}; canonMoves(cb).forEach(m => { o[m] = INIT[n]; }); box[cb] = o; }
      return box[cb];
    };
    for (let g = 0; g < opts.games; g++) {
      let b = '.........', res = null; const hist = [], log = [];
      while (!res) {
        const { key, perm } = canon(b), bx = get(key);
        let tot = 0; for (const m in bx) tot += bx[m];
        if (tot === 0) { res = 'R'; break; }
        let r = Math.floor(rand() * tot), move = null;
        for (const m in bx) { if (r < bx[m]) { move = +m; break; } r -= bx[m]; }
        hist.push([key, move]);
        const real = perm[move], entry = { board: b, key, perm, box: Object.assign({}, bx), move, real, reply: null };
        b = put(b, real, 'X'); res = winner(b);
        if (!res) { const o = perfectReply(b, rand); entry.reply = o; b = put(b, o, 'O'); res = winner(b); }
        log.push(entry);
      }
      const d = res === 'X' ? rw[0] : res === 'D' ? rw[1] : rw[2];
      for (const [key, move] of hist) box[key][move] = Math.max(0, box[key][move] + d);
      results.push(res);
      if (res === 'R' && resignedAt < 0) resignedAt = g;
      const f = get('.........'); first.push({ corner: f[0], edge: f[1], centre: f[4] });
      if (g < keep) games.push({ moves: log, result: res, final: b });
    }
    return { results, games, first, boxes: box, resignedAt };
  }
  function countBoxes() {        // positions with X to move and at most 6 marks: 304
    const seen = {};
    (function rec(b) {
      if (winner(b)) return;
      const n = 9 - b.split('.').length + 1;
      if (n % 2 === 0) { if (n <= 6) seen[canon(b).key] = 1; }
      for (let m = 0; m < 9; m++) if (b[m] === '.') rec(put(b, m, n % 2 === 0 ? 'X' : 'O'));
    })('.........');
    return Object.keys(seen).length;
  }
  const Menace = { run, countBoxes, canon, winner };
  if (typeof module !== 'undefined' && module.exports) module.exports = Menace; else root.Menace = Menace;
})(typeof window !== 'undefined' ? window : globalThis);

/* SPDX-License-Identifier: MIT · (c) 2026 Nathalie Vernier · https://github.com/natvernier/playground */
/* What the AI Jargon · the game: court, paddles, AI player, terms */
/* NVG v2 · Pong — "What the AI Jargon" · you (bottom / left) vs. the computer */
(function () {
  'use strict';
  var S, F = {}, keys = {};
  var SPEED = [.55, .7, .85];
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  /* the AI meets every ball; it varies where on its own paddle it takes the ball,
     which is what gives the return its angle. |offset| stays below 1 so the
     contact test (half + r) can never fail, at the walls included. */
  function aiOffset() { var o = Math.random() * 1.4 - .7; return Math.abs(o) < .12 ? (o < 0 ? -.12 : .12) : o; }
  function geom(api) {
    var w = api.w, h = api.h, top = api.inset.top, bot = api.inset.bottom;
    F.portrait = h > w * 1.05;
    if (F.portrait) { F.u0 = 16; F.u1 = w - 16; F.v0 = top; F.v1 = h - bot; F.pv = F.v1 - 22; F.cv = F.v0 + 22; F.sgn = 1; }
    else { F.u0 = top; F.u1 = h - bot; F.v0 = 16; F.v1 = w - 16; F.pv = F.v0 + 22; F.cv = F.v1 - 22; F.sgn = -1; }
    F.L = clamp((F.u1 - F.u0) * .22, 64, 150); F.T = 12; F.r = 8;
  }
  function terms(api) { var lv = (api.content.levels || [])[S.level]; return lv && lv.length ? lv : [['Context Window', 'Max text amount AI processes in one go.']]; }
  function nextTerm(api) {
    var list = terms(api); if (!S.bag.length) { S.bag = list.map(function (_, i) { return i; }); for (var i = S.bag.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = S.bag[i]; S.bag[i] = S.bag[j]; S.bag[j] = t; } }
    S.term = list[S.bag.pop()];
  }
  function serve(towardPlayer) {
    var sp = (F.v1 - F.v0) * SPEED[S.level] * S.mult;
    S.b = { u: (F.u0 + F.u1) / 2, v: (F.v0 + F.v1) / 2, du: (Math.random() - .5) * sp * .7, dv: sp * (towardPlayer ? F.sgn : -F.sgn) };
    S.coff = aiOffset();
    S.wait = 0;
  }
  function wrap(c, text, max) { var words = text.split(' '), lines = [], l = ''; words.forEach(function (w) { var t = l ? l + ' ' + w : w; if (c.measureText(t).width > max && l) { lines.push(l); l = w; } else l = t; }); if (l) lines.push(l); return lines; }
  var game = {
    reset: function (api) { geom(api); S = { level: api.level || 0, mult: 1, bag: [], term: null, pu: (F.u0 + F.u1) / 2, cu: (F.u0 + F.u1) / 2, coff: 0, target: null, wait: 0 }; S.b = { u: (F.u0 + F.u1) / 2, v: (F.v0 + F.v1) / 2, du: 0, dv: 0 }; keys = {}; },
    start: function (api) { S.level = api.level || 0; S.bag = []; S.term = null; S.mult = 1; serve(true); },
    resize: function (api) { geom(api); if (S) { S.pu = clamp(S.pu, F.u0, F.u1); S.cu = clamp(S.cu, F.u0, F.u1); } },
    key: function (e, down) { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = down; },
    blur: function () { keys = {}; },
    pointer: function (type, x, y) { if (type === 'up') { S.target = null; return; } S.target = F.portrait ? x : y; },
    update: function (dt, api) {
      var span = F.u1 - F.u0, half = F.L / 2, b = S.b;
      var dir = (keys.ArrowRight || keys.d || keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowLeft || keys.a || keys.ArrowUp || keys.w ? 1 : 0);
      if (dir) { S.pu += dir * span * 1.4 * dt; S.target = null; }
      else if (S.target != null) S.pu += (S.target - S.pu) * Math.min(1, dt * 18);
      S.pu = clamp(S.pu, F.u0 + half, F.u1 - half);
      if (S.wait > 0) { S.wait -= dt; if (S.wait <= 0) serve(S.serveToPlayer); return; }
      S.cu = clamp(b.u - S.coff * half, F.u0 + half, F.u1 - half);
      b.u += b.du * dt; b.v += b.dv * dt;
      if (b.u < F.u0 + F.r) { b.u = F.u0 + F.r; b.du = Math.abs(b.du); } if (b.u > F.u1 - F.r) { b.u = F.u1 - F.r; b.du = -Math.abs(b.du); }
      var sp = Math.hypot(b.du, b.dv);
      function bounce(pu, toward) { var off = clamp((b.u - pu) / half, -1, 1); b.du = off * sp * .75; b.dv = -toward * Math.sqrt(Math.max(sp * sp - b.du * b.du, sp * sp * .3)); }
      var pFace = F.pv - F.sgn * F.T / 2, cFace = F.cv + F.sgn * F.T / 2;
      if (b.dv * F.sgn > 0 && (b.v + F.sgn * F.r - pFace) * F.sgn >= 0 && (b.v - pFace) * F.sgn < F.T + F.r) {
        if (Math.abs(b.u - S.pu) <= half + F.r) { S.mult = Math.min(1.6, S.mult * 1.03); sp *= 1.03; bounce(S.pu, F.sgn); b.v = pFace - F.sgn * F.r; api.addScore(1); nextTerm(api); api.sound('click'); }
      }
      if (b.dv * F.sgn < 0 && (b.v - F.sgn * F.r - cFace) * F.sgn <= 0 && (cFace - b.v) * F.sgn < F.T + F.r) {
        if (Math.abs(b.u - S.cu) <= half + F.r) { bounce(S.cu, -F.sgn); b.v = cFace + F.sgn * F.r; S.coff = aiOffset(); }
      }
      if ((b.v - (F.portrait ? F.v1 : F.v0)) * F.sgn > F.r) { api.hit(); S.wait = .8; S.serveToPlayer = true; }
      else if ((b.v - (F.portrait ? F.v0 : F.v1)) * F.sgn < -F.r) { S.wait = .8; S.serveToPlayer = false; }
    },
    render: function (api) {
      var c = api.ctx, P = F.portrait, xy = function (u, v) { return P ? [u, v] : [v, u]; };
      c.fillStyle = api.c('bg'); c.fillRect(0, 0, api.w, api.h);
      var mid = (F.v0 + F.v1) / 2, a = xy(F.u0, mid), z = xy(F.u1, mid);
      c.setLineDash([14, 10]); c.strokeStyle = api.c('line'); c.lineWidth = 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(z[0], z[1]); c.stroke(); c.setLineDash([]);
      if (S.term) {
        var cw = Math.min(420, (P ? api.w : (F.v1 - F.v0)) - 48), cx = api.w / 2 - cw / 2;
        c.font = api.font(400, 14); var lines = wrap(c, S.term[1], cw - 36), ch = 30 + 24 + lines.length * 20, cy = (P ? mid : api.h / 2) - ch / 2;
        c.fillStyle = api.c('glass'); c.strokeStyle = api.c('verve'); c.lineWidth = 1.5; c.beginPath(); c.roundRect ? c.roundRect(cx, cy, cw, ch, 18) : c.rect(cx, cy, cw, ch); c.fill(); c.stroke();
        c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = api.c('ink'); c.font = api.font(700, 18); c.fillText(S.term[0], cx + 18, cy + 16);
        c.fillStyle = api.c('ink-2'); c.font = api.font(400, 14); lines.forEach(function (l, i) { c.fillText(l, cx + 18, cy + 44 + i * 20); });
      }
      function pad(u, v, col) { var p = P ? [u - F.L / 2, v - F.T / 2, F.L, F.T] : [v - F.T / 2, u - F.L / 2, F.T, F.L]; c.fillStyle = api.c(col); c.beginPath(); c.roundRect ? c.roundRect(p[0], p[1], p[2], p[3], 6) : c.rect(p[0], p[1], p[2], p[3]); c.fill(); }
      pad(S.cu, F.cv, 'ink-2');
      if (api.visible()) pad(S.pu, F.pv, 'player');
      c.font = api.font(700, 11); c.fillStyle = api.c('ink-2'); c.textBaseline = 'middle';
      function tag(u, v, txt, away) { var q = P ? [u, v + away * 20] : [v + away * 26, u]; c.textAlign = 'center'; c.fillText(txt, q[0], q[1]); }
      tag(S.pu, F.pv, 'YOU', F.sgn); tag(S.cu, F.cv, 'AI', -F.sgn);
      if (S.wait <= 0) { var bp = xy(S.b.u, S.b.v); c.fillStyle = api.c('ink'); c.beginPath(); c.arc(bp[0], bp[1], F.r, 0, 7); c.fill(); }
    }
  };
  window.NVG.boot({
    key: 'pong', aria: 'Pong game: catch the ball to reveal AI terms',
    eyebrow: 'What the AI Jargon', title: 'Still nodding along when someone says “agentic”?',
    goal: 'Each successful catch reveals a new AI term and definition.',
    hints: (function () {
      var tall = window.innerHeight > window.innerWidth * 1.05, you = tall ? 'bottom' : 'left', ai = tall ? 'top' : 'right';
      var who = 'You play the ' + you + ' paddle. The AI plays the ' + ai + ' one.';
      return { touch: [['drag', who + ' Drag it with one finger.']],
               keys: [['drag', who], ['keyboard', tall ? '<kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> to move, or drag with the mouse' : '<kbd>↑</kbd><kbd>↓</kbd> or <kbd>W</kbd><kbd>S</kbd> to move, or drag with the mouse']] };
    })(),
    levels: ['Beginner', 'Intermediate', 'Pro'], silent: true,
    pauseTitle: 'Need a minute to google that?', overTitle: 'Shall we circle back?',
    controls: [], game: game
  });
})();


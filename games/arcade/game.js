/* SPDX-License-Identifier: MIT · (c) 2026 Nathalie Vernier · https://github.com/natvernier/playground */
/* What LinkedIn feels like · the game itself: reset / update / render */
(function () {
  'use strict';
  var keys = {}, steer = null, S;
  function words(api) { return api.content.words && api.content.words.length ? api.content.words : ['prompt', 'agent', 'LLM', 'RAG', 'token', 'guardrails']; }

  /* a buzzword enters from a random edge and starts homing in on you */
  function spawn(api) {
    var w = api.w, h = api.h, pad = 60, side = (Math.random() * 4) | 0, x, y;
    if (side === 0) { x = -pad; y = Math.random() * h; } else if (side === 1) { x = w + pad; y = Math.random() * h; } else if (side === 2) { x = Math.random() * w; y = -pad; } else { x = Math.random() * w; y = h + pad; }
    var sp = 1 + Math.random() * (1 + S.level * .32), list = words(api), word = list[(Math.random() * list.length) | 0];
    api.ctx.font = api.font(400, 15);
    S.hz.push({ x: x, y: y, vx: (Math.random() - .5) * sp, vy: (Math.random() - .5) * sp, word: word, wpx: api.ctx.measureText(word).width, t: Math.random() * 1000, strong: Math.random() < .25 });
  }

  /* boost: a short invulnerable dash that costs fuel */
  function dash(api) {
    var p = S.p; if (S.fuel <= 10 || S.dash > 0) return;
    S.dash = 260; S.fuel -= 12; api.sound('boost');
    if (!(p.vx || p.vy)) { p.vx = Math.cos(p.a); p.vy = Math.sin(p.a); }
  }

  var game = {
    reset: function (api) {
      S = { t: 0, level: 1, every: 900, last: 0, pulse: 0, fuel: 100, dash: 0, hz: [], p: { x: api.w / 2, y: (api.h - api.inset.bottom + api.inset.top) / 2, r: 12, speed: 3.3, vx: 0, vy: 0, a: -Math.PI / 2 } };
      for (var i = 0; i < 8; i++) spawn(api);
      api.setStat(1); api.setFuel(100); keys = {}; steer = null;
    },
    resize: function (api) { if (S) { S.p.x = Math.min(S.p.x, api.w); S.p.y = Math.min(S.p.y, api.h); } },
    key: function (e, down, api) {
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = down;
      if (down && k === ' ') dash(api);
    },
    blur: function () { keys = {}; steer = null; },
    control: function (id, down, api) { if (id === 'boost' && down) dash(api); },
    pointer: function (type, x, y) { if (type === 'down' || (type === 'move' && steer)) steer = { x: x, y: y }; if (type === 'up') steer = null; },
    update: function (dt, api) {
      var ms = dt * 1000, f = dt * 60, p = S.p, ax = 0, ay = 0, w = api.w, h = api.h;
      if (keys.ArrowLeft || keys.a) ax--; if (keys.ArrowRight || keys.d) ax++; if (keys.ArrowUp || keys.w) ay--; if (keys.ArrowDown || keys.s) ay++;
      if (steer) { var dx = steer.x - p.x, dy = steer.y - p.y, d = Math.hypot(dx, dy); if (d > 6) { ax += dx / d; ay += dy / d; } }
      if (ax || ay) { var l = Math.hypot(ax, ay); ax /= l; ay /= l; }
      if (S.dash > 0) { var L = Math.hypot(p.vx, p.vy) || 1; p.vx = p.vx / L * p.speed * 3.2; p.vy = p.vy / L * p.speed * 3.2; S.dash -= ms; }
      else { p.vx += ax * .045 * ms; p.vy += ay * .045 * ms; var damp = Math.pow(.985, f); p.vx *= damp; p.vy *= damp; S.fuel = Math.min(100, S.fuel + .012 * ms); }
      var maxV = S.dash > 0 ? p.speed * 3.2 : p.speed * 1.7, s = Math.hypot(p.vx, p.vy);
      if (s > maxV) { p.vx = p.vx / s * maxV; p.vy = p.vy / s * maxV; }
      if (s > .2) p.a = Math.atan2(p.vy, p.vx);
      p.x += p.vx * f; p.y += p.vy * f;
      if (p.x < -p.r) p.x = w + p.r; if (p.x > w + p.r) p.x = -p.r; if (p.y < -p.r) p.y = h + p.r; if (p.y > h + p.r) p.y = -p.r;
      S.t += ms; api.addScore(.02 * ms);
      var lv = S.t > 39000 ? 5 : S.t > 27000 ? 4 : S.t > 17000 ? 3 : S.t > 9000 ? 2 : 1;
      if (lv !== S.level) { S.level = lv; S.every = [900, 820, 700, 590, 500][lv - 1]; S.pulse = 420; api.toast('Level ' + lv); api.sound('click'); api.setStat(lv); }
      if (S.pulse > 0) S.pulse -= ms;
      if (S.t - S.last > S.every) { S.last = S.t; spawn(api); if (Math.random() < .45) spawn(api); }
      for (var i = 0; i < S.hz.length; i++) {
        var z = S.hz[i], to = Math.atan2(p.y - z.y, p.x - z.x);
        z.vx += Math.cos(to) * .00055 * ms; z.vy += Math.sin(to) * .00055 * ms;
        var mx = 1.2 + S.level * .42, sp = Math.hypot(z.vx, z.vy); if (sp > mx) { z.vx = z.vx / sp * mx; z.vy = z.vy / sp * mx; }
        z.x += z.vx * f; z.y += z.vy * f; z.t += ms * .6;
        if (z.x < -140) z.x = w + 140; if (z.x > w + 140) z.x = -140; if (z.y < -60) z.y = h + 60; if (z.y > h + 60) z.y = -60;
        var bx = z.x - 4, by = z.y - 14, cx = Math.max(bx, Math.min(p.x, bx + z.wpx + 8)), cy = Math.max(by, Math.min(p.y, by + 18));
        if (S.dash <= 0 && Math.hypot(p.x - cx, p.y - cy) < p.r && api.hit()) {
          S.hz.forEach(function (o) { var ddx = o.x - p.x, ddy = o.y - p.y, dd = Math.hypot(ddx, ddy) || 1; if (dd < 160) { o.x += ddx / dd * 140; o.y += ddy / dd * 140; o.vx *= -.5; o.vy *= -.5; } });
          break;
        }
      }
      if (S.hz.length > 60) S.hz.splice(0, S.hz.length - 60);
      api.setFuel(S.fuel);
    },
    render: function (api) {
      var c = api.ctx, w = api.w, h = api.h, p = S.p;
      c.fillStyle = api.c('bg'); c.fillRect(0, 0, w, h);
      c.font = api.font(400, 15); c.textBaseline = 'alphabetic';
      for (var i = 0; i < S.hz.length; i++) {
        var z = S.hz[i]; c.globalAlpha = z.strong ? .95 : .55 + Math.sin(z.t / 180) * .1;
        c.fillStyle = api.c(z.strong ? 'ink' : 'ink-2'); c.fillText(z.word, z.x, z.y);
      }
      c.globalAlpha = 1;
      var boosting = S.dash > 0 || S.pulse > 0;
      if (boosting) { c.beginPath(); c.arc(p.x, p.y, p.r + 18, 0, 7); c.strokeStyle = api.c('verve'); c.lineWidth = 1.5; c.stroke(); }
      if (!api.visible()) return;
      c.save(); c.translate(p.x, p.y); c.rotate(p.a);
      c.beginPath(); c.moveTo(p.r + 5, 0); c.lineTo(-p.r, -p.r * .75); c.lineTo(-p.r, p.r * .75); c.closePath();
      c.fillStyle = boosting ? api.c('verve') : api.c('player'); c.fill();
      if (boosting) { c.strokeStyle = api.c('player'); c.lineWidth = 1.5; c.stroke(); }
      c.restore();
    }
  };

  window.NVG.boot({
    key: 'arcade', aria: 'Arcade game: dodge the AI buzzwords',
    eyebrow: 'What LinkedIn feels like', title: 'Humbled and honoured to dodge a few buzzwords?',
    goal: 'Dodge the buzzwords before they catch you.',
    hints: { touch: [['tap', 'Tap where you want to go']], keys: [['keyboard', '<kbd>←↑↓→</kbd> or <kbd>WASD</kbd> to move'], ['boost', '<kbd>Space</kbd> = boost']] },
    extra: 'boost', stat: 'Level', quietLoss: true,
    pauseTitle: 'Need a breather from the thought leaders?', overTitle: 'Did the buzzwords win this round?',
    controls: [{ type: 'boost' }], game: game
  });
})();

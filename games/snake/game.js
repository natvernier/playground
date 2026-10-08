/* SPDX-License-Identifier: MIT · (c) 2026 Nathalie Vernier · https://github.com/natvernier/playground */
/* AI Is Eating Our Jobs · the game: grid, snake, letters, collisions */
/* NVG v2 · Snake — "AI Is Eating Our Jobs" */
(function () {
  'use strict';
  var S, B = {}, swipe = null;
  function ri(a, b) { return a + ((Math.random() * (b - a + 1)) | 0); }
  function jobsList(api) { return api.content.jobs && api.content.jobs.length ? api.content.jobs : ['Write a job posting', 'Draft the minutes']; }
  function board(api) {
    var top = api.inset.top + 4, bottom = api.inset.bottom, side = 16, aw = api.w - side * 2, ah = api.h - top - bottom;
    var cell = Math.max(16, Math.min(26, Math.floor(Math.min(aw / 16, ah / 22))));
    B.cols = Math.floor(aw / cell); B.rows = Math.floor(ah / cell); B.cell = cell;
    B.x = Math.round((api.w - B.cols * cell) / 2); B.y = Math.round(top + (ah - B.rows * cell) / 2);
  }
  function occ(x, y) { return S.snake.some(function (s) { return s.x === x && s.y === y; }); }
  function makeJob(api) {
    var raw = jobsList(api)[(Math.random() * jobsList(api).length) | 0], max = Math.max(6, B.cols - 2);
    if (raw.length > max) raw = raw.slice(0, max).trim();
    var chars = raw.split(''), ok = []; chars.forEach(function (ch, i) { if (/[a-z0-9]/i.test(ch)) ok.push(i); });
    var bi = ok.length ? ok[ri(0, ok.length - 1)] : 0;
    for (var t = 0; t < 300; t++) {
      var y = ri(0, B.rows - 1); if (S.jobs.some(function (j) { return j.y === y; })) continue;
      var x0 = ri(0, Math.max(0, B.cols - chars.length)), fx = x0 + bi;
      if (occ(fx, y) || Math.abs(y - S.snake[0].y) < 2 && Math.abs(fx - S.snake[0].x) < 4) continue;
      return { chars: chars, bi: bi, x0: x0, y: y, fx: fx, born: S.t, ttl: ri(9, 14) };
    }
    return null;
  }
  function addJob(api) { var j = makeJob(api); if (j) S.jobs.push(j); }
  function respawn() {
    var cx = (B.cols / 2) | 0, cy = (B.rows / 2) | 0; S.snake = [];
    for (var i = 0; i < 4; i++) S.snake.push({ x: cx - i, y: cy });
    S.dir = { x: 1, y: 0 }; S.queue = []; S.grow = 0;
  }
  function turn(dx, dy) {
    var last = S.queue.length ? S.queue[S.queue.length - 1] : S.dir;
    if ((dx && last.x === -dx) || (dy && last.y === -dy) || (dx === last.x && dy === last.y)) return;
    if (S.queue.length < 3) S.queue.push({ x: dx, y: dy });
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  var game = {
    reset: function (api) {
      board(api); S = { t: 0, acc: 0, mps: 6, jobs: [], nextAdd: 2 }; respawn();
      addJob(api); addJob(api); api.setStat('1.0x');
    },
    resize: function (api) { if (!S) return; var c = B.cols, r = B.rows; board(api); if (c !== B.cols || r !== B.rows) { respawn(); S.jobs = []; addJob(api); addJob(api); } },
    key: function (e, down) {
      if (!down) return; var k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') turn(0, -1); else if (k === 'arrowdown' || k === 's') turn(0, 1); else if (k === 'arrowleft' || k === 'a') turn(-1, 0); else if (k === 'arrowright' || k === 'd') turn(1, 0);
    },
    pointer: function (type, x, y) {
      if (type === 'down') swipe = { x: x, y: y };
      else if (swipe && (type === 'move' || type === 'up')) {
        var dx = x - swipe.x, dy = y - swipe.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 22) { if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0); else turn(0, dy > 0 ? 1 : -1); swipe = { x: x, y: y }; }
        if (type === 'up') swipe = null;
      }
    },
    update: function (dt, api) {
      S.t += dt; S.acc += dt;
      S.jobs = S.jobs.filter(function (j) { return S.t - j.born < j.ttl || S.t - j.born < 3; });
      while (S.jobs.length < 2) addJob(api);
      if (S.jobs.length < 4 && S.t > S.nextAdd) { addJob(api); S.nextAdd = S.t + 1.4 + Math.random() * 2.2; }
      var step = 1 / S.mps;
      while (S.acc >= step) {
        S.acc -= step; if (S.queue.length) S.dir = S.queue.shift();
        var h = S.snake[0], nx = h.x + S.dir.x, ny = h.y + S.dir.y;
        var crash = nx < 0 || ny < 0 || nx >= B.cols || ny >= B.rows || S.snake.slice(0, S.snake.length - (S.grow ? 0 : 1)).some(function (s) { return s.x === nx && s.y === ny; });
        if (crash) { var lost = api.hit(); respawn(); if (lost && api.lives > 0) api.toast('Back to start length'); return; }
        S.snake.unshift({ x: nx, y: ny });
        var ji = -1; S.jobs.forEach(function (j, i) { if (j.fx === nx && j.y === ny) ji = i; });
        if (ji > -1) { S.jobs.splice(ji, 1); api.addScore(1); S.grow += 2; S.mps = Math.min(18, S.mps + .55); api.setStat((S.mps / 6).toFixed(1) + 'x'); api.sound('hit'); }
        if (S.grow > 0) S.grow--; else S.snake.pop();
      }
    },
    render: function (api) {
      var c = api.ctx, k = B.cell; c.fillStyle = api.c('bg'); c.fillRect(0, 0, api.w, api.h);
      c.strokeStyle = api.c('subtle'); c.lineWidth = 1; c.beginPath();
      for (var x = 1; x < B.cols; x++) { c.moveTo(B.x + x * k + .5, B.y); c.lineTo(B.x + x * k + .5, B.y + B.rows * k); }
      for (var y = 1; y < B.rows; y++) { c.moveTo(B.x, B.y + y * k + .5); c.lineTo(B.x + B.cols * k, B.y + y * k + .5); }
      c.stroke(); rr(c, B.x - .5, B.y - .5, B.cols * k + 1, B.rows * k + 1, 14); c.strokeStyle = api.c('line'); c.stroke();
      c.textAlign = 'center'; c.textBaseline = 'middle';
      S.jobs.forEach(function (j) {
        var age = S.t - j.born, fade = Math.min(1, age * 3, (j.ttl - age) * 1.5 + .3);
        j.chars.forEach(function (ch, i) {
          var cx = B.x + (j.x0 + i) * k + k / 2, cy = B.y + j.y * k + k / 2;
          if (i === j.bi) {
            var pulse = 1 + Math.sin(S.t * 6) * .08;
            c.globalAlpha = .35; c.fillStyle = api.c('verve'); c.beginPath(); c.arc(cx, cy, k * .48 * pulse, 0, 7); c.fill();
            c.globalAlpha = 1; c.strokeStyle = api.c('verve'); c.lineWidth = 2; c.stroke();
            c.fillStyle = api.c('ink'); c.font = api.font(700, Math.round(k * .62)); c.fillText(ch, cx, cy + 1);
          } else if (ch !== ' ') { c.globalAlpha = .9 * Math.max(.25, fade); c.fillStyle = api.c('ink-2'); c.font = api.font(400, Math.round(k * .52)); c.fillText(ch, cx, cy + 1); }
        });
        c.globalAlpha = 1;
      });
      var vis = api.visible();
      S.snake.forEach(function (s, i) {
        if (!vis && i === 0) return; if (!vis && i % 2) return;
        c.fillStyle = api.c(i === 0 ? 'player' : 'ink-3'); rr(c, B.x + s.x * k + 2, B.y + s.y * k + 2, k - 4, k - 4, 4); c.fill();
      });
    }
  };
  window.NVG.boot({
    key: 'snake', aria: 'Snake game: eat the highlighted letter of each job',
    eyebrow: 'AI Is Eating Our Jobs', title: 'Is your job on today’s menu?',
    goal: 'Eat the highlighted letter inside each “job”.',
    hints: { touch: [['swipe', 'Swipe to turn']], keys: [['keyboard', '<kbd>←↑↓→</kbd> or <kbd>WASD</kbd> to turn']] },
    tip: 'Tip: 2–4 jobs are on the board at once.', stat: 'Speed', silentHits: true,
    pauseTitle: 'Saving some jobs for later?', overTitle: 'Still hungry?',
    controls: [], game: game
  });
})();


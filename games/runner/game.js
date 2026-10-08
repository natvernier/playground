/* SPDX-License-Identifier: MIT · (c) 2026 Nathalie Vernier · https://github.com/natvernier/playground */
/* Business As Usual · the game: lanes, jumps, duck, speed control */
/* NVG v2 · Runner — "Business As Usual" */
(function () {
  'use strict';
  var S, inp = { press: false, hold: false, duck: false };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function lists(api) {
    var c = api.content; return { good: c.good && c.good.length ? c.good : ['Meeting Cancelled', 'Coffee Break'], bad: c.bad && c.bad.length ? c.bad : ['Reply-All Storm', 'Meta-Meeting'] };
  }
  function layout(api) {
    var h = api.h; S.ground = Math.round(Math.min(h * .8, h - api.inset.bottom - 28));
    S.size = Math.round(clamp(h * .075, 38, 60)); S.px = Math.round(clamp(api.w * .18, 48, 220));
    S.g = 3.4 * h; S.v0 = 1.08 * h; S.boost = .95 * h;
    if (!S.air) S.y = S.ground - S.size;
  }
  function chipFont(api) { return api.font(700, api.w < 480 ? 14 : 16); }
  function speed(api) { return clamp(api.w * .3, 120, 300) * (1 + (S.diff - 1) * .35); }
  function laneY(api, lane, h) { var b = S.ground; return lane === 'ground' ? b - h : lane === 'low' ? b - S.size * .8 - h : lane === 'mid' ? b - api.h * .22 - h : b - api.h * .36 - h; }
  function spawn(api) {
    var c = api.ctx, fs = api.w < 480 ? 14 : 16, h = Math.round(fs * 1.25 + 16), edge = api.w - 24;
    // a lane is free when its last item has fully entered the screen; ground + low never start side by side (always passable)
    var free = ['ground', 'low', 'mid', 'high'].filter(function (l) {
      return !S.items.some(function (t) { return (t.lane === l || ((l === 'ground' || l === 'low') && (t.lane === 'ground' || t.lane === 'low'))) && t.x + t.w > edge - (t.lane === l ? 0 : 160); });
    });
    if (!free.length) { S.next = .12; return; }
    var L = lists(api), good = Math.random() < .38, label = pick(good ? L.good : L.bad), lane = pick(free);
    c.font = chipFont(api);
    var w = Math.ceil(c.measureText(label).width) + 50;
    S.items.push({ good: good, label: label, lane: lane, x: api.w + 20, y: laneY(api, lane, h), w: w, h: h });
    S.next = .45 + Math.random() * .45;
  }
  function jump() {
    if (S.jumps <= 0) return;
    S.vy = -(S.duck ? S.v0 * .86 : S.v0); S.air = true; S.jumps--; S.holdLeft = .12; S.stretch = 1;
  }
  function icon(c, good, x, y, s, col) {
    c.save(); c.strokeStyle = col; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
    if (good) { c.moveTo(x, y + s * .55); c.lineTo(x + s * .38, y + s * .9); c.lineTo(x + s, y + s * .15); }
    else { c.moveTo(x + s * .1, y + s * .1); c.lineTo(x + s * .9, y + s * .9); c.moveTo(x + s * .9, y + s * .1); c.lineTo(x + s * .1, y + s * .9); }
    c.stroke(); c.restore();
  }
  function rr(c, x, y, w, h, r) { r = Math.min(r, h / 2, w / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  /* speed: slow / normal / fast. Scales the game clock, so jump arcs stay proportional. */
  var SPEED = {
    modes: ['r', 'c', 'p'],
    label: { r: 'Slow', c: 'Normal', p: 'Fast' },
    mult: { r: .78, c: 1, p: 1.32 },
    icons: {
      r: '<ellipse cx="9.2" cy="7.2" rx="1.5" ry="3.6" transform="rotate(-14 9.2 7.2)"/><ellipse cx="13.6" cy="7.2" rx="1.5" ry="3.6" transform="rotate(12 13.6 7.2)"/><circle cx="11.4" cy="15.2" r="4.6"/><circle cx="11.4" cy="14.9" r=".5"/>',
      c: '<path d="M6.3 8.8 6.7 4.9l3 2.2"/><path d="M17.7 8.8 17.3 4.9l-3 2.2"/><circle cx="12" cy="13.3" r="5.5"/><circle cx="9.8" cy="11.9" r=".5"/><circle cx="14.2" cy="11.9" r=".5"/><path d="M10.8 15.7h2.4"/><circle cx="8" cy="16.1" r=".45"/><circle cx="16" cy="16.1" r=".45"/>',
      p: '<path d="M3 15.2c0-1 .7-1.7 1.7-2l3.1-.9 2.5-2c.6-.5 1.3-.8 2.1-.8h2.2c.9 0 1.7.4 2.3 1l2.2 2.3 1.4.4c.7.2 1.1.8 1.1 1.5v1.1h-1.9"/><circle cx="7.6" cy="16.6" r="2"/><circle cx="16.4" cy="16.6" r="2"/><path d="M9.6 16.6h4.8"/>'
    },
    mode: (function () { try { var m = localStorage.getItem('nv-runner-speed'); return /^[rcp]$/.test(m) ? m : 'c'; } catch (e) { return 'c'; } })()
  };
  function speedUI(api) {
    if (!api) return;
    function group() {
      var g = document.createElement('div');
      g.className = 'nvg-theme nv-speed'; g.setAttribute('role', 'radiogroup'); g.setAttribute('aria-label', 'Game speed');
      g.innerHTML = SPEED.modes.map(function (m) {
        return '<button role="radio" data-speed="' + m + '" aria-label="' + SPEED.label[m] + '" title="' + SPEED.label[m] + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + SPEED.icons[m] + '</svg></button>';
      }).join('');
      return g;
    }
    function sync() { api.root.querySelectorAll('[data-speed]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-speed') === SPEED.mode)); }); }
    var startActions = api.root.querySelector('[data-layer="start"] .nvg-actions');
    if (startActions) startActions.parentNode.insertBefore(group(), startActions);
    var pauseRow = api.root.querySelector('[data-layer="pause"] .nvg-row--between');
    if (pauseRow) pauseRow.parentNode.insertBefore(group(), pauseRow.nextSibling); /* own row: sound + theme + speed do not fit on one line */
    api.root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-speed]'); if (!b) return;
      SPEED.mode = b.getAttribute('data-speed'); try { localStorage.setItem('nv-runner-speed', SPEED.mode); } catch (x) {}
      sync();
    });
    sync();
  }
  var game = {
    reset: function (api) {
      S = { t: 0, diff: 1, items: [], next: .4, vy: 0, air: false, jumps: 3, holdLeft: 0, duck: false, squash: 0, squashV: 0, stretch: 0 };
      inp = { press: false, hold: false, duck: false }; layout(api); S.y = S.ground - S.size; api.setStat('1.0');
    },
    resize: function (api) { if (!S) return; layout(api); S.items.forEach(function (t) { t.y = laneY(api, t.lane, t.h); }); },
    key: function (e, down) {
      var k = e.key.toLowerCase();
      if (k === ' ' || k === 'arrowup' || k === 'w') { if (down && !inp.hold) inp.press = true; inp.hold = down; }
      if (k === 'arrowdown' || k === 's') inp.duck = down;
    },
    blur: function () { inp.hold = false; inp.duck = false; },
    control: function (id, down) { if (id === 'jump') { if (down) inp.press = true; inp.hold = down; } if (id === 'duck') inp.duck = down; },
    pointer: function (type) { if (type === 'down') { inp.press = true; inp.hold = true; } if (type === 'up') inp.hold = false; },
    update: function (dt, api) {
      dt *= SPEED.mult[SPEED.mode];
      S.t += dt; S.diff = 1 + S.t * .008; api.setStat(S.diff.toFixed(1));
      api.addScore(dt * 42 * (1 + (S.diff - 1) * .2));
      var h = S.duck ? S.size * .6 : S.size, wasAir = S.air;
      S.duck = inp.duck;
      if (inp.press) { if (!S.air) S.jumps = 3; jump(); inp.press = false; }
      S.vy += (S.duck ? S.g * 1.1 : S.g) * dt;
      if (inp.hold && S.holdLeft > 0 && S.vy < 0) S.vy -= S.boost * dt;
      S.holdLeft = Math.max(0, S.holdLeft - dt);
      S.y += S.vy * dt;
      if (S.y >= S.ground - h) { if (wasAir && S.vy > 0) S.squashV += clamp(S.vy / api.h, .1, .6) * 9; S.y = S.ground - h; S.vy = 0; S.air = false; S.jumps = 3; } else S.air = true;
      var a = -S.squash * 60 - S.squashV * 14; S.squashV += a * dt; S.squash = clamp(S.squash + S.squashV * dt, 0, .6); S.stretch = Math.max(0, S.stretch - dt * 8);
      S.next -= dt;
      if (S.next <= 0) spawn(api);
      var px = S.px, py = S.y, pw = S.size, ph = h, sp = speed(api);
      for (var i = S.items.length - 1; i >= 0; i--) {
        var t = S.items[i]; t.x -= sp * dt;
        if (t.x + t.w < -40) { S.items.splice(i, 1); continue; }
        if (px + 6 < t.x + t.w && px + pw - 6 > t.x && py + 4 < t.y + t.h && py + ph > t.y) {
          if (t.good) { S.items.splice(i, 1); api.addScore(30); api.sound('boost'); if (api.heal()) api.toast('+1 life'); }
          else if (api.hit()) S.items.splice(i, 1);
        }
      }
    },
    render: function (api) {
      var c = api.ctx, w = api.w, hh = api.h;
      c.fillStyle = api.c('bg'); c.fillRect(0, 0, w, hh);
      c.fillStyle = api.c('ink-3'); c.fillRect(0, S.ground, w, 2);
      c.font = chipFont(api); c.textBaseline = 'middle'; c.textAlign = 'left';
      S.items.forEach(function (t) {
        c.fillStyle = api.c(t.good ? 'good-bg' : 'bad-bg'); rr(c, t.x, t.y, t.w, t.h, t.good ? t.h / 2 : 6); c.fill();
        var fg = api.c(t.good ? 'good-fg' : 'bad-fg'); icon(c, t.good, t.x + 12, t.y + t.h / 2 - 7, 14, fg);
        c.fillStyle = fg; c.fillText(t.label, t.x + 34, t.y + t.h / 2 + 1);
      });
      var s = S.size, h = S.duck ? s * .6 : s, cx = S.px + s / 2, cy = S.y + h / 2;
      c.fillStyle = api.c('subtle'); c.beginPath(); c.ellipse(cx, S.ground + 3, s * .45, 3, 0, 0, 7); c.fill();
      if (!api.visible()) return;
      var sx = clamp(1 + S.squash * .35 - S.stretch * .15, .75, 1.35), sy = clamp(1 - S.squash * .35 + S.stretch * .3, .7, 1.4) * (h / s);
      c.save(); c.translate(cx, cy); c.scale(sx, sy);
      c.beginPath(); c.arc(0, 0, s / 2 - 3, 0, 7); c.fillStyle = api.c('bg'); c.fill(); c.lineWidth = 5; c.strokeStyle = api.c('player'); c.stroke();
      c.beginPath(); c.arc(0, 0, s * .13, 0, 7); c.fillStyle = api.c('player'); c.fill();
      c.restore();
    }
  };
  speedUI(window.NVG.boot({
    key: 'runner', aria: 'Runner game: collect the good tasks, dodge the bad ones',
    eyebrow: 'Business As Usual', title: 'Could today have been an email?',
    hints: { touch: [['tap', 'jump: tap up to 3×, hold to float'], ['tap', 'duck: slide under']], keys: [['keyboard', '<kbd>Space</kbd> / <kbd>↑</kbd> jump up to 3×, hold to float'], ['keyboard', '<kbd>↓</kbd> duck']] },
    extra: 'legend', stat: 'Speed', touchOnlyControls: true, quietLoss: true,
    pauseTitle: 'Coffee break?', overTitle: 'Same time tomorrow?',
    controls: [{ id: 'jump', label: 'jump', primary: true }, { id: 'duck', label: 'duck' }], game: game
  }));
})();


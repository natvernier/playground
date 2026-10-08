/* SPDX-License-Identifier: MIT · (c) 2026 Nathalie Vernier · https://github.com/natvernier/playground */
/* NVG core · the shared shell for all four games: start / HUD / pause / game over,
   lives, sound, light/dark, input and the main loop. A game calls NVG.boot(config). */
(function () {
  'use strict';
  var W = window, D = document, CDN = 'https://cdn.prod.website-files.com/66ffd630ea77d3e10d970492/';
  var SITE = 'https://www.natvernier.com';
  var SND = {
    hover: CDN + '6932af7eaeff1fc1c89f0b3b_fd8d3678a03d0060ba75f57adc5e9be0_Hover.mp3',
    click: CDN + '693b0fe59ed687420c5e06bc_e4502bd5b06d346b0477d2b4262f4f4c_open.mp3',
    hit: CDN + '693d36ebeca0cfbb7c714087_Write.mp3',
    over: CDN + '695699596c21a98d002195aa_GameOver.mp3',
    boost: CDN + '69569dbc0880683b880b1111_game_fuel.mp3'
  };
  var I = {
    tap: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a5 5 0 0 1-4-2l-2.8-3.4a1.5 1.5 0 0 1 2.2-2l2.2 1.9"/><path d="M10.5 1v1.6M6.4 2.5l1.1 1.1M14.6 2.5l-1.1 1.1"/>',
    swipe: '<path d="M11.5 12V7.3a1.3 1.3 0 0 1 2.6 0V12m0-1.3a1.3 1.3 0 0 1 2.6 0V12m0-.4a1.3 1.3 0 0 1 2.6 0v3.8a5.2 5.2 0 0 1-5.2 5.2h-.5a4.3 4.3 0 0 1-3.4-1.7l-2.4-2.9a1.3 1.3 0 0 1 1.9-1.7l1.9 1.6"/><path d="M2 3.2h11.5M11 1l2.6 2.2L11 5.4M1.5 11.5H4M1.5 14.5H3"/>',
    drag: '<path d="M8.9 13.3V8.5a1.3 1.3 0 0 1 2.6 0v4.8m0-1.3a1.3 1.3 0 0 1 2.6 0v1.3m0-.4a1.3 1.3 0 0 1 2.6 0v3.8a5.2 5.2 0 0 1-5.2 5.2h-.5a4.3 4.3 0 0 1-3.4-1.7l-2.4-2.9a1.3 1.3 0 0 1 1.9-1.7l1.9 1.6"/><rect x="6" y="1.6" width="10" height="3.2" rx="1.6"/><path d="M3.6 1.8 2 3.2l1.6 1.4M18.4 1.8 20 3.2l-1.6 1.4"/>',
    boost: '<path d="M13.5 2.5 5.5 13.5h6l-1 8 8-11.5h-6l1-7.5Z"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 9.5h.01M9.3 9.5h.01M12.6 9.5h.01M15.9 9.5h.01M18 9.5h.01M6 12.2h.01M18 12.2h.01M8 15h8"/>',
    heart: '<path d="M12 20.2S3.6 15.4 3.6 9.3A4.4 4.4 0 0 1 8 4.8c1.6 0 3.1.9 4 2.3a4.7 4.7 0 0 1 4-2.3 4.4 4.4 0 0 1 4.4 4.5c0 6.1-8.4 10.9-8.4 10.9Z"/>',
    soundOn: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    soundOff: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z"/><path d="m16 9.5 5 5m0-5-5 5"/>',
    pause: '<path d="M9 6v12M15 6v12"/>',
    play: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z"/>',
    restart: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/>',
    left: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    right: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>',
    check: '<path d="M5 12.5 10 17.5 19 7"/>',
    cross: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'
  };
  function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>'; }
  function get(k, s) { try { return (s || localStorage).getItem(k); } catch (e) { return null; } }
  function set(k, v, s) { try { (s || localStorage).setItem(k, v); } catch (e) {} }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = W.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* theme + sound: on natvernier.com these come from window.NV (one site-wide setting);
     standalone they fall back to localStorage / sessionStorage */
  var NVp = W.NV && W.NV.theme ? W.NV : null, mute = false;
  var Theme = {
    get: function () { if (NVp) return NVp.theme(); var t = get('nv-theme'); return t === 'light' || t === 'dark' ? t : (W.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); },
    set: function (t) { if (NVp) NVp.setTheme(t); else { D.documentElement.setAttribute('data-theme', t); set('nv-theme', t); } Theme.sync(); NVG._themeChanged(); },
    sync: function () {
      var t = Theme.get();
      D.querySelectorAll('[data-theme-btn]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-theme-btn') === t)); });
      D.querySelectorAll('[data-act="theme"]').forEach(function (b) { var to = t === 'dark' ? 'light' : 'dark'; b.innerHTML = svg(to === 'dark' ? 'moon' : 'sun'); b.setAttribute('aria-label', to === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'); b.title = b.getAttribute('aria-label'); });
    }
  };
  if (!NVp && get('nv-theme')) D.documentElement.setAttribute('data-theme', get('nv-theme'));

  /* sound: off by default, one setting for the whole visit */
  var Sound = {
    _on: get('nvg-sound', sessionStorage) === 'on', cache: {},
    get on() { return NVp ? NVp.sound() : Sound._on; },
    play: function (n) { if (mute || !Sound.on || !SND[n]) return; var a = Sound.cache[n] || (Sound.cache[n] = new Audio(SND[n])); a.volume = n === 'hover' ? .08 : .15; try { a.currentTime = 0; var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} },
    toggle: function () { var v = !Sound.on; if (NVp) NVp.setSound(v); else { Sound._on = v; set('nvg-sound', v ? 'on' : 'off', sessionStorage); } Sound.sync(); if (v) Sound.play('click'); },
    sync: function () {
      var on = Sound.on;
      D.querySelectorAll('[data-act="sound"]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(on));
        b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
        b.innerHTML = b.classList.contains('nvg-icon-btn') ? svg(on ? 'soundOn' : 'soundOff') : (on ? 'Sound: on ' : 'Sound: off ') + svg(on ? 'soundOn' : 'soundOff');
      });
    }
  };
  W.addEventListener('nv:theme', function () { Theme.sync(); if (W.NVG) W.NVG._themeChanged(); });
  W.addEventListener('nv:sound', function () { Sound.sync(); });

  /* hover sound on links and buttons (the site's custom cursor is not part of this pen) */
  function hoverSound() {
    if (touch) return;
    D.addEventListener('mouseover', function (e) {
      var l = e.target.closest && e.target.closest('a,button');
      if (l && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('a,button') === l)) Sound.play('hover');
    });
  }

  var NVG = W.NVG = { svg: svg, icons: I, touch: touch, reduced: reduced, _themeChanged: function () {} };

  NVG.boot = function (cfg) {
    var root = D.getElementById('nvg'); if (!root) return;
    D.body.classList.add('nvg-page');
    var game = cfg.game, best = +get('nvg-best-' + cfg.key) || 0;
    mute = !!cfg.silent; /* silent: this game makes no sound at all */
    var hints = (touch ? cfg.hints.touch : cfg.hints.keys) || [];
    /* "All games" goes to natvernier.com/play unless the page sets window.NVG_ALL_GAMES */
    var allHref = W.NVG_ALL_GAMES || SITE + '/play', ext = /^https?:/.test(allHref);
    var allGames = '<a class="nvg-btn nvg-btn--ghost nvg-btn--fill" href="' + esc(allHref) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + svg('left') + ' All games</a>';
    var heartsHTML = '<span class="nvg-hearts" data-hearts aria-label="3 lives"></span>';
    var themeHTML = '<div class="nvg-theme" role="radiogroup" aria-label="Colour mode"><button role="radio" data-theme-btn="light" aria-label="Light">' + svg('sun') + '</button><button role="radio" data-theme-btn="dark" aria-label="Dark">' + svg('moon') + '</button></div>';
    var soundBtn = '<button class="nvg-btn nvg-btn--sec" data-act="sound" aria-pressed="false"></button>';
    function head(eyebrow, title, id) { return '<div class="nvg-head"><div class="nvg-eyebrow-row"><span class="nvg-eyebrow">' + eyebrow + '</span>' + heartsHTML + '</div><h2 class="nvg-title" id="' + id + '">' + title + '</h2>'; }
    var extra = '';
    if (cfg.extra === 'boost') extra = '<div class="nvg-explain"><span class="nvg-mini"><i></i>' + svg('boost') + '</span><p><strong>Boost = speed burst</strong>Green is your fuel. It refills while you cruise.</p></div>';
    if (cfg.extra === 'legend') extra = '<div class="nvg-legend"><div class="nvg-row"><span class="nvg-label">Collect</span><span class="nvg-chip nvg-chip--good">' + svg('check') + 'Meeting Cancelled</span></div><div class="nvg-row"><span class="nvg-label">Dodge</span><span class="nvg-chip nvg-chip--bad">' + svg('cross') + 'Reply-All Storm</span></div></div>';
    if (cfg.levels) extra = '<div class="nvg-col"><span class="nvg-label" id="nvg-lv">Choose a level</span><div class="nvg-seg" role="radiogroup" aria-labelledby="nvg-lv">' + cfg.levels.map(function (l, i) { return '<button role="radio" data-level="' + i + '" aria-checked="' + (i === 0) + '">' + l + '</button>'; }).join('') + '</div></div>';
    var ctl = (cfg.controls || []).map(function (c) {
      if (c.type === 'boost') return '<button class="nvg-boost" data-ctl="boost" aria-label="Boost"><i></i><span>' + svg('boost') + 'boost</span></button>';
      return '<button class="nvg-btn ' + (c.primary ? 'nvg-btn--pri' : 'nvg-btn--sec') + '" data-ctl="' + c.id + '">' + c.label + '</button>';
    }).join('');
    root.setAttribute('data-state', 'start');
    root.innerHTML =
      '<canvas class="nvg-canvas" tabindex="0" aria-label="' + esc(cfg.aria) + '"></canvas>' +
      '<div class="nvg-toast" role="status" aria-live="polite"></div>' +
      '<div class="nvg-hud"><div class="nvg-bar"><div class="nvg-stat"><b>Score</b><span data-score>0</span></div>' +
      (cfg.stat ? '<i class="nvg-div"></i><div class="nvg-stat"><b>' + cfg.stat + '</b><span data-stat>–</span></div>' : '') +
      '<i class="nvg-div"></i>' + heartsHTML + '</div><div class="nvg-utils"><button class="nvg-icon-btn" data-act="theme"></button><button class="nvg-icon-btn" data-act="sound"></button><button class="nvg-icon-btn" data-act="pause" aria-label="Pause">' + svg('pause') + '</button></div></div>' +
      '<div class="nvg-controls"' + (cfg.touchOnlyControls && !touch ? ' hidden' : '') + '>' + ctl + '</div>' +
      '<div class="nvg-theme-float">' + themeHTML + '</div>' +
      '<div class="nvg-layer" data-layer="start"><div class="nvg-blur"></div><section class="nvg-sheet" role="dialog" aria-modal="true" aria-labelledby="nvg-t1">' +
        head(cfg.eyebrow, cfg.title, 'nvg-t1') + (cfg.goal ? '<p class="nvg-goal">' + cfg.goal + '</p>' : '') + '</div>' +
        (hints.length ? '<ul class="nvg-hints">' + hints.map(function (h) { return '<li class="nvg-hint">' + svg(h[0]) + '<span>' + h[1] + '</span></li>'; }).join('') + '</ul>' : '') +
        extra + (cfg.tip ? '<p class="nvg-tip">' + cfg.tip + '</p>' : '') +
        '<div class="nvg-actions">' + soundBtn + '<button class="nvg-btn nvg-btn--pri" data-act="start">Start ' + svg('right') + '</button></div></section></div>' +
      '<div class="nvg-layer" data-layer="pause"><div class="nvg-blur"></div><section class="nvg-sheet" role="dialog" aria-modal="true" aria-labelledby="nvg-t2">' +
        head('Paused', cfg.pauseTitle, 'nvg-t2') + '</div>' +
        '<div class="nvg-scores"><div class="nvg-score"><span class="nvg-label">Score</span><span data-final>0</span></div><div class="nvg-score"><span class="nvg-label">Best</span><span data-best>0</span></div></div>' +
        '<div class="nvg-row nvg-row--between">' + soundBtn + themeHTML + '</div>' +
        '<div class="nvg-col"><button class="nvg-btn nvg-btn--pri" data-act="resume">Resume ' + svg('play') + '</button><div class="nvg-row"><button class="nvg-btn nvg-btn--ghost nvg-btn--fill" data-act="restart">Restart ' + svg('restart') + '</button>' + allGames + '</div></div></section></div>' +
      '<div class="nvg-layer" data-layer="over"><div class="nvg-blur"></div><section class="nvg-sheet" role="dialog" aria-modal="true" aria-labelledby="nvg-t3">' +
        head('Game over', cfg.overTitle, 'nvg-t3') + '</div>' +
        '<div class="nvg-scores"><div class="nvg-score"><span class="nvg-label">Score</span><span data-final>0</span></div><div class="nvg-score"><span class="nvg-label">Best</span><span data-best>0</span></div></div>' +
        '<div class="nvg-col"><button class="nvg-btn nvg-btn--pri" data-act="restart">Play again ' + svg('restart') + '</button>' + allGames + '</div></section></div>';

    var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return root.querySelectorAll(s); };
    var canvas = $('canvas'), ctx = canvas.getContext('2d'), toastEl = $('.nvg-toast');
    if (cfg.silent) $$('[data-act="sound"]').forEach(function (b) { b.remove(); });
    var state = 'start', lives = 3, score = 0, invuln = 0, dead = false, colors = {}, toastT = 0;

    var api = {
      root: root, canvas: canvas, ctx: ctx, w: 0, h: 0, dpr: 1, touch: touch, reduced: reduced, level: 0, content: (W.NVG_CONTENT || {})[cfg.key] || {},
      inset: { top: 76, bottom: 24 },
      get playing() { return state === 'playing' && !dead; },
      get state() { return state; },
      get lives() { return lives; },
      get invuln() { return invuln > 0; },
      c: function (n) { return colors[n] || '#888'; },
      font: function (w, px, fam) { return w + ' ' + px + 'px ' + (fam === 'display' ? '"TT Barrels","Newsreader",Georgia,serif' : '"Neue Hans Kendrick","Outfit",system-ui,sans-serif'); },
      visible: function () { return invuln <= 0 || reduced || dead ? true : Math.floor(invuln * 10) % 3 !== 0; },
      addScore: function (n) { score += n; $('[data-score]').textContent = Math.floor(score); },
      get score() { return score; },
      setStat: function (t) { var s = $('[data-stat]'); if (s && s.textContent !== String(t)) s.textContent = t; },
      setFuel: function (p) { var b = $('[data-ctl="boost"]'); if (!b) return; b.firstChild.style.width = Math.max(0, Math.min(100, p)) + '%'; b.classList.toggle('is-empty', p < 10); },
      toast: function (m, ms) { toastEl.textContent = m; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, ms || 1100); },
      sound: function (n) { Sound.play(n); },
      vibrate: function (ms) { if (!reduced && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} },
      heal: function () { if (lives >= 3) return false; lives++; hearts(-1); return true; },
      hit: function () {
        if (invuln > 0 || dead || state !== 'playing') return false;
        lives--; hearts(lives); api.vibrate(60); invuln = 1.0;
        /* silentHits: hits make no sound · quietLoss: losing the last life makes no sound */
        if (!cfg.silentHits && (lives > 0 || !cfg.quietLoss)) Sound.play('hit');
        if (lives <= 0) { dead = true; setTimeout(over, 450); }
        return true;
      },
      over: function () { if (!dead) { dead = true; over(); } }
    };

    function hearts(popIndex) {
      $$('[data-hearts]').forEach(function (el, k) {
        var h = ''; for (var i = 0; i < 3; i++) h += '<span class="nvg-heart ' + (i < lives ? 'is-full' : 'is-lost') + (k === 0 && i === popIndex ? ' is-pop' : '') + '">' + svg('heart') + '</span>';
        el.innerHTML = h; el.setAttribute('aria-label', lives + (lives === 1 ? ' life' : ' lives') + ' left');
      });
    }
    function readColors() {
      var cs = getComputedStyle(root);
      ['bg', 'sunken', 'ink', 'ink-2', 'ink-3', 'line', 'line-strong', 'subtle', 'verve', 'on-verve', 'player', 'good-bg', 'good-fg', 'bad-bg', 'bad-fg', 'glass'].forEach(function (n) { colors[n] = cs.getPropertyValue('--' + n).trim(); });
    }
    NVG._themeChanged = function () { readColors(); };
    W.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { Theme.sync(); readColors(); });

    function resize() {
      var r = root.getBoundingClientRect(), dpr = Math.max(1, Math.min(2, W.devicePixelRatio || 1));
      api.w = Math.max(2, r.width); api.h = Math.max(2, r.height); api.dpr = dpr;
      canvas.width = Math.round(api.w * dpr); canvas.height = Math.round(api.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      root.style.setProperty('--nvg-nav', '24px');
      var c = $('.nvg-controls'); api.inset.bottom = c && !c.hidden && c.children.length ? 24 + 56 + 16 : 24;
      if (game.resize) game.resize(api);
    }
    function layer(name) {
      $$('.nvg-layer').forEach(function (l) { l.classList.toggle('is-on', l.getAttribute('data-layer') === name); });
      root.setAttribute('data-state', state);
      D.body.classList.toggle('nvg-playing', state === 'playing');
      var f = name && $('[data-layer="' + name + '"] .nvg-btn--pri'); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 60);
    }
    function scores() { $$('[data-final]').forEach(function (e) { e.textContent = Math.floor(score); }); $$('[data-best]').forEach(function (e) { e.textContent = best; }); }
    function reset() { score = 0; lives = 3; invuln = 0; dead = false; $('[data-score]').textContent = '0'; hearts(-1); game.reset(api); }
    function start() { if (state !== 'start') return; Sound.play('click'); state = 'playing'; layer(null); canvas.focus({ preventScroll: true }); if (game.start) game.start(api); }
    function pause() { if (state !== 'playing' || dead) return; state = 'paused'; scores(); layer('pause'); }
    function resume() { if (state !== 'paused') return; state = 'playing'; layer(null); canvas.focus({ preventScroll: true }); }
    function restart() { reset(); state = 'playing'; layer(null); canvas.focus({ preventScroll: true }); if (game.start) game.start(api); }
    function over() {
      state = 'over'; if (score > best) { best = Math.floor(score); set('nvg-best-' + cfg.key, best); }
      scores(); hearts(-1); if (!cfg.quietLoss) Sound.play('over'); layer('over');
    }

    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act],[data-level],[data-theme-btn]'); if (!b) return;
      var a = b.getAttribute('data-act');
      if (b.hasAttribute('data-level')) { api.level = +b.getAttribute('data-level'); $$('[data-level]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); return; }
      if (b.hasAttribute('data-theme-btn')) return Theme.set(b.getAttribute('data-theme-btn'));
      if (a === 'theme') Theme.set(Theme.get() === 'dark' ? 'light' : 'dark'); else if (a === 'sound') Sound.toggle(); else if (a === 'start') start(); else if (a === 'pause') pause(); else if (a === 'resume') resume(); else if (a === 'restart') restart();
    });
    $$('[data-ctl]').forEach(function (b) {
      var id = b.getAttribute('data-ctl'), on = function (e) { e.preventDefault(); if (state === 'playing' && game.control) game.control(id, true, api); }, off = function (e) { e.preventDefault(); if (game.control) game.control(id, false, api); };
      b.addEventListener('pointerdown', on); ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { b.addEventListener(t, off); });
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });
    function pt(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    canvas.addEventListener('pointerdown', function (e) { if (state !== 'playing') return; e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (x) {} var p = pt(e); if (game.pointer) game.pointer('down', p.x, p.y, api, e); });
    canvas.addEventListener('pointermove', function (e) { if (state !== 'playing') return; var p = pt(e); if (game.pointer) game.pointer('move', p.x, p.y, api, e); });
    ['pointerup', 'pointercancel'].forEach(function (t) { canvas.addEventListener(t, function (e) { var p = pt(e); if (game.pointer) game.pointer('up', p.x, p.y, api, e); }); });
    D.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'Escape' || k === 'p' || k === 'P') { if (state === 'playing') pause(); else if (state === 'paused') resume(); return; }
      if ((k === 'r' || k === 'R') && (state === 'paused' || state === 'over')) return restart();
      if (state === 'playing') { if (/^(Arrow|\s$)/.test(k) || k === ' ') e.preventDefault(); if (game.key) game.key(e, true, api); }
    });
    D.addEventListener('keyup', function (e) { if (game.key) game.key(e, false, api); });
    D.addEventListener('visibilitychange', function () { if (D.hidden) pause(); });
    W.addEventListener('blur', function () { if (game.blur) game.blur(api); });
    W.addEventListener('resize', resize, { passive: true });

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      if (state === 'playing' && !dead) { if (invuln > 0) invuln = Math.max(0, invuln - dt); game.update(dt, api); }
      game.render(api);
      requestAnimationFrame(frame);
    }
    readColors(); Theme.sync(); Sound.sync(); hoverSound(); resize(); if (game.init) game.init(api); reset(); layer('start');
    requestAnimationFrame(frame);
    return api;
  };
})();


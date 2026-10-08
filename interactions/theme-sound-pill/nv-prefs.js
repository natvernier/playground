/* SPDX-License-Identifier: MIT · (c) 2026 Nathalie Vernier · https://github.com/natvernier/playground */
/*
  nv-prefs · one switch for light/dark and sound, shared by every page of a site.

  What it does
  - Light/dark: the first visit follows the device (prefers-color-scheme); a choice
    made in the pill is remembered (localStorage "nv-theme").
  - Sound: off by default, one setting for the whole visit (sessionStorage "nv-sound").
    While it is off, every <audio> element and every new Audio() stays silent, so no
    script on the page has to know about the setting.
  - Writes html[data-theme="light|dark"] for your CSS, and html[data-nv] when the
    chosen theme differs from the page's designed ("native") theme:
    "l" = light on a dark-designed page, "d" = dark on a light-designed page.
  - Fires window events "nv:theme" and "nv:sound" so other scripts can follow along.

  Use
    <html data-native="dark">            (optional; default "light")
    <link rel="stylesheet" href="nv-prefs.css">
    <script src="nv-prefs.js"></script>   (in <head>, before anything that plays sound)

  API: window.NV.theme(), NV.setTheme('light'|'dark'), NV.sound(), NV.setSound(bool).
  Add data-nv-no-pill to <html> to keep the API but hide the pill (games bring their own controls).
*/
(function () {
  var W = window, D = document, d = D.documentElement, K = 'nv-theme', S = 'nv-sound';
  function g(s, k) { try { return s.getItem(k); } catch (e) { return null; } }
  function p(s, k, v) { try { s.setItem(k, v); } catch (e) {} }
  function fire(n, v) { try { W.dispatchEvent(new CustomEvent(n, { detail: v })); } catch (e) {} }
  var mq = W.matchMedia ? W.matchMedia('(prefers-color-scheme: dark)') : null;

  var NV = W.NV = {
    native: d.getAttribute('data-native') === 'dark' ? 'dark' : 'light',
    theme: function () { var t = g(localStorage, K); return t === 'light' || t === 'dark' ? t : (mq && mq.matches ? 'dark' : 'light'); },
    setTheme: function (t) { p(localStorage, K, t); NV.apply(); },
    sound: function () { return g(sessionStorage, S) === 'on'; },
    setSound: function (on) { p(sessionStorage, S, on ? 'on' : 'off'); fire('nv:sound', !!on); },
    apply: function () {
      var t = NV.theme();
      d.setAttribute('data-theme', t);
      d.setAttribute('data-nv', t === NV.native ? '' : t.charAt(0));
      d.style.colorScheme = t;
      fire('nv:theme', t);
    }
  };
  NV.apply();
  if (mq) {
    var follow = function () { if (!g(localStorage, K)) NV.apply(); };
    if (mq.addEventListener) mq.addEventListener('change', follow); else if (mq.addListener) mq.addListener(follow);
  }

  /* sound stays off until the visitor turns it on: gate every audio element at the source */
  var P = HTMLMediaElement.prototype, play = P.play;
  P.play = function () {
    if (W.HTMLAudioElement && this instanceof HTMLAudioElement && !NV.sound()) return Promise.resolve();
    return play.apply(this, arguments);
  };

  /* the pill */
  function ready(f) { if (D.readyState !== 'loading') f(); else D.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    if (d.hasAttribute('data-nv-no-pill')) return;
    var I = {
      on: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
      off: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z"/><path d="m16 9.5 5 5m0-5-5 5"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
      moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>'
    };
    function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>'; }
    var box = D.createElement('div');
    box.className = 'nv-prefs'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Sound and colour mode');
    box.innerHTML = '<button type="button" data-nv-act="sound"></button><i></i>' +
      '<span role="radiogroup" aria-label="Colour mode">' +
      '<button type="button" role="radio" data-nv-theme="light" aria-label="Light mode" title="Light mode">' + svg('sun') + '</button>' +
      '<button type="button" role="radio" data-nv-theme="dark" aria-label="Dark mode" title="Dark mode">' + svg('moon') + '</button></span>';
    D.body.appendChild(box);
    var snd = box.querySelector('[data-nv-act="sound"]');
    function sync() {
      var on = NV.sound(), t = NV.theme();
      snd.setAttribute('aria-pressed', String(on)); snd.innerHTML = svg(on ? 'on' : 'off');
      snd.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); snd.title = on ? 'Sound on' : 'Sound off';
      box.querySelectorAll('[data-nv-theme]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-nv-theme') === t)); });
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b === snd) NV.setSound(!NV.sound()); else NV.setTheme(b.getAttribute('data-nv-theme'));
      sync();
    });
    W.addEventListener('nv:theme', sync); W.addEventListener('nv:sound', sync);
    sync();
    /* keep the pill inside the visible screen even when something widens the page on a phone */
    var vv = W.visualViewport;
    function place() {
      if (!vv) return; box.style.right = '12px';
      var r = box.getBoundingClientRect(), edge = vv.offsetLeft + vv.width - 12;
      if (r.right > edge + 0.5) box.style.right = (12 + Math.round(r.right - edge)) + 'px';
    }
    place(); if (vv) { vv.addEventListener('resize', place); vv.addEventListener('scroll', place); } W.addEventListener('resize', place);
  });
})();

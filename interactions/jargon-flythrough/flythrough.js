/* SPDX-License-Identifier: MIT · (c) 2026 Nathalie Vernier · https://github.com/natvernier/playground */
/*
  Jargon flythrough · words travel from a vanishing point, past the camera, and out of frame.

  - Depth is simulated with scale, blur and opacity; the page still scrolls normally.
  - The field drifts on its own; scrolling through the pinned section pushes you through faster.
  - Each word gets a direction on the golden angle (2.39996 rad), so they spread without clumping.
  - A soft warm light follows a fine pointer (mouse or trackpad) and lets elements cast shadow.
  - Reduced motion, touch, or a narrow screen: the words sit still at low opacity, nothing moves.

  Markup: <section class="fly" data-fly> <div class="fly-pin"> <div class="fly-field"></div> … </div> </section>
  Words come from data-words on the section (separated by "|"), or the default list below.
*/
(function () {
  'use strict';
  var root = document.querySelector('[data-fly]'); if (!root) return;
  var field = root.querySelector('.fly-field');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(hover: none), (pointer: coarse)').matches;
  var small = matchMedia('(max-width: 767px)').matches;
  var STATIC = reduce || coarse || small;
  if (STATIC) root.classList.add('is-static');
  var cl = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  var DEFAULT = ['agentic', 'end-to-end', 'paradigm shift', 'AI-native', 'hyperautomation', 'digital twin', 'zero trust',
    'context window', 'prompt engineering', 'guardrails', 'multimodal', 'hallucination', 'orchestration', 'copilot',
    'north star', 'single source of truth', 'low-hanging fruit', 'circle back', 'synergy', 'frictionless',
    'let us double-click on that', 'at scale', 'disruption', 'future-proof', 'human in the loop', 'value stream',
    'transformation', 'democratise'];
  var words = root.dataset.words ? root.dataset.words.split('|') : DEFAULT;

  var fw = [];
  words.forEach(function (text, i) {
    var b = document.createElement('b');
    b.className = 'd' + ((i * 2) % 3);              /* three type treatments: display, semibold, regular */
    b.textContent = text.trim();
    field.appendChild(b);
    if (STATIC) { b.style.left = (((i * 37) % 92) + 3) + '%'; b.style.top = (((i * 29) % 88) + 5) + '%'; }
    var a = i * 2.39996;                            /* golden angle */
    var r = 0.16 + ((i * 7) % 11) / 11 * 0.56;
    fw.push({ el: b, ux: Math.cos(a) * r, uy: Math.sin(a) * r * 0.70, ph: i / words.length, sp: 0.82 + ((i * 5) % 7) / 7 * 0.42 });
  });

  /* one word's journey: far (d = 1.12) to the lens (d = 0.20); k = 0.46 / d drives position, size and blur together */
  function draw(travel) {
    var W = field.clientWidth || 1440, H = field.clientHeight || 900;
    var ox = W < 900 ? 0 : W * 0.14;                /* vanishing point right of the headline */
    for (var i = 0; i < fw.length; i++) {
      var o = fw[i];
      var z = (travel * o.sp + o.ph) % 1; if (z < 0) z += 1;
      var d = 1.12 - z * 0.92, k = 0.46 / d;
      var op = cl(z / 0.10, 0, 1) * cl((1 - z) / 0.26, 0, 1) * 0.26;
      var bl = Math.max(0, k - 1.25) * 2.6;
      o.el.style.transform = 'translate(-50%,-50%) translate(' + (ox + o.ux * W * k).toFixed(1) + 'px,' + (o.uy * H * k).toFixed(1) + 'px) scale(' + (k * 1.55).toFixed(3) + ')';
      o.el.style.opacity = op.toFixed(3);
      o.el.style.filter = bl > 0.25 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
    }
  }

  /* 0 at the top of the pinned section, 1 when it releases */
  function progress() {
    var r = root.getBoundingClientRect(), span = root.offsetHeight - innerHeight;
    return span > 0 ? cl(-r.top / span, 0, 1) : 0;
  }

  var hl = root.querySelector('[data-rise]');      /* optional: the second half of the headline rises from 20% to full */
  var t0 = performance.now();
  function frame(now) {
    var r = root.getBoundingClientRect();
    if (r.bottom > -200 && r.top < innerHeight + 200) {
      var p = progress();
      draw(((now - t0) / 1000) * 0.052 + p * 2.4);  /* 0.052 cycles/s on its own, +2.4 cycles across the scroll */
      if (hl) hl.style.opacity = cl((p - 0.22) / 0.4, 0.2, 1).toFixed(3);
    }
    requestAnimationFrame(frame);
  }
  if (!STATIC) requestAnimationFrame(frame);

  var next = root.querySelector('[data-next]');
  if (next) next.addEventListener('click', function () {
    var to = root.nextElementSibling; if (to) to.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  /* the warm light: --mx/--my place it, --lx/--ly (-1…1) steer the shadows of [data-lit] elements */
  if (!STATIC && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var host = document.documentElement, mx = innerWidth / 2, my = innerHeight * 0.38, queued = false;
    host.classList.add('is-lit');
    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (queued) return; queued = true;
      requestAnimationFrame(function () {
        host.style.setProperty('--mx', mx + 'px');
        host.style.setProperty('--my', my + 'px');
        host.style.setProperty('--lx', ((mx / innerWidth) * 2 - 1).toFixed(3));
        host.style.setProperty('--ly', ((my / innerHeight) * 2 - 1).toFixed(3));
        queued = false;
      });
    }, { passive: true });
  }
})();

# Jargon flythrough

Words travel from a vanishing point, past the camera and out of frame, while a warm light follows the cursor. It is the opening scene of a scroll-driven page on natvernier.com, taken out on its own with placeholder copy.

**See it:** [natvernier.github.io/playground/interactions/jargon-flythrough](https://natvernier.github.io/playground/interactions/jargon-flythrough/)

## How it works

- **Depth without 3D.** Each word has a depth `d` that runs from 1.12 (far) to 0.20 (at the lens). One factor, `k = 0.46 / d`, drives its position, size and blur together, so everything stays consistent. Opacity fades in at the far end and out before the lens, peaking at 26%.
- **Spread.** Each word leaves the vanishing point on the golden angle (2.39996 rad × its index), so the field fills evenly without clumping. On wide screens the vanishing point sits 14% right of centre, away from the headline.
- **Motion.** The field drifts on its own at 0.052 cycles per second. Scrolling through the pinned section adds 2.4 cycles on top: scroll pushes you through faster instead of starting the motion. The page always scrolls normally; nothing is hijacked.
- **Light.** On a mouse or trackpad, a soft warm radial light follows the pointer (`--mx`, `--my`). `--lx` and `--ly` (−1 to 1) steer the drop shadows of any element marked `data-lit`, so they fall away from the light.
- **Still mode.** With reduced motion, on touch screens, or below 768px wide, the words sit still at low opacity and the light is off. The headline is fully visible. Nothing is lost.

## Use

```html
<section class="fly" data-fly data-words="synergy|at scale|north star">
  <div class="fly-pin">
    <div class="fly-field" aria-hidden="true"></div>
    <div class="fly-copy"><h1>Headline <span data-rise>second half</span></h1></div>
  </div>
</section>
<script src="flythrough.js"></script>
```

The styles are in `index.html`: copy the `.fly…` and `.light` rules, and add `<div class="light" aria-hidden="true"></div>` to the page for the cursor light. Without `data-words`, it uses the default list in `flythrough.js`.

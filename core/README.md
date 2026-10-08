# NVG core

The shared shell for all four games. Load `nvg.css`, then `nvg-core.js`, then a game script that calls `NVG.boot(config)` on a page that has `<div id="nvg"></div>`.

The core draws the start, pause and game-over sheets, the HUD (score, an optional second stat, three hearts, theme, sound, pause), optional touch controls, and runs the loop. Keyboard: `Esc`/`P` pauses and resumes, `R` restarts from the pause and game-over sheets.

## `NVG.boot(config)`

| key | what it does |
|---|---|
| `key` | storage key for the best score (`nvg-best-<key>`) and the content lookup in `window.NVG_CONTENT[key]` |
| `game` | the game object (see below) |
| `eyebrow`, `title`, `goal`, `tip` | start-sheet copy |
| `pauseTitle`, `overTitle` | headlines of the pause and game-over sheets |
| `aria` | accessible label of the canvas |
| `hints` | `{ touch: [[icon, html]], keys: [[icon, html]] }`, shown on the start sheet |
| `stat` | label of the second HUD stat (set it with `api.setStat`) |
| `extra` | `'boost'` or `'legend'`, an explainer block on the start sheet |
| `levels` | array of level names; adds a picker, the choice is in `api.level` |
| `controls` | on-screen buttons: `{ type: 'boost' }` or `{ id, label, primary }` |
| `touchOnlyControls` | hide the on-screen buttons when there is a mouse |
| `quietLoss` | no sound when the last life goes, no game-over sound |
| `silentHits` | no sound on any hit |
| `silent` | the game makes no sound at all; the sound buttons are removed |

`window.NVG_ALL_GAMES` sets where the "All games" button goes (default: natvernier.com/play).

## The game object

```js
{
  init(api), reset(api), start(api),        // reset is required
  update(dt, api),                          // required; dt in seconds, only while playing
  render(api),                              // required; every frame
  resize(api), blur(api),
  key(event, isDown, api), pointer(type, x, y, api, event), control(id, isDown, api)
}
```

## The `api`

`ctx`, `canvas`, `w`, `h`, `dpr`, `inset` (`top`/`bottom` space taken by the HUD and controls), `level`, `content`, `touch`, `reduced`,
`playing`, `state`, `lives`, `invuln`, `score`,
`c(name)` (a theme colour: `bg`, `ink`, `ink-2`, `verve`, `player`, `good-bg` …), `font(weight, px, 'display'?)`,
`addScore(n)`, `setStat(text)`, `setFuel(percent)`, `toast(text, ms?)`, `sound(name)`, `vibrate(ms)`,
`hit()` (lose a life, with a short invulnerability), `heal()`, `over()`, `visible()` (false during the hit blink).

## Theme and sound

Light/dark follows the device until the player picks one (`localStorage` `nv-theme`). Sound is off until the player turns it on, for the session. On a page that also runs the [theme + sound pill](../interactions/theme-sound-pill/), the core uses that shared setting instead (`window.NV`).

# Runner · Business As Usual

An endless runner through a workday. Collect the good bits (a cancelled meeting gives a life back), jump or duck the bad ones.

**Play:** [natvernier.github.io/playground/games/runner](https://natvernier.github.io/playground/games/runner/) · on the site: [natvernier.com/runner](https://www.natvernier.com/runner)

## Controls

- **Keyboard:** Space or ↑ to jump (up to 3×, hold to float), ↓ to duck
- **Touch:** jump and duck buttons
- **Esc** or **P** pauses, **R** restarts

## Notes

Three speeds on the start and pause sheets: slow, normal, fast. The setting scales the game clock, so jump arcs stay proportional, and it is remembered. Losing the last life is silent.

## Files

- `index.html` loads the shared [core](../../core/) and the two files below
- `content.js` the `good` and `bad` workday items. Edit it freely.
- `game.js` the game: `reset`, `update`, `render` and the input hooks, handed to `NVG.boot()`
- `runner.css` the speed control

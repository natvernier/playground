# Arcade · What LinkedIn feels like

Steer a small ship through a storm of AI buzzwords that home in on you. Boost through gaps. The longer you last, the faster the words come.

**Play:** [natvernier.github.io/playground/games/arcade](https://natvernier.github.io/playground/games/arcade/) · on the site: [natvernier.com/arcade](https://www.natvernier.com/arcade)

## Controls

- **Keyboard:** arrow keys or WASD to move, Space to boost
- **Touch:** tap where you want to go, the boost button bursts
- **Esc** or **P** pauses, **R** restarts

## Notes

Boost uses fuel, which refills while you cruise. Five levels, each spawns faster. Losing the last life is silent.

## Files

- `index.html` loads the shared [core](../../core/) and the two files below
- `content.js` the buzzword list (`words`). Edit it freely.
- `game.js` the game: `reset`, `update`, `render` and the input hooks, handed to `NVG.boot()`

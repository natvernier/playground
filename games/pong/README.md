# Pong · What the AI Jargon

You against the computer. Every ball you return reveals an AI term and its definition, at three levels from beginner to pro.

**Play:** [natvernier.github.io/playground/games/pong](https://natvernier.github.io/playground/games/pong/) · on the site: [natvernier.com/pong](https://www.natvernier.com/pong)

## Controls

- **Keyboard:** ↑ ↓ or W S on wide screens, ← → or A D on tall ones; or drag with the mouse
- **Touch:** drag your paddle with one finger
- **Esc** or **P** pauses, **R** restarts

## Notes

The computer never misses. It varies where on its paddle it takes the ball, which gives each return its angle. Your score is your rally. The game is silent.

## Files

- `index.html` loads the shared [core](../../core/) and the two files below
- `content.js` the glossary, three `levels` of `[term, definition]`. Edit it freely.
- `game.js` the game: `reset`, `update`, `render` and the input hooks, handed to `NVG.boot()`

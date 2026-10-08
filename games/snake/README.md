# Snake · AI Is Eating Our Jobs

Every job on the board has one highlighted letter. Eat the letter and the job is gone. Two to four jobs are on the board at once.

**Play:** [natvernier.github.io/playground/games/snake](https://natvernier.github.io/playground/games/snake/) · on the site: [natvernier.com/snake](https://www.natvernier.com/snake)

## Controls

- **Keyboard:** arrow keys or WASD to turn
- **Touch:** swipe to turn
- **Esc** or **P** pauses, **R** restarts

## Notes

Each letter makes the snake longer and faster. Crashes are silent; eating a letter makes the sound.

## Files

- `index.html` loads the shared [core](../../core/) and the two files below
- `content.js` the list of `jobs`. Edit it freely.
- `game.js` the game: `reset`, `update`, `render` and the input hooks, handed to `NVG.boot()`

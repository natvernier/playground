# Playground

Games and interaction pieces from [natvernier.com](https://www.natvernier.com), by Nathalie Vernier.
Vanilla JavaScript, no frameworks, no build step. Every piece works in light and dark, with keyboard and touch, and respects `prefers-reduced-motion`.

**Live gallery:** https://natvernier.github.io/playground/

## What's inside

| | | |
|---|---|---|
| **Games** | | |
| [Arcade · What LinkedIn feels like](games/arcade/) | Dodge the AI buzzwords before they catch you | [play](https://natvernier.github.io/playground/games/arcade/) |
| [Runner · Business As Usual](games/runner/) | Collect the good bits of a workday, jump the bad ones | [play](https://natvernier.github.io/playground/games/runner/) |
| [Snake · AI Is Eating Our Jobs](games/snake/) | Eat the highlighted letter inside each job | [play](https://natvernier.github.io/playground/games/snake/) |
| [Pong · What the AI Jargon](games/pong/) | Every return reveals an AI term and what it means | [play](https://natvernier.github.io/playground/games/pong/) |
| **Interactions** | | |
| [Theme + sound pill](interactions/theme-sound-pill/) | One switch for light, dark and sound, shared by every page | [see it](https://natvernier.github.io/playground/interactions/theme-sound-pill/) |
| [Jargon flythrough](interactions/jargon-flythrough/) | Words fly past the camera; a warm light follows the cursor | [see it](https://natvernier.github.io/playground/interactions/jargon-flythrough/) |

## Layout

```
core/            the shared game engine (nvg-core.js) and its styles (nvg.css)
games/<name>/    index.html + content.js (the words) + game.js (the game)
interactions/    standalone pieces, each with its own demo page
index.html       the gallery
```

The four games share one engine. A game is an object with `reset`, `update` and `render` (plus optional input hooks), handed to `NVG.boot(config)`. The engine supplies the start, pause and game-over sheets, the HUD, three lives, sound, light/dark and the main loop. See [core/README.md](core/README.md).

## Run it locally

Any static file server works, for example:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

Opening the files straight from disk also works for the games.

## Change the words

Each game's text lives in its `content.js`: the buzzwords, the workday items, the jobs, the AI glossary. Edit the lists; nothing else needs to change.

## Licence

The code is MIT licensed, see [LICENSE](LICENSE).

Not covered by the licence:
- **Sound files.** The games and the pill demo load a few short sounds from the natvernier.com CDN. They are not included in this repository.
- **Brand typefaces.** TT Barrels and Neue Hans Kendrick are commercial fonts and are not included. The CSS uses them if they are installed and otherwise falls back to [Newsreader](https://fonts.google.com/specimen/Newsreader) and [Outfit](https://fonts.google.com/specimen/Outfit) from Google Fonts.

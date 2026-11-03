# 404s

A library of 404 pages, one story each, added over the years. Every one is a single HTML file you can drop into a site as its "page not found": no framework, no build step, light and dark, keyboard and touch, reduced motion respected.

**See them:** [in the gallery](https://natvernier.github.io/playground/#four-oh-fours) · this repository's own 404 is the newest entry: try [any missing page](https://natvernier.github.io/playground/this-page-does-not-exist).

| No. | Added | Story | |
|---|---|---|---|
| 001 | Nov 2026 | [Ask the AI](ask-the-ai/) · An AI was very sure this page exists. Type anything; it answers at once, politely, and wrong about the missing page every time. | [see it](https://natvernier.github.io/playground/404/ask-the-ai/) |

## Use one as your 404

Each entry is one `index.html`. Copy it, set your own pages in the `CONFIG` block at the top of its script, and serve it as your error page:

- **GitHub Pages:** save it as `404.html` in the root of the published branch.
- **Netlify, Cloudflare Pages, Vercel (static):** save it as `404.html` in the output folder.
- **nginx:** `error_page 404 /404.html;`
- **Apache:** `ErrorDocument 404 /404.html`
- **Webflow and other site builders:** paste the `<style>`, the markup inside `<body>` and the `<script>` into an embed on the 404 page. If the builder places invisible layers over the page, give the content `position:relative; z-index:1`.

Make sure the server still answers with status 404, so search engines do not index the page.

## Adding to the library

One folder per story: `404/<name>/index.html` plus a short `README.md`. The page tells a story in one screen, works without anything else from this repository, and keeps a clear way back home. Add a row to the table above with the next number.

## Licence

MIT, like the rest of the [playground](../). The brand typefaces are not included; the pages fall back to Newsreader and Outfit.

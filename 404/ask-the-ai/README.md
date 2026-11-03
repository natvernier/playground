# 404 · Ask the AI

An AI was very sure this page exists. The visitor can ask it anything. It answers at once, politely and with total confidence: wrong about the missing page every time, right about every page that really exists.

**See it:** [natvernier.github.io/playground/404/ask-the-ai](https://natvernier.github.io/playground/404/ask-the-ai/) · live as the 404 of [natvernier.com](https://www.natvernier.com/this-page-does-not-exist)

## What it does

- **A chat that types back.** Three typing dots, then an answer. Suggestions under the stream for visitors who would rather click than type.
- **Confidently wrong.** Asked where the page is, it invents a link (`your-site/final-final-v7`). Click one and it apologises and invents the next. Push back and it agrees with you, then repeats itself.
- **Right about what exists.** Ask for home, or for a page you list in `CONFIG`, and it links the real thing. After five questions it lets slip, once, which pages really exist.
- **No model, no server.** The "AI" is a list of patterns and shuffled answers. Nothing a visitor types leaves the browser, so there is nothing to add to a privacy policy and nothing to pay for.
- **Accessible.** The stream is an ARIA live region, every control works by keyboard, focus is visible, and with reduced motion the messages appear without sliding in.

## Make it yours

Everything site-specific sits in `CONFIG` at the top of the script:

```js
var CONFIG = {
  home: "/",                       // where "Back to something real" and "home" go
  homeLabel: "the home page",      // how the AI names that link
  pages: [                         // real pages the AI may admit exist
    { label: "the blog",  href: "/blog",    match: "\\b(blog|posts?|articles?)\\b" },
    { label: "contact",   href: "/contact", match: "\\b(contact|email|mail)\\b" }
  ]
};
```

`match` is a regular expression, tested case-insensitively against what the visitor types. Leave `pages` empty and the AI only admits that home exists.

The answers live in the `I` list (one pool per kind of question) and in `fallback`. In an answer, `{fake}` becomes an invented link, `{home}` the home link, `{page0}`, `{page1}` … the pages from `CONFIG`, `{pages}` all of them, and `{fn:…}` a footnote line.

Colours are the custom properties at the top of the CSS. The page is dark by default, follows the device setting, and respects `html[data-theme="light"|"dark"]` if your site sets it; the small switch top right overrides both.

## Licence

MIT. Fonts: TT Barrels and Neue Hans Kendrick if installed, otherwise Newsreader and Outfit from Google Fonts.

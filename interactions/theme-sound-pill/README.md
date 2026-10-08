# Theme + sound pill

One switch for light, dark and sound, shared by every page of a site. This is the pill in the top right corner of natvernier.com.

**See it:** [natvernier.github.io/playground/interactions/theme-sound-pill](https://natvernier.github.io/playground/interactions/theme-sound-pill/)

## What it does

- **Light/dark.** The first visit follows the device setting. A choice made in the pill is remembered (`localStorage` `nv-theme`).
- **Sound.** Off by default, one setting for the whole visit (`sessionStorage` `nv-sound`). While it is off, every `<audio>` element and every `new Audio()` stays silent. The gate sits on `HTMLMediaElement.prototype.play`, so no other script on the page has to know about the setting.
- **Native theme.** A page can be designed dark or light (`<html data-native="dark">`). When the visitor's theme differs from the page's native one, the script also writes `html[data-nv="l"]` or `html[data-nv="d"]`, so your CSS can target only the inverted case.
- **Events.** `nv:theme` and `nv:sound` fire on `window` whenever something changes.
- **Phones.** The pill stays inside the visible screen even when a wide element widens the page.

## Use

```html
<html data-native="dark">
<head>
  <script src="nv-prefs.js"></script>          <!-- first, before anything that plays sound -->
  <link rel="stylesheet" href="nv-prefs.css">
</head>
```

```css
:root                    { --bg: #f4f4f4; --ink: #2b3234; }
:root[data-theme="dark"] { --bg: #2b3234; --ink: #f4f4f4; }
```

## API

`NV.theme()`, `NV.setTheme('light' | 'dark')`, `NV.sound()`, `NV.setSound(true | false)`, `NV.native`.
Add `data-nv-no-pill` to `<html>` to keep the API without the pill, for pages that bring their own controls. The games use this API when it is present.

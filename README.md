# Media Inverter

Microsoft Edge (Chromium) extension that inverts the colors of images and videos via a context menu item. (It will also work in other Chromium-based browsers that support Manifest V3, such as Chrome or Brave.)

## Features

- Right-click directly on any image or video to invert or revert it.
- Right-click near media (for example inside a container) and the extension attempts to locate nearby `<img>` / `<video>` elements and toggle them.
- Each media element toggles independently; state is stored inline via a style attribute filter.

## How It Works

1. A context menu item (“Invert image / video”) is registered in the background script.
2. When you select it, a message is sent to the active tab.
3. The content script:
   - Uses the most recent right‑clicked DOM node as a starting point.
   - If that node itself is `<img>` or `<video>`, only that element is toggled.
   - Otherwise, it climbs ancestors; at each ancestor level it breadth‑first searches descendants (depth‑limited) for media.
   - The first set of media it finds is toggled (add or remove `filter: invert(1) hue-rotate(180deg);`).

## Install (Unpacked)

1. Clone or download this repository.
2. Open:
   - Edge: `edge://extensions`
   - Chrome: `chrome://extensions`
3. Enable "Developer mode".
4. Click “Load unpacked” and select the repository folder.
5. Right-click any image or video and choose “`Invert image` / video”.

## File Overview

- `manifest.json` – Manifest V3 definition.
- `background.js` – Registers and handles the context menu; relays toggle commands to the content script.
- `content.js` – Locates and toggles media elements relative to the last right‑click target.
- `icons/` – Placeholder icons (replace with proper PNG artwork before distribution).
- `LICENSE` – MIT License.

## Icon Placeholders

Currently minimal placeholder PNGs (or placeholders to be added). Replace with your own assets (16, 32, 48, 128 px) before publishing to the Edge Add-ons store.

## Possible Enhancements

- Options page to adjust media element search parameters; perhaps even per domain/page.
- Context menu or toolbar button to invert all media on the page.
- Currently, we use (potentially destructive) `style` attribute mutations for simplicity. Consider adding a CSS class and a `<style>` block to perform the inversion instead.

## Attribution / Origins

This project was inspired by the Firefox extension "Invert Image":

- Firefox Add-on: <https://addons.mozilla.org/en-US/firefox/addon/invert-image/>
- Source Repository: <https://github.com/vycb/InvertImage>

## License

MIT – see `LICENSE`.

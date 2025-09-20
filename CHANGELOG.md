# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Context menu action "Invert image / video / SVG" to toggle color inversion.
- Support for images (`<img>`), videos (`<video>`), and inline SVG (`<svg>`).
- Ability to right‑click near media (not only directly on it); the content script locates nearby media via a breadth‑first, depth‑limited DOM search starting from the last right‑clicked node.
- Per‑element toggle using CSS filters (`filter: invert(1) hue-rotate(180deg);`) so repeated use inverts/reverts the same element(s).
- Works on Chromium‑based browsers that support Manifest V3 (e.g., Microsoft Edge, Chrome, Brave).

<!--
When cutting the first release:
- Replace [Unreleased] with the version and date, e.g., `## [0.1.0] - 2025-09-20`.
- Optionally add comparison links like:
  [Unreleased]: https://github.com/johngibbs/MediaInverter/compare/v0.1.0...HEAD
  [0.1.0]: https://github.com/johngibbs/MediaInverter/releases/tag/v0.1.0
-->

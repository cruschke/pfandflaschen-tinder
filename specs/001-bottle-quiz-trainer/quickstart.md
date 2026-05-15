# Quickstart: Bottle Quiz Trainer

**Branch**: `001-bottle-quiz-trainer` | **Date**: 2026-05-15

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20 | Bootstrap script, test runner |
| npm | ≥ 10 | Dev dependency management |
| A modern browser | Chrome 112+, Safari 16+, Firefox 113+ | Running the app |

---

## 1. Install dev dependencies

```bash
make install
```

This installs Playwright and `sharp` (WebP conversion). These are development-only tools;
nothing in `index.html`, `css/`, `js/`, or `assets/` depends on them.

---

## 2. Bootstrap the image library

The quiz requires images in `assets/images/` and a metadata manifest at
`assets/data/bottles.json`.

```bash
make bootstrap
```

The script reads `scripts/image-sources.json`, downloads each image, converts it to WebP, and
appends new entries to `bottles.json`. Already-present images (matched by `sourceUrl`) are
skipped automatically — the script is safe to run repeatedly.

To add more images later, add entries to `scripts/image-sources.json` and run `make bootstrap`
again.

---

## 3. Run the app locally

The app is a static site with no build step. Serve it from the repository root:

```bash
make serve
```

Then open `http://localhost:3000` in your browser.

Alternatively, open `index.html` directly in your browser (`file://` protocol). Note: some
browsers restrict `fetch()` on `file://` — if `bottles.json` fails to load, use `make serve`.

---

## 4. Run tests

```bash
# Run all tests (unit + E2E)
make test

# Unit tests only (Node.js built-in test runner)
make test-unit

# E2E tests only (Playwright, requires a running local server)
make test-e2e
```

Playwright will automatically start and stop a local server for E2E tests. No manual server
setup needed.

---

## 5. Common Makefile targets

```
make install      Install dev dependencies (npm install)
make serve        Serve the app locally via npx serve
make bootstrap    Download images, convert to WebP, update bottles.json
make test         Run all tests (unit + E2E)
make test-unit    Run Node.js unit tests only
make test-e2e     Run Playwright E2E tests only
make clean        Remove downloaded images and reset bottles.json to empty
```

---

## 5. Deploy to GitHub Pages

Push the repository to GitHub and enable Pages from the repository settings (source: root of
`main` branch). Only the following files/directories are part of the deployed site:

```
index.html
css/
js/
assets/
```

Everything else (`tests/`, `scripts/`, `specs/`, `package.json`, etc.) is present in the
repository but not served as part of the web app.

---

## Project layout at a glance

```
index.html              App entry point
css/styles.css          All styles (CSS custom properties = design tokens)
js/app.js               Screen router (home / quiz / result)
js/quiz.js              Random item selection, answer evaluation, scoring
js/swipe.js             Drag gesture detection (PointerEvents API) + card animation
js/scoreboard.js        Scoreboard render and sort
js/storage.js           localStorage read/write for Player records
js/data.js              Loads + validates bottles.json
assets/images/          Bundled WebP bottle images
assets/data/bottles.json  Image metadata manifest
scripts/                Developer tools (bootstrap, not deployed)
tests/                  Playwright E2E + Node unit tests (not deployed)
specs/                  Feature specs and plans (not deployed)
```

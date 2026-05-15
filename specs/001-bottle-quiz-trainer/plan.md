# Implementation Plan: Bottle Quiz Trainer

**Branch**: `001-bottle-quiz-trainer` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-bottle-quiz-trainer/spec.md`

## Summary

Build a single-page web application hosted on GitHub Pages that trains users to identify
returnable (Pfand) vs. non-returnable German bottles and jars. Players swipe left (returnable)
or right (non-returnable) on 10 randomly-selected images per round, receive immediate feedback
(green flash for correct, blocking educational panel for incorrect), and their best score is
persisted to a local scoreboard. The implementation uses Vanilla HTML/CSS/JS with no build step;
data is stored in localStorage; images are bundled as WebP files with a JSON metadata manifest
that is incrementally bootstrapped via a repeatable Node.js script.

## Technical Context

**Language/Version**: HTML5 / CSS3 / JavaScript (ES2022, vanilla — no framework, no build step)

**Primary Dependencies**: None at runtime. Development tooling: Node.js ≥ 20 (test runner +
bootstrapping scripts), Playwright (E2E tests), `sharp` npm package (WebP conversion in
bootstrap script).

**Storage**: Browser `localStorage` — persists Player records across sessions; no backend, no
cross-device sync in v1.

**Testing**: Playwright (E2E acceptance tests) + Node.js built-in `node:test` runner (unit tests
for pure JS business-logic modules). The deployed app has no build step; test tooling runs in
Node.js separately. All dev tasks are wrapped in a `Makefile` (`make test`, `make test-unit`,
`make test-e2e`, `make serve`, `make bootstrap`).

**Target Platform**: Modern browsers (Chrome 112+, Safari 16+, Firefox 113+); mobile-first
touch; served from GitHub Pages as static files.

**Project Type**: Single-page web application (static, no backend)

**Performance Goals**: TTI ≤ 3 s on mid-range device / 4G (Constitution IV); swipe animation
60 fps sustained; no frame drops > 16 ms during card transitions.

**Constraints**: Zero external API calls at runtime; fully offline-capable after first load; no
build step for the deployed app artefact; total JS ≤ 250 KB unminified; images in WebP ≤ 100 KB
each.

**Scale/Scope**: Single device / single browser; up to ~50 bundled images; localStorage holds up
to ~100 player records without issue.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | PASS | Vanilla JS with clear module boundaries enforces single-responsibility by design; naming and complexity ≤ 10 rules apply to all JS modules. |
| II. Test-First Development | PASS | E2E coverage via Playwright for all P1/P2 user stories; unit tests via `node:test` for quiz logic, storage, and data-loading modules. Test tooling is Node.js-based and separate from the deployed static app — no build step contradiction. |
| III. UX Consistency | PASS | Design tokens in CSS custom properties; all states (empty scoreboard, loading image, error) implemented per spec; all copy in German; swipe card and buttons labelled for WCAG 2.1 AA. |
| IV. Performance | PASS | Vanilla JS is inherently ≤ 250 KB; images bootstrapped as WebP via `sharp`; `loading="lazy"` on img elements; CSS `will-change: transform` for GPU-accelerated swipe. |

No violations. Complexity Tracking table left empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-bottle-quiz-trainer/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── bottles-json-schema.md   # BottleItem manifest contract
│   └── localstorage-schema.md   # Player persistence contract
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
index.html                      # SPA shell — single HTML entry point
css/
└── styles.css                  # All styles; CSS custom properties as design tokens
js/
├── app.js                      # App init, screen routing (home / quiz / result)
├── quiz.js                     # Quiz logic: random item selection, answer evaluation, scoring
├── swipe.js                    # PointerEvents-based drag detection and card animation
├── scoreboard.js               # Scoreboard rendering, sort, and DOM update
├── storage.js                  # localStorage read/write abstraction for Player records
└── data.js                     # Loads and validates bottles.json; exposes BottleItem array
assets/
├── images/                     # Bundled WebP bottle/jar images
└── data/
    └── bottles.json            # Image metadata manifest (bootstrapped, deduplicated)
scripts/
└── bootstrap-images.js         # Node.js: download images, convert to WebP, update manifest
tests/
├── e2e/
│   ├── quiz-flow.spec.js       # Core quiz loop (US1), feedback (US3), replay (US4)
│   └── scoreboard.spec.js      # Scoreboard persistence and ranking (US2)
└── unit/
    ├── quiz.test.js            # Item selection, scoring, randomisation logic
    ├── storage.test.js         # localStorage serialisation/deserialisation and name matching
    └── data.test.js            # bottles.json validation and deduplication logic
package.json                    # Dev tooling only: Playwright, sharp, test scripts
Makefile                        # Developer task runner: install, serve, bootstrap, test, clean
playwright.config.js            # Playwright config (serves via npx serve or http-server)
```

**Structure Decision**: Single flat project at repository root. No backend, no separate
frontend build pipeline. All deployed artefacts (`index.html`, `css/`, `js/`, `assets/`) live
at the root and are served directly by GitHub Pages. The `tests/`, `scripts/`, `specs/`, and
`package.json` directories are development-only and not part of the deployed site.

## Complexity Tracking

> No constitution violations detected. Table left empty.

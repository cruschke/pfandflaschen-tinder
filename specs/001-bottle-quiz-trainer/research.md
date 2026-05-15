# Research: Bottle Quiz Trainer

**Branch**: `001-bottle-quiz-trainer` | **Date**: 2026-05-15

## 1. Testing Strategy for Vanilla JS Static App

**Decision**: Playwright (E2E) + Node.js built-in `node:test` (unit)

**Rationale**: The constitution mandates TDD with real storage (no mocks), E2E for acceptance
scenarios, and ≥ 80% branch coverage for business logic. The "no build step" constraint applies
only to the *deployed app*, not development tooling. Node.js test runner and Playwright are
independent of the app's runtime and can test the logic and browser behaviour separately.

- **Playwright** drives a real browser against a locally-served static site (`make serve`).
  Supports touch simulation via PointerEvents (`page.touchscreen.tap`, `page.mouse.move`),
  enabling realistic swipe-gesture testing. Covers US1–US4 acceptance scenarios end-to-end.
- **Node.js `node:test`** (built-in since Node 18, stable in Node 20) runs pure JS module
  tests without any extra dependency. `quiz.js`, `storage.js`, and `data.js` are designed as
  ES module files that can be imported directly in Node (no DOM dependency in business logic).
  JSDOM is not needed because business-logic modules are kept DOM-free.
- All dev tasks are invoked via `make` targets (`make test`, `make test-unit`, `make test-e2e`,
  `make serve`, `make bootstrap`, `make install`) defined in the repository `Makefile`.

**Alternatives considered**:
- *Vitest*: Excellent DX but requires a build/bundle step — ruled out by the no-build constraint.
- *Jest*: Mature but requires Babel transform for ES modules — unnecessary overhead.
- *Cypress*: Good E2E but heavier than Playwright; no advantage here.

---

## 2. Swipe Gesture Implementation (Pure Vanilla JS)

**Decision**: Native PointerEvents API with CSS `transform: translateX() rotate()`, no library

**Rationale**: PointerEvents unify mouse and touch input in a single API, supported in all
target browsers (Chrome 55+, Safari 13+, Firefox 59+). Keeping it dependency-free honours the
zero-runtime-dependency constraint and avoids bundle size concerns.

**Implementation pattern**:
```javascript
// On pointerdown: record start position, remove CSS transition
// On pointermove: apply transform in real-time (no transition = follows finger)
//   translateX(dx) rotate(dx * 0.05deg) — subtle tilt reinforces direction
// On pointerup: evaluate threshold
//   if |dx| > SWIPE_THRESHOLD (80px or 25% card width): fire swipe event
//   else: spring back via CSS transition
```

- `will-change: transform` on the card element forces GPU layer, achieving 60 fps.
- `touch-action: none` on the card prevents browser scroll interference.
- Directional visual indicators (green "Pfand ✓" / red "Kein Pfand ✗" labels) overlay the
  card edges and fade in proportional to drag distance using `opacity: clamp(0, |dx|/80, 1)`.

**Velocity threshold**: Additionally trigger swipe if pointer velocity > 0.5 px/ms at release,
even if threshold not met — matches iOS/Android gesture feel.

**Alternatives considered**:
- *Hammer.js*: Well-known but 7 KB min+gzip, unmaintained since 2019 — ruled out.
- *TouchEvents API*: Less consistent across desktop/trackpad; PointerEvents is the modern
  successor.

---

## 3. Image Bootstrapping: Download + WebP Conversion

**Decision**: Node.js script using `sharp` for WebP conversion; deduplication by `sourceUrl`

**Rationale**: `sharp` is the de-facto Node.js image processing library (wraps libvips),
handles WebP encoding at high quality, and can be installed as a dev dependency without
affecting the deployed app. The bootstrapping script is a developer tool, not a runtime dep.

**Script behaviour** (`scripts/bootstrap-images.js`):
1. Reads a local `scripts/image-sources.json` — a curated list of `{ sourceUrl, metadata }`.
2. For each entry, checks `assets/data/bottles.json` for an existing item with the same
   `sourceUrl`. If found → skip (deduplication).
3. Downloads the image (Node.js `fetch`, available since Node 18).
4. Converts to WebP at quality 80 via `sharp`; resizes to max 800 × 800 px (preserves aspect).
5. Saves to `assets/images/{id}.webp`.
6. Appends the new `BottleItem` entry to `assets/data/bottles.json`, incrementing `version`.

**Image sources** (for initial 20+ item library):
- Wikimedia Commons — direct file download via `commons.wikimedia.org/wiki/Special:FilePath`
- Pixabay — CC0 images downloadable without API key via direct URL

**Alternatives considered**:
- *`cwebp` CLI (Google)*: Available via system package manager but not portable across
  environments; `sharp` is more consistent as a npm dev dep.
- *Manual conversion*: Too slow for incremental bootstrapping.

---

## 4. CSS Card Swipe Animation (60 fps)

**Decision**: CSS `transform` + `transition` with JavaScript toggling; GPU-composited layer

**Pattern**:
```css
.quiz-card {
  will-change: transform;      /* GPU layer allocation */
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.quiz-card.dragging {
  transition: none;            /* JS removes transition while dragging */
}
.quiz-card.dismissing {
  transition: transform 0.35s ease-in, opacity 0.35s ease-in;
}
```

- During drag: JS adds `.dragging` class → removes transition → real-time transform follows
  pointer.
- On valid swipe: JS adds `.dismissing` class → card flies off screen.
- On cancel: JS removes `.dragging` → CSS transition springs card back to origin.
- `opacity` fades to 0 during dismiss for a natural exit.

No `top`/`left`/`margin` animation — only `transform` and `opacity` are compositor-only and
guaranteed 60 fps.

---

## 5. localStorage Schema and Player Name Matching

**Decision**: Single key `pfandtinder_v1_players` → JSON array of Player objects; canonical
name = `displayName.trim().toLowerCase()`

**Rationale**: Prefixing with `pfandtinder_v1_` avoids collisions with other apps on the same
GitHub Pages domain (`username.github.io`). Versioning the key (`v1_`) allows a clean migration
if the schema changes in a future release without corrupting existing data.

**Name matching logic**:
```javascript
function canonicalName(raw) {
  return raw.trim().toLowerCase();
}
// On quiz completion: find existing player by canonical name
const existing = players.find(p => canonicalName(p.displayName) === canonicalName(input));
if (existing) {
  existing.bestScore = Math.max(existing.bestScore, newScore);
  existing.attemptCount += 1;
} else {
  players.push({ id: canonicalName(input), displayName: input.trim(), bestScore: newScore, attemptCount: 1 });
}
```

**Storage limit**: A Player record is ~100 bytes JSON. 100 players = 10 KB — well within the
5 MB localStorage limit.

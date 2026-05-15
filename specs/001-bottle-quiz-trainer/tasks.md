# Tasks: Bottle Quiz Trainer

**Branch**: `001-bottle-quiz-trainer` | **Input**: Design documents from `specs/001-bottle-quiz-trainer/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**TDD**: Per constitution Principle II, test tasks are MANDATORY and MUST be written before implementation. Each test task must be confirmed failing (RED) before its implementation task begins.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Paths follow the single static project layout defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project skeleton, dev toolchain, and static site shell. No user story work begins until this phase is complete.

- [ ] T001 Create full directory structure: `js/`, `css/`, `assets/images/`, `assets/data/`, `scripts/`, `tests/e2e/`, `tests/unit/` and empty placeholder files for all modules listed in plan.md
- [ ] T002 Create `package.json` with dev dependencies: `@playwright/test`, `sharp`, and `serve` (local static server for tests)
- [ ] T003 [P] Create `Makefile` with targets: `install`, `serve`, `bootstrap`, `test`, `test-unit`, `test-e2e`, `clean`
- [ ] T004 [P] Create `playwright.config.js` configured to serve the repo root via `npx serve` on a fixed port (e.g. 3000) and target Chrome, Safari (WebKit), and Firefox
- [ ] T005 [P] Create `index.html` SPA shell: `<head>` with charset/viewport/title, links to `css/styles.css`, three hidden `<section>` elements (`#screen-home`, `#screen-quiz`, `#screen-result`), and `<script type="module" src="js/app.js">`
- [ ] T006 [P] Create `css/styles.css` with CSS custom properties (design tokens): color palette (background, surface, primary-green, primary-red, text, muted), spacing scale, border-radius scale, and system sans-serif font stack per Apple HIG

**Checkpoint**: `make install` succeeds; `make serve` serves index.html at localhost:3000

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and storage modules used by every user story. Must be complete before any story phase begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests — Write First (RED)

- [ ] T007 [P] Write failing unit tests for `js/storage.js` in `tests/unit/storage.test.js`: test `loadPlayers()` returns `[]` on missing/corrupt key; `upsertPlayer()` creates new record; `upsertPlayer()` updates `bestScore` only when higher; `upsertPlayer()` increments `attemptCount` every call; `findPlayer()` matches case-insensitively and trims whitespace; `displayName` preserved from first entry
- [ ] T008 [P] Write failing unit tests for `js/data.js` in `tests/unit/data.test.js`: test `loadBottles()` throws on fewer than 20 items; throws on missing required fields; throws on duplicate `id` or `sourceUrl`; returns valid BottleItem array when manifest is well-formed; fixture file `assets/data/bottles-fixture.json` created with 5 valid items (3 returnable, 2 non-returnable) for use in tests

### Implementation

- [ ] T009 Implement `js/storage.js` — `canonicalName(raw)`, `loadPlayers()`, `savePlayers(players)`, `findPlayer(rawName)`, `upsertPlayer(rawName, score)` per localStorage contract in `contracts/localstorage-schema.md` (run T007 tests first; confirm RED before coding)
- [ ] T010 Implement `js/data.js` — `loadBottles()` fetches `assets/data/bottles.json`, validates all fields and constraints per `contracts/bottles-json-schema.md`, returns frozen BottleItem array; uses fixture path when `DATA_FIXTURE` env flag set (run T008 tests first; confirm RED before coding)

**Checkpoint**: `make test-unit` passes for storage.js and data.js

---

## Phase 3: User Story 6 — Bootstrap Quiz with Public Images (Priority: P1)

**Goal**: Populate `assets/images/` and `assets/data/bottles.json` with ≥20 CC-licensed German bottle/jar images so the quiz has real content.

**Independent Test**: Run `make bootstrap`; verify `assets/data/bottles.json` contains ≥20 items (≥10 returnable, ≥10 non-returnable) across all `containerType` values; verify each `filename` has a corresponding `.webp` file; run `make bootstrap` a second time and confirm item count does not increase (deduplication works).

### Tests — Write First (RED)

- [ ] T011 Write failing unit tests for bootstrap deduplication in `tests/unit/data.test.js`: test that `mergeItems(existing, incoming)` skips items whose `sourceUrl` already exists in `existing`; test that `id` and `filename` are generated correctly from brand+type slug; test that `version` patch number increments on each merge

### Implementation

- [ ] T012 [US6] Create `scripts/image-sources.json` with ≥20 curated entries covering: German beer bottles (returnable), plastic PET bottles with/without Pfand marking, wine bottles (non-returnable), cider bottles 540ml (non-returnable), screw-top jars (Nutella, jam — non-returnable), glass recycling containers (non-returnable); each entry includes `sourceUrl` (Wikimedia Commons or Pixabay CC0), `containerType`, `brand`, `description` (German), `isReturnable`, `hints` (German), `license`, `attribution`
- [ ] T013 [US6] Implement `scripts/bootstrap-images.js` — reads `scripts/image-sources.json`, for each entry: checks `assets/data/bottles.json` for existing `sourceUrl` (skip if found), downloads image via Node.js `fetch`, converts to WebP at quality 80 / max 800×800px via `sharp`, saves to `assets/images/{id}.webp`, appends BottleItem to manifest, increments patch version; writes updated `bottles.json` atomically
- [ ] T014 [US6] Run `make bootstrap` to populate `assets/images/` and `assets/data/bottles.json` with the initial image library; verify output manually

**Checkpoint**: ≥20 WebP images present; `bottles.json` valid per schema; second `make bootstrap` run is idempotent

---

## Phase 4: User Story 1 — Player Takes Initial Quiz (Priority: P1) 🎯 MVP

**Goal**: A player enters their name, completes a 10-item swipe quiz, sees their score, and is added to the scoreboard.

**Independent Test**: Enter a name → swipe all 10 items left or right → reach result screen with score → scoreboard shows the player's name and score.

### Tests — Write First (RED)

- [ ] T015 [P] [US1] Write failing unit tests for `js/quiz.js` in `tests/unit/quiz.test.js`: `selectItems(library, 10)` returns exactly 10 items; `selectItems` returns different subsets across calls (randomness); `evaluateAnswer(item, choice)` returns `true` when `choice === item.isReturnable`; `computeScore(answers)` counts correct answers 0–10
- [ ] T016 [P] [US1] Write failing E2E test for core quiz flow in `tests/e2e/quiz-flow.spec.js`: enter name "TestSpieler" → 10 swipe interactions → result screen shows "X von 10" → scoreboard entry present

### Implementation

- [ ] T017 [US1] Implement `js/quiz.js` — `selectItems(library, n)`, `evaluateAnswer(item, playerChoice)`, `computeScore(answers)`, `createRound(playerId, items)` (run T015; confirm RED before coding)
- [ ] T018 [US1] Implement `js/swipe.js` — PointerEvents (`pointerdown`/`pointermove`/`pointerup`) drag detection; real-time `translateX(dx) rotate(dx*0.05deg)` transform; swipe commit when `|dx| > 80px` OR pointer velocity `> 0.5px/ms`; spring-back on cancel; `will-change: transform` and `touch-action: none` on card element; fires `swipe` CustomEvent with `direction: 'left'|'right'`
- [ ] T019 [US1] Implement home screen in `#screen-home` (`index.html` + `css/styles.css`): German copy ("Dein Name:", "Quiz starten"), name `<input>` with trim/validate (non-empty), "Quiz starten" `<button>`, scoreboard panel placeholder; Apple HIG card layout, CSS design tokens throughout
- [ ] T020 [US1] Implement quiz screen in `#screen-quiz` (`index.html` + `css/styles.css`): bottle image `<img loading="lazy">` card, progress counter "3 / 10", left/right button fallbacks ("Pfand" / "Kein Pfand"), swipe area; card styled with rounded corners, shadow, generous whitespace
- [ ] T021 [US1] Implement result screen in `#screen-result` (`index.html` + `css/styles.css`): score display "Du hast X von 10 richtig!", "Nochmal spielen" and "Zur Startseite" buttons; German copy throughout
- [ ] T022 [US1] Implement `js/app.js` — screen router (`showScreen(id)`), quiz session lifecycle: load bottles → select 10 → render card → handle swipe event → advance or show feedback → on complete: upsertPlayer + showResult; name validation on home screen submit

**Checkpoint**: `make test` passes for US1 unit + E2E tests; full quiz loop playable in browser via `make serve`

---

## Phase 5: User Story 2 — Scoreboard Tracks All Players (Priority: P1)

**Goal**: Persistent scoreboard showing all players ranked by best score, visible on home and result screens.

**Independent Test**: Three players complete quizzes with varying scores → scoreboard shows all three sorted highest-first → same player completes second quiz with lower score → their scoreboard entry unchanged.

### Tests — Write First (RED)

- [ ] T023 [US2] Write failing E2E test for scoreboard in `tests/e2e/scoreboard.spec.js`: three players with scores 6, 9, 4 → scoreboard order is 9, 6, 4; same player scores 5 after 9 → still shows 9; empty state renders gracefully on first load

### Implementation

- [ ] T024 [US2] Implement `js/scoreboard.js` — `buildScoreboard(players)` sorts by `bestScore` DESC then `displayName` ASC; `renderScoreboard(container, players)` builds DOM list; exported `refresh(container)` calls `loadPlayers()` then `renderScoreboard`
- [ ] T025 [US2] Implement scoreboard panel in `index.html` + `css/styles.css`: `<section id="scoreboard">` embedded in home and result screens; ranked list rows with position, name, score; empty-state message "Noch keine Einträge" when no players; Apple HIG list style

**Checkpoint**: `make test` passes for US2 E2E tests; scoreboard visible and accurate on home + result screens

---

## Phase 6: User Story 3 — Learn from Mistakes (Priority: P2)

**Goal**: Wrong swipes trigger a blocking educational feedback panel with item-specific hints; correct swipes trigger a brief green confirmation.

**Independent Test**: Swipe incorrectly → feedback panel appears with hint text specific to that bottle type → panel stays until dismissed → next card appears; swipe correctly → green "Richtig!" flash → auto-advances after ~1 second.

### Tests — Write First (RED)

- [ ] T026 [US3] Write failing E2E tests for feedback in `tests/e2e/quiz-flow.spec.js`: wrong swipe → feedback panel visible; panel does not auto-advance (still visible after 2 seconds); dismiss tap → next card visible; correct swipe → green overlay visible → auto-advances within 1.5 seconds

### Implementation

- [ ] T027 [US3] Implement wrong-answer feedback panel in `index.html` + `css/styles.css`: `<div id="feedback-panel">` overlay on quiz card; shows `item.hints[0]` text, correct answer label, "Verstanden" dismiss button; styled with red accent, rounded card, blocking (no background interaction until dismissed)
- [ ] T028 [US3] Implement correct-answer confirmation in `index.html` + `css/styles.css`: `<div id="correct-flash">` overlay; green background, "Richtig! ✓" text; auto-dismiss via `setTimeout(~1000ms)` then advance to next card
- [ ] T029 [US3] Wire feedback logic in `js/app.js`: on incorrect swipe → show `#feedback-panel` with hint text from current BottleItem, bind "Verstanden" to advance; on correct swipe → show `#correct-flash`, `setTimeout` to advance

**Checkpoint**: `make test` passes for US3 E2E tests; feedback confirmed blocking in browser

---

## Phase 7: User Story 4 — Replay and Track Progress (Priority: P2)

**Goal**: Player can take the quiz again; best score is preserved and updated only on improvement.

**Independent Test**: Complete quiz with score 6 → return home → re-enter same name → complete second quiz with score 8 → scoreboard shows 8; complete third quiz with score 5 → scoreboard still shows 8.

### Tests — Write First (RED)

- [ ] T030 [US4] Write failing E2E test for replay in `tests/e2e/quiz-flow.spec.js`: same player completes two rounds → score updates only when second is higher; "Nochmal spielen" button resets quiz state correctly; player name pre-populated on replay

### Implementation

- [ ] T031 [US4] Implement replay flow in `js/app.js`: "Nochmal spielen" resets `currentRound` state, pre-fills name input with last player name, returns to home screen; "Zur Startseite" clears name input, returns to home screen; ensure mid-quiz browser refresh discards round (no state restoration)

**Checkpoint**: `make test` passes for US4 E2E tests; two-round replay verified in browser

---

## Phase 8: User Story 5 — Visual Feedback on Swipe (Priority: P3)

**Goal**: Directional overlay indicators appear while dragging, proportional to drag distance.

**Independent Test**: Start drag left → green "Pfand ✓" label fades in on left edge proportional to distance → release without threshold → springs back; drag right → red "Kein Pfand ✗" appears on right edge.

### Implementation

- [ ] T032 [US5] Implement directional overlay labels in `index.html` + `css/styles.css`: `<span class="indicator-left">Pfand ✓</span>` (green) and `<span class="indicator-right">Kein Pfand ✗</span>` (red) positioned at card edges; `opacity: 0` by default
- [ ] T033 [US5] Wire indicator opacity to drag distance in `js/swipe.js`: during `pointermove`, set `indicatorLeft.style.opacity = clamp(0, dx / -80, 1)` and `indicatorRight.style.opacity = clamp(0, dx / 80, 1)`; reset to 0 on spring-back or dismiss

**Checkpoint**: Visual indicators fade in/out smoothly during drag; no jank at 60 fps

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, final validation.

- [ ] T034 [P] Add WCAG 2.1 AA accessibility attributes throughout `index.html`: `aria-label` on swipe card image, `role="list"` on scoreboard, `aria-live="polite"` on score/feedback regions, keyboard focus management between screens
- [ ] T035 [P] Verify and enforce image performance in `css/styles.css` + `index.html`: `loading="lazy"` on all `<img>` elements; confirm all images in `assets/images/` are WebP ≤ 100 KB each (re-run `make bootstrap` with quality tuning if needed)
- [ ] T036 [P] Run Lighthouse audit via `make serve`: verify TTI ≤ 3 s, total JS ≤ 250 KB; fix any violations before marking complete
- [ ] T037 [P] Configure GitHub Pages: add `.nojekyll` file to repo root; verify `index.html`, `css/`, `js/`, `assets/` are at root and will be served correctly; document deployment step in `quickstart.md`
- [ ] T038 Run full test suite `make test` — all unit + E2E tests green; fix any regressions
- [ ] T039 [P] Validate `quickstart.md` end-to-end: follow every step in a clean shell, confirm `make install` → `make bootstrap` → `make serve` → `make test` all succeed without extra steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 — blocks all user stories
- **Phase 3 (US6 Bootstrap)**: Requires Phase 2 — must run before US1 (quiz needs image content)
- **Phase 4 (US1 Quiz)**: Requires Phase 3 — core gameplay loop
- **Phase 5 (US2 Scoreboard)**: Requires Phase 2 — can run in parallel with Phase 4 (separate files)
- **Phase 6 (US3 Feedback)**: Requires Phase 4 — extends quiz answer handling
- **Phase 7 (US4 Replay)**: Requires Phase 4 + Phase 5 — extends quiz completion flow
- **Phase 8 (US5 Visual)**: Requires Phase 4 — extends swipe.js only
- **Phase 9 (Polish)**: Requires all story phases complete

### User Story Dependencies

- **US6 (P1)**: After Foundational — no story dependencies; prerequisite for US1
- **US1 (P1)**: After US6 — core loop; prerequisite for US3, US4, US5
- **US2 (P1)**: After Foundational — independent of US1 (uses storage.js only); integrates with US1 result screen
- **US3 (P2)**: After US1 — extends answer handling in app.js
- **US4 (P2)**: After US1 + US2 — extends replay flow
- **US5 (P3)**: After US1 — extends swipe.js only; fully independent of US2–US4

### Within Each Phase: TDD Order

1. Write test(s) — confirm FAILING (RED)
2. Implement module — make tests pass (GREEN)
3. Refactor if needed — tests stay green (REFACTOR)

---

## Parallel Opportunities

### Phase 1 (Setup)
```
T003 (Makefile) ──┐
T004 (playwright) ─┤─ all in parallel
T005 (index.html) ─┤
T006 (css tokens) ─┘
```

### Phase 2 (Foundational)
```
T007 (storage tests) ──┐ parallel write
T008 (data tests)   ──┘
T009 (storage impl) ← after T007 RED confirmed
T010 (data impl)    ← after T008 RED confirmed
```

### Phase 4 (US1)
```
T015 (quiz unit tests) ──┐ parallel write
T016 (E2E test)       ──┘
T017 (quiz.js)  ← after T015 RED
T018 (swipe.js) ← can parallel with T017 (different file)
T019 (home screen) ──┐
T020 (quiz screen) ─┤─ parallel (different DOM sections + CSS)
T021 (result screen)─┘
T022 (app.js) ← after T017, T018, T019, T020, T021
```

---

## Implementation Strategy

### MVP (Phases 1–4 only)

1. Phase 1: Setup → project shell running
2. Phase 2: Foundational → storage + data modules tested and passing
3. Phase 3: US6 Bootstrap → ≥20 real images in library
4. Phase 4: US1 Quiz → full swipe quiz loop working
5. **STOP and VALIDATE** — deploy to GitHub Pages, test on mobile

### Incremental Delivery

| Milestone | Phases | What works |
|-----------|--------|-----------|
| MVP | 1–4 | Full quiz loop, score display, scoreboard entry |
| + Scoreboard | + 5 | Persistent ranked scoreboard |
| + Learning | + 6 | Educational feedback on wrong answers |
| + Replay | + 7 | Best-score tracking across sessions |
| + Polish | + 8, 9 | Visual swipe cues, accessibility, performance |

---

## Notes

- `[P]` tasks touch different files — safe to run in parallel
- Constitution Principle II is non-negotiable: every implementation task has a preceding test task
- Bootstrap script (`make bootstrap`) is idempotent — run it whenever `scripts/image-sources.json` is extended
- `assets/data/bottles-fixture.json` (T008) is used only in tests; `bottles.json` is the production manifest
- `make test-e2e` requires `make serve` to be running (Playwright config handles this automatically)

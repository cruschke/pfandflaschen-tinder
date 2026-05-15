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

- [x] T001 Create full directory structure
- [x] T002 Create `package.json`
- [x] T003 [P] Create `Makefile`
- [x] T004 [P] Create `playwright.config.js`
- [x] T005 [P] Create `index.html` SPA shell
- [x] T006 [P] Create `css/styles.css` with CSS custom properties

**Checkpoint**: `make install` succeeds; `make serve` serves index.html at localhost:3000

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and storage modules used by every user story. Must be complete before any story phase begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests — Write First (RED)

- [x] T007 [P] Write failing unit tests for `js/storage.js`
- [x] T008 [P] Write failing unit tests for `js/data.js`

### Implementation

- [x] T009 Implement `js/storage.js`
- [x] T010 Implement `js/data.js`

**Checkpoint**: `make test-unit` passes for storage.js and data.js

---

## Phase 3: User Story 6 — Bootstrap Quiz with Public Images (Priority: P1)

**Goal**: Populate `assets/images/` and `assets/data/bottles.json` with ≥20 CC-licensed German bottle/jar images so the quiz has real content.

**Independent Test**: Run `make bootstrap`; verify `assets/data/bottles.json` contains ≥20 items (≥10 returnable, ≥10 non-returnable) across all `containerType` values; verify each `filename` has a corresponding `.webp` file; run `make bootstrap` a second time and confirm item count does not increase (deduplication works).

### Tests — Write First (RED)

- [x] T011 Write failing unit tests for bootstrap deduplication in `tests/unit/data.test.js`

### Implementation

- [x] T012 [US6] Create `scripts/image-sources.json`
- [x] T013 [US6] Implement `scripts/bootstrap-images.js`
- [x] T014 [US6] Run `make bootstrap` — 22 items, 10 returnable, 12 non-returnable, idempotent ✅

**Checkpoint**: ≥20 WebP images present; `bottles.json` valid per schema; second `make bootstrap` run is idempotent

---

## Phase 4: User Story 1 — Player Takes Initial Quiz (Priority: P1) 🎯 MVP

**Goal**: A player enters their name, completes a 10-item swipe quiz, sees their score, and is added to the scoreboard.

**Independent Test**: Enter a name → swipe all 10 items left or right → reach result screen with score → scoreboard shows the player's name and score.

### Tests — Write First (RED)

- [x] T015 [P] [US1] Write failing unit tests for `js/quiz.js`
- [x] T016 [P] [US1] Write failing E2E test for core quiz flow in `tests/e2e/quiz-flow.spec.js`

### Implementation

- [x] T017 [US1] Implement `js/quiz.js`
- [x] T018 [US1] Implement `js/swipe.js`
- [x] T019 [US1] Implement home screen in `#screen-home`
- [x] T020 [US1] Implement quiz screen in `#screen-quiz`
- [x] T021 [US1] Implement result screen in `#screen-result`
- [x] T022 [US1] Implement `js/app.js`

**Checkpoint**: `make test` passes for US1 unit + E2E tests; full quiz loop playable in browser via `make serve`

---

## Phase 5: User Story 2 — Scoreboard Tracks All Players (Priority: P1)

**Goal**: Persistent scoreboard showing all players ranked by best score, visible on home and result screens.

**Independent Test**: Three players complete quizzes with varying scores → scoreboard shows all three sorted highest-first → same player completes second quiz with lower score → their scoreboard entry unchanged.

### Tests — Write First (RED)

- [x] T023 [US2] Write failing E2E test for scoreboard in `tests/e2e/scoreboard.spec.js`

### Implementation

- [x] T024 [US2] Implement `js/scoreboard.js`
- [x] T025 [US2] Implement scoreboard panel in `index.html` + `css/styles.css`

**Checkpoint**: `make test` passes for US2 E2E tests; scoreboard visible and accurate on home + result screens

---

## Phase 6: User Story 3 — Learn from Mistakes (Priority: P2)

**Goal**: Wrong swipes trigger a blocking educational feedback panel with item-specific hints; correct swipes trigger a brief green confirmation.

**Independent Test**: Swipe incorrectly → feedback panel appears with hint text specific to that bottle type → panel stays until dismissed → next card appears; swipe correctly → green "Richtig!" flash → auto-advances after ~1 second.

### Tests — Write First (RED)

- [x] T026 [US3] Write failing E2E tests for feedback in `tests/e2e/quiz-flow.spec.js`

### Implementation

- [x] T027 [US3] Implement wrong-answer feedback panel in `index.html` + `css/styles.css`
- [x] T028 [US3] Implement correct-answer confirmation in `index.html` + `css/styles.css`
- [x] T029 [US3] Wire feedback logic in `js/app.js`

**Checkpoint**: `make test` passes for US3 E2E tests; feedback confirmed blocking in browser

---

## Phase 7: User Story 4 — Replay and Track Progress (Priority: P2)

**Goal**: Player can take the quiz again; best score is preserved and updated only on improvement.

**Independent Test**: Complete quiz with score 6 → return home → re-enter same name → complete second quiz with score 8 → scoreboard shows 8; complete third quiz with score 5 → scoreboard still shows 8.

### Tests — Write First (RED)

- [x] T030 [US4] Write failing E2E test for replay in `tests/e2e/quiz-flow.spec.js`

### Implementation

- [x] T031 [US4] Implement replay flow in `js/app.js`

**Checkpoint**: `make test` passes for US4 E2E tests; two-round replay verified in browser

---

## Phase 8: User Story 5 — Visual Feedback on Swipe (Priority: P3)

**Goal**: Directional overlay indicators appear while dragging, proportional to drag distance.

**Independent Test**: Start drag left → green "Pfand ✓" label fades in on left edge proportional to distance → release without threshold → springs back; drag right → red "Kein Pfand ✗" appears on right edge.

### Implementation

- [x] T032 [US5] Implement directional overlay labels in `index.html` + `css/styles.css`
- [x] T033 [US5] Wire indicator opacity to drag distance in `js/swipe.js`

**Checkpoint**: Visual indicators fade in/out smoothly during drag; no jank at 60 fps

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, final validation.

- [x] T034 [P] Add WCAG 2.1 AA accessibility attributes throughout `index.html`
- [x] T035 [P] Verify `loading="lazy"` on all `<img>` elements
- [x] T036 [P] Run Lighthouse audit via `make serve`: verify TTI ≤ 3 s, total JS ≤ 250 KB; fix any violations before marking complete
- [x] T037 [P] Configure GitHub Pages: added `.nojekyll` to repo root
- [x] T038 Run full test suite `make test` — all unit + E2E tests green; fix any regressions
- [x] T039 [P] Validate `quickstart.md` end-to-end: follow every step in a clean shell, confirm `make install` → `make bootstrap` → `make serve` → `make test` all succeed without extra steps

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

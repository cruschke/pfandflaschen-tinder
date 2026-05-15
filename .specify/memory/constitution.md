<!--
SYNC IMPACT REPORT
==================
Version change: N/A (initial) → 1.0.0
Modified principles: N/A — first ratification
Added sections:
  - I. Code Quality
  - II. Test-First Development
  - III. UX Consistency
  - IV. Performance Requirements
  - Development Workflow
  - Quality Gates
  - Governance
Removed sections: None (template placeholders replaced)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section present, aligns with principles)
  - .specify/templates/spec-template.md ✅ (Success Criteria measurable outcomes align with performance principle)
  - .specify/templates/tasks-template.md ✅ (test-first task ordering matches Principle II)
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Set to today (2026-05-15) as first ratification — update if a
    formal team review date differs.
-->

# Pfandflaschen Tinder Constitution

## Core Principles

### I. Code Quality

Every line of code MUST be readable, purposeful, and maintainable by any team member without
prior context. Specifically:

- Functions and components MUST have a single, well-defined responsibility.
- Variable, function, and component names MUST be self-documenting; abbreviations are forbidden
  unless universally understood (e.g., `id`, `url`).
- Dead code MUST NOT be committed; remove rather than comment out.
- Cyclomatic complexity MUST stay ≤ 10 per function; split if exceeded.
- Code MUST pass linting and formatting checks (configured in the project toolchain) before
  merge; no linting exceptions without documented justification in the PR.

**Rationale**: A swipe-based consumer app will iterate rapidly; low-quality code compounds into
unmaintainable debt faster than in back-office tools. Readability is the primary lever for
sustainable velocity.

### II. Test-First Development

Tests MUST be written and confirmed failing before implementation begins (Red-Green-Refactor).
This is non-negotiable.

- Every user-facing feature MUST have at least one end-to-end or integration test covering the
  primary acceptance scenario.
- Unit tests MUST cover all business logic functions with ≥ 80% branch coverage.
- Contract tests MUST be written for any API boundary or external service integration.
- Tests MUST NOT use mocks for database or storage layers; use real instances or in-memory
  equivalents that honour the full persistence contract.
- A feature is NOT considered done until all its tests pass in CI.

**Rationale**: Consumer apps break silently in production. TDD forces correct design upfront and
prevents regression in the fast-moving swipe/match domain.

### III. UX Consistency

The user interface MUST feel cohesive, predictable, and native to the platform at every screen.

- All interactive elements (buttons, cards, modals) MUST use design tokens defined in the shared
  theme; no inline one-off styling.
- Gesture interactions (swipe, tap, long-press) MUST respond within 16 ms to maintain 60 fps
  perceived fluidity.
- Error states, empty states, and loading states MUST be implemented for every user-facing view;
  "happy path only" is a bug.
- Copy (labels, toasts, error messages) MUST be reviewed for tone consistency before shipping;
  no placeholder text in production.
- Accessibility: all interactive elements MUST have accessible labels; contrast ratio MUST meet
  WCAG 2.1 AA minimum.

**Rationale**: Pfandflaschen Tinder lives or dies by its swipe experience. Inconsistent UI
destroys user trust and increases churn on first use.

### IV. Performance Requirements

The app MUST meet the following performance budgets; any release that violates them requires an
explicit waiver documented in the PR:

- **Time to Interactive (TTI)**: ≤ 3 s on a mid-range device on a 4G connection (cold start).
- **Swipe animation frame budget**: 60 fps sustained; no frame drops > 16 ms during card
  transitions.
- **API response time**: p95 ≤ 300 ms for all backend endpoints under normal load.
- **Bundle / app size**: Total JS bundle ≤ 250 KB gzipped (web); app binary ≤ 50 MB (mobile).
- **Image loading**: All card images MUST use lazy loading and be served in a next-gen format
  (WebP / AVIF); no uncompressed originals in production.

**Rationale**: Performance is a feature, not an afterthought. Users abandon apps that feel slow;
the swipe mechanic is especially sensitive to jank.

## Development Workflow

All feature work follows the Spec Kit workflow:

1. **Specify** (`/speckit-specify`): Write a feature spec with user stories and acceptance
   scenarios before any design or code.
2. **Clarify** (`/speckit-clarify`): Resolve open questions; no ambiguities reach planning.
3. **Plan** (`/speckit-plan`): Produce an implementation plan that includes a Constitution Check
   gate — the plan MUST NOT proceed if it violates any principle above without a documented
   waiver.
4. **Tasks** (`/speckit-tasks`): Break the plan into atomic, independently testable tasks
   grouped by user story.
5. **Implement** (`/speckit-implement`): Execute tasks in priority order; write tests first.

Branch naming MUST follow `###-kebab-feature-name` (e.g., `001-swipe-card-ui`).

All developer tasks (install, serve, test, bootstrap, clean) MUST be invoked via `make` targets
defined in the repository `Makefile`. Raw `npm`, `npx`, or `node` invocations MUST NOT appear
in documentation, plans, quickstarts, or task instructions — the `Makefile` is the single
human-facing interface to the dev toolchain.

## Quality Gates

The following gates MUST pass before a pull request may be merged:

- All CI checks green (lint, type-check, tests).
- Performance budget verified (Lighthouse or equivalent for web; profiler trace for mobile).
- At least one peer code review approval.
- No unresolved review comments.
- Constitution Check in the plan document signed off (or waiver documented).
- No `TODO(NEEDS CLARIFICATION)` markers remaining in changed files.

## Governance

This constitution supersedes all other written or verbal conventions. Amendments require:

1. A written proposal in a PR touching this file.
2. Explicit team approval (majority of active contributors).
3. A migration plan for any existing code that violates the new principle.
4. Version bump per semantic versioning (see below).

**Versioning policy**:
- MAJOR: A principle is removed, fundamentally redefined, or made less strict.
- MINOR: A new principle or section is added, or existing guidance is materially expanded.
- PATCH: Wording, typos, clarifications with no semantic change.

All PRs and code reviews MUST verify compliance with this constitution. Complexity or exceptions
MUST be justified in the Complexity Tracking table of the implementation plan.

**Version**: 1.0.0 | **Ratified**: 2026-05-15 | **Last Amended**: 2026-05-15

# Data Model: Bottle Quiz Trainer

**Branch**: `001-bottle-quiz-trainer` | **Date**: 2026-05-15

## Overview

The app has two persistence boundaries: the **bottles.json manifest** (bundled static asset,
written by the bootstrap script) and **localStorage** (runtime player data, written by the app).
All other state (`QuizRound`, current screen, current answers) is ephemeral and lives only in
JS memory for the duration of a session.

---

## Entity: BottleItem

Represents a single bottle/jar image and its metadata. Lives in `assets/data/bottles.json`.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `string` | Pattern: `^[a-z0-9_-]+$`; unique across manifest | Stable identifier; equals filename without extension |
| `filename` | `string` | Must end with `.webp` | Relative to `assets/images/` |
| `sourceUrl` | `string` | Valid URI; **deduplication key** | Original CC-licensed source URL |
| `containerType` | `"glass_bottle"` \| `"plastic_bottle"` \| `"screw_jar"` | Enum | Drives categorisation logic and hints |
| `brand` | `string` | `minLength: 1` | e.g., `"Beck's"`, `"Fanta"`, `"Nutella"` |
| `description` | `string` | `minLength: 1` | Human-readable description in German |
| `isReturnable` | `boolean` | — | Ground truth; determines correct swipe direction |
| `hints` | `string[]` | `minItems: 1`; each string non-empty; **in German** | Educational text shown on wrong answer |
| `license` | `string` | Non-empty | e.g., `"CC BY-SA 4.0"`, `"CC0 1.0"` |
| `attribution` | `string` | Non-empty | Credit line for image display |

**Minimum library size**: 20 items (≥ 10 returnable, ≥ 10 non-returnable) across beer,
plastic, wine, cider, and jar categories.

**State transitions**: BottleItem is immutable after bootstrapping. No runtime mutations.

---

## Entity: Player

Represents a quiz participant. Persisted in localStorage under key `pfandtinder_v1_players`.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `string` | `displayName.trim().toLowerCase()`; unique per localStorage | Canonical lookup key; not displayed |
| `displayName` | `string` | Trimmed; preserved from first entry; `minLength: 1` | Shown in scoreboard |
| `bestScore` | `number` | Integer 0–10 | Updated only when `newScore > bestScore` |
| `attemptCount` | `number` | Integer ≥ 1; incremented on every quiz completion | Informational; not shown in v1 scoreboard |

**Identity rule**: Two name inputs are the same player if
`a.trim().toLowerCase() === b.trim().toLowerCase()`. Display name is frozen at first entry.

**Lifecycle**:
1. Player enters name → lookup by canonical id in localStorage array.
2. If not found → create new Player record, `bestScore = 0`, `attemptCount = 0`.
3. Quiz completes → `attemptCount += 1`; `bestScore = Math.max(bestScore, roundScore)`.
4. Write updated array back to localStorage.

---

## Entity: QuizRound (ephemeral)

Represents one active quiz session. Lives only in JS memory; never persisted.

| Field | Type | Notes |
|-------|------|-------|
| `playerId` | `string` | Canonical player id |
| `items` | `BottleItem[]` | 10 randomly selected from full library each round |
| `currentIndex` | `number` | 0–9; pointer to the active item |
| `answers` | `Answer[]` | Accumulated as the player swipes |
| `score` | `number` | Count of correct answers; computed from `answers` on completion |

### Answer (sub-record, ephemeral)

| Field | Type | Notes |
|-------|------|-------|
| `itemId` | `string` | BottleItem id |
| `playerChoice` | `boolean` | `true` = swiped returnable (left), `false` = non-returnable (right) |
| `correct` | `boolean` | `playerChoice === item.isReturnable` |

**State transitions**:
```
IDLE → ACTIVE (player swipes first item)
ACTIVE → ACTIVE (each swipe + optional feedback dismiss)
ACTIVE → COMPLETE (currentIndex reaches 9 and last answer recorded)
COMPLETE → IDLE (player taps "Nochmal spielen" or "Zurück")
```

On browser refresh: QuizRound is discarded; player returns to IDLE (home screen).

---

## Entity: Scoreboard (derived)

Not persisted separately. Rebuilt on demand from the Player array.

**Derivation**:
```javascript
const scoreboard = players
  .slice()                                          // don't mutate storage copy
  .sort((a, b) => b.bestScore - a.bestScore         // primary: best score descending
    || a.displayName.localeCompare(b.displayName)); // secondary: name ascending (tie-break)
```

---

## Relationship Diagram

```
BottleItem (static, bottles.json)
    ↓ randomly sampled (10 per round)
QuizRound (ephemeral, JS memory)
    ↓ produces score on completion
Player (persistent, localStorage)
    ↓ aggregated + sorted
Scoreboard (derived, DOM render)
```

---

## bottles.json Top-Level Structure

```json
{
  "version": "1.0.0",
  "items": [
    {
      "id": "becks_pilsner_500ml",
      "filename": "becks_pilsner_500ml.webp",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Beck%27s_beer.jpg",
      "containerType": "glass_bottle",
      "brand": "Beck's",
      "description": "Beck's Pils 500ml Glasflasche",
      "isReturnable": true,
      "hints": [
        "Bierflaschen in Deutschland sind grundsätzlich Pfandflaschen und werden mit 8 Cent Pfand berechnet.",
        "Das Beck's-Logo und die grüne Farbe sind typisch für diese Mehrwegflasche."
      ],
      "license": "CC BY-SA 3.0",
      "attribution": "Foto: Wikimedia Commons / CC BY-SA 3.0"
    }
  ]
}
```

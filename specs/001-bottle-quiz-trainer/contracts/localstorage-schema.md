# Contract: localStorage Schema

**Key**: `pfandtinder_v1_players`
**Written by**: `js/storage.js`
**Read by**: `js/storage.js`, `js/scoreboard.js`
**Version**: 1.0

---

## Purpose

Persists all player records across browser sessions on a single device. There is no backend and
no cross-device sync in v1. Clearing browser data (localStorage) resets the scoreboard.

---

## Storage Key

```
pfandtinder_v1_players
```

The `pfandtinder_` prefix avoids collisions with other apps on the same GitHub Pages domain
(`username.github.io`). The `v1_` infix enables a clean key migration if the schema changes
in a future release.

---

## Value

A JSON-serialised array of `Player` objects. If the key is absent or its value cannot be
parsed as a JSON array, `storage.js` MUST treat it as an empty array `[]` and not throw.

---

## Player Object

```
{
  id:           string   — Canonical identifier: displayName.trim().toLowerCase()
                           Must be unique within the array.

  displayName:  string   — Original casing from the player's first entry, whitespace-trimmed.
                           Never updated after creation; serves as the displayed name.

  bestScore:    number   — Integer 0–10. Updated only when a new score exceeds the current value.

  attemptCount: number   — Integer ≥ 1. Incremented on every quiz completion, regardless of score.
}
```

---

## Invariants

| Invariant | Enforcement |
|-----------|-------------|
| `id` uniqueness | `storage.js` MUST prevent duplicate ids before writing |
| `id === displayName.trim().toLowerCase()` | Enforced at creation; never recalculated after |
| `bestScore` is monotonically non-decreasing | `storage.js` MUST use `Math.max` |
| Array is always valid JSON | `storage.js` MUST catch `JSON.parse` errors and recover to `[]` |

---

## Read/Write Operations (defined in `js/storage.js`)

| Operation | Behaviour |
|-----------|-----------|
| `loadPlayers()` | Returns `Player[]`; returns `[]` on parse error or missing key |
| `savePlayers(players)` | Serialises array and writes to key; throws if `localStorage` is unavailable |
| `findPlayer(rawName)` | Returns `Player \| undefined`; matches by `canonicalName(rawName)` |
| `upsertPlayer(rawName, score)` | Creates or updates player; increments `attemptCount`; updates `bestScore` if higher |

---

## Example

```json
[
  {
    "id": "anna",
    "displayName": "Anna",
    "bestScore": 9,
    "attemptCount": 4
  },
  {
    "id": "max mustermann",
    "displayName": "Max Mustermann",
    "bestScore": 6,
    "attemptCount": 1
  }
]
```

---

## Storage Size Estimate

| Players | Approx. size |
|---------|-------------|
| 10 | ~1 KB |
| 100 | ~10 KB |
| 1 000 | ~100 KB |

Browsers guarantee at least 5 MB of localStorage per origin. The app will not implement
quota management in v1; the risk of hitting the limit is negligible for a local quiz.

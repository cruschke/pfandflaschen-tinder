# Contract: bottles.json Schema

**File**: `assets/data/bottles.json`
**Written by**: `scripts/bootstrap-images.js` (developer tool, run manually)
**Read by**: `js/data.js` at app startup
**Version**: 1.0

---

## Purpose

This file is the single source of truth for all quiz content. It is bundled into the repository
and served as a static asset. The bootstrap script may extend it incrementally; the app treats
it as read-only at runtime.

---

## Top-Level Object

```
{
  version:  string   — Semver string; incremented by bootstrap script on each write
  items:    BottleItem[]   — At least 20 items required (≥ 10 returnable, ≥ 10 non-returnable)
}
```

---

## BottleItem Object

```
{
  id:             string     — Stable, URL-safe identifier (pattern: ^[a-z0-9_-]+$)
                               Must equal the filename without the .webp extension.
                               Must be unique across the items array.

  filename:       string     — WebP image filename (pattern: *.webp)
                               Relative to assets/images/.

  sourceUrl:      string     — Full URI of the original CC-licensed source image.
                               Used as the deduplication key by the bootstrap script.
                               Must be unique across the items array.

  containerType:  enum       — One of: "glass_bottle" | "plastic_bottle" | "screw_jar"

  brand:          string     — Brand name, min 1 character. e.g. "Beck's", "Fanta", "Nutella".

  description:    string     — Human-readable German description. min 1 character.

  isReturnable:   boolean    — Ground truth returnability under German Pfand rules.
                               true  = player must swipe LEFT (returnable / Pfand).
                               false = player must swipe RIGHT (non-returnable / kein Pfand).

  hints:          string[]   — At least 1 educational hint, written in German.
                               Shown in the feedback panel when the player answers incorrectly.

  license:        string     — SPDX or human-readable license name. e.g. "CC BY-SA 4.0", "CC0 1.0".

  attribution:    string     — Full credit line for display. e.g. "Foto: Max Mustermann / CC BY-SA 4.0"
}
```

---

## Validation Rules

| Rule | Detail |
|------|--------|
| `id` uniqueness | No two items may share the same `id` |
| `sourceUrl` uniqueness | No two items may share the same `sourceUrl` (dedup key) |
| `filename` uniqueness | No two items may share the same `filename` |
| Min items | `items.length >= 20` |
| Returnable balance | At least 10 items with `isReturnable: true`, at least 10 with `false` |
| Category coverage | At least one item per `containerType` value |
| Hints language | All `hints` strings must be written in German |
| Image existence | Each `filename` must have a corresponding file in `assets/images/` |

`js/data.js` MUST validate these rules at startup and throw a descriptive error if violated,
to prevent a misconfigured manifest from producing a silent broken quiz.

---

## Example (truncated)

```json
{
  "version": "1.2.0",
  "items": [
    {
      "id": "becks_pilsner_500ml",
      "filename": "becks_pilsner_500ml.webp",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Becks_beer.jpg",
      "containerType": "glass_bottle",
      "brand": "Beck's",
      "description": "Beck's Pils 500ml Glasflasche",
      "isReturnable": true,
      "hints": [
        "Bierflaschen in Deutschland sind grundsätzlich Pfandflaschen (8 Cent Pfand).",
        "Du erkennst Mehrwegflaschen oft an der genormten Form und dem Pfand-Logo."
      ],
      "license": "CC BY-SA 3.0",
      "attribution": "Foto: Wikimedia Commons / CC BY-SA 3.0"
    },
    {
      "id": "nutella_450g",
      "filename": "nutella_450g.webp",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nutella.jpg",
      "containerType": "screw_jar",
      "brand": "Nutella",
      "description": "Nutella 450g Schraubglas",
      "isReturnable": false,
      "hints": [
        "Schraubgläser (z.B. Marmelade, Nutella) sind keine Pfandflaschen.",
        "Leere Gläser gehören in den Altglascontainer, nicht in den Pfandautomaten."
      ],
      "license": "CC0 1.0",
      "attribution": "Foto: Wikimedia Commons / CC0 1.0"
    }
  ]
}
```

---

## Versioning

The bootstrap script uses semver PATCH increments (`1.0.0` → `1.0.1`) for each run that adds
items, and MINOR increments (`1.0.x` → `1.1.0`) when the schema itself changes. The app does
not gate behaviour on version; it is informational for debugging.

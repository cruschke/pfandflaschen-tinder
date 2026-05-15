# Pfandflaschen-Trainer

**Lernst du, Pfandflaschen zu erkennen?** Ein Swipe-Quiz für deutsches Pfandsystem-Training.

🎮 **[Live spielen → cruschke.github.io/pfandflaschen-tinder](https://cruschke.github.io/pfandflaschen-tinder/)**

---

## Was ist das?

Tinder-Mechanik trifft Pfandsystem: Wische eine Flasche nach links für **Pfand** oder rechts für **Kein Pfand**. 10 Flaschen pro Runde, sofortiges Feedback bei falschen Antworten, persistente Bestenliste.

- Swipe links → Pfand ✓ (Mehrwegflasche, Einwegflasche mit Pfand)
- Swipe rechts → Kein Pfand ✗ (Weinflasche, Einmachglas, ...)
- Falsche Antwort → Erklärung mit Hinweis
- Richtige Antwort → Grüner Flash
- Bestenliste zeigt besten Score pro Spieler

## Technik

Vanilla HTML5 / CSS3 / ES2022 — kein Framework, kein Build-Schritt.

| Datei | Aufgabe |
|-------|---------|
| `js/app.js` | Screen-Router, Quiz-State-Machine |
| `js/quiz.js` | Zufallsauswahl, Antwortevaluierung, Scoring |
| `js/swipe.js` | Drag-Geste via PointerEvents API |
| `js/scoreboard.js` | Bestenliste sortieren + rendern |
| `js/storage.js` | localStorage-Persistenz (Spieler + Scores) |
| `js/data.js` | `bottles.json` laden + validieren |
| `assets/images/` | 25 CC-lizenzierte WebP-Bilder |
| `assets/data/bottles.json` | Bildmetadaten-Manifest |

## Lokale Entwicklung

**Voraussetzungen**: Node.js ≥ 20, npm ≥ 10

```bash
# 1. Dev-Abhängigkeiten installieren (Playwright, sharp, serve)
make install

# 2. Bilder bootstrappen (einmalig — lädt 25 WebP-Bilder von Wikimedia Commons)
make bootstrap

# 3. App lokal starten
make serve
# → http://localhost:3000

# 4. Tests ausführen (33 Unit + 21 E2E)
make test
```

Alle Makefile-Ziele:

```
make install      npm install + Playwright-Browser installieren
make serve        Statischen Server auf Port 3000 starten
make bootstrap    Bilder herunterladen, zu WebP konvertieren, bottles.json befüllen
make test         Alle Tests (Unit + E2E)
make test-unit    Nur Node.js-Unit-Tests
make test-e2e     Nur Playwright-E2E-Tests
make clean        Bilder + bottles.json zurücksetzen, node_modules löschen
```

## Bilder hinzufügen

1. Eintrag in `scripts/image-sources.json` ergänzen (Wikimedia Commons-URL, Metadaten)
2. `make bootstrap` ausführen — nur neue Einträge werden verarbeitet (idempotent)

## Lizenz

Code: MIT  
Bilder: Jeweilige CC-Lizenz laut `attribution`-Feld in `assets/data/bottles.json`

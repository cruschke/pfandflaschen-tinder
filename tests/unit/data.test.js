import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, '../../assets/data/bottles-fixture.json');

// Create fixture file used by data.js in test mode
const fixture = {
  version: '0.1.0',
  items: [
    {
      id: 'becks_500ml',
      filename: 'becks_500ml.webp',
      sourceUrl: 'https://example.com/becks.jpg',
      containerType: 'glass_bottle',
      brand: "Beck's",
      description: "Beck's Pils 500ml",
      isReturnable: true,
      hints: ['Bierflaschen sind immer Pfand.'],
      license: 'CC0',
      attribution: 'Test',
    },
    {
      id: 'fanta_pet',
      filename: 'fanta_pet.webp',
      sourceUrl: 'https://example.com/fanta.jpg',
      containerType: 'plastic_bottle',
      brand: 'Fanta',
      description: 'Fanta PET 0,5l',
      isReturnable: true,
      hints: ['PET-Flaschen mit Pfandzeichen sind Pfand.'],
      license: 'CC0',
      attribution: 'Test',
    },
    {
      id: 'nutella_450g',
      filename: 'nutella_450g.webp',
      sourceUrl: 'https://example.com/nutella.jpg',
      containerType: 'screw_jar',
      brand: 'Nutella',
      description: 'Nutella 450g Glas',
      isReturnable: false,
      hints: ['Schraubgläser sind kein Pfand.'],
      license: 'CC0',
      attribution: 'Test',
    },
    {
      id: 'wine_bottle',
      filename: 'wine_bottle.webp',
      sourceUrl: 'https://example.com/wine.jpg',
      containerType: 'glass_bottle',
      brand: 'Testweingut',
      description: 'Rotwein 0,75l',
      isReturnable: false,
      hints: ['Weinflaschen sind kein Pfand.'],
      license: 'CC0',
      attribution: 'Test',
    },
    {
      id: 'cider_540ml',
      filename: 'cider_540ml.webp',
      sourceUrl: 'https://example.com/cider.jpg',
      containerType: 'glass_bottle',
      brand: 'Testcider',
      description: 'Apfelcider 540ml',
      isReturnable: false,
      hints: ['Ciderflaschen (540ml) sind kein Pfand – anders als Bierflaschen (500ml).'],
      license: 'CC0',
      attribution: 'Test',
    },
  ],
};

mkdirSync(join(__dirname, '../../assets/data'), { recursive: true });
writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2));

const { validateBottles, mergeItems } = await import('../../js/data.js');

describe('data — validateBottles', () => {
  it('accepts a valid items array', () => {
    assert.doesNotThrow(() => validateBottles(fixture.items));
  });

  it('throws when fewer than 1 item (fixture has 5, production requires 20)', () => {
    assert.throws(() => validateBottles([]), /items/i);
  });

  it('throws on missing required field', () => {
    const bad = fixture.items.map(i => ({ ...i }));
    delete bad[0].isReturnable;
    assert.throws(() => validateBottles(bad), /isReturnable|required/i);
  });

  it('throws on duplicate id', () => {
    const dup = [...fixture.items, { ...fixture.items[0] }];
    assert.throws(() => validateBottles(dup), /duplicate|id/i);
  });

  it('throws on duplicate sourceUrl', () => {
    const dup = [...fixture.items, { ...fixture.items[1], id: 'unique_id', filename: 'unique.webp' }];
    assert.throws(() => validateBottles(dup), /duplicate|sourceUrl/i);
  });
});

describe('data — mergeItems (deduplication)', () => {
  it('skips items whose sourceUrl already exists', () => {
    const existing = fixture.items.slice(0, 2);
    const incoming = [fixture.items[1], fixture.items[3]];
    const result = mergeItems(existing, incoming);
    assert.equal(result.length, 3);
    assert.equal(result.filter(i => i.id === 'fanta_pet').length, 1);
  });

  it('adds genuinely new items', () => {
    const existing = fixture.items.slice(0, 2);
    const newItem = { ...fixture.items[4], sourceUrl: 'https://example.com/new.jpg', id: 'new_item', filename: 'new_item.webp' };
    const result = mergeItems(existing, [newItem]);
    assert.equal(result.length, 3);
  });

  it('returns original array unchanged when all incoming are duplicates', () => {
    const result = mergeItems(fixture.items, fixture.items);
    assert.equal(result.length, fixture.items.length);
  });
});

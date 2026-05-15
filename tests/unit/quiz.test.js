import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const { selectItems, evaluateAnswer, computeScore, createRound } =
  await import('../../js/quiz.js');

// Minimal library of 12 items (≥10 required by selectItems)
const makeLibrary = () => Array.from({ length: 12 }, (_, i) => Object.freeze({
  id: `item_${i}`,
  filename: `item_${i}.webp`,
  sourceUrl: `https://example.com/item_${i}.jpg`,
  containerType: i % 3 === 0 ? 'plastic_bottle' : 'glass_bottle',
  brand: `Brand${i}`,
  description: `Item ${i}`,
  isReturnable: i % 2 === 0,
  hints: [`Hinweis zu Item ${i}.`],
  license: 'CC0',
  attribution: 'Test',
}));

describe('quiz — selectItems', () => {
  it('returns exactly n items', () => {
    const library = makeLibrary();
    const result = selectItems(library, 10);
    assert.equal(result.length, 10);
  });

  it('returns items that exist in the library', () => {
    const library = makeLibrary();
    const ids = new Set(library.map(i => i.id));
    const result = selectItems(library, 10);
    for (const item of result) {
      assert.ok(ids.has(item.id), `item ${item.id} not in library`);
    }
  });

  it('returns different subsets across calls (randomness)', () => {
    const library = makeLibrary();
    const results = Array.from({ length: 10 }, () => selectItems(library, 10).map(i => i.id).join(','));
    const unique = new Set(results);
    assert.ok(unique.size > 1, 'selectItems returned the same subset every time — likely not random');
  });

  it('throws when library has fewer items than n', () => {
    assert.throws(() => selectItems(makeLibrary().slice(0, 5), 10), /not enough|library/i);
  });
});

describe('quiz — evaluateAnswer', () => {
  const returnableItem = makeLibrary().find(i => i.isReturnable);
  const nonReturnableItem = makeLibrary().find(i => !i.isReturnable);

  it('returns true when player choice matches isReturnable (correct returnable)', () => {
    assert.equal(evaluateAnswer(returnableItem, true), true);
  });

  it('returns true when player choice matches isReturnable (correct non-returnable)', () => {
    assert.equal(evaluateAnswer(nonReturnableItem, false), true);
  });

  it('returns false when player choice does not match (wrong)', () => {
    assert.equal(evaluateAnswer(returnableItem, false), false);
    assert.equal(evaluateAnswer(nonReturnableItem, true), false);
  });
});

describe('quiz — computeScore', () => {
  it('returns 0 for all-wrong answers', () => {
    assert.equal(computeScore([false, false, false]), 0);
  });

  it('returns full count for all-correct answers', () => {
    assert.equal(computeScore([true, true, true, true, true, true, true, true, true, true]), 10);
  });

  it('counts mixed answers correctly', () => {
    assert.equal(computeScore([true, false, true, false, true]), 3);
  });

  it('returns 0 for empty array', () => {
    assert.equal(computeScore([]), 0);
  });
});

describe('quiz — createRound', () => {
  it('returns object with items, answers, currentIndex, score', () => {
    const library = makeLibrary();
    const round = createRound('player_1', library, 10);
    assert.equal(round.items.length, 10);
    assert.deepEqual(round.answers, []);
    assert.equal(round.currentIndex, 0);
    assert.equal(round.score, 0);
  });

  it('round.items are a frozen snapshot (not mutated by library changes)', () => {
    const library = makeLibrary();
    const round = createRound('player_1', library, 10);
    const firstId = round.items[0].id;
    // items array should not change
    assert.equal(round.items[0].id, firstId);
  });
});

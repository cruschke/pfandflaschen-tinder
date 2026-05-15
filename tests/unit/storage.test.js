import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Minimal localStorage stub for Node.js environment
let store = {};
const localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { store = {}; },
};
globalThis.localStorage = localStorage;

const { loadPlayers, savePlayers, findPlayer, upsertPlayer } =
  await import('../../js/storage.js');

describe('storage — loadPlayers', () => {
  before(() => localStorage.clear());

  it('returns empty array when key is absent', () => {
    assert.deepEqual(loadPlayers(), []);
  });

  it('returns empty array when value is corrupt JSON', () => {
    localStorage.setItem('pfandtinder_v1_players', 'not-json');
    assert.deepEqual(loadPlayers(), []);
    localStorage.clear();
  });

  it('returns parsed array when valid JSON exists', () => {
    const p = [{ id: 'anna', displayName: 'Anna', bestScore: 5, attemptCount: 1 }];
    localStorage.setItem('pfandtinder_v1_players', JSON.stringify(p));
    assert.deepEqual(loadPlayers(), p);
    localStorage.clear();
  });
});

describe('storage — upsertPlayer (new player)', () => {
  before(() => localStorage.clear());
  after(() => localStorage.clear());

  it('creates a new player record', () => {
    upsertPlayer('Anna', 7);
    const players = loadPlayers();
    assert.equal(players.length, 1);
    assert.equal(players[0].id, 'anna');
    assert.equal(players[0].displayName, 'Anna');
    assert.equal(players[0].bestScore, 7);
    assert.equal(players[0].attemptCount, 1);
  });
});

describe('storage — upsertPlayer (existing player)', () => {
  before(() => {
    localStorage.clear();
    upsertPlayer('Anna', 7);
  });
  after(() => localStorage.clear());

  it('increments attemptCount on every call', () => {
    upsertPlayer('Anna', 5);
    assert.equal(loadPlayers()[0].attemptCount, 2);
  });

  it('updates bestScore only when new score is higher', () => {
    upsertPlayer('Anna', 5);
    assert.equal(loadPlayers()[0].bestScore, 7);
    upsertPlayer('Anna', 9);
    assert.equal(loadPlayers()[0].bestScore, 9);
  });

  it('preserves displayName casing from first entry', () => {
    upsertPlayer('ANNA', 8);
    assert.equal(loadPlayers()[0].displayName, 'Anna');
  });
});

describe('storage — findPlayer', () => {
  before(() => {
    localStorage.clear();
    upsertPlayer('Max Mustermann', 6);
  });
  after(() => localStorage.clear());

  it('finds player with exact name', () => {
    assert.ok(findPlayer('Max Mustermann'));
  });

  it('finds player case-insensitively', () => {
    assert.ok(findPlayer('max mustermann'));
    assert.ok(findPlayer('MAX MUSTERMANN'));
  });

  it('finds player with surrounding whitespace', () => {
    assert.ok(findPlayer('  Max Mustermann  '));
  });

  it('returns undefined for unknown name', () => {
    assert.equal(findPlayer('Unbekannt'), undefined);
  });
});

describe('storage — savePlayers', () => {
  before(() => localStorage.clear());
  after(() => localStorage.clear());

  it('persists array and loadPlayers retrieves it', () => {
    const players = [{ id: 'test', displayName: 'Test', bestScore: 3, attemptCount: 1 }];
    savePlayers(players);
    assert.deepEqual(loadPlayers(), players);
  });
});

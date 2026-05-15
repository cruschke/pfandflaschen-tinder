const STORAGE_KEY = 'pfandtinder_v1_players';

export function canonicalName(raw) {
  return raw.trim().toLowerCase();
}

export function loadPlayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePlayers(players) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

export function findPlayer(rawName) {
  const key = canonicalName(rawName);
  return loadPlayers().find(p => p.id === key);
}

export function upsertPlayer(rawName, score) {
  const players = loadPlayers();
  const key = canonicalName(rawName);
  const existing = players.find(p => p.id === key);
  if (existing) {
    existing.attemptCount += 1;
    if (score > existing.bestScore) existing.bestScore = score;
  } else {
    players.push({
      id: key,
      displayName: rawName.trim(),
      bestScore: score,
      attemptCount: 1,
    });
  }
  savePlayers(players);
}

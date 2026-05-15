import { loadPlayers } from './storage.js';

export function buildScoreboard(players) {
  return [...players].sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    return a.displayName.localeCompare(b.displayName, 'de');
  });
}

export function renderScoreboard(container, players) {
  container.innerHTML = '';
  const sorted = buildScoreboard(players);
  if (sorted.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'scoreboard-empty';
    empty.textContent = 'Noch keine Einträge';
    container.appendChild(empty);
    return;
  }
  sorted.forEach((player, index) => {
    const row = document.createElement('div');
    row.className = 'scoreboard-row';
    row.setAttribute('role', 'listitem');
    const rank = index + 1;
    row.innerHTML = `
      <span class="scoreboard-rank rank-${rank <= 3 ? rank : 'other'}">${rank}.</span>
      <span class="scoreboard-name">${escapeHtml(player.displayName)}</span>
      <span class="scoreboard-score">${player.bestScore} / 10</span>
    `;
    container.appendChild(row);
  });
}

export function refresh(container) {
  renderScoreboard(container, loadPlayers());
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

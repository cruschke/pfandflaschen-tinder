export function selectItems(library, n) {
  if (library.length < n) {
    throw new Error(`quiz: not enough items in library (${library.length} < ${n})`);
  }
  const shuffled = [...library].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function evaluateAnswer(item, playerChoice) {
  return item.isReturnable === playerChoice;
}

export function computeScore(answers) {
  return answers.filter(Boolean).length;
}

export function createRound(playerId, library, n = 10) {
  return {
    playerId,
    items: selectItems(library, n),
    answers: [],
    currentIndex: 0,
    score: 0,
  };
}

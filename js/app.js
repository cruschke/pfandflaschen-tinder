import { loadBottles } from './data.js';
import { upsertPlayer } from './storage.js';
import { createRound, evaluateAnswer, computeScore } from './quiz.js';
import { attachSwipe } from './swipe.js';
import { refresh as refreshScoreboard } from './scoreboard.js';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const screens = {
  home:   document.getElementById('screen-home'),
  quiz:   document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result'),
};

const formStart      = document.getElementById('form-start');
const inputName      = document.getElementById('input-name');
const nameError      = document.getElementById('name-error');
const quizProgress   = document.getElementById('quiz-progress');
const quizCard       = document.getElementById('quiz-card');
const cardImage      = document.getElementById('card-image');
const cardBrand      = document.getElementById('card-brand');
const btnReturnable  = document.getElementById('btn-returnable');
const btnTrash       = document.getElementById('btn-trash');
const indicatorLeft  = quizCard.querySelector('.indicator-left');
const indicatorRight = quizCard.querySelector('.indicator-right');
const feedbackPanel  = document.getElementById('feedback-panel');
const feedbackCard   = feedbackPanel.querySelector('.feedback-card');
const feedbackIcon   = feedbackPanel.querySelector('.feedback-icon');
const feedbackHint   = document.getElementById('feedback-hint');
const feedbackCorrect = document.getElementById('feedback-correct');
const btnDismiss     = document.getElementById('btn-dismiss');
const resultPlayer   = document.getElementById('result-player');
const resultScore    = document.getElementById('result-score');
const resultComment  = document.getElementById('result-comment');
const btnReplay      = document.getElementById('btn-replay');
const btnHome        = document.getElementById('btn-home');
const btnStart         = document.getElementById('btn-start');
const loadError        = document.getElementById('load-error');
const scoreboardHome   = document.getElementById('scoreboard-home');
const scoreboardResult = document.getElementById('scoreboard-result');

// ── State ─────────────────────────────────────────────────────────────────────
let library = [];
let round   = null;
let playerName = '';
let swipeCleanup = null;
let swipeHandler = null;
let answerLocked = false;

// ── Screen router ─────────────────────────────────────────────────────────────
function showScreen(id) {
  for (const [key, el] of Object.entries(screens)) {
    if (key === id) {
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', '');
    }
  }
}

// ── Scoreboard ────────────────────────────────────────────────────────────────
function refreshAllScoreboards() {
  refreshScoreboard(scoreboardHome);
  refreshScoreboard(scoreboardResult);
}

// ── Card rendering ────────────────────────────────────────────────────────────
function renderCard(item) {
  answerLocked = false;
  cardImage.src = `assets/images/${item.filename}`;
  cardImage.alt = item.description;
  cardBrand.textContent = item.brand;
  quizCard.style.transform = '';
  quizCard.style.transition = '';
  quizCard.classList.remove('dragging');

  // Reset swipe listener
  if (swipeHandler) quizCard.removeEventListener('swipe', swipeHandler);
  if (swipeCleanup) swipeCleanup();
  swipeCleanup = attachSwipe(quizCard, indicatorLeft, indicatorRight);
  swipeHandler = onSwipe;
  quizCard.addEventListener('swipe', swipeHandler, { once: true });
}

function updateProgress() {
  const total = round.items.length;
  quizProgress.textContent = `${round.currentIndex + 1} / ${total}`;
}

// ── Answer handling ───────────────────────────────────────────────────────────
function handleAnswer(playerChoice) {
  if (answerLocked) return;
  answerLocked = true;
  const item = round.items[round.currentIndex];
  const correct = evaluateAnswer(item, playerChoice);
  round.answers.push(correct);
  if (correct) round.score += 1;
  showFeedback(item, correct);
}

function onSwipe(e) {
  // left = Pfand (returnable), right = Kein Pfand (non-returnable)
  const choice = e.detail.direction === 'left';
  handleAnswer(choice);
}

// ── Visual feedback ───────────────────────────────────────────────────────────
function showFeedback(item, isCorrect) {
  feedbackIcon.textContent = isCorrect ? '✓' : '✗';
  feedbackCard.classList.toggle('feedback-card--correct', isCorrect);
  feedbackHint.textContent = item.hints[0] ?? '';
  if (isCorrect) {
    feedbackCorrect.setAttribute('hidden', '');
  } else {
    const correctAnswer = item.isReturnable ? 'Pfand' : 'Kein Pfand';
    feedbackCorrect.textContent = `Richtige Antwort: ${correctAnswer}`;
    feedbackCorrect.removeAttribute('hidden');
  }
  feedbackPanel.removeAttribute('hidden');
  btnDismiss.focus();
}

function hideFeedback() {
  feedbackPanel.setAttribute('hidden', '');
  advanceRound();
}

// ── Round progression ─────────────────────────────────────────────────────────
function advanceRound() {
  round.currentIndex += 1;
  if (round.currentIndex >= round.items.length) {
    finishRound();
  } else {
    renderCard(round.items[round.currentIndex]);
    updateProgress();
  }
}

function finishRound() {
  const score = computeScore(round.answers);
  upsertPlayer(playerName, score);
  refreshAllScoreboards();
  showResult(score);
}

// ── Result screen ─────────────────────────────────────────────────────────────
function showResult(score) {
  resultPlayer.textContent = playerName;
  resultScore.textContent = `Du hast ${score} von 10 richtig!`;
  resultComment.textContent = commentForScore(score);
  showScreen('result');
}

function commentForScore(score) {
  if (score === 10) return 'Perfekt! Du kennst dich aus.';
  if (score >= 8)  return 'Super! Fast alles richtig.';
  if (score >= 5)  return 'Gut gemacht! Noch ein bisschen Übung.';
  return 'Weiter üben – du schaffst das!';
}

// ── Start quiz ────────────────────────────────────────────────────────────────
async function startQuiz(name) {
  playerName = name;
  round = createRound(name, library, 10);
  showScreen('quiz');
  renderCard(round.items[0]);
  updateProgress();
}

// ── Home screen ───────────────────────────────────────────────────────────────
function validateName(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    nameError.textContent = 'Bitte gib deinen Namen ein.';
    nameError.removeAttribute('hidden');
    inputName.focus();
    return null;
  }
  nameError.setAttribute('hidden', '');
  return trimmed;
}

// ── Event listeners ───────────────────────────────────────────────────────────
formStart.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = validateName(inputName.value);
  if (name) startQuiz(name);
});

btnReturnable.addEventListener('click', () => handleAnswer(true));
btnTrash.addEventListener('click', () => handleAnswer(false));
btnDismiss.addEventListener('click', hideFeedback);

btnReplay.addEventListener('click', () => {
  inputName.value = playerName;
  startQuiz(playerName);
});

btnHome.addEventListener('click', () => {
  showScreen('home');
  refreshScoreboard(scoreboardHome);
});

// ── Boot ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    library = await loadBottles();
  } catch (err) {
    console.error('Failed to load bottles:', err);
    loadError.removeAttribute('hidden');
    btnStart.disabled = true;
  }
  refreshScoreboard(scoreboardHome);
  showScreen('home');
})();

import { test, expect } from '@playwright/test';

async function playQuiz(page, name, useReturnable = true) {
  await page.getByLabel(/dein name/i).fill(name);
  await page.getByRole('button', { name: /quiz starten/i }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.quiz-card img')).toBeVisible();
    const btnLabel = useReturnable ? 'Pfand' : 'Kein Pfand';
    await page.getByRole('button', { name: btnLabel, exact: true }).click();
    await page.getByRole('button', { name: /verstanden/i }).click();
  }
  await expect(page.locator('#screen-result')).toBeVisible();
}

test.describe('Scoreboard — US2', () => {
  test('three players ranked by best score descending', async ({ page }) => {
    await page.goto('/');

    // Player 1: score at least some (swipe all Pfand)
    await playQuiz(page, 'Spieler-A', true);
    await page.getByRole('button', { name: /zur startseite/i }).click();

    // Player 2
    await playQuiz(page, 'Spieler-B', false);
    await page.getByRole('button', { name: /zur startseite/i }).click();

    // Player 3
    await playQuiz(page, 'Spieler-C', true);
    await page.getByRole('button', { name: /zur startseite/i }).click();

    // All three players appear on home scoreboard
    const scoreboard = page.locator('#scoreboard-home');
    await expect(scoreboard).toContainText('Spieler-A');
    await expect(scoreboard).toContainText('Spieler-B');
    await expect(scoreboard).toContainText('Spieler-C');

    // Scoreboard rows exist
    const rows = scoreboard.locator('.scoreboard-row');
    await expect(rows).toHaveCount(3);
  });

  test('empty state shows placeholder text before any player', async ({ page }) => {
    await page.goto('/');
    // Fresh page with empty localStorage
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('#scoreboard-home')).toContainText(/noch keine einträge/i);
  });

  test('same player replaying does not create duplicate entries', async ({ page }) => {
    await page.goto('/');

    await playQuiz(page, 'Duplikat-Check', true);
    await page.getByRole('button', { name: /nochmal spielen/i }).click();

    // Play second round
    for (let i = 0; i < 10; i++) {
      await expect(page.locator('.quiz-card img')).toBeVisible();
      await page.getByRole('button', { name: 'Pfand', exact: true }).click();
      await page.getByRole('button', { name: /verstanden/i }).click();
    }

    await page.getByRole('button', { name: /zur startseite/i }).click();

    // Only one entry for this player
    const rows = page.locator('#scoreboard-home .scoreboard-row');
    const texts = await rows.allTextContents();
    const playerRows = texts.filter(t => t.includes('Duplikat-Check'));
    expect(playerRows.length).toBe(1);
  });

  test('scoreboard visible on result screen', async ({ page }) => {
    await page.goto('/');
    await playQuiz(page, 'Result-Test', true);
    await expect(page.locator('#scoreboard-result')).toBeVisible();
    await expect(page.locator('#scoreboard-result')).toContainText('Result-Test');
  });
});

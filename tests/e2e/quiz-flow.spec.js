import { test, expect } from '@playwright/test';

test.describe('Quiz flow — US1', () => {
  test('player completes a 10-question quiz and reaches result screen', async ({ page }) => {
    await page.goto('/');

    // Home screen: enter name and start
    await page.getByLabel(/dein name/i).fill('TestSpieler');
    await page.getByRole('button', { name: /quiz starten/i }).click();

    // Quiz screen should be visible
    await expect(page.locator('#screen-quiz')).toBeVisible();

    // Swipe through all 10 questions using the button fallbacks
    for (let i = 0; i < 10; i++) {
      // Wait for the current card to be rendered
      await expect(page.locator('.quiz-card img')).toBeVisible();

      // Use action button "Kein Pfand" for all — consistent answers
      await page.getByRole('button', { name: /kein pfand/i }).click();

      // Feedback panel always appears — dismiss it
      await page.getByRole('button', { name: /verstanden/i }).click();
    }

    // Result screen should be visible
    await expect(page.locator('#screen-result')).toBeVisible();

    // Score display shows "von 10"
    await expect(page.locator('#screen-result')).toContainText(/von 10/i);

    // Scoreboard on result screen should show the player's name
    await expect(page.locator('#screen-result')).toContainText(/TestSpieler/i);
  });

  test('home screen shows scoreboard after quiz completion', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(/dein name/i).fill('Scoreboard-Check');
    await page.getByRole('button', { name: /quiz starten/i }).click();

    for (let i = 0; i < 10; i++) {
      await expect(page.locator('.quiz-card img')).toBeVisible();
      await page.getByRole('button', { name: 'Pfand', exact: true }).click();
      await page.getByRole('button', { name: /verstanden/i }).click();
    }

    // Navigate back home
    await page.getByRole('button', { name: /zur startseite/i }).click();
    await expect(page.locator('#screen-home')).toBeVisible();

    // Scoreboard on home screen shows the player
    await expect(page.locator('#screen-home')).toContainText(/Scoreboard-Check/i);
  });

  test('name field rejects empty input', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /quiz starten/i }).click();

    // Should stay on home screen — quiz screen must NOT be visible
    await expect(page.locator('#screen-home')).toBeVisible();
    await expect(page.locator('#screen-quiz')).not.toBeVisible();
  });
});

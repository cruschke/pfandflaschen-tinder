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

      // Dismiss any blocking feedback panel before swiping
      const feedbackBtn = page.getByRole('button', { name: /verstanden/i });
      if (await feedbackBtn.isVisible()) {
        await feedbackBtn.click();
      }

      // Use action button "Kein Pfand" (left / non-returnable) for all — consistent answers
      await page.getByRole('button', { name: /kein pfand/i }).click();

      // If a feedback panel blocks, dismiss it
      const nextBtn = page.getByRole('button', { name: /verstanden/i });
      if (await nextBtn.isVisible({ timeout: 600 })) {
        await nextBtn.click();
      }
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

      const feedbackBtn = page.getByRole('button', { name: /verstanden/i });
      if (await feedbackBtn.isVisible()) {
        await feedbackBtn.click();
      }

      await page.getByRole('button', { name: 'Pfand', exact: true }).click();

      const nextBtn = page.getByRole('button', { name: /verstanden/i });
      if (await nextBtn.isVisible({ timeout: 600 })) {
        await nextBtn.click();
      }
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

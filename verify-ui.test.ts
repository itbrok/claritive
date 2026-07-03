import { test, expect } from '@playwright/test';

test('verify popup structure', async ({ page }) => {
  await page.goto('http://localhost:5173/index.html');
  await expect(page.locator('h1')).toContainText('Claritive');
  await expect(page.locator('textarea')).toBeVisible();
  await page.screenshot({ path: 'popup-screenshot.png' });
});

test('verify sidepanel structure', async ({ page }) => {
  await page.goto('http://localhost:5173/sidepanel.html');
  await expect(page.locator('h1')).toContainText('Claritive');
  await expect(page.locator('textarea')).toBeVisible();
  await page.screenshot({ path: 'sidepanel-screenshot.png' });
});

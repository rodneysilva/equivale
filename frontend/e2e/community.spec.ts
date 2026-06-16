import { test, expect } from '@playwright/test';

test.describe('Communities', () => {
  test('should list communities', async ({ page }) => {
    await page.goto('/communities');
    await expect(page.getByText('Criar comunidade')).toBeVisible();
  });

  test('should require login for creating community', async ({ page }) => {
    await page.goto('/communities/new');
    await expect(page).toHaveURL(/\/login/);
  });
});

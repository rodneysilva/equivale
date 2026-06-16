import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navbar has main links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Comunidades')).toBeVisible();
    await expect(page.getByText('Produtos')).toBeVisible();
    await expect(page.getByText('Serviços')).toBeVisible();
  });

  test('footer has marketplace links', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer').getByText('Marketplace')).toBeVisible();
  });
});

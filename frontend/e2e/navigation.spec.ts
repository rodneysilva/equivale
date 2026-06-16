import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navbar has main links', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('button', { name: 'Comunidades' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Produtos' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Serviços' })).toBeVisible();
  });

  test('footer has marketplace links', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer').getByText('Marketplace')).toBeVisible();
  });
});

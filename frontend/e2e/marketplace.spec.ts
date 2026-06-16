import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test('should show homepage with sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Comunidades em destaque')).toBeVisible();
    await expect(page.getByText('Produtos recentes')).toBeVisible();
    await expect(page.getByText('Serviços recentes')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Produtos');
    await expect(page).toHaveURL(/\/products/);
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Serviços');
    await expect(page).toHaveURL(/\/services/);
  });

  test('should navigate to communities page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Comunidades');
    await expect(page).toHaveURL(/\/communities/);
  });

  test('should have working search', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/search/);
    }
  });
});

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

  test('marketplace listing excludes sold / out-of-stock products', async ({ request }) => {
    // Regressão do bug "produto aparece disponível mas compra diz sem estoque":
    // a listagem pública só pode conter itens Active (e com estoque, para produtos).
    const res = await request.get('/api/products?pageSize=100');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const items: Array<{ status: string; stock?: number }> = json.items ?? [];
    expect(items.length, 'deve haver produtos listados').toBeGreaterThan(0);
    for (const p of items) {
      expect(p.status, 'produto Sold nao deve aparecer no marketplace').toBe('Active');
      expect(p.stock ?? 0, 'produto sem estoque nao deve aparecer').toBeGreaterThan(0);
    }
  });
});

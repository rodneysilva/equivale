import { test, expect } from '@playwright/test';

test.describe('Communities', () => {
  test('should list communities', async ({ page }) => {
    await page.goto('/communities');
    await expect(page.getByRole('heading', { name: 'Comunidades' })).toBeVisible();
  });

  test('every community has creatorName populated (legacy fallback)', async ({ request }) => {
    // Regressão do CreatorName: docs legados/orfãos devem ter o nome do criador resolvido
    // (seja embutido no documento, seja via DtoEnricher em runtime).
    const res = await request.get('/api/communities?pageSize=100');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const items: Array<{ name: string; creatorName: string | null }> = json.items ?? [];
    expect(items.length, 'deve haver comunidades').toBeGreaterThan(0);
    const missing = items.filter((c) => !c.creatorName);
    expect(missing, `comunidades sem creatorName: ${missing.map((c) => c.name).join(', ')}`).toEqual([]);
  });

  test('should require login for creating community', async ({ page }) => {
    await page.goto('/communities/new');
    await expect(page).toHaveURL(/\/login/);
  });
});

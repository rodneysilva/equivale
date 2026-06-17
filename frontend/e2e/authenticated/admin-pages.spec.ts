import { test, expect } from '@playwright/test';

// Smoke das páginas admin: cada rota carrega sem erro e exibe seu heading.
// Como admin, percorre /admin e suas subpáginas. Aceita empty-state (heading com count 0).
test.describe('Páginas administrativas (smoke)', () => {
  const cases: Array<{ name: string; url: string; heading: RegExp }> = [
    { name: 'dashboard', url: '/admin', heading: /Painel Administrativo/ },
    { name: 'usuários', url: '/admin/users', heading: /Usuários/ },
    { name: 'produtos', url: '/admin/products', heading: /Produtos/ },
    { name: 'serviços', url: '/admin/services', heading: /Serviços/ },
    { name: 'comunidades', url: '/admin/communities', heading: /Comunidades/ },
    { name: 'transações', url: '/admin/transactions', heading: /Transações/ },
  ];

  for (const c of cases) {
    test(`/${c.url.slice(1)} carrega com heading`, async ({ page }) => {
      await page.goto(c.url);
      await expect(page.getByRole('heading', { name: c.heading }).first()).toBeVisible({ timeout: 10_000 });
    });
  }
});

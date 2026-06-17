import { test, expect } from '@playwright/test';

// Excluir produto: cria via API (admin = dono), abre o detalhe como dono, clica em
// "Excluir", confirma no modal e valida que o produto some (GET /api/products/{id} → 404).
test.describe('Excluir produto (autenticado)', () => {
  test('cria um produto, exclui pela UI e valida 404 no backend', async ({ page }) => {
    const api = page.request;
    const title = `Excluir E2E ${Date.now()}`;

    const createRes = await api.post('/api/products', {
      data: { title, description: 'desc para exclusão', category: 'Arte', priceInEquivale: 5, images: [], condition: 'new' },
    });
    if (!createRes.ok()) {
      const t = await createRes.text().catch(() => '');
      throw new Error(`create falhou ${createRes.status()}: ${t}`);
    }
    const created = await createRes.json();
    expect(created.id, 'produto criado').toBeTruthy();

    // Abre o detalhe como dono (admin é o sellerId).
    await page.goto(`/products/${created.id}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible({ timeout: 10_000 });

    // Cartão de dono visível → clica no botão "Excluir" do cartão.
    await expect(page.getByText('Este é o seu produto')).toBeVisible();
    await page.getByRole('button', { name: 'Excluir' }).first().click();

    // Modal de confirmação abre → clica no "Excluir" do modal (última ocorrência).
    await expect(page.getByText(/Tem certeza que deseja excluir/)).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: 'Excluir' }).last().click();

    // Redireciona para a listagem de produtos.
    await expect(page).toHaveURL(/\/products$/);

    // Backend confirma exclusão.
    const after = await api.get(`/api/products/${created.id}`);
    expect(after.status(), 'produto excluído → 404').toBe(404);
  });
});

import { test, expect } from '@playwright/test';

// Edição de serviço: garante que /services/:id/edit existe, o form abre preenchido
// e ao salvar o serviço é atualizado. (Regressão: a rota de edição não existia.)
test.describe('Editar serviço (autenticado)', () => {
  test('abre o formulário preenchido, altera o título e salva', async ({ page }) => {
    const api = page.request;

    // 1) Cria um serviço (admin é o dono) — payload no shape do backend.
    const original = `Serv Editar E2E ${Date.now()}`;
    const createRes = await api.post('/api/services', {
      data: { title: original, description: 'desc', category: 'Design', priceInEquivale: 30, images: [] },
    });
    if (!createRes.ok()) {
      throw new Error(`create servico falhou ${createRes.status()}: ${await createRes.text().catch(() => '')}`);
    }
    const created = await createRes.json();
    expect(created.id, 'serviço criado').toBeTruthy();

    // 2) Abre a edição.
    await page.goto(`/services/${created.id}/edit`);
    await expect(page.getByRole('heading', { name: 'Editar serviço' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Salvar alterações/ })).toBeVisible({ timeout: 10_000 });

    // 3) Form preenchido com o título atual.
    const titleInput = page.locator('input[placeholder="Ex.: Design de identidade visual"]');
    await expect(titleInput).toHaveValue(original);

    // 4) Altera e salva.
    const novo = `Serv Editado E2E ${Date.now()}`;
    await titleInput.fill(novo);
    await page.getByRole('button', { name: /Salvar alterações/ }).click();

    // 5) Redireciona pro detalhe com o título novo.
    await expect(page).toHaveURL(new RegExp(`/services/${created.id}$`));
    await expect(page.getByText(novo).first()).toBeVisible({ timeout: 10_000 });

    // 6) Persistiu no backend.
    const after = await (await api.get(`/api/services/${created.id}`)).json();
    expect(after.title, 'titulo persistido').toBe(novo);
  });
});

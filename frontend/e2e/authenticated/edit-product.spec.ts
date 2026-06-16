import { test, expect } from '@playwright/test';

// Edição de produto: garante que a rota /products/:id/edit existe, o form abre
// preenchido com os dados atuais, e ao salvar o produto é atualizado.
// (Regressão do bug: a rota de edição não existia e a página abria vazia.)
test.describe('Editar produto (autenticado)', () => {
  test('abre o formulário preenchido, altera o título e salva', async ({ page }) => {
    const api = page.request;

    // 1) Cria um produto (admin é o dono) — payload no shape do backend.
    const original = `Editar E2E ${Date.now()}`;
    const createRes = await api.post('/api/products', {
      data: { title: original, description: 'desc', category: 'Arte', priceInEquivale: 25, images: [], condition: 'new' },
    });
    if (!createRes.ok()) {
      const t = await createRes.text().catch(() => '');
      throw new Error(`create falhou ${createRes.status()}: ${t}`);
    }
    const created = await createRes.json();
    expect(created.id, 'produto criado').toBeTruthy();

    // 2) Abre a página de edição — não deve mais ficar vazia.
    await page.goto(`/products/${created.id}/edit`);
    await expect(page.getByRole('heading', { name: 'Editar produto' })).toBeVisible();
    // Espera o form renderizar (loading do produto concluído) antes de checar valores.
    await expect(page.getByRole('button', { name: /Salvar alterações/ })).toBeVisible({ timeout: 10_000 });

    // 3) O formulário vem preenchido com o título atual.
    const titleInput = page.locator('input[placeholder="Ex.: Cadeira de madeira artesanal"]');
    await expect(titleInput).toHaveValue(original);

    // 4) Altera o título e salva.
    const novo = `Editado E2E ${Date.now()}`;
    await titleInput.fill(novo);
    await page.getByRole('button', { name: /Salvar alterações/ }).click();

    // 5) Redireciona pro detalhe com o título novo.
    await expect(page).toHaveURL(new RegExp(`/products/${created.id}$`));
    await expect(page.getByText(novo).first()).toBeVisible({ timeout: 10_000 });

    // 6) Confirma no backend que persistiu.
    const after = await (await api.get(`/api/products/${created.id}`)).json();
    expect(after.title, 'titulo persistido').toBe(novo);
  });
});

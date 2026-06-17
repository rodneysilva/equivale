import { test, expect } from '@playwright/test';

// CRUD de serviço: cria via UI (admin = provider), valida que aparece em /services
// e abre o detalhe do dono.
//
// GAP CONHECIDO (edição): NÃO existe rota/página de edição de serviço.
// O ServiceDetailPage tem um botão "Editar" que navega para `/services/:id/edit`,
// mas essa rota NÃO está registrada em src/App.tsx (apenas /services/new e /services/:id).
// Clicar em "Editar" cai num fallback vazio. Por isso o teste de edição foi OMITIDO
// (não há UI funcional para testar). Quando a rota for adicionada, espelhe edit-product.spec.ts.
const uniqueTitle = () => `Serviço E2E ${Date.now()}`;

test.describe('Criar serviço (autenticado)', () => {
  test('preenche o formulário, publica e vê o serviço na listagem e no detalhe', async ({ page }) => {
    const title = uniqueTitle();

    await page.goto('/services/new');
    await expect(page.getByRole('heading', { name: 'Oferecer serviço' })).toBeVisible();

    await page.locator('input[placeholder="Ex.: Design de identidade visual"]').fill(title);
    await page.getByPlaceholder('Descreva o serviço, o que inclui e como funciona').fill('Descrição gerada automaticamente pelo teste E2E.');
    await page.locator('input[placeholder="20"]').fill('30');

    await page.getByRole('button', { name: 'Publicar serviço' }).click();

    // Redireciona para a listagem de serviços.
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10_000 });

    // Localiza o serviço recém-criado via API (busca por título exato) e abre o detalhe.
    const search = new URLSearchParams({ page: '1', pageSize: '24', search: title });
    const list = await (await page.request.get(`/api/services?${search.toString()}`)).json();
    const created = (list.data ?? list.items ?? []).find((s: any) => s.title === title);
    expect(created, 'serviço criado encontrado via API').toBeTruthy();

    await page.goto(`/services/${created.id}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible({ timeout: 10_000 });
  });

  test('valida campos obrigatórios antes de publicar', async ({ page }) => {
    await page.goto('/services/new');

    await expect(page.locator('input[placeholder="Ex.: Design de identidade visual"]')).toHaveAttribute('required');
    await expect(page.locator('input[placeholder="20"]')).toHaveAttribute('required');
  });
});

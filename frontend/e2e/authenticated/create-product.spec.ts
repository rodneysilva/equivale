import { test, expect } from '@playwright/test';

const uniqueTitle = () => `Produto E2E ${Date.now()}`;

test.describe('Criar produto (autenticado)', () => {
  test('preenche o formulário e publica um produto', async ({ page }) => {
    const title = uniqueTitle();

    await page.goto('/products/new');
    await expect(page.getByRole('heading', { name: 'Publicar produto' })).toBeVisible();

    await page.locator('input[placeholder="Ex.: Cadeira de madeira artesanal"]').fill(title);
    await page.getByPlaceholder('Descreva o produto, seu estado e o que você espera em troca').fill('Descrição gerada automaticamente pelo teste E2E.');
    await page.locator('input[placeholder="10"]').fill('12.5');

    await page.getByRole('button', { name: 'Publicar produto' }).click();

    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10_000 });
  });

  test('valida campos obrigatórios antes de publicar', async ({ page }) => {
    await page.goto('/products/new');

    await expect(page.locator('input[placeholder="Ex.: Cadeira de madeira artesanal"]')).toHaveAttribute('required');
    await expect(page.locator('input[placeholder="10"]')).toHaveAttribute('required');
  });
});

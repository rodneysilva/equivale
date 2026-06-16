import { test, expect } from '@playwright/test';

interface BackendProduct {
  id: string;
  sellerId: string;
  stock: number;
  priceInEquivale: number;
}

// Seleciona via API um produto comprável pelo usuário logado (não próprio, com estoque).
// Evita corridas de UI na grade (produto esgotado/próprio aparecendo no topo).
async function pickBuyableProductId(page: import('@playwright/test').Page): Promise<string> {
  const res = await page.request.get('/api/products?pageSize=100');
  expect(res.ok(), 'GET /products falhou — backend está no ar?').toBeTruthy();
  const json = await res.json();

  const me = await page.request.get('/api/auth/profile');
  const meId = me.ok() ? (await me.json()).id : null;

  const candidate = (json.items as BackendProduct[]).find(
    (p) => p.stock > 0 && p.sellerId !== meId,
  );
  if (!candidate) throw new Error('Nenhum produto comprável (não próprio, com estoque) encontrado. Rode o seed.');
  return candidate.id;
}

test.describe('Fluxo de compra (autenticado)', () => {
  test('abre um produto, finaliza checkout e vê o pedido', async ({ page }) => {
    const productId = await pickBuyableProductId(page);
    await page.goto(`/products/${productId}`);
    await expect(page.locator('h1.text-2xl').first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /^Comprar$/ }).click();
    await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();

    await page.getByPlaceholder('Rua, número, bairro, cidade, CEP...').fill('Rua das Flores, 123 - Centro - São Paulo/SP - 01000-000');
    await page.getByRole('button', { name: 'Confirmar compra' }).click();

    await expect(page).toHaveURL(/\/transactions$/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Meus Pedidos' })).toBeVisible();
  });
});

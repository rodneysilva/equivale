import { test, expect } from '@playwright/test';
import { request as pwRequest } from 'playwright';

const SELLER_PASSWORD = process.env.E2E_SELLER_PASSWORD || 'Eql@2026';
const BASE_URL = 'http://localhost:3000';

// Cria uma transação onde o admin é comprador e um usuário seed é vendedor,
// devolvendo a tx + dados do vendedor (email p/ login two-actor).
async function setupBuyerTransaction(page: import('@playwright/test').Page) {
  const me = await (await page.request.get('/api/auth/profile')).json();
  const prods = (await (await page.request.get('/api/products?pageSize=100')).json()).items as Array<{
    id: string; sellerId: string; stock: number;
  }>;
  const prod = prods.find((p) => p.sellerId !== me.id && p.stock > 0);
  expect(prod, 'precisa de um produto comprável de outro vendedor').toBeTruthy();

  const tx = await (await page.request.post('/api/transactions', {
    data: { itemId: prod!.id, itemType: 'Product', quantity: 1, deliveryAddress: 'Rua Teste E2E, 123' },
  })).json();
  const seller = await (await page.request.get(`/api/users/${tx.sellerId}`)).json();
  return { txId: tx.id as string, buyerId: me.id as string, sellerEmail: seller.email as string };
}

test.describe('Chat comprador/vendedor (two-actor)', () => {
  test('buyer envia pela UI, seller responde via API, buyer vê a resposta (polling)', async ({ page }) => {
    const { txId, buyerId, sellerEmail } = await setupBuyerTransaction(page);

    // Buyer (UI): abre o chat e envia uma mensagem.
    await page.goto(`/transactions/${txId}/chat`);
    await expect(page.getByPlaceholder('Escreva uma mensagem...')).toBeVisible({ timeout: 10_000 });
    await page.getByPlaceholder('Escreva uma mensagem...').fill('Olá do comprador');
    await page.getByRole('button', { name: /^Enviar$/ }).click();
    await expect(page.getByText('Olá do comprador')).toBeVisible();

    // Seller (contexto API isolado): lê o chat, confirma que vê a msg do buyer, e responde.
    const sellerCtx = await pwRequest.newContext({ baseURL: BASE_URL });
    try {
      const login = await sellerCtx.post('/api/auth/login', { data: { email: sellerEmail, password: SELLER_PASSWORD } });
      expect(login.ok(), `login do seller (${sellerEmail})`).toBeTruthy();

      const chat = await (await sellerCtx.get(`/api/transactions/${txId}/chat`)).json();
      expect(chat.some((m: any) => m.content === 'Olá do comprador' && m.senderId === buyerId),
        'seller deve ver a mensagem enviada pelo buyer').toBeTruthy();

      const reply = await sellerCtx.post(`/api/transactions/${txId}/chat`, { data: { content: 'Oi do vendedor' } });
      expect(reply.status(), 'POST do seller deve criar a mensagem').toBe(201);
    } finally {
      await sellerCtx.dispose();
    }

    // Buyer (UI): o polling (5s) deve trazer a resposta do vendedor.
    await expect(page.getByText('Oi do vendedor')).toBeVisible({ timeout: 15_000 });
  });
});

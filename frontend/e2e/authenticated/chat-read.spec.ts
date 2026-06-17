import { test, expect } from '@playwright/test';
import { request as pwRequest } from 'playwright';

const SELLER_PASSWORD = process.env.E2E_SELLER_PASSWORD || 'Eql@2026';
const BASE_URL = 'http://localhost:3000';

// Read-status: uma mensagem enviada pelo comprador conta como não-lida para o
// vendedor; quando o vendedor abre o chat (GET), o contador diminui.
test.describe('Chat — marcação de leitura / badge', () => {
  test('mensagem enviada conta como não-lida; abrir o chat decrementa', async ({ page }) => {
    const api = page.request;

    // 1) Comprador (admin) cria transação + envia mensagem.
    const me = await (await api.get('/api/auth/profile')).json();
    const prods = (await (await api.get('/api/products?pageSize=100')).json()).items as Array<{
      id: string; sellerId: string; stock: number;
    }>;
    const prod = prods.find((p) => p.sellerId !== me.id && p.stock > 0);
    expect(prod, 'precisa de produto de outro vendedor').toBeTruthy();

    const tx = await (await api.post('/api/transactions', {
      data: { itemId: prod!.id, itemType: 'Product', quantity: 1, deliveryAddress: 'Rua E2E read' },
    })).json();
    const seller = await (await api.get(`/api/users/${tx.sellerId}`)).json();

    await api.post(`/api/transactions/${tx.id}/chat`, { data: { content: 'unread E2E msg' } });

    // 2) Vendedor (contexto API isolado): contador de não-lidas > 0.
    const sellerCtx = await pwRequest.newContext({ baseURL: BASE_URL });
    try {
      const login = await sellerCtx.post('/api/auth/login', { data: { email: seller.email, password: SELLER_PASSWORD } });
      expect(login.ok(), `login do seller (${seller.email})`).toBeTruthy();

      const before = await (await sellerCtx.get('/api/transactions/unread-chat-count')).json();
      expect(before, 'vendedor tem não-lidas > 0 após mensagem').toBeGreaterThan(0);

      // 3) Vendedor abre o chat (GET marca como lido).
      await sellerCtx.get(`/api/transactions/${tx.id}/chat`);

      const after = await (await sellerCtx.get('/api/transactions/unread-chat-count')).json();
      expect(after, 'abrir o chat decrementa as não-lidas').toBeLessThan(before);
    } finally {
      await sellerCtx.dispose();
    }
  });
});

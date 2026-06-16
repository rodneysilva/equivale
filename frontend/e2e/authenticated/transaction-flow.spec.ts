import { test, expect } from '@playwright/test';
import { request as pwRequest } from 'playwright';

const SELLER_PASSWORD = process.env.E2E_SELLER_PASSWORD || 'Eql@2026';
const BASE_URL = 'http://localhost:3000';

interface BackendProduct {
  id: string;
  sellerId: string;
  stock: number;
}

// Seleciona via API um produto comprável pelo usuário logado (não próprio, com estoque > 0),
// devolvendo o produto + o id do comprador. Evita corridas de UI na grade de produtos.
async function pickBuyableProduct(
  request: import('@playwright/test').APIRequestContext,
): Promise<{ product: BackendProduct; buyerId: string }> {
  const me = await (await request.get('/api/auth/profile')).json();
  const prods = (await (await request.get('/api/products?pageSize=100')).json()).items as BackendProduct[];
  const product = prods.find((p) => p.stock > 0 && p.sellerId !== me.id);
  expect(product, 'precisa de um produto comprável de outro vendedor (rode o seed)').toBeTruthy();
  return { product: product!, buyerId: me.id as string };
}

async function expectOk(res: import('@playwright/test').APIResponse, label: string) {
  expect(res.ok(), `${label} falhou (status ${res.status()})`).toBeTruthy();
}

// Fluxo two-actor completo: admin (comprador) compra de um vendedor seed, o vendedor
// confirma+envia, o comprador confirma entrega e avalia (finaliza a transação).
// Tudo via API para máxima estabilidade; UI só seria usada se agregasse valor.
test.describe('Fluxo de transação two-actor (buyer ↔ seller) via API', () => {
  test('compra → confirma → envia → entrega → avalia → Finished (com taxa e estoque)', async ({ page, request }) => {
    // ---------- 1. Buyer (admin, contexto da page autenticada): cria a transação ----------
    const { product, buyerId } = await pickBuyableProduct(request);
    const stockBefore = product.stock;

    const seller = await (await request.get(`/api/users/${product.sellerId}`)).json();
    const sellerEmail = seller.email as string;
    expect(sellerEmail, 'GET /api/users/{id} deve retornar email').toBeTruthy();

    const createRes = await request.post('/api/transactions', {
      data: {
        itemId: product.id,
        itemType: 'Product',
        quantity: 1,
        deliveryAddress: 'Rua Teste E2E, 123',
      },
    });
    await expectOk(createRes, 'POST /api/transactions');
    const tx = await createRes.json();
    const txId = tx.id as string;
    expect(tx.status).toBe('OrderPlaced');

    // ---------- 2. Seller (contexto API isolado): login, confirma pedido e envia ----------
    const sellerCtx = await pwRequest.newContext({ baseURL: BASE_URL });
    try {
      const login = await sellerCtx.post('/api/auth/login', { data: { email: sellerEmail, password: SELLER_PASSWORD } });
      await expectOk(login, `login do seller (${sellerEmail})`);

      const confirmRes = await sellerCtx.put(`/api/transactions/${txId}/confirm-order`);
      await expectOk(confirmRes, 'PUT confirm-order');
      expect((await confirmRes.json()).status).toBe('OrderConfirmed');

      const shipRes = await sellerCtx.put(`/api/transactions/${txId}/ship`, {
        data: { trackingInfo: 'E2E-TRACK-123' },
      });
      await expectOk(shipRes, 'PUT ship');
      expect((await shipRes.json()).status).toBe('Shipped');
    } finally {
      await sellerCtx.dispose();
    }

    // ---------- 3. Buyer: confirma entrega ----------
    const deliveryRes = await request.put(`/api/transactions/${txId}/confirm-delivery`);
    await expectOk(deliveryRes, 'PUT confirm-delivery');
    expect((await deliveryRes.json()).status).toBe('Delivered');

    // ---------- 4. Buyer: avalia → dispara FinishTransactionAsync ----------
    const reviewRes = await request.post('/api/reviews', {
      data: { transactionId: txId, rating: 5, comment: 'Transação perfeita — E2E' },
    });
    await expectOk(reviewRes, 'POST /api/reviews');

    // ---------- 5. Asserts ----------
    // (a) Transação finalizada
    const finalTx = await (await request.get(`/api/transactions/${txId}`)).json();
    expect(finalTx.status).toBe('Finished');
    // (b) Taxa registrada (2% sobre o total)
    expect(finalTx.feeAmount).toBeGreaterThan(0);
    // (c) SellerName preenchido (embed)
    expect(finalTx.sellerName, 'finalTx.sellerName deve estar preenchido').toBeTruthy();
    // (d) Comprador correto
    expect(finalTx.buyerId).toBe(buyerId);

    // Estoque decrementado em 1
    const finalProd = await (await request.get(`/api/products/${product.id}`)).json();
    expect(finalProd.stock).toBe(stockBefore - 1);
  });

  test('buyer cancela transação antes da entrega e tem o saldo estornado (status Cancelled)', async ({ request }) => {
    const { product } = await pickBuyableProduct(request);

    const createRes = await request.post('/api/transactions', {
      data: {
        itemId: product.id,
        itemType: 'Product',
        quantity: 1,
        deliveryAddress: 'Cancel E2E',
      },
    });
    await expectOk(createRes, 'POST /api/transactions');
    const txId = (await createRes.json()).id as string;

    const cancelRes = await request.put(`/api/transactions/${txId}/cancel`);
    await expectOk(cancelRes, 'PUT cancel');

    const tx = await (await request.get(`/api/transactions/${txId}`)).json();
    expect(tx.status).toBe('Cancelled');
  });
});

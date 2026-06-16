import { test, expect } from '@playwright/test';

// Demurrage: valida o preview (dry-run) do cálculo anti-inflação.
// NÃO executa /run (destrutivo — debita saldos reais); só valida a leitura do cálculo.
test.describe('Demurrage (admin preview)', () => {
  test('preview retorna lista de usuários com elegibilidade e isenções', async ({ page }) => {
    const res = await page.request.get('/api/admin/demurrage/preview');
    expect(res.ok(), 'preview 200').toBeTruthy();
    const json = await res.json();
    expect(Array.isArray(json.items), 'items é array').toBeTruthy();
    expect(json.items.length, 'deve haver usuários').toBeGreaterThan(0);

    for (const u of json.items as Array<{
      userId: string; userName: string; balance: number; wouldCharge: number; exempt: boolean; reason: string;
    }>) {
      expect(u.userId).toBeTruthy();
      expect(typeof u.balance).toBe('number');
      expect(typeof u.exempt).toBe('boolean');
      expect(u.reason, 'tem motivo de isenção/cobrança').toBeTruthy();
      // Se isento, não cobra; se cobra, é > 0 e <= 0.5% do saldo acima do piso.
      if (u.exempt) {
        expect(u.wouldCharge, 'isento não cobra').toBe(0);
      } else {
        expect(u.wouldCharge, 'elegível cobra valor positivo').toBeGreaterThan(0);
        const maxCharge = u.balance * 0.005;
        expect(u.wouldCharge, 'cobrança <= 0.5% do saldo').toBeLessThanOrEqual(maxCharge + 0.01);
      }
    }
  });
});

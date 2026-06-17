import { test, expect } from '@playwright/test';

// Carteira: smoke estável. Valida que /wallet carrega com o heading e exibe o saldo.
test.describe('Carteira (autenticado)', () => {
  test('carrega a página e exibe saldo disponível', async ({ page }) => {
    await page.goto('/wallet');
    await expect(page.getByRole('heading', { name: /Carteira/ })).toBeVisible();

    // Aguarda o carregamento concluir (sai do spinner) e exibe o card de saldo.
    await expect(page.getByText('Saldo disponível (EQL)')).toBeVisible({ timeout: 10_000 });

    // O título "Extrato de movimentações" está sempre presente (mesmo com lista vazia).
    await expect(page.getByText('Extrato de movimentações')).toBeVisible();
  });
});

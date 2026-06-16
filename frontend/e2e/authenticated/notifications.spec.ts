import { test, expect } from '@playwright/test';

test.describe('Notificações (autenticado)', () => {
  test('carrega a página e mostra lista ou estado vazio', async ({ page }) => {
    await page.goto('/notifications');

    await expect(page.getByRole('heading', { name: 'Notificações' })).toBeVisible();

    // Estado aceito: listagem de itens OU empty state "Você não tem notificações."
    // Em ambos os casos, nenhum erro deve aparecer.
    const emptyState = page.getByText('Você não tem notificações.');
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    if (!hasEmpty) {
      // Há notificações — verifica que ao menos um Card de notificação renderiza.
      await expect(page.locator('.eq-card').first()).toBeVisible({ timeout: 10_000 });
    }
  });
});

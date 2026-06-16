import { test, expect } from '@playwright/test';

test.describe('Onboarding (autenticado)', () => {
  test('renderiza o wizard e completa os 3 passos até a home', async ({ page }) => {
    await page.goto('/onboarding');

    // Passo 1 — perfil: heading + textarea de bio.
    await expect(page.getByRole('heading', { name: /Bem-vindo/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seu perfil' })).toBeVisible();

    const bio = page.getByPlaceholder('Escreva uma breve descrição sobre você, seus interesses e o que você oferece...');
    await bio.fill(`Bio de teste E2E ${Date.now()}`);
    await page.getByRole('button', { name: /Continuar/ }).click();

    // Passo 2 — comunidade: lista carrega e botão Continuar segue para o passo 3.
    await expect(page.getByRole('heading', { name: /Encontre sua comunidade/i })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Continuar/ }).click();

    // Passo 3 — publicar: botão "Pular e ir para o início" redireciona para a home.
    await expect(page.getByRole('heading', { name: 'Publique algo' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Pular e ir para o início/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
  });
});

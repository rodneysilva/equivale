import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  });

  test('should show register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible();
  });

  test('should navigate to login from register', async ({ page }) => {
    await page.goto('/register');
    // O link "Entrar" fica fora do <form>, dentro do card (frase "Já tem conta?").
    await page.getByText('Já tem conta?').locator('..').getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Seu e-mail').fill('rodneydocarmo@gmail.com');
    await page.getByPlaceholder('Senha').fill('123Mudar!');
    await page.locator('form').getByRole('button', { name: /Entrar/ }).click();

    // Login com sucesso redireciona para a home ou para o onboarding (toHaveURL bate contra a URL completa).
    await expect(page).toHaveURL(/\/(onboarding)?$/, { timeout: 10_000 });
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Seu e-mail').fill('rodneydocarmo@gmail.com');
    await page.getByPlaceholder('Senha').fill('senha-errada-123');
    await page.locator('form').getByRole('button', { name: /Entrar/ }).click();

    // 401 do backend vira "Unauthorized" no card de login.
    await expect(page.getByText(/unauthorized|credenciais|inválid/i)).toBeVisible({ timeout: 10_000 });
  });
});

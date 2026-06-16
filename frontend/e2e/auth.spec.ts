import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Entrar')).toBeVisible();
  });

  test('should show register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Criar conta')).toBeVisible();
  });

  test('should navigate to login from register', async ({ page }) => {
    await page.goto('/register');
    await page.click('text=Entrar');
    await expect(page).toHaveURL(/\/login/);
  });
});

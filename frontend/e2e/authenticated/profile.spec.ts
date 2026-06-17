import { test, expect } from '@playwright/test';

// Perfil: abre /profile, valida o heading e entra em edição, altera a bio, salva e
// confirma persistência via GET /api/auth/profile.
test.describe('Perfil (autenticado)', () => {
  test('carrega, edita a bio e salva com persistência no backend', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Meu Perfil' })).toBeVisible();

    // Entra em modo edição.
    await page.getByRole('button', { name: 'Editar' }).click();

    // Form de edição renderiza.
    const bioInput = page.getByPlaceholder('Conte sobre você...');
    await expect(bioInput).toBeVisible({ timeout: 5_000 });

    // Altera a bio para um valor único.
    const newBio = `Bio E2E ${Date.now()}`;
    await bioInput.fill(newBio);

    await page.getByRole('button', { name: 'Salvar' }).click();

    // Feedback de sucesso aparece.
    await expect(page.getByText('Perfil atualizado!')).toBeVisible({ timeout: 10_000 });

    // Persistência confirmada no backend.
    const profile = await (await page.request.get('/api/auth/profile')).json();
    expect(profile.bio, 'bio persistida').toBe(newBio);
  });
});

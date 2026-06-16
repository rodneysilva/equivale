import { test, expect } from '@playwright/test';

const uniqueName = () => `Comunidade E2E ${Date.now()}`;

interface BackendCommunity {
  id: string;
  name: string;
}

// Busca via API o ID da comunidade recém-criada (pelo nome único), evitando
// corrida de UI na grade de comunidades (paginação/ordem incertas).
async function findCommunityIdByName(page: import('@playwright/test').Page, name: string): Promise<string> {
  const res = await page.request.get('/api/communities?pageSize=100');
  expect(res.ok(), 'GET /communities falhou — backend está no ar?').toBeTruthy();
  const json = await res.json();
  const items = (json.items ?? json.data ?? []) as BackendCommunity[];
  const found = items.find((c) => c.name === name);
  if (!found) throw new Error(`Comunidade "${name}" não encontrada via API.`);
  return found.id;
}

test.describe('CRUD de comunidade + posts + comentários (autenticado)', () => {
  test('cria uma comunidade, posta e comenta nela', async ({ page }) => {
    const name = uniqueName();
    const description = 'Descrição gerada automaticamente pelo teste E2E.';
    const postText = `Post E2E ${Date.now()}`;
    const commentText = `Comentário E2E ${Date.now()}`;

    // 1) Criar comunidade via UI.
    await page.goto('/communities/new');
    await expect(page.getByRole('heading', { name: 'Criar comunidade' })).toBeVisible();

    await page.getByPlaceholder('Nome da comunidade').fill(name);
    await page.getByPlaceholder('Descreva o propósito da comunidade').fill(description);
    await page.getByRole('button', { name: 'Criar comunidade' }).click();

    // 2) Redireciona para a lista.
    await expect(page).toHaveURL(/\/communities$/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Comunidades' })).toBeVisible();

    // 3) Entrar no detail (via ID obtido pela API — robusto contra paginação/ordem da grade,
    //    já que a nova comunidade pode não aparecer na 1ª página quando há muitas).
    const communityId = await findCommunityIdByName(page, name);
    await page.goto(`/communities/${communityId}`);

    // Como criador, já é membro: a seção de conversas fica visível.
    await expect(page.getByRole('heading', { name: /Conversas/i })).toBeVisible({ timeout: 10_000 });

    // 4) Publicar um post.
    await page.getByPlaceholder('Compartilhe algo com a comunidade...').fill(postText);
    await page.getByRole('button', { name: 'Publicar' }).click();
    await expect(page.getByText(postText).first()).toBeVisible({ timeout: 10_000 });

    // 5) Comentar no post.
    await page.getByPlaceholder('Escreva um comentário...').fill(commentText);
    await page.getByRole('button', { name: /Enviar/ }).click();
    await expect(page.getByText(commentText).first()).toBeVisible({ timeout: 10_000 });
  });
});

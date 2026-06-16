import { test, expect } from '@playwright/test';

// Moderação de conteúdo: admin oculta um post e ele some da listagem pública,
// depois reexibe e ele volta. Fluxo via API (estável), com asserção no endpoint público.
test.describe('Moderação de conteúdo (admin)', () => {
  test('oculta e reexibe um post; some/aparece na listagem pública', async ({ page }) => {
    const api = page.request;

    // 1) Cria comunidade + post (admin é criador/membro).
    const me = await (await api.get('/api/auth/profile')).json();
    const comm = await (await api.post('/api/communities', {
      data: { name: `Mod Test ${Date.now()}`, description: 'x', creatorId: me.id, type: 'open', productVisibility: 'public' },
    })).json();
    expect(comm.id, 'comunidade criada').toBeTruthy();

    const post = await (await api.post(`/api/communities/${comm.id}/posts`, {
      data: { content: `Post mod ${Date.now()}` },
    })).json();
    expect(post.id, 'post criado').toBeTruthy();

    // 2) Antes de ocultar: aparece na listagem pública.
    const before = (await (await api.get(`/api/communities/${comm.id}/posts`)).json()).items ?? [];
    expect(before.some((p: any) => p.id === post.id), 'visível antes').toBeTruthy();

    // 3) Admin oculta.
    expect((await api.put(`/api/admin/moderation/posts/${post.id}/hide`)).ok(), 'hide').toBeTruthy();

    // 4) Oculto: NÃO aparece publicamente.
    const hidden = (await (await api.get(`/api/communities/${comm.id}/posts`)).json()).items ?? [];
    expect(hidden.some((p: any) => p.id === post.id), 'some da listagem pública').toBeFalsy();

    // 5) Reexibe: volta a aparecer.
    expect((await api.put(`/api/admin/moderation/posts/${post.id}/unhide`)).ok(), 'unhide').toBeTruthy();
    const after = (await (await api.get(`/api/communities/${comm.id}/posts`)).json()).items ?? [];
    expect(after.some((p: any) => p.id === post.id), 'visível depois').toBeTruthy();
  });
});

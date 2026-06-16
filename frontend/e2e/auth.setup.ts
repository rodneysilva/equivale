import { test as setup, expect, request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '.auth/user.json');
const API_URL = process.env.E2E_API_URL || 'http://localhost:5053';
const EMAIL = process.env.E2E_USER_EMAIL || 'rodneydocarmo@gmail.com';
const PASSWORD = process.env.E2E_USER_PASSWORD || '123Mudar!';

setup('authenticate via API', async () => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const ctx = await request.newContext({ baseURL: API_URL });
  try {
    const res = await ctx.post('/api/auth/login', {
      data: { email: EMAIL, password: PASSWORD },
    });
    expect(res.ok(), `Login falhou para ${EMAIL} — backend em ${API_URL} está rodando com seed?`).toBeTruthy();
    const body = await res.json();
    expect(body.userId, 'Resposta de login sem userId.').toBeTruthy();
    await ctx.storageState({ path: AUTH_FILE });
  } finally {
    await ctx.dispose();
  }
});

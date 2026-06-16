import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // 1 worker: testes autenticados mutam a carteira do admin (Block/Credit);
  // paralelismo causa ConcurrencyException por optimistic locking concorrente.
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
  },
  projects: [
    // 1. Faz login via API e salva o storageState (cookie eql_token) p/ os testes autenticados.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // 2. Testes anônimos (sem cookie) — smoke tests de UI.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/\/authenticated\//, /.*\.setup\.ts/],
    },
    // 3. Testes autenticados — reusam o storageState salvo pelo projeto "setup".
    //    fullyParallel:false + retries:1: esses testes mutam a carteira do admin
    //    (Block/Credit), então rodar em série evita ConcurrencyException por
    //    optimistic locking concorrente no mesmo usuário.
    {
      name: 'chromium-authenticated',
      testDir: './e2e/authenticated',
      fullyParallel: false,
      dependencies: ['setup'],
      retries: process.env.CI ? 2 : 1,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});

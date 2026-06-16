import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
    {
      name: 'chromium-authenticated',
      testDir: './e2e/authenticated',
      dependencies: ['setup'],
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

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> should show login page
- Location: e2e\auth.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Entrar')
Expected: visible
Error: strict mode violation: getByText('Entrar') resolved to 4 elements:
    1) <button class="px-3 py-1.5 rounded text-sm font-medium eq-btn-ghost">Entrar</button> aka getByRole('navigation').getByRole('button', { name: 'Entrar' })
    2) <h1 class="text-xl font-bold eq-brand">Entrar</h1> aka getByRole('heading', { name: 'Entrar' })
    3) <button type="submit" class="eq-btn eq-btn-md w-full">…</button> aka getByRole('main').getByRole('button', { name: 'Entrar' })
    4) <button class="text-xs eq-link cursor-pointer">Entrar</button> aka getByRole('contentinfo').getByRole('button', { name: 'Entrar' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Entrar')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - button "eqüivale eqüivale" [ref=e7] [cursor=pointer]:
        - img "eqüivale" [ref=e8]
        - generic [ref=e9]: eqüivale
      - generic [ref=e13]:
        - textbox "Buscar produtos, serviços, comunidades..." [ref=e14]
        - button [ref=e15] [cursor=pointer]:
          - img [ref=e16]
      - generic [ref=e19]:
        - button "Comunidades" [ref=e20] [cursor=pointer]
        - button "Produtos" [ref=e21] [cursor=pointer]
        - button "Serviços" [ref=e22] [cursor=pointer]
      - generic [ref=e23]:
        - button "Toggle theme" [ref=e24] [cursor=pointer]:
          - img [ref=e25]
        - generic [ref=e27]:
          - button "Entrar" [ref=e28] [cursor=pointer]
          - button "Criar conta" [ref=e29] [cursor=pointer]
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic [ref=e34]:
        - heading "Entrar" [level=1] [ref=e35]
        - paragraph [ref=e36]: Acesse sua conta
      - generic [ref=e37]:
        - generic [ref=e38]:
          - img [ref=e39]
          - textbox "Seu e-mail" [ref=e42]
        - generic [ref=e43]:
          - img [ref=e44]
          - textbox "Senha" [ref=e47]
          - button [ref=e48] [cursor=pointer]:
            - img [ref=e49]
        - paragraph [ref=e52]: "Requisitos: 8+ caracteres, maiúscula, minúscula, número"
        - button "Entrar" [ref=e53] [cursor=pointer]:
          - text: Entrar
          - img [ref=e54]
      - paragraph [ref=e57]:
        - text: Não tem conta?
        - button "Criar conta" [ref=e58] [cursor=pointer]
  - contentinfo [ref=e59]:
    - generic [ref=e60]:
      - generic [ref=e61]:
        - generic [ref=e62]:
          - heading "eqüivale" [level=3] [ref=e63]
          - paragraph [ref=e64]: Economia colaborativa por meio de comunidades. Troque talentos e produtos com moeda virtual.
        - generic [ref=e65]:
          - heading "Marketplace" [level=4] [ref=e66]
          - list [ref=e67]:
            - listitem [ref=e68]:
              - button "Produtos" [ref=e69] [cursor=pointer]
            - listitem [ref=e70]:
              - button "Serviços" [ref=e71] [cursor=pointer]
            - listitem [ref=e72]:
              - button "Comunidades" [ref=e73] [cursor=pointer]
        - generic [ref=e74]:
          - heading "Conta" [level=4] [ref=e75]
          - list [ref=e76]:
            - listitem [ref=e77]:
              - button "Painel" [ref=e78] [cursor=pointer]
            - listitem [ref=e79]:
              - button "Carteira" [ref=e80] [cursor=pointer]
            - listitem [ref=e81]:
              - button "Entrar" [ref=e82] [cursor=pointer]
        - generic [ref=e83]:
          - heading "Legal" [level=4] [ref=e84]
          - list [ref=e85]:
            - listitem [ref=e86]: Termos de Uso
            - listitem [ref=e87]: Privacidade
            - listitem [ref=e88]: Suporte
      - generic [ref=e89]:
        - paragraph [ref=e90]: © 2026 eqüivale. Todos os direitos reservados.
        - paragraph [ref=e91]:
          - generic [ref=e92]: eqüivale
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication', () => {
  4  |   test('should show login page', async ({ page }) => {
  5  |     await page.goto('/login');
> 6  |     await expect(page.getByText('Entrar')).toBeVisible();
     |                                            ^ Error: expect(locator).toBeVisible() failed
  7  |   });
  8  | 
  9  |   test('should show register page', async ({ page }) => {
  10 |     await page.goto('/register');
  11 |     await expect(page.getByText('Criar conta')).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should navigate to login from register', async ({ page }) => {
  15 |     await page.goto('/register');
  16 |     await page.click('text=Entrar');
  17 |     await expect(page).toHaveURL(/\/login/);
  18 |   });
  19 | });
  20 | 
```
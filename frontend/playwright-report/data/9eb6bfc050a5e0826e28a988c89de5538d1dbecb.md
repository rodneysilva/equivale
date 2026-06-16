# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation >> navbar has main links
- Location: e2e\navigation.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Comunidades')
Expected: visible
Error: strict mode violation: getByText('Comunidades') resolved to 4 elements:
    1) <button class="px-2.5 py-1 rounded text-sm font-medium transition-colors">Comunidades</button> aka getByRole('navigation').getByRole('button', { name: 'Comunidades' })
    2) <h2 class="text-lg font-bold">Comunidades em destaque</h2> aka getByRole('heading', { name: 'Comunidades em destaque' })
    3) <p class="text-xs leading-relaxed eq-text-muted">Economia colaborativa por meio de comunidades. Tr…</p> aka getByText('Economia colaborativa por')
    4) <button class="text-xs eq-link cursor-pointer">Comunidades</button> aka getByRole('contentinfo').getByRole('button', { name: 'Comunidades' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Comunidades')

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
    - generic [ref=e32]:
      - generic [ref=e34]:
        - generic [ref=e35]:
          - heading "Comunidades em destaque" [level=2] [ref=e36]
          - paragraph [ref=e37]: Encontre seu grupo
        - button "Ver todos" [ref=e38] [cursor=pointer]:
          - text: Ver todos
          - img [ref=e39]
      - generic [ref=e44]:
        - generic [ref=e45]:
          - heading "Produtos recentes" [level=2] [ref=e46]
          - paragraph [ref=e47]: Últimos adicionados
        - button "Ver todos" [ref=e48] [cursor=pointer]:
          - text: Ver todos
          - img [ref=e49]
      - generic [ref=e54]:
        - generic [ref=e55]:
          - heading "Serviços recentes" [level=2] [ref=e56]
          - paragraph [ref=e57]: Talentos disponíveis
        - button "Ver todos" [ref=e58] [cursor=pointer]:
          - text: Ver todos
          - img [ref=e59]
  - contentinfo [ref=e63]:
    - generic [ref=e64]:
      - generic [ref=e65]:
        - generic [ref=e66]:
          - heading "eqüivale" [level=3] [ref=e67]
          - paragraph [ref=e68]: Economia colaborativa por meio de comunidades. Troque talentos e produtos com moeda virtual.
        - generic [ref=e69]:
          - heading "Marketplace" [level=4] [ref=e70]
          - list [ref=e71]:
            - listitem [ref=e72]:
              - button "Produtos" [ref=e73] [cursor=pointer]
            - listitem [ref=e74]:
              - button "Serviços" [ref=e75] [cursor=pointer]
            - listitem [ref=e76]:
              - button "Comunidades" [ref=e77] [cursor=pointer]
        - generic [ref=e78]:
          - heading "Conta" [level=4] [ref=e79]
          - list [ref=e80]:
            - listitem [ref=e81]:
              - button "Painel" [ref=e82] [cursor=pointer]
            - listitem [ref=e83]:
              - button "Carteira" [ref=e84] [cursor=pointer]
            - listitem [ref=e85]:
              - button "Entrar" [ref=e86] [cursor=pointer]
        - generic [ref=e87]:
          - heading "Legal" [level=4] [ref=e88]
          - list [ref=e89]:
            - listitem [ref=e90]: Termos de Uso
            - listitem [ref=e91]: Privacidade
            - listitem [ref=e92]: Suporte
      - generic [ref=e93]:
        - paragraph [ref=e94]: © 2026 eqüivale. Todos os direitos reservados.
        - paragraph [ref=e95]:
          - generic [ref=e96]: eqüivale
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Navigation', () => {
  4  |   test('navbar has main links', async ({ page }) => {
  5  |     await page.goto('/');
> 6  |     await expect(page.getByText('Comunidades')).toBeVisible();
     |                                                 ^ Error: expect(locator).toBeVisible() failed
  7  |     await expect(page.getByText('Produtos')).toBeVisible();
  8  |     await expect(page.getByText('Serviços')).toBeVisible();
  9  |   });
  10 | 
  11 |   test('footer has marketplace links', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     await page.locator('footer').scrollIntoViewIfNeeded();
  14 |     await expect(page.locator('footer').getByText('Marketplace')).toBeVisible();
  15 |   });
  16 | });
  17 | 
```
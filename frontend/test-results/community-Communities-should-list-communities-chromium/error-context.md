# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: community.spec.ts >> Communities >> should list communities
- Location: e2e\community.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Criar comunidade')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Criar comunidade')

```

```yaml
- navigation:
  - button "eqüivale eqüivale":
    - img "eqüivale"
    - text: eqüivale
  - textbox "Buscar produtos, serviços, comunidades..."
  - button:
    - img
  - button "Comunidades"
  - button "Produtos"
  - button "Serviços"
  - button "Toggle theme":
    - img
  - button "Entrar"
  - button "Criar conta"
- main:
  - heading "Comunidades" [level=1]
  - paragraph: Encontre seu grupo ou crie o seu
  - img
  - text: Aberta
  - img "Artes & Artesanato"
  - heading "Artes & Artesanato" [level=3]
  - paragraph
  - paragraph: Comunidade de artesãos, ceramistas e criadores que valorizam o feito à mão. Compartilhamos técnicas, materiais sustentáveis e apoiamos o comércio justo entre produtores independentes.
  - img
  - text: 6 membros
  - img
  - text: 0 posts
  - img
  - text: Privada
  - img "Devs Colaborativos"
  - heading "Devs Colaborativos" [level=3]
  - paragraph
  - paragraph: Desenvolvedores que trocam conhecimento, código e serviços técnicos. Open source, mutualismo digital e tecnologia a serviço de pessoas, não de corporações.
  - img
  - text: 7 membros
  - img
  - text: 0 posts
  - img
  - text: Aberta
  - img "Cozinha Vegana"
  - heading "Cozinha Vegana" [level=3]
  - paragraph
  - paragraph: Receitas, produtos e serviços veganos. Comunidade acolhedora para quem ama plantas, animais e comida de verdade. Sem exploração animal, com sabor de verdade.
  - img
  - text: 8 membros
  - img
  - text: 0 posts
  - img
  - text: Privada
  - img "Músicos Independentes"
  - heading "Músicos Independentes" [level=3]
  - paragraph
  - paragraph: Músicos, produtores e DJs que colaboram, ensinam e criam juntos. Cenário independente, sem gravadoras, direto do artista para quem escuta.
  - img
  - text: 7 membros
  - img
  - text: 0 posts
  - img
  - text: Privada
  - img "Clube da Fotografia"
  - heading "Clube da Fotografia" [level=3]
  - paragraph
  - paragraph: Fotógrafos amadores e profissionais compartilhando técnica, equipamentos e shoots. Arte visual como ferramenta de expressão e resistência.
  - img
  - text: 6 membros
  - img
  - text: 0 posts
  - img
  - text: Privada
  - img "Jardinagem & Permacultura"
  - heading "Jardinagem & Permacultura" [level=3]
  - paragraph
  - paragraph: Cultivadores urbanos, jardineiros e amantes de plantas. Autonomia alimentar, permacultura e conexão com a terra em plena cidade.
  - img
  - text: 8 membros
  - img
  - text: 0 posts
  - img
  - text: Aberta
  - img "Madeira & Marcenaria"
  - heading "Madeira & Marcenaria" [level=3]
  - paragraph
  - paragraph: Marceneiros e artesãos da madeira. Móveis sob medida, utensílios e restauração. Trabalho manual com materiais nobres e reflorestados.
  - img
  - text: 7 membros
  - img
  - text: 0 posts
  - img
  - text: Aberta
  - img "Bem-estar & Saúde Natural"
  - heading "Bem-estar & Saúde Natural" [level=3]
  - paragraph
  - paragraph: Terapeutas, professores de yoga e entusiastas de vida saudável. Medicina natural, mindfulness e cuidado integral sem depender de indústria farmacêutica.
  - img
  - text: 7 membros
  - img
  - text: 0 posts
- contentinfo:
  - heading "eqüivale" [level=3]
  - paragraph: Economia colaborativa por meio de comunidades. Troque talentos e produtos com moeda virtual.
  - heading "Marketplace" [level=4]
  - list:
    - listitem:
      - button "Produtos"
    - listitem:
      - button "Serviços"
    - listitem:
      - button "Comunidades"
  - heading "Conta" [level=4]
  - list:
    - listitem:
      - button "Painel"
    - listitem:
      - button "Carteira"
    - listitem:
      - button "Entrar"
  - heading "Legal" [level=4]
  - list:
    - listitem: Termos de Uso
    - listitem: Privacidade
    - listitem: Suporte
  - paragraph: © 2026 eqüivale. Todos os direitos reservados.
  - paragraph: eqüivale
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Communities', () => {
  4  |   test('should list communities', async ({ page }) => {
  5  |     await page.goto('/communities');
> 6  |     await expect(page.getByText('Criar comunidade')).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  7  |   });
  8  | 
  9  |   test('should require login for creating community', async ({ page }) => {
  10 |     await page.goto('/communities/new');
  11 |     await expect(page).toHaveURL(/\/login/);
  12 |   });
  13 | });
  14 | 
```
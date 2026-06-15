# Equivale — Roadmap e Guia de Continuidade

> Prioridades, especificaçoes de telas e tarefas para evoluir o projeto.
> Este documento é o ponto de partida para continuar o desenvolvimento.

---

## Prioridades (Ordenadas)

### P0 — Bugs Críticos (bloqueiam experiência)

#### 1. Corrigir Dark Mode
- **Problema:** Dois stores de tema conflitantes. `ThemeToggle` usa `theme.ts` (seta `data-theme`), mas o CSS responde a `.dark` (em `theme.tsx`, que está orfao).
- **Correção:** Fazer `ThemeToggle` importar de `store/theme.tsx`, ou ajustar `theme.ts` para usar `classList.add/remove('dark')`.
- **Arquivo:** `frontend/src/components/ui/ThemeToggle.tsx`, `frontend/src/store/theme.ts` e `theme.tsx`.
- **Verificar:** Remover o store redundante e a chave de localStorage conflitante.

#### 2. Produtos da Comunidade Nunca Aparecem
- **Problema:** `mapProduct` (em `mappers.ts`) nao popula `communityId`. A `CommunityDetailPage` filtra produtos por `p.communityId === data.id`, que é sempre `undefined`.
- **Opçao A (frontend):** Adicionar `communityId` no `BackendProductDto` e popular no `mapProduct`.
- **Opçao B (backend):** Adicionar `CommunityId` na entidade `Product` e retornar no `ProductDto`.
- **Recomendado:** Opçao B — o produto pertence a uma comunidade no domínio.

#### 3. `isMember` Sempre False
- **Problema:** `CommunityDetailPage` inicializa `isMember = false` e nunca consulta o backend.
- **Correção:** Adicionar endpoint `GET /api/communities/{id}/membership/{userId}` ou popular `isMember` verificando se `currentUser.id` está em `community.members`.

---

### P1 — Telas de Criação/Gestao de Produto

#### Criar Produto
- **Service pronto:** `productsService.create(dto, sellerId)` — sem invocador.
- **Faltam:**
  - Rota: `/products/new` no `App.tsx`
  - Página: `CreateProductPage.tsx` (ou modal em ProductsPage)
  - Campos: título, descrição, preço (EQL), categoria, condição (novo/usado/recondicionado), imagens (upload ou URL)
  - Botao "Criar produto" em ProductsPage (visível se autenticado)

#### Editar Produto
- **Service pronto:** `productsService.update(id, dto, sellerId)`.
- **Faltam:**
  - Botao "Editar" em ProductDetailPage (visível só para o dono)
  - Página ou modal de ediçao pré-preenchido

#### Excluir Produto
- **Service pronto:** `productsService.delete(id)`.
- **Faltam:**
  - Botao "Excluir" em ProductDetailPage (visível só para o dono)
  - Confirmação antes de excluir

---

### P2 — Telas de Gestao de Comunidade

#### Editar Comunidade
- **Service pronto:** `communitiesService.update(id, dto)`.
- **Faltam:**
  - Botao "Editar" em CommunityDetailPage (visível para owner/moderador)
  - Modal de ediçao: nome, descrição, imagem, capa, tipo, visibilidade

#### Gerenciar Moderadores
- **Services prontos:** `addModerator(communityId, userId)`, `removeModerator(communityId, userId)`.
- **Faltam:**
  - Seção de gestao (visível para owner/moderador) em CommunityDetailPage
  - Input para adicionar moderador (por ID ou username)
  - Lista de moderadores com botao remover (exceto criador)

#### Listar/Gerenciar Membros
- **Lacuna:** NAO há endpoint para listar membros de uma comunidade.
- **Backend:** Adicionar `GET /api/communities/{id}/members` que retorna os usuários da lista `Members`.
- **Frontend:** Lista de membros com opçao de remover (para moderadores).

#### Regenerar Invite Code
- **Lacuna:** O código é gerado na criação mas nao há como regenerar.
- **Backend:** Adicionar endpoint `POST /api/communities/{id}/regenerate-invite`.
- **Frontend:** Botao "Gerar novo código" (visível para owner).

---

### P3 — Criação/Gestao de Serviço
Mesma estrutura de produto, adaptada:
- `servicesService.create/update/delete` estao prontos.
- Criar `CreateServicePage` com campos: título, descrição, preço, categoria, duração, localizaçao, imagens.
- Botoes editar/excluir em ServiceDetailPage para o provider.

---

### P4 — Reviews
- **Backend pronto:** endpoints de criação e consulta existem.
- **Frontend:** Criar `reviews.service.ts` (nao existe), UI de listagem + criação em ProductDetailPage/ServiceDetailPage.
- Componente `StarRating` já está implementado (orfao).

---

### P5 — Wallet Real
- Conectar `walletService.transfer()` na WalletPage (hoje é mock).
- Remover fetch manual e usar o `walletService.getTransactions()`.
- Adicionar verificaçao de saldo insuficiente antes de transferir.

---

### P6 — Admin Real
- Criar `admin.service.ts` com: listar usuários, banir/desbanir, aprovar/rejeitar produtos, stats reais.
- Reconstruir componentes `AdminSidebar`, `ModerationQueue`, `UserManagement` com classes `eq-*`.
- Conectar AdminPage a dados reais.

---

### P7 — Dívida Técnica Frontend
1. Remover classes CSS inexistentes (`glass-card`, `liquid-nav`, `gradient-text`) dos 6 componentes afetados
2. Remover diretório legado `src/UI/`
3. Trocar `<a href>` do Footer por navegação SolidJS
4. Adicionar `lazy()` nas rotas (code splitting)
5. Centralizar guarda de rota (`<PrivateRoute>`)
6. Adicionar `.env` para baseURL da API (remover hardcoded)
7. Implementar upload de imagem real (nao só URL manual)
8. Recriar `createEffect(() => loadX())` com `onMount` ou tracking de `params.id`

---

## Especificaçoes de Telas

### Tela: Criar Produto

```
Rota: /products/new (ou modal em /products)
Auth: obrigatório

Campos:
┌─────────────────────────────────────┐
│ [Imagem: URL ou Upload]             │
│                                      │
│ Título:          [_______________]  │
│ Descrição:       [_______________]  │
│                  [_______________]  │
│ Preço (EQL):     [____]             │
│ Categoria:       [Select ▾]         │
│ Condição:        ( ) Novo           │
│                  ( ) Usado          │
│                  ( ) Recondicionado │
│ Imagens:         [+ Adicionar URL]  │
│                                      │
│         [Cancelar]  [Publicar]      │
└─────────────────────────────────────┘

Service: productsService.create({
  sellerId: currentUser.id,
  title, description, priceInEquivale, category, images
}, currentUser.id)
```

### Tela: Gestao de Comunidade

```
Local: CommunityDetailPage (seçoes condicionais para owner/moderador)

┌─────────────────────────────────────┐
│ COMUNIDADE                           │
│ [Editar] [Gerenciar Membros]         │
│                                      │
│ MODERADORES                          │
│ • João Silva [owner]                 │
│ • Maria Santos    [Remover]          │
│ [+ Adicionar moderador por username] │
│                                      │
│ CONVITE (apenas privada)             │
│ Código: AB12CD34  [Copiar]           │
│ [Gerar novo código]                  │
│                                      │
│ MEMBROS (12)                         │
│ [Buscar...]                          │
│ • João Silva  • Maria Santos         │
│ • Pedro Costa [Expulsar]            │
│ • Ana Lima    • Carlos Pereira       │
└─────────────────────────────────────┘
```

### Tela: Editar Produto

```
Rota: /products/:id/edit (ou modal)
Auth: obrigatório, apenas o dono

Pré-preenchido com dados atuais.
Mesmos campos da criação.
Service: productsService.update(id, dto, sellerId)
```

---

## Checklist de Implementação por Tela

Para cada nova tela, seguir o Definition of Done:

- [ ] Rota registrada no `App.tsx`
- [ ] Guarda de autenticação (redirect para /login se nao logado)
- [ ] Service chamado corretamente (com error handling)
- [ ] Loading state (spinner ou skeleton)
- [ ] Error state (mensagem inline)
- [ ] Empty state (mensagem quando nao há dados)
- [ ] Validação client-side dos campos
- [ ] Feedback de sucesso (toast ou redirect)
- [ ] Responsivo (mobile + desktop)
- [ ] Classes `eq-*` (nao usar classes antigas)
- [ ] Commit semântico em pt-BR

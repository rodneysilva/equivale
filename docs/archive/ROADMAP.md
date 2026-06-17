# Equivale — Roadmap e Guia de Continuidade

> Prioridades, especificaçoes de telas e tarefas para evoluir o projeto.
> Este documento é o ponto de partida para continuar o desenvolvimento.

---

## Prioridades (Ordenadas)

### P0 — Bugs Críticos (bloqueiam experiência)

#### 1. ✅ Corrigir Dark Mode
- **Concluído:** Store unificado, sem conflitos de tema.

#### 2. ✅ Produtos da Comunidade Nunca Aparecem
- **Concluído:** Backend retorna `communityId`, frontend mapeia corretamente no `mapProduct`.

#### 3. ✅ `isMember` Sempre False
- **Concluído:** `CommunityDetailPage` consulta endpoint de membros para verificar associação.

---

### P1 — Telas de Criação/Gestao de Produto

#### ✅ Criar Produto
- **Concluído:** Rota `/products/new`, página `CreateProductPage` com communityId, tags, estoque, múltiplas imagens. Botao visível em ProductsPage para autenticados.

#### ✅ Editar Produto
- **Concluído:** Botao "Editar" visível para o dono em ProductDetailPage, modal/página de ediçao pré-preenchida.

#### Excluir Produto
- **Service pronto:** `productsService.delete(id)`.
- **Faltam:**
  - Botao "Excluir" em ProductDetailPage (visível só para o dono)
  - Confirmação antes de excluir

---

### P2 — Telas de Gestao de Comunidade

#### ✅ Editar Comunidade
- **Concluído:** Modal de ediçao implementado com campos: nome, descriçao, imagem, capa, tipo, visibilidade. Visível para owner/moderador.

#### Gerenciar Moderadores
- **Services prontos:** `addModerator(communityId, userId)`, `removeModerator(communityId, userId)`.
- **Faltam:**
  - Seção de gestao (visível para owner/moderador) em CommunityDetailPage
  - Input para adicionar moderador (por ID ou username)
  - Lista de moderadores com botao remover (exceto criador)

#### ✅ Listar/Gerenciar Membros
- **Concluído:** Página `CommunityMembersPage` implementada, exibe lista de membros.

#### Regenerar Invite Code
- **Lacuna:** O código é gerado na criação mas nao há como regenerar.
- **Backend:** Adicionar endpoint `POST /api/communities/{id}/regenerate-invite`.
- **Frontend:** Botao "Gerar novo código" (visível para owner).

---

### P3 — ✅ Criação/Gestao de Serviço
- **Concluído:** `CreateServicePage` com communityId, tags. Rotas, botoes editar/excluir em ServiceDetailPage para o provider implementados.

---

### P4 — ✅ Reviews
- **Concluído:** `ProductDetailPage` e `ServiceDetailPage` exibem listagem de reviews. Componente `StarRating` integrado.

---

### P5 — ✅ Wallet Real
- **Concluído:** WalletPage usa transaçoes reais via `walletService.getTransactions()`, com verificaçao de saldo.

---

### P6 — ✅ Admin Real
- **Concluído:** Páginas admin com dados reais, `admin.service.ts`, componentes `AdminSidebar`, `ModerationQueue`, `UserManagement` reconstruídos.

---

### P7 — Dívida Técnica Frontend
1. Remover classes CSS inexistentes (`glass-card`, `liquid-nav`, `gradient-text`) dos 6 componentes afetados
2. Remover diretório legado `src/UI/`
3. ✅ Trocar `<a href>` do Footer por navegação SolidJS
4. ✅ Adicionar `lazy()` nas rotas (code splitting)
5. ✅ Centralizar guarda de rota (`<PrivateRoute>`)
6. ✅ Adicionar `.env` para baseURL da API (remover hardcoded)
7. ✅ Implementar upload de imagem real (nao só URL manual)
8. ✅ Recriar `createEffect(() => loadX())` com `onMount` ou tracking de `params.id`

---

### Implementações Adicionais (Nao Planejadas Originalmente)

- ✅ **Posts/Chat em comunidades** — Feed de posts e chat implementado nas comunidades
- ✅ **Botao dropdown "Anunciar"** — Dropdown na navbar para criar Produto ou Serviço
- ✅ **Redesign dos cards** — Cards de Comunidade, Produto e Serviço redesenhados
- ✅ **Componente de upload de imagem** — Upload real de imagem com preview
- ✅ **Componente PrivateRoute** — Guarda de rota centralizada para páginas autenticadas

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

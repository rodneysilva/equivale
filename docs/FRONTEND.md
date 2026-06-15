# Equivale — Documentação Técnica do Frontend

> SolidJS 1.9 · TypeScript · Tailwind CSS 4.0 · Vite 6
> Base de análise: `equivale/frontend/src/`

---

## 1. Arquitetura

### 1.1 Estrutura de Pastas

```
frontend/
├── package.json
├── tsconfig.json            # strict, ESNext, path alias "~/*" -> "./src/*"
├── vite.config.ts           # solidPlugin + tailwindcss, porta 3000
├── index.html
└── src/
    ├── index.tsx            # bootstrap: render(<AuthProvider><App/></AuthProvider>)
    ├── index.css            # DESIGN SYSTEM (classes "eq-*", paleta âmbar/marrom)
    ├── App.tsx              # Router SolidJS + 13 rotas
    ├── types/
    │   └── index.ts         # Interfaces de domínio
    ├── store/
    │   ├── auth.tsx         # AuthProvider (Context API)
    │   ├── theme.tsx        # Store de tema #1 (.dark class) — ORFAO
    │   └── theme.ts         # Store de tema #2 (data-theme attr) — EM USO (com bug)
    ├── hooks/
    │   ├── useAuth.ts       # re-export de store/auth
    │   ├── useTheme.ts      # re-export de store/theme
    │   └── useApi.ts        # re-export de services/api
    ├── services/
    │   ├── api.ts           # cliente HTTP (fetch wrapper, baseURL localhost:5000)
    │   ├── mappers.ts       # adapter: backend DTO <-> frontend types
    │   ├── auth.service.ts
    │   ├── products.service.ts
    │   ├── services.service.ts
    │   ├── communities.service.ts
    │   └── wallet.service.ts
    ├── components/
    │   ├── ui/              # Design System (Button, Card, Input, Modal, Badge, ...)
    │   ├── layout/          # Navbar, Footer, Sidebar (orfao)
    │   ├── marketplace/     # ProductCard, ProductGrid, SearchBar, ...
    │   ├── community/       # CommunityCard, CommunityList
    │   ├── admin/           # AdminSidebar, ModerationQueue, UserManagement (orfaos)
    │   └── wallet/          # WalletBalance, TransactionHistory (orfaos)
    ├── UI/                  # LEGADO: re-exports de components/ui (candidato a remocao)
    └── pages/               # 12 páginas
```

### 1.2 Roteamento (`App.tsx`)

`@solidjs/router` com `Router` envolvendo layout raiz (Navbar + main + Footer) e 13 rotas:

| Path | Componente |
|------|-----------|
| `/` | HomePage |
| `/communities` | CommunitiesPage |
| `/communities/:id` | CommunityDetailPage |
| `/products` | ProductsPage |
| `/products/:id` | ProductDetailPage |
| `/services` | ServicesPage |
| `/services/:id` | ServiceDetailPage |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/profile` | ProfilePage |
| `/wallet` | WalletPage |
| `/admin` | AdminPage |

- **Sem lazy-loading** — todas as páginas importadas estaticamente
- **Sem rota aninhada** nem layout por seção
- **Proteção de rota manual** — cada página usa `createEffect` + `navigate('/login')`
- **Nao existem rotas para:** criar/editar produto, criar/editar serviço, editar comunidade, gerenciar membros

### 1.3 Estado Global

#### AuthProvider (`store/auth.tsx`)
Context API SolidJS com `createSignal`:
- Sinais: `currentUser()`, `isAuthenticated()`, `isLoading()`, `error()`
- Métodos: `login()`, `register()`, `logout()`, `clearError()`, `updateProfile()`
- Boot: le `eql_token` do localStorage e reidrata o perfil via `getProfile()`
- **Sem refresh de token** — 401 faz redirect para /login

#### Cliente HTTP (`services/api.ts`)
- `BASE_URL = 'http://localhost:5000/api'` (hardcoded)
- Token JWT em `localStorage['eql_token']`
- 401 → limpa token e redirect para `/login`
- Exporta `api.get/post/put/del` + `setToken/clearToken/getToken`

### 1.4 Camada de Mappers (`services/mappers.ts`)

Isola o frontend das convençoes do backend:
- Tipos `Backend*Dto` (priceInEquivale, creatorId, transactionType, etc.)
- Funçoes: `mapProduct`, `mapService`, `mapCommunity`, `mapUser`, `mapTransaction`
- Helpers de status: `mapProductStatus`, `mapServiceStatus`, `mapTransactionType`

**Atenção:** `mapProduct` NAO popula `communityId`/`communityName` — causa bug na listagem de produtos por comunidade.

---

## 2. Design System

### 2.1 Evolução do Conceito

O projeto migrou de um **"liquid/glass design"** (vidro fosco/gradientes) para um **design system formal âmbar (`eq-*`)**. A migração ficou incompleta:
- `GlassCard`, `LiquidButton`, `LiquidInput` sao meros re-exports de `Card`/`Button`/`Input`
- 6 componentes ainda usam classes CSS inexistentes (`glass-card`, `liquid-nav`, `gradient-text`)

### 2.2 Tokens de Design (`index.css`)

**Light mode (`:root`):**
```
--color-primary:        #78350f  (marrom escuro)
--color-primary-hover:  #92400e
--color-primary-light:  #fef3c7
--color-accent:         #b45309  (preços/destaques)
--color-surface:        #ffffff
--color-surface-alt:    #f8f7f4
--color-border:         #e5e2db
--color-text:           #1c1917
```

**Dark mode (`.dark`):**
```
--color-primary:        #fbbf24  (âmbar)
--color-surface:        #1c1917  (stone-900)
--color-surface-alt:    #292524
--color-text:           #fafaf9
```

### 2.3 Classes Utilitárias

| Classe | Função |
|--------|--------|
| `eq-card` / `eq-card-hover` | Card com surface sólida + borda + sombra |
| `eq-btn` / `eq-btn-outline` / `eq-btn-ghost` | Botões (preenchido/contorno/fantasma) |
| `eq-btn-sm/md/lg` | Tamanhos de botao |
| `eq-input` | Input com borda e focus ring |
| `eq-nav` | Barra de navegação |
| `eq-badge` + variantes | Tags coloridas (pill) |
| `eq-brand` | Texto da marca (primary + bold) |
| `eq-accent` | Texto de destaque (preços) |
| `eq-divider` | Separador |
| `eq-avatar` | Círculo com fundo primary-light |
| `eq-spinner` | Spinner de loading |
| `eq-link` | Link em cor primary |

### 2.4 Componentes de UI (`components/ui/`)

| Componente | Props | Estado |
|-----------|-------|--------|
| **Button** | `variant`, `size`, `+HTMLAttributes` | Completo |
| **Card** | `hover?`, `+HTMLAttributes` | Completo |
| **Input** | `label?`, `error?`, `+HTMLAttributes` | Completo |
| **Badge** | `variant`, `children` | Completo |
| **Avatar** | `src?`, `name?`, `size?` | Completo |
| **Modal** | `open`, `onClose`, `title?`, `children`, `size?` | Completo |
| **LoadingSpinner** | `size?`, `class?` | Completo |
| **ThemeToggle** | — | Bug (ver seção 4) |
| **StarRating** | `rating`, `maxRating?`, `showValue?` | Implementado, mas ORFAO |
| GlassCard | — | Alias de Card (legado) |
| LiquidButton | — | Alias de Button (legado) |
| LiquidInput | — | Alias de Input (legado) |

---

## 3. Páginas — Estado de Implementação

Legenda: ✅ Completa · 🟡 Parcial · 🔴 Skeleton

### HomePage — ✅ Completa
Hero com headline, CTA, stats (hardcoded), seções de comunidades/produtos/serviços carregadas via API.

### CommunitiesPage — ✅ Completa (listagem + criação)
Grid de comunidades + **modal de criação** (nome, descrição, imagem, tipo, visibilidade). Carrega via `communitiesService.getAll(1,12)`.
- Gap: sem paginação infinita, sem busca.

### CommunityDetailPage — 🟡 Parcial
Visual rico (cover, badges, moderadores, invite code, produtos, join/leave), mas com bugs:
- **`isMember` sempre false** (nao consultado do backend)
- **Produtos da comunidade nunca aparecem** (mapper nao popula communityId)
- **Sem ediçao/gestao de membros/moderadores** (services existem, sem UI)

### ProductsPage — ✅ Completa (listagem)
Sidebar com SearchBar + CategoryFilter + grid com skeletons + paginação.
- **Gap:** sem botao "Criar produto".

### ProductDetailPage — 🟡 Parcial
Layout 2 colunas (imagem + info), botao Comprar.
- Gaps: sem galeria de múltiplas imagens, sem reviews, sem editar/excluir para o dono.

### ServicesPage — ✅ Completa (listagem)
Mesma estrutura do ProductsPage para serviços.

### ServiceDetailPage — 🟡 Parcial
Layout 3 colunas, botao Contratar.
- Gaps: sem reviews, sem editar/excluir, duration/location nao sao exibidos.

### WalletPage — 🔴 Mock
- Saldo do estado de auth (nao atualiza sem reload)
- Histórico via fetch manual (ignora walletService)
- Transferência totalmente mockada (nao chama API)

### ProfilePage — 🟡 Parcial
Card de info + ediçao inline. Stats sempre "—" (placeholder).

### AdminPage — 🔴 Skeleton
Stats hardcoded, links para rotas inexistentes, componentes admin orfaos.

### LoginPage — ✅ Completa
Form email + senha, redirect automático se autenticado.

### RegisterPage — ✅ Completa
Form nome + email + senha, gera username do email.

---

## 4. Bug Crítico — Dark Mode Quebrado

Existem **dois stores de tema** conflitantes:

| Arquivo | Mecanismo | CSS alvo | Vivo? |
|---------|-----------|----------|-------|
| `store/theme.tsx` | `classList.add('dark')` | classe `.dark` | NAO (orfao) |
| `store/theme.ts` | `setAttribute('data-theme')` | atributo `[data-theme]` | SIM |

O `index.css` responde à classe `.dark`, **nao** ao atributo `data-theme`. Portanto o ThemeToggle nao funciona.

**Correção:** Fazer `ThemeToggle` importar de `store/theme.tsx` (que acerta o `.dark`), ou ajustar `theme.ts` para usar `classList`.

---

## 5. Services — Métodos e Endpoints

### authService
| Método | Endpoint |
|--------|----------|
| `register(RegisterDto)` | POST /auth/register |
| `login(LoginDto)` | POST /auth/login |
| `logout()` | — (limpa token) |
| `getProfile()` | GET /auth/profile |
| `updateProfile({...})` | PUT /auth/profile |

### productsService
| Método | Endpoint |
|--------|----------|
| `getAll(page, pageSize, category?, search?)` | GET /products |
| `getById(id)` | GET /products/:id |
| `create(CreateProductDto, sellerId)` | POST /products |
| `update(id, dto, sellerId)` | PUT /products/:id |
| `delete(id)` | DELETE /products/:id |
| `getBySeller(sellerId)` | GET /products/seller/:sellerId |
| `getByCategory(category)` | GET /products/category/:category |
| `buy(productId)` | POST /products/:id/buy |

### servicesService
| Método | Endpoint |
|--------|----------|
| `getAll(page, pageSize, category?, search?)` | GET /services |
| `getById(id)` | GET /services/:id |
| `create(CreateServiceDto, providerId)` | POST /services |
| `update(id, dto, providerId)` | PUT /services/:id |
| `delete(id)` | DELETE /services/:id |
| `getByProvider(providerId)` | GET /services/provider/:providerId |
| `hire(serviceId)` | POST /services/:id/hire |

### communitiesService
| Método | Endpoint |
|--------|----------|
| `getAll(page, pageSize)` | GET /communities |
| `getById(id)` | GET /communities/:id |
| `create(CreateCommunityDto, creatorId)` | POST /communities |
| `update(id, dto)` | PUT /communities/:id |
| `delete(id)` | DELETE /communities/:id |
| `join(id, inviteCode?)` | POST /communities/:id/join |
| `leave(id)` | POST /communities/:id/leave |
| `addModerator(communityId, userId)` | POST /communities/:id/moderators |
| `removeModerator(communityId, userId)` | DELETE /communities/:id/moderators/:userId |
| `getByMember(userId)` | GET /communities/member/:userId |

> **Lacuna:** NAO há método para listar membros de uma comunidade ou checar membership.

### walletService
| Método | Endpoint | Obs. |
|--------|----------|------|
| `getBalance()` | GET /auth/profile | Le walletBalance |
| `getTransactions(page, pageSize)` | GET /wallet/transactions | NAO usado pela WalletPage |
| `transfer(TransferDto)` | POST /transactions | NAO usado pela WalletPage |

---

## 6. Componentes de Domínio

### marketplace/ — Todos usados
- **ProductCard** — card com imagem, badge de condição, título, preço, vendedor
- **ProductGrid** — grid responsivo (1-4 cols) com skeletons
- **ServiceCard** — card com ícone, título, preço, provider
- **ServiceGrid** — grid (1-3 cols) com skeletons
- **SearchBar** — input com ícone de busca
- **CategoryFilter** — lista vertical de categorias

### community/
- **CommunityCard** — ✅ usado (cover, avatar, badge de tipo, membros)
- **CommunityList** — 🟡 existe mas NAO é usado

### admin/ — 🔴 Todos orfaos com design antigo
- **AdminSidebar** — classes `glass-card`, `text-indigo-500`
- **ModerationQueue** — props para approve/reject, sem service
- **UserManagement** — props para ban/unban, sem service

### wallet/ — 🔴 Todos orfaos com design antigo
- **WalletBalance** — `GlassCard`, gradiente antigo
- **TransactionHistory** — lista transaçoes com GlassCard

### layout/
- **Navbar** — ✅ usado (fixed top, eq-nav, saldo EQL, dropdown perfil)
- **Footer** — ✅ usado (mas usa `<a href>` causando reload)
- **Sidebar** — 🔴 orfao (classes inexistentes)

---

## 7. Resumo Executivo

| Area | Maturidade |
|------|-----------|
| Design system base (`eq-*`) | ✅ sólido |
| Componentes UI primitivos | ✅ completos |
| Auth (login/register/profile) | ✅ funcional |
| Listagem (produtos/serviços/comunidades) | ✅ funcional |
| Detalhe (produto/serviço/comunidade) | 🟡 visual ok, bugs de dados |
| Criação de comunidade | ✅ via modal |
| **Criação/gestao de produto** | 🔴 inexistente |
| **Criação/gestao de serviço** | 🔴 inexistente |
| **Gestao de comunidade (membros/mod)** | 🔴 inexistente |
| Reviews | 🔴 inexistente |
| Wallet (transferência) | 🔴 mock |
| Admin | 🔴 mock |
| Dark mode | 🔴 quebrado |

> Análise técnica exaustiva (bugs, props de cada componente, código): ver [RELATORIO_FRONTEND.md](./RELATORIO_FRONTEND.md).

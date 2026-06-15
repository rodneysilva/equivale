# Relatório Técnico — Frontend Equivale

> Análise exaustiva do frontend do projeto **equivale** (SolidJS + TypeScript + Tailwind CSS v4).
> Base de análise: `equivale/frontend/src/` (63 arquivos `.ts/.tsx/.css/.json`).
> Data: 14/06/2026 · Stack: SolidJS 1.9, @solidjs/router 0.15, Tailwind CSS 4.0, lucide-solid 0.460, clsx 2.1, Vite 6.

---

## 1. ARQUITETURA

### 1.1 Estrutura de pastas

```
frontend/
├── package.json
├── tsconfig.json            # strict, ESNext, path alias "~/*" -> "./src/*"
├── vite.config.ts           # solidPlugin + tailwindcss, porta 3000, alias "~" -> src
├── index.html               # (entry HTML)
└── src/
    ├── index.tsx            # bootstrap: render(<AuthProvider><App/></AuthProvider>)
    ├── index.css            # DESIGN SYSTEM atual (classes "eq-*", paleta âmbar/marrom)
    ├── App.tsx              # Router SolidJS + 13 rotas
    ├── types/
    │   └── index.ts         # Interfaces de domínio (User, Product, Service, Community, Transaction, Review...)
    ├── store/
    │   ├── auth.tsx         # AuthProvider (Context API) — login/register/profile/logout
    │   ├── theme.tsx        # Store de tema #1 (usa .dark class) — ⚠ NÃO IMPORTADO EM LUGAR NENHUM
    │   └── theme.ts         # Store de tema #2 (usa data-theme attr) — usado pelo ThemeToggle
    ├── hooks/
    │   ├── useAuth.ts       # re-export de store/auth
    │   ├── useTheme.ts      # re-export de store/theme (theme.ts)
    │   └── useApi.ts        # re-export de services/api
    ├── services/
    │   ├── api.ts           # cliente HTTP (fetch wrapper, baseURL http://localhost:5000/api)
    │   ├── mappers.ts       # camada de adapter: backend DTO <-> frontend types
    │   ├── auth.service.ts
    │   ├── products.service.ts
    │   ├── services.service.ts
    │   ├── communities.service.ts
    │   └── wallet.service.ts
    ├── components/
    │   ├── ui/              # Design System (Button, Card, Input, Modal, Badge, Avatar, ...)
    │   ├── layout/          # Navbar, Footer, Sidebar (este último órfão)
    │   ├── marketplace/     # ProductCard, ProductGrid, ServiceCard, ServiceGrid, SearchBar, CategoryFilter
    │   ├── community/       # CommunityCard, CommunityList (List não é usado)
    │   ├── admin/           # AdminSidebar, ModerationQueue, UserManagement (NÃO usados pela AdminPage)
    │   └── wallet/          # WalletBalance, TransactionHistory (NÃO usados pela WalletPage)
    ├── UI/                  # ⚠ diretório legado: UI/index.ts e UI/components/index.tsx
    │                        #   re-exportam os mesmos componentes por compatibilidade
    └── pages/               # 13 páginas
        ├── HomePage.tsx
        ├── CommunitiesPage.tsx
        ├── CommunityDetailPage.tsx
        ├── ProductsPage.tsx
        ├── ProductDetailPage.tsx
        ├── ServicesPage.tsx
        ├── ServiceDetailPage.tsx
        ├── WalletPage.tsx
        ├── ProfilePage.tsx
        ├── AdminPage.tsx
        ├── LoginPage.tsx
        └── RegisterPage.tsx
```

**Observação importante de organização:** há dois locais com o mesmo propósito — `src/components/ui/` (real) e `src/UI/components/` (legado, só re-exports). O diretório `src/UI/` é redundante e pode ser removido.

### 1.2 Roteamento (`App.tsx`)

Usa `@solidjs/router` com `Router` envolvendo um layout raiz (Navbar + `<main>` + Footer) e 13 `<Route>` declarativas:

| Path                | Component              |
|---------------------|------------------------|
| `/`                 | HomePage               |
| `/communities`      | CommunitiesPage        |
| `/communities/:id`  | CommunityDetailPage    |
| `/products`         | ProductsPage           |
| `/products/:id`     | ProductDetailPage      |
| `/services`         | ServicesPage           |
| `/services/:id`     | ServiceDetailPage      |
| `/login`            | LoginPage              |
| `/register`         | RegisterPage           |
| `/profile`          | ProfilePage            |
| `/wallet`           | WalletPage             |
| `/admin`            | AdminPage              |

- Não há lazy-loading (`lazy(() => ...)`) — todas as páginas são importadas estaticamente no bundle.
- Não há **roteamento aninhado** nem layout por seção (admin deveria ter sidebar própria, por exemplo).
- **Não existem rotas para:** criar/editar produto, criar/editar serviço, editar comunidade, gerenciar membros, ver transações de outro usuário, criação de review.
- Proteção de rotas é feita **manualmente dentro de cada página** via `createEffect` + `navigate('/login')` (ex.: WalletPage, ProfilePage, AdminPage). Não há um `<PrivateRoute>` ou guarda centralizada.
- O `root` do Router aplica `background: var(--color-bg)` — **variável que não existe** no `index.css` (existe `--color-surface` e `--color-surface-alt`, não `--color-bg`). Bug menor de estilo.

### 1.3 Estado global

#### `store/auth.tsx` (Context API SolidJS)
Implementa `AuthProvider` via `createContext` + `useContext`. Estado reativo com `createSignal`:

- `currentUser()`, `isAuthenticated()`, `isLoading()`, `error()`
- Métodos: `login(LoginDto)`, `register(RegisterDto)`, `logout()`, `clearError()`, `updateProfile({fullName,bio,avatarUrl})`
- **Boot:** `createEffect` lê `eql_token` do localStorage e chama `authService.getProfile()` para reidratar o usuário. Se não houver token, `isLoading(false)`.
- Erro setado via `setError(err.message)`, mas o componente que consome é responsável por ler `error()` (a página também mantém erro local próprio na maioria dos casos).
- **Limitação:** não há refresh de token, nem tratamento explícito de token expirado (o `api.ts` faz redirect para `/login` em 401, o que cobre isso parcialmente).

#### `store/theme.tsx` vs `store/theme.ts` — **CONFLITO CRÍTICO**
Existem **dois stores de tema** com implementações incompatíveis (ver seção 5 para detalhes). Apenas `theme.ts` está vivo (importado por `ThemeToggle`); `theme.tsx` está órfão.

### 1.4 Cliente HTTP (`services/api.ts`)

- `BASE_URL = 'http://localhost:5000/api'` (hardcoded, sem variável de ambiente / `.env`).
- Token JWT em `localStorage['eql_token']`.
- Wrapper `request<T>()` injeta `Authorization: Bearer`, força `Content-Type: application/json`.
- **401 →** limpa token e faz `window.location.href = '/login'` (redirect "hard", perde estado SolidJS).
- **204 →** retorna `undefined`.
- Erros lançam `Error(error.message || 'Request failed')` lendo `response.json()`.
- Exporta `api.get/post/put/del`, mais `setToken/clearToken/getToken`.

### 1.5 Camada de mappers (`services/mappers.ts`)

Camada de adapter que isola o frontend de convenções do backend:

- Define tipos `Backend*Dto` (`BackendProductDto.priceInEquivale`, `BackendCommunityDto.creatorId`, `BackendTransactionDto.transactionType`, `BackendPagedResult<T>.items`, etc.).
- Funções `mapProduct`, `mapService`, `mapCommunity`, `mapUser`, `mapAuthResponse`, `mapTransaction`, `mapPagedResult`.
- Helpers de mapeamento de status: `mapProductStatus` (`active`→`available`, `sold`→`sold`, `pending`→`pending_moderation`), `mapServiceStatus`, `mapTransactionType`.
- **Pontos de atenção:**
  - `mapUser` sempre fixa `isBanned: false` (backend não retorna esse campo).
  - `mapAuthResponse` fixa `walletBalance: 0` e `createdAt: agora` (o endpoint de auth não retorna esses dados).
  - `mapCommunity` fixa `postsCount: 0` (backend não retorna contagem de posts).
  - `mapTransactionType` não cobre `'sale'` (cai no `default` → `'purchase'`).

---

## 2. DESIGN SYSTEM

### 2.1 O "conceito liquid design" — estado atual

O termo **"liquid design"** aparece no nome de componentes (`GlassCard`, `LiquidButton`, `LiquidInput`) e remete a uma estética original do projeto (vidro fosco / gradientes / "glassmorphism"). **Entretanto, esse conceito foi abandonado/refatorado.** Evidências:

1. **Os arquivos `GlassCard.tsx`, `LiquidButton.tsx`, `LiquidInput.tsx` são meros re-exports:**
   ```ts
   // GlassCard.tsx
   import Card from './Card';
   export default Card;
   ```
   Ou seja, `GlassCard` === `Card`, `LiquidButton` === `Button`, `LiquidInput` === `Input`. Não há mais nenhuma implementação de "vidro/gradiente".

2. **O `index.css` atual** é descrito como *"Equivale Design System — Formal, jovem, alternativo"*, com paleta **âmbar/marrom** (`--color-primary: #78350f` / dark `#fbbf24`), superfícies sólidas (`eq-card` = `background: var(--color-surface); border: 1px solid var(--color-border)`), **sem `backdrop-blur`, sem gradientes**. É um design "flat/material-like", não liquid.

3. **Classes CSS residuais não definidas:** alguns componentes ainda referenciam classes do sistema antigo que **não existem** no `index.css` atual: `glass-card`, `liquid-nav`, `gradient-text`. São eles: `Sidebar.tsx`, `AdminSidebar.tsx`, `ModerationQueue.tsx`, `UserManagement.tsx`, `WalletBalance.tsx`, `TransactionHistory.tsx`. Esses componentes renderizam "quebrados" (sem estilo aplicado nessas partes).

**Resumo:** o projeto migrou de um "liquid/glass design" para um "design system formal âmbar (`eq-*`)", mas a migração ficou **incompleta** — reexports fantasma + componentes de domínio (admin/wallet) e o `Sidebar` legado ainda usam as classes antigas.

### 2.2 Tokens de design (`index.css`, `:root` e `.dark`)

Light:
```
--color-primary: #78350f      (marrom escuro)
--color-primary-hover: #92400e
--color-primary-light: #fef3c7
--color-accent: #b45309       (preços/destaques)
--color-surface: #ffffff
--color-surface-alt: #f8f7f4
--color-border: #e5e2db
--color-text: #1c1917
```
Dark (`.dark`):
```
--color-primary: #fbbf24      (âmbar/amarelo)
--color-surface: #1c1917      (stone-900)
--color-surface-alt: #292524
--color-text: #fafaf9
```
Mais `--radius` (0.5rem), `--shadow-sm/--shadow/--shadow-md`, e tokens derivados.

### 2.3 Classes utilitárias/componentes (`@layer components`)

| Classe | Função |
|---|---|
| `eq-card` / `eq-card-hover` | Card: surface sólida + borda + sombra sutil; hover eleva sombra |
| `eq-btn` | Botão primário (preenchido com `--color-primary`) |
| `eq-btn-outline` | Botão contornado (hover: borda/texto em primary) |
| `eq-btn-ghost` | Botão fantasma (transparente, hover com fundo leve) |
| `eq-btn-sm/md/lg` | Tamanhos |
| `eq-input` | Input com borda 1.5px, focus ring em primary |
| `eq-nav` | Barra de navegação (surface + border-bottom) |
| `eq-badge` + `eq-badge-primary/success/warning/danger/info` | Tags coloridas (pill) |
| `eq-brand` | Texto em cor primary + bold (uso no logo) |
| `eq-accent` | Texto de destaque (preços) em `--color-accent` |
| `eq-divider` | Separador (border-top) |
| `eq-bg` | Fundo surface-alt |
| `eq-avatar` | Círculo com fundo primary-light |
| `eq-spinner` | Spinner de loading |
| `eq-link` | Link em cor primary |

### 2.4 Componentes de UI (Reactivo SolidJS, em `components/ui/`)

| Componente | Props | Descrição / Estado |
|---|---|---|
| **Button** | `variant?: 'primary'\|'outline'\|'ghost'`, `size?: 'sm'\|'md'\|'lg'`, + `JSX.ButtonHTMLAttributes` | Wrapper que mescla classes `eq-btn*`. Spreads nativos. **Completo.** |
| **Card** | `hover?: boolean`, + `HTMLAttributes` | Wrapper de `eq-card`. **Completo.** |
| **GlassCard** | — | **Alias de `Card`** (re-export). Legado, sem implementação própria. |
| **LiquidButton** | — | **Alias de `Button`** (re-export). Legado. |
| **Input** | `label?`, `error?`, + `InputHTMLAttributes` | Input com label opcional + mensagem de erro vermelha. **Completo.** |
| **LiquidInput** | — | **Alias de `Input`** (re-export). Legado. |
| **Badge** | `variant?: 'primary'\|'success'\|'warning'\|'danger'\|'info'`, `children` | Pill colorido. **Completo.** |
| **Avatar** | `src?`, `name?`, `size?: 'sm'\|'md'\|'lg'\|'xl'` | Círculo com imagem ou iniciais (2 chars). Usa `eq-avatar` + classes Tailwind de tamanho. **Completo.** |
| **Modal** | `open`, `onClose`, `title?`, `children`, `size?: 'sm'\|'md'\|'lg'` | Overlay fixo, backdrop `bg-black/40`, card centralizado. Tem animação de entrada (opacity/scale via `setTimeout` 10ms) — **há um bug sutil:** `show` começa `false` e só vira `true` num efeito colateral dentro do JSX (`setTimeout(...) && null`), o que é um padrão frágil. Funciona, mas é "hacky". Sem `onKeyDown`/ESC para fechar, sem portal (pode ter z-index issues). |
| **LoadingSpinner** | `size?` (classes Tailwind), `class?` | Spinner `eq-spinner`. **Completo.** |
| **ThemeToggle** | — | Botão ghost com `Sun`/`Moon` (lucide). **Importa de `store/theme` (theme.ts) — VER BUG DE TEMA na seção 5.** |
| **StarRating** | `rating`, `maxRating?`, `size?`, `showValue?` | Estrelas preenchidas/vazias. **Implementado, mas NÃO USADO em nenhuma página** (reviews não têm UI). Usa classes Tailwind `text-yellow-400` direto, não variáveis de tema. |

### 2.5 Diretório legado `src/UI/`

- `src/UI/index.ts` e `src/UI/components/index.tsx` re-exportam os mesmos componentes de `src/components/ui/` "por compatibilidade". Redundante; provavelmente não é importado por nada (busca: nenhuma página importa de `~/UI`). Candidato a remoção.

---

## 3. PÁGINAS — Estado de implementação

Legenda: ✅ Completa · 🟡 Parcial · 🔴 Skeleton/Placeholder.

### 3.1 HomePage — ✅ Completa
- Hero com headline, CTA ("Explorar comunidades", "Criar conta") e stats **hardcoded** (350+ comunidades, 2.5k+ produtos, 15k+ transações — números fictícios).
- Seção "Comunidades" carrega via `communitiesService.getAll(1,6)` e usa `CommunityCard` em grid.
- Seção "Como funciona" (3 cards explicativos: comunidade → publicar → EQL).
- Seção "Produtos" via `productsService.getAll(1,4)` + `ProductGrid`.
- Seção "Serviços" via `servicesService.getAll(1,4)` + `ServiceGrid`.
- CTA final.
- Carrega tudo em paralelo com `Promise.all`. Erros silenciados (`catch {}`) — falha graciosamente.
- **Imports não usados:** `Globe, Lock, Eye, EyeOff` (lint warning).
- **Bug:** `createEffect(() => loadFeatured())` — `loadFeatured` não lê sinais reativas, então roda uma vez (comportamento OK, mas o uso de `createEffect` é supérfluo; `onMount` seria mais idiomático).

### 3.2 CommunitiesPage — ✅ Completa (listagem + criação)
- Lista comunidades em grid (`CommunityCard` direto — não usa o componente `CommunityList`).
- **Modal de criação de comunidade** (`Modal` + formulário): nome, descrição, URL da imagem, tipo (aberta/privada) com cards seletores, visibilidade dos produtos (público/membros) com cards seletores. Chama `communitiesService.create(dto, userId)`.
- Validação: exige login; mostra erro inline.
- Botão "Criar comunidade" só aparece se autenticado.
- Loading e empty states tratados.
- **Gap:** sem paginação (carrega só 12), sem busca/filtro, sem ordenação.

### 3.3 CommunityDetailPage — 🟡 Parcial
Implementado com riqueza visual (cover, avatar, badges de tipo/visibilidade, moderadores, código de convite, grid de produtos, join/leave), mas com **bugs funcionais significativos:**
- Carrega `communitiesService.getById(id)`.
- **Bug `isMember`:** signal inicializado `false` e **nunca consultado ao backend** — não existe método `getMembership` no service nem no mapper. Ou seja: mesmo um membro já cadastrado verá o botão "Participar". O estado só vira `true` após um `join` com sucesso nesta sessão.
- **Produtos da comunidade:** carrega `productsService.getAll(1,8)` (todos os produtos globais!) e filtra no front por `p.communityId === data.id`. **Funciona só se o mapper populasse `communityId`** — mas `mapProduct` **não popula** `communityId` nem `communityName` (o backend `BackendProductDto` não tem esses campos). Resultado: a grade de produtos da comunidade **sempre fica vazia**.
- **Join privado:** pede `inviteCode` em input. Leave funciona.
- **Código de convite:** mostrado só para owner/moderador de comunidades privadas; botão copiar.
- **Gestão:** NÃO há edição de comunidade, gestão de membros (listar/expulsar), adicionar/remover moderadores (apesar de o `communitiesService` ter `addModerator/removeModerator` — **sem UI**). O `isModerator` é calculado mas não dispara nenhuma ação de gestão.
- `postsCount` sempre 0 (mapper).

### 3.4 ProductsPage — ✅ Completa (listagem)
- Sidebar com `SearchBar` + `CategoryFilter` (categorias **hardcoded**: Artesanato, Fotografia, Arte, Madeira, Alimentação, Jardinagem, Tecnologia, Bem-estar).
- Grid `ProductGrid` com skeletons de loading.
- Paginação (anterior/próximo) com `page`/`totalPages`.
- Busca e filtro por categoria atualizam `page=1`.
- **Gap:** não há botão "Criar produto" (fluxo de criação inexistente — ver seção 7).

### 3.5 ProductDetailPage — 🟡 Parcial
- Carrega `productsService.getById(id)`.
- Layout 2 colunas: imagem (ou placeholder SVG) + info (badges de condição/categoria, título, descrição, preço, vendedor com avatar, comunidade se houver).
- **Botão Comprar** chama `productsService.buy(id)` → redireciona para `/wallet`. Desabilita se `status !== 'available'`.
- **Gaps:**
  - Não há galeria de múltiplas imagens (só `imageUrl`, embora o tipo tenha `images[]`).
  - Não há **seção de reviews/avaliações** (componente `StarRating` existe mas é ignorado).
  - Não há botão **Editar/Excluir** para o dono do produto.
  - Não há indicador de saldo suficiente antes de comprar.
  - `communityName` nunca populado pelo mapper → bloco "Comunidade: ..." nunca aparece.

### 3.6 ServicesPage — ✅ Completa (listagem)
- Mesma estrutura do ProductsPage (search + category filter + grid + paginação).
- Categorias hardcoded: Design, Programação, Marketing, Escrita, Consultoria, Aulas, Fotografia, Outros.
- Usa `ServiceGrid`/`ServiceCard`.

### 3.7 ServiceDetailPage — 🟡 Parcial
- Layout 3 colunas: descrição/provider/datas + sidebar sticky com preço e botão **Contratar** (`servicesService.hire(id)` → `/wallet`).
- Gaps similares ao ProductDetail: sem reviews, sem editar/excluir para o provider, sem gallery. `duration`/`location` **não são exibidos** (embora existam no tipo e no mapper).

### 3.8 WalletPage — 🔴 Parcial com mock + bug
- **Balance** lê `auth.currentUser().walletBalance` (do estado de auth, não chama `walletService.getBalance()`).
- **Histórico de transações:** **não usa `walletService`** — faz `fetch()` direto para `http://localhost:5000/api/transactions/user/${userId}` com URL hardcoded e token manual do localStorage. Ignora o `api.ts` e o mapper.
- **Formulário "Enviar EQL":** `handleSend` **NÃO chama nenhuma API** — apenas seta `setSuccess('... enviado com sucesso')` e limpa campos. É **totalmente mockado** (placeholder). Pede email do destinatário, mas o `walletService.transfer` espera `toUserId`.
- Componentes `WalletBalance` e `TransactionHistory` **não são usados** (a página reimplementa tudo inline).
- Sem verificação de saldo insuficiente.

### 3.9 ProfilePage — 🟡 Parcial
- Card de info com avatar (xl), nome, email, "membro desde", bio.
- Modo edição inline (nome, foto URL, bio) → `auth.updateProfile(...)`.
- Stats: 2 cards "Produtos publicados" e "Transações realizadas" — **ambos com valor "—" (placeholder, não conectados a dado real).**
- **Gaps:** não lista produtos/serviços do usuário (`productsService.getBySeller`/`servicesService.getByProvider` existem mas não têm UI). Não lista comunidades do usuário (`communitiesService.getByMember` existe mas não tem UI). Não mostra histórico de transações nem reviews recebidas.

### 3.10 AdminPage — 🔴 Skeleton
- Guarda de acesso: redireciona se não admin (bom).
- **Stats hardcoded** (2.4k usuários, 350 comunidades, etc. — mock).
- Lista de links "Gestão" (`/admin/users`, `/admin/communities`, ...) — **rotas que NÃO existem no App.tsx** (clicar quebra em 404/do nothing).
- "Atividade recente" — lista **hardcoded** de eventos mock.
- **Os componentes de domínio admin (`AdminSidebar`, `ModerationQueue`, `UserManagement`) existem mas NÃO são usados** pela página. Não há service de admin (banir, moderar, listar usuários).

### 3.11 LoginPage — ✅ Completa
- Form email + senha (com toggle de visibilidade), ícones lucide.
- `auth.login(...)` → redirect `/`.
- Redirect automático se já autenticado.
- Erro inline. **Sem link "esqueci minha senha".**

### 3.12 RegisterPage — ✅ Completa
- Form nome completo + email + senha + confirmar senha.
- Validação client-side (senhas iguais, mínimo 6 chars).
- Gera `username` a partir do email (`email.split('@')[0]`).
- `auth.register(...)` → redirect `/`.
- Redirect automático se já autenticado.

---

## 4. SERVICES — Métodos e endpoints

Base: `http://localhost:5000/api` (todo via `api.ts`, exceto onde indicado).

### 4.1 `authService` (`auth.service.ts`)
| Método | Endpoint | Body / Mapper |
|---|---|---|
| `register(RegisterDto)` | `POST /auth/register` | `{name, email, password}` → `mapAuthResponse` |
| `login(LoginDto)` | `POST /auth/login` | `{email, password}` → `mapAuthResponse` |
| `logout()` | — | Limpa token, `window.location.href='/'` |
| `getProfile()` | `GET /auth/profile` | → `mapUser` |
| `updateProfile({fullName,bio,avatarUrl})` | `PUT /auth/profile` | `{name?, bio?, avatarUrl?}` → `mapUser` |

### 4.2 `productsService` (`products.service.ts`)
| Método | Endpoint |
|---|---|
| `getAll(page=1, pageSize=12, category?, search?)` | `GET /products?page&pageSize&category&search` |
| `getById(id)` | `GET /products/:id` |
| `create(CreateProductDto, sellerId)` | `POST /products` (body: `{sellerId, title, description, category, priceInEquivale, images[]}`) |
| `update(id, dto, sellerId)` | `PUT /products/:id` |
| `delete(id)` | `DELETE /products/:id` |
| `getBySeller(sellerId)` | `GET /products/seller/:sellerId` |
| `getByCategory(category)` | `GET /products/category/:category` |
| `buy(productId)` | `POST /products/:id/buy` → `{id, amount}` |

### 4.3 `servicesService` (`services.service.ts`)
| Método | Endpoint |
|---|---|
| `getAll(page, pageSize, category?, search?)` | `GET /services?...` |
| `getById(id)` | `GET /services/:id` |
| `create(CreateServiceDto, providerId)` | `POST /services` (`{providerId, title, description, category, priceInEquivale, duration?, location?}`) |
| `update(id, dto, providerId)` | `PUT /services/:id` |
| `delete(id)` | `DELETE /services/:id` |
| `getByProvider(providerId)` | `GET /services/provider/:providerId` |
| `hire(serviceId)` | `POST /services/:id/hire` → `{id, amount}` |

### 4.4 `communitiesService` (`communities.service.ts`)
| Método | Endpoint |
|---|---|
| `getAll(page=1, pageSize=12)` | `GET /communities?page&pageSize` |
| `getById(id)` | `GET /communities/:id` |
| `create(CreateCommunityDto, creatorId)` | `POST /communities` (`{name, description, creatorId, imageUrl?, coverUrl?, type?, productVisibility?}`) |
| `update(id, Partial<CreateCommunityDto>)` | `PUT /communities/:id` |
| `delete(id)` | `DELETE /communities/:id` |
| `join(id, inviteCode?)` | `POST /communities/:id/join?inviteCode=...` |
| `leave(id)` | `POST /communities/:id/leave` |
| `addModerator(communityId, userId)` | `POST /communities/:id/moderators` (`{userId}`) |
| `removeModerator(communityId, userId)` | `DELETE /communities/:id/moderators/:userId` |
| `getByMember(userId)` | `GET /communities/member/:userId` |

**Observação:** NÃO há método para listar membros de uma comunidade, remover membro, ou checar membership — lacuna que explica o bug `isMember` em CommunityDetailPage.

### 4.5 `walletService` (`wallet.service.ts`)
| Método | Endpoint | Obs. |
|---|---|---|
| `getBalance()` | `GET /auth/profile` (lê `walletBalance`) | Não usa endpoint dedicado |
| `getTransactions(page, pageSize)` | `GET /wallet/transactions?...` | `catch {}` retorna `[]` em caso de erro. **NÃO É USADO** pela WalletPage |
| `transfer(TransferDto)` | `POST /transactions` | `fromUserId:''` hardcoded (backend deve inferir do token). **NÃO É USADO** pela WalletPage |

⚠ **Inconsistência:** a WalletPage ignora `walletService` e faz fetch manual para `/transactions/user/:userId` (endpoint diferente de `/wallet/transactions`). Há **duas fontes de verdade** para transações.

---

## 5. TEMA — Dark/Light mode

### 5.1 O bug crítico (dois stores conflitantes)

| Arquivo | Mecanismo | localStorage key | Seletor CSS alvo | Está vivo? |
|---|---|---|---|---|
| `store/theme.tsx` | `classList.add('dark')` / `remove` + `createEffect` | `eql_theme` | classe **`.dark`** | **NÃO** (órfão) |
| `store/theme.ts` | `setAttribute('data-theme', ...)` | `eq-theme` | atributo **`[data-theme]`** | **SIM** (importado por `ThemeToggle`) |

E o `index.css` responde à **classe `.dark`** (`.dark { --color-primary: #fbbf24; ... }`), **não** ao atributo `data-theme`.

**Consequência:** o `ThemeToggle` (único controle de tema na UI) chama `toggleTheme` de `theme.ts`, que:
1. Alterna o signal `theme()`.
2. Salva em `localStorage['eq-theme']`.
3. **Seta `data-theme` no `<html>`** — atributo que o CSS **ignora**.

Portanto, **clicar no ThemeToggle NÃO altera as cores da aplicação.** O dark mode está efetivamente quebrado na UI. (O `store/theme.tsx`, que faria o `.dark` funcionar, não é importado por nada.)

### 5.2 Detalhes adicionais de tema
- `store/theme.tsx` lê `prefers-color-scheme` (respeita preferência do SO) — `theme.ts` **não** lê isso (default `'light'`).
- Persistência dupla e conflitante (`eq-theme` vs `eql_theme`) pode deixar o usuário em estado inconsistente.
- O `StarRating` (não usado) usa `text-gray-300 dark:text-gray-600` — Tailwind escuro direto, sem variável de tema.

### 5.3 Correção recomendada (resumo)
Unificar em **um** store. A opção mais barata é fazer `ThemeToggle` importar de `store/theme.tsx` (que já acerta o `.dark`), ou ajustar `theme.ts` para usar `classList` em vez de `data-theme`. Remover o arquivo redundante e a chave de localStorage conflitante.

---

## 6. COMPONENTES DE DOMÍNIO

### 6.1 `components/marketplace/`

| Componente | Estado | Notas |
|---|---|---|
| **ProductCard** | ✅ usado | Card com imagem/placeholder, badge de condição (Novo/Usado/Recond.), título, descrição (2 linhas), preço `eq-accent`, vendedor (avatar+nome), comunidade se houver. Clicável → `/products/:id`. |
| **ProductGrid** | ✅ usado | Grid responsivo (1/2/3/4 cols). Estados: loading (8 skeletons `animate-pulse`), vazio (msg customizável), dados. |
| **ServiceCard** | ✅ usado | Card com ícone/raio, título, descrição, preço, provider. Clicável → `/services/:id`. |
| **ServiceGrid** | ✅ usado | Grid (1/2/3 cols) com skeletons. |
| **SearchBar** | ✅ usado | Input com ícone `Search` à esquerda, controlled (`value` + `onInput`). |
| **CategoryFilter** | ✅ usado | Lista vertical com "Todas" + categorias; item selecionado destacado com `--color-primary-light`. |

### 6.2 `components/community/`

| Componente | Estado | Notas |
|---|---|---|
| **CommunityCard** | ✅ usado (HomePage, CommunitiesPage) | Cover (20h), avatar sobreposto, badge tipo (aberta/privada), nome, contagem de membros, descrição. Clicável. |
| **CommunityList** | 🟡 existe mas **NÃO é usado** | Grid com skeletons e empty state. CommunitiesPage/HomePage constroem o grid inline em vez de usar este wrapper. |

### 6.3 `components/admin/` — 🔴 Todos legados/órfãos

| Componente | Estado | Notas |
|---|---|---|
| **AdminSidebar** | 🔴 não usado | Usa classes `glass-card`, `text-indigo-500`, `dark:bg-indigo-900/30` — **design antigo, não bate com `eq-*`**. Não é renderizado pela AdminPage. |
| **ModerationQueue** | 🔴 não usado | Props `items`, `onApprove`, `onReject`. Usa `GlassCard`, `LiquidButton`, classes `bg-gray-200 dark:bg-gray-700`, `text-indigo`. Sem service de moderação conectado. |
| **UserManagement** | 🔴 não usado | Props `users`, `onBan`, `onUnban`, `search`, `onSearch`. Lista usuários com avatar/badges/botões banir. Usa `GlassCard`. **Sem service de admin.** |

### 6.4 `components/wallet/` — 🔴 Todos legados/órfãos

| Componente | Estado | Notas |
|---|---|---|
| **WalletBalance** | 🔴 não usado | `GlassCard`, gradiente `from-indigo-500 to-purple-500`, `gradient-text`. Design antigo, não usa `eq-accent`. |
| **TransactionHistory** | 🔴 não usado | Lista transações com ícone por tipo + cor (vermelho/verde/azul/roxo). `GlassCard`. Não conectado. |

### 6.5 `components/layout/`

| Componente | Estado | Notas |
|---|---|---|
| **Navbar** | ✅ usado | Fixed top, `eq-nav`. Links (Comunidades/Produtos/Serviços), ThemeToggle, saldo EQL quando logado, dropdown de perfil (Perfil/Carteira/Admin/Sair) e menu mobile. Highlight do link ativo por `useLocation`. Bem feito. |
| **Footer** | ✅ usado | 4 colunas (marca/marketplace/conta/legal) + copyright. Links usam `<a href>` (não `useNavigate`) — causam reload de página. |
| **Sidebar** | 🔴 não usado | Overlay lateral. Usa `liquid-nav` e `gradient-text` (classes inexistentes). Provavelmente resquício de layout antigo. |

---

## 7. GAPS — O que está faltando implementar

### 7.1 Criação de Produto — 🔴 INEXISTENTE
- **Não há rota** `/products/new` ou `/products/create` no `App.tsx`.
- **Não há página/formulário** de criação de produto. O service `productsService.create(dto, sellerId)` **existe e está pronto**, mas **nenhum componente UI o invoca**.
- Falta: `CreateProductPage` (ou modal em ProductsPage) com campos título, descrição, preço (EQL), categoria, condição (novo/usado/recond.), imagens (URL ou upload), comunidade (select).
- Não há como o usuário publicar produtos hoje.

### 7.2 Gestão de Produto — 🔴 INEXISTENTE
- Sem edição de produto (`productsService.update` existe, sem UI).
- Sem exclusão de produto (`productsService.delete` existe, sem UI).
- O ProductDetailPage **não diferencia** o dono (sem botões "Editar"/"Excluir").
- Sem galeria de múltiplas imagens (o tipo suporta `images[]`, mas só `imageUrl` é exibido).
- Sem gerenciamento de status (marcar como vendido manualmente).

### 7.3 Criação de Comunidade — ✅ EXISTE (via modal)
- CommunitiesPage tem modal completo (nome, descrição, imagem, tipo, visibilidade). Funcional.
- **Melhorias faltantes:** upload de imagem real (hoje só URL), cover image, invite code gerado pelo backend.

### 7.4 Gestão de Comunidade — 🟡 PARCIAL
Implementado (detail page) mas com lacunas importantes:
- **`isMember` não é carregado do backend** → bug de UX (botão sempre "Participar").
- **Produtos da comunidade nunca aparecem** (mapper não popula `communityId`/`communityName`; `loadCommunity` filtra por campo sempre undefined).
- **Sem edição de comunidade** (`communitiesService.update` existe, sem UI — sem botão editar na detail page).
- **Sem exclusão de comunidade** (`delete` existe, sem UI).
- **Sem gestão de membros:** não há lista de membros, nem remover membro. O método `getByMember` existe mas o inverso (listar membros de uma comunidade) não existe no service.
- **Sem UI para adicionar/remover moderadores** (`addModerator`/`removeModerator` existem no service, sem botões).
- **Sem geração/regeneração de invite code** (só exibe se já vier do backend).
- `postsCount` sempre 0.

### 7.5 Criação/Gestão de Serviço — 🔴 INEXISTENTE
- Sem rota, sem página, sem UI. `servicesService.create/update/delete` existem e estão prontos mas não há invocador. O `ServiceDetailPage` não tem botões editar/excluir para o provider.

### 7.6 Reviews / Avaliações — 🔴 INEXISTENTE
- Tipos `Review`, `CreateReviewDto` definidos, mas **não há service de reviews**, nem UI (o `StarRating` está implementado mas órfão). ProductDetail/ServiceDetail não mostram nem aceitam avaliações.

### 7.7 Wallet — 🔴 MOCK
- Transferência totalmente mockada (não chama API).
- Saldo vem do estado de auth (não atualiza após transação sem reload).
- `WalletBalance`/`TransactionHistory` componentes órfãos (não usados).
- Endpoint de transações hardcoded e divergente do `walletService`.

### 7.8 Admin — 🔴 MOCK
- Tudo hardcoded. Componentes `AdminSidebar`/`ModerationQueue`/`UserManagement` órfãos e com design antigo. Não há service de admin (banir usuários, moderar itens, listar usuários, stats reais).

### 7.9 Perfil — 🟡 PARCIAL
- Sem listar "meus produtos", "meus serviços", "minhas comunidades" (os services `getBySeller`/`getByProvider`/`getByMember` existem, sem UI).
- Stats "Produtos publicados" / "Transações" sempre "—".

### 7.10 Bugs transversais / dívida técnica
1. **Tema quebrado** (seção 5) — dois stores conflitantes; ThemeToggle não funciona.
2. **Classes CSS inexistentes** (`glass-card`, `liquid-nav`, `gradient-text`) em 6 componentes (Sidebar, AdminSidebar, ModerationQueue, UserManagement, WalletBalance, TransactionHistory).
3. **Rota de layout** usa `var(--color-bg)` que não existe.
4. **Footer** usa `<a href>` causando full reload (deveria usar `useNavigate`/`<A>` do router).
5. **`createEffect` sem dependências reativas** em quase todas as páginas (deveria ser `onMount`, ou rastrear `params.id` para recarregar em mudança de rota — hoje navegar entre `/products/A` e `/products/B` pode não recarregar).
6. **Sem lazy loading** das rotas (bundle único).
7. **Sem guarda de rota centralizada** (cada página protege individualmente).
8. **WalletPage** duplica lógica de fetch e ignora o `walletService`.
9. **Imports não usados** (lint): `Globe, Lock, Eye, EyeOff` em HomePage; variável `i` em skeletons de ProductGrid/ServiceGrid/CommunityList.
10. **`mapProduct`** não popula `communityId`/`communityName`/`sellerName`/`sellerAvatar`/`condition` (sempre `'new'`) — campos que a UI tenta exibir.
11. **`mapUser`/`mapAuthResponse`** não populam `isBanned`/`walletBalance` corretamente em todos os fluxos.
12. **Diretório `src/UI/`** legado redundante.
13. **Sem `.env`/config de ambiente** — baseURL hardcoded.
14. **Sem tratamento de upload de imagem** (tudo é URL manual).

---

## 8. RESUMO EXECUTIVO

| Área | Maturidade |
|---|---|
| Design system base (`eq-*`) | ✅ sólido e consistente |
| Componentes UI primitivos | ✅ completos |
| Auth (login/register/profile) | ✅ funcional |
| Listagem (produtos/serviços/comunidades) | ✅ funcional |
| Detalhe (produto/serviço/comunidade) | 🟡 visual ok, bugs de dados |
| Criação de comunidade | ✅ via modal |
| Criação/gestão de produto | 🔴 **inexistente** |
| Criação/gestão de serviço | 🔴 **inexistente** |
| Gestão de comunidade (membros/mod) | 🔴 **inexistente** |
| Reviews | 🔴 **inexistente** |
| Wallet (transferência) | 🔴 **mock** |
| Admin | 🔴 **mock** |
| Perfil (meus itens) | 🟡 **parcial** |
| Dark mode | 🔴 **quebrado** (bug de store) |
| Componentes admin/wallet | 🔴 **órfãos + design antigo** |

**Prioridades de continuidade sugeridas:**
1. Corrigir o bug do tema (unificar `store/theme`).
2. Criar fluxo de **criar/editar/excluir produto** e **serviço** (services já prontos).
3. Corrigir o `mapProduct` para popular `communityId`/`sellerName` (ou ajustar backend) — desbloqueia produtos na comunidade.
4. Adicionar **consulta de membership** + listar membros/gerenciar moderadores em CommunityDetail.
5. Conectar o `walletService.transfer` real na WalletPage e remover o fetch manual.
6. Reescrever componentes admin/wallet órfãos para `eq-*` (ou removê-los) e integrar à AdminPage/WalletPage.
7. Implementar reviews (service + UI + StarRating).
8. Trocar `<a href>` do Footer por navegação SolidJS e usar `lazy()` nas rotas.

# Arquitetura Técnica — eqüivale

## Visão Geral

Aplicação fullstack com separação clara de responsabilidades:
- **Backend**: .NET 9 com arquitetura DDD (Domain-Driven Design)
- **Frontend**: SolidJS (reactivo, sem virtual DOM) com TailwindCSS
- **Database**: MongoDB (documentos, sem schema migration)

---

## Backend — DDD em 4 camadas

### 1. Domain (`equivale.Domain`)
Núcleo puro, sem dependências externas.

- **Entities**: User, Product, Service, Community, Transaction, Review, JoinRequest, SocialLink
- **Value Objects**: Money (custom serializer → decimal puro no MongoDB), Email
- **Enums**: UserRole, ItemStatus, ProductCondition, TransactionStatus, TransactionItemType
- **Interfaces**: IBaseRepository<T>, IUserRepository, IProductRepository, etc.

### 2. Application (`equivale.Application`)
Casos de uso, DTOs e orquestração.

- **Services**: AuthService, TransactionService, SeedService, TagGenerator, DtoEnricher
- **DTOs**: Records imutáveis (ProductDto, TransactionDto, etc.)
- **Commands/Queries**: CQRS com MediatR (Create, GetAll, GetById por entidade)
- **Mappings**: AutoMapper (`MappingProfile` mapeia direto da entidade; nomes embutidos)

### 3. Infrastructure (`equivale.Infrastructure`)
Acesso a dados e serialização.

- **Repositories**: BaseRepository<T> (CRUD genérico), especializados por entidade
- **Serializers**: MoneyBsonSerializer (decimal puro), EmailBsonSerializer
- **MongoDbContext**: Configura collections e registra serializers customizados

### 4. API (`equivale.Api`)
HTTP layer, autenticação e DI.

- **Controllers**: Auth, Products, Services, Communities, Transactions, Reviews, Search, Admin, Users, Seed
- **Middleware**: GlobalExceptionHandling (erros em JSON amigável)
- **Auth**: JWT Bearer com cookie HttpOnly (fallback), 7 dias de expiração
- **CORS**: Configurado para localhost:3000/3001
- **Rate Limiting**: 10.000 req/min

---

## Frontend — SolidJS

### Estrutura
```
src/
├── components/     # UI reutilizável
│   ├── layout/     # Navbar, Footer, SearchBar
│   ├── marketplace/# ProductCard, ServiceCard, Grids, Filters
│   ├── community/  # CommunityCard, UserCard
│   └── ui/         # Card, Button, Badge, Avatar, LoadingSpinner
├── pages/          # Uma página por rota
├── services/       # API clients + mappers (BackendDto → FrontendType)
├── store/          # Estado global (auth via Context, theme)
├── types/          # Interfaces TypeScript
└── data/           # Constantes (avatars, social link types)
```

### Padrões
- **SolidJS signals**: `createSignal`, `createEffect`, `createMemo`, `on()`
- **Context API**: AuthProvider com `useAuth()`
- **Services**: cada arquivo exporta um objeto com métodos async
- **Mappers**: convertem DTOs do backend para tipos do frontend
- **Proxy**: Vite proxy `/api` → `localhost:5053` (mesma origem para cookies)

### Rotas
| Path | Página | Auth |
|---|---|---|
| `/` | Home | Público |
| `/products` | Lista de produtos | Público |
| `/products/:id` | Detalhe do produto | Público |
| `/services` | Lista de serviços | Público |
| `/services/:id` | Detalhe do serviço | Público |
| `/communities` | Lista de comunidades | Público |
| `/communities/:id` | Detalhe da comunidade | Público (conteúdo só para membros) |
| `/search` | Resultados de busca | Público |
| `/users/:id` | Perfil público | Público |
| `/login` | Login | Não autenticado |
| `/register` | Registro | Não autenticado |
| `/dashboard` | Painel do usuário | Autenticado |
| `/wallet` | Carteira/extrato | Autenticado |
| `/profile` | Editar perfil | Autenticado |
| `/transactions` | Pedidos (compras/vendas) | Autenticado |
| `/transactions/:id` | Detalhe da transação | Autenticado |
| `/admin` | Painel admin | Admin |

---

## Fluxo de Transação (Escrow)

```
┌─────────────┐     ┌──────────────┐     ┌─────────┐     ┌───────────┐     ┌──────────┐
│ OrderPlaced │ ──► │ OrderConfirmed│ ──► │ Shipped │ ──► │ Delivered │ ──► │ Finished │
│             │     │              │     │         │     │           │     │          │
│ Block(valor)│     │ Vendedor     │     │ Tracking│     │ Comprador │     │ Avalia→  │
│ Comprador   │     │ confirma     │     │ info    │     │ confirma  │     │ Libera $ │
└─────────────┘     └──────────────┘     └─────────┘     └───────────┘     └──────────┘
       │                   │                  │                │
       └───────────────────┴──────────────────┴────────────────┘
                              Cancel = Unblock (estorno)
```

### Estado do saldo durante transação
1. **OrderPlaced**: `disponível -= total`, `bloqueado += total`
2. **OrderConfirmed → Shipped → Delivered**: sem mudança (valor em calção)
3. **Finished**: `bloqueado -= total` (comprador), `disponível += total` (vendedor)
4. **Cancelled**: `bloqueado -= total`, `disponível += total` (estorno ao comprador)

---

## Custom Serializers MongoDB

### MoneyBsonSerializer
O value object `Money` é serializado como **decimal puro** no MongoDB (não como subdocumento).
- campo `PriceInEquivale` armazena `366` (não `{ Amount: 366 }`)
- Sort por preço usa `"PriceInEquivale"` (sem `.Amount`)

### EmailBsonSerializer
O value object `Email` é serializado como string.

---

## AutoMapper com Records

DTOs são `record` (imutáveis). Hoje os nomes relacionados (SellerName, BuyerName, CommunityName, avatares etc.) são **embutidos na própria entidade** no momento da criação (handlers de `CreateProductCommand`/`CreateServiceCommand`), o que evita N+1 nas listagens. Assim, o `MappingProfile` mapeia **direto da entidade para o DTO**, sem `ForCtorParam(_ => null)`.

O `DtoEnricher` permanece apenas como **fallback para documentos legados** que ainda não possuem os campos embutidos — preenche os nomes via lookup quando faltam na entidade.

> Histórico: a versão anterior mapeava nomes como `null` no DTO e o `DtoEnricher` era a fonte primária; hoje ele é só legado.

---

## Seed Parametrizável

```
POST /api/seed/run?reset=true&users=20&communities=10&products=80&services=40
```

- `reset=true`: limpa TODAS as collections antes de popular
- Dados gerados de templates realistas (descrições detalhadas por produto/serviço)
- Imagens reais do Unsplash por categoria
- Promove `rodneydocarmo@gmail.com` para Admin
- Cria transações em todos os status do fluxo
- Cria reviews para transações finalizadas

---

## Gaps Conhecidos e Pendências

A maior parte dos gaps históricos já foi resolvida. Abaixo o status atual.

### ✅ Resolvidos
1. **CreateProduct/CreateService**: páginas validadas (formulário de criação funcionando). *(era gap #1)*
2. **Editar produto/serviço**: edição implementada além do toggle de status. *(era #2)*
3. **Upload de arquivos**: `FilesController` integrado ao fluxo de criação/edição. *(era #3)*
5. **Comunidades privadas**: fluxo completo (senha única + solicitação/aprovação) no backend e frontend. *(era #5)*
6. **Notificações**: sistema de notificações implementado (badge na navbar). *(era #6)*
7. **Chat comprador↔vendedor**: comunicação pós-compra implementada (two-actor e2e). *(era #7)*
8. **CreateCommunity**: página validada. *(era #8)*
10. **Cobertura de testes**: 157 testes unitários + 41 testes e2e (Playwright). *(era #10 — "zero cobertura")*
11. **CI/CD**: configurado em `.github/workflows/ci.yml` (build + test em push/PR para dev/hom/master). *(era #11)*
12. **Deploy**: `docker-compose` e Dockerfile existem (onboarding/produção). *(era #12)*

> Observações menores ainda válidas: #4 (rotas admin) já normalizadas para `AdminDashboardPage`; #9 (mobile) em bom estado mas sem bateria sistemática de testes; #13/#14 (enums órfãos, tipos duplicados) são débito técnico baixo.

### 🔴 Gaps remanescentes reais
- **Chat sem paginação / marcação de leitura**: o chat funciona, mas não pagina mensagens nem marca como lido; polling fixo de 5s sem backoff.
- **Moderação — replies órfãos**: ao ocultar/excluir um comentário pai, os replies ficam órfãos e aparecem como raízes na árvore pública.
- **Pix on/off-ramp — BLOQUEADO**: exige provedor (Mercado Pago/Gerencianet/Asaas), chaves de API, webhooks e KYC. Decisão de produto pendente; não implementar "cego".

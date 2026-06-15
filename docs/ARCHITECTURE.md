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
- **Mappings**: AutoMapper (records com ForCtorParam)

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

DTOs são `record` (imutáveis). AutoMapper precisa de `ForCtorParam` para parâmetros do construtor que não têm source direta (ex: `BuyerName`, `SellerName` que são enriquecidos via `DtoEnricher`).

```csharp
CreateMap<Transaction, TransactionDto>()
    .ForCtorParam("BuyerName", opt => opt.MapFrom(_ => (string?)null))
    .ForCtorParam("SellerName", opt => opt.MapFrom(_ => (string?)null));
```

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

### Crítico
1. **CreateProductPage/CreateServicePage**: páginas existem mas não foram validadas (formulário de criação)
2. **Editar produto/serviço**: não há página de edição (só toggle de status)
3. **Upload de imagens**: só aceita URLs (FilesController existe mas não integrado)
4. **Rota duplicada `/admin`**: `AdminPage` (antiga) e `AdminDashboardPage` (nova) conflitam

### Alto
5. **Comunidades privadas (frontend)**: endpoints backend existem, frontend não usa o fluxo completo
6. **Notificações**: não há sistema de notificação (pedidos, aprovações, etc.)
7. **Chat comprador↔vendedor**: sem comunicação pós-compra
8. **CreateCommunityPage**: existe mas não foi validada

### Médio
9. **Mobile**: layout não testado sistematicamente
10. **Testes**: zero cobertura de testes
11. **CI/CD**: não configurado
12. **Deploy**: sem Dockerfile ou configuração de produção
13. **Enums não usados**: `TransactionType.cs`, `CommunityType.cs`, `ProductVisibilityType.cs` no Domain (entity usa strings)
14. **Tipos duplicados**: `Transaction` e `Review` definidos 2x em types/index.ts

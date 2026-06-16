# Equivale — Documentação Técnica do Backend

> .NET 9 · Clean Architecture · DDD · CQRS · MongoDB
> Base de análise: `equivale/backend/`

---

## 1. Arquitetura

### 1.1 Visao Geral

Solução .NET 9 organizada em **4 projetos de produção + 1 de testes**, seguindo Clean Architecture / DDD:

```
backend/
├── src/
│   ├── equivale.Domain          (sem dependências de projeto)
│   ├── equivale.Application     → referencia Domain
│   ├── equivale.Infrastructure  → referencia Domain + Application
│   └── equivale.Api             → referencia Application + Infrastructure
└── tests/
    └── equivale.UnitTests       → referencia Domain + Application + Infrastructure
```

### 1.2 Regra de Ouro — Direção das Dependências

As dependências **sempre apontam para dentro** (para o Domínio):

| Camada | Depende de | Responsabilidade |
|--------|-----------|-----------------|
| **Domain** | nada (pura) | Entidades, Value Objects, Enums, interfaces de repositório |
| **Application** | Domain | Casos de uso (Commands/Queries MediatR), DTOs, Validators, Services, Mappings |
| **Infrastructure** | Domain + Application | MongoDB, Repositories, BCrypt, armazenamento de arquivos, serializadores BSON |
| **Api** | Application + Infrastructure | Composition root (DI, JWT, CORS), Controllers, Middleware |

**Pureza do Domínio:** O Domain **nao referencia** o pacote MongoDB. As abstraçoes de transação (`IUnitOfWork`, `IDbSession`) sao definidas no Domain usando tipos próprios, e a Infrastructure as adapta ao `IClientSessionHandle` concreto do MongoDB.

### 1.3 Padrões Arquiteturais

| Padrão | Onde é Aplicado |
|--------|----------------|
| **Clean Architecture** | 4 camadas com dependências centradas no Domain |
| **DDD** | Entidades ricas (`User.Credit/Debit`), Value Objects (`Email`, `Money`), invariantes protegidas |
| **CQRS + MediatR** | Commands (escrita) e Queries (leitura) como `IRequest<T>` distintos |
| **Repository** | `IBaseRepository<T>` genérico + especializaçoes por agregado |
| **Unit of Work** | `IUnitOfWork.ExecuteInTransactionAsync(...)` garante atomicidade multi-documento MongoDB |
| **Adapter** | `MongoDbSession` adapta `IClientSessionHandle` → `IDbSession` (Domain) |
| **Specification / ISP** | `ITransactionalRepository<T>` segregado de `IBaseRepository<T>` |
| **Dependency Injection** | Tudo via `IServiceCollection` |
| **Options Pattern** | `MongoDbSettings`, `FileStorageSettings`, `JwtSettings` |
| **Value Object (DDD)** | `Email` e `Money` (imutáveis, igualdade por valor, operadores) |
| **Anti-corruption Layer** | `MappingProfile` (AutoMapper) isola entidades de DTOs |
| **Global Exception Handling** | `GlobalExceptionMiddleware` mapeia exceçoes → HTTP status |
| **Strategy (serialização)** | `EmailBsonSerializer`, `MoneyBsonSerializer` mantêm VOs como escalares no MongoDB |

---

## 2. Domínio

Namespace: `equivale.Domain`

### 2.1 Entidades

#### User (`Domain/Entities/User.cs`)

| Propriedade | Tipo | Observação |
|-------------|------|-----------|
| `Id` | `string` | Gerado pelo MongoDB |
| `Name` | `string` | |
| `Email` | `Email` (Value Object) | |
| `PasswordHash` | `string` | Hash BCrypt |
| `AvatarUrl` | `string?` | |
| `Bio` | `string?` | |
| `Role` | `UserRole` | default `User` |
| `WalletBalance` | `Money` (private setter) | default `Money.Zero` |
| `CreatedAt` | `DateTime` | |
| `UpdatedAt` | `DateTime` | |

**Métodos de domínio:**
- `Credit(decimal amount)` — lança exceção se ≤ 0; soma à carteira; atualiza `UpdatedAt`
- `Debit(decimal amount)` — lança exceção se ≤ 0 e se saldo insuficiente
- `IsAdmin()` — verifica se `Role == UserRole.Admin`

> `WalletBalance` tem setter privado — toda mutação passa por `Credit`/`Debit`, protegendo a invariante de saldo nao-negativo.

#### Community (`Domain/Entities/Community.cs`)

| Propriedade | Tipo | Default |
|-------------|------|---------|
| `Id` | `string` | |
| `Name` | `string` | |
| `Description` | `string` | |
| `ImageUrl` | `string?` | |
| `CoverUrl` | `string?` | |
| `CreatorId` | `string` | |
| `Members` | `List<string>` | `[]` |
| `Moderators` | `List<string>` | `[]` |
| `Type` | `string` | `"open"` (`"open"` / `"private"`) |
| `ProductVisibility` | `string` | `"public"` (`"public"` / `"members"`) |
| `InviteCode` | `string?` | Gerado apenas para comunidades privadas |
| `CreatedAt` / `UpdatedAt` | `DateTime` | |

#### Product (`Domain/Entities/Product.cs`)

| Propriedade | Tipo | Default |
|-------------|------|---------|
| `Id` | `string` | |
| `SellerId` | `string` | |
| `Title` | `string` | |
| `Description` | `string` | |
| `Category` | `string` | |
| `PriceInEquivale` | `Money` | `Money.Zero` |
| `Images` | `List<string>` | `[]` |
| `Status` | `ItemStatus` | `Active` |
| `CreatedAt` / `UpdatedAt` | `DateTime` | |

#### Service (`Domain/Entities/Service.cs`)

| Propriedade | Tipo | Default |
|-------------|------|---------|
| `Id` | `string` | |
| `ProviderId` | `string` | |
| `Title` | `string` | |
| `Description` | `string` | |
| `Category` | `string` | |
| `PriceInEquivale` | `Money` | `Money.Zero` |
| `Duration` | `TimeSpan?` | |
| `Location` | `string?` | |
| `Status` | `ItemStatus` | `Active` |
| `CreatedAt` / `UpdatedAt` | `DateTime` | |

#### Review (`Domain/Entities/Review.cs`)

| Propriedade | Tipo | Default |
|-------------|------|---------|
| `Id` | `string` | |
| `ReviewerId` | `string` | |
| `TargetUserId` | `string` | |
| `ItemId` | `string` | |
| `ItemType` | `string` | `"Product"` (`"Product"` / `"Service"`) |
| `Rating` | `int` | 1-5 |
| `Comment` | `string?` | |
| `CreatedAt` | `DateTime` | |

#### Transaction (`Domain/Entities/Transaction.cs`)

| Propriedade | Tipo | Default |
|-------------|------|---------|
| `Id` | `string` | |
| `FromUserId` | `string` | |
| `ToUserId` | `string` | |
| `Amount` | `Money` | `Money.Zero` |
| `Description` | `string` | |
| `TransactionType` | `TransactionType` | |
| `RelatedItemId` | `string?` | |
| `CreatedAt` | `DateTime` | |

### 2.2 Enums

| Enum | Valores |
|------|---------|
| `UserRole` | `Admin = 0`, `User = 1` |
| `ItemStatus` | `Active = 0`, `Inactive = 1`, `PendingModeration = 2`, `Rejected = 3` |
| `TransactionType` | `Purchase = 0`, `Transfer = 1`, `Bonus = 2` |
| `CommunityType` | `Open = 0`, `Private = 1` *(nao usado pela entidade — codigo morto)* |
| `ProductVisibilityType` | `Public = 0`, `MembersOnly = 1` *(nao usado pela entidade — codigo morto)* |

### 2.3 Value Objects

#### Email (`sealed`, `IEquatable<Email>`)
- `string Address` (imutável)
- Normalização: `Trim()` + `ToLowerInvariant()`
- Validação: presença de `@` e de `.` no domínio
- Operadores: conversão implícita bidirecional `Email ↔ string`; `==`, `!=`, `Equals`, `GetHashCode`

#### Money (`sealed`, `IEquatable<Money>`) — moeda EQL
- `decimal Amount` (imutável)
- Rejeita valor negativo
- Arredondamento para 2 casas (MidpointRounding.ToEven — banker's rounding)
- Fábrica: `Money.Zero`
- Operadores: `+`, `-`, `* decimal`, comparaçoes; conversão implícita `Money ↔ decimal`
- `ToString()` → `"123.45 EQL"`

### 2.4 Interfaces do Domínio

| Interface | Propósito |
|-----------|----------|
| `IBaseRepository<T>` | CRUD genérico: GetById, GetAll, Add, Update, Delete |
| `ITransactionalRepository<T>` | Variante transacional (Add/Update/Delete com `IDbSession`) — segregada via ISP |
| `IPaginatedRepository<T>` | `GetPagedAsync(page, pageSize)` → (Items, Total) |
| `IUserRepository` | + `GetByEmailAsync(Email)` |
| `IProductRepository` | + `GetBySellerIdAsync`, `GetByCategoryAsync` |
| `IServiceRepository` | + `GetByProviderIdAsync`, `GetByCategoryAsync` |
| `ICommunityRepository` | + `GetByNameAsync`, `GetByMemberIdAsync` |
| `IReviewRepository` | + `GetByTargetUserIdAsync`, `GetByItemIdAsync` |
| `ITransactionRepository` | + `GetByUserIdAsync` (FROM ou TO) |
| `IUnitOfWork` | `ExecuteInTransactionAsync(...)` com/sem retorno |
| `IDbSession` | Abstração de sessão transacional |
| `IPasswordHasher` | `Hash(string)` / `Verify(string, hash)` |

---

## 3. Endpoints da API

Prefixo base: `/api/{controller}`. Autenticação via JWT Bearer.

Legenda: 🔓 Público · 🔑 [Authorize] · 👑 [Authorize(Roles = "Admin")]

### AuthController — `/api/auth`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| POST | `/register` | Registra usuário; bônus de 100 EQL; retorna JWT | 🔓 |
| POST | `/login` | Autentica por email/senha; retorna JWT | 🔓 |
| GET | `/profile` | Perfil do usuário autenticado | 🔑 |
| PUT | `/profile` | Atualiza Name/AvatarUrl/Bio | 🔑 |

### UsersController — `/api/users`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| GET | `` | Lista usuários paginado | 🔑 |
| GET | `/{id}` | Detalha um usuário | 🔓 |
| PUT | `/{id}` | Atualiza perfil | 🔑 |
| DELETE | `/{id}` | Exclui usuário | 🔑 |

### AdminController — `/api/admin` (inteiro [Authorize Admin])

| Método | Rota | Resumo |
|--------|------|--------|
| GET | `/users/pending` | Usuários para revisao |
| PUT | `/products/{id}/approve` | Seta Status = Active |
| PUT | `/products/{id}/reject` | Seta Status = Rejected |
| PUT | `/users/{id}/ban` | Stub (nao finalizado) |
| PUT | `/users/{id}/unban` | Stub (nao finalizado) |

### CommunitiesController — `/api/communities`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| GET | `` | Lista comunidades paginado | 🔓 |
| GET | `/{id}` | Detalha comunidade | 🔓 |
| POST | `` | Cria comunidade (criador vira membro + moderador) | 🔑 |
| PUT | `/{id}` | Atualiza comunidade | 🔑 |
| POST | `/{id}/join?inviteCode=` | Entra (privada exige inviteCode) | 🔑 |
| POST | `/{id}/leave` | Sai da comunidade | 🔑 |
| POST | `/{id}/moderators` | Promove moderador | 🔑 |
| DELETE | `/{id}/moderators/{userId}` | Remove moderador (nao o criador) | 🔑 |
| GET | `/member/{userId}` | Comunidades de um membro | 🔓 |

### ProductsController — `/api/products`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| GET | `` | Lista produtos paginado | 🔓 |
| GET | `/{id}` | Detalha produto | 🔓 |
| POST | `` | Cria produto | 🔑 |
| PUT | `/{id}` | Atualiza produto | 🔑 |
| DELETE | `/{id}` | Exclui produto | 🔑 |
| GET | `/seller/{sellerId}` | Produtos de um vendedor | 🔓 |
| GET | `/category/{category}` | Produtos por categoria | 🔓 |
| POST | `/{id}/buy` | Compra (debita EQL, credita vendedor) | 🔑 |

### ServicesController — `/api/services`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| GET | `` | Lista serviços paginado | 🔓 |
| GET | `/{id}` | Detalha serviço | 🔓 |
| POST | `` | Cria serviço | 🔑 |
| PUT | `/{id}` | Atualiza serviço | 🔑 |
| DELETE | `/{id}` | Exclui serviço | 🔑 |
| GET | `/provider/{providerId}` | Serviços de um prestador | 🔓 |
| POST | `/{id}/hire` | Contrata (debita EQL) | 🔑 |

### TransactionsController — `/api/transactions`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| POST | `` | Cria transação (atômica) | 🔑 |
| GET | `/user/{userId}` | Transaçoes do usuário | 🔑 |
| GET | `/{id}` | Detalha transação | 🔑 |

### ReviewsController — `/api/reviews`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| POST | `` | Cria review | 🔑 |
| GET | `/item/{itemId}` | Reviews de um item | 🔓 |
| GET | `/{id}` | Detalha review | 🔓 |

### FilesController — `/api/files`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| POST | `/upload` | Upload de imagem (max 5MB, rate-limited 10/min) | 🔑 |

### SearchController — `/api/search`

| Método | Rota | Resumo | Auth |
|--------|------|--------|------|
| GET | `/products?q=&page=&pageSize=` | Busca textual em produtos | 🔓 |
| GET | `/services?q=&page=&pageSize=` | Busca textual em serviços | 🔓 |

### Infraestrutura

| Método | Rota | Resumo |
|--------|------|--------|
| GET | `/health` | Health check geral |
| GET | `/health/ready` | Health check ready (MongoDB) |

> **Total: 48 endpoints.**

---

## 4. Regras de Negócio no Código

### 4.1 Carteira EQL
- Bônus de boas-vindas: **100 EQL** ao registrar
- `User.Debit` lança `InvalidOperationException` se saldo insuficiente
- Crédito/Débito só aceitam valores > 0
- Money arredonda para 2 casas (banker's rounding)

### 4.2 Transaçoes Financeiras
- Executam dentro de `IUnitOfWork.ExecuteInTransactionAsync(...)` — transação atômica MongoDB
- Fluxo: busca fromUser e toUser → Debit(amount) → Credit(amount) → atualiza ambos → insere Transaction
- Se qualquer passo falhar, tudo é abortado

### 4.3 Compra/Contratação
- Comprador nao pode ser o vendedor/prestador
- Cria Transaction com `TransactionType = Purchase` e `RelatedItemId`

### 4.4 Comunidades
- Privada exige InviteCode válido (8 caracteres)
- Criador vira membro e moderador automaticamente
- Criador nao pode ser removido de moderador

### 4.5 Reviews
- Auto-review proibido
- Rating 1-5
- ItemType restrito a "Product" ou "Service"

### 4.6 Tratamento de Erros

| Exceção | HTTP | Error |
|---------|------|-------|
| `UnauthorizedAccessException` | 401 | "Unauthorized" |
| `ArgumentException` | 400 | "ValidationError" |
| `InvalidOperationException` | 400 | "OperationError" |
| `KeyNotFoundException` | 404 | "NotFound" |
| outras | 500 | "InternalServerError" |

---

## 5. Configuração

### appsettings.json (base)

```jsonc
"MongoDb": {
  "ConnectionString": "mongodb://localhost:27017",
  "DatabaseName": "equivale"
},
"Jwt": {
  "Issuer": "equivale-api",
  "Audience": "equivale-client",
  "ExpirationMinutes": 60
},
"AllowedOrigins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
"FileStorage": {
  "BasePath": "uploads",
  "UrlPrefix": "/api/files",
  "MaxFileSizeBytes": 5242880,
  "AllowedExtensions": [".jpg",".jpeg",".png",".gif",".webp"]
}
```

### JWT
- Algoritmo: HS256
- Claims: Sub (userId), Email, name, Role
- Secret em Development: appsettings.Development.json (dev only)
- Secret em Produção: User Secrets ou variável de ambiente

### DI Registrations
- `IMongoClient` → Singleton
- `MongoDbContext`, `IUnitOfWork`, Repositories → Scoped
- `IPasswordHasher` → Singleton
- Application Services (Auth, User, Product, etc.) → Scoped
- AutoMapper, FluentValidation, MediatR → registrados via extensao

### Pipeline HTTP (ordem)
1. GlobalExceptionHandling
2. Health checks
3. Swagger (Dev)
4. CORS ("AllowFrontend")
5. RateLimiter (fixed window 10/min)
6. Static files (/api/files)
7. Authentication → Authorization → MapControllers

---

## 6. Testes

Projeto `equivale.UnitTests` — xUnit 2.9.2 + FluentAssertions + Moq + coverlet.

| Area | Cobertura |
|------|----------|
| Value Objects (`Email`, `Money`) | Completa (construção, validação, operadores) |
| Entidade `User` (carteira) | Crédito/débito/invariantes |
| Paginação | PaginationParams + PagedResult |
| Validators | 4 de 9 (Register, Review, Transaction, Product) |
| File Storage | Settings + Service (com disco real) |
| Handlers/Commands | Parcial (sem mocks de repos MongoDB) |
| Controllers/Integração | Nao há |

**Total: ~78 testes** em 12 classes.

---

## 7. Pontos de Atenção Técnica

1. **`UserService.DeleteAsync` é no-op** — o UsersController contorna chamando o repo direto
2. **`AdminController.BanUser/UnbanUser` sao stubs** — só atualizam UpdatedAt
3. **Enums `CommunityType`/`ProductVisibilityType`** existem mas nao sao usados (entidade usa string)
4. **Rate limiter é global** (afeta todas as rotas, nao só upload)
5. **JWT Secret** hardcoded em appsettings.Development.json (OK para dev, migrar em prod)
6. **Sem testes de integração** HTTP/MongoDB

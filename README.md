# Equivale

> Plataforma de economia colaborativa onde **comunidades são o coração** da experiência.
> Pessoas se organizam em comunidades para trocar produtos e serviços usando **EQL**, a moeda virtual da plataforma.

---

## Visao Geral

Equivale conecta pessoas que compartilham interesses em comum — artesãos, devs, veganos, músicos, criadores — em um ambiente que valoriza a troca e a vivência comunitária. Nao é um marketplace genérico: cada comunidade tem suas próprias regras, moderadores e visibilidade.

### O que torna o Equivale diferente

- **Comunidades como centro** — nao é uma vitrine匿名a; é um espaco de pertencimento
- **EQL como moeda** — moeda virtual interna que facilita trocas sem complexidade financeira
- **Controle do criador** — quem cria a comunidade define tipo de acesso, visibilidade dos produtos e gerencia moderadores
- **Economia colaborativa** — sem dinheiro real, sem taxas, sem intermediários

---

## Stack Tecnológica

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| **Backend** | .NET (C#) | 9.0 |
| **Banco de Dados** | MongoDB | 8.3 |
| **Frontend** | SolidJS + TypeScript | 1.9 |
| **Estilização** | Tailwind CSS | 4.0 |
| **Build Frontend** | Vite | 6.0 |
| **Autenticação** | JWT Bearer (HS256) | — |
| **Arquitetura Backend** | Clean Architecture + DDD | — |

### Bibliotecas-chave do Backend

- **MediatR** — CQRS (Commands e Queries separados)
- **FluentValidation** — validação declarativa de DTOs
- **AutoMapper** — mapeamento Entity ↔ DTO
- **MongoDB.Driver** — driver oficial MongoDB
- **BCrypt.Net-Next** — hash de senhas
- **Swashbuckle.AspNetCore** — Swagger/OpenAPI (dev)
- **Serilog** — logging estruturado

---

## Estrutura do Projeto

```
equivale/
├── README.md                 ← voce esta aqui
├── BUSINESS.md               ← regras de negócio e visao de produto
├── docs/                     ← documentação técnica detalhada
│   ├── BACKEND.md            ← arquitetura, domínio, endpoints, padrões
│   ├── FRONTEND.md           ← design system, páginas, componentes
│   ├── ROADMAP.md            ← guia de continuidade e prioridades
│   ├── CONTRIBUINDO.md       ← fluxo de trabalho com perfis Hermes
│   └── RELATORIO_FRONTEND.md ← análise técnica exaustiva do frontend
├── backend/                  ← .NET 9 Clean Architecture
│   ├── equivale.sln
│   ├── src/
│   │   ├── equivale.Domain/         # Entidades, Value Objects, Enums, Interfaces
│   │   ├── equivale.Application/    # CQRS, DTOs, Validators, Services, Mappings
│   │   ├── equivale.Infrastructure/ # MongoDB, Repositories, Security, Storage
│   │   └── equivale.Api/            # Controllers, Program.cs, Middleware, Config
│   ├── tests/
│   │   └── equivale.UnitTests/      # xUnit + FluentAssertions + Moq
│   └── seed_data.json               # dataset para import manual
└── frontend/                 ← SolidJS + Tailwind
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── pages/            # 12 páginas (rotas)
        ├── components/       # ui/, layout/, marketplace/, community/, admin/, wallet/
        ├── services/         # API client + mappers
        ├── store/            # estado global (auth, theme)
        ├── hooks/            # useAuth, useTheme, useApi
        └── types/            # interfaces de domínio
```

---

## Como Executar

### Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [MongoDB 8+](https://www.mongodb.com/try/download/community) rodando em `localhost:27017`

### Backend

```bash
cd backend

# Restaurar dependências
dotnet restore

# Build
dotnet build

# Rodar a API (Swagger em https://localhost:7080)
cd src/equivale.Api
dotnet run
```

**Endpoints do backend:**
- HTTP: `http://localhost:5053`
- HTTPS: `https://localhost:7080`
- Swagger UI: `https://localhost:7080/swagger` (apenas em Development)
- Health check: `https://localhost:7080/health`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em modo desenvolvimento (http://localhost:3000)
npm run dev

# Build de produção
npm run build
```

### MongoDB

O MongoDB deve estar rodando em `mongodb://localhost:27017`. A base de dados `equivale` é criada automaticamente na primeira escrita.

Para popular com dados de exemplo, use o arquivo `backend/seed_data.json` (import manual via pymongo ou MongoDB Compass).

---

## Modelo de Domínio (Resumo)

```
User ──┬── cria ──→ Community ──┬── tem ──→ Product (compra com EQL)
       │                         └── tem ──→ Service (contrata com EQL)
       ├── publica ──→ Product
       ├── oferece ──→ Service
       ├── envia ────→ Transaction (EQL entre usuários)
       └── escreve ──→ Review (sobre produtos/serviços/usuários)
```

| Entidade | Responsabilidade |
|----------|-----------------|
| **User** | Usuário com carteira EQL, perfil, papel (User/Admin) |
| **Community** | Agrupamento de usuários com regras de acesso e visibilidade |
| **Product** | Item a venda dentro de uma comunidade (em EQL) |
| **Service** | Serviço oferecido por um usuário (em EQL) |
| **Transaction** | Movimentação de EQL (compra, transferência, bônus) |
| **Review** | Avaliação (1-5 estrelas) de itens ou usuários |

> **Value Objects:** `Email` (normalizado, validado) e `Money` (imutável, arredondamento bancário, nunca negativo).

---

## Endpoints da API (Visao de Alto Nível)

| Controller | Endpoints | Auth |
|-----------|-----------|------|
| `/api/auth` | register, login, profile | Público/🔑 |
| `/api/users` | CRUD de usuários | 🔑 |
| `/api/communities` | CRUD + join/leave + moderadores | Público/🔑 |
| `/api/products` | CRUD + buy + busca por vendedor/categoria | Público/🔑 |
| `/api/services` | CRUD + hire | Público/🔑 |
| `/api/transactions` | criar + histórico | 🔑 |
| `/api/reviews` | criar + por item | Público/🔑 |
| `/api/files` | upload de imagens | 🔑 |
| `/api/search` | busca textual (produtos/serviços) | Público |
| `/api/admin` | moderação (aprovar/rejeitar/banir) | 👑 Admin |
| `/health` | health check + readiness | Público |

> Total: **48 endpoints**. Documentação completa em `docs/BACKEND.md`.

---

## Perfis Hermes — Fluxo de Trabalho

O projeto é desenvolvido usando perfis especializados do Hermes Agent. Cada perfil tem uma persona e responsabilidade:

| Perfil | Persona | Responsabilidade |
|--------|---------|-----------------|
| **arquiteto** | Arquiteto de Software | Padrões de design, decisões arquiteturais, trade-offs |
| **dev** (Codex) | Engenheiro .NET Sênior | Clean Code, SOLID, DDD, C#, testes, refatoração |
| **front** (PixelCraft) | UX Engineer | Design system, acessibilidade, microinterações, performance |
| **orq** (Hermes Orquestrador) | Product Manager | Visao de produto, priorização, delegação, Definition of Done |

Fluxo típico: **orq** define a visao → delega para **dev** (backend) e **front** (frontend) → **arquiteto** valida padrões e trade-offs.

> Detalhes em `docs/CONTRIBUINDO.md`.

---

## Status do Projeto

### MVP (Fase 1) — Completo no backend

- [x] Cadastro e autenticação (JWT)
- [x] Perfis de usuário + carteira EQL
- [x] Comunidades (criar, listar, detalhe, join/leave)
- [x] Tipos de acesso (aberta/privada) + códigos de convite
- [x] Visibilidade de produtos por comunidade
- [x] Moderadores (adicionar/remover)
- [x] Marketplace de produtos (CRUD + compra)
- [x] Marketplace de serviços (CRUD + contratação)
- [x] Carteira EQL + transações atômicas
- [x] Reviews (criar, consultar)
- [x] Busca textual (MongoDB Text Index)
- [x] Admin dashboard (aprovar/rejeitar)
- [x] Upload de imagens + rate limiting

### Frontend — Estado atual

- [x] Auth (login/register/profile)
- [x] Listagem (produtos/serviços/comunidades) com paginação e filtros
- [x] Detalhe de produto/serviço/comunidade
- [x] Criação de comunidade (modal)
- [x] Compra de produto / contratação de serviço
- [ ] **Criação/edição/exclusão de produto** (service pronto, sem UI)
- [ ] **Criação/edição/exclusão de serviço** (service pronto, sem UI)
- [ ] **Gestão de comunidade** (editar, membros, moderadores via UI)
- [ ] Reviews (UI + service)
- [ ] Corrigir dark mode (bug de store de tema)
- [ ] Wallet (transferência real)
- [ ] Admin (conectar dados reais)

> Roadmap detalhado com prioridades em `docs/ROADMAP.md`.

---

## Documentação

| Documento | Conteúdo |
|-----------|---------|
| [BUSINESS.md](./BUSINESS.md) | Regras de negócio, modelo de domínio, público-alvo, roadmap de produto |
| [docs/BACKEND.md](./docs/BACKEND.md) | Arquitetura .NET, entidades, endpoints, padrões de design, testes |
| [docs/FRONTEND.md](./docs/FRONTEND.md) | Estrutura SolidJS, design system, páginas, services, estado atual |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Prioridades, telas a implementar, guia de continuidade |
| [docs/CONTRIBUINDO.md](./docs/CONTRIBUINDO.md) | Fluxo de trabalho com perfis Hermes, padrões de commit, DoD |
| [docs/RELATORIO_FRONTEND.md](./docs/RELATORIO_FRONTEND.md) | Análise técnica exaustiva do frontend (bugs, gaps, componentes) |

---

## Licença

Projeto privado. Todos os direitos reservados.

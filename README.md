# eqüivale

Plataforma de economia colaborativa para troca de produtos, serviços e talentos usando moeda virtual (EQL) entre comunidades.

> Feito pra comunidade — uma alternativa ao mercado tradicional, onde pessoas trocam valor diretamente, sem intermediários corporativos.

## Stack

- **Backend**: .NET 9, MongoDB, CQRS (MediatR), AutoMapper, Serilog
- **Frontend**: SolidJS, TailwindCSS, Vite
- **Auth**: JWT em cookie HttpOnly (7 dias)
- **DB**: MongoDB (local ou Atlas)

## Como rodar

### Backend
```bash
cd backend
dotnet restore
dotnet build
cd src/equivale.Api
dotnet run
# API: http://localhost:5053
# Swagger: http://localhost:5053/swagger
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

### Seed (dados de teste)
```bash
# Via curl/Postman:
POST http://localhost:5053/api/seed/run?reset=true&users=20&communities=10&products=80&services=40
```

**Usuário admin**: `rodneydocarmo@gmail.com` / `123Mudar!`
**Usuários de teste**: `@equivale.test` / `Eql@2026`

## Ambientes (dev/hom)

O projeto roda em dois ambientes que **coexistem simultaneamente**, cada um em sua pasta/branch com portas próprias:

| Ambiente | Pasta | Branch | Backend | Frontend | Acesso |
|---|---|---|---|---|---|
| **dev** | `equivale\dev` | `dev` | 5053 | 3000 | `localhost` / IP interno (LAN) |
| **hom** | `equivale\hom` | `hom` | 5054 | 3001 | `https://app.rodney.website` (túnel Cloudflare) |

As portas são **env-driven** (não divergem entre branches): `start.ps1` lê `BACKEND_PORT`/`VITE_PORT` (defaults 5053/3000 = dev) e `vite.config.ts` lê `VITE_PORT`/`VITE_API_TARGET`.

### Como subir

```powershell
# DEV (interno): portas 5053/3000
cd C:\Users\rodne\projetos\equivale\dev; .\start.ps1

# HOM (Cloudflare): portas 5054/3001 + túnel
cd C:\Users\rodne\projetos\equivale\hom
$env:BACKEND_PORT=5054; $env:VITE_PORT=3001
.\start.ps1 -Tunnel
```

> Primeira vez no hom: `cd hom\frontend; npm install` e `cd hom\backend; dotnet build`.

### Auto-start no logon
Para iniciar o ambiente automaticamente no boot/login, rode (uma vez):
```powershell
.\scripts\setup-autostart.ps1
```

### Pré-requisito HOM: `.env.cloudflare`
O `start.ps1 -Tunnel` **exige** o arquivo `.env.cloudflare` no host, contendo:
```
CLOUDFLARE_TUNNEL_TOKEN=<token>
```
Este arquivo é **gitignored** — provisione-o manualmente em todo host de deploy. Sem ele o script aborta no passo do túnel (backend e frontend continuam saudáveis, mas `app.rodney.website` fica offline).

## Funcionalidades

### Marketplace
- Produtos e serviços com categorias, tags automáticas, facets dinâmicos
- Filtros em cascata (categoria + tags com contagem em tempo real)
- Ordenação: mais recentes, menor preço, maior preço
- Busca unificada com autocomplete (produtos + serviços + comunidades)
- Paginação configurável (24/36/48/60 itens)

### Comunidades
- Abertas (entrada livre) ou privadas (senha única ou solicitação+aprovação)
- Membros, moderadores e criador com permissões distintas
- Produtos/serviços vinculados a comunidades
- Páginas dedicadas: membros, produtos, serviços da comunidade

### Transações (Escrow)
Fluxo completo de compra com calção:
```
Pedido criado (valor bloqueado) → Vendedor confirma → Vendedor envia → 
Comprador confirma entrega → Comprador avalia → Pagamento liberado
```
- Calção: valor reservado na criação do pedido
- Cancelamento: estorno automático
- Avaliação obrigatória para liberar pagamento

### Painel do Usuário
- Visão geral com stats e ações pendentes
- Meus produtos/serviços (pausar, editar, excluir)
- Compras e vendas com timeline completa
- Extrato financeiro na carteira

### Admin
- Dashboard com estatísticas da plataforma
- Gerenciar usuários (promover, banir)
- Moderar produtos

## Arquitetura

Ver [ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalhes de DDD, padrões e fluxos.

## Estrutura do Projeto

```
equivale/
├── backend/
│   └── src/
│       ├── equivale.Domain/          # Entidades, enums, value objects, interfaces
│       ├── equivale.Application/     # DTOs, services, commands/queries, mappings
│       ├── equivale.Infrastructure/  # MongoDB, repositories, serializers
│       └── equivale.Api/             # Controllers, middleware, DI, auth
├── frontend/
│   └── src/
│       ├── components/               # UI reutilizável (Card, Button, grids, etc)
│       ├── pages/                    # Páginas/rotas
│       ├── services/                 # Clients da API + mappers
│       ├── store/                    # Estado global (auth, theme)
│       └── types/                    # Tipos TypeScript
└── docs/                             # Documentação
```

## Documentação

- [BUSINESS.md](BUSINESS.md) — Regras de negócio
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Arquitetura técnica
- [docs/archive/PLANO_MASTER.md](docs/archive/PLANO_MASTER.md) — Plano de desenvolvimento (histórico)

## Licença

Privado — © 2026 eqüivale

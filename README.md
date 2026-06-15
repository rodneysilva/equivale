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
# Swagger: http://localhost:5053/scalar
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
- [docs/PLANO_MASTER.md](docs/PLANO_MASTER.md) — Plano de desenvolvimento

## Licença

Privado — © 2026 eqüivale

# Equivale — Documento de Negócios

## Visao

Equivale é uma plataforma de economia colaborativa onde **comunidades sao o coração** da experiência. Pessoas se organizam em comunidades para trocar produtos e serviços usando **EQL**, a moeda virtual da plataforma.

O foco é conectar pessoas que compartilham interesses em comum — artesãos, devs, veganos, músicos, criadores — em um ambiente que valoriza a troca e a vivência comunitária.

## Proposta de Valor

- **Comunidades como centro**: Nao é um marketplace genérico. Cada comunidade tem suas próprias regras, moderadores e visibilidade.
- **EQL como moeda**: Moeda virtual interna que facilita trocas sem complexidade financeira. Sem dinheiro real, sem taxas, sem intermediários.
- **Controle do criador**: Quem cria a comunidade define tipo de acesso (aberta ou privada), visibilidade dos produtos e gerencia moderadores.
- **Economia colaborativa**: Foco em pertencimento, troca e cultura DIY/maker — nao em consumo.

---

## Modelo de Domínio

### Entidades Principais

```
User ──┬── cria ──→ Community ──┬── abriga ──→ Product (compra com EQL)
       │                         └── abriga ──→ Service (contrata com EQL)
       ├── publica ──→ Product
       ├── oferece ──→ Service
       ├── envia ────→ Transaction (EQL entre usuários)
       └── escreve ──→ Review (sobre produtos/serviços)
```

| Entidade | Papel no Negócio |
|----------|-----------------|
| **User** | Usuário com carteira EQL, perfil público, papel (User/Admin) |
| **Community** | Agrupamento de usuários com regras de acesso e visibilidade |
| **Product** | Item físico a venda (novo/usado/recondicionado), precificado em EQL |
| **Service** | Serviço oferecido por um usuário, precificado em EQL |
| **Transaction** | Movimentação de EQL (compra, transferência, bônus) |
| **Review** | Avaliação (1-5 estrelas) de produtos ou serviços |

### Value Objects

| VO | Razao de Existir |
|----|-----------------|
| **Email** | Normalização automática (lowercase, trim), validação de formato, igualdade por valor |
| **Money** | Moeda EQL imutável, nunca negativa, arredondamento bancário (2 casas), operadores sobrecarregados |

> O Money é a espinha dorsal do sistema financeiro. Sua imutabilidade garante que operações de crédito/débito nunca mutam saldos por engano — toda operação cria uma nova instância.

---

## Regras de Negócio

### Moeda (EQL)

- **Bônus de boas-vindas**: Todo novo usuário recebe **100 EQL** ao se registrar.
- **Saldo nunca negativo**: O sistema impede débitos que excedam o saldo disponível (exceção lançada).
- **Crédito/Débito só aceitam valores > 0** (zero ou negativo é rejeitado).
- **Arredondamento bancário**: Todas as operaçoes arredondam para 2 casas (MidpointRounding.ToEven).
- **Transações atômicas**: Transferências de EQL entre usuários executam em transação MongoDB multi-documento (commit ou abort completo — nada de saldo parcial).
- **Tipos de transação**: Compra (Purchase), Transferência (Transfer), Bônus (Bonus).

### Comunidades

#### Criação
- Qualquer usuário autenticado pode criar uma comunidade.
- Informações obrigatórias: nome, descrição.
- Informações opcionais: imagem, capa.
- O criador é automaticamente membro e moderador.

#### Tipo de Acesso
- **Aberta** (`open`): Qualquer pessoa pode entrar e ver o conteúdo.
- **Privada** (`private`): Acesso apenas por convite (código de 8 caracteres gerado pelo sistema).

#### Visibilidade dos Produtos
- **Pública** (`public`): Produtos da comunidade sao visíveis para qualquer pessoa na plataforma.
- **Membros** (`members`): Produtos só sao visíveis para quem faz parte da comunidade.

#### Moderadores
- O criador da comunidade é automaticamente o dono.
- O dono pode adicionar moderadores (por ID de usuário).
- O criador **nao pode ser removido** da lista de moderadores (proteção de domínio).
- Moderadores podem gerenciar conteúdo e membros.

#### Convites (comunidades privadas)
- O sistema gera automaticamente um código de 8 caracteres (maiúsculas) ao criar uma comunidade privada.
- Novos membros inserem o código para solicitar entrada.
- Sem código válido, a entrada é rejeitada.

### Produtos

- Publicados por usuários.
- Atributos: título, descrição, preço (em EQL), categoria, condição (novo/usado/recondicionado), imagens.
- Status: `Active` (disponível), `Inactive`, `PendingModeration`, `Rejected`.
- **Compra direta** pelo marketplace usando saldo EQL.
- **Auto-compra proibida**: o comprador nao pode ser o próprio vendedor.

### Serviços

- Publicados por usuários (podem estar vinculados a comunidades).
- Atributos: título, descrição, preço (em EQL), categoria, duração, localizaçao, imagens.
- Status: `Active` (disponível), `Inactive`, `PendingModeration`, `Rejected`.
- **Contratação direta** usando saldo EQL.
- **Auto-contratação proibida**: o cliente nao pode ser o próprio prestador.

### Reviews / Avaliaçoes

- Avaliaçoes de 1 a 5 estrelas.
- Podem ser sobre produtos ou serviços.
- **Auto-review proibido**: o avaliador nao pode avaliar a si mesmo.
- Permitem comentário textual (ate 1000 caracteres).

### Perfis de Usuário

- Nome, email, bio, avatar.
- Estatísticas: produtos publicados, transaçoes realizadas.
- Papéis: usuário comum (`User`), administrador da plataforma (`Admin`).

### Upload de Imagens

- Extensões permitidas: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`.
- Tamanho máximo: 5 MB por arquivo.
- Rate limiting: 10 uploads por minuto por usuário.
- Armazenamento local com nome único (GUID), organizado por data.

### Moderação (Admin)

- Administradores podem aprovar ou rejeitar produtos pendentes.
- Painel de gestao de usuários.
- Banimento/desbanimento (stub — em implementaçao).

---

## Público-Alvo

Pessoas jovens, alternativas, que valorizam:
- Compartilhamento e troca
- Comunidades e pertencimento
- Economia colaborativa
- Cultura DIY e maker

---

## Categorias do Marketplace

### Produtos
Artesanato, Fotografia, Arte, Madeira, Alimentaçao, Jardinagem, Tecnologia, Bem-estar

### Serviços
Design, Programaçao, Marketing, Escrita, Consultoria, Aulas, Fotografia, Outros

> As categorias sao definidas no frontend (hardcoded). O backend aceita qualquer string.

---

## Roadmap

### Fase 1 — MVP (Atual)
- [x] Cadastro e autenticação (JWT)
- [x] Perfis de usuário + carteira EQL (bônus de 100 EQL)
- [x] Comunidades (criar, listar, detalhe, join/leave)
- [x] Tipos de acesso (aberta/privada) + códigos de convite
- [x] Visibilidade de produtos por comunidade
- [x] Moderadores (adicionar/remover)
- [x] Marketplace de produtos e serviços (CRUD + compra/contratação)
- [x] Transaçoes EQL atômicas
- [x] Reviews (backend completo)
- [x] Busca textual indexada
- [x] Admin dashboard (aprovar/rejeitar)
- [x] Upload de imagens + rate limiting

### Fase 2 — Engajamento (Próxima)
- [ ] Criação/edição/exclusão de produtos no frontend
- [ ] Criação/edição/exclusão de serviços no frontend
- [ ] Gestão completa de comunidade (membros, moderadores, ediçao)
- [ ] Corrigir dark mode (frontend)
- [ ] Reviews no frontend (UI + StarRating)
- [ ] Wallet: transferência real de EQL
- [ ] Admin: dados reais + moderaçao
- [ ] Feed de atividade por comunidade
- [ ] Sistema de convites com link
- [ ] Chat entre membros
- [ ] Notificaçoes push

### Fase 3 — Crescimento
- [ ] App mobile (PWA)
- [ ] Integração com redes sociais
- [ ] Programa de indicação
- [ ] Marketplace cross-community
- [ ] API pública para integraçoes

---

## Tech Stack

- **Backend**: .NET 9 (C#) — Clean Architecture + DDD + CQRS (MediatR)
- **Banco de dados**: MongoDB 8.3
- **Frontend**: SolidJS 1.9 + TypeScript + Tailwind CSS 4.0
- **Build**: Vite 6.0
- **Autenticação**: JWT Bearer (HS256, expiração 60 min)
- **Documentação API**: Swagger/OpenAPI (Swagger UI em dev)
- **Logging**: Serilog (console + arquivo com rotaçao diária)

> Documentação técnica detalhada: [docs/BACKEND.md](./docs/BACKEND.md) e [docs/FRONTEND.md](./docs/FRONTEND.md).

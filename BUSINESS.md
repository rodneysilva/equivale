# Regras de Negócio — eqüivale

## Moeda: EQL
- Moeda virtual interna, não conversível para moeda real
- Usuários recebem saldo inicial ao se cadastrar (configurável no seed)
- Saldo pode ser: **disponível** (usável) ou **bloqueado** (calção/reserva)

## Usuários

### Roles
| Role | Permissões |
|---|---|
| **User** | Comprar, vender, criar comunidades, participar de comunidades |
| **Admin** | Tudo de User + painel admin, promover/banir usuários, moderar conteúdo |
| **Banned** | Não pode logar nem interagir |

### Perfil
- Nome, bio, avatar, social links (10 tipos: GitHub, Instagram, Mastodon, etc.)
- Avaliações visíveis publicamente (sem saldo)
- 40 avatares temáticos disponíveis (estilos DiceBear)

## Produtos

### Campos
- Título, descrição, categoria, preço (EQL), frete, estoque, condição
- Imagens, tags (geradas automaticamente), comunidade vinculada (opcional)

### Categorias (8)
Artesanato, Fotografia, Arte, Madeira, Alimentação, Jardinagem, Tecnologia, Bem-estar

### Condições
Novo, Usado, Recondicionado

## Serviços

### Campos
- Título, descrição, categoria, preço (EQL), duração, localização
- Imagens, tags, comunidade vinculada (opcional)

### Categorias (8)
Design, Programação, Marketing, Escrita, Consultoria, Aulas, Fotografia, Outros

## Comunidades

### Tipos
- **Aberta**: qualquer um entra livremente
- **Privada**: entrada por senha única (uso único) OU solicitação + aprovação

### Hierarquia
| Role | Permissões |
|---|---|
| **Criador** | Tudo + excluir comunidade, gerenciar moderadores |
| **Moderador** | Aprovar/rejeitar membros, expulsar membros, gerenciar conteúdo |
| **Membro** | Ver conteúdo, comprar/vender dentro da comunidade |

### Visibilidade de Produtos
- Comunidade pode definir se produtos são visíveis para não-membros
- Se privado: apenas membros veem produtos/serviços/membros

## Transações (Escrow)

### Fluxo de Compra
```
1. OrderPlaced      — Comprador cria pedido (valor BLOQUEADO do saldo)
2. OrderConfirmed   — Vendedor confirma o pedido
3. Shipped          — Vendedor envia (com código de rastreio)
4. Delivered        — Comprador confirma recebimento
5. Finished         — Comprador avalia → pagamento LIBERADO ao vendedor
   Cancelled        — Cancelado a qualquer momento antes do Finished → ESTORNO
```

### Calção (Escrow)
- **Na criação**: valor sai do saldo disponível → vai para bloqueado
- **No cancelamento**: valor volta do bloqueado → disponível (estorno)
- **Ao finalizar** (após avaliação): valor sai do bloqueado → credita vendedor

### Frete
- Definido pelo vendedor na criação do produto (0 = sem frete)
- Incluído no total da transação
- Serviços não têm frete

### Endereço de Entrega
- Comprador informa na criação do pedido (produtos apenas)
- Visível apenas para o vendedor
- Serviços não exigem endereço

## Avaliações

- Obrigatórias para finalizar a transação (liberar pagamento)
- Comprador avalia o vendedor (rating 1-5 + comentário opcional)
- Vendedor pode avaliar o comprador
- Visíveis no perfil público de cada usuário
- Uma avaliação por transação por pessoa

## Busca

- Autocomplete a partir de 2 caracteres
- Busca por substring (regex) em título, descrição, categoria e tags
- Resultados unificados: produtos + serviços + comunidades
- Paginação client-side (24 por página)

## Tags

- Geradas automaticamente no backend a partir de título + categoria + descrição
- Stopwords em português removidas
- Normalizadas (sem acento, minúsculas)
- Filtro AND (cada tag selecionada refina a busca)
- Contagens dinâmicas (facets em cascata)

## Admin

- Acesso apenas para role Admin
- Dashboard: contagem de usuários, produtos, serviços, comunidades, transações
- Promover/banir usuários
- Remover produtos, serviços, comunidades

## Modelo de Receita

### Taxa de Transação
- **2%** sobre cada transação finalizada (configurável em `appsettings.json` → `TransactionFee.Percent`)
- Cobrada do **vendedor**: `sellerPayout = total - fee`
- Creditada na conta **tesouraria** (`tesouraria@equivale`, criada automaticamente no seed)
- Visível no painel admin: `TotalFeesCollected`, `TotalVolume`, taxa média
- A taxa é aplicada apenas quando a transação chega ao status `Finished`

## Demurrage do EQL (Anti-inflação)

> **Conceito (fase 1 — documentado, não implementado)**

### O problema
Sem um mecanismo de "queima" de moeda, a base monetária do EQL só cresce (saldo inicial no cadastro + circulação sem destruição). Com o tempo, cada EQL vale menos — é a inflação da moeda social.

### Proposta — Taxa de Retenção (Demurrage)
- **0,5% ao mês** sobre saldo parado (WalletBalance acima de certo piso, ex: 100 EQL)
- Aplica-se apenas ao saldo **disponível** (não ao bloqueado em transações)
- A taxa é "queimada" (destruída), reduzindo a base monetária
- Incentiva a **circulação**: melhor gastar/trocar EQL do que acumular

### Gatilhos de isenção
- Usuários com menos de 100 EQL são isentos (pisão básico)
- Saldo bloqueado em transações ativas não sofre demurrage
- Atividade nos últimos 30 dias (comprou ou vendeu) isenta do mês corrente

### Implementação futura
- Job agendado (Hangfire/Quartz) que roda 1x por mês
- Itera sobre todos os usuários, calcula demurrage, debita
- Registra transação de "queima" no ledger para auditoria
- Notifica usuários antes da cobrança (X EQL serão debitados em Y dias)

### Por que é importante
- **Moeda social só funciona se circular** — acumular não gera valor
- **Previne inflação** — sem demurrage, a base monetária cresce infinitamente
- **Incentiva trocas** — usuários preferem gastar a ver o saldo corroer
- **Diferencia de banco** — reforça o conceito de economia solidária (dinheiro é meio, não fim)

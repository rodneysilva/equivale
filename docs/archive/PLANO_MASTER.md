# Plano Master: Admin Panel + Transações + Review

> Data: 15/06/2026
> Status: Implementação

---

## FASE 1: Backend Review + Promover Admin

### 1.1 Promover usuário admin
- Adicionar campo `Stock` ao Product (quantidade)
- Endpoint `POST /api/admin/promote` (Dev only) ou via seed
- Promover `rodneydocarmo@gmail.com` para `UserRole.Admin`

### 1.2 Backend review
- ✅ DDD: Domain/Application/Infrastructure/Api separados
- ✅ Repositories seguem padrão BaseRepository
- ✅ CQRS com MediatR (Commands/Queries)
- 🔧 Limpar código duplicado em SearchRepository
- 🔧 Adicionar validação nos DTOs

---

## FASE 2: Sistema de Transações

### 2.1 Transaction Entity (Domain)
```
Transaction {
  Id, BuyerId, SellerId, ItemType (Product|Service),
  ItemId, ItemTitle, Quantity, UnitPrice, TotalPrice,
  Status: Pending → ConfirmedByBuyer → ConfirmedBySeller → Completed | Cancelled,
  BuyerConfirmedAt?, SellerConfirmedAt?, CompletedAt?,
  CreatedAt, UpdatedAt
}
```

### 2.2 TransactionStatus (Enum)
- Pending: criada, esperando confirmação
- ConfirmedByBuyer: comprador confirmou recebimento
- ConfirmedBySeller: vendedor confirmou entrega
- Completed: ambos confirmaram
- Cancelled: cancelada por uma das partes

### 2.3 Endpoints
- POST /api/transactions (buy)
- GET /api/transactions (minhas transações — filtro buy/sell)
- GET /api/transactions/:id
- PUT /api/transactions/:id/confirm-buyer
- PUT /api/transactions/:id/confirm-seller
- PUT /api/transactions/:id/cancel

### 2.4 Lógica
- Criar: debitar comprador, creditar vendedor (escrow temporário)
- Confirmar comprador: marcar BuyerConfirmedAt
- Confirmar vendedor: marcar SellerConfirmedAt
- Completar: ambos confirmados → transferir EQL definitivo, decrementar stock
- Cancelar: reembolsar comprador

---

## FASE 3: Sistema de Avaliações

### 3.1 Review Entity (já existe base)
```
Review {
  Id, TransactionId, ReviewerId, RevieweeId,
  Rating (1-5), Comment, CreatedAt
}
```

### 3.2 Endpoints
- POST /api/reviews (após transação completed)
- GET /api/users/:id/reviews (avaliações públicas)

---

## FASE 4: Admin Panel (Frontend)

### 4.1 Páginas
- /admin — Dashboard (stats: usuários, produtos, transações)
- /admin/users — CRUD usuários (promover/banir)
- /admin/products — Moderar produtos
- /admin/communities — Moderar comunidades
- /admin/categories — Gerenciar categorias

### 4.2 Guards
- Route guard: só `role === 'admin'`
- Redirect não-admins para home

---

## FASE 5: Painel de Transações (Frontend)

### 5.1 Páginas
- /transactions — Lista (abas: Compras / Vendas)
- /transactions/:id — Detalhe com ações (confirmar/cancelar)
- /profile — Adicionar histórico de transações

### 5.2 Funcionalidades
- Criar compra a partir do ProductDetailPage
- Confirmação em duas partes (buyer + seller)
- Avaliação após conclusão
- Histórico visível no perfil público

---

## FASE 6: Mobile & Layout

### 6.1 Issues conhecidas
- Navbar mobile: menu responsivo
- Grid de produtos: 2 colunas no mobile
- CommunityDetail: banner responsivo
- Filtros sidebar: drawer no mobile

---

## FASE 7: Documentação

### 7.1 Arquivos
- Atualizar README.md
- Atualizar BUSINESS.md
- Criar ARCHITECTURE.md (padrões DDD/SOLID)

# Plano: Seed de Conteúdo + Tags + Vínculo Comunidade

> Status: Planejamento → Implementação
> Data: 15/06/2026

---

## 1. Objetivos

1. **Popular o banco** com conteúdo realista: usuários, comunidades (com criadores + moderadores), produtos (todas as categorias) e serviços, **incluindo fotos**.
2. **Vínculo com comunidade** em produto/serviço: mostrar na tela de detalhe a qual comunidade o item pertence (se o usuário tiver permissão) e permitir navegar até ela.
3. **Tags automáticas** para produtos/serviços + **filtro por tags** nas listagens.

---

## 2. Decisões Técnicas

### Imagens (seed)
- Avatares: `https://i.pravatar.cc/300?img={n}` (fotos reais de pessoas).
- Produtos/Serviços: `https://picsum.photos/seed/{slug}/800/800` (fotos reais, estáveis por seed).
- Comunidades: `https://picsum.photos/seed/{slug}/800/400` (capa).
- Racional: fotos realistas sem armazenar arquivos localmente; carregam pela internet no dev.

### Tags automáticas
- Geradas no **backend** (domínio/application) a partir de `Title + Category + Description`.
- Algoritmo: tokenização por espaços, remoção de stopwords (pt-BR), normalização (lowercase, sem acento), dedupe, máximo 6 tags.
- Persistidas no documento (`Tags: List<string>`), geradas no create/update se não vierem explícitas.

### Vínculo comunidade
- `Product` e `Service` recebem `CommunityId` (nullable).
- O DTO de saída é enriquecido com `CommunityName` (via lookup no repositório/query).
- Visibilidade: respeita `Community.ProductVisibility` (`public` mostra a todos; `members` exige membership — para o seed usaremos comunidades `public` para já aparecer).

### Filtro por tag
- Query param `?tag=xxx` nos endpoints `GET /products` e `GET /services`.
- Repositório adiciona `Filter.AnyIn(p => p.Tags, [tag])` quando informado.

---

## 3. Mudanças por Camada

### 3.1 Backend — Domain

| Arquivo | Mudança |
|---|---|
| `Domain/Entities/Product.cs` | + `string? CommunityId`, + `List<string> Tags`, + `ProductCondition Condition` |
| `Domain/Entities/Service.cs` | + `string? CommunityId`, + `List<string> Tags` |
| `Domain/Enums/ProductCondition.cs` | NOVO: `New, Used, Refurbished` |

### 3.2 Backend — DTOs

| Arquivo | Mudança |
|---|---|
| `ProductDto` | + `CommunityId`, `CommunityName`, `SellerName`, `SellerAvatarUrl`, `Condition`, `Tags` |
| `ServiceDto` | + `CommunityId`, `CommunityName`, `ProviderName`, `ProviderAvatarUrl`, `Tags` |
| `CreateProductDto` | + `string? CommunityId`, `string? Condition`, `List<string>? Tags` |
| `CreateServiceDto` | + `string? CommunityId`, `List<string>? Tags` |

### 3.3 Backend — Mapping & Queries

| Arquivo | Mudança |
|---|---|
| `MappingProfile.cs` | mapear novos campos; `Condition` string↔enum |
| `ProductTagGenerator` (novo) | gerar tags a partir do texto |
| `GetProductByIdQuery` / `GetAllProductsQuery` | enriquecer DTO com seller + community names; aceitar `Tag` |
| `ProductRepository` | `GetPagedFilteredAsync` recebe `tag`; filtro `AnyIn` |
| Análogo para Services |

### 3.4 Backend — Controllers

| Arquivo | Mudança |
|---|---|
| `ProductsController` | `GetAll` recebe `?tag=` |
| `ServicesController` | `GetAll` recebe `?tag=` |

### 3.5 Backend — Seed

| Arquivo | Mudança |
|---|---|
| `Application/Services/SeedService.cs` (novo) | cria usuários, comunidades, produtos, serviços, tags |
| `Api/Controllers/SeedController.cs` (novo, Dev only) | `POST /api/seed/run` |

**Conteúdo do seed:**
- ~10 usuários fictícios (nomes reais BR, bios, avatares pravatar).
- ~6 comunidades (Artesanato, Devs, Veganos, Músicos, Fotografia, Jardinagem) — criador + 2 moderadores cada.
- ~40 produtos cobrindo TODAS as 8 categorias, distribuídos entre comunidades.
- ~24 serviços cobrindo TODAS as 8 categorias.
- Tags geradas automaticamente em todos.
- IDs determinísticos? Não — Mongo gera. Seed é idempotente por email (skip se já existe).

### 3.6 Frontend

| Arquivo | Mudança |
|---|---|
| `types/index.ts` | Product: + `tags?`, já tem `communityId/communityName/sellerName/condition`; Service: + `tags/communityId/communityName/providerName` |
| `services/mappers.ts` | mapProduct/mapService populam novos campos |
| `services/products.service.ts` / `services.service.ts` | `getAll` aceita `tag` |
| `pages/ProductDetailPage.tsx` | badge de comunidade **clicável** → `/communities/{id}`; exibe tags |
| `pages/ServiceDetailPage.tsx` | idem |
| `pages/ProductsPage.tsx` / `ServicesPage.tsx` | filtro de tags (chips) |
| `components/marketplace/ProductCard.tsx` | mostra tags (opcional) |

---

## 4. Critérios de Aceitação

- [ ] `POST /api/seed/run` popula o banco sem erros e é idempotente.
- [ ] Listagem de produtos mostra itens em todas as 8 categorias com fotos.
- [ ] Listagem de serviços mostra itens em todas as 8 categorias com fotos.
- [ ] Comunidades aparecem com criador e moderadores.
- [ ] Detalhe de produto/serviço mostra badge da comunidade (clicável) quando aplicável.
- [ ] Tags aparecem nos detalhes e é possível filtrar por tag nas listagens.
- [ ] Backend compila; frontend builda sem erros.

---

## 5. Ordem de Execução

1. Domain (entidades + enum).
2. DTOs.
3. TagGenerator + Mapping + enriquecimento de queries.
4. Repositórios (filtro tag) + queries + controllers.
5. SeedService + SeedController.
6. Frontend types/mappers/services.
7. Frontend detail pages + list pages.
8. Build, rodar seed, testar, commit + push.

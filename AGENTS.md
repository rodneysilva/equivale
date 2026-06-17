# AGENTS.md — Memória do Projeto eqüivale

> **Memória específica do projeto eqüivale.** O AGENTS.md global
> (`~/.config/kilo/AGENTS.md`) contém padrões universais (PowerShell, MongoDB,
> PWA, cloudflared, etc). Este arquivo complementa com o que é ÚNICO deste projeto.

---

## Stack

- **Backend:** .NET 9, MongoDB, DDD (Domain/Application/Infrastructure/Api), CQRS com MediatR 14.x (licença Apache-2.0)
- **Frontend:** SolidJS, TailwindCSS v4 (CSS-first, sem tailwind.config), Vite 6
- **Auth:** JWT em cookie HttpOnly (via proxy Vite), claim `sub` mapeada para NameIdentifier
- **BD:** MongoDB local (serviço Windows) ou Docker (replica set rs0); database name em appsettings.json
- **Transações ACID:** `IUnitOfWork.ExecuteInTransactionAsync` envolve apenas `FinishTransactionAsync` (libera pagamento). Demais writes (create/cancel) usam optimistic locking + escrow, não ACID.

---

## Padrões e Convenções IMPORTANTES

> Padrões universais (PowerShell 5.1, rebuild .NET, MongoDB PascalCase, optimistic locking)
> estão no AGENTS.md global (`~/.config/kilo/AGENTS.md`). Abaixo apenas o específico do projeto.

---

## Fluxo de Trabalho (regras do dono)

- **SEMPRE commitar e fazer push ao final de cada tarefa** — não esperar o usuário pedir. É a regra padrão.
- Antes de commitar: rode lint/typecheck/build (ou os testes e2e se tocou no frontend) e verifique `git status` + `git diff`.
- Mensagens em português, conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `infra:`, `test:`).
- Revisões de código (`/local-review`) ficam para o final do dia, em conjunto — não interromper a cada tarefa.

---

## Arquitetura — Decisões

### Embed de Nomes (anti N+1)
- Product e Service **embutem** SellerName/SellerAvatarUrl/CommunityName (e ProviderName/ProviderAvatarUrl) no documento.
- São populados no command handler (CreateProductCommand/CreateServiceCommand) ao criar.
- O `DtoEnricher` permanece como **fallback** para documentos legados sem os campos.
- `MappingProfile` mapeia direto da entidade (sem `ForCtorParam(_ => null)`).

### Modelo de Receita
- Taxa de **2%** sobre cada transação finalizada (config: `TransactionFee:Percent` em appsettings.json).
- Cobrada do vendedor: `sellerPayout = total - fee`.
- Creditada na conta tesouraria: `tesouraria@equivale.com` (criada automaticamente no seed).
- Visível no painel admin: `TotalFeesCollected`, `TotalVolume`, taxa média.

### Escrow (Fluxo de Transação)
```
OrderPlaced → (vendedor) OrderConfirmed → (vendedor) Shipped → (comprador) Delivered → (review) Finished
                ↑ comprador pode Cancelar em qualquer estado antes de Delivered
```
- `buyer.Block(total)` ao criar (move WalletBalance → BlockedBalance).
- `buyer.ReleaseBlocked(total)` + `seller.Credit(sellerPayout)` + `treasury.Credit(fee)` ao finalizar.
- A finalização acontece quando o **comprador cria uma review** da transação entregue.

### Fire-and-forget (Atividades)
- `IUserActivityService.LogAsync` é chamado com `_ = service.LogAsync(...)` (sem await).
- Falhas no log NUNCA quebram a operação principal.
- Tipos: ProductPublished, ServicePublished, CommunityCreated, CommunityJoined, Purchase, Sale, ReviewGiven, PostCreated, ProfileUpdated.

---

## Endpoints — Mapa Rápido

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login (email, password) |
| POST | `/api/auth/register` | Registro |
| GET | `/api/auth/profile` | Perfil logado |
| GET/POST | `/api/products` | Listar/Criar produtos |
| GET/PUT/DELETE | `/api/products/{id}` | CRUD produto |
| GET/POST | `/api/services` | Listar/Criar serviços |
| GET/PUT/DELETE | `/api/services/{id}` | CRUD serviço |
| GET/POST | `/api/communities` | Listar/Criar comunidades |
| GET/PUT/DELETE | `/api/communities/{id}` | CRUD comunidade (DELETE só dono) |
| POST | `/api/communities/{id}/join` | Entrar (body: `{password?, message?}` — privadas usam password/message) |
| POST | `/api/communities/{id}/leave` | Sair |
| GET | `/api/communities/{id}/members` | Lista membros (privadas: **403** para não-membros — só criador/moderador/membro/admin) |
| GET/POST | `/api/communities/{cid}/posts` | Posts da comunidade |
| GET/POST/DELETE | `/api/communities/{cid}/posts/{pid}/comments` | Comentários aninhados |
| POST | `/api/transactions` | Criar (comprar/contratar) |
| PUT | `/api/transactions/{id}/confirm-order` | Vendedor confirma |
| PUT | `/api/transactions/{id}/ship` | Vendedor envia |
| PUT | `/api/transactions/{id}/confirm-delivery` | Comprador confirma |
| PUT | `/api/transactions/{id}/cancel` | Cancelar |
| POST | `/api/reviews` | Criar review (finaliza transação) |
| GET | `/api/reviews?itemId=&itemType=` | Reviews por item |
| GET | `/api/reviews/user/{userId}` | Reviews sobre um usuário |
| GET | `/api/search/all?q=` | Busca unificada |
| GET | `/api/search/product-facets` | Facets produtos |
| GET | `/api/search/service-facets` | Facets serviços |
| GET | `/api/users/{id}/activities` | Feed de atividades |
| GET | `/api/admin/stats` | Dashboard (com taxas) |
| GET/POST | `/api/transactions/{id}/chat` | Chat comprador↔vendedor |
| GET | `/api/notifications` | Lista notificações do usuário |
| GET | `/api/notifications/unread-count` | Contagem de não-lidas |
| PUT | `/api/notifications/mark-read` | Marcar como lidas |
| POST | `/api/files/upload` | Upload de arquivos |
| GET | `/api/admin/moderation/posts` | Fila de moderação (posts) |
| PUT | `/api/admin/moderation/posts/{id}/hide` | Ocultar post |
| PUT | `/api/admin/moderation/posts/{id}/unhide` | Reexibir post |
| GET | `/api/admin/demurrage/preview` | Prévia do demurrage do mês |
| POST | `/api/admin/demurrage/run` | Executar demurrage manualmente |
| POST | `/api/seed/run` | Popular banco |

> Documentação interativa completa: `/swagger` (em Development).

---

## Ambientes (dev / hom) e Fluxo Git

Estrutura de trabalho (após executar `restructure.ps1`):
```
C:\Users\rodne\projetos\equivale\
  dev\   <- working copy principal, branch **dev** (Kilo abre aqui; roda em localhost)
  hom\   <- git worktree, branch **hom** (destino dos merges dev->hom)
```

- **Branches:** `master` (canônica/estável), `dev` (desenvolvimento ativo), `hom` (homologação).
- **Todo desenvolvimento acontece em `dev`** (pasta `equivale\dev`). É o ambiente padrão das conversas.
- **Merge para `hom`** só quando o usuário solicitar explicitamente (ex.: "faça merge para hom"). Para promover: `git -C C:\Users\rodne\projetos\equivale\hom merge dev` (ou PR).

### Portas por ambiente (coexistem simultaneamente)
| Ambiente | Backend | Frontend | Acesso |
|---|---|---|---|
| **dev** | 5053 | 3000 | `localhost` / IP interno (LAN) |
| **hom** | 5054 | 3001 | Cloudflare → `https://app.rodney.website` |

Portas são **env-driven** (não divergem entre branches): `vite.config.ts` lê `VITE_PORT`/`VITE_API_TARGET`; `start.ps1` lê `BACKEND_PORT`/`VITE_PORT` (defaults 5053/3000 = dev).

### Como subir cada ambiente
```powershell
# DEV (interno): portas 5053/3000
cd C:\Users\rodne\projetos\equivale\dev; .\start.ps1

# HOM (cloudflare): portas 5054/3001 + túnel
cd C:\Users\rodne\projetos\equivale\hom
$env:BACKEND_PORT=5054; $env:VITE_PORT=3001
.\start.ps1 -Tunnel
```
> Primeira vez no hom: `cd hom\frontend; npm install` e `cd hom\backend; dotnet build`.

### Cloudflare (HOM)
- Túnel roda via `cloudflared.exe tunnel run --token <TOKEN>` (token em `.env.cloudflare`, presente em dev e hom).
- **O ingress do túnel (no dashboard Zero Trust) deve apontar para `http://localhost:3001`** (frontend do hom). Se ainda aponta para `:3000`, atualize no dashboard — senão o túnel baterá no dev.
- Domínio público: `https://app.rodney.website` (CORS já liberado em appsettings `AllowedOrigins`). *(Nota: `app.rodney.silva` não existe na conta Cloudflare — domínio legado incorreto; sempre usar `.website`.)*

- **CI/CD**: `.github/workflows/ci.yml` roda em push/PR para dev/hom/master — backend (build + `dotnet test`) e frontend (`npm run build`).
- `restructure.ps1` (raiz dev): move o workspace para a estrutura dev/hom. Já executado.

---

## Identidade Visual

- **Paleta "Economia Solidária":** Verde floresta `#2D6A4F`, Terracota `#BC6C25`, Creme `#FEFAE0`, Dourado `#DDA15E`
- **Logo:** Símbolo de troca circular + wordmark "eqüivale" (COM TREMA ü) em **Inter** (classe `.eq-logo`)
- **Fontes:** Fraunces (títulos, `.eq-display`), Inter (corpo e wordmark do logo)
- **Cores de seção:** Community=verde, Product=terracota, Service=dourado
- Documentação completa: `docs/BRAND.md`

---

## Contas de Teste

| Email | Senha | Role |
|---|---|---|
| `rodneydocarmo@gmail.com` | `123Mudar!` | Admin |
| Usuários seed | `Eql@2026` | User |

---

## Processos em Execução (Background)

- **Backend:** `dotnet run --urls "http://localhost:5053"` (porta 5053)
- **Frontend:** `npm run dev` (porta 3000, host 0.0.0.0, allowedHosts: true)
- **Túnel Cloudflare:** `cloudflared.exe tunnel run --token <TOKEN>` → `https://app.rodney.website`
  - Tunnel ID permanente: `7dd51b4b-0537-48ad-ba30-d1981a03fefe`
  - Token de conexão em `.env.cloudflare` (gitignored)

> **⚠️ Pré-requisito de deploy:** `start.ps1` **exige** o arquivo `.env.cloudflare`
> (com `CLOUDFLARE_TUNNEL_TOKEN=<token>`) no host antes de rodar. Sem ele o script
> aborta no passo 3/3 (o túnel não sobe) — backend e frontend continuam saudáveis,
> mas `app.rodney.website` fica offline. Provisione o arquivo em todo host de deploy.
  - Binário: `C:\Users\rodne\AppData\Local\Temp\kilo\cloudflared.exe`
- **MongoDB:** serviço local padrão

---

## Infra — Específico do Projeto

### Domínio e HTTPS
- **Domínio:** `app.rodney.website` (Cloudflare gerencia DNS)
- Tunnel roteia `app.rodney.website` → `http://localhost:3000` (Vite)
- Vite proxy roteia `/api/*` → `http://localhost:5053` (backend)
- IP atual da LAN: `192.168.15.63` (DHCP — pode mudar)

### CORS (appsettings.json → AllowedOrigins) — 9 origens
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://localhost:5174`
- `https://localhost:3000`
- `http://192.168.15.63:3000`
- `https://192.168.15.63:3000`
- `https://app.rodney.silva` *(legado; domínio inexistente — manter por referência)*
- `https://app.rodney.website`
- Ao mudar o IP (DHCP), adicionar o novo IP aqui.

---

## Armadilhas Conhecidas

1. **`$pid` é reservado no PowerShell** — use `$productId` ou outro nome.
2. **CRLF/LF warnings** no git — harmless, ignorar.
3. **`CreatePostDto` tem campos opcionais** (CommunityId/AuthorId nullable) — o controller pega do token/rota.
4. **Comunidades privadas** requerem `{password}` no body do join (POST `/communities/{id}/join`).
5. **Stock decrementa** apenas para Products (não Services) na finalização.
6. **Delete de comunidade** só pelo criador (endpoint no CommunitiesController) ou admin (AdminController).
7. **Ownership:** Products/Services/Users CRUD validam dono (ou admin) no controller; SellerId/ProviderId vêm do token, não do body.

---

## Testes E2E (Playwright)

Config: `frontend/playwright.config.ts` — 3 projetos:
- **`setup`** — faz login via API (`POST /api/auth/login`) e salva o cookie `eql_token` em `frontend/e2e/.auth/user.json` (gitignored).
- **`chromium`** — testes anônimos (sem cookie). Specs em `frontend/e2e/*.spec.ts`.
- **`chromium-authenticated`** — testes autenticados, reusam o `storageState` salvo. Specs em `frontend/e2e/authenticated/*.spec.ts`.

### Como rodar
```powershell
# 1. Suba backend (porta 5053) + frontend (porta 3000) — use .\start.ps1
# 2. (uma vez) Instale browsers do Playwright
cd frontend; npx playwright install chromium
# 3. Rode todos os testes
cd frontend; npm run test:e2e
#    ou com UI interativa
cd frontend; npm run test:e2e:ui
```

### Pré-requisitos de dados
- O admin `rodneydocarmo@gmail.com` / `123Mudar!` precisa existir (rodar `POST /api/seed/run` antes).
- Variáveis de ambiente opcionais (sobrescrevem defaults do setup):
  - `E2E_API_URL` (default `http://localhost:5053`)
  - `E2E_USER_EMAIL` / `E2E_USER_PASSWORD`

### Cobertura atual (~41 testes)
- `auth.spec.ts` — login válido/inválido, navegação register→login
- `marketplace.spec.ts`, `navigation.spec.ts`, `community.spec.ts` — smoke anônimo (+ listagem exclui Sold/sem-estoque)
- `authenticated/create-product.spec.ts` — publicar produto e vê-lo na lista
- `authenticated/edit-product.spec.ts`, `edit-service.spec.ts` — edição de itens
- `authenticated/delete-product.spec.ts` — exclusão
- `authenticated/service-crud.spec.ts` — CRUD de serviços
- `authenticated/purchase.spec.ts` — checkout completo (comprar → ver pedido)
- `authenticated/transaction-flow.spec.ts` — fluxo two-actor completo (compra→confirma→envia→entrega→avalia→Finished, com taxa + estoque) e cancel
- `authenticated/chat.spec.ts` — chat two-actor (buyer envia pela UI, seller responde via API, buyer vê via polling)
- `authenticated/community-crud.spec.ts`, `onboarding.spec.ts`, `notifications.spec.ts`
- `authenticated/profile.spec.ts` — perfil
- `authenticated/wallet.spec.ts` — carteira/saldo
- `authenticated/admin-pages.spec.ts` — páginas admin
- `authenticated/moderation.spec.ts` — moderação de conteúdo
- `authenticated/demurrage.spec.ts` — demurrage (preview/run)

### Padrões
- Login é feito via **API** no setup (não pela UI) para velocidade; o cookie HttpOnly é reusado.
- Não use `getByLabel` para o componente `Input` (label e input são siblings sem `for`/`id`) — use `placeholder` ou `data-testid`.
- **workers: 1** (config) — testes autenticados mutam a carteira do admin (Block/Credit); paralelismo causa `ConcurrencyException` por optimistic locking concorrente. Não rodar e2e autenticados em paralelo.
- **Marcador de teste**: todo dado criado por E2E (comunidade/produto/serviço/post/etc.) deve conter **"E2E"** no nome/título/content. Assim o script de limpeza o reconhece. Não polua o banco de dev com dados sem marcador.
- **Limpeza pós-teste**: os testes criam dados no banco compartilhado de dev. Após uma sessão de E2E, rode `npm run test:cleanup` (em `frontend/`) — executa `scripts/cleanup-test-data.js` (mongosh) que remove tudo com marcador "E2E" + posts/comentários/transações/chat órfãos. Exige `mongosh` no PATH.
- **Two-actor**: para fluxos buyer↔seller, crie um contexto API isolado pro seller via `import { request as pwRequest } from 'playwright'`; sellers seed logam com `Eql@2026`.

---

## Próximos Passos (Roadmap)

- [x] Onboarding guiado (wizard de boas-vindas)
- [x] Hero da home mais emocional
- [x] Notificações (badge na navbar)
- [x] Docker/docker-compose para onboarding
- [x] Transações MongoDB ACID para FinishTransactionAsync
- [x] Limpeza de código morto (src/UI/, componentes órfãos)
- [x] Testes e2e com Playwright (auth setup, create-product, purchase, login)
- [x] Chat comprador/vendedor (two-actor e2e)
- [x] CreatorName legacy fallback (estabilizado + backfill de dados)
- [x] Polimento visual/código (cores→tokens CSS, código morto removido, toasts consistentes)
- [x] Testes do fluxo financeiro (17 unit tests do TransactionService + e2e two-actor completo)
- [x] Bug crítico da tesouraria corrigido (finalização com taxa quebrava o escrow)
- [x] Moderação de conteúdo (admin: ocultar/excluir posts e comentários)
- [x] Demurrage real do EQL (serviço + ledger + scheduler automático)

### Dívida técnica remanescente (registrar)
- [ ] **Pix on/off-ramp — BLOQUEADO**: exige escolher provedor (Mercado Pago/Gerencianet/Asaas), chaves de API, webhooks e KYC. Não implementar "cego" (seria código morto). Decisão de produto.
- [x] Scheduler de demurrage automático (BackgroundService mensal, restart-safe/idempotente)
- [ ] DI duplicada: `IBaseRepository<Post>` registrado como `BaseRepository<Post>` genérico além de `IPostRepository`→`PostRepository` (dois singletons sobre a mesma coleção; inofensivo)
- [ ] Moderação: comentário pai ocultado deixa replies órfãos como raízes na árvore pública
- [ ] Chat sem paginação/marcação de leitura; polling fixo 5s sem backoff
- [ ] `AdminStatsDto` casts long→int (counts long→int; seguro até <2bi)

### Resolvido recentemente
- [x] Moderação: cascade ao ocultar/exibir comentário (propaga aos descendentes — sem replies órfãos)
- [x] AdminDashboardPage stat cards alinhados às cores de seção (tokens, sem hardcoded)
- [x] Guards de segurança: JWT secret fail-fast em produção + `SeedController [Authorize(Admin)]`
- [x] Gate de qualidade typecheck: **0 erros TS** (`npm run typecheck`); Solid CSSProperties usa kebab-case
- [x] Index único em `users.Email` (integridade + previne race da tesouraria)
- [x] Removido `productsService.getByCategory()` (órfão)

---

*Última atualização: 17/06/2026*


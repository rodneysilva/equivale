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
- Creditada na conta tesouraria: `tesouraria@equivale` (criada automaticamente no seed).
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
| POST | `/api/communities/{id}/join` | Entrar (body: `{}`) |
| POST | `/api/communities/{id}/leave` | Sair |
| GET | `/api/communities/{id}/members` | Lista membros |
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
| POST | `/api/seed/run` | Popular banco |

---

## Identidade Visual

- **Paleta "Economia Solidária":** Verde floresta `#2D6A4F`, Terracota `#BC6C25`, Creme `#FEFAE0`, Dourado `#DDA15E`
- **Logo:** Símbolo de troca circular + wordmark "eqüivale" (COM TREMA ü) em Fraunces
- **Fontes:** Fraunces (títulos, `.eq-display`), Inter (corpo)
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
  - Binário: `C:\Users\rodne\AppData\Local\Temp\kilo\cloudflared.exe`
- **MongoDB:** serviço local padrão

---

## Infra — Específico do Projeto

### Domínio e HTTPS
- **Domínio:** `app.rodney.website` (Cloudflare gerencia DNS)
- Tunnel roteia `app.rodney.website` → `http://localhost:3000` (Vite)
- Vite proxy roteia `/api/*` → `http://localhost:5053` (backend)
- IP atual da LAN: `192.168.15.63` (DHCP — pode mudar)

### CORS (appsettings.json → AllowedOrigins)
- `http://localhost:3000`
- `https://localhost:3000`
- `http://192.168.15.63:3000`
- `https://192.168.15.63:3000`
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

### Cobertura atual
- `auth.spec.ts` — login válido/inválido, navegação register→login
- `marketplace.spec.ts`, `navigation.spec.ts`, `community.spec.ts` — smoke anônimo
- `authenticated/create-product.spec.ts` — publicar produto e vê-lo na lista
- `authenticated/purchase.spec.ts` — checkout completo (comprar → ver pedido)

### Padrões
- Login é feito via **API** no setup (não pela UI) para velocidade; o cookie HttpOnly é reusado.
- Não use `getByLabel` para o componente `Input` (label e input são siblings sem `for`/`id`) — use `placeholder` ou `data-testid`.

---

## Próximos Passos (Roadmap)

- [x] Demurrage do EQL (documentado no BUSINESS.md — implementação pendente)
- [x] Onboarding guiado (wizard de boas-vindas)
- [x] Hero da home mais emocional
- [x] Notificações (badge na navbar)
- [x] Docker/docker-compose para onboarding
- [x] Transações MongoDB ACID para FinishTransactionAsync
- [x] Limpeza de código morto (src/UI/, componentes órfãos)
- [x] Testes e2e com Playwright (auth setup, create-product, purchase, login)
- [ ] Chat comprador/vendedor (já implementado, falta testar)
- [ ] CreatorName legacy fallback (já implementado, falta testar)

---

*Última atualização: 16/06/2026*
*Commit atual: aaa85cb*

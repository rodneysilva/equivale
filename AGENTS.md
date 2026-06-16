# AGENTS.md — Memória do Projeto eqüivale

> **Memória específica do projeto eqüivale.** O AGENTS.md global
> (`~/.config/kilo/AGENTS.md`) contém padrões universais (PowerShell, MongoDB,
> PWA, cloudflared, etc). Este arquivo complementa com o que é ÚNICO deste projeto.

---

## Stack

- **Backend:** .NET 9, MongoDB (sem transações ACID ainda), DDD (Domain/Application/Infrastructure/Api), CQRS leve (sem MediatR em produção por licença)
- **Frontend:** SolidJS, TailwindCSS v4 (CSS-first, sem tailwind.config), Vite 6
- **Auth:** JWT em cookie HttpOnly (via proxy Vite), claim `sub` mapeada para NameIdentifier
- **BD:** MongoDB local (sem Docker), database name em appsettings.json

---

## Padrões e Convenções IMPORTANTES

> Padrões universais (PowerShell 5.1, rebuild .NET, MongoDB PascalCase, optimistic locking)
> estão no AGENTS.md global (`~/.config/kilo/AGENTS.md`). Abaixo apenas o específico do projeto.

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
3. **MediatR sem licença** — warning no startup, harmless em dev.
4. **`CreatePostDto` tem campos opcionais** (CommunityId/AuthorId nullable) — o controller pega do token/rota.
5. **Comunidades privadas** requerem inviteCode ou oneTimePassword no join.
6. **Stock decrementa** apenas para Products (não Services) na finalização.
7. **Delete de comunidade** só pelo criador (endpoint no CommunitiesController) ou admin (AdminController).

---

## Próximos Passos (Roadmap)

- [x] Demurrage do EQL (anti-inflação — documentar no BUSINESS.md)
- [x] Onboarding guiado (wizard de boas-vindas)
- [x] Hero da home mais emocional
- [x] Notificações (badge na navbar)
- [x] Docker/docker-compose para onboarding
- [x] Transações MongoDB ACID para FinishTransactionAsync
- [x] Limpeza de código morto (src/UI/, componentes órfãos)
- [ ] Chat comprador/vendedor (já implementado, falta testar)
- [ ] CreatorName legacy fallback (já implementado, falta testar)
- [ ] Testes e2e com Playwright
- [ ] CI/CD pipeline

---

*Última atualização: 16/06/2026*
*Commit atual: e3972c4*

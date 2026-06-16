# AGENTS.md — Memória do Projeto eqüivale

> Este arquivo é a **memória persistente** do projeto. Toda decisão técnica importante,
> workaround, padrão e armadilha deve ser registrada aqui para que qualquer agente
> (ou humano) saiba o contexto sem redescobrir.

---

## Stack

- **Backend:** .NET 9, MongoDB (sem transações ACID ainda), DDD (Domain/Application/Infrastructure/Api), CQRS leve (sem MediatR em produção por licença)
- **Frontend:** SolidJS, TailwindCSS v4 (CSS-first, sem tailwind.config), Vite 6
- **Auth:** JWT em cookie HttpOnly (via proxy Vite), claim `sub` mapeada para NameIdentifier
- **BD:** MongoDB local (sem Docker), database name em appsettings.json

---

## Padrões e Convenções IMPORTANTES

### MongoDB
- **NÃO há convenção camelCase** no driver. Os campos são serializados em **PascalCase** (ex: `Version`, não `version`).
- Filtros manuais no `BaseRepository` devem usar `"Version"` (PascalCase), nunca `"version"`.
- O campo `_id` é a exceção (underscore é padrão do MongoDB).
- Documentos legados (criados antes de uma mudança de schema) podem **não ter** campos novos. O `BaseRepository.BuildOptimisticLockFilter` trata isso com `$or` + `$exists: false`.

### Optimistic Locking
- Todas as entidades têm `public long Version { get; set; }`.
- `BaseRepository.UpdateAsync` filtra por `_id + Version == expectedVersion`.
- Se `MatchedCount == 0`, lança `ConcurrencyException`.
- Documentos sem o campo `Version` (legados) são tratados: quando `expectedVersion == 0`, o filtro aceita `Version == 0` OU `Version` inexistente.

### PowerShell (Shell do projeto)
- O ambiente usa **PowerShell 5.1** (não 7+). `&&` **NÃO funciona** — use `;` ou `cmd /c`.
- `$pid`, `$host`, `$input` são variáveis reservadas — NUNCA use como nome de variável.
- Aspas duplas em `cmd /c` com JSON dão conflito — use arquivos temporários (`-d @arquivo.json`) ou `Invoke-RestMethod`.
- Para commits com `%` na mensagem: use `git -C <dir> commit -m "msg sem %"`. O `%` quebra o cmd.

### Backend — Rebuild
- O processo `equivale.Api` **bloqueia as DLLs**. Sempre faça `taskkill /F /IM equivale.Api` ANTES de `dotnet build`.
- Ou pare o background process primeiro.

### Frontend — Vite
- `vite.config.ts` tem `server.host: '0.0.0.0'` para acesso LAN.
- O proxy `/api` → `http://localhost:5053` resolve CORS automaticamente (o browser vê mesma origem).
- **NÃO use `@vitejs/plugin-basic-ssl`** — certificado auto-assinado não funciona para PWA no Android.

### PWA no Android
- Chrome Android **NÃO instala PWA com certificado auto-assinado** (só aceita HTTPS confiável).
- **Solução:** Cloudflare Tunnel (`cloudflared`). Binário em `C:\Users\rodne\AppData\Local\Temp\kilo\cloudflared.exe`.
- Comando: `cloudflared.exe tunnel --url http://localhost:3000` → gera URL `https://xxx.trycloudflare.com` com cert válido.
- localtunnel (`npx localtunnel`) é instável e mostra página de senha — **NÃO usar**.
- Traefik gera SSL via Let's Encrypt, **mas precisa de domínio público**. Para LAN sem domínio, cloudflared é a resposta.

### CORS
- Configurado em `appsettings.json` → `AllowedOrigins`.
- Origens atuais: localhost:3000, 192.168.15.63:3000 (HTTP e HTTPS).
- Ao mudar o IP da máquina (DHCP), atualizar `AllowedOrigins`.
- IP atual da LAN: `192.168.15.63` / IP público: `177.197.66.141`

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
- **Frontend:** `npm run dev` (porta 3000, host 0.0.0.0)
- **Túnel Cloudflare:** `cloudflared.exe tunnel --url http://localhost:3000` (URL muda a cada reinício)
- **MongoDB:** serviço local padrão

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

- [ ] Demurrage do EQL (anti-inflação — documentar no BUSINESS.md)
- [ ] Onboarding guiado (wizard de boas-vindas)
- [ ] Hero da home mais emocional
- [ ] Notificações (badge na navbar)
- [ ] Docker/docker-compose para onboarding
- [ ] Transações MongoDB ACID para FinishTransactionAsync
- [ ] Limpeza de código morto (src/UI/, componentes órfãos)

---

*Última atualização: 16/06/2026*
*Commit atual: e3972c4*

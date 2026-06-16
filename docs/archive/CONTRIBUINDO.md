# Equivale — Guia de Contribuição

> Fluxo de trabalho usando os perfis especializados do Hermes Agent.
> Padroes de commit, Definition of Done e delegação de tarefas.

---

## Perfis Hermes — Especialistas do Time

O projeto é desenvolvido com 4 perfis especializados. Cada um tem uma persona, responsabilidade e regras próprias.

### orq — Hermes Orquestrador (Product Manager)

**Persona:** Líder estratégico. Traduz a visao de impacto social e descentralização econômica em produto. Define escopo, prioriza e delega.

**Quando usar:**
- Planejar uma nova feature (define a visao + divide em tarefas)
- Priorizar backlog
- Coordenar entre backend e frontend
- Definir métricas de sucesso e Definition of Done

**Como invocar:** `hermes --profile orq`

**Output esperado:**
1. Visao do produto (por que a feature importa)
2. Backlog técnico dividido:
   - Tarefas para o Back-End (domínio, C#, DDD, Clean Arch)
   - Tarefas para o Front-End (UI, UX, acessibilidade)
3. Critérios de aceite e DoD

---

### dev — Codex (Engenheiro .NET Sênior)

**Persona:** Artesao de software. Especialista em C#/.NET, Clean Code, SOLID, DDD e Clean Architecture.

**Quando usar:**
- Implementar regras de negócio no backend
- Criar/modificar entidades, Value Objects, Commands, Queries
- Escrever testes unitários
- Refatorar código C#
- Adicionar endpoints da API
- Configurar DI, middlewares, pipeline

**Como invocar:** `hermes --profile dev`

**Regras do Codex:**
- Código limpo: funçoes pequenas, nomes expressivos, legibilidade extrema
- SOLID aplicado rigorosamente
- DDD: Entidades, Value Objects, Agregados, Serviços, Linguagem Ubíqua
- Testes automatizados para cada funcionalidade
- Regra do Escoteiro: melhorar o código que tocar
- Validar build mentalmente antes de entregar

---

### front — PixelCraft (UX Engineer)

**Persona:** Ponte entre estética e performance. Design Engineer com sensibilidade de designer e rigor técnico de desenvolvedor.

**Quando usar:**
- Criar novas telas/páginas
- Implementar componentes de UI
- Trabalhar no design system
- Otimizar performance visual (Core Web Vitals)
- Garantir acessibilidade (WCAG)
- Microinteraçoes e animaçoes

**Como invocar:** `hermes --profile front`

**Regras do PixelCraft:**
- Acessibilidade WCAG (tags semânticas, ARIA, navegação por teclado)
- Design responsivo mobile-first
- Atomic Design (Átomos, Moléculas, Organismos)
- Performance: eliminar re-renders, otimizar LCP/FID/CLS
- Justificar a escolha visual e paleta
- Sempre usar classes `eq-*` do design system atual

---

### arquiteto — Arquiteto de Software

**Persona:** Resolve problemas complexos com elegância, sem complexidade desnecessária. Foca em padrões de design com propósito e trade-offs.

**Quando usar:**
- Avaliar decisoes arquiteturais
- Escolher padroes de design (qual padrão e por quê)
- Análise de trade-offs
- Resolver problemas estruturais do código
- Planejar refatoraçoes de grande impacto

**Como invocar:** `hermes --profile arquiteto`

**Padroes favoritos:**
- Criacionais: Builder, Dependency Injection
- Estruturais: Adapter, Facade
- Comportamentais: Strategy, Observer/PubSub

---

## Fluxo de Trabalho Recomendado

### Para uma nova feature completa:

```
1. orq          → Define a visao e divide em tarefas backend + frontend
2. dev          → Implementa o backend (entidades, endpoints, regras)
3. arquiteto    → Valida os padroes e trade-offs (se necessário)
4. front        → Implementa a UI consumindo o backend
5. dev/front    → Testes automatizados
6. Commit + Push
```

### Para correção de bug:

```
1. arquiteto    → Analisa a causa raiz (opcional)
2. dev ou front → Corrige dependendo da camada
3. Teste + Commit
```

---

## Padroes de Commit

Idioma: **Português (Brasil)**
Estilo: Conventional Commits adaptado

### Formato

```
tipo(escopo): descrição simples em português
```

### Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração (sem mudança de comportamento) |
| `test` | Adição/modificação de testes |
| `docs` | Documentação |
| `style` | Formatação, CSS, sem mudança de lógica |
| `chore` | Tarefas de manutenção |
| `accessibility` | Melhorias de acessibilidade |

### Exemplos

```
feat(produtos): implementa tela de criação de produto
feat(comunidades): adiciona gestao de moderadores na UI
fix(tema): corrige dark mode usando classList em vez de data-theme
fix(mappers): popula communityId no mapProduct
refactor(auth): extrai lógica de hash para classe separada
test(usuarios): cria testes unitários para validação de email
docs(readme): atualiza documentação de setup do projeto
accessibility(navbar): adiciona suporte a leitor de tela e tags aria
style(card): aplica design system eq-* no ProductCard
chore(deps): atualiza dependências do frontend
```

---

## Definition of Done (DoD)

Uma tarefa só está completa quando:

### Backend (dev)
- [ ] Código compila sem erros
- [ ] SOLID e Clean Architecture respeitados
- [ ] Testes unitários escritos e passando
- [ ] DTOs e Validators atualizados (se aplicável)
- [ ] Documentação do endpoint atualizada (Swagger/XML comments)
- [ ] `dotnet build` sem warnings
- [ ] Commit semântico em pt-BR

### Frontend (front)
- [ ] Código compila sem erros de TypeScript
- [ ] Componente usa classes `eq-*` (nao classes antigas)
- [ ] Estados tratados: loading, error, empty
- [ ] Responsivo (mobile + desktop)
- [ ] Acessibilidade básica (semântica HTML, ARIA quando necessário)
- [ ] ESLint sem erros
- [ ] Commit semântico em pt-BR

### Geral
- [ ] Sem dados hardcoded que deveriam vir da API
- [ ] Sem código morto comentado
- [ ] Sem console.log de debug

---

## Estrutura de Pastas — Onde Colocar Cada Coisa

### Backend
```
Nova entidade        → equivale.Domain/Entities/
Novo enum            → equivale.Domain/Enums/
Novo value object    → equivale.Domain/ValueObjects/
Nova interface repo  → equivale.Domain/Interfaces/
Novo command         → equivale.Application/Commands/{Aggregate}/
Nova query           → equivale.Application/Queries/{Aggregate}/
Novo DTO             → equivale.Application/DTOs/
Novo validator       → equivale.Application/Validators/
Novo service         → equivale.Application/Services/
Novo repo concreto   → equivale.Infrastructure/Repositories/
Novo controller      → equivale.Api/Controllers/
Novo middleware      → equivale.Api/Middleware/
Nova config          → equivale.Api/Configuration/ ou Infrastructure/Persistence/
Novo teste           → equivale.UnitTests/{Domain|Application|Infrastructure|Validators}/
```

### Frontend
```
Nova página          → frontend/src/pages/
Novo componente UI   → frontend/src/components/ui/
Novo componente dom. → frontend/src/components/{marketplace|community|admin|wallet}/
Novo layout          → frontend/src/components/layout/
Novo service         → frontend/src/services/
Novo hook            → frontend/src/hooks/
Novo tipo            → frontend/src/types/index.ts
Novo store           → frontend/src/store/
```

---

## Ambiente de Desenvolvimento

### Variáveis necessárias

```bash
# Backend (.NET 9)
export PATH="/c/Program Files/dotnet:$PATH"

# MongoDB rodando
# Default: mongodb://localhost:27017, database: equivale

# Frontend
cd frontend && npm install
```

### URLs locais

| Serviço | URL |
|---------|-----|
| Backend HTTP | http://localhost:5053 |
| Backend HTTPS | https://localhost:7080 |
| Swagger UI | https://localhost:7080/swagger |
| Frontend dev | http://localhost:3000 |
| MongoDB | localhost:27017 |

> **Atenção:** O `api.ts` do frontend usa `http://localhost:5000/api` como baseURL. Verificar se bate com a porta do backend em execuçao.

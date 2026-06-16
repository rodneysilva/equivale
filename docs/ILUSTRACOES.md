# Ilustrações para Empty States — Conceitos

> Várias opções de ilustrações SVG para estados vazios (sem produtos, sem transações, sem comunidades, etc.).
> Cada uma usa a paleta **Economia Solidária** da marca.
> Veja qual se encaixa melhor — depois implemento a escolhida no componente `EmptyState`.

**Como visualizar:** copie o bloco `<svg>...</svg>` de cada conceito e cole num arquivo `.html` vazio, ou cole num site como https://www.svgviewer.dev ou https://codepen.io para ver renderizado.

---

## Paleta de referência (usada nas ilustrações)

| Nome | Hex |
|---|---|
| Verde Floresta | `#2D6A4F` |
| Verde Claro | `#D8F3DC` |
| Verde Profundo | `#1B4332` |
| Terracota | `#BC6C25` |
| Dourado | `#DDA15E` |
| Creme | `#FEFAE0` |
| Creme Escuro | `#F4F1DE` |

---

## CONCEITO A — "Mãos que Trocam" (genérico / principal)

**Ideal para:** empty state geral, "nada por aqui ainda"
**Sentimento:** comunidade, cooperação, troca

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <!-- fundo círculo suave -->
  <circle cx="100" cy="80" r="68" fill="#D8F3DC" opacity="0.6"/>
  <!-- mão esquerda (verde) -->
  <path d="M55 95 Q50 80 60 72 Q72 65 85 72 Q92 76 92 86 L92 100 Q92 108 84 108 L64 108 Q56 108 55 100 Z" fill="#2D6A4F"/>
  <!-- mão direita (terracota) -->
  <path d="M145 95 Q150 80 140 72 Q128 65 115 72 Q108 76 108 86 L108 100 Q108 108 116 108 L136 108 Q144 108 145 100 Z" fill="#BC6C25"/>
  <!-- símbolo de troca no centro (cíclo de setas) -->
  <path d="M88 78 A14 14 0 0 1 112 78" stroke="#DDA15E" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M112 98 A14 14 0 0 1 88 98" stroke="#DDA15E" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M108 74 L112 78 L116 74" stroke="#DDA15E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M92 102 L88 98 L84 102" stroke="#DDA15E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <!-- pontos decorativos -->
  <circle cx="40" cy="50" r="3" fill="#DDA15E"/>
  <circle cx="160" cy="55" r="2.5" fill="#2D6A4F"/>
  <circle cx="170" cy="110" r="2" fill="#BC6C25"/>
  <circle cx="30" cy="115" r="2.5" fill="#DDA15E"/>
</svg>
```

---

## CONCEITO B — "Caixa Aberta" (produtos / marketplace)

**Ideal para:** "nenhum produto encontrado", "nenhum produto publicado"
**Sentimento:** descoberta, embalagem, surpresa

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <circle cx="100" cy="78" r="62" fill="#FAEDCD" opacity="0.7"/>
  <!-- caixa (base) -->
  <path d="M62 88 L100 78 L138 88 L138 118 L100 128 L62 118 Z" fill="#DDA15E"/>
  <!-- lateral esquerda da caixa -->
  <path d="M62 88 L100 98 L100 128 L62 118 Z" fill="#BC6C25"/>
  <!-- tampa aberta (atrás) -->
  <path d="M75 68 L100 58 L125 68 L100 78 Z" fill="#DDA15E"/>
  <path d="M75 68 L62 88 L100 98 L100 78 Z" fill="#BC6C25" opacity="0.7"/>
  <!-- brilho saindo da caixa -->
  <circle cx="100" cy="52" r="4" fill="#DDA15E"/>
  <circle cx="88" cy="48" r="2.5" fill="#DDA15E" opacity="0.7"/>
  <circle cx="112" cy="50" r="2.5" fill="#DDA15E" opacity="0.7"/>
  <!-- pequenos pontos (conteúdo) -->
  <circle cx="95" cy="100" r="3" fill="#FEFAE0"/>
  <circle cx="108" cy="105" r="2.5" fill="#FEFAE0"/>
  <!-- elementos soltos ao redor -->
  <path d="M45 60 L52 67 L45 74" stroke="#2D6A4F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M155 60 L148 67 L155 74" stroke="#2D6A4F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="40" cy="120" r="2.5" fill="#BC6C25"/>
  <circle cx="165" cy="115" r="3" fill="#2D6A4F"/>
</svg>
```

---

## CONCEITO C — "Lupa na Planta" (busca sem resultados)

**Ideal para:** "nenhum resultado na busca", "nada encontrado"
**Sentimento:** exploração, busca, descoberta

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <circle cx="95" cy="75" r="58" fill="#D8F3DC" opacity="0.6"/>
  <!-- lupa (anel) -->
  <circle cx="90" cy="72" r="28" stroke="#2D6A4F" stroke-width="5" fill="none"/>
  <!-- cabo da lupa -->
  <path d="M110 92 L132 114" stroke="#2D6A4F" stroke-width="6" stroke-linecap="round"/>
  <!-- dentro da lupa: uma plantinha crescendo (descoberta) -->
  <path d="M90 82 L90 62" stroke="#2D6A4F" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M90 68 Q82 64 80 58" stroke="#52B788" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M90 72 Q98 68 100 62" stroke="#52B788" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <!-- folhinhas -->
  <ellipse cx="80" cy="58" rx="4" ry="2.5" fill="#52B788" transform="rotate(-30 80 58)"/>
  <ellipse cx="100" cy="62" rx="4" ry="2.5" fill="#52B788" transform="rotate(30 100 62)"/>
  <!-- vaso/terra -->
  <path d="M82 82 L98 82 L95 90 L85 90 Z" fill="#BC6C25"/>
  <!-- pontos decorativos -->
  <circle cx="50" cy="120" r="2.5" fill="#DDA15E"/>
  <circle cx="150" cy="60" r="2" fill="#2D6A4F"/>
  <circle cx="160" cy="100" r="3" fill="#BC6C25"/>
</svg>
```

---

## CONCEITO D — "Carteira com Folha" (sem transações / sem saldo)

**Ideal para:** "nenhuma movimentação", "sem transações ainda"
**Sentimento:** finanças naturais, crescimento orgânico

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <circle cx="100" cy="78" r="60" fill="#FAEDCD" opacity="0.6"/>
  <!-- carteira (corpo) -->
  <rect x="58" y="62" width="84" height="56" rx="8" fill="#2D6A4F"/>
  <!-- aba da carteira -->
  <path d="M58 70 Q58 62 66 62 L134 62 Q142 62 142 70 L142 80 L130 80 Q122 80 122 88 Q122 96 130 96 L142 96 L142 108 Q142 116 134 116 L66 116 Q58 116 58 108 Z" fill="#1B4332"/>
  <!-- botão/clasp -->
  <circle cx="132" cy="88" r="4" fill="#DDA15E"/>
  <!-- folha crescendo de dentro (natureza + dinheiro) -->
  <path d="M100 62 Q100 48 88 42 Q88 54 100 62 Z" fill="#52B788"/>
  <path d="M100 62 Q100 48 112 42 Q112 54 100 62 Z" fill="#DDA15E"/>
  <path d="M100 62 L100 50" stroke="#2D6A4F" stroke-width="1.5"/>
  <!-- moedinhas voando -->
  <circle cx="48" cy="50" r="5" fill="#DDA15E"/>
  <circle cx="152" cy="48" r="4" fill="#DDA15E" opacity="0.7"/>
  <circle cx="40" cy="78" r="3" fill="#DDA15E" opacity="0.5"/>
  <!-- pontos -->
  <circle cx="160" cy="115" r="2.5" fill="#BC6C25"/>
  <circle cx="42" cy="118" r="2" fill="#2D6A4F"/>
</svg>
```

---

## CONCEITO E — "Círculo de Pessoas" (comunidades)

**Ideal para:** "nenhuma comunidade", "seja o primeiro a criar"
**Sentimento:** pertencimento, grupo, coletivo

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <circle cx="100" cy="80" r="64" fill="#D8F3DC" opacity="0.5"/>
  <!-- círculo tracejado (a comunidade) -->
  <circle cx="100" cy="80" r="40" stroke="#2D6A4F" stroke-width="2.5" stroke-dasharray="5 5" fill="none" opacity="0.5"/>
  <!-- pessoas (4 ao redor do círculo) -->
  <!-- topo -->
  <circle cx="100" cy="40" r="9" fill="#2D6A4F"/>
  <path d="M88 56 Q88 46 100 46 Q112 46 112 56 Z" fill="#2D6A4F"/>
  <!-- direita -->
  <circle cx="140" cy="80" r="9" fill="#BC6C25"/>
  <path d="M128 96 Q128 86 140 86 Q152 86 152 96 Z" fill="#BC6C25"/>
  <!-- baixo -->
  <circle cx="100" cy="120" r="9" fill="#DDA15E"/>
  <path d="M88 104 Q88 114 100 114 Q112 114 112 104 Q112 114 100 114 Q88 114 88 104 Z" fill="#DDA15E"/>
  <!-- esquerda -->
  <circle cx="60" cy="80" r="9" fill="#2D6A4F"/>
  <path d="M48 96 Q48 86 60 86 Q72 86 72 96 Z" fill="#2D6A4F"/>
  <!-- coração central (conexão) -->
  <path d="M100 76 Q96 72 93 75 Q90 78 93 81 L100 88 L107 81 Q110 78 107 75 Q104 72 100 76 Z" fill="#BC6C25"/>
</svg>
```

---

## CONCEITO F — "Raio/Zap Adormecido" (serviços)

**Ideal para:** "nenhum serviço publicado", "sem serviços"
**Sentimento:** talento em potencial, energia esperando

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <circle cx="100" cy="78" r="58" fill="#FAEDCD" opacity="0.6"/>
  <!-- raio/zap (talento) -->
  <path d="M108 48 L78 86 L96 86 L88 110 L122 70 L104 70 L112 48 Z" fill="#DDA15E"/>
  <path d="M108 48 L78 86 L96 86 L88 110 L122 70 L104 70 L112 48 Z" stroke="#BC6C25" stroke-width="2" stroke-linejoin="round" fill="none"/>
  <!-- Zzz (adormecido / esperando) -->
  <text x="130" y="60" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#2D6A4F" opacity="0.5">z</text>
  <text x="140" y="50" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#2D6A4F" opacity="0.4">z</text>
  <text x="148" y="42" font-family="Inter, sans-serif" font-size="9" font-weight="700" fill="#2D6A4F" opacity="0.3">z</text>
  <!-- estrelas pequenas -->
  <circle cx="55" cy="60" r="2.5" fill="#DDA15E"/>
  <circle cx="150" cy="100" r="2" fill="#BC6C25"/>
  <circle cx="48" cy="100" r="3" fill="#2D6A4F" opacity="0.6"/>
</svg>
```

---

## CONCEITO G — "Balança em Equilíbrio" (avaliações / justiça)

**Ideal para:** "sem avaliações ainda", "seja o primeiro a avaliar"
**Sentimento:** equidade, confiança, equilíbrio

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <circle cx="100" cy="80" r="60" fill="#D8F3DC" opacity="0.5"/>
  <!-- mastro central -->
  <path d="M100 50 L100 120" stroke="#2D6A4F" stroke-width="3" stroke-linecap="round"/>
  <!-- base -->
  <path d="M85 120 L115 120 L112 128 L88 128 Z" fill="#1B4332"/>
  <!-- barra horizontal -->
  <path d="M60 60 L140 60" stroke="#2D6A4F" stroke-width="3" stroke-linecap="round"/>
  <!-- topete -->
  <circle cx="100" cy="50" r="4" fill="#DDA15E"/>
  <!-- prato esquerdo (corda) -->
  <path d="M60 60 L55 78" stroke="#2D6A4F" stroke-width="1.5"/>
  <path d="M60 60 L65 78" stroke="#2D6A4F" stroke-width="1.5"/>
  <!-- prato esquerdo (tigela) -->
  <path d="M48 78 Q48 90 60 90 Q72 90 72 78 Z" fill="#BC6C25"/>
  <!-- estrela no prato esquerdo -->
  <path d="M60 80 L61 83 L64 83 L61.5 85 L62.5 88 L60 86 L57.5 88 L58.5 85 L56 83 L59 83 Z" fill="#FEFAE0"/>
  <!-- prato direito -->
  <path d="M140 60 L135 78" stroke="#2D6A4F" stroke-width="1.5"/>
  <path d="M140 60 L145 78" stroke="#2D6A4F" stroke-width="1.5"/>
  <path d="M128 78 Q128 90 140 90 Q152 90 152 78 Z" fill="#DDA15E"/>
  <path d="M140 80 L141 83 L144 83 L141.5 85 L142.5 88 L140 86 L137.5 88 L138.5 85 L136 83 L139 83 Z" fill="#FEFAE0"/>
</svg>
```

---

## CONCEITO H — "Semente Broitando" (onboarding / começo)

**Ideal para:** onboarding, "comece por aqui", conta nova
**Sentimento:** potencial, início, crescimento

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none">
  <circle cx="100" cy="85" r="58" fill="#FAEDCD" opacity="0.6"/>
  <!-- terra -->
  <path d="M55 110 Q100 100 145 110 L145 130 L55 130 Z" fill="#BC6C25"/>
  <path d="M55 110 Q100 100 145 110" stroke="#8B5A2B" stroke-width="1.5" fill="none" opacity="0.5"/>
  <!-- broto -->
  <path d="M100 108 L100 75" stroke="#2D6A4F" stroke-width="3" stroke-linecap="round"/>
  <!-- folha grande -->
  <path d="M100 85 Q82 80 78 68 Q90 64 100 78 Z" fill="#52B788"/>
  <path d="M100 85 Q82 80 78 68" stroke="#2D6A4F" stroke-width="1.5" fill="none"/>
  <!-- folha pequena -->
  <path d="M100 90 Q114 86 116 76 Q108 74 100 84 Z" fill="#2D6A4F"/>
  <!-- broto pequeno (futuro) -->
  <path d="M70 110 L70 100" stroke="#52B788" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="67" cy="98" rx="3" ry="2" fill="#52B788" transform="rotate(-30 67 98)"/>
  <!-- sol -->
  <circle cx="150" cy="45" r="10" fill="#DDA15E"/>
  <path d="M150 28 L150 32 M150 58 L150 62 M133 45 L137 45 M163 45 L167 45 M138 33 L141 36 M159 54 L162 57 M162 33 L159 36 M141 54 L138 57" stroke="#DDA15E" stroke-width="2" stroke-linecap="round"/>
  <!-- gotículas -->
  <circle cx="85" cy="60" r="2" fill="#2D6A4F" opacity="0.4"/>
  <circle cx="120" cy="55" r="1.5" fill="#2D6A4F" opacity="0.3"/>
</svg>
```

---

## Sugestão de uso por contexto

| Contexto | Conceito | Título sugerido | CTA sugerido |
|---|---|---|---|
| Sem produtos (geral) | **B** Caixa Aberta | "Nenhum produto por aqui" | "Publicar um produto" |
| Sem produtos publicados (perfil) | **B** Caixa Aberta | "Você ainda não publicou nada" | "Vender meu primeiro produto" |
| Busca sem resultados | **C** Lupa na Planta | "Não encontramos isso" | "Limpar filtros" |
| Sem transações | **D** Carteira com Folha | "Nenhuma movimentação ainda" | "Explorar produtos" |
| Sem comunidades | **E** Círculo de Pessoas | "Nenhuma comunidade ainda" | "Criar comunidade" |
| Sem serviços | **F** Raio Adormecido | "Nenhum serviço publicado" | "Oferecer um serviço" |
| Sem avaliações | **G** Balança | "Sem avaliações ainda" | — |
| Onboarding / conta nova | **H** Semente | "Bem-vindo! Vamos começar?" | "Configurar perfil" |
| Empty state genérico | **A** Mãos que Trocam | "Nada por aqui ainda" | depende do contexto |

---

## Como vamos usar

1. **Você escolhe** quais conceitos gostou (pode ser um conjunto, ou um único genérico).
2. Eu transformo cada SVG num **componente SolidJS** (`components/ui/illustrations/`) e integro ao `EmptyState` (aceita `illustration?: 'box' | 'search' | 'wallet' | ...`).
3. Cada ilustração aceita um `size` prop e respeita `prefers-reduced-motion`.

> Dica: o conjunto **B + C + D + E** cobre 90% dos empty states da plataforma. O **H** é ótimo pro onboarding.

---

*Veja qual combina mais com a alma do eqüivale e me diga.*

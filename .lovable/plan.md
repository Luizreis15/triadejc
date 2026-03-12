

## Plano: Landing Page do Método REVOLUZ (`/revoluz`)

Criar uma nova página de vendas dedicada ao Método REVOLUZ, seguindo exatamente o padrão visual da `/jornada` (mesmos componentes, cores, tipografia, imagens), mas com copy e estrutura próprias.

### Arquivo novo: `src/pages/SalesPageRevoluz.tsx`

Página standalone (não reutiliza SalesPage como props, pois a estrutura de seções é diferente). Importa os mesmos componentes (`ButtonGold`, `ButtonOrange`, `CardCream`, `SectionRed`, `FAQAccordion`, `ScrollReveal`, `IconSquare`) e assets (`jordana-hero.jpg`, `jordana-about.jpg`, `logo-jornada-unica.png`).

**Seções (na ordem):**

1. **Header fixo** — Logo à esquerda, links âncora (#conteudo, #para-quem, #faq) à direita, botão CTA "Entrar no REVOLUZ" → link externo Kiwify
2. **Hero** — Badge, H1, subheadline, metadados, 2 botões (primário externo + secundário scroll #conteudo), imagem hero com fade
3. **"Você sente isso?"** — 4 perguntas em CardCream, fecho em destaque, CTA
4. **"Por que esse método existe"** — 2 parágrafos em CardCream, sem CTA
5. **"O que está incluído"** — 5 bullets com IconSquare, CTA
6. **"O que você vai receber dentro" (#conteudo)** — Accordion com 4 módulos (19 aulas total), CTA
7. **"Para quem é" (#para-quem)** — 2 colunas de cards (é para você / não é sobre), frase final
8. **"Quem te acompanha"** — Imagem jordana-about + bio (pastora Lagoinha Morumbi, psicanalista)
9. **Garantia** — Card destaque 7 dias, CTA
10. **FAQ (#faq)** — 7 perguntas em FAQAccordion
11. **CTA Final** — Seção petrol, botão grande
12. **Sticky CTA mobile** — Barra fixa bottom (hidden md:), botão + link âncora
13. **Footer** — Frase + link site oficial

Todos os CTAs apontam para `https://pay.kiwify.com.br/IFBt2d0` via `window.open(url, '_blank')`.

### Alteração: `src/App.tsx`

Adicionar rota:
```
<Route path="/revoluz" element={<SalesPageRevoluz />} />
```

### Componentes reutilizados (sem alteração)
- `ButtonGold`, `ButtonOrange`, `IconSquare`, `CardCream`, `SectionRed`, `FAQAccordion`, `ScrollReveal`
- CSS: `sales-page.css` (todas as classes existentes)

### Detalhes técnicos
- Links externos usam `window.open(url, '_blank')` ou `<a href={url} target="_blank" rel="noopener">`
- Âncoras com `scrollIntoView({ behavior: 'smooth' })`
- Sticky CTA: `fixed bottom-0 left-0 right-0 z-50 md:hidden` com background blur
- Accordion: componente nativo `@radix-ui/react-accordion` já instalado
- Mobile-first: `max-w-[460px]` container (igual SalesPage)


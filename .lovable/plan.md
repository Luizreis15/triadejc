# Plano — Página /links (Árvore de Links Premium)

Criar nova rota `/links` inspirada na referência enviada (Dra. Andréa Vermont), mas adaptada 100% à identidade visual da Jordana Cantarelli (Petrol Blue, Burnt Rose, Light Nude, Brown, White + tipografia Playfair Display/Inter) e com animações 21st.dev já usadas no projeto (ScrollReveal, StaggerContainer, TextReveal, framer-motion easing [0.22, 1, 0.36, 1]).

---

## Estrutura da página (mobile-first, max-width ~480px centrado)

### 1) Topo — Identidade
- Fundo: Petrol Blue (`--sp-petrol-primary`) com leve gradient/vinheta
- Tags flutuantes animadas (badges pequenos com borda Rose): "Fé", "Autoconhecimento", "Inteligência Emocional", "Reprogramação Mental"
- Logo/monograma "JC" pequeno (círculo dourado)
- Foto da Jordana centralizada, formato circular (ring dourado/rose), ~140px, com animação de entrada (scale + blur)
- Nome: "Jordana Cantarelli" (Playfair, grande, cream)
- Subtítulo: "Pastora · Psicanalista · Terapeuta Cristã" (Inter, pequeno, opacity 70%)
- Microcopy: "Com fé, clareza e presença."

### 2) Árvore de Links (cards stagger)
Cada card: fundo cream/petrol-glass com borda sutil, thumbnail à esquerda (64x64 rounded), título Playfair, descrição curta Inter, botão CTA dourado/laranja full-width estilo `btn-gold` / `btn-orange` (replicando os botões do site). Hover: lift + glow. Entrada: StaggerContainer.

Cards propostos (confirmar conteúdo final com a Jordana, mas começar com):
1. **Método REVOLUZ** — "Organize o que está por dentro e viva com propósito." → `/revoluz` (btn-orange)
2. **Jornadas** — "Conteúdos e trilhas para sua transformação." → `/jornadas` (btn-gold)
3. **Sessão Individual** — "Atendimento personalizado com Jordana." → WhatsApp Maria `https://wa.link/z8p2f9` (btn-gold)
4. **Enviar convite** — "Pregações, palestras e eventos." → `https://wa.link/z8p2f9` (btn outline)
5. **Instagram** — "@jordanacantarelli" → link externo (btn outline)
6. **YouTube** — "Mensagens e ensinos" → link externo (btn outline)
7. **Site oficial** — `jordanacantarelli.com.br` → externo (btn outline)

### 3) Bloco "Quem é Jordana" (igual à referência, adaptado)
- Foto secundária (aboutImg) com legenda overlay glass
- Badge "Conheça a especialista"
- Headline Playfair: "Quem é **Jordana Cantarelli**" (nome em rose/dourado itálico)
- Parágrafo de bio (reaproveitar texto já existente em SalesPageRevoluz)
- 4 stat-cards (estilo da referência, em cream/petrol-glass):
  - "+ 10 anos" — Experiência clínica
  - "Pastora" — Lagoinha Morumbi
  - "Psicanalista" — Clínica e terapeuta cristã
  - "Método REVOLUZ" — Criado por ela
- Citação destacada (card com borda rose): "Sua paz interna merece uma chance — sem risco, sem pressão." — Jordana Cantarelli

### 4) Footer minimalista
- Monograma JC
- Links: Início · Jornadas · Revoluz · Contato
- "© 2026 Jordana Cantarelli · Com fé, clareza e presença."

---

## Animações 21st.dev
- `ScrollReveal` (blur+scale) nos blocos
- `StaggerContainer`/`StaggerItem` nos cards de links (delay 0.08s)
- `TextReveal` no nome e na headline "Quem é Jordana"
- Tags flutuantes do topo: `motion.div` com `animate={{ y: [0,-6,0] }}` loop suave
- Cards: `whileHover={{ y: -4, scale: 1.02 }}` + `whileTap={{ scale: 0.98 }}`
- Foto principal: entrada com `scale: 1.1 → 1` + ring pulsante dourado
- BackToTop reaproveitado

---

## Arquivos a criar/editar

1. **`src/pages/LinksPage.tsx`** (novo) — página completa
2. **`src/App.tsx`** — adicionar `<Route path="/links" element={<LinksPage />} />`
3. **Reutilizar**: `ScrollReveal`, `StaggerContainer`, `TextReveal`, `ButtonGold`, `ButtonOrange`, `CardCream`, `BackToTopButton`, assets `jordana-hero.jpg` e `jordana-about.jpg`, estilos `sales-page.css`

Sem alterações em outras páginas. Sem header/footer institucional (página standalone tipo linktree).

---

## Perguntas rápidas antes de implementar
1. Os 7 cards/links propostos cobrem o que você quer, ou prefere uma lista diferente (quais links exatos e em qual ordem)?
2. Links externos (Instagram, YouTube): você pode confirmar as URLs corretas?
3. Os stat-cards do bloco "Quem é Jordana" — os 4 sugeridos servem, ou prefere outros números/labels?

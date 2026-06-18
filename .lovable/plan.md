# Plano — Nova Hero da página /links

A hero atual está chapada: foto pequena (144px), tudo centralizado vertical, fundo sólido petrol. A referência (Andrea Vermont) usa **a foto da pessoa como protagonista visual**, ocupando toda a largura/altura do topo, com elementos flutuando ao redor e um **overlay gradiente na base** que dissolve a imagem na cor de fundo da seção seguinte.

## O que muda (somente hero — resto da página intocado)

### 1. Estrutura — foto ocupa o topo inteiro
- Container `relative` com altura `min-h-[560px]` (mobile) / `min-h-[640px]` (desktop)
- Foto de Jordana (`heroImg`) renderizada como `<img>` em `absolute inset-0 w-full h-full object-cover object-top` — **fundo da hero é a própria foto**, não mais o petrol sólido
- Removida a foto circular pequena de 144px

### 2. Overlay em camadas (transição suave)
Três camadas sobrepostas para profundidade e legibilidade:
- **Topo:** gradiente vertical `from-petrol/70 via-petrol/20 to-transparent` (escurece área do monograma + tags)
- **Base:** gradiente `from-paper via-paper/85 to-transparent` ocupando 45% inferior — **dissolve a foto na cor `--sp-paper`** da seção de links abaixo (transição suave, sem corte)
- **Vinheta lateral sutil:** `radial-gradient` rose 8% nas bordas para foco no rosto

### 3. Elementos orbitando a foto (estilo referência Andrea)
Posicionados em `absolute` ao redor da foto, com float animation:
- **Monograma JC** — canto superior esquerdo (não mais centralizado), círculo cream 56px, flutuação suave
- **4 tags flutuantes** ("Fé", "Autoconhecimento", "Inteligência Emocional", "Reprogramação") — distribuídas: 2 à esquerda, 2 à direita, em alturas diferentes, com `backdrop-blur` e borda rose
- **Selo "Pastora · Psicanalista · Terapeuta Cristã"** — chip horizontal logo abaixo do nome, com borda rose

### 4. Bloco de texto — sobre a base dissolvida
Posicionado em `absolute bottom-0` com `z-10`, alinhado à esquerda (não centralizado), padding lateral 24px:
- **Nome "Jordana Cantarelli"** — `heading-playfair`, 36px mobile / 48px desktop, cor petrol-primary (legível sobre overlay paper)
- **Subtítulo em chip** — "Pastora · Psicanalista · Terapeuta Cristã" com borda rose
- **Microcopy itálico** — "Com fé, clareza e presença." em petrol/70

### 5. Animações (mantém ease21st `[0.22, 1, 0.36, 1]`)
- Foto: `scale 1.1 → 1` + `opacity 0 → 1` em 1.2s (efeito Ken Burns sutil contínuo via `animate` repeat)
- Monograma: rotate-in inicial
- Tags: stagger fade-in + float Y infinito (já existe, reaproveitar)
- Nome: `TextReveal` palavra a palavra
- Subtítulo/microcopy: `ScrollReveal` com delay

### 6. Responsividade
- Mobile: foto `object-position: top center`, texto sobre overlay paper na base
- Desktop: mesma estrutura, foto maior, tags mais espalhadas

## Arquivos
- **Editar apenas** `src/pages/LinksPage.tsx` — substituir o bloco `<section>` da hero (linhas ~163-254). Resto da página (cards, "Quem é Jordana", footer) **não muda**.

## Detalhes técnicos
- Usar `heroImg` (`@/assets/jordana-hero.jpg`) já importado
- Cor de transição base = `hsl(var(--sp-paper))` (mesma cor da seção de cards abaixo — garante continuidade visual perfeita)
- Sem novos assets, sem novas dependências

```text
┌─────────────────────────────┐
│ [JC]              [tag]     │  ← overlay petrol topo
│   [tag]                     │
│                             │
│      FOTO JORDANA           │  ← imagem cobre tudo
│      (object-top)           │
│                             │
│  [tag]              [tag]   │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← gradiente paper começa
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ Jordana Cantarelli          │  ← texto sobre paper
│ [Pastora · Psicanalista]    │
│ Com fé, clareza e presença. │
└─────────────────────────────┘
   ↓ transição invisível ↓
┌─────────────────────────────┐
│ [cards de links — sp-paper] │
```

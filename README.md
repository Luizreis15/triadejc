# Triade_Jordana

# BLUEPRINT — CADERNO DIGITAL “CARROSSÉIS MAGNÉTICOS” (Lovable + Supabase)

## 1) Visão do Produto

**Formato:** área de membros estilo “caderno digital” com módulos progressivos.
**Cada módulo:** 1 card de vídeo + cards de texto + modelos prontos + exercícios + botão “Concluir”.
**Objetivo do aluno:** sair com carrosséis prontos, rotina de postagem e vitrine de autoridade organizada.

**Pilares da experiência**

* Mobile-first
* Conteúdo em cards (curto, escaneável)
* Progresso/gamificação leve
* Biblioteca consultável (modelos, ganchos, CTAs)
* “Meu Caderno” (o diferencial: o aluno escreve e salva tudo ali)

---

## 2) Paleta de cores da Samira

Eu **não consegui extrair automaticamente do site** (o conteúdo está vindo como render/asset que meu leitor não abre em texto).
Mas eu tenho como referência do teu branding: **vermelho, marrom e nude**.

Sugestão de tokens (bem “Samira” e elegante):

* **Primary (Vermelho):** `#B21F2D`
* **Primary Dark:** `#7E121D`
* **Brown (Base):** `#4B2E2A`
* **Nude (Base):** `#E8D6C8`
* **Nude Light (Background):** `#F6EFEA`
* **Text (quase preto):** `#1C1B1A`
* **Gray UI:** `#6B6561`
* **Success (check/progresso):** `#1E7A4A`

Se você quiser 100% idêntico ao site, o caminho mais rápido é: abrir `codigomagnetico.online` > inspecionar > pegar as variáveis CSS (ou me mandar um print do topo/hero que eu tiro os hex certinhos).

---

## 3) Estrutura de Telas (User Flow)

### 3.1) Acesso

* **/login**

  * Login com e-mail (magic link / OTP)
  * Mensagem: “Acesse seu Caderno Digital”

### 3.2) Onboarding (1ª vez)

* **/onboarding**

  * Perguntas rápidas (salva no perfil):

    * Nicho
    * Objetivo principal: (crescer / autoridade / vender)
    * Nível: (iniciante / intermediário / avançado)
  * Resultado: recomenda “trilha” e configura Home

### 3.3) Home / Painel

* **/app**

  * Card “Continue de onde parou”
  * Progresso (%)
  * Botões rápidos:

    * “Modelos”
    * “Ganchos”
    * “CTAs”
    * “Calendário 30 dias”
    * “Meu Caderno”
  * Card “Carrossel de hoje” (sugestão automática por trilha)

### 3.4) Módulos

* **/app/modulos**

  * Lista de módulos com status: bloqueado / liberado / concluído
  * Cada módulo abre a página do módulo

### 3.5) Página do Módulo (card-based)

* **/app/modulos/[slug]**

  * Card 1: vídeo (embed)
  * Card 2: resumo “Pulo do gato”
  * Card 3: “Modelo pronto” (slide a slide)
  * Card 4: “Exemplos por nicho” (3 variações)
  * Card 5: Exercício (campo de texto + salvar)
  * Card 6: Template/Download (link do Canva + botão copiar texto)
  * Card final: “Marcar como concluído” + “Próximo módulo”

### 3.6) Biblioteca

* **/app/biblioteca**

  * Tabs:

    * Modelos (Topo/Meio/Fundo)
    * Ganchos
    * CTAs
  * Filtros:

    * Objetivo (crescer/autoridade/venda)
    * Formato (contraste, manifesto, checklist, objeção…)
    * Estágio (topo/meio/fundo)
  * Ações:

    * Copiar
    * Favoritar
    * “Salvar no meu caderno”

### 3.7) Meu Caderno (o diferencial)

* **/app/caderno**

  * Seções fixas:

    * Minha promessa
    * Meus 3 pilares
    * Meu público (dor/desejo/objeções)
    * Meus carrosséis prontos (rascunhos)
    * Meu calendário (o que postei / o que vou postar)
    * Meus resultados (prints / links / anotações)
  * Upload de imagem (para prints de insights/resultados)

### 3.8) Calendário 30 dias

* **/app/calendario**

  * Lista por semanas (arrastar/soltar opcional)
  * Botão “Gerar semana” (puxa sugestões da biblioteca)

### 3.9) Resultados

* **/app/resultados**

  * Campos simples:

    * Data
    * Link do post
    * Métricas (alcance, salvamentos, compartilhamentos, DMs)
    * Observações
    * Upload print

---

## 4) Conteúdo do Curso (Módulos)

Formato recomendado: **10 módulos** (MVP forte + completo).

1. **A Virada da Vitrine**

   * o que é carrossel magnético, intenção, percepção e promessa
2. **Posicionamento que Aparece**

   * falar com todo mundo x atrair o certo
3. **A Anatomia do Carrossel**

   * estrutura base (capa > condução > prova > CTA)
4. **Capas e Ganchos**

   * 12 tipos de ganchos + fórmulas de capa
5. **Condução Slide a Slide**

   * progressão, ritmo e clareza
6. **Autoridade Silenciosa**

   * prova sem mendigar; estudo de caso, bastidor, critério
7. **Quebra de Objeções**

   * tempo, nicho, vergonha, “não funciona comigo”
8. **CTAs Magnéticos**

   * seguir, salvar, comentar, DM, compra (sem ficar forçado)
9. **Produção Rápida (Lote)**

   * 10 carrosséis em 2 horas (processo)
10. **Distribuição e Diagnóstico**

* fixados, reaproveitamento, análise semanal e melhoria

Cada módulo já nasce com:

* 1 vídeo curto
* 3 modelos prontos
* 1 checklist
* 1 exercício no caderno

---

## 5) Banco de Dados (Supabase) — Schema

### Auth

* Usar Supabase Auth (email magic link / OTP)

### Tabelas principais

**profiles**

* id (uuid, pk, = auth.users.id)
* name
* email
* niche
* goal (grow/authority/sell)
* level (beginner/intermediate/advanced)
* created_at

**entitlements** (paywall)

* id (uuid, pk)
* user_id (fk profiles)
* product_slug (ex: “carrosseis_magneticos”)
* status (active/inactive)
* purchased_at
* expires_at (nullable)

**modules**

* id
* slug
* title
* order_index
* description
* is_free (bool)
* cover_image_url (nullable)

**module_cards**

* id
* module_id
* order_index
* type (video/text/model/exercise/download)
* title
* content_md (markdown)
* video_url (nullable)
* cta_label (nullable)
* cta_url (nullable)

**progress**

* id
* user_id
* module_id
* completed (bool)
* completed_at
* last_seen_card_index

**library_items**

* id
* type (model/hook/cta)
* stage (top/middle/bottom)
* format (contrast/checklist/manifest/objection/story/steps)
* goal (grow/authority/sell)
* title
* content_md
* tags (text[])
* created_at

**favorites**

* id
* user_id
* library_item_id

**notebook_entries**

* id
* user_id
* section (promise/pillars/audience/drafts/calendar/results/notes)
* title
* content_md
* created_at
* updated_at

**uploads**

* id
* user_id
* file_url
* file_type
* related_to (notebook_entry_id nullable)
* created_at

**results**

* id
* user_id
* post_url
* date
* reach (int)
* saves (int)
* shares (int)
* dms (int)
* notes
* screenshot_url (nullable)

---

## 6) Regras de Acesso (RLS)

* Só acessa `/app` se `entitlements.status = active`
* `modules.is_free = true` pode liberar uma amostra (Módulo 1 grátis) se você quiser
* RLS por `user_id` em progress, favorites, notebook, results, uploads

---

## 7) Admin (para você atualizar conteúdo sem dev)

* **/admin** (somente você)

  * CRUD Modules
  * CRUD Module Cards
  * CRUD Library Items
  * Lista de usuários + status de acesso
  * Import rápido via “colar markdown”

---

## 8) Padrão de Card (UI)

Cards com:

* título (curto)
* texto em bullets
* botão “copiar”
* botão “salvar no meu caderno”
* botão “concluir”

Componentes:

* Header fixo
* Bottom nav (mobile): Home / Módulos / Biblioteca / Caderno

Tipografia:

* Headings: serif elegante (opcional)
* Texto: sans limpa (para leitura rápida)

---

# PROMPT PARA COLAR NO LOVABLE (construção do app)

“Crie um web app mobile-first chamado ‘Caderno Digital — Carrosséis Magnéticos’. Stack: Next.js + Supabase. Use Supabase Auth (magic link). Crie as tabelas: profiles, entitlements, modules, module_cards, progress, library_items, favorites, notebook_entries, uploads, results. Implemente paywall via entitlements. Telas: /login, /onboarding, /app (dashboard), /app/modulos, /app/modulos/[slug], /app/biblioteca (tabs + filtros + copiar + favoritar + salvar no caderno), /app/caderno (seções), /app/calendario, /app/resultados. Crie /admin com CRUD de modules, module_cards e library_items. UI com cards e progresso. Persistir progresso por módulo e última posição. Implementar RLS por user_id. Paleta: vermelho #B21F2D, marrom #4B2E2A, nude #E8D6C8, fundo #F6EFEA, texto #1C1B1A.”

---

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://traide.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/deabe2ce-3def-4648-8c3c-cc5b64013b88).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

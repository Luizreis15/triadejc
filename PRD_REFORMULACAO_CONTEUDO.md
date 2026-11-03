# PRD — Reformulação de Conteúdo da Área de Membros (Jornada Única)

Documento de handoff técnico. Escrito pelo Claude Code (owner do repo — ver `AGENTS.md`/`CLAUDE.md`) pro Cursor continuar o trabalho em andamento sem precisar redescobrir contexto. Leia `AGENTS.md` inteiro antes de editar qualquer coisa — ele define quem pode mexer em quê.

## 0. Status de governança (contexto obrigatório)

Em 2026-11-02 o usuário (Luiz) decidiu que **Claude Code é o owner do repo**, não mais o Cursor. O Cursor passou a ser **Track B, implementador restrito sob revisão** — não decide mais sozinho sobre `config.toml`, `package.json`, `types.ts`, `migrations/**`, `AGENTS.md`, `CLAUDE.md`. Isso está documentado nos dois arquivos; este PRD não muda isso, só dá contexto técnico pra você trabalhar dentro desse contrato.

## 1. O que já está em produção (não mexer sem necessidade)

Merged em `main`, deployado na Vercel, testado via Playwright local e em produção:

- Repaginação visual da área de membros: paleta terracota sobre nude, modo escuro, `framer-motion`, cards com véu quente, progress bars animadas.
- Leitura em overlay (`src/components/member/ReadingOverlay.tsx`) — substitui navegação de página. Barra de progresso por scroll, tamanho de fonte ajustável, fecha salva posição.
- `reading_positions` (tabela nova, migration `supabase/migrations/20261102140000_reading_positions.sql`) sincroniza scroll entre aparelhos — upsert com debounce de 1.5s em `src/lib/readingPlace.ts`, hook `src/hooks/useReadingResume.ts` pro card "Continue de onde parou" na Home.
- `useEntitledCatalog` (`src/hooks/useEntitledCatalog.ts`) — catálogo de módulos por produto entitled, usado em Home/Modules.
- Lembrete de leitura in-app (`src/components/member/ReadingReminder.tsx`) quando >3 dias sem ler.
- Fix do `HTTP 406` no check-in do Caderno (`src/pages/member/Notebook.tsx`, trocado `.single()` por `.maybeSingle()`).
- Migration `stop_default_entitlement` já aplicada — perfil novo não ganha mais entitlement automático, só por compra ou grant manual.

**Design tokens vigentes** (não inventar outros sem pedir): serifada `Playfair Display`, sans `Poppins`, corpo de leitura em `Palatino`. Definidos em `src/index.css` (`--font-serif`, `--font-sans`) e usados via classe `.font-serif`. Paleta terracota é a decisão explícita do usuário pros PDFs novos também (ver seção 4).

## 2. Schema relevante (Postgres/Supabase, projeto `spxxlspesoybioowvjmb`)

```
products(id, slug, name)
  → único produto hoje: jornada_unica, id = d50ecff3-7d47-42ce-9aaa-a6aa61be374a

modules(id, product_id, slug, title, order_index, description, is_free?)
entitlements(user_id, product_id, status, expires_at, source)  — unique(user_id, product_id)

module_cards(id, module_id, title, type, content_md, video_url, order_index)
  — type ∈ {video, text, model, exercise, download, summary, tip, map}
  — isto é o que vira "aula" no app, renderizado no ReadingOverlay

module_pdfs(id, module_id, title, file_url, order_index)
  — isto é o que aparece na Biblioteca (src/pages/member/Library.tsx)
  — RLS: can_read_module(auth.uid(), module_id) — ver função abaixo

card_completions(id, user_id, card_id, completed_at) — unique(user_id, card_id)
reading_positions(user_id, card_id, module_id, scroll_ratio, updated_at) — pk(user_id, card_id)
progress(id, user_id, module_id, completed, completed_at, last_seen_card_index)
```

RLS de leitura em `modules`, `module_cards`, `module_days`, `module_pdfs`, `product_chapters` usa a mesma função:

```sql
can_read_module(_user_id, _module_id) =
  has_role(_user_id, 'admin')
  OR (is_active_member(_user_id) AND EXISTS module WHERE is_free OR has_entitlement(_user_id, module.product_id))
```

Ou seja: **não existe desbloqueio sequencial por progresso** — qualquer módulo do produto entitled já é legível. Os PDFs só não aparecem hoje porque a tabela `module_pdfs` está vazia pra 3 dos 4 módulos (ver seção 3).

Storage: bucket privado `pdfs`, acesso via signed URL (`src/lib/storage.ts`, `SignedFileLink.tsx`), 120s de expiração. **Nunca usar URL pública.**

## 3. Estado atual dos 4 módulos (trilhas separadas, não fundir)

```
modules.id                               slug                   title                       cards  pdfs
c25d5a8e-3cfe-4e43-b11a-25d580288963    cadeias-invisiveis     Cadeias Invisíveis           9      8    ✅ completo
af5d3f77-2417-4d22-94d1-8d779a531528    confissoes-de-fe       Confissões de Fé              1      0    🔴 reformular
f777499c-dd39-4a38-86b4-00c92a490f2e    respira-alma           Respira, Alma                 0      0    🟡 estrutura ok, falta cadastrar
ccd2f2ce-d828-422c-b0d2-1d16df7ee750    caminhar-consciencia   Caminhar com Consciência      0      0    ⚪ não existe ainda
```

`order_index` atual: 1=Cadeias, 2=Confissões, 3=Respira, 4=Caminhar. **Isso pode mudar** — ver decisão pendente na seção 6 (a carta de encerramento do Respira Alma indica que a ordem pretendida pela autora é Respira → Confissões).

## 4. Material bruto já coletado (em `tmp/`, gitignorado)

```
tmp/pdfs-para-subir/cadeias-invisiveis/              — já processado, não mexer
tmp/pdfs-para-subir/staging/cadeias-invisiveis/      — já processado, não mexer
tmp/pdfs-para-subir/confissoes-de-fe-raw/            — 24 arquivos, ver bugs abaixo
tmp/pdfs-para-subir/respira-alma-raw/                — 7 arquivos corrigidos (baixados por último, prefira estes sobre public/pdfs/respira-alma/)
```

`public/pdfs/respira-alma/` tem uma versão mais antiga dos mesmos 6 capítulos — os arquivos em `tmp/pdfs-para-subir/respira-alma-raw/` são mais recentes/corrigidos e devem ser a fonte usada.

### 4.1 Confissões de Fé — devocional de 30 dias, conteúdo lido na íntegra

**Bugs confirmados no material original (não repetir ao gerar os PDFs novos):**

1. `_22` é cópia idêntica de `_23` (mesmo texto, rótulo de dia diferente) — descartar `_22`.
2. Numeração do arquivo ≠ número do dia escrito dentro do PDF (offset de -5: arquivo `_06` = Dia 1 interno). Não confiar no nome do arquivo pra ordenar.
3. Dia 1 e Dia 13 usam o mesmo versículo (Jeremias 31:3) e tema quase idêntico ("você é amada incondicionalmente") — redundante, mesclar ou retitular um dos dois na reformulação.
4. `Momento_Sela_Confissoes--de--Fe.pdf` tem layout visual quebrado (P&B, sem o template rosa/floral dos outros) — não copiar esse padrão visual pro PDF novo.
5. **Faltam Dia 3, Dia 8, e todo o bloco Dia 21–30 (incluindo o encerramento que o próprio sumário interno promete).** Esses dias nunca foram baixados da Kiwify. **Bloqueador — ver seção 6.**

**Agrupamento temático proposto** (com o que existe, Dias 1–20; Dias 21-30 ainda não têm proposta por falta de material):

```
Bloco 1 — Identidade        (Dias 1–10): amada, capaz, escolhida, frutífera
Bloco 2 — Fé e Discernimento (Dias 11–15): sabedoria, luz, termina em "Selá" (pausa)
Bloco 3 — Renovo e Força     (Dias 16–20): renovada, forte, pacificadora, valiosa
Bloco 4 — ???                (Dias 21–30): sem material ainda
```

Decisão pendente do usuário: confirmar esse agrupamento (ou ajustar) e virar 7–8 módulos reais (`modules` rows) com aulas redefinidas por módulo, substituindo a estrutura "1 dia = 1 PDF solto" por "1 bloco = 1 módulo, N aulas por bloco".

### 4.2 Respira Alma — estrutura já limpa, confirmada direto na Kiwify

```
1. Boas Vindas – Mulher amada!
2. Como aproveitar melhor sua jornada
3. Afogando no silêncio
4. O sopro da vida
5. Curando com Fé
6. Respirar na Presença
7. Selá – Pausa para Integrar
8. Tempo de Celebrar
```

Arco de conteúdo real (5 blocos + carta): Silêncio → Sopro → Cura pela fé → Selá → Celebração → Carta da autora. **Um arquivo está mal rotulado**: `respira-alma-raw/Respira_Alma_Capitulo_4_Respirar_na_Presenca_Novo--CORRIGIDO.pdf` na verdade contém o texto da "Carta da Autora" (assinada por Jordana como psicanalista/terapeuta cristã/pastora), não o capítulo "Respirar na Presença". Conferir o conteúdo real de cada arquivo antes de atribuir a uma aula — não confiar no nome do arquivo.

Não precisa de reformulação estrutural — só gerar os 8 PDFs novos no padrão visual novo e cadastrar os 8 `module_cards`.

### 4.3 Caminhar com Consciência — não existe ainda

Zero conteúdo em qualquer lugar do disco ou da Kiwify. Linha em `modules` já existe e está correta (ver seção 3), só falta o conteúdo. **Bloqueador — ver seção 6.**

## 5. Pipeline recomendado pra gerar os PDFs novos (1 por aula)

Decisão de paleta do usuário: **paleta do app (terracota dominante)**, não a paleta do livro devocional físico (que é azul-petróleo-dominante — material de referência só pra tom/tipografia, não pra cor).

Recomendação técnica: não desenhar cada PDF manualmente. Construir:

1. Um template HTML/CSS único (reaproveitando os design tokens de `src/index.css`: terracota, nude, Playfair Display, Poppins) com os blocos padrão de uma aula — título, versículo, reflexão, declaração/confissão, foto da Jordana.
2. Um script (Playwright/Puppeteer `page.pdf()`) que recebe JSON estruturado por aula (`{title, verse, reflection_md, declaration, photo}`) e renderiza pro PDF final, formato A4 ou A5 — consistente em todas as aulas, sem trabalho manual repetido.
3. Fotos da Jordana: só existe uma foto dela no dossiê do livro devocional (`Desktop/Jordana-Produtos/Livro_Devocional_JC/`). O usuário mencionou "fotos novas" — **confirmar se já existem ou se são um bloqueador também.**

## 6. Bloqueadores — precisa do usuário antes de fechar

1. **Dias 21–30 de Confissões de Fé** — baixar da Kiwify (`dashboard.kiwify.com/members-area/...`, mesmo padrão usado pra pegar a estrutura do Respira Alma).
2. **Ordem dos módulos** — manter Confissões antes de Respira (ordem atual no app) ou inverter pra bater com a intenção autoral (Respira → Confissões, conforme a carta de encerramento do Respira Alma)?
3. **Esqueleto do Caminhar com Consciência** — quantas aulas, título de cada uma, 2-3 linhas do que cobre. Conteúdo espiritual deve vir da Jordana, não ser inventado.
4. **Fotos novas da Jordana** — confirmar se existem em algum lugar ou se precisam ser produzidas/fornecidas antes da geração dos PDFs.
5. **Acesso de banco** — gravar qualquer `module_cards`/`module_pdfs` novo exige `service_role`/CLI logado no projeto certo (`spxxlspesoybioowvjmb`). Confirmar com o usuário antes de cada rodada de escrita no banco.

## 7. Ordem de execução sugerida

1. Resolver bloqueadores 1–4 com o usuário (não precisa dos 5 juntos — pode ir trilha por trilha).
2. Respira Alma primeiro (menor esforço, estrutura já pronta): gerar 8 PDFs, cadastrar 8 `module_cards` + 8 `module_pdfs`, testar RLS/Biblioteca.
3. Confissões de Fé: fechar agrupamento em blocos, criar `modules` novos substituindo (ou complementando) a linha única atual, gerar PDFs por bloco/aula.
4. Caminhar com Consciência: só depois do esqueleto da Jordana.
5. Cada rodada: `tsc --noEmit` + `eslint` limpos, teste Playwright com conta real logada (ver scripts anteriores em `/private/tmp/.../scratchpad/e2e-prod.mjs` como referência de padrão, não existem mais no disco — recriar se precisar) antes de considerar pronto.

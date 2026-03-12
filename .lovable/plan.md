

# Plano — Site Institucional Jordana Cantarelli (Prompt 1 + Prompt 2)

Este plano cobre a criação completa do site institucional com 4 páginas novas, reaproveitando a paleta, tipografia, componentes e imagens já existentes no projeto.

---

## Estrutura de arquivos

```text
src/pages/
  HomePage.tsx          ← Nova (rota /)
  JornadasPage.tsx      ← Nova (rota /jornadas)
  ContatoPage.tsx       ← Nova (rota /contato)
  SalesPageRevoluz.tsx   ← Já existe (rota /revoluz, sem alteração)

src/components/institutional/
  InstitutionalHeader.tsx   ← Header fixo compartilhado
  InstitutionalFooter.tsx   ← Footer compartilhado
```

## Roteamento (App.tsx)

- `/` → `HomePage` (substituir o redirect atual para `/jornada`)
- `/jornadas` → `JornadasPage`
- `/contato` → `ContatoPage`
- `/jornada` permanece como está (landing de produto)
- `/revoluz` permanece como está

## Banco de dados

Nova tabela `leads_contato` para persistir formulários de convite e lista de espera:

```sql
CREATE TABLE public.leads_contato (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tipo text NOT NULL,              -- 'CONVITE' | 'LISTA_ESPERA'
  produto_interesse text,          -- 'MENTORIA_DSL' | 'REVOLUZ_EXPERIENCE' | null
  nome text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  cidade text,
  estado text,
  igreja_organizacao text,
  data_evento text,
  tipo_evento text,                -- 'pregacao' | 'palestra' | 'workshop' | 'retiro'
  tema text,
  mensagem text
);

ALTER TABLE public.leads_contato ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir
CREATE POLICY "Anyone can insert leads_contato"
  ON public.leads_contato FOR INSERT TO public
  WITH CHECK (true);

-- Admins podem ver/atualizar/deletar
CREATE POLICY "Admins can select leads_contato"
  ON public.leads_contato FOR SELECT TO public
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads_contato"
  ON public.leads_contato FOR UPDATE TO public
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads_contato"
  ON public.leads_contato FOR DELETE TO public
  USING (has_role(auth.uid(), 'admin'));
```

## Página 1 — HomePage (/)

Layout desktop: max-width 1200px, grid de 2 colunas em seções com imagem. Mobile: coluna única (mobile-first com breakpoints `md:` e `lg:`).

**Seções na ordem:**
1. **Header fixo** — "Jordana Cantarelli" + menu âncoras + botão CTA "Agendar Sessão Individual" (link externo WhatsApp)
2. **Hero** — Badge "Psicanalista Clínica & Terapeuta Cristã" + "Pastora da Lagoinha Morumbi", headline principal, 2 CTAs, imagem hero (usar `jordana-hero.jpg` local + imagem externa como fallback)
3. **Sobre** (#sobre) — Texto bio + imagem about (`jordana-about.jpg`)
4. **Minha Missão** — Bloco destaque com fundo petrol
5. **Como posso te ajudar?** (#ajuda) — Texto + bullets com IconSquare + CTA WhatsApp
6. **Jornadas e Programas** (#jornadas) — 3 cards principais (Respira Alma, Cadeias Invisíveis, Confissões de Fé) + subseção "Outros produtos" (Revoluz, Mentoria DSL, Revoluz Experience)
7. **Para quem é** — Lista com ícones
8. **Palestras** (#palestras) — Texto + temas + imagem externa + CTA "Convidar para pregar"
9. **Formação** — Lista de credenciais
10. **Depoimentos** (#depoimentos) — 3 cards visíveis + botão "ver mais"
11. **CTA Final** — Fechamento emocional + botão WhatsApp
12. **Footer** — Links + copyright

Componentes reutilizados: `ScrollReveal`, `StaggerContainer/StaggerItem`, `CardCream`, `SectionRed`, `ButtonGold`, `ButtonOrange`, `IconSquare`, `TestimonialCard`, `FAQAccordion`. Mesmos CSS tokens de `sales-page.css`.

O container será `.sales-page` mas com `max-width: 1200px` para desktop (diferente do 460px das landing pages de produto).

## Página 2 — JornadasPage (/jornadas)

- Header + Footer compartilhados
- H1 "Jornadas e Programas" + intro
- Grid 3 cards principais com CTA "Acessar no app" (placeholder `/membros/app`)
- Subseção "Outros Produtos" com 3 cards (Revoluz → checkout externo, Mentoria DSL e Revoluz Experience → `/contato#lista-espera`)

## Página 3 — ContatoPage (/contato)

3 seções com âncoras:
1. **Sessão Individual** — Texto + botão WhatsApp grande
2. **Convites** (#convites) — Formulário completo (nome, email, whatsapp, igreja, cidade/estado, data, tipo, tema, mensagem) → insere em `leads_contato` com tipo=CONVITE
3. **Lista de Espera** (#lista-espera) — Tabs (Mentoria DSL / Revoluz Experience) + formulário simplificado → insere em `leads_contato` com tipo=LISTA_ESPERA

## Animações

Mesmas animações 21st.dev já implementadas: `ScrollReveal` com blur/scale, `StaggerContainer`, `TextReveal`, easing `[0.22, 1, 0.36, 1]`.

## Responsividade

- Mobile-first com Tailwind breakpoints (`md:`, `lg:`)
- Header: hamburger menu no mobile, links horizontais no desktop
- Hero e seções com imagem: stack vertical mobile, grid 2 colunas desktop
- Cards: 1 coluna mobile, 2-3 colunas desktop


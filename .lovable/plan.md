

## Plano: Reestruturar Módulo 1 com Dias 1–5 (Mensagem + Confissão + Exercícios)

### Problema

A estrutura atual usa `devotional_days` (com reflexão, oração, pergunta do coração) e `exercises` (tabela separada). O novo PRD unifica tudo em uma experiência de "Dia" com: vídeo, mensagem longa, versículo, confissão de fé e 2 exercícios — tudo numa única tela.

---

### 1. Nova Tabela `module_days`

Criar tabela com a estrutura do PRD:

```sql
CREATE TABLE public.module_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  day_in_module integer NOT NULL,
  title text NOT NULL,
  verse_reference text,
  message_text text NOT NULL,
  confession_text text,
  exercise_q1 text,
  exercise_q2 text,
  top_video_url text,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);
```

RLS: autenticados podem ler; admins podem CRUD.

### 2. Seed dos 5 Dias do Módulo 1

Inserir os 5 dias exatamente como descritos no PRD, vinculados ao módulo 1 existente.

Também atualizar o registro do módulo 1 na tabela `modules` com novo título/descrição se necessário.

### 3. Nova Página `DayView`

**Arquivo:** `src/pages/member/DayView.tsx`

Tela sequencial com:
1. Vídeo no topo (se houver)
2. Título do dia
3. Mensagem longa (texto formatado com quebras de linha)
4. Versículo (card destacado)
5. Confissão de fé (card dourado/destaque)
6. Exercícios (2 textareas para q1 e q2)
7. Botões: Salvar + Concluir + Próximo

Respostas dos exercícios salvas na tabela `notebook_entries` com `section = 'day_exercise'` e referência ao `module_days.id`.

### 4. Hook `useModuleDays`

**Arquivo:** `src/hooks/useModuleDays.tsx`

- Busca dias de um módulo
- Verifica progresso (quais dias completos)
- Desbloqueio sequencial (dia N requer dia N-1 completo)
- Salva respostas dos exercícios

### 5. Atualizar `ModuleDetail`

Adicionar seção "Jornada Diária" que lista os dias do módulo com:
- Timeline visual (dia 1–5)
- Status (concluído/desbloqueado/bloqueado)
- Clique para navegar ao `DayView`

### 6. Rotas

```
/membros/app/modulos/:slug/dia/:dayId → DayView
```

Registrar em `App.tsx` e `index.ts`.

---

### Estrutura Visual do DayView

```text
┌─────────────────────────┐
│  ▶ Vídeo (se houver)    │
├─────────────────────────┤
│  Dia 1 de 5             │
│  "Você é bem-vinda"     │
├─────────────────────────┤
│  Mensagem longa...      │
│  (texto com quebras)    │
├─────────────────────────┤
│  📖 Salmos 46:10        │
├─────────────────────────┤
│  ✨ Confissão de Fé     │
│  "Eu sou bem-vinda..."  │
├─────────────────────────┤
│  ✍️ Exercício 1         │
│  [textarea]             │
│  ✍️ Exercício 2         │
│  [textarea]             │
├─────────────────────────┤
│  [Salvar] [Concluir]    │
│  [Próximo Dia →]        │
└─────────────────────────┘
```

---

### Arquivos Criados/Modificados

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabela `module_days` + RLS + seed 5 dias |
| `src/hooks/useModuleDays.tsx` | Novo hook |
| `src/pages/member/DayView.tsx` | Nova página |
| `src/pages/member/ModuleDetail.tsx` | Adicionar seção de dias |
| `src/pages/member/index.ts` | Exportar DayView |
| `src/App.tsx` | Nova rota `/dia/:dayId` |

### Notas

- As tabelas `devotional_days` e `exercises` existentes permanecem intactas (compatibilidade). O novo sistema usa `module_days`.
- Os PDFs dos dias 4 e 5 (URLs externas) ficam acessíveis via botão "Baixar PDF original" no DayView.


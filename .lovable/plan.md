

# Plan: Build "Respira Alma" Product

## Overview
"Respira Alma" is a chapter-based product (not a 30-day journey). It needs a completely different UI from "Confissões de Fé" — accordion modules with inline video, long description, PDF download, exercises with text fields, and save/complete buttons.

## Database Changes

**New table: `product_chapters`**
- `id` (uuid PK)
- `module_id` (uuid, FK to modules)
- `order_index` (int)
- `title` (text)
- `long_description` (text)
- `video_url` (text, nullable)
- `pdf_url` (text, nullable)
- `exercise_q1` through `exercise_q4` (text, nullable) — up to 4 to support Selá's 4 questions
- `created_at` (timestamp)

RLS: authenticated users can read; admins can write.

**New table: `chapter_answers`**
- `id` (uuid PK)
- `user_id` (uuid, not null)
- `chapter_id` (uuid, FK to product_chapters)
- `answers` (jsonb) — stores `{"q1": "...", "q2": "...", ...}`
- `completed` (bool, default false)
- `completed_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

RLS: users can CRUD own records only.
Unique constraint on `(user_id, chapter_id)`.

**Seed data**: Insert 7 chapters (Module 0–6) linked to the existing "Respira, Alma" module (`f777499c-dd39-4a38-86b4-00c92a490f2e`).

## File Changes

### 1. New: `src/hooks/useProductChapters.tsx`
- Hook to fetch chapters for a module
- Hook to load/save user answers (upsert to `chapter_answers`)
- Hook to mark chapter complete
- Progress calculation (X of 7 completed)

### 2. New: `src/pages/member/ProductDetail.tsx`
- Accordion-based UI for chapter products
- Detects product type based on whether `product_chapters` exist for the module
- Each accordion item renders: video (if present), long description, PDF download button, exercise questions with textareas, Save button, Mark as Completed button
- Top: product header with progress bar ("X de 7 módulos concluídos")
- Completion toast: "Você concluiu este capítulo. Respire. Você está avançando."

### 3. Update: `src/pages/member/ModuleDetail.tsx`
- Add detection: if the module has `product_chapters`, render `ProductDetail` instead of the current card/day-based view

### 4. Update: `src/pages/member/index.ts`
- Export new ProductDetail if needed

### 5. PDF files
- Copy the 6 uploaded PDFs to `public/pdfs/respira-alma/` for local reference
- Use the provided genspark URLs as `pdf_url` in the seed data

## UI Design (Accordion)

```text
┌─────────────────────────────────┐
│ ← Voltar                       │
│                                 │
│ Respira Alma                    │
│ Um caminho para a alma respirar │
│                                 │
│ [████████░░] 3 de 7 concluídos  │
│                                 │
│ ▸ Boas-vindas — Respira, alma   │
│ ▾ Cap 1 — Afogando no Silêncio  │
│   ┌───────────────────────┐     │
│   │ [Video Player]        │     │
│   │                       │     │
│   │ Long description...   │     │
│   │                       │     │
│   │ [📄 Baixar PDF]       │     │
│   │                       │     │
│   │ Exercícios:           │     │
│   │ 1. "Quando foi..."    │     │
│   │ [textarea]            │     │
│   │ 2. "O que tenho..."   │     │
│   │ [textarea]            │     │
│   │ 3. "Que área..."      │     │
│   │ [textarea]            │     │
│   │                       │     │
│   │ [Salvar] [Concluir ✓] │     │
│   └───────────────────────┘     │
│ ▸ Cap 2 — O Sopro da Vida      │
│ ▸ Cap 3 — Curando as Feridas   │
│ ...                             │
└─────────────────────────────────┘
```

## Implementation Order
1. Database migration (create tables + seed 7 chapters)
2. Create `useProductChapters` hook
3. Create `ProductDetail` page component
4. Update `ModuleDetail` to delegate to `ProductDetail` when chapters exist
5. Copy uploaded PDFs to public folder


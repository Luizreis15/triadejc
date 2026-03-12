

# Plan: Replicate "Cadeias Invisíveis" app structure to Confissões de Fé and Respira Alma

## What the user likes (Cadeias Invisíveis structure)
The ModuleDetail page shows: welcome video → title/description → progress bar → 4 quick action buttons (Começar, Momentos Selah, Atividade, PDFs) → content sections (Começar por aqui, Leituras, Selah, Encerramento, Atividade, PDFs).

## Current problems
- **Confissões de Fé**: Uses ModuleDetail but likely has no `module_cards`, so quick action buttons are disabled and sections empty. Only the daily journey collapsibles show up, which look different.
- **Respira Alma**: Uses a separate `ProductDetail` component with a simpler accordion-only layout. No video at top, no quick action buttons grid.

## Changes

### 1. Update `ProductDetail.tsx` (Respira Alma)
Replicate the Cadeias Invisíveis layout:
- Add welcome video at top (from `module.welcome_video_url`)
- Keep progress bar (already exists)
- Add quick action buttons grid: "Começar" (scrolls to first chapter), "PDFs" (scrolls to PDF list or first PDF chapter)
- Keep accordion chapters below but styled more like the card-based sections
- The overall structure: Back → Video → Title + Description + Progress → Quick Actions → Chapters accordion

### 2. Update `ModuleDetail.tsx` (Confissões de Fé)
The daily journey (days 1-30) collapsible groups already exist. The issue is that without `module_cards`, the quick action buttons and content sections are empty/disabled. Fix:
- When the module has `moduleDays` but no cards, adapt the quick action buttons to be relevant: "Começar" scrolls to daily journey, "PDFs" scrolls to PDFs section
- Ensure the daily journey section appears prominently with the same visual quality
- The quick actions should reflect what's actually available (daily journey, PDFs) rather than showing disabled buttons

### 3. File changes

**`src/pages/member/ProductDetail.tsx`** — Major rewrite:
- Add `module.welcome_video_url` video player at top
- Add quick action buttons matching Cadeias Invisíveis style
- Keep accordion but integrate into the same visual structure
- Add refs and scroll-to-section behavior

**`src/pages/member/ModuleDetail.tsx`** — Minor update:
- When module has days but no cards, show relevant quick action buttons (not disabled ones)
- Make "Começar" point to the daily journey section
- Hide buttons for sections that don't exist (Selah cards, Activity cards) when only daily journey is present


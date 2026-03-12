

# Plan: In-App Products Landing Page

## Summary
Add a 5th card on the Home page linking to a new in-app landing page (`/membros/app/conheca`) that showcases 3 products: Método REVOLUZ (direct checkout), Mentoria DSL and Revoluz Experience (waitlist forms). The page replicates the SalesPage visual style but lives inside the app with a back button.

## Database Changes

**New table: `waitlist_leads`**
- `id` (uuid PK), `created_at`, `product` (text: "MENTORIA_DSL" or "REVOLUZ_EXPERIENCE")
- `name`, `email`, `whatsapp`, `city`, `state`, `main_challenge`, `goal`, `availability` (all text, some nullable)
- RLS: anonymous insert allowed (like `leads` table), admins can read/update/delete

## File Changes

### 1. `src/pages/member/Home.tsx`
Add a 5th card after the modules section — a styled banner/card linking to `/membros/app/conheca` with text like "Conheça todos os produtos" and an arrow.

### 2. New: `src/pages/member/ProductsShowcase.tsx`
Full landing page replicating SalesPage structure, using the same CSS (`sales-page.css`) and components (`ButtonGold`, `ButtonOrange`, `CardCream`, `ScrollReveal`, `FAQAccordion`, `SectionRed`). Sections:

- **Back button** at top (navigates back in app)
- **Hero**: headline + subtitle + 2 CTAs (REVOLUZ checkout link + scroll to waitlist)
- **"Você sente isso?"**: 4 bullet questions in CardCream cards
- **"Quem te acompanha"**: Jordana bio with photo
- **"Escolha o seu próximo passo"**: 3 product cards
  - REVOLUZ: benefits + collapsible module curriculum + external checkout CTA
  - Mentoria DSL: benefits + waitlist CTA (opens modal)
  - Revoluz Experience: benefits + waitlist CTA (opens modal)
- **Testimonials**: 3 short quotes
- **Waitlist section**: tabs for DSL/Experience with form fields (name, email, whatsapp, city, state, main_challenge, goal, availability)
- **Final CTA**: REVOLUZ + waitlist scroll
- **Sticky mobile CTA**: fixed bottom bar with REVOLUZ button + waitlist link

### 3. New: `src/components/member/WaitlistModal.tsx`
Modal with form for waitlist signup. Fields vary slightly by product (availability question differs). Saves to `waitlist_leads` table via Supabase. Shows success toast.

### 4. `src/App.tsx`
Add route: `/membros/app/conheca` → `ProtectedRoute` + `AppLayout` + `ProductsShowcase`

### 5. `src/pages/member/index.ts`
Export `ProductsShowcase`

## Implementation Order
1. Database migration (create `waitlist_leads` table + RLS)
2. Create `WaitlistModal` component
3. Create `ProductsShowcase` page
4. Add route in `App.tsx`
5. Add card on `Home.tsx`


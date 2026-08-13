# Jornada Única — Jordana Cantarelli

Site institucional, páginas de venda e área de membros de Jordana Cantarelli, com o produto **Jornada Única** (uma experiência guiada devocional, com 2 landing pages: `/jornada` e `/junica`) e as demais ofertas dela (Método Revoluz, Mentoria DSL).

## Stack

- Vite + React + TypeScript
- React Router
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Deploy: Vercel (integrado ao GitHub — push em `main` gera deploy automático)

## Estrutura de rotas

- Institucional: `/`, `/jornadas`, `/contato`, `/links`
- Vendas: `/jornada`, `/junica` (Jornada Única), `/revoluz` / `/metodo-revoluz` (Método Revoluz)
- Membros: `/membros` (login) e `/membros/app/*` (área logada — módulos, caderno, biblioteca, perfil)
- Admin: `/admin` (gestão de conteúdo, usuários, e-mails, financeiro)

## Backend (Supabase)

- Schema e RLS versionados em `supabase/migrations/`
- Edge Functions em `supabase/functions/`: criação de usuários admin, e-mails transacionais (Resend), webhooks de compra (Kiwify e Hubla), campanhas de e-mail e recuperação de carrinho abandonado

## Development

```sh
git clone https://github.com/Luizreis15/triadejc.git
cd triadejc
npm i
npm run dev
```

Build de produção:

```sh
npm run build
```

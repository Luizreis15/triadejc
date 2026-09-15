# Dois agentes — contrato de execução

Owner: Cursor Grok (este agente). Implementadores: **Track A = Claude Code**, **Track B = Cursor Grok**. Não editar arquivo do outro track. Arquivo compartilhado = só o owner, ou PR de sync.

Objetivo: P0+P1 em paralelo sem conflito de merge. Stack permanece Vite + React + Supabase + Vercel.

## Branches

| Agente | Branch | Base |
|--------|--------|------|
| Claude Code | `agent/claude-ingress` | `main` |
| Cursor Grok | `agent/cursor-access` | `main` |
| Integração | `sec/p0` | merge das duas |

Não rebase na branch do outro. Merge só via owner em `sec/p0`.

## Track A — Claude Code (plano de compra)

Ingresso: webhook → identidade → e-mail de boas-vindas → (depois) entitlement.

**Pode editar**

- `supabase/functions/kiwify-webhook/**`
- `supabase/functions/hubla-webhook/**`
- `supabase/functions/send-welcome-email/**`
- `supabase/functions/send-abandoned-cart/**`
- `supabase/functions/_shared/**` (criar)

**Não editar:** `src/**`, `supabase/config.toml`, `package.json`, `App.tsx`, migrations (salvo as listadas abaixo se o owner liberar o pacote SQL).

**P0 (agora)**

1. HMAC fail-closed. Header ausente = 401. Sem log do body cru.
2. Parar `DEFAULT_PASSWORD = "Mudar@123"`. Usar `auth.admin.generateLink` (invite/recovery). Welcome recebe `action_link`, nunca senha.
3. `getUserByEmail` paginado — nunca `listUsers()` página 1 só.
4. Welcome só se a conta for nova. Replay de webhook não reenvia.
5. `_shared/crypto.ts`: `verifyHmacSha256(raw, header, secret)` timing-safe.
6. Abandoned-cart: exigir `x-internal-secret`; não processar sem ele.

**Secrets que o Track A lê (não commitar)**

- `KIWIFY_WEBHOOK_TOKEN` (já existe)
- `HUBLA_WEBHOOK_SECRET` (novo)
- `INTERNAL_FUNCTION_SECRET` (novo)
- `RESEND_API_KEY`

## Track B — Cursor Grok (plano de acesso)

App: auth, rotas, gates, e-mail admin, hook de auth.

**Pode editar**

- `src/**` (exceto se o owner marcar um arquivo como freeze)
- `supabase/functions/send-campaign/**`
- `supabase/functions/send-auth-email/**`
- `supabase/functions/create-admin-user/**`

**Não editar:** webhooks Kiwify/Hubla, `send-welcome-email`, `send-abandoned-cart`, `_shared`.

**P0 (agora)**

1. Remover `/membros/signup` de `App.tsx`. Tirar o link em `Login.tsx`. Remover `signUp` de `useAuth.tsx`.
2. `ProtectedRoute`: além de sessão, ler `profiles.is_active`. Inativo → tela “acesso desativado”, sem loop de login.
3. `send-campaign` e `send-auth-email`: recusar sem prova. Campaign = JWT + `has_role(admin)`. Auth-email = `SEND_AUTH_HOOK_SECRET` no header.
4. CORS das functions B: origin do domínio de produção, não `*`.
5. Não colocar senha em e-mail.

**Secrets que o Track B lê**

- `INTERNAL_FUNCTION_SECRET`
- `SEND_AUTH_HOOK_SECRET` (novo)
- `RESEND_API_KEY`

## Freeze — só o owner

Estes arquivos não entram em PR de agente sem o owner no diff:

- `supabase/config.toml`
- `package.json` / `package-lock.json`
- `src/integrations/supabase/types.ts`
- `supabase/migrations/**` (até o pacote SQL P1)
- `vercel.json`
- `AGENTS.md` / `CLAUDE.md`

Pedido típico ao owner: “ligar `verify_jwt = true` em send-campaign”.

## Contratos (não negociar no código)

- Fail-closed: sem assinatura/secret → 401, não 200.
- UI não é trava. P1: `can_read_module` no SQL.
- Sem `any` novo. Sem `console.log` de payload PII.
- Deno `_shared` não importa de `src/`.
- Teste mínimo P0: request sem HMAC/secret retorna 401.

## Sync

| Ponto | Quando | Quem |
|-------|--------|------|
| S0 | Contratos neste arquivo | Owner (feito) |
| S1 | P0 merge em `sec/p0` | Owner |
| S2 | Migration products/entitlements | Owner escreve SQL; A consome; B consome types |
| S3 | RLS + gates | A grava entitlement no webhook; B lê no React |

P1 não começa em paralelo no schema. Owner abre a migration; depois A e B voltam a paralelizar.

## Prompt curto para o Claude Code

```
Leia AGENTS.md. Você é Track A. Branch agent/claude-ingress a partir de main.
Não edite src/, config.toml, package.json nem migrations.
Implemente só o P0 do Track A. HMAC fail-closed, sem senha padrão, getUserByEmail paginado.
Abra PR para sec/p0 quando o 401 sem header estiver coberto.
```

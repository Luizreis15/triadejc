# Dois agentes — contrato de execução

Owner: Cursor Grok (este agente). Implementadores: **Track A = Claude Code**, **Track B = Cursor Grok**. Não editar arquivo do outro track. Arquivo compartilhado = só o owner, ou PR de sync.

Objetivo: P1 em paralelo sem conflito de merge. Stack permanece Vite + React + Supabase + Vercel. Checkout é **somente Kiwify**.

## Branches

| Agente | Branch | Base |
|--------|--------|------|
| Claude Code | `agent/claude-ingress` | `sec/p1` |
| Cursor Grok | `agent/cursor-access` | `sec/p1` |
| Integração | `sec/p1` | merge das duas |

Não rebase na branch do outro. Merge só via owner em `sec/p1`. Não mergear `sec/p1` em `main` sem o owner.

## Track A — Claude Code (plano de compra)

Ingresso: webhook autenticado → identidade → entitlement → transação → e-mail de boas-vindas.

**Pode editar**

- `supabase/functions/kiwify-webhook/**`
- `supabase/functions/send-welcome-email/**`
- `supabase/functions/send-abandoned-cart/**`
- `supabase/functions/_shared/**` (criar)

**Não editar:** `src/**`, `supabase/config.toml`, `package.json`, `App.tsx`, `src/integrations/supabase/types.ts`, `supabase/migrations/**`.

**P0 (feito — não reabrir)**

HMAC fail-closed, `generateLink` invite, welcome só conta nova, `_shared/crypto.ts`, abandoned-cart com `x-internal-secret`.

**P1 (agora)**

1. Persistir `webhook_events` **antes** de processar. `provider = 'kiwify'`. `event_id` estável: `order_id + ':' + eventType` (ou id único do payload se existir). `UNIQUE (provider, event_id)`.
2. Se o insert colidir e `status = 'processed'`, retornar 200 **sem** reenviar welcome e sem reprocessar. Se colidir com `received`/`failed`, continuar o grant (retry).
3. Resolver produto: `products.kiwify_product_id = payload.Product.product_id`. Se não achar, **fallback** `slug = 'jornada_unica'` (produto único). Não falhar o webhook por SKU desconhecido.
4. `entitlements` upsert em `(user_id, product_id)`: `status='active'`, `source='kiwify'`, `external_id=order_id`. Não revogar em eventos de pagamento.
5. Escrever `transactions`: `provider='kiwify'`, `external_id=order_id`, `product_id`, `user_id`, `type`/`amount`/`currency` a partir do payload (amount 0 se ausente). Respeitar o índice único `(provider, external_id)`. Replay não duplica.
6. Depois do grant+transaction, marcar `webhook_events.status='processed'` e `processed_at=now()`. Em erro de grant, `status='failed'` e 500 para a Kiwify retentar.
7. Welcome continua só conta nova. Replay nunca reenvia.
8. Service role no webhook. Sem `console.log` do body cru / PII.

**Secrets que o Track A lê (não commitar)**

- `KIWIFY_WEBHOOK_TOKEN`
- `INTERNAL_FUNCTION_SECRET`
- `RESEND_API_KEY`

## Track B — Cursor Grok (plano de acesso)

App: auth, rotas, gates, e-mail admin, hook de auth.

**Pode editar**

- `src/**` (exceto freeze)
- `supabase/functions/send-campaign/**`
- `supabase/functions/send-auth-email/**`
- `supabase/functions/create-admin-user/**`

**Não editar:** `kiwify-webhook`, `send-welcome-email`, `send-abandoned-cart`, `_shared`.

**P0 (feito — não reabrir)**

Signup público removido, `is_active` no `ProtectedRoute`, campaign JWT+admin, Auth Hook HTTPS.

**P1 (agora)**

1. `useMemberAccess`: `profiles.is_active` **e** `rpc('has_any_entitlement')`.
2. `ProtectedRoute`: inativo → `AccessDisabled` inactive; ativo sem entitlement → `no_entitlement`.
3. `AdminRoute` continua só `is_active` (admin passa no SQL via `has_role`).
4. Não contornar RLS no client. UI não é a trava.

**Secrets que o Track B lê**

- `INTERNAL_FUNCTION_SECRET`
- `SEND_AUTH_HOOK_SECRET`
- `RESEND_API_KEY`

## Freeze — só o owner

- `supabase/config.toml`
- `package.json` / `package-lock.json`
- `src/integrations/supabase/types.ts`
- `supabase/migrations/**`
- `vercel.json`
- `AGENTS.md` / `CLAUDE.md`

Pedido típico ao owner: “preciso de coluna X na migration”.

## Contratos (não negociar no código)

- Fail-closed: sem assinatura/secret → 401, não 200.
- UI não é trava. Conteúdo: `can_read_module` / `has_any_entitlement` no SQL.
- SKU Kiwify desconhecido → `jornada_unica`.
- Sem `any` novo. Sem `console.log` de payload PII.
- Deno `_shared` não importa de `src/`.
- Teste mínimo P1 Track A: replay do mesmo `event_id` não duplica entitlement/transaction e não reenvia welcome.

## Sync

| Ponto | Quando | Quem |
|-------|--------|------|
| S0 | Contratos neste arquivo | Owner (feito) |
| S1 | P0 merge em `main` | Owner (feito) |
| S2 | Migration products/entitlements | Owner (este commit em `sec/p1`) |
| S3 | RLS + gates | A grava entitlement no webhook; B lê no React |

## Prompt curto para o Claude Code

```
Leia AGENTS.md. Você é Track A. Branch agent/claude-ingress a partir de sec/p1 (não main).
Não edite src/, config.toml, package.json, types.ts nem migrations.
Implemente só o P1 do Track A em kiwify-webhook: persistir webhook_events, grant de entitlements, escrever transactions, marcar processed.
SKU desconhecido → jornada_unica. Replay do mesmo event_id não reenvia welcome nem duplica grant.
Abra PR para sec/p1 quando o replay estiver coberto.
```

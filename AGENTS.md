# Dois agentes — contrato de execução

Owner: Cursor Grok (este agente). Implementadores: **Track A = Claude Code**, **Track B = Cursor Grok**. Não editar arquivo do outro track. Arquivo compartilhado = só o owner, ou PR de sync.

Objetivo: P2 em paralelo. Stack permanece Vite + React + Supabase + Vercel. Checkout é **somente Kiwify**.

## Branches

| Agente | Branch | Base |
|--------|--------|------|
| Claude Code | `agent/claude-ingress` | `sec/p1` |
| Cursor Grok | `agent/cursor-access` | `sec/p1` |
| Integração | `sec/p1` | merge das duas |

Não rebase na branch do outro. Não resetar a branch do outro. Merge só via owner em `sec/p1`. Não mergear `sec/p1` em `main` sem o owner.

P0 e P1 estão em `main`. Trabalho novo vai para `sec/p1`.

## Track A — Claude Code (plano de compra)

**Pode editar**

- `supabase/functions/kiwify-webhook/**`
- `supabase/functions/send-welcome-email/**`
- `supabase/functions/send-abandoned-cart/**`
- `supabase/functions/process-outbox/**` (criar)
- `supabase/functions/_shared/**`

**Não editar:** `src/**`, `supabase/config.toml`, `package.json`, `types.ts`, `supabase/migrations/**`.

**P0/P1 (feito — não reabrir)** HMAC, invite, webhook_events, entitlements, transactions.

**P2 (agora)**

1. Welcome sobrevive a retry: se o grant falhar depois do invite, o replay ainda envia o welcome (não depender só de `isNewUser` na request atual).
2. Webhook **enfileira** em `email_outbox` (`kind='welcome'`, `idempotency_key` estável tipo `welcome:{user_id}` ou `welcome:{order_id}`). Não dispara Resend inline.
3. `send-welcome-email` / `send-abandoned-cart` passam a ser consumidos pelo worker, ou o worker chama Resend direto a partir do payload. Replay do mesmo `idempotency_key` não duplica linha (`ON CONFLICT DO NOTHING`).
4. Criar `process-outbox`: `x-internal-secret` fail-closed. Usa `rpc('claim_email_outbox')`. Sucesso → `status='sent'`. Falha → `next_attempt_at` em 1h / 24h / 72h; `attempts >= 8` → `status='failed'`. Sem log de e-mail/PII.
5. Abandoned-cart: continua exigindo secret. Pode enfileirar `kind='abandoned_cart'` em vez de enviar na hora. Não implementar refund/revoke.

**Pedido ao owner se faltar:** cron no dashboard (não commitar secret).

## Track B — Cursor Grok (plano de acesso)

**Pode editar** `src/**` (exceto freeze), `send-campaign`, `send-auth-email`, `create-admin-user`.

**P2 (agora)**

1. `create-admin-user`: invite/`action_link`, sem senha no e-mail.
2. FinanceAdmin: `status='paid'` do webhook conta como receita; coluna provider/external_id.
3. Admin edita `products.kiwify_product_id`.
4. Grant/revoke no UsersAdmin grava `audit_log`.
5. PDF do storage: signed URL (bucket `pdfs` agora é privado).

## Freeze — só o owner

`config.toml`, `package.json`, `types.ts`, `migrations/**`, `vercel.json`, `AGENTS.md`, `CLAUDE.md`.

## Contratos

- Fail-closed. UI não é trava.
- SKU desconhecido → `jornada_unica`.
- Sem `any` novo. Sem log de payload PII.
- Deno `_shared` não importa de `src/`.
- Teste mínimo P2 Track A: dois inserts com o mesmo `idempotency_key` = uma linha; `process-outbox` sem secret = 401.

## Prompt curto para o Claude Code

```
Leia AGENTS.md. Você é Track A. Branch agent/claude-ingress a partir de origin/sec/p1 (puxe; o owner acabou de adicionar email_outbox).
Não edite src/, config.toml, package.json, types.ts nem migrations.
P2: welcome sobrevive a retry de grant; webhook INSERT email_outbox (idempotency_key); criar process-outbox com x-internal-secret + rpc claim_email_outbox; retry 1h/24h/72h; sem refund.
PR para sec/p1.
```

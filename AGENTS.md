# Dois agentes — contrato de execução

Owner: Cursor Grok (este agente). Implementadores: **Track A = Claude Code**, **Track B = Cursor Grok**. Não editar arquivo do outro track. Arquivo compartilhado = só o owner, ou PR de sync.

P0 e P1 estão em `main`. P2 está em `sec/p1` (outbox, cron, PDF privado, invite admin).

## Branches

| Agente | Branch | Base |
|--------|--------|------|
| Claude Code | `agent/claude-ingress` | `sec/p1` |
| Cursor Grok | `agent/cursor-access` | `sec/p1` |
| Integração | `sec/p1` | merge das duas |

Não rebase na branch do outro. Não resetar a branch do outro. Merge só via owner. Não mergear `sec/p1` em `main` sem o owner.

## Track A — Claude Code

Paths: `kiwify-webhook`, `send-welcome-email`, `send-abandoned-cart`, `process-outbox`, `_shared`. Sem `src/`, migrations, `types.ts`, `config.toml`.

**P0/P1/P2 (feito — não reabrir)** HMAC, entitlements, outbox, welcome no retry.

**P3 (agora)** — testes Deno do webhook/outbox:

1. Teste HMAC fail-closed (sem header → 401).
2. Replay do mesmo `event_id` não duplica entitlement/transaction/welcome.
3. `enqueueEmail` com o mesmo `idempotency_key` = uma linha.
4. Pin de imports Deno (`@supabase/supabase-js` uma versão só).

## Track B — Cursor Grok

Paths: `src/**` (exceto freeze), `send-campaign`, `send-auth-email`, `create-admin-user`.

**P3 (agora)**

1. Sentry no SPA (DSN só em env).
2. Bump jsPDF e react-router se o owner abrir `package.json`.
3. Empty/error states restantes nas rotas de membro.

## Freeze — só o owner

`config.toml`, `package.json`, `types.ts`, `migrations/**`, `vercel.json`, `AGENTS.md`, `CLAUDE.md`.

Owner P3: GitHub Actions (`tsc`, eslint, `npm audit --audit-level=high`), gitignore de artefatos.

## Contratos

- Fail-closed. UI não é trava.
- SKU desconhecido → `jornada_unica`.
- Sem `any` novo. Sem log de payload PII.
- Deno `_shared` não importa de `src/`.
- Sem senha padrão. Sem signup público. Sem Hubla.

## Prompt curto para o Claude Code

```
Leia AGENTS.md. Você é Track A. Branch agent/claude-ingress a partir de origin/sec/p1.
Não edite src/, config.toml, package.json, types.ts nem migrations.
P2 está fechado. P3 Track A: testes Deno do kiwify-webhook (HMAC 401, replay não duplica, idempotency_key do outbox). Sem refund. PR para sec/p1.
```

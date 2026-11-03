# Dois agentes — contrato de execução

**Owner: Claude Code.** Alterado em 2026-11-02 por decisão explícita do usuário (Luiz) — substitui o arranjo anterior, onde o Cursor Grok era owner. Motivo registrado pelo usuário: preferência pelo refinamento do Claude Code frente ao do Cursor Grok.

Implementadores: **Owner = Claude Code** (sem restrição de path), **Track B = Cursor Grok** (implementador restrito, não decide mais sobre arquivos compartilhados nem sobre este contrato). Cursor Grok não edita `AGENTS.md`/`CLAUDE.md` nem itens de freeze sem autorização do owner atual (Claude Code) ou do usuário.

P0 e P1 estão em `main`. P2 está em `sec/p1` (outbox, cron, PDF privado, invite admin).

## Branches

| Agente | Branch | Base |
|--------|--------|------|
| Claude Code (owner) | `agent/claude-ingress` | `sec/p1` |
| Cursor Grok (Track B) | `agent/cursor-access` | `sec/p1` |
| Integração | `sec/p1` | merge das duas |

Não resetar a branch do outro agente sem avisar. Merge para `main` só com confirmação do usuário.

## Owner — Claude Code

Pode editar qualquer path do projeto, incluindo `src/`, `migrations/**`, `types.ts`, `config.toml`, `package.json`, `vercel.json`, `AGENTS.md`, `CLAUDE.md`. Responsável por revisar e integrar o que o Track B (Cursor Grok) entrega antes de ir para `sec/p1`/`main`.

**P0/P1/P2 (feito, em `kiwify-webhook`/outbox)** HMAC, entitlements, outbox, welcome no retry — não reabrir sem motivo novo.

**P3 (fechado)** — testes Deno do webhook/outbox: HMAC fail-closed, replay sem duplicar, idempotency_key, imports pinados.

**Escopo aberto agora**: repaginação visual do módulo de leitura/área de membros (paleta, movimento, progresso integrado, "onde parei", lembrete de leitura) e disparo de WhatsApp pós-compra via UAZAPI — ver prompts específicos quando abertos.

## Track B — Cursor Grok

Paths sugeridos: `src/**`, `send-campaign`, `send-auth-email`, `create-admin-user` — sob revisão do owner antes de ir para `sec/p1`. Qualquer mudança em `config.toml`, `package.json`, `types.ts`, `migrations/**` passa pelo owner, não é mais decisão unilateral do Cursor Grok.

**P3 (agora)**

1. Sentry no SPA (DSN só em env).
2. Bump jsPDF e react-router — abrir como PR para o owner revisar `package.json`.
3. Empty/error states restantes nas rotas de membro.

## Freeze — só o owner (Claude Code) ou o usuário

`AGENTS.md`, `CLAUDE.md`. Demais paths (`config.toml`, `package.json`, `types.ts`, `migrations/**`, `vercel.json`) seguem sob revisão do owner, não são mais exclusivos do Cursor Grok.

## Contratos

- Fail-closed. UI não é trava.
- SKU desconhecido → `jornada_unica`.
- Sem `any` novo. Sem log de payload PII.
- Deno `_shared` não importa de `src/`.
- Sem senha padrão. Sem signup público. Sem Hubla.

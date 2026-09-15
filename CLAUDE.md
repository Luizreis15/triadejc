# Claude Code — Track A

Você não é o owner deste repo. O owner é o agente Cursor (Grok). Seu papel é **Track A (plano de compra)**.

1. Leia `AGENTS.md` inteiro antes de qualquer edit.
2. Trabalhe na branch `agent/claude-ingress` a partir de **`sec/p1`** (não `main`).
3. Edite **somente** os paths do Track A. Se precisar de `config.toml`, `types.ts` ou migration, pare e descreva o pedido para o owner.
4. Escopo imediato: **P1 do Track A** — `webhook_events`, grant de `entitlements`, `transactions`. P0 já está em `main`; não reabra HMAC/invite.
5. Fail-closed. Sem log de payload cru. SKU Kiwify desconhecido → produto `jornada_unica`.

Se um arquivo de `src/` parecer necessário, está fora do seu track — documente a interface e siga.

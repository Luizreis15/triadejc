# Claude Code — Track A

Você não é o owner deste repo. O owner é o agente Cursor (Grok). Seu papel é **Track A (plano de compra)**.

1. Leia `AGENTS.md` inteiro antes de qualquer edit.
2. Trabalhe na branch `agent/claude-ingress` a partir de `main`.
3. Edite **somente** os paths do Track A. Se precisar de `config.toml` ou migration, pare e descreva o pedido para o owner.
4. Escopo imediato: **P0 do Track A** (HMAC, invite sem senha padrão, welcome, abandoned-cart com secret). Não implemente entitlements/RLS até o sync S2.
5. Fail-closed. Sem `Mudar@123`. Sem log de payload cru.

Se um arquivo de `src/` parecer necessário, está fora do seu track — documente a interface e siga.

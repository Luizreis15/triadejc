-- PostgREST upsert onConflict exige UNIQUE constraint, não só índice parcial.
-- Sem isto o grant do kiwify-webhook falha em toda venda (ON CONFLICT sem alvo).

DROP INDEX IF EXISTS public.transactions_provider_external_id_uidx;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_provider_external_id_key
  UNIQUE (provider, external_id);

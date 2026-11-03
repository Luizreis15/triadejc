-- WhatsApp de acesso: uma conexão Uazapi, um texto de boas-vindas e a fila de envio.
-- O token fica só no banco. Nenhum papel de navegador lê estas tabelas.

CREATE TABLE public.whatsapp_connection (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT false,
  base_url text,
  instance_name text,
  token text,
  phone_e164 text,
  last_status text,
  last_checked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.whatsapp_connection (id) VALUES (1);

CREATE TABLE public.whatsapp_templates (
  key text PRIMARY KEY,
  body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.whatsapp_templates (key, body) VALUES (
  'welcome',
  E'Olá, {nome}.\n\nSeu acesso à Jornada Única está liberado.\n\nE-mail: {email}\nPara criar sua senha e entrar, use este link:\n{link}\n\nSe precisar de ajuda, pode falar por este WhatsApp. O suporte também acontece por aqui.'
);

CREATE TABLE public.whatsapp_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind = 'welcome'),
  to_phone text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text UNIQUE,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  provider_id text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX whatsapp_outbox_claim_idx
  ON public.whatsapp_outbox (next_attempt_at)
  WHERE status = 'queued';

CREATE OR REPLACE FUNCTION public.claim_whatsapp_outbox(_limit integer DEFAULT 20)
RETURNS SETOF public.whatsapp_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH picked AS (
    SELECT id
    FROM public.whatsapp_outbox
    WHERE status = 'queued'
      AND next_attempt_at <= now()
      AND attempts < 3
    ORDER BY next_attempt_at
    LIMIT GREATEST(_limit, 1)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.whatsapp_outbox o
  SET attempts = o.attempts + 1
  FROM picked
  WHERE o.id = picked.id
  RETURNING o.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_whatsapp_outbox(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_whatsapp_outbox(integer) TO service_role;

ALTER TABLE public.whatsapp_connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_outbox ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.whatsapp_connection FROM anon, authenticated;
REVOKE ALL ON TABLE public.whatsapp_templates FROM anon, authenticated;
REVOKE ALL ON TABLE public.whatsapp_outbox FROM anon, authenticated;

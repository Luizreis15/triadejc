-- Alinha o CHECK de kind com o worker do Track A e permite claim por tipo.

ALTER TABLE public.email_outbox
  DROP CONSTRAINT IF EXISTS email_outbox_kind_check;

ALTER TABLE public.email_outbox
  ADD CONSTRAINT email_outbox_kind_check
  CHECK (kind IN (
    'welcome',
    'abandoned_cart',
    'campaign',
    'abandoned_cart_reminder_1h',
    'abandoned_cart_reminder_24h',
    'abandoned_cart_reminder_72h'
  ));

DROP FUNCTION IF EXISTS public.claim_email_outbox(integer);

CREATE OR REPLACE FUNCTION public.claim_email_outbox(_limit integer DEFAULT 20, _kind text DEFAULT NULL)
RETURNS SETOF public.email_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH picked AS (
    SELECT id
    FROM public.email_outbox
    WHERE status = 'queued'
      AND next_attempt_at <= now()
      AND attempts < 8
      AND (_kind IS NULL OR kind = _kind)
    ORDER BY next_attempt_at
    LIMIT GREATEST(_limit, 1)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.email_outbox o
  SET attempts = o.attempts + 1
  FROM picked
  WHERE o.id = picked.id
  RETURNING o.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_email_outbox(integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_email_outbox(integer, text) TO service_role;

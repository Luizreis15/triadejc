-- P2: outbox de e-mail, audit de grant e PDF privado.

CREATE TABLE public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('welcome', 'abandoned_cart', 'campaign')),
  to_email text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text UNIQUE,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX email_outbox_claim_idx
  ON public.email_outbox (next_attempt_at)
  WHERE status = 'queued';

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_created_at_idx ON public.audit_log (created_at DESC);
CREATE INDEX audit_log_entity_idx ON public.audit_log (entity_type, entity_id);

-- Worker (service role) pega lote sem duplicar entre invocações.
CREATE OR REPLACE FUNCTION public.claim_email_outbox(_limit integer DEFAULT 20)
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

REVOKE ALL ON FUNCTION public.claim_email_outbox(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_email_outbox(integer) TO service_role;

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email outbox"
  ON public.email_outbox FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert audit log"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    AND actor_id = auth.uid()
  );

GRANT SELECT ON public.email_outbox TO authenticated;
GRANT SELECT, INSERT ON public.audit_log TO authenticated;

-- Bucket pdfs deixa de ser URL pública. Quem lê precisa de sessão + entitlement.
UPDATE storage.buckets
SET public = false
WHERE id = 'pdfs';

DROP POLICY IF EXISTS "Authenticated users can view pdfs" ON storage.objects;

CREATE POLICY "Entitled users can view pdfs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'pdfs'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_any_entitlement(auth.uid())
    )
  );

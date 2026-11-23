-- Link curto de acesso: troca o link longo do Supabase por jordanacantarelli.com.br/a/<código>.
-- O código só devolve o token de uso único que já iria no link longo; quem não tem o código não lê nada.

CREATE TABLE IF NOT EXISTS public.access_links (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9]{8,16}$'),
  token_hash text NOT NULL,
  link_type text NOT NULL CHECK (link_type IN ('recovery', 'invite', 'magiclink', 'signup')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.access_links FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.redeem_access_link(_code text)
RETURNS TABLE (token_hash text, link_type text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.token_hash, l.link_type
  FROM public.access_links l
  WHERE l.code = lower(trim(_code))
    AND l.created_at > now() - interval '30 days'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.redeem_access_link(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_access_link(text) TO anon, authenticated, service_role;

-- P1 paywall: catalogo, entitlements, idempotencia de webhook e RLS de conteudo.
-- Backfill: todo profile existente recebe jornada_unica para nao lockar alunas pagantes.

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  kiwify_product_id text UNIQUE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.products (slug, name, status)
VALUES ('jornada_unica', 'Jornada Única', 'active');

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);

UPDATE public.modules
SET product_id = (SELECT id FROM public.products WHERE slug = 'jornada_unica')
WHERE product_id IS NULL;

ALTER TABLE public.modules
  ALTER COLUMN product_id SET NOT NULL;

CREATE TABLE public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  source text NOT NULL DEFAULT 'backfill',
  external_id text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (user_id, product_id)
);

CREATE INDEX entitlements_user_id_idx ON public.entitlements (user_id);

CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'kiwify',
  event_id text NOT NULL,
  event_type text,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  payload jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);

CREATE UNIQUE INDEX IF NOT EXISTS transactions_provider_external_id_uidx
  ON public.transactions (provider, external_id)
  WHERE provider IS NOT NULL AND external_id IS NOT NULL;

INSERT INTO public.entitlements (user_id, product_id, status, source)
SELECT p.id, pr.id, 'active', 'backfill'
FROM public.profiles p
CROSS JOIN public.products pr
WHERE pr.slug = 'jornada_unica'
ON CONFLICT (user_id, product_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_active_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_active FROM public.profiles WHERE id = _user_id), true);
$$;

CREATE OR REPLACE FUNCTION public.has_entitlement(_user_id uuid, _product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.entitlements e
    WHERE e.user_id = _user_id
      AND e.product_id = _product_id
      AND e.status = 'active'
      AND (e.expires_at IS NULL OR e.expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_entitlement(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.entitlements e
    WHERE e.user_id = _user_id
      AND e.status = 'active'
      AND (e.expires_at IS NULL OR e.expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_module(_user_id uuid, _module_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::public.app_role)
    OR (
      public.is_active_member(_user_id)
      AND EXISTS (
        SELECT 1
        FROM public.modules m
        WHERE m.id = _module_id
          AND (
            COALESCE(m.is_free, false)
            OR public.has_entitlement(_user_id, m.product_id)
          )
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.grant_default_entitlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_product uuid;
BEGIN
  SELECT id INTO default_product FROM public.products WHERE slug = 'jornada_unica';
  IF default_product IS NULL THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.entitlements (user_id, product_id, status, source)
  VALUES (NEW.id, default_product, 'active', 'profile_trigger')
  ON CONFLICT (user_id, product_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_grant_entitlement ON public.profiles;
CREATE TRIGGER on_profile_created_grant_entitlement
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_default_entitlement();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated can view products"
  ON public.products FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can view own entitlements"
  ON public.entitlements FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can manage entitlements"
  ON public.entitlements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view webhook events"
  ON public.webhook_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.modules;
CREATE POLICY "Entitled users can view modules"
  ON public.modules FOR SELECT TO authenticated
  USING (public.can_read_module(auth.uid(), id));

DROP POLICY IF EXISTS "Authenticated users can view module cards" ON public.module_cards;
CREATE POLICY "Entitled users can view module cards"
  ON public.module_cards FOR SELECT TO authenticated
  USING (public.can_read_module(auth.uid(), module_id));

DROP POLICY IF EXISTS "Authenticated users can view module days" ON public.module_days;
CREATE POLICY "Entitled users can view module days"
  ON public.module_days FOR SELECT TO authenticated
  USING (public.can_read_module(auth.uid(), module_id));

DROP POLICY IF EXISTS "Authenticated users can view module pdfs" ON public.module_pdfs;
CREATE POLICY "Entitled users can view module pdfs"
  ON public.module_pdfs FOR SELECT TO authenticated
  USING (public.can_read_module(auth.uid(), module_id));

DROP POLICY IF EXISTS "Authenticated users can view product chapters" ON public.product_chapters;
CREATE POLICY "Entitled users can view product chapters"
  ON public.product_chapters FOR SELECT TO authenticated
  USING (public.can_read_module(auth.uid(), module_id));

DROP POLICY IF EXISTS "Authenticated users can view library items" ON public.library_items;
CREATE POLICY "Entitled users can view library items"
  ON public.library_items FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR (public.is_active_member(auth.uid()) AND public.has_any_entitlement(auth.uid()))
  );

DROP POLICY IF EXISTS "Authenticated users can view exercises" ON public.exercises;
CREATE POLICY "Entitled users can view exercises"
  ON public.exercises FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR (
      public.is_active_member(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.modules m
        WHERE m.slug = exercises.module_slug
          AND public.can_read_module(auth.uid(), m.id)
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view devotional days" ON public.devotional_days;
CREATE POLICY "Entitled users can view devotional days"
  ON public.devotional_days FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR (
      public.is_active_member(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.modules m
        WHERE m.slug = devotional_days.module_slug
          AND public.can_read_module(auth.uid(), m.id)
      )
    )
  );

GRANT SELECT ON public.products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.entitlements TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.entitlements TO authenticated;
GRANT SELECT ON public.webhook_events TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_active_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_entitlement(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_entitlement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_module(uuid, uuid) TO authenticated;

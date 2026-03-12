CREATE TABLE public.waitlist_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  product text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  city text,
  state text,
  main_challenge text NOT NULL,
  goal text,
  availability text
);

ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert waitlist leads"
  ON public.waitlist_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view waitlist leads"
  ON public.waitlist_leads FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update waitlist leads"
  ON public.waitlist_leads FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete waitlist leads"
  ON public.waitlist_leads FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
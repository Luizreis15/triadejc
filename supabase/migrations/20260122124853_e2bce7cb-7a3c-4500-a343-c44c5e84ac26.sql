-- Create table to track abandoned cart emails sent
CREATE TABLE public.abandoned_cart_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lead_id, email_type)
);

-- Enable RLS
ALTER TABLE public.abandoned_cart_emails ENABLE ROW LEVEL SECURITY;

-- Only admins and service role can manage
CREATE POLICY "Admins can view abandoned cart emails"
ON public.abandoned_cart_emails FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert abandoned cart emails"
ON public.abandoned_cart_emails FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete abandoned cart emails"
ON public.abandoned_cart_emails FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable extensions for cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
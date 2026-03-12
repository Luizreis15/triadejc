CREATE TABLE public.leads_contato (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tipo text NOT NULL,
  produto_interesse text,
  nome text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  cidade text,
  estado text,
  igreja_organizacao text,
  data_evento text,
  tipo_evento text,
  tema text,
  mensagem text
);

ALTER TABLE public.leads_contato ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads_contato"
  ON public.leads_contato FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Admins can select leads_contato"
  ON public.leads_contato FOR SELECT TO public
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads_contato"
  ON public.leads_contato FOR UPDATE TO public
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads_contato"
  ON public.leads_contato FOR DELETE TO public
  USING (has_role(auth.uid(), 'admin'));
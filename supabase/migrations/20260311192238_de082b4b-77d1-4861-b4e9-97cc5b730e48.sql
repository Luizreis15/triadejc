
-- Create module_days table
CREATE TABLE public.module_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  day_number integer NOT NULL,
  day_in_module integer NOT NULL,
  title text NOT NULL,
  verse_reference text,
  message_text text NOT NULL,
  confession_text text,
  exercise_q1 text,
  exercise_q2 text,
  top_video_url text,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_days ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "Authenticated users can view module days"
  ON public.module_days FOR SELECT TO authenticated
  USING (true);

-- Admins can CRUD
CREATE POLICY "Admins can insert module days"
  ON public.module_days FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update module days"
  ON public.module_days FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete module days"
  ON public.module_days FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

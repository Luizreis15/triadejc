-- Create product_chapters table
CREATE TABLE public.product_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  title text NOT NULL,
  long_description text NOT NULL,
  video_url text,
  pdf_url text,
  exercise_q1 text,
  exercise_q2 text,
  exercise_q3 text,
  exercise_q4 text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view product chapters" ON public.product_chapters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert product chapters" ON public.product_chapters
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product chapters" ON public.product_chapters
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product chapters" ON public.product_chapters
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create chapter_answers table
CREATE TABLE public.chapter_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chapter_id uuid NOT NULL REFERENCES public.product_chapters(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, chapter_id)
);

ALTER TABLE public.chapter_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chapter answers" ON public.chapter_answers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chapter answers" ON public.chapter_answers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chapter answers" ON public.chapter_answers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chapter answers" ON public.chapter_answers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_chapter_answers_updated_at
  BEFORE UPDATE ON public.chapter_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
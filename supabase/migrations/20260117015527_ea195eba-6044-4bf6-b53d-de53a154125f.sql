-- Criar tabela para check-in diário
CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  how_am_i TEXT,
  what_feeling TEXT,
  recurring_thought TEXT,
  need_from_god TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Policies para daily_checkins
CREATE POLICY "Users can view own checkins" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON public.daily_checkins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins" ON public.daily_checkins
  FOR DELETE USING (auth.uid() = user_id);

-- Criar tabela para PDFs de módulos
CREATE TABLE public.module_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.module_pdfs ENABLE ROW LEVEL SECURITY;

-- Policies para module_pdfs
CREATE POLICY "Authenticated users can view module pdfs" ON public.module_pdfs
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert module pdfs" ON public.module_pdfs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update module pdfs" ON public.module_pdfs
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete module pdfs" ON public.module_pdfs
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Adicionar colunas à notebook_entries para exercícios por módulo
ALTER TABLE public.notebook_entries 
  ADD COLUMN IF NOT EXISTS module_slug TEXT,
  ADD COLUMN IF NOT EXISTS exercise_type TEXT;

-- Adicionar campo de vídeo de boas-vindas aos módulos
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS welcome_video_url TEXT;

-- Trigger para updated_at em daily_checkins
CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
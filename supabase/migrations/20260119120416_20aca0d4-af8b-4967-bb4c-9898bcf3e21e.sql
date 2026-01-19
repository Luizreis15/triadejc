
-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_slug TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'pen-line',
  scripture_reference TEXT,
  scripture_text TEXT,
  prompt_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_time INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create devotional_days table
CREATE TABLE public.devotional_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_slug TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  scripture_reference TEXT NOT NULL,
  scripture_text TEXT NOT NULL,
  reflection_md TEXT NOT NULL,
  heart_question TEXT NOT NULL,
  prayer_md TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(module_slug, day_number)
);

-- Add columns to notebook_entries for exercise and devotional tracking
ALTER TABLE public.notebook_entries
ADD COLUMN exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
ADD COLUMN devotional_day_id UUID REFERENCES public.devotional_days(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_days ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercises (read-only for authenticated users)
CREATE POLICY "Authenticated users can view exercises"
ON public.exercises
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert exercises"
ON public.exercises
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update exercises"
ON public.exercises
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete exercises"
ON public.exercises
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for devotional_days (read-only for authenticated users)
CREATE POLICY "Authenticated users can view devotional days"
ON public.devotional_days
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert devotional days"
ON public.devotional_days
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update devotional days"
ON public.devotional_days
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete devotional days"
ON public.devotional_days
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_exercises_module_slug ON public.exercises(module_slug);
CREATE INDEX idx_devotional_days_module_slug ON public.devotional_days(module_slug);
CREATE INDEX idx_notebook_entries_exercise_id ON public.notebook_entries(exercise_id);
CREATE INDEX idx_notebook_entries_devotional_day_id ON public.notebook_entries(devotional_day_id);

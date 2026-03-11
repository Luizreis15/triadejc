-- Table for favorite confessions
CREATE TABLE public.user_favorite_confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id uuid NOT NULL REFERENCES public.module_days(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_id)
);

ALTER TABLE public.user_favorite_confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorite confessions" ON public.user_favorite_confessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorite confessions" ON public.user_favorite_confessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorite confessions" ON public.user_favorite_confessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Table for maintenance plan progress
CREATE TABLE public.user_maintenance_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  maintenance_day integer NOT NULL CHECK (maintenance_day BETWEEN 1 AND 7),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, maintenance_day)
);

ALTER TABLE public.user_maintenance_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maintenance progress" ON public.user_maintenance_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own maintenance progress" ON public.user_maintenance_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own maintenance progress" ON public.user_maintenance_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
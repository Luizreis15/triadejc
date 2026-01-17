-- Create card_completions table to track individual card completions
CREATE TABLE public.card_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.module_cards(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Enable RLS
ALTER TABLE public.card_completions ENABLE ROW LEVEL SECURITY;

-- Users can view their own completions
CREATE POLICY "Users can view own completions"
ON public.card_completions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions"
ON public.card_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own completions (to undo)
CREATE POLICY "Users can delete own completions"
ON public.card_completions
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_card_completions_user_card ON public.card_completions(user_id, card_id);
CREATE INDEX idx_card_completions_user ON public.card_completions(user_id);
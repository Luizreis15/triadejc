-- Sincroniza a posição de leitura (scroll) entre aparelhos.
-- card_completions já cobre "concluído"; esta tabela cobre "onde exatamente parei".
CREATE TABLE public.reading_positions (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.module_cards(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  scroll_ratio NUMERIC NOT NULL CHECK (scroll_ratio >= 0 AND scroll_ratio <= 1),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, card_id)
);

ALTER TABLE public.reading_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading position"
ON public.reading_positions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own reading position"
ON public.reading_positions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading position"
ON public.reading_positions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- "Continue de onde parou" na Home: última leitura do usuário.
CREATE INDEX idx_reading_positions_user_updated
ON public.reading_positions(user_id, updated_at DESC);

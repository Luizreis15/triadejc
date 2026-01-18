-- Etapa 1: Adicionar campo section e atualizar constraint de type
ALTER TABLE public.module_cards 
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'reading';

-- Atualizar constraint para incluir novos tipos
ALTER TABLE public.module_cards DROP CONSTRAINT IF EXISTS module_cards_type_check;

ALTER TABLE public.module_cards ADD CONSTRAINT module_cards_type_check 
CHECK (type = ANY (ARRAY['video'::text, 'text'::text, 'model'::text, 'exercise'::text, 'download'::text, 'summary'::text, 'tip'::text, 'map'::text, 'reading'::text, 'selah'::text, 'activity'::text, 'intro'::text, 'closure'::text]));
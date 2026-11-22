-- O Caderno e as aulas gravam em notebook_entries com seções que a restrição
-- herdada do projeto antigo não aceitava (só promise, pillars, audience...).
-- Resultado: check-in, exercício, devocional e conclusão de aula voltavam 400.
-- A lista abaixo cobre o que a área de membros grava hoje.
ALTER TABLE public.notebook_entries
  DROP CONSTRAINT IF EXISTS notebook_entries_section_check;

ALTER TABLE public.notebook_entries
  ADD CONSTRAINT notebook_entries_section_check CHECK (
    section = ANY (ARRAY[
      'promise', 'pillars', 'audience', 'drafts', 'calendar', 'results', 'notes',
      'checkin', 'exercise', 'devotional', 'summary',
      'day_exercise', 'day_complete', 'reading_reflection'
    ])
  );

-- Uma reflexão por leitura e uma marcação por dia, mesmo com dois toques seguidos.
CREATE UNIQUE INDEX IF NOT EXISTS notebook_entries_day_unique
  ON public.notebook_entries (user_id, section, title)
  WHERE section IN ('day_exercise', 'day_complete');

CREATE UNIQUE INDEX IF NOT EXISTS notebook_entries_reading_reflection_unique
  ON public.notebook_entries (user_id, exercise_type)
  WHERE section = 'reading_reflection';

-- Textos do devocional gravados com "\n" escrito em vez da quebra de linha.
UPDATE public.devotional_days
SET reflection_md = replace(reflection_md, E'\\n', E'\n'),
    prayer_md = replace(prayer_md, E'\\n', E'\n')
WHERE reflection_md LIKE E'%\\\\n%' OR prayer_md LIKE E'%\\\\n%';

-- Aplicado à mão em produção em 2026-11-22 (SQL Editor), junto com os ajustes abaixo.

-- Erros de digitação do Respira, Alma.
UPDATE public.module_cards
SET content_md = replace(content_md, 'Você faz o tem que fazer.', 'Você faz o que tem que fazer.')
WHERE content_md LIKE '%Você faz o tem que fazer.%';

UPDATE public.module_cards
SET content_md = replace(content_md,
  'sustentar sua vida equilíbrio e discernimento',
  'sustentar sua vida com equilíbrio e discernimento')
WHERE content_md LIKE '%sustentar sua vida equilíbrio e discernimento%';

-- "Módulos dentro de módulo" viram temas; a abertura deixa de falar em 30 dias.
UPDATE public.modules
SET description = 'Oito temas, com três aulas cada, para ativar sua fé e identidade em Cristo.'
WHERE slug = 'confissoes-de-fe';

UPDATE public.modules
SET description = 'Sete temas, com três aulas cada, para firmar o passo com Jesus no centro.'
WHERE slug = 'caminhar-consciencia';

UPDATE public.module_cards
SET content_md = replace(content_md,
  'uma jornada de 30 dias de Confissões de Fé',
  'uma jornada de 24 aulas de Confissões de Fé')
WHERE content_md LIKE '%uma jornada de 30 dias de Confissões de Fé%';

-- Sumário do Respira, Alma sem o Capítulo 4, que não existe.
UPDATE public.module_cards
SET content_md = regexp_replace(content_md, '\*\*CAPÍTULO 4[^\n]*\n+[^\n]*\n+', ''),
    title = 'Sobre a autora e o que você vai encontrar'
WHERE title = 'Como aproveitar melhor sua jornada'
  AND content_md LIKE '%CAPÍTULO 4%';

-- Frase da autora deixa de parecer versículo.
UPDATE public.module_cards
SET content_md = regexp_replace(content_md,
  '📖 \*"(Comece a falar[^"]*)"\*\s*— Jordana Cantarelli',
  '**\1**')
WHERE title = 'Liberdade com Propósito'
  AND content_md LIKE '%— Jordana Cantarelli%';

-- Exercício 1 do Caderno com as mesmas perguntas da Atividade do Módulo.
UPDATE public.exercises
SET prompt_questions = jsonb_build_array(
  'Identificação: quais cadeias invisíveis você conseguiu identificar em sua vida?',
  'Origem: de onde você acredita que elas vieram? (Família, experiências, crenças?)',
  'Impacto: como essas cadeias afetam sua vida hoje?',
  'Intenção: o que você deseja fazer com essa consciência?'
)
WHERE module_slug = 'cadeias-invisiveis' AND order_index = 1;

-- Módulo com aulas não fica concluído só pelas leituras.
UPDATE public.progress
SET completed = false, completed_at = null
WHERE completed
  AND module_id IN (SELECT DISTINCT module_id FROM public.module_days);

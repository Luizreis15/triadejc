-- Remover constraint de tipo existente
ALTER TABLE module_cards DROP CONSTRAINT IF EXISTS module_cards_type_check;

-- Adicionar novos tipos permitidos
ALTER TABLE module_cards ADD CONSTRAINT module_cards_type_check 
CHECK (type IN ('video', 'text', 'model', 'exercise', 'download', 'summary', 'tip'));

-- Deletar cards antigos do Módulo 2
DELETE FROM module_cards 
WHERE module_id = 'e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2';

-- Atualizar título e descrição do módulo
UPDATE modules 
SET title = 'Dor, Desejo e Decisão',
    description = 'Você não precisa de "mais conteúdo". Precisa de direção.'
WHERE id = 'e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2';

-- Inserir novos cards estruturados
INSERT INTO module_cards (module_id, type, title, content_md, order_index, video_url, cta_url, cta_label)
VALUES 
  -- Card 1: Video (Aula)
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'video', 'Aula: Os 3 Pilares Editoriais', 
   'Você vai entender os 3 pilares editoriais e ver, na prática, como eles viram um carrossel completo com headline, corpo, prova e CTA.

**Duração sugerida:** ~4 min', 1, NULL, NULL, NULL),
  
  -- Card 2: Summary (Resumo)
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'summary', 'Resumo do Módulo', 
   '**Dor** = faz a pessoa se identificar e pensar "sou eu".
**Desejo** = mostra o cenário possível e cria vontade real.
**Decisão** = dá critério, próxima ação e tira a dúvida do "como".
Todo carrossel magnético responde: por que isso importa agora?
CTA não é "me chama": é o próximo passo lógico.', 2, NULL, NULL, NULL),

  -- Card 3: Tip (Pulo do Gato)
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'tip', 'Pulo do Gato', 
   'Carrossel não é sobre "o que você sabe". É sobre o que a pessoa conclui.', 3, NULL, NULL, NULL),
  
  -- Card 4: Modelo 1 - Verdade Dura (TOPO)
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'model', 'Verdade Dura da Confeitaria', 
   '**Objetivo:** Seguir
**Quando usar:** para atrair gente certa e filtrar curiosos.

**Card 1 (CAPA):**
Seu bolo não vende mais porque ele é "ruim".
Ele não vende porque parece comum.

**Card 2:**
No Instagram, você não vende só sabor.
Você vende percepção.

**Card 3:**
Percepção é o que faz alguém olhar e pensar:
"isso é profissional… eu compraria."

**Card 4:**
O erro: postar foto do bolo sem direção.
O acerto: mostrar critério.

**Card 5:**
Critério que muda tudo:
acabamento + altura + textura + corte + embalagem.

**Card 6:**
Quem ensina critério vira referência.
Quem só posta foto vira "mais uma".

**Card 7:**
Quer que eu poste mais carrosséis te ensinando a pensar como confeiteira profissional?
Segue aqui.

**Card 8 (FINAL):**
Se você quer ser escolhida, precisa ser percebida.
@samiragouvea.mkt', 4, NULL, NULL, NULL),
  
  -- Card 5: Modelo 2 - Checklist (MEIO)
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'model', 'Checklist do Bolo que Vende', 
   '**Objetivo:** Salvar
**Quando usar:** para virar referência e aumentar saves.

**Card 1 (CAPA):**
Checklist do bolo que vende (salva isso).

**Card 2:**
Antes de postar, responda:
isso parece caseiro ou premium?

**Card 3:**
Textura: cobertura lisa ou "marcada"?
(uma escolha muda tudo)

**Card 4:**
Altura: camadas proporcionais?
bolo baixo passa "simples".

**Card 5:**
Corte: ele mostra recheio de verdade?
sem corte, sem desejo.

**Card 6:**
Detalhe: acabamento e brilho = sinal de cuidado.

**Card 7:**
Embalagem e apresentação:
o premium começa antes da primeira garfada.

**Card 8 (FINAL):**
Quer que eu te mande um modelo de carrossel "antes/depois" pra valorizar seus bolos?
Comenta CHECKLIST.
@samiragouvea.mkt', 5, NULL, NULL, NULL),
  
  -- Card 6: Modelo 3 - Oferta (FUNDO)
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'model', 'Oferta com Prova + Decisão', 
   '**Objetivo:** DM ou compra
**Quando usar:** após educar e aquecer com conteúdo.

**Card 1 (CAPA):**
O que separa a confeiteira que vende todo dia da que vive de "encomenda pingada".

**Card 2:**
Não é talento.
É processo.

**Card 3:**
Processo de 3 etapas:
apresentação → percepção → pedido.

**Card 4:**
Apresentação: bolo impecável e corte estratégico.
Percepção: carrossel que ensina seu padrão.
Pedido: CTA direto.

**Card 5:**
Exemplo de CTA que vende:
"Quer o meu cardápio + valores? Me chama com a palavra BOLO."

**Card 6:**
Se você só posta foto, você concorre por preço.
Se você ensina critério, você vira escolha.

**Card 7:**
Se você quer aprender a construir isso com estrutura pronta…
eu te mostro o caminho.

**Card 8 (FINAL):**
Me chama no direct com CURSO que eu te explico como montar seu Instagram como vitrine.
@samiragouvea.mkt', 6, NULL, NULL, NULL),
  
  -- Card 7: Exercise
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'exercise', 'Exercício do Módulo 2', 
   '1. Escreva seu posicionamento em 1 linha: "Eu ajudo ____ a ____ sem ____."
2. Crie 1 carrossel de Dor (Topo), 1 de Desejo (Meio) e 1 de Decisão (Fundo).
3. Para cada um, defina 1 CTA: seguir / salvar / comentar / DM / comprar.', 7, NULL, NULL, NULL),

  -- Card 8: Text (Oficina - Caso Real)
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'text', 'Oficina: Caso Real (Confeiteira)', 
   'Persona exemplo: confeiteira que quer vender um curso de bolos.
Objetivo: construir autoridade + gerar seguidores qualificados + abrir caminho para compra.

Direção do posicionamento (1 linha):
"Eu ensino confeiteiras a vender mais bolos com técnica e apresentação — sem depender de sorte ou indicação."

Componentes do carrossel:
• Headline: a frase que captura a atenção (tensão + promessa).
• Corpo: 3–5 ideias em progressão (clareza, critério, exemplo).
• Prova: bastidor, comparação, resultado, opinião forte, argumento.
• Oferta: o que você quer que ela faça agora (salvar / seguir / DM / comprar).
• CTA: o comando final coerente com o objetivo.', 8, NULL, NULL, NULL),

  -- Card 9: Download (Base para Imagens)
  ('e38fc65d-61d8-4ce0-a14f-8ff6aa9df1d2', 'download', 'Base para Imagens (Padrão Samira)', 
   'Estrutura padrão para carrosséis:

• Card 1: foto forte (capa) + headline
• Cards 2–7: texto (clean) + 1 destaque em itálico/negrito
• Card 8: foto + assinatura + CTA
• Opcional: 1 card no meio com foto em transparência (10–20%)

Dica: imagem só na capa e no último card.', 9, NULL, NULL, NULL);
-- 1. Adicionar tipo "map" ao constraint (se existir)
ALTER TABLE module_cards DROP CONSTRAINT IF EXISTS module_cards_type_check;
ALTER TABLE module_cards ADD CONSTRAINT module_cards_type_check 
CHECK (type IN ('video', 'text', 'model', 'exercise', 'download', 'summary', 'tip', 'map'));

-- 2. Deletar cards antigos do Módulo 3
DELETE FROM module_cards WHERE module_id = '8147f07e-e1db-411b-a5f8-0ab98d735fb4';

-- 3. Atualizar metadados do módulo
UPDATE modules SET 
  title = 'A Anatomia do Carrossel Magnético',
  description = 'Estrutura base: capa, condução, critério, prova, CTA'
WHERE id = '8147f07e-e1db-411b-a5f8-0ab98d735fb4';

-- 4. Inserir 11 novos cards
INSERT INTO module_cards (module_id, type, title, content_md, order_index) VALUES

-- Card 1: Video
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'video', 'Aula: A Anatomia do Carrossel', 
'Neste módulo, você vai aprender a anatomia completa do carrossel de 8 cards.

Cada slide tem uma função específica: capa que captura, condução que prende, critério que muda percepção, e CTA que converte.

Duração: ~4 min', 1),

-- Card 2: Summary
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'summary', 'Resumo do Módulo', 
'• Anatomia dos 8 cards: cada slide tem uma função.
• Progressão: não é "conteúdo", é condução.
• O slide-chave: "novo critério" (o que muda percepção).
• Exemplo aplicado fixa mais do que teoria.
• CTA certo depende do objetivo (seguir / salvar / DM / vender).', 2),

-- Card 3: Tip
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'tip', 'Pulo do Gato', 
'Carrossel que vende não é o que "fala bonito". É o que conduz uma conclusão.', 3),

-- Card 4: Map (NOVO TIPO)
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'map', 'Mapa Rápido da Anatomia', 
'1. CAPA = promessa + tensão (headline)
2. POR QUE IMPORTA = dor real (contexto)
3. ERRO COMUM = o que elas fazem hoje
4. CONSEQUÊNCIA = o preço do erro
5. NOVO CRITÉRIO = como uma pessoa estratégica pensa
6. MÉTODO = passo simples (como fazer)
7. PROVA/EXEMPLO = aplicado na prática (mostra, não só fala)
8. CTA = 1 ação (clara e específica)', 4),

-- Card 5: Text (Oficina Prática)
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'text', 'Oficina Prática: Entendendo o Caso', 
'Para você absorver a anatomia na prática, vou te mostrar usando um exemplo real: uma **psicóloga** que quer atrair pacientes e vender sessões.

**O objetivo dela é triplo:**

1. **Construir autoridade** — se posicionar como referência em saúde mental no Instagram

2. **Atrair pacientes qualificados** — pessoas que valorizam terapia e estão prontas para investir

3. **Converter seguidores em sessões** — transformar engajamento em agendamentos

---

Nos próximos modelos, você vai ver exatamente como ela usaria carrosséis para cada etapa do funil: topo (seguir), meio (salvar) e fundo (vender).

Depois, é só adaptar pro seu nicho. Vamos lá?', 5),

-- Card 6: Model 1 - Verdade Dura da Terapia (Topo)
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'model', 'Verdade Dura da Terapia', 
'**Objetivo:** Seguir
**Quando usar:** Atrair gente certa e filtrar curiosos.

---

**Card 1 (CAPA — com foto da psicóloga):**
Você não precisa de "mais força de vontade".
Você precisa de clareza emocional.

**Card 2:**
No Instagram, você não vende terapia.
Você vende segurança.

**Card 3:**
Segurança é o que faz alguém pensar:
"essa profissional sabe o que está fazendo."

**Card 4:**
O erro: postar frases soltas e genéricas.
O acerto: ensinar como a mente funciona.

**Card 5 (opcional com imagem em transparência 10–15%):**
Critério que muda percepção:
sintoma ≠ causa.

**Card 6:**
Quem explica a causa vira referência.
Quem só "motiva" vira mais uma.

**Card 7:**
Escolha 1 sintoma por post.
Mostre 1 causa provável.
Dê 1 passo prático.

**Card 8 (FINAL — com foto da psicóloga + assinatura):**
Quer que eu poste mais carrosséis pra você entender sua mente com clareza?
Segue aqui.
@samiragouvea.mkt

---

**Placeholders de imagem:**
• Card 1: Foto da psicóloga (retrato profissional, fundo clean)
• Card 8: Foto da psicóloga (retrato, variação)
• Card 5 (opcional): imagem suave em transparência (consultório/rostos desfocados)', 6),

-- Card 7: Model 2 - Checklist de Regulação Emocional (Meio)
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'model', 'Checklist de Regulação Emocional', 
'**Objetivo:** Salvar + DM
**Quando usar:** Educar com profundidade e gerar conversa no direct.

---

**Card 1 (CAPA — com foto da psicóloga):**
Salva isso: autocuidado que realmente regula sua ansiedade.

**Card 2:**
Se você só tenta "se distrair", a ansiedade volta mais forte.

**Card 3:**
Erro clássico: confundir alívio com regulação.

**Card 4:**
Alívio = apagar o desconforto.
Regulação = ensinar seu corpo a voltar pro eixo.

**Card 5 (opcional com imagem em transparência 10–15%):**
Regulação em 3 passos:
corpo → respiração → pensamento.

**Card 6:**
Corpo: 10 min de caminhada.
Respiração: 4–6 por 2 min.
Pensamento: "o que é fato vs o que é medo?"

**Card 7:**
Quando você aprende regulação, você não "some".
Você volta pra si.

**Card 8 (FINAL — com foto + CTA DM):**
Quer um carrossel pronto pra aplicar isso no seu dia?
Me chama no direct com a palavra REGULAR.
@samiragouvea.mkt

---

**Placeholders de imagem:**
• Card 1: Foto da psicóloga (meio corpo, estética clean)
• Card 8: Foto da psicóloga (retrato, variação)
• Card 5 (opcional): imagem leve em transparência (caderno/linha suave)', 7),

-- Card 8: Model 3 - Do Conteúdo à Sessão (Fundo)
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'model', 'Do Conteúdo à Sessão', 
'**Objetivo:** Venda (DM)
**Quando usar:** Quando você já educou e quer transformar em agendamento.

---

**Card 1 (CAPA — com foto da psicóloga):**
O que separa a psicóloga com agenda cheia da que vive de indicação.

**Card 2:**
Não é "postar mais".
É conduzir melhor.

**Card 3:**
Processo de 3 etapas:
clareza → confiança → pedido.

**Card 4:**
Clareza: carrossel que explica o que você sente.
Confiança: você entende que tem caminho.
Pedido: CTA de agendamento.

**Card 5 (opcional com imagem em transparência 10–15%):**
Exemplo de CTA que vende:
"Quer entender seu padrão e organizar um plano?
Me chama com a palavra SESSÃO."

**Card 6:**
Quando você só posta frase, você vira "inspiração".
Quando você ensina critério, você vira escolha.

**Card 7:**
Se você quer aprender a construir isso com estrutura pronta…
eu te mostro o caminho.

**Card 8 (FINAL — com foto + CTA final):**
Me chama no direct com CURSO que eu te explico como montar seu Instagram como vitrine.
@samiragouvea.mkt

---

**Placeholders de imagem:**
• Card 1: Foto da psicóloga (forte, autoridade)
• Card 8: Foto da psicóloga (retrato, variação)
• Card 5 (opcional): imagem leve em transparência (agenda/consulta)', 8),

-- Card 9: Exercise
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'exercise', 'Exercício: Anatomia em 5 Linhas', 
'Escolha um tema do seu nicho e escreva:

• **Capa** (promessa + tensão)
• **Dor** (por que importa)
• **Erro** (o que fazem hoje)
• **Novo critério** (como pensar)
• **CTA** (1 ação)', 9),

-- Card 10: Download
('8147f07e-e1db-411b-a5f8-0ab98d735fb4', 'download', 'Templates do Módulo', 
'**Checklist de Anatomia (PDF)** — [LINK]

**Template Canva "Anatomia 8 cards"** — [LINK]

**Banco de CTAs por objetivo (seguir / salvar / DM / vender)** — [LINK]', 10);
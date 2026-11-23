-- BLOCO 5 — Jornada Única: capítulos completos, ordem dos módulos, Planner, abertura do Caminhar.
-- Pode rodar mais de uma vez. Guarda uma cópia dos textos atuais antes de trocar.
begin;

-- Cópia de segurança dos textos de hoje (fechada para a API: RLS ligado, sem política).
create table if not exists public._backup_module_cards_20261122 as select * from public.module_cards;
alter table public._backup_module_cards_20261122 enable row level security;

-- Coluna do versículo por extenso (NVI). Fica vazia até o Bloco 6.
alter table public.module_days add column if not exists verse_text text;

-- CADEIAS INVISÍVEIS: cada leitura passa a ter o capítulo completo, com um título só.
update public.module_cards c
set title = $jc$Capítulo 1 — As Feridas Silenciosas que Gritam em Silêncio$jc$, section = 'reading', content_md = $jc$## Quantas dores carregamos e nem sequer percebemos?

Quantas marcas deixadas na infância, na adolescência, em relacionamentos ou situações de rejeição continuam ecoando silenciosamente dentro de nós?

Essas feridas, muitas vezes invisíveis aos olhos do mundo, moldam a maneira como nos vemos, como nos relacionamos e como construímos (ou deixamos de construir) nossos sonhos.

Às vezes, são palavras que ouvimos quando éramos crianças.

Outras vezes, são olhares de desaprovação, abandonos sutis, rejeições silenciosas.

Ou até em contextos de abuso emocional, onde, sem precisar de palavras, fomos condicionadas a nos sentir sem valor.

Essas feridas não desaparecem sozinhas.

Elas se tornam como raízes ocultas, que infiltram o coração e geram frutos amargos: medo, insegurança, autojulgamento, sabotagem emocional.

Reconhecer é o primeiro passo para iniciar a cura e viver a transformação.

A maior armadilha dessas feridas silenciosas é justamente sua invisibilidade.

Elas moldam quem nos tornamos — sem que saibamos que estamos feridas.

Por isso, o primeiro passo para a verdadeira cura e transformação começa quando você olha para Deus e permite, com coragem, olhar para dentro de si mesma.

Pergunte a si mesma:

- Quais marcas da minha história ainda pesam em minha identidade?
- Em que momentos da vida me senti rejeitada, abandonada ou humilhada?
- Que vozes internas me dizem que não sou suficiente, capaz ou digna?

Não é para se culpar.

Não é para reviver dores sem propósito.

É para trazer à luz aquilo que precisa ser tratado.

Aquilo que precisa ser finalmente cuidado com amor, verdade e consciência.

A verdadeira cura e transformação é um processo consciente.

Assim como uma ferida física precisa ser limpa antes de cicatrizar, as feridas da alma precisam ser reconhecidas antes de serem restauradas.

Não há transformação sem verdade.

Não há liberdade sem responsabilidade.

A boa notícia é que, ao trazer essas feridas à consciência, você inicia o processo mais bonito da vida: o de reconstruir a mulher que você nasceu para ser.

Uma mulher livre.

Forte.

Segura de sua identidade no Senhor.

## Reflexão para a jornada

Tire alguns minutos agora para refletir e escrever em seu diário:

- Quais experiências da minha história deixaram marcas que ainda influenciam quem eu sou hoje?
- Como essas feridas silenciosas impactam minhas decisões, relacionamentos e visão de futuro?

Não filtre. Não julgue. Apenas permita-se enxergar.

O que é visto com consciência pode ser curado com amor e direção.

> “Ele cura os de coração quebrantado e cuida das suas feridas.”
> — Salmo 147:3$jc$
from public.modules m
where m.id = c.module_id and m.slug = 'cadeias-invisiveis' and c.order_index = 1;

update public.module_cards c
set title = $jc$Capítulo 2 — As Crenças que Aprisionam sua Vida$jc$, section = 'reading', content_md = $jc$Quantas vezes você já se pegou dizendo:

“Eu não sou boa o suficiente.”

“Eu sempre dou errado.”

“Eu nunca vou ser feliz de verdade.”

“Isso é só pra quem tem sorte.”

“Eu nasci assim... e vai ser sempre assim.”

Essas frases, aparentemente inofensivas, são sementes lançadas ao longo da sua história.

E aquilo que você ouviu, viu e sentiu repetidamente na infância — ou por um forte impacto emocional — se transformou em crenças.

Crenças que moldam o que você sente, como você pensa e os resultados que você vive hoje.

## A prisão silenciosa das crenças limitantes

As crenças são como óculos invisíveis:

Você passa a ver tudo através delas.

Mesmo quando Deus fala que você é capaz, você se sente insuficiente.

Mesmo quando oportunidades surgem, você sabota.

Mesmo quando a vida te convida a crescer, algo dentro de você te paralisa.

Mas hoje, você está aqui para viver algo novo.

Hoje, você pode construir novas crenças — fortalecedoras, poderosas e extraordinárias — fundamentadas em Cristo e na palavra dEle.

## O que forma uma crença?

- Repetição (o que você ouviu, viu e sentiu muitas vezes)
- Emoção intensa (traumas, rejeição, abandono, humilhação)
- Pessoas de referência (o que pais, professores, líderes disseram sobre você)
- Palavras que feriram, que definiram — e que ficaram marcadas.

Mas você não precisa mais viver aprisionada por aquilo que disseram ou fizeram com você.

Você pode romper os ciclos.

Você pode construir uma nova identidade.

Você pode renovar sua mente pela palavra de Deus e se posicionar em fé.

## Comece a construir a sua nova história

Mude a semente que você lança, e você mudará o resultado da sua vida.

Construa sua vida fundamentada em Cristo Jesus, nos valores do céu, e você viverá a realidade do céu aqui na Terra.

Deus te chamou para viver uma vida saudável, valiosa e frutífera.

Uma mente livre.

Um coração curado, transformado e restaurado.

Um novo padrão espiritual e emocional.

## Reflexão para a jornada

Tire alguns minutos agora para refletir e escrever:

- Quais frases sobre mim ainda repito, mas não condizem com a minha verdadeira identidade em Cristo?
- Que mentiras eu aceitei como verdades sobre mim mesma?
- O que preciso começar a declarar com fé, e como preciso me posicionar para mudar meu padrão de vida?

> “Não vos conformeis com este mundo, mas transformai-vos pela renovação da vossa mente.”
> — Romanos 12:2

Se posicione em fé.

Fale a linguagem do céu.

E comece a viver os frutos de uma vida curada, livre e fundamentada em Cristo Jesus e na Sua Palavra.$jc$
from public.modules m
where m.id = c.module_id and m.slug = 'cadeias-invisiveis' and c.order_index = 2;

update public.module_cards c
set title = $jc$Capítulo 3 — A Decisão pela Cura e pela Transformação$jc$, section = 'reading', content_md = $jc$Nenhuma transformação começa sem uma decisão.

A mudança não acontece só porque você quer.

Ela acontece quando você escolhe se mover.

A dor que você sente hoje talvez já tenha virado companhia.

Você se acostumou com ela.

Você aprendeu a conviver com o que te paralisa.

Mas o fato de doer menos não significa que está curado.

Deus não te chamou para sobreviver nessa vida.

Ele te chamou para viver uma vida abundante com saúde, plenitude e propósito.

E isso exige uma decisão consciente.

## A escolha que muda tudo

Muitas mulheres seguem paralisadas porque esperam que algo externo mude, sem entender que a verdadeira virada começa com um sim interno.

Dizer “sim” para a cura e transformação é:

- Parar de colocar a responsabilidade no outro
- Assumir que com Deus você pode reescrever sua história
- Deixar de lado as dores e o sofrimento e se posicionar em fé
- Decidir parar de sangrar por feridas que já deveriam ter cicatrizado

Você não precisa continuar carregando o que já deveria ter sido entregue.

Você não é prisioneira da sua dor.

Você é responsável pelo que faz com ela a partir de agora.

## Posicionamento em fé e consciência

Há momentos em que tudo que você precisa é orar e esperar.

Mas em muitas situações, Deus te chama a decidir e agir com coragem e fé.

Toda mudança verdadeira acontece quando pensamento, sentimento e atitude se alinham.

E quando você decide, o céu se move com você.

**É possível viver o sobrenatural de Deus. Ver milagres, sinais e maravilhas quando nos posicionamos em fé.**

Se posicione em fé.

Declare cura.

Aja como quem já crê.

## Não romantize a dor

Você não precisa ser forte o tempo todo.

Mas também não precisa se esconder atrás de uma história de dor como se isso fosse sua identidade.

Sua história pode ter tido capítulos difíceis, mas ela não terminou ainda.

Você pode começar um novo ciclo — com consciência, fé prática e fundamentos cristãos.

## Reflexão para a jornada

- O que eu ganho mantendo essa dor ativa na minha vida?
- Quais desculpas eu conto para não mudar o que precisa ser mudado?
- O que eu preciso decidir hoje para que a cura comece?

> “Vinde a mim, todos os que estais cansados e sobrecarregados…”
> — Mateus 11:28

Você já sabe que precisa mudar.

Agora é hora de decidir viver diferente.$jc$
from public.modules m
where m.id = c.module_id and m.slug = 'cadeias-invisiveis' and c.order_index = 3;

update public.module_cards c
set title = $jc$Capítulo 4 — Reconstruindo sua Verdadeira Identidade$jc$, section = 'reading', content_md = $jc$Toda mulher que quer viver uma nova história precisa reconstruir a forma como se enxerga.

Não adianta curar feridas se você continua acreditando nas mesmas mentiras.

A sua identidade em Cristo e a fé na Sua Palavra são a base de tudo.

E enquanto ela estiver fundamentada em rejeições, traumas e comparações…

Você vai continuar vivendo abaixo do que Deus preparou.

## Quem te disse quem você é?

Muitas das suas lutas de hoje não vêm do presente.

Vêm da imagem distorcida que você construiu sobre si mesma ao longo da vida.

Alguém te chamou de burra.

Alguém te disse que você não era bonita.

Alguém te ignorou quando você só queria atenção.

Alguém te comparou. Te invalidou. Te silenciou.

E sem perceber, você construiu uma identidade fraturada.

Mas hoje, você tem a oportunidade de reconstruir essa imagem.

Com verdade.

Com consciência.

E principalmente, com base na Palavra de Deus.

## Fundamente sua identidade em Cristo

A sua verdadeira identidade não está no que disseram de você.

Ela está no que Deus declarou sobre você.

Você é amada.

Você é perdoada.

Você é capacitada.

Você é filha.

**Construa uma nova vida fundamentada em Cristo Jesus e na palavra da fé.**

Chegou a hora de sair da versão limitada de si mesma, e abraçar sua melhor versão em Cristo Jesus.

## O poder da reprogramação emocional

A mudança de vida não acontece só com oração. A oração é o primeiro passo, pois a verdadeira transformação ocorre com prática, consciência e posicionamento de fé.

Você precisa substituir as mentiras por verdades.

Meditar, Declarar e Praticar a Palavra de Deus.

A verdadeira identidade se firma quando você vive de acordo com aquilo que acredita.

E agora, você vai começar a acreditar na verdade.

## Exercício de reconstrução da identidade em Cristo

Tire um tempo agora para escrever três frases proféticas poderosas que sustentam sua nova identidade no Senhor. Essas declarações são sementes de fé que alinham sua mente à verdade da Palavra de Deus.

Exemplos:

Eu sou uma filha amada de Deus.

Eu sou curada e livre.

Eu sou cheia do Espírito Santo.

Eu tenho saúde em todo o meu corpo.

Eu sou abençoada em todas as áreas da minha vida.

Repita isso todos os dias.

Declare, Profetize e creia no agir do Senhor.

Se posicione em fé.

Enquanto você declara, o sobrenatural se manifesta e a Palavra cria raízes no seu coração.

> “A vida e a morte estão no poder da língua; o que bem a utiliza come do seu fruto.”
> — Provérbios 18:21

Mude o que você fala sobre si mesma.

Mude o que você pensa sobre si mesma.

E você será transformada na mulher que nasceu para ser.$jc$
from public.modules m
where m.id = c.module_id and m.slug = 'cadeias-invisiveis' and c.order_index = 4;

update public.module_cards c
set title = $jc$Capítulo 5 — Construindo uma Vida Curada e Livre$jc$, section = 'reading', content_md = $jc$A verdadeira liberdade não é um evento.

É uma construção diária.

É o resultado de decisões conscientes que você toma mesmo quando sente medo.

É quando você escolhe não voltar atrás, mesmo quando tudo dentro de você pede pra desistir.

Ser livre não é viver sem dor.

É saber o que fazer com as dores da vida.

É ser maior que os sentimentos.

É administrar bem os pensamentos — e não ser dominada por eles.

## Liberdade exige fundamento

Você não constrói uma vida frutífera e transformada com base em emoção.

Você constrói com fundamento.

**Construa sua vida no Senhor e na palavra dEle.**

Agora que você está rompendo cadeias, reconhecendo padrões, curando raízes e reconstruindo a sua identidade... é hora de sustentar tudo isso.

E isso se faz com:

- Hábitos
- Prática
- Intencionalidade
- Declaração de fé
- Ações consistentes, dia após dia

## Mude o ambiente, a semente e o solo

Se você quer manter sua liberdade, cuide do que te cerca.

- Ambiente: quem está perto de você reforça suas decisões?
- Semente: o que você tem plantado nos seus pensamentos e palavras?
- Solo: como está seu coração? Ele ainda está aberto para continuar aprendendo e crescendo?

Uma vida curada não é mágica.

É fruto.

É consequência.

É o posicionamento de fé em Cristo Jesus.

E os frutos só nascem de sementes intencionais.

## Comece com pequenas decisões

- Estabeleça uma rotina saudável: tempo com Deus, tempo consigo mesma, tempo de silêncio.
- Reforce suas declarações diariamente: quem você é em Cristo, e o que você pode Nele.
- Reavalie suas atitudes e comportamentos: suas ações precisam apontar para a sua melhor versão em Cristo Jesus.

Você não precisa fazer tudo de uma vez.

Mas você precisa começar.

## Reflexão para a jornada

- O que preciso manter para preservar minha liberdade?
- Que hábitos preciso abandonar para não voltar às velhas prisões?
- Como posso sustentar minha nova identidade todos os dias?

> “Se o Filho vos libertar, verdadeiramente sereis livres.”
> — João 8:36

Se você tem o Senhor Jesus em sua vida, saiba: você já é livre Nele. Agora, só precisa se posicionar em fé e praticar os ensinamentos do Senhor por meio de suas palavras, atitudes e comportamentos.

Tome posse de tudo aquilo que o próprio Deus conquistou na cruz por você.

Acesse, tome posse e caminhe na direção do Senhor e da sua Palavra.

Agora é hora de viver como uma mulher livre, fundamentada em Cristo, guiada pelo Espírito Santo, e decidida a viver sua melhor versão.

Nunca se esqueça que suas batalhas são vencidas não na força do seu braço, mas no poder de Deus que opera em você.

Vamos! Você consegue! O Senhor está com você!

Viva um dia de cada vez! Viva as realidades do céu aqui na terra!$jc$
from public.modules m
where m.id = c.module_id and m.slug = 'cadeias-invisiveis' and c.order_index = 5;

update public.module_cards c
set title = $jc$Momento Selá — Reflexão e Integração$jc$, section = 'selah', content_md = $jc$Até aqui, você enfrentou muitas verdades.

Trouxe à luz dores ocultas.

Confrontou crenças que te aprisionavam.

E começou a reconstruir, com consciência e fé, a mulher que Deus te chamou para ser.

Agora é hora de respirar.

De pausar.

De honrar o que você já conquistou.

## Selá: uma pausa com propósito

Na Bíblia, a palavra Selá aparece nos Salmos como um convite à pausa.

Não uma pausa qualquer, mas uma pausa para refletir, absorver e integrar.

Você não está apenas lendo.

Você está se transformando.

E toda transformação exige espaço.

Esse é o momento de olhar para dentro e perceber:

- O que Deus já fez em você?
- O que foi revelado que você não via antes?
- Quais decisões internas você já tomou?

## Celebre a mulher que está emergindo

Você não é mais a mesma de quando começou esta jornada.

Mesmo que os passos pareçam pequenos, cada verdade reconhecida, cada lágrima derramada, cada pensamento ressignificado... é vitória.

Você está se posicionando.

Você está se curando.

Você está sendo reconstruída.

E isso precisa ser reconhecido.

## Silencie para ouvir a voz certa

Desligue o barulho externo.

Feche os olhos por alguns minutos.

Ore, respire, escreva… ou simplesmente fique em silêncio no Senhor.

Esse momento é entre você e o Espírito Santo.

## Prática Selá

Pegue seu diário e escreva:

1. O que mais me confrontou nesta jornada até aqui?

2. O que Deus me mostrou sobre mim mesma?

3. O que eu já consegui liberar, curar ou transformar?

4. Como quero seguir a partir daqui?

> “Aquietai-vos, e sabei que Eu sou Deus.”
> — Salmos 46:10

## Seu Planner da Presença

Para acompanhar esta pausa e os próximos dias, preparamos o Planner da Presença: 30 páginas para você registrar como está, o que leu e o que Deus tem feito em você.

[Abrir o Planner da Presença (PDF)](https://spxxlspesoybioowvjmb.supabase.co/storage/v1/object/public/pdfs/jornada-unica/planner-da-presenca-30-dias.pdf)$jc$
from public.modules m
where m.id = c.module_id and m.slug = 'cadeias-invisiveis' and c.order_index = 6;

update public.module_cards c
set title = $jc$Capítulo Extra — Liberdade com Propósito$jc$, section = 'reading', content_md = $jc$Você chegou até aqui.

Você venceu etapas que nem imaginava que ainda existiam dentro de você.

Você se abriu para curar, confrontar, reconstruir e planejar uma nova vida.

Você está avançando, rompendo e crescendo em todos os sentidos.

Agora, quero te lembrar de algo muito importante:

A sua liberdade tem um propósito.

Deus não te libertou só pra te ver bem.

Ele te libertou porque há um plano sobre a sua vida.

Um chamado.

Uma voz.

Uma influência que só você carrega.

## Você é resposta de oração de alguém

Você já parou pra pensar que enquanto você vivia seus processos internos, alguém estava orando por direção… por consolo… por um exemplo?

E agora, você pode ser isso para ela.

Você pode ser a mulher que carrega verdade, luz e coragem — porque decidiu se curar.

**Você pode construir uma nova história fundamentada em Cristo Jesus.**

Você pode construir.

E agora, você também pode inspirar.

## Viva a sua melhor versão em Cristo

A melhor versão da sua vida não é a que finge força, mas a que carrega verdade.

A que conhece a dor — mas escolhe andar em fé.

A que tem cicatrizes — mas não se define por elas.

A sua verdadeira identidade é de uma mulher curada.

Fortalecida.

Consciente.

E fundamentada na Palavra de Deus.

Você pode ser feliz em Cristo Jesus.

Você pode ser próspera emocionalmente, espiritualmente e nas suas decisões.

E mais do que isso:

Você pode ser instrumento de cura para outras mulheres que ainda estão em suas prisões invisíveis.

## Que o seu testemunho fale por você

Não viva mais no raso.

Não se esconda atrás de desculpas.

Você já viu demais, viveu demais, venceu demais pra voltar.

Declare isso todos os dias:

“Eu sou livre.

Eu sou curada.

E eu sou uma mulher cheia do Espírito Santo.”

## Sua caminhada não termina aqui

Esse capítulo não é um ponto final.

É uma vírgula.

Porque agora que você está livre, é hora de se fortalecer.

De blindar sua mente com a verdade.

De falar a linguagem do céu.

De declarar confissões de fé que sustentam tudo que você reconstruiu.

Por isso, quero te convidar para continuar essa jornada comigo.

A próxima etapa vai te levar para um novo nível de consciência.

Vamos aprofundar juntas as declarações que firmam sua nova identidade.

E você vai aprender a sustentar sua liberdade, com verdades práticas, declarações de fé diárias e fundamentos eternos.

**Comece a falar a linguagem do céu… e você viverá a realidade do céu aqui na Terra.**

Você foi chamada para florescer.

Para inspirar.

Para viver o sobrenatural de Deus.$jc$
from public.modules m
where m.id = c.module_id and m.slug = 'cadeias-invisiveis' and c.order_index = 7;

-- A Introdução entra como "Começar por aqui".
insert into public.module_cards (module_id, title, type, section, order_index, content_md)
select m.id, $jc$Introdução — Jornada para romper as correntes que aprisionam sua vida$jc$, 'reading', 'intro', 0, $jc$Quantas marcas invisíveis carregamos dentro de nós?

Quantas dores se escondem atrás de sorrisos?

Quantos sonhos enterramos sem perceber, por causa de feridas emocionais que nunca foram tratadas?

A vida muitas vezes nos marca de formas que não conseguimos enxergar de imediato: palavras ditas na infância, rejeições silenciosas, padrões emocionais herdados, crenças limitantes que se enraizaram em nossa mente e moldaram nossos caminhos.

Mas há uma verdade que precisa ser trazida à luz: **você não nasceu para viver aprisionada às dores do passado.**

Assim como as feridas emocionais foram criadas ao longo do tempo, a cura e a transformação também é um processo que precisa ser construído com consciência, coragem, direção e humildade.

Nesta jornada, você será conduzida a enxergar as correntes invisíveis que ainda te impedem de viver com plenitude.

Vamos juntas identificar as raízes que paralisaram seus sonhos, confrontar as mentiras que minaram a sua autoestima e reconstruir, passo a passo, a mulher livre e forte que Deus sonhou quando pensou em você.

Não existe cura sem consciência.

Não existe liberdade verdadeira sem responsabilidade.

E é por isso que essa jornada é um convite para assumir o protagonismo da sua transformação.

A Palavra nos ensina:

> “Conhecereis a verdade, e a verdade vos libertará.”
> — João 8:32

E é exatamente isso que você encontrará aqui:

Verdades que libertam.

Princípios que curam.

Ferramentas que fortalecem a sua identidade.

A fé em Cristo será o seu fundamento.

A consciência será o seu caminho e força.

E a transformação será o seu destino.

Seja bem-vinda à sua jornada de cura e transformação.

Seja bem-vinda aos melhores dias da sua vida até então.

## Sobre a autora

Jordana Cantarelli é Psicanalista, Terapeuta Cristã e Pastora.

Com mais de 10 anos de experiência em desenvolvimento humano, ela já ajudou diversas mulheres a romperem ciclos emocionais, ressignificarem traumas e reconstruírem sua identidade com base na Palavra de Deus.

Seu propósito é claro: ajudar mulheres a construírem uma vida saudável, valiosa e frutífera — fundamentada em Cristo Jesus.

Todo o seu trabalho é voltado para a inteligência emocional com base cristã, trazendo ferramentas práticas para sustentar uma vida com propósito, significado e sentido.

Ela acredita que é possível viver o extraordinário todos os dias quando decidimos alinhar pensamentos, sentimentos e atitudes à verdade de Deus.

## O que você vai encontrar

**Capítulo 1 — As Feridas Silenciosas que Gritam em Silêncio**

Você será conduzida a reconhecer as marcas invisíveis que a vida deixou — feridas emocionais que precisam ser vistas para serem curadas.

**Capítulo 2 — As Crenças que Aprisionam sua Vida**

Identificação dos padrões emocionais e crenças limitantes que têm sabotado sua caminhada e sua identidade.

**Capítulo 3 — A Decisão pela Cura e pela Transformação**

O chamado para assumir o protagonismo do seu processo de cura — entender que a transformação exige decisão e movimento.

**Capítulo 4 — Reconstruindo sua Verdadeira Identidade**

Ferramentas práticas para restaurar a autoestima e viver sua verdadeira identidade em Cristo e na Palavra da fé.

**Capítulo 5 — Construindo uma Vida Curada e Livre**

Planejamento consciente para uma vida frutífera e transformadora, com práticas e hábitos que sustentam sua liberdade interior.

**Momento Selá — Reflexão e Integração**

Uma pausa intencional para revisar sua jornada até aqui, celebrar suas conquistas internas e integrar as transformações.

**Capítulo Extra — Liberdade com Propósito**

Encerramento e convite para seguir fortalecendo sua caminhada com as Confissões de Fé.$jc$
from public.modules m
where m.slug = 'cadeias-invisiveis'
  and not exists (select 1 from public.module_cards c where c.module_id = m.id and c.order_index = 0);

-- CAMINHAR COM CONSCIÊNCIA: texto de abertura.
insert into public.module_cards (module_id, title, type, section, order_index, content_md)
select m.id, 'Comece por aqui', 'reading', 'intro', 0, $jc$Você chegou ao último módulo da Jornada Única.

Em Cadeias Invisíveis, você olhou para dentro.

Em Confissões de Fé, você declarou quem você é.

Em Respira, Alma, você aprendeu a parar e respirar.

Agora é hora de caminhar.

Não com pressa.

Não para provar nada a ninguém.

Mas com Jesus no centro de cada dia.

## Como este módulo funciona

São sete temas, com três aulas cada: **Centro, Passo, Permanecer, Propósito, Casa, Firmeza e Envio**.

Cada aula traz uma Palavra, um texto curto, uma declaração para você dizer em voz alta e uma pergunta para responder por escrito.

As aulas abrem uma de cada vez. A seguinte é liberada quando você conclui a anterior.

## O ritmo que eu te sugiro

Uma aula por dia.

Leia devagar.

Declare.

Escreva.

E leve aquela Palavra para o dia comum: a casa, o trabalho, a conversa difícil.

Em três semanas você terá percorrido os sete temas.

Se precisar de mais tempo, tudo bem. Caminhar com consciência não é chegar primeiro.

É não andar sozinha.

Vamos juntas.$jc$
from public.modules m
where m.slug = 'caminhar-consciencia'
  and not exists (select 1 from public.module_cards c where c.module_id = m.id and c.section = 'intro');

-- ORDEM DOS MÓDULOS: a Carta da Autora do Respira, Alma passa a apontar para o Caminhar com Consciência.
update public.module_cards c
set content_md = replace(replace(c.content_md,
  'te ajudar a fortalecer seu coração através das declarações de Fé profundas e intencionais.',
  'te ajudar a firmar o passo, com Jesus no centro de cada dia.'),
  'Se chama Confissões de Fé.',
  'Se chama Caminhar com Consciência.')
from public.modules m
where m.id = c.module_id and m.slug = 'respira-alma' and c.title = 'Carta da Autora'
  and c.content_md like '%Se chama Confissões de Fé.%'
  and c.content_md like '%através das declarações de Fé profundas e intencionais.%';

-- PLANNER: o Momento Selá do Respira, Alma ganha o botão para abrir o arquivo.
update public.module_cards c
set content_md = replace(c.content_md,
  'Agora é o momento perfeito para abrir seu Planner Presença.',
  $jc$Agora é o momento perfeito para abrir seu Planner da Presença.

[Abrir o Planner da Presença (PDF)](https://spxxlspesoybioowvjmb.supabase.co/storage/v1/object/public/pdfs/jornada-unica/planner-da-presenca-30-dias.pdf)$jc$)
from public.modules m
where m.id = c.module_id and m.slug = 'respira-alma' and c.section = 'selah'
  and c.content_md like '%Agora é o momento perfeito para abrir seu Planner Presença.%';

update public.module_cards
set content_md = replace(content_md, 'Aqui você também recebe seu Planner Presença.', 'Aqui você também recebe seu Planner da Presença.')
where content_md like '%Aqui você também recebe seu Planner Presença.%';

-- BIBLIOTECA: títulos iguais aos das leituras; o item que se chamava Planner era o texto do Selá.
update public.module_pdfs set title = 'Capítulo 1 — As Feridas Silenciosas que Gritam em Silêncio'
where title = 'Capítulo 1 — As Correntes que Ninguém Vê';
update public.module_pdfs set title = 'Capítulo 3 — A Decisão pela Cura e pela Transformação'
where title = 'Capítulo 3 — A Decisão pela Cura Emocional';
update public.module_pdfs set title = 'Momento Selá — Reflexão e Integração'
where title = 'Planner da Presença — Momento Selá';

insert into public.module_pdfs (module_id, title, file_url, order_index)
select m.id, 'Planner da Presença — 30 dias', 'https://spxxlspesoybioowvjmb.supabase.co/storage/v1/object/public/pdfs/jornada-unica/planner-da-presenca-30-dias.pdf', 20
from public.modules m
where m.slug = 'cadeias-invisiveis'
  and not exists (select 1 from public.module_pdfs p where p.file_url = 'https://spxxlspesoybioowvjmb.supabase.co/storage/v1/object/public/pdfs/jornada-unica/planner-da-presenca-30-dias.pdf');

commit;


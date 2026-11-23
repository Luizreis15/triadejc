# Checkpoint Jornada Única — 2026-11-22

Área de membros corrigida a partir do relatório de revisão da Ana Piccardo (teste de 19/11/2026). Os sete erros críticos estão resolvidos e conferidos em produção. O WhatsApp de acesso está desconectado.

## O que funciona

- Site: https://www.jordanacantarelli.com.br
- Supabase: `spxxlspesoybioowvjmb`
- Caderno grava exercício, devocional, check-in, respostas de aula e reflexão de leitura
- Aulas de Confissões de Fé e Caminhar abrem na ordem do currículo, também pelo link direto
- Progresso conta leituras e aulas juntas: Cadeias 10 etapas, Confissões 25, Respira 8, Caminhar 22
- Cadeias Invisíveis tem os capítulos completos dentro das leituras, com um título só
- Toda leitura tem campo de resposta. As perguntas do texto viram campos
- Planner da Presença (39 páginas) abre pelo Momento Selá e pela Biblioteca
- Caminhar com Consciência tem texto de abertura
- Suporte abre o WhatsApp (11) 2866-7666
- Ordem oficial dos módulos: Cadeias Invisíveis, Confissões de Fé, Respira Alma, Caminhar com Consciência

## O que não funciona

- **Uazapi desconectado.** Em 22/11 "Testar conexão" respondeu desconectado e o envio de teste foi recusado. Servidor `flowdent.uazapi.com` no ar; o problema é a instância ou o token
- Há um envio de acesso parado na fila desde 19/11/2026 11:55. Depois de reconectar ele não sai sozinho: o cron só drena e-mail

## Banco

- Não há acesso ao projeto pelo MCP nem pela CLI desta máquina. O SQL é rodado à mão pelo Luiz no SQL Editor
- Aplicado à mão em 22/11: `20261122120000_notebook_sections_area_membros.sql` e `20261122200000_conteudo_completo_planner_versiculos.sql`
- `_backup_module_cards_20261122` guarda os textos dos cards de antes da troca. RLS ligado, sem política
- `module_days.verse_text` existe e está vazia
- `20261102140000_reading_positions.sql` continua sem confirmação de aplicada. Não rodar `db push` de todas as migrations

## Pendente

- Versículos por extenso na NVI nas 51 aulas. Modelo em `output/sql/bloco-6-versiculos-nvi.sql`
- PDFs antigos: os de Cadeias seguem no visual rosa, com páginas em branco e os dois erros de digitação. Duplicados continuam na Biblioteca
- Nove exercícios do Caderno sem leitura associada
- Abertura do Caminhar é rascunho. Falta a leitura da Jordana
- Vídeo de boas-vindas e horário de atendimento do suporte
- Sem teste no celular nem com conta de progresso antigo

## Fora do git

- `output/` e `tmp/` não são versionados. Ficam só nesta máquina: o PDF do Planner, os blocos de SQL, a resposta à Ana e os geradores em `tmp/planner-build`, `tmp/resposta-build` e `tmp/conteudo-novo`
- `scripts/create_client_strategy_deck.py` continua solto e não entra neste salvamento
- A conta do Luiz tem registros marcados "[TESTE DE REVISÃO]". Ele decidiu não limpar

## Retomar

```bash
git checkout checkpoint-2026-11-22-area-membros-revisada
```

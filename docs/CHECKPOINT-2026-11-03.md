# Checkpoint Jornada Única — 2026-11-03

Estado estável em produção, com a venda de teste validada: e-mail de boas-vindas e WhatsApp de acesso chegaram.

## O que funciona

- Site: https://www.jordanacantarelli.com.br
- Supabase: `spxxlspesoybioowvjmb`
- Trilhas em módulos de aulas: Confissões de Fé e Caminhar com Consciência (7 módulos, 3 aulas, 7 PDFs premium)
- O desbloqueio vale só dentro da própria trilha
- Admin em `/admin`, aba WhatsApp: conexão Uazapi, modelo da mensagem e histórico de envios
- Compra com celular válido enfileira o e-mail e o WhatsApp no mesmo momento
- A mensagem leva o link para criar a senha. Nunca leva senha
- Disparo automático ligado. Conexão testada como conectada
- Venda de teste conferida de ponta a ponta em 03/11/2026

## Como o envio sai

- A Kiwify entra por `kiwify-webhook`, que chama `send-welcome-email` e `send-welcome-whatsapp`
- O cron de 5 minutos (`p2-welcome-drain`) drena só o e-mail
- Se o WhatsApp ficar na fila sem o webhook, o dreno é `send-welcome-whatsapp` com o segredo interno
- Sem celular válido, ou com o disparo desligado, a linha de WhatsApp fica como não enviada e não tenta de novo
- Falha da Uazapi tenta de novo até 3 vezes, com 2 minutos de intervalo

## Fora deste marco

- `scripts/create_client_strategy_deck.py` continua solto e não entra neste salvamento
- A migration local `20261102140000_reading_positions.sql` não está no banco remoto. Não rodar `db push` de todas as migrations
- O cron ainda não chama o WhatsApp. A compra real depende do webhook

## Retomar

```bash
git checkout checkpoint-2026-11-03-whatsapp-validado
```

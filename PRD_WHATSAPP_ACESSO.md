# PRD — WhatsApp de acesso da compradora

## Problema

A compradora paga na Kiwify e o acesso sai por e-mail. Quem não vê o e-mail procura a secretaria da Jordana para pedir login. O iAthena já resolve esse tipo de aviso com o Uazapi: uma instância de WhatsApp, um token, e o envio de texto em `POST /send/text`. A Jornada não precisa do atendimento com IA do iAthena. Precisa avisar a compradora no WhatsApp, com o mesmo link de criar senha que o e-mail já manda, e dizer que o suporte também é por esse número.

## O que entra

- Uma conexão Uazapi no painel admin: URL, instância, token, número e um teste de status em `GET /status`.
- Um interruptor. Ligado, a compra entra na fila. Desligado, só o e-mail segue.
- Uma mensagem editável, com `{nome}`, `{email}` e `{link}`.
- Disparo automático no mesmo momento do e-mail de boas-vindas, usando o celular da Kiwify (`Customer.mobile`).
- Lista dos envios: nome, telefone mascarado, situação e erro. Sem o link de acesso na tela.

## O que fica de fora

- Caixa de entrada, resposta automática e transbordo para humano. Isso é o módulo de conversas do iAthena, não este corte.
- Senha no WhatsApp. O link é o mesmo `action_link` do e-mail, pessoal e com prazo.
- Campanha, carrinho abandonado e disparo para quem comprou antes desta fila.
- Meta Cloud. A conexão é Uazapi, como o iAthena usa hoje em produção.

## Fluxo

1. A Kiwify confirma a compra.
2. O webhook cria ou recupera a usuária e gera o link de acesso.
3. Grava o e-mail na `email_outbox` e, se o celular for válido (DDI 55, DDD e número), grava o WhatsApp na `whatsapp_outbox` com a chave `welcome:<usuária>`.
4. `send-welcome-email` e `send-welcome-whatsapp` drenam as filas. O cron `process-outbox` repete as duas.
5. Se a conexão estiver desligada ou sem token, a linha vira `skipped` e não tenta de novo. O link expira; não faz sentido enviar horas depois.
6. Falha do Uazapi tenta de novo até 3 vezes, com dois minutos de intervalo. A compra e o e-mail não dependem disso.

## Onde fica no admin

Aba **WhatsApp**, ao lado de Email Mkt.

- **Conexão:** URL `https`, nome da instância, número e token. O token não volta para o navegador. Campo vazio na hora de salvar mantém o token atual.
- **Configurações:** disparo automático.
- **Mensagem de acesso:** texto e um envio de teste para um celular informado na hora.
- **Envios:** as últimas 30 linhas.

## Dados

Tabelas novas, sem leitura pelo navegador. Só as funções com service role escrevem e leem.

- `whatsapp_connection`: uma linha. `enabled`, `base_url`, `instance_name`, `token`, `phone_e164`, último status.
- `whatsapp_templates`: chave `welcome`.
- `whatsapp_outbox`: telefone, payload com nome, e-mail e link, situação `queued | sent | failed | skipped`.

Funções:

- `whatsapp-admin`: sessão de admin, JWT no gateway.
- `send-welcome-whatsapp`: só com `x-internal-secret`, igual ao e-mail.

## Segurança

- O token do Uazapi não aparece no painel depois de salvo e não entra em log.
- Telefone e link não entram em log. A lista do admin mostra o telefone mascarado.
- Sem celular utilizável, o WhatsApp é ignorado e o e-mail continua.
- Replay da Kiwify não manda de novo: a chave é uma por usuária.

## Pronto quando

- O admin salva a conexão, testa o status e edita a mensagem.
- Um teste chega no celular informado, com o link da área de membros, sem senha.
- Uma compra com celular válido gera uma linha `sent` ou `failed` sem impedir o e-mail.
- Uma compra sem celular não gera linha e o e-mail segue.
- Com o disparo desligado, a linha fica `skipped`.

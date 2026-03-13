

# Plano — Polimento UX, Microcopy, Âncoras e Consistência (todas as páginas)

---

## (0) Componentes compartilhados

### InstitutionalHeader
Atualizar `navItems` para:
- Início → `/`
- Jornadas → `/jornadas`
- Revoluz → `/revoluz`
- Contato → `/contato`
- Convites → `/contato#convites`

Remover os links de âncora internos (Sobre, Como posso te ajudar, Palestras, Depoimentos) do header global — esses só fazem sentido na Home. Em vez disso, manter navegação entre páginas consistente.

CTA botão: "Agendar Sessão Individual" → WhatsApp (já existe).

### InstitutionalFooter
- Atualizar links: `/`, `/jornadas`, `/revoluz`, `/contato`
- Adicionar microcopy: "Com fé, clareza e presença."
- Adicionar link WhatsApp

### Novo componente: `BackToTopButton`
- Criar `src/components/institutional/BackToTopButton.tsx`
- Botão fixo canto inferior direito, aparece após scroll > 400px
- `aria-label="Voltar ao topo"`, ícone `ChevronUp`
- Incluir em todas as 4 páginas institucionais

---

## (1) HomePage (/)

### Âncoras — adicionar IDs às seções
- Hero: `id="topo"`
- Sobre: já tem `id="sobre"`
- Missão: `id="missao"`
- Ajuda: já tem `id="ajuda"`
- Jornadas: já tem `id="jornadas"`
- Outros Produtos: `id="produtos"`
- Para quem: `id="publico"`
- Palestras: já tem `id="palestras"`
- Formação: `id="formacao"`
- Depoimentos: já tem `id="depoimentos"`
- CTA Final: `id="cta-final"`

### Microcopy Hero (1.2)
Abaixo dos 2 botões, adicionar linha:
"Sem atalhos. Um caminho com direção, fé e responsabilidade."

### Microcopy Jornadas (1.3)
Acima dos cards, adicionar:
"Se você não sabe por onde começar, comece por uma jornada."

### Outros Produtos (1.4)
Já tem Revoluz Experience no array `outros`. Confirmar consistência dos CTAs.

### Depoimentos (1.5)
Acima do título, inserir:
"Depoimentos reais de mulheres impactadas pelo conteúdo e pelas jornadas."

### CTA Final (1.6)
Adicionar microcopy abaixo do botão:
"Resposta em horário comercial. Segunda a Sexta – 9h às 18h."

---

## (2) JornadasPage (/jornadas)

### Âncoras
- `id="jornadas-topo"` no topo
- `id="jornadas-catalogo"` nos cards
- `id="outros-produtos"` na seção outros

### Microcopy topo (2.2)
Adicionar abaixo do subtítulo existente:
"Escolha pela sua necessidade hoje. Você não precisa resolver tudo de uma vez — precisa começar."

### Tags nos cards (2.3)
Adicionar chips em cada card:
- Respira, Alma → "ansiedade • reconexão"
- Cadeias Invisíveis → "padrões • cura emocional"
- Confissões de Fé → "identidade • reprogramação"

### Microcopy "Outros Produtos" (2.4)
Adicionar abaixo do título:
"Mentoria e Experience abrem turmas por períodos. Entre na lista para ser avisada."

### Links já corretos
Revoluz → `/revoluz`, Mentoria/Experience → `/contato#lista-espera`

---

## (3) ContatoPage (/contato)

### Âncoras
- `id="contato-topo"` no topo
- `id="terapia"` na seção terapia
- `id="convites"` já existe
- `id="lista-espera"` já existe

### Botões de scroll rápido (3.1)
Inserir 3 botões no topo: "Sessão Individual", "Convites", "Lista de espera"

### Microcopy terapia (3.2)
Adicionar: "Atendimento online. Valores sob consulta. Agendamento via WhatsApp."

### Microcopy convites (3.3)
Antes do botão enviar: "Quanto mais detalhes, melhor para retornarmos com clareza."

### Microcopy lista de espera (3.4)
Abaixo do botão: "Seus dados ficam protegidos. Usaremos apenas para avisar sobre abertura de vagas."

---

## (4) SalesPageRevoluz (/revoluz)

### Espaçamento metadados (4.1)
Já está correto com `<span>•</span>` separado — confirmar visualmente.

### CTAs checkout (4.2)
- Após metadados no Hero: já tem "Quero Começar Agora" ✓
- Após "O que está incluído": já tem "Garanta sua vaga" ✓
- CTA final: já tem "Entrar no Método REVOLUZ" ✓
- Adicionar microcopy "Compra e acesso pela Kiwify." abaixo de cada CTA principal

### Âncoras (4.3)
Adicionar IDs faltantes: `#revoluz-topo`, `#por-que`, `#inclui`, `#recebe` (conteudo), `#para-quem` (já existe), `#sobre-jordana`, `#garantia`, `#faq` (já existe), `#cta-final`

Adicionar 3 links rápidos no topo: "O que está incluído", "Para quem é", "Garantia"

### Seção "O que você vai receber" (4.5)
Adicionar texto introdutório antes do accordion:
- "4 módulos (Espiritualidade, Autoconhecimento, Inteligência Emocional, Reprogramação Mental)"
- "Ferramentas e exercícios para aplicar no seu tempo"

### Sticky CTA mobile
Já existe. Manter.

---

## Arquivos modificados

1. `src/components/institutional/InstitutionalHeader.tsx` — novo menu
2. `src/components/institutional/InstitutionalFooter.tsx` — links + microcopy
3. `src/components/institutional/BackToTopButton.tsx` — novo componente
4. `src/pages/HomePage.tsx` — âncoras + microcopy
5. `src/pages/JornadasPage.tsx` — âncoras + tags + microcopy
6. `src/pages/ContatoPage.tsx` — âncoras + scroll rápido + microcopy
7. `src/pages/SalesPageRevoluz.tsx` — âncoras + links rápidos + microcopy kiwify + texto "receber"


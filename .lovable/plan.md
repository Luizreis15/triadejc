## Plano — Simplificar seção Convites e ajustar menu

### Objetivo
Na página /contato, transformar a seção "Convites para pregações e palestras" em um bloco limpo (título + subtítulo + CTA único para WhatsApp). Ajustar o menu do header de acordo.

---

### 1. `src/components/institutional/InstitutionalHeader.tsx`
- Alterar o label do item de navegação de **"Convites"** para **"Enviar convite"**.
- Manter o comportamento de âncora para `/contato#convites` (a seção continuará existindo na página).

### 2. `src/pages/ContatoPage.tsx`
- **Remover** o componente interno `ConvitesForm` (formulário completo com todos os campos).
- **Manter** o `<section id="convites">`, o `<ScrollReveal>` com o `<h2>` e o `<p>` descritivo.
- **Adicionar** um botão de CTA logo após o subtítulo:
  - Texto: **"Enviar convite"**
  - Link: `https://wa.link/z8p2f9` (abre em nova aba)
  - Estilo: usar o padrão `btn-gold` com ícone `ArrowRight` para manter consistência visual.

---

### Escopo
Apenas as duas alterações acima. Nenhuma outra página ou seção é afetada.
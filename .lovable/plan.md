## Plano — Ajustes na Hero da página /links

### 1. Reposicionar tags flutuantes
- Mover a tag "Inteligência Emocional" para que não fique sobre o rosto da Jordana (ajustar coordenadas no array `positions`).
- Aproximar a tag "Fé" do centro — atualmente está muito distante (`top: 8%, right: 6%`).
- Centralizar o chip "Pastora · Psicanalista · Terapeuta Cristã" abaixo do nome, ajustando margens/alinhamento no bloco de texto.

### 2. Reduzir espaço em branco
- Diminuir o padding/margem entre o fim do hero e o início da seção "Escolha por onde começar". Verificar se o overlay de gradiente ou padding da seção seguinte está gerando o vazio.

---

**Arquivo:** `src/pages/LinksPage.tsx` — edições de posicionamento (`positions[]`) e espaçamento (`py-*`, `pb-*`, altura do gradiente).
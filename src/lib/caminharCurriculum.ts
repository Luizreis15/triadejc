export const CAMINHAR_SLUG = "caminhar-consciencia";

export type CaminharLesson = {
  title: string;
  dayNumbers: number[];
  pdf: boolean;
};

export type CaminharModule = {
  index: number;
  title: string;
  lessons: CaminharLesson[];
};

export const CAMINHAR_CURRICULUM: CaminharModule[] = [
  {
    index: 1,
    title: "Centro",
    lessons: [
      { title: "Não é sobre você", dayNumbers: [1], pdf: true },
      { title: "No dia comum", dayNumbers: [2], pdf: false },
      { title: "Quando o sentimento muda", dayNumbers: [3], pdf: false },
    ],
  },
  {
    index: 2,
    title: "Passo",
    lessons: [
      { title: "Você não precisa ver o caminho todo", dayNumbers: [4], pdf: false },
      { title: "Sem pressa", dayNumbers: [5], pdf: true },
      { title: "O próximo sim", dayNumbers: [6], pdf: false },
    ],
  },
  {
    index: 3,
    title: "Permanecer",
    lessons: [
      { title: "Fé não é empolgação", dayNumbers: [7], pdf: true },
      { title: "Voltar para a Palavra", dayNumbers: [8], pdf: false },
      { title: "Oração de quem fica", dayNumbers: [9], pdf: false },
    ],
  },
  {
    index: 4,
    title: "Propósito",
    lessons: [
      { title: "Você não está atrasada", dayNumbers: [10], pdf: false },
      { title: "O que é seu para fazer", dayNumbers: [11], pdf: true },
      { title: "Trabalho com coração", dayNumbers: [12], pdf: false },
    ],
  },
  {
    index: 5,
    title: "Casa",
    lessons: [
      { title: "Paz que cabe em casa", dayNumbers: [13], pdf: true },
      { title: "Limite com honra", dayNumbers: [14], pdf: false },
      { title: "Palavra que cura", dayNumbers: [15], pdf: false },
    ],
  },
  {
    index: 6,
    title: "Firmeza",
    lessons: [
      { title: "Decisão, não oscilação", dayNumbers: [16], pdf: true },
      { title: "Identidade que não negocia", dayNumbers: [17], pdf: false },
      { title: "Quando a dúvida vier", dayNumbers: [18], pdf: false },
    ],
  },
  {
    index: 7,
    title: "Envio",
    lessons: [
      { title: "Você já pode caminhar", dayNumbers: [19], pdf: false },
      { title: "Servir sem se perder", dayNumbers: [20], pdf: false },
      { title: "O caminho continua", dayNumbers: [21], pdf: true },
    ],
  },
];

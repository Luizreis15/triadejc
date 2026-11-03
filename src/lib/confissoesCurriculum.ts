export const CONFISSOES_SLUG = "confissoes-de-fe";

export type ConfissaoLesson = {
  title: string;
  dayNumbers: number[];
  pdf: boolean;
};

export type ConfissaoModule = {
  index: number;
  title: string;
  lessons: ConfissaoLesson[];
};

export const CONFISSOES_CURRICULUM: ConfissaoModule[] = [
  {
    index: 1,
    title: "Chegar",
    lessons: [
      { title: "Bem-vinda", dayNumbers: [1], pdf: true },
      { title: "Recomeçar", dayNumbers: [2], pdf: false },
      { title: "Você não carrega tudo", dayNumbers: [3], pdf: false },
    ],
  },
  {
    index: 2,
    title: "Força",
    lessons: [
      { title: "Você é forte", dayNumbers: [4], pdf: false },
      { title: "Conduzida pela paz", dayNumbers: [5], pdf: true },
      { title: "Esperança", dayNumbers: [6], pdf: false },
    ],
  },
  {
    index: 3,
    title: "Luz",
    lessons: [
      { title: "Livre da comparação", dayNumbers: [7], pdf: false },
      { title: "Você carrega luz", dayNumbers: [8, 9], pdf: true },
      { title: "Resposta onde Deus te plantar", dayNumbers: [10], pdf: false },
    ],
  },
  {
    index: 4,
    title: "Propósito",
    lessons: [
      { title: "Mais que vencedora", dayNumbers: [11], pdf: false },
      { title: "Capacitada para o plano", dayNumbers: [12], pdf: true },
      { title: "Frutificar e perseverar", dayNumbers: [13, 14], pdf: false },
    ],
  },
  {
    index: 5,
    title: "Pausa",
    lessons: [
      { title: "Amada incondicionalmente", dayNumbers: [15], pdf: true },
      { title: "Selá", dayNumbers: [16], pdf: false },
      { title: "Sabedoria", dayNumbers: [17], pdf: false },
    ],
  },
  {
    index: 6,
    title: "Renovo",
    lessons: [
      { title: "Renovada todos os dias", dayNumbers: [18], pdf: false },
      { title: "Mulher de fé", dayNumbers: [19], pdf: true },
      { title: "Força e dignidade", dayNumbers: [20], pdf: false },
    ],
  },
  {
    index: 7,
    title: "Paz",
    lessons: [
      { title: "Guardada por dentro", dayNumbers: [21], pdf: true },
      { title: "Resposta e paz", dayNumbers: [22, 23], pdf: false },
      { title: "Falar vida e perdoar", dayNumbers: [24, 25], pdf: false },
    ],
  },
  {
    index: 8,
    title: "Continuar",
    lessons: [
      { title: "Propósito, sem atraso", dayNumbers: [26], pdf: false },
      { title: "Livre da culpa", dayNumbers: [27, 28], pdf: true },
      { title: "Firmeza e seguir", dayNumbers: [29, 30], pdf: false },
    ],
  },
];

export function findConfissaoLesson(dayNumber: number) {
  for (const module of CONFISSOES_CURRICULUM) {
    const lessonIndex = module.lessons.findIndex((lesson) => lesson.dayNumbers.includes(dayNumber));
    if (lessonIndex >= 0) {
      return { module, lesson: module.lessons[lessonIndex], lessonIndex };
    }
  }
  return null;
}

export function nextConfissaoLesson(dayNumber: number) {
  const current = findConfissaoLesson(dayNumber);
  if (!current) return null;
  const nextInModule = current.module.lessons[current.lessonIndex + 1];
  if (nextInModule) return { module: current.module, lesson: nextInModule };
  const nextModule = CONFISSOES_CURRICULUM.find((item) => item.index === current.module.index + 1);
  if (!nextModule) return null;
  return { module: nextModule, lesson: nextModule.lessons[0] };
}

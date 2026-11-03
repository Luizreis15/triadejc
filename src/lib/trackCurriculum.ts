import { CAMINHAR_CURRICULUM, CAMINHAR_SLUG } from "@/lib/caminharCurriculum";
import { CONFISSOES_CURRICULUM, CONFISSOES_SLUG, type ConfissaoModule } from "@/lib/confissoesCurriculum";

export type TrackCurriculum = ConfissaoModule[];

export type TrackLessonPlacement = {
  module: ConfissaoModule;
  lesson: ConfissaoModule["lessons"][number];
  lessonIndex: number;
};

const TRACKS: Record<string, { curriculum: TrackCurriculum; declarationLabel: string }> = {
  [CONFISSOES_SLUG]: {
    curriculum: CONFISSOES_CURRICULUM,
    declarationLabel: "Confissão de Fé",
  },
  [CAMINHAR_SLUG]: {
    curriculum: CAMINHAR_CURRICULUM,
    declarationLabel: "Eu declaro",
  },
};

export function trackFor(slug?: string) {
  if (!slug) return null;
  return TRACKS[slug] ?? null;
}

export function findTrackLesson(curriculum: TrackCurriculum, dayNumber: number): TrackLessonPlacement | null {
  for (const module of curriculum) {
    const lessonIndex = module.lessons.findIndex((lesson) => lesson.dayNumbers.includes(dayNumber));
    if (lessonIndex >= 0) {
      return { module, lesson: module.lessons[lessonIndex], lessonIndex };
    }
  }
  return null;
}

export function nextTrackLesson(curriculum: TrackCurriculum, dayNumber: number) {
  const current = findTrackLesson(curriculum, dayNumber);
  if (!current) return null;
  const nextInModule = current.module.lessons[current.lessonIndex + 1];
  if (nextInModule) return { module: current.module, lesson: nextInModule };
  const nextModule = curriculum.find((item) => item.index === current.module.index + 1);
  if (!nextModule) return null;
  return { module: nextModule, lesson: nextModule.lessons[0] };
}

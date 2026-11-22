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

export type TrackDayRef = { id: string; day_number: number };

export type TrackLessonUnit<D extends TrackDayRef> = {
  module: ConfissaoModule;
  lesson: ConfissaoModule["lessons"][number];
  /** Posição da aula dentro do tema, começando em 1. */
  position: number;
  /** Dias que formam a aula. O primeiro é o que abre a página. */
  days: D[];
};

/**
 * Aulas da trilha na ordem do currículo, já ligadas aos dias do banco.
 * A ordem vem daqui, nunca de day_in_module: esse campo repete entre blocos
 * antigos e já deixou a aula 22 na frente da aula 1.
 */
export function trackLessonUnits<D extends TrackDayRef>(curriculum: TrackCurriculum, days: D[]): TrackLessonUnit<D>[] {
  const units: TrackLessonUnit<D>[] = [];
  for (const module of curriculum) {
    module.lessons.forEach((lesson, index) => {
      const related = lesson.dayNumbers
        .map((number) => days.find((day) => day.day_number === number))
        .filter((day): day is D => Boolean(day));
      if (related.length === 0) return;
      units.push({ module, lesson, position: index + 1, days: related });
    });
  }
  return units;
}

export function isLessonDone<D extends TrackDayRef>(unit: TrackLessonUnit<D>, isDayDone: (dayId: string) => boolean) {
  return unit.days.every((day) => isDayDone(day.id));
}

/** A primeira aula está sempre aberta. As outras abrem quando a anterior é concluída. */
export function isLessonUnlocked<D extends TrackDayRef>(
  units: TrackLessonUnit<D>[],
  index: number,
  isDayDone: (dayId: string) => boolean,
) {
  if (index <= 0) return true;
  if (isLessonDone(units[index], isDayDone)) return true;
  return isLessonDone(units[index - 1], isDayDone);
}

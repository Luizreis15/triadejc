import { trackFor, trackLessonUnits, isLessonDone, type TrackDayRef } from "@/lib/trackCurriculum";

export type ModuleSteps = { done: number; total: number; percent: number };

/**
 * Etapas de um módulo: leituras (cards) mais aulas (ou dias, fora das trilhas).
 * Contar só os cards fazia Confissões de Fé fechar em 100% com a abertura lida
 * e Caminhar com Consciência aparecer como "0 de 0".
 */
export function countModuleSteps(input: {
  slug?: string | null;
  cardIds: string[];
  days: TrackDayRef[];
  isCardDone: (cardId: string) => boolean;
  isDayDone: (dayId: string) => boolean;
}): ModuleSteps {
  const { slug, cardIds, days, isCardDone, isDayDone } = input;
  let total = cardIds.length;
  let done = cardIds.filter(isCardDone).length;

  const track = trackFor(slug ?? undefined);
  if (track) {
    const units = trackLessonUnits(track.curriculum, days);
    total += units.length;
    done += units.filter((unit) => isLessonDone(unit, isDayDone)).length;
  } else {
    total += days.length;
    done += days.filter((day) => isDayDone(day.id)).length;
  }

  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/**
 * Posição de leitura. localStorage é o cache instantâneo deste aparelho;
 * reading_positions (Supabase) é a fonte que sincroniza entre aparelhos.
 * Toda leitura remota grava de volta no localStorage, então uma falha de rede
 * cai no último valor conhecido em vez de voltar para zero.
 */
import { supabase } from "@/integrations/supabase/client";

export type ReadingPlace = {
  userId: string;
  cardId: string;
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  cardTitle: string;
  scrollRatio: number;
  updatedAt: string;
};

const STALE_DAYS = 3;

function resumeKey(userId: string) {
  return `ju.reading.resume.${userId}`;
}

function scrollKey(userId: string, cardId: string) {
  return `ju.reading.scroll.${userId}.${cardId}`;
}

export function saveReadingPlace(place: ReadingPlace) {
  const ratio = Math.min(1, Math.max(0, place.scrollRatio));
  const next = { ...place, scrollRatio: ratio, updatedAt: new Date().toISOString() };
  localStorage.setItem(resumeKey(place.userId), JSON.stringify(next));
  localStorage.setItem(scrollKey(place.userId, place.cardId), String(ratio));
}

export function loadResume(userId: string): ReadingPlace | null {
  try {
    const raw = localStorage.getItem(resumeKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadingPlace;
    if (!parsed?.cardId || !parsed.moduleSlug) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function loadCardScroll(userId: string, cardId: string): number {
  const raw = localStorage.getItem(scrollKey(userId, cardId));
  const value = raw ? Number(raw) : 0;
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

export function isReadingStale(iso: string | null | undefined): boolean {
  const days = daysSince(iso);
  return days !== null && days >= STALE_DAYS;
}

export const READING_STALE_DAYS = STALE_DAYS;

export async function syncReadingPosition(
  userId: string,
  cardId: string,
  moduleId: string,
  ratio: number,
): Promise<void> {
  try {
    await supabase.from("reading_positions").upsert({
      user_id: userId,
      card_id: cardId,
      module_id: moduleId,
      scroll_ratio: Math.min(1, Math.max(0, ratio)),
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Best-effort: o localStorage já tem a posição; a próxima sincronização corrige.
  }
}

export async function fetchRemoteCardScroll(userId: string, cardId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("reading_positions")
    .select("scroll_ratio")
    .eq("user_id", userId)
    .eq("card_id", cardId)
    .maybeSingle();
  if (error || !data) return null;
  return Math.min(1, Math.max(0, Number(data.scroll_ratio)));
}

type RemoteResumeRow = {
  card_id: string;
  module_id: string;
  updated_at: string;
  module_cards: { title: string; modules: { slug: string; title: string } | null } | null;
};

export async function fetchRemoteResume(userId: string): Promise<ReadingPlace | null> {
  const { data, error } = await supabase
    .from("reading_positions")
    .select("card_id, module_id, updated_at, module_cards(title, modules(slug, title))")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as unknown as RemoteResumeRow;
  const moduleRef = row.module_cards?.modules;
  if (!row.module_cards || !moduleRef) return null;

  return {
    userId,
    cardId: row.card_id,
    moduleId: row.module_id,
    moduleSlug: moduleRef.slug,
    moduleTitle: moduleRef.title,
    cardTitle: row.module_cards.title,
    scrollRatio: loadCardScroll(userId, row.card_id),
    updatedAt: row.updated_at,
  };
}

/**
 * Resume "onde parei" entre aparelhos: usa a linha remota mais recente quando
 * existir, com fallback pro cache local (aparelho offline, ou leitura feita
 * antes da migration de reading_positions).
 */
export async function resolveResume(userId: string): Promise<ReadingPlace | null> {
  const local = loadResume(userId);
  const remote = await fetchRemoteResume(userId).catch(() => null);
  if (!remote) return local;
  if (!local) return remote;
  return new Date(remote.updatedAt).getTime() >= new Date(local.updatedAt).getTime() ? remote : local;
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";
import { useDayCompletions } from "./useModuleDays";
import { countModuleSteps } from "@/lib/moduleProgress";

export type CatalogModule = Tables<"modules">;
export type ModuleStatus = "not_started" | "in_progress" | "completed";

export interface EntitledProduct {
  id: string;
  slug: string;
  name: string;
}

export interface ProductCatalog {
  product: EntitledProduct;
  modules: CatalogModule[];
  completed: number;
  total: number;
  percent: number;
  current: CatalogModule | undefined;
}

interface EntitlementRow {
  product_id: string;
  expires_at: string | null;
  products: EntitledProduct | EntitledProduct[] | null;
}

function asProduct(value: EntitlementRow["products"]): EntitledProduct | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row?.id || !row.slug || !row.name) return null;
  return { id: row.id, slug: row.slug, name: row.name };
}

export function useEntitledCatalog() {
  const { user } = useAuth();

  const productsQuery = useQuery({
    queryKey: ["entitled-products", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<EntitledProduct[]> => {
      const { data, error } = await supabase
        .from("entitlements")
        .select("product_id, expires_at, products(id, slug, name)")
        .eq("user_id", user!.id)
        .eq("status", "active");
      if (error) throw error;

      const now = Date.now();
      const byId = new Map<string, EntitledProduct>();
      for (const row of (data ?? []) as EntitlementRow[]) {
        if (row.expires_at && new Date(row.expires_at).getTime() <= now) continue;
        const product = asProduct(row.products);
        if (!product) continue;
        byId.set(product.id, product);
      }

      return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    },
  });

  const productIds = (productsQuery.data ?? []).map((product) => product.id);

  const modulesQuery = useQuery({
    queryKey: ["entitled-modules", user?.id, productIds],
    enabled: !!user?.id && productsQuery.isSuccess,
    queryFn: async (): Promise<CatalogModule[]> => {
      if (productIds.length === 0) return [];
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .in("product_id", productIds)
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });

  const progressQuery = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const progress = progressQuery.data ?? [];
  const moduleIds = (modulesQuery.data ?? []).map((module) => module.id);

  const cardsQuery = useQuery({
    queryKey: ["member-card-counts", moduleIds],
    enabled: !!user?.id && modulesQuery.isSuccess,
    queryFn: async () => {
      if (moduleIds.length === 0) return [];
      const { data, error } = await supabase
        .from("module_cards")
        .select("id, module_id, title, order_index")
        .in("module_id", moduleIds)
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });

  const daysQuery = useQuery({
    queryKey: ["member-day-counts", moduleIds],
    enabled: !!user?.id && modulesQuery.isSuccess,
    queryFn: async () => {
      if (moduleIds.length === 0) return [];
      const { data, error } = await supabase
        .from("module_days")
        .select("id, module_id, day_number")
        .in("module_id", moduleIds)
        .order("day_number");
      if (error) throw error;
      return data ?? [];
    },
  });

  const completedDayIds = new Set(useDayCompletions());

  const completionsQuery = useQuery({
    queryKey: ["member-card-completions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_completions")
        .select("card_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const completedCardIds = new Set((completionsQuery.data ?? []).map((row) => row.card_id));
  const cardsByModule = new Map<string, string[]>();
  for (const card of cardsQuery.data ?? []) {
    const list = cardsByModule.get(card.module_id) ?? [];
    list.push(card.id);
    cardsByModule.set(card.module_id, list);
  }

  const allModules = modulesQuery.data ?? [];

  // O percentual sai sempre da contagem real de leituras e aulas. O campo
  // progress.completed ficou marcado por engano em módulos de aulas e não decide mais nada.
  const getModuleProgress = (moduleId: string): { progress: number; status: ModuleStatus; done: number; total: number } => {
    const moduleProgress = progress.find((item) => item.module_id === moduleId);
    const steps = countModuleSteps({
      slug: allModules.find((module) => module.id === moduleId)?.slug,
      cardIds: cardsByModule.get(moduleId) ?? [],
      days: (daysQuery.data ?? []).filter((day) => day.module_id === moduleId),
      isCardDone: (id) => completedCardIds.has(id),
      isDayDone: (id) => completedDayIds.has(id),
    });
    const base = { done: steps.done, total: steps.total };
    if (steps.total > 0 && steps.done >= steps.total) return { ...base, progress: 100, status: "completed" };
    if (steps.done > 0) return { ...base, progress: steps.percent, status: "in_progress" };
    if (moduleProgress) return { ...base, progress: 0, status: "in_progress" };
    return { ...base, progress: 0, status: "not_started" };
  };

  /** Próxima leitura ainda não concluída de um módulo, na ordem em que aparece. */
  const nextUnreadCard = (moduleId: string, afterCardId?: string) => {
    const cards = (cardsQuery.data ?? []).filter((card) => card.module_id === moduleId);
    const start = afterCardId ? cards.findIndex((card) => card.id === afterCardId) + 1 : 0;
    const ordered = [...cards.slice(start), ...cards.slice(0, start)];
    return ordered.find((card) => !completedCardIds.has(card.id)) ?? null;
  };

  const isCardDone = (cardId: string) => completedCardIds.has(cardId);

  const lastProgressAt = progress.reduce<string | null>((latest, row) => {
    if (!row.updated_at) return latest;
    if (!latest || row.updated_at > latest) return row.updated_at;
    return latest;
  }, null);

  const modules = modulesQuery.data ?? [];
  const catalogs: ProductCatalog[] = (productsQuery.data ?? []).map((product) => {
    const productModules = modules.filter((module) => module.product_id === product.id);
    const completed = productModules.filter(
      (module) => getModuleProgress(module.id).status === "completed",
    ).length;
    const total = productModules.length;
    const current =
      productModules.find((module) => getModuleProgress(module.id).status === "in_progress") ||
      productModules[0];

    return {
      product,
      modules: productModules,
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      current,
    };
  });

  const completedModules = catalogs.reduce((sum, catalog) => sum + catalog.completed, 0);
  const totalModules = catalogs.reduce((sum, catalog) => sum + catalog.total, 0);

  return {
    catalogs,
    modules,
    completedModules,
    totalModules,
    overallProgress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
    getModuleProgress,
    nextUnreadCard,
    isCardDone,
    lastProgressAt,
    isLoading:
      productsQuery.isPending ||
      progressQuery.isPending ||
      completionsQuery.isPending ||
      (productsQuery.isSuccess && modulesQuery.isPending) ||
      (modulesQuery.isSuccess && (cardsQuery.isPending || daysQuery.isPending)),
    isError: productsQuery.isError || modulesQuery.isError || progressQuery.isError || cardsQuery.isError || daysQuery.isError || completionsQuery.isError,
    refetch: () =>
      Promise.all([
        productsQuery.refetch(),
        modulesQuery.refetch(),
        progressQuery.refetch(),
        cardsQuery.refetch(),
        daysQuery.refetch(),
        completionsQuery.refetch(),
      ]),
  };
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";

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
        .select("id, module_id")
        .in("module_id", moduleIds);
      if (error) throw error;
      return data ?? [];
    },
  });

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

  const getModuleProgress = (moduleId: string): { progress: number; status: ModuleStatus } => {
    const moduleProgress = progress.find((item) => item.module_id === moduleId);
    const cardIds = cardsByModule.get(moduleId) ?? [];
    const done = cardIds.filter((id) => completedCardIds.has(id)).length;
    if (moduleProgress?.completed || (cardIds.length > 0 && done >= cardIds.length)) {
      return { progress: 100, status: "completed" };
    }
    if (cardIds.length > 0 && done > 0) {
      return { progress: Math.round((done / cardIds.length) * 100), status: "in_progress" };
    }
    if (moduleProgress) return { progress: 0, status: "in_progress" };
    return { progress: 0, status: "not_started" };
  };

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
    lastProgressAt,
    isLoading:
      productsQuery.isPending ||
      progressQuery.isPending ||
      completionsQuery.isPending ||
      (productsQuery.isSuccess && modulesQuery.isPending) ||
      (modulesQuery.isSuccess && cardsQuery.isPending),
    isError: productsQuery.isError || modulesQuery.isError || progressQuery.isError || cardsQuery.isError || completionsQuery.isError,
    refetch: () =>
      Promise.all([
        productsQuery.refetch(),
        modulesQuery.refetch(),
        progressQuery.refetch(),
        cardsQuery.refetch(),
        completionsQuery.refetch(),
      ]),
  };
}

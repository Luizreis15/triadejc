import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

interface CardCompletion {
  id: string;
  user_id: string;
  card_id: string;
  completed_at: string;
}

interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  last_seen_card_index: number | null;
}

export function useProgress(moduleId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all card completions for user
  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ["card-completions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("card_completions")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as CardCompletion[];
    },
    enabled: !!user?.id,
  });

  // Fetch module progress
  const { data: moduleProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["module-progress", user?.id, moduleId],
    queryFn: async () => {
      if (!user?.id || !moduleId) return null;
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .maybeSingle();
      if (error) throw error;
      return data as ModuleProgress | null;
    },
    enabled: !!user?.id && !!moduleId,
  });

  // Check if a card is completed
  const isCardCompleted = (cardId: string) => {
    return completions.some((c) => c.card_id === cardId);
  };

  // Mark card as completed
  const markCardComplete = useMutation({
    mutationFn: async ({ cardId, moduleId }: { cardId: string; moduleId: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Insert card completion
      const { error: completionError } = await supabase
        .from("card_completions")
        .insert({
          user_id: user.id,
          card_id: cardId,
        });

      // Ignore unique constraint error (already completed)
      if (completionError && completionError.code !== "23505") {
        throw completionError;
      }

      // Update or create module progress
      const { data: existing } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .maybeSingle();

      // Get total cards in module and count completed
      const { count: totalCards } = await supabase
        .from("module_cards")
        .select("*", { count: "exact", head: true })
        .eq("module_id", moduleId);

      const { count: completedCards } = await supabase
        .from("card_completions")
        .select("*, module_cards!inner(module_id)", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("module_cards.module_id", moduleId);

      const isModuleComplete = totalCards && completedCards && completedCards >= totalCards;

      if (existing) {
        await supabase
          .from("progress")
          .update({
            last_seen_card_index: (completedCards || 0),
            completed: isModuleComplete,
            completed_at: isModuleComplete ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("progress")
          .insert({
            user_id: user.id,
            module_id: moduleId,
            last_seen_card_index: 1,
            completed: isModuleComplete,
            completed_at: isModuleComplete ? new Date().toISOString() : null,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card-completions"] });
      queryClient.invalidateQueries({ queryKey: ["module-progress"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["all-progress"] });
    },
  });

  // Unmark card completion
  const unmarkCardComplete = useMutation({
    mutationFn: async ({ cardId, moduleId }: { cardId: string; moduleId: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      await supabase
        .from("card_completions")
        .delete()
        .eq("user_id", user.id)
        .eq("card_id", cardId);

      // Update module progress
      const { count: completedCards } = await supabase
        .from("card_completions")
        .select("*, module_cards!inner(module_id)", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("module_cards.module_id", moduleId);

      const { data: existing } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("progress")
          .update({
            last_seen_card_index: completedCards || 0,
            completed: false,
            completed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card-completions"] });
      queryClient.invalidateQueries({ queryKey: ["module-progress"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["all-progress"] });
    },
  });

  return {
    completions,
    moduleProgress,
    isLoading: completionsLoading || progressLoading,
    isCardCompleted,
    markCardComplete,
    unmarkCardComplete,
  };
}

// Hook to get overall progress for home page
export function useOverallProgress() {
  const { user } = useAuth();

  const { data: allProgress = [], isLoading } = useQuery({
    queryKey: ["all-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("progress")
        .select("*, modules(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: totalModules = 0 } = useQuery({
    queryKey: ["total-modules"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("modules")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const completedModules = allProgress.filter((p) => p.completed).length;
  const overallPercent = totalModules > 0 
    ? Math.round((completedModules / totalModules) * 100) 
    : 0;

  return {
    allProgress,
    totalModules,
    completedModules,
    overallPercent,
    isLoading,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ModuleDay {
  id: string;
  module_id: string;
  day_number: number;
  day_in_module: number;
  title: string;
  verse_reference: string | null;
  /** Versículo por extenso, na NVI. Vazio enquanto não for preenchido. */
  verse_text: string | null;
  message_text: string;
  confession_text: string | null;
  exercise_q1: string | null;
  exercise_q2: string | null;
  exercise_q3: string | null;
  top_video_url: string | null;
  pdf_url: string | null;
  created_at: string;
}

/** Ids dos dias que a aluna já concluiu, em todas as trilhas. */
export function useDayCompletions(): string[] {
  const { user } = useAuth();
  const { data = [] } = useQuery({
    queryKey: ["all-day-completions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("title")
        .eq("user_id", user.id)
        .eq("section", "day_complete");
      if (error) throw error;
      return (data || []).map(e => e.title).filter(Boolean) as string[];
    },
    enabled: !!user?.id,
  });
  return data;
}

export function useModuleDays(moduleId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch days for a module
  const { data: days = [], isLoading: daysLoading } = useQuery({
    queryKey: ["module-days", moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      const { data, error } = await supabase
        .from("module_days")
        .select("*")
        .eq("module_id", moduleId)
        .order("day_number");
      if (error) throw error;
      return data as ModuleDay[];
    },
    enabled: !!moduleId,
  });

  const allCompletedDayIds = useDayCompletions();

  const isDayCompleted = (dayId: string) => allCompletedDayIds.includes(dayId);

  // Unlock stays inside this module. Day numbers repeat across tracks,
  // so a global day_number lookup would lock one trail behind another.
  const isDayUnlocked = (dayIndex: number) => {
    if (dayIndex <= 0) return true;
    const previous = days[dayIndex - 1];
    return previous ? allCompletedDayIds.includes(previous.id) : false;
  };

  // Save exercise answers
  const saveExercises = useMutation({
    mutationFn: async ({ dayId, moduleSlug, q1Answer, q2Answer, q3Answer }: {
      dayId: string;
      moduleSlug: string;
      q1Answer: string;
      q2Answer: string;
      q3Answer?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      let content = `**Exercício 1:**\n${q1Answer}\n\n**Exercício 2:**\n${q2Answer}`;
      if (q3Answer) {
        content += `\n\n**Exercício 3:**\n${q3Answer}`;
      }
      
      // Upsert: check if entry exists
      const { data: existing, error: lookupError } = await supabase
        .from("notebook_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("section", "day_exercise")
        .eq("title", dayId)
        .maybeSingle();
      if (lookupError) throw lookupError;

      if (existing) {
        const { error } = await supabase
          .from("notebook_entries")
          .update({ content_md: content, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notebook_entries")
          .insert({
            user_id: user.id,
            section: "day_exercise",
            title: dayId,
            module_slug: moduleSlug,
            content_md: content,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["day-exercises"] });
      queryClient.invalidateQueries({ queryKey: ["notebook-entries"] });
    },
  });

  // Mark day as complete
  const markDayComplete = useMutation({
    mutationFn: async ({ dayId, moduleSlug }: { dayId: string; moduleSlug: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Check if already completed
      const { data: existing, error: lookupError } = await supabase
        .from("notebook_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("section", "day_complete")
        .eq("title", dayId)
        .maybeSingle();
      if (lookupError) throw lookupError;

      if (!existing) {
        const { error } = await supabase
          .from("notebook_entries")
          .insert({
            user_id: user.id,
            section: "day_complete",
            title: dayId,
            module_slug: moduleSlug,
            content_md: "Dia concluído",
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-day-completions"] });
    },
  });

  // Fetch saved exercises for a specific day
  const useDayExercises = (dayId?: string) => {
    return useQuery({
      queryKey: ["day-exercises", user?.id, dayId],
      queryFn: async () => {
        if (!user?.id || !dayId) return null;
        const { data, error } = await supabase
          .from("notebook_entries")
          .select("content_md")
          .eq("user_id", user.id)
          .eq("section", "day_exercise")
          .eq("title", dayId)
          .maybeSingle();
        if (error) throw error;
        return data?.content_md || null;
      },
      enabled: !!user?.id && !!dayId,
    });
  };

  return {
    days,
    isLoading: daysLoading,
    isDayCompleted,
    isDayUnlocked,
    saveExercises,
    markDayComplete,
    useDayExercises,
  };
}

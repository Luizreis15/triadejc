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
  message_text: string;
  confession_text: string | null;
  exercise_q1: string | null;
  exercise_q2: string | null;
  top_video_url: string | null;
  pdf_url: string | null;
  created_at: string;
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
        .order("day_in_module");
      if (error) throw error;
      return data as ModuleDay[];
    },
    enabled: !!moduleId,
  });

  // Fetch day completions (using notebook_entries with section='day_exercise')
  const { data: completedDayIds = [], isLoading: completionsLoading } = useQuery({
    queryKey: ["day-completions", user?.id, moduleId],
    queryFn: async () => {
      if (!user?.id || !moduleId) return [];
      // A day is "completed" if there's a notebook_entry with section='day_complete' for that day
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("title")
        .eq("user_id", user.id)
        .eq("section", "day_complete");
      if (error) throw error;
      // title stores the day id
      return (data || []).map(e => e.title).filter(Boolean) as string[];
    },
    enabled: !!user?.id && !!moduleId,
  });

  const isDayCompleted = (dayId: string) => completedDayIds.includes(dayId);

  const isDayUnlocked = (dayIndex: number) => {
    if (dayIndex === 0) return true;
    const prevDay = days[dayIndex - 1];
    return prevDay ? isDayCompleted(prevDay.id) : false;
  };

  // Save exercise answers
  const saveExercises = useMutation({
    mutationFn: async ({ dayId, moduleSlug, q1Answer, q2Answer }: {
      dayId: string;
      moduleSlug: string;
      q1Answer: string;
      q2Answer: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const content = `**Exercício 1:**\n${q1Answer}\n\n**Exercício 2:**\n${q2Answer}`;
      
      // Upsert: check if entry exists
      const { data: existing } = await supabase
        .from("notebook_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("section", "day_exercise")
        .eq("title", dayId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("notebook_entries")
          .update({ content_md: content, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("notebook_entries")
          .insert({
            user_id: user.id,
            section: "day_exercise",
            title: dayId,
            module_slug: moduleSlug,
            content_md: content,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["day-exercises"] });
    },
  });

  // Mark day as complete
  const markDayComplete = useMutation({
    mutationFn: async ({ dayId, moduleSlug }: { dayId: string; moduleSlug: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Check if already completed
      const { data: existing } = await supabase
        .from("notebook_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("section", "day_complete")
        .eq("title", dayId)
        .maybeSingle();

      if (!existing) {
        await supabase
          .from("notebook_entries")
          .insert({
            user_id: user.id,
            section: "day_complete",
            title: dayId,
            module_slug: moduleSlug,
            content_md: "Dia concluído",
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["day-completions"] });
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
    isLoading: daysLoading || completionsLoading,
    isDayCompleted,
    isDayUnlocked,
    saveExercises,
    markDayComplete,
    useDayExercises,
  };
}

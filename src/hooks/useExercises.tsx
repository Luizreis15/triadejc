import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Exercise {
  id: string;
  module_slug: string;
  order_index: number;
  title: string;
  description: string;
  icon: string;
  scripture_reference: string | null;
  scripture_text: string | null;
  prompt_questions: string[];
  estimated_time: number;
}

export interface ExerciseEntry {
  id: string;
  user_id: string;
  exercise_id: string;
  content_md: string;
  created_at: string;
}

export function useExercises(moduleSlug: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch exercises for a module
  const { data: exercises = [], isLoading: loadingExercises } = useQuery({
    queryKey: ["exercises", moduleSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("module_slug", moduleSlug)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data.map(ex => ({
        ...ex,
        prompt_questions: Array.isArray(ex.prompt_questions) 
          ? ex.prompt_questions 
          : JSON.parse(ex.prompt_questions as string || '[]')
      })) as Exercise[];
    },
    enabled: !!moduleSlug,
  });

  // Fetch completed exercises for the user
  const { data: completedExercises = [], isLoading: loadingCompleted } = useQuery({
    queryKey: ["exercise-entries", user?.id, moduleSlug],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("*, exercise_id")
        .eq("user_id", user.id)
        .eq("section", "exercise")
        .not("exercise_id", "is", null);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if exercise is completed
  const isExerciseCompleted = (exerciseId: string) => {
    return completedExercises.some(entry => entry.exercise_id === exerciseId);
  };

  // Get entry for an exercise
  const getExerciseEntry = (exerciseId: string) => {
    return completedExercises.find(entry => entry.exercise_id === exerciseId);
  };

  // Save exercise response
  const saveExercise = useMutation({
    mutationFn: async ({ 
      exerciseId, 
      title, 
      content 
    }: { 
      exerciseId: string; 
      title: string; 
      content: string;
    }) => {
      if (!user?.id) throw new Error("User not logged in");
      
      // Check if already exists
      const existing = getExerciseEntry(exerciseId);
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("notebook_entries")
          .update({
            content_md: content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("notebook_entries")
          .insert({
            user_id: user.id,
            section: "exercise",
            title,
            content_md: content,
            exercise_id: exerciseId,
            module_slug: moduleSlug,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise-entries"] });
      queryClient.invalidateQueries({ queryKey: ["notebook-entries"] });
    },
  });

  const completedCount = exercises.filter(ex => isExerciseCompleted(ex.id)).length;
  const progressPercent = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

  return {
    exercises,
    completedExercises,
    isExerciseCompleted,
    getExerciseEntry,
    saveExercise,
    completedCount,
    progressPercent,
    isLoading: loadingExercises || loadingCompleted,
  };
}

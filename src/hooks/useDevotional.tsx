import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DevotionalDay {
  id: string;
  module_slug: string;
  day_number: number;
  title: string;
  scripture_reference: string;
  scripture_text: string;
  reflection_md: string;
  heart_question: string;
  prayer_md: string;
}

export interface DevotionalEntry {
  id: string;
  user_id: string;
  devotional_day_id: string;
  content_md: string;
  created_at: string;
}

export function useDevotional(moduleSlug: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch devotional days for a module
  const { data: devotionalDays = [], isLoading: loadingDays } = useQuery({
    queryKey: ["devotional-days", moduleSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devotional_days")
        .select("*")
        .eq("module_slug", moduleSlug)
        .order("day_number", { ascending: true });
      if (error) throw error;
      return data as DevotionalDay[];
    },
    enabled: !!moduleSlug,
  });

  // Fetch completed devotional entries for the user
  const { data: completedDays = [], isLoading: loadingCompleted } = useQuery({
    queryKey: ["devotional-entries", user?.id, moduleSlug],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("*, devotional_day_id")
        .eq("user_id", user.id)
        .eq("section", "devotional")
        .not("devotional_day_id", "is", null);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if day is completed
  const isDayCompleted = (dayId: string) => {
    return completedDays.some(entry => entry.devotional_day_id === dayId);
  };

  // Get entry for a day
  const getDayEntry = (dayId: string) => {
    return completedDays.find(entry => entry.devotional_day_id === dayId);
  };

  // Get current day (next uncompleted or last completed)
  const getCurrentDay = () => {
    for (const day of devotionalDays) {
      if (!isDayCompleted(day.id)) {
        return day;
      }
    }
    return devotionalDays[devotionalDays.length - 1] || null;
  };

  // Check if day is unlocked (sequential unlock: previous must be completed)
  const isDayUnlocked = (dayNumber: number) => {
    if (dayNumber === 1) return true;
    const previousDay = devotionalDays.find(d => d.day_number === dayNumber - 1);
    if (!previousDay) return false;
    return isDayCompleted(previousDay.id);
  };

  // Save devotional response
  const saveDevotional = useMutation({
    mutationFn: async ({ 
      dayId, 
      dayNumber,
      content 
    }: { 
      dayId: string; 
      dayNumber: number;
      content: string;
    }) => {
      if (!user?.id) throw new Error("User not logged in");
      
      const existing = getDayEntry(dayId);
      
      if (existing) {
        const { error } = await supabase
          .from("notebook_entries")
          .update({
            content_md: content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notebook_entries")
          .insert({
            user_id: user.id,
            section: "devotional",
            title: `Dia ${dayNumber}`,
            content_md: content,
            devotional_day_id: dayId,
            module_slug: moduleSlug,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotional-entries"] });
      queryClient.invalidateQueries({ queryKey: ["notebook-entries"] });
    },
  });

  const completedCount = devotionalDays.filter(d => isDayCompleted(d.id)).length;
  const progressPercent = devotionalDays.length > 0 ? (completedCount / devotionalDays.length) * 100 : 0;

  return {
    devotionalDays,
    completedDays,
    isDayCompleted,
    getDayEntry,
    getCurrentDay,
    isDayUnlocked,
    saveDevotional,
    completedCount,
    totalDays: devotionalDays.length,
    progressPercent,
    isLoading: loadingDays || loadingCompleted,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ProductChapter {
  id: string;
  module_id: string;
  order_index: number;
  title: string;
  long_description: string;
  video_url: string | null;
  pdf_url: string | null;
  exercise_q1: string | null;
  exercise_q2: string | null;
  exercise_q3: string | null;
  exercise_q4: string | null;
}

export interface ChapterAnswer {
  id: string;
  user_id: string;
  chapter_id: string;
  answers: Record<string, string>;
  completed: boolean;
  completed_at: string | null;
}

export function useProductChapters(moduleId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ["product-chapters", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_chapters")
        .select("*")
        .eq("module_id", moduleId!)
        .order("order_index");
      if (error) throw error;
      return data as ProductChapter[];
    },
    enabled: !!moduleId,
  });

  const { data: answers = [], isLoading: answersLoading } = useQuery({
    queryKey: ["chapter-answers", moduleId, user?.id],
    queryFn: async () => {
      const chapterIds = chapters.map((c) => c.id);
      if (chapterIds.length === 0) return [];
      const { data, error } = await supabase
        .from("chapter_answers")
        .select("*")
        .eq("user_id", user!.id)
        .in("chapter_id", chapterIds);
      if (error) throw error;
      return data as ChapterAnswer[];
    },
    enabled: !!user?.id && chapters.length > 0,
  });

  const completedCount = answers.filter((a) => a.completed).length;

  const getAnswer = (chapterId: string) =>
    answers.find((a) => a.chapter_id === chapterId);

  const saveAnswers = useMutation({
    mutationFn: async ({
      chapterId,
      answerData,
    }: {
      chapterId: string;
      answerData: Record<string, string>;
    }) => {
      const existing = getAnswer(chapterId);
      if (existing) {
        const { error } = await supabase
          .from("chapter_answers")
          .update({ answers: answerData as any })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("chapter_answers").insert({
          user_id: user!.id,
          chapter_id: chapterId,
          answers: answerData as any,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter-answers", moduleId] });
    },
  });

  const markComplete = useMutation({
    mutationFn: async ({
      chapterId,
      answerData,
    }: {
      chapterId: string;
      answerData: Record<string, string>;
    }) => {
      const existing = getAnswer(chapterId);
      if (existing) {
        const { error } = await supabase
          .from("chapter_answers")
          .update({
            answers: answerData as any,
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("chapter_answers").insert({
          user_id: user!.id,
          chapter_id: chapterId,
          answers: answerData as any,
          completed: true,
          completed_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter-answers", moduleId] });
    },
  });

  return {
    chapters,
    answers,
    chaptersLoading,
    answersLoading,
    completedCount,
    totalCount: chapters.length,
    getAnswer,
    saveAnswers,
    markComplete,
  };
}

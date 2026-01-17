import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, BookOpen, NotebookPen, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ReadingView() {
  const { slug, cardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch card/reading content
  const { data: card, isLoading } = useQuery({
    queryKey: ["reading", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_cards")
        .select("*, modules(id, title, slug)")
        .eq("id", cardId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!cardId,
  });

  // Check if already completed
  const { data: isCompleted } = useQuery({
    queryKey: ["reading-progress", cardId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("progress")
        .select("last_seen_card_index")
        .eq("module_id", card?.modules?.id)
        .eq("user_id", user?.id)
        .single();
      
      return data?.last_seen_card_index !== null && data?.last_seen_card_index >= (card?.order_index || 0);
    },
    enabled: !!card && !!user,
  });

  // Mark as completed mutation
  const markComplete = useMutation({
    mutationFn: async () => {
      if (!user || !card) return;

      const { data: existing } = await supabase
        .from("progress")
        .select("*")
        .eq("module_id", card.modules.id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        await supabase
          .from("progress")
          .update({ 
            last_seen_card_index: Math.max(existing.last_seen_card_index || 0, card.order_index),
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("progress")
          .insert({
            module_id: card.modules.id,
            user_id: user.id,
            last_seen_card_index: card.order_index,
          });
      }
    },
    onSuccess: () => {
      toast.success("Leitura concluída!");
      queryClient.invalidateQueries({ queryKey: ["reading-progress"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      navigate(`/membros/app/modulos/${slug}`);
    },
  });

  const goToNotebook = () => {
    navigate("/membros/app/caderno", { 
      state: { 
        fromReading: true, 
        readingTitle: card?.title,
        moduleSlug: slug 
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pt-safe">
        <Skeleton className="h-10 w-24 mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Conteúdo não encontrado</p>
      </div>
    );
  }

  // Estimate reading time (avg 200 words per minute)
  const wordCount = card.content_md?.split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/membros/app/modulos/${slug}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {readingTime} min
          </div>
        </div>
      </header>

      {/* Content */}
      <motion.main 
        className="max-w-2xl mx-auto px-6 py-8 pb-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <div className="mb-8">
          <p className="text-sm text-secondary font-medium mb-2">
            {card.modules?.title}
          </p>
          <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-4">
            {card.title}
          </h1>
        </div>

        {/* Reading Content */}
        <Card className="bg-card/50 p-6 md:p-8 shadow-soft">
          <article className="reading-mode prose prose-lg max-w-none">
            <div 
              className="text-foreground leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: card.content_md?.replace(/\n/g, '<br/>') || '' 
              }}
            />
          </article>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <Button
            variant="outline"
            className="w-full gap-2 h-12"
            onClick={goToNotebook}
          >
            <NotebookPen className="h-5 w-5" />
            Registrar no Caderno
          </Button>

          <Button
            className="w-full gap-2 h-12 bg-primary hover:bg-primary/90"
            onClick={() => markComplete.mutate()}
            disabled={markComplete.isPending || isCompleted}
          >
            {isCompleted ? (
              <>
                <Check className="h-5 w-5" />
                Concluído
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                {markComplete.isPending ? "Salvando..." : "Concluir Leitura"}
              </>
            )}
          </Button>
        </div>
      </motion.main>
    </div>
  );
}

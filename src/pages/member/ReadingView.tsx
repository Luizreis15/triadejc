import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, PenLine, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function ReadingView() {
  const { slug, cardId } = useParams<{ slug: string; cardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch card
  const { data: card, isLoading } = useQuery({
    queryKey: ["module-card", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_cards")
        .select("*, modules(*)")
        .eq("id", cardId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!cardId,
  });

  // Mark as completed mutation
  const markComplete = useMutation({
    mutationFn: async () => {
      if (!user?.id || !card?.module_id) return;
      
      // Check if progress exists
      const { data: existing } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_id", card.module_id)
        .single();

      if (existing) {
        // Update progress
        const newIndex = Math.max(existing.last_seen_card_index || 0, card.order_index + 1);
        await supabase
          .from("progress")
          .update({ 
            last_seen_card_index: newIndex,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        // Create progress
        await supabase
          .from("progress")
          .insert({
            user_id: user.id,
            module_id: card.module_id,
            last_seen_card_index: card.order_index + 1,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      toast({
        title: "Leitura concluída! ✨",
        description: "Seu progresso foi salvo.",
      });
      navigate(`/membros/app/modulos/${slug}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Conteúdo não encontrado</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 -mx-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif font-semibold text-foreground truncate">
              {card.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {card.modules?.title}
            </p>
          </div>
        </div>
      </header>

      {/* Reading Content */}
      <article className="flex-1 py-8">
        <div className="prose prose-lg prose-stone dark:prose-invert max-w-none">
          <div 
            className="text-foreground leading-relaxed space-y-4"
            style={{ 
              fontSize: "1.125rem",
              lineHeight: "1.8",
            }}
          >
            {card.content_md ? (
              card.content_md.split('\n\n').map((paragraph: string, index: number) => (
                <p key={index} className="text-foreground/90">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground italic">
                O conteúdo desta leitura está sendo preparado.
              </p>
            )}
          </div>
        </div>
      </article>

      {/* Fixed Footer */}
      <footer className="sticky bottom-20 bg-background/95 backdrop-blur-lg border-t border-border/50 -mx-4 px-4 py-4">
        <div className="flex gap-3">
          <Link to={`/membros/app/caderno?module=${slug}`} className="flex-1">
            <Button variant="outline" className="w-full h-12">
              <PenLine className="w-4 h-4 mr-2" />
              Registrar no Caderno
            </Button>
          </Link>
          <Button 
            className="flex-1 h-12"
            onClick={() => markComplete.mutate()}
            disabled={markComplete.isPending}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Concluir
          </Button>
        </div>
      </footer>
    </div>
  );
}

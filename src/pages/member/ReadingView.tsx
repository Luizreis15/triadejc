import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PenLine, CheckCircle2, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useProgress } from "@/hooks/useProgress";

export default function ReadingView() {
  const { slug, cardId } = useParams<{ slug: string; cardId: string }>();
  const navigate = useNavigate();

  // Fetch card
  const { data: card, isLoading } = useQuery({
    queryKey: ["module-card", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_cards")
        .select("*, modules(*)")
        .eq("id", cardId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!cardId,
  });

  // Fetch PDFs for this specific card/chapter
  const { data: cardPdfs } = useQuery({
    queryKey: ["card-pdfs", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_pdfs")
        .select("*")
        .eq("card_id", cardId!)
        .order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!cardId,
  });

  // Use progress hook
  const { isCardCompleted, markCardComplete } = useProgress(card?.module_id);
  const isCompleted = cardId ? isCardCompleted(cardId) : false;

  // Mark as completed
  const handleComplete = async () => {
    if (!cardId || !card?.module_id) return;
    
    try {
      await markCardComplete.mutateAsync({ 
        cardId, 
        moduleId: card.module_id 
      });
      toast({
        title: "Leitura concluída! ✨",
        description: "Seu progresso foi salvo.",
      });
      navigate(`/membros/app/modulos/${slug}`);
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

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

      {/* Material de Apoio - PDF */}
      {cardPdfs && cardPdfs.length > 0 && (
        <section className="py-6 border-t border-border/50">
          <h3 className="font-serif font-medium text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Material de Apoio
          </h3>
          <div className="space-y-3">
            {cardPdfs.map((pdf) => (
              <div 
                key={pdf.id}
                className="bg-muted/50 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{pdf.title}</span>
                </div>
                <a 
                  href={pdf.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fixed Footer */}
      <footer className="sticky bottom-20 bg-background/95 backdrop-blur-lg border-t border-border/50 -mx-4 px-4 py-4">
        <div className="flex gap-3">
          <Link to={`/membros/app/caderno?module=${slug}`} className="flex-1">
            <Button variant="outline" className="w-full h-12">
              <PenLine className="w-4 h-4 mr-2" />
              Registrar no Caderno
            </Button>
          </Link>
          {isCompleted ? (
            <Button 
              variant="secondary"
              className="flex-1 h-12"
              disabled
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Concluído
            </Button>
          ) : (
            <Button 
              className="flex-1 h-12"
              onClick={handleComplete}
              disabled={markCardComplete.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Concluir
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

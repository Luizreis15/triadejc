import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, BookOpen, PenLine, FileDown, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { VideoPlayer, ProgressBar } from "@/components/member";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "@/hooks/use-toast";

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch module
  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ["module", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch module cards
  const { data: cards = [] } = useQuery({
    queryKey: ["module-cards", module?.id],
    queryFn: async () => {
      if (!module?.id) return [];
      const { data, error } = await supabase
        .from("module_cards")
        .select("*")
        .eq("module_id", module.id)
        .order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!module?.id,
  });

  // Fetch module PDFs
  const { data: pdfs = [] } = useQuery({
    queryKey: ["module-pdfs", module?.id],
    queryFn: async () => {
      if (!module?.id) return [];
      const { data, error } = await supabase
        .from("module_pdfs")
        .select("*")
        .eq("module_id", module.id)
        .order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!module?.id,
  });

  // Use progress hook
  const { isCardCompleted, markCardComplete } = useProgress(module?.id);

  // Calculate progress based on actual completions
  const totalCards = cards.length;
  const completedCards = cards.filter(c => isCardCompleted(c.id)).length;
  const progressPercent = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // Group cards by type
  const introCards = cards.filter(c => c.type === "intro");
  const readingCards = cards.filter(c => c.type === "reading");
  const selahCards = cards.filter(c => c.type === "selah");
  const activityCards = cards.filter(c => c.type === "activity");

  // Handle card completion
  const handleCompleteCard = async (cardId: string) => {
    if (!module?.id) return;
    try {
      await markCardComplete.mutateAsync({ cardId, moduleId: module.id });
      toast({
        title: "Etapa concluída! ✨",
        description: "Seu progresso foi salvo.",
      });
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (moduleLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Módulo não encontrado</p>
        <Link to="/membros/app/modulos">
          <Button variant="ghost" className="mt-4">Voltar para módulos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to="/membros/app/modulos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Voltar</span>
      </Link>

      {/* Welcome Video */}
      <VideoPlayer 
        videoUrl={module.welcome_video_url || undefined}
        title={`Boas-vindas: ${module.title}`}
        className="shadow-lg"
      />

      {/* Module Header */}
      <section className="space-y-3">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {module.title}
        </h1>
        {module.description && (
          <p className="text-muted-foreground leading-relaxed">
            {module.description}
          </p>
        )}
        
        {/* Progress */}
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso do módulo</span>
            <span className="text-lg font-serif font-semibold text-primary">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} size="md" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedCards} de {totalCards} etapas
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-3">
        <QuickActionButton
          icon={Play}
          label="Começar por aqui"
          color="bg-primary/10 text-primary"
          onClick={() => {}}
        />
        <QuickActionButton
          icon={BookOpen}
          label="Momentos Selah"
          color="bg-accent/10 text-accent-foreground"
          onClick={() => {}}
        />
        <QuickActionButton
          icon={PenLine}
          label="Atividade"
          color="bg-green-100 text-green-700"
          onClick={() => {}}
        />
        <QuickActionButton
          icon={FileDown}
          label="PDFs"
          color="bg-orange-100 text-orange-700"
          count={pdfs.length}
          onClick={() => {}}
        />
      </section>

      {/* Intro Section */}
      {introCards.length > 0 && (
        <ContentSection title="Começar por aqui">
          {introCards.map((card) => (
            <ContentCard 
              key={card.id} 
              card={card} 
              moduleSlug={slug!}
              isCompleted={isCardCompleted(card.id)}
              onComplete={() => handleCompleteCard(card.id)}
            />
          ))}
        </ContentSection>
      )}

      {/* Readings Section */}
      {readingCards.length > 0 && (
        <ContentSection title="Leituras">
          {readingCards.map((card) => (
            <ContentCard 
              key={card.id} 
              card={card} 
              moduleSlug={slug!}
              isCompleted={isCardCompleted(card.id)}
              onComplete={() => handleCompleteCard(card.id)}
            />
          ))}
        </ContentSection>
      )}

      {/* Selah Section */}
      {selahCards.length > 0 && (
        <ContentSection title="Momentos Selah">
          {selahCards.map((card) => (
            <SelahCard 
              key={card.id} 
              card={card} 
              moduleSlug={slug!}
              isCompleted={isCardCompleted(card.id)}
              onComplete={() => handleCompleteCard(card.id)}
            />
          ))}
        </ContentSection>
      )}

      {/* Activity Section */}
      {activityCards.length > 0 && (
        <ContentSection title="Atividade do Módulo">
          {activityCards.map((card) => (
            <ActivityCard 
              key={card.id} 
              card={card} 
              moduleSlug={slug!}
              isCompleted={isCardCompleted(card.id)}
              onComplete={() => handleCompleteCard(card.id)}
            />
          ))}
        </ContentSection>
      )}

      {/* PDFs Section */}
      {pdfs.length > 0 && (
        <ContentSection title="Materiais para Download">
          <div className="space-y-2">
            {pdfs.map((pdf) => (
              <a
                key={pdf.id}
                href={pdf.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-red-600" />
                </div>
                <span className="flex-1 text-sm font-medium">{pdf.title}</span>
              </a>
            ))}
          </div>
        </ContentSection>
      )}

      {/* Empty State */}
      {cards.length === 0 && pdfs.length === 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-2xl">
          <p className="text-muted-foreground">
            O conteúdo deste módulo está sendo preparado com carinho.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Volte em breve!
          </p>
        </div>
      )}
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ 
  icon: Icon, 
  label, 
  color, 
  count,
  onClick 
}: { 
  icon: React.ElementType;
  label: string; 
  color: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
        color
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] opacity-70">{count} arquivos</span>
      )}
    </button>
  );
}

// Content Section Component
function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

// Content Card Component
function ContentCard({ 
  card, 
  moduleSlug, 
  isCompleted,
  onComplete 
}: { 
  card: any; 
  moduleSlug: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div className="p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isCompleted ? "bg-green-100" : "bg-primary/10"
        )}>
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <BookOpen className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={cn(
            "font-medium",
            isCompleted ? "text-muted-foreground" : "text-foreground"
          )}>{card.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCompleted ? "Concluído" : "~5 min de leitura"}
          </p>
        </div>
        {!isCompleted && (
          <Link 
            to={`/membros/app/modulos/${moduleSlug}/leitura/${card.id}`}
            className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            Ler
          </Link>
        )}
      </div>
    </div>
  );
}

// Selah Card Component  
function SelahCard({ 
  card, 
  moduleSlug,
  isCompleted,
  onComplete 
}: { 
  card: any; 
  moduleSlug: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border space-y-3",
      isCompleted 
        ? "bg-green-50/50 border-green-200" 
        : "bg-card border-border/50"
    )}>
      {card.video_url && (
        <VideoPlayer videoUrl={card.video_url} title={card.title} />
      )}
      <div className="flex items-start gap-2">
        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />}
        <h3 className={cn(
          "font-serif font-medium",
          isCompleted ? "text-muted-foreground" : "text-foreground"
        )}>{card.title}</h3>
      </div>
      {card.content_md && (
        <p className="text-sm text-muted-foreground line-clamp-2">{card.content_md}</p>
      )}
      <div className="flex gap-2">
        <Link to={`/membros/app/caderno?module=${moduleSlug}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <PenLine className="w-4 h-4 mr-2" />
            Registrar
          </Button>
        </Link>
        {!isCompleted && (
          <Button size="sm" variant="ghost" onClick={onComplete}>
            <Circle className="w-4 h-4 mr-2" />
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ 
  card, 
  moduleSlug,
  isCompleted,
  onComplete 
}: { 
  card: any; 
  moduleSlug: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border space-y-3",
      isCompleted 
        ? "bg-green-50/50 border-green-200" 
        : "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
    )}>
      <div className="flex items-start gap-2">
        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />}
        <h3 className={cn(
          "font-serif font-medium",
          isCompleted ? "text-muted-foreground" : "text-foreground"
        )}>{card.title}</h3>
      </div>
      {card.content_md && (
        <p className="text-sm text-muted-foreground">{card.content_md}</p>
      )}
      <div className="flex gap-2">
        <Link to={`/membros/app/caderno?module=${moduleSlug}&type=exercise`} className="flex-1">
          <Button variant={isCompleted ? "outline" : "default"} className="w-full">
            <PenLine className="w-4 h-4 mr-2" />
            {isCompleted ? "Ver no Caderno" : "Abrir no Caderno"}
          </Button>
        </Link>
        {!isCompleted && (
          <Button variant="ghost" onClick={onComplete}>
            <Circle className="w-4 h-4 mr-2" />
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}

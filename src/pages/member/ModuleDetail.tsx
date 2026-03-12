import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, BookOpen, PenLine, FileDown, CheckCircle2, Circle, Heart, Sparkles, Lock, Calendar, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { VideoPlayer, ProgressBar } from "@/components/member";
import { MarkdownPreview } from "@/components/member/MarkdownPreview";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import { useModuleDays } from "@/hooks/useModuleDays";
import { toast } from "@/hooks/use-toast";
import { useRef } from "react";
import { useQuery as useRQQuery } from "@tanstack/react-query";
import ProductDetail from "./ProductDetail";

// Define the card type with section
interface ModuleCard {
  id: string;
  module_id: string;
  title: string;
  type: string;
  section: string | null;
  order_index: number;
  content_md: string | null;
  video_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  created_at: string;
}

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Refs for scroll
  const introRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const selahRef = useRef<HTMLDivElement>(null);
  const closureRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const pdfsRef = useRef<HTMLDivElement>(null);

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

  // Check if this module has product_chapters (chapter-based product like Respira Alma)
  const { data: hasChapters } = useRQQuery({
    queryKey: ["has-product-chapters", module?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("product_chapters")
        .select("id", { count: "exact", head: true })
        .eq("module_id", module!.id);
      if (error) throw error;
      return (count ?? 0) > 0;
    },
    enabled: !!module?.id,
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
      return data as ModuleCard[];
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
  
  // Use module days hook
  const { days: moduleDays, isDayCompleted, isDayUnlocked } = useModuleDays(module?.id);

  // Calculate progress based on actual completions
  const totalCards = cards.length;
  const completedCards = cards.filter(c => isCardCompleted(c.id)).length;
  const progressPercent = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // Group cards by SECTION (not type)
  const introCards = cards.filter(c => c.section === "intro");
  const readingCards = cards.filter(c => c.section === "reading");
  const selahCards = cards.filter(c => c.section === "selah");
  const closureCards = cards.filter(c => c.section === "closure");
  const activityCards = cards.filter(c => c.section === "activity");

  // Scroll to section helper
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  // If chapter-based product, delegate to ProductDetail
  if (hasChapters) {
    return <ProductDetail module={module} />;
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
          label="Começar"
          color="bg-primary/10 text-primary"
          onClick={() => scrollToSection(introRef)}
          disabled={introCards.length === 0}
        />
        <QuickActionButton
          icon={Heart}
          label="Momentos Selah"
          color="bg-purple-100 text-purple-700"
          onClick={() => scrollToSection(selahRef)}
          disabled={selahCards.length === 0}
        />
        <QuickActionButton
          icon={PenLine}
          label="Atividade"
          color="bg-green-100 text-green-700"
          onClick={() => scrollToSection(activityRef)}
          disabled={activityCards.length === 0}
        />
        <QuickActionButton
          icon={FileDown}
          label="PDFs"
          color="bg-orange-100 text-orange-700"
          count={pdfs.length}
          onClick={() => scrollToSection(pdfsRef)}
          disabled={pdfs.length === 0}
        />
      </section>

      {/* JORNADA DIÁRIA — Sub-módulos colapsáveis */}
      {moduleDays.length > 0 && (() => {
        // Group days into sub-modules by ranges
        const subModules = [
          { title: "Presença, Entrega e Direção", subtitle: "Dias 1–5", days: moduleDays.filter(d => d.day_number >= 1 && d.day_number <= 5), isSelah: false },
          { title: "Presença que Ilumina", subtitle: "Dias 6–10 · Luz & Influência", days: moduleDays.filter(d => d.day_number >= 6 && d.day_number <= 10), isSelah: false },
          { title: "Vitória & Propósito", subtitle: "Dias 11–15 · Coragem para Continuar", days: moduleDays.filter(d => d.day_number >= 11 && d.day_number <= 15), isSelah: false },
          { title: "Momento Selá", subtitle: "Checkpoint · Pausa e Revisão", days: moduleDays.filter(d => d.day_number === 16), isSelah: true },
          { title: "Direção & Renovo", subtitle: "Dias 17–20 · Nova Fase", days: moduleDays.filter(d => d.day_number >= 17 && d.day_number <= 20), isSelah: false },
          { title: "Paz que Transborda", subtitle: "Dias 21–25 · Coração & Relacionamentos", days: moduleDays.filter(d => d.day_number >= 21 && d.day_number <= 25), isSelah: false },
          { title: "Valor & Continuidade", subtitle: "Dias 26–30 · Identidade Inabalável", days: moduleDays.filter(d => d.day_number >= 26 && d.day_number <= 30), isSelah: false },
        ].filter(g => g.days.length > 0);

        return (
          <div className="space-y-3">
            {subModules.map((group) => {
              // Selá: render as a single clickable card (no collapsible)
              if (group.isSelah && group.days.length === 1) {
                const selahDay = group.days[0];
                const completed = isDayCompleted(selahDay.id);
                const globalIndex = moduleDays.findIndex(d => d.id === selahDay.id);
                const unlocked = isDayUnlocked(globalIndex);

                if (unlocked) {
                  return (
                    <Link
                      key={group.title}
                      to={`/membros/app/modulos/${slug}/dia/${selahDay.id}`}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-colors",
                        completed
                          ? "bg-green-50/50 border-green-200 hover:border-green-300"
                          : "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-lg",
                          completed ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                        )}>
                          {completed ? <CheckCircle2 className="w-6 h-6" /> : "✦"}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h2 className={cn("font-serif text-lg font-semibold", completed ? "text-muted-foreground" : "text-purple-800")}>
                              {group.title}
                            </h2>
                            {!completed && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                                Checkpoint
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {completed ? "Concluído" : "Pausa e Revisão · Dia 16"}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
                    </Link>
                  );
                }

                return (
                  <div
                    key={group.title}
                    className="flex items-center justify-between p-4 rounded-2xl border bg-muted/30 border-border/30 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg text-muted-foreground">✦</div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h2 className="font-serif text-lg font-semibold text-muted-foreground">{group.title}</h2>
                          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Conclua o dia anterior para avançar</p>
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal collapsible group
              return (
                <Collapsible key={group.title}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/20 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h2 className="font-serif text-lg font-semibold text-foreground">{group.title}</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {group.days.filter(d => isDayCompleted(d.id)).length} de {group.days.length} dias concluídos
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2 mt-3 pl-2">
                      {group.days.map((day) => {
                        const completed = isDayCompleted(day.id);
                        const globalIndex = moduleDays.findIndex(d => d.id === day.id);
                        const unlocked = isDayUnlocked(globalIndex);
                        return (
                          <div key={day.id} className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                                completed
                                  ? "bg-green-100 text-green-700"
                                  : unlocked
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                              )}>
                                {completed ? <CheckCircle2 className="w-4 h-4" /> : day.day_in_module}
                              </div>
                              {group.days.indexOf(day) < group.days.length - 1 && (
                                <div className={cn(
                                  "w-0.5 h-4",
                                  completed ? "bg-green-200" : "bg-border"
                                )} />
                              )}
                            </div>
                            {unlocked ? (
                              <Link
                                to={`/membros/app/modulos/${slug}/dia/${day.id}`}
                                className={cn(
                                  "flex-1 p-3 rounded-xl border transition-colors",
                                  completed
                                    ? "bg-green-50/50 border-green-200 hover:border-green-300"
                                    : "bg-card border-border/50 hover:border-primary/30"
                                )}
                              >
                                <h3 className={cn(
                                  "font-medium text-sm",
                                  completed ? "text-muted-foreground" : "text-foreground"
                                )}>
                                  {day.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Dia {day.day_number} · {completed ? "Concluído" : "Disponível"}
                                </p>
                              </Link>
                            ) : (
                              <div className="flex-1 p-3 rounded-xl border bg-muted/30 border-border/30 opacity-60">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-sm text-muted-foreground">{day.title}</h3>
                                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">Conclua o dia anterior para avançar</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        );
      })()}

      {/* SEÇÃO 1 — Começar por aqui (intro) */}
      {introCards.length > 0 && (
        <div ref={introRef}>
          <ContentSection title="Começar por aqui" icon={<Sparkles className="w-5 h-5 text-primary" />}>
            {introCards.map((card) => (
              <ContentCard 
                key={card.id} 
                card={card} 
                moduleSlug={slug!}
                isCompleted={isCardCompleted(card.id)}
                onComplete={() => handleCompleteCard(card.id)}
                isIntro
              />
            ))}
          </ContentSection>
        </div>
      )}

      {/* SEÇÃO 2 — Leituras Principais (reading) */}
      {readingCards.length > 0 && (
        <div ref={readingRef}>
          <ContentSection title="Leituras Principais" icon={<BookOpen className="w-5 h-5 text-primary" />}>
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
        </div>
      )}

      {/* SEÇÃO 3 — Momentos Selah */}
      {selahCards.length > 0 && (
        <div ref={selahRef}>
          <ContentSection 
            title="Momentos Selah" 
            icon={<Heart className="w-5 h-5 text-purple-600" />}
            className="bg-purple-50/50 -mx-4 px-4 py-6 rounded-2xl"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Selah é uma pausa para integrar. Não é leitura, é reflexão guiada.
            </p>
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
        </div>
      )}

      {/* SEÇÃO 4 — Encerramento do Módulo (closure) */}
      {closureCards.length > 0 && (
        <div ref={closureRef}>
          <ContentSection 
            title="Encerramento" 
            icon={<Sparkles className="w-5 h-5 text-amber-600" />}
            className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 -mx-4 px-4 py-6 rounded-2xl"
          >
            {closureCards.map((card) => (
              <ClosureCard 
                key={card.id} 
                card={card} 
                moduleSlug={slug!}
                isCompleted={isCardCompleted(card.id)}
                onComplete={() => handleCompleteCard(card.id)}
              />
            ))}
          </ContentSection>
        </div>
      )}

      {/* SEÇÃO 5 — Atividade do Módulo */}
      {activityCards.length > 0 && (
        <div ref={activityRef}>
          <ContentSection title="Atividade do Módulo" icon={<PenLine className="w-5 h-5 text-green-600" />}>
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
        </div>
      )}

      {/* SEÇÃO 6 — PDFs do Módulo */}
      {pdfs.length > 0 && (
        <div ref={pdfsRef}>
          <ContentSection title="Materiais para Download" icon={<FileDown className="w-5 h-5 text-orange-600" />}>
            <p className="text-sm text-muted-foreground mb-3">
              PDFs são materiais de apoio. Use após as leituras.
            </p>
            <div className="space-y-2">
              {pdfs.map((pdf) => (
                <a
                  key={pdf.id}
                  href={pdf.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:border-orange-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <FileDown className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{pdf.title}</span>
                </a>
              ))}
            </div>
          </ContentSection>
        </div>
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
  onClick,
  disabled
}: { 
  icon: React.ElementType;
  label: string; 
  color: string;
  count?: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all",
        disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:scale-[1.02] active:scale-[0.98]",
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
function ContentSection({ 
  title, 
  icon,
  className,
  children 
}: { 
  title: string; 
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-serif text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

// Content Card Component
function ContentCard({ 
  card, 
  moduleSlug, 
  isCompleted,
  onComplete,
  isIntro
}: { 
  card: ModuleCard; 
  moduleSlug: string;
  isCompleted?: boolean;
  onComplete?: () => void;
  isIntro?: boolean;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-colors",
      isIntro && !isCompleted 
        ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30" 
        : "bg-card border-border/50 hover:border-primary/30"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isCompleted ? "bg-green-100" : isIntro ? "bg-primary/20" : "bg-primary/10"
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
            {isCompleted ? "Concluído" : isIntro ? "Comece por aqui" : "~5 min de leitura"}
          </p>
        </div>
        <Link 
          to={`/membros/app/modulos/${moduleSlug}/leitura/${card.id}`}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            isCompleted 
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : isIntro 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          {isCompleted ? "Reler" : "Ler"}
        </Link>
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
  card: ModuleCard; 
  moduleSlug: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border space-y-3",
      isCompleted 
        ? "bg-green-50/50 border-green-200" 
        : "bg-white border-purple-200"
    )}>
      {card.video_url && (
        <VideoPlayer videoUrl={card.video_url} title={card.title} />
      )}
      <div className="flex items-start gap-2">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        ) : (
          <Heart className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
        )}
        <h3 className={cn(
          "font-serif font-medium",
          isCompleted ? "text-muted-foreground" : "text-foreground"
        )}>{card.title}</h3>
      </div>
      {card.content_md && (
        <MarkdownPreview content={card.content_md} lineClamp={3} />
      )}
      <div className="flex gap-2">
        <Link to={`/membros/app/modulos/${moduleSlug}/leitura/${card.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full border-purple-200 hover:bg-purple-50">
            <BookOpen className="w-4 h-4 mr-2" />
            Ver reflexão
          </Button>
        </Link>
        <Link to={`/membros/app/caderno?module=${moduleSlug}`}>
          <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
            <PenLine className="w-4 h-4" />
          </Button>
        </Link>
        {!isCompleted && (
          <Button size="sm" variant="ghost" onClick={onComplete} className="text-purple-600 hover:bg-purple-100">
            <Circle className="w-4 h-4 mr-1" />
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}

// Closure Card Component
function ClosureCard({ 
  card, 
  moduleSlug,
  isCompleted,
  onComplete 
}: { 
  card: ModuleCard; 
  moduleSlug: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div className={cn(
      "p-5 rounded-xl border space-y-4",
      isCompleted 
        ? "bg-green-50/50 border-green-200" 
        : "bg-white border-amber-200"
    )}>
      <div className="flex items-start gap-2">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        ) : (
          <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        )}
        <h3 className={cn(
          "font-serif text-lg font-medium",
          isCompleted ? "text-muted-foreground" : "text-foreground"
        )}>{card.title}</h3>
      </div>
      
      {card.content_md && (
        <MarkdownPreview content={card.content_md} lineClamp={4} className="pl-7" />
      )}
      
      <div className="flex gap-2 pl-7">
        <Link to={`/membros/app/modulos/${moduleSlug}/leitura/${card.id}`} className="flex-1">
          <Button 
            variant={isCompleted ? "outline" : "default"} 
            size="sm" 
            className={cn(
              "w-full",
              !isCompleted && "bg-amber-600 hover:bg-amber-700"
            )}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {isCompleted ? "Reler" : "Ler encerramento"}
          </Button>
        </Link>
      </div>

      {!isCompleted && (
        <p className="text-xs text-amber-700/70 text-center italic">
          "Continue quando sentir que é o momento."
        </p>
      )}
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
  card: ModuleCard; 
  moduleSlug: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border space-y-3",
      isCompleted 
        ? "bg-green-50/50 border-green-200" 
        : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
    )}>
      <div className="flex items-start gap-2">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        ) : (
          <PenLine className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        )}
        <h3 className={cn(
          "font-serif font-medium",
          isCompleted ? "text-muted-foreground" : "text-foreground"
        )}>{card.title}</h3>
      </div>
      
      {card.content_md && (
        <MarkdownPreview content={card.content_md} lineClamp={5} />
      )}
      
      <div className="flex gap-2">
        <Link to={card.cta_url || `/membros/app/caderno?module=${moduleSlug}&type=exercise`} className="flex-1">
          <Button 
            variant={isCompleted ? "outline" : "default"} 
            className={cn(
              "w-full",
              !isCompleted && "bg-green-600 hover:bg-green-700"
            )}
          >
            <PenLine className="w-4 h-4 mr-2" />
            {card.cta_label || (isCompleted ? "Ver no Caderno" : "Abrir no Caderno")}
          </Button>
        </Link>
        {!isCompleted && (
          <Button variant="ghost" onClick={onComplete} className="text-green-600 hover:bg-green-100">
            <Circle className="w-4 h-4 mr-1" />
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}

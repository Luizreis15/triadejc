import { motion } from "framer-motion";
import { useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Play
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ReadingCard, 
  SelahCard, 
  IntroCard, 
  QuickActionsModule, 
  DownloadCard,
  ModuleVideoHero,
  ActivityCard
} from "@/components/modules";

type ModuleCard = {
  id: string;
  type: string;
  title: string;
  content_md: string | null;
  video_url: string | null;
  cta_url: string | null;
  cta_label: string | null;
  order_index: number;
};

type Module = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  welcome_video_url: string | null;
};

// Configuração de atividade por módulo
const MODULE_ACTIVITIES: Record<string, { title: string; description: string }> = {
  "cadeias-invisiveis": {
    title: "Atividade do Módulo 1",
    description: "Escreva para organizar: o que eu sinto, o que se repete e onde isso toca em mim.",
  },
};

export default function ModuleDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Refs para scroll
  const selahSectionRef = useRef<HTMLDivElement>(null);
  const downloadsSectionRef = useRef<HTMLDivElement>(null);
  const introSectionRef = useRef<HTMLDivElement>(null);

  // Fetch module data
  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ["module", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Module;
    },
    enabled: !!slug,
  });

  // Fetch module cards
  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ["module_cards", module?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_cards")
        .select("*")
        .eq("module_id", module!.id)
        .order("order_index");
      if (error) throw error;
      return data as ModuleCard[];
    },
    enabled: !!module?.id,
  });

  // Fetch user progress for this module
  const { data: progress } = useQuery({
    queryKey: ["progress", module?.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("module_id", module!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!module?.id && !!user?.id,
  });

  // Fetch all modules for navigation
  const { data: allModules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id, slug, order_index")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // Organizar cards por tipo/seção
  const organizedContent = useMemo(() => {
    if (!cards) return null;
    
    const welcomeVideo = cards.find(c => c.type === "video");
    const introCard = cards.find(c => c.type === "intro");
    const readings = cards.filter(c => c.type === "reading");
    const selahs = cards.filter(c => c.type === "selah");
    const downloads = cards.filter(c => c.type === "download");
    
    return {
      welcomeVideo,
      intro: introCard,
      readings,
      selahs,
      downloads,
    };
  }, [cards]);

  // Mark card as complete
  const completeCard = useMutation({
    mutationFn: async (cardIndex: number) => {
      if (!user?.id || !module?.id) return;
      
      const { data: existing } = await supabase
        .from("progress")
        .select("id, last_seen_card_index")
        .eq("module_id", module.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const newIndex = Math.max(existing.last_seen_card_index || 0, cardIndex);
        await supabase
          .from("progress")
          .update({ 
            last_seen_card_index: newIndex,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("progress")
          .insert({ 
            module_id: module.id, 
            user_id: user.id, 
            last_seen_card_index: cardIndex
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      toast({ title: "Progresso salvo!" });
    },
  });

  // Mark module as complete
  const completeModule = useMutation({
    mutationFn: async () => {
      if (!user?.id || !module?.id) return;
      
      const { data: existing } = await supabase
        .from("progress")
        .select("id")
        .eq("module_id", module.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("progress")
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("progress")
          .insert({ 
            module_id: module.id, 
            user_id: user.id, 
            completed: true, 
            completed_at: new Date().toISOString() 
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      toast({
        title: "Módulo concluído! 🎉",
        description: "Parabéns! Você avançou mais um passo.",
      });
    },
  });

  // Navegação
  const getNextModule = () => {
    if (!allModules || !module) return null;
    const currentIndex = allModules.findIndex(m => m.id === module.id);
    return allModules[currentIndex + 1] || null;
  };

  const getPrevModule = () => {
    if (!allModules || !module) return null;
    const currentIndex = allModules.findIndex(m => m.id === module.id);
    return allModules[currentIndex - 1] || null;
  };

  // Handlers de navegação
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToNotebook = (cardTitle?: string) => {
    navigate("/membros/app/caderno", { 
      state: { 
        fromReading: true, 
        readingTitle: cardTitle,
        moduleSlug: slug 
      } 
    });
  };

  const goToActivity = () => {
    navigate(`/membros/app/caderno/atividade/${slug}`);
  };

  const openReading = (cardId: string) => {
    navigate(`/membros/app/modulos/${slug}/leitura/${cardId}`);
  };

  // Calcular status de cada card
  const getCardStatus = (cardIndex: number): 'unread' | 'in_progress' | 'completed' => {
    const lastSeen = progress?.last_seen_card_index || 0;
    if (cardIndex < lastSeen) return 'completed';
    if (cardIndex === lastSeen) return 'in_progress';
    return 'unread';
  };

  const isCardCompleted = (cardIndex: number): boolean => {
    return (progress?.last_seen_card_index || 0) >= cardIndex;
  };

  // Estimativa de tempo de leitura
  const estimateReadingTime = (content: string | null): number => {
    if (!content) return 3;
    const words = content.split(/\s+/).length;
    return Math.max(2, Math.ceil(words / 200));
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (moduleLoading || cardsLoading) {
    return (
      <AppLayout showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!module) {
    return (
      <AppLayout showNav={false}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-serif font-semibold mb-2">Módulo não encontrado</h2>
          <Button variant="muted" onClick={() => navigate("/membros/app/modulos")}>
            Voltar aos módulos
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isCompleted = progress?.completed || false;
  const nextModule = getNextModule();
  const prevModule = getPrevModule();

  // Calcular progresso baseado em readings + selahs
  const totalItems = (organizedContent?.readings.length || 0) + (organizedContent?.selahs.length || 0);
  const completedItems = progress?.last_seen_card_index || 0;
  const progressPercent = isCompleted ? 100 : (totalItems > 0 ? Math.min(100, Math.round((completedItems / totalItems) * 100)) : 0);

  // Dados da atividade
  const activityConfig = MODULE_ACTIVITIES[slug || ""] || {
    title: `Atividade do Módulo ${module.order_index}`,
    description: "Complete a atividade deste módulo no seu Caderno."
  };

  return (
    <AppLayout showNav={false}>
      <div className="min-h-screen">
        {/* Header fixo */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border"
        >
          <div className="px-4 py-3 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigate("/membros/app/modulos")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="muted">Módulo {module.order_index}</Badge>
                  {isCompleted && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>
                <h1 className="font-serif font-semibold text-foreground truncate">
                  {module.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={progressPercent} variant="gradient" className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground">
                {completedItems}/{totalItems}
              </span>
            </div>
          </div>
        </motion.header>

        {/* Conteúdo organizado por seções */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="px-4 py-6 max-w-lg mx-auto space-y-8"
        >
          {/* 🎬 HERO: Vídeo de Boas-vindas */}
          {organizedContent?.welcomeVideo && (
            <motion.div variants={item}>
              <ModuleVideoHero
                title={`Boas-vindas — ${module.title}`}
                description={module.description || "Um começo seguro para entender as raízes do que você sente."}
                videoUrl={organizedContent.welcomeVideo.video_url}
              />
            </motion.div>
          )}

          {/* ⚡ Quick Actions */}
          <motion.div variants={item}>
            <QuickActionsModule
              onStartHere={() => scrollToSection(introSectionRef)}
              onMomentosSelah={() => scrollToSection(selahSectionRef)}
              onAtividade={goToActivity}
              onDownloads={() => scrollToSection(downloadsSectionRef)}
            />
          </motion.div>

          {/* ✨ SEÇÃO A: Começar por aqui */}
          <motion.div variants={item} ref={introSectionRef}>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <span>✨</span> Começar por aqui
            </h2>
            
            {organizedContent?.intro ? (
              <IntroCard
                title={organizedContent.intro.title}
                subtitle="Antes de avançar, faça esta pausa."
                content={organizedContent.intro.content_md || undefined}
                isCompleted={isCardCompleted(organizedContent.intro.order_index)}
                onOpen={() => openReading(organizedContent.intro!.id)}
                onSaveToNotebook={() => goToNotebook(organizedContent.intro?.title)}
                onComplete={() => completeCard.mutate(organizedContent.intro!.order_index)}
              />
            ) : (
              <IntroCard
                title="Começar por aqui"
                subtitle="Antes de avançar, faça esta pausa."
                content="Bem-vinda ao primeiro passo da sua jornada. Leia o conteúdo com calma, no seu tempo."
                isCompleted={false}
                onOpen={() => {}}
                onSaveToNotebook={() => goToNotebook()}
                onComplete={() => {}}
              />
            )}
          </motion.div>

          {/* 📖 SEÇÃO B: Leituras Principais */}
          {organizedContent?.readings && organizedContent.readings.length > 0 && (
            <motion.div variants={item}>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                <span>📖</span> Leituras Principais
              </h2>
              <div className="space-y-3">
                {organizedContent.readings.map((reading) => (
                  <ReadingCard
                    key={reading.id}
                    id={reading.id}
                    title={reading.title}
                    estimatedMinutes={estimateReadingTime(reading.content_md)}
                    status={getCardStatus(reading.order_index)}
                    onClick={() => openReading(reading.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* 🧘 SEÇÃO C: Momentos Selah */}
          {organizedContent?.selahs && organizedContent.selahs.length > 0 && (
            <motion.div variants={item} ref={selahSectionRef}>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                <span>🧘</span> Momentos Selah
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Pausas intencionais para reflexão. Faça no seu tempo.
              </p>
              <div className="space-y-4">
                {organizedContent.selahs.map((selah) => (
                  <SelahCard
                    key={selah.id}
                    id={selah.id}
                    title={selah.title}
                    videoUrl={selah.video_url}
                    reflection={selah.content_md || "Pause, respire e reflita sobre o que você está sentindo."}
                    isCompleted={isCardCompleted(selah.order_index)}
                    onComplete={() => completeCard.mutate(selah.order_index)}
                    onSaveToNotebook={() => goToNotebook(selah.title)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* 📝 SEÇÃO D: Atividade do Módulo */}
          <motion.div variants={item}>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <span>📝</span> Atividade do Módulo
            </h2>
            <ActivityCard
              title={activityConfig.title}
              description={activityConfig.description}
              moduleSlug={slug || ""}
              onClick={goToActivity}
            />
          </motion.div>

          {/* 📥 SEÇÃO E: PDFs para baixar */}
          {organizedContent?.downloads && organizedContent.downloads.length > 0 && (
            <motion.div variants={item} ref={downloadsSectionRef}>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                <span>📥</span> PDFs para baixar
              </h2>
              <div className="space-y-3">
                {organizedContent.downloads.map((download) => (
                  <DownloadCard
                    key={download.id}
                    title={download.title}
                    description={download.content_md?.replace(/\[LINK\]/g, '') || undefined}
                    fileUrl={download.cta_url}
                    onDownload={() => {
                      if (!download.cta_url || download.cta_url === "[LINK]") {
                        toast({ title: "Link em breve!", description: "O arquivo será disponibilizado em breve." });
                      }
                    }}
                    onPrint={() => {}}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ✅ SEÇÃO: Progresso/Conclusão */}
          <motion.div variants={item}>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <span>✅</span> Progresso
            </h2>
            <Card variant="elevated" className="border-2 border-dashed border-primary/30">
              <CardContent className="p-5 text-center">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                    <h3 className="font-serif font-semibold text-lg mb-2">
                      Módulo Concluído!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Você completou "{module.title}"
                    </p>
                    {nextModule && (
                      <Button
                        variant="gradient"
                        className="gap-2"
                        onClick={() => navigate(`/membros/app/modulos/${nextModule.slug}`)}
                      >
                        Próximo Módulo
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="font-serif font-semibold text-lg mb-2">
                      Continue com calma
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No seu tempo. Marque como concluído quando terminar todos os conteúdos.
                    </p>
                    <Button 
                      variant="gradient" 
                      onClick={() => completeModule.mutate()}
                      disabled={completeModule.isPending}
                    >
                      {completeModule.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Marcar como Concluído
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Bottom nav simplificada */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border p-4 pb-safe">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button
              variant="muted"
              className="flex-1"
              onClick={() => prevModule ? navigate(`/membros/app/modulos/${prevModule.slug}`) : navigate("/membros/app/modulos")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {prevModule ? "Anterior" : "Voltar"}
            </Button>
            {nextModule && (
              <Button
                variant="default"
                className="flex-1"
                onClick={() => navigate(`/membros/app/modulos/${nextModule.slug}`)}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

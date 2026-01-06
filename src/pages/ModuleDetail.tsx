import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
};

export default function ModuleDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [exerciseTexts, setExerciseTexts] = useState<Record<string, string>>({});

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

  const handleSaveExercise = (cardId: string, cardTitle: string) => {
    const text = exerciseTexts[cardId];
    if (!text?.trim()) return;
    
    // TODO: Save to notebook_entries
    toast({
      title: "Exercício salvo!",
      description: "Você pode revisar no seu Caderno.",
    });
  };

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
          <Button variant="muted" onClick={() => navigate("/membrosvmcm/app/modulos")}>
            Voltar aos módulos
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isCompleted = progress?.completed || false;
  const nextModule = getNextModule();
  const prevModule = getPrevModule();

  // Calculate progress percentage based on cards viewed
  const progressPercent = isCompleted ? 100 : (cards?.length ? Math.round(((progress?.last_seen_card_index || 0) / cards.length) * 100) : 0);

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
                onClick={() => navigate("/membrosvmcm/app/modulos")}
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
            <Progress value={progressPercent} variant="gradient" className="h-1.5" />
          </div>
        </motion.header>

        {/* Conteúdo */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="px-4 py-6 max-w-lg mx-auto space-y-4"
        >
          {/* Descrição do módulo */}
          {module.description && (
            <motion.p variants={item} className="text-muted-foreground text-sm">
              {module.description}
            </motion.p>
          )}

          {/* Cards de conteúdo */}
          {cards?.map((card) => (
            <motion.div key={card.id} variants={item}>
              {card.type === "exercise" ? (
                <ContentCard type="exercise" title={card.title}>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {card.content_md}
                    </p>
                    <Textarea
                      placeholder="Escreva sua resposta aqui..."
                      value={exerciseTexts[card.id] || ""}
                      onChange={(e) => setExerciseTexts(prev => ({ ...prev, [card.id]: e.target.value }))}
                      className="min-h-32 resize-none"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSaveExercise(card.id, card.title)}
                      disabled={!exerciseTexts[card.id]?.trim()}
                    >
                      Salvar no Caderno
                    </Button>
                  </div>
                </ContentCard>
              ) : card.type === "download" ? (
                <ContentCard type="download" title={card.title}>
                  <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{card.content_md}</p>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      if (card.cta_url && card.cta_url !== "[LINK]") {
                        window.open(card.cta_url, "_blank");
                      } else {
                        toast({ title: "Link em breve!", description: "O template será disponibilizado em breve." });
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    {card.cta_label || "Abrir no Canva"}
                  </Button>
                </ContentCard>
              ) : card.type === "video" ? (
                <ContentCard
                  type="video"
                  title={card.title}
                  content={card.content_md || undefined}
                  videoUrl={card.video_url && card.video_url !== "[LINK]" ? card.video_url : undefined}
                />
              ) : (
                <ContentCard
                  type={card.type as "text" | "model"}
                  title={card.title}
                  content={card.content_md || undefined}
                  showCopy={card.type === "model"}
                  showFavorite={card.type === "model"}
                  showSaveToNotebook={card.type === "model" || card.type === "text"}
                />
              )}
            </motion.div>
          ))}

          {/* Card de conclusão */}
          <motion.div variants={item}>
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
                        onClick={() => navigate(`/membrosvmcm/app/modulos/${nextModule.slug}`)}
                      >
                        Próximo Módulo
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="font-serif font-semibold text-lg mb-2">
                      Pronta para avançar?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Marque como concluído quando terminar todos os cards
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
              onClick={() => prevModule ? navigate(`/membrosvmcm/app/modulos/${prevModule.slug}`) : navigate("/membrosvmcm/app/modulos")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {prevModule ? "Anterior" : "Voltar"}
            </Button>
            {nextModule && (
              <Button
                variant="default"
                className="flex-1"
                onClick={() => navigate(`/membrosvmcm/app/modulos/${nextModule.slug}`)}
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

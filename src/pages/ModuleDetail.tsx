import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ContentCard } from "@/components/ContentCard";
import { ModelCard, SummaryCards, TipCard } from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
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

// Parsear modelo de texto para estrutura
function parseModelContent(content: string, title: string): { 
  objective: string; 
  whenToUse: string; 
  cards: string[] 
} {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Extrair objetivo e quando usar do conteúdo (novo formato)
  let objective = "Engajamento";
  let whenToUse = "quando você quer engajar sua audiência";
  
  // Procurar por **Objetivo:** e **Quando usar:** no conteúdo
  for (const line of lines) {
    const objMatch = line.match(/^\*\*Objetivo:\*\*\s*(.+)/i);
    if (objMatch) {
      objective = objMatch[1].trim();
      continue;
    }
    const whenMatch = line.match(/^\*\*Quando usar:\*\*\s*(.+)/i);
    if (whenMatch) {
      whenToUse = whenMatch[1].trim();
      continue;
    }
  }
  
  // Fallback: extrair do título se não encontrou no conteúdo
  if (objective === "Engajamento") {
    const titleMatch = title.match(/\(([^)]+)\)/);
    if (titleMatch) {
      objective = titleMatch[1];
    }
  }
  
  // Parsear cards removendo "Card X:", "Slide X:", "**Card X:**", etc.
  const cards: string[] = [];
  const seenContent = new Set<string>();
  let currentCard: string[] = [];
  
  for (const line of lines) {
    // Ignorar linhas de metadados
    if (line.match(/^\*\*(Objetivo|Quando usar|Título):\*\*/i)) {
      continue;
    }
    
    // Detectar início de novo card
    const cardMatch = line.match(/^\*\*(Card \d+|Slide \d+|CTA)(\s*\([^)]*\))?:\*\*\s*/i) ||
                      line.match(/^(Card \d+|Slide \d+|CTA)(\s*\([^)]*\))?:\s*/i);
    
    if (cardMatch) {
      // Salvar card anterior se existir
      if (currentCard.length > 0) {
        const cardText = currentCard.join('\n').trim();
        if (cardText && !seenContent.has(cardText.toLowerCase())) {
          seenContent.add(cardText.toLowerCase());
          cards.push(cardText);
        }
      }
      // Iniciar novo card com conteúdo após o marcador
      const contentAfterMarker = line
        .replace(/^\*\*(Card \d+|Slide \d+|CTA)(\s*\([^)]*\))?:\*\*\s*/i, '')
        .replace(/^(Card \d+|Slide \d+|CTA)(\s*\([^)]*\))?:\s*/i, '')
        .trim();
      currentCard = contentAfterMarker ? [contentAfterMarker] : [];
    } else {
      // Adicionar linha ao card atual
      currentCard.push(line);
    }
  }
  
  // Salvar último card
  if (currentCard.length > 0) {
    const cardText = currentCard.join('\n').trim();
    if (cardText && !seenContent.has(cardText.toLowerCase())) {
      seenContent.add(cardText.toLowerCase());
      cards.push(cardText);
    }
  }
  
  return { objective, whenToUse, cards };
}

// Parsear resumo de bullet points para array
function parseSummaryContent(content: string): string[] {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => 
    line.replace(/^[•\-\*]\s*/, '').trim()
  ).filter(Boolean);
}

// Extrair dica principal do Pulo do Gato
function parseTipContent(content: string): string {
  const lines = content.split('\n').filter(line => line.trim());
  // Pegar a primeira linha significativa
  const firstLine = lines[0]?.replace(/^[•\-\*]\s*/, '').trim() || content;
  return firstLine;
}

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

  // Parsear conteúdo do mapa para lista de itens
  const parseMapContent = (content: string): { number: string; title: string; description: string }[] => {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const match = line.match(/^(\d+)\.\s*([A-Z\s/]+)\s*=\s*(.+)$/i);
      if (match) {
        return { number: match[1], title: match[2].trim(), description: match[3].trim() };
      }
      return { number: '', title: '', description: line };
    }).filter(item => item.title || item.description);
  };

  // Organizar cards por tipo/seção
  const organizedContent = useMemo(() => {
    if (!cards) return null;
    
    const videoCards = cards.filter(c => c.type === "video");
    const textCards = cards.filter(c => c.type === "text");
    const modelCards = cards.filter(c => c.type === "model");
    const exerciseCards = cards.filter(c => c.type === "exercise");
    const downloadCards = cards.filter(c => c.type === "download");
    const tipCards = cards.filter(c => c.type === "tip");
    const summaryCards = cards.filter(c => c.type === "summary");
    const mapCards = cards.filter(c => c.type === "map");
    
    // Tip: usar card tipo "tip" ou derivar de text cards
    let tipContent: string | null = null;
    if (tipCards.length > 0 && tipCards[0].content_md) {
      tipContent = parseTipContent(tipCards[0].content_md);
    } else {
      const puloDoGatoCard = textCards.find(c => 
        c.title.toLowerCase().includes("pulo do gato") || 
        c.title.toLowerCase().includes("dica")
      );
      if (puloDoGatoCard?.content_md) {
        tipContent = parseTipContent(puloDoGatoCard.content_md);
      }
    }
    
    // Summary: usar card tipo "summary" ou derivar de video card
    let summaryItems: string[] = [];
    if (summaryCards.length > 0 && summaryCards[0].content_md) {
      summaryItems = parseSummaryContent(summaryCards[0].content_md);
    } else {
      const firstVideoCard = videoCards[0];
      if (firstVideoCard?.content_md && firstVideoCard.content_md.includes("•")) {
        summaryItems = parseSummaryContent(firstVideoCard.content_md);
      }
    }
    
    const firstVideoCard = videoCards[0];
    const firstMapCard = mapCards[0];
    
    // Separar card de oficina prática dos outros textos
    const oficinaCard = textCards.find(c => 
      c.title.toLowerCase().includes("oficina") || 
      c.title.toLowerCase().includes("entendendo o caso")
    );
    
    return {
      video: firstVideoCard,
      videoDescription: firstVideoCard?.content_md?.split("\n")[0] || null,
      summary: summaryItems.length > 0 ? summaryItems : null,
      tip: tipContent,
      map: firstMapCard,
      oficina: oficinaCard,
      models: modelCards,
      exercises: exerciseCards,
      downloads: downloadCards,
      otherText: textCards.filter(c => 
        !c.title.toLowerCase().includes("pulo do gato") && 
        !c.title.toLowerCase().includes("dica") &&
        !c.title.toLowerCase().includes("oficina") &&
        !c.title.toLowerCase().includes("entendendo o caso")
      ),
    };
  }, [cards]);

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

        {/* Conteúdo organizado por seções */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="px-4 py-6 max-w-lg mx-auto space-y-6"
        >
          {/* Descrição do módulo */}
          {module.description && (
            <motion.p variants={item} className="text-muted-foreground text-sm">
              {module.description}
            </motion.p>
          )}

          {/* 🎬 SEÇÃO: Aula (vídeo) */}
          {organizedContent?.video && (
            <motion.div variants={item}>
              <ContentCard
                type="video"
                title={organizedContent.video.title}
                content={organizedContent.videoDescription || undefined}
                videoUrl={organizedContent.video.video_url && organizedContent.video.video_url !== "[LINK]" 
                  ? organizedContent.video.video_url 
                  : undefined}
              />
            </motion.div>
          )}

          {/* ✅ SEÇÃO: Resumo do Módulo */}
          {organizedContent?.summary && organizedContent.summary.length > 0 && (
            <motion.div variants={item}>
              <SummaryCards items={organizedContent.summary} />
            </motion.div>
          )}

          {/* 📝 SEÇÃO: Pulo do Gato */}
          {organizedContent?.tip && (
            <motion.div variants={item}>
              <TipCard tip={organizedContent.tip} />
            </motion.div>
          )}

          {/* 📌 SEÇÃO: Mapa Visual da Anatomia */}
          {organizedContent?.map && organizedContent.map.content_md && (
            <motion.div variants={item} className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span>📌</span> {organizedContent.map.title}
              </h2>
              <Card variant="elevated" className="overflow-hidden">
                <CardContent className="p-0">
                  <ol className="divide-y divide-border">
                    {parseMapContent(organizedContent.map.content_md).map((mapItem, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                          {mapItem.number || idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-foreground">{mapItem.title}</span>
                          {mapItem.description && (
                            <span className="text-muted-foreground"> = {mapItem.description}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 📖 SEÇÃO: Oficina Prática */}
          {organizedContent?.oficina && (
            <motion.div variants={item}>
              <ContentCard
                type="text"
                title={organizedContent.oficina.title}
                content={organizedContent.oficina.content_md || undefined}
                showSaveToNotebook
              />
            </motion.div>
          )}

          {/* ✨ SEÇÃO: Modelos Prontos */}
          {organizedContent?.models && organizedContent.models.length > 0 && (
            <motion.div variants={item} className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span>✨</span> Modelos Prontos
              </h2>
              {organizedContent.models.map((modelCard) => {
                const parsed = parseModelContent(
                  modelCard.content_md || "", 
                  modelCard.title
                );
                return (
                  <ModelCard
                    key={modelCard.id}
                    title={modelCard.title.replace(/^Modelo:\s*/i, '')}
                    objective={parsed.objective}
                    whenToUse={parsed.whenToUse}
                    cards={parsed.cards}
                  />
                );
              })}
            </motion.div>
          )}

          {/* 💪 SEÇÃO: Exercícios */}
          {organizedContent?.exercises && organizedContent.exercises.length > 0 && (
            <motion.div variants={item} className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span>💪</span> Exercício
              </h2>
              {organizedContent.exercises.map((card) => (
                <ContentCard key={card.id} type="exercise" title={card.title.replace(/^Exercício:\s*/i, '')}>
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
              ))}
            </motion.div>
          )}

          {/* 📥 SEÇÃO: Templates */}
          {organizedContent?.downloads && organizedContent.downloads.length > 0 && (
            <motion.div variants={item} className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span>📥</span> Templates
              </h2>
              {organizedContent.downloads.map((card) => (
                <ContentCard key={card.id} type="download" title={card.title}>
                  <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                    {card.content_md?.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[LINK\]/g, 'Em breve')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
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
                      Abrir no Canva
                    </Button>
                  </div>
                </ContentCard>
              ))}
            </motion.div>
          )}

          {/* Outros cards de texto */}
          {organizedContent?.otherText && organizedContent.otherText.length > 0 && (
            organizedContent.otherText.map((card) => (
              <motion.div key={card.id} variants={item}>
                <ContentCard
                  type="text"
                  title={card.title}
                  content={card.content_md || undefined}
                  showSaveToNotebook
                />
              </motion.div>
            ))
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

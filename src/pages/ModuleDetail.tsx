import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle2, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

// Mock data
const moduleData = {
  slug: "capas-e-ganchos",
  number: 4,
  title: "Capas e Ganchos",
  description: "12 tipos de ganchos + fórmulas de capa que capturam atenção nos primeiros 0,5 segundos",
  progress: 60,
  cards: [
    {
      id: 1,
      type: "video" as const,
      title: "A Ciência do Primeiro Slide",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 2,
      type: "text" as const,
      title: "O Pulo do Gato",
      content: `A capa é seu anúncio de 0,5 segundo. Se não capturar atenção ali, o resto não importa.

O segredo? **Interrupção de padrão + promessa clara.**

• Quebre o esperado (formato, cor, ângulo)
• Prometa algo específico
• Use número ímpar quando possível
• Deixe curiosidade no ar

Lembre-se: a capa não precisa explicar tudo. Ela precisa fazer a pessoa PARAR.`,
    },
    {
      id: 3,
      type: "model" as const,
      title: "Modelo: Gancho de Contraste",
      content: `SLIDE 1 (Capa):
"O que 97% fazem vs. O que funciona"

SLIDE 2:
❌ Maioria: Posta todo dia sem estratégia
✅ Funciona: 3 carrosséis/semana com intenção

SLIDE 3:
❌ Maioria: Capa genérica e bonita
✅ Funciona: Capa que INTERROMPE

SLIDE 4:
❌ Maioria: CTA fraco ("deixa um like")
✅ Funciona: CTA específico com recompensa

SLIDE 5 (CTA):
Salva pra lembrar sempre que for postar 📌`,
    },
    {
      id: 4,
      type: "exercise" as const,
      title: "Sua Vez: Crie 3 Capas",
      content: "",
    },
    {
      id: 5,
      type: "download" as const,
      title: "Template Canva: 12 Modelos de Capa",
      content: "Clique no botão abaixo para acessar os templates editáveis no Canva.",
    },
  ],
};

export default function ModuleDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [exerciseText, setExerciseText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    toast({
      title: "Módulo concluído! 🎉",
      description: "Parabéns! Você avançou mais um passo.",
    });
  };

  const handleSaveExercise = () => {
    toast({
      title: "Exercício salvo!",
      description: "Você pode revisar no seu Caderno.",
    });
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
                onClick={() => navigate("/app/modulos")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="muted">Módulo {moduleData.number}</Badge>
                  {isCompleted && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>
                <h1 className="font-serif font-semibold text-foreground truncate">
                  {moduleData.title}
                </h1>
              </div>
            </div>
            <Progress value={moduleData.progress} variant="gradient" className="h-1.5" />
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
          <motion.p variants={item} className="text-muted-foreground text-sm">
            {moduleData.description}
          </motion.p>

          {/* Cards de conteúdo */}
          {moduleData.cards.map((card) => (
            <motion.div key={card.id} variants={item}>
              {card.type === "exercise" ? (
                <ContentCard type={card.type} title={card.title}>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Escreva 3 variações de capa para o seu nicho usando o formato de contraste:
                    </p>
                    <Textarea
                      placeholder="Ex: O que 90% dos [seu nicho] fazem vs. O que realmente funciona..."
                      value={exerciseText}
                      onChange={(e) => setExerciseText(e.target.value)}
                      className="min-h-32 resize-none"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveExercise}
                      disabled={!exerciseText.trim()}
                    >
                      Salvar no Caderno
                    </Button>
                  </div>
                </ContentCard>
              ) : card.type === "download" ? (
                <ContentCard type={card.type} title={card.title}>
                  <p className="text-sm text-muted-foreground mb-4">{card.content}</p>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Abrir no Canva
                  </Button>
                </ContentCard>
              ) : (
                <ContentCard
                  type={card.type}
                  title={card.title}
                  content={card.content}
                  videoUrl={card.videoUrl}
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
                      Você completou "Capas e Ganchos"
                    </p>
                    <Button
                      variant="gradient"
                      className="gap-2"
                      onClick={() => navigate("/app/modulos/conducao-slide")}
                    >
                      Próximo Módulo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="font-serif font-semibold text-lg mb-2">
                      Pronta para avançar?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Marque como concluído quando terminar todos os cards
                    </p>
                    <Button variant="gradient" onClick={handleComplete}>
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
              onClick={() => navigate("/app/modulos")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => navigate("/app/modulos/conducao-slide")}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

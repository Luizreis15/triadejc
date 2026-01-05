import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuickActionCard } from "@/components/QuickActionCard";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Library, 
  Lightbulb, 
  MessageSquare, 
  NotebookPen,
  Calendar,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Mock data - seria do Supabase
  const progress = 35;
  const currentModule = {
    number: 4,
    title: "Capas e Ganchos",
    slug: "capas-e-ganchos"
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
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-sm text-muted-foreground mb-1">Olá, Samira 👋</p>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Seu Caderno Digital
          </h1>
        </motion.header>

        {/* Card de Progresso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated" className="mb-6 overflow-hidden">
            <div className="bg-gradient-primary p-5 text-primary-foreground">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Seu progresso</p>
                  <p className="text-3xl font-serif font-bold">{progress}%</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
              </div>
              <Progress value={progress} className="h-2 bg-primary-foreground/20" />
            </div>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto hover:bg-transparent"
                onClick={() => navigate(`/app/modulos/${currentModule.slug}`)}
              >
                <div className="text-left">
                  <p className="text-xs text-muted-foreground mb-1">Continue de onde parou</p>
                  <p className="font-medium text-foreground">
                    Módulo {currentModule.number}: {currentModule.title}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Carrossel do dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card variant="interactive" className="bg-secondary text-secondary-foreground">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-foreground/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-semibold mb-1">Carrossel de Hoje</h3>
                  <p className="text-sm opacity-90 mb-3">
                    Que tal criar um carrossel de "3 erros que afastam seguidores"?
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                    onClick={() => navigate("/app/biblioteca")}
                  >
                    Ver modelo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ações Rápidas */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <motion.h2 variants={item} className="text-sm font-medium text-muted-foreground mb-3">
            Acesso rápido
          </motion.h2>
          
          <motion.div variants={item}>
            <QuickActionCard
              icon={<BookOpen className="w-5 h-5" />}
              title="Módulos"
              subtitle="10 módulos • 4 concluídos"
              onClick={() => navigate("/app/modulos")}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickActionCard
              icon={<Library className="w-5 h-5" />}
              title="Biblioteca"
              subtitle="Modelos, ganchos e CTAs"
              onClick={() => navigate("/app/biblioteca")}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickActionCard
              icon={<MessageSquare className="w-5 h-5" />}
              title="Ganchos"
              subtitle="50+ ganchos magnéticos"
              onClick={() => navigate("/app/biblioteca?tab=ganchos")}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickActionCard
              icon={<NotebookPen className="w-5 h-5" />}
              title="Meu Caderno"
              subtitle="Suas anotações e rascunhos"
              onClick={() => navigate("/app/caderno")}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickActionCard
              icon={<Calendar className="w-5 h-5" />}
              title="Calendário 30 dias"
              subtitle="Planeje sua semana"
              onClick={() => navigate("/app/calendario")}
            />
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

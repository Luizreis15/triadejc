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
  Sparkles,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Buscar perfil do usuário
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar módulos
  const { data: modules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // Buscar progresso do usuário
  const { data: progressData } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("progress")
        .select("*, modules(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calcular progresso geral
  const totalModules = modules?.length || 10;
  const completedModules = progressData?.filter(p => p.completed).length || 0;
  const overallProgress = Math.round((completedModules / totalModules) * 100);

  // Encontrar módulo atual (primeiro não completado)
  const currentModule = modules?.find(m => {
    const progress = progressData?.find(p => p.module_id === m.id);
    return !progress?.completed;
  }) || modules?.[0];

  const userName = profile?.name || user?.email?.split("@")[0] || "Aluna";

  const handleSignOut = async () => {
    await signOut();
    navigate("/membrosvmcm");
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
          className="mb-6 flex items-start justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">Olá, {userName} 👋</p>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Seu Caderno Digital
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
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
                  <p className="text-3xl font-serif font-bold">{overallProgress}%</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
              </div>
              <Progress value={overallProgress} className="h-2 bg-primary-foreground/20" />
            </div>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto hover:bg-transparent"
                onClick={() => currentModule && navigate(`/membrosvmcm/app/modulos/${currentModule.slug}`)}
              >
                <div className="text-left">
                  <p className="text-xs text-muted-foreground mb-1">Continue de onde parou</p>
                  <p className="font-medium text-foreground">
                    {currentModule ? `Módulo ${currentModule.order_index}: ${currentModule.title}` : "Comece o curso"}
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
                    onClick={() => navigate("/membrosvmcm/app/biblioteca")}
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
              subtitle={`${totalModules} módulos • ${completedModules} concluídos`}
              onClick={() => navigate("/membrosvmcm/app/modulos")}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickActionCard
              icon={<Library className="w-5 h-5" />}
              title="Biblioteca"
              subtitle="Modelos, ganchos e CTAs"
              onClick={() => navigate("/membrosvmcm/app/biblioteca")}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickActionCard
              icon={<MessageSquare className="w-5 h-5" />}
              title="Ganchos"
              subtitle="50+ ganchos magnéticos"
              onClick={() => navigate("/membrosvmcm/app/biblioteca?tab=ganchos")}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickActionCard
              icon={<NotebookPen className="w-5 h-5" />}
              title="Meu Caderno"
              subtitle="Suas anotações e rascunhos"
              onClick={() => navigate("/membrosvmcm/app/caderno")}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickActionCard
              icon={<Calendar className="w-5 h-5" />}
              title="Calendário 30 dias"
              subtitle="Planeje sua semana"
              onClick={() => navigate("/membrosvmcm/app/calendario")}
            />
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

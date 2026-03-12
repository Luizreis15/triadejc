import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { VideoPlayer, ProgressBar, ModuleCard, CalmModal } from "@/components/member";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { 
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Home() {
  const { user } = useAuth();
  const [calmModalOpen, setCalmModalOpen] = useState(false);

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("*").order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("progress").select("*").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const totalModules = modules.length;
  const completedModules = progress.filter(p => p.completed).length;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    if (!moduleProgress) return { progress: 0, status: "not_started" as const };
    if (moduleProgress.completed) return { progress: 100, status: "completed" as const };
    return { progress: moduleProgress.last_seen_card_index || 0, status: "in_progress" as const };
  };

  const currentModule = modules.find(m => {
    const p = getModuleProgress(m.id);
    return p.status === "in_progress";
  }) || modules[0];

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Video */}
      <motion.section className="space-y-4" variants={itemVariants}>
        <VideoPlayer title="Boas-vindas" className="shadow-lg" />
      </motion.section>

      {/* Welcome Text */}
      <motion.section className="text-center space-y-3" variants={itemVariants}>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Bem-vinda à Jornada Única
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {profile?.name ? `${profile.name}, e` : "E"}ste é seu refúgio. 
          Um espaço para ir com calma, no seu tempo. 
          Aqui você pode respirar, refletir e caminhar ao seu ritmo.
        </p>
      </motion.section>

      {/* Modules Preview */}
      <motion.section className="space-y-4" variants={itemVariants}>
        <h2 className="font-serif text-lg font-semibold text-foreground">Jornada Diária</h2>
        <div className="space-y-3">
          {modules.slice(0, 3).map((module, i) => {
            const { progress: moduleProgress, status } = getModuleProgress(module.id);
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <ModuleCard
                  title={module.title}
                  subtitle={module.description || ""}
                  slug={module.slug}
                  progress={moduleProgress}
                  status={status}
                  orderIndex={module.order_index}
                />
              </motion.div>
            );
          })}
        </div>
        {modules.length > 3 && (
          <Link to="/membros/app/modulos">
            <Button variant="ghost" className="w-full text-muted-foreground">Ver todos os módulos</Button>
          </Link>
        )}
      </motion.section>

      {/* Products Showcase Card */}
      <motion.div variants={itemVariants}>
        <Link to="/membros/app/conheca">
          <motion.div 
            className="bg-gradient-to-r from-secondary/20 to-accent/10 rounded-2xl p-5 border border-secondary/30 shadow-sm"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 30px -8px hsl(212 30% 21% / 0.12)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-base font-semibold text-foreground">Conheça todos os produtos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Método REVOLUZ, Mentoria DSL e mais</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Overall Progress */}
      <motion.section 
        className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Sua jornada</span>
          <motion.span 
            className="text-2xl font-serif font-semibold text-primary"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
          >
            {overallProgress}%
          </motion.span>
        </div>
        <ProgressBar value={overallProgress} size="lg" />
        <p className="text-xs text-muted-foreground mt-2">
          {completedModules} de {totalModules} módulos concluídos
        </p>
      </motion.section>

      {/* Continue Button */}
      {currentModule && (
        <motion.div variants={itemVariants}>
          <Link to={`/membros/app/modulos/${currentModule.slug}`}>
            <Button className="w-full h-14 rounded-xl text-base font-medium gap-2">
              Continuar de onde parei
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Calm Button */}
      <motion.button
        onClick={() => setCalmModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-full shadow-lg"
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.8 }}
        whileHover={{ scale: 1.08, boxShadow: "0 12px 30px -8px hsl(16 81% 23% / 0.3)" }}
        whileTap={{ scale: 0.95 }}
      >
        <Heart className="w-5 h-5" />
        <span className="text-sm font-medium">Preciso de calma</span>
      </motion.button>

      <CalmModal open={calmModalOpen} onOpenChange={setCalmModalOpen} />
    </motion.div>
  );
}

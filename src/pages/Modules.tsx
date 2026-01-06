import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ModuleCard } from "@/components/ModuleCard";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";

export default function Modules() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();

  // Buscar módulos
  const { data: modules, isLoading: modulesLoading } = useQuery({
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
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Determinar status de cada módulo
  const getModuleStatus = (moduleId: string, orderIndex: number) => {
    const progress = progressData?.find(p => p.module_id === moduleId);
    
    if (progress?.completed) return "completed" as const;
    if (progress) return "in_progress" as const;
    
    // Admin: todos os módulos disponíveis para revisão
    if (isAdmin) return "available" as const;
    
    // Primeiro módulo sempre disponível
    if (orderIndex === 1) return "available" as const;
    
    // Verificar se o módulo anterior foi completado
    const previousModule = modules?.find(m => m.order_index === orderIndex - 1);
    if (previousModule) {
      const prevProgress = progressData?.find(p => p.module_id === previousModule.id);
      if (prevProgress?.completed) return "available" as const;
    }
    
    return "locked" as const;
  };

  const completedModules = progressData?.filter(p => p.completed).length || 0;
  const totalModules = modules?.length || 0;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  if (modulesLoading) {
    return (
      <AppLayout>
        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            Módulos
          </h1>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <Progress value={overallProgress} variant="gradient" className="h-2" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {completedModules}/{totalModules}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {overallProgress}% concluído
          </p>
        </motion.header>

        {/* Lista de Módulos */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {modules?.map((module) => {
            const status = getModuleStatus(module.id, module.order_index);
            const progress = progressData?.find(p => p.module_id === module.id);
            const progressPercent = progress?.completed ? 100 : progress ? 50 : 0;

            return (
              <ModuleCard
                key={module.id}
                moduleNumber={module.order_index}
                title={module.title}
                description={module.description || ""}
                status={status}
                progress={progressPercent}
                onClick={() => navigate(`/membrosvmcm/app/modulos/${module.slug}`)}
              />
            );
          })}
        </motion.div>
      </div>
    </AppLayout>
  );
}

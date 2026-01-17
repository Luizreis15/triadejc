import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ModuleCard, ProgressBar } from "@/components/member";
import { Skeleton } from "@/components/ui/skeleton";

export default function Modules() {
  const { user } = useAuth();

  // Fetch modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
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

  // Fetch user progress
  const { data: progress = [] } = useQuery({
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

  // Calculate overall progress
  const totalModules = modules.length;
  const completedModules = progress.filter(p => p.completed).length;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Get module progress
  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    if (!moduleProgress) return { progress: 0, status: "not_started" as const };
    if (moduleProgress.completed) return { progress: 100, status: "completed" as const };
    return { progress: moduleProgress.last_seen_card_index || 0, status: "in_progress" as const };
  };

  if (modulesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Trilha da Jornada
        </h1>
        <p className="text-muted-foreground">
          Seu caminho de reflexão e acolhimento
        </p>
      </section>

      {/* Overall Progress */}
      <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Progresso geral</span>
          <span className="text-2xl font-serif font-semibold text-primary">{overallProgress}%</span>
        </div>
        <ProgressBar value={overallProgress} size="lg" />
        <p className="text-xs text-muted-foreground mt-2">
          {completedModules} de {totalModules} módulos concluídos
        </p>
      </section>

      {/* Modules List */}
      <section className="space-y-3">
        {modules.map((module) => {
          const { progress: moduleProgress, status } = getModuleProgress(module.id);
          return (
            <ModuleCard
              key={module.id}
              title={module.title}
              subtitle={module.description || ""}
              slug={module.slug}
              progress={moduleProgress}
              status={status}
              orderIndex={module.order_index}
            />
          );
        })}
      </section>

      {/* Encouragement */}
      <section className="text-center py-4">
        <p className="text-sm text-muted-foreground italic">
          "Cada passo conta. Vá com calma."
        </p>
      </section>
    </div>
  );
}

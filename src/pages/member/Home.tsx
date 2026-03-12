import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { VideoPlayer, ProgressBar, ModuleCard, CalmModal } from "@/components/member";

export default function Home() {
  const { user } = useAuth();
  const [calmModalOpen, setCalmModalOpen] = useState(false);

  // Fetch modules
  const { data: modules = [] } = useQuery({
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

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
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

  // Find where to continue
  const currentModule = modules.find(m => {
    const p = getModuleProgress(m.id);
    return p.status === "in_progress";
  }) || modules[0];

  return (
    <div className="space-y-8">
      {/* Welcome Video */}
      <section className="space-y-4">
        <VideoPlayer 
          title="Boas-vindas" 
          className="shadow-lg"
        />
      </section>

      {/* Welcome Text */}
      <section className="text-center space-y-3">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Bem-vinda à Jornada Única
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {profile?.name ? `${profile.name}, e` : "E"}ste é seu refúgio. 
          Um espaço para ir com calma, no seu tempo. 
          Aqui você pode respirar, refletir e caminhar ao seu ritmo.
        </p>
      </section>

      {/* Modules Preview - Jornada Diária */}
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Jornada Diária
        </h2>
        <div className="space-y-3">
          {modules.slice(0, 3).map((module) => {
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
        </div>
        
        {modules.length > 3 && (
          <Link to="/membros/app/modulos">
            <Button variant="ghost" className="w-full text-muted-foreground">
              Ver todos os módulos
            </Button>
          </Link>
        )}
      </section>

      {/* Products Showcase Card */}
      <Link to="/membros/app/conheca">
        <div className="bg-gradient-to-r from-secondary/20 to-accent/10 rounded-2xl p-5 border border-secondary/30 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]">
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
        </div>
      </Link>
      </section>

      {/* Overall Progress */}
      <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Sua jornada</span>
          <span className="text-2xl font-serif font-semibold text-primary">{overallProgress}%</span>
        </div>
        <ProgressBar value={overallProgress} size="lg" />
        <p className="text-xs text-muted-foreground mt-2">
          {completedModules} de {totalModules} módulos concluídos
        </p>
      </section>

      {/* Continue Button */}
      {currentModule && (
        <Link to={`/membros/app/modulos/${currentModule.slug}`}>
          <Button className="w-full h-14 rounded-xl text-base font-medium gap-2">
            Continuar de onde parei
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      )}

      {/* Calm Button - Floating */}
      <button
        onClick={() => setCalmModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
      >
        <Heart className="w-5 h-5" />
        <span className="text-sm font-medium">Preciso de calma</span>
      </button>

      {/* Calm Modal */}
      <CalmModal open={calmModalOpen} onOpenChange={setCalmModalOpen} />
    </div>
  );
}

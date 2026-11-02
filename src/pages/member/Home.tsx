import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEntitledCatalog } from "@/hooks/useEntitledCatalog";
import { useReadingResume } from "@/hooks/useReadingResume";
import { Button } from "@/components/ui/button";
import { VideoPlayer, ProgressBar, ModuleCard, CalmModal } from "@/components/member";
import { MemberEmptyState, MemberErrorState } from "@/components/member/MemberState";
import { Skeleton } from "@/components/ui/skeleton";

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
  const {
    catalogs,
    completedModules,
    totalModules,
    overallProgress,
    getModuleProgress,
    isLoading: modulesLoading,
    isError: modulesError,
    refetch: refetchModules,
  } = useEntitledCatalog();

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

  const welcomeTitle =
    catalogs.length === 1 ? `Bem-vinda à ${catalogs[0].product.name}` : "Bem-vinda";
  const currentModule = catalogs.length === 1 ? catalogs[0].current : undefined;
  const resume = useReadingResume();
  const resumeOwned = resume
    ? catalogs.some((catalog) => catalog.modules.some((module) => module.slug === resume.moduleSlug))
    : false;
  const resumeModule = resumeOwned
    ? catalogs.flatMap((catalog) => catalog.modules).find((module) => module.slug === resume?.moduleSlug)
    : undefined;
  const resumeProgress = resumeModule ? getModuleProgress(resumeModule.id).progress : Math.round((resume?.scrollRatio ?? 0) * 100);

  if (modulesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (modulesError) {
    return (
      <MemberErrorState
        onRetry={() => {
          void refetchModules();
        }}
      />
    );
  }

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
          {welcomeTitle}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {profile?.name ? `${profile.name}, e` : "E"}ste é seu refúgio. 
          Um espaço para ir com calma, no seu tempo. 
          Aqui você pode respirar, refletir e caminhar ao seu ritmo.
        </p>
      </motion.section>

      {(resumeOwned && resume) || currentModule ? (
        <motion.section variants={itemVariants}>
          <Link
            to={
              resumeOwned && resume
                ? `/membros/app/modulos/${resume.moduleSlug}?ler=${resume.cardId}`
                : `/membros/app/modulos/${currentModule?.slug ?? ""}`
            }
            className="member-module-card block rounded-2xl border border-primary/30 p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary">Continue de onde parou</p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-foreground">
              {resumeOwned && resume ? resume.cardTitle : currentModule?.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {resumeOwned && resume ? resume.moduleTitle : "Sua próxima etapa"}
            </p>
            <div className="mt-4">
              <ProgressBar value={resumeOwned ? resumeProgress : overallProgress} size="md" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{resumeOwned ? resumeProgress : overallProgress}% desta jornada</p>
          </Link>
        </motion.section>
      ) : null}

      {catalogs.length === 0 ? (
        <motion.section variants={itemVariants}>
          <MemberEmptyState
            title="Nenhum produto nesta conta"
            body="O acesso ainda não aparece aqui. Se você já comprou, fale com o suporte."
          />
        </motion.section>
      ) : (
        catalogs.map((catalog) => (
          <motion.section key={catalog.product.id} className="space-y-4" variants={itemVariants}>
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {catalogs.length === 1 ? "Jornada Diária" : catalog.product.name}
              </h2>
              {catalogs.length > 1 && (
                <span className="text-sm font-serif text-primary">{catalog.percent}%</span>
              )}
            </div>
            <div className="space-y-3">
              {catalog.modules.length === 0 ? (
                <MemberEmptyState
                  title="Produto ainda sem módulos"
                  body={`${catalog.product.name} já está na sua conta. O conteúdo aparece aqui quando for publicado.`}
                />
              ) : (
                catalog.modules.slice(0, 3).map((module, i) => {
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
                        enterIndex={i}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
            {catalog.modules.length > 3 && (
              <Link to="/membros/app/modulos">
                <Button variant="ghost" className="w-full text-muted-foreground">Ver todos os módulos</Button>
              </Link>
            )}
            {catalogs.length > 1 && catalog.current && (
              <Link to={`/membros/app/modulos/${catalog.current.slug}`}>
                <Button className="w-full h-12 rounded-xl text-base font-medium gap-2">
                  Continuar {catalog.product.name}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.section>
        ))
      )}

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

      {catalogs.length === 1 && (
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
      )}

      {catalogs.length === 1 && currentModule && (
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

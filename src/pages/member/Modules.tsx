import { useEntitledCatalog } from "@/hooks/useEntitledCatalog";
import { ModuleCard, ProgressBar } from "@/components/member";
import { MemberEmptyState, MemberErrorState } from "@/components/member/MemberState";
import { Skeleton } from "@/components/ui/skeleton";

export default function Modules() {
  const {
    catalogs,
    getModuleProgress,
    isLoading: modulesLoading,
    isError: modulesError,
    refetch: refetchModules,
  } = useEntitledCatalog();

  if (modulesError) {
    return (
      <MemberErrorState
        onRetry={() => {
          void refetchModules();
        }}
      />
    );
  }

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

      {catalogs.length === 0 ? (
        <MemberEmptyState
          title="Nenhum produto nesta conta"
          body="O acesso ainda não aparece aqui. Se você já comprou, fale com o suporte."
        />
      ) : (
        catalogs.map((catalog) => (
          <section key={catalog.product.id} className="space-y-3">
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  {catalogs.length === 1 ? "Progresso geral" : catalog.product.name}
                </span>
                <span className="text-2xl font-serif font-semibold text-primary">{catalog.percent}%</span>
              </div>
              <ProgressBar value={catalog.percent} size="lg" />
              <p className="text-xs text-muted-foreground mt-2">
                {catalog.completed} de {catalog.total} módulos concluídos
              </p>
            </div>

            {catalog.modules.length === 0 ? (
              <MemberEmptyState
                title="Produto ainda sem módulos"
                body={`${catalog.product.name} já está na sua conta. O conteúdo aparece aqui quando for publicado.`}
              />
            ) : (
              catalog.modules.map((module, index) => {
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
                    enterIndex={index}
                  />
                );
              })
            )}
          </section>
        ))
      )}

      {/* Encouragement */}
      <section className="text-center py-4">
        <p className="text-sm text-muted-foreground italic">
          "Cada passo conta. Vá com calma."
        </p>
      </section>
    </div>
  );
}

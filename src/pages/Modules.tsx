import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ModuleCard } from "@/components/ModuleCard";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    id: 1,
    slug: "virada-da-vitrine",
    title: "A Virada da Vitrine",
    description: "O que é carrossel magnético, intenção, percepção e promessa",
    status: "completed" as const,
    progress: 100,
  },
  {
    id: 2,
    slug: "posicionamento",
    title: "Posicionamento que Aparece",
    description: "Falar com todo mundo x atrair o certo",
    status: "completed" as const,
    progress: 100,
  },
  {
    id: 3,
    slug: "anatomia-carrossel",
    title: "A Anatomia do Carrossel",
    description: "Estrutura base: capa > condução > prova > CTA",
    status: "completed" as const,
    progress: 100,
  },
  {
    id: 4,
    slug: "capas-e-ganchos",
    title: "Capas e Ganchos",
    description: "12 tipos de ganchos + fórmulas de capa",
    status: "in_progress" as const,
    progress: 60,
  },
  {
    id: 5,
    slug: "conducao-slide",
    title: "Condução Slide a Slide",
    description: "Progressão, ritmo e clareza",
    status: "available" as const,
    progress: 0,
  },
  {
    id: 6,
    slug: "autoridade-silenciosa",
    title: "Autoridade Silenciosa",
    description: "Prova sem mendigar: estudo de caso, bastidor, critério",
    status: "locked" as const,
    progress: 0,
  },
  {
    id: 7,
    slug: "quebra-objecoes",
    title: "Quebra de Objeções",
    description: "Tempo, nicho, vergonha, 'não funciona comigo'",
    status: "locked" as const,
    progress: 0,
  },
  {
    id: 8,
    slug: "ctas-magneticos",
    title: "CTAs Magnéticos",
    description: "Seguir, salvar, comentar, DM, compra",
    status: "locked" as const,
    progress: 0,
  },
  {
    id: 9,
    slug: "producao-lote",
    title: "Produção Rápida (Lote)",
    description: "10 carrosséis em 2 horas",
    status: "locked" as const,
    progress: 0,
  },
  {
    id: 10,
    slug: "distribuicao-diagnostico",
    title: "Distribuição e Diagnóstico",
    description: "Fixados, reaproveitamento, análise semanal",
    status: "locked" as const,
    progress: 0,
  },
];

export default function Modules() {
  const navigate = useNavigate();
  const completedModules = modules.filter(m => m.status === "completed").length;
  const overallProgress = Math.round((completedModules / modules.length) * 100);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
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
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            Módulos
          </h1>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <Progress value={overallProgress} variant="gradient" className="h-2" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {completedModules}/{modules.length}
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
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              moduleNumber={module.id}
              title={module.title}
              description={module.description}
              status={module.status}
              progress={module.progress}
              onClick={() => navigate(`/app/modulos/${module.slug}`)}
            />
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}

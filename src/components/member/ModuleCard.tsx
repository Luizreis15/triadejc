import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";

interface ModuleCardProps {
  title: string;
  subtitle: string;
  slug: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "locked";
  coverImage?: string;
  orderIndex: number;
  enterIndex?: number;
}

export function ModuleCard({
  title,
  subtitle,
  slug,
  progress,
  status,
  orderIndex,
  enterIndex = 0,
}: ModuleCardProps) {
  const reduce = useReducedMotion();
  const isLocked = status === "locked";

  const statusConfig = {
    not_started: { label: "Começar", color: "text-muted-foreground" },
    in_progress: { label: "Continuar", color: "text-primary" },
    completed: { label: "Concluído", color: "text-green-600" },
    locked: { label: "Bloqueado", color: "text-muted-foreground" },
  };

  const { label, color } = statusConfig[status];

  const content = (
    <motion.div
      className={cn(
        "member-module-card group relative rounded-2xl border border-border/60 p-4",
        !isLocked && "transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99]",
        isLocked && "opacity-60",
      )}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : Math.min(enterIndex, 10) * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex gap-4">
        <div className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors",
          status === "completed"
            ? "bg-green-100 text-green-700"
            : status === "in_progress"
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground",
        )}>
          {status === "completed" ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : isLocked ? (
            <Lock className="h-5 w-5" />
          ) : (
            <span className="font-serif text-xl font-semibold">{orderIndex}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
              {title}
            </h3>
            {!isLocked && (
              <span className={cn("shrink-0 text-xs font-medium", color)}>{progress}%</span>
            )}
          </div>
          <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">
            {subtitle || label}
          </p>
          {!isLocked && <ProgressBar value={progress} size="sm" />}
        </div>

        {!isLocked && (
          <div className="flex items-center">
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  );

  if (isLocked) return content;

  return (
    <Link to={`/membros/app/modulos/${slug}`}>
      {content}
    </Link>
  );
}

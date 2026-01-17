import { Link } from "react-router-dom";
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
}

export function ModuleCard({ 
  title, 
  subtitle, 
  slug, 
  progress, 
  status,
  coverImage,
  orderIndex
}: ModuleCardProps) {
  const isLocked = status === "locked";
  
  const statusConfig = {
    not_started: { label: "Começar", color: "text-muted-foreground" },
    in_progress: { label: "Continuar", color: "text-primary" },
    completed: { label: "Concluído", color: "text-green-600" },
    locked: { label: "Bloqueado", color: "text-muted-foreground" },
  };

  const { label, color } = statusConfig[status];

  const content = (
    <div className={cn(
      "group relative bg-card rounded-2xl p-4 shadow-sm border border-border/50 transition-all duration-300",
      !isLocked && "hover:shadow-md hover:border-primary/20 active:scale-[0.98]",
      isLocked && "opacity-60"
    )}>
      <div className="flex gap-4">
        {/* Module number or image */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors",
          status === "completed" 
            ? "bg-green-100 text-green-600" 
            : status === "in_progress"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {status === "completed" ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : isLocked ? (
            <Lock className="w-5 h-5" />
          ) : (
            <span className="text-xl font-serif font-semibold">{orderIndex}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-foreground leading-tight mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {subtitle}
          </p>
          
          {!isLocked && (
            <div className="flex items-center gap-3">
              <ProgressBar value={progress} size="sm" className="flex-1" />
              <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
            </div>
          )}
        </div>

        {/* Arrow */}
        {!isLocked && (
          <div className="flex items-center">
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link to={`/membros/app/modulos/${slug}`}>
      {content}
    </Link>
  );
}

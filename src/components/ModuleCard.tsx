import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  progress?: number;
  status: "locked" | "available" | "in_progress" | "completed";
  moduleNumber: number;
  onClick?: () => void;
}

export function ModuleCard({
  title,
  description,
  progress = 0,
  status,
  moduleNumber,
  onClick,
}: ModuleCardProps) {
  const statusConfig = {
    locked: {
      icon: Lock,
      badge: "Bloqueado",
      badgeVariant: "muted" as const,
      cardClass: "opacity-60",
    },
    available: {
      icon: PlayCircle,
      badge: "Disponível",
      badgeVariant: "accent" as const,
      cardClass: "",
    },
    in_progress: {
      icon: PlayCircle,
      badge: "Em andamento",
      badgeVariant: "default" as const,
      cardClass: "",
    },
    completed: {
      icon: CheckCircle2,
      badge: "Concluído",
      badgeVariant: "success" as const,
      cardClass: "",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const isClickable = status !== "locked";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant={isClickable ? "interactive" : "default"}
        className={cn(config.cardClass, !isClickable && "cursor-not-allowed")}
        onClick={isClickable ? onClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-serif font-bold text-primary">
                {moduleNumber.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-serif font-semibold text-foreground line-clamp-1">
                  {title}
                </h3>
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    status === "completed" ? "text-success" : "text-muted-foreground"
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {description}
              </p>
              <div className="flex items-center justify-between gap-3">
                <Badge variant={config.badgeVariant}>{config.badge}</Badge>
                {(status === "in_progress" || status === "completed") && (
                  <div className="flex-1 max-w-24">
                    <Progress
                      value={progress}
                      variant={status === "completed" ? "success" : "gradient"}
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

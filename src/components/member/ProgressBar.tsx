import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const reduce = useReducedMotion();
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Progresso</span>
          <span className="text-xs font-medium text-foreground">{percentage}%</span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-muted/80", heights[size])}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(24_82%_58%)]"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

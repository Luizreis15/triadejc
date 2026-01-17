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
  size = "md"
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-muted-foreground">Progresso</span>
          <span className="text-xs font-medium text-foreground">{percentage}%</span>
        </div>
      )}
      <div className={cn(
        "w-full rounded-full bg-muted/50 overflow-hidden",
        heights[size]
      )}>
        <div 
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

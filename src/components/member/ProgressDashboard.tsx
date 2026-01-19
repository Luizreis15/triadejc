import { Book, BookOpen, CheckCircle, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressDashboardProps {
  exercisesCompleted: number;
  exercisesTotal: number;
  devotionalCompleted: number;
  devotionalTotal: number;
  checkinsCount: number;
  streak?: number;
}

export function ProgressDashboard({
  exercisesCompleted,
  exercisesTotal,
  devotionalCompleted,
  devotionalTotal,
  checkinsCount,
  streak = 0,
}: ProgressDashboardProps) {
  const exercisePercent = exercisesTotal > 0 ? (exercisesCompleted / exercisesTotal) * 100 : 0;
  const devotionalPercent = devotionalTotal > 0 ? (devotionalCompleted / devotionalTotal) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Exercises Progress */}
      <div className="bg-card rounded-xl p-4 border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Book className="w-4 h-4" />
          <span className="text-xs font-medium">Exercícios</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold text-foreground">
            {exercisesCompleted}
          </span>
          <span className="text-sm text-muted-foreground mb-1">
            /{exercisesTotal}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${exercisePercent}%` }}
          />
        </div>
      </div>

      {/* Devotional Progress */}
      <div className="bg-card rounded-xl p-4 border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-secondary">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs font-medium">Devocional</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold text-foreground">
            {devotionalCompleted}
          </span>
          <span className="text-sm text-muted-foreground mb-1">
            /{devotionalTotal} dias
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary rounded-full transition-all duration-500"
            style={{ width: `${devotionalPercent}%` }}
          />
        </div>
      </div>

      {/* Check-ins count */}
      <div className="bg-card rounded-xl p-4 border border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-accent">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Check-ins</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold text-foreground">
            {checkinsCount}
          </span>
          <span className="text-sm text-muted-foreground mb-1">
            registros
          </span>
        </div>
      </div>

      {/* Streak */}
      <div className={cn(
        "bg-card rounded-xl p-4 border border-border/50 space-y-2",
        streak >= 3 && "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800"
      )}>
        <div className="flex items-center gap-2 text-orange-500">
          <Flame className={cn("w-4 h-4", streak >= 3 && "animate-pulse")} />
          <span className="text-xs font-medium">Sequência</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold text-foreground">
            {streak}
          </span>
          <span className="text-sm text-muted-foreground mb-1">
            dias
          </span>
        </div>
      </div>
    </div>
  );
}

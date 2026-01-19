import { Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { DevotionalDay } from "@/hooks/useDevotional";

interface DevotionalTimelineProps {
  days: DevotionalDay[];
  isDayCompleted: (id: string) => boolean;
  isDayUnlocked: (dayNumber: number) => boolean;
  onSelectDay: (day: DevotionalDay) => void;
  completedCount: number;
  totalDays: number;
}

export function DevotionalTimeline({
  days,
  isDayCompleted,
  isDayUnlocked,
  onSelectDay,
  completedCount,
  totalDays,
}: DevotionalTimelineProps) {
  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Jornada de 7 Dias</span>
          <span className="text-sm text-muted-foreground">{completedCount}/{totalDays} dias</span>
        </div>
        
        {/* Day circles */}
        <div className="flex justify-between items-center">
          {days.map((day, index) => {
            const completed = isDayCompleted(day.id);
            const unlocked = isDayUnlocked(day.day_number);
            const isNext = unlocked && !completed;
            
            return (
              <button
                key={day.id}
                onClick={() => unlocked && onSelectDay(day)}
                disabled={!unlocked}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all relative",
                  completed && "bg-success text-success-foreground",
                  isNext && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                  !completed && !isNext && unlocked && "bg-muted text-muted-foreground",
                  !unlocked && "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                {completed ? (
                  <Check className="w-5 h-5" />
                ) : !unlocked ? (
                  <Lock className="w-4 h-4" />
                ) : isNext ? (
                  <Play className="w-4 h-4 ml-0.5" />
                ) : (
                  <span className="text-sm font-medium">{day.day_number}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Cards */}
      <div className="space-y-3">
        {days.map((day) => {
          const completed = isDayCompleted(day.id);
          const unlocked = isDayUnlocked(day.day_number);
          const isNext = unlocked && !completed;

          return (
            <button
              key={day.id}
              onClick={() => unlocked && onSelectDay(day)}
              disabled={!unlocked}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                unlocked && "hover:shadow-card active:scale-[0.99]",
                completed && "bg-success/5 border-success/30",
                isNext && "bg-primary/5 border-primary/30",
                !completed && !isNext && unlocked && "bg-card border-border/50",
                !unlocked && "bg-muted/30 border-border/30 opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Day number */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  completed ? "bg-success/20" : isNext ? "bg-primary/20" : "bg-muted"
                )}>
                  {completed ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : !unlocked ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <span className="font-medium text-foreground">{day.day_number}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      Dia {day.day_number}
                    </span>
                    {isNext && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Hoje
                      </span>
                    )}
                    {completed && (
                      <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                        Concluído
                      </span>
                    )}
                  </div>
                  <h3 className={cn(
                    "font-medium text-foreground",
                    completed && "line-through opacity-70"
                  )}>
                    {day.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {day.scripture_reference}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

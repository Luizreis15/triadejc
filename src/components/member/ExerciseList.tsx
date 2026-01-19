import { Check, Clock, ChevronRight, Map, Theater, Mail, Clock3, Baby, Sparkles, Shield, Wind, Heart, Crown, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise } from "@/hooks/useExercises";

const iconMap: Record<string, any> = {
  map: Map,
  theater: Theater,
  mail: Mail,
  clock: Clock3,
  baby: Baby,
  sparkles: Sparkles,
  shield: Shield,
  wind: Wind,
  heart: Heart,
  crown: Crown,
  "pen-line": PenLine,
};

interface ExerciseListProps {
  exercises: Exercise[];
  isCompleted: (id: string) => boolean;
  onSelect: (exercise: Exercise) => void;
  completedCount: number;
  progressPercent: number;
}

export function ExerciseList({ 
  exercises, 
  isCompleted, 
  onSelect, 
  completedCount,
  progressPercent 
}: ExerciseListProps) {
  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Seu progresso</span>
          <span className="text-sm text-muted-foreground">{completedCount}/{exercises.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3">
        {exercises.map((exercise, index) => {
          const completed = isCompleted(exercise.id);
          const IconComponent = iconMap[exercise.icon] || PenLine;
          
          return (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                "hover:shadow-card active:scale-[0.99]",
                completed 
                  ? "bg-success/5 border-success/30" 
                  : "bg-card border-border/50"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon/Number */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  completed ? "bg-success/20" : "bg-primary/10"
                )}>
                  {completed ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <IconComponent className="w-5 h-5 text-primary" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      Exercício {index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exercise.estimated_time}min
                    </span>
                  </div>
                  <h3 className={cn(
                    "font-medium text-foreground",
                    completed && "line-through opacity-70"
                  )}>
                    {exercise.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {exercise.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

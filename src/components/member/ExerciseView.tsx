import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Exercise } from "@/hooks/useExercises";
import { cn } from "@/lib/utils";

interface ExerciseViewProps {
  exercise: Exercise;
  existingContent?: string;
  onSave: (content: string) => Promise<void>;
  onBack: () => void;
  isCompleted: boolean;
}

export function ExerciseView({ 
  exercise, 
  existingContent,
  onSave, 
  onBack,
  isCompleted 
}: ExerciseViewProps) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingContent) {
      try {
        const parsed = JSON.parse(existingContent);
        if (Array.isArray(parsed)) {
          setAnswers(parsed);
        }
      } catch {
        // If not JSON, treat as single answer
        setAnswers([existingContent]);
      }
    } else {
      setAnswers(new Array(exercise.prompt_questions.length).fill(""));
    }
  }, [existingContent, exercise.prompt_questions.length]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(JSON.stringify(answers));
      toast({
        title: "Exercício salvo! ✨",
        description: "Suas respostas foram registradas no seu caderno.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasContent = answers.some(a => a.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-serif font-semibold text-foreground">
            {exercise.title}
          </h2>
          {isCompleted && (
            <span className="text-xs text-success flex items-center gap-1">
              <Check className="w-3 h-3" /> Concluído
            </span>
          )}
        </div>
      </div>

      {/* Scripture */}
      {exercise.scripture_reference && (
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-serif text-foreground italic">
                "{exercise.scripture_text}"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                — {exercise.scripture_reference}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-muted-foreground">
        {exercise.description}
      </p>

      {/* Questions */}
      <div className="space-y-6">
        {exercise.prompt_questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {exercise.prompt_questions.length > 1 ? `${index + 1}. ` : ""}{question}
            </label>
            <Textarea
              value={answers[index] || ""}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Escreva sua resposta aqui..."
              className="min-h-[120px] resize-none rounded-xl"
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <Button 
        className="w-full h-12"
        onClick={handleSave}
        disabled={!hasContent || saving}
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Salvando..." : isCompleted ? "Atualizar Respostas" : "Salvar Exercício"}
      </Button>
    </div>
  );
}

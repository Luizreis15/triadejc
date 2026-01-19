import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Save, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { DevotionalDay } from "@/hooks/useDevotional";
import { MarkdownContent } from "@/components/member/MarkdownPreview";

interface DevotionalDayViewProps {
  day: DevotionalDay;
  existingContent?: string;
  onSave: (content: string) => Promise<void>;
  onBack: () => void;
  isCompleted: boolean;
  hasNext: boolean;
  onNext?: () => void;
}

export function DevotionalDayView({ 
  day, 
  existingContent,
  onSave, 
  onBack,
  isCompleted,
  hasNext,
  onNext,
}: DevotionalDayViewProps) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAnswer(existingContent || "");
  }, [existingContent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(answer);
      toast({
        title: "Devocional salvo! ✨",
        description: hasNext 
          ? "Parabéns! O próximo dia foi desbloqueado." 
          : "Você completou a jornada devocional!",
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
          <span className="text-xs text-muted-foreground">
            Dia {day.day_number} de 7
          </span>
          <h2 className="font-serif font-semibold text-foreground">
            {day.title}
          </h2>
          {isCompleted && (
            <span className="text-xs text-success flex items-center gap-1 mt-1">
              <Check className="w-3 h-3" /> Concluído
            </span>
          )}
        </div>
      </div>

      {/* Scripture Card */}
      <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
        <div className="flex items-start gap-3">
          <BookOpen className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-serif text-lg text-foreground italic leading-relaxed">
              "{day.scripture_text}"
            </p>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              — {day.scripture_reference}
            </p>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Reflexão</h3>
        <div className="prose-sm text-muted-foreground">
          <MarkdownContent content={day.reflection_md} />
        </div>
      </div>

      {/* Heart Question */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">💭 Pergunta para o Coração</h3>
        <p className="text-foreground bg-secondary/10 rounded-xl p-4 italic">
          {day.heart_question}
        </p>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escreva sua reflexão aqui..."
          className="min-h-[120px] resize-none rounded-xl"
        />
      </div>

      {/* Prayer */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">🙏 Oração</h3>
        <div className="prose-sm text-muted-foreground bg-muted/30 rounded-xl p-4 italic">
          <MarkdownContent content={day.prayer_md} />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button 
          className="w-full h-12"
          onClick={handleSave}
          disabled={!answer.trim() || saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : isCompleted ? "Atualizar" : "Completar Dia"}
        </Button>
        
        {isCompleted && hasNext && onNext && (
          <Button 
            variant="outline"
            className="w-full h-12"
            onClick={onNext}
          >
            Próximo Dia
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

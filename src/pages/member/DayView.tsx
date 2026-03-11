import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Sparkles, PenLine, Save, CheckCircle2, ChevronRight, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/member";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useModuleDays, type ModuleDay } from "@/hooks/useModuleDays";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function DayView() {
  const { slug, dayId } = useParams<{ slug: string; dayId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch module
  const { data: module } = useQuery({
    queryKey: ["module", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { days, isDayCompleted, isDayUnlocked, saveExercises, markDayComplete, useDayExercises } = useModuleDays(module?.id);

  // Current day
  const day = days.find(d => d.id === dayId);
  const dayIndex = days.findIndex(d => d.id === dayId);
  const nextDay = dayIndex >= 0 && dayIndex < days.length - 1 ? days[dayIndex + 1] : null;
  const isCompleted = day ? isDayCompleted(day.id) : false;

  // Exercise state
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [saving, setSaving] = useState(false);

  // Load saved exercises
  const { data: savedExercises } = useDayExercises(dayId);

  useEffect(() => {
    if (savedExercises) {
      // Parse saved content
      const parts = savedExercises.split("\n\n**Exercício 2:**\n");
      if (parts.length === 2) {
        const q1Part = parts[0].replace("**Exercício 1:**\n", "");
        setQ1(q1Part);
        setQ2(parts[1]);
      }
    } else {
      setQ1("");
      setQ2("");
    }
  }, [savedExercises]);

  const handleSave = async () => {
    if (!day || !slug) return;
    setSaving(true);
    try {
      await saveExercises.mutateAsync({
        dayId: day.id,
        moduleSlug: slug,
        q1Answer: q1,
        q2Answer: q2,
      });
      toast({ title: "Respostas salvas! 💾" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleComplete = async () => {
    if (!day || !slug) return;
    // Save exercises first
    if (q1 || q2) {
      await saveExercises.mutateAsync({
        dayId: day.id,
        moduleSlug: slug,
        q1Answer: q1,
        q2Answer: q2,
      });
    }
    try {
      await markDayComplete.mutateAsync({ dayId: day.id, moduleSlug: slug });
      toast({ title: "Dia concluído! ✨", description: "Parabéns por mais um dia de jornada." });
    } catch {
      toast({ title: "Erro ao concluir", variant: "destructive" });
    }
  };

  const handleNext = () => {
    if (nextDay && slug) {
      navigate(`/membros/app/modulos/${slug}/dia/${nextDay.id}`);
    }
  };

  if (!day) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const totalDays = days.length;

  return (
    <div className="space-y-6 pb-8">
      {/* Back */}
      <Link
        to={`/membros/app/modulos/${slug}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Voltar ao módulo</span>
      </Link>

      {/* Video */}
      {day.top_video_url && (
        <VideoPlayer videoUrl={day.top_video_url} title={day.title} className="shadow-lg" />
      )}

      {/* Day Header */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Dia {day.day_in_module} de {totalDays}
        </p>
        <h1 className="font-serif text-2xl font-semibold text-foreground">{day.title}</h1>
        {isCompleted && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Concluído
          </div>
        )}
      </div>

      {/* Message */}
      <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-0">
        {day.message_text.split("\n").map((line, i) => (
          <p key={i} className={cn(
            "text-foreground leading-relaxed",
            line.trim() === "" ? "h-4" : ""
          )}>
            {line}
          </p>
        ))}
      </section>

      {/* Verse */}
      {day.verse_reference && (
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-serif font-semibold text-primary">{day.verse_reference}</span>
          </div>
        </section>
      )}

      {/* Confession */}
      {day.confession_text && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif font-semibold text-amber-900">Confissão de Fé</h2>
          </div>
          <p className="text-amber-800 italic leading-relaxed font-serif">
            "{day.confession_text}"
          </p>
        </section>
      )}

      {/* Exercises */}
      {(day.exercise_q1 || day.exercise_q2) && (
        <section className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-green-600" />
            <h2 className="font-serif font-semibold text-foreground">Escreva:</h2>
          </div>

          {day.exercise_q1 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{day.exercise_q1}</p>
              <Textarea
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
                placeholder="Escreva sua resposta aqui..."
                className="min-h-[100px] bg-background border-border/50 focus:border-primary/30 resize-none"
              />
            </div>
          )}

          {day.exercise_q2 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{day.exercise_q2}</p>
              <Textarea
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
                placeholder="Escreva sua resposta aqui..."
                className="min-h-[100px] bg-background border-border/50 focus:border-primary/30 resize-none"
              />
            </div>
          )}
        </section>
      )}

      {/* PDF */}
      {day.pdf_url && (
        <a
          href={day.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-orange-300 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <FileDown className="w-5 h-5 text-red-600" />
          </div>
          <span className="flex-1 text-sm font-medium">Baixar PDF original</span>
        </a>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        {(q1 || q2) && (
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar respostas"}
          </Button>
        )}

        {!isCompleted && (
          <Button
            onClick={handleComplete}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Concluir dia
          </Button>
        )}

        {nextDay && (
          <Button
            variant={isCompleted ? "default" : "outline"}
            onClick={handleNext}
            className={cn("w-full", isCompleted && "bg-primary hover:bg-primary/90")}
          >
            Próximo dia
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {!nextDay && isCompleted && (
          <div className="text-center py-4 bg-green-50 rounded-xl border border-green-200">
            <p className="font-serif font-semibold text-green-800">🎉 Módulo concluído!</p>
            <p className="text-sm text-green-700 mt-1">Parabéns por completar todos os dias.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileDown, Save, CheckCircle2, Wind, Play, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer, ProgressBar } from "@/components/member";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useProductChapters, ProductChapter } from "@/hooks/useProductChapters";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface ProductDetailProps {
  module: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    welcome_video_url: string | null;
  };
}

export default function ProductDetail({ module }: ProductDetailProps) {
  const chaptersRef = useRef<HTMLDivElement>(null);
  const pdfsRef = useRef<HTMLDivElement>(null);

  const {
    chapters,
    chaptersLoading,
    completedCount,
    totalCount,
    getAnswer,
    saveAnswers,
    markComplete,
  } = useProductChapters(module.id);

  if (chaptersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const chaptersWithPdf = chapters.filter((c) => c.pdf_url);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        to="/membros/app/modulos"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Voltar</span>
      </Link>

      {/* Welcome Video */}
      <VideoPlayer
        videoUrl={module.welcome_video_url || undefined}
        title={`Boas-vindas: ${module.title}`}
        className="shadow-lg"
      />

      {/* Header */}
      <section className="space-y-3">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {module.title}
        </h1>
        {module.description && (
          <p className="text-muted-foreground leading-relaxed">
            {module.description}
          </p>
        )}

        {/* Progress */}
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso</span>
            <span className="text-lg font-serif font-semibold text-primary">
              {progressPercent}%
            </span>
          </div>
          <ProgressBar value={progressPercent} size="md" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedCount} de {totalCount} módulos concluídos
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={() => scrollToSection(chaptersRef)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-primary/10 text-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Play className="w-5 h-5" />
          <span className="text-xs font-medium">Começar</span>
        </button>
        <button
          onClick={() => scrollToSection(pdfsRef)}
          disabled={chaptersWithPdf.length === 0}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all",
            chaptersWithPdf.length === 0
              ? "opacity-50 cursor-not-allowed bg-orange-100 text-orange-700"
              : "bg-orange-100 text-orange-700 hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <FileDown className="w-5 h-5" />
          <span className="text-xs font-medium">PDFs</span>
          {chaptersWithPdf.length > 0 && (
            <span className="text-[10px] opacity-70">{chaptersWithPdf.length} arquivos</span>
          )}
        </button>
      </section>

      {/* Accordion Chapters */}
      <div ref={chaptersRef}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold text-foreground">Capítulos</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {chapters.map((chapter) => (
            <ChapterAccordionItem
              key={chapter.id}
              chapter={chapter}
              answer={getAnswer(chapter.id)}
              onSave={(data) =>
                saveAnswers.mutateAsync({ chapterId: chapter.id, answerData: data })
              }
              onComplete={(data) =>
                markComplete.mutateAsync({ chapterId: chapter.id, answerData: data })
              }
            />
          ))}
        </Accordion>
      </div>

      {/* PDFs Section */}
      {chaptersWithPdf.length > 0 && (
        <div ref={pdfsRef}>
          <div className="flex items-center gap-2 mb-3">
            <FileDown className="w-5 h-5 text-orange-600" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Materiais para Download</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            PDFs são materiais de apoio. Use após as leituras.
          </p>
          <div className="space-y-2">
            {chaptersWithPdf.map((chapter) => (
              <a
                key={chapter.id}
                href={chapter.pdf_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:border-orange-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-red-600" />
                </div>
                <span className="flex-1 text-sm font-medium">{chapter.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterAccordionItem({
  chapter,
  answer,
  onSave,
  onComplete,
}: {
  chapter: ProductChapter;
  answer: ReturnType<ReturnType<typeof useProductChapters>["getAnswer"]>;
  onSave: (data: Record<string, string>) => Promise<void>;
  onComplete: (data: Record<string, string>) => Promise<void>;
}) {
  const isCompleted = answer?.completed ?? false;
  const existingAnswers = (answer?.answers ?? {}) as Record<string, string>;

  const questions = [
    chapter.exercise_q1,
    chapter.exercise_q2,
    chapter.exercise_q3,
    chapter.exercise_q4,
  ].filter(Boolean) as string[];

  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    questions.forEach((_, i) => {
      init[`q${i + 1}`] = existingAnswers[`q${i + 1}`] || "";
    });
    return init;
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localAnswers);
      toast({ title: "Respostas salvas! ✨" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await onComplete(localAnswers);
      toast({
        title: "Você concluiu este capítulo 🌿",
        description: "Respire. Você está avançando.",
      });
    } catch {
      toast({ title: "Erro ao concluir", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccordionItem
      value={chapter.id}
      className={cn(
        "rounded-2xl border overflow-hidden",
        isCompleted
          ? "border-green-200 bg-green-50/30"
          : "border-border/50 bg-card"
      )}
    >
      <AccordionTrigger className="px-4 py-4 hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
          )}
          <span
            className={cn(
              "font-serif font-medium",
              isCompleted ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {chapter.title}
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-6">
        <div className="space-y-6 pt-2">
          {/* Video */}
          {chapter.video_url && (
            <VideoPlayer videoUrl={chapter.video_url} title={chapter.title} />
          )}

          {/* Long description */}
          <div className="text-foreground/90 leading-relaxed whitespace-pre-line text-sm">
            {chapter.long_description}
          </div>

          {/* PDF Download */}
          {chapter.pdf_url && (
            <a
              href={chapter.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <FileDown className="w-4 h-4" />
              Baixar PDF do módulo
            </a>
          )}

          {/* Exercises */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-serif font-semibold text-foreground">
                Exercícios de Reflexão
              </h4>
              {questions.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {questions.length > 1 ? `${i + 1}. ` : ""}
                    {q}
                  </label>
                  <Textarea
                    value={localAnswers[`q${i + 1}`] || ""}
                    onChange={(e) =>
                      setLocalAnswers((prev) => ({
                        ...prev,
                        [`q${i + 1}`]: e.target.value,
                      }))
                    }
                    placeholder="Escreva sua resposta aqui..."
                    className="min-h-[100px] resize-none rounded-xl"
                  />
                </div>
              ))}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                {!isCompleted && (
                  <Button
                    onClick={handleComplete}
                    disabled={saving}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Concluir Capítulo
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* No exercises — just complete button */}
          {questions.length === 0 && !isCompleted && (
            <Button onClick={handleComplete} disabled={saving}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar como Concluído
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

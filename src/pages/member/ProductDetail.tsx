import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileDown, Save, CheckCircle2, Play, BookOpen, PenLine, Heart, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer, ProgressBar } from "@/components/member";
import { MarkdownPreview } from "@/components/member/MarkdownPreview";
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
  const introRef = useRef<HTMLDivElement>(null);

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
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const chaptersWithPdf = chapters.filter((c) => c.pdf_url);
  const chaptersWithExercises = chapters.filter(
    (c) => c.exercise_q1 || c.exercise_q2 || c.exercise_q3 || c.exercise_q4
  );

  // First chapter is treated as "intro/comece por aqui"
  const introChapter = chapters.length > 0 ? chapters[0] : null;
  const mainChapters = chapters.slice(1);

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
            <span className="text-sm text-muted-foreground">Progresso do módulo</span>
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

      {/* Quick Actions — same grid style as Cadeias/Confissões */}
      <section className="grid grid-cols-2 gap-3">
        {introChapter && (
          <QuickActionButton
            icon={Play}
            label="Começar"
            color="bg-primary/10 text-primary"
            onClick={() => scrollToSection(introRef)}
          />
        )}
        {mainChapters.length > 0 && (
          <QuickActionButton
            icon={BookOpen}
            label="Capítulos"
            color="bg-purple-100 text-purple-700"
            onClick={() => scrollToSection(chaptersRef)}
          />
        )}
        {chaptersWithExercises.length > 0 && (
          <QuickActionButton
            icon={PenLine}
            label="Atividades"
            color="bg-green-100 text-green-700"
            count={chaptersWithExercises.length}
            onClick={() => scrollToSection(chaptersRef)}
          />
        )}
        {chaptersWithPdf.length > 0 && (
          <QuickActionButton
            icon={FileDown}
            label="PDFs"
            color="bg-orange-100 text-orange-700"
            count={chaptersWithPdf.length}
            onClick={() => scrollToSection(pdfsRef)}
          />
        )}
      </section>

      {/* SEÇÃO 1 — Comece por aqui (intro chapter) */}
      {introChapter && (
        <div ref={introRef}>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-semibold text-foreground">Comece por aqui</h2>
            </div>
            <IntroChapterCard
              chapter={introChapter}
              answer={getAnswer(introChapter.id)}
              onSave={(data) => saveAnswers.mutateAsync({ chapterId: introChapter.id, answerData: data })}
              onComplete={(data) => markComplete.mutateAsync({ chapterId: introChapter.id, answerData: data })}
            />
          </section>
        </div>
      )}

      {/* SEÇÃO 2 — Capítulos (accordion) */}
      {mainChapters.length > 0 && (
        <div ref={chaptersRef}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Capítulos</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {mainChapters.map((chapter) => (
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
      )}

      {/* SEÇÃO 3 — PDFs */}
      {chaptersWithPdf.length > 0 && (
        <div ref={pdfsRef}>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
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
          </section>
        </div>
      )}
    </div>
  );
}

// Quick Action Button — same as ModuleDetail
function QuickActionButton({
  icon: Icon,
  label,
  color,
  count,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
        color
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] opacity-70">{count} arquivos</span>
      )}
    </button>
  );
}

// Intro Chapter Card — styled like the "Comece por aqui" section in Cadeias
function IntroChapterCard({
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

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-colors",
      isCompleted
        ? "bg-green-50/50 border-green-200"
        : "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isCompleted ? "bg-green-100" : "bg-primary/20"
        )}>
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <BookOpen className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={cn(
            "font-medium",
            isCompleted ? "text-muted-foreground" : "text-foreground"
          )}>{chapter.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCompleted ? "Concluído" : "Comece por aqui"}
          </p>
        </div>
      </div>

      {/* Video */}
      {chapter.video_url && (
        <div className="mt-4">
          <VideoPlayer videoUrl={chapter.video_url} title={chapter.title} />
        </div>
      )}

      {/* Long description */}
      <div className="text-foreground/90 leading-relaxed whitespace-pre-line text-sm mt-4">
        {chapter.long_description}
      </div>

      {/* PDF Download */}
      {chapter.pdf_url && (
        <a
          href={chapter.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium mt-4"
        >
          <FileDown className="w-4 h-4" />
          Baixar PDF
        </a>
      )}

      {/* Complete button */}
      {!isCompleted && (
        <div className="mt-4">
          <Button onClick={() => onComplete({})} className="w-full">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar como Concluído
          </Button>
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

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CheckCircle2, Minus, PenLine, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { VideoPlayer } from "@/components/member/VideoPlayer";
import { MarkdownContent } from "@/components/member/MarkdownPreview";
import { MemberEmptyState, MemberErrorState } from "@/components/member/MemberState";
import { useMemberTheme } from "@/components/member/MemberTheme";
import { CelebrateBurst } from "@/components/member/CelebrateBurst";
import { fetchRemoteCardScroll, loadCardScroll, saveReadingPlace, syncReadingPosition } from "@/lib/readingPlace";
import { cn } from "@/lib/utils";

const SIZE_KEY = "ju.reading.size";
const SIZES = [17, 19, 22] as const;

function storedSize(): number {
  const value = Number(localStorage.getItem(SIZE_KEY));
  return (SIZES as readonly number[]).includes(value) ? value : 19;
}

type ReadingSessionProps = {
  cardId: string;
  moduleSlug?: string;
  onClose: () => void;
};

export function ReadingSession({ cardId, moduleSlug, onClose }: ReadingSessionProps) {
  const { user } = useAuth();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const restored = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();
  const [scrollRatio, setScrollRatio] = useState(0);
  const [fontSize, setFontSize] = useState(storedSize);
  const [burst, setBurst] = useState<"card" | "module" | null>(null);

  const { data: card, isLoading, isError, refetch } = useQuery({
    queryKey: ["module-card", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_cards")
        .select("*, modules(*)")
        .eq("id", cardId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { isCardCompleted, markCardComplete } = useProgress(card?.module_id);
  const isCompleted = isCardCompleted(cardId);
  const moduleTitle = card?.modules && !Array.isArray(card.modules) ? card.modules.title : "Leitura";

  const persist = (ratio: number, { syncNow = false }: { syncNow?: boolean } = {}) => {
    if (!user || !card?.module_id) return;
    saveReadingPlace({
      userId: user.id,
      cardId,
      moduleId: card.module_id,
      moduleSlug: moduleSlug ?? "",
      moduleTitle,
      cardTitle: card.title,
      scrollRatio: ratio,
      updatedAt: new Date().toISOString(),
    });

    if (syncTimer.current) clearTimeout(syncTimer.current);
    const run = () => { void syncReadingPosition(user.id, cardId, card.module_id, ratio); };
    if (syncNow) run();
    else syncTimer.current = setTimeout(run, 1500);
  };

  useEffect(() => {
    restored.current = false;
  }, [cardId]);

  useEffect(() => {
    if (!card || !user || restored.current) return;
    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteCardScroll(user.id, cardId).catch(() => null);
      const ratio = remote ?? loadCardScroll(user.id, cardId);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          const el = scrollerRef.current;
          if (!el) return;
          const max = el.scrollHeight - el.clientHeight;
          el.scrollTop = max > 0 ? max * ratio : 0;
          setScrollRatio(ratio);
          restored.current = true;
          if (card.module_id) {
            saveReadingPlace({
              userId: user.id,
              cardId,
              moduleId: card.module_id,
              moduleSlug: moduleSlug ?? "",
              moduleTitle,
              cardTitle: card.title,
              scrollRatio: ratio,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      });
    })();
    return () => { cancelled = true; };
  }, [card, user, cardId, moduleSlug, moduleTitle]);

  useEffect(() => () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
  }, []);

  const closeAndSave = () => {
    persist(scrollRatio, { syncNow: true });
    onClose();
  };

  const handleComplete = async () => {
    if (!card?.module_id) return;
    try {
      const result = await markCardComplete.mutateAsync({ cardId, moduleId: card.module_id });
      setBurst(result.moduleComplete ? "module" : "card");
      window.setTimeout(closeAndSave, result.moduleComplete ? 1200 : 700);
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const changeSize = (direction: -1 | 1) => {
    setFontSize((current) => {
      const index = SIZES.indexOf(current as (typeof SIZES)[number]);
      const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, index + direction))] ?? current;
      localStorage.setItem(SIZE_KEY, String(next));
      return next;
    });
  };

  if (isError) {
    return (
      <div className="p-6">
        <MemberErrorState onRetry={() => { void refetch(); }} />
      </div>
    );
  }

  if (isLoading || !card) {
    if (!isLoading && !card) {
      return (
        <div className="space-y-4 p-6">
          <MemberEmptyState
            title="Conteúdo não encontrado"
            body="Esta leitura não está disponível para a sua conta."
          />
          <div className="text-center">
            <Button variant="ghost" onClick={onClose}>Fechar</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="absolute inset-x-0 top-0 z-20 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${Math.round(scrollRatio * 100)}%` }}
        />
      </div>
      {burst && <CelebrateBurst intensity={burst} />}

      <header className="shrink-0 border-b border-border/60 bg-background/95 px-4 pb-3 pt-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {moduleTitle}
            </p>
            <h1 className="truncate font-serif text-lg font-semibold text-foreground">
              {card.title}
            </h1>
          </div>
          <div className="flex items-center rounded-full border border-border bg-card">
            <button type="button" className="p-2 text-muted-foreground" onClick={() => changeSize(-1)} aria-label="Diminuir texto">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="p-2 text-muted-foreground" onClick={() => changeSize(1)} aria-label="Aumentar texto">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={closeAndSave}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar leitura</span>
          </button>
        </div>
      </header>

      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto"
        onScroll={(event) => {
          const el = event.currentTarget;
          const max = el.scrollHeight - el.clientHeight;
          const ratio = max <= 0 ? 1 : el.scrollTop / max;
          setScrollRatio(ratio);
          persist(ratio);
        }}
      >
        <div className="mx-auto max-w-lg px-5 py-8">
          {card.video_url && (
            <section className="pb-6">
              <VideoPlayer videoUrl={card.video_url} title={card.title} className="shadow-lg" />
            </section>
          )}
          <article className="member-reading-prose pb-10 text-foreground" style={{ fontSize }}>
            {card.content_md ? (
              <MarkdownContent content={card.content_md} />
            ) : (
              <p className="italic text-muted-foreground">
                O conteúdo desta leitura está sendo preparado.
              </p>
            )}
          </article>
        </div>
      </div>

      <footer className="shrink-0 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg gap-3">
          <Link
            to={`/membros/app/caderno?module=${moduleSlug ?? ""}`}
            className="flex-1"
            onClick={closeAndSave}
          >
            <Button variant="outline" className="h-12 w-full">
              <PenLine className="mr-2 h-4 w-4" />
              Registrar no Caderno
            </Button>
          </Link>
          {isCompleted ? (
            <Button variant="secondary" className="h-12 flex-1" disabled>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Concluído
            </Button>
          ) : (
            <Button className="member-read-cta h-12 flex-1" onClick={() => { void handleComplete(); }} disabled={markCardComplete.isPending || burst !== null}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Concluir
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

type ReadingOverlayProps = {
  cardId: string | null;
  moduleSlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReadingOverlay({ cardId, moduleSlug, open, onOpenChange }: ReadingOverlayProps) {
  const { theme } = useMemberTheme();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-foreground/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "member-shell fixed inset-0 z-[60] flex flex-col outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom-8 data-[state=open]:slide-in-from-bottom-8",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-300",
            theme === "dark" && "member-dark",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Leitura</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Texto da aula, por cima do módulo.
          </DialogPrimitive.Description>
          {cardId && (
            <ReadingSession
              cardId={cardId}
              moduleSlug={moduleSlug}
              onClose={() => onOpenChange(false)}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

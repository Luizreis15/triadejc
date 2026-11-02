import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEntitledCatalog } from "@/hooks/useEntitledCatalog";
import { useReadingResume } from "@/hooks/useReadingResume";
import { daysSince, isReadingStale, READING_STALE_DAYS } from "@/lib/readingPlace";

const DISMISS_KEY = "ju.reading.reminder.dismissed";

export function ReadingReminder() {
  const { user } = useAuth();
  const { catalogs, lastProgressAt, getModuleProgress } = useEntitledCatalog();
  const resume = useReadingResume();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === "1");

  if (!user || dismissed) return null;

  const newest = [resume?.updatedAt, lastProgressAt]
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  if (!isReadingStale(newest)) return null;

  const ownedResume = resume && catalogs.some((catalog) =>
    catalog.modules.some((module) => module.slug === resume.moduleSlug),
  )
    ? resume
    : null;
  const nextModule = catalogs
    .flatMap((catalog) => catalog.modules)
    .find((module) => getModuleProgress(module.id).status !== "completed");
  if (!ownedResume && !nextModule) return null;

  const when = new Date(newest ?? "").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
  const title = ownedResume?.cardTitle || ownedResume?.moduleTitle || nextModule?.title || "sua leitura";
  const href = ownedResume
    ? `/membros/app/modulos/${ownedResume.moduleSlug}?ler=${ownedResume.cardId}`
    : `/membros/app/modulos/${nextModule?.slug ?? ""}`;
  const idleDays = Math.max(
    Math.floor(daysSince(resume?.updatedAt) ?? 0),
    Math.floor(daysSince(lastProgressAt) ?? 0),
  );

  return (
    <div className="mx-auto mb-2 max-w-lg px-4">
      <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="flex-1 text-sm leading-snug text-foreground">
          Você não lê desde {when}
          {idleDays > READING_STALE_DAYS ? ` (${idleDays} dias)` : ""}. Continue{" "}
          <Link to={href} className="font-medium text-primary underline-offset-2 hover:underline">
            {title}
          </Link>
          .
        </p>
        <button
          type="button"
          className="rounded-full p-1 text-muted-foreground hover:bg-background/70"
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
          aria-label="Dispensar lembrete"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

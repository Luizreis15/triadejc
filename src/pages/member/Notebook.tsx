import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, FileDown, Clock, Smile, Meh, Frown, Heart, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useExercises, Exercise } from "@/hooks/useExercises";
import { useDevotional, DevotionalDay } from "@/hooks/useDevotional";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ExerciseList } from "@/components/member/ExerciseList";
import { ExerciseView } from "@/components/member/ExerciseView";
import { DevotionalTimeline } from "@/components/member/DevotionalTimeline";
import { DevotionalDayView } from "@/components/member/DevotionalDayView";
import { ProgressDashboard } from "@/components/member/ProgressDashboard";
import { exportNotebookToPdf } from "@/lib/exportNotebookPdf";
import { MemberErrorState } from "@/components/member/MemberState";
import { useProgress } from "@/hooks/useProgress";

const moodOptions = [
  { value: 1, icon: Frown, label: "Difícil", color: "text-red-500" },
  { value: 2, icon: Meh, label: "Cansada", color: "text-orange-500" },
  { value: 3, icon: Meh, label: "Normal", color: "text-yellow-500" },
  { value: 4, icon: Smile, label: "Bem", color: "text-green-500" },
  { value: 5, icon: Sparkles, label: "Ótima", color: "text-primary" },
];

const MODULE_SLUG = "cadeias-invisiveis";

export default function Notebook() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // ?tab=exercises abre direto na aba; ?exercicio=1 abre o exercício daquela posição.
  const TABS = ["checkin", "exercises", "devotional", "history"];
  const requestedTab = searchParams.get("tab") ?? (searchParams.get("type") === "exercise" ? "exercises" : "");
  const [tab, setTab] = useState(TABS.includes(requestedTab) ? requestedTab : "checkin");
  const requestedExercise = Number(searchParams.get("exercicio"));
  const openedFromLink = useRef(false);
  
  // Selected items for detail views
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedDay, setSelectedDay] = useState<DevotionalDay | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Check-in form state
  const [mood, setMood] = useState<number | null>(null);
  const [feeling, setFeeling] = useState("");
  const [thought, setThought] = useState("");
  const [need, setNeed] = useState("");

  // Hooks for exercises and devotional
  const { 
    exercises, 
    isExerciseCompleted, 
    getExerciseEntry,
    saveExercise,
    completedCount: exercisesCompleted,
    progressPercent: exerciseProgress,
  } = useExercises(MODULE_SLUG);

  const {
    devotionalDays,
    isDayCompleted,
    isDayUnlocked,
    getDayEntry,
    saveDevotional,
    completedCount: devotionalCompleted,
    totalDays: devotionalTotal,
  } = useDevotional(MODULE_SLUG);

  // Fetch today's check-in
  const { data: todayCheckin } = useQuery({
    queryKey: ["checkin-today", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Meia-noite no horário da aluna, não em UTC: à noite o dia já teria virado.
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const today = start.toISOString();
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("section", "checkin")
        .gte("created_at", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch all entries
  const { data: entries = [], isError: entriesError, refetch: refetchEntries } = useQuery({
    queryKey: ["notebook-entries", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user profile for PDF
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Export PDF handler
  const handleExportPdf = async () => {
    if (entries.length === 0) {
      toast({ title: "Nenhum registro", description: "Faça alguns registros antes de exportar.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      exportNotebookToPdf(entries, profile || undefined);
      toast({ title: "PDF exportado! 📄", description: "O arquivo foi baixado para seu dispositivo." });
    } catch (error) {
      toast({ title: "Erro ao exportar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Save check-in mutation
  const saveCheckin = useMutation({
    mutationFn: async () => {
      if (!user?.id || !mood) throw new Error("Check-in incompleto");
      const content = JSON.stringify({ mood, feeling, thought, need });
      const { error } = await supabase.from("notebook_entries").insert({
        user_id: user.id,
        section: "checkin",
        title: `Check-in do dia`,
        content_md: content,
      });
      // Sem isto a tela dizia "salvo" mesmo quando o banco recusava o registro.
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-entries"] });
      queryClient.invalidateQueries({ queryKey: ["checkin-today"] });
      toast({ title: "Check-in salvo! ✨", description: "Que bom que você dedicou esse momento para si." });
      setMood(null);
      setFeeling("");
      setThought("");
      setNeed("");
    },
    onError: () => {
      toast({
        title: "Não foi possível salvar",
        description: "O que você escreveu continua na tela. Tente de novo em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const checkins = entries.filter(e => e.section === "checkin");
  const streak = checkinStreak(checkins.map((entry) => entry.created_at));
  // Marcações internas de aula concluída não são registros da aluna.
  const historyEntries = entries.filter((entry) => entry.section !== "day_complete");

  const { data: lessonTitles = {} } = useQuery({
    queryKey: ["notebook-lesson-titles", user?.id],
    enabled: !!user?.id && entries.some((entry) => entry.section === "day_exercise"),
    queryFn: async () => {
      const { data, error } = await supabase.from("module_days").select("id, title");
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((day) => [day.id, day.title])) as Record<string, string>;
    },
  });

  // A atividade do módulo só conta como feita quando o exercício é salvo aqui.
  const { data: activityCard } = useQuery({
    queryKey: ["module-activity-card", MODULE_SLUG],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_cards")
        .select("id, module_id, modules!inner(slug)")
        .eq("modules.slug", MODULE_SLUG)
        .eq("section", "activity")
        .order("order_index")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { markCardComplete } = useProgress(activityCard?.module_id);

  useEffect(() => {
    if (openedFromLink.current || !requestedExercise || exercises.length === 0) return;
    openedFromLink.current = true;
    const target = exercises.find((exercise) => exercise.order_index === requestedExercise);
    if (target) setSelectedExercise(target);
  }, [requestedExercise, exercises]);

  // Handle exercise save
  const handleSaveExercise = async (content: string) => {
    if (!selectedExercise) return;
    await saveExercise.mutateAsync({
      exerciseId: selectedExercise.id,
      title: selectedExercise.title,
      content,
    });
    if (selectedExercise.order_index === 1 && activityCard) {
      // Falha aqui não desfaz o exercício, que já está salvo.
      await markCardComplete
        .mutateAsync({ cardId: activityCard.id, moduleId: activityCard.module_id })
        .catch(() => undefined);
    }
  };

  // Handle devotional save
  const handleSaveDevotional = async (content: string) => {
    if (!selectedDay) return;
    await saveDevotional.mutateAsync({
      dayId: selectedDay.id,
      dayNumber: selectedDay.day_number,
      content,
    });
  };

  // Handle next day
  const handleNextDay = () => {
    if (!selectedDay) return;
    const nextDay = devotionalDays.find(d => d.day_number === selectedDay.day_number + 1);
    if (nextDay) setSelectedDay(nextDay);
  };

  if (entriesError) {
    return (
      <MemberErrorState
        onRetry={() => {
          void refetchEntries();
        }}
      />
    );
  }

  // If viewing exercise detail
  if (selectedExercise) {
    const entry = getExerciseEntry(selectedExercise.id);
    return (
      <ExerciseView
        exercise={selectedExercise}
        existingContent={entry?.content_md}
        onSave={handleSaveExercise}
        onBack={() => setSelectedExercise(null)}
        isCompleted={isExerciseCompleted(selectedExercise.id)}
      />
    );
  }

  // If viewing devotional detail
  if (selectedDay) {
    const entry = getDayEntry(selectedDay.id);
    const hasNext = selectedDay.day_number < devotionalTotal;
    return (
      <DevotionalDayView
        day={selectedDay}
        existingContent={entry?.content_md}
        onSave={handleSaveDevotional}
        onBack={() => setSelectedDay(null)}
        isCompleted={isDayCompleted(selectedDay.id)}
        hasNext={hasNext}
        onNext={handleNextDay}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Meu Caderno</h1>
        <p className="text-muted-foreground">Seu espaço seguro para reflexão e registro</p>
      </section>

      {/* Progress Dashboard */}
      <ProgressDashboard
        exercisesCompleted={exercisesCompleted}
        exercisesTotal={exercises.length}
        devotionalCompleted={devotionalCompleted}
        devotionalTotal={devotionalTotal}
        checkinsCount={checkins.length}
        streak={streak}
      />

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-12 mb-6">
          <TabsTrigger value="checkin" className="text-xs">Check-in</TabsTrigger>
          <TabsTrigger value="exercises" className="text-xs">Exercícios</TabsTrigger>
          <TabsTrigger value="devotional" className="text-xs">Devocional</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
        </TabsList>

        {/* Check-in Tab */}
        <TabsContent value="checkin" className="space-y-6">
          <TabHint>
            Um registro rápido de como você chega hoje. Faça uma vez por dia, antes ou depois da leitura.
          </TabHint>
          {todayCheckin ? (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-6 text-center">
              <Heart className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="font-serif font-semibold text-foreground">Você já fez seu check-in hoje!</h3>
              <p className="text-sm text-muted-foreground mt-1">Volte amanhã para um novo momento de reflexão.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Como você está hoje?</label>
                <div className="flex justify-between gap-2">
                  {moodOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = mood === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setMood(option.value)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                          isSelected ? "bg-primary/10 ring-2 ring-primary" : "bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", isSelected ? option.color : "text-muted-foreground")} />
                        <span className={cn("text-[10px]", isSelected ? "text-foreground font-medium" : "text-muted-foreground")}>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">O que você está sentindo agora?</label>
                <Textarea value={feeling} onChange={(e) => setFeeling(e.target.value)} placeholder="Descreva com suas palavras..." className="min-h-[100px] resize-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Qual pensamento está mais presente?</label>
                <Textarea value={thought} onChange={(e) => setThought(e.target.value)} placeholder="O que ocupa sua mente hoje..." className="min-h-[100px] resize-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">O que você precisa de Deus hoje?</label>
                <Textarea value={need} onChange={(e) => setNeed(e.target.value)} placeholder="Seu pedido, sua necessidade..." className="min-h-[100px] resize-none rounded-xl" />
              </div>
              <Button className="w-full h-12" onClick={() => saveCheckin.mutate()} disabled={!mood || saveCheckin.isPending}>
                <Save className="w-4 h-4 mr-2" />Salvar Check-in
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-4">
          <TabHint>
            Dez exercícios escritos do módulo Cadeias Invisíveis. Faça na ordem, um por vez, depois das leituras do módulo.
            O primeiro é a Atividade do Módulo.
          </TabHint>
          <ExerciseList
            exercises={exercises}
            isCompleted={isExerciseCompleted}
            onSelect={setSelectedExercise}
            completedCount={exercisesCompleted}
            progressPercent={exerciseProgress}
          />
        </TabsContent>

        {/* Devotional Tab */}
        <TabsContent value="devotional" className="space-y-4">
          <TabHint>
            Sete dias de Palavra, reflexão e oração. Um dia por vez: o seguinte abre quando você completa o anterior.
          </TabHint>
          <DevotionalTimeline
            days={devotionalDays}
            isDayCompleted={isDayCompleted}
            isDayUnlocked={isDayUnlocked}
            onSelectDay={setSelectedDay}
            completedCount={devotionalCompleted}
            totalDays={devotionalTotal}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <TabHint>Tudo o que você já registrou, do mais recente para o mais antigo.</TabHint>
          {historyEntries.length === 0 ? (
            <div className="bg-muted/30 rounded-2xl p-6 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Seu histórico aparecerá aqui conforme você fizer registros.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={isExporting}>
                  {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                  {isExporting ? "Gerando..." : "Exportar PDF"}
                </Button>
              </div>
              <div className="space-y-3">
                {historyEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} lessonTitle={lessonTitles[entry.title ?? ""]} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

/** Dias seguidos com check-in, contando a partir de hoje (ou de ontem, se hoje ainda não foi feito). */
function checkinStreak(dates: string[]): number {
  const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const days = new Set(dates.map((iso) => dayKey(new Date(iso))));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

type NotebookEntry = { id: string; created_at: string; section: string; title: string | null };

function EntryCard({ entry, lessonTitle }: { entry: NotebookEntry; lessonTitle?: string }) {
  const date = new Date(entry.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  const sectionLabels: Record<string, string> = { checkin: "Check-in", exercise: "Exercício", devotional: "Devocional", summary: "Resumo", day_exercise: "Aula", reading_reflection: "Reflexão" };
  const title = entry.section === "day_exercise" ? lessonTitle ?? "Respostas da aula" : entry.title;
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{date}</span>
        <span className="text-xs bg-muted px-2 py-1 rounded-full">{sectionLabels[entry.section] || entry.section}</span>
      </div>
      {title && <h3 className="font-medium text-foreground">{title}</h3>}
    </div>
  );
}

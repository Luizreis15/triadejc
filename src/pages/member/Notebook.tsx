import { useState } from "react";
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
  
  const defaultTab = searchParams.get("tab") || "checkin";
  
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
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("section", "checkin")
        .gte("created_at", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch all entries
  const { data: entries = [] } = useQuery({
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
      if (!user?.id || !mood) return;
      const content = JSON.stringify({ mood, feeling, thought, need });
      await supabase.from("notebook_entries").insert({
        user_id: user.id,
        section: "checkin",
        title: `Check-in do dia`,
        content_md: content,
      });
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
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
    },
  });

  const checkins = entries.filter(e => e.section === "checkin");

  // Handle exercise save
  const handleSaveExercise = async (content: string) => {
    if (!selectedExercise) return;
    await saveExercise.mutateAsync({
      exerciseId: selectedExercise.id,
      title: selectedExercise.title,
      content,
    });
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
        streak={0}
      />

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-12 mb-6">
          <TabsTrigger value="checkin" className="text-xs">Check-in</TabsTrigger>
          <TabsTrigger value="exercises" className="text-xs">Exercícios</TabsTrigger>
          <TabsTrigger value="devotional" className="text-xs">Devocional</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
        </TabsList>

        {/* Check-in Tab */}
        <TabsContent value="checkin" className="space-y-6">
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
        <TabsContent value="exercises">
          <ExerciseList
            exercises={exercises}
            isCompleted={isExerciseCompleted}
            onSelect={setSelectedExercise}
            completedCount={exercisesCompleted}
            progressPercent={exerciseProgress}
          />
        </TabsContent>

        {/* Devotional Tab */}
        <TabsContent value="devotional">
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
          {entries.length === 0 ? (
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
                {entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EntryCard({ entry }: { entry: any }) {
  const date = new Date(entry.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  const sectionLabels: Record<string, string> = { checkin: "Check-in", exercise: "Exercício", devotional: "Devocional", summary: "Resumo" };
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{date}</span>
        <span className="text-xs bg-muted px-2 py-1 rounded-full">{sectionLabels[entry.section] || entry.section}</span>
      </div>
      {entry.title && <h3 className="font-medium text-foreground">{entry.title}</h3>}
    </div>
  );
}

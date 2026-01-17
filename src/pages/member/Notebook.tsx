import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, FileDown, Clock, Smile, Meh, Frown, Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const moodOptions = [
  { value: 1, icon: Frown, label: "Difícil", color: "text-red-500" },
  { value: 2, icon: Meh, label: "Cansada", color: "text-orange-500" },
  { value: 3, icon: Meh, label: "Normal", color: "text-yellow-500" },
  { value: 4, icon: Smile, label: "Bem", color: "text-green-500" },
  { value: 5, icon: Sparkles, label: "Ótima", color: "text-primary" },
];

export default function Notebook() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const moduleFilter = searchParams.get("module");
  const defaultTab = searchParams.get("type") === "exercise" ? "exercises" : "checkin";

  // Check-in form state
  const [mood, setMood] = useState<number | null>(null);
  const [feeling, setFeeling] = useState("");
  const [thought, setThought] = useState("");
  const [need, setNeed] = useState("");

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

  // Save check-in mutation
  const saveCheckin = useMutation({
    mutationFn: async () => {
      if (!user?.id || !mood) return;
      
      const content = JSON.stringify({
        mood,
        feeling,
        thought,
        need,
      });

      await supabase
        .from("notebook_entries")
        .insert({
          user_id: user.id,
          section: "checkin",
          title: `Check-in do dia`,
          content_md: content,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-entries"] });
      queryClient.invalidateQueries({ queryKey: ["checkin-today"] });
      toast({
        title: "Check-in salvo! ✨",
        description: "Que bom que você dedicou esse momento para si.",
      });
      // Reset form
      setMood(null);
      setFeeling("");
      setThought("");
      setNeed("");
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const checkins = entries.filter(e => e.section === "checkin");
  const exercises = entries.filter(e => e.section === "exercise");
  const summaries = entries.filter(e => e.section === "summary");

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Meu Caderno
        </h1>
        <p className="text-muted-foreground">
          Seu espaço seguro para reflexão e registro
        </p>
      </section>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-12 mb-6">
          <TabsTrigger value="checkin" className="text-sm">Check-in</TabsTrigger>
          <TabsTrigger value="exercises" className="text-sm">Exercícios</TabsTrigger>
          <TabsTrigger value="history" className="text-sm">Histórico</TabsTrigger>
        </TabsList>

        {/* Check-in Tab */}
        <TabsContent value="checkin" className="space-y-6">
          {todayCheckin ? (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-6 text-center">
              <Heart className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="font-serif font-semibold text-foreground">
                Você já fez seu check-in hoje!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Volte amanhã para um novo momento de reflexão.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mood Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Como você está hoje?
                </label>
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
                          isSelected 
                            ? "bg-primary/10 ring-2 ring-primary" 
                            : "bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", isSelected ? option.color : "text-muted-foreground")} />
                        <span className={cn(
                          "text-[10px]",
                          isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feeling */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  O que você está sentindo agora?
                </label>
                <Textarea
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder="Descreva com suas palavras..."
                  className="min-h-[100px] resize-none rounded-xl"
                />
              </div>

              {/* Thought */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Qual pensamento está mais presente?
                </label>
                <Textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="O que ocupa sua mente hoje..."
                  className="min-h-[100px] resize-none rounded-xl"
                />
              </div>

              {/* Need */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  O que você precisa de Deus hoje?
                </label>
                <Textarea
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  placeholder="Seu pedido, sua necessidade..."
                  className="min-h-[100px] resize-none rounded-xl"
                />
              </div>

              {/* Save Button */}
              <Button 
                className="w-full h-12"
                onClick={() => saveCheckin.mutate()}
                disabled={!mood || saveCheckin.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Check-in
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-4">
          <div className="bg-muted/30 rounded-2xl p-6 text-center">
            <p className="text-muted-foreground">
              Os exercícios aparecerão aqui conforme você avançar nos módulos.
            </p>
          </div>
          
          {exercises.length > 0 && (
            <div className="space-y-3">
              {exercises.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-muted/30 rounded-2xl p-6 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Seu histórico aparecerá aqui conforme você fizer registros.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Entry Card Component
function EntryCard({ entry }: { entry: any }) {
  const date = new Date(entry.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const sectionLabels: Record<string, string> = {
    checkin: "Check-in",
    exercise: "Exercício",
    summary: "Resumo",
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{date}</span>
        <span className="text-xs bg-muted px-2 py-1 rounded-full">
          {sectionLabels[entry.section] || entry.section}
        </span>
      </div>
      {entry.title && (
        <h3 className="font-medium text-foreground">{entry.title}</h3>
      )}
      {entry.content_md && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {entry.content_md.substring(0, 100)}...
        </p>
      )}
    </div>
  );
}

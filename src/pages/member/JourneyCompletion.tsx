import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Award, Download, Share2, Heart, Copy, Trash2,
  CheckCircle2, Circle, ArrowLeft, Sparkles, RotateCcw, Map
} from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";

// Maintenance plan (static)
const MAINTENANCE_PLAN = [
  { day: 1, title: "Selá semanal: pausa e revisão", icon: "🧘" },
  { day: 2, title: "Confissão Mestre (1–3 frases)", icon: "✨" },
  { day: 3, title: "Palavra + 1 decisão prática", icon: "📖" },
  { day: 4, title: "Oração curta + gratidão", icon: "🙏" },
  { day: 5, title: "Limite de paz (uma escolha que protege seu coração)", icon: "🛡️" },
  { day: 6, title: "Uma atitude de amor/serviço", icon: "💛" },
  { day: 7, title: "Revisão e recomeço (planejar próxima semana)", icon: "🔄" },
];

export default function JourneyCompletion() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if Day 30 is completed
  const { data: isDay30Complete, isLoading: checkingCompletion } = useQuery({
    queryKey: ["day30-completion", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      // Find day 30
      const { data: day30 } = await supabase
        .from("module_days")
        .select("id")
        .eq("day_number", 30)
        .maybeSingle();
      if (!day30) return false;
      const { data } = await supabase
        .from("notebook_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("section", "day_complete")
        .eq("title", day30.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Get completion date (day 30 complete entry)
  const { data: completionDate } = useQuery({
    queryKey: ["day30-completion-date", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data: day30 } = await supabase
        .from("module_days")
        .select("id")
        .eq("day_number", 30)
        .maybeSingle();
      if (!day30) return null;
      const { data } = await supabase
        .from("notebook_entries")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("section", "day_complete")
        .eq("title", day30.id)
        .maybeSingle();
      return data?.created_at || null;
    },
    enabled: !!user?.id && isDay30Complete === true,
  });

  // Count completed days
  const { data: completedDaysCount = 0 } = useQuery({
    queryKey: ["completed-days-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data } = await supabase
        .from("notebook_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("section", "day_complete");
      return data?.length || 0;
    },
    enabled: !!user?.id && isDay30Complete === true,
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch favorite confessions with day info
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorite-confessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: favs } = await supabase
        .from("user_favorite_confessions")
        .select("id, day_id, created_at")
        .eq("user_id", user.id);
      if (!favs?.length) return [];
      
      const dayIds = favs.map(f => f.day_id);
      const { data: days } = await supabase
        .from("module_days")
        .select("id, day_number, title, confession_text")
        .in("id", dayIds)
        .order("day_number");
      
      return (days || []).map(d => ({
        ...d,
        favId: favs.find(f => f.day_id === d.id)?.id,
      }));
    },
    enabled: !!user?.id && isDay30Complete === true,
  });

  // Fetch maintenance progress
  const { data: maintenanceProgress = [] } = useQuery({
    queryKey: ["maintenance-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("user_maintenance_progress")
        .select("*")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user?.id && isDay30Complete === true,
  });

  // Toggle maintenance day
  const toggleMaintenance = useMutation({
    mutationFn: async (day: number) => {
      if (!user?.id) throw new Error("Not authenticated");
      const existing = maintenanceProgress.find(p => p.maintenance_day === day);
      if (existing) {
        // Already exists — we don't delete, just toggle isn't needed since it's a completion
        return;
      }
      await supabase.from("user_maintenance_progress").insert({
        user_id: user.id,
        maintenance_day: day,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-progress"] });
    },
  });

  // Remove favorite
  const removeFavorite = useMutation({
    mutationFn: async (favId: string) => {
      await supabase.from("user_favorite_confessions").delete().eq("id", favId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-confessions"] });
      toast({ title: "Removido dos favoritos" });
    },
  });

  // Copy confession text
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado! 📋" });
  };

  // Share text
  const shareText = async (text: string, title: string) => {
    if (navigator.share) {
      await navigator.share({ title, text });
    } else {
      copyText(text);
    }
  };

  // Generate certificate PDF
  const generateCertificate = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(37, 50, 68);
    doc.rect(0, 0, w, h, "F");

    // Inner frame
    doc.setDrawColor(212, 158, 158);
    doc.setLineWidth(1.5);
    doc.roundedRect(15, 15, w - 30, h - 30, 5, 5, "S");
    doc.roundedRect(18, 18, w - 36, h - 36, 4, 4, "S");

    // Title
    doc.setTextColor(240, 226, 210);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("✦", w / 2, 38, { align: "center" });

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Certificado de Conclusão", w / 2, 52, { align: "center" });

    // Divider
    doc.setDrawColor(212, 158, 158);
    doc.setLineWidth(0.5);
    doc.line(w / 2 - 40, 58, w / 2 + 40, 58);

    // Body
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(240, 226, 210);
    doc.text("Certificamos que", w / 2, 72, { align: "center" });

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(212, 158, 158);
    doc.text(profile?.name || "Aluna", w / 2, 85, { align: "center" });

    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(240, 226, 210);
    doc.text("concluiu com dedicação a", w / 2, 98, { align: "center" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Jornada Confissões de Fé — 30 Dias", w / 2, 112, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(240, 226, 210);
    const dateStr = completionDate
      ? new Date(completionDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    doc.text(`Concluído em ${dateStr}`, w / 2, 125, { align: "center" });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(160, 160, 160);
    doc.text("Jornada Única — Jordana Cantarelli", w / 2, h - 28, { align: "center" });

    doc.save("certificado-jornada-30-dias.pdf");
    toast({ title: "Certificado baixado! 🎓" });
  };

  if (checkingCompletion) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  // Blocked state
  if (!isDay30Complete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Award className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Conclusão da Jornada</h1>
          <p className="text-muted-foreground max-w-sm">
            Conclua o Dia 30 para liberar sua conclusão.
          </p>
        </div>
        <Link to="/membros/app/modulos/confissoes-de-fe">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à jornada
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  return (
    <div className="space-y-8 pb-12">
      {/* Back */}
      <Link
        to="/membros/app/modulos/confissoes-de-fe"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Voltar</span>
      </Link>

      {/* SECTION A — Parabéns */}
      <section className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Você concluiu a Jornada</h1>
          <p className="text-muted-foreground">30 dias. 30 passos. Uma nova fase.</p>
          <p className="text-sm text-muted-foreground italic">
            O que Deus começou em você não termina aqui.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedDaysCount}/30 dias
          </span>
          <span className="inline-flex items-center text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            📅 {formattedDate}
          </span>
        </div>
      </section>

      {/* SECTION B — Certificado */}
      <section className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {/* Certificate preview */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.8)] p-6 text-center space-y-2">
          <p className="text-primary-foreground/60 text-xs uppercase tracking-widest">✦</p>
          <h2 className="font-serif text-xl font-semibold text-primary-foreground">Certificado de Conclusão</h2>
          <div className="w-16 h-px bg-primary-foreground/30 mx-auto" />
          <p className="text-primary-foreground/80 text-sm">
            {profile?.name || "Aluna"}
          </p>
          <p className="text-primary-foreground/60 text-xs">
            Jornada Confissões de Fé — 30 Dias
          </p>
        </div>
        <div className="p-4 flex gap-3">
          <Button onClick={generateCertificate} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              generateCertificate();
              toast({ title: "PDF gerado para compartilhar! 📤" });
            }}
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </section>

      {/* SECTION C — Confissões Favoritas */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h2 className="font-serif text-lg font-semibold text-foreground">Minhas Confissões Favoritas</h2>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Você ainda não favoritou nenhuma confissão.
              <br />
              Volte aos dias e toque no ❤️ nas confissões que mais marcaram você.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => (
              <div key={fav.id} className="bg-card rounded-2xl border border-border/50 p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dia {fav.day_number} — {fav.title}
                </p>
                <p className="text-foreground italic font-serif leading-relaxed">
                  "{fav.confession_text}"
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyText(fav.confession_text || "")}
                    className="h-8 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareText(fav.confession_text || "", `Dia ${fav.day_number} — ${fav.title}`)}
                    className="h-8 text-xs"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    Compartilhar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fav.favId && removeFavorite.mutate(fav.favId)}
                    className="h-8 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION D — Plano de Manutenção 7 Dias */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗓️</span>
          <h2 className="font-serif text-lg font-semibold text-foreground">Plano de Manutenção (7 dias)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Um mini-programa para sua próxima semana. Mantenha o essencial.
        </p>
        <div className="space-y-2">
          {MAINTENANCE_PLAN.map((item) => {
            const completed = maintenanceProgress.some(
              p => p.maintenance_day === item.day && p.completed
            );
            return (
              <button
                key={item.day}
                onClick={() => !completed && toggleMaintenance.mutate(item.day)}
                disabled={completed}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left",
                  completed
                    ? "bg-green-50/50 border-green-200"
                    : "bg-card border-border/50 hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0",
                  completed ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                )}>
                  {completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    completed ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {item.icon} Dia {item.day}: {item.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION E — Próximos Passos */}
      <section className="space-y-3 pt-2">
        <h2 className="font-serif text-lg font-semibold text-foreground">Próximos Passos</h2>
        <Link to="/membros/app/modulos/confissoes-de-fe">
          <Button variant="outline" className="w-full">
            <Map className="w-4 h-4 mr-2" />
            Revisitar a jornada
          </Button>
        </Link>
      </section>
    </div>
  );
}

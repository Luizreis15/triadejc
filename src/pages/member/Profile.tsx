import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { User, LogOut, Mail, Calendar, BookOpen, PenLine, ExternalLink, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/member";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch modules for progress
  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // Fetch progress
  const { data: progress = [] } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch notebook entries count
  const { data: entriesCount = 0 } = useQuery({
    queryKey: ["notebook-entries-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from("notebook_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Calculate progress
  const totalModules = modules.length;
  const completedModules = progress.filter(p => p.completed).length;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Até logo! 👋" });
    navigate("/membros");
  };

  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null;

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <section className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {profile?.name || "Querida viajante"}
        </h1>
        <p className="text-muted-foreground flex items-center gap-1 mt-1">
          <Mail className="w-4 h-4" />
          {user?.email}
        </p>
        {memberSince && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            <Calendar className="w-3 h-3" />
            Membro desde {memberSince}
          </p>
        )}
      </section>

      {/* Progress Card */}
      <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
        <h2 className="font-serif font-semibold text-foreground mb-4">Minha Jornada</h2>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Progresso geral</span>
          <span className="text-xl font-serif font-semibold text-primary">{overallProgress}%</span>
        </div>
        <ProgressBar value={overallProgress} size="lg" />
        <p className="text-xs text-muted-foreground mt-2">
          {completedModules} de {totalModules} módulos concluídos
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={BookOpen}
          label="Módulos"
          value={`${completedModules}/${totalModules}`}
          color="bg-primary/10 text-primary"
        />
        <StatCard 
          icon={PenLine}
          label="Registros no Caderno"
          value={String(entriesCount)}
          color="bg-accent/10 text-accent-foreground"
        />
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="font-serif font-semibold text-foreground">Atalhos</h2>
        
        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Suporte</h3>
            <p className="text-xs text-muted-foreground">Precisa de ajuda? Fale conosco</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
      </section>

      {/* Logout */}
      <section className="pt-4">
        <Button 
          variant="outline" 
          className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-4 pb-8">
        <p>Jornada Única • Jordana Cantarelli</p>
        <p className="mt-1">Feito com ❤️ para você</p>
      </footer>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-serif font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

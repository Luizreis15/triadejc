import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Calendar, Star, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get users from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: newUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      // Get total modules
      const { count: totalModules } = await supabase
        .from("modules")
        .select("*", { count: "exact", head: true });

      // Get total module cards
      const { count: totalCards } = await supabase
        .from("module_cards")
        .select("*", { count: "exact", head: true });

      // Get total library items
      const { count: totalLibraryItems } = await supabase
        .from("library_items")
        .select("*", { count: "exact", head: true });

      // Get total leads
      const { count: totalLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      // Get new leads from last 7 days
      const { count: newLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      // Get total notebook entries
      const { count: totalNotebookEntries } = await supabase
        .from("notebook_entries")
        .select("*", { count: "exact", head: true });

      return {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        totalModules: totalModules || 0,
        totalCards: totalCards || 0,
        totalLibraryItems: totalLibraryItems || 0,
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        totalNotebookEntries: totalNotebookEntries || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total de Membros",
      value: stats?.totalUsers,
      icon: Users,
      description: `+${stats?.newUsers || 0} nos últimos 7 dias`,
      color: "text-blue-500",
    },
    {
      title: "Módulos do Curso",
      value: stats?.totalModules,
      icon: BookOpen,
      description: "Total de módulos ativos",
      color: "text-purple-500",
    },
    {
      title: "Cards de Conteúdo",
      value: stats?.totalCards,
      icon: FileText,
      description: "Leituras, Selahs e Downloads",
      color: "text-green-500",
    },
    {
      title: "Itens na Biblioteca",
      value: stats?.totalLibraryItems,
      icon: Star,
      description: "Materiais disponíveis",
      color: "text-yellow-500",
    },
    {
      title: "Total de Leads",
      value: stats?.totalLeads,
      icon: TrendingUp,
      description: `+${stats?.newLeads || 0} nos últimos 7 dias`,
      color: "text-orange-500",
    },
    {
      title: "Conversão",
      value: stats?.totalUsers && stats?.totalLeads 
        ? `${Math.round((stats.totalUsers / (stats.totalLeads || 1)) * 100)}%` 
        : "0%",
      icon: Calendar,
      description: "Leads convertidos em membros",
      color: "text-pink-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Dashboard
        </h2>
        <p className="text-muted-foreground">
          Visão geral da Jornada Única
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

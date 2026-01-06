import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, BookOpen, TrendingUp, Calendar, Star } from "lucide-react";
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

      // Get total scripts
      const { count: totalScripts } = await supabase
        .from("scripts")
        .select("*", { count: "exact", head: true });

      // Get scripts from last 7 days
      const { count: recentScripts } = await supabase
        .from("scripts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      // Get total modules
      const { count: totalModules } = await supabase
        .from("modules")
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

      return {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        totalScripts: totalScripts || 0,
        recentScripts: recentScripts || 0,
        totalModules: totalModules || 0,
        totalLibraryItems: totalLibraryItems || 0,
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total de Clientes",
      value: stats?.totalUsers,
      icon: Users,
      description: `+${stats?.newUsers || 0} nos últimos 7 dias`,
      color: "text-blue-500",
    },
    {
      title: "Roteiros Gerados",
      value: stats?.totalScripts,
      icon: FileText,
      description: `+${stats?.recentScripts || 0} nos últimos 7 dias`,
      color: "text-green-500",
    },
    {
      title: "Módulos Ativos",
      value: stats?.totalModules,
      icon: BookOpen,
      description: "Total de módulos do curso",
      color: "text-purple-500",
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
      description: "Leads convertidos em clientes",
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
          Visão geral do seu negócio
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Mail, UserCheck, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const emailTypeLabels: Record<string, string> = {
  reminder_1h: "1 hora",
  reminder_24h: "24 horas",
  reminder_72h: "72 horas",
};

const emailTypeColors: Record<string, string> = {
  reminder_1h: "hsl(var(--chart-1))",
  reminder_24h: "hsl(var(--chart-2))",
  reminder_72h: "hsl(var(--chart-3))",
};

export function AbandonedCartDashboard() {
  // Fetch abandoned cart metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["abandoned-cart-metrics"],
    queryFn: async () => {
      // Get all leads
      const { count: totalLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      // Get leads from landing page (potential abandoned carts)
      const { data: landingLeads } = await supabase
        .from("leads")
        .select("email")
        .eq("source", "landing-page");

      // Get all profiles (converted users)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email");

      const profileEmails = new Set(profiles?.map(p => p.email) || []);
      const abandonedLeads = landingLeads?.filter(l => !profileEmails.has(l.email)) || [];
      const convertedLeads = landingLeads?.filter(l => profileEmails.has(l.email)) || [];

      // Get email stats by type
      const { data: emailStats } = await supabase
        .from("abandoned_cart_emails")
        .select("email_type");

      const emailsByType = {
        reminder_1h: 0,
        reminder_24h: 0,
        reminder_72h: 0,
      };

      emailStats?.forEach(e => {
        if (e.email_type in emailsByType) {
          emailsByType[e.email_type as keyof typeof emailsByType]++;
        }
      });

      const totalEmailsSent = emailStats?.length || 0;
      const conversionRate = landingLeads && landingLeads.length > 0
        ? (convertedLeads.length / landingLeads.length) * 100
        : 0;

      return {
        totalLeads: totalLeads || 0,
        landingPageLeads: landingLeads?.length || 0,
        abandonedCarts: abandonedLeads.length,
        convertedLeads: convertedLeads.length,
        totalEmailsSent,
        emailsByType,
        conversionRate,
      };
    },
  });

  // Fetch recent abandoned cart emails
  const { data: recentEmails, isLoading: emailsLoading } = useQuery({
    queryKey: ["recent-abandoned-cart-emails"],
    queryFn: async () => {
      const { data } = await supabase
        .from("abandoned_cart_emails")
        .select(`
          id,
          email_type,
          sent_at,
          lead_id,
          leads!abandoned_cart_emails_lead_id_fkey (
            name,
            email
          )
        `)
        .order("sent_at", { ascending: false })
        .limit(10);

      return data || [];
    },
  });

  // Fetch leads with pending recovery
  const { data: pendingLeads, isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-abandoned-leads"],
    queryFn: async () => {
      // Get leads from landing page
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("source", "landing-page")
        .order("created_at", { ascending: false })
        .limit(20);

      // Get profiles to filter out converted
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email");

      const profileEmails = new Set(profiles?.map(p => p.email) || []);

      // Get sent emails
      const { data: sentEmails } = await supabase
        .from("abandoned_cart_emails")
        .select("lead_id, email_type");

      const emailsByLead = new Map<string, string[]>();
      sentEmails?.forEach(e => {
        const existing = emailsByLead.get(e.lead_id) || [];
        existing.push(e.email_type);
        emailsByLead.set(e.lead_id, existing);
      });

      return leads
        ?.filter(l => !profileEmails.has(l.email))
        .map(l => ({
          ...l,
          sentEmails: emailsByLead.get(l.id) || [],
        })) || [];
    },
  });

  const chartData = metrics ? [
    { name: "1h", value: metrics.emailsByType.reminder_1h, fill: emailTypeColors.reminder_1h },
    { name: "24h", value: metrics.emailsByType.reminder_24h, fill: emailTypeColors.reminder_24h },
    { name: "72h", value: metrics.emailsByType.reminder_72h, fill: emailTypeColors.reminder_72h },
  ] : [];

  const funnelData = metrics ? [
    { name: "Leads Landing", value: metrics.landingPageLeads, fill: "hsl(var(--chart-1))" },
    { name: "Abandonados", value: metrics.abandonedCarts, fill: "hsl(var(--chart-4))" },
    { name: "Convertidos", value: metrics.convertedLeads, fill: "hsl(var(--chart-2))" },
  ] : [];

  const chartConfig = {
    reminder_1h: { label: "1 hora", color: "hsl(var(--chart-1))" },
    reminder_24h: { label: "24 horas", color: "hsl(var(--chart-2))" },
    reminder_72h: { label: "72 horas", color: "hsl(var(--chart-3))" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Carrinho Abandonado
        </h2>
        <p className="text-muted-foreground">
          Métricas de recuperação de vendas e emails enviados
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrinhos Abandonados</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.abandonedCarts}</div>
                <p className="text-xs text-muted-foreground">
                  de {metrics?.landingPageLeads} leads da landing
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.totalEmailsSent}</div>
                <p className="text-xs text-muted-foreground">
                  emails de recuperação
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.convertedLeads}</div>
                <p className="text-xs text-muted-foreground">
                  leads convertidos em membros
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics?.conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  da landing page
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emails por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Emails */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Emails Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : recentEmails && recentEmails.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Enviado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-sm">{(email.leads as any)?.name || "—"}</span>
                          <span className="text-xs text-muted-foreground">{(email.leads as any)?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {emailTypeLabels[email.email_type] || email.email_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {email.sent_at ? formatDistanceToNow(new Date(email.sent_at), { addSuffix: true, locale: ptBR }) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Mail className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhum email enviado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Leads Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : pendingLeads && pendingLeads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Emails Enviados</TableHead>
                    <TableHead>Criado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeads.slice(0, 8).map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-sm">{lead.name}</span>
                          <span className="text-xs text-muted-foreground">{lead.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {lead.sentEmails.length > 0 ? (
                            lead.sentEmails.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {emailTypeLabels[type] || type}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Aguardando
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhum lead pendente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

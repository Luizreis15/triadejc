import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Play, CheckCircle2, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ScriptMetricsAdmin() {
  // Métricas gerais
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['script-metrics'],
    queryFn: async () => {
      // Total de roteiros
      const { count: totalScripts } = await supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true });

      // Roteiros gravados
      const { count: recordedScripts } = await supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'recorded');

      // Roteiros últimos 7 dias
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { count: recentScripts } = await supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo);

      // Eventos de teleprompter
      const { count: teleprompterUses } = await supabase
        .from('script_usage_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'teleprompter_start');

      // Top blocos por uso
      const { data: topBlocks } = await supabase
        .from('script_blocks')
        .select('id, type, text_content, usage_count')
        .order('usage_count', { ascending: false })
        .limit(10);

      // Scripts por dia (últimos 7 dias)
      const { data: dailyScripts } = await supabase
        .from('scripts')
        .select('created_at')
        .gte('created_at', sevenDaysAgo)
        .order('created_at');

      // Agrupar por dia
      const scriptsByDay: Record<string, number> = {};
      dailyScripts?.forEach(script => {
        const day = format(new Date(script.created_at), 'dd/MM');
        scriptsByDay[day] = (scriptsByDay[day] || 0) + 1;
      });

      return {
        totalScripts: totalScripts || 0,
        recordedScripts: recordedScripts || 0,
        recentScripts: recentScripts || 0,
        teleprompterUses: teleprompterUses || 0,
        topBlocks: topBlocks || [],
        scriptsByDay,
        recordingRate: totalScripts ? Math.round((recordedScripts || 0) / totalScripts * 100) : 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    headline: 'Gancho',
    body: 'Corpo',
    offer: 'Oferta',
    cta: 'CTA',
    ps: 'PS',
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.totalScripts}</p>
                <p className="text-xs text-muted-foreground">Total de roteiros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.recordedScripts}</p>
                <p className="text-xs text-muted-foreground">Gravados ({metrics?.recordingRate}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.teleprompterUses}</p>
                <p className="text-xs text-muted-foreground">Usos teleprompter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.recentScripts}</p>
                <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico simples de barras */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roteiros por dia (últimos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics?.scriptsByDay && Object.keys(metrics.scriptsByDay).length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {Object.entries(metrics.scriptsByDay).map(([day, count]) => {
                const maxCount = Math.max(...Object.values(metrics.scriptsByDay));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{count}</span>
                    <div 
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{day}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nenhum roteiro gerado nos últimos 7 dias.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top blocos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blocos mais usados</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics?.topBlocks && metrics.topBlocks.length > 0 ? (
            <div className="space-y-3">
              {metrics.topBlocks.map((block, index) => (
                <div 
                  key={block.id} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {block.text_content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabels[block.type] || block.type}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {block.usage_count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nenhum bloco usado ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

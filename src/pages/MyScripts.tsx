import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Play, 
  Copy, 
  Trash2, 
  Heart,
  CheckCircle2,
  FileText,
  Calendar,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const goalLabels: Record<string, string> = {
  vender: '💰 Vender',
  crescer: '📈 Crescer',
  dm: '💬 DMs',
  engajar: '❤️ Engajar',
};

const statusLabels: Record<string, { label: string; class: string }> = {
  draft: { label: 'Rascunho', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  recorded: { label: 'Gravado', class: 'bg-green-500/10 text-green-600 border-green-500/30' },
};

export default function MyScripts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Buscar roteiros do usuário
  const { data: scripts, isLoading } = useQuery({
    queryKey: ['my-scripts', user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('scripts')
        .select(`
          *,
          script_products (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Deletar roteiro
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-scripts'] });
      toast({ title: "Roteiro excluído" });
      setDeleteId(null);
    },
  });

  // Toggle favorito
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('scripts')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-scripts'] });
    },
  });

  // Copiar texto
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto pb-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/membrosvmcm/app/roteiros")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Meus Roteiros
              </h1>
              <p className="text-sm text-muted-foreground">
                {scripts?.length || 0} roteiros salvos
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
                <SelectItem value="recorded">Gravados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.header>

        {/* Lista de roteiros */}
        <div className="space-y-4">
          {scripts?.map((script, index) => (
            <motion.div
              key={script.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Header do card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {goalLabels[script.goal] || script.goal}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", statusLabels[script.status || 'draft'].class)}
                        >
                          {script.status === 'recorded' && (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {statusLabels[script.status || 'draft'].label}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {(script as any).script_products?.name || 'Produto'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(script.created_at), "d 'de' MMM, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavoriteMutation.mutate({ 
                        id: script.id, 
                        isFavorite: script.is_favorite || false 
                      })}
                      className={cn(script.is_favorite && "text-red-500")}
                    >
                      <Heart className={cn("w-4 h-4", script.is_favorite && "fill-current")} />
                    </Button>
                  </div>

                  {/* Preview do texto */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-foreground line-clamp-3">
                      {script.final_text}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/membrosvmcm/app/teleprompter/${script.id}`)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Teleprompter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(script.final_text)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(script.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Estado vazio */}
        {!isLoading && scripts?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif font-semibold text-lg mb-2">
              Nenhum roteiro ainda
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Gere seu primeiro roteiro na Fábrica de Roteiros
            </p>
            <Button onClick={() => navigate("/membrosvmcm/app/roteiros")}>
              Criar Roteiro
            </Button>
          </motion.div>
        )}

        {/* Dialog de confirmação de delete */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir roteiro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O roteiro será permanentemente excluído.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeleprompterDisplay } from "@/components/scripts/TeleprompterDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { trackScriptEvent } from "@/lib/scriptGenerator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Teleprompter() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar roteiro
  const { data: script, isLoading } = useQuery({
    queryKey: ['script', scriptId],
    queryFn: async () => {
      if (!scriptId) throw new Error('Script ID não fornecido');
      
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', scriptId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!scriptId,
  });

  // Registrar início do teleprompter
  const trackStart = useMutation({
    mutationFn: async () => {
      if (user?.id && scriptId) {
        await trackScriptEvent(user.id, 'teleprompter_start', scriptId);
      }
    },
  });

  // Marcar como gravado
  const markRecordedMutation = useMutation({
    mutationFn: async () => {
      if (!scriptId) throw new Error('Script ID não fornecido');
      
      const { error } = await supabase
        .from('scripts')
        .update({ status: 'recorded' })
        .eq('id', scriptId);
      
      if (error) throw error;
      
      if (user?.id) {
        await trackScriptEvent(user.id, 'mark_recorded', scriptId);
        await trackScriptEvent(user.id, 'teleprompter_complete', scriptId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-scripts'] });
      toast({
        title: "Roteiro marcado como gravado!",
      });
      navigate('/membrosvmcm/app/meus-roteiros');
    },
  });

  // Registrar início quando carregar
  if (script && !trackStart.isPending && !trackStart.isSuccess) {
    trackStart.mutate();
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!script) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Roteiro não encontrado</p>
          <button
            onClick={() => navigate('/membrosvmcm/app/meus-roteiros')}
            className="text-primary hover:underline"
          >
            Voltar para Meus Roteiros
          </button>
        </div>
      </div>
    );
  }

  return (
    <TeleprompterDisplay
      text={script.final_text}
      onClose={() => navigate('/membrosvmcm/app/meus-roteiros')}
      onMarkRecorded={() => markRecordedMutation.mutate()}
    />
  );
}

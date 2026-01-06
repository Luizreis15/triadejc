import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScriptCard } from "@/components/scripts/ScriptCard";
import { TeleprompterDisplay } from "@/components/scripts/TeleprompterDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  generateScript, 
  trackScriptEvent,
  type Goal,
  type Style,
  type GeneratedScript 
} from "@/lib/scriptGenerator";
import { 
  Sparkles, 
  Loader2, 
  ArrowLeft,
  Wand2,
  FileText
} from "lucide-react";

type ScriptProduct = {
  id: string;
  name: string;
  niche: string | null;
  promise: string | null;
  price: number | null;
  guarantee_days: number | null;
  checkout_url: string | null;
  whatsapp_url: string | null;
  tone_tags: string[] | null;
  forbidden_words: string[] | null;
  is_active: boolean | null;
  created_at: string | null;
};

const goalOptions: { value: Goal; label: string; emoji: string }[] = [
  { value: 'vender', label: 'Vender', emoji: '💰' },
  { value: 'crescer', label: 'Crescer', emoji: '📈' },
  { value: 'dm', label: 'Gerar DMs', emoji: '💬' },
  { value: 'engajar', label: 'Engajar', emoji: '❤️' },
];

const durationOptions = [
  { value: 15, label: '15 segundos' },
  { value: 30, label: '30 segundos' },
  { value: 45, label: '45 segundos' },
  { value: 60, label: '60 segundos' },
];

const styleOptions: { value: Style; label: string }[] = [
  { value: 'direto', label: 'Direto ao ponto' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'verdade_dura', label: 'Verdade dura' },
  { value: 'didatico', label: 'Didático' },
];

export default function ScriptGenerator() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [goal, setGoal] = useState<Goal>('vender');
  const [duration, setDuration] = useState<number>(30);
  const [style, setStyle] = useState<Style>('direto');
  const [lockedBlocks, setLockedBlocks] = useState<Record<string, string>>({});
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [savedScriptId, setSavedScriptId] = useState<string | null>(null);
  const [showTeleprompter, setShowTeleprompter] = useState(false);

  // Buscar produtos ativos
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['script-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('script_products')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as ScriptProduct[];
    },
  });

  // Mutação para gerar roteiro
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) throw new Error('Selecione um produto');
      
      return generateScript({
        productId: selectedProduct,
        goal,
        durationSeconds: duration,
        style,
        lockedBlocks: Object.fromEntries(
          Object.entries(lockedBlocks).filter(([, v]) => v)
        ),
      });
    },
    onSuccess: (script) => {
      setGeneratedScript(script);
      setSavedScriptId(null);
      
      // Registrar evento
      if (user?.id) {
        trackScriptEvent(user.id, 'generate', undefined, {
          product_id: selectedProduct,
          goal,
          duration,
          style,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar roteiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para salvar roteiro
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!generatedScript || !user?.id) throw new Error('Erro ao salvar');

      const { data, error } = await supabase
        .from('scripts')
        .insert({
          user_id: user.id,
          product_id: selectedProduct,
          goal,
          style,
          duration_seconds: duration,
          headline_block_id: generatedScript.headline?.id || null,
          body_block_id: generatedScript.body?.id || null,
          offer_block_id: generatedScript.offer?.id || null,
          cta_block_id: generatedScript.cta?.id || null,
          ps_block_id: generatedScript.ps?.id || null,
          final_text: generatedScript.finalText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSavedScriptId(data.id);
      toast({
        title: "Roteiro salvo!",
        description: "Você pode acessá-lo em 'Meus Roteiros'",
      });
      
      if (user?.id) {
        trackScriptEvent(user.id, 'save', data.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ['my-scripts'] });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Copiar texto
  const handleCopy = async () => {
    if (!generatedScript) return;
    
    await navigator.clipboard.writeText(generatedScript.finalText);
    toast({
      title: "Copiado!",
      description: "Roteiro copiado para a área de transferência",
    });
    
    if (user?.id) {
      trackScriptEvent(user.id, 'copy', savedScriptId || undefined);
    }
  };

  // Toggle lock de bloco
  const handleToggleLock = (type: string) => {
    if (!generatedScript) return;
    
    const blockId = (generatedScript as any)[type]?.id;
    
    setLockedBlocks(prev => ({
      ...prev,
      [type]: prev[type] ? '' : blockId,
    }));
  };

  // Marcar como gravado
  const handleMarkRecorded = async () => {
    if (!savedScriptId) return;
    
    await supabase
      .from('scripts')
      .update({ status: 'recorded' })
      .eq('id', savedScriptId);
    
    if (user?.id) {
      trackScriptEvent(user.id, 'mark_recorded', savedScriptId);
    }
    
    setShowTeleprompter(false);
    toast({
      title: "Roteiro marcado como gravado!",
    });
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
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/membrosvmcm/app")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Fábrica de Roteiros
              </h1>
              <p className="text-sm text-muted-foreground">
                Gere roteiros infinitos em segundos
              </p>
            </div>
          </div>
        </motion.header>

        {/* Formulário de geração */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardContent className="p-4 space-y-4">
              {/* Produto */}
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Objetivo */}
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {goalOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={goal === option.value ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setGoal(option.value)}
                    >
                      <span className="mr-2">{option.emoji}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label>Duração</Label>
                <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estilo */}
              <div className="space-y-2">
                <Label>Estilo</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as Style)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botão de gerar */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => generateMutation.mutate()}
                disabled={!selectedProduct || generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Gerar Roteiro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resultado */}
        {generatedScript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Seu Roteiro
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/membrosvmcm/app/meus-roteiros")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Meus Roteiros
              </Button>
            </div>

            <ScriptCard
              headline={generatedScript.headline}
              body={generatedScript.body}
              offer={generatedScript.offer}
              cta={generatedScript.cta}
              ps={generatedScript.ps}
              finalText={generatedScript.finalText}
              estimatedDuration={generatedScript.estimatedDuration}
              lockedBlocks={Object.fromEntries(
                Object.entries(lockedBlocks).map(([k, v]) => [k, !!v])
              )}
              onToggleLock={handleToggleLock}
              onCopy={handleCopy}
              onSave={() => saveMutation.mutate()}
              onVariation={() => generateMutation.mutate()}
              onTeleprompter={() => setShowTeleprompter(true)}
              isSaved={!!savedScriptId}
            />
          </motion.div>
        )}

        {/* Estado vazio */}
        {!generatedScript && !loadingProducts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif font-semibold text-lg mb-2">
              Pronta pra criar?
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Selecione um produto e clique em "Gerar Roteiro" para criar seu primeiro roteiro magnético.
            </p>
          </motion.div>
        )}
      </div>

      {/* Teleprompter */}
      {showTeleprompter && generatedScript && (
        <TeleprompterDisplay
          text={generatedScript.finalText}
          onClose={() => setShowTeleprompter(false)}
          onMarkRecorded={savedScriptId ? handleMarkRecorded : undefined}
        />
      )}
    </AppLayout>
  );
}

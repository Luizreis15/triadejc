import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  TrendingUp, 
  Bookmark, 
  Share2, 
  MessageCircle,
  ExternalLink,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function ResultCard({ result }: { result: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {new Date(result.post_date).toLocaleDateString("pt-BR")}
              </span>
            </div>
            {result.post_url && (
              <Button variant="ghost" size="icon-sm" asChild>
                <a href={result.post_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">
                {result.reach >= 1000 ? `${(result.reach / 1000).toFixed(1)}k` : result.reach}
              </p>
              <p className="text-xs text-muted-foreground">Alcance</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Bookmark className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{result.saves}</p>
              <p className="text-xs text-muted-foreground">Salvos</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Share2 className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{result.shares}</p>
              <p className="text-xs text-muted-foreground">Shares</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <MessageCircle className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{result.dms}</p>
              <p className="text-xs text-muted-foreground">DMs</p>
            </div>
          </div>

          {result.notes && (
            <p className="text-sm text-muted-foreground">
              {result.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NewResultForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    postUrl: "",
    postDate: new Date().toISOString().split("T")[0],
    reach: "",
    saves: "",
    shares: "",
    dms: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("results").insert({
        user_id: user.id,
        post_url: formData.postUrl || null,
        post_date: formData.postDate,
        reach: parseInt(formData.reach) || 0,
        saves: parseInt(formData.saves) || 0,
        shares: parseInt(formData.shares) || 0,
        dms: parseInt(formData.dms) || 0,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Resultado salvo!",
        description: "Continue acompanhando seu progresso.",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto"
    >
      <div className="min-h-full flex flex-col max-w-lg mx-auto">
        <header className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm">
          <h2 className="font-serif font-semibold text-foreground">
            Novo Resultado
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        </header>

        <div className="flex-1 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Data do post
            </label>
            <Input
              type="date"
              value={formData.postDate}
              onChange={(e) => setFormData({ ...formData, postDate: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Link do post (opcional)
            </label>
            <Input
              value={formData.postUrl}
              onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
              placeholder="https://instagram.com/p/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Alcance
              </label>
              <Input
                type="number"
                value={formData.reach}
                onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Salvamentos
              </label>
              <Input
                type="number"
                value={formData.saves}
                onChange={(e) => setFormData({ ...formData, saves: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Compartilhamentos
              </label>
              <Input
                type="number"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                DMs recebidas
              </label>
              <Input
                type="number"
                value={formData.dms}
                onChange={(e) => setFormData({ ...formData, dms: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Observações
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="O que funcionou? O que melhorar?"
              className="min-h-24"
            />
          </div>
        </div>

        <footer className="p-4 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur-sm">
          <Button
            variant="gradient"
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar Resultado"}
          </Button>
        </footer>
      </div>
    </motion.div>
  );
}

export default function Results() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Buscar resultados
  const { data: results, isLoading } = useQuery({
    queryKey: ["results", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("user_id", user.id)
        .order("post_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Métricas agregadas
  const totalReach = results?.reduce((sum, r) => sum + (r.reach || 0), 0) || 0;
  const totalSaves = results?.reduce((sum, r) => sum + (r.saves || 0), 0) || 0;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["results", user?.id] });
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Resultados
            </h1>
            <Button variant="default" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Card variant="default">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-serif font-bold text-primary">
                  {totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}k` : totalReach}
                </p>
                <p className="text-xs text-muted-foreground">Alcance total</p>
              </CardContent>
            </Card>
            <Card variant="default">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-serif font-bold text-success">
                  {totalSaves}
                </p>
                <p className="text-xs text-muted-foreground">Salvamentos</p>
              </CardContent>
            </Card>
          </div>
        </motion.header>

        {/* Lista de resultados */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <Card variant="default" className="border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhum resultado registrado ainda
              </p>
              <Button variant="default" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar primeiro resultado
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {showForm && (
        <NewResultForm 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSuccess}
        />
      )}
    </AppLayout>
  );
}

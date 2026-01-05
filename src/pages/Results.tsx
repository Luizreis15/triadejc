import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  TrendingUp, 
  Bookmark, 
  Share2, 
  MessageCircle,
  ExternalLink,
  Calendar,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type Result = {
  id: number;
  date: string;
  postUrl: string;
  reach: number;
  saves: number;
  shares: number;
  dms: number;
  notes: string;
};

const mockResults: Result[] = [
  {
    id: 1,
    date: "02/01/2025",
    postUrl: "https://instagram.com/p/abc123",
    reach: 12500,
    saves: 450,
    shares: 89,
    dms: 23,
    notes: "Melhor carrossel do mês! O gancho de contraste funcionou muito bem.",
  },
  {
    id: 2,
    date: "30/12/2024",
    postUrl: "https://instagram.com/p/def456",
    reach: 8200,
    saves: 280,
    shares: 45,
    dms: 12,
    notes: "Bom alcance, mas menos saves que o esperado.",
  },
];

function ResultCard({ result }: { result: Result }) {
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
              <span className="text-sm font-medium text-foreground">{result.date}</span>
            </div>
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={result.postUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{(result.reach / 1000).toFixed(1)}k</p>
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

function NewResultForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    postUrl: "",
    reach: "",
    saves: "",
    shares: "",
    dms: "",
    notes: "",
  });

  const handleSubmit = () => {
    toast({
      title: "Resultado salvo!",
      description: "Continue acompanhando seu progresso.",
    });
    onClose();
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
              Link do post
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
          >
            Salvar Resultado
          </Button>
        </footer>
      </div>
    </motion.div>
  );
}

export default function Results() {
  const [showForm, setShowForm] = useState(false);
  const [results] = useState(mockResults);

  // Métricas agregadas
  const totalReach = results.reduce((sum, r) => sum + r.reach, 0);
  const totalSaves = results.reduce((sum, r) => sum + r.saves, 0);

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
                  {(totalReach / 1000).toFixed(1)}k
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
        <div className="space-y-3">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>

        {results.length === 0 && (
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

      {showForm && <NewResultForm onClose={() => setShowForm(false)} />}
    </AppLayout>
  );
}

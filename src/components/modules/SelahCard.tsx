import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pause, NotebookPen, Check } from "lucide-react";

interface SelahCardProps {
  id: string;
  title: string;
  videoUrl?: string | null;
  reflection: string;
  isCompleted?: boolean;
  onComplete: () => void;
  onSaveToNotebook: () => void;
}

export function SelahCard({ 
  id,
  title, 
  videoUrl, 
  reflection, 
  isCompleted = false,
  onComplete, 
  onSaveToNotebook 
}: SelahCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-secondary/30 bg-gradient-to-b from-secondary/5 to-background">
        {/* Header destacado */}
        <div className="bg-secondary/10 px-4 py-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <Pause className="h-4 w-4 text-secondary" />
          </div>
          <span className="text-sm font-medium text-secondary">Momento Selah</span>
          {isCompleted && (
            <Badge variant="success" className="ml-auto">
              <Check className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Video Player */}
          {videoUrl && videoUrl !== "[LINK]" && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Título */}
          <h3 className="font-serif font-semibold text-lg text-foreground">
            {title}
          </h3>

          {/* Texto de reflexão */}
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {reflection}
          </p>

          {/* Botões de ação */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={onSaveToNotebook}
            >
              <NotebookPen className="h-4 w-4" />
              Registrar no Caderno
            </Button>
            
            <Button
              variant={isCompleted ? "muted" : "secondary"}
              size="sm"
              className="w-full gap-2"
              onClick={onComplete}
              disabled={isCompleted}
            >
              <Check className="h-4 w-4" />
              {isCompleted ? "Selah concluído" : "Marcar Selah como concluído"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, NotebookPen, Check } from "lucide-react";

interface IntroCardProps {
  title: string;
  subtitle?: string;
  content?: string;
  isCompleted?: boolean;
  onOpen: () => void;
  onSaveToNotebook: () => void;
  onComplete: () => void;
}

export function IntroCard({ 
  title, 
  subtitle = "Antes de avançar, faça esta pausa.",
  content,
  isCompleted = false,
  onOpen,
  onSaveToNotebook,
  onComplete
}: IntroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-serif font-semibold text-lg text-foreground">
                  {title}
                </h3>
                {isCompleted && (
                  <Badge variant="success">
                    <Check className="h-3 w-3 mr-1" />
                    Feito
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>

          {content && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full"
              onClick={onOpen}
            >
              Abrir
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={onSaveToNotebook}
              >
                <NotebookPen className="h-4 w-4" />
                Caderno
              </Button>
              
              <Button
                variant={isCompleted ? "muted" : "secondary"}
                size="sm"
                className="flex-1 gap-2"
                onClick={onComplete}
                disabled={isCompleted}
              >
                <Check className="h-4 w-4" />
                {isCompleted ? "Concluído" : "Concluir"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

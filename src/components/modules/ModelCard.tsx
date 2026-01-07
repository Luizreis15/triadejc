import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart, BookmarkPlus, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ModelCardProps {
  title: string;
  objective: string;
  whenToUse: string;
  cards: string[];
  className?: string;
}

export function ModelCard({
  title,
  objective,
  whenToUse,
  cards,
  className,
}: ModelCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const fullText = cards.map((card, i) => `${i + 1}. ${card}`).join("\n");
    await navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    toast({
      title: "Copiado!",
      description: "Modelo copiado para a área de transferência.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
    });
  };

  const handleSaveToNotebook = () => {
    toast({
      title: "Salvo no caderno!",
      description: "Você pode acessar este modelo em 'Meu Caderno'.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">✨</span>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Objetivo: {objective}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="font-medium">Quando usar:</span> {whenToUse}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Estrutura (Cards)
          </p>
          
          <div className="space-y-2">
            {cards.map((card, index) => (
              <div
                key={index}
                className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {card}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <Button
              variant="muted"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isCopied ? "Copiado!" : "Copiar"}
            </Button>
            <Button
              variant="muted"
              size="sm"
              onClick={handleFavorite}
              className="gap-2"
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isFavorited && "fill-primary text-primary"
                )}
              />
              Favoritar
            </Button>
            <Button
              variant="muted"
              size="sm"
              onClick={handleSaveToNotebook}
              className="gap-2"
            >
              <BookmarkPlus className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Heart, BookmarkPlus, Check, Play } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ContentCardProps {
  type: "video" | "text" | "model" | "exercise" | "download";
  title: string;
  content?: string;
  videoUrl?: string;
  showCopy?: boolean;
  showFavorite?: boolean;
  showSaveToNotebook?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Converte URLs do YouTube para formato embed
function convertToEmbedUrl(url: string): string | null {
  if (!url || url === "[LINK]" || url.trim() === "") return null;
  
  // YouTube watch URL
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  // Já é embed URL
  if (url.includes("youtube.com/embed/")) {
    return url;
  }
  
  // Vimeo URL
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Retorna a URL original se não for reconhecida
  return url;
}

export function ContentCard({
  type,
  title,
  content,
  videoUrl,
  showCopy = false,
  showFavorite = false,
  showSaveToNotebook = false,
  className,
  children,
}: ContentCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const embedUrl = videoUrl ? convertToEmbedUrl(videoUrl) : null;

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
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
      description: "Você pode acessar este conteúdo em 'Meu Caderno'.",
    });
  };

  const typeIcons = {
    video: "🎬",
    text: "📝",
    model: "✨",
    exercise: "💪",
    download: "📥",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeIcons[type]}</span>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {type === "video" && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Vídeo em breve</span>
                </div>
              )}
            </div>
          )}

          {content && (
            <div className="prose prose-sm max-w-none text-foreground mb-4">
              <p className="whitespace-pre-wrap">{content}</p>
            </div>
          )}

          {children}

          {(showCopy || showFavorite || showSaveToNotebook) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              {showCopy && (
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
              )}
              {showFavorite && (
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
              )}
              {showSaveToNotebook && (
                <Button
                  variant="muted"
                  size="sm"
                  onClick={handleSaveToNotebook}
                  className="gap-2"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Salvar no Caderno
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

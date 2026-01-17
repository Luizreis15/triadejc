import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ModuleVideoHeroProps {
  title: string;
  description?: string;
  videoUrl?: string | null;
}

export function ModuleVideoHero({ 
  title, 
  description, 
  videoUrl 
}: ModuleVideoHeroProps) {
  // Se não tem vídeo válido, não renderiza nada
  if (!videoUrl || videoUrl === "[LINK]") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Video Player */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted">
          <iframe
            src={videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Card>

      {/* Título e descrição */}
      <div className="px-1">
        <h2 className="font-serif font-semibold text-lg text-foreground mb-1">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

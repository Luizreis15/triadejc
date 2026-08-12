import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  className?: string;
}

// Temporário: vídeos ocultos na área de membros enquanto a hospedagem é reconfigurada.
// Basta voltar para `true` para reexibir todos os players (nada foi removido do banco).
const VIDEOS_ENABLED = false;

export function VideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  title,
  className 
}: VideoPlayerProps) {
  if (!VIDEOS_ENABLED) return null;

  // Check if it's a YouTube URL
  const isYouTube = videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be");
  
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.includes("youtu.be") 
      ? url.split("/").pop() 
      : new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Check if it's a Vimeo URL
  const isVimeo = videoUrl?.includes("vimeo.com");
  
  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.split("/").pop();
    return `https://player.vimeo.com/video/${videoId}`;
  };

  // Check if it's a Bunny.net / MediaDelivery URL
  const isBunny = videoUrl?.includes("iframe.mediadelivery.net") || videoUrl?.includes("bunny.net");
  
  const getBunnyEmbedUrl = (url: string) => {
    try {
      // Converter /play/ para /embed/ para compatibilidade com iframe responsivo
      let embedUrl = url.replace('/play/', '/embed/');
      
      const urlObj = new URL(embedUrl);
      urlObj.searchParams.set('responsive', 'true');
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  if (!videoUrl) {
    return (
      <div className={cn(
        "relative aspect-video bg-muted/30 rounded-2xl overflow-hidden flex items-center justify-center",
        className
      )}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
          <span className="text-sm">{title || "Vídeo em breve"}</span>
        </div>
      </div>
    );
  }

  if (isYouTube) {
    return (
      <div className={cn("relative aspect-video rounded-2xl overflow-hidden", className)}>
        <iframe
          src={getYouTubeEmbedUrl(videoUrl)}
          title={title || "Vídeo"}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isVimeo) {
    return (
      <div className={cn("relative aspect-video rounded-2xl overflow-hidden", className)}>
        <iframe
          src={getVimeoEmbedUrl(videoUrl)}
          title={title || "Vídeo"}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isBunny) {
    return (
      <div 
        className={cn("relative rounded-2xl overflow-hidden", className)}
        style={{ paddingTop: "56.25%" }}
      >
        <iframe
          src={getBunnyEmbedUrl(videoUrl)}
          title={title || "Vídeo"}
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ 
            border: "none", 
            position: "absolute", 
            top: 0, 
            left: 0,
            height: "100%", 
            width: "100%" 
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-video rounded-2xl overflow-hidden", className)}>
      <video
        src={videoUrl}
        poster={thumbnailUrl}
        controls
        className="absolute inset-0 w-full h-full object-cover"
      >
        Seu navegador não suporta vídeos.
      </video>
    </div>
  );
}

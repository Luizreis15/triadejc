import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  X, 
  FlipHorizontal, 
  Sun, 
  Moon,
  Minus,
  Plus,
  RotateCcw,
  Check,
  Video,
  VideoOff,
  Circle,
  Square,
  Download,
  Trash2,
  Camera,
  SwitchCamera,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCameraRecorder } from "./useCameraRecorder";
import { CameraSelector } from "./CameraSelector";
import { useToast } from "@/hooks/use-toast";

interface TeleprompterDisplayProps {
  text: string;
  onClose: () => void;
  onMarkRecorded?: () => void;
}

type TeleprompterMode = "practice" | "recording";

export function TeleprompterDisplay({ 
  text, 
  onClose,
  onMarkRecorded 
}: TeleprompterDisplayProps) {
  const { toast } = useToast();
  
  // Estados do teleprompter
  const [mode, setMode] = useState<TeleprompterMode>("practice");
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(140);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isMirrored, setIsMirrored] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [textOpacity, setTextOpacity] = useState(0.85);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const wpmRef = useRef(wpm);

  // Hook de câmera/gravação
  const {
    isCameraEnabled,
    isRecording,
    recordingTime,
    availableCameras,
    selectedCamera,
    isCameraMirrored,
    cameraError,
    startCamera,
    stopCamera,
    switchCamera,
    startRecording,
    stopRecording,
    discardRecording,
    shareOrDownloadVideo,
    listCameras,
    setIsCameraMirrored,
    formatTime,
    isSupported,
  } = useCameraRecorder({
    onRecordingComplete: (blob) => {
      setRecordedBlob(blob);
      toast({
        title: "Gravação concluída!",
        description: "Você pode baixar ou descartar o vídeo.",
      });
    },
  });

  // Manter wpmRef atualizado
  useEffect(() => {
    wpmRef.current = wpm;
  }, [wpm]);

  const wordCount = text.split(/\s+/).length;

  const fontSizeClasses = {
    small: 'text-xl md:text-2xl',
    medium: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-4xl',
  };

  // Ativar modo gravação
  const enableRecordingMode = useCallback(async () => {
    if (!isSupported()) {
      toast({
        title: "Navegador não suportado",
        description: "Seu navegador não suporta gravação de vídeo. Tente usar Chrome, Firefox ou Edge.",
        variant: "destructive",
      });
      return;
    }

    // Passar o elemento video para o hook
    const stream = await startCamera(undefined, cameraVideoRef.current || undefined);
    if (stream) {
      setMode("recording");
      await listCameras();
    }
  }, [startCamera, listCameras, isSupported, toast]);

  // Desativar modo gravação
  const disableRecordingMode = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    }
    stopCamera();
    setMode("practice");
    setRecordedBlob(null);
  }, [isRecording, stopRecording, stopCamera]);

  const startPlayback = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(3);
  }, [countdown]);

  // Contagem regressiva
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
      setIsPlaying(true);
      
      // Se no modo gravação e não está gravando, iniciar gravação
      if (mode === "recording" && !isRecording && isCameraEnabled) {
        startRecording();
      }
    }
  }, [countdown, mode, isRecording, isCameraEnabled, startRecording]);

  // Animação de scroll usando delta time para suavidade
  useEffect(() => {
    if (!isPlaying || !containerRef.current || !textRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const textHeight = textRef.current.scrollHeight;
    const maxScroll = Math.max(0, textHeight - containerHeight + 100);

    lastTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      const currentWpm = wpmRef.current;
      const totalDuration = (wordCount / currentWpm) * 60 * 1000;
      const pixelsPerMs = maxScroll / totalDuration;

      setScrollPosition(prev => {
        const newPosition = prev + (pixelsPerMs * deltaTime);
        
        if (newPosition >= maxScroll) {
          setIsPlaying(false);
          setIsComplete(true);
          
          // Parar gravação automaticamente quando texto terminar
          if (isRecording) {
            stopRecording();
          }
          
          return maxScroll;
        }
        
        return newPosition;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, wordCount, isRecording, stopRecording]);

  const handlePlayPause = () => {
    if (isComplete) {
      setScrollPosition(0);
      setIsComplete(false);
      setRecordedBlob(null);
      startPlayback();
    } else if (isPlaying) {
      setIsPlaying(false);
      // Pausar gravação também
      if (isRecording) {
        stopRecording();
      }
    } else {
      startPlayback();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setScrollPosition(0);
    setIsComplete(false);
    setCountdown(null);
    
    if (isRecording) {
      stopRecording();
      discardRecording();
    }
    setRecordedBlob(null);
  };

  const handleDownload = async () => {
    if (recordedBlob) {
      const result = await shareOrDownloadVideo(recordedBlob);
      
      if (result.success) {
        if (result.method === 'share') {
          toast({
            title: "Vídeo pronto!",
            description: "Escolha onde salvar seu vídeo.",
          });
        } else if (result.method === 'download') {
          toast({
            title: "Download iniciado!",
            description: "O vídeo está sendo baixado.",
          });
        }
      }
    }
  };

  const handleDiscard = () => {
    setRecordedBlob(null);
    discardRecording();
    toast({
      title: "Gravação descartada",
    });
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex flex-col",
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      )}
    >
      {/* Vídeo da câmera - sempre no DOM para garantir que ref está disponível */}
      <video
        ref={cameraVideoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          isCameraMirrored && "scale-x-[-1]",
          mode !== "recording" && "hidden"
        )}
      />

      {/* Header com controles */}
      <div className={cn(
        "relative flex items-center justify-between p-4 border-b z-10",
        isDarkMode ? "border-white/10" : "border-black/10",
        mode === "recording" && "bg-black/50"
      )}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Indicador de gravação */}
          {isRecording && (
            <div className="flex items-center gap-2 ml-2">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-1.5"
              >
                <Circle className="h-3 w-3 fill-red-500 text-red-500" />
                <span className="text-red-500 font-medium text-sm">REC</span>
              </motion.div>
              <span className="text-white/70 font-mono text-sm">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Câmera */}
          <Button
            variant="ghost"
            size="icon"
            onClick={mode === "recording" ? disableRecordingMode : enableRecordingMode}
            className={cn(
              isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10",
              mode === "recording" && "bg-red-500/20 text-red-400"
            )}
          >
            {mode === "recording" ? (
              <VideoOff className="h-5 w-5" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </Button>

          {/* Seletor de câmera (só no modo gravação) */}
          {mode === "recording" && availableCameras.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCameraSelector(true)}
              className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
            >
              <SwitchCamera className="h-5 w-5" />
            </Button>
          )}

          {/* Espelho da câmera (só no modo gravação) */}
          {mode === "recording" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCameraMirrored(!isCameraMirrored)}
              className={cn(
                isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10",
                isCameraMirrored && "bg-primary/20"
              )}
            >
              <Camera className="h-5 w-5" />
            </Button>
          )}

          {/* Espelho do texto */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMirrored(!isMirrored)}
            className={cn(
              isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10",
              isMirrored && "bg-primary/20"
            )}
          >
            <FlipHorizontal className="h-5 w-5" />
          </Button>

          {/* Tema (só no modo prática) */}
          {mode === "practice" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {/* Tamanho da fonte */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
              const currentIndex = sizes.indexOf(fontSize);
              setFontSize(sizes[(currentIndex + 1) % sizes.length]);
            }}
            className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
          >
            <span className="text-sm font-bold">
              {fontSize === 'small' ? 'P' : fontSize === 'medium' ? 'M' : 'G'}
            </span>
          </Button>
        </div>
      </div>

      {/* Mensagem de erro da câmera */}
      {cameraError && (
        <div className="absolute top-20 left-4 right-4 z-20">
          <div className="bg-red-500/90 text-white rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Área do texto */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative z-10"
      >
        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <span className="text-9xl font-bold text-white drop-shadow-lg">
                {countdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay para gravação concluída */}
        <AnimatePresence>
          {recordedBlob && !isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20 bg-black/80"
            >
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Check className="h-8 w-8" />
                  <span className="text-2xl font-semibold">Gravação Concluída!</span>
                </div>
                
                <p className="text-white/70">
                  Duração: {formatTime(recordingTime)}
                </p>
                
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleDiscard}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Descartar
                  </Button>
                  
                  <Button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Vídeo
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Texto rolando */}
        <div
          ref={textRef}
          style={{ 
            transform: `translateY(-${scrollPosition}px) ${isMirrored ? 'scaleX(-1)' : ''}`,
            willChange: 'transform',
            opacity: mode === "recording" ? textOpacity : 1,
          }}
          className={cn(
            "px-8 py-20",
            fontSizeClasses[fontSize],
            "font-serif leading-relaxed text-center",
            mode === "recording" && "text-white drop-shadow-lg"
          )}
        >
          {/* Background semi-transparente para texto no modo gravação */}
          {mode === "recording" && (
            <div className="absolute inset-0 bg-black/30 -z-10" />
          )}
          
          {text.split('\n').map((line, i) => (
            <p key={i} className="mb-6">
              {line || '\u00A0'}
            </p>
          ))}
          
          {/* Espaço extra no final */}
          <div className="h-[50vh]" />
        </div>

        {/* Gradientes de fade */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-20 pointer-events-none",
          mode === "recording"
            ? "bg-gradient-to-b from-black/60 to-transparent"
            : isDarkMode 
              ? "bg-gradient-to-b from-black to-transparent" 
              : "bg-gradient-to-b from-white to-transparent"
        )} />
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-20 pointer-events-none",
          mode === "recording"
            ? "bg-gradient-to-t from-black/60 to-transparent"
            : isDarkMode 
              ? "bg-gradient-to-t from-black to-transparent" 
              : "bg-gradient-to-t from-white to-transparent"
        )} />

        {/* Linha guia central */}
        <div className="absolute top-1/3 left-0 right-0 pointer-events-none">
          <div className={cn(
            "h-0.5 opacity-30",
            mode === "recording" ? "bg-white" : isDarkMode ? "bg-white" : "bg-black"
          )} />
        </div>
      </div>

      {/* Footer com controles de playback */}
      <div className={cn(
        "relative p-4 border-t space-y-4 z-10",
        isDarkMode ? "border-white/10" : "border-black/10",
        mode === "recording" && "bg-black/50"
      )}>
        {/* Slider de opacidade do texto (só no modo gravação) */}
        {mode === "recording" && (
          <div className="flex items-center gap-4 mb-2">
            <span className="text-white/70 text-xs w-16">Texto</span>
            <Slider
              value={[textOpacity * 100]}
              onValueChange={([value]) => setTextOpacity(value / 100)}
              min={20}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-white/70 text-xs w-12">{Math.round(textOpacity * 100)}%</span>
          </div>
        )}

        {/* Slider de velocidade */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWpm(Math.max(80, wpm - 10))}
            className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Slider
              value={[wpm]}
              onValueChange={([value]) => setWpm(value)}
              min={80}
              max={220}
              step={10}
              className="w-full"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWpm(Math.min(220, wpm + 10))}
            className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <span className={cn(
            "text-sm font-mono w-20 text-center",
            isDarkMode ? "text-white/70" : "text-black/70"
          )}>
            {wpm} WPM
          </span>
        </div>

        {/* Botões de controle */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button
            size="lg"
            onClick={handlePlayPause}
            disabled={!!recordedBlob}
            className={cn(
              "w-16 h-16 rounded-full",
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : isComplete 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-primary hover:bg-primary/90"
            )}
          >
            {isPlaying ? (
              isRecording ? (
                <Square className="h-6 w-6" />
              ) : (
                <Pause className="h-8 w-8" />
              )
            ) : isComplete ? (
              <RotateCcw className="h-8 w-8" />
            ) : (
              mode === "recording" ? (
                <Circle className="h-8 w-8 fill-current" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )
            )}
          </Button>

          {onMarkRecorded && isComplete && !recordedBlob && (
            <Button
              variant="outline"
              size="icon"
              onClick={onMarkRecorded}
              className="border-green-500 text-green-500 hover:bg-green-500/10"
            >
              <Check className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Modal de seleção de câmera */}
      <CameraSelector
        open={showCameraSelector}
        onOpenChange={setShowCameraSelector}
        cameras={availableCameras}
        selectedCamera={selectedCamera}
        onSelectCamera={switchCamera}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

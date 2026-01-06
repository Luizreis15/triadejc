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
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeleprompterDisplayProps {
  text: string;
  onClose: () => void;
  onMarkRecorded?: () => void;
}

export function TeleprompterDisplay({ 
  text, 
  onClose,
  onMarkRecorded 
}: TeleprompterDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(140);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isMirrored, setIsMirrored] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Calcular velocidade de scroll baseado em WPM
  const wordCount = text.split(/\s+/).length;
  const totalDuration = (wordCount / wpm) * 60 * 1000; // em ms

  const fontSizeClasses = {
    small: 'text-2xl md:text-3xl',
    medium: 'text-3xl md:text-4xl',
    large: 'text-4xl md:text-5xl',
  };

  const startPlayback = useCallback(() => {
    if (countdown !== null) return;
    
    // Iniciar contagem regressiva
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
    }
  }, [countdown]);

  // Animação de scroll
  useEffect(() => {
    if (!isPlaying || !containerRef.current || !textRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const textHeight = textRef.current.scrollHeight;
    const maxScroll = Math.max(0, textHeight - containerHeight + 100);

    const startTime = Date.now() - (scrollPosition / maxScroll) * totalDuration;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / totalDuration);
      const newPosition = progress * maxScroll;
      
      setScrollPosition(newPosition);
      
      if (progress >= 1) {
        setIsPlaying(false);
        setIsComplete(true);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, totalDuration, wpm]);

  const handlePlayPause = () => {
    if (isComplete) {
      // Reset
      setScrollPosition(0);
      setIsComplete(false);
      startPlayback();
    } else if (isPlaying) {
      setIsPlaying(false);
    } else {
      startPlayback();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setScrollPosition(0);
    setIsComplete(false);
    setCountdown(null);
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex flex-col",
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      )}
    >
      {/* Header com controles */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        isDarkMode ? "border-white/10" : "border-black/10"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2">
          {/* Espelho */}
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

          {/* Tema */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

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

      {/* Área do texto */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
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
              <span className={cn(
                "text-9xl font-bold",
                isDarkMode ? "text-white" : "text-black"
              )}>
                {countdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Texto rolando */}
        <div
          ref={textRef}
          style={{ 
            transform: `translateY(-${scrollPosition}px) ${isMirrored ? 'scaleX(-1)' : ''}`,
          }}
          className={cn(
            "px-8 py-20 transition-transform duration-100",
            fontSizeClasses[fontSize],
            "font-serif leading-relaxed text-center"
          )}
        >
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
          isDarkMode 
            ? "bg-gradient-to-b from-black to-transparent" 
            : "bg-gradient-to-b from-white to-transparent"
        )} />
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-20 pointer-events-none",
          isDarkMode 
            ? "bg-gradient-to-t from-black to-transparent" 
            : "bg-gradient-to-t from-white to-transparent"
        )} />

        {/* Linha guia central */}
        <div className="absolute top-1/3 left-0 right-0 pointer-events-none">
          <div className={cn(
            "h-0.5 opacity-20",
            isDarkMode ? "bg-white" : "bg-black"
          )} />
        </div>
      </div>

      {/* Footer com controles de playback */}
      <div className={cn(
        "p-4 border-t space-y-4",
        isDarkMode ? "border-white/10" : "border-black/10"
      )}>
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
            className={cn(
              "w-16 h-16 rounded-full",
              isComplete 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : isComplete ? (
              <RotateCcw className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>

          {onMarkRecorded && isComplete && (
            <Button
              variant="outline"
              size="icon"
              onClick={onMarkRecorded}
              className={cn(
                "border-green-500 text-green-500 hover:bg-green-500/10",
                isDarkMode ? "" : ""
              )}
            >
              <Check className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

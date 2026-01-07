import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TeleprompterDisplay } from "@/components/scripts/TeleprompterDisplay";
import { Video, FileText, Clock } from "lucide-react";

export function TeleprompterAdmin() {
  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedMinutes = Math.ceil(wordCount / 140); // 140 WPM padrão

  const handleStart = () => {
    if (wordCount >= 10) {
      setIsActive(true);
    }
  };

  const handleClose = () => {
    setIsActive(false);
  };

  if (isActive) {
    return (
      <TeleprompterDisplay
        text={text}
        onClose={handleClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teleprompter Livre</h1>
        <p className="text-muted-foreground">
          Cole qualquer texto e use o teleprompter para gravar seus cursos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Seu Texto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Cole seu texto aqui...

O teleprompter vai rolar o texto automaticamente na velocidade que você definir. Você pode:

• Ajustar a velocidade de leitura (palavras por minuto)
• Espelhar o texto para usar com prompter físico
• Gravar vídeo enquanto lê
• Pausar e retomar a qualquer momento"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[300px] resize-none font-mono text-base leading-relaxed"
          />

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {wordCount} palavras
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                ~{estimatedMinutes} min de leitura
              </span>
            </div>

            <Button
              onClick={handleStart}
              disabled={wordCount < 10}
              size="lg"
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Iniciar Teleprompter
            </Button>
          </div>

          {wordCount > 0 && wordCount < 10 && (
            <p className="text-sm text-amber-600">
              Mínimo de 10 palavras para iniciar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

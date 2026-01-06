import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Heart, 
  Play, 
  RefreshCw, 
  Save, 
  Lock,
  Unlock,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScriptBlock {
  id: string;
  type: string;
  text_content: string;
}

interface ScriptCardProps {
  headline: ScriptBlock | null;
  body: ScriptBlock | null;
  offer: ScriptBlock | null;
  cta: ScriptBlock | null;
  ps: ScriptBlock | null;
  finalText: string;
  estimatedDuration: number;
  lockedBlocks?: Record<string, boolean>;
  onToggleLock?: (type: string) => void;
  onCopy?: () => void;
  onSave?: () => void;
  onVariation?: () => void;
  onTeleprompter?: () => void;
  isSaved?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showActions?: boolean;
}

const blockColors: Record<string, string> = {
  headline: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400",
  body: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
  offer: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
  cta: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400",
  ps: "bg-gray-500/10 border-gray-500/30 text-gray-700 dark:text-gray-400",
};

const blockLabels: Record<string, string> = {
  headline: "Gancho",
  body: "Corpo",
  offer: "Oferta",
  cta: "CTA",
  ps: "PS",
};

export function ScriptCard({
  headline,
  body,
  offer,
  cta,
  ps,
  finalText,
  estimatedDuration,
  lockedBlocks = {},
  onToggleLock,
  onCopy,
  onSave,
  onVariation,
  onTeleprompter,
  isSaved = false,
  isFavorite = false,
  onToggleFavorite,
  showActions = true,
}: ScriptCardProps) {
  const blocks = [
    { key: 'headline', block: headline },
    { key: 'body', block: body },
    { key: 'offer', block: offer },
    { key: 'cta', block: cta },
    { key: 'ps', block: ps },
  ].filter(b => b.block !== null);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Duração estimada */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            ~{estimatedDuration}s estimados
          </Badge>
          {isSaved && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Salvo
            </Badge>
          )}
        </div>

        {/* Blocos coloridos */}
        <div className="space-y-3">
          {blocks.map(({ key, block }) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "p-3 rounded-lg border",
                blockColors[key]
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {blockLabels[key]}
                </span>
                {onToggleLock && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onToggleLock(key)}
                  >
                    {lockedBlocks[key] ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Unlock className="h-3 w-3 opacity-40" />
                    )}
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{block?.text_content}</p>
            </motion.div>
          ))}
        </div>

        {/* Texto final */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Texto Final
          </h4>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {finalText}
          </p>
        </div>

        {/* Ações */}
        {showActions && (
          <div className="pt-4 border-t border-border flex flex-wrap gap-2">
            {onVariation && (
              <Button variant="outline" size="sm" onClick={onVariation}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Nova variação
              </Button>
            )}
            {onCopy && (
              <Button variant="outline" size="sm" onClick={onCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
            )}
            {onSave && !isSaved && (
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            )}
            {onToggleFavorite && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleFavorite}
                className={cn(isFavorite && "text-red-500")}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </Button>
            )}
            {onTeleprompter && (
              <Button variant="default" size="sm" onClick={onTeleprompter} className="ml-auto">
                <Play className="w-4 h-4 mr-2" />
                Teleprompter
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

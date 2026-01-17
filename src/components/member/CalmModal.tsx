import { X, BookOpen, Play, Wind } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CalmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const calmOptions = [
  {
    icon: BookOpen,
    title: "Leitura curta",
    description: "Uma reflexão de 2 minutos para acalmar sua mente",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Play,
    title: "Vídeo curto",
    description: "Um momento de paz com a Jordana",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    icon: Wind,
    title: "Respiração guiada",
    description: "Exercício simples de 1 minuto",
    color: "bg-green-100 text-green-700",
  },
];

export function CalmModal({ open, onOpenChange }: CalmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl p-6">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="font-serif text-xl">
            Respire fundo
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha o que você precisa agora
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {calmOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.title}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                onClick={() => {
                  // TODO: Navigate to specific calm content
                  onOpenChange(false);
                }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  option.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {option.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

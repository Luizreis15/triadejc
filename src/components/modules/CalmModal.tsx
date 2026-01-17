import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { BookOpen, Play, PenLine } from "lucide-react";
import { motion } from "framer-motion";

interface CalmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const calmOptions = [
  {
    id: "reading",
    icon: BookOpen,
    title: "Leitura Curta",
    description: "Um texto para acalmar sua mente",
    color: "bg-secondary/20 text-secondary",
  },
  {
    id: "video",
    icon: Play,
    title: "Vídeo Curto",
    description: "Alguns minutos de paz",
    color: "bg-primary/20 text-primary",
  },
  {
    id: "exercise",
    icon: PenLine,
    title: "Exercício Rápido",
    description: "Coloque seus pensamentos no papel",
    color: "bg-accent/20 text-accent",
  },
];

export function CalmModal({ open, onOpenChange }: CalmModalProps) {
  const handleSelect = (optionId: string) => {
    // TODO: Navigate to specific calm content
    console.log("Selected:", optionId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-xl">
            O que você precisa agora?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {calmOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-4 cursor-pointer hover:shadow-card transition-all duration-300 group"
                onClick={() => handleSelect(option.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${option.color}`}>
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

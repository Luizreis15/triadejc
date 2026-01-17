import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Pause, NotebookPen, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'muted';
}

interface QuickActionsModuleProps {
  onStartHere: () => void;
  onMomentosSelah: () => void;
  onAtividade: () => void;
  onDownloads: () => void;
}

export function QuickActionsModule({ 
  onStartHere, 
  onMomentosSelah, 
  onAtividade, 
  onDownloads 
}: QuickActionsModuleProps) {
  const actions: QuickAction[] = [
    {
      id: 'start',
      label: 'Começar por aqui',
      icon: <Sparkles className="h-5 w-5" />,
      onClick: onStartHere,
      variant: 'default',
    },
    {
      id: 'selah',
      label: 'Momentos Selah',
      icon: <Pause className="h-5 w-5" />,
      onClick: onMomentosSelah,
      variant: 'secondary',
    },
    {
      id: 'atividade',
      label: 'Atividade do módulo',
      icon: <NotebookPen className="h-5 w-5" />,
      onClick: onAtividade,
      variant: 'muted',
    },
    {
      id: 'downloads',
      label: 'PDFs para baixar',
      icon: <FileDown className="h-5 w-5" />,
      onClick: onDownloads,
      variant: 'muted',
    },
  ];

  const variantStyles = {
    default: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20",
    muted: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-2 gap-3"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200 border",
              variantStyles[action.variant || 'muted']
            )}
            onClick={action.onClick}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                {action.icon}
              </div>
              <span className="text-sm font-medium leading-tight">
                {action.label}
              </span>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

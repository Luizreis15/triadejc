import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingCardProps {
  id: string;
  title: string;
  estimatedMinutes?: number;
  status: 'unread' | 'in_progress' | 'completed';
  onClick: () => void;
}

export function ReadingCard({ 
  id,
  title, 
  estimatedMinutes = 5, 
  status, 
  onClick 
}: ReadingCardProps) {
  const statusConfig = {
    unread: {
      badge: null,
      iconBg: "bg-muted text-muted-foreground",
      buttonLabel: "Ler",
    },
    in_progress: {
      badge: <Badge variant="outline" className="text-xs">Em andamento</Badge>,
      iconBg: "bg-primary/10 text-primary",
      buttonLabel: "Continuar",
    },
    completed: {
      badge: <Badge variant="success" className="text-xs"><Check className="h-3 w-3 mr-1" />Concluído</Badge>,
      iconBg: "bg-success/10 text-success",
      buttonLabel: "Reler",
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        variant="interactive" 
        className={cn(
          "group",
          status === 'completed' && "border-success/20"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Ícone */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
              config.iconBg
            )}>
              <BookOpen className="h-5 w-5" />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground truncate">
                  {title}
                </h3>
                {config.badge}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{estimatedMinutes} min de leitura</span>
              </div>
            </div>

            {/* Ação */}
            <div className="flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 text-primary group-hover:bg-primary/10"
              >
                {config.buttonLabel}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

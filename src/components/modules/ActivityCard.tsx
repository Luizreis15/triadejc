import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotebookPen, ChevronRight } from "lucide-react";

interface ActivityCardProps {
  title: string;
  description: string;
  moduleSlug: string;
  onClick: () => void;
}

export function ActivityCard({ 
  title, 
  description, 
  moduleSlug,
  onClick 
}: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-accent/10 to-background border-accent/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <NotebookPen className="h-6 w-6 text-accent-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-1">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {description}
              </p>
              
              <Button
                variant="default"
                className="gap-2"
                onClick={onClick}
              >
                Abrir atividade
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

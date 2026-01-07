import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TipCardProps {
  tip: string;
  className?: string;
}

export function TipCard({ tip, className }: TipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card variant="elevated" className={cn("border-l-4 border-l-primary", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">📝</span>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Pulo do Gato
              </p>
              <p className="text-base font-medium text-foreground italic">
                "{tip}"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

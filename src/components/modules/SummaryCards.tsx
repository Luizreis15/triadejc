import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardsProps {
  items: string[];
  className?: string;
}

export function SummaryCards({ items, className }: SummaryCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <CardTitle className="text-lg">Resumo do Módulo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-success/10 text-success text-xs font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

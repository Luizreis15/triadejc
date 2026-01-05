import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  progress?: number;
  onClick?: () => void;
  className?: string;
}

export function QuickActionCard({
  icon,
  title,
  subtitle,
  progress,
  onClick,
  className,
}: QuickActionCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="interactive"
        className={cn("group", className)}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm">{title}</h4>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {progress !== undefined && (
                <Progress value={progress} variant="gradient" className="mt-2 h-1" />
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

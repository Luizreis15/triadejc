import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronLeft, ChevronRight, Plus, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CalendarItem = {
  id: number;
  date: string;
  dayOfWeek: string;
  title?: string;
  type?: "model" | "hook" | "custom";
  status: "empty" | "planned" | "posted";
};

const generateCalendarData = (): CalendarItem[] => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const items: CalendarItem[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    items.push({
      id: i + 1,
      date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      dayOfWeek: days[date.getDay()],
      status: i < 5 ? "posted" : i < 10 ? "planned" : "empty",
      title: i < 5 
        ? ["Carrossel de contraste", "3 erros que afastam", "Checklist do post", "Objeção: tempo", "Prova social"][i]
        : i < 10 
        ? ["Gancho curiosidade", "CTA magnético", "Bastidor criação", "Erro comum", "Resultado cliente"][i - 5]
        : undefined,
      type: i < 10 ? (i % 3 === 0 ? "model" : i % 3 === 1 ? "hook" : "custom") : undefined,
    });
  }

  return items;
};

function CalendarItemCard({ item, onClick }: { item: CalendarItem; onClick: () => void }) {
  const statusConfig = {
    empty: {
      bg: "bg-muted/30",
      border: "border-dashed border-border",
      icon: <Plus className="h-4 w-4 text-muted-foreground" />,
    },
    planned: {
      bg: "bg-primary/5",
      border: "border-primary/30",
      icon: null,
    },
    posted: {
      bg: "bg-success/5",
      border: "border-success/30",
      icon: <Check className="h-4 w-4 text-success" />,
    },
  };

  const config = statusConfig[item.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        variant="interactive"
        className={cn("border", config.border, config.bg)}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="text-center min-w-12">
              <p className="text-xs text-muted-foreground">{item.dayOfWeek}</p>
              <p className="text-lg font-serif font-bold text-foreground">
                {item.date.split("/")[0]}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              {item.title ? (
                <>
                  <p className="font-medium text-foreground text-sm line-clamp-1">
                    {item.title}
                  </p>
                  {item.type && (
                    <Badge variant="muted" className="mt-1 text-xs">
                      {item.type === "model" ? "Modelo" : item.type === "hook" ? "Gancho" : "Personalizado"}
                    </Badge>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Adicionar carrossel
                </p>
              )}
            </div>
            {config.icon}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CalendarPage() {
  const [calendarData] = useState(generateCalendarData);
  const [selectedWeek, setSelectedWeek] = useState(0);

  const weeks = [
    calendarData.slice(0, 7),
    calendarData.slice(7, 14),
    calendarData.slice(14, 21),
    calendarData.slice(21, 28),
  ];

  const currentWeek = weeks[selectedWeek];
  const posted = calendarData.filter(d => d.status === "posted").length;
  const planned = calendarData.filter(d => d.status === "planned").length;

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Calendário 30 dias
          </h1>
          <p className="text-sm text-muted-foreground">
            {posted} postados · {planned} planejados
          </p>
        </motion.header>

        {/* Sugestão automática */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card variant="elevated" className="bg-secondary text-secondary-foreground">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Gerar sugestão da semana</p>
                <p className="text-xs opacity-80">Baseado no seu progresso</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
              >
                Gerar
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navegação de semanas */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={selectedWeek === 0}
            onClick={() => setSelectedWeek(w => w - 1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium text-foreground">
            Semana {selectedWeek + 1} de 4
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={selectedWeek === 3}
            onClick={() => setSelectedWeek(w => w + 1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Lista de dias */}
        <motion.div
          key={selectedWeek}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {currentWeek.map((item) => (
            <CalendarItemCard
              key={item.id}
              item={item}
              onClick={() => {}}
            />
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}

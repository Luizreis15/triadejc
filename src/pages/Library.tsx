import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Heart, BookmarkPlus, Filter, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const stages = [
  { value: "all", label: "Todos" },
  { value: "top", label: "Topo" },
  { value: "middle", label: "Meio" },
  { value: "bottom", label: "Fundo" },
];

const goals = [
  { value: "all", label: "Todos" },
  { value: "grow", label: "Crescer" },
  { value: "authority", label: "Autoridade" },
  { value: "sell", label: "Vender" },
];

type LibraryItem = {
  id: string;
  type: string;
  stage: string;
  format: string;
  goal: string;
  title: string;
  content_md: string;
  tags: string[];
};

// Converte Markdown básico para HTML
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function LibraryItemCard({ item, isFavorited, onFavorite }: { 
  item: LibraryItem; 
  isFavorited: boolean;
  onFavorite: () => void;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.content_md);
    setIsCopied(true);
    toast({ title: "Copiado!" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    toast({ title: "Salvo no Caderno!", description: "Acesse em 'Meu Caderno'" });
  };

  const stageColors: Record<string, string> = {
    top: "bg-success/10 text-success",
    middle: "bg-primary/10 text-primary",
    bottom: "bg-secondary/80 text-secondary-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-serif font-semibold text-foreground">{item.title}</h3>
            <Badge className={cn("text-xs", stageColors[item.stage] || stageColors.top)}>
              {item.stage === "top" ? "Topo" : item.stage === "middle" ? "Meio" : "Fundo"}
            </Badge>
          </div>
          
          <p 
            className="text-sm text-muted-foreground whitespace-pre-wrap mb-4 line-clamp-4"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content_md) }}
          />

          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags?.map((tag) => (
              <Badge key={tag} variant="muted" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="muted" size="sm" onClick={handleCopy} className="gap-1.5">
              {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {isCopied ? "Copiado" : "Copiar"}
            </Button>
            <Button variant="muted" size="sm" onClick={onFavorite} className="gap-1.5">
              <Heart className={cn("h-3.5 w-3.5", isFavorited && "fill-primary text-primary")} />
            </Button>
            <Button variant="muted" size="sm" onClick={handleSave} className="gap-1.5">
              <BookmarkPlus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Library() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("modelos");
  const [stageFilter, setStageFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Buscar itens da biblioteca
  const { data: libraryItems, isLoading } = useQuery({
    queryKey: ["library_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as LibraryItem[];
    },
  });

  // Buscar favoritos do usuário
  const { data: favorites } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("library_item_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(f => f.library_item_id);
    },
    enabled: !!user?.id,
  });

  // Mutation para adicionar/remover favorito
  const toggleFavorite = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user?.id) return;
      
      const isFavorited = favorites?.includes(itemId);
      
      if (isFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("library_item_id", itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, library_item_id: itemId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  const filteredItems = libraryItems?.filter((item) => {
    const typeMatch =
      activeTab === "modelos" ? item.type === "model" :
      activeTab === "ganchos" ? item.type === "hook" :
      activeTab === "ctas" ? item.type === "cta" : true;
    
    const stageMatch = stageFilter === "all" || item.stage === stageFilter;
    const goalMatch = goalFilter === "all" || item.goal === goalFilter;

    return typeMatch && stageMatch && goalMatch;
  }) || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Biblioteca
            </h1>
            <Button
              variant={showFilters ? "default" : "muted"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-muted/50">
              <TabsTrigger value="modelos" className="flex-1">Modelos</TabsTrigger>
              <TabsTrigger value="ganchos" className="flex-1">Ganchos</TabsTrigger>
              <TabsTrigger value="ctas" className="flex-1">CTAs</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.header>

        {/* Filtros */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 space-y-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Estágio</p>
              <div className="flex flex-wrap gap-2">
                {stages.map((stage) => (
                  <Button
                    key={stage.value}
                    variant={stageFilter === stage.value ? "default" : "muted"}
                    size="sm"
                    onClick={() => setStageFilter(stage.value)}
                  >
                    {stage.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Objetivo</p>
              <div className="flex flex-wrap gap-2">
                {goals.map((goal) => (
                  <Button
                    key={goal.value}
                    variant={goalFilter === goal.value ? "default" : "muted"}
                    size="sm"
                    onClick={() => setGoalFilter(goal.value)}
                  >
                    {goal.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Lista de itens */}
        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <LibraryItemCard 
                key={item.id} 
                item={item}
                isFavorited={favorites?.includes(item.id) || false}
                onFavorite={() => toggleFavorite.mutate(item.id)}
              />
            ))
          ) : (
            <Card variant="default" className="border-dashed">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum item encontrado com esses filtros
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

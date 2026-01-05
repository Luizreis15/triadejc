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

type LibraryItem = {
  id: number;
  type: "model" | "hook" | "cta";
  stage: "top" | "middle" | "bottom";
  format: string;
  goal: "grow" | "authority" | "sell";
  title: string;
  content: string;
  tags: string[];
};

const libraryItems: LibraryItem[] = [
  {
    id: 1,
    type: "model",
    stage: "top",
    format: "contraste",
    goal: "grow",
    title: "O que X fazem vs. O que funciona",
    content: `SLIDE 1: "O que 97% fazem vs. O que realmente funciona"
SLIDE 2: ❌ Maioria: [problema comum]
✅ Funciona: [solução]
SLIDE 3: ❌ Maioria: [problema 2]
✅ Funciona: [solução 2]
SLIDE 4: CTA`,
    tags: ["crescimento", "contraste", "topo"],
  },
  {
    id: 2,
    type: "model",
    stage: "middle",
    format: "checklist",
    goal: "authority",
    title: "Checklist do [Resultado]",
    content: `SLIDE 1: "Checklist: Como [resultado] em [tempo]"
SLIDE 2: ✅ Passo 1
SLIDE 3: ✅ Passo 2
SLIDE 4: ✅ Passo 3
SLIDE 5: Salva pra não esquecer 📌`,
    tags: ["autoridade", "checklist", "meio"],
  },
  {
    id: 3,
    type: "model",
    stage: "bottom",
    format: "objecao",
    goal: "sell",
    title: "Por que [objeção] não é desculpa",
    content: `SLIDE 1: "Você diz que não tem [tempo/dinheiro/nicho]?"
SLIDE 2: A verdade é que...
SLIDE 3: [Argumento 1]
SLIDE 4: [Argumento 2]
SLIDE 5: O próximo passo é...`,
    tags: ["venda", "objeção", "fundo"],
  },
  {
    id: 4,
    type: "hook",
    stage: "top",
    format: "curiosidade",
    goal: "grow",
    title: "Gancho de Curiosidade",
    content: `"Descobri isso depois de [X anos/tentativas] e mudou tudo"`,
    tags: ["gancho", "curiosidade"],
  },
  {
    id: 5,
    type: "hook",
    stage: "top",
    format: "contraste",
    goal: "grow",
    title: "Gancho de Contraste",
    content: `"O que [experts] não te contam sobre [tema]"`,
    tags: ["gancho", "contraste"],
  },
  {
    id: 6,
    type: "hook",
    stage: "middle",
    format: "prova",
    goal: "authority",
    title: "Gancho de Prova Social",
    content: `"Como [cliente/eu] conseguiu [resultado] em [tempo]"`,
    tags: ["gancho", "prova"],
  },
  {
    id: 7,
    type: "cta",
    stage: "bottom",
    format: "salvar",
    goal: "grow",
    title: "CTA para Salvar",
    content: `"Salva esse carrossel pra consultar sempre que precisar 📌"`,
    tags: ["cta", "salvar"],
  },
  {
    id: 8,
    type: "cta",
    stage: "bottom",
    format: "comentar",
    goal: "grow",
    title: "CTA para Comentar",
    content: `"Comenta [emoji] se você já passou por isso"`,
    tags: ["cta", "comentar"],
  },
  {
    id: 9,
    type: "cta",
    stage: "bottom",
    format: "dm",
    goal: "sell",
    title: "CTA para DM",
    content: `"Me manda 'QUERO' na DM que eu te envio [bônus/material]"`,
    tags: ["cta", "dm", "venda"],
  },
];

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

function LibraryItemCard({ item }: { item: LibraryItem }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.content);
    setIsCopied(true);
    toast({ title: "Copiado!" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({ title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos" });
  };

  const handleSave = () => {
    toast({ title: "Salvo no Caderno!", description: "Acesse em 'Meu Caderno'" });
  };

  const stageColors = {
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
            <Badge className={cn("text-xs", stageColors[item.stage])}>
              {item.stage === "top" ? "Topo" : item.stage === "middle" ? "Meio" : "Fundo"}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4 line-clamp-4">
            {item.content}
          </p>

          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags.map((tag) => (
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
            <Button variant="muted" size="sm" onClick={handleFavorite} className="gap-1.5">
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
  const [activeTab, setActiveTab] = useState("modelos");
  const [stageFilter, setStageFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = libraryItems.filter((item) => {
    const typeMatch =
      activeTab === "modelos" ? item.type === "model" :
      activeTab === "ganchos" ? item.type === "hook" :
      activeTab === "ctas" ? item.type === "cta" : true;
    
    const stageMatch = stageFilter === "all" || item.stage === stageFilter;
    const goalMatch = goalFilter === "all" || item.goal === goalFilter;

    return typeMatch && stageMatch && goalMatch;
  });

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
              <LibraryItemCard key={item.id} item={item} />
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

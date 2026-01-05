import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp, Video, FileText, Sparkles, Dumbbell, Download } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Converte URLs do YouTube para formato embed
function convertToEmbedUrl(url: string): string | null {
  if (!url || url === "[LINK]" || url.trim() === "") return null;
  
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  if (url.includes("youtube.com/embed/")) return url;
  
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  return url;
}

const cardTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  text: <FileText className="h-4 w-4" />,
  model: <Sparkles className="h-4 w-4" />,
  exercise: <Dumbbell className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
};

interface ModuleCard {
  id: string;
  module_id: string;
  title: string;
  type: string;
  order_index: number;
  content_md: string | null;
  video_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
}

const cardTypes = [
  { value: "video", label: "Vídeo" },
  { value: "text", label: "Texto" },
  { value: "model", label: "Modelo" },
  { value: "exercise", label: "Exercício" },
  { value: "download", label: "Download" },
];

export function ModuleCardsAdmin() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingCard, setEditingCard] = useState<ModuleCard | null>(null);
  const [formData, setFormData] = useState({
    module_id: "",
    title: "",
    type: "text",
    order_index: 1,
    content_md: "",
    video_url: "",
    cta_label: "",
    cta_url: "",
  });

  const { data: modules } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id, title, order_index")
        .order("order_index");
      if (error) throw error;
      return data as Module[];
    },
  });

  const { data: cards, isLoading } = useQuery({
    queryKey: ["admin-module-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_cards")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as ModuleCard[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("module_cards").insert({
        module_id: data.module_id,
        title: data.title,
        type: data.type,
        order_index: data.order_index,
        content_md: data.content_md || null,
        video_url: data.video_url || null,
        cta_label: data.cta_label || null,
        cta_url: data.cta_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-module-cards"] });
      toast.success("Card criado com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar card: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("module_cards")
        .update({
          module_id: data.module_id,
          title: data.title,
          type: data.type,
          order_index: data.order_index,
          content_md: data.content_md || null,
          video_url: data.video_url || null,
          cta_label: data.cta_label || null,
          cta_url: data.cta_url || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-module-cards"] });
      toast.success("Card atualizado com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar card: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("module_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-module-cards"] });
      toast.success("Card deletado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar card: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      module_id: selectedModuleId || "",
      title: "",
      type: "text",
      order_index: 1,
      content_md: "",
      video_url: "",
      cta_label: "",
      cta_url: "",
    });
    setEditingCard(null);
    setIsOpen(false);
  };

  const handleEdit = (card: ModuleCard) => {
    setEditingCard(card);
    setFormData({
      module_id: card.module_id,
      title: card.title,
      type: card.type,
      order_index: card.order_index,
      content_md: card.content_md || "",
      video_url: card.video_url || "",
      cta_label: card.cta_label || "",
      cta_url: card.cta_url || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleNewCard = (moduleId: string) => {
    const moduleCards = cards?.filter(c => c.module_id === moduleId) || [];
    setSelectedModuleId(moduleId);
    setFormData({
      module_id: moduleId,
      title: "",
      type: "text",
      order_index: moduleCards.length + 1,
      content_md: "",
      video_url: "",
      cta_label: "",
      cta_url: "",
    });
    setEditingCard(null);
    setIsOpen(true);
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getCardsByModule = (moduleId: string) => 
    cards?.filter(c => c.module_id === moduleId).sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Editar Card" : "Novo Card"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Módulo</Label>
                <Select
                  value={formData.module_id}
                  onValueChange={(value) => setFormData({ ...formData, module_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.order_index}. {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cardTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo (Markdown)</Label>
              <Textarea
                value={formData.content_md}
                onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                rows={8}
                className="font-mono text-sm"
                placeholder="Escreva o conteúdo em Markdown..."
              />
            </div>

            {formData.type === "video" && (
              <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-primary">
                  <Video className="h-5 w-5" />
                  <Label className="text-base font-semibold">Configuração do Vídeo</Label>
                </div>
                <div className="space-y-2">
                  <Label>URL do Vídeo (YouTube ou Vimeo)</Label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL do YouTube ou Vimeo. A conversão para embed é automática.
                  </p>
                </div>
                {formData.video_url && convertToEmbedUrl(formData.video_url) && (
                  <div className="space-y-2">
                    <Label className="text-sm">Preview do Vídeo</Label>
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={convertToEmbedUrl(formData.video_url)!}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.type === "download" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Texto do Botão</Label>
                  <Input
                    value={formData.cta_label}
                    onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                    placeholder="Baixar Template"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL do Download</Label>
                  <Input
                    value={formData.cta_url}
                    onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                    placeholder="https://canva.com/..."
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCard ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {modules?.map((module) => {
        const moduleCards = getCardsByModule(module.id);
        const isExpanded = expandedModules.has(module.id);

        return (
          <Card key={module.id}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleModule(module.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      Módulo {module.order_index}: {module.title}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({moduleCards.length} cards)
                      </span>
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewCard(module.id);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Novo Card
                    </Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {moduleCards.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      Nenhum card neste módulo.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead className="w-24">Tipo</TableHead>
                          <TableHead className="w-24">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {moduleCards.map((card) => (
                          <TableRow key={card.id}>
                            <TableCell>{card.order_index}</TableCell>
                            <TableCell className="font-medium">{card.title}</TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-1 rounded-full bg-muted inline-flex items-center gap-1.5">
                                {cardTypeIcons[card.type]}
                                {cardTypes.find(t => t.value === card.type)?.label || card.type}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(card)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja deletar este card?")) {
                                      deleteMutation.mutate(card.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

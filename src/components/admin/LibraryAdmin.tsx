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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface LibraryItem {
  id: string;
  type: string;
  stage: string;
  format: string;
  goal: string;
  title: string;
  content_md: string;
  tags: string[] | null;
}

const itemTypes = [
  { value: "model", label: "Modelo" },
  { value: "hook", label: "Gancho" },
  { value: "cta", label: "CTA" },
];

const stages = [
  { value: "top", label: "Topo" },
  { value: "middle", label: "Meio" },
  { value: "bottom", label: "Fundo" },
];

const formats = [
  { value: "contrast", label: "Contraste" },
  { value: "checklist", label: "Checklist" },
  { value: "truth", label: "Verdade Dura" },
  { value: "myth", label: "Mito vs Realidade" },
  { value: "diagnosis", label: "Diagnóstico" },
  { value: "list", label: "Lista" },
  { value: "curiosity", label: "Curiosidade" },
  { value: "steps", label: "Passo a Passo" },
  { value: "case", label: "Estudo de Caso" },
  { value: "backstage", label: "Bastidor" },
  { value: "manifesto", label: "Manifesto" },
  { value: "opinion", label: "Opinião" },
  { value: "story", label: "História" },
  { value: "comparison", label: "Comparação" },
  { value: "anchor", label: "Âncora" },
  { value: "rhythm", label: "Ritmo" },
  { value: "objection", label: "Objeção" },
  { value: "value", label: "Valor" },
  { value: "qualify", label: "Qualificação" },
  { value: "results", label: "Resultados" },
  { value: "decision", label: "Decisão" },
  { value: "hook", label: "Gancho" },
  { value: "seguir", label: "Seguir" },
  { value: "salvar", label: "Salvar" },
  { value: "comentar", label: "Comentar" },
  { value: "dm", label: "DM" },
  { value: "venda", label: "Venda" },
];

const goals = [
  { value: "grow", label: "Crescer" },
  { value: "authority", label: "Autoridade" },
  { value: "sell", label: "Vender" },
  { value: "engage", label: "Engajar" },
];

export function LibraryAdmin() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState("model");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [formData, setFormData] = useState({
    type: "model",
    stage: "top",
    format: "contrast",
    goal: "grow",
    title: "",
    content_md: "",
    tags: "",
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-library-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LibraryItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      const { error } = await supabase.from("library_items").insert({
        type: data.type,
        stage: data.stage,
        format: data.format,
        goal: data.goal,
        title: data.title,
        content_md: data.content_md,
        tags,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-library-items"] });
      toast.success("Item criado com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar item: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      const { error } = await supabase
        .from("library_items")
        .update({
          type: data.type,
          stage: data.stage,
          format: data.format,
          goal: data.goal,
          title: data.title,
          content_md: data.content_md,
          tags,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-library-items"] });
      toast.success("Item atualizado com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar item: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("library_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-library-items"] });
      toast.success("Item deletado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar item: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      type: activeType,
      stage: "top",
      format: activeType === "cta" ? "seguir" : "contrast",
      goal: "grow",
      title: "",
      content_md: "",
      tags: "",
    });
    setEditingItem(null);
    setIsOpen(false);
  };

  const handleEdit = (item: LibraryItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      stage: item.stage,
      format: item.format,
      goal: item.goal,
      title: item.title,
      content_md: item.content_md,
      tags: item.tags?.join(", ") || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleNewItem = () => {
    setFormData({
      type: activeType,
      stage: "top",
      format: activeType === "cta" ? "seguir" : "contrast",
      goal: "grow",
      title: "",
      content_md: "",
      tags: "",
    });
    setEditingItem(null);
    setIsOpen(true);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const filteredItems = items?.filter(item => {
    if (item.type !== activeType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.content_md.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  const getTypeCounts = () => ({
    model: items?.filter(i => i.type === "model").length || 0,
    hook: items?.filter(i => i.type === "hook").length || 0,
    cta: items?.filter(i => i.type === "cta").length || 0,
  });

  const counts = getTypeCounts();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Item" : "Novo Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                    {itemTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Etapa do Funil</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => setFormData({ ...formData, stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Formato</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => setFormData({ ...formData, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => setFormData({ ...formData, goal: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo (Markdown)</Label>
              <Textarea
                value={formData.content_md}
                onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                rows={8}
                className="font-mono text-sm"
                placeholder="Escreva o conteúdo em Markdown..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="crescimento, autoridade, vendas"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Biblioteca ({items?.length || 0} itens)</CardTitle>
            <Button onClick={handleNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeType} onValueChange={setActiveType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="model">Modelos ({counts.model})</TabsTrigger>
              <TabsTrigger value="hook">Ganchos ({counts.hook})</TabsTrigger>
              <TabsTrigger value="cta">CTAs ({counts.cta})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título ou conteúdo..."
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-20">Etapa</TableHead>
                  <TableHead className="w-24">Formato</TableHead>
                  <TableHead className="w-20">Objetivo</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {item.title}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">
                          {stages.find(s => s.value === item.stage)?.label || item.stage}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formats.find(f => f.value === item.format)?.label || item.format}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {goals.find(g => g.value === item.goal)?.label || item.goal}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja deletar este item?")) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileDown,
  Plus,
  Trash2,
  ExternalLink,
  GripVertical,
  FileText,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function ModulePdfsAdmin() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [newPdf, setNewPdf] = useState({
    title: "",
    file_url: "",
    module_id: "",
  });
  const queryClient = useQueryClient();

  const { data: modules } = useQuery({
    queryKey: ["admin-modules-for-pdfs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id, title, slug")
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const { data: pdfs, isLoading } = useQuery({
    queryKey: ["admin-module-pdfs", selectedModuleId],
    queryFn: async () => {
      let query = supabase
        .from("module_pdfs")
        .select("*, modules(title)")
        .order("order_index");

      if (selectedModuleId) {
        query = query.eq("module_id", selectedModuleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const addPdf = useMutation({
    mutationFn: async (data: typeof newPdf) => {
      // Get the next order_index
      const { data: existingPdfs } = await supabase
        .from("module_pdfs")
        .select("order_index")
        .eq("module_id", data.module_id)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = (existingPdfs?.[0]?.order_index ?? -1) + 1;

      const { error } = await supabase.from("module_pdfs").insert({
        ...data,
        order_index: nextOrderIndex,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-module-pdfs"] });
      toast.success("PDF adicionado com sucesso");
      setIsAddDialogOpen(false);
      setNewPdf({ title: "", file_url: "", module_id: "" });
    },
    onError: () => {
      toast.error("Erro ao adicionar PDF");
    },
  });

  const deletePdf = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("module_pdfs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-module-pdfs"] });
      toast.success("PDF removido");
    },
    onError: () => {
      toast.error("Erro ao remover PDF");
    },
  });

  const movePdf = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const currentPdf = pdfs?.find(p => p.id === id);
      if (!currentPdf) return;

      const moduleId = currentPdf.module_id;
      const currentIndex = currentPdf.order_index;
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      const targetPdf = pdfs?.find(
        p => p.module_id === moduleId && p.order_index === targetIndex
      );

      if (!targetPdf) return;

      // Swap order_index values
      await supabase
        .from("module_pdfs")
        .update({ order_index: targetIndex })
        .eq("id", id);

      await supabase
        .from("module_pdfs")
        .update({ order_index: currentIndex })
        .eq("id", targetPdf.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-module-pdfs"] });
    },
    onError: () => {
      toast.error("Erro ao reordenar");
    },
  });

  const handleAddPdf = () => {
    if (!newPdf.title || !newPdf.file_url || !newPdf.module_id) {
      toast.error("Preencha todos os campos");
      return;
    }
    addPdf.mutate(newPdf);
  };

  const pdfsByModule = pdfs?.reduce((acc, pdf) => {
    const moduleTitle = (pdf as any).modules?.title || "Sem módulo";
    if (!acc[moduleTitle]) {
      acc[moduleTitle] = [];
    }
    acc[moduleTitle].push(pdf);
    return acc;
  }, {} as Record<string, typeof pdfs>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            PDFs dos Módulos
          </h2>
          <p className="text-muted-foreground">
            Gerencie os arquivos PDF de cada módulo
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar PDF
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar PDF</DialogTitle>
              <DialogDescription>
                Adicione um novo PDF a um módulo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Módulo</Label>
                <Select
                  value={newPdf.module_id}
                  onValueChange={(v) => setNewPdf(prev => ({ ...prev, module_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules?.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título do PDF</Label>
                <Input
                  placeholder="Ex: Exercício de Reflexão"
                  value={newPdf.title}
                  onChange={(e) => setNewPdf(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>URL do Arquivo</Label>
                <Input
                  placeholder="https://..."
                  value={newPdf.file_url}
                  onChange={(e) => setNewPdf(prev => ({ ...prev, file_url: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Cole a URL do PDF hospedado (Google Drive, Dropbox, etc.)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPdf} disabled={addPdf.isPending}>
                {addPdf.isPending ? "Salvando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Module */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              Filtrar por módulo:
            </Label>
            <Select
              value={selectedModuleId}
              onValueChange={setSelectedModuleId}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Todos os módulos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os módulos</SelectItem>
                {modules?.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {pdfs?.length || 0} PDFs
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* PDFs List */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : pdfs?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <FileDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum PDF cadastrado</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Adicionar primeiro PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedModuleId ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {modules?.find(m => m.id === selectedModuleId)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdfs?.map((pdf, index) => (
                  <TableRow key={pdf.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => movePdf.mutate({ id: pdf.id, direction: "up" })}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => movePdf.mutate({ id: pdf.id, direction: "down" })}
                          disabled={index === (pdfs?.length || 0) - 1}
                        >
                          ↓
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{pdf.title}</TableCell>
                    <TableCell>
                      <a
                        href={pdf.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Abrir PDF
                      </a>
                    </TableCell>
                    <TableCell>
                      {pdf.created_at && format(new Date(pdf.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePdf.mutate(pdf.id)}
                        disabled={deletePdf.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(pdfsByModule || {}).map(([moduleTitle, modulePdfs]) => (
            <Card key={moduleTitle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {moduleTitle}
                  <Badge variant="secondary" className="ml-2">
                    {modulePdfs?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modulePdfs?.map((pdf) => (
                      <TableRow key={pdf.id}>
                        <TableCell className="font-medium">{pdf.title}</TableCell>
                        <TableCell>
                          <a
                            href={pdf.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Abrir PDF
                          </a>
                        </TableCell>
                        <TableCell>
                          {pdf.created_at && format(new Date(pdf.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePdf.mutate(pdf.id)}
                            disabled={deletePdf.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

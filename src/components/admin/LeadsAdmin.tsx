import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Plus, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

const STATUS_OPTIONS = [
  { value: "novo", label: "Novo", color: "bg-blue-500" },
  { value: "contactado", label: "Contactado", color: "bg-yellow-500" },
  { value: "convertido", label: "Convertido", color: "bg-green-500" },
  { value: "perdido", label: "Perdido", color: "bg-red-500" },
];

export function LeadsAdmin() {
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "manual",
    notes: "",
  });
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addLeadMutation = useMutation({
    mutationFn: async (lead: typeof newLead) => {
      const { error } = await supabase.from("leads").insert(lead);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Lead adicionado com sucesso");
      setIsAddDialogOpen(false);
      setNewLead({ name: "", email: "", phone: "", source: "manual", notes: "" });
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("Já existe um lead com este email");
      } else {
        toast.error("Erro ao adicionar lead");
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Status atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Lead removido");
    },
    onError: () => {
      toast.error("Erro ao remover lead");
    },
  });

  const filteredLeads = leads?.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportToCSV = () => {
    if (!leads?.length) return;

    const headers = ["Nome", "Email", "Telefone", "Fonte", "Status", "Data"];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone || "",
      lead.source || "",
      lead.status || "",
      format(new Date(lead.created_at), "dd/MM/yyyy"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Leads
        </h2>
        <p className="text-muted-foreground">
          Gerencie sua base de leads e prospectos
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Lead
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Lead</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input
                        placeholder="Nome do lead"
                        value={newLead.name}
                        onChange={(e) =>
                          setNewLead({ ...newLead, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={newLead.email}
                        onChange={(e) =>
                          setNewLead({ ...newLead, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={newLead.phone}
                        onChange={(e) =>
                          setNewLead({ ...newLead, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fonte</Label>
                      <Input
                        placeholder="Instagram, Google, Indicação..."
                        value={newLead.source}
                        onChange={(e) =>
                          setNewLead({ ...newLead, source: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notas</Label>
                      <Textarea
                        placeholder="Observações sobre o lead..."
                        value={newLead.notes}
                        onChange={(e) =>
                          setNewLead({ ...newLead, notes: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => addLeadMutation.mutate(newLead)}
                      disabled={!newLead.name || !newLead.email || addLeadMutation.isPending}
                    >
                      {addLeadMutation.isPending ? "Salvando..." : "Salvar Lead"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLeads?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum lead encontrado</p>
              <p className="text-sm">Adicione seu primeiro lead clicando no botão acima</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads?.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone || "-"}</TableCell>
                    <TableCell>{lead.source || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={lead.status || "novo"}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({ id: lead.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {format(new Date(lead.created_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLeadMutation.mutate(lead.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

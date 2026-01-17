import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Send,
  FileText,
  Users,
  Eye,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MailOpen,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-500",
  scheduled: "bg-blue-500/10 text-blue-500",
  sent: "bg-green-500/10 text-green-500",
  sending: "bg-yellow-500/10 text-yellow-500",
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  sent: "Enviado",
  sending: "Enviando",
};

const segmentLabels: Record<string, string> = {
  all: "Todos os usuários",
  active: "Usuários ativos",
  inactive: "Usuários inativos",
  new: "Novos usuários (30 dias)",
};

const emailTemplates = [
  {
    id: "welcome",
    name: "Boas-vindas",
    subject: "Bem-vinda à Jornada Única! 🌟",
    content: `<h1>Olá {nome}!</h1>
<p>Seja muito bem-vinda à <strong>Jornada Única</strong>!</p>
<p>Estou muito feliz em ter você aqui comigo nessa jornada de transformação e autoconhecimento.</p>
<p>Acesse sua área de membros e comece agora mesmo:</p>
<p><a href="{link}">Acessar Área de Membros</a></p>
<p>Com amor,<br/>Jordana Cantarelli</p>`,
  },
  {
    id: "reminder",
    name: "Lembrete de Módulo",
    subject: "Você tem conteúdo novo te esperando! 📚",
    content: `<h1>Olá {nome}!</h1>
<p>Notei que você ainda não acessou o módulo mais recente.</p>
<p>Não deixe para depois! Seu crescimento acontece um passo de cada vez.</p>
<p><a href="{link}">Continuar de onde parei</a></p>
<p>Com carinho,<br/>Jordana Cantarelli</p>`,
  },
  {
    id: "promo",
    name: "Promoção",
    subject: "Oferta especial para você! 🎁",
    content: `<h1>Olá {nome}!</h1>
<p>Tenho uma oferta especial exclusiva para você!</p>
<p>[Descreva sua oferta aqui]</p>
<p><a href="{link}">Aproveitar Oferta</a></p>
<p>Beijos,<br/>Jordana Cantarelli</p>`,
  },
];

export function EmailAdmin() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [newCampaign, setNewCampaign] = useState({
    subject: "",
    content_html: "",
    segment: "all",
  });
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["admin-email-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ["admin-email-user-stats"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, is_active, created_at");
      
      if (error) throw error;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return {
        all: profiles?.length || 0,
        active: profiles?.filter((p: any) => p.is_active !== false).length || 0,
        inactive: profiles?.filter((p: any) => p.is_active === false).length || 0,
        new: profiles?.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length || 0,
      };
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (data: typeof newCampaign) => {
      const { error } = await supabase
        .from("email_campaigns")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-email-campaigns"] });
      toast.success("Campanha criada com sucesso");
      setIsCreateDialogOpen(false);
      setNewCampaign({ subject: "", content_html: "", segment: "all" });
    },
    onError: () => {
      toast.error("Erro ao criar campanha");
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("email_campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-email-campaigns"] });
      toast.success("Campanha excluída");
    },
    onError: () => {
      toast.error("Erro ao excluir campanha");
    },
  });

  const sendCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      // Update status to sending
      await supabase
        .from("email_campaigns")
        .update({ status: "sending" })
        .eq("id", campaignId);

      // Invoke edge function to send emails
      const { error } = await supabase.functions.invoke("send-campaign", {
        body: { campaignId },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-email-campaigns"] });
      toast.success("Campanha enviada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar campanha");
    },
  });

  const handleUseTemplate = (template: typeof emailTemplates[0]) => {
    setNewCampaign({
      ...newCampaign,
      subject: template.subject,
      content_html: template.content,
    });
  };

  const handlePreview = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsPreviewOpen(true);
  };

  const draftCount = campaigns?.filter(c => c.status === "draft").length || 0;
  const sentCount = campaigns?.filter(c => c.status === "sent").length || 0;
  const totalRecipients = campaigns?.reduce((acc, c) => acc + (c.recipient_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Email Marketing
          </h2>
          <p className="text-muted-foreground">
            Crie e gerencie campanhas de email
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <DialogDescription>
                Crie uma campanha de email para seus usuários.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="editor" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="space-y-4">
                <div className="space-y-2">
                  <Label>Assunto</Label>
                  <Input
                    placeholder="Assunto do email"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Segmento</Label>
                  <Select
                    value={newCampaign.segment}
                    onValueChange={(v) => setNewCampaign(prev => ({ ...prev, segment: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os usuários ({userStats?.all || 0})</SelectItem>
                      <SelectItem value="active">Usuários ativos ({userStats?.active || 0})</SelectItem>
                      <SelectItem value="inactive">Usuários inativos ({userStats?.inactive || 0})</SelectItem>
                      <SelectItem value="new">Novos usuários - 30 dias ({userStats?.new || 0})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Conteúdo (HTML)</Label>
                  <Textarea
                    placeholder="<h1>Olá {nome}!</h1><p>Seu conteúdo aqui...</p>"
                    value={newCampaign.content_html}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, content_html: e.target.value }))}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variáveis disponíveis: {"{nome}"}, {"{email}"}, {"{link}"}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="templates" className="space-y-4">
                <div className="grid gap-4">
                  {emailTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                          >
                            Usar Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => createCampaign.mutate(newCampaign)}
                disabled={!newCampaign.subject || !newCampaign.content_html || createCampaign.isPending}
              >
                {createCampaign.isPending ? "Salvando..." : "Salvar Rascunho"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Campanhas</p>
                <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <FileText className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enviadas</p>
                <p className="text-2xl font-bold">{sentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enviados</p>
                <p className="text-2xl font-bold">{totalRecipients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : campaigns?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma campanha criada ainda</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Criar primeira campanha
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviados</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns?.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {campaign.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {segmentLabels[campaign.segment] || campaign.segment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[campaign.status] || ""}>
                          {statusLabels[campaign.status] || campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {campaign.recipient_count || 0}
                      </TableCell>
                      <TableCell>
                        {format(new Date(campaign.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(campaign)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {campaign.status === "draft" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => sendCampaign.mutate(campaign.id)}
                                disabled={sendCampaign.isPending}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteCampaign.mutate(campaign.id)}
                                disabled={deleteCampaign.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview da Campanha</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Assunto:</p>
                <p className="font-medium">{selectedCampaign.subject}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Segmento:</p>
                <Badge variant="outline">
                  {segmentLabels[selectedCampaign.segment] || selectedCampaign.segment}
                </Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Conteúdo:</p>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedCampaign.content_html }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

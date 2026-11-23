import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Search, UserPlus, Shield, Users, UserCheck, UserX, ShieldCheck, Send, BadgeCheck } from "lucide-react";
import { getDefaultProductId } from "@/lib/products";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

/** 5511987654321 → (11) 98765-4321 */
function formatPhone(phone: string): string {
  const local = phone.replace(/\D/g, "").replace(/^55/, "");
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return local;
}

export function UsersAdmin() {
  const { user: adminUser } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [resendUser, setResendUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [resendPhone, setResendPhone] = useState("");
  const [resendPhoneState, setResendPhoneState] = useState<"loading" | "found" | "missing">("missing");
  const queryClient = useQueryClient();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get roles for each user
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const { data: entitlements, error: entitlementsError } = await supabase
        .from("entitlements")
        .select("user_id, status");

      if (entitlementsError) throw entitlementsError;

      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      const entitled = new Set(
        (entitlements ?? [])
          .filter((row) => row.status === "active")
          .map((row) => row.user_id),
      );

      return (profiles ?? []).map(profile => ({
        ...profile,
        role: rolesMap.get(profile.id) || "user",
        is_active: profile.is_active ?? true,
        has_entitlement: entitled.has(profile.id),
      }));
    },
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status do usuário atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const toggleEntitlement = useMutation({
    mutationFn: async ({ userId, granted }: { userId: string; granted: boolean }) => {
      if (!adminUser?.id) throw new Error("Admin session required");
      const productId = await getDefaultProductId();
      const { error } = await supabase.from("entitlements").upsert(
        {
          user_id: userId,
          product_id: productId,
          status: granted ? "active" : "revoked",
          source: "admin",
        },
        { onConflict: "user_id,product_id" },
      );
      if (error) throw error;

      const { error: auditError } = await supabase.from("audit_log").insert({
        actor_id: adminUser.id,
        action: granted ? "entitlement.grant" : "entitlement.revoke",
        entity_type: "entitlement",
        entity_id: userId,
        metadata: { product_id: productId, status: granted ? "active" : "revoked" },
      });
      if (auditError) throw auditError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Acesso à Jornada Única atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar o acesso");
    },
  });

  const createUser = useMutation({
    mutationFn: async ({ email, name, makeAdmin }: { email: string; name: string; makeAdmin: boolean }) => {
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: { 
          email, 
          name,
          makeAdmin,
        },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Usuário criado com sucesso!");
      setIsCreateDialogOpen(false);
      setNewUserEmail("");
      setNewUserName("");
      setMakeAdmin(false);
      refetch();
    },
    onError: (error: Error) => {
      console.error("Error creating user:", error);
      toast.error(error.message || "Erro ao criar usuário");
    },
  });

  const resendAccessEmail = useMutation({
    mutationFn: async ({ userId, phone }: { userId: string; phone: string }) => {
      const { data, error } = await supabase.functions.invoke("whatsapp-admin", {
        body: { action: "resend_access", user_id: userId, phone: phone.trim() || undefined },
      });
      if (error) {
        const context = (error as { context?: unknown }).context;
        const details = context instanceof Response ? await context.json().catch(() => null) : null;
        throw new Error(details?.error || "Erro ao reenviar o acesso");
      }
      if (data?.error) throw new Error(data.error);
      return data as { email: boolean; whatsapp: "sent" | "queued" | "no_phone" | "off"; phone: string | null };
    },
    onSuccess: (data) => {
      const emailPart = data.email ? "E-mail enviado." : "O e-mail não saiu.";
      const whatsappPart = {
        sent: `WhatsApp enviado para ${data.phone}.`,
        queued: `WhatsApp na fila para ${data.phone}: o envio será tentado de novo.`,
        no_phone: "WhatsApp não enviado: sem celular desta aluna. Informe o número e reenvie.",
        off: "WhatsApp não enviado: a conexão está desligada ou incompleta.",
      }[data.whatsapp];
      if (data.email && data.whatsapp === "sent") toast.success(`${emailPart} ${whatsappPart}`);
      else toast.warning(`${emailPart} ${whatsappPart}`);
      setIsResendDialogOpen(false);
      setResendUser(null);
      setResendPhone("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao reenviar o acesso");
    },
  });

  const handleOpenResendDialog = (user: { id: string; name: string | null; email: string | null }) => {
    setResendUser({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
    });
    setResendPhone("");
    setResendPhoneState("loading");
    setIsResendDialogOpen(true);
    void supabase.functions
      .invoke("whatsapp-admin", { body: { action: "contact_phone", user_id: user.id } })
      .then(({ data, error }) => {
        const phone = !error && typeof data?.phone === "string" ? data.phone : "";
        setResendPhone((typed) => typed || formatPhone(phone));
        setResendPhoneState(phone ? "found" : "missing");
      });
  };

  const handleMakeAdmin = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });

      if (error) {
        if (error.code === "23505") {
          toast.error("Este usuário já é admin");
        } else {
          throw error;
        }
        return;
      }

      toast.success(`${email} agora é admin`);
      refetch();
    } catch (error) {
      console.error("Error making admin:", error);
      toast.error("Erro ao tornar admin");
    }
  };

  const activeCount = users?.filter(u => u.is_active).length || 0;
  const inactiveCount = users?.filter(u => !u.is_active).length || 0;
  const entitledCount = users?.filter(u => u.has_entitlement).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Usuários
          </h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                A pessoa recebe um e-mail para criar a própria senha. Nenhuma senha é definida aqui.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome do usuário"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="makeAdmin"
                  checked={makeAdmin}
                  onCheckedChange={setMakeAdmin}
                />
                <Label htmlFor="makeAdmin" className="flex items-center gap-2 cursor-pointer">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Criar como Administrador
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewUserEmail("");
                  setNewUserName("");
                  setMakeAdmin(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => createUser.mutate({ 
                  email: newUserEmail, 
                  name: newUserName,
                  makeAdmin 
                })}
                disabled={!newUserEmail || createUser.isPending}
              >
                {createUser.isPending ? "Criando..." : "Criar Usuário"}
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
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{users?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <UserX className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold">{inactiveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <BadgeCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com compra</p>
                <p className="text-2xl font-bold">{entitledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {filteredUsers?.length || 0} usuários
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compra</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "-"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {user.last_access_at
                          ? formatDistanceToNow(new Date(user.last_access_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={(checked) =>
                              toggleUserStatus.mutate({ userId: user.id, isActive: checked })
                            }
                            disabled={user.role === "admin"}
                          />
                          <span className="text-sm text-muted-foreground">
                            {user.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.has_entitlement}
                            onCheckedChange={(checked) =>
                              toggleEntitlement.mutate({ userId: user.id, granted: checked })
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {user.has_entitlement ? "Liberada" : "Sem acesso"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenResendDialog(user)}
                            title="Reenviar acesso por e-mail e WhatsApp"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          {user.role !== "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMakeAdmin(user.id, user.email || "")}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Admin
                            </Button>
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

      {/* Resend access email dialog */}
      <Dialog open={isResendDialogOpen} onOpenChange={setIsResendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar link de acesso</DialogTitle>
            <DialogDescription>
              A aluna recebe o link para definir a senha por e-mail e por WhatsApp. A senha atual não é enviada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Usuário</Label>
              <p className="text-sm font-medium">{resendUser?.name || "-"}</p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{resendUser?.email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resend-phone">WhatsApp</Label>
              <Input
                id="resend-phone"
                inputMode="tel"
                placeholder={resendPhoneState === "loading" ? "Buscando o celular..." : "(11) 90000-0000"}
                value={resendPhone}
                onChange={(event) => setResendPhone(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {resendPhoneState === "found"
                  ? "Celular do cadastro da aluna. Pode trocar se ela mudou de número."
                  : resendPhoneState === "loading"
                    ? "Buscando o celular da compra..."
                    : "Não há celular desta aluna no sistema. Digite o número para enviar por WhatsApp."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResendDialogOpen(false);
                setResendUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (resendUser?.id) {
                  resendAccessEmail.mutate({ userId: resendUser.id, phone: resendPhone });
                }
              }}
              disabled={!resendUser?.id || resendAccessEmail.isPending}
            >
              {resendAccessEmail.isPending ? "Enviando..." : "Enviar link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

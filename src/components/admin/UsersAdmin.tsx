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
import { Search, UserPlus, Shield, Users, UserCheck, UserX, Mail, ShieldCheck, Send } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersAdmin() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [resendUser, setResendUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [resendPassword, setResendPassword] = useState("");
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

      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      return profiles.map(profile => ({
        ...profile,
        role: rolesMap.get(profile.id) || "user",
        is_active: (profile as any).is_active ?? true,
        last_access_at: (profile as any).last_access_at,
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
        .update({ is_active: isActive } as any)
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

  const createUser = useMutation({
    mutationFn: async ({ email, name, password, makeAdmin }: { email: string; name: string; password: string; makeAdmin: boolean }) => {
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: { 
          email, 
          name,
          password,
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
      setNewUserPassword("");
      setMakeAdmin(false);
      refetch();
    },
    onError: (error: Error) => {
      console.error("Error creating user:", error);
      toast.error(error.message || "Erro ao criar usuário");
    },
  });

  const resendWelcomeEmail = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const { data, error } = await supabase.functions.invoke("send-welcome-email", {
        body: { 
          name: name || email.split("@")[0],
          email,
          password,
          loginUrl: "https://www.jordanacantarelli.com.br/membros",
        },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Email de boas-vindas reenviado com sucesso!");
      setIsResendDialogOpen(false);
      setResendUser(null);
      setResendPassword("");
    },
    onError: (error: Error) => {
      console.error("Error resending welcome email:", error);
      toast.error(error.message || "Erro ao reenviar email");
    },
  });

  const handleOpenResendDialog = (user: { id: string; name: string | null; email: string | null }) => {
    setResendUser({ 
      id: user.id, 
      name: user.name || "", 
      email: user.email || "" 
    });
    setResendPassword("");
    setIsResendDialogOpen(true);
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
                Crie um novo usuário com acesso ao sistema.
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
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
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
                  setNewUserPassword("");
                  setMakeAdmin(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => createUser.mutate({ 
                  email: newUserEmail, 
                  name: newUserName,
                  password: newUserPassword,
                  makeAdmin 
                })}
                disabled={!newUserEmail || !newUserPassword || newUserPassword.length < 6 || createUser.isPending}
              >
                {createUser.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              onValueChange={(v) => setStatusFilter(v as any)}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenResendDialog(user)}
                            title="Reenviar email de boas-vindas"
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

      {/* Resend Welcome Email Dialog */}
      <Dialog open={isResendDialogOpen} onOpenChange={setIsResendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reenviar Email de Boas-Vindas</DialogTitle>
            <DialogDescription>
              Envie novamente o email de boas-vindas com as credenciais de acesso.
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
              <Label htmlFor="resendPassword">Senha para enviar no email</Label>
              <Input
                id="resendPassword"
                type="password"
                placeholder="Digite a senha do usuário"
                value={resendPassword}
                onChange={(e) => setResendPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Informe a senha que será enviada no email. Se não souber a senha atual, 
                você pode definir uma nova senha temporária e orientar o usuário a alterá-la.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResendDialogOpen(false);
                setResendUser(null);
                setResendPassword("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (resendUser) {
                  resendWelcomeEmail.mutate({
                    name: resendUser.name,
                    email: resendUser.email,
                    password: resendPassword,
                  });
                }
              }}
              disabled={!resendPassword || resendPassword.length < 6 || resendWelcomeEmail.isPending}
            >
              {resendWelcomeEmail.isPending ? "Enviando..." : "Enviar Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

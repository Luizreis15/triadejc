import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  User, 
  Shield, 
  Users, 
  UserPlus, 
  FileText, 
  Lock, 
  LogOut,
  ChevronRight,
  BarChart3,
  BookOpen,
  Library
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("settings");

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch system statistics
  const { data: stats } = useQuery({
    queryKey: ["admin-profile-stats"],
    queryFn: async () => {
      const [usersResult, leadsResult, modulesResult, libraryResult, notebookResult] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("modules").select("*", { count: "exact", head: true }),
        supabase.from("library_items").select("*", { count: "exact", head: true }),
        supabase.from("notebook_entries").select("*", { count: "exact", head: true }),
      ]);
      
      return {
        users: usersResult.count || 0,
        leads: leadsResult.count || 0,
        modules: modulesResult.count || 0,
        library: libraryResult.count || 0,
        notebook: notebookResult.count || 0,
      };
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/membros");
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/membros/reset-password`,
    });
    
    if (error) {
      toast.error("Erro ao enviar email de redefinição");
    } else {
      toast.success("Email de redefinição enviado!");
    }
  };

  const memberSince = profile?.created_at 
    ? format(new Date(profile.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "";

  const quickLinks = [
    { label: "Gerenciar Usuários", icon: Users, tab: "users" },
    { label: "Gerenciar Admins", icon: Shield, tab: "admins" },
    { label: "Gerenciar Leads", icon: UserPlus, tab: "leads" },
    { label: "Gerenciar Módulos", icon: BookOpen, tab: "modules" },
    { label: "Gerenciar Biblioteca", icon: Library, tab: "library" },
  ];

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Configurações Admin</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua conta e acesse configurações do sistema</p>
        </div>

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Meu Perfil Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-lg">{profile?.name || "Admin"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Super Admin
                    </span>
                    <span className="text-xs text-muted-foreground">Desde {memberSince}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Estatísticas do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{stats?.users || 0}</p>
                  <p className="text-xs text-muted-foreground">Membros</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{stats?.leads || 0}</p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{stats?.modules || 0}</p>
                  <p className="text-xs text-muted-foreground">Módulos</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{stats?.library || 0}</p>
                  <p className="text-xs text-muted-foreground">Biblioteca</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{stats?.notebook || 0}</p>
                  <p className="text-xs text-muted-foreground">Caderno</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Acesso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {quickLinks.map((link) => (
                  <button
                    key={link.tab}
                    onClick={() => setActiveTab(link.tab)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{link.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-primary" />
                Ações de Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleResetPassword}
              >
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair do Sistema
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

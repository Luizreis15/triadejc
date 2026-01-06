import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Target, TrendingUp, Lock, LogOut, Save, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const nicheOptions = [
  "Saúde e Bem-estar",
  "Beleza e Estética",
  "Educação",
  "Marketing Digital",
  "Finanças",
  "Desenvolvimento Pessoal",
  "Moda",
  "Gastronomia",
  "Fitness",
  "Outro",
];

const goalOptions = [
  { value: "crescer", label: "Crescer minha audiência" },
  { value: "autoridade", label: "Construir autoridade" },
  { value: "vender", label: "Vender produtos/serviços" },
];

const levelOptions = [
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

export default function MemberProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
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

  // Fetch progress data
  const { data: progressData } = useQuery({
    queryKey: ["user-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return { completed: 0, total: 0 };
      
      const [modulesResult, progressResult] = await Promise.all([
        supabase.from("modules").select("id", { count: "exact" }),
        supabase.from("progress").select("*").eq("user_id", user.id).eq("completed", true),
      ]);
      
      return {
        completed: progressResult.data?.length || 0,
        total: modulesResult.count || 0,
      };
    },
    enabled: !!user?.id,
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setNiche(profile.niche || "");
      setGoal(profile.goal || "");
      setLevel(profile.level || "");
    }
  }, [profile]);

  // Save profile mutation
  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not found");
      const { error } = await supabase
        .from("profiles")
        .update({ name, niche, goal, level })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar perfil. Tente novamente.");
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    await saveProfile.mutateAsync();
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/membrosvmcm");
  };

  const progressPercent = progressData?.total 
    ? Math.round((progressData.completed / progressData.total) * 100) 
    : 0;

  const memberSince = profile?.created_at 
    ? format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR })
    : "";

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais</p>
          </div>
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
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{profile?.name || "Usuário"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <p className="text-xs text-muted-foreground">Membro desde {memberSince}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input value={profile?.email || ""} disabled className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Meu Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Módulos concluídos</span>
                  <span className="font-medium">{progressData?.completed}/{progressData?.total}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {progressPercent}% do curso concluído
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Minhas Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Niche */}
              <div className="space-y-2">
                <Label>Nicho de atuação</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nicho" />
                  </SelectTrigger>
                  <SelectContent>
                    {nicheOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal */}
              <div className="space-y-3">
                <Label>Meu objetivo principal</Label>
                <RadioGroup value={goal} onValueChange={setGoal}>
                  {goalOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={`goal-${option.value}`} />
                      <Label htmlFor={`goal-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Level */}
              <div className="space-y-3">
                <Label>Meu nível de experiência</Label>
                <RadioGroup value={level} onValueChange={setLevel}>
                  {levelOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={`level-${option.value}`} />
                      <Label htmlFor={`level-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
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
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/membrosvmcm/reset-password")}
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
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}

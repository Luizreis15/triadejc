import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, FileDown, Loader2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Templates por módulo
const TEMPLATES: Record<string, { title: string; description: string; fields: { id: string; label: string; placeholder: string }[] }> = {
  "cadeias-invisiveis": {
    title: "Atividade — Cadeias Invisíveis",
    description: "Escreva para organizar: o que eu sinto, o que se repete e onde isso toca em mim.",
    fields: [
      {
        id: "feeling",
        label: "O que eu senti ao ler isso?",
        placeholder: "Descreva as emoções que surgiram durante a leitura...",
      },
      {
        id: "touched",
        label: "Que parte de mim isso tocou?",
        placeholder: "Pense em memórias, situações ou sentimentos que vieram à tona...",
      },
      {
        id: "pattern",
        label: "Que padrão eu percebo se repetindo?",
        placeholder: "Identifique comportamentos ou reações que se repetem na sua vida...",
      },
      {
        id: "situations",
        label: "Em quais situações isso aparece?",
        placeholder: "Descreva contextos, pessoas ou momentos onde esse padrão surge...",
      },
      {
        id: "next_step",
        label: "Qual é o próximo passo de consciência que eu escolho hoje?",
        placeholder: "Defina uma pequena ação ou intenção para cuidar de si...",
      },
    ],
  },
};

export default function NotebookActivity() {
  const { moduleSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const template = TEMPLATES[moduleSlug || ""] || TEMPLATES["cadeias-invisiveis"];
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Buscar entradas existentes
  const { data: existingEntry, isLoading } = useQuery({
    queryKey: ["notebook_activity", user?.id, moduleSlug],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("section", `activity_${moduleSlug}`)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!moduleSlug,
  });

  // Carregar respostas existentes
  useState(() => {
    if (existingEntry?.content_md) {
      try {
        const parsed = JSON.parse(existingEntry.content_md);
        setAnswers(parsed);
      } catch {
        // Conteúdo não é JSON, ignorar
      }
    }
  });

  // Salvar atividade
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const content = JSON.stringify(answers);

      if (existingEntry) {
        const { error } = await supabase
          .from("notebook_entries")
          .update({ 
            content_md: content,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notebook_entries")
          .insert({
            user_id: user.id,
            section: `activity_${moduleSlug}`,
            exercise_type: moduleSlug?.replace(/-/g, "_"),
            content_md: content,
            title: template.title,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: ["notebook_activity"] });
      toast({ title: "Atividade salva!" });
      setTimeout(() => setIsSaved(false), 2000);
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao salvar", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleExportPDF = () => {
    // Criar conteúdo para exportação
    let content = `${template.title}\n\n`;
    template.fields.forEach(field => {
      content += `${field.label}\n`;
      content += `${answers[field.id] || "(Não preenchido)"}\n\n`;
    });

    // Criar blob e fazer download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atividade-${moduleSlug}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Atividade exportada!" });
  };

  const handleBack = () => {
    if (moduleSlug) {
      navigate(`/membros/app/modulos/${moduleSlug}`);
    } else {
      navigate("/membros/app/caderno");
    }
  };

  return (
    <AppLayout showNav={false}>
      <div className="min-h-screen bg-background">
        {/* Header fixo */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <motion.main 
          className="max-w-2xl mx-auto px-4 py-6 pb-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Título */}
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              {template.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {template.description}
            </p>
          </div>

          {/* Campos */}
          <div className="space-y-6">
            {template.fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <label className="block mb-3">
                      <span className="text-sm font-medium text-foreground">
                        {field.label}
                      </span>
                    </label>
                    <Textarea
                      value={answers[field.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ 
                        ...prev, 
                        [field.id]: e.target.value 
                      }))}
                      placeholder={field.placeholder}
                      className="min-h-24 resize-none"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Botão salvar fixo */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-safe">
            <div className="max-w-2xl mx-auto">
              <Button
                variant="gradient"
                className="w-full gap-2"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar atividade
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.main>
      </div>
    </AppLayout>
  );
}

import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, 
  Columns3, 
  Users, 
  FileText, 
  Calendar,
  Trophy,
  ChevronRight,
  Plus,
  Edit3
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type SectionConfig = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
};

const sectionConfigs: SectionConfig[] = [
  {
    id: "promise",
    title: "Minha Promessa",
    icon: <Target className="h-5 w-5" />,
    description: "O que você promete entregar ao seu público",
  },
  {
    id: "pillars",
    title: "Meus 3 Pilares",
    icon: <Columns3 className="h-5 w-5" />,
    description: "Os 3 temas principais do seu conteúdo",
  },
  {
    id: "audience",
    title: "Meu Público",
    icon: <Users className="h-5 w-5" />,
    description: "Dores, desejos e objeções da sua audiência",
  },
  {
    id: "drafts",
    title: "Meus Rascunhos",
    icon: <FileText className="h-5 w-5" />,
    description: "Carrosséis que você está criando",
  },
  {
    id: "calendar",
    title: "Meu Calendário",
    icon: <Calendar className="h-5 w-5" />,
    description: "O que você postou e vai postar",
  },
  {
    id: "results",
    title: "Meus Resultados",
    icon: <Trophy className="h-5 w-5" />,
    description: "Prints, métricas e anotações",
  },
];

function SectionCard({ 
  config, 
  content,
  onEdit 
}: { 
  config: SectionConfig;
  content?: string;
  onEdit: () => void;
}) {
  const hasContent = Boolean(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="interactive"
        className="group"
        onClick={onEdit}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              hasContent ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
            )}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-semibold text-foreground mb-1">
                {config.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {hasContent ? content : config.description}
              </p>
            </div>
            <div className="flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
              {hasContent ? (
                <Edit3 className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SectionEditor({
  config,
  initialContent,
  onSave,
  onClose,
  isSaving,
}: {
  config: SectionConfig;
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [content, setContent] = useState(initialContent);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="h-full flex flex-col max-w-lg mx-auto">
        <header className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {config.icon}
            </div>
            <div>
              <h2 className="font-serif font-semibold text-foreground">
                {config.title}
              </h2>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        </header>

        <div className="flex-1 p-4 overflow-auto">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Escreva sobre ${config.title.toLowerCase()}...`}
            className="min-h-64 resize-none"
          />
        </div>

        <footer className="p-4 border-t border-border">
          <Button
            variant="gradient"
            className="w-full"
            onClick={() => onSave(content)}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </footer>
      </div>
    </motion.div>
  );
}

export default function Notebook() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<SectionConfig | null>(null);

  // Buscar entradas do caderno
  const { data: entries } = useQuery({
    queryKey: ["notebook_entries", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("notebook_entries")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Mutation para salvar entrada
  const saveEntry = useMutation({
    mutationFn: async ({ section, content }: { section: string; content: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      
      const existingEntry = entries?.find(e => e.section === section);
      
      if (existingEntry) {
        const { error } = await supabase
          .from("notebook_entries")
          .update({ content_md: content })
          .eq("id", existingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notebook_entries")
          .insert({ 
            user_id: user.id, 
            section: section as any,
            content_md: content 
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook_entries", user?.id] });
      toast({ title: "Salvo!" });
      setEditingSection(null);
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao salvar", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const getEntryContent = (sectionId: string) => {
    return entries?.find(e => e.section === sectionId)?.content_md || "";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Meu Caderno
          </h1>
          <p className="text-sm text-muted-foreground">
            Suas anotações, rascunhos e planejamentos
          </p>
        </motion.header>

        {/* Ação rápida */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card
            variant="interactive"
            className="bg-secondary text-secondary-foreground"
            onClick={() => navigate("/membrosvmcm/app/resultados")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">Registrar resultado</p>
                <p className="text-sm opacity-80">Acompanhe suas métricas</p>
              </div>
              <ChevronRight className="h-5 w-5" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Seções */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {sectionConfigs.map((config) => (
            <SectionCard
              key={config.id}
              config={config}
              content={getEntryContent(config.id)}
              onEdit={() => setEditingSection(config)}
            />
          ))}
        </motion.div>
      </div>

      {/* Editor de seção */}
      {editingSection && (
        <SectionEditor
          config={editingSection}
          initialContent={getEntryContent(editingSection.id)}
          onSave={(content) => saveEntry.mutate({ section: editingSection.id, content })}
          onClose={() => setEditingSection(null)}
          isSaving={saveEntry.isPending}
        />
      )}
    </AppLayout>
  );
}

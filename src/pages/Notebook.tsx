import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Section = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  content?: string;
};

const sections: Section[] = [
  {
    id: "promise",
    title: "Minha Promessa",
    icon: <Target className="h-5 w-5" />,
    description: "O que você promete entregar ao seu público",
    content: "Ajudo empreendedoras a criarem carrosséis que vendem sem parecer propaganda.",
  },
  {
    id: "pillars",
    title: "Meus 3 Pilares",
    icon: <Columns3 className="h-5 w-5" />,
    description: "Os 3 temas principais do seu conteúdo",
    content: "1. Autoridade silenciosa\n2. Copywriting magnético\n3. Estratégia de conteúdo",
  },
  {
    id: "audience",
    title: "Meu Público",
    icon: <Users className="h-5 w-5" />,
    description: "Dores, desejos e objeções da sua audiência",
    content: "",
  },
  {
    id: "drafts",
    title: "Meus Rascunhos",
    icon: <FileText className="h-5 w-5" />,
    description: "Carrosséis que você está criando",
    content: "",
  },
  {
    id: "calendar",
    title: "Meu Calendário",
    icon: <Calendar className="h-5 w-5" />,
    description: "O que você postou e vai postar",
    content: "",
  },
  {
    id: "results",
    title: "Meus Resultados",
    icon: <Trophy className="h-5 w-5" />,
    description: "Prints, métricas e anotações",
    content: "",
  },
];

function SectionCard({ 
  section, 
  onEdit 
}: { 
  section: Section; 
  onEdit: (section: Section) => void;
}) {
  const hasContent = Boolean(section.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="interactive"
        className="group"
        onClick={() => onEdit(section)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              hasContent ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
            )}>
              {section.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-semibold text-foreground mb-1">
                {section.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {hasContent ? section.content : section.description}
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
  section,
  onSave,
  onClose,
}: {
  section: Section;
  onSave: (content: string) => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState(section.content || "");

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
              {section.icon}
            </div>
            <div>
              <h2 className="font-serif font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="text-xs text-muted-foreground">{section.description}</p>
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
            placeholder={`Escreva sobre ${section.title.toLowerCase()}...`}
            className="min-h-64 resize-none"
          />
        </div>

        <footer className="p-4 border-t border-border">
          <Button
            variant="gradient"
            className="w-full"
            onClick={() => onSave(content)}
          >
            Salvar
          </Button>
        </footer>
      </div>
    </motion.div>
  );
}

export default function Notebook() {
  const navigate = useNavigate();
  const [sectionsData, setSectionsData] = useState(sections);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const handleSave = (content: string) => {
    if (editingSection) {
      setSectionsData((prev) =>
        prev.map((s) =>
          s.id === editingSection.id ? { ...s, content } : s
        )
      );
      setEditingSection(null);
    }
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
            onClick={() => navigate("/app/resultados")}
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
          {sectionsData.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onEdit={setEditingSection}
            />
          ))}
        </motion.div>
      </div>

      {/* Editor de seção */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={handleSave}
          onClose={() => setEditingSection(null)}
        />
      )}
    </AppLayout>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Layers, Library, Wand2, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModulesAdmin } from "@/components/admin/ModulesAdmin";
import { ModuleCardsAdmin } from "@/components/admin/ModuleCardsAdmin";
import { LibraryAdmin } from "@/components/admin/LibraryAdmin";
import { ScriptProductsAdmin } from "@/components/admin/ScriptProductsAdmin";
import { ScriptBlocksAdmin } from "@/components/admin/ScriptBlocksAdmin";
import { ScriptMetricsAdmin } from "@/components/admin/ScriptMetricsAdmin";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("modules");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/membrosvmcm/app")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-serif font-bold text-foreground">
            Administração
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Módulos</span>
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">Biblioteca</span>
              </TabsTrigger>
              <TabsTrigger value="script-products" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <span className="hidden sm:inline">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="script-blocks" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Blocos</span>
              </TabsTrigger>
              <TabsTrigger value="script-metrics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Métricas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="modules">
              <ModulesAdmin />
            </TabsContent>
            <TabsContent value="cards">
              <ModuleCardsAdmin />
            </TabsContent>
            <TabsContent value="library">
              <LibraryAdmin />
            </TabsContent>
            <TabsContent value="script-products">
              <ScriptProductsAdmin />
            </TabsContent>
            <TabsContent value="script-blocks">
              <ScriptBlocksAdmin />
            </TabsContent>
            <TabsContent value="script-metrics">
              <ScriptMetricsAdmin />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

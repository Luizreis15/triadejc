import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, Users, Shield, UserPlus, BookOpen, Layers, Library, Wand2, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { AdminsManagement } from "@/components/admin/AdminsManagement";
import { LeadsAdmin } from "@/components/admin/LeadsAdmin";
import { ModulesAdmin } from "@/components/admin/ModulesAdmin";
import { ModuleCardsAdmin } from "@/components/admin/ModuleCardsAdmin";
import { LibraryAdmin } from "@/components/admin/LibraryAdmin";
import { ScriptProductsAdmin } from "@/components/admin/ScriptProductsAdmin";
import { ScriptBlocksAdmin } from "@/components/admin/ScriptBlocksAdmin";
import { ScriptMetricsAdmin } from "@/components/admin/ScriptMetricsAdmin";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "users", label: "Usuários", icon: Users },
    { value: "admins", label: "Admins", icon: Shield },
    { value: "leads", label: "Leads", icon: UserPlus },
    { value: "modules", label: "Módulos", icon: BookOpen },
    { value: "cards", label: "Cards", icon: Layers },
    { value: "library", label: "Biblioteca", icon: Library },
    { value: "script-products", label: "Produtos", icon: Wand2 },
    { value: "script-blocks", label: "Blocos", icon: Layers },
    { value: "script-metrics", label: "Métricas", icon: BarChart3 },
  ];

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
            Painel Administrativo
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
            <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-muted/50 p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>
            <TabsContent value="users">
              <UsersAdmin />
            </TabsContent>
            <TabsContent value="admins">
              <AdminsManagement />
            </TabsContent>
            <TabsContent value="leads">
              <LeadsAdmin />
            </TabsContent>
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

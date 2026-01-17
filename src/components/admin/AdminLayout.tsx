import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Shield,
  UserPlus,
  BookOpen,
  Layers,
  Library,
  Wand2,
  BarChart3,
  LogOut,
  Eye,
  Settings,
  Video,
} from "lucide-react";
import logoJornadaUnica from "@/assets/logo-jornada-unica.png";

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
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
  { value: "teleprompter", label: "Teleprompter", icon: Video },
  { value: "settings", label: "Configurações", icon: Settings },
];

export function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/membrosvmcm");
  };

  const handleViewAsMember = () => {
    navigate("/membrosvmcm/app");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <img 
            src={logoJornadaUnica} 
            alt="Jornada Única" 
            className="h-12 mx-auto"
          />
          <p className="text-xs text-muted-foreground text-center mt-2">Painel Admin</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleViewAsMember}
          >
            <Eye className="h-4 w-4" />
            Ver como Membro
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Header + Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <img src={logoJornadaUnica} alt="Jornada Única" className="h-8" />
              <span className="text-sm font-medium text-muted-foreground">Admin</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleViewAsMember}>
                <Eye className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Tabs */}
          <div className="overflow-x-auto px-4 pb-2">
            <div className="flex gap-1">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onTabChange(item.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === item.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14 items-center px-6">
          <h1 className="text-lg font-serif font-bold text-foreground">
            {navItems.find(item => item.value === activeTab)?.label || "Dashboard"}
          </h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

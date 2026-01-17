import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, PenLine, Library, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", path: "/membros/app" },
  { icon: BookOpen, label: "Módulos", path: "/membros/app/modulos" },
  { icon: PenLine, label: "Caderno", path: "/membros/app/caderno" },
  { icon: Library, label: "Biblioteca", path: "/membros/app/biblioteca" },
  { icon: User, label: "Perfil", path: "/membros/app/perfil" },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/membros/app") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px]",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative transition-transform duration-300",
                active && "scale-110"
              )}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                active ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

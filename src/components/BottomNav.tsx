import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, NotebookPen, Library, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/membros/app", icon: Home, label: "Início" },
  { to: "/membros/app/modulos", icon: BookOpen, label: "Módulos" },
  { to: "/membros/app/caderno", icon: NotebookPen, label: "Caderno" },
  { to: "/membros/app/biblioteca", icon: Library, label: "Biblioteca" },
  { to: "/membros/app/perfil", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = 
            item.to === "/membros/app" 
              ? location.pathname === "/membros/app"
              : location.pathname.startsWith(item.to);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[64px]",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isActive && "scale-110"
                )} 
              />
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

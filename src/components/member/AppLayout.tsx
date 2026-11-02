import { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { MemberThemeProvider, useMemberTheme } from "./MemberTheme";
import { ReadingReminder } from "./ReadingReminder";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

function MemberShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useMemberTheme();

  return (
    <div className={cn("member-shell min-h-screen", theme === "dark" && "member-dark")}>
      <div className="mx-auto flex max-w-lg justify-end px-4 pt-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft"
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {theme === "dark" ? "Claro" : "Escuro"}
        </button>
      </div>
      <ReadingReminder />
      <main className="pb-24">
        <div className="container mx-auto max-w-lg px-4 py-4">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <MemberThemeProvider>
      <MemberShell>{children}</MemberShell>
    </MemberThemeProvider>
  );
}

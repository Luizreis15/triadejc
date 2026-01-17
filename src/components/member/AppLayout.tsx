import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="pb-24 pt-safe">
        <div className="container max-w-lg mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

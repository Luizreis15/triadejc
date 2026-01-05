import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import ModuleDetail from "./pages/ModuleDetail";
import Library from "./pages/Library";
import Notebook from "./pages/Notebook";
import CalendarPage from "./pages/Calendar";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/modulos" element={<Modules />} />
          <Route path="/app/modulos/:slug" element={<ModuleDetail />} />
          <Route path="/app/biblioteca" element={<Library />} />
          <Route path="/app/caderno" element={<Notebook />} />
          <Route path="/app/calendario" element={<CalendarPage />} />
          <Route path="/app/resultados" element={<Results />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

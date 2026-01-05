import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import ModuleDetail from "./pages/ModuleDetail";
import Library from "./pages/Library";
import Notebook from "./pages/Notebook";
import CalendarPage from "./pages/Calendar";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import SalesPage from "./pages/SalesPage";
import MockupGenerator from "./pages/MockupGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/app/modulos" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
            <Route path="/app/modulos/:slug" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
            <Route path="/app/biblioteca" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/app/caderno" element={<ProtectedRoute><Notebook /></ProtectedRoute>} />
            <Route path="/app/calendario" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/app/resultados" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/mockups" element={<AdminRoute><MockupGenerator /></AdminRoute>} />
            <Route path="/vendas" element={<SalesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

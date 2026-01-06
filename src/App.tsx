import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
            {/* Redirect root to sales page (temporary until institutional site is ready) */}
            <Route path="/" element={<Navigate to="/vmcm" replace />} />
            
            {/* Sales page */}
            <Route path="/vmcm" element={<SalesPage />} />
            
            {/* Members area */}
            <Route path="/membrosvmcm" element={<Login />} />
            <Route path="/membrosvmcm/reset-password" element={<ResetPassword />} />
            <Route path="/membrosvmcm/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/membrosvmcm/app/modulos" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
            <Route path="/membrosvmcm/app/modulos/:slug" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
            <Route path="/membrosvmcm/app/biblioteca" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/membrosvmcm/app/caderno" element={<ProtectedRoute><Notebook /></ProtectedRoute>} />
            <Route path="/membrosvmcm/app/calendario" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/membrosvmcm/app/resultados" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/membrosvmcm/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/membrosvmcm/admin/mockups" element={<AdminRoute><MockupGenerator /></AdminRoute>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

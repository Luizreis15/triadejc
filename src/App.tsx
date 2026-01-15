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
import ScriptGenerator from "./pages/ScriptGenerator";
import Teleprompter from "./pages/Teleprompter";
import MyScripts from "./pages/MyScripts";
import MemberProfile from "./pages/MemberProfile";
import AdminProfile from "./pages/AdminProfile";
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
            {/* Redirect root to sales page */}
            <Route path="/" element={<Navigate to="/jornada" replace />} />
            
            {/* Sales page */}
            <Route path="/jornada" element={<SalesPage />} />
            
            {/* Members area */}
            <Route path="/membros" element={<Login />} />
            <Route path="/membros/reset-password" element={<ResetPassword />} />
            <Route path="/membros/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/membros/app/modulos" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
            <Route path="/membros/app/modulos/:slug" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
            <Route path="/membros/app/biblioteca" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/membros/app/caderno" element={<ProtectedRoute><Notebook /></ProtectedRoute>} />
            <Route path="/membros/app/calendario" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/membros/app/resultados" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/membros/app/roteiros" element={<ProtectedRoute><ScriptGenerator /></ProtectedRoute>} />
            <Route path="/membros/app/meus-roteiros" element={<ProtectedRoute><MyScripts /></ProtectedRoute>} />
            <Route path="/membros/app/teleprompter/:scriptId" element={<ProtectedRoute><Teleprompter /></ProtectedRoute>} />
            <Route path="/membros/app/perfil" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
            
            {/* Admin area */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/mockups" element={<AdminRoute><MockupGenerator /></AdminRoute>} />
            <Route path="/admin/perfil" element={<AdminRoute><AdminProfile /></AdminRoute>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

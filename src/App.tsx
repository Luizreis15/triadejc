import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";

// Public pages
import SalesPage from "./pages/SalesPage";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Member pages
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import ModuleDetail from "./pages/ModuleDetail";
import ReadingView from "./pages/ReadingView";
import Notebook from "./pages/Notebook";
import Library from "./pages/Library";
import MemberProfile from "./pages/MemberProfile";

// Admin pages
import Admin from "./pages/Admin";
import AdminProfile from "./pages/AdminProfile";
import MockupGenerator from "./pages/MockupGenerator";

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
            
            {/* Public routes */}
            <Route path="/jornada" element={<SalesPage />} />
            
            {/* Member authentication */}
            <Route path="/membros" element={<Login />} />
            <Route path="/membros/signup" element={<Signup />} />
            <Route path="/membros/reset-password" element={<ResetPassword />} />
            
            {/* Protected member routes */}
            <Route path="/membros/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/membros/app/modulos" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
            <Route path="/membros/app/modulos/:slug" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
            <Route path="/membros/app/modulos/:slug/leitura/:cardId" element={<ProtectedRoute><ReadingView /></ProtectedRoute>} />
            <Route path="/membros/app/caderno" element={<ProtectedRoute><Notebook /></ProtectedRoute>} />
            <Route path="/membros/app/biblioteca" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/membros/app/perfil" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/mockups" element={<AdminRoute><MockupGenerator /></AdminRoute>} />
            <Route path="/admin/perfil" element={<AdminRoute><AdminProfile /></AdminRoute>} />
            
            {/* Legacy routes redirect */}
            <Route path="/membrosvmcm/*" element={<Navigate to="/membros" replace />} />
            <Route path="/vmcm" element={<Navigate to="/jornada" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";

// Public pages
import SalesPage from "./pages/SalesPage";
import SalesPageJunica from "./pages/SalesPageJunica";
import SalesPageRevoluz from "./pages/SalesPageRevoluz";
import HomePage from "./pages/HomePage";
import JornadasPage from "./pages/JornadasPage";
import ContatoPage from "./pages/ContatoPage";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Admin pages
import Admin from "./pages/Admin";
import AdminProfile from "./pages/AdminProfile";

// Member pages
import { AppLayout } from "@/components/member/AppLayout";
import { Home, Modules, ModuleDetail, DayView, ReadingView, Notebook, Library, Profile, JourneyCompletion, ProductsShowcase } from "./pages/member";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
{/* Institutional home */}
            <Route path="/" element={<HomePage />} />
            
            {/* Public routes */}
            <Route path="/jornada" element={<SalesPage />} />
            <Route path="/junica" element={<SalesPageJunica />} />
            <Route path="/revoluz" element={<SalesPageRevoluz />} />
            <Route path="/metodo-revoluz" element={<SalesPageRevoluz />} />
            <Route path="/jornadas" element={<JornadasPage />} />
            <Route path="/contato" element={<ContatoPage />} />
            
            {/* Member authentication */}
            <Route path="/membros" element={<Login />} />
            <Route path="/membros/signup" element={<Signup />} />
            <Route path="/membros/reset-password" element={<ResetPassword />} />
            
            {/* Protected member routes */}
            <Route path="/membros/app" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/modulos" element={<ProtectedRoute><AppLayout><Modules /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/modulos/:slug" element={<ProtectedRoute><AppLayout><ModuleDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/modulos/:slug/dia/:dayId" element={<ProtectedRoute><AppLayout><DayView /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/modulos/:slug/leitura/:cardId" element={<ProtectedRoute><AppLayout><ReadingView /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/caderno" element={<ProtectedRoute><AppLayout><Notebook /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/biblioteca" element={<ProtectedRoute><AppLayout><Library /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/perfil" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/conclusao" element={<ProtectedRoute><AppLayout><JourneyCompletion /></AppLayout></ProtectedRoute>} />
            <Route path="/membros/app/conheca" element={<ProtectedRoute><AppLayout><ProductsShowcase /></AppLayout></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
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

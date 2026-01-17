import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import logoJornadaUnica from "@/assets/logo-jornada-unica.png";
import { AdminViewModal } from "@/components/admin/AdminViewModal";

const emailSchema = z.string().email("Digite um e-mail válido");
const passwordSchema = z.string().min(6, "A senha deve ter pelo menos 6 caracteres");

export default function Login() {
  const navigate = useNavigate();
  const { user, signInWithPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && !isCheckingRole) {
      setIsCheckingRole(true);
      
      // Check if user is admin
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            // User is admin - show modal to choose view
            setIsAdmin(true);
            setShowViewModal(true);
          } else {
            // Regular user - go directly to member area
            navigate("/membrosvmcm/app", { replace: true });
          }
          setIsCheckingRole(false);
        });
    }
  }, [user, navigate, isCheckingRole]);

  const handleSelectAdmin = () => {
    setShowViewModal(false);
    navigate("/admin", { replace: true });
  };

  const handleSelectMember = () => {
    setShowViewModal(false);
    navigate("/membrosvmcm/app", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({
        title: "Erro",
        description: emailResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({
        title: "Erro",
        description: passwordResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signInWithPassword(email, password);
      if (error) {
        let message = error.message;
        if (error.message.includes("Invalid login credentials")) {
          message = "E-mail ou senha incorretos.";
        }
        toast({
          title: "Erro ao entrar",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0E2D2] flex flex-col">
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <img 
            src={logoJornadaUnica} 
            alt="Jornada Única" 
            className="h-36 md:h-48 mx-auto mb-4"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-border">
            <h2 className="text-xl font-serif font-semibold text-center mb-6 text-[#253244]">
              Acesse sua Jornada
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#253244] mb-2"
                >
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#253244] mb-2"
                >
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Aguarde...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <a
                href="/membrosvmcm/reset-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="py-6 text-center"
      >
        <p className="text-xs text-[#682A0C]">
          © 2026 Jordana Cantarelli · Jornada Única
        </p>
      </motion.footer>

      {/* Modal de seleção para admins */}
      <AdminViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        onSelectAdmin={handleSelectAdmin}
        onSelectMember={handleSelectMember}
      />
    </div>
  );
}

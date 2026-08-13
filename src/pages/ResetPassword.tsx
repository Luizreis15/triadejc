import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import logoJornadaUnica from "@/assets/logo-jornada-unica.png";
import { ArrowLeft } from "lucide-react";

const emailSchema = z.string().email("Digite um e-mail válido");
const passwordSchema = z.string().min(6, "A senha deve ter pelo menos 6 caracteres");

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const tokenHash = searchParams.get("token_hash");
  const linkType = searchParams.get("type");
  const [sessionReady, setSessionReady] = useState(false);

  // Check if we're in password update mode (user clicked link from email)
  const isUpdateMode = linkType === "recovery" || linkType === "invite" || sessionReady;

  useEffect(() => {
    // Listen for auth state changes to detect password recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });

    // Links from e-mail may come as token_hash (needs explicit verification)
    const verify = async () => {
      if (!tokenHash) return;
      setVerifying(true);
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: linkType === "invite" ? "invite" : "recovery",
      });
      setVerifying(false);
      if (error) {
        toast({
          title: "Link inválido ou expirado",
          description: "Solicite um novo link de redefinição de senha.",
          variant: "destructive",
        });
      } else {
        setSessionReady(true);
        toast({
          title: "Link validado",
          description: "Agora você pode definir sua nova senha.",
        });
      }
    };
    verify();

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleRequestReset = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/membrosvmcm/reset-password?type=recovery`,
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "E-mail enviado! ✉️",
          description: "Verifique sua caixa de entrada para redefinir a senha.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      toast({
        title: "Erro",
        description: passwordResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Senha atualizada! 🎉",
          description: "Você já pode fazer login com sua nova senha.",
        });
        navigate("/membrosvmcm");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="h-24 md:h-32 mx-auto mb-4"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-border">
            <h2 className="text-xl font-serif font-semibold text-center mb-2 text-[#253244]">
              {isUpdateMode ? "Defina sua nova senha" : "Redefinir senha"}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {isUpdateMode 
                ? "Digite sua nova senha abaixo" 
                : "Digite seu e-mail para receber o link de redefinição"
              }
            </p>

            {!isUpdateMode ? (
              emailSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl">✉️</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Enviamos um link para <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verifique sua caixa de entrada e spam
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                  >
                    Enviar novamente
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRequestReset} className="space-y-4">
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
                        Enviando...
                      </span>
                    ) : (
                      "Enviar link de redefinição"
                    )}
                  </Button>
                </form>
              )
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-[#253244] mb-2"
                  >
                    Nova senha
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[#253244] mb-2"
                  >
                    Confirmar nova senha
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Salvando...
                    </span>
                  ) : (
                    "Salvar nova senha"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Link
                to="/membrosvmcm"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </Link>
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
    </div>
  );
}

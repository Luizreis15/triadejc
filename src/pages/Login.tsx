import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Digite um e-mail válido");
const passwordSchema = z.string().min(6, "A senha deve ter pelo menos 6 caracteres");

export default function Login() {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

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

    if (!useMagicLink) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        toast({
          title: "Erro",
          description: passwordResult.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (useMagicLink) {
        const { error } = await signIn(email);
        if (error) {
          toast({
            title: "Erro ao enviar link",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Link enviado! ✨",
            description: "Verifique seu e-mail para acessar.",
          });
        }
      } else if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          let message = error.message;
          if (error.message.includes("already registered")) {
            message = "Este e-mail já está cadastrado. Tente fazer login.";
          }
          toast({
            title: "Erro ao criar conta",
            description: message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Conta criada! 🎉",
            description: "Você já pode acessar o caderno.",
          });
        }
      } else {
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
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-primary opacity-5" />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            Caderno Digital
          </h1>
          <p className="text-lg text-primary font-serif italic">
            Carrosséis Magnéticos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm space-y-4"
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-border">
            <h2 className="text-xl font-serif font-semibold text-center mb-6">
              {isSignUp ? "Crie sua conta" : "Acesse seu Caderno"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
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

              {!useMagicLink && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground mb-2"
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
              )}

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
                ) : useMagicLink ? (
                  "Entrar com Link Mágico"
                ) : isSignUp ? (
                  "Criar Conta"
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-4 space-y-2">
              {useMagicLink ? (
                <p className="text-xs text-muted-foreground text-center">
                  Você receberá um link de acesso no seu e-mail
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => setUseMagicLink(!useMagicLink)}
                className="w-full text-sm text-primary hover:underline"
              >
                {useMagicLink ? "Usar e-mail e senha" : "Usar link mágico"}
              </button>

              {!useMagicLink && (
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  {isSignUp ? "Já tem conta? Entre" : "Não tem conta? Cadastre-se"}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não é aluna?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Saiba mais
            </a>
          </p>
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="py-6 text-center"
      >
        <p className="text-xs text-muted-foreground">
          © 2025 Samira Coelho · Código Magnético
        </p>
      </motion.footer>
    </div>
  );
}

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Header decorativo */}
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
              Acesse seu Caderno
            </h2>
            
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={() => navigate("/app")}
              >
                Entrar com Link Mágico
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Você receberá um link de acesso no seu e-mail
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não é aluna?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Saiba mais
            </a>
          </p>
        </motion.div>
      </div>

      {/* Footer */}
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

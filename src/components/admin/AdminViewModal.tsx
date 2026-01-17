import { motion, AnimatePresence } from "framer-motion";
import { Shield, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAdmin: () => void;
  onSelectMember: () => void;
}

export function AdminViewModal({ isOpen, onClose, onSelectAdmin, onSelectMember }: AdminViewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="admin-view-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            key="admin-view-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-foreground">
                Escolha sua visão
              </h2>
              <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-muted-foreground mb-6">
              Você é administrador do sistema. Como deseja acessar?
            </p>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={onSelectAdmin}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors text-left group"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Painel Admin</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar usuários, módulos, conteúdo
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={onSelectMember}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:bg-accent/50 hover:border-accent transition-colors text-left group"
              >
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <User className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Área de Membros</h3>
                  <p className="text-sm text-muted-foreground">
                    Ver curso como um aluno veria
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

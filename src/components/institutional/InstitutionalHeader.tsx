import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_URL = "https://wa.link/0fz5bp";

const navItems = [
  { label: "Sobre", href: "/#sobre" },
  { label: "Como posso te ajudar?", href: "/#ajuda" },
  { label: "Jornadas", href: "/jornadas" },
  { label: "Palestras", href: "/#palestras" },
  { label: "Depoimentos", href: "/#depoimentos" },
  { label: "Contato", href: "/contato" },
];

export function InstitutionalHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleNav = (href: string) => {
    setOpen(false);
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Link to="/" className="font-['Playfair_Display'] text-lg md:text-xl font-semibold text-foreground">
          Jordana Cantarelli
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item, i) =>
            item.href.startsWith("/#") ? (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleNav(item.href)}
                className="text-sm font-['Poppins'] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </motion.button>
            ) : (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={item.href}
                  className="text-sm font-['Poppins'] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            )
          )}
          <motion.a
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold py-2.5 px-5 text-xs"
          >
            Agendar Sessão
          </motion.a>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground p-2">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-card border-b border-border px-4 pb-4 overflow-hidden"
          >
            <nav className="flex flex-col gap-3">
              {navItems.map((item, i) =>
                item.href.startsWith("/#") ? (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => handleNav(item.href)}
                    className="text-sm font-['Poppins'] text-muted-foreground hover:text-foreground text-left py-1"
                  >
                    {item.label}
                  </motion.button>
                ) : (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="text-sm font-['Poppins'] text-muted-foreground hover:text-foreground py-1 block"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                )
              )}
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold py-3 px-5 text-xs mt-2 w-full"
              >
                Agendar Sessão Individual
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

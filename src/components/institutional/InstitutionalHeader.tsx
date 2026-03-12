import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Link to="/" className="font-['Playfair_Display'] text-lg md:text-xl font-semibold text-foreground">
          Jordana Cantarelli
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) =>
            item.href.startsWith("/#") ? (
              <button
                key={item.label}
                onClick={() => handleNav(item.href)}
                className="text-sm font-['Poppins'] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-['Poppins'] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold py-2.5 px-5 text-xs"
          >
            Agendar Sessão
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground p-2">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-card border-b border-border px-4 pb-4">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) =>
              item.href.startsWith("/#") ? (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.href)}
                  className="text-sm font-['Poppins'] text-muted-foreground hover:text-foreground text-left py-1"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-['Poppins'] text-muted-foreground hover:text-foreground py-1"
                >
                  {item.label}
                </Link>
              )
            )}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold py-3 px-5 text-xs mt-2 w-full"
            >
              Agendar Sessão Individual
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

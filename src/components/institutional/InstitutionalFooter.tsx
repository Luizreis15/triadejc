import { Link } from "react-router-dom";
import { Instagram, Youtube } from "lucide-react";

export function InstitutionalFooter() {
  return (
    <footer className="bg-primary text-primary-foreground px-6 py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="font-['Playfair_Display'] text-xl font-semibold mb-2">Jordana Cantarelli</p>
            <p className="font-['Poppins'] text-sm opacity-70">
              Psicanalista Clínica & Terapeuta Cristã
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <p className="font-['Poppins'] text-sm font-semibold mb-1">Navegação</p>
            <Link to="/jornadas" className="font-['Poppins'] text-sm opacity-70 hover:opacity-100 transition-opacity">Jornadas</Link>
            <Link to="/revoluz" className="font-['Poppins'] text-sm opacity-70 hover:opacity-100 transition-opacity">Método Revoluz</Link>
            <Link to="/contato" className="font-['Poppins'] text-sm opacity-70 hover:opacity-100 transition-opacity">Contato</Link>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-2">
            <p className="font-['Poppins'] text-sm font-semibold mb-1">Redes Sociais</p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/jordanacantarelli" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@jordanacantarelli" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-center">
          <p className="font-['Poppins'] text-xs opacity-50">
            © {new Date().getFullYear()} Jordana Cantarelli — Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}

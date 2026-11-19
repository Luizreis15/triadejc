import "@/styles/sales-page.css";
import { InstitutionalHeader } from "@/components/institutional/InstitutionalHeader";
import { InstitutionalFooter } from "@/components/institutional/InstitutionalFooter";
import { BackToTopButton } from "@/components/institutional/BackToTopButton";
import { ScrollReveal } from "@/components/sales/ScrollReveal";
import { ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.link/0fz5bp";

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// ── Sessão Individual ──
function SessaoIndividual() {
  return (
    <section id="terapia" className="py-16 px-6 md:px-8 scroll-mt-20">
      <div className="max-w-[700px] mx-auto text-center">
        <ScrollReveal>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Sessão Individual (Terapia)
          </h2>
          <p className="font-['Poppins'] text-base text-muted-foreground leading-relaxed mb-4">
            Um espaço seguro e acolhedor para você ser ouvida, compreendida e guiada no processo de cura emocional e espiritual. Atendimentos online, com horários flexíveis.
          </p>
          <p className="font-['Poppins'] text-xs text-muted-foreground mb-8">
            Atendimento online. Valores sob consulta. Agendamento via WhatsApp.
          </p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-orange py-5 px-10 text-base">
            Agendar no WhatsApp <ArrowRight className="w-5 h-5" />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}


export default function ContatoPage() {
  return (
    <div className="sales-page">
      <InstitutionalHeader />
      <main className="pt-24 pb-16">
        <div id="contato-topo" className="max-w-[1200px] mx-auto px-6 md:px-8 scroll-mt-20">
          <ScrollReveal>
            <div className="text-center mb-4">
              <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-foreground mb-3">
                Contato
              </h1>
              <p className="font-['Poppins'] text-base text-muted-foreground">
                Escolha a melhor forma de entrar em contato.
              </p>
            </div>
          </ScrollReveal>

          {/* Quick scroll buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => scrollToSection("terapia")}
              className="font-['Poppins'] text-xs font-semibold py-2 px-4 rounded-full border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors"
            >
              Sessão Individual
            </button>
            <button
              onClick={() => scrollToSection("convites")}
              className="font-['Poppins'] text-xs font-semibold py-2 px-4 rounded-full border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors"
            >
              Convites
            </button>
          </div>
        </div>

        <SessaoIndividual />

        {/* Convites */}
        <section id="convites" className="py-16 px-6 md:px-8 bg-muted/50 scroll-mt-20">
          <div className="max-w-[1200px] mx-auto">
            <ScrollReveal>
              <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground text-center mb-3">
                Convites para pregações e palestras
              </h2>
              <p className="font-['Poppins'] text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
                Jordana está disponível para ministrações, eventos de mulheres, workshops e retiros voltados à restauração emocional e identidade cristã.
              </p>
              <div className="flex justify-center">
                <a
                  href="https://wa.link/z8p2f9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold py-4 px-8 text-sm"
                >
                  Enviar convite <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <InstitutionalFooter />
      <BackToTopButton />
    </div>
  );
}

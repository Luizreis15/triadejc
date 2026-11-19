import "@/styles/sales-page.css";
import { Link } from "react-router-dom";
import { InstitutionalHeader } from "@/components/institutional/InstitutionalHeader";
import { InstitutionalFooter } from "@/components/institutional/InstitutionalFooter";
import { BackToTopButton } from "@/components/institutional/BackToTopButton";
import { ScrollReveal } from "@/components/sales/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/sales/StaggerContainer";
import { Heart, BookOpen, Sparkles, ArrowRight } from "lucide-react";

const jornadas = [
  {
    title: "Respira, Alma",
    desc: "Reconexão emocional e espiritual para quem sente que se perdeu de si mesma.",
    tag: "ansiedade • reconexão",
    icon: Heart,
    appLink: "/jornada",
  },
  {
    title: "Cadeias Invisíveis",
    desc: "Jornada de rompimento de padrões emocionais, cura de traumas e transformação interior.",
    tag: "padrões • cura emocional",
    icon: BookOpen,
    appLink: "/jornada",
  },
  {
    title: "Confissões de Fé",
    desc: "30 dias para reprogramar sua mente com a Palavra e redescobrir sua identidade em Deus.",
    tag: "identidade • reprogramação",
    icon: Sparkles,
    appLink: "/jornada",
  },
];

export default function JornadasPage() {
  return (
    <div className="sales-page">
      <InstitutionalHeader />
      <main className="pt-24 pb-16">
        <div id="jornadas-topo" className="max-w-[1200px] mx-auto px-6 md:px-8 scroll-mt-20">
          {/* Hero */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Jornadas e Programas
              </h1>
              <p className="font-['Poppins'] text-base text-muted-foreground max-w-2xl mx-auto mb-2">
                Programas terapêuticos exclusivos criados por mim, que combinam fé, desenvolvimento pessoal e experiência prática com mulheres reais.
              </p>
              <p className="font-['Poppins'] text-sm text-secondary italic max-w-xl mx-auto">
                Escolha pela sua necessidade hoje. Você não precisa resolver tudo de uma vez — precisa começar.
              </p>
            </div>
          </ScrollReveal>

          {/* Main grid */}
          <div id="jornadas-catalogo" className="scroll-mt-20">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jornadas.map((j) => (
              <StaggerItem key={j.title}>
                <div className="card-cream p-6 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                    <j.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <span className="inline-block font-['Poppins'] text-[10px] uppercase tracking-wider text-secondary mb-2">
                    {j.tag}
                  </span>
                  <h2 className="font-['Playfair_Display'] text-xl font-semibold text-foreground mb-2">{j.title}</h2>
                  <p className="font-['Poppins'] text-sm text-muted-foreground flex-1 mb-4">{j.desc}</p>
                  <Link to={j.appLink} className="btn-gold py-3 px-5 text-xs w-full">
                    Conhecer a Jornada <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          </div>

        </div>
      </main>
      <InstitutionalFooter />
      <BackToTopButton />
    </div>
  );
}

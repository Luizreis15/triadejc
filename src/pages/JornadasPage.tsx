import "@/styles/sales-page.css";
import { Link } from "react-router-dom";
import { InstitutionalHeader } from "@/components/institutional/InstitutionalHeader";
import { InstitutionalFooter } from "@/components/institutional/InstitutionalFooter";
import { ScrollReveal } from "@/components/sales/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/sales/StaggerContainer";
import { Heart, BookOpen, Sparkles, ArrowRight } from "lucide-react";

const REVOLUZ_CHECKOUT = "https://pay.kiwify.com.br/IFBt2d0";

const jornadas = [
  {
    title: "Respira, Alma",
    desc: "Reconexão emocional e espiritual para quem sente que se perdeu de si mesma.",
    icon: Heart,
    appLink: "/jornada",
  },
  {
    title: "Cadeias Invisíveis",
    desc: "Jornada de rompimento de padrões emocionais, cura de traumas e transformação interior.",
    icon: BookOpen,
    appLink: "/jornada",
  },
  {
    title: "Confissões de Fé",
    desc: "30 dias para reprogramar sua mente com a Palavra e redescobrir sua identidade em Deus.",
    icon: Sparkles,
    appLink: "/jornada",
  },
];

const outros = [
  {
    title: "Método Revoluz",
    desc: "Programa de transformação que une princípios cristãos, inteligência emocional e reprogramação mental para restaurar sua identidade e propósito.",
    cta: "Conhecer o Método Revoluz",
    href: "/revoluz",
    external: false,
  },
  {
    title: "Mentoria DSL",
    desc: "Mentoria em grupo, ao vivo, com direcionamento espiritual e emocional para destravar bloqueios e viver com clareza, equilíbrio e propósito.",
    cta: "Entrar na lista de espera",
    href: "/contato#lista-espera",
    external: false,
  },
  {
    title: "Revoluz Experience",
    desc: "Imersão presencial de um dia para viver, sentir e aplicar o Método Revoluz com intensidade e resultados imediatos.",
    cta: "Entrar na lista de espera",
    href: "/contato#lista-espera",
    external: false,
  },
];

export default function JornadasPage() {
  return (
    <div className="sales-page">
      <InstitutionalHeader />
      <main className="pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          {/* Hero */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Jornadas e Programas
              </h1>
              <p className="font-['Poppins'] text-base text-muted-foreground max-w-2xl mx-auto">
                Programas terapêuticos exclusivos criados por mim, que combinam fé, desenvolvimento pessoal e experiência prática com mulheres reais.
              </p>
            </div>
          </ScrollReveal>

          {/* Main grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {jornadas.map((j) => (
              <StaggerItem key={j.title}>
                <div className="card-cream p-6 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                    <j.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="font-['Playfair_Display'] text-xl font-semibold text-foreground mb-2">{j.title}</h2>
                  <p className="font-['Poppins'] text-sm text-muted-foreground flex-1 mb-4">{j.desc}</p>
                  <Link to={j.appLink} className="btn-gold py-3 px-5 text-xs w-full">
                    Acessar no app <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Outros */}
          <ScrollReveal>
            <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-foreground text-center mb-8">
              Outros Produtos
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {outros.map((p) => (
              <StaggerItem key={p.title}>
                <div className="card-cream p-6 h-full flex flex-col">
                  <h3 className="font-['Playfair_Display'] text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="font-['Poppins'] text-sm text-muted-foreground flex-1 mb-4">{p.desc}</p>
                  {p.external ? (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn-orange py-3 px-5 text-xs w-full">
                      {p.cta} <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link to={p.href} className="inline-flex items-center justify-center gap-2 py-3 px-5 text-xs font-['Poppins'] font-semibold border-2 border-foreground/20 rounded-xl text-foreground hover:bg-foreground/5 transition-colors w-full">
                      {p.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
}

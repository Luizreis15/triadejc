import "@/styles/sales-page.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { InstitutionalHeader } from "@/components/institutional/InstitutionalHeader";
import { InstitutionalFooter } from "@/components/institutional/InstitutionalFooter";
import { BackToTopButton } from "@/components/institutional/BackToTopButton";
import { ScrollReveal } from "@/components/sales/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/sales/StaggerContainer";
import { IconSquare } from "@/components/sales/IconSquare";
import { Heart, BookOpen, Sparkles, Users, Mic, GraduationCap, Clock, MapPin, ArrowRight, Star, ChevronDown } from "lucide-react";
import jordanaHero from "@/assets/jordana-hero.jpg";
import jordanaAbout from "@/assets/jordana-about.jpg";

const WHATSAPP_URL = "https://wa.link/0fz5bp";

// ── Hero ──
function HeroSection() {
  return (
    <section id="topo" className="pt-24 pb-12 px-6 md:px-8 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <ScrollReveal>
          <div>
            <span className="inline-block font-['Poppins'] text-xs uppercase tracking-widest text-secondary mb-2">
              Psicanalista Clínica & Terapeuta Cristã
            </span>
            <p className="font-['Poppins'] text-xs text-muted-foreground mb-6">Pastora da Lagoinha Morumbi</p>
            <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight mb-6">
              Especialista em transformação interior e restauração feminina
            </h1>
            <p className="font-['Poppins'] text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              Conduzindo mulheres cansadas e fragmentadas a reencontrarem paz, identidade e propósito em Cristo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-gold py-4 px-8 text-sm">
                Agendar Sessão Individual <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/jornadas" className="inline-flex items-center justify-center gap-2 py-4 px-8 text-sm font-['Poppins'] font-semibold border-2 border-foreground/20 rounded-xl text-foreground hover:bg-foreground/5 transition-colors">
                Conhecer as Jornadas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="font-['Poppins'] text-xs text-muted-foreground italic">
              Sem atalhos. Um caminho com direção, fé e responsabilidade.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2} direction="right">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 pointer-events-none z-10" style={{
              background: `linear-gradient(to bottom, hsl(30 20% 97% / 0.3) 0%, transparent 15%, transparent 90%, hsl(28 30% 94%) 100%)`
            }} />
            <img src={jordanaHero} alt="Jordana Cantarelli" className="w-full aspect-[4/5] object-cover object-top" fetchPriority="high" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Sobre ──
function SobreSection() {
  return (
    <section id="sobre" className="py-16 px-6 md:px-8 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <ScrollReveal direction="left">
          <div className="relative overflow-hidden rounded-3xl">
            <img src={jordanaAbout} alt="Jordana Cantarelli" className="w-full aspect-[4/5] object-cover object-top" loading="lazy" />
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div>
            <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground mb-6">
              Sobre Jordana Cantarelli
            </h2>
            <p className="font-['Poppins'] text-base text-muted-foreground leading-relaxed mb-4">
              Sou Jordana, terapeuta cristã, pastora e mulher apaixonada por ver outras mulheres se reencontrando com a paz que só Deus pode oferecer. Há mais de 10 anos, dedico minha vida a cuidar de outras mulheres que carregam dores invisíveis, traumas silenciosos e ciclos de autossabotagem — tudo isso com um único objetivo: restaurar sua identidade em Deus e te ajudar a respirar de novo.
            </p>
            <p className="font-['Poppins'] text-base text-muted-foreground leading-relaxed">
              Meu trabalho é ajudar você a vencer o caos interno e reconstruir sua vida com base na fé Cristã, no amor e no propósito.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Missão ──
function MissaoSection() {
  return (
    <section id="missao" className="py-16 px-6 md:px-8 bg-primary text-primary-foreground scroll-mt-20">
      <div className="max-w-[800px] mx-auto text-center">
        <ScrollReveal>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold mb-6">Minha Missão</h2>
          <p className="font-['Poppins'] text-base md:text-lg leading-relaxed opacity-90">
            Acolher, escutar e conduzir mulheres ao processo de transformação interior com raízes firmadas na fé cristã. Quero que você se veja como Deus te vê: restaurada, forte, amada e pronta para viver com leveza e propósito.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Como posso te ajudar ──
function AjudaSection() {
  const bullets = [
    "Romper com traumas e padrões destrutivos",
    "Desenvolver equilíbrio emocional e clareza",
    "Resgatar o senso de propósito e valor próprio",
    "Reconectar-se com Deus de forma íntima e restauradora",
  ];
  return (
    <section id="ajuda" className="py-16 px-6 md:px-8 scroll-mt-20">
      <div className="max-w-[800px] mx-auto">
        <ScrollReveal>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">
            Como posso te ajudar?
          </h2>
          <p className="font-['Poppins'] text-base text-muted-foreground text-center leading-relaxed mb-8">
            Um processo profundo de escuta e transformação para mulheres que querem curar feridas emocionais, resgatar a autoestima e reencontrar sua identidade espiritual.
          </p>
        </ScrollReveal>
        <StaggerContainer className="space-y-4 mb-8">
          {bullets.map((b, i) => (
            <StaggerItem key={i} className="flex items-start gap-3">
              <IconSquare icon="check" />
              <p className="font-['Poppins'] text-base text-foreground">{b}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <div className="text-center">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-gold py-4 px-8 text-sm">
            Agendar Sessão Individual <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Jornadas e Programas ──
function JornadasSection() {
  const jornadas = [
    { title: "Respira, Alma", desc: "Reconexão emocional e espiritual para quem sente que se perdeu de si mesma.", icon: Heart },
    { title: "Cadeias Invisíveis", desc: "Jornada de rompimento de padrões emocionais, cura de traumas e transformação interior.", icon: BookOpen },
    { title: "Confissões de Fé", desc: "30 dias para reprogramar sua mente com a Palavra e redescobrir sua identidade em Deus.", icon: Sparkles },
  ];
  const outros = [
    { title: "Método Revoluz", desc: "Programa de transformação que une princípios cristãos, inteligência emocional e reprogramação mental para restaurar sua identidade e propósito.", cta: "Conhecer o Método Revoluz", href: "/revoluz", external: false },
    { title: "Mentoria DSL", desc: "Mentoria em grupo, ao vivo, com direcionamento espiritual e emocional para destravar bloqueios e viver com clareza, equilíbrio e propósito.", cta: "Entrar na lista de espera", href: "/contato#lista-espera", external: false },
    { title: "Revoluz Experience", desc: "Imersão presencial de um dia para viver, sentir e aplicar o Método Revoluz com intensidade e resultados imediatos.", cta: "Entrar na lista de espera", href: "/contato#lista-espera", external: false },
  ];

  return (
    <section id="jornadas" className="py-16 px-6 md:px-8 bg-background scroll-mt-20">
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground text-center mb-3">
            Jornadas e Programas
          </h2>
          <p className="font-['Poppins'] text-base text-muted-foreground text-center mb-2 max-w-2xl mx-auto">
            Programas terapêuticos exclusivos criados por mim, que combinam fé, desenvolvimento pessoal e experiência prática com mulheres reais.
          </p>
          <p className="font-['Poppins'] text-sm text-secondary text-center mb-10 italic">
            Se você não sabe por onde começar, comece por uma jornada.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {jornadas.map((j) => (
            <StaggerItem key={j.title}>
              <div className="card-cream p-6 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  <j.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-['Playfair_Display'] text-lg font-semibold text-foreground mb-2">{j.title}</h3>
                <p className="font-['Poppins'] text-sm text-muted-foreground flex-1">{j.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="text-center mb-10">
          <Link to="/jornadas" className="btn-gold py-4 px-8 text-sm">
            Conhecer as Jornadas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ScrollReveal>
          <h3 id="produtos" className="font-['Playfair_Display'] text-xl font-semibold text-foreground text-center mb-6 scroll-mt-20">Outros Produtos</h3>
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
    </section>
  );
}

// ── Para quem é ──
function ParaQuemSection() {
  const items = [
    "Mulheres que enfrentam traumas emocionais",
    "Cristãs que perderam a direção e o equilíbrio interior",
    "Esposas, mães, profissionais sobrecarregadas e emocionalmente esgotadas",
    "Filhas de Deus que desejam voltar a se sentir seguras, amadas e fortes",
  ];
  return (
    <section id="publico" className="py-16 px-6 md:px-8 scroll-mt-20">
      <div className="max-w-[800px] mx-auto">
        <ScrollReveal>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground text-center mb-8">
            Para quem é esse trabalho?
          </h2>
        </ScrollReveal>
        <StaggerContainer className="space-y-4">
          {items.map((item, i) => (
            <StaggerItem key={i} className="flex items-start gap-3">
              <IconSquare icon="check" />
              <p className="font-['Poppins'] text-base text-foreground">{item}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ── Palestras ──
function PalestrasSection() {
  const temas = [
    "Cura da alma e libertação emocional",
    "Reconstrução da identidade feminina em Cristo",
    "Rompimento de ciclos de autossabotagem",
    "Fé, saúde mental e equilíbrio emocional",
    "Propósito e chamado",
  ];
  return (
    <section id="palestras" className="py-16 px-6 md:px-8 bg-background scroll-mt-20">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <ScrollReveal>
          <div>
            <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Palestras, Encontros e Mentorias para Mulheres Cristãs
            </h2>
            <p className="font-['Poppins'] text-base text-muted-foreground leading-relaxed mb-6">
              Além dos atendimentos terapêuticos, Jordana está disponível para ministrações, eventos de mulheres, workshops e retiros voltados à restauração emocional, identidade cristã e liderança feminina com propósito.
            </p>
            <div className="space-y-3 mb-8">
              {temas.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <IconSquare icon={Mic} />
                  <p className="font-['Poppins'] text-sm text-foreground">{t}</p>
                </div>
              ))}
            </div>
            <Link to="/contato#convites" className="btn-gold py-4 px-8 text-sm">
              Convidar para pregar/palestrar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2} direction="right">
          <div className="rounded-3xl overflow-hidden">
            <img
              src="https://jordanacantarelli.com.br/jordam.jpeg"
              alt="Jordana ministrando"
              className="w-full aspect-[4/5] object-cover object-top"
              loading="lazy"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Formação ──
function FormacaoSection() {
  const items = [
    { icon: GraduationCap, text: "Psicanalista clínica com atuação em terapia cristã" },
    { icon: Users, text: "Pastora da Lagoinha Morumbi com atuação ativa no aconselhamento feminino e ministerial" },
    { icon: Clock, text: "Mais de 10 anos de experiência atendendo mulheres em crise, dores emocionais e processos espirituais" },
    { icon: Mic, text: "Palestrante, mentora e criadora de jornadas terapêuticas com base bíblica" },
    { icon: MapPin, text: "Atendimentos online • Segunda a Sexta – 9h às 18h • Valores sob consulta" },
  ];
  return (
    <section id="formacao" className="py-16 px-6 md:px-8 bg-primary text-primary-foreground scroll-mt-20">
      <div className="max-w-[800px] mx-auto">
        <ScrollReveal>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-center mb-8">
            Minha Formação e Caminhada
          </h2>
        </ScrollReveal>
        <StaggerContainer className="space-y-5">
          {items.map((item, i) => (
            <StaggerItem key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 min-w-[40px] rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <p className="font-['Poppins'] text-base opacity-90">{item.text}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ── Depoimentos ──
function DepoimentosSection() {
  const [showAll, setShowAll] = useState(false);
  const testimonials = [
    { name: "Ana Paula", text: "Pela primeira vez entendi o que sinto por dentro, sem culpa e com direção." },
    { name: "Camila", text: "Não é promessa, é clareza. Me ajudou a acalmar a mente e viver com mais serenidade." },
    { name: "Renata", text: "A forma como a Jordana aplica fé + clareza emocional fez sentido pra mim." },
    { name: "Patrícia", text: "A Jordana me ajudou a enxergar padrões que eu reproduzia há anos sem perceber." },
    { name: "Fernanda", text: "As sessões me devolveram esperança. Voltei a me sentir amada e segura." },
    { name: "Juliana", text: "Eu achava que precisava ser forte. Aprendi que precisava ser cuidada." },
  ];
  const visible = showAll ? testimonials : testimonials.slice(0, 3);

  return (
    <section id="depoimentos" className="py-16 px-6 md:px-8 bg-muted/50 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
          <p className="font-['Poppins'] text-xs text-muted-foreground text-center mb-2 uppercase tracking-wider">
            Depoimentos reais de mulheres impactadas pelo conteúdo e pelas jornadas.
          </p>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground text-center mb-10">
            O que dizem sobre mim
          </h2>
        </ScrollReveal>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visible.map((t, i) => (
            <StaggerItem key={i}>
              <div className="card-cream p-6 h-full">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />)}
                </div>
                <p className="font-['Poppins'] text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
                <p className="font-['Poppins'] text-sm font-semibold text-foreground">— {t.name}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        {!showAll && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 font-['Poppins'] text-sm font-semibold text-foreground hover:text-secondary transition-colors"
            >
              Ver mais depoimentos <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── CTA Final ──
function CTAFinalSection() {
  return (
    <section id="cta-final" className="py-16 px-6 md:px-8 scroll-mt-20">
      <div className="max-w-[800px] mx-auto text-center">
        <ScrollReveal>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Pronta pra viver sua melhor versão?
          </h2>
          <p className="font-['Poppins'] text-base text-muted-foreground leading-relaxed mb-8">
            Não precisa mais lutar sozinha. Sua jornada de restauração começa com um passo: abrir o coração para viver algo novo extraordinário em sua vida.
          </p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-orange py-5 px-10 text-base">
            Clique aqui e fale comigo no WhatsApp <ArrowRight className="w-5 h-5" />
          </a>
          <p className="font-['Poppins'] text-xs text-muted-foreground mt-4">
            Resposta em horário comercial. Segunda a Sexta – 9h às 18h.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ── Page ──
export default function HomePage() {
  return (
    <div className="sales-page">
      <InstitutionalHeader />
      <main>
        <HeroSection />
        <SobreSection />
        <MissaoSection />
        <AjudaSection />
        <JornadasSection />
        <ParaQuemSection />
        <PalestrasSection />
        <FormacaoSection />
        <DepoimentosSection />
        <CTAFinalSection />
      </main>
      <InstitutionalFooter />
      <BackToTopButton />
    </div>
  );
}

import "@/styles/sales-page.css";
import { useState } from "react";
import jordanaHero from "@/assets/jordana-hero.jpg";
import jordanaAbout from "@/assets/jordana-about.jpg";
import logoJornadaUnica from "@/assets/logo-jornada-unica.png";
import { ButtonGold, ButtonOrange, IconSquare, CardCream, SectionRed, FAQAccordion, ScrollReveal, LeadCaptureModal } from "@/components/sales";
import { Shield, Heart, Brain, Sun, HelpCircle } from "lucide-react";

const CHECKOUT_URL = "https://pay.kiwify.com.br/oHyxLi0";

const scrollToOffer = () => {
  document.getElementById("oferta")?.scrollIntoView({
    behavior: "smooth"
  });
};

// Seção 1: Hero
function HeroSection() {
  return <section className="px-6 py-8 text-center">
      {/* Logo/Título */}
      <div className="mb-4">
        <img src={logoJornadaUnica} alt="Jornada Única" className="h-16 md:h-20 mx-auto mb-2" />
        <p className="text-xs mt-1 opacity-70 body-inter">Experiência Guiada • Digital</p>
      </div>

      {/* Headline Principal */}
      <h2 className="heading-playfair text-2xl md:text-3xl mb-3 px-2">
        Organize O Que Está Por Dentro — Com Clareza, Presença e Calma
      </h2>
      <p className="body-inter text-base mb-5 opacity-80 px-2">
        Uma experiência guiada para mulheres que querem viver sua fé sem sobrecarga emocional — com mais serenidade, entendimento e leveza no dia a dia.
      </p>

      {/* CTA */}
      <ButtonGold onClick={scrollToOffer} className="w-full max-w-xs mx-auto">
        QUERO ACESSAR A JORNADA
      </ButtonGold>
      <p className="text-xs mt-2 opacity-60 body-inter">
        Acesso imediato • Garantia de 7 dias
      </p>

      {/* Foto Jordana com fade transparente */}
      <div className="mt-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: `linear-gradient(
              to bottom,
              hsl(30 20% 97% / 0.6) 0%,
              transparent 20%,
              transparent 85%,
              hsl(30 20% 97%) 100%
            )`
      }} />
        <img src={jordanaHero} alt="Jordana Cantarelli" width={460} height={600} fetchPriority="high" className="w-full object-cover" />
      </div>
    </section>;
}

// Seção 2: Identificação Rápida
function IdentificationSection() {
  const questions = ["Sentido a mente acelerada mesmo orando?", "Percebido que pensar demais suga sua paz?", "Sentido culpa por não conseguir permanecer em tranquilidade?", "Quer viver sua fé com mais presença e menos tensão?"];
  return <section className="px-6 py-8">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          Você Sente Isso?
        </h2>
      </ScrollReveal>
      <div className="space-y-3">
        {questions.map((question, i) => <div key={i} className="animate-fade-in-up" style={{
        animationDelay: `${i * 80}ms`
      }}>
            <CardCream className="flex items-start gap-3 p-4">
              <div className="w-8 h-8 min-w-[32px] rounded-full flex items-center justify-center" style={{
            backgroundColor: 'hsl(350 30% 58% / 0.15)'
          }}>
                <HelpCircle className="w-5 h-5" style={{
              color: 'hsl(350 30% 58%)'
            }} />
              </div>
              <p className="body-inter text-sm flex-1">Você já {question.toLowerCase()}</p>
            </CardCream>
          </div>)}
      </div>
      <ScrollReveal delay={0.3}>
        <p className="body-inter text-center mt-6 font-semibold" style={{
        color: 'hsl(195 52% 23%)'
      }}>
          Não é falta de fé. É falta de clareza interna.
        </p>
      </ScrollReveal>
    </section>;
}

// Seção 3: Por Que Essa Jornada Existe
function WhyExistsSection() {
  return <section className="px-6 py-8">
      <CardCream className="py-8 px-5">
        <ScrollReveal>
          <h2 className="heading-playfair text-xl text-center mb-4" style={{
          color: 'hsl(195 52% 23%)'
        }}>
            Por Que Essa Jornada Existe
          </h2>
          <p className="body-inter text-sm text-center mb-4">
            Essa jornada nasceu da experiência de <strong>Jordana Cantarelli</strong> — Pastora e Psicanalista Clínica com mais de 10 anos de atuação — ao perceber que muitas mulheres amam a Deus com sinceridade, mas não encontram direção interna para organizar o que sentem por dentro.
          </p>
          <p className="body-inter text-sm text-center opacity-80">
            Aqui não se promete cura milagrosa.<br />
            Aqui se oferece um espaço para entender, acolher e organizar sua vida emocional e espiritual com responsabilidade e carinho.
          </p>
        </ScrollReveal>
        <div className="text-center mt-6">
          <ButtonOrange onClick={scrollToOffer}>QUERO ACESSAR</ButtonOrange>
        </div>
      </CardCream>
    </section>;
}

// Seção 4: O Que Está Incluído (Benefícios)
function BenefitsSection() {
  const benefits = [{
    icon: Heart,
    text: "Clareza emocional para entender o que sente"
  }, {
    icon: Brain,
    text: "Organização interna para lidar com pensamentos acelerados"
  }, {
    icon: Sun,
    text: "Presença espiritual que acolhe sem culpa"
  }, {
    icon: Heart,
    text: "Estratégias práticas que se aplicam ao seu cotidiano"
  }, {
    icon: Sun,
    text: "Guia e suporte leve para você caminhar no seu tempo"
  }];
  return <section className="px-6 py-8">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          O Que Está Incluído
        </h2>
      </ScrollReveal>
      <div className="space-y-3">
        {benefits.map((benefit, i) => <div key={i} className="flex items-start gap-3 animate-fade-in-up" style={{
        animationDelay: `${i * 60}ms`
      }}>
            <IconSquare icon="check" />
            <p className="body-inter text-sm flex-1">{benefit.text}</p>
          </div>)}
      </div>
      <div className="text-center mt-8">
        <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
      </div>
    </section>;
}

// Seção 5: Título Transição
function TransitionTitle() {
  return <section className="px-6 py-6 text-center">
      <ScrollReveal>
        <h2 className="heading-playfair text-2xl" style={{
        color: 'hsl(195 52% 23%)'
      }}>
          O Que Você Vai Receber Dentro
        </h2>
      </ScrollReveal>
    </section>;
}

// Seção 6: Sessões
function SessionsSection() {
  const sessions = [{
    number: 1,
    title: "Entendimento Interno",
    description: "Ferramentas para nomear sentimentos, reconhecer padrões e trazer paz de mente.",
    icon: Brain
  }, {
    number: 2,
    title: "Reorganização do Mundo Interno",
    description: "Práticas para transformar seu diálogo interno e alinhar sua fé com sua vida emocional.",
    icon: Heart
  }, {
    number: 3,
    title: "Construindo Presença",
    description: "Rotinas simples e biblicamente ancoradas para viver com mais calma e presença no dia a dia.",
    icon: Sun
  }];
  return <section className="px-6 py-6">
      <div className="space-y-4">
        {sessions.map((session, i) => <ScrollReveal key={i} delay={i * 0.1}>
            <div className="session-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
              backgroundColor: 'hsl(350 30% 58%)'
            }}>
                  <session.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg">
                  Sessão {session.number} — {session.title}
                </h3>
              </div>
              <p className="body-inter text-sm opacity-80 pl-13">
                {session.description}
              </p>
            </div>
          </ScrollReveal>)}
      </div>
      <div className="text-center mt-8">
        <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
      </div>
    </section>;
}

// Seção 7: Depoimentos
function TestimonialsSection() {
  const testimonials = [{
    text: "Pela primeira vez entendi o que sinto por dentro, sem culpa e com direção.",
    author: "Mulher, 34 anos"
  }, {
    text: "Não é promessa, é clareza. Me ajudou a acalmar a mente e viver com mais serenidade.",
    author: "Mulher, 41 anos"
  }, {
    text: "A forma como a Jordana aplica fé + clareza emocional fez sentido pra mim.",
    author: "Mulher, 38 anos"
  }];
  return <section className="px-6 py-8" style={{
    backgroundColor: 'hsl(30 25% 94%)'
  }}>
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          O Que Elas Dizem
        </h2>
      </ScrollReveal>
      <div className="space-y-4">
        {testimonials.map((testimonial, i) => <ScrollReveal key={i} delay={i * 0.1}>
            <div className="testimonial-card">
              <p className="body-inter text-sm mb-3 pl-6 italic">
                "{testimonial.text}"
              </p>
              <p className="body-inter text-xs opacity-60 text-right">
                — {testimonial.author}
              </p>
            </div>
          </ScrollReveal>)}
      </div>
    </section>;
}

// Seção 8: Card de Oferta
function OfferSection({ onOpenLeadModal }: { onOpenLeadModal: () => void }) {
  const benefits = ["3 Sessões Completas de Jornada Guiada", "Ferramentas práticas de autoconhecimento", "Integração fé + clareza emocional", "Acesso imediato e vitalício"];
  return <SectionRed id="oferta" className="py-12">
      <div className="card-wine p-6 text-center">
        <h2 className="heading-playfair text-2xl mb-6">
          Jornada Única
        </h2>
        
        <div className="space-y-3 mb-6 text-left">
          {benefits.map((benefit, i) => <div key={i} className="flex items-start gap-3">
              <IconSquare icon="check" />
              <p className="body-inter text-sm">{benefit}</p>
            </div>)}
        </div>

        {/* Garantia */}
        <div className="flex justify-center mb-6">
          <div className="guarantee-badge">
            <Shield className="w-5 h-5 mb-1" />
            <span>7 DIAS</span>
          </div>
        </div>

        <p className="body-inter text-sm mb-4 opacity-80">
          Você tem 7 dias para testar sem risco. Se durante esse período você sentir que essa jornada não foi o que você esperava, devolvemos 100% do seu investimento — sem perguntas.
        </p>

        <p className="body-inter text-xs italic opacity-70 mb-6">
          💡 Sua paz interna merece uma chance — sem risco, sem pressão.
        </p>

        {/* Preço */}
        <div className="mb-6">
          <p className="text-sm line-through opacity-60 body-inter">de R$ 197,00</p>
          <p className="heading-playfair text-3xl">por apenas R$ 97</p>
        </div>

        {/* CTA */}
        <ButtonOrange size="large" className="w-full" onClick={onOpenLeadModal}>
          QUERO ACESSAR A JORNADA
        </ButtonOrange>
        <p className="text-xs mt-3 opacity-70 body-inter">
          Acesso imediato após confirmação do pagamento.
        </p>
      </div>
    </SectionRed>;
}

// Seção 9: Quem é Jordana
function AboutSection() {
  return <section className="px-6 py-8">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-4" style={{
        color: 'hsl(195 52% 23%)'
      }}>
          Quem Te Acompanha Nessa Jornada
        </h2>
      </ScrollReveal>
      
      <ScrollReveal delay={0.1}>
        <div className="relative overflow-hidden mb-6">
          <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: `linear-gradient(
                to bottom,
                hsl(30 20% 97% / 0.4) 0%,
                transparent 15%,
                transparent 85%,
                hsl(30 20% 97%) 100%
              )`
        }} />
          <img src={jordanaAbout} alt="Jordana Cantarelli" width={460} height={400} loading="lazy" decoding="async" className="w-full object-cover rounded-2xl" />
        </div>
      </ScrollReveal>
      
      <ScrollReveal delay={0.2}>
        <h3 className="heading-playfair text-2xl text-center mb-4" style={{
        color: 'hsl(195 52% 23%)'
      }}>
          Jordana Cantarelli
        </h3>
        <p className="body-inter text-sm text-center mb-4">
          Pastora, Psicanalista Clínica e Mentora de Mulheres com mais de 10 anos de experiência.
        </p>
        <p className="body-inter text-sm text-center opacity-80">
          Ela une fé, sensibilidade humana e ciência emocional para guiar mulheres que desejam viver sua fé com calma interior e organização emocional prática.
        </p>
      </ScrollReveal>
      
      <div className="text-center mt-6">
        <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
      </div>
    </section>;
}

// Seção 10: FAQ
function FAQSection() {
  const faqItems = [{
    question: "Para quem é essa jornada?",
    answer: "Para mulheres que querem viver sua fé com mais clareza emocional, menos sobrecarga e mais presença no dia a dia."
  }, {
    question: "Preciso ter conhecimento prévio?",
    answer: "Não. A jornada foi pensada para ser acessível a qualquer mulher, independente do nível de conhecimento."
  }, {
    question: "É conteúdo religioso ou psicológico?",
    answer: "É uma integração sensível entre fé e ciência emocional, sem extremos. Uma abordagem prática e acolhedora."
  }, {
    question: "Em quanto tempo vejo resultados?",
    answer: "Cada pessoa tem seu tempo. Algumas relatam clareza desde a primeira sessão, outras precisam de mais tempo para processar."
  }, {
    question: "Como recebo o acesso?",
    answer: "Acesso imediato após a confirmação do pagamento, direto no seu e-mail."
  }, {
    question: "Tem garantia?",
    answer: "Sim. 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor."
  }];
  return <section className="px-6 py-8">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          Dúvidas Frequentes
        </h2>
      </ScrollReveal>
      <FAQAccordion items={faqItems} />
    </section>;
}

// Seção 11: CTA Final
function FinalCTASection() {
  return <section className="px-6 py-8 text-center" style={{
    backgroundColor: 'hsl(30 25% 94%)'
  }}>
      <ScrollReveal>
        <h2 className="heading-playfair text-xl mb-4" style={{
        color: 'hsl(195 52% 23%)'
      }}>
          Esse é um passo que sua alma pode agradecer amanhã.
        </h2>
        <p className="body-inter text-base mb-6 opacity-80">
          Não é sobre ser perfeita — é sobre viver com presença.
        </p>
      </ScrollReveal>
      <div className="text-center">
        <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR A JORNADA</ButtonGold>
        <p className="text-xs mt-3 opacity-60 body-inter">
          R$ 97 • Acesso imediato • Garantia 7 dias
        </p>
      </div>
    </section>;
}

// Seção 12: Rodapé
function FooterSection() {
  return <footer className="px-6 py-6 text-center border-t border-[hsl(350_30%_58%/0.2)]">
      <div className="mb-4">
        <p className="body-inter text-sm font-semibold mb-2">Suporte</p>
        {/* TODO: atualizar email */}
        <p className="body-inter text-sm opacity-70">info@jordanacantarelli.com.br</p>
      </div>
      <div className="mb-4 space-x-4">
        <a href="#" className="body-inter text-xs underline opacity-60 hover:opacity-100">Política de Privacidade</a>
        <a href="#" className="body-inter text-xs underline opacity-60 hover:opacity-100">Termos de Uso</a>
      </div>
      <p className="body-inter text-xs opacity-50">
        © Jordana Cantarelli — Todos os direitos reservados
      </p>
    </footer>;
}

// Página Principal
export default function SalesPage() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  return (
    <div className="sales-page">
      <div className="sales-container">
        <HeroSection />
        <IdentificationSection />
        <WhyExistsSection />
        <BenefitsSection />
        <TransitionTitle />
        <SessionsSection />
        <TestimonialsSection />
        <OfferSection onOpenLeadModal={() => setIsLeadModalOpen(true)} />
        <AboutSection />
        <FAQSection />
        <FinalCTASection />
        <FooterSection />
      </div>

      <LeadCaptureModal
        open={isLeadModalOpen}
        onOpenChange={setIsLeadModalOpen}
        checkoutUrl={CHECKOUT_URL}
      />
    </div>
  );
}
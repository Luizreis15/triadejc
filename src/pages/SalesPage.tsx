import "@/styles/sales-page.css";
import samiraHero from "@/assets/samira-hero.jpeg";
import samiraAbout from "@/assets/samira-about.jpg";
import logoCarrosseis from "@/assets/logo-carrosseis.png";
import carousel1 from "@/assets/carousel/carousel-1.jpg";
import carousel2 from "@/assets/carousel/carousel-2.jpg";
import carousel3 from "@/assets/carousel/carousel-3.jpg";
import carousel4 from "@/assets/carousel/carousel-4.jpg";
import carousel5 from "@/assets/carousel/carousel-5.jpg";
import carousel6 from "@/assets/carousel/carousel-6.jpg";
import {
  ButtonGold,
  ButtonOrange,
  IconSquare,
  CardCream,
  SectionRed,
  FAQAccordion,
  MockupLibrary,
  MockupModules,
  MockupNotebook,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/sales";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Check, X, Shield } from "lucide-react";

const scrollToOffer = () => {
  document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth" });
};

// Seção 1: Hero
function HeroSection() {
  return (
    <section className="px-6 py-6 text-center">
      {/* Logo */}
      <div className="mb-3">
        <img 
          src={logoCarrosseis} 
          alt="Carroséis Magnéticos - Venda Mais Com" 
          className="w-56 mx-auto"
        />
        <p className="text-xs mt-1 opacity-70 body-inter">Caderno Digital • Mobile e PC</p>
      </div>

      {/* Headlines */}
      <h1 className="heading-playfair text-2xl md:text-3xl mb-2 px-2">
        As estruturas de carrossel que mais vendem e mais posicionam, prontas pra você copiar e colar.
      </h1>
      <p className="body-inter text-base mb-4 opacity-80">
        Clique no botão abaixo e tenha acesso imediato às estruturas que mais me deram resultado — prontas pra copiar e adaptar.
      </p>

      {/* CTA */}
      <ButtonGold onClick={scrollToOffer} className="w-full max-w-xs mx-auto">
        QUERO ACESSAR
      </ButtonGold>
      <p className="text-xs mt-2 opacity-60 body-inter">
        Acesso imediato • R$ 27 • Garantia de 7 dias
      </p>

      {/* Foto Samira com fade transparente */}
      <div className="mt-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(
              to bottom,
              hsl(350 30% 95%) 0%,
              transparent 30%,
              transparent 70%,
              hsl(350 30% 95%) 100%
            )`
          }}
        />
        <img 
          src={samiraHero} 
          alt="Samira Gouvêa"
          className="w-full object-cover"
        />
      </div>
    </section>
  );
}

// Seção 2: Benefícios
function BenefitsSection() {
  const benefits = [
    "Escolher o formato certo de carrossel de acordo com o objetivo do post.",
    "Copiar estruturas que já funcionam, sem medo de 'estar fazendo errado'.",
    "Adaptar rapidamente o texto ao seu nicho, mantendo lógica e força persuasiva.",
    "Publicar com intenção clara, sem ficar exausta ou perdida.",
    "Variar o conteúdo sem perder identidade, usando formatos estratégicos.",
    "Criar consistência de posicionamento e vendas usando carrosséis como pilar.",
  ];

  return (
    <section className="px-6 py-6">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          Com o Venda Mais com Carrosséis Magnéticos, você vai ser capaz de:
        </h2>
      </ScrollReveal>
      <StaggerContainer className="space-y-3">
        {benefits.map((benefit, i) => (
          <StaggerItem key={i}>
            <CardCream className="flex items-start gap-3">
              <IconSquare icon="check" />
              <p className="body-inter text-sm flex-1">{benefit}</p>
            </CardCream>
          </StaggerItem>
        ))}
      </StaggerContainer>
      <ScrollReveal delay={0.3}>
        <div className="text-center mt-8">
          <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
        </div>
      </ScrollReveal>
    </section>
  );
}

// Seção 3: Exemplos Slider
function ExamplesSection() {
  const carouselImages = [
    carousel1,
    carousel2,
    carousel3,
    carousel4,
    carousel5,
    carousel6,
  ];

  return (
    <section className="px-6 py-6">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          Esses são alguns dos carrosséis que você vai aprender a fazer
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <Carousel className="w-full">
          <CarouselContent>
            {carouselImages.map((img, index) => (
              <CarouselItem key={index} className="basis-4/5">
                <img 
                  src={img} 
                  alt={`Exemplo de carrossel ${index + 1}`}
                  className="w-full rounded-lg shadow-md"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </ScrollReveal>
    </section>
  );
}

// Seção 4: CTA Box Creme
function CTABoxSection() {
  return (
    <section className="px-6 py-6">
      <ScrollReveal>
        <CardCream className="text-center py-8">
          <p className="body-inter text-base mb-6 px-4">
            Clique no botão abaixo para <strong>PARAR DE TRAVAR</strong> na hora de postar e ter acesso aos carrosséis (card a card) que mais me trouxeram resultado:
          </p>
          <ButtonOrange onClick={scrollToOffer}>QUERO ACESSAR</ButtonOrange>
        </CardCream>
      </ScrollReveal>
    </section>
  );
}

// Seção 5: Bloco Vermelho ATENÇÃO
function AttentionSection() {
  const forYou = [
    "Você tem conteúdo, mas trava na hora de organizar em uma estrutura clara.",
    "Você quer transformar o Instagram em vitrine de autoridade (não só posts soltos).",
    "Você quer parar de improvisar e começar a repetir o que funciona.",
    "Você quer DMs com intenção (não só curtidas).",
    "Você quer vender com naturalidade, porque seu perfil passa confiança.",
  ];

  const notForYou = [
    "Você não pretende usar o Instagram como ferramenta de negócio.",
    "Você odeia seguir estrutura e prefere criar do zero toda vez (mesmo travando).",
    "Você quer só 'frases prontas' sem lógica e condução.",
    "Você não está disposta a aplicar nem 20 minutos pra adaptar e postar.",
  ];

  return (
    <SectionRed>
      <h2 className="heading-playfair text-xl text-center mb-6">
        ATENÇÃO! Antes de garantir seu acesso, veja se esse método combina com você…
      </h2>

      {/* For You */}
      <div className="card-wine p-5 mb-4">
        <h3 className="body-inter font-semibold text-base mb-4">
          Vai fazer MUITO sentido pra você se…
        </h3>
        <div className="space-y-3">
          {forYou.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 min-w-[24px] rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="body-inter text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Not For You */}
      <div className="card-wine p-5 mb-6">
        <h3 className="body-inter font-semibold text-base mb-4">
          Talvez não seja pra você se…
        </h3>
        <div className="space-y-3">
          {notForYou.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 min-w-[24px] rounded-full bg-red-400 flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
              <p className="body-inter text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="body-inter text-center text-sm mb-6">
        Clique no botão abaixo para <strong>PARAR DE TRAVAR</strong> e ter acesso imediato ao caderno digital.
      </p>
      <div className="text-center">
        <ButtonOrange onClick={scrollToOffer}>QUERO ACESSAR</ButtonOrange>
      </div>
    </SectionRed>
  );
}

// Seção 6: Título Transição
function TransitionTitle() {
  return (
    <section className="px-6 py-6 text-center">
      <ScrollReveal>
        <h2 className="heading-playfair text-2xl">
          Tudo o que você vai receber dentro do Venda Mais com Carrosséis Magnéticos:
        </h2>
      </ScrollReveal>
    </section>
  );
}

// Seção 7: Biblioteca de Formatos
function LibrarySection() {
  const formats = [
    { title: "Contraste", desc: "para gerar consciência e mudar percepção." },
    { title: "Comparação", desc: "para quebrar objeções e posicionar autoridade com clareza." },
    { title: "Autoridade silenciosa", desc: "para elevar valor percebido sem autopromoção." },
    { title: "Narrativa", desc: "para criar conexão e conduzir até uma conclusão." },
    { title: "Análise", desc: "para gerar debate e posicionamento inteligente." },
    { title: "Conexão", desc: "para fortalecer comunidade e pertencimento." },
    { title: "Venda com critério", desc: "para vender com elegância e intenção clara." },
  ];

  return (
    <section className="px-6 py-6">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          Biblioteca de Formatos de Carrosséis
        </h2>
      </ScrollReveal>
      <StaggerContainer className="space-y-3">
        {formats.map((format, i) => (
          <StaggerItem key={i}>
            <div className="flex items-start gap-3">
              <IconSquare icon="check" />
              <p className="body-inter text-sm">
                <strong>{format.title}</strong> — {format.desc}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
      <div className="mt-8">
        <MockupLibrary />
      </div>
      <ScrollReveal delay={0.2}>
        <div className="text-center mt-6">
          <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
        </div>
      </ScrollReveal>
    </section>
  );
}

// Seção 8: Estrutura de Uso
function StructureSection() {
  const items = [
    { title: "Guia 'Quando usar'", desc: "para escolher o formato certo pelo objetivo do post." },
    { title: "Objetivo estratégico", desc: "para parar de postar no automático." },
    { title: "Estrutura card a card", desc: "do slide 1 ao final com ritmo e condução." },
    { title: "Exemplos de headlines", desc: "para acelerar a adaptação sem perder força." },
    { title: "CTAs recomendadas", desc: "para conduzir salvar, comentar, DM e venda." },
  ];

  return (
    <section className="px-6 py-6">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          Estrutura de Uso de Cada Formato
        </h2>
      </ScrollReveal>
      <StaggerContainer className="space-y-3">
        {items.map((item, i) => (
          <StaggerItem key={i}>
            <div className="flex items-start gap-3">
              <IconSquare icon="check" />
              <p className="body-inter text-sm">
                <strong>{item.title}</strong> — {item.desc}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
      <div className="mt-8">
        <MockupModules />
      </div>
      <ScrollReveal delay={0.2}>
        <div className="text-center mt-6">
          <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
        </div>
      </ScrollReveal>
    </section>
  );
}

// Seção 9: Ferramentas Extras
function ToolsSection() {
  const tools = [
    { title: "Mapa de decisão de formato", desc: "qual carrossel usar em cada dia." },
    { title: "Checklist rápido de adaptação", desc: "adapte sem enfraquecer a mensagem." },
    { title: "Banco de headlines", desc: "capas que param o dedo." },
    { title: "Banco de CTAs estratégicas", desc: "feche todo post com intenção clara." },
    { title: "Modelo de organização semanal", desc: "visão e consistência sem desgaste." },
  ];

  return (
    <section className="px-6 py-6">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          Ferramentas Extras
        </h2>
      </ScrollReveal>
      <StaggerContainer className="space-y-3">
        {tools.map((tool, i) => (
          <StaggerItem key={i}>
            <div className="flex items-start gap-3">
              <IconSquare icon="check" />
              <p className="body-inter text-sm">
                <strong>{tool.title}</strong> — {tool.desc}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
      <div className="mt-8">
        <MockupNotebook />
      </div>
      <ScrollReveal delay={0.2}>
        <div className="text-center mt-6">
          <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
        </div>
      </ScrollReveal>
    </section>
  );
}


// Seção 11: Card de Oferta
function OfferSection() {
  const benefits = [
    "Biblioteca de Formatos de Carrosséis (pra copiar e colar)",
    "Estrutura de Uso de Cada Formato (card a card)",
    "Ferramentas Extras (mapas, checklists, bancos)",
    "Acesso imediato",
  ];

  return (
    <SectionRed id="oferta" className="py-12">
      <div className="card-wine p-6 text-center">
        <h2 className="heading-playfair text-2xl mb-6">
          Venda Mais com Carrosséis Magnéticos
        </h2>
        
        <div className="space-y-3 mb-6 text-left">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3">
              <IconSquare icon="check" />
              <p className="body-inter text-sm">{benefit}</p>
            </div>
          ))}
        </div>

        {/* Garantia */}
        <div className="flex justify-center mb-6">
          <div className="guarantee-badge">
            <Shield className="w-5 h-5 mb-1" />
            <span>7 DIAS</span>
          </div>
        </div>

        {/* Preço */}
        <div className="mb-6">
          <p className="text-sm line-through opacity-60 body-inter">de R$ 197,00</p>
          <p className="heading-playfair text-3xl">por apenas R$ 27</p>
        </div>

        {/* CTA */}
        <a 
          href="https://pay.hub.la/WaKnMJPyb6NZOD8PgNxg" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full"
        >
          <ButtonOrange size="large" className="w-full pointer-events-auto">
            QUERO ACESSAR
          </ButtonOrange>
        </a>
        <p className="text-xs mt-3 opacity-70 body-inter">
          Acesso imediato após confirmação do pagamento.
        </p>
      </div>
    </SectionRed>
  );
}

// Seção 11: Quem é Samira
function AboutSection() {
  return (
    <section className="px-6 py-6">
      <ScrollReveal>
        <div className="relative overflow-hidden mb-6">
          <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `linear-gradient(
                to bottom,
                hsl(350 30% 95%) 0%,
                transparent 30%,
                transparent 70%,
                hsl(350 30% 95%) 100%
              )`
            }}
          />
          <img 
            src={samiraAbout} 
            alt="Samira Gouvêa" 
            className="w-full object-cover"
          />
        </div>
      </ScrollReveal>
      
      <ScrollReveal delay={0.2}>
        <h2 className="heading-playfair text-2xl text-center mb-4">
          Samira Gouvêa
        </h2>
        <p className="body-inter text-sm text-center mb-4">
          Sou estrategista digital e especialista em posicionamento, branding e vendas no Instagram. Eu ensino empreendedoras a transformarem o perfil em uma vitrine de autoridade — com conteúdo que conduz, gera percepção e abre espaço pra venda acontecer com naturalidade.
        </p>
        <p className="body-inter text-center font-semibold italic">
          "Carrossel não é post bonito. É construção de valor."
        </p>
      </ScrollReveal>
      
      <ScrollReveal delay={0.3}>
        <div className="text-center mt-6">
          <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
        </div>
      </ScrollReveal>
    </section>
  );
}

// Seção 13: FAQ
function FAQSection() {
  const faqItems = [
    { question: "Serve pro meu nicho?", answer: "Sim. Os formatos são universais. Você adapta pro seu mercado." },
    { question: "Preciso aparecer?", answer: "Não. Carrossel é autoridade silenciosa." },
    { question: "Preciso ser designer?", answer: "Não. O que vende é clareza, condução e CTA. O visual você encaixa depois." },
    { question: "Em quanto tempo eu aplico?", answer: "Hoje. Você copia um formato, adapta e posta." },
    { question: "Como recebo o acesso?", answer: "Acesso imediato após a confirmação do pagamento." },
    { question: "Tem garantia?", answer: "Sim. 7 dias de garantia incondicional." },
  ];

  return (
    <section className="px-6 py-6">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl text-center mb-6">
          Dúvidas rápidas
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <FAQAccordion items={faqItems} />
      </ScrollReveal>
    </section>
  );
}

// Seção 13: CTA Final
function FinalCTASection() {
  return (
    <section className="px-6 py-6 text-center">
      <ScrollReveal>
        <h2 className="heading-playfair text-xl mb-4">
          Seu feed não precisa de mais posts. Precisa de mais intenção.
        </h2>
        <p className="body-inter text-sm mb-6 opacity-80">
          Se você quer parar de travar e começar a postar com direção, esse caderno digital é seu próximo passo.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <ButtonGold onClick={scrollToOffer}>QUERO ACESSAR</ButtonGold>
        <p className="text-xs mt-3 opacity-60 body-inter">
          R$ 27 • Acesso imediato • Garantia 7 dias
        </p>
      </ScrollReveal>
    </section>
  );
}

// Seção 14: Rodapé
function FooterSection() {
  return (
    <footer className="px-6 py-6 text-center border-t border-[hsl(var(--sp-gold)/0.2)]">
      <div className="mb-4">
        <p className="body-inter text-sm font-semibold mb-2">Suporte</p>
        <p className="body-inter text-sm opacity-70">contato@samiragouvea.com.br</p>
      </div>
      <div className="mb-4 space-x-4">
        <a href="#" className="body-inter text-xs underline opacity-60 hover:opacity-100">Política de Privacidade</a>
        <a href="#" className="body-inter text-xs underline opacity-60 hover:opacity-100">Termos de Uso</a>
      </div>
      <p className="body-inter text-xs opacity-50">
        © Samira Gouvêa — Todos os direitos reservados
      </p>
    </footer>
  );
}

// Página Principal
export default function SalesPage() {
  return (
    <div className="sales-page">
      <div className="sales-container">
        <HeroSection />
        <BenefitsSection />
        <ExamplesSection />
        <CTABoxSection />
        <AttentionSection />
        <TransitionTitle />
        <LibrarySection />
        <StructureSection />
        <ToolsSection />
        <OfferSection />
        <AboutSection />
        <FAQSection />
        <FinalCTASection />
        <FooterSection />
      </div>
    </div>
  );
}

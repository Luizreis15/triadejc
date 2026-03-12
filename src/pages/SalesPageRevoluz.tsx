import "@/styles/sales-page.css";
import { ButtonGold, ButtonOrange, IconSquare, CardCream, SectionRed, FAQAccordion, ScrollReveal } from "@/components/sales";
import { StaggerContainer, StaggerItem } from "@/components/sales/StaggerContainer";
import { TextReveal } from "@/components/sales/TextReveal";
import { Check, X, BookOpen, Brain, Heart, Sparkles, Clock, Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import logoImg from "@/assets/logo-jornada-unica.png";
import heroImg from "@/assets/jordana-hero.jpg";
import aboutImg from "@/assets/jordana-about.jpg";

const CHECKOUT_URL = "https://pay.kiwify.com.br/IFBt2d0";

const handlePurchase = () => {
  window.open(CHECKOUT_URL, "_blank", "noopener,noreferrer");
};

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const faqItems = [
  { question: "Estou fora do Brasil, posso me inscrever?", answer: "Sim, é possível se inscrever mesmo estando fora do Brasil." },
  { question: "Tem garantia?", answer: "Sim, garantia incondicional de 7 dias." },
  { question: "Posso assistir pelo celular?", answer: "Sim, funciona em celular e tablet." },
  { question: "Qual a duração do acesso?", answer: "Acesso por 365 dias (1 ano)." },
  { question: "Quando começa?", answer: "Após confirmação do pagamento (cartão/pix imediato; boleto pode levar até alguns dias)." },
  { question: "O valor é mensalidade?", answer: "Não, é pagamento único (pode parcelar)." },
  { question: "Recebo material em casa?", answer: "Não, é 100% online." },
];

const modules = [
  {
    title: "Módulo 1 — Espiritualidade",
    lessons: [
      "O Poder das Disciplinas Espirituais",
      "Orações que Acessam o Coração de Deus e te Transformam",
      "Meditação Cristã na Prática da Vida",
      "Como Colocar Deus em Sua Rotina?",
    ],
  },
  {
    title: "Módulo 2 — Autoconhecimento",
    lessons: [
      "Identifique os Seus Bloqueios, Traumas e Feridas Emocionais",
      "Compreenda as Consequências dos Bloqueios, Traumas e Feridas Emocionais",
      "O Que Está te Impedindo de Viver a Sua Melhor Versão?",
      "Faça uma Autoanálise de Si",
      "Identidade — Quem Você Realmente Nasceu para Ser?",
    ],
  },
  {
    title: "Módulo 3 — Inteligência Emocional",
    lessons: [
      "O que é Inteligência Emocional?",
      "Inteligência Emocional Sob o Olhar Bíblico",
      "Como Superar os Traumas e Feridas Emocionais?",
      "Como Lidar com o Caminho até a Superação?",
      "Como Não Repetir os Padrões Negativos Hereditários?",
    ],
  },
  {
    title: "Módulo 4 — Reprogramação Mental (Ferramentas)",
    lessons: [
      "Técnica M.C.P.®",
      "Exercícios Terapêuticos de Fé (Rotineiros)",
      "A Importância do Ecossistema",
      "Constância, o Caminho do Sucesso!",
      "O Passaporte para a Sua Melhor Versão!",
    ],
  },
];

export default function SalesPageRevoluz() {
  return (
    <div className="sales-page">
      <div className="sales-container relative">

        {/* ─── HERO ─── */}
        <section className="px-6 pt-8 pb-6 text-center">
          <ScrollReveal>
            <span className="inline-block text-xs body-inter tracking-widest uppercase mb-4" style={{ color: "hsl(var(--sp-rose))" }}>
              Programa de Transformação • Digital
            </span>
          </ScrollReveal>

          <TextReveal as="h1" className="heading-playfair text-2xl md:text-3xl mb-4">
            Organize o que está por dentro — e viva com propósito.
          </TextReveal>

          <ScrollReveal delay={0.15}>
            <p className="body-inter text-sm leading-relaxed mb-4 mx-auto" style={{ color: "hsl(var(--sp-text-dark)/0.8)" }}>
              Fé + inteligência emocional + reprogramação mental<br />(passo a passo).
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <div className="flex flex-wrap justify-center gap-3 text-xs body-inter mb-6" style={{ color: "hsl(var(--sp-text-dark)/0.6)" }}>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Acesso online</span>
              <span>•</span>
              <span>365 dias de acesso</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Garantia de 7 dias</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="rounded-2xl overflow-hidden mb-6">
              <img src={heroImg} alt="Jordana Cantarelli" className="w-full aspect-[4/5] object-cover object-top" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
            <div className="flex flex-col gap-3">
              <ButtonOrange onClick={handlePurchase} size="large" className="w-full justify-center">
                Quero Começar Agora
              </ButtonOrange>
              <button
                onClick={() => scrollTo("conteudo")}
                className="body-inter text-sm font-medium py-3 px-6 rounded-xl border-2 transition-colors text-center"
                style={{
                  borderColor: "hsl(var(--sp-petrol-primary))",
                  color: "hsl(var(--sp-petrol-primary))",
                }}
              >
                Ver o que tem dentro
              </button>
            </div>
          </ScrollReveal>
        </section>

        {/* ─── VOCÊ SENTE ISSO? ─── */}
        <section id="voce-sente" className="px-6 py-6">
          <TextReveal className="heading-playfair text-xl mb-6">Você sente isso?</TextReveal>

          <StaggerContainer className="space-y-3 mb-6" staggerDelay={0.1}>
            {[
              "Você ama a Deus, mas por dentro está tudo confuso?",
              "Você já tentou mudar hábitos, pensamentos e reações… e voltou para os mesmos ciclos?",
              "Você já percebeu que orar não é o problema — mas falta clareza interna para sustentar a paz?",
              "Você precisa de um caminho prático e didático, sem peso e sem conteúdo cansativo?",
            ].map((q, i) => (
              <StaggerItem key={i}>
                <CardCream className="flex items-start gap-3">
                  <Heart className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "hsl(var(--sp-rose))" }} />
                  <p className="body-inter text-sm">{q}</p>
                </CardCream>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal>
            <p className="heading-playfair text-lg text-center mb-6" style={{ color: "hsl(var(--sp-petrol-primary))" }}>
              Não é falta de fé.<br />É falta de clareza interna.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <ButtonGold onClick={handlePurchase} className="w-full justify-center">
              Quero entrar no REVOLUZ
            </ButtonGold>
          </ScrollReveal>
        </section>

        {/* ─── POR QUE EXISTE ─── */}
        <section className="px-6 py-10">
          <TextReveal className="heading-playfair text-xl mb-6">Por que esse método existe</TextReveal>

          <ScrollReveal>
            <CardCream className="mb-4">
              <p className="body-inter text-sm leading-relaxed">
                Muitas pessoas amam a Deus com sinceridade, mas vivem sem direção interna para organizar o que sentem por dentro. E isso vira culpa, cansaço e repetição de padrões.
              </p>
            </CardCream>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <CardCream>
              <p className="body-inter text-sm leading-relaxed">
                Aqui não se promete cura milagrosa. Aqui se oferece um espaço para entender, acolher e organizar sua vida emocional e espiritual com responsabilidade e carinho — com um passo a passo claro.
              </p>
            </CardCream>
          </ScrollReveal>
        </section>

        {/* ─── O QUE ESTÁ INCLUÍDO ─── */}
        <SectionRed className="py-10">
          <TextReveal className="heading-playfair text-xl mb-6">O que está incluído</TextReveal>

          <StaggerContainer className="space-y-4 mb-8" staggerDelay={0.08}>
            {[
              { icon: Sparkles, text: "Transformação espiritual e emocional" },
              { icon: Brain, text: "Autoconhecimento profundo (bloqueios, traumas e feridas emocionais)" },
              { icon: BookOpen, text: "Inteligência emocional sob o olhar bíblico" },
              { icon: Heart, text: "Reprogramação mental com ferramentas e exercícios" },
              { icon: Clock, text: "Apoio/estrutura para você caminhar no seu tempo (acesso por 365 dias)" },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="flex items-start gap-3">
                  <IconSquare icon={item.icon} />
                  <p className="body-inter text-sm">{item.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal>
            <ButtonOrange onClick={handlePurchase} className="w-full justify-center">
              Garanta sua vaga
            </ButtonOrange>
          </ScrollReveal>
        </SectionRed>

        {/* ─── CONTEÚDO / ACCORDION ─── */}
        <section id="conteudo" className="px-6 py-10">
          <TextReveal className="heading-playfair text-xl mb-6">O que você vai receber dentro</TextReveal>

          <ScrollReveal>
            <Accordion type="single" collapsible className="mb-8">
              {modules.map((mod, i) => (
                <AccordionItem
                  key={i}
                  value={`mod-${i}`}
                  className="border-b border-[hsl(var(--sp-rose)/0.3)]"
                >
                  <AccordionTrigger
                    className="text-left py-4 hover:no-underline"
                    style={{ fontFamily: "var(--font-playfair)", fontWeight: 500 }}
                  >
                    {mod.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pb-2">
                      {mod.lessons.map((lesson, j) => (
                        <li key={j} className="flex items-start gap-2 body-inter text-sm">
                          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "hsl(var(--sp-rose))" }} />
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <ButtonOrange onClick={handlePurchase} className="w-full justify-center">
              Comece agora (acesso imediato)
            </ButtonOrange>
          </ScrollReveal>
        </section>

        {/* ─── PARA QUEM É ─── */}
        <section id="para-quem" className="px-6 py-10">
          <TextReveal className="heading-playfair text-xl mb-6">O REVOLUZ é para você que…</TextReveal>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <ScrollReveal>
              <CardCream className="space-y-3">
                <h3 className="heading-playfair text-base mb-2" style={{ color: "hsl(var(--sp-petrol-primary))" }}>
                  É para você se:
                </h3>
                {[
                  "Tem pouco tempo e quer praticidade",
                  "Detesta conteúdos cansativos e aulas que dão sono",
                  "Quer estudar fazendo o seu próprio horário",
                  "Precisa de um passo a passo simples que funcione",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 body-inter text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "hsl(var(--sp-rose))" }} />
                    {item}
                  </div>
                ))}
              </CardCream>
            </ScrollReveal>

          </div>

          <ScrollReveal>
            <p className="heading-playfair text-lg text-center" style={{ color: "hsl(var(--sp-petrol-primary))" }}>
              Não é sobre ser perfeita —<br />é sobre viver com presença.
            </p>
          </ScrollReveal>
        </section>

        {/* ─── QUEM TE ACOMPANHA ─── */}
        <section className="px-6 py-10">
          <TextReveal className="heading-playfair text-xl mb-6">Quem te acompanha nessa jornada</TextReveal>

          <ScrollReveal>
            <div className="rounded-2xl overflow-hidden mb-4">
              <img src={aboutImg} alt="Jordana Cantarelli" className="w-full aspect-[4/5] object-cover object-top" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h3 className="heading-playfair text-lg mb-2">Jordana Cantarelli</h3>
            <p className="body-inter text-sm leading-relaxed" style={{ color: "hsl(var(--sp-text-dark)/0.8)" }}>
              Pastora, psicanalista clínica e terapeuta cristã, com mais de 10 anos de experiência. Ela une fé, sensibilidade humana e ciência emocional para guiar mulheres que desejam viver sua fé com calma interior e organização emocional prática.
            </p>
          </ScrollReveal>
        </section>

        {/* ─── GARANTIA ─── */}
        <section className="px-6 py-10">
          <ScrollReveal>
            <div className="card-cream p-6 border-2" style={{ borderColor: "hsl(var(--sp-rose)/0.4)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="guarantee-badge">
                  <Shield className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">7 DIAS</span>
                </div>
                <h2 className="heading-playfair text-lg">Você tem 7 dias para testar sem risco</h2>
              </div>
              <p className="body-inter text-sm leading-relaxed mb-4" style={{ color: "hsl(var(--sp-text-dark)/0.8)" }}>
                Você tem garantia incondicional de 7 dias. Se não fizer sentido, você pode pedir seu dinheiro de volta dentro do prazo.
              </p>
              <p className="body-inter text-sm italic mb-6" style={{ color: "hsl(var(--sp-petrol-primary))" }}>
                Sua paz interna merece uma chance — sem risco, sem pressão.
              </p>
              <ButtonGold onClick={handlePurchase} className="w-full justify-center">
                Garanta sua vaga
              </ButtonGold>
            </div>
          </ScrollReveal>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="px-6 py-10">
          <TextReveal className="heading-playfair text-xl mb-6">Dúvidas Frequentes</TextReveal>
          <ScrollReveal>
            <FAQAccordion items={faqItems} />
          </ScrollReveal>
        </section>

        {/* ─── CTA FINAL ─── */}
        <SectionRed className="py-12 text-center">
          <ScrollReveal>
            <h2 className="heading-playfair text-2xl mb-4">Comece Sua Transformação Hoje!</h2>
            <p className="body-inter text-sm mb-8 opacity-90">
              A transformação começa com uma decisão. Decida hoje ser a melhor versão de si mesmo com o Método REVOLUZ.
            </p>
            <ButtonOrange onClick={handlePurchase} size="large" className="w-full justify-center">
              Entrar no Método REVOLUZ
            </ButtonOrange>
          </ScrollReveal>
        </SectionRed>

        {/* ─── FOOTER ─── */}
        <footer className="px-6 py-8 text-center">
          <p className="body-inter text-sm italic mb-2" style={{ color: "hsl(var(--sp-text-dark)/0.6)" }}>
            Esse é um passo que sua alma pode agradecer amanhã.
          </p>
          <a
            href="https://jordanacantarelli.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="body-inter text-xs underline"
            style={{ color: "hsl(var(--sp-petrol-primary))" }}
          >
            Site oficial
          </a>
        </footer>

        {/* spacer for sticky CTA */}
        <div className="h-16 md:hidden" />

        {/* ─── STICKY CTA MOBILE ─── */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[hsl(var(--sp-paper)/0.95)] backdrop-blur-md border-t border-[hsl(var(--sp-cream))] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => scrollTo("conteudo")}
            className="body-inter text-xs underline shrink-0"
            style={{ color: "hsl(var(--sp-petrol-primary))" }}
          >
            Ver conteúdo
          </button>
          <button onClick={handlePurchase} className="btn-orange flex-1 py-3 text-xs">
            Entrar no REVOLUZ
          </button>
        </div>
      </div>
    </div>
  );
}

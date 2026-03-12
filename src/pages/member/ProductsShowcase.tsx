import "@/styles/sales-page.css";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Star, Users, Zap, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitlistModal } from "@/components/member/WaitlistModal";
import { ScrollReveal } from "@/components/sales/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jordanaHero from "@/assets/jordana-hero.jpg";
import jordanaAbout from "@/assets/jordana-about.jpg";

const REVOLUZ_URL = "https://pay.kiwify.com.br/IFBt2d0";

const revoluzModules = [
  {
    title: "Módulo 1 — Espiritualidade",
    lessons: [
      "Poder das Disciplinas Espirituais",
      "Orações que Acessam o Coração de Deus",
      "Meditação Cristã na Prática da Vida",
      "Como Colocar Deus em Sua Rotina?",
    ],
  },
  {
    title: "Módulo 2 — Autoconhecimento",
    lessons: [
      "Identifique Bloqueios, Traumas e Feridas Emocionais",
      "Consequências desses Bloqueios",
      "O Que Está te Impedindo de Viver sua Melhor Versão?",
      "Autoanálise",
      "Identidade — Quem Você Realmente Nasceu para Ser?",
    ],
  },
  {
    title: "Módulo 3 — Inteligência Emocional",
    lessons: [
      "O que é Inteligência Emocional?",
      "Inteligência Emocional sob o Olhar Bíblico",
      "Como Superar Traumas e Feridas Emocionais?",
      "Como Lidar com o Caminho até a Superação?",
      "Como Não Repetir os Padrões Negativos Hereditários?",
    ],
  },
  {
    title: "Módulo 4 — Reprogramação Mental",
    lessons: [
      "Técnica M.C.P.®",
      "Exercícios Terapêuticos de Fé",
      "A Importância do Ecossistema",
      "Constância, o Caminho do Sucesso",
      "O Passaporte para a Sua Melhor Versão!",
    ],
  },
];

const testimonials = [
  "Pela primeira vez entendi o que sinto por dentro, sem culpa e com direção.",
  "Não é promessa, é clareza. Me ajudou a acalmar a mente e viver com mais serenidade.",
  "A forma como a Jordana aplica fé + clareza emocional fez sentido pra mim.",
];

export default function ProductsShowcase() {
  const navigate = useNavigate();
  const waitlistRef = useRef<HTMLDivElement>(null);
  const [waitlistProduct, setWaitlistProduct] = useState<"MENTORIA_DSL" | "REVOLUZ_EXPERIENCE">("MENTORIA_DSL");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [showCurriculum, setShowCurriculum] = useState(false);

  const scrollToWaitlist = () => waitlistRef.current?.scrollIntoView({ behavior: "smooth" });

  const openWaitlist = (product: "MENTORIA_DSL" | "REVOLUZ_EXPERIENCE") => {
    setWaitlistProduct(product);
    setWaitlistOpen(true);
  };

  return (
    <div className="sales-page -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
      <div className="sales-container !max-w-2xl">
        {/* Back button */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-border/30">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        {/* HERO */}
        <section className="px-6 py-10 text-center">
          <h1 className="heading-playfair text-2xl md:text-3xl mb-4 px-2">
            Conheça todos os meus produtos — e escolha o próximo passo da sua transformação.
          </h1>
          <p className="body-inter text-base mb-6 opacity-80 px-2">
            Fé com presença. Clareza emocional com responsabilidade. Um caminho prático para restaurar identidade e propósito.
          </p>
          <div className="mt-8 rounded-2xl overflow-hidden shadow-lg">
            <img src={jordanaHero} alt="Jordana Cantarelli" className="w-full aspect-[4/5] object-cover object-top" />
          </div>
        </section>

        {/* VOCÊ SENTE ISSO? */}
        <ScrollReveal>
          <section className="px-6 py-10">
            <h2 className="heading-playfair text-xl md:text-2xl mb-6 text-center">Você sente isso?</h2>
            <div className="space-y-3">
              {[
                "Você ama a Deus, mas sente que por dentro está tudo desorganizado?",
                "Você já tentou mudar hábitos, pensamentos e reações… mas volta para os mesmos ciclos?",
                "Você sente que precisa de direção — espiritual e emocional — para não viver no modo sobrevivência?",
                "Você sabe que existe uma 'melhor versão', mas falta um caminho prático para sustentar isso?",
              ].map((q, i) => (
                <div key={i} className="card-cream p-4">
                  <p className="body-inter text-sm">{q}</p>
                </div>
              ))}
            </div>
            <p className="body-inter text-center text-sm mt-6 opacity-70 italic">
              Não é sobre perfeição. É sobre clareza + constância.
            </p>
          </section>
        </ScrollReveal>

        {/* QUEM TE ACOMPANHA */}
        <ScrollReveal>
          <section className="section-red px-6 py-10">
            <h2 className="heading-playfair text-xl md:text-2xl mb-4 text-center">Quem te acompanha</h2>
            <div className="rounded-2xl overflow-hidden mb-5">
              <img src={jordanaAbout} alt="Jordana Cantarelli" className="w-full aspect-[4/5] object-cover object-top" />
            </div>
            <p className="body-inter text-sm leading-relaxed opacity-90">
              Eu sou Jordana Cantarelli — pastora da Lagoinha Morumbi e psicanalista clínica, com mais de 10 anos de atuação acompanhando mulheres em processos de restauração emocional e espiritual. Meu trabalho une fé, sensibilidade humana e ferramentas práticas para ajudar você a organizar o que está por dentro, recuperar clareza e caminhar com propósito.
            </p>
            <p className="body-inter text-center text-sm mt-5 italic opacity-80">
              "Aqui não existe atalho. Existe caminho."
            </p>
          </section>
        </ScrollReveal>

        {/* ESCOLHA SEU PRÓXIMO PASSO */}
        <ScrollReveal>
          <section className="px-6 py-10">
            <h2 className="heading-playfair text-xl md:text-2xl mb-6 text-center">Escolha o seu próximo passo</h2>
            <div className="space-y-6">
              {/* CARD 1 — REVOLUZ */}
              <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
                <div className="px-5 pt-5 pb-0">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full mb-3">
                    <Zap className="w-3 h-3 inline mr-1" />Acesso imediato
                  </span>
                  <h3 className="heading-playfair text-lg mb-2">Método REVOLUZ</h3>
                  <p className="body-inter text-sm opacity-80 mb-4">
                    Um programa revolucionário que une princípios cristãos, inteligência emocional e reprogramação mental — para restaurar sua identidade e propósito.
                  </p>
                  <ul className="space-y-2 mb-4">
                    {[
                      "Transformação espiritual e emocional (sem religiosidade vazia)",
                      "Autoconhecimento profundo para identificar bloqueios, traumas e padrões",
                      "Inteligência emocional sob um olhar bíblico + ferramentas práticas",
                      "Reprogramação mental com técnica e constância",
                      "Acesso por 365 dias",
                    ].map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm body-inter">
                        <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-5 pb-5">
                  <a href={REVOLUZ_URL} target="_blank" rel="noopener noreferrer" className="btn-orange w-full text-center text-sm py-4 block">
                    COMECE SUA TRANSFORMAÇÃO HOJE
                    <ArrowRight className="w-4 h-4 inline ml-1" />
                  </a>
                  <p className="text-xs text-center mt-2 opacity-60 body-inter">Garantia de 7 dias</p>

                  {/* Collapsible curriculum */}
                  <button
                    onClick={() => setShowCurriculum(!showCurriculum)}
                    className="flex items-center justify-center gap-1 w-full mt-4 text-sm font-medium text-primary"
                  >
                    O que você vai aprender
                    {showCurriculum ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showCurriculum && (
                    <div className="mt-3 space-y-4">
                      {revoluzModules.map((mod, i) => (
                        <div key={i}>
                          <h4 className="text-sm font-semibold text-foreground mb-1">{mod.title}</h4>
                          <ul className="space-y-1 pl-4">
                            {mod.lessons.map((l, j) => (
                              <li key={j} className="text-xs text-muted-foreground list-disc">{l}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2 — MENTORIA DSL */}
              <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
                <div className="px-5 pt-5 pb-0">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full mb-3">
                    <Users className="w-3 h-3 inline mr-1" />Ao vivo • Em grupo
                  </span>
                  <h3 className="heading-playfair text-lg mb-2">Mentoria DSL</h3>
                  <p className="body-inter text-sm opacity-80 mb-4">
                    Mentoria em grupo, ao vivo, com direcionamento espiritual e emocional para destravar bloqueios e viver com clareza, equilíbrio e propósito.
                  </p>
                  <ul className="space-y-2 mb-4">
                    {[
                      "Direcionamento para decisões e posicionamento",
                      "Ambiente de constância: você não caminha sozinha",
                      "Clareza para identificar bloqueios e alinhar fé + vida emocional",
                    ].map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm body-inter">
                        <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-5 pb-5">
                  <button onClick={() => openWaitlist("MENTORIA_DSL")} className="btn-gold w-full text-sm py-4">
                    ENTRAR NA LISTA DE ESPERA
                    <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              </div>

              {/* CARD 3 — REVOLUZ EXPERIENCE */}
              <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
                <div className="px-5 pt-5 pb-0">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-accent/10 text-accent px-3 py-1 rounded-full mb-3">
                    <Calendar className="w-3 h-3 inline mr-1" />Presencial • 1 dia
                  </span>
                  <h3 className="heading-playfair text-lg mb-2">Revoluz Experience</h3>
                  <p className="body-inter text-sm opacity-80 mb-4">
                    Imersão presencial de um dia para viver, sentir e aplicar o Método Revoluz com intensidade e resultados imediatos.
                  </p>
                  <ul className="space-y-2 mb-4">
                    {[
                      "Um dia para destravar, reorganizar e tomar decisões práticas",
                      "Experiência de presença: fé aplicada com intencionalidade",
                      "Vivência concentrada para sair do modo 'só conteúdo' e ir para 'ação'",
                    ].map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm body-inter">
                        <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-5 pb-5">
                  <button onClick={() => openWaitlist("REVOLUZ_EXPERIENCE")} className="btn-gold w-full text-sm py-4">
                    ENTRAR NA LISTA DE ESPERA
                    <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* PROVA SOCIAL */}
        <ScrollReveal>
          <section className="px-6 py-10 bg-muted/30">
            <h2 className="heading-playfair text-xl md:text-2xl mb-6 text-center">O que elas dizem</h2>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="card-cream p-5 text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="body-inter text-sm italic">"{t}"</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* LISTA DE ESPERA SECTION */}
        <ScrollReveal>
          <div ref={waitlistRef}>
            <section className="px-6 py-10">
              <h2 className="heading-playfair text-xl md:text-2xl mb-3 text-center">Lista de espera</h2>
              <p className="body-inter text-sm text-center opacity-80 mb-6">
                Se você quer ser avisada quando abrirem novas turmas/edições, cadastre seu contato. Eu vou te chamar assim que houver abertura.
              </p>
              <Tabs defaultValue="dsl" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="dsl" className="text-xs">Mentoria DSL</TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs">Revoluz Experience</TabsTrigger>
                </TabsList>
                <TabsContent value="dsl">
                  <button onClick={() => openWaitlist("MENTORIA_DSL")} className="btn-gold w-full text-sm py-4">
                    PREENCHER FORMULÁRIO — MENTORIA DSL
                    <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </TabsContent>
                <TabsContent value="experience">
                  <button onClick={() => openWaitlist("REVOLUZ_EXPERIENCE")} className="btn-gold w-full text-sm py-4">
                    PREENCHER FORMULÁRIO — EXPERIENCE
                    <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </ScrollReveal>

        {/* CTA FINAL */}
        <ScrollReveal>
          <section className="section-red px-6 py-10 text-center">
            <h2 className="heading-playfair text-xl md:text-2xl mb-4">Comece sua transformação hoje</h2>
            <p className="body-inter text-sm mb-6 opacity-90">
              A transformação começa com uma decisão. Se você sente que esse é o seu tempo, comece pelo Método REVOLUZ — acesso imediato, e você tem 7 dias para testar sem risco.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <a href={REVOLUZ_URL} target="_blank" rel="noopener noreferrer" className="btn-orange w-full text-center text-sm py-4 block">
                GARANTA SUA VAGA NO REVOLUZ
                <ArrowRight className="w-4 h-4 inline ml-1" />
              </a>
              <button onClick={scrollToWaitlist} className="text-sm underline opacity-80 hover:opacity-100 transition-opacity text-white">
                Entrar na lista de espera
              </button>
            </div>
            <p className="body-inter text-xs mt-6 italic opacity-70">
              "Não é sobre ser perfeita — é sobre viver com presença."
            </p>
          </section>
        </ScrollReveal>

        {/* Spacer for sticky CTA */}
        <div className="h-20 md:hidden" />

        {/* Sticky CTA mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-border/30 px-4 py-3 flex items-center gap-2">
          <a href={REVOLUZ_URL} target="_blank" rel="noopener noreferrer" className="btn-orange flex-1 text-center text-xs py-3">
            ENTRAR NO REVOLUZ
            <ArrowRight className="w-3 h-3 inline ml-1" />
          </a>
          <button onClick={scrollToWaitlist} className="text-xs text-primary underline whitespace-nowrap px-2">
            Lista de espera
          </button>
        </div>
      </div>

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} product={waitlistProduct} />
    </div>
  );
}

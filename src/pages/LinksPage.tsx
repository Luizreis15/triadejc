import "@/styles/sales-page.css";
import { ScrollReveal } from "@/components/sales";
import { StaggerContainer, StaggerItem } from "@/components/sales/StaggerContainer";
import { TextReveal } from "@/components/sales/TextReveal";
import { BackToTopButton } from "@/components/institutional/BackToTopButton";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Mic, Instagram, Youtube, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import heroImg from "@/assets/jordana-hero.jpg";
import aboutImg from "@/assets/jordana-about.jpg";
import logoJornadaUnica from "@/assets/logo-jornada-unica.png";

const ease21st = [0.22, 1, 0.36, 1] as const;

type LinkVariant = "orange" | "gold" | "outline";

interface LinkCard {
  title: string;
  description: string;
  href: string;
  external?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  variant: LinkVariant;
}

const JORNADA_UNICA_HREF = "/jornada";

const linkCards: LinkCard[] = [
  {
    title: "Terapia Individual",
    description: "Atendimento online e personalizado com Jordana.",
    href: "https://api.whatsapp.com/send?phone=5511988396576&text=Ol%C3%A1%2C%20gostaria%20de%20saber%20como%20funciona%20para%20marcar%20Terapia%20com%20a%20Jordana%3F",
    external: true,
    icon: Heart,
    variant: "outline",
  },
  {
    title: "Agendas e Palestras",
    description: "Convites para pregações, palestras e eventos.",
    href: "https://wa.link/z8p2f9",
    external: true,
    icon: Mic,
    variant: "outline",
  },
  {
    title: "YouTube",
    description: "Mensagens e ensinos em vídeo.",
    href: "https://youtube.com/@jordanacantarelli",
    external: true,
    icon: Youtube,
    variant: "outline",
  },
];

function JornadaUnicaFeatured() {
  return (
    <StaggerItem>
      <Link to={JORNADA_UNICA_HREF} className="block" aria-label="Conhecer a Jornada Única">
        <motion.div
          className="relative overflow-hidden rounded-2xl p-6 text-center"
          style={{
            background: "linear-gradient(160deg, hsl(var(--sp-cream)) 0%, hsl(var(--sp-paper)) 100%)",
            boxShadow: "0 18px 40px -14px hsl(var(--sp-rose) / 0.45)",
            border: "2px solid hsl(var(--sp-rose)/0.7)",
          }}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3, ease: ease21st }}
        >
          {/* brilho suave de fundo */}
          <motion.div
            aria-hidden
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--sp-rose)/0.25) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <span
            className="relative inline-flex items-center gap-1.5 body-inter text-[10px] font-semibold tracking-widest uppercase py-1.5 px-3 rounded-full mb-4"
            style={{ background: "hsl(var(--sp-rose))", color: "white" }}
          >
            <Sparkles className="w-3 h-3" />
            Comece por aqui
          </span>

          <img
            src={logoJornadaUnica}
            alt="Jornada Única"
            className="relative mx-auto h-24 w-auto object-contain mb-2 mix-blend-multiply"
          />

          <h2 className="sr-only">
            Jornada Única
          </h2>
          <p className="relative body-inter text-sm leading-relaxed mb-4" style={{ color: "hsl(var(--sp-text-dark)/0.8)" }}>
            3 sessões de jornada guiada para organizar o que está por dentro e viver sua fé com calma e presença.
          </p>

          <div className="relative flex flex-wrap justify-center gap-2 mb-5">
            {["3 sessões guiadas", "Acesso imediato", "7 dias de garantia"].map((item) => (
              <span
                key={item}
                className="body-inter text-[11px] py-1 px-2.5 rounded-full border"
                style={{ borderColor: "hsl(var(--sp-petrol-primary)/0.25)", color: "hsl(var(--sp-petrol-primary))" }}
              >
                {item}
              </span>
            ))}
          </div>

          <span className="relative btn-gold w-full justify-center inline-flex py-4 text-sm">
            Quero começar minha jornada
            <ArrowRight className="w-5 h-5" />
          </span>
        </motion.div>
      </Link>
    </StaggerItem>
  );
}

const floatingTags = ["Fé", "Autoconhecimento", "Inteligência Emocional", "Reprogramação"];

const stats = [
  { value: "+ 10 anos", label: "Experiência clínica" },
  { value: "Pastora", label: "Lagoinha Morumbi" },
  { value: "Psicanalista", label: "Terapeuta cristã" },
  { value: "Jornada Única", label: "Experiência guiada" },
];

function LinkCardItem({ card, index }: { card: LinkCard; index: number }) {
  const Icon = card.icon;
  const variantBtn =
    card.variant === "orange"
      ? "btn-orange"
      : card.variant === "gold"
      ? "btn-gold"
      : "border-2 hover:bg-[hsl(var(--sp-petrol-primary)/0.05)]";

  const variantStyle =
    card.variant === "outline"
      ? {
          borderColor: "hsl(var(--sp-petrol-primary))",
          color: "hsl(var(--sp-petrol-primary))",
          background: "transparent",
        }
      : undefined;

  const content = (
    <motion.div
      className="card-cream w-full p-4 flex items-center gap-4 cursor-pointer group"
      whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 40px -12px hsl(var(--sp-petrol-primary) / 0.18)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: ease21st }}
    >
      <div
        className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
        style={{
          background: "hsl(var(--sp-petrol-primary))",
          color: "hsl(var(--sp-cream))",
        }}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="heading-playfair text-base mb-0.5" style={{ color: "hsl(var(--sp-petrol-primary))" }}>
          {card.title}
        </h3>
        <p className="body-inter text-xs leading-snug" style={{ color: "hsl(var(--sp-text-dark)/0.7)" }}>
          {card.description}
        </p>
      </div>
      <ArrowRight
        className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1"
        style={{ color: "hsl(var(--sp-petrol-primary))" }}
      />
    </motion.div>
  );

  return (
    <StaggerItem>
      {card.external ? (
        <a href={card.href} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      ) : (
        <Link to={card.href} className="block">
          {content}
        </Link>
      )}
      {/* hidden semantic btn classes to keep variants referenced */}
      <span className={`hidden ${variantBtn}`} style={variantStyle} />
    </StaggerItem>
  );
}

export default function LinksPage() {
  return (
    <div className="sales-page">
      <div className="sales-container relative">
        {/* ─── HERO — Foto protagonista com overlay dissolvente ─── */}
        <section
          className="relative w-full overflow-hidden"
          style={{
            minHeight: "560px",
            background: "hsl(var(--sp-petrol-primary))",
          }}
        >
          {/* Foto de fundo — protagonista */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: ease21st }}
          >
            <motion.img
              src={heroImg}
              alt="Jordana Cantarelli"
              className="absolute inset-0 w-full h-full object-cover object-top"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Overlay topo — escurece para legibilidade do monograma */}
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--sp-petrol-primary)/0.75) 0%, hsl(var(--sp-petrol-primary)/0.2) 60%, transparent 100%)",
            }}
          />

          {/* Vinheta lateral sutil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, hsl(var(--sp-rose)/0.08) 100%)",
            }}
          />

          {/* Overlay base — dissolve foto na cor da seção seguinte (sp-paper) */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{
              height: "42%",
              background:
                "linear-gradient(to top, hsl(var(--sp-paper)) 0%, hsl(var(--sp-paper)/0.92) 35%, hsl(var(--sp-paper)/0.5) 70%, transparent 100%)",
            }}
          />


          {/* Tags flutuantes orbitando */}
          {floatingTags.map((tag, i) => {
            // Foto object-top: rosto ocupa ~10-45% centro. Tags ficam nas bordas laterais.
            const positions = [
              { top: "10%", right: "5%" },   // Fé — topo direito, próximo ao monograma
              { top: "46%", left: "3%" },    // Autoconhecimento — meio esquerda
              { top: "58%", right: "4%" },   // Inteligência Emocional — abaixo do rosto, direita
              { top: "32%", right: "4%" },   // Reprogramação — direita média
            ];
            return (
              <motion.span
                key={tag}
                className="absolute body-inter text-[10px] font-medium py-1.5 px-3 rounded-full border backdrop-blur-md z-10"
                style={{
                  ...positions[i],
                  borderColor: "hsl(var(--sp-rose)/0.6)",
                  color: "hsl(var(--sp-cream))",
                  background: "hsl(var(--sp-petrol-primary)/0.35)",
                  boxShadow: "0 4px 12px hsl(0 0% 0% / 0.15)",
                }}
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                transition={{
                  opacity: { delay: 0.5 + i * 0.15, duration: 0.7, ease: ease21st },
                  scale: { delay: 0.5 + i * 0.15, duration: 0.7, ease: ease21st },
                  y: { delay: 0.8 + i * 0.2, duration: 3.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {tag}
              </motion.span>
            );
          })}

          {/* Bloco de texto — sobre a base dissolvida */}
          <div className="absolute bottom-0 inset-x-0 px-6 pb-6 pt-12 z-10 text-center">
            <TextReveal as="h1" className="heading-playfair text-4xl sm:text-5xl mb-3 leading-tight">
              <span style={{ color: "hsl(var(--sp-petrol-primary))" }}>Jordana Cantarelli</span>
            </TextReveal>

            <ScrollReveal delay={0.15} blur>
              <div className="flex justify-center mb-3">
                <span
                  className="inline-block body-inter text-[10px] tracking-widest uppercase py-1.5 px-3 rounded-full border"
                  style={{
                    borderColor: "hsl(var(--sp-rose)/0.6)",
                    color: "hsl(var(--sp-petrol-primary))",
                    background: "hsl(var(--sp-cream)/0.5)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  Pastora · Psicanalista · Terapeuta Cristã
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25} blur>
              <p
                className="body-inter text-sm italic"
                style={{ color: "hsl(var(--sp-petrol-primary)/0.75)" }}
              >
                Com fé, clareza e presença.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── ÁRVORE DE LINKS ─── */}
        <section className="px-6 pt-2 pb-8" style={{ background: "hsl(var(--sp-paper))" }}>
          <ScrollReveal blur>
            <p className="text-center body-inter text-xs tracking-widest uppercase mb-5" style={{ color: "hsl(var(--sp-petrol-primary)/0.6)" }}>
              Escolha por onde começar
            </p>
          </ScrollReveal>

          <StaggerContainer className="space-y-3" staggerDelay={0.08}>
            <JornadaUnicaFeatured />
            {linkCards.map((card, i) => (
              <LinkCardItem key={card.title} card={card} index={i} />
            ))}
          </StaggerContainer>
        </section>

        {/* ─── QUEM É JORDANA ─── */}
        <section className="px-6 py-10" style={{ background: "hsl(var(--sp-paper))" }}>
          <ScrollReveal scale blur>
            <motion.div
              className="relative rounded-2xl overflow-hidden mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, ease: ease21st }}
            >
              <img
                src={aboutImg}
                alt="Jordana Cantarelli"
                className="w-full aspect-[4/5] object-cover object-top"
              />
              <div
                className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md"
                style={{
                  background: "linear-gradient(to top, hsl(var(--sp-petrol-primary)/0.9), hsl(var(--sp-petrol-primary)/0.5))",
                }}
              >
                <h3 className="heading-playfair text-lg" style={{ color: "hsl(var(--sp-cream))" }}>
                  Jordana Cantarelli
                </h3>
                <p className="body-inter text-xs" style={{ color: "hsl(var(--sp-cream)/0.8)" }}>
                  Pastora · Psicanalista · Terapeuta cristã
                </p>
              </div>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal blur>
            <div className="flex justify-center mb-4">
              <span
                className="inline-block body-inter text-[10px] tracking-widest uppercase py-1.5 px-3 rounded-full border"
                style={{
                  borderColor: "hsl(var(--sp-rose)/0.5)",
                  color: "hsl(var(--sp-petrol-primary))",
                }}
              >
                Conheça a especialista
              </span>
            </div>
          </ScrollReveal>

          <TextReveal as="h2" className="heading-playfair text-2xl text-center mb-4">
            Quem é{" "}
            <em style={{ color: "hsl(var(--sp-rose))", fontStyle: "italic" }}>Jordana Cantarelli</em>
          </TextReveal>

          <ScrollReveal blur delay={0.15}>
            <p className="body-inter text-sm leading-relaxed mb-6 text-center" style={{ color: "hsl(var(--sp-text-dark)/0.8)" }}>
              Pastora da Lagoinha Morumbi, psicanalista clínica e terapeuta cristã, com mais de 10 anos de experiência. Ela une fé, sensibilidade humana e ciência emocional para guiar mulheres que desejam viver sua fé com calma interior e organização emocional prática.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 gap-3 mb-6" staggerDelay={0.1}>
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <motion.div
                  className="card-cream p-4 h-full"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3, ease: ease21st }}
                >
                  <p className="heading-playfair text-lg mb-1" style={{ color: "hsl(var(--sp-petrol-primary))" }}>
                    {s.value}
                  </p>
                  <p className="body-inter text-xs" style={{ color: "hsl(var(--sp-text-dark)/0.7)" }}>
                    {s.label}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal scale blur delay={0.2}>
            <motion.div
              className="card-cream p-5 border-2"
              style={{ borderColor: "hsl(var(--sp-rose)/0.4)" }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4, ease: ease21st }}
            >
              <p className="body-inter text-sm italic leading-relaxed mb-2" style={{ color: "hsl(var(--sp-petrol-primary))" }}>
                "Sua paz interna merece uma chance — sem risco, sem pressão."
              </p>
              <p className="body-inter text-xs" style={{ color: "hsl(var(--sp-text-dark)/0.6)" }}>
                — Jordana Cantarelli
              </p>
            </motion.div>
          </ScrollReveal>

          {/* CTA Instagram */}
          <ScrollReveal blur delay={0.3}>
            <a
              href="https://instagram.com/jordanacantarelli"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 btn-gold py-4 px-8 text-sm w-full justify-center inline-flex"
            >
              <Instagram className="w-5 h-5" />
              Conheça a Jordana
              <ArrowRight className="w-5 h-5" />
            </a>
          </ScrollReveal>
        </section>

        {/* ─── FOOTER ─── */}
        <footer
          className="px-6 py-8 text-center"
          style={{ background: "hsl(var(--sp-petrol-primary))" }}
        >
          <div className="flex justify-center gap-4 mb-3 body-inter text-xs" style={{ color: "hsl(var(--sp-cream)/0.8)" }}>
            <Link to="/">Início</Link>
            <Link to="/jornadas">Jornadas</Link>
            <Link to="/contato">Contato</Link>
          </div>
          <p className="body-inter text-[11px]" style={{ color: "hsl(var(--sp-cream)/0.6)" }}>
            © 2026 Jordana Cantarelli · Com fé, clareza e presença.
          </p>
        </footer>

        <BackToTopButton />
      </div>
    </div>
  );
}

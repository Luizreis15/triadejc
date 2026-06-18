import "@/styles/sales-page.css";
import { ScrollReveal } from "@/components/sales";
import { StaggerContainer, StaggerItem } from "@/components/sales/StaggerContainer";
import { TextReveal } from "@/components/sales/TextReveal";
import { BackToTopButton } from "@/components/institutional/BackToTopButton";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Heart, Mic, Instagram, Youtube, Globe, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import heroImg from "@/assets/jordana-hero.jpg";
import aboutImg from "@/assets/jordana-about.jpg";

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

const linkCards: LinkCard[] = [
  {
    title: "Sessão Individual",
    description: "Atendimento personalizado com Jordana.",
    href: "https://wa.link/z8p2f9",
    external: true,
    icon: Heart,
    variant: "gold",
  },
  {
    title: "Jornadas",
    description: "Conteúdos e trilhas para sua transformação.",
    href: "/jornadas",
    icon: BookOpen,
    variant: "gold",
  },
  {
    title: "Método REVOLUZ",
    description: "Organize o que está por dentro e viva com propósito.",
    href: "/revoluz",
    icon: Sparkles,
    variant: "orange",
  },
  {
    title: "Enviar convite",
    description: "Pregações, palestras e eventos.",
    href: "https://wa.link/z8p2f9",
    external: true,
    icon: Mic,
    variant: "outline",
  },
  {
    title: "Instagram",
    description: "@jordanacantarelli",
    href: "https://instagram.com/jordanacantarelli",
    external: true,
    icon: Instagram,
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
  {
    title: "Site oficial",
    description: "jordanacantarelli.com.br",
    href: "https://jordanacantarelli.com.br/",
    external: true,
    icon: Globe,
    variant: "outline",
  },
];

const floatingTags = ["Fé", "Autoconhecimento", "Inteligência Emocional", "Reprogramação"];

const stats = [
  { value: "+ 10 anos", label: "Experiência clínica" },
  { value: "Pastora", label: "Lagoinha Morumbi" },
  { value: "Psicanalista", label: "Terapeuta cristã" },
  { value: "REVOLUZ", label: "Método autoral" },
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
        {/* ─── TOPO IDENTIDADE ─── */}
        <section
          className="relative px-6 pt-10 pb-8 text-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at top, hsl(var(--sp-petrol-primary)) 0%, hsl(var(--sp-petrol-primary)/0.92) 60%, hsl(var(--sp-petrol-primary)/0.85) 100%)",
          }}
        >
          {/* Tags flutuantes */}
          <div className="relative h-24 mb-2">
            {floatingTags.map((tag, i) => {
              const positions = [
                { top: "0%", left: "8%" },
                { top: "10%", right: "6%" },
                { top: "55%", left: "4%" },
                { top: "60%", right: "10%" },
              ];
              return (
                <motion.span
                  key={tag}
                  className="absolute body-inter text-[10px] font-medium py-1.5 px-3 rounded-full border backdrop-blur-sm"
                  style={{
                    ...positions[i],
                    borderColor: "hsl(var(--sp-rose)/0.5)",
                    color: "hsl(var(--sp-cream))",
                    background: "hsl(var(--sp-petrol-primary)/0.4)",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: 0.3 + i * 0.15, duration: 0.6, ease: ease21st },
                    scale: { delay: 0.3 + i * 0.15, duration: 0.6, ease: ease21st },
                    y: { delay: 0.6 + i * 0.2, duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  {tag}
                </motion.span>
              );
            })}

            {/* Monograma JC */}
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "hsl(var(--sp-cream))",
                color: "hsl(var(--sp-petrol-primary))",
                boxShadow: "0 0 30px hsl(var(--sp-rose)/0.3)",
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: ease21st, delay: 0.2 }}
            >
              <span className="heading-playfair text-lg italic">JC</span>
            </motion.div>
          </div>

          {/* Foto circular */}
          <ScrollReveal scale blur>
            <motion.div
              className="relative mx-auto mb-5 w-36 h-36 rounded-full overflow-hidden"
              style={{
                boxShadow: "0 0 0 4px hsl(var(--sp-cream)), 0 0 0 6px hsl(var(--sp-rose)/0.6), 0 20px 40px -10px hsl(0 0% 0% / 0.4)",
              }}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: ease21st, delay: 0.4 }}
            >
              <img src={heroImg} alt="Jordana Cantarelli" className="w-full h-full object-cover object-top" />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: "0 0 0 2px hsl(var(--sp-rose)/0.4)" }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </ScrollReveal>

          <TextReveal as="h1" className="heading-playfair text-3xl mb-2" >
            <span style={{ color: "hsl(var(--sp-cream))" }}>Jordana Cantarelli</span>
          </TextReveal>

          <ScrollReveal delay={0.15} blur>
            <p className="body-inter text-xs tracking-wider uppercase mb-3" style={{ color: "hsl(var(--sp-rose))" }}>
              Pastora · Psicanalista · Terapeuta Cristã
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.25} blur>
            <p className="body-inter text-sm italic" style={{ color: "hsl(var(--sp-cream)/0.8)" }}>
              Com fé, clareza e presença.
            </p>
          </ScrollReveal>
        </section>

        {/* ─── ÁRVORE DE LINKS ─── */}
        <section className="px-6 py-8" style={{ background: "hsl(var(--sp-paper))" }}>
          <ScrollReveal blur>
            <p className="text-center body-inter text-xs tracking-widest uppercase mb-6" style={{ color: "hsl(var(--sp-petrol-primary)/0.6)" }}>
              Escolha por onde começar
            </p>
          </ScrollReveal>

          <StaggerContainer className="space-y-3" staggerDelay={0.08}>
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
                  Pastora · Fundadora do Método REVOLUZ
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

          {/* CTA WhatsApp */}
          <ScrollReveal blur delay={0.3}>
            <a
              href="https://wa.link/z8p2f9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 btn-gold py-4 px-8 text-sm w-full justify-center inline-flex"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com Maria
              <ArrowRight className="w-5 h-5" />
            </a>
          </ScrollReveal>
        </section>

        {/* ─── FOOTER ─── */}
        <footer
          className="px-6 py-8 text-center"
          style={{ background: "hsl(var(--sp-petrol-primary))" }}
        >
          <div
            className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: "hsl(var(--sp-cream))", color: "hsl(var(--sp-petrol-primary))" }}
          >
            <span className="heading-playfair text-sm italic">JC</span>
          </div>
          <div className="flex justify-center gap-4 mb-3 body-inter text-xs" style={{ color: "hsl(var(--sp-cream)/0.8)" }}>
            <Link to="/">Início</Link>
            <Link to="/jornadas">Jornadas</Link>
            <Link to="/revoluz">Revoluz</Link>
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

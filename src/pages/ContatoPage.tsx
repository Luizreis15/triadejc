import "@/styles/sales-page.css";
import { useState } from "react";
import { InstitutionalHeader } from "@/components/institutional/InstitutionalHeader";
import { InstitutionalFooter } from "@/components/institutional/InstitutionalFooter";
import { BackToTopButton } from "@/components/institutional/BackToTopButton";
import { ScrollReveal } from "@/components/sales/ScrollReveal";
import { ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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

// ── Convites ──
function ConvitesForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    const { error } = await supabase.from("leads_contato" as any).insert({
      tipo: "CONVITE",
      nome: data.get("nome") as string,
      email: data.get("email") as string,
      whatsapp: data.get("whatsapp") as string,
      igreja_organizacao: data.get("igreja") as string,
      cidade: data.get("cidade") as string,
      estado: data.get("estado") as string,
      data_evento: data.get("data_evento") as string,
      tipo_evento: data.get("tipo_evento") as string,
      tema: data.get("tema") as string,
      mensagem: data.get("mensagem") as string,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: "Confira seu e-mail e WhatsApp e tente novamente.", variant: "destructive" });
    } else {
      setSuccess(true);
      form.reset();
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
        <p className="font-['Playfair_Display'] text-xl font-semibold text-foreground mb-2">Recebido!</p>
        <p className="font-['Poppins'] text-sm text-muted-foreground">Nossa equipe retornará em horário comercial.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-[600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="nome" placeholder="Nome *" required className="bg-card" />
        <Input name="email" type="email" placeholder="E-mail *" required className="bg-card" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="whatsapp" placeholder="WhatsApp *" required className="bg-card" />
        <Input name="igreja" placeholder="Igreja / Organização" className="bg-card" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="cidade" placeholder="Cidade" className="bg-card" />
        <Input name="estado" placeholder="Estado" className="bg-card" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="data_evento" placeholder="Data / Período do evento" className="bg-card" />
        <select name="tipo_evento" className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-['Poppins'] text-muted-foreground">
          <option value="">Tipo de evento</option>
          <option value="pregacao">Pregação</option>
          <option value="palestra">Palestra</option>
          <option value="workshop">Workshop</option>
          <option value="retiro">Retiro</option>
        </select>
      </div>
      <Input name="tema" placeholder="Tema desejado" className="bg-card" />
      <Textarea name="mensagem" placeholder="Mensagem" rows={4} className="bg-card" />
      <p className="font-['Poppins'] text-xs text-muted-foreground italic text-center">
        Quanto mais detalhes, melhor para retornarmos com clareza.
      </p>
      <button type="submit" disabled={loading} className="btn-gold py-4 px-8 text-sm w-full disabled:opacity-50">
        {loading ? "Enviando..." : "Enviar convite"} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

// ── Lista de Espera ──
function ListaEsperaForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState("MENTORIA_DSL");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    const { error } = await supabase.from("leads_contato" as any).insert({
      tipo: "LISTA_ESPERA",
      produto_interesse: tab,
      nome: data.get("nome") as string,
      email: data.get("email") as string,
      whatsapp: data.get("whatsapp") as string,
      cidade: data.get("cidade") as string,
      estado: data.get("estado") as string,
      mensagem: data.get("desafio") as string,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: "Confira seu e-mail e WhatsApp e tente novamente.", variant: "destructive" });
    } else {
      setSuccess(true);
      form.reset();
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
        <p className="font-['Playfair_Display'] text-xl font-semibold text-foreground mb-2">Cadastro recebido!</p>
        <p className="font-['Poppins'] text-sm text-muted-foreground">Você será avisada quando houver abertura.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto">
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="w-full">
          <TabsTrigger value="MENTORIA_DSL" className="flex-1 font-['Poppins'] text-xs">Mentoria DSL</TabsTrigger>
          <TabsTrigger value="REVOLUZ_EXPERIENCE" className="flex-1 font-['Poppins'] text-xs">Revoluz Experience</TabsTrigger>
        </TabsList>
      </Tabs>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="nome" placeholder="Nome *" required className="bg-card" />
          <Input name="email" type="email" placeholder="E-mail *" required className="bg-card" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="whatsapp" placeholder="WhatsApp *" required className="bg-card" />
          <Input name="cidade" placeholder="Cidade / Estado (opcional)" className="bg-card" />
        </div>
        <Textarea name="desafio" placeholder="Qual seu principal desafio?" rows={3} className="bg-card" />
        <button type="submit" disabled={loading} className="btn-gold py-4 px-8 text-sm w-full disabled:opacity-50">
          {loading ? "Enviando..." : "Entrar na lista de espera"} <ArrowRight className="w-4 h-4" />
        </button>
        <p className="font-['Poppins'] text-xs text-muted-foreground text-center">
          Seus dados ficam protegidos. Usaremos apenas para avisar sobre abertura de vagas.
        </p>
      </form>
    </div>
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
            <button
              onClick={() => scrollToSection("lista-espera")}
              className="font-['Poppins'] text-xs font-semibold py-2 px-4 rounded-full border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors"
            >
              Lista de espera
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
            </ScrollReveal>
            <ConvitesForm />
          </div>
        </section>

        {/* Lista de Espera */}
        <section id="lista-espera" className="py-16 px-6 md:px-8 scroll-mt-20">
          <div className="max-w-[1200px] mx-auto">
            <ScrollReveal>
              <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-semibold text-foreground text-center mb-3">
                Lista de Espera
              </h2>
              <p className="font-['Poppins'] text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
                Cadastre-se para ser avisada quando houver abertura de vagas.
              </p>
            </ScrollReveal>
            <ListaEsperaForm />
          </div>
        </section>
      </main>
      <InstitutionalFooter />
      <BackToTopButton />
    </div>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: "MENTORIA_DSL" | "REVOLUZ_EXPERIENCE";
}

export function WaitlistModal({ open, onOpenChange, product }: WaitlistModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    city: "",
    state: "",
    main_challenge: "",
    goal: "",
    availability: "",
  });

  const title = product === "MENTORIA_DSL" ? "Mentoria DSL" : "Revoluz Experience";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.whatsapp || !form.main_challenge) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("waitlist_leads" as any).insert([
      {
        product,
        name: form.name.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        main_challenge: form.main_challenge.trim(),
        goal: form.goal.trim() || null,
        availability: form.availability || null,
      },
    ]);
    setLoading(false);

    if (error) {
      toast.error("Erro ao enviar. Tente novamente.");
      return;
    }

    toast.success("Cadastro recebido! Quando abrir, eu aviso você.");
    setForm({ name: "", email: "", whatsapp: "", city: "", state: "", main_challenge: "", goal: "", availability: "" });
    onOpenChange(false);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Lista de Espera — {title}</DialogTitle>
          <DialogDescription>Preencha seus dados e eu aviso quando abrir.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="wl-name">Nome *</Label>
            <Input id="wl-name" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={100} required />
          </div>
          <div>
            <Label htmlFor="wl-email">E-mail *</Label>
            <Input id="wl-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} required />
          </div>
          <div>
            <Label htmlFor="wl-whatsapp">WhatsApp *</Label>
            <Input id="wl-whatsapp" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="(00) 00000-0000" maxLength={20} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wl-city">Cidade</Label>
              <Input id="wl-city" value={form.city} onChange={(e) => update("city", e.target.value)} maxLength={100} />
            </div>
            <div>
              <Label htmlFor="wl-state">Estado</Label>
              <Input id="wl-state" value={form.state} onChange={(e) => update("state", e.target.value)} maxLength={2} placeholder="SP" />
            </div>
          </div>
          <div>
            <Label htmlFor="wl-challenge">Qual é o seu maior desafio hoje? *</Label>
            <Textarea id="wl-challenge" value={form.main_challenge} onChange={(e) => update("main_challenge", e.target.value)} maxLength={1000} required rows={3} />
          </div>
          <div>
            <Label htmlFor="wl-goal">O que você quer destravar nessa próxima fase?</Label>
            <Textarea id="wl-goal" value={form.goal} onChange={(e) => update("goal", e.target.value)} maxLength={1000} rows={2} />
          </div>
          <div>
            <Label>
              {product === "MENTORIA_DSL" ? "Você prefere manhã, tarde ou noite?" : "Você teria disponibilidade para viajar?"}
            </Label>
            <Select value={form.availability} onValueChange={(v) => update("availability", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {product === "MENTORIA_DSL" ? (
                  <>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="talvez">Talvez</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar cadastro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

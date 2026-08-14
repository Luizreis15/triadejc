import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import logoJornadaUnica from "@/assets/logo-jornada-unica.png";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutUrl: string;
  price?: number;
}

export function LeadCaptureModal({ open, onOpenChange, checkoutUrl, price = 97 }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = leadSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LeadFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof LeadFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    // Open the tab synchronously, still inside the click's event handler,
    // so browsers don't treat it as a blocked popup once we start awaiting below.
    const checkoutWindow = window.open("", "_blank");

    try {
      // Save lead to database
      const { error } = await supabase.from("leads").insert({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        source: "landing-page",
        status: "novo",
      });

      if (error) {
        console.error("Error saving lead:", error);
        // Continue anyway - don't block the user from checkout
      }

      // Track Meta Pixel events
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_name: "Jornada Única - Lead Capture",
          currency: "BRL",
          value: 0,
        });
        (window as any).fbq("track", "InitiateCheckout", {
          content_name: "Jornada Única - Jordana Cantarelli",
          currency: "BRL",
          value: price,
        });
      }

      // Build checkout URL with pre-filled data
      const params = new URLSearchParams();
      params.set("name", result.data.name);
      params.set("email", result.data.email);
      if (result.data.phone) {
        params.set("phone", result.data.phone.replace(/\D/g, ""));
      }

      const finalUrl = `${checkoutUrl}?${params.toString()}`;

      if (checkoutWindow) {
        checkoutWindow.opener = null;
        checkoutWindow.location.href = finalUrl;
      } else {
        // Popup was blocked despite the synchronous open (rare) — fall back to same-tab navigation.
        window.location.href = finalUrl;
      }

      onOpenChange(false);
      setFormData({ name: "", email: "", phone: "" });
    } catch (err) {
      console.error("Error in lead capture:", err);
      checkoutWindow?.close();
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-0 bg-[hsl(30_20%_97%)] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center">
          <img
            src={logoJornadaUnica}
            alt="Jornada Única"
            className="h-12 mx-auto mb-4"
          />
          <h2
            className="heading-playfair text-xl mb-2"
            style={{ color: "hsl(195 52% 23%)" }}
          >
            Comece sua Jornada Única
          </h2>
          <p className="body-inter text-sm opacity-70">
            Preencha seus dados para continuar com a compra
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="body-inter text-sm">
              Nome completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white border-[hsl(350_30%_58%/0.3)] focus:border-[hsl(350_30%_58%)] focus:ring-[hsl(350_30%_58%/0.2)]"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="body-inter text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-white border-[hsl(350_30%_58%/0.3)] focus:border-[hsl(350_30%_58%)] focus:ring-[hsl(350_30%_58%/0.2)]"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="body-inter text-sm">
              Telefone <span className="opacity-50">(opcional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="bg-white border-[hsl(350_30%_58%/0.3)] focus:border-[hsl(350_30%_58%)] focus:ring-[hsl(350_30%_58%/0.2)]"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold bg-[hsl(25_80%_55%)] hover:bg-[hsl(25_80%_50%)] text-white shadow-lg"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continuar para Pagamento
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 pt-2 text-xs opacity-60">
            <Lock className="w-3 h-3" />
            <span className="body-inter">
              Seus dados estão seguros e serão usados apenas para sua compra.
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

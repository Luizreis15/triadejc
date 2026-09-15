import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

type AccessDisabledVariant = "inactive" | "no_entitlement";

interface AccessDisabledProps {
  variant?: AccessDisabledVariant;
}

export function AccessDisabled({ variant = "inactive" }: AccessDisabledProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/membros", { replace: true });
  };

  const title = variant === "no_entitlement" ? "Acesso indisponível" : "Acesso desativado";
  const body =
    variant === "no_entitlement"
      ? "Não encontramos uma compra ativa da Jornada Única nesta conta. Se você já pagou, fale com o suporte para liberar o acesso."
      : "Sua conta está temporariamente desativada. Se você já comprou a Jornada Única, fale com o suporte para reativar o acesso.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-serif text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{body}</p>
        <p className="text-sm text-muted-foreground">
          <a href="mailto:info@jordanacantarelli.com.br" className="underline">
            info@jordanacantarelli.com.br
          </a>
        </p>
        <Button type="button" variant="outline" onClick={handleSignOut}>
          Sair
        </Button>
      </div>
    </div>
  );
}

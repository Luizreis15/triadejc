import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function AccessDisabled() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/membros", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-serif text-foreground">Acesso desativado</h1>
        <p className="text-sm text-muted-foreground">
          Sua conta está temporariamente desativada. Se você já comprou a Jornada
          Única, fale com o suporte para reativar o acesso.
        </p>
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

import { useNavigate, useLocation } from "react-router-dom";
import { Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminRole } from "@/hooks/useAdminRole";

export function ViewSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isLoading } = useAdminRole();

  // Don't show if not admin or still loading
  if (isLoading || !isAdmin) return null;

  const isInAdminArea = location.pathname.startsWith("/admin");

  const handleSwitch = () => {
    if (isInAdminArea) {
      navigate("/membrosvmcm/app");
    } else {
      navigate("/admin");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSwitch}
      className="gap-2"
    >
      {isInAdminArea ? (
        <>
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Ver como Membro</span>
        </>
      ) : (
        <>
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Painel Admin</span>
        </>
      )}
    </Button>
  );
}

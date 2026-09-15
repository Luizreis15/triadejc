import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AccessDisabled } from "@/components/AccessDisabled";
import { useMemberAccess } from "@/hooks/useMemberAccess";

interface ProtectedRouteProps {
  children: ReactNode;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, authLoading, accessLoading, isActive, hasEntitlement, accessError, refetch } =
    useMemberAccess();

  if (authLoading || accessLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/membros" replace />;
  }

  if (accessError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Não foi possível confirmar o status da sua conta. Tente de novo.
          </p>
          <button
            type="button"
            className="text-sm underline text-primary"
            onClick={() => refetch()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return <AccessDisabled variant="inactive" />;
  }

  if (!hasEntitlement) {
    return <AccessDisabled variant="no_entitlement" />;
  }

  return <>{children}</>;
}

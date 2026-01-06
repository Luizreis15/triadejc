import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SubdomainRouterProps {
  children: ReactNode;
}

export function SubdomainRouter({ children }: SubdomainRouterProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hostname = window.location.hostname;
    const isRoot = location.pathname === "/";

    // Detectar subdomínio
    if (hostname.startsWith("vmcm.") && isRoot) {
      // Subdomínio de vendas - redirecionar para página de vendas
      navigate("/vendas", { replace: true });
    }
    // membros.* ou qualquer outro vai para login (rota padrão "/")
  }, [location.pathname, navigate]);

  return <>{children}</>;
}

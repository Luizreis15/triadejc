import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logoJornadaUnica from "@/assets/logo-jornada-unica.png";

/** Link curto do WhatsApp (/a/<código>): troca o código pelo token e segue para criar a senha. */
export default function AccessLink() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const redeem = async () => {
      const { data, error } = await supabase.rpc("redeem_access_link", { _code: code });
      const row = Array.isArray(data) ? data[0] : null;
      if (!active) return;
      if (error || !row?.token_hash) {
        setFailed(true);
        return;
      }
      const params = new URLSearchParams({ token_hash: row.token_hash, type: row.link_type });
      navigate(`/membros/reset-password?${params.toString()}`, { replace: true });
    };
    void redeem();
    return () => {
      active = false;
    };
  }, [code, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0E2D2] px-6 text-center">
      <img src={logoJornadaUnica} alt="Jornada Única" className="mb-8 h-24" />
      {failed ? (
        <div className="max-w-sm space-y-4">
          <h1 className="font-serif text-xl font-semibold text-[#253244]">Este link não vale mais</h1>
          <p className="text-sm text-muted-foreground">
            Peça um novo link de acesso, ou crie sua senha pelo e-mail da compra.
          </p>
          <Link to="/membros/reset-password" className="inline-block text-sm font-medium text-primary hover:underline">
            Receber um novo link por e-mail
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Abrindo seu acesso...</p>
      )}
    </div>
  );
}

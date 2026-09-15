import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useMemberAccess() {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["member-access", user?.id],
    queryFn: async () => {
      const [profileResult, entitlementResult] = await Promise.all([
        supabase.from("profiles").select("is_active").eq("id", user!.id).maybeSingle(),
        supabase.rpc("has_any_entitlement", { _user_id: user!.id }),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (entitlementResult.error) throw entitlementResult.error;

      return {
        isActive: profileResult.data?.is_active !== false,
        hasEntitlement: entitlementResult.data === true,
      };
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const isActive = query.data?.isActive === true;
  const hasEntitlement = query.data?.hasEntitlement === true;

  return {
    user,
    authLoading,
    accessLoading: Boolean(user) && query.isPending,
    isActive,
    hasEntitlement,
    canAccess: isActive && hasEntitlement,
    accessError: query.isError,
    refetch: query.refetch,
  };
}

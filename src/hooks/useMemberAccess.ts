import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useMemberAccess() {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["member-access", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.is_active !== false;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  return {
    user,
    authLoading,
    accessLoading: Boolean(user) && query.isPending,
    isActive: query.data === true,
    accessError: query.isError,
    refetch: query.refetch,
  };
}

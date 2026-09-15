import { supabase } from "@/integrations/supabase/client";

export async function getDefaultProductId(): Promise<string> {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("slug", "jornada_unica")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Produto jornada_unica não encontrado");
  return data.id;
}

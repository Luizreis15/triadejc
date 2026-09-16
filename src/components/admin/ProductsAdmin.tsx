import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [kiwifyProductId, setKiwifyProductId] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-default-product"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, kiwify_product_id")
        .eq("slug", "jornada_unica")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    setKiwifyProductId(product?.kiwify_product_id ?? "");
  }, [product]);

  const save = useMutation({
    mutationFn: async () => {
      if (!product?.id) throw new Error("Produto não encontrado");
      const value = kiwifyProductId.trim() || null;
      const { error } = await supabase
        .from("products")
        .update({ kiwify_product_id: value })
        .eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-default-product"] });
      toast.success("ID da Kiwify salvo");
    },
    onError: () => {
      toast.error("Não foi possível salvar o ID da Kiwify");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produto — Jornada Única</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cole o <code>product_id</code> da Kiwify. Sem isso, o webhook usa o fallback
          jornada_unica em todo SKU desconhecido.
        </p>
        <div className="space-y-2">
          <Label htmlFor="kiwify-product-id">Kiwify product_id</Label>
          <Input
            id="kiwify-product-id"
            value={kiwifyProductId}
            onChange={(event) => setKiwifyProductId(event.target.value)}
            placeholder="uuid da Kiwify"
          />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvar
        </Button>
      </CardContent>
    </Card>
  );
}
